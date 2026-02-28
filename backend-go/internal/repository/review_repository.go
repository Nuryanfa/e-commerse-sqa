package repository

import (
	"github.com/nuryanfa/e-commerse-sqa/internal/domain"
	"gorm.io/gorm"
)

type ReviewRepository interface {
	Create(review *domain.Review) error
	GetByProductID(productID string) ([]domain.Review, error)
	GetAverageRating(productID string) (float64, error)
}

type reviewRepository struct {
	db *gorm.DB
}

func NewReviewRepository(db *gorm.DB) ReviewRepository {
	return &reviewRepository{db}
}

func (r *reviewRepository) Create(rev *domain.Review) error {
	return r.db.Create(rev).Error
}

func (r *reviewRepository) GetByProductID(productID string) ([]domain.Review, error) {
	var reviews []domain.Review
	err := r.db.Preload("User").Where("id_product = ?", productID).Order("created_at DESC").Find(&reviews).Error
	return reviews, err
}

func (r *reviewRepository) GetAverageRating(productID string) (float64, error) {
	var avg float64
	err := r.db.Model(&domain.Review{}).Where("id_product = ?", productID).Select("COALESCE(AVG(rating), 0)").Scan(&avg).Error
	return avg, err
}
