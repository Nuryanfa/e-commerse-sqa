package http

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/nuryanfa/e-commerse-sqa/internal/domain"
	"github.com/nuryanfa/e-commerse-sqa/internal/middleware"
	"github.com/nuryanfa/e-commerse-sqa/internal/usecase"
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
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal memuat ulasan"})
		return
	}

	avgRating, _ := h.reviewUsecase.GetProductAverageRating(productID)

	c.JSON(http.StatusOK, gin.H{
		"message": "Ulasan berhasil dimuat",
		"data": gin.H{
			"reviews": reviews,
			"average": avgRating,
			"count":   len(reviews),
		},
	})
}

func (h *ReviewHandler) AddReview(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}
	uid := userID.(string)
	productID := c.Param("id")

	var req struct {
		Rating  int    `json:"rating" binding:"required,min=1,max=5"`
		Comment string `json:"comment"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Data tidak valid. Rating harus 1-5"})
		return
	}

	review := &domain.Review{
		ProductID: productID,
		UserID:    uid,
		Rating:    req.Rating,
		Comment:   req.Comment,
	}

	if err := h.reviewUsecase.AddReview(review); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "Ulasan berhasil ditambahkan",
		"data":    review,
	})
}
