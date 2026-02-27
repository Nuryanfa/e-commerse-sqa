package usecase

import (
	"errors"
	"testing"
	"time"

	"github.com/google/uuid"
	"github.com/nuryanfa/e-commerse-sqa/internal/domain"
)

// --- MOCKS ---

type MockCartRepository struct {
	items []domain.CartItem
}
func (m *MockCartRepository) UpsertItem(item *domain.CartItem) error { return nil }
func (m *MockCartRepository) FindByUserID(userID string) ([]domain.CartItem, error) { return m.items, nil }
func (m *MockCartRepository) DeleteByUserID(userID string) error { return nil }
func (m *MockCartRepository) RemoveItem(itemID string, userID string) error { return nil }
func (m *MockCartRepository) FindByID(itemID string) (*domain.CartItem, error) { return nil, nil }

type MockOrderRepository struct {
	Checkouts []*domain.Order
}
func (m *MockOrderRepository) CheckoutTransaction(userID string, cartItems []domain.CartItem) (*domain.Order, error) {
	// Simulate Transaction logic for Test
	if len(cartItems) == 0 {
		return nil, errors.New("cart empty")
	}
	order := &domain.Order{
		ID:          uuid.New().String(),
		UserID:      userID,
		TotalAmount: 1000,
		Status:      "PENDING",
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
	}
	m.Checkouts = append(m.Checkouts, order)
	return order, nil
}
func (m *MockOrderRepository) FindByUserID(userID string) ([]domain.Order, error) { return nil, nil }
func (m *MockOrderRepository) FindByID(orderID string) (*domain.Order, error) { return nil, nil }
func (m *MockOrderRepository) UpdateStatus(orderID string, status string) error { return nil }
func (m *MockOrderRepository) FindPaidOrders() ([]domain.Order, error)          { return nil, nil }
func (m *MockOrderRepository) AssignCourier(orderID string, courierID string) error { return nil }
func (m *MockOrderRepository) FindByCourierID(courierID string) ([]domain.Order, error) {
	return nil, nil
}
func (m *MockOrderRepository) FindByProductSupplier(supplierID string) ([]domain.Order, error) {
	return nil, nil
}

// --- TESTS ---

func TestCheckout_Success(t *testing.T) {
	mockCartRepo := &MockCartRepository{
		items: []domain.CartItem{
			{ID: "item-1", UserID: "user-1", ProductID: "prod-1", Quantity: 2},
		},
	}
	mockOrderRepo := &MockOrderRepository{}
	
	usecase := NewOrderUsecase(mockOrderRepo, mockCartRepo)

	order, err := usecase.Checkout("user-1")

	if err != nil {
		t.Fatalf("Expected successful checkout, got error: %v", err)
	}

	if order == nil {
		t.Fatalf("Expected order to be returned, got nil")
	}

	if len(mockOrderRepo.Checkouts) != 1 {
		t.Errorf("Expected 1 order to be recorded in repository")
	}
}

func TestCheckout_EmptyCart(t *testing.T) {
	mockCartRepo := &MockCartRepository{
		items: []domain.CartItem{}, // EMPTY CART
	}
	mockOrderRepo := &MockOrderRepository{}
	
	usecase := NewOrderUsecase(mockOrderRepo, mockCartRepo)

	_, err := usecase.Checkout("user-1")

	if err == nil {
		t.Fatalf("Expected error for empty cart, got success")
	}

	if err.Error() != "keranjang belanja anda kosong. tidak bisa checkout" {
		t.Errorf("Expected 'keranjang belanja anda kosong' error, got %v", err)
	}
}
