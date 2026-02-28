package usecase

import (
	"errors"

	"github.com/nuryanfa/e-commerse-sqa/internal/domain"
	"github.com/nuryanfa/e-commerse-sqa/internal/repository"
)

type ReviewUsecase interface {
	AddReview(review *domain.Review) error
	GetProductReviews(productID string) ([]domain.Review, error)
	GetProductAverageRating(productID string) (float64, error)
}

type reviewUsecase struct {
	reviewRepo  repository.ReviewRepository
	productRepo domain.ProductRepository
}

func NewReviewUsecase(rr repository.ReviewRepository, pr domain.ProductRepository) ReviewUsecase {
	return &reviewUsecase{reviewRepo: rr, productRepo: pr}
}

func (u *reviewUsecase) AddReview(review *domain.Review) error {
	// Verify product exists
	_, err := u.productRepo.FindByID(review.ProductID)
	if err != nil {
		return errors.New("produk tidak ditemukan")
	}

	if review.Rating < 1 || review.Rating > 5 {
		return errors.New("rating harus antara 1 sampai 5")
	}

	return u.reviewRepo.Create(review)
}

func (u *reviewUsecase) GetProductReviews(productID string) ([]domain.Review, error) {
	return u.reviewRepo.GetByProductID(productID)
}

func (u *reviewUsecase) GetProductAverageRating(productID string) (float64, error) {
	return u.reviewRepo.GetAverageRating(productID)
}
