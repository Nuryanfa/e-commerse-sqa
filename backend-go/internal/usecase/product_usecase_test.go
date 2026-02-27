package usecase

import (
	"errors"
	"strings"
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
func (m *MockProductRepository) Search(keyword string, categoryID string) ([]domain.Product, error) {
	var result []domain.Product
	for _, p := range m.products {
		// Simulasi pencarian case-insensitive
		if keyword != "" {
			lowerName := strings.ToLower(p.Name)
			lowerKeyword := strings.ToLower(keyword)
			if !strings.Contains(lowerName, lowerKeyword) {
				continue
			}
		}
		if categoryID != "" && p.CategoryID != categoryID {
			continue
		}
		result = append(result, *p)
	}
	return result, nil
}
func (m *MockProductRepository) FindBySupplierID(supplierID string) ([]domain.Product, error) {
	var result []domain.Product
	for _, p := range m.products {
		if p.SupplierID == supplierID {
			result = append(result, *p)
		}
	}
	return result, nil
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

// --- Product CRUD Tests ---

func TestProductCreate_Success(t *testing.T) {
	mockProductRepo := NewMockProductRepository()
	mockCategoryRepo := NewMockCategoryRepositoryForProduct()
	mockCategoryRepo.categories["cat-1"] = &domain.Category{ID: "cat-1", Name: "Elektronik"}

	uc := NewProductUsecase(mockProductRepo, mockCategoryRepo)

	product := &domain.Product{
		Name:        "Kangkung Segar",
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
		Name:       "Bayam Hijau",
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

// --- Product Search Tests ---

func TestProductSearch_ByKeyword(t *testing.T) {
	mockProductRepo := NewMockProductRepository()
	mockCategoryRepo := NewMockCategoryRepositoryForProduct()
	mockCategoryRepo.categories["cat-1"] = &domain.Category{ID: "cat-1", Name: "Sayuran Daun"}
	mockCategoryRepo.categories["cat-2"] = &domain.Category{ID: "cat-2", Name: "Umbi-umbian"}

	// Seed products
	mockProductRepo.products["p1"] = &domain.Product{ID: "p1", Name: "Kangkung Segar", CategoryID: "cat-1", Price: 5000}
	mockProductRepo.products["p2"] = &domain.Product{ID: "p2", Name: "Wortel Organik", CategoryID: "cat-2", Price: 12000}
	mockProductRepo.products["p3"] = &domain.Product{ID: "p3", Name: "Kangkung Organik", CategoryID: "cat-1", Price: 7000}

	uc := NewProductUsecase(mockProductRepo, mockCategoryRepo)

	results, err := uc.Search("Kangkung", "")
	if err != nil {
		t.Fatalf("Expected success, got error: %v", err)
	}
	if len(results) != 2 {
		t.Errorf("Expected 2 results for 'Kangkung', got %d", len(results))
	}
}

func TestProductSearch_ByKeywordAndCategory(t *testing.T) {
	mockProductRepo := NewMockProductRepository()
	mockCategoryRepo := NewMockCategoryRepositoryForProduct()

	mockProductRepo.products["p1"] = &domain.Product{ID: "p1", Name: "Kangkung Segar", CategoryID: "cat-1"}
	mockProductRepo.products["p2"] = &domain.Product{ID: "p2", Name: "Bayam Hijau", CategoryID: "cat-2"}
	mockProductRepo.products["p3"] = &domain.Product{ID: "p3", Name: "Wortel", CategoryID: "cat-1"}

	uc := NewProductUsecase(mockProductRepo, mockCategoryRepo)

	results, err := uc.Search("Kangkung", "cat-1")
	if err != nil {
		t.Fatalf("Expected success, got error: %v", err)
	}
	if len(results) != 1 {
		t.Errorf("Expected 1 result for 'Kangkung' in cat-1, got %d", len(results))
	}
}

func TestProductSearch_EmptyKeyword_ReturnsAll(t *testing.T) {
	mockProductRepo := NewMockProductRepository()
	mockCategoryRepo := NewMockCategoryRepositoryForProduct()

	mockProductRepo.products["p1"] = &domain.Product{ID: "p1", Name: "Kangkung"}
	mockProductRepo.products["p2"] = &domain.Product{ID: "p2", Name: "Wortel"}

	uc := NewProductUsecase(mockProductRepo, mockCategoryRepo)

	results, err := uc.Search("", "")
	if err != nil {
		t.Fatalf("Expected success, got error: %v", err)
	}
	if len(results) != 2 {
		t.Errorf("Expected 2 results for empty search, got %d", len(results))
	}
}
