package usecase

import (
	"errors"
	"testing"
	"time"

	"github.com/midtrans/midtrans-go/snap"
	"github.com/nuryanfa/e-commerse-sqa/internal/domain"
)

type wbCartRepo struct {
	items []domain.CartItem
	err   error
}

func (m *wbCartRepo) UpsertItem(item *domain.CartItem) error           { return nil }
func (m *wbCartRepo) UpdateItem(item *domain.CartItem) error           { return nil }
func (m *wbCartRepo) DeleteByUserID(userID string) error               { return nil }
func (m *wbCartRepo) RemoveItem(itemID string, userID string) error    { return nil }
func (m *wbCartRepo) FindByID(itemID string) (*domain.CartItem, error) { return nil, nil }
func (m *wbCartRepo) FindByUserID(userID string) ([]domain.CartItem, error) {
	if m.err != nil {
		return nil, m.err
	}
	return m.items, nil
}

type wbOrderRepo struct {
	checkoutUserID  string
	checkoutVoucher string
	checkoutItems   []domain.CartItem
	checkoutCalls   int
	checkoutErr     error

	savedTokenOrderID string
	savedToken        string
	savedURL          string

	findByIDsOrders []domain.Order
	batchUpdatedIDs []string
	batchStatus     string
}

func (m *wbOrderRepo) CheckoutTransaction(userID string, cartItems []domain.CartItem, voucherCode string) (*domain.Order, error) {
	m.checkoutCalls++
	m.checkoutUserID = userID
	m.checkoutVoucher = voucherCode
	m.checkoutItems = append([]domain.CartItem(nil), cartItems...)
	if m.checkoutErr != nil {
		return nil, m.checkoutErr
	}
	return &domain.Order{
		ID:          "order-flow-1",
		UserID:      userID,
		TotalAmount: 75000,
		Status:      "PENDING",
	}, nil
}

func (m *wbOrderRepo) SavePaymentToken(orderID string, token string, url string) error {
	m.savedTokenOrderID = orderID
	m.savedToken = token
	m.savedURL = url
	return nil
}

func (m *wbOrderRepo) FindByIDs(orderIDs []string) ([]domain.Order, error) {
	return m.findByIDsOrders, nil
}

func (m *wbOrderRepo) BatchUpdateStatus(orderIDs []string, status string) error {
	m.batchUpdatedIDs = append([]string(nil), orderIDs...)
	m.batchStatus = status
	return nil
}

func (m *wbOrderRepo) InstantCheckoutTransaction(userID string, item domain.CartItem, voucherCode string) (*domain.Order, error) {
	return nil, nil
}
func (m *wbOrderRepo) FindByUserID(userID string) ([]domain.Order, error) { return nil, nil }
func (m *wbOrderRepo) FindByID(orderID string) (*domain.Order, error)     { return nil, nil }
func (m *wbOrderRepo) UpdateStatus(orderID string, status string) error   { return nil }
func (m *wbOrderRepo) FindPaidOrders() ([]domain.Order, error)            { return nil, nil }
func (m *wbOrderRepo) FindProcessedOrders() ([]domain.Order, error)       { return nil, nil }
func (m *wbOrderRepo) AssignCourier(orderID string, courierID string) error {
	return nil
}
func (m *wbOrderRepo) FindByCourierID(courierID string) ([]domain.Order, error) {
	return nil, nil
}
func (m *wbOrderRepo) FindByProductSupplier(supplierID string) ([]domain.Order, error) {
	return nil, nil
}
func (m *wbOrderRepo) CancelExpiredOrders(cutoffTime time.Time) (int, error) { return 0, nil }
func (m *wbOrderRepo) CancelOrderTransaction(orderID string) error           { return nil }

type wbAuditRepo struct {
	logs []domain.AuditLog
}

func (m *wbAuditRepo) Insert(log *domain.AuditLog) error {
	m.logs = append(m.logs, *log)
	return nil
}
func (m *wbAuditRepo) FindByEntity(entity string, entityID string) ([]domain.AuditLog, error) {
	return nil, nil
}

func TestDataFlow_CheckoutCartToOrderAndPaymentToken(t *testing.T) {
	variantID := "variant-250g"
	cartItems := []domain.CartItem{
		{ID: "cart-1", UserID: "user-flow", ProductID: "prod-1", Quantity: 2},
		{ID: "cart-2", UserID: "user-flow", ProductID: "prod-2", VariantID: &variantID, Quantity: 3},
	}
	orderRepo := &wbOrderRepo{}
	uc := &orderUsecase{
		orderRepo: orderRepo,
		cartRepo:  &wbCartRepo{items: cartItems},
		snapTokenFn: func(orderID string, amount float64) (*snap.Response, error) {
			if orderID != "order-flow-1" {
				t.Fatalf("snapTokenFn menerima orderID salah: %s", orderID)
			}
			if amount != 75000 {
				t.Fatalf("snapTokenFn menerima amount salah: %.2f", amount)
			}
			return &snap.Response{Token: "snap-token-flow", RedirectURL: "https://pay.example/flow"}, nil
		},
	}

	order, err := uc.Checkout("user-flow", "VOUCHER-IGNORED")
	if err != nil {
		t.Fatalf("Checkout gagal: %v", err)
	}

	if orderRepo.checkoutUserID != "user-flow" {
		t.Fatalf("user_id tidak mengalir ke repository, got %s", orderRepo.checkoutUserID)
	}
	if orderRepo.checkoutVoucher != "VOUCHER-IGNORED" {
		t.Fatalf("voucher_code tidak diteruskan, got %s", orderRepo.checkoutVoucher)
	}
	if len(orderRepo.checkoutItems) != 2 {
		t.Fatalf("cart_items tidak lengkap, got %d", len(orderRepo.checkoutItems))
	}
	if orderRepo.checkoutItems[1].VariantID == nil || *orderRepo.checkoutItems[1].VariantID != variantID {
		t.Fatal("variant_id tidak mengalir dari cart ke checkout transaction")
	}
	if order.PaymentToken == nil || *order.PaymentToken != "snap-token-flow" {
		t.Fatalf("payment token tidak disimpan ke order, got %#v", order.PaymentToken)
	}
	if orderRepo.savedTokenOrderID != "order-flow-1" || orderRepo.savedToken != "snap-token-flow" {
		t.Fatalf("payment token tidak mengalir ke SavePaymentToken: order=%s token=%s", orderRepo.savedTokenOrderID, orderRepo.savedToken)
	}
}

func TestLoopTesting_CheckoutCartItemCounts(t *testing.T) {
	tests := []struct {
		name          string
		items         []domain.CartItem
		wantRepoCalls int
		wantErr       bool
	}{
		{name: "0 item", items: []domain.CartItem{}, wantRepoCalls: 0, wantErr: true},
		{name: "1 item", items: []domain.CartItem{{ID: "cart-1", ProductID: "prod-1", Quantity: 1}}, wantRepoCalls: 1},
		{name: "3 items", items: []domain.CartItem{
			{ID: "cart-1", ProductID: "prod-1", Quantity: 1},
			{ID: "cart-2", ProductID: "prod-2", Quantity: 2},
			{ID: "cart-3", ProductID: "prod-3", Quantity: 3},
		}, wantRepoCalls: 1},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			orderRepo := &wbOrderRepo{}
			uc := &orderUsecase{
				orderRepo:   orderRepo,
				cartRepo:    &wbCartRepo{items: tt.items},
				snapTokenFn: func(orderID string, amount float64) (*snap.Response, error) { return nil, nil },
			}

			_, err := uc.Checkout("user-loop", "")
			if tt.wantErr && err == nil {
				t.Fatal("expected error, got nil")
			}
			if !tt.wantErr && err != nil {
				t.Fatalf("expected success, got %v", err)
			}
			if orderRepo.checkoutCalls != tt.wantRepoCalls {
				t.Fatalf("repo call count mismatch: got %d want %d", orderRepo.checkoutCalls, tt.wantRepoCalls)
			}
			if !tt.wantErr && len(orderRepo.checkoutItems) != len(tt.items) {
				t.Fatalf("loop data count mismatch: got %d want %d", len(orderRepo.checkoutItems), len(tt.items))
			}
		})
	}
}

func TestLoopTesting_BatchProcessSupplierOrders(t *testing.T) {
	supplierID := "supplier-loop"
	otherSupplierID := "supplier-other"
	orders := []domain.Order{
		{
			ID:     "order-valid-1",
			Status: "PAID",
			Items:  []domain.OrderItem{{Product: &domain.Product{SupplierID: supplierID}}},
		},
		{
			ID:     "order-wrong-status",
			Status: "PENDING",
			Items:  []domain.OrderItem{{Product: &domain.Product{SupplierID: supplierID}}},
		},
		{
			ID:     "order-other-supplier",
			Status: "PAID",
			Items:  []domain.OrderItem{{Product: &domain.Product{SupplierID: otherSupplierID}}},
		},
		{
			ID:     "order-valid-2",
			Status: "PAID",
			Items:  []domain.OrderItem{{Product: &domain.Product{SupplierID: supplierID}}},
		},
	}
	orderRepo := &wbOrderRepo{findByIDsOrders: orders}
	auditRepo := &wbAuditRepo{}
	uc := &orderUsecase{orderRepo: orderRepo, auditLogRepo: auditRepo}

	err := uc.BatchProcessSupplierOrders(supplierID, []string{"order-valid-1", "order-wrong-status", "order-other-supplier", "order-valid-2"})
	if err != nil {
		t.Fatalf("BatchProcessSupplierOrders gagal: %v", err)
	}

	if len(orderRepo.batchUpdatedIDs) != 2 {
		t.Fatalf("jumlah order valid hasil loop salah: got %d want 2 (%v)", len(orderRepo.batchUpdatedIDs), orderRepo.batchUpdatedIDs)
	}
	if orderRepo.batchUpdatedIDs[0] != "order-valid-1" || orderRepo.batchUpdatedIDs[1] != "order-valid-2" {
		t.Fatalf("order valid yang diproses salah: %v", orderRepo.batchUpdatedIDs)
	}
	if orderRepo.batchStatus != "PROCESSED" {
		t.Fatalf("status batch salah: %s", orderRepo.batchStatus)
	}
	if len(auditRepo.logs) != 2 {
		t.Fatalf("audit log loop salah: got %d want 2", len(auditRepo.logs))
	}
}

func TestLoopTesting_BatchProcessSupplierOrders_NoValidOrder(t *testing.T) {
	orderRepo := &wbOrderRepo{findByIDsOrders: []domain.Order{
		{ID: "order-pending", Status: "PENDING", Items: []domain.OrderItem{{Product: &domain.Product{SupplierID: "supplier-loop"}}}},
	}}
	uc := &orderUsecase{orderRepo: orderRepo, auditLogRepo: &wbAuditRepo{}}

	err := uc.BatchProcessSupplierOrders("supplier-loop", []string{"order-pending"})
	if err == nil {
		t.Fatal("expected error saat loop tidak menemukan order valid")
	}
	if !errors.Is(err, err) {
		t.Fatal("unreachable guard")
	}
}

func TestOrthogonalArray_CheckoutACID(t *testing.T) {
	variantID := "variant-oa"
	stockErr := errors.New("stok produk 'Bayam Hijau' tidak mencukupi. Stok tersisa: 0")
	dbErr := errors.New("database timeout")

	tests := []struct {
		id                  string
		cartItems           []domain.CartItem
		transactionErr      error
		snapTokenFn         func(orderID string, amount float64) (*snap.Response, error)
		voucherCode         string
		wantErr             bool
		wantCheckoutCalls   int
		wantPaymentToken    bool
		wantSavedToken      bool
		wantVoucherForward  string
		expectedDescription string
	}{
		{
			id:        "OA-01-empty-success-snap-success-no-voucher",
			cartItems: []domain.CartItem{},
			snapTokenFn: func(orderID string, amount float64) (*snap.Response, error) {
				return &snap.Response{Token: "snap-oa", RedirectURL: "https://pay.example/oa"}, nil
			},
			wantErr:           true,
			wantCheckoutCalls: 0,
		},
		{
			id:             "OA-02-one-item-stock-error-snap-error-voucher",
			cartItems:      []domain.CartItem{{ID: "cart-oa-1", ProductID: "prod-oa-1", Quantity: 1}},
			transactionErr: stockErr,
			snapTokenFn: func(orderID string, amount float64) (*snap.Response, error) {
				return nil, errors.New("midtrans unavailable")
			},
			voucherCode:        "DISC10",
			wantErr:            true,
			wantCheckoutCalls:  1,
			wantVoucherForward: "DISC10",
		},
		{
			id:                 "OA-03-two-items-db-error-snap-nil-voucher",
			cartItems:          []domain.CartItem{{ID: "cart-oa-1", ProductID: "prod-oa-1", Quantity: 1}, {ID: "cart-oa-2", ProductID: "prod-oa-2", VariantID: &variantID, Quantity: 2}},
			transactionErr:     dbErr,
			snapTokenFn:        func(orderID string, amount float64) (*snap.Response, error) { return nil, nil },
			voucherCode:        "IGNORED",
			wantErr:            true,
			wantCheckoutCalls:  1,
			wantVoucherForward: "IGNORED",
		},
		{
			id:                "OA-04-one-item-success-snap-nil-no-voucher",
			cartItems:         []domain.CartItem{{ID: "cart-oa-1", ProductID: "prod-oa-1", Quantity: 1}},
			snapTokenFn:       func(orderID string, amount float64) (*snap.Response, error) { return nil, nil },
			wantErr:           false,
			wantCheckoutCalls: 1,
		},
		{
			id:        "OA-05-two-items-success-snap-success-voucher",
			cartItems: []domain.CartItem{{ID: "cart-oa-1", ProductID: "prod-oa-1", Quantity: 1}, {ID: "cart-oa-2", ProductID: "prod-oa-2", VariantID: &variantID, Quantity: 2}},
			snapTokenFn: func(orderID string, amount float64) (*snap.Response, error) {
				return &snap.Response{Token: "snap-oa", RedirectURL: "https://pay.example/oa"}, nil
			},
			voucherCode:        "DISC10",
			wantErr:            false,
			wantCheckoutCalls:  1,
			wantPaymentToken:   true,
			wantSavedToken:     true,
			wantVoucherForward: "DISC10",
		},
		{
			id:                "OA-06-empty-stock-error-snap-nil-voucher",
			cartItems:         []domain.CartItem{},
			transactionErr:    stockErr,
			snapTokenFn:       func(orderID string, amount float64) (*snap.Response, error) { return nil, nil },
			voucherCode:       "IGNORED",
			wantErr:           true,
			wantCheckoutCalls: 0,
		},
		{
			id:        "OA-07-two-items-success-snap-error-no-voucher",
			cartItems: []domain.CartItem{{ID: "cart-oa-1", ProductID: "prod-oa-1", Quantity: 1}, {ID: "cart-oa-2", ProductID: "prod-oa-2", VariantID: &variantID, Quantity: 2}},
			snapTokenFn: func(orderID string, amount float64) (*snap.Response, error) {
				return nil, errors.New("midtrans unavailable")
			},
			wantErr:           false,
			wantCheckoutCalls: 1,
		},
		{
			id:        "OA-08-one-item-success-snap-success-voucher",
			cartItems: []domain.CartItem{{ID: "cart-oa-1", ProductID: "prod-oa-1", Quantity: 1}},
			snapTokenFn: func(orderID string, amount float64) (*snap.Response, error) {
				return &snap.Response{Token: "snap-oa", RedirectURL: "https://pay.example/oa"}, nil
			},
			voucherCode:        "IGNORED",
			wantErr:            false,
			wantCheckoutCalls:  1,
			wantPaymentToken:   true,
			wantSavedToken:     true,
			wantVoucherForward: "IGNORED",
		},
		{
			id:             "OA-09-empty-db-error-snap-error-voucher",
			cartItems:      []domain.CartItem{},
			transactionErr: dbErr,
			snapTokenFn: func(orderID string, amount float64) (*snap.Response, error) {
				return nil, errors.New("midtrans unavailable")
			},
			voucherCode:       "DISC10",
			wantErr:           true,
			wantCheckoutCalls: 0,
		},
	}

	for _, tt := range tests {
		t.Run(tt.id, func(t *testing.T) {
			orderRepo := &wbOrderRepo{checkoutErr: tt.transactionErr}
			uc := &orderUsecase{
				orderRepo:   orderRepo,
				cartRepo:    &wbCartRepo{items: tt.cartItems},
				snapTokenFn: tt.snapTokenFn,
			}

			order, err := uc.Checkout("user-oa", tt.voucherCode)
			if tt.wantErr && err == nil {
				t.Fatal("expected error, got nil")
			}
			if !tt.wantErr && err != nil {
				t.Fatalf("expected success, got %v", err)
			}
			if orderRepo.checkoutCalls != tt.wantCheckoutCalls {
				t.Fatalf("checkout call mismatch: got %d want %d", orderRepo.checkoutCalls, tt.wantCheckoutCalls)
			}
			if tt.wantCheckoutCalls > 0 && orderRepo.checkoutVoucher != tt.wantVoucherForward {
				t.Fatalf("voucher flow mismatch: got %q want %q", orderRepo.checkoutVoucher, tt.wantVoucherForward)
			}
			if !tt.wantErr && order == nil {
				t.Fatal("expected order, got nil")
			}
			if tt.wantPaymentToken {
				if order.PaymentToken == nil || *order.PaymentToken != "snap-oa" {
					t.Fatalf("payment token mismatch: %#v", order.PaymentToken)
				}
			}
			if tt.wantSavedToken && orderRepo.savedToken != "snap-oa" {
				t.Fatalf("saved token mismatch: %q", orderRepo.savedToken)
			}
		})
	}
}
