package usecase

import (
	"errors"
	"time"

	"github.com/google/uuid"
	"github.com/nuryanfa/e-commerse-sqa/internal/domain"
)

type categoryUsecase struct {
	categoryRepo domain.CategoryRepository
}

func NewCategoryUsecase(repo domain.CategoryRepository) domain.CategoryUsecase {
	return &categoryUsecase{
		categoryRepo: repo,
	}
}

func (u *categoryUsecase) Create(category *domain.Category) error {
	category.ID = uuid.New().String()
	category.CreatedAt = time.Now()
	category.UpdatedAt = time.Now()
	
	return u.categoryRepo.Create(category)
}

func (u *categoryUsecase) FindAll() ([]domain.Category, error) {
	return u.categoryRepo.FindAll()
}

func (u *categoryUsecase) FindByID(id string) (*domain.Category, error) {
	return u.categoryRepo.FindByID(id)
}

func (u *categoryUsecase) Update(id string, updateData *domain.Category) error {
	existingCategory, err := u.categoryRepo.FindByID(id)
	if err != nil {
		return err
	}

	if updateData.Name != "" {
		existingCategory.Name = updateData.Name
	}
	if updateData.Description != "" {
		existingCategory.Description = updateData.Description
	}

	existingCategory.UpdatedAt = time.Now()
	return u.categoryRepo.Update(existingCategory)
}

func (u *categoryUsecase) Delete(id string) error {
	_, err := u.categoryRepo.FindByID(id)
	if err != nil {
		return errors.New("kategori tidak ditemukan")
	}

	return u.categoryRepo.Delete(id)
}
