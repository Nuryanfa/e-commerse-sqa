package http

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/nuryanfa/e-commerse-sqa/internal/domain"
)

type OrderHandler struct {
	orderUsecase domain.OrderUsecase
}

func NewOrderHandler(r *gin.RouterGroup, uc domain.OrderUsecase) {
	handler := &OrderHandler{
		orderUsecase: uc,
	}

	// Semua routes ini berada di bawah Group dengan AuthMiddleware di main.go
	orderGroup := r.Group("/orders")
	{
		orderGroup.POST("/checkout", handler.Checkout)
		orderGroup.POST("/instant-checkout", handler.InstantCheckout)
		orderGroup.GET("", handler.GetMyOrders)
		orderGroup.GET("/:id", handler.GetOrderDetail)
		orderGroup.POST("/:id/pay", handler.SimulatePayment)
	}
}

func (h *OrderHandler) Checkout(c *gin.Context) {
	// Di-set oleh Auth Middleware
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}
	uid := userID.(string)

	var req struct {
		VoucherCode string `json:"voucher_code"`
	}
	// Bind JSON dapat gagal jika tidak ada body, yang mana tidak masalah (voucherCode opsional)
	_ = c.ShouldBindJSON(&req)

	order, err := h.orderUsecase.Checkout(uid, req.VoucherCode)
	if err != nil {
		c.JSON(http.StatusConflict, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "Checkout berhasil. Silakan lakukan pembayaran.",
		"order":   order,
	})
}

func (h *OrderHandler) InstantCheckout(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}
	uid := userID.(string)

	var req struct {
		ProductID   string  `json:"product_id" binding:"required"`
		VariantID   *string `json:"id_variant,omitempty"`
		Quantity    int     `json:"quantity" binding:"required,min=1"`
		VoucherCode string  `json:"voucher_code"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Validasi input gagal: pastikan format produk dan kuantitas valid"})
		return
	}

	order, err := h.orderUsecase.InstantCheckout(uid, req.ProductID, req.VariantID, req.Quantity, req.VoucherCode)
	if err != nil {
		c.JSON(http.StatusConflict, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "Beli Langsung berhasil. Silakan bayar pesanan Anda.",
		"order":   order,
	})
}

func (h *OrderHandler) GetMyOrders(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}
	uid := userID.(string)
	
	orders, err := h.orderUsecase.GetMyOrders(uid)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": orders})
}

func (h *OrderHandler) GetOrderDetail(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}
	uid := userID.(string)
	orderID := c.Param("id")

	order, err := h.orderUsecase.GetOrderDetail(uid, orderID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": order})
}

func (h *OrderHandler) SimulatePayment(c *gin.Context) {
	orderID := c.Param("id")

	if err := h.orderUsecase.PayOrder(orderID); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Pembayaran disimulasikan sukses! Status sekarang PAID."})
}
