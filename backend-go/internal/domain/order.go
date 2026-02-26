package domain

import "time"

type Order struct {
	ID          string      `json:"id_order" db:"id_order"`
	UserID      string      `json:"id_user" db:"id_user" binding:"required"`
	TotalAmount float64     `json:"total_amount" db:"total_amount"`
	Status      string      `json:"status" db:"status"` // PENDING, PAID, CANCELLED
	Items       []OrderItem `json:"items" gorm:"foreignKey:OrderID"`
	CreatedAt   time.Time   `json:"created_at" db:"created_at"`
	UpdatedAt   time.Time   `json:"updated_at" db:"updated_at"`
}

type OrderItem struct {
	ID              string    `json:"id_order_item" db:"id_order_item"`
	OrderID         string    `json:"id_order" db:"id_order" binding:"required"`
	ProductID       string    `json:"id_product" db:"id_product" binding:"required"`
	Product         *Product  `json:"product,omitempty" gorm:"foreignKey:ProductID"` // Belongs To Product
	Quantity        int       `json:"quantity" db:"quantity" binding:"required,gt=0"`
	PriceAtPurchase float64   `json:"price_at_purchase" db:"price_at_purchase" binding:"required,gt=0"`
	CreatedAt       time.Time `json:"created_at" db:"created_at"`
	UpdatedAt       time.Time `json:"updated_at" db:"updated_at"`
}

type OrderRepository interface {
	CheckoutTransaction(userID string, cartItems []CartItem) (*Order, error)
	FindByUserID(userID string) ([]Order, error)
	FindByID(orderID string) (*Order, error)
	UpdateStatus(orderID string, status string) error
}

type OrderUsecase interface {
	Checkout(userID string) (*Order, error)
	GetMyOrders(userID string) ([]Order, error)
	GetOrderDetail(userID string, orderID string) (*Order, error)
	PayOrder(orderID string) error // Simulasi webhook/pembayaran
}
