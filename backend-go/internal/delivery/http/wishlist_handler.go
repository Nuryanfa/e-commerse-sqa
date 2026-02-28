package http

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/nuryanfa/e-commerse-sqa/internal/middleware"
	"github.com/nuryanfa/e-commerse-sqa/internal/usecase"
)

type WishlistHandler struct {
	wishlistUsecase usecase.WishlistUsecase
}

func NewWishlistHandler(router *gin.RouterGroup, wu usecase.WishlistUsecase) {
	handler := &WishlistHandler{wishlistUsecase: wu}
	
	wishlistGroup := router.Group("/wishlist")
	wishlistGroup.Use(middleware.AuthMiddleware())
	{
		wishlistGroup.GET("", handler.GetMyWishlist)
		wishlistGroup.POST("/toggle", handler.ToggleWishlist)
		wishlistGroup.GET("/check/:id", handler.CheckWishlist)
	}
}

func (h *WishlistHandler) GetMyWishlist(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}
	uid := userID.(string)

	wishlist, err := h.wishlistUsecase.GetMyWishlist(uid)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal memuat wishlist"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Wishlist berhasil dimuat",
		"data":    wishlist,
	})
}

func (h *WishlistHandler) ToggleWishlist(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}
	uid := userID.(string)

	var req struct {
		ProductID string `json:"id_product" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}

	added, err := h.wishlistUsecase.ToggleWishlist(uid, req.ProductID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	msg := "Berhasil dihapus dari wishlist"
	if added {
		msg = "Berhasil ditambahkan ke wishlist"
	}

	c.JSON(http.StatusOK, gin.H{
		"message": msg,
		"added":   added,
	})
}

func (h *WishlistHandler) CheckWishlist(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}
	uid := userID.(string)
	productID := c.Param("id")

	existsStatus, err := h.wishlistUsecase.CheckIsWishlisted(uid, productID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message":       "Status wishlist dicek",
		"is_wishlisted": existsStatus,
	})
}
