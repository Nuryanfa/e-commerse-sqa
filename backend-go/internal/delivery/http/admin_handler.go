package http

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/nuryanfa/e-commerse-sqa/internal/domain"
	"github.com/nuryanfa/e-commerse-sqa/pkg/response"
)

type AdminHandler struct {
	AdminUsecase domain.AdminUsecase
}

func NewAdminHandler(r *gin.RouterGroup, usecase domain.AdminUsecase) {
	handler := &AdminHandler{
		AdminUsecase: usecase,
	}

	// Group for admin endpoints under /api/v1/admin
	admin := r.Group("/admin") // Inherits auth & role middlewares from adminRoutes

	admin.GET("/dashboard", handler.GetDashboard)
	admin.GET("/users", handler.GetUsers)
	admin.GET("/sellers", handler.GetSellers)
	admin.GET("/logs", handler.GetSystemLogs)
}

func (h *AdminHandler) checkAdminRole(c *gin.Context) bool {
	// Assuming authMiddleware sets "role" in context
	role, exists := c.Get("role")
	if !exists || role != "admin" {
		response.Error(c, response.ErrForbidden("Akses dilarang. Hanya admin."))
		c.Abort()
		return false
	}
	return true
}

func (h *AdminHandler) GetDashboard(c *gin.Context) {
	stats, err := h.AdminUsecase.GetDashboardStats()
	if err != nil {
		response.Error(c, response.ErrInternal("Gagal mengambil data dashboard"))
		return
	}
	response.Success(c, http.StatusOK, "Berhasil memuat dashboard", stats)
}

func (h *AdminHandler) GetUsers(c *gin.Context) {
	users, err := h.AdminUsecase.GetUsers()
	if err != nil {
		response.Error(c, response.ErrInternal("Gagal mengambil data users"))
		return
	}
	response.Success(c, http.StatusOK, "Berhasil memuat users", users)
}

func (h *AdminHandler) GetSellers(c *gin.Context) {
	sellers, err := h.AdminUsecase.GetSellers()
	if err != nil {
		response.Error(c, response.ErrInternal("Gagal mengambil data sellers"))
		return
	}
	response.Success(c, http.StatusOK, "Berhasil memuat sellers", sellers)
}

func (h *AdminHandler) GetSystemLogs(c *gin.Context) {
	logs, err := h.AdminUsecase.GetSystemLogs()
	if err != nil {
		response.Error(c, response.ErrInternal("Gagal mengambil data logs"))
		return
	}
	response.Success(c, http.StatusOK, "Berhasil memuat system logs", logs)
}
