package domain

import "time"

type Category struct {
	ID          string    `json:"id_category" gorm:"column:id_category;primaryKey"`
	Name        string    `json:"name" gorm:"column:name" binding:"required,min=3"`
	Description string    `json:"description" gorm:"column:description"`
	CreatedAt   time.Time `json:"created_at" gorm:"column:created_at"`
	UpdatedAt   time.Time `json:"updated_at" gorm:"column:updated_at"`
}

type CategoryRepository interface {
	Create(category *Category) error
	FindAll() ([]Category, error)
	FindByID(id string) (*Category, error)
	Update(category *Category) error
	Delete(id string) error
}

type CategoryUsecase interface {
	Create(category *Category) error
	FindAll() ([]Category, error)
	FindByID(id string) (*Category, error)
	Update(id string, category *Category) error
	Delete(id string) error
}
