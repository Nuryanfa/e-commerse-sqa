package repository

import (
	"errors"

	"github.com/nuryanfa/e-commerse-sqa/internal/domain"
	"gorm.io/gorm"
)

type cartRepository struct {
	db *gorm.DB
}

func NewCartRepository(db *gorm.DB) domain.CartRepository {
	return &cartRepository{db: db}
}

func (r *cartRepository) UpsertItem(item *domain.CartItem) error {
	var existingItem domain.CartItem
	err := r.db.Where("id_user = ? AND id_product = ?", item.UserID, item.ProductID).First(&existingItem).Error

	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			// Jika belum ada, buat baru
			return r.db.Create(item).Error
		}
		return err
	}

	// Jika sudah ada barang yang sama, tambahkan kuantitasnya
	existingItem.Quantity += item.Quantity
	existingItem.UpdatedAt = item.UpdatedAt
	return r.db.Save(&existingItem).Error
}

func (r *cartRepository) FindByUserID(userID string) ([]domain.CartItem, error) {
	var items []domain.CartItem
	// Preload Product and its Category to show complete details in Cart
	err := r.db.Preload("Product.Category").Where("id_user = ?", userID).Find(&items).Error
	return items, err
}

func (r *cartRepository) FindByID(itemID string) (*domain.CartItem, error) {
	var item domain.CartItem
	err := r.db.Where("id_cart_item = ?", itemID).First(&item).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("cart item tidak ditemukan")
		}
		return nil, err
	}
	return &item, nil
}

func (r *cartRepository) DeleteByUserID(userID string) error {
	return r.db.Where("id_user = ?", userID).Delete(&domain.CartItem{}).Error
}

func (r *cartRepository) RemoveItem(itemID string, userID string) error {
	// Pastikan user hanya menghapus miliknya sendiri
	return r.db.Where("id_cart_item = ? AND id_user = ?", itemID, userID).Delete(&domain.CartItem{}).Error
}
