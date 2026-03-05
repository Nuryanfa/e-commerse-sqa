package domain

import "time"

type CartItem struct {
	ID        string    `json:"id_cart_item" gorm:"column:id_cart_item;primaryKey"`
	UserID    string    `json:"id_user" gorm:"column:id_user"` // Di-set server-side dari JWT, bukan dari body
	ProductID string          `json:"id_product" gorm:"column:id_product" binding:"required"`
	Product   *Product        `json:"product,omitempty" gorm:"foreignKey:ProductID;references:ID"`
	VariantID *string         `json:"id_variant,omitempty" gorm:"column:id_variant"`
	Variant   *ProductVariant `json:"variant,omitempty" gorm:"foreignKey:VariantID;references:ID"`
	Quantity  int             `json:"quantity" gorm:"column:quantity" binding:"required,gt=0"`
	CreatedAt time.Time `json:"created_at" gorm:"column:created_at"`
	UpdatedAt time.Time `json:"updated_at" gorm:"column:updated_at"`
}

type CartRepository interface {
	UpsertItem(item *CartItem) error // Create or Update quantity if exists
	UpdateItem(item *CartItem) error // Override/Update cart item exactly
	FindByUserID(userID string) ([]CartItem, error)
	DeleteByUserID(userID string) error // Clear cart after checkout
	RemoveItem(itemID string, userID string) error
	FindByID(itemID string) (*CartItem, error)
}

type CartUsecase interface {
	AddToCart(userID string, req *CartItem) error // req contains ProductID & Quantity
	ViewCart(userID string) ([]CartItem, error)
	UpdateQuantity(userID string, itemID string, quantity int) error
	RemoveFromCart(userID string, itemID string) error
}
