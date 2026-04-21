package http

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/nuryanfa/e-commerse-sqa/internal/domain"
	"github.com/nuryanfa/e-commerse-sqa/pkg/response"
)

type CartHandler struct {
	cartUsecase domain.CartUsecase
}

// Router disuntikkan dengan rute privat yang nanti dilindungi middleware `AuthMiddleware`
func NewCartHandler(r *gin.RouterGroup, uc domain.CartUsecase) {
	handler := &CartHandler{
		cartUsecase: uc,
	}

	cartGroup := r.Group("/cart")
	{
		cartGroup.POST("", handler.AddToCart)
		cartGroup.GET("", handler.ViewCart)
		cartGroup.PUT("/:id", handler.UpdateQuantity)
		cartGroup.DELETE("/:id", handler.RemoveFromCart)
	}
}

// AddToCart godoc
// @Summary Tambah ke Keranjang
// @Description Menambahkan produk (dan varian) ke dalam keranjang belanja user.
// @Tags Keranjang
// @Security BearerAuth
// @Accept json
// @Produce json
// @Param cart body object true "Item Keranjang (id_product, id_variant, quantity)"
// @Success 200 {object} response.JSONResponse "Barang berhasil ditambahkan"
// @Failure 400 {object} response.JSONError "Gagal Input / BVA Limit Terlampaui"
// @Router /cart [post]
func (h *CartHandler) AddToCart(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		response.Error(c, response.ErrUnauthorized("Sesi pengguna tidak valid"))
		return
	}
	uid, ok := userID.(string)
	if !ok {
		response.Error(c, response.ErrUnauthorized("Sesi pengguna tidak valid"))
		return
	}

	// [SQA BUG-008] Cart menerima KEDUA format field: 'id_product' MAUPUN 'product_id'
	// Boundary Value Analysis: Minimum 1, Maximum 100 per operasi add-to-cart
	var req struct {
		ProductID      string `json:"id_product"`
		ProductIDAlias string `json:"product_id"` // Alias untuk kompatibilitas konvensi REST
		VariantID      string `json:"id_variant"`
		Quantity       int    `json:"quantity"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, response.ErrBadRequest("Format JSON tidak valid"))
		return
	}

	// Pakai 'product_id' jika 'id_product' tidak diisi
	if req.ProductID == "" && req.ProductIDAlias != "" {
		req.ProductID = req.ProductIDAlias
	}

	// Validasi manual: id produk wajib
	if req.ProductID == "" {
		response.Error(c, response.ErrBadRequest("ID produk wajib diisi (gunakan field 'id_product' atau 'product_id')"))
		return
	}

	// Validasi BVA: quantity harus 1-100
	if req.Quantity < 1 || req.Quantity > 100 {
		response.Error(c, response.ErrBadRequest("Kuantitas harus diantara 1 hingga 100"))
		return
	}

	var variantIDPtr *string
	if req.VariantID != "" {
		variantIDPtr = &req.VariantID
	}

	cartItemReq := domain.CartItem{
		ProductID:      req.ProductID,
		VariantID:      variantIDPtr,
		Quantity:       req.Quantity,
	}

	if err := h.cartUsecase.AddToCart(uid, &cartItemReq); err != nil {
		response.Error(c, response.ErrBadRequest(err.Error()))
		return
	}

	response.Success(c, http.StatusOK, "Barang berhasil ditambahkan ke keranjang", nil)
}

// ViewCart godoc
// @Summary Lihat Keranjang
// @Description Mengambil semua item yang ada di keranjang belanja pengguna saat ini.
// @Tags Keranjang
// @Security BearerAuth
// @Produce json
// @Success 200 {object} response.JSONResponse "Daftar Item Keranjang"
// @Router /cart [get]
func (h *CartHandler) ViewCart(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		response.Error(c, response.ErrUnauthorized("Sesi pengguna tidak valid"))
		return
	}
	uid, ok := userID.(string)
	if !ok {
		response.Error(c, response.ErrUnauthorized("Sesi pengguna tidak valid"))
		return
	}

	items, err := h.cartUsecase.ViewCart(uid)
	if err != nil {
		response.Error(c, response.ErrInternal("Gagal merender keranjang: " + err.Error()))
		return
	}

	response.Success(c, http.StatusOK, "Berhasil memuat keranjang belanja", items)
}

func (h *CartHandler) UpdateQuantity(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		response.Error(c, response.ErrUnauthorized("Sesi pengguna tidak valid"))
		return
	}
	uid, ok := userID.(string)
	if !ok {
		response.Error(c, response.ErrUnauthorized("Sesi pengguna tidak valid"))
		return
	}
	itemID := c.Param("id")

	var req struct {
		Quantity int `json:"quantity" binding:"required,min=1,max=100"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, response.ErrBadRequest("Kuantitas tidak valid, harus diantara 1 hingga 100"))
		return
	}

	if err := h.cartUsecase.UpdateQuantity(uid, itemID, req.Quantity); err != nil {
		response.Error(c, response.ErrBadRequest(err.Error()))
		return
	}

	response.Success(c, http.StatusOK, "Kuantitas diperbarui", nil)
}

func (h *CartHandler) RemoveFromCart(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		response.Error(c, response.ErrUnauthorized("Sesi pengguna tidak valid"))
		return
	}
	uid, ok := userID.(string)
	if !ok {
		response.Error(c, response.ErrUnauthorized("Sesi pengguna tidak valid"))
		return
	}
	itemID := c.Param("id")

	if err := h.cartUsecase.RemoveFromCart(uid, itemID); err != nil {
		response.Error(c, response.ErrInternal(err.Error()))
		return
	}

	response.Success(c, http.StatusOK, "Barang dihapus dari keranjang", nil)
}
