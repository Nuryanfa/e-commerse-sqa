package http

import (
	"fmt"
	"net/http"
	"strings"
	"unicode/utf8"

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

// Register godoc
// @Summary Daftar Akun Baru
// @Description Mendaftarkan pengguna baru (Pembeli/Supplier) ke dalam sistem.
// @Tags Authentication
// @Accept json
// @Produce json
// @Param register body object true "Data Registrasi (nama, email, password, role, phone)"
// @Success 201 {object} response.JSONResponse "Registrasi Berhasil"
// @Failure 400 {object} response.JSONError "Validasi Gagal / Bad Request"
// @Router /auth/register [post]
// allowedRegisterRoles mendefinisikan role yang boleh mendaftar secara mandiri.
// [SQA BUG-004] Admin TIDAK boleh bisa dibuat melalui endpoint publik.
var allowedRegisterRoles = map[string]bool{
	"pembeli":  true,
	"supplier": true,
}

func (h *UserHandler) Register(c *gin.Context) {
	var req struct {
		Nama     string `json:"nama"`
		Email    string `json:"email"`
		Password string `json:"password"`
		Role     string `json:"role"`
		Phone    string `json:"phone"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, response.ErrBadRequest("Format JSON tidak valid"))
		return
	}

	// ============================================================
	// [SQA] Validasi manual — mengatasi kelemahan Gin binding
	// yang tidak menolak string kosong ("") untuk tag required.
	// ============================================================

	// [SQA BUG-001] Validasi: semua field wajib tidak boleh kosong
	req.Nama = strings.TrimSpace(req.Nama)
	req.Email = strings.TrimSpace(req.Email)
	req.Password = strings.TrimSpace(req.Password)
	req.Role = strings.TrimSpace(req.Role)
	req.Phone = strings.TrimSpace(req.Phone)

	if req.Nama == "" || req.Email == "" || req.Password == "" || req.Role == "" || req.Phone == "" {
		response.Error(c, response.ErrBadRequest("Semua field wajib diisi: nama, email, password, role, phone"))
		return
	}

	// [SQA BUG-005] Validasi format email: harus mengandung '@' dan domain
	emailParts := strings.Split(req.Email, "@")
	if len(emailParts) != 2 || emailParts[0] == "" || emailParts[1] == "" || !strings.Contains(emailParts[1], ".") {
		response.Error(c, response.ErrBadRequest("Format email tidak valid. Contoh: nama@domain.com"))
		return
	}

	// [SQA BUG-002] Validasi panjang password: min=8, max=64
	passLen := utf8.RuneCountInString(req.Password)
	if passLen < 8 || passLen > 64 {
		response.Error(c, response.ErrBadRequest(fmt.Sprintf(
			"Password harus antara 8 hingga 64 karakter (sekarang: %d karakter)", passLen,
		)))
		return
	}

	// [SQA BUG-003] Validasi panjang nomor telepon: min=10, max=15
	phoneLen := utf8.RuneCountInString(req.Phone)
	if phoneLen < 10 || phoneLen > 15 {
		response.Error(c, response.ErrBadRequest(fmt.Sprintf(
			"Nomor telepon harus antara 10 hingga 15 digit (sekarang: %d karakter)", phoneLen,
		)))
		return
	}

	// [SQA BUG-002 lanjutan] Validasi panjang nama: min=3, max=100
	namaLen := utf8.RuneCountInString(req.Nama)
	if namaLen < 3 || namaLen > 100 {
		response.Error(c, response.ErrBadRequest(fmt.Sprintf(
			"Nama harus antara 3 hingga 100 karakter (sekarang: %d karakter)", namaLen,
		)))
		return
	}

	// [SQA BUG-004] Validasi role: hanya 'pembeli' dan 'supplier' yang diizinkan
	if !allowedRegisterRoles[req.Role] {
		response.Error(c, response.ErrBadRequest(
			fmt.Sprintf("Role '%s' tidak diizinkan. Role yang valid: pembeli, supplier", req.Role),
		))
		return
	}

	user := domain.User{
		Nama:     req.Nama,
		Email:    strings.ToLower(req.Email),
		Password: req.Password,
		Role:     req.Role,
		Phone:    req.Phone,
	}

	if err := h.userUsecase.Register(&user); err != nil {
		// [SQA BUG-006] Email duplikat harus mengembalikan 409 Conflict, bukan 500
		if strings.Contains(err.Error(), "sudah terdaftar") {
			response.Error(c, response.ErrConflict("Email sudah terdaftar, gunakan email lain"))
			return
		}
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

// Login godoc
// @Summary Masuk ke Sistem
// @Description Melakukan autentikasi dan mendapatkan JWT Token untuk akses endpoint terproteksi.
// @Tags Authentication
// @Accept json
// @Produce json
// @Param login body object true "Kredensial (email, password)"
// @Success 200 {object} response.JSONResponse "Login Berhasil"
// @Failure 401 {object} response.JSONError "Email atau Password Salah"
// @Router /auth/login [post]
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
		Name    string `json:"name" binding:"required,min=3,max=100"`
		Phone   string `json:"phone" binding:"omitempty,min=10,max=15"`
		Address string `json:"address" binding:"omitempty,max=500"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, response.ErrBadRequest("Validasi gagal: pastikan Nama, HP (10-15 digit), dan deskripsi alamat wajar"))
		return
	}

	if err := h.userUsecase.UpdateProfile(uid, req.Name, req.Phone, req.Address); err != nil {
		response.Error(c, response.ErrInternal(err.Error()))
		return
	}

	response.Success(c, http.StatusOK, "Profil berhasil diperbarui", nil)
}
