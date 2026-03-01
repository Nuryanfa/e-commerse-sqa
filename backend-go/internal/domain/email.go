package domain

type EmailService interface {
	SendInvoiceEmail(customerEmail string, order *Order) error
	SendReviewReminderEmail(customerEmail string, order *Order) error
}
