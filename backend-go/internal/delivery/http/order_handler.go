package http

import (
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/nuryanfa/e-commerse-sqa/internal/domain"
	"github.com/nuryanfa/e-commerse-sqa/pkg/response"
)

// classifyCheckoutError memetakan error dari use case ke HTTP response yang tepat.
// [DEF-CHK-001 FIX] Keranjang kosong & stok insufisien adalah input error (400),
// bukan resource conflict (409). Midtrans error adalah 502 Bad Gateway.
func classifyCheckoutError(err error) *response.AppError {
	msg := err.Error()
	switch {
	case strings.Contains(msg, "keranjang belanja anda kosong"):
		return response.ErrBadRequest(msg)
	case strings.Contains(msg, "stok tidak mencukupi"), strings.Contains(msg, "Stok"), strings.Contains(msg, "stok"):
		return response.ErrBadRequest(msg)
	case strings.Contains(msg, "midtrans"), strings.Contains(msg, "Midtrans"), strings.Contains(msg, "snap"), strings.Contains(msg, "payment gateway"):
		return &response.AppError{Code: http.StatusBadGateway, Message: "Layanan pembayaran tidak tersedia", Detail: msg}
	default:
		return response.ErrConflict(msg)
	}
}

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
		orderGroup.PATCH("/:id/cancel", handler.CancelOrder)
	}
}

// Checkout godoc
// @Summary Checkout Keranjang
// @Description Mengubah seluruh isi keranjang menjadi sebuah Pesanan (Order).
// @Tags Pesanan
// @Security BearerAuth
// @Accept json
// @Produce json
// @Param checkout body object false "Voucher Code (opsional)"
// @Success 201 {object} response.JSONResponse "Order Berhasil Dibuat"
// @Router /orders/checkout [post]
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
		// [DEF-CHK-001 FIX] Gunakan classifyCheckoutError untuk HTTP code yang tepat
		response.Error(c, classifyCheckoutError(err))
		return
	}

	response.Success(c, http.StatusCreated, "Checkout berhasil. Silakan lakukan pembayaran.", order)
}

// InstantCheckout godoc
// @Summary Beli Langsung
// @Description Melakukan pembelian cepat untuk 1 produk spesifik tanpa lewat keranjang.
// @Tags Pesanan
// @Security BearerAuth
// @Accept json
// @Produce json
// @Param checkout body object true "Data Beli Langsung (product_id, id_variant, quantity, voucher_code)"
// @Success 201 {object} response.JSONResponse "Order Berhasil Dibuat"
// @Router /orders/instant-checkout [post]
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
		ProductID string  `json:"product_id" binding:"required"`
		VariantID *string `json:"id_variant,omitempty"`
		// [SQA] Boundary Value Analysis
		Quantity    int    `json:"quantity" binding:"required,min=1,max=100"`
		VoucherCode string `json:"voucher_code"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, response.ErrBadRequest("Validasi input gagal: pastikan format produk dan kuantitas valid"))
		return
	}

	order, err := h.orderUsecase.InstantCheckout(uid, req.ProductID, req.VariantID, req.Quantity, req.VoucherCode)
	if err != nil {
		// [DEF-CHK-001 FIX] Sama dengan Checkout — discriminate error types
		response.Error(c, classifyCheckoutError(err))
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

func (h *OrderHandler) CancelOrder(c *gin.Context) {
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

	err := h.orderUsecase.CancelOrder(uid, orderID)
	if err != nil {
		response.Error(c, response.ErrBadRequest(err.Error()))
		return
	}

	response.Success(c, http.StatusOK, "Berhasil membatalkan pesanan", nil)
}
