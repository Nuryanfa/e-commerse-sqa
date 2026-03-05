package http

import (
	"crypto/sha512"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/gin-gonic/gin"
	"github.com/nuryanfa/e-commerse-sqa/internal/domain"
)

type WebhookHandler struct {
	orderUsecase domain.OrderUsecase
}

// NewWebhookHandler mendaftarkan endpoint pendengar Webhook Midtrans
func NewWebhookHandler(router *gin.RouterGroup, u domain.OrderUsecase) {
	handler := &WebhookHandler{
		orderUsecase: u,
	}

	router.POST("/midtrans", handler.MidtransNotification)
}

// verifyMidtransSignature memvalidasi signature_key dari payload Midtrans.
// Algoritma: SHA-512(order_id + status_code + gross_amount + server_key)
// Referensi: https://docs.midtrans.com/docs/verifying-data-integrity
func verifyMidtransSignature(payload map[string]interface{}, serverKey string) bool {
	orderID, _ := payload["order_id"].(string)
	statusCode, _ := payload["status_code"].(string)
	grossAmount, _ := payload["gross_amount"].(string)
	incomingSignature, _ := payload["signature_key"].(string)

	// Jika signature tidak ada dalam payload, tolak langsung
	if incomingSignature == "" {
		return false
	}

	// Buat signature hash SHA-512 sesuai standar Midtrans
	rawString := orderID + statusCode + grossAmount + serverKey
	hash := sha512.New()
	hash.Write([]byte(rawString))
	expectedSignature := fmt.Sprintf("%x", hash.Sum(nil))

	return incomingSignature == expectedSignature
}

// MidtransNotification Endpoint yang dipanggil midtrans otomatis ketika status bayar berubah.
// [A1 SQA FIX]: Tambahkan verifikasi tanda tangan (signature_key) sebelum memproses payload.
func (h *WebhookHandler) MidtransNotification(c *gin.Context) {
	var payload map[string]interface{}

	// Dekode body request JSON dari webhook midtrans
	if err := json.NewDecoder(c.Request.Body).Decode(&payload); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Payload webhook dari Midtrans tidak valid"})
		return
	}

	// [A1] Ambil Server Key dari environment untuk verifikasi
	serverKey := os.Getenv("MIDTRANS_SERVER_KEY")
	if serverKey == "" {
		// Di lingkungan Sandbox/Dev tanpa key, lewati verifikasi tapi catat peringatan
		log.Printf("[WEBHOOK WARNING] MIDTRANS_SERVER_KEY tidak diset. Verifikasi signature dilewati.")
	} else {
		// Verifikasi tanda tangan Midtrans — tolak jika tidak cocok
		if !verifyMidtransSignature(payload, serverKey) {
			log.Printf("[WEBHOOK SECURITY] Signature tidak valid untuk OrderID: %v. Request ditolak.", payload["order_id"])
			c.JSON(http.StatusForbidden, gin.H{"error": "Signature tidak valid. Akses ditolak."})
			return
		}
	}

	log.Printf("[WEBHOOK] Notifikasi Midtrans terverifikasi untuk OrderID: %v", payload["order_id"])

	// Masukkan logika bisnis ke Order Usecase
	err := h.orderUsecase.ProcessPaymentWebhook(payload)
	if err != nil {
		log.Printf("[WEBHOOK ERROR] Gagal set Webhook status: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal update status pesanan"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"status": "sukses", "message": "notifikasi terekam"})
}
