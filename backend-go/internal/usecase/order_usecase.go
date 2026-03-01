package usecase

import (
	"errors"
	"fmt"
	"os"
	"time"

	"github.com/google/uuid"
	"github.com/midtrans/midtrans-go"
	"github.com/midtrans/midtrans-go/snap"
	"github.com/nuryanfa/e-commerse-sqa/internal/domain"
)

type orderUsecase struct {
	orderRepo    domain.OrderRepository
	cartRepo     domain.CartRepository
	auditLogRepo domain.AuditLogRepository
	emailSvc     domain.EmailService
	userRepo     domain.UserRepository
}

func NewOrderUsecase(oRepo domain.OrderRepository, cRepo domain.CartRepository, aRepo domain.AuditLogRepository, emailSvc domain.EmailService, uRepo domain.UserRepository) domain.OrderUsecase {
	return &orderUsecase{
		orderRepo:    oRepo,
		cartRepo:     cRepo,
		auditLogRepo: aRepo,
		emailSvc:     emailSvc,
		userRepo:     uRepo,
	}
}

func (u *orderUsecase) Checkout(userID string, voucherCode string) (*domain.Order, error) {
	cartItems, err := u.cartRepo.FindByUserID(userID)
	if err != nil {
		return nil, errors.New("gagal memuat keranjang belanja")
	}

	if len(cartItems) == 0 {
		return nil, errors.New("keranjang belanja anda kosong. tidak bisa checkout")
	}

	order, err := u.orderRepo.CheckoutTransaction(userID, cartItems, voucherCode)
	if err != nil {
		return nil, errors.New("Checkout gagal: " + err.Error())
	}

	// === INISIALISASI MIDTRANS SNAP API ===
	// Sebaiknya Server Key diletakkan pada .env, jika kosong setel ke "dummy_key" untuk mock
	serverKey := os.Getenv("MIDTRANS_SERVER_KEY")
	if serverKey == "" {
		serverKey = "SB-Mid-server-YOUR_DUMMY_KEY" // Ganti dengan key di Sandbox Midtrans
	}

	var snapClient snap.Client
	snapClient.New(serverKey, midtrans.Sandbox)

	// Menyusun Rincian Pembayaran
	req := &snap.Request{
		TransactionDetails: midtrans.TransactionDetails{
			OrderID:  order.ID,
			GrossAmt: int64(order.TotalAmount),
		},
		CreditCard: &snap.CreditCardDetails{
			Secure: true,
		},
		Callbacks: &snap.Callbacks{
			Finish: "http://localhost:5174/orders/" + order.ID,
		},
	}

	// Eksekusi Pembuatan Tiket Transaksi
	snapResp, snapErr := snapClient.CreateTransaction(req)
	if snapErr == nil && snapResp != nil {
		// Simpan token & redirect URL (Bisa diperbarui di DB atau langsung return)
		order.PaymentToken = &snapResp.Token
		order.PaymentURL = &snapResp.RedirectURL

		// Kita perbarui record pesanan dengan URL/Token yang baru didapat
		// Karena kita tidak memiliki method repo UpdatePayment details, kita anggap token tersebut diumpan ke response JSON
		// Untuk implementasi kokoh, sebaiknya ditambahkan db.Save() di repository.
		// Namun minimal, frontend dapat menerimanya.
	} else if snapErr != nil {
		fmt.Printf("[MIDTRANS ERROR] Gagal generate Snap Token: %v\n", snapErr)
	}

	return order, nil
}

func (u *orderUsecase) GetMyOrders(userID string) ([]domain.Order, error) {
	return u.orderRepo.FindByUserID(userID)
}

func (u *orderUsecase) GetOrderDetail(userID string, orderID string) (*domain.Order, error) {
	order, err := u.orderRepo.FindByID(orderID)
	if err != nil {
		return nil, err
	}

	if order.UserID != userID {
		return nil, errors.New("akses ditolak. Order ini bukan milik anda")
	}

	return order, nil
}

func (u *orderUsecase) PayOrder(orderID string) error {
	order, err := u.orderRepo.FindByID(orderID)
	if err != nil {
		return err
	}

	if order.Status == "PAID" {
		return errors.New("pesanan ini sudah dibayar")
	}

	return u.orderRepo.UpdateStatus(orderID, "PAID")
}

// --- Courier Methods ---

// GetPaidOrders mengembalikan pesanan siap kirim (status PROCESSED)
func (u *orderUsecase) GetPaidOrders() ([]domain.Order, error) {
	// Peringatan: Meskipun nama func GetPaidOrders(), kita akan mengubah implementasinya ke "PROCESSED" sesuai arahan Stage 9 agar tidak merusak Interface.
	return u.orderRepo.FindProcessedOrders()
}

// AssignAndShip mengambil pesanan PAID dan set menjadi SHIPPED oleh kurir
func (u *orderUsecase) AssignAndShip(orderID string, courierID string) error {
	order, err := u.orderRepo.FindByID(orderID)
	if err != nil {
		return err
	}

	if order.Status != "PROCESSED" {
		return errors.New("pesanan harus berstatus PROCESSED (sudah dikemas supplier) untuk bisa diambil kurir")
	}

	if order.CourierID != nil {
		return errors.New("pesanan ini sudah diambil kurir lain")
	}

	return u.orderRepo.AssignCourier(orderID, courierID)
}

// MarkDelivered menandai pesanan sebagai DELIVERED oleh kurir
func (u *orderUsecase) MarkDelivered(orderID string, courierID string) error {
	order, err := u.orderRepo.FindByID(orderID)
	if err != nil {
		return err
	}

	if order.CourierID == nil || *order.CourierID != courierID {
		return errors.New("akses ditolak: pesanan ini bukan milik anda")
	}

	if order.Status != "SHIPPED" {
		return errors.New("pesanan harus berstatus SHIPPED untuk ditandai delivered")
	}

	now := time.Now()
	_ = now // DeliveredAt di-set via repository update
	return u.orderRepo.UpdateStatus(orderID, "DELIVERED")
}

// GetCourierOrders mengembalikan pesanan yang sedang di-handle kurir
func (u *orderUsecase) GetCourierOrders(courierID string) ([]domain.Order, error) {
	return u.orderRepo.FindByCourierID(courierID)
}

// --- Supplier Methods ---

// GetSupplierOrders mengembalikan pesanan yang berisi produk milik supplier
func (u *orderUsecase) GetSupplierOrders(supplierID string) ([]domain.Order, error) {
	return u.orderRepo.FindByProductSupplier(supplierID)
}

// ProcessSupplierOrder mengubah pesanan PAID menjadi PROCESSED oleh Supplier
func (u *orderUsecase) ProcessSupplierOrder(supplierID string, orderID string) error {
	order, err := u.orderRepo.FindByID(orderID)
	if err != nil {
		return err
	}

	// Pastikan Order memiliki setidaknya satu produk milik supplier ini
	isOwnedBySupplier := false
	for _, item := range order.Items {
		if item.Product != nil && item.Product.SupplierID != "" && item.Product.SupplierID == supplierID {
			isOwnedBySupplier = true
			break
		}
	}

	if !isOwnedBySupplier {
		return errors.New("akses ditolak: pesanan ini tidak memuat produk dari toko anda")
	}

	if order.Status != "PAID" {
		return errors.New("pesanan harus berstatus PAID untuk bisa mulai diproses")
	}

	err = u.orderRepo.UpdateStatus(orderID, "PROCESSED")
	if err == nil && u.auditLogRepo != nil {
		_ = u.auditLogRepo.Insert(&domain.AuditLog{
			ID:        uuid.New().String(),
			UserID:    supplierID,
			Action:    "SUPPLIER_PROCESS_ORDER",
			Entity:    "orders",
			EntityID:  orderID,
			OldValues: "PAID",
			NewValues: "PROCESSED",
			CreatedAt: time.Now(),
		})
	}
	return err
}

// --- Webhook Logik ---

func (u *orderUsecase) ProcessPaymentWebhook(payload map[string]interface{}) error {
	orderID, ok := payload["order_id"].(string)
	if !ok {
		return errors.New("order_id tidak ditemukan atau invalid")
	}

	transactionStatus, ok := payload["transaction_status"].(string)
	if !ok {
		return errors.New("transaction_status tidak ditemukan atau invalid")
	}

	fraudStatus, _ := payload["fraud_status"].(string)
	var newStatus string

	// Mapping status Midtrans ke entitas E-commerce internal
	switch transactionStatus {
	case "capture":
		if fraudStatus == "challenge" {
			newStatus = "PENDING" // Membutuhkan verifikasi lanjutan
		} else if fraudStatus == "accept" {
			newStatus = "PAID"
		}
	case "settlement":
		newStatus = "PAID"
	case "deny", "cancel", "expire":
		newStatus = "CANCELLED"
		// TODO: PENTING: Restorasi / Kembalikan Stok jika Dibatalkan (Akan dikerjakan di Ticket 31)
	case "pending":
		newStatus = "PENDING"
	default:
		// Abaikan jika tidak dikenal
		return nil
	}

	if newStatus != "" {
		err := u.orderRepo.UpdateStatus(orderID, newStatus)
		if err == nil && u.auditLogRepo != nil {
			_ = u.auditLogRepo.Insert(&domain.AuditLog{
				ID:        uuid.New().String(),
				UserID:    "SYSTEM/MIDTRANS",
				Action:    "WEBHOOK_PAYMENT_UPDATE",
				Entity:    "orders",
				EntityID:  orderID,
				NewValues: newStatus,
				CreatedAt: time.Now(),
			})
		}

		// [Fitur 39] Jika Pembayaran Berhasil (PAID), Luncurkan Goroutine Background Worker untuk Notifikasi Invoice!
		if err == nil && newStatus == "PAID" && u.emailSvc != nil && u.userRepo != nil {
			go func() {
				// Jalankan di *background thread*, biarkan HTTP Response (Midtrans) segera kembali dalam 10ms!
				orderData, _ := u.orderRepo.FindByID(orderID)
				if orderData != nil {
					userData, _ := u.userRepo.FindByID(orderData.UserID)
					if userData != nil {
						_ = u.emailSvc.SendInvoiceEmail(userData.Email, orderData)
					}
				}
			}()
		}

		return err
	}

	return nil
}

// ProcessCancelExpiredJobs diakses oleh cronjob untuk mencari order yang terlambat 24 jam
func (u *orderUsecase) ProcessCancelExpiredJobs() (int, error) {
	// Batas waktu: pesanan dibuat lebih dari 24 jam yang lalu
	cutoffTime := time.Now().Add(-24 * time.Hour)
	return u.orderRepo.CancelExpiredOrders(cutoffTime)
}
