package http

import (
	"errors"
	"fmt"
	"net/http"
	"path/filepath"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/nuryanfa/e-commerse-sqa/internal/domain"
)

type SupplierHandler struct {
	productUsecase domain.ProductUsecase
	orderUsecase   domain.OrderUsecase
}

// NewSupplierHandler registers supplier-only routes
func NewSupplierHandler(supplierRouter *gin.RouterGroup, puc domain.ProductUsecase, ouc domain.OrderUsecase) {
	handler := &SupplierHandler{
		productUsecase: puc,
		orderUsecase:   ouc,
	}

	supplierRouter.GET("/products", handler.MyProducts)
	supplierRouter.POST("/products", handler.CreateProduct)
	supplierRouter.PUT("/products/:id", handler.UpdateProduct)
	supplierRouter.DELETE("/products/:id", handler.DeleteProduct)
	supplierRouter.GET("/orders", handler.MyOrders)
	supplierRouter.PUT("/orders/:id/process", handler.ProcessOrder)
	supplierRouter.POST("/orders/batch-process", handler.BatchProcessOrders)
}

func (h *SupplierHandler) MyProducts(c *gin.Context) {
	supplierID := c.GetString("user_id")
	products, err := h.productUsecase.FindBySupplierID(supplierID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": products, "total": len(products)})
}

func (h *SupplierHandler) parseProductRequest(c *gin.Context, req *domain.Product) error {
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
			return errors.New("validasi gagal: pastikan semua field wajib terisi dengan benar")
		}
		return nil
	}
	return c.ShouldBindJSON(req)
}

func (h *SupplierHandler) CreateProduct(c *gin.Context) {
	supplierID := c.GetString("user_id")
	var req domain.Product
	if err := h.parseProductRequest(c, &req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := h.productUsecase.CreateBySupplier(supplierID, &req); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "Produk berhasil dibuat", "data": req})
}

func (h *SupplierHandler) UpdateProduct(c *gin.Context) {
	supplierID := c.GetString("user_id")
	productID := c.Param("id")
	var req domain.Product
	if err := h.parseProductRequest(c, &req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := h.productUsecase.UpdateBySupplier(supplierID, productID, &req); err != nil {
		c.JSON(http.StatusForbidden, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Produk berhasil diupdate"})
}

func (h *SupplierHandler) DeleteProduct(c *gin.Context) {
	supplierID := c.GetString("user_id")
	productID := c.Param("id")

	if err := h.productUsecase.DeleteBySupplier(supplierID, productID); err != nil {
		c.JSON(http.StatusForbidden, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Produk berhasil dihapus"})
}

func (h *SupplierHandler) MyOrders(c *gin.Context) {
	supplierID := c.GetString("user_id")
	orders, err := h.orderUsecase.GetSupplierOrders(supplierID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": orders, "total": len(orders)})
}

func (h *SupplierHandler) ProcessOrder(c *gin.Context) {
	supplierID := c.GetString("user_id")
	orderID := c.Param("id")

	if err := h.orderUsecase.ProcessSupplierOrder(supplierID, orderID); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Pesanan berhasil diproses dan siap diserahkan ke kurir"})
}

func (h *SupplierHandler) BatchProcessOrders(c *gin.Context) {
	supplierID := c.GetString("user_id")

	var req struct {
		OrderIDs []string `json:"order_ids" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Daftar ID Pesanan (order_ids) tidak boleh kosong"})
		return
	}

	if err := h.orderUsecase.BatchProcessSupplierOrders(supplierID, req.OrderIDs); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": fmt.Sprintf("%d pesanan berhasil diproses serentak", len(req.OrderIDs))})
}
