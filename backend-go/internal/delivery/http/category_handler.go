package http

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/nuryanfa/e-commerse-sqa/internal/domain"
	"github.com/nuryanfa/e-commerse-sqa/pkg/response"
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
	publicGroup := publicRouter.Group("/api/v1/categories")
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
		response.Error(c, response.ErrBadRequest(err.Error()))
		return
	}

	if err := h.categoryUsecase.Create(&req); err != nil {
		response.Error(c, response.ErrInternal(err.Error()))
		return
	}

	response.Success(c, http.StatusCreated, "Kategori berhasil dibuat", req)
}

func (h *CategoryHandler) FindAll(c *gin.Context) {
	categories, err := h.categoryUsecase.FindAll()
	if err != nil {
		response.Error(c, response.ErrInternal(err.Error()))
		return
	}
	response.Success(c, http.StatusOK, "Berhasil memuat daftar kategori", categories)
}

func (h *CategoryHandler) FindByID(c *gin.Context) {
	id := c.Param("id")
	category, err := h.categoryUsecase.FindByID(id)
	if err != nil {
		response.Error(c, response.ErrNotFound(err.Error()))
		return
	}
	response.Success(c, http.StatusOK, "Berhasil memuat detail kategori", category)
}

func (h *CategoryHandler) Update(c *gin.Context) {
	id := c.Param("id")
	var req domain.Category
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, response.ErrBadRequest(err.Error()))
		return
	}

	if err := h.categoryUsecase.Update(id, &req); err != nil {
		response.Error(c, response.ErrInternal(err.Error()))
		return
	}

	response.Success(c, http.StatusOK, "Kategori berhasil diupdate", nil)
}

func (h *CategoryHandler) Delete(c *gin.Context) {
	id := c.Param("id")
	if err := h.categoryUsecase.Delete(id); err != nil {
		response.Error(c, response.ErrInternal(err.Error()))
		return
	}
	response.Success(c, http.StatusOK, "Kategori berhasil dihapus", nil)
}
