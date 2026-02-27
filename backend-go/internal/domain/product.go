package domain

import "time"

type Product struct {
	ID          string    `json:"id_product" gorm:"column:id_product;primaryKey"`
	Name        string    `json:"name" gorm:"column:name" binding:"required,min=3"`
	Description string    `json:"description" gorm:"column:description"`
	Price       float64   `json:"price" gorm:"column:price" binding:"required,gt=0"`
	Stock       int       `json:"stock" gorm:"column:stock" binding:"required,gte=0"`
	CategoryID  string    `json:"id_category" gorm:"column:id_category" binding:"required"`
	Category    *Category `json:"category,omitempty" gorm:"foreignKey:CategoryID;references:ID"`
	SupplierID  string    `json:"supplier_id" gorm:"column:supplier_id"`
	ImageURL    string    `json:"image_url" gorm:"column:image_url"`
	CreatedAt   time.Time `json:"created_at" gorm:"column:created_at"`
	UpdatedAt   time.Time `json:"updated_at" gorm:"column:updated_at"`
}

type ProductRepository interface {
	Create(product *Product) error
	FindAll() ([]Product, error)
	FindByID(id string) (*Product, error)
	Update(product *Product) error
	Delete(id string) error
	Search(keyword string, categoryID string) ([]Product, error)
	FindBySupplierID(supplierID string) ([]Product, error)
}

type ProductUsecase interface {
	Create(product *Product) error
	FindAll() ([]Product, error)
	FindByID(id string) (*Product, error)
	Update(id string, product *Product) error
	Delete(id string) error
	Search(keyword string, categoryID string) ([]Product, error)
	FindBySupplierID(supplierID string) ([]Product, error)
	CreateBySupplier(supplierID string, product *Product) error
	UpdateBySupplier(supplierID string, productID string, product *Product) error
	DeleteBySupplier(supplierID string, productID string) error
}
