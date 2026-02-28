package usecase

import (
	"errors"

	"github.com/nuryanfa/e-commerse-sqa/internal/domain"
	"github.com/nuryanfa/e-commerse-sqa/internal/repository"
)

type WishlistUsecase interface {
	ToggleWishlist(userID, productID string) (bool, error)
	GetMyWishlist(userID string) ([]domain.Wishlist, error)
	CheckIsWishlisted(userID, productID string) (bool, error)
}

type wishlistUsecase struct {
	wishlistRepo repository.WishlistRepository
	productRepo  domain.ProductRepository
}

func NewWishlistUsecase(wr repository.WishlistRepository, pr domain.ProductRepository) WishlistUsecase {
	return &wishlistUsecase{wishlistRepo: wr, productRepo: pr}
}

// Returns true if added, false if removed
func (u *wishlistUsecase) ToggleWishlist(userID, productID string) (bool, error) {
	// Verify product exists
	_, err := u.productRepo.FindByID(productID)
	if err != nil {
		return false, errors.New("produk tidak ditemukan")
	}

	exists, err := u.wishlistRepo.CheckExists(userID, productID)
	if err != nil {
		return false, err
	}

	if exists {
		// Remove
		return false, u.wishlistRepo.Remove(userID, productID)
	} else {
		// Add
		w := &domain.Wishlist{
			UserID:    userID,
			ProductID: productID,
		}
		return true, u.wishlistRepo.Add(w)
	}
}

func (u *wishlistUsecase) GetMyWishlist(userID string) ([]domain.Wishlist, error) {
	return u.wishlistRepo.GetByUser(userID)
}

func (u *wishlistUsecase) CheckIsWishlisted(userID, productID string) (bool, error) {
	return u.wishlistRepo.CheckExists(userID, productID)
}
