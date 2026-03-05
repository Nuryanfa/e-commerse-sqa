package repository

import (
	"log"

	"github.com/nuryanfa/e-commerse-sqa/internal/domain"
	"gorm.io/gorm"
)

type DisputeRepository interface {
	CreateDispute(dispute *domain.Dispute) error
	GetDisputeByID(id string) (*domain.Dispute, error)
	GetDisputeByOrderID(orderID string) (*domain.Dispute, error)
	GetDisputesByRole(role string, userID string) ([]domain.Dispute, error)
	UpdateDisputeStatus(id string, status string, adminNote string) error
	AddMessage(msg *domain.DisputeMessage) error
	GetMessagesByDisputeID(disputeID string) ([]domain.DisputeMessage, error)
}

type disputeRepository struct {
	db *gorm.DB
}

func NewDisputeRepository(db *gorm.DB) DisputeRepository {
	return &disputeRepository{db}
}

func (r *disputeRepository) CreateDispute(dispute *domain.Dispute) error {
	return r.db.Create(dispute).Error
}

func (r *disputeRepository) GetDisputeByID(id string) (*domain.Dispute, error) {
	var dispute domain.Dispute
	err := r.db.Preload("Order").Preload("Buyer").First(&dispute, "id_dispute = ?", id).Error
	if err != nil {
		return nil, err
	}
	return &dispute, nil
}

func (r *disputeRepository) GetDisputeByOrderID(orderID string) (*domain.Dispute, error) {
	var dispute domain.Dispute
	err := r.db.Preload("Order").Preload("Buyer").First(&dispute, "id_order = ?", orderID).Error
	if err != nil {
		return nil, err
	}
	return &dispute, nil
}

func (r *disputeRepository) GetDisputesByRole(role string, userID string) ([]domain.Dispute, error) {
	var disputes []domain.Dispute
	query := r.db.Preload("Order").Preload("Order.OrderItems").Preload("Order.OrderItems.Product").Preload("Buyer")

	log.Printf("[DEBUG-DISPUTE-REPO] Role: %s, UserID: %s", role, userID)

	switch role {
	case "pembeli":
		query = query.Where("id_buyer = ?", userID)
	case "supplier":
		// Mencari Sengketa (Dispute) di mana Order bersangkutan memuat produk milik Supplier ini
		query = query.Joins("JOIN orders ON disputes.id_order = orders.id_order").
			Joins("JOIN order_items ON orders.id_order = order_items.id_order").
			Joins("JOIN products ON order_items.id_product = products.id_product").
			Where("products.supplier_id = ?", userID).Distinct("disputes.id_dispute")
	case "admin":
		// Admin melihat seluruh komplain masuk
	default:
		return nil, gorm.ErrRecordNotFound
	}

	err := query.Order("created_at desc").Find(&disputes).Error
	return disputes, err
}

func (r *disputeRepository) UpdateDisputeStatus(id string, status string, adminNote string) error {
	updates := map[string]interface{}{"status": status}
	if adminNote != "" {
		updates["admin_note"] = adminNote
	}
	return r.db.Model(&domain.Dispute{}).Where("id_dispute = ?", id).Updates(updates).Error
}

func (r *disputeRepository) AddMessage(msg *domain.DisputeMessage) error {
	return r.db.Create(msg).Error
}

func (r *disputeRepository) GetMessagesByDisputeID(disputeID string) ([]domain.DisputeMessage, error) {
	var messages []domain.DisputeMessage
	err := r.db.Preload("Sender").Where("id_dispute = ?", disputeID).Order("created_at asc").Find(&messages).Error
	return messages, err
}
