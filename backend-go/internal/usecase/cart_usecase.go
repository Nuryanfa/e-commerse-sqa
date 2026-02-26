package usecase

import (
	"errors"
	"time"

	"github.com/google/uuid"
	"github.com/nuryanfa/e-commerse-sqa/internal/domain"
)

type cartUsecase struct {
	cartRepo    domain.CartRepository
	productRepo domain.ProductRepository // Needed for SQA stock checking
}

func NewCartUsecase(cRepo domain.CartRepository, pRepo domain.ProductRepository) domain.CartUsecase {
	return &cartUsecase{
		cartRepo:    cRepo,
		productRepo: pRepo,
	}
}

func (u *cartUsecase) AddToCart(userID string, req *domain.CartItem) error {
	// SQA Check 1: Pastikan produk yang dimasukkan katalognya ada valid
	product, err := u.productRepo.FindByID(req.ProductID)
	if err != nil {
		return errors.New("produk tidak valid atau tidak ditemukan")
	}

	// SQA Check 2: Pastikan stok yang ada cukup untuk menutupi request kuantitas
	if product.Stock < req.Quantity {
		return errors.New("kuantitas melebihi stok yang tersedia saat ini")
	}

	req.ID = uuid.New().String()
	req.UserID = userID
	req.CreatedAt = time.Now()
	req.UpdatedAt = time.Now()

	return u.cartRepo.UpsertItem(req)
}

func (u *cartUsecase) ViewCart(userID string) ([]domain.CartItem, error) {
	return u.cartRepo.FindByUserID(userID)
}

func (u *cartUsecase) UpdateQuantity(userID string, itemID string, quantity int) error {
	if quantity <= 0 {
		return errors.New("kuantitas harus lebih dari 0")
	}

	// 1. Ambil item di cart
	cartItem, err := u.cartRepo.FindByID(itemID)
	if err != nil || cartItem.UserID != userID {
		return errors.New("item pada keranjang tidak ditemukan atau bukan milik anda")
	}

	// 2. Ambil product utamanya untuk verifikasi stok sisa (SQA Check)
	product, err := u.productRepo.FindByID(cartItem.ProductID)
	if err != nil {
		return errors.New("produk bawaan tidak valid lagi")
	}

	if product.Stock < quantity {
		return errors.New("kuantitas yang diminta melebihi stok gudang")
	}

	// 3. Update quantity jika lolos validasi
	cartItem.Quantity = quantity
	cartItem.UpdatedAt = time.Now()
	return u.cartRepo.UpsertItem(cartItem)
}

func (u *cartUsecase) RemoveFromCart(userID string, itemID string) error {
	return u.cartRepo.RemoveItem(itemID, userID)
}
