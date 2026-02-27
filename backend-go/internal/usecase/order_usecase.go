package usecase

import (
	"errors"
	"time"

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
	cartItems, err := u.cartRepo.FindByUserID(userID)
	if err != nil {
		return nil, errors.New("gagal memuat keranjang belanja")
	}

	if len(cartItems) == 0 {
		return nil, errors.New("keranjang belanja anda kosong. tidak bisa checkout")
	}

	order, err := u.orderRepo.CheckoutTransaction(userID, cartItems)
	if err != nil {
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

// GetPaidOrders mengembalikan pesanan siap kirim (status PAID)
func (u *orderUsecase) GetPaidOrders() ([]domain.Order, error) {
	return u.orderRepo.FindPaidOrders()
}

// AssignAndShip mengambil pesanan PAID dan set menjadi SHIPPED oleh kurir
func (u *orderUsecase) AssignAndShip(orderID string, courierID string) error {
	order, err := u.orderRepo.FindByID(orderID)
	if err != nil {
		return err
	}

	if order.Status != "PAID" {
		return errors.New("pesanan harus berstatus PAID untuk bisa dikirim")
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
