package domain

import "time"

type Order struct {
	ID          string      `json:"id_order" gorm:"column:id_order;primaryKey"`
	UserID      string      `json:"id_user" gorm:"column:id_user" binding:"required"`
	TotalAmount float64     `json:"total_amount" gorm:"column:total_amount"`
	Status         string      `json:"status" gorm:"column:status"`
	CourierID      *string     `json:"courier_id" gorm:"column:courier_id"`
	DiscountAmount float64     `json:"discount_amount" gorm:"column:discount_amount;default:0"`
	VoucherCode    *string     `json:"voucher_code" gorm:"column:voucher_code"`
	PaymentToken   *string     `json:"payment_token" gorm:"column:payment_token"`
	PaymentURL     *string     `json:"payment_url" gorm:"column:payment_url"`
	ShippedAt      *time.Time  `json:"shipped_at" gorm:"column:shipped_at"`
	DeliveredAt    *time.Time  `json:"delivered_at" gorm:"column:delivered_at"`
	Items       []OrderItem `json:"items" gorm:"foreignKey:OrderID;references:ID"`
	CreatedAt   time.Time   `json:"created_at" gorm:"column:created_at"`
	UpdatedAt   time.Time   `json:"updated_at" gorm:"column:updated_at"`
}

type OrderItem struct {
	ID              string    `json:"id_order_item" gorm:"column:id_order_item;primaryKey"`
	OrderID         string    `json:"id_order" gorm:"column:id_order" binding:"required"`
	ProductID       string    `json:"id_product" gorm:"column:id_product" binding:"required"`
	Product         *Product  `json:"product,omitempty" gorm:"foreignKey:ProductID;references:ID"`
	Quantity        int       `json:"quantity" gorm:"column:quantity" binding:"required,gt=0"`
	PriceAtPurchase float64   `json:"price_at_purchase" gorm:"column:price_at_purchase" binding:"required,gt=0"`
	CreatedAt       time.Time `json:"created_at" gorm:"column:created_at"`
	UpdatedAt       time.Time `json:"updated_at" gorm:"column:updated_at"`
}

type OrderRepository interface {
	CheckoutTransaction(userID string, cartItems []CartItem, voucherCode string) (*Order, error)
	FindByUserID(userID string) ([]Order, error)
	FindByID(orderID string) (*Order, error)
	UpdateStatus(orderID string, status string) error
	FindPaidOrders() ([]Order, error)
	FindProcessedOrders() ([]Order, error)
	AssignCourier(orderID string, courierID string) error
	FindByCourierID(courierID string) ([]Order, error)
	FindByProductSupplier(supplierID string) ([]Order, error)
	// Cronjob Methods
	CancelExpiredOrders(cutoffTime time.Time) (int, error)
}

type OrderUsecase interface {
	Checkout(userID string, voucherCode string) (*Order, error)
	GetMyOrders(userID string) ([]Order, error)
	GetOrderDetail(userID string, orderID string) (*Order, error)
	PayOrder(orderID string) error
	// Courier methods
	GetPaidOrders() ([]Order, error)
	AssignAndShip(orderID string, courierID string) error
	MarkDelivered(orderID string, courierID string) error
	GetCourierOrders(courierID string) ([]Order, error)
	// Supplier methods
	GetSupplierOrders(supplierID string) ([]Order, error)
	ProcessSupplierOrder(supplierID string, orderID string) error
	// Webhook method
	ProcessPaymentWebhook(payload map[string]interface{}) error
	// Cronjob Task
	ProcessCancelExpiredJobs() (int, error)
}
