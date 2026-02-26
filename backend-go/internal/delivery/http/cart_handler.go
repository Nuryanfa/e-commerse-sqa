package http

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/nuryanfa/e-commerse-sqa/internal/domain"
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
	// Ambil userID dari payload set oleh Middleware JWT
	userID, _ := c.Get("user_id")

	var req domain.CartItem
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := h.cartUsecase.AddToCart(userID.(string), &req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Barang berhasil ditambahkan ke keranjang"})
}

func (h *CartHandler) ViewCart(c *gin.Context) {
	userID, _ := c.Get("user_id")

	items, err := h.cartUsecase.ViewCart(userID.(string))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal merender keranjang", "detail": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": items})
}

func (h *CartHandler) UpdateQuantity(c *gin.Context) {
	userID, _ := c.Get("user_id")
	itemID := c.Param("id")

	var req struct {
		Quantity int `json:"quantity" binding:"required,gt=0"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Kuantitas tidak valid"})
		return
	}

	if err := h.cartUsecase.UpdateQuantity(userID.(string), itemID, req.Quantity); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Kuantitas diperbarui"})
}

func (h *CartHandler) RemoveFromCart(c *gin.Context) {
	userID, _ := c.Get("user_id")
	itemID := c.Param("id")

	if err := h.cartUsecase.RemoveFromCart(userID.(string), itemID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Barang dihapus dari keranjang"})
}
