package usecase

// =============================================================================
// WHITE BOX TESTING — Basic Path Testing
// Fungsi    : orderUsecase.Checkout, orderUsecase.GetMyOrders
// File      : order_usecase.go
// Referensi : Laporan_Whitebox_BasicPath_Checkout_ACID_Final.md
//
// Test Case yang dicakup:
//   WB-CHK-U01 (Path U-1) : CartRepo error (DB down)          → error
//   WB-CHK-U02 (Path U-2) : Cart kosong                       → error (sudah ada)
//   WB-CHK-U03 (Path U-3) : CheckoutTransaction gagal - stok  → error
//   WB-CHK-U04 (Path U-4) : Checkout sukses + snap token OK   → *Order, nil
//   WB-CHK-U05 (Path U-5) : Checkout sukses + Midtrans GAGAL  → *Order, nil (log error)
//   WB-CHK-U06 (Path U-6) : Checkout sukses + snapResp nil    → *Order, nil
//   WB-CHK-G03 (Path G-3) : GetMyOrders repo error            → error
//   WB-CHK-G04 (Path G-4) : GetMyOrders sukses → []Order PENDING
// =============================================================================

import (
	"errors"
	"testing"
	"time"

	"github.com/google/uuid"
	"github.com/midtrans/midtrans-go/snap"
	"github.com/nuryanfa/e-commerse-sqa/internal/domain"
)

// =============================================================================
// MOCK DEFINITIONS
// =============================================================================

// --- MockCartRepository (sukses) — SUDAH ADA, dipertahankan ---
type MockCartRepository struct {
	items []domain.CartItem
}

func (m *MockCartRepository) UpsertItem(item *domain.CartItem) error              { return nil }
func (m *MockCartRepository) UpdateItem(item *domain.CartItem) error              { return nil }
func (m *MockCartRepository) FindByUserID(userID string) ([]domain.CartItem, error) { return m.items, nil }
func (m *MockCartRepository) DeleteByUserID(userID string) error                  { return nil }
func (m *MockCartRepository) RemoveItem(itemID string, userID string) error        { return nil }
func (m *MockCartRepository) FindByID(itemID string) (*domain.CartItem, error)    { return nil, nil }

// --- MockCartRepositoryError — BARU (WB-CHK-U01 / Path U-1) ---
// Mensimulasikan kegagalan database saat mengambil cart
type MockCartRepositoryError struct{}

func (m *MockCartRepositoryError) UpsertItem(item *domain.CartItem) error { return nil }
func (m *MockCartRepositoryError) UpdateItem(item *domain.CartItem) error  { return nil }
func (m *MockCartRepositoryError) FindByUserID(userID string) ([]domain.CartItem, error) {
	// Simulasi: koneksi database gagal
	return nil, errors.New("dial tcp: connection refused")
}
func (m *MockCartRepositoryError) DeleteByUserID(userID string) error             { return nil }
func (m *MockCartRepositoryError) RemoveItem(itemID string, userID string) error   { return nil }
func (m *MockCartRepositoryError) FindByID(itemID string) (*domain.CartItem, error) { return nil, nil }

// --- MockOrderRepository (sukses) — SUDAH ADA, diperluas dengan SavePaymentToken ---
type MockOrderRepository struct {
	Checkouts []*domain.Order
}

func (m *MockOrderRepository) CheckoutTransaction(userID string, cartItems []domain.CartItem, voucherCode string) (*domain.Order, error) {
	if len(cartItems) == 0 {
		return nil, errors.New("cart empty")
	}
	order := &domain.Order{
		ID:          uuid.New().String(),
		UserID:      userID,
		TotalAmount: 1000,
		Status:      "PENDING",
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
	}
	m.Checkouts = append(m.Checkouts, order)
	return order, nil
}
func (m *MockOrderRepository) FindByUserID(userID string) ([]domain.Order, error) {
	return []domain.Order{
		{ID: "order-1", UserID: userID, Status: "PENDING", TotalAmount: 1000},
	}, nil
}
func (m *MockOrderRepository) FindByID(orderID string) (*domain.Order, error)          { return nil, nil }
func (m *MockOrderRepository) FindByIDs(orderIDs []string) ([]domain.Order, error)      { return nil, nil }
func (m *MockOrderRepository) UpdateStatus(orderID string, status string) error          { return nil }
func (m *MockOrderRepository) FindPaidOrders() ([]domain.Order, error)                  { return nil, nil }
func (m *MockOrderRepository) FindProcessedOrders() ([]domain.Order, error)              { return nil, nil }
func (m *MockOrderRepository) AssignCourier(orderID string, courierID string) error      { return nil }
func (m *MockOrderRepository) FindByCourierID(courierID string) ([]domain.Order, error) { return nil, nil }
func (m *MockOrderRepository) FindByProductSupplier(supplierID string) ([]domain.Order, error) {
	return nil, nil
}
func (m *MockOrderRepository) CancelExpiredOrders(cutoffTime time.Time) (int, error) { return 0, nil }
func (m *MockOrderRepository) BatchUpdateStatus(orderIDs []string, status string) error { return nil }
func (m *MockOrderRepository) CancelOrderTransaction(orderID string) error              { return nil }
func (m *MockOrderRepository) SavePaymentToken(orderID string, token string, url string) error {
	return nil
}
func (m *MockOrderRepository) InstantCheckoutTransaction(userID string, item domain.CartItem, voucherCode string) (*domain.Order, error) {
	return &domain.Order{ID: "mock-instant-id", TotalAmount: float64(item.Quantity * 1000)}, nil
}

// --- MockOrderRepositoryCheckoutError — BARU (WB-CHK-U03 / Path U-3) ---
// Mensimulasikan kegagalan CheckoutTransaction (stok tidak mencukupi)
type MockOrderRepositoryCheckoutError struct {
	MockOrderRepository
	checkoutErr error
}

func (m *MockOrderRepositoryCheckoutError) CheckoutTransaction(userID string, cartItems []domain.CartItem, voucherCode string) (*domain.Order, error) {
	return nil, m.checkoutErr
}
func (m *MockOrderRepositoryCheckoutError) FindByUserID(userID string) ([]domain.Order, error) {
	return nil, nil
}
func (m *MockOrderRepositoryCheckoutError) SavePaymentToken(orderID string, token string, url string) error {
	return nil
}

// --- MockOrderRepositoryGetError — BARU (WB-CHK-G03 / Path G-3) ---
// Mensimulasikan kegagalan GetMyOrders / FindByUserID
type MockOrderRepositoryGetError struct {
	MockOrderRepository
}

func (m *MockOrderRepositoryGetError) FindByUserID(userID string) ([]domain.Order, error) {
	return nil, errors.New("internal server error: database unavailable")
}
func (m *MockOrderRepositoryGetError) SavePaymentToken(orderID string, token string, url string) error {
	return nil
}

// =============================================================================
// TEST CASES
// =============================================================================

// ---------------------------------------------------------------------------
// WB-CHK-U01 | Path U-1
// Skenario  : cartRepo.FindByUserID mengembalikan error (DB down)
// Expected  : usecase mengembalikan error "gagal memuat keranjang belanja"
// Relasi BB : —
// CATATAN   : Sebelumnya N/A, kini PASS dengan MockCartRepositoryError
// ---------------------------------------------------------------------------
func TestCheckout_CartRepoError(t *testing.T) {
	// Path U-1: 1→2→3→4→16 (P1 = true)
	mockCartRepo := &MockCartRepositoryError{}
	mockOrderRepo := &MockOrderRepository{}

	uc := &orderUsecase{
		orderRepo:   mockOrderRepo,
		cartRepo:    mockCartRepo,
		snapTokenFn: createSnapToken,
	}

	_, err := uc.Checkout("user-1", "")

	if err == nil {
		t.Fatal("[WB-CHK-U01] FAIL: harus mengembalikan error saat cart repo gagal")
	}
	if err.Error() != "gagal memuat keranjang belanja" {
		t.Errorf("[WB-CHK-U01] FAIL: Expected 'gagal memuat keranjang belanja', got: %v", err)
	} else {
		t.Logf("[WB-CHK-U01] PASS: CartRepo error → '%s'", err.Error())
	}
}

// ---------------------------------------------------------------------------
// WB-CHK-U02 | Path U-2 — SUDAH ADA, dipertahankan dengan nama baru
// Skenario  : cart kosong → error keranjang kosong
// Expected  : "keranjang belanja anda kosong. tidak bisa checkout"
// Relasi BB : CHK-04
// ---------------------------------------------------------------------------
func TestCheckout_EmptyCart(t *testing.T) {
	// Path U-2: 1→2→3→5→6→16 (P1=false, P2=true)
	mockCartRepo := &MockCartRepository{
		items: []domain.CartItem{},
	}
	mockOrderRepo := &MockOrderRepository{}

	uc := &orderUsecase{
		orderRepo:   mockOrderRepo,
		cartRepo:    mockCartRepo,
		snapTokenFn: createSnapToken,
	}

	_, err := uc.Checkout("user-1", "")

	if err == nil {
		t.Fatal("[WB-CHK-U02] FAIL: harus error saat cart kosong")
	}
	if err.Error() != "keranjang belanja anda kosong. tidak bisa checkout" {
		t.Errorf("[WB-CHK-U02] FAIL: Expected pesan cart kosong, got: %v", err)
	} else {
		t.Logf("[WB-CHK-U02] PASS: Cart kosong → '%s'", err.Error())
	}
}

// ---------------------------------------------------------------------------
// WB-CHK-U03 | Path U-3
// Skenario  : CheckoutTransaction gagal karena stok tidak mencukupi
// Expected  : error "Checkout gagal: stok produk 'X' tidak mencukupi"
// Relasi BB : CHK-02
// ---------------------------------------------------------------------------
func TestCheckout_TransactionFails_StokKurang(t *testing.T) {
	// Path U-3: 1→2→3→5→7→8→9→16 (P1=false, P2=false, P3=true)
	mockCartRepo := &MockCartRepository{
		items: []domain.CartItem{
			{ID: "item-1", UserID: "user-1", ProductID: "prod-stok-habis", Quantity: 99},
		},
	}
	mockOrderRepo := &MockOrderRepositoryCheckoutError{
		checkoutErr: errors.New("stok produk 'Bayam Hijau' tidak mencukupi. Stok tersisa: 5"),
	}

	uc := &orderUsecase{
		orderRepo:   mockOrderRepo,
		cartRepo:    mockCartRepo,
		snapTokenFn: createSnapToken,
	}

	_, err := uc.Checkout("user-1", "")

	if err == nil {
		t.Fatal("[WB-CHK-U03] FAIL: harus error saat stok tidak cukup")
	}
	expected := "Checkout gagal: stok produk 'Bayam Hijau' tidak mencukupi. Stok tersisa: 5"
	if err.Error() != expected {
		t.Errorf("[WB-CHK-U03] FAIL:\n  Expected: %s\n  Got     : %s", expected, err.Error())
	} else {
		t.Logf("[WB-CHK-U03] PASS: Stok kurang → '%s'", err.Error())
	}
}

// ---------------------------------------------------------------------------
// WB-CHK-U04 | Path U-4 — SUDAH ADA (TestCheckout_Success), diperluas
// Skenario  : Checkout berhasil + snap token sukses (butuh Midtrans Sandbox)
// Expected  : *Order dikembalikan dengan Status PENDING
// Relasi BB : CHK-01, CHK-07
// CATATAN   : Snap token sebenarnya di-skip jika tidak ada MIDTRANS_SERVER_KEY.
//             Test ini memvalidasi bahwa Order tetap dikembalikan.
// ---------------------------------------------------------------------------
func TestCheckout_Success(t *testing.T) {
	// Path U-4: ...→10→11→12→15→16 (P4=true jika sandbox aktif, atau P4=false tapi order tetap ada)
	mockCartRepo := &MockCartRepository{
		items: []domain.CartItem{
			{ID: "item-1", UserID: "user-1", ProductID: "prod-1", Quantity: 2},
		},
	}
	mockOrderRepo := &MockOrderRepository{}

	uc := &orderUsecase{
		orderRepo:   mockOrderRepo,
		cartRepo:    mockCartRepo,
		snapTokenFn: createSnapToken,
	}

	order, err := uc.Checkout("user-1", "")

	if err != nil {
		t.Fatalf("[WB-CHK-U04] FAIL: Expected successful checkout, got error: %v", err)
	}
	if order == nil {
		t.Fatal("[WB-CHK-U04] FAIL: Expected order, got nil")
	}
	if order.Status != "PENDING" {
		t.Errorf("[WB-CHK-U04] FAIL: Expected status PENDING, got %s", order.Status)
	}
	if len(mockOrderRepo.Checkouts) != 1 {
		t.Errorf("[WB-CHK-U04] FAIL: Expected 1 order recorded, got %d", len(mockOrderRepo.Checkouts))
	} else {
		t.Logf("[WB-CHK-U04] PASS: Checkout sukses, order %s PENDING", order.ID)
	}
}

// ---------------------------------------------------------------------------
// WB-CHK-U05 | Path U-5
// Skenario  : Checkout sukses TAPI Midtrans gagal generate Snap Token
// Expected  : *Order dikembalikan (tidak nil), PaymentToken = nil
//             Error Midtrans hanya di-log, TIDAK menggagalkan checkout.
// Relasi BB : CHK-05
// CATATAN   : Sebelumnya N/A. Kini PASS karena snapTokenFn di-inject sebagai mock.
// ---------------------------------------------------------------------------
func TestCheckout_MidtransFails_OrderTetapKembali(t *testing.T) {
	// Path U-5: ...→10→11→13→14→15→16 (P4=false, P5=true)
	mockCartRepo := &MockCartRepository{
		items: []domain.CartItem{
			{ID: "item-1", UserID: "user-1", ProductID: "prod-1", Quantity: 1},
		},
	}
	mockOrderRepo := &MockOrderRepository{}

	// Mock snapTokenFn yang selalu return error — simulasi Midtrans down
	failingSnapFn := func(orderID string, amount float64) (*snap.Response, error) {
		return nil, errors.New("midtrans: connection refused — sandbox unavailable")
	}

	uc := &orderUsecase{
		orderRepo:   mockOrderRepo,
		cartRepo:    mockCartRepo,
		snapTokenFn: failingSnapFn, // ← mock Midtrans gagal
	}

	order, err := uc.Checkout("user-1", "")

	// Checkout HARUS tetap berhasil — Midtrans error tidak membatalkan order
	if err != nil {
		t.Fatalf("[WB-CHK-U05] FAIL: Order harus tetap berhasil walau Midtrans gagal, got error: %v", err)
	}
	if order == nil {
		t.Fatal("[WB-CHK-U05] FAIL: Order harus tetap dikembalikan, got nil")
	}
	if order.PaymentToken != nil {
		t.Errorf("[WB-CHK-U05] FAIL: PaymentToken harus nil karena Midtrans gagal, got: %s", *order.PaymentToken)
	} else {
		t.Logf("[WB-CHK-U05] PASS: Midtrans gagal → Order tetap ada, PaymentToken = nil")
	}
}

// ---------------------------------------------------------------------------
// WB-CHK-U06 | Path U-6
// Skenario  : Checkout sukses + snapTokenFn return (nil, nil) → tidak ada token,
//             tidak ada error — jalur P4=false, P5=false
// Expected  : *Order dikembalikan dengan PaymentToken = nil
// Relasi BB : CHK-07
// ---------------------------------------------------------------------------
func TestCheckout_SnapRespNil_OrderTetapKembali(t *testing.T) {
	// Path U-6: ...→10→11→13→15→16 (P4=false, P5=false)
	mockCartRepo := &MockCartRepository{
		items: []domain.CartItem{
			{ID: "item-1", UserID: "user-1", ProductID: "prod-1", Quantity: 1},
		},
	}
	mockOrderRepo := &MockOrderRepository{}

	// Mock snapTokenFn yang return nil, nil (tidak error tapi tidak ada response)
	nilSnapFn := func(orderID string, amount float64) (*snap.Response, error) {
		return nil, nil // P4=false, P5=false
	}

	uc := &orderUsecase{
		orderRepo:   mockOrderRepo,
		cartRepo:    mockCartRepo,
		snapTokenFn: nilSnapFn,
	}

	order, err := uc.Checkout("user-1", "")

	if err != nil {
		t.Fatalf("[WB-CHK-U06] FAIL: Expected success, got error: %v", err)
	}
	if order == nil {
		t.Fatal("[WB-CHK-U06] FAIL: Order harus dikembalikan, got nil")
	}
	if order.PaymentToken != nil {
		t.Errorf("[WB-CHK-U06] FAIL: PaymentToken harus nil, got: %s", *order.PaymentToken)
	} else {
		t.Logf("[WB-CHK-U06] PASS: snapResp nil → Order ada, PaymentToken = nil")
	}
}

// ---------------------------------------------------------------------------
// WB-CHK-G03 | Path G-3
// Skenario  : GetMyOrders — orderRepo.FindByUserID mengembalikan error
// Expected  : error "internal server error: database unavailable"
// Relasi BB : —
// CATATAN   : Sebelumnya N/A. Kini PASS dengan MockOrderRepositoryGetError.
// ---------------------------------------------------------------------------
func TestGetMyOrders_RepoError(t *testing.T) {
	// Path G-3: 1→2→3→5→6→8→9→10→12 (P3=true)
	mockOrderRepo := &MockOrderRepositoryGetError{}
	mockCartRepo := &MockCartRepository{}

	uc := &orderUsecase{
		orderRepo:   mockOrderRepo,
		cartRepo:    mockCartRepo,
		snapTokenFn: createSnapToken,
	}

	_, err := uc.GetMyOrders("user-1")

	if err == nil {
		t.Fatal("[WB-CHK-G03] FAIL: harus mengembalikan error saat repo gagal")
	}
	t.Logf("[WB-CHK-G03] PASS: GetMyOrders repo error → '%s'", err.Error())
}

// ---------------------------------------------------------------------------
// WB-CHK-G04 | Path G-4
// Skenario  : GetMyOrders sukses — daftar order dikembalikan dengan status PENDING
// Expected  : []Order tidak nil, status order pertama = "PENDING"
// Relasi BB : CHK-08
// ---------------------------------------------------------------------------
func TestGetMyOrders_Success_StatusPending(t *testing.T) {
	// Path G-4: 1→2→3→5→6→8→9→11→12 (P3=false)
	mockOrderRepo := &MockOrderRepository{}
	mockCartRepo := &MockCartRepository{}

	uc := &orderUsecase{
		orderRepo:   mockOrderRepo,
		cartRepo:    mockCartRepo,
		snapTokenFn: createSnapToken,
	}

	orders, err := uc.GetMyOrders("user-1")

	if err != nil {
		t.Fatalf("[WB-CHK-G04] FAIL: Expected success, got error: %v", err)
	}
	if len(orders) == 0 {
		t.Fatal("[WB-CHK-G04] FAIL: Expected orders, got empty slice")
	}
	if orders[0].Status != "PENDING" {
		t.Errorf("[WB-CHK-G04] FAIL: Expected status PENDING, got %s", orders[0].Status)
	} else {
		t.Logf("[WB-CHK-G04] PASS: GetMyOrders → %d order(s), status '%s'", len(orders), orders[0].Status)
	}
}
