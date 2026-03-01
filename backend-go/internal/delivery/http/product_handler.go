package http

import (
	"errors"
	"fmt"
	"net/http"
	"path/filepath"
	"strconv"
	"time"

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
		publicGroup.GET("/search", handler.Search) // Harus sebelum /:id agar tidak tertangkap wildcard
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

func (h *ProductHandler) parseProductRequest(c *gin.Context, req *domain.Product) error {
	contentType := c.GetHeader("Content-Type")
	if len(contentType) >= 19 && contentType[:19] == "multipart/form-data" {
		req.Name = c.PostForm("name")
		req.Description = c.PostForm("description")
		req.CategoryID = c.PostForm("id_category")
		
		if priceStr := c.PostForm("price"); priceStr != "" {
			var price float64
			fmt.Sscanf(priceStr, "%f", &price)
			req.Price = price
		}
		if stockStr := c.PostForm("stock"); stockStr != "" {
			var stock int
			fmt.Sscanf(stockStr, "%d", &stock)
			req.Stock = stock
		}

		file, err := c.FormFile("image")
		if err == nil {
			filename := fmt.Sprintf("%d_%s", time.Now().Unix(), file.Filename)
			filepath := filepath.Join("uploads", filename)
			if err := c.SaveUploadedFile(file, filepath); err == nil {
				req.ImageURL = "/uploads/" + filename
			}
		} else {
			if existingImage := c.PostForm("image_url"); existingImage != "" {
				req.ImageURL = existingImage
			}
		}

		if req.Name == "" || req.CategoryID == "" || req.Price <= 0 || req.Stock < 0 {
			return errors.New("Validasi gagal: pastikan semua field wajib terisi dengan benar")
		}
		return nil
	}

	return c.ShouldBindJSON(req)
}

func (h *ProductHandler) Create(c *gin.Context) {
	var req domain.Product
	if err := h.parseProductRequest(c, &req); err != nil {
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
	if err := h.parseProductRequest(c, &req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := h.productUsecase.Update(id, &req); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Produk berhasil diupdate", "data": req})
}

func (h *ProductHandler) Delete(c *gin.Context) {
	id := c.Param("id")
	if err := h.productUsecase.Delete(id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Produk berhasil dihapus"})
}

func (h *ProductHandler) Search(c *gin.Context) {
	keyword := c.Query("q")
	categoryID := c.Query("category")
	
	pageStr := c.DefaultQuery("page", "1")
	limitStr := c.DefaultQuery("limit", "0") // 0 means no limit for backward compatibility
	
	page, _ := strconv.Atoi(pageStr)
	limit, _ := strconv.Atoi(limitStr)
	if page < 1 {
		page = 1
	}
	
	offset := (page - 1) * limit
	if limit <= 0 {
		offset = 0 // Ignore offset if no limit is applied
	}

	products, err := h.productUsecase.Search(keyword, categoryID, limit, offset)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// For infinite scroll, frontend might need 'has_more' flag or total products info.
	// Since we don't have a Count query right now, returning current length is sufficient for basic next-page checks
	c.JSON(http.StatusOK, gin.H{
		"data": products, 
		"total": len(products),
		"page": page,
		"limit": limit,
	})
}
