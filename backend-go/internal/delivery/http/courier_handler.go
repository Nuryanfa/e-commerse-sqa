package http

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/nuryanfa/e-commerse-sqa/internal/domain"
)

type CourierHandler struct {
	orderUsecase domain.OrderUsecase
}

// NewCourierHandler registers courier-only routes
func NewCourierHandler(courierRouter *gin.RouterGroup, ouc domain.OrderUsecase) {
	handler := &CourierHandler{
		orderUsecase: ouc,
	}

	courierRouter.GET("/available", handler.AvailableOrders)
	courierRouter.POST("/orders/:id/ship", handler.ShipOrder)
	courierRouter.PATCH("/orders/:id/deliver", handler.DeliverOrder)
	courierRouter.GET("/my-orders", handler.MyOrders)
}

// AvailableOrders — daftar pesanan PAID siap diambil kurir
func (h *CourierHandler) AvailableOrders(c *gin.Context) {
	orders, err := h.orderUsecase.GetPaidOrders()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": orders, "total": len(orders)})
}

// ShipOrder — kurir mengambil pesanan dan set status SHIPPED
func (h *CourierHandler) ShipOrder(c *gin.Context) {
	courierID := c.GetString("user_id")
	orderID := c.Param("id")

	if err := h.orderUsecase.AssignAndShip(orderID, courierID); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Pesanan berhasil diambil dan sedang dikirim"})
}

// DeliverOrder — kurir menandai pesanan sebagai DELIVERED
func (h *CourierHandler) DeliverOrder(c *gin.Context) {
	courierID := c.GetString("user_id")
	orderID := c.Param("id")

	if err := h.orderUsecase.MarkDelivered(orderID, courierID); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Pesanan berhasil ditandai sebagai terkirim"})
}

// MyOrders — daftar pesanan yang sedang saya kirim
func (h *CourierHandler) MyOrders(c *gin.Context) {
	courierID := c.GetString("user_id")
	orders, err := h.orderUsecase.GetCourierOrders(courierID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": orders, "total": len(orders)})
}
