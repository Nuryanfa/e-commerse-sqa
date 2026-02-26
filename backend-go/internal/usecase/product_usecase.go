package usecase

import (
	"errors"
	"time"

	"github.com/google/uuid"
	"github.com/nuryanfa/e-commerse-sqa/internal/domain"
)

type productUsecase struct {
	productRepo  domain.ProductRepository
	categoryRepo domain.CategoryRepository // SQA Check: Memastikan kategori yang dimasukkan benar-benar ada
}

func NewProductUsecase(pRepo domain.ProductRepository, cRepo domain.CategoryRepository) domain.ProductUsecase {
	return &productUsecase{
		productRepo:  pRepo,
		categoryRepo: cRepo,
	}
}

func (u *productUsecase) Create(product *domain.Product) error {
	// SQA Validation: Pastikan kategori exists sblm product ditambahkan
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

	// Update fields if provided
	if updateData.Name != "" {
		existingProduct.Name = updateData.Name
	}
	if updateData.Description != "" {
		existingProduct.Description = updateData.Description
	}
	if updateData.ImageURL != "" {
		existingProduct.ImageURL = updateData.ImageURL
	}
	if updateData.Price > 0 { // Cegah override menjadi 0 jika tidak diset secara explisit (tergantung spesifikasi product)
		existingProduct.Price = updateData.Price
	}
	// Stock bisa diupdate menjadi 0 atau bertambah
	existingProduct.Stock = updateData.Stock

	// Cek validity Category jika dirubah
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
