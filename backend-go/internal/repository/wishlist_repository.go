package repository

import (
	"github.com/nuryanfa/e-commerse-sqa/internal/domain"
	"gorm.io/gorm"
)

type WishlistRepository interface {
	Add(wishlist *domain.Wishlist) error
	Remove(userID, productID string) error
	GetByUser(userID string) ([]domain.Wishlist, error)
	CheckExists(userID, productID string) (bool, error)
}

type wishlistRepository struct {
	db *gorm.DB
}

func NewWishlistRepository(db *gorm.DB) WishlistRepository {
	return &wishlistRepository{db}
}

func (r *wishlistRepository) Add(w *domain.Wishlist) error {
	return r.db.Create(w).Error
}

func (r *wishlistRepository) Remove(userID, productID string) error {
	return r.db.Where("id_user = ? AND id_product = ?", userID, productID).Delete(&domain.Wishlist{}).Error
}

func (r *wishlistRepository) GetByUser(userID string) ([]domain.Wishlist, error) {
	var list []domain.Wishlist
	err := r.db.Preload("Product").Where("id_user = ?", userID).Find(&list).Error
	return list, err
}

func (r *wishlistRepository) CheckExists(userID, productID string) (bool, error) {
	var count int64
	err := r.db.Model(&domain.Wishlist{}).Where("id_user = ? AND id_product = ?", userID, productID).Count(&count).Error
	return count > 0, err
}
