package http

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/nuryanfa/e-commerse-sqa/internal/domain"
	"github.com/nuryanfa/e-commerse-sqa/internal/middleware"
	"github.com/nuryanfa/e-commerse-sqa/internal/usecase"
	"github.com/nuryanfa/e-commerse-sqa/pkg/response"
)

type ReviewHandler struct {
	reviewUsecase usecase.ReviewUsecase
}

func NewReviewHandler(router *gin.RouterGroup, ru usecase.ReviewUsecase) {
	handler := &ReviewHandler{reviewUsecase: ru}
	
	// Open endpoints
	router.GET("/products/:id/reviews", handler.GetProductReviews)
	
	// Protected endpoints
	protected := router.Group("/products/:id/reviews")
	protected.Use(middleware.AuthMiddleware())
	{
		protected.POST("", handler.AddReview)
	}
}

func (h *ReviewHandler) GetProductReviews(c *gin.Context) {
	productID := c.Param("id")

	reviews, err := h.reviewUsecase.GetProductReviews(productID)
	if err != nil {
		response.Error(c, response.ErrInternal("Gagal memuat ulasan"))
		return
	}

	avgRating, _ := h.reviewUsecase.GetProductAverageRating(productID)

	response.Success(c, http.StatusOK, "Ulasan berhasil dimuat", map[string]interface{}{
		"reviews": reviews,
		"average": avgRating,
		"count":   len(reviews),
	})
}

func (h *ReviewHandler) AddReview(c *gin.Context) {
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

	var req struct {
		Rating  int    `json:"rating" binding:"required,min=1,max=5"`
		Comment string `json:"comment"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, response.ErrBadRequest("Data tidak valid. Rating harus 1-5"))
		return
	}

	review := &domain.Review{
		ProductID: productID,
		UserID:    uid,
		Rating:    req.Rating,
		Comment:   req.Comment,
	}

	if err := h.reviewUsecase.AddReview(review); err != nil {
		response.Error(c, response.ErrBadRequest(err.Error()))
		return
	}

	response.Success(c, http.StatusCreated, "Ulasan berhasil ditambahkan", review)
}
