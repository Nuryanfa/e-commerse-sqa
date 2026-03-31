package http

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/nuryanfa/e-commerse-sqa/internal/domain"
	"github.com/nuryanfa/e-commerse-sqa/pkg/response"
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
	uidVal, exists := c.Get("user_id")
	if !exists {
		response.Error(c, response.ErrUnauthorized("Sesi pengguna tidak valid"))
		return
	}
	uid, ok := uidVal.(string)
	if !ok {
		response.Error(c, response.ErrUnauthorized("Sesi pengguna tidak valid"))
		return
	}

	var req struct {
		VoucherCode string `json:"voucher_code"`
	}
	// Bind JSON dapat gagal jika tidak ada body, yang mana tidak masalah (voucherCode opsional)
	_ = c.ShouldBindJSON(&req)

	order, err := h.orderUsecase.Checkout(uid, req.VoucherCode)
	if err != nil {
		response.Error(c, response.ErrConflict(err.Error()))
		return
	}

	response.Success(c, http.StatusCreated, "Checkout berhasil. Silakan lakukan pembayaran.", order)
}

func (h *OrderHandler) InstantCheckout(c *gin.Context) {
	uidVal, exists := c.Get("user_id")
	if !exists {
		response.Error(c, response.ErrUnauthorized("Sesi pengguna tidak valid"))
		return
	}
	uid, ok := uidVal.(string)
	if !ok {
		response.Error(c, response.ErrUnauthorized("Sesi pengguna tidak valid"))
		return
	}

	var req struct {
		ProductID   string  `json:"product_id" binding:"required"`
		VariantID   *string `json:"id_variant,omitempty"`
		Quantity    int     `json:"quantity" binding:"required,min=1"`
		VoucherCode string  `json:"voucher_code"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, response.ErrBadRequest("Validasi input gagal: pastikan format produk dan kuantitas valid"))
		return
	}

	order, err := h.orderUsecase.InstantCheckout(uid, req.ProductID, req.VariantID, req.Quantity, req.VoucherCode)
	if err != nil {
		response.Error(c, response.ErrConflict(err.Error()))
		return
	}

	response.Success(c, http.StatusCreated, "Beli Langsung berhasil. Silakan bayar pesanan Anda.", order)
}

func (h *OrderHandler) GetMyOrders(c *gin.Context) {
	uidVal, exists := c.Get("user_id")
	if !exists {
		response.Error(c, response.ErrUnauthorized("Sesi pengguna tidak valid"))
		return
	}
	uid, ok := uidVal.(string)
	if !ok {
		response.Error(c, response.ErrUnauthorized("Sesi pengguna tidak valid"))
		return
	}
	
	orders, err := h.orderUsecase.GetMyOrders(uid)
	if err != nil {
		response.Error(c, response.ErrInternal(err.Error()))
		return
	}

	response.Success(c, http.StatusOK, "Berhasil memuat pesanan", orders)
}

func (h *OrderHandler) GetOrderDetail(c *gin.Context) {
	uidVal, exists := c.Get("user_id")
	if !exists {
		response.Error(c, response.ErrUnauthorized("Sesi pengguna tidak valid"))
		return
	}
	uid, ok := uidVal.(string)
	if !ok {
		response.Error(c, response.ErrUnauthorized("Sesi pengguna tidak valid"))
		return
	}
	orderID := c.Param("id")

	order, err := h.orderUsecase.GetOrderDetail(uid, orderID)
	if err != nil {
		response.Error(c, response.ErrNotFound(err.Error()))
		return
	}

	response.Success(c, http.StatusOK, "Berhasil memuat detail pesanan", order)
}

func (h *OrderHandler) SimulatePayment(c *gin.Context) {
	orderID := c.Param("id")

	if err := h.orderUsecase.PayOrder(orderID); err != nil {
		response.Error(c, response.ErrBadRequest(err.Error()))
		return
	}

	response.Success(c, http.StatusOK, "Pembayaran disimulasikan sukses! Status sekarang PAID.", nil)
}
