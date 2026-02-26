package domain

import "time"

type Product struct {
	ID          string    `json:"id_product" db:"id_product"`
	Name        string    `json:"name" db:"name" binding:"required,min=3"`
	Description string    `json:"description" db:"description"`
	Price       float64   `json:"price" db:"price" binding:"required,gt=0"`
	Stock       int       `json:"stock" db:"stock" binding:"required,gte=0"`
	CategoryID  string    `json:"id_category" db:"id_category" binding:"required"`
	Category    *Category `json:"category,omitempty" gorm:"foreignKey:CategoryID"` // Belongs To Category
	ImageURL    string    `json:"image_url" db:"image_url"`
	CreatedAt   time.Time `json:"created_at" db:"created_at"`
	UpdatedAt   time.Time `json:"updated_at" db:"updated_at"`
}

type ProductRepository interface {
	Create(product *Product) error
	FindAll() ([]Product, error)
	FindByID(id string) (*Product, error)
	Update(product *Product) error
	Delete(id string) error
}

type ProductUsecase interface {
	Create(product *Product) error
	FindAll() ([]Product, error)
	FindByID(id string) (*Product, error)
	Update(id string, product *Product) error
	Delete(id string) error
}
