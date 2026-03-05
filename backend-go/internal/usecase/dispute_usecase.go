package usecase

import (
	"errors"
	"time"

	"github.com/google/uuid"
	"github.com/nuryanfa/e-commerse-sqa/internal/domain"
	"github.com/nuryanfa/e-commerse-sqa/internal/repository"
)

type DisputeUseCase interface {
	OpenDispute(orderID, buyerID, reason, imageURL string) (*domain.Dispute, error)
	GetDisputes(role, userID string) ([]domain.Dispute, error)
	GetDisputeDetail(disputeID string) (*domain.Dispute, []domain.DisputeMessage, error)
	AddReply(disputeID, senderID, message string) (*domain.DisputeMessage, error)
	ResolveDispute(disputeID, adminID, decision, adminNote string) error
}

type disputeUseCase struct {
	disputeRepo repository.DisputeRepository
	orderRepo   domain.OrderRepository
}

func NewDisputeUseCase(dr repository.DisputeRepository, or domain.OrderRepository) DisputeUseCase {
	return &disputeUseCase{
		disputeRepo: dr,
		orderRepo:   or,
	}
}

func (u *disputeUseCase) OpenDispute(orderID, buyerID, reason, imageURL string) (*domain.Dispute, error) {
	// 1. Validasi Order
	order, err := u.orderRepo.FindByID(orderID)
	if err != nil {
		return nil, errors.New("pesanan tidak ditemukan")
	}

	if order.UserID != buyerID {
		return nil, errors.New("unauthorized: bukan pesanan anda")
	}

	// Sengketa hanya bisa dibuka jika pesanan sudah dikirim atau diterima (belum direview mutlak)
	if order.Status != "SHIPPED" && order.Status != "DELIVERED" {
		return nil, errors.New("sengketa hanya dapat diajukan pada pesanan yang sedang/telah dikirim")
	}

	// 2. Cek apakah sudah ada sengketa
	existing, _ := u.disputeRepo.GetDisputeByOrderID(orderID)
	if existing != nil {
		return nil, errors.New("pesanan ini sudah dalam masa sengketa aktif")
	}

	// 3. Buat Dispute
	dispute := &domain.Dispute{
		ID:        uuid.New().String(),
		OrderID:   orderID,
		BuyerID:   buyerID,
		Reason:    reason,
		Status:    "OPEN",
		ImageURL:  imageURL,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	err = u.disputeRepo.CreateDispute(dispute)
	if err != nil {
		return nil, err
	}

	// Mengunci status pesanan menjadi DISPUTED (opsional, tapi disarankan)
	_ = u.orderRepo.UpdateStatus(orderID, "DISPUTED")

	return dispute, nil
}

func (u *disputeUseCase) GetDisputes(role, userID string) ([]domain.Dispute, error) {
	return u.disputeRepo.GetDisputesByRole(role, userID)
}

func (u *disputeUseCase) GetDisputeDetail(disputeID string) (*domain.Dispute, []domain.DisputeMessage, error) {
	dispute, err := u.disputeRepo.GetDisputeByID(disputeID)
	if err != nil {
		return nil, nil, errors.New("sengketa tidak ditemukan")
	}

	messages, err := u.disputeRepo.GetMessagesByDisputeID(disputeID)
	return dispute, messages, err
}

func (u *disputeUseCase) AddReply(disputeID, senderID, message string) (*domain.DisputeMessage, error) {
	// Pastikan sengketa eksis dan OPEN
	dispute, err := u.disputeRepo.GetDisputeByID(disputeID)
	if err != nil {
		return nil, errors.New("sengketa tidak ditemukan")
	}

	if dispute.Status != "OPEN" {
		return nil, errors.New("tidak dapat mengirim pesan, sengketa ini sudah ditutup")
	}

	msg := &domain.DisputeMessage{
		ID:        uuid.New().String(),
		DisputeID: disputeID,
		SenderID:  senderID,
		Message:   message,
		CreatedAt: time.Now(),
	}

	err = u.disputeRepo.AddMessage(msg)
	if err != nil {
		return nil, err
	}

	// Update waktu Dispute
	_ = u.disputeRepo.UpdateDisputeStatus(disputeID, "OPEN", "") // hanya trigger updated_at di DB gorm

	return msg, nil
}

func (u *disputeUseCase) ResolveDispute(disputeID, adminID, decision, adminNote string) error {
	// Decision harus valid: REFUNDED, REJECTED, atau RESOLVED_PARTIAL
	if decision != "REFUNDED" && decision != "REJECTED" && decision != "RESOLVED_PARTIAL" {
		return errors.New("status putusan tidak valid")
	}

	dispute, err := u.disputeRepo.GetDisputeByID(disputeID)
	if err != nil {
		return errors.New("sengketa tidak ditemukan")
	}

	if dispute.Status != "OPEN" {
		return errors.New("sengketa sudah diputuskan sebelumnya")
	}

	// 1. Update Status Sengketa
	err = u.disputeRepo.UpdateDisputeStatus(disputeID, decision, adminNote)
	if err != nil {
		return err
	}

	// 2. Tindakan Lanjutan pada Order
	if decision == "REFUNDED" {
		_ = u.orderRepo.UpdateStatus(dispute.OrderID, "CANCELLED") // Barang batal, uang kembali
	} else if decision == "REJECTED" {
		_ = u.orderRepo.UpdateStatus(dispute.OrderID, "DELIVERED") // Komplain ditolak admin, transaksi dianggap sah selesai
	}

	return nil
}
