package usecase

import (
	"errors"
	"testing"
	"time"

	"github.com/nuryanfa/e-commerse-sqa/internal/domain"
)

// --- Mock Product Repository ---
type MockProductRepository struct {
	products map[string]*domain.Product
}

func NewMockProductRepository() *MockProductRepository {
	return &MockProductRepository{products: make(map[string]*domain.Product)}
}

func (m *MockProductRepository) Create(p *domain.Product) error {
	m.products[p.ID] = p
	return nil
}
func (m *MockProductRepository) FindAll() ([]domain.Product, error) {
	var result []domain.Product
	for _, p := range m.products {
		result = append(result, *p)
	}
	return result, nil
}
func (m *MockProductRepository) FindByID(id string) (*domain.Product, error) {
	p, ok := m.products[id]
	if !ok {
		return nil, errors.New("produk tidak ditemukan")
	}
	return p, nil
}
func (m *MockProductRepository) Update(p *domain.Product) error {
	m.products[p.ID] = p
	return nil
}
func (m *MockProductRepository) Delete(id string) error {
	delete(m.products, id)
	return nil
}

// --- Mock Category Repository ---
type MockCategoryRepositoryForProduct struct {
	categories map[string]*domain.Category
}

func NewMockCategoryRepositoryForProduct() *MockCategoryRepositoryForProduct {
	return &MockCategoryRepositoryForProduct{categories: make(map[string]*domain.Category)}
}

func (m *MockCategoryRepositoryForProduct) Create(c *domain.Category) error {
	m.categories[c.ID] = c
	return nil
}
func (m *MockCategoryRepositoryForProduct) FindAll() ([]domain.Category, error) {
	return nil, nil
}
func (m *MockCategoryRepositoryForProduct) FindByID(id string) (*domain.Category, error) {
	c, ok := m.categories[id]
	if !ok {
		return nil, errors.New("kategori tidak ditemukan")
	}
	return c, nil
}
func (m *MockCategoryRepositoryForProduct) Update(c *domain.Category) error { return nil }
func (m *MockCategoryRepositoryForProduct) Delete(id string) error            { return nil }

// --- Tests ---

func TestProductCreate_Success(t *testing.T) {
	mockProductRepo := NewMockProductRepository()
	mockCategoryRepo := NewMockCategoryRepositoryForProduct()
	mockCategoryRepo.categories["cat-1"] = &domain.Category{ID: "cat-1", Name: "Elektronik"}

	uc := NewProductUsecase(mockProductRepo, mockCategoryRepo)

	product := &domain.Product{
		Name:        "Laptop Gaming",
		Description: "RTX 4060",
		Price:       15000000,
		Stock:       10,
		CategoryID:  "cat-1",
	}

	err := uc.Create(product)
	if err != nil {
		t.Fatalf("Expected success, got error: %v", err)
	}
	if product.ID == "" {
		t.Error("Expected ID to be generated")
	}
}

func TestProductCreate_InvalidCategory(t *testing.T) {
	mockProductRepo := NewMockProductRepository()
	mockCategoryRepo := NewMockCategoryRepositoryForProduct()

	uc := NewProductUsecase(mockProductRepo, mockCategoryRepo)

	product := &domain.Product{
		Name:       "Laptop",
		Price:      10000000,
		Stock:      5,
		CategoryID: "non-existent-cat",
	}

	err := uc.Create(product)
	if err == nil {
		t.Fatal("Expected error for invalid category, got success")
	}
	if err.Error() != "invalid category_id: kategori tidak ditemukan" {
		t.Errorf("Expected 'invalid category_id' error, got: %v", err)
	}
}

func TestProductUpdate_Success(t *testing.T) {
	mockProductRepo := NewMockProductRepository()
	mockCategoryRepo := NewMockCategoryRepositoryForProduct()
	mockCategoryRepo.categories["cat-1"] = &domain.Category{ID: "cat-1", Name: "Elektronik"}

	mockProductRepo.products["prod-1"] = &domain.Product{
		ID:         "prod-1",
		Name:       "Laptop Lama",
		Price:      10000000,
		Stock:      5,
		CategoryID: "cat-1",
		CreatedAt:  time.Now(),
	}

	uc := NewProductUsecase(mockProductRepo, mockCategoryRepo)

	updateData := &domain.Product{
		Name:  "Laptop Baru",
		Price: 12000000,
		Stock: 8,
	}

	err := uc.Update("prod-1", updateData)
	if err != nil {
		t.Fatalf("Expected success, got error: %v", err)
	}

	updated := mockProductRepo.products["prod-1"]
	if updated.Name != "Laptop Baru" {
		t.Errorf("Expected name 'Laptop Baru', got '%s'", updated.Name)
	}
	if updated.Price != 12000000 {
		t.Errorf("Expected price 12000000, got %v", updated.Price)
	}
}

func TestProductUpdate_NotFound(t *testing.T) {
	mockProductRepo := NewMockProductRepository()
	mockCategoryRepo := NewMockCategoryRepositoryForProduct()

	uc := NewProductUsecase(mockProductRepo, mockCategoryRepo)

	err := uc.Update("nonexistent", &domain.Product{Name: "X"})
	if err == nil {
		t.Fatal("Expected error for updating nonexistent product, got success")
	}
}

func TestProductDelete_NotFound(t *testing.T) {
	mockProductRepo := NewMockProductRepository()
	mockCategoryRepo := NewMockCategoryRepositoryForProduct()

	uc := NewProductUsecase(mockProductRepo, mockCategoryRepo)

	err := uc.Delete("nonexistent")
	if err == nil {
		t.Fatal("Expected error for deleting nonexistent product, got success")
	}
}
