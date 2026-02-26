package http

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/nuryanfa/e-commerse-sqa/internal/domain"
)

type CategoryHandler struct {
	categoryUsecase domain.CategoryUsecase
}

// NewCategoryHandler registers routes.
// Public routes (GET) are on the main router.
// Admin routes (POST/PUT/DELETE) are on the protected admin router group.
func NewCategoryHandler(publicRouter *gin.Engine, adminRouter *gin.RouterGroup, uc domain.CategoryUsecase) {
	handler := &CategoryHandler{
		categoryUsecase: uc,
	}

	// Public routes — tanpa login
	publicGroup := publicRouter.Group("/api/categories")
	{
		publicGroup.GET("", handler.FindAll)
		publicGroup.GET("/:id", handler.FindByID)
	}

	// Admin-only routes — butuh JWT + role "admin"
	adminGroup := adminRouter.Group("/categories")
	{
		adminGroup.POST("", handler.Create)
		adminGroup.PUT("/:id", handler.Update)
		adminGroup.DELETE("/:id", handler.Delete)
	}
}

func (h *CategoryHandler) Create(c *gin.Context) {
	var req domain.Category
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := h.categoryUsecase.Create(&req); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "Kategori berhasil dibuat", "data": req})
}

func (h *CategoryHandler) FindAll(c *gin.Context) {
	categories, err := h.categoryUsecase.FindAll()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": categories})
}

func (h *CategoryHandler) FindByID(c *gin.Context) {
	id := c.Param("id")
	category, err := h.categoryUsecase.FindByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": category})
}

func (h *CategoryHandler) Update(c *gin.Context) {
	id := c.Param("id")
	var req domain.Category
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := h.categoryUsecase.Update(id, &req); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Kategori berhasil diupdate"})
}

func (h *CategoryHandler) Delete(c *gin.Context) {
	id := c.Param("id")
	if err := h.categoryUsecase.Delete(id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Kategori berhasil dihapus"})
}
