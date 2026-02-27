package usecase

import (
	"errors"
	"fmt"
	"testing"
	"time"

	"github.com/nuryanfa/e-commerse-sqa/internal/domain"
)

// --- Mock Repositories for Cart Tests ---

type MockProductRepoForCart struct {
	products map[string]*domain.Product
}

func (m *MockProductRepoForCart) Create(p *domain.Product) error   { return nil }
func (m *MockProductRepoForCart) FindAll() ([]domain.Product, error) { return nil, nil }
func (m *MockProductRepoForCart) FindByID(id string) (*domain.Product, error) {
	p, ok := m.products[id]
	if !ok {
		return nil, errors.New("produk tidak ditemukan")
	}
	return p, nil
}
func (m *MockProductRepoForCart) Update(p *domain.Product) error { return nil }
func (m *MockProductRepoForCart) Delete(id string) error          { return nil }
func (m *MockProductRepoForCart) Search(keyword string, categoryID string) ([]domain.Product, error) {
	return nil, nil
}
func (m *MockProductRepoForCart) FindBySupplierID(supplierID string) ([]domain.Product, error) {
	return nil, nil
}

type MockCartRepo struct {
	items map[string]*domain.CartItem // Key: id_cart_item
}

func NewMockCartRepo() *MockCartRepo {
	return &MockCartRepo{items: make(map[string]*domain.CartItem)}
}

func (m *MockCartRepo) UpsertItem(item *domain.CartItem) error {
	m.items[item.ID] = item
	return nil
}
func (m *MockCartRepo) FindByUserID(userID string) ([]domain.CartItem, error) {
	var result []domain.CartItem
	for _, item := range m.items {
		if item.UserID == userID {
			result = append(result, *item)
		}
	}
	return result, nil
}
func (m *MockCartRepo) DeleteByUserID(userID string) error {
	for id, item := range m.items {
		if item.UserID == userID {
			delete(m.items, id)
		}
	}
	return nil
}
func (m *MockCartRepo) RemoveItem(itemID string, userID string) error {
	item, ok := m.items[itemID]
	if !ok || item.UserID != userID {
		return errors.New("item not found")
	}
	delete(m.items, itemID)
	return nil
}
func (m *MockCartRepo) FindByID(itemID string) (*domain.CartItem, error) {
	item, ok := m.items[itemID]
	if !ok {
		return nil, errors.New("item not found")
	}
	return item, nil
}

// --- Tests ---

func TestAddToCart_Success(t *testing.T) {
	productRepo := &MockProductRepoForCart{
		products: map[string]*domain.Product{
			"prod-1": {ID: "prod-1", Name: "Kangkung", Stock: 10, Price: 5000000},
		},
	}
	cartRepo := NewMockCartRepo()
	uc := NewCartUsecase(cartRepo, productRepo)

	req := &domain.CartItem{ProductID: "prod-1", Quantity: 2}
	err := uc.AddToCart("user-1", req)

	if err != nil {
		t.Fatalf("Expected success, got error: %v", err)
	}
	if len(cartRepo.items) != 1 {
		t.Errorf("Expected 1 item in cart, got %d", len(cartRepo.items))
	}
}

func TestAddToCart_ProductNotFound(t *testing.T) {
	productRepo := &MockProductRepoForCart{products: map[string]*domain.Product{}}
	cartRepo := NewMockCartRepo()
	uc := NewCartUsecase(cartRepo, productRepo)

	req := &domain.CartItem{ProductID: "nonexistent", Quantity: 1}
	err := uc.AddToCart("user-1", req)

	if err == nil {
		t.Fatal("Expected error for nonexistent product, got success")
	}
}

func TestAddToCart_ExceedsStock(t *testing.T) {
	productRepo := &MockProductRepoForCart{
		products: map[string]*domain.Product{
			"prod-1": {ID: "prod-1", Name: "Bayam", Stock: 3, Price: 100000},
		},
	}
	cartRepo := NewMockCartRepo()
	uc := NewCartUsecase(cartRepo, productRepo)

	// Add 2 units first
	req1 := &domain.CartItem{ProductID: "prod-1", Quantity: 2}
	_ = uc.AddToCart("user-1", req1)

	// SQA CHECK: Adding 2 more should fail because 2 (already) + 2 (new) = 4 > 3 (stock)
	req2 := &domain.CartItem{ProductID: "prod-1", Quantity: 2}
	err := uc.AddToCart("user-1", req2)

	if err == nil {
		t.Fatal("Expected error when exceeding stock (including existing cart items), got success")
	}

	expected := fmt.Sprintf("tidak bisa menambah %d unit. Stok tersisa: %d, sudah di keranjang: %d", 2, 3, 2)
	if err.Error() != expected {
		t.Errorf("Expected error '%s', got '%s'", expected, err.Error())
	}
}

func TestUpdateQuantity_Success(t *testing.T) {
	productRepo := &MockProductRepoForCart{
		products: map[string]*domain.Product{
			"prod-1": {ID: "prod-1", Name: "Tomat", Stock: 10, Price: 200000},
		},
	}
	cartRepo := NewMockCartRepo()
	cartRepo.items["item-1"] = &domain.CartItem{
		ID: "item-1", UserID: "user-1", ProductID: "prod-1", Quantity: 2, CreatedAt: time.Now(),
	}

	uc := NewCartUsecase(cartRepo, productRepo)

	err := uc.UpdateQuantity("user-1", "item-1", 5)
	if err != nil {
		t.Fatalf("Expected success, got error: %v", err)
	}
}

func TestUpdateQuantity_NotOwned(t *testing.T) {
	productRepo := &MockProductRepoForCart{products: map[string]*domain.Product{}}
	cartRepo := NewMockCartRepo()
	cartRepo.items["item-1"] = &domain.CartItem{
		ID: "item-1", UserID: "user-1", ProductID: "prod-1", Quantity: 2,
	}

	uc := NewCartUsecase(cartRepo, productRepo)

	// user-2 tries to update user-1's cart item
	err := uc.UpdateQuantity("user-2", "item-1", 3)
	if err == nil {
		t.Fatal("Expected error when updating another user's cart item, got success")
	}
}

func TestRemoveFromCart_Success(t *testing.T) {
	productRepo := &MockProductRepoForCart{products: map[string]*domain.Product{}}
	cartRepo := NewMockCartRepo()
	cartRepo.items["item-1"] = &domain.CartItem{
		ID: "item-1", UserID: "user-1", ProductID: "prod-1", Quantity: 1,
	}

	uc := NewCartUsecase(cartRepo, productRepo)

	err := uc.RemoveFromCart("user-1", "item-1")
	if err != nil {
		t.Fatalf("Expected success, got error: %v", err)
	}

	if len(cartRepo.items) != 0 {
		t.Errorf("Expected cart to be empty after removal, got %d items", len(cartRepo.items))
	}
}
