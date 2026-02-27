package repository

import (
	"errors"
	"strings"
	"testing"

	"github.com/nuryanfa/e-commerse-sqa/internal/domain"
)

// --- Mock Product Repository for Cache Testing ---

type mockProductRepoForCache struct {
	products  map[string]*domain.Product
	callCount map[string]int // Melacak berapa kali method dipanggil
}

func newMockProductRepoForCache() *mockProductRepoForCache {
	return &mockProductRepoForCache{
		products:  make(map[string]*domain.Product),
		callCount: make(map[string]int),
	}
}

func (m *mockProductRepoForCache) Create(p *domain.Product) error {
	m.callCount["Create"]++
	m.products[p.ID] = p
	return nil
}

func (m *mockProductRepoForCache) FindAll() ([]domain.Product, error) {
	m.callCount["FindAll"]++
	var result []domain.Product
	for _, p := range m.products {
		result = append(result, *p)
	}
	return result, nil
}

func (m *mockProductRepoForCache) FindByID(id string) (*domain.Product, error) {
	m.callCount["FindByID"]++
	p, ok := m.products[id]
	if !ok {
		return nil, errors.New("produk tidak ditemukan")
	}
	return p, nil
}

func (m *mockProductRepoForCache) Update(p *domain.Product) error {
	m.callCount["Update"]++
	m.products[p.ID] = p
	return nil
}

func (m *mockProductRepoForCache) Delete(id string) error {
	m.callCount["Delete"]++
	delete(m.products, id)
	return nil
}

func (m *mockProductRepoForCache) Search(keyword string, categoryID string) ([]domain.Product, error) {
	m.callCount["Search"]++
	var result []domain.Product
	for _, p := range m.products {
		if keyword != "" && !strings.Contains(strings.ToLower(p.Name), strings.ToLower(keyword)) {
			continue
		}
		if categoryID != "" && p.CategoryID != categoryID {
			continue
		}
		result = append(result, *p)
	}
	return result, nil
}

// --- Tests: Cache tanpa Redis (nil client fallback) ---

// TestCachedRepo_FallbackWithoutRedis — Tanpa Redis, harus tetap bekerja via base repository
func TestCachedRepo_FallbackWithoutRedis(t *testing.T) {
	baseRepo := newMockProductRepoForCache()
	cachedRepo := NewCachedProductRepository(baseRepo, nil) // nil = Redis tidak tersedia

	// Create product
	product := &domain.Product{ID: "prod-1", Name: "Laptop Gaming", Price: 15000000, Stock: 10, CategoryID: "cat-1"}
	err := cachedRepo.Create(product)
	if err != nil {
		t.Fatalf("Create failed: %v", err)
	}

	// FindAll harus bisa jalan tanpa Redis
	products, err := cachedRepo.FindAll()
	if err != nil {
		t.Fatalf("FindAll failed: %v", err)
	}
	if len(products) != 1 {
		t.Errorf("Expected 1 product, got %d", len(products))
	}

	// Setiap panggilan harus ke base repo (tidak ada cache)
	if baseRepo.callCount["FindAll"] != 1 {
		t.Errorf("Expected 1 call to base FindAll, got %d", baseRepo.callCount["FindAll"])
	}
}

// TestCachedRepo_FindByID_FallbackWithoutRedis — FindByID tanpa Redis
func TestCachedRepo_FindByID_FallbackWithoutRedis(t *testing.T) {
	baseRepo := newMockProductRepoForCache()
	cachedRepo := NewCachedProductRepository(baseRepo, nil)

	baseRepo.products["prod-1"] = &domain.Product{ID: "prod-1", Name: "Mouse", Price: 250000}

	product, err := cachedRepo.FindByID("prod-1")
	if err != nil {
		t.Fatalf("FindByID failed: %v", err)
	}
	if product.Name != "Mouse" {
		t.Errorf("Expected 'Mouse', got '%s'", product.Name)
	}

	if baseRepo.callCount["FindByID"] != 1 {
		t.Errorf("Expected 1 call to base FindByID, got %d", baseRepo.callCount["FindByID"])
	}
}

// TestCachedRepo_FindByID_NotFound — FindByID untuk ID yang tidak ada
func TestCachedRepo_FindByID_NotFound(t *testing.T) {
	baseRepo := newMockProductRepoForCache()
	cachedRepo := NewCachedProductRepository(baseRepo, nil)

	_, err := cachedRepo.FindByID("nonexistent")
	if err == nil {
		t.Fatal("Expected error for nonexistent product, got nil")
	}
}

// TestCachedRepo_Update_Delegates — Update harus di-delegate ke base repo
func TestCachedRepo_Update_Delegates(t *testing.T) {
	baseRepo := newMockProductRepoForCache()
	cachedRepo := NewCachedProductRepository(baseRepo, nil)

	baseRepo.products["prod-1"] = &domain.Product{ID: "prod-1", Name: "Keyboard Lama", Price: 500000}

	updated := &domain.Product{ID: "prod-1", Name: "Keyboard Baru", Price: 750000}
	err := cachedRepo.Update(updated)
	if err != nil {
		t.Fatalf("Update failed: %v", err)
	}

	if baseRepo.products["prod-1"].Name != "Keyboard Baru" {
		t.Errorf("Expected name 'Keyboard Baru', got '%s'", baseRepo.products["prod-1"].Name)
	}
	if baseRepo.callCount["Update"] != 1 {
		t.Errorf("Expected 1 call to base Update, got %d", baseRepo.callCount["Update"])
	}
}

// TestCachedRepo_Delete_Delegates — Delete harus di-delegate ke base repo
func TestCachedRepo_Delete_Delegates(t *testing.T) {
	baseRepo := newMockProductRepoForCache()
	cachedRepo := NewCachedProductRepository(baseRepo, nil)

	baseRepo.products["prod-1"] = &domain.Product{ID: "prod-1", Name: "Headset"}

	err := cachedRepo.Delete("prod-1")
	if err != nil {
		t.Fatalf("Delete failed: %v", err)
	}

	if _, ok := baseRepo.products["prod-1"]; ok {
		t.Error("Expected product to be deleted from base repo")
	}
	if baseRepo.callCount["Delete"] != 1 {
		t.Errorf("Expected 1 call to base Delete, got %d", baseRepo.callCount["Delete"])
	}
}

// TestCachedRepo_Search_BypassesCache — Search harus selalu langsung ke base repo
func TestCachedRepo_Search_BypassesCache(t *testing.T) {
	baseRepo := newMockProductRepoForCache()
	cachedRepo := NewCachedProductRepository(baseRepo, nil)

	baseRepo.products["prod-1"] = &domain.Product{ID: "prod-1", Name: "Laptop Gaming", CategoryID: "cat-1"}
	baseRepo.products["prod-2"] = &domain.Product{ID: "prod-2", Name: "Mouse Wireless", CategoryID: "cat-2"}
	baseRepo.products["prod-3"] = &domain.Product{ID: "prod-3", Name: "Laptop Kerja", CategoryID: "cat-1"}

	// Search by keyword "Laptop"
	results, err := cachedRepo.Search("Laptop", "")
	if err != nil {
		t.Fatalf("Search failed: %v", err)
	}
	if len(results) != 2 {
		t.Errorf("Expected 2 results for 'Laptop', got %d", len(results))
	}

	// Search by keyword + categoryID
	results, err = cachedRepo.Search("Laptop", "cat-1")
	if err != nil {
		t.Fatalf("Search with category failed: %v", err)
	}
	if len(results) != 2 {
		t.Errorf("Expected 2 results for 'Laptop' in cat-1, got %d", len(results))
	}

	// Pastikan semua panggilan masuk ke base repo
	if baseRepo.callCount["Search"] != 2 {
		t.Errorf("Expected 2 calls to base Search, got %d", baseRepo.callCount["Search"])
	}
}

// TestCachedRepo_MultipleOperations_Flow — Test alur lengkap CRUD via cached repo
func TestCachedRepo_MultipleOperations_Flow(t *testing.T) {
	baseRepo := newMockProductRepoForCache()
	cachedRepo := NewCachedProductRepository(baseRepo, nil)

	// 1. Create
	p := &domain.Product{ID: "flow-1", Name: "SSD 1TB", Price: 1500000, Stock: 50, CategoryID: "cat-storage"}
	err := cachedRepo.Create(p)
	if err != nil {
		t.Fatalf("Create failed: %v", err)
	}

	// 2. FindAll
	all, err := cachedRepo.FindAll()
	if err != nil {
		t.Fatalf("FindAll failed: %v", err)
	}
	if len(all) != 1 {
		t.Errorf("Expected 1 product after create, got %d", len(all))
	}

	// 3. FindByID
	found, err := cachedRepo.FindByID("flow-1")
	if err != nil {
		t.Fatalf("FindByID failed: %v", err)
	}
	if found.Name != "SSD 1TB" {
		t.Errorf("Expected 'SSD 1TB', got '%s'", found.Name)
	}

	// 4. Update
	found.Price = 1200000
	err = cachedRepo.Update(found)
	if err != nil {
		t.Fatalf("Update failed: %v", err)
	}

	// 5. Verify update
	updated, _ := cachedRepo.FindByID("flow-1")
	if updated.Price != 1200000 {
		t.Errorf("Expected price 1200000, got %v", updated.Price)
	}

	// 6. Delete
	err = cachedRepo.Delete("flow-1")
	if err != nil {
		t.Fatalf("Delete failed: %v", err)
	}

	// 7. Verify deletion
	allAfterDelete, _ := cachedRepo.FindAll()
	if len(allAfterDelete) != 0 {
		t.Errorf("Expected 0 products after delete, got %d", len(allAfterDelete))
	}
}
