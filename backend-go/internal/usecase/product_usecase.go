package usecase

import (
	"errors"
	"time"

	"github.com/google/uuid"
	"github.com/nuryanfa/e-commerse-sqa/internal/domain"
)

type productUsecase struct {
	productRepo  domain.ProductRepository
	categoryRepo domain.CategoryRepository
}

func NewProductUsecase(pRepo domain.ProductRepository, cRepo domain.CategoryRepository) domain.ProductUsecase {
	return &productUsecase{
		productRepo:  pRepo,
		categoryRepo: cRepo,
	}
}

func (u *productUsecase) Create(product *domain.Product) error {
	_, err := u.categoryRepo.FindByID(product.CategoryID)
	if err != nil {
		return errors.New("invalid category_id: kategori tidak ditemukan")
	}

	product.ID = uuid.New().String()
	product.CreatedAt = time.Now()
	product.UpdatedAt = time.Now()

	return u.productRepo.Create(product)
}

func (u *productUsecase) FindAll() ([]domain.Product, error) {
	return u.productRepo.FindAll()
}

func (u *productUsecase) FindByID(id string) (*domain.Product, error) {
	return u.productRepo.FindByID(id)
}

func (u *productUsecase) Update(id string, updateData *domain.Product) error {
	existingProduct, err := u.productRepo.FindByID(id)
	if err != nil {
		return err
	}

	if updateData.Name != "" {
		existingProduct.Name = updateData.Name
	}
	if updateData.Description != "" {
		existingProduct.Description = updateData.Description
	}
	if updateData.ImageURL != "" {
		existingProduct.ImageURL = updateData.ImageURL
	}
	if updateData.Price > 0 {
		existingProduct.Price = updateData.Price
	}
	existingProduct.Stock = updateData.Stock

	if updateData.CategoryID != "" && updateData.CategoryID != existingProduct.CategoryID {
		_, err := u.categoryRepo.FindByID(updateData.CategoryID)
		if err != nil {
			return errors.New("invalid category_id")
		}
		existingProduct.CategoryID = updateData.CategoryID
	}

	existingProduct.UpdatedAt = time.Now()
	return u.productRepo.Update(existingProduct)
}

func (u *productUsecase) Delete(id string) error {
	_, err := u.productRepo.FindByID(id)
	if err != nil {
		return errors.New("produk tidak ditemukan")
	}
	return u.productRepo.Delete(id)
}

func (u *productUsecase) Search(keyword string, categoryID string, limit int, offset int) ([]domain.Product, error) {
	return u.productRepo.Search(keyword, categoryID, limit, offset)
}

func (u *productUsecase) FindBySupplierID(supplierID string) ([]domain.Product, error) {
	return u.productRepo.FindBySupplierID(supplierID)
}

// CreateBySupplier membuat produk dengan SupplierID otomatis di-set
func (u *productUsecase) CreateBySupplier(supplierID string, product *domain.Product) error {
	_, err := u.categoryRepo.FindByID(product.CategoryID)
	if err != nil {
		return errors.New("invalid category_id: kategori tidak ditemukan")
	}

	product.ID = uuid.New().String()
	product.SupplierID = supplierID
	product.CreatedAt = time.Now()
	product.UpdatedAt = time.Now()

	return u.productRepo.Create(product)
}

// UpdateBySupplier update produk milik supplier (ownership check)
func (u *productUsecase) UpdateBySupplier(supplierID string, productID string, updateData *domain.Product) error {
	existingProduct, err := u.productRepo.FindByID(productID)
	if err != nil {
		return err
	}

	// Ownership check
	if existingProduct.SupplierID != supplierID {
		return errors.New("akses ditolak: produk ini bukan milik anda")
	}

	if updateData.Name != "" {
		existingProduct.Name = updateData.Name
	}
	if updateData.Description != "" {
		existingProduct.Description = updateData.Description
	}
	if updateData.ImageURL != "" {
		existingProduct.ImageURL = updateData.ImageURL
	}
	if updateData.Price > 0 {
		existingProduct.Price = updateData.Price
	}
	existingProduct.Stock = updateData.Stock

	if updateData.CategoryID != "" && updateData.CategoryID != existingProduct.CategoryID {
		_, err := u.categoryRepo.FindByID(updateData.CategoryID)
		if err != nil {
			return errors.New("invalid category_id")
		}
		existingProduct.CategoryID = updateData.CategoryID
	}

	existingProduct.UpdatedAt = time.Now()
	return u.productRepo.Update(existingProduct)
}

// DeleteBySupplier hapus produk milik supplier (ownership check)
func (u *productUsecase) DeleteBySupplier(supplierID string, productID string) error {
	existingProduct, err := u.productRepo.FindByID(productID)
	if err != nil {
		return errors.New("produk tidak ditemukan")
	}

	if existingProduct.SupplierID != supplierID {
		return errors.New("akses ditolak: produk ini bukan milik anda")
	}

	return u.productRepo.Delete(productID)
}
