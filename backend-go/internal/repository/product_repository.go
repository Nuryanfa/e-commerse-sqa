package repository

import (
	"errors"

	"github.com/nuryanfa/e-commerse-sqa/internal/domain"
	"gorm.io/gorm"
)

type productRepository struct {
	db *gorm.DB
}

func NewProductRepository(db *gorm.DB) domain.ProductRepository {
	return &productRepository{db: db}
}

func (r *productRepository) Create(product *domain.Product) error {
	return r.db.Create(product).Error
}

// FindAll automatically joins/preloads the relative Category
func (r *productRepository) FindAll() ([]domain.Product, error) {
	var products []domain.Product
	err := r.db.Preload("Category").Find(&products).Error
	return products, err
}

func (r *productRepository) FindByID(id string) (*domain.Product, error) {
	var product domain.Product
	err := r.db.Preload("Category").Where("id_product = ?", id).First(&product).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("produk tidak ditemukan")
		}
		return nil, err
	}
	return &product, nil
}

func (r *productRepository) Update(product *domain.Product) error {
	return r.db.Save(product).Error
}

func (r *productRepository) Delete(id string) error {
	return r.db.Where("id_product = ?", id).Delete(&domain.Product{}).Error
}

// Search mencari produk berdasarkan keyword (nama) dan/atau filter kategori.
// Menggunakan ILIKE untuk pencarian case-insensitive di PostgreSQL.
func (r *productRepository) Search(keyword string, categoryID string) ([]domain.Product, error) {
	var products []domain.Product
	query := r.db.Preload("Category")

	if keyword != "" {
		query = query.Where("name ILIKE ?", "%"+keyword+"%")
	}

	if categoryID != "" {
		query = query.Where("id_category = ?", categoryID)
	}

	err := query.Find(&products).Error
	return products, err
}
