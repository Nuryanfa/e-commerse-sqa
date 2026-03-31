package http

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/nuryanfa/e-commerse-sqa/internal/domain"
	"github.com/nuryanfa/e-commerse-sqa/pkg/response"
)

type CartHandler struct {
	cartUsecase domain.CartUsecase
}

// Router disuntikkan dengan rute privat yang nanti dilindungi middleware `AuthMiddleware`
func NewCartHandler(r *gin.RouterGroup, uc domain.CartUsecase) {
	handler := &CartHandler{
		cartUsecase: uc,
	}

	cartGroup := r.Group("/cart")
	{
		cartGroup.POST("", handler.AddToCart)
		cartGroup.GET("", handler.ViewCart)
		cartGroup.PUT("/:id", handler.UpdateQuantity)
		cartGroup.DELETE("/:id", handler.RemoveFromCart)
	}
}

func (h *CartHandler) AddToCart(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		response.Error(c, response.ErrUnauthorized("Sesi pengguna tidak valid"))
		return
	}
	uid, ok := userID.(string)
	if !ok {
		response.Error(c, response.ErrUnauthorized("Sesi pengguna tidak valid"))
		return
	}

	var req domain.CartItem
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, response.ErrBadRequest(err.Error()))
		return
	}

	if err := h.cartUsecase.AddToCart(uid, &req); err != nil {
		response.Error(c, response.ErrBadRequest(err.Error()))
		return
	}

	response.Success(c, http.StatusOK, "Barang berhasil ditambahkan ke keranjang", nil)
}

func (h *CartHandler) ViewCart(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		response.Error(c, response.ErrUnauthorized("Sesi pengguna tidak valid"))
		return
	}
	uid, ok := userID.(string)
	if !ok {
		response.Error(c, response.ErrUnauthorized("Sesi pengguna tidak valid"))
		return
	}

	items, err := h.cartUsecase.ViewCart(uid)
	if err != nil {
		response.Error(c, response.ErrInternal("Gagal merender keranjang: " + err.Error()))
		return
	}

	response.Success(c, http.StatusOK, "Berhasil memuat keranjang belanja", items)
}

func (h *CartHandler) UpdateQuantity(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		response.Error(c, response.ErrUnauthorized("Sesi pengguna tidak valid"))
		return
	}
	uid, ok := userID.(string)
	if !ok {
		response.Error(c, response.ErrUnauthorized("Sesi pengguna tidak valid"))
		return
	}
	itemID := c.Param("id")

	var req struct {
		Quantity int `json:"quantity" binding:"required,gt=0"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, response.ErrBadRequest("Kuantitas tidak valid"))
		return
	}

	if err := h.cartUsecase.UpdateQuantity(uid, itemID, req.Quantity); err != nil {
		response.Error(c, response.ErrBadRequest(err.Error()))
		return
	}

	response.Success(c, http.StatusOK, "Kuantitas diperbarui", nil)
}

func (h *CartHandler) RemoveFromCart(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		response.Error(c, response.ErrUnauthorized("Sesi pengguna tidak valid"))
		return
	}
	uid, ok := userID.(string)
	if !ok {
		response.Error(c, response.ErrUnauthorized("Sesi pengguna tidak valid"))
		return
	}
	itemID := c.Param("id")

	if err := h.cartUsecase.RemoveFromCart(uid, itemID); err != nil {
		response.Error(c, response.ErrInternal(err.Error()))
		return
	}

	response.Success(c, http.StatusOK, "Barang dihapus dari keranjang", nil)
}
