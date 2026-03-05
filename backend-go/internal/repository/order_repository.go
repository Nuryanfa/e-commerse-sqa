package repository

import (
	"errors"
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/nuryanfa/e-commerse-sqa/internal/domain"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

type orderRepository struct {
	db *gorm.DB
}

func NewOrderRepository(db *gorm.DB) domain.OrderRepository {
	return &orderRepository{db: db}
}

// CheckoutTransaction mengeksekusi perpindahan Cart -> Order secara Atomik (ACID)
func (r *orderRepository) CheckoutTransaction(userID string, cartItems []domain.CartItem, voucherCode string) (*domain.Order, error) {
	var createdOrder domain.Order

	// Memulai Database Transaction
	err := r.db.Transaction(func(tx *gorm.DB) error {
		var totalAmount float64
		var orderItems []domain.OrderItem

		orderID := uuid.New().String()

		// 1. Validasi Stok dan Kumpulkan Total Harga
		for _, item := range cartItems {
			var product domain.Product
			// PENTING SQA: Kita ambil produk terbaru dari database dalam transaksi ini, ditambah LOCKING (FOR UPDATE)
			if err := tx.Clauses(clause.Locking{Strength: "UPDATE"}).Where("id_product = ?", item.ProductID).First(&product).Error; err != nil {
				return errors.New("produk " + item.ProductID + " tidak ditemukan")
			}

			priceAtPurchase := product.Price

			if item.VariantID != nil {
				var variant domain.ProductVariant
				if err := tx.Clauses(clause.Locking{Strength: "UPDATE"}).Where("id_variant = ?", *item.VariantID).First(&variant).Error; err != nil {
					return errors.New("varian produk tidak ditemukan")
				}
				if variant.Stock < item.Quantity {
					return fmt.Errorf("stok varian '%s' tidak mencukupi. Stok tersisa: %d", variant.NameLabel, variant.Stock)
				}
				variant.Stock -= item.Quantity
				if err := tx.Save(&variant).Error; err != nil {
					return err
				}
				priceAtPurchase = variant.Price
			} else {
				// PENTING SQA: Race condition check. Pastikan stok tidak minus saat di checkout bersamaan
				if product.Stock < item.Quantity {
					return fmt.Errorf("stok produk '%s' tidak mencukupi. Stok tersisa: %d", product.Name, product.Stock)
				}
				// Potong Stok
				product.Stock -= item.Quantity
				if err := tx.Save(&product).Error; err != nil {
					return err
				}
			}

			// Hitung subtotal dan buat record Item Pesanan (Snapshot harga saat ini)
			totalAmount += priceAtPurchase * float64(item.Quantity)

			orderItems = append(orderItems, domain.OrderItem{
				ID:              uuid.New().String(),
				OrderID:         orderID,
				ProductID:       product.ID,
				VariantID:       item.VariantID,
				Quantity:        item.Quantity,
				PriceAtPurchase: priceAtPurchase,
				CreatedAt:       time.Now(),
				UpdatedAt:       time.Now(),
			})
		}

		// 1.5 Validasi dan Pemotongan Voucher (Jika ada)
		var discount float64
		var appliedVoucher *string

		if voucherCode != "" {
			var voucher domain.Voucher
			// Menggunakan Pessimistic Locking untuk mencegah Race Condition persediaan kuota Voucher
			if err := tx.Clauses(clause.Locking{Strength: "UPDATE"}).Where("code = ? AND is_active = ?", voucherCode, true).First(&voucher).Error; err != nil {
				if errors.Is(err, gorm.ErrRecordNotFound) {
					return errors.New("kode kupon diskon tidak valid atau tidak aktif")
				}
				return err
			}

			// Limit Expiry
			if voucher.ExpiryDate.Before(time.Now()) {
				return errors.New("kupon diskon sudah kedaluwarsa")
			}

			// Limit Kuota (0 = bebas pakai, >0 = berbatas kuota)
			if voucher.UsageLimit > 0 && voucher.UsedCount >= voucher.UsageLimit {
				return errors.New("kuota batas pemakaian kupon diskon ini telah habis")
			}

			// Minimum Belanja Keseluruhan
			if totalAmount < voucher.MinPurchase {
				return fmt.Errorf("minimal pembelian tidak mencukupi, minimum kereta Rp%.2f", voucher.MinPurchase)
			}

			discount = voucher.DiscountAmount
			totalAmount -= discount
			if totalAmount < 0 {
				totalAmount = 0
			}

			vc := voucher.Code
			appliedVoucher = &vc

			// Tingkatkan catatan frekuensi pakai
			voucher.UsedCount++
			if err := tx.Save(&voucher).Error; err != nil {
				return err
			}
		}

		// 2. Buat Record Order utama
		createdOrder = domain.Order{
			ID:             orderID,
			UserID:         userID,
			TotalAmount:    totalAmount,
			Status:         "PENDING",
			DiscountAmount: discount,
			VoucherCode:    appliedVoucher,
			CreatedAt:      time.Now(),
			UpdatedAt:      time.Now(),
		}

		if err := tx.Create(&createdOrder).Error; err != nil {
			return err
		}

		// 3. Masukkan semua item ke order_items
		if err := tx.Create(&orderItems).Error; err != nil {
			return err
		}

		// 4. Kosongkan keranjang belanja user ini
		if err := tx.Where("id_user = ?", userID).Delete(&domain.CartItem{}).Error; err != nil {
			return err
		}

		// Return nil akan otomatis me-COMMIT transaksi.
		return nil
	})

	if err != nil {
		return nil, err // Transaksi gagal dan telah di ROLLBACK secara otomatis oleh GORM
	}

	return &createdOrder, nil
}

// InstantCheckoutTransaction mengeksekusi perpindahan Direct Buy secara Atomik (ACID)
func (r *orderRepository) InstantCheckoutTransaction(userID string, item domain.CartItem, voucherCode string) (*domain.Order, error) {
	var createdOrder domain.Order

	err := r.db.Transaction(func(tx *gorm.DB) error {
		var totalAmount float64
		var orderItem domain.OrderItem

		orderID := uuid.New().String()

		var product domain.Product
		if err := tx.Clauses(clause.Locking{Strength: "UPDATE"}).Where("id_product = ?", item.ProductID).First(&product).Error; err != nil {
			return errors.New("produk tidak ditemukan")
		}

		priceAtPurchase := product.Price

		if item.VariantID != nil {
			var variant domain.ProductVariant
			if err := tx.Clauses(clause.Locking{Strength: "UPDATE"}).Where("id_variant = ?", *item.VariantID).First(&variant).Error; err != nil {
				return errors.New("varian tidak ditemukan")
			}
			if variant.Stock < item.Quantity {
				return fmt.Errorf("stok varian '%s' tidak mencukupi", variant.NameLabel)
			}
			variant.Stock -= item.Quantity
			if err := tx.Save(&variant).Error; err != nil {
				return err
			}
			priceAtPurchase = variant.Price
		} else {
			if product.Stock < item.Quantity {
				return fmt.Errorf("stok produk '%s' tidak mencukupi", product.Name)
			}
			product.Stock -= item.Quantity
			if err := tx.Save(&product).Error; err != nil {
				return err
			}
		}

		totalAmount = priceAtPurchase * float64(item.Quantity)

		orderItem = domain.OrderItem{
			ID:              uuid.New().String(),
			OrderID:         orderID,
			ProductID:       product.ID,
			VariantID:       item.VariantID,
			Quantity:        item.Quantity,
			PriceAtPurchase: priceAtPurchase,
		}

		var discount float64
		var appliedVoucher *string

		if voucherCode != "" {
			var voucher domain.Voucher
			// Menggunakan Pessimistic Locking untuk mencegah Race Condition persediaan kuota Voucher
			if err := tx.Clauses(clause.Locking{Strength: "UPDATE"}).Where("code = ? AND is_active = ?", voucherCode, true).First(&voucher).Error; err != nil {
				if errors.Is(err, gorm.ErrRecordNotFound) {
					return errors.New("kode kupon diskon tidak valid atau tidak aktif")
				}
				return err
			}

			// Limit Expiry
			if voucher.ExpiryDate.Before(time.Now()) {
				return errors.New("kupon diskon sudah kedaluwarsa")
			}

			// Limit Kuota (0 = bebas pakai, >0 = berbatas kuota)
			if voucher.UsageLimit > 0 && voucher.UsedCount >= voucher.UsageLimit {
				return errors.New("kuota batas pemakaian kupon diskon ini telah habis")
			}

			// Minimum Belanja Keseluruhan
			if totalAmount < voucher.MinPurchase {
				return fmt.Errorf("minimal pembelian tidak mencukupi, minimum kereta Rp%.2f", voucher.MinPurchase)
			}

			discount = voucher.DiscountAmount
			totalAmount -= discount
			if totalAmount < 0 {
				totalAmount = 0
			}

			vc := voucher.Code
			appliedVoucher = &vc

			// Tingkatkan catatan frekuensi pakai
			voucher.UsedCount++
			if err := tx.Save(&voucher).Error; err != nil {
				return err
			}
		}

		createdOrder = domain.Order{
			ID:             orderID,
			UserID:         userID,
			TotalAmount:    totalAmount,
			Status:         "PENDING",
			DiscountAmount: discount,
			VoucherCode:    appliedVoucher,
			CreatedAt:      time.Now(),
			UpdatedAt:      time.Now(),
		}

		if err := tx.Create(&createdOrder).Error; err != nil {
			return err
		}

		if err := tx.Create(&orderItem).Error; err != nil {
			return err
		}

		// TIDAK ada penghapusan dari keranjang (Bypass Cart)
		return nil
	})

	if err != nil {
		return nil, err // Transaksi gagal dan telah di ROLLBACK secara otomatis oleh GORM
	}

	return &createdOrder, nil
}

func (r *orderRepository) FindByUserID(userID string) ([]domain.Order, error) {
	var orders []domain.Order
	// Tampilkan history tanpa perlu load detail item (untuk efisiensi listing)
	err := r.db.Where("id_user = ?", userID).Order("created_at desc").Find(&orders).Error
	return orders, err
}

func (r *orderRepository) FindByID(orderID string) (*domain.Order, error) {
	var order domain.Order
	err := r.db.Preload("Items.Product").Where("id_order = ?", orderID).First(&order).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("pesanan tidak ditemukan")
		}
		return nil, err
	}
	return &order, nil
}

// [B4] FindByIDs mengambil banyak pesanan sekaligus dengan satu query SQL IN
// Menggantikan pola N+1 loop FindByID yang sebelumnya dipakai di BatchProcessSupplierOrders
func (r *orderRepository) FindByIDs(orderIDs []string) ([]domain.Order, error) {
	var orders []domain.Order
	err := r.db.Preload("Items.Product").
		Where("id_order IN ?", orderIDs).
		Find(&orders).Error
	return orders, err
}

func (r *orderRepository) UpdateStatus(orderID string, status string) error {
	return r.db.Model(&domain.Order{}).Where("id_order = ?", orderID).Update("status", status).Error
}

// FindPaidOrders mengembalikan pesanan dengan status PAID (siap diambil kurir)
func (r *orderRepository) FindPaidOrders() ([]domain.Order, error) {
	var orders []domain.Order
	err := r.db.Preload("Items.Product").Where("status = ?", "PAID").Order("created_at desc").Find(&orders).Error
	return orders, err
}

// FindProcessedOrders mengembalikan pesanan yang sudah di PROCESSED Supplier (Siap Antar)
func (r *orderRepository) FindProcessedOrders() ([]domain.Order, error) {
	var orders []domain.Order
	err := r.db.Preload("Items.Product").Where("status = ?", "PROCESSED").Order("created_at desc").Find(&orders).Error
	return orders, err
}

// AssignCourier meng-assign kurir ke pesanan dan set status SHIPPED
func (r *orderRepository) AssignCourier(orderID string, courierID string) error {
	now := time.Now()
	return r.db.Model(&domain.Order{}).Where("id_order = ?", orderID).Updates(map[string]interface{}{
		"courier_id": courierID,
		"status":     "SHIPPED",
		"shipped_at": now,
		"updated_at": now,
	}).Error
}

// FindByCourierID mengembalikan pesanan milik kurir tertentu
func (r *orderRepository) FindByCourierID(courierID string) ([]domain.Order, error) {
	var orders []domain.Order
	err := r.db.Preload("Items.Product").Where("courier_id = ?", courierID).Order("created_at desc").Find(&orders).Error
	return orders, err
}

// FindByProductSupplier mengembalikan pesanan yang mengandung produk milik supplier
func (r *orderRepository) FindByProductSupplier(supplierID string) ([]domain.Order, error) {
	var orders []domain.Order
	err := r.db.Preload("Items.Product").
		Joins("JOIN order_items ON order_items.id_order = orders.id_order").
		Joins("JOIN products ON products.id_product = order_items.id_product").
		Where("products.supplier_id = ?", supplierID).
		Group("orders.id_order").
		Order("orders.created_at desc").
		Find(&orders).Error
	return orders, err
}

// CancelExpiredOrders membatalkan pesanan tertinggal (PENDING) dan memulihkan stok.
// [A2 SQA FIX]: Restock varian (ProductVariant) juga direstorasi, tidak hanya produk biasa.
func (r *orderRepository) CancelExpiredOrders(cutoffTime time.Time) (int, error) {
	var canceledCount int
	err := r.db.Transaction(func(tx *gorm.DB) error {
		var expiredOrders []domain.Order
		// Cari semua order PENDING yang usianya sudah lebih lama dari cutoffTime
		// Preload Items.Variant agar kita juga bisa mengembalikan stok varian
		if err := tx.Preload("Items").Where("status = ? AND created_at < ?", "PENDING", cutoffTime).Find(&expiredOrders).Error; err != nil {
			return err
		}

		for _, order := range expiredOrders {
			// Ubah status order menjadi EXPIRED
			if err := tx.Model(&order).Update("status", "EXPIRED").Error; err != nil {
				return err
			}

			// [A2] Pulihkan stok untuk setiap item — bedakan antara varian dan produk biasa
			for _, item := range order.Items {
				if item.VariantID != nil {
					// Item memiliki varian: kembalikan stok ke tabel product_variants
					if err := tx.Model(&domain.ProductVariant{}).
						Where("id_variant = ?", *item.VariantID).
						Update("stock", gorm.Expr("stock + ?", item.Quantity)).Error; err != nil {
						return fmt.Errorf("gagal restorasi stok varian %s: %w", *item.VariantID, err)
					}
				} else {
					// Item produk biasa tanpa varian: kembalikan stok ke tabel products
					if err := tx.Model(&domain.Product{}).
						Where("id_product = ?", item.ProductID).
						Update("stock", gorm.Expr("stock + ?", item.Quantity)).Error; err != nil {
						return fmt.Errorf("gagal restorasi stok produk %s: %w", item.ProductID, err)
					}
				}
			}
			canceledCount++
		}
		// Selesai memodifikasi. Otomatis ter-Commit oleh return nil Gorm Transaction
		return nil
	})

	return canceledCount, err
}


// BatchUpdateStatus memperbarui status lebih dari satu Order ID berbarengan (Bulk)
func (r *orderRepository) BatchUpdateStatus(orderIDs []string, status string) error {
	// Memanfaatkan 'IN' operator untuk membungkus perintah SQL dalam sekali panggilan (jauh lebih lekas dibanding 'for loop')
	err := r.db.Model(&domain.Order{}).
		Where("id_order IN ?", orderIDs).
		Update("status", status).Error
	
	if err != nil {
		return err
	}
	return nil
}
