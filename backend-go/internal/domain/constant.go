package domain

const (
	// User Roles
	RoleBuyer    = "pembeli"
	RoleSupplier = "supplier"
	RoleAdmin    = "admin"
	RoleCourier  = "courier"

	// Order Statuses
	OrderStatusShipped       = "SHIPPED"
	OrderStatusDelivered     = "DELIVERED"
	OrderStatusDisputed      = "DISPUTED"
	OrderStatusCancelled     = "CANCELLED"
	OrderStatusPaid          = "PAID" // Mentioned in handler
	OrderStatusProcessed     = "PROCESSED"
	OrderStatusRefundPending = "REFUND_PENDING"
	OrderStatusRefunded      = "REFUNDED"

	// Dispute Statuses
	DisputeStatusOpen              = "OPEN"
	DisputeStatusApprovedForReturn = "APPROVED_FOR_RETURN"
	DisputeStatusReturning         = "RETURNING"
	DisputeStatusReturned          = "RETURNED"
	DisputeStatusRefunded          = "REFUNDED"
	DisputeStatusRejected          = "REJECTED"
	DisputeStatusResolvedPartial   = "RESOLVED_PARTIAL"
)
