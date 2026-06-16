package http

import (
	"errors"
	"fmt"
	"net/http"
	"strconv"

	"github.com/nuryanfa/e-commerse-sqa/pkg/upload"

	"github.com/gin-gonic/gin"
	"github.com/nuryanfa/e-commerse-sqa/internal/domain"
	"github.com/nuryanfa/e-commerse-sqa/pkg/response"
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
	publicGroup := publicRouter.Group("/api/v1/products")
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

		// [SQA SECURITY FIX K7] Validasi file upload: whitelist ekstensi, batas ukuran, nama file aman
		file, err := c.FormFile("image")
		if err == nil {
			imageURL, uploadErr := upload.ValidateAndSaveImage(c, file)
			if uploadErr != nil {
				return fmt.Errorf("upload gambar gagal: %v", uploadErr)
			}
			req.ImageURL = imageURL
		} else {
			if existingImage := c.PostForm("image_url"); existingImage != "" {
				req.ImageURL = existingImage
			}
		}

		if req.Name == "" || req.CategoryID == "" {
			return errors.New("validasi gagal: nama dan ID kategori wajib diisi")
		}
		
		// [SQA] Boundary Value Analysis for Products
		if req.Price < 100 || req.Price > 100000000 {
			return errors.New("validasi gagal: harga produk harus wajar (Rp 100 - Rp 100.000.000)")
		}
		if req.Stock < 0 || req.Stock > 10000 {
			return errors.New("validasi gagal: batas maksimum stok adalah 10.000 unit per input")
		}
		
		return nil
	}

	// [SQA BUG-007] JSON path: terapkan validasi BVA yang sama dengan multipart
	if err := c.ShouldBindJSON(req); err != nil {
		return errors.New("format JSON tidak valid: " + err.Error())
	}

	if req.Name == "" || req.CategoryID == "" {
		return errors.New("validasi gagal: nama dan ID kategori wajib diisi")
	}
	if req.Price < 100 || req.Price > 100000000 {
		return errors.New("validasi gagal: harga produk harus wajar (Rp 100 - Rp 100.000.000)")
	}
	if req.Stock < 0 || req.Stock > 10000 {
		return errors.New("validasi gagal: batas maksimum stok adalah 10.000 unit per input")
	}

	return nil
}

func (h *ProductHandler) Create(c *gin.Context) {
	var req domain.Product
	if err := h.parseProductRequest(c, &req); err != nil {
		response.Error(c, response.ErrBadRequest(err.Error()))
		return
	}

	if err := h.productUsecase.Create(&req); err != nil {
		response.Error(c, response.ErrInternal(err.Error()))
		return
	}

	response.Success(c, http.StatusCreated, "Produk berhasil dibuat", req)
}

// FindAll godoc
// @Summary Daftar Semua Produk
// @Description Mengambil seluruh katalog produk yang tersedia di sistem (Dilengkapi Caching).
// @Tags Produk
// @Accept json
// @Produce json
// @Success 200 {object} response.JSONResponse "Berhasil memuat daftar produk"
// @Router /products [get]
func (h *ProductHandler) FindAll(c *gin.Context) {
	products, err := h.productUsecase.FindAll()
	if err != nil {
		response.Error(c, response.ErrInternal(err.Error()))
		return
	}
	response.Success(c, http.StatusOK, "Berhasil memuat daftar produk", products)
}

// FindByID godoc
// @Summary Detail Produk
// @Description Mengambil informasi produk secara mendalam berdasarkan ID.
// @Tags Produk
// @Accept json
// @Produce json
// @Param id path string true "ID Produk"
// @Success 200 {object} response.JSONResponse "Berhasil memuat detail produk"
// @Failure 404 {object} response.JSONResponse "Produk Tidak Ditemukan"
// @Router /products/{id} [get]
func (h *ProductHandler) FindByID(c *gin.Context) {
	id := c.Param("id")
	product, err := h.productUsecase.FindByID(id)
	if err != nil {
		response.Error(c, response.ErrNotFound(err.Error()))
		return
	}
	response.Success(c, http.StatusOK, "Berhasil memuat detail produk", product)
}

func (h *ProductHandler) Update(c *gin.Context) {
	id := c.Param("id")
	var req domain.Product
	if err := h.parseProductRequest(c, &req); err != nil {
		response.Error(c, response.ErrBadRequest(err.Error()))
		return
	}

	if err := h.productUsecase.Update(id, &req); err != nil {
		response.Error(c, response.ErrInternal(err.Error()))
		return
	}

	response.Success(c, http.StatusOK, "Produk berhasil diupdate", req)
}

func (h *ProductHandler) Delete(c *gin.Context) {
	id := c.Param("id")
	if err := h.productUsecase.Delete(id); err != nil {
		response.Error(c, response.ErrInternal(err.Error()))
		return
	}
	response.Success(c, http.StatusOK, "Produk berhasil dihapus", nil)
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
		response.Error(c, response.ErrInternal(err.Error()))
		return
	}

	response.Success(c, http.StatusOK, "Berhasil memuat hasil pencarian", map[string]interface{}{
		"data": products, 
		"total": len(products),
		"page": page,
		"limit": limit,
	})
}
