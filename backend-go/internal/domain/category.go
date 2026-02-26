package domain

import "time"

type Category struct {
	ID          string    `json:"id_category" db:"id_category"`
	Name        string    `json:"name" db:"name" binding:"required,min=3"`
	Description string    `json:"description" db:"description"`
	CreatedAt   time.Time `json:"created_at" db:"created_at"`
	UpdatedAt   time.Time `json:"updated_at" db:"updated_at"`
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
