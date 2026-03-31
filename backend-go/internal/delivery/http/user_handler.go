package http

import (
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/nuryanfa/e-commerse-sqa/internal/domain"
	"github.com/nuryanfa/e-commerse-sqa/internal/middleware"
	"github.com/nuryanfa/e-commerse-sqa/pkg/response"
)

type UserHandler struct {
	userUsecase domain.UserUsecase
}

// NewUserHandler initialize user routing
// loginRateLimiter: middleware rate limiter khusus untuk endpoint login (SQA: Brute Force Prevention)
func NewUserHandler(r *gin.Engine, us domain.UserUsecase, loginRateLimiter gin.HandlerFunc) {
	handler := &UserHandler{
		userUsecase: us,
	}

	userGroup := r.Group("/api/v1/auth")
	{
		userGroup.POST("/register", handler.Register)
		userGroup.POST("/login", loginRateLimiter, handler.Login) // Rate limited
	}

	protected := r.Group("/api/v1/users")
	protected.Use(middleware.AuthMiddleware())
	{
		protected.PUT("/profile", handler.UpdateProfile)
	}
}

func (h *UserHandler) Register(c *gin.Context) {
	var user domain.User
	if err := c.ShouldBindJSON(&user); err != nil {
		response.Error(c, response.ErrBadRequest(err.Error()))
		return
	}

	user.Email = strings.ToLower(user.Email)

	if err := h.userUsecase.Register(&user); err != nil {
		response.Error(c, response.ErrInternal(err.Error()))
		return
	}

	response.Success(c, http.StatusCreated, "Registrasi berhasil", map[string]string{
		"id_user": user.ID,
		"nama":    user.Nama,
		"email":   user.Email,
		"role":    user.Role,
	})
}

func (h *UserHandler) Login(c *gin.Context) {
	var loginReq struct {
		Email    string `json:"email" binding:"required,email"`
		Password string `json:"password" binding:"required"`
	}

	if err := c.ShouldBindJSON(&loginReq); err != nil {
		response.Error(c, response.ErrBadRequest("Email dan Password tidak valid"))
		return
	}

	loginReq.Email = strings.ToLower(loginReq.Email)

	token, role, err := h.userUsecase.Login(loginReq.Email, loginReq.Password)
	if err != nil {
		response.Error(c, response.ErrUnauthorized(err.Error()))
		return
	}

	response.Success(c, http.StatusOK, "Login berhasil", map[string]interface{}{
		"token": token,
		"role":  role,
	})
}

func (h *UserHandler) UpdateProfile(c *gin.Context) {
	uidVal, exists := c.Get("user_id")
	if !exists {
		response.Error(c, response.ErrUnauthorized("Sesi pengguna tidak valid"))
		return
	}
	uid, ok := uidVal.(string)
	if !ok {
		response.Error(c, response.ErrUnauthorized("Sesi pengguna tidak valid"))
		return
	}

	var req struct {
		Name    string `json:"name" binding:"required"`
		Phone   string `json:"phone"`
		Address string `json:"address"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, response.ErrBadRequest("Data tidak valid: Nama diwajibkan"))
		return
	}

	if err := h.userUsecase.UpdateProfile(uid, req.Name, req.Phone, req.Address); err != nil {
		response.Error(c, response.ErrInternal(err.Error()))
		return
	}

	response.Success(c, http.StatusOK, "Profil berhasil diperbarui", nil)
}
