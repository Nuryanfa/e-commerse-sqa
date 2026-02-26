package repository

import (
	"errors"
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/nuryanfa/e-commerse-sqa/internal/domain"
	"gorm.io/gorm"
)

type orderRepository struct {
	db *gorm.DB
}

func NewOrderRepository(db *gorm.DB) domain.OrderRepository {
	return &orderRepository{db: db}
}

// CheckoutTransaction mengeksekusi perpindahan Cart -> Order secara Atomik (ACID)
func (r *orderRepository) CheckoutTransaction(userID string, cartItems []domain.CartItem) (*domain.Order, error) {
	var createdOrder domain.Order

	// Memulai Database Transaction
	err := r.db.Transaction(func(tx *gorm.DB) error {
		var totalAmount float64
		var orderItems []domain.OrderItem

		orderID := uuid.New().String()

		// 1. Validasi Stok dan Kumpulkan Total Harga
		for _, item := range cartItems {
			var product domain.Product
			// PENTING SQA: Kita ambil produk terbaru dari database dalam transaksi ini
			if err := tx.Where("id_product = ?", item.ProductID).First(&product).Error; err != nil {
				return errors.New("produk " + item.ProductID + " tidak ditemukan")
			}

			// PENTING SQA: Race condition check. Pastikan stok tidak minus saat di checkout bersamaan
			if product.Stock < item.Quantity {
				return fmt.Errorf("stok produk '%s' tidak mencukupi. Stok tersisa: %d", product.Name, product.Stock)
			}

			// Potong Stok
			product.Stock -= item.Quantity
			if err := tx.Save(&product).Error; err != nil {
				return err
			}

			// Hitung subtotal dan buat record Item Pesanan (Snapshot harga saat ini)
			priceAtPurchase := product.Price
			totalAmount += priceAtPurchase * float64(item.Quantity)

			orderItems = append(orderItems, domain.OrderItem{
				ID:              uuid.New().String(),
				OrderID:         orderID,
				ProductID:       product.ID,
				Quantity:        item.Quantity,
				PriceAtPurchase: priceAtPurchase,
				CreatedAt:       time.Now(),
				UpdatedAt:       time.Now(),
			})
		}

		// 2. Buat Record Order utama
		createdOrder = domain.Order{
			ID:          orderID,
			UserID:      userID,
			TotalAmount: totalAmount,
			Status:      "PENDING",
			CreatedAt:   time.Now(),
			UpdatedAt:   time.Now(),
		}

		if err := tx.Create(&createdOrder).Error; err != nil {
			return err
		}

		// 3. Masukkan semua item ke order_items
		if err := tx.Create(&orderItems).Error; err != nil {
			return err
		}

		// 4. Kosongkan keranjang belanja user ini
		if err := tx.Where("user_id = ?", userID).Delete(&domain.CartItem{}).Error; err != nil {
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

func (r *orderRepository) FindByUserID(userID string) ([]domain.Order, error) {
	var orders []domain.Order
	// Tampilkan history tanpa perlu load detail item (untuk efisiensi listing)
	err := r.db.Where("user_id = ?", userID).Order("created_at desc").Find(&orders).Error
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

func (r *orderRepository) UpdateStatus(orderID string, status string) error {
	return r.db.Model(&domain.Order{}).Where("id_order = ?", orderID).Update("status", status).Error
}
