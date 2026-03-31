package http

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/nuryanfa/e-commerse-sqa/internal/middleware"
	"github.com/nuryanfa/e-commerse-sqa/internal/usecase"
	"github.com/nuryanfa/e-commerse-sqa/pkg/response"
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

	wishlist, err := h.wishlistUsecase.GetMyWishlist(uid)
	if err != nil {
		response.Error(c, response.ErrInternal("Gagal memuat wishlist"))
		return
	}

	response.Success(c, http.StatusOK, "Wishlist berhasil dimuat", wishlist)
}

func (h *WishlistHandler) ToggleWishlist(c *gin.Context) {
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
		ProductID string `json:"id_product" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, response.ErrBadRequest("Invalid request body"))
		return
	}

	added, err := h.wishlistUsecase.ToggleWishlist(uid, req.ProductID)
	if err != nil {
		response.Error(c, response.ErrInternal(err.Error()))
		return
	}

	msg := "Berhasil dihapus dari wishlist"
	if added {
		msg = "Berhasil ditambahkan ke wishlist"
	}

	response.Success(c, http.StatusOK, msg, map[string]bool{"added": added})
}

func (h *WishlistHandler) CheckWishlist(c *gin.Context) {
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
	productID := c.Param("id")

	existsStatus, err := h.wishlistUsecase.CheckIsWishlisted(uid, productID)
	if err != nil {
		response.Error(c, response.ErrInternal(err.Error()))
		return
	}

	response.Success(c, http.StatusOK, "Status wishlist dicek", map[string]bool{"is_wishlisted": existsStatus})
}
