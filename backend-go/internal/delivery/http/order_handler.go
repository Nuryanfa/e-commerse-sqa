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

	order, err := h.orderUsecase.Checkout(uid)
	if err != nil {
		c.JSON(http.StatusConflict, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "Checkout berhasil. Silakan lakukan pembayaran.",
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
