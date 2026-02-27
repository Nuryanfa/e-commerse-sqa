package http

import (
	"net/http"

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

func (h *SupplierHandler) CreateProduct(c *gin.Context) {
	supplierID := c.GetString("user_id")
	var req domain.Product
	if err := c.ShouldBindJSON(&req); err != nil {
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
	if err := c.ShouldBindJSON(&req); err != nil {
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
