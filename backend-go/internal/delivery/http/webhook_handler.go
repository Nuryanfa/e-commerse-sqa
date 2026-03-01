package http

import (
	"encoding/json"
	"log"
	"net/http"

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

// MidtransNotification Endpoint yang dipanggil midtrans otomatis ketika status bayar berubah
func (h *WebhookHandler) MidtransNotification(c *gin.Context) {
	var payload map[string]interface{}
	
	// Dekode body request JSON dari webhook midtrans
	if err := json.NewDecoder(c.Request.Body).Decode(&payload); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Payload webhook dari Midtrans tidak valid"})
		return
	}

	log.Printf("[WEBHOOK] Notifikasi Midtrans diterima untuk OrderID: %v", payload["order_id"])

	// Masukkan logika bisnis ke Order Usecase
	err := h.orderUsecase.ProcessPaymentWebhook(payload)
	if err != nil {
		log.Printf("[WEBHOOK ERROR] Gagal set Webhook status: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal update status pesanan"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"status": "sukses", "message": "notifikasi terekam"})
}
