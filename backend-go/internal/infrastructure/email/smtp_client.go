package email

import (
	"log"
	"time"

	"github.com/nuryanfa/e-commerse-sqa/internal/domain"
)

type mockEmailService struct{}

func NewMockEmailService() domain.EmailService {
	return &mockEmailService{}
}

func (s *mockEmailService) SendInvoiceEmail(customerEmail string, order *domain.Order) error {
	// Mensimulasikan jeda jaringan pengiriman SMTP yang riil (misal 2 detik)
	time.Sleep(2 * time.Second)
	
	log.Printf("\n=======================================================\n")
	log.Printf("📧 [MOCK SMTP SERVER] Email Berhasil Terkirim Secara Asinkron!\n")
	log.Printf("   Tujuan : %s\n", customerEmail)
	log.Printf("   Subjek : Pembayaran Telah Diterima (Order #%s...)\n", order.ID[:8])
	log.Printf("   Pesan  : Terima kasih, uang sejumlah Rp%.0f telah masuk ke sistem kami.\n", order.TotalAmount)
	log.Printf("=======================================================\n")
	
	return nil
}

func (s *mockEmailService) SendReviewReminderEmail(customerEmail string, order *domain.Order) error {
	time.Sleep(1 * time.Second)
	log.Printf("📧 [EMAIL REMINDER] Ke: %s | Sayur sudah diletakkan di depan rumah. Beri ulasan segera!\n", customerEmail)
	return nil
}
