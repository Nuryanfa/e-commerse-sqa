package usecase

import (
	"errors"

	"github.com/nuryanfa/e-commerse-sqa/internal/domain"
)

type orderUsecase struct {
	orderRepo domain.OrderRepository
	cartRepo  domain.CartRepository
}

func NewOrderUsecase(oRepo domain.OrderRepository, cRepo domain.CartRepository) domain.OrderUsecase {
	return &orderUsecase{
		orderRepo: oRepo,
		cartRepo:  cRepo,
	}
}

func (u *orderUsecase) Checkout(userID string) (*domain.Order, error) {
	// 1. Ambil Keranjang Belanja User Saat Ini
	cartItems, err := u.cartRepo.FindByUserID(userID)
	if err != nil {
		return nil, errors.New("gagal memuat keranjang belanja")
	}

	if len(cartItems) == 0 {
		return nil, errors.New("keranjang belanja anda kosong. tidak bisa checkout")
	}

	// 2. Serahkan array barang ke Repositori Order untuk di-proses dalam 1 Transaksi Atomik
	order, err := u.orderRepo.CheckoutTransaction(userID, cartItems)
	if err != nil {
		// Terjadi Rollback otomatis akibat gagalnya stok, db timeout, dll
		return nil, errors.New("Checkout gagal: " + err.Error())
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
	
	// Keamanan Data: Pastikan user hanya bisa melihat detail ordernya sendiri
	if order.UserID != userID {
		return nil, errors.New("akses ditolak. Order ini bukan milik anda")
	}

	return order, nil
}

func (u *orderUsecase) PayOrder(orderID string) error {
	// Simulasi pembayaran: Ini dipanggil via integrasi third-party (contoh: Midtrans)
	order, err := u.orderRepo.FindByID(orderID)
	if err != nil {
		return err
	}

	if order.Status == "PAID" {
		return errors.New("pesanan ini sudah dibayar")
	}

	return u.orderRepo.UpdateStatus(orderID, "PAID")
}
