package domain

import "time"

type CartItem struct {
	ID        string    `json:"id_cart_item" db:"id_cart_item"`
	UserID    string    `json:"id_user" db:"id_user" binding:"required"`
	ProductID string    `json:"id_product" db:"id_product" binding:"required"`
	Product   *Product  `json:"product,omitempty" gorm:"foreignKey:ProductID"` // Belongs To Product
	Quantity  int       `json:"quantity" db:"quantity" binding:"required,gt=0"`
	CreatedAt time.Time `json:"created_at" db:"created_at"`
	UpdatedAt time.Time `json:"updated_at" db:"updated_at"`
}

type CartRepository interface {
	UpsertItem(item *CartItem) error // Create or Update quantity if exists
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
