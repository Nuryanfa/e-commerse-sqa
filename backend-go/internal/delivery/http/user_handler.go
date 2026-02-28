package http

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/nuryanfa/e-commerse-sqa/internal/domain"
	"github.com/nuryanfa/e-commerse-sqa/internal/middleware"
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

	userGroup := r.Group("/api/users")
	{
		userGroup.POST("/register", handler.Register)
		userGroup.POST("/login", loginRateLimiter, handler.Login) // Rate limited
	}

	protected := r.Group("/api/users")
	protected.Use(middleware.AuthMiddleware())
	{
		protected.PUT("/profile", handler.UpdateProfile)
	}
}

func (h *UserHandler) Register(c *gin.Context) {
	var user domain.User
	if err := c.ShouldBindJSON(&user); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := h.userUsecase.Register(&user); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "Registrasi berhasil",
		"data": map[string]string{
			"id_user": user.ID,
			"nama":    user.Nama,
			"email":   user.Email,
			"role":    user.Role,
		},
	})
}

func (h *UserHandler) Login(c *gin.Context) {
	var loginReq struct {
		Email    string `json:"email" binding:"required,email"`
		Password string `json:"password" binding:"required"`
	}

	if err := c.ShouldBindJSON(&loginReq); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Email dan Password tidak valid"})
		return
	}

	token, role, err := h.userUsecase.Login(loginReq.Email, loginReq.Password)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Login berhasil",
		"token":   token,
		"role":    role,
	})
}

func (h *UserHandler) UpdateProfile(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}
	uid := userID.(string)

	var req struct {
		Name    string `json:"name" binding:"required"`
		Phone   string `json:"phone"`
		Address string `json:"address"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Data tidak valid: Nama diwajibkan"})
		return
	}

	if err := h.userUsecase.UpdateProfile(uid, req.Name, req.Phone, req.Address); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Profil berhasil diperbarui",
	})
}
