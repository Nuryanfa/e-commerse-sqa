package http

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/nuryanfa/e-commerse-sqa/internal/domain"
)

type ProductHandler struct {
	productUsecase domain.ProductUsecase
}

// NewProductHandler registers routes.
// Public routes (GET) are on the main router.
// Admin routes (POST/PUT/DELETE) are on the protected admin router group.
func NewProductHandler(publicRouter *gin.Engine, adminRouter *gin.RouterGroup, uc domain.ProductUsecase) {
	handler := &ProductHandler{
		productUsecase: uc,
	}

	// Public routes — tanpa login
	publicGroup := publicRouter.Group("/api/products")
	{
		publicGroup.GET("", handler.FindAll)
		publicGroup.GET("/:id", handler.FindByID)
	}

	// Admin-only routes — butuh JWT + role "admin"
	adminGroup := adminRouter.Group("/products")
	{
		adminGroup.POST("", handler.Create)
		adminGroup.PUT("/:id", handler.Update)
		adminGroup.DELETE("/:id", handler.Delete)
	}
}

func (h *ProductHandler) Create(c *gin.Context) {
	var req domain.Product
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := h.productUsecase.Create(&req); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "Produk berhasil dibuat", "data": req})
}

func (h *ProductHandler) FindAll(c *gin.Context) {
	products, err := h.productUsecase.FindAll()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": products})
}

func (h *ProductHandler) FindByID(c *gin.Context) {
	id := c.Param("id")
	product, err := h.productUsecase.FindByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": product})
}

func (h *ProductHandler) Update(c *gin.Context) {
	id := c.Param("id")
	var req domain.Product
	// Binding ignores values that are not present in JSON
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := h.productUsecase.Update(id, &req); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Produk berhasil diupdate"})
}

func (h *ProductHandler) Delete(c *gin.Context) {
	id := c.Param("id")
	if err := h.productUsecase.Delete(id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Produk berhasil dihapus"})
}
