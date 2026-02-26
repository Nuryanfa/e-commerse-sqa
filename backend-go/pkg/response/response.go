package response

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

// AppError represents a structured application error
type AppError struct {
	Code    int    `json:"code"`
	Message string `json:"message"`
	Detail  string `json:"detail,omitempty"` // Hanya tampil jika ada
}

// --- Pre-defined Errors ---

func ErrBadRequest(detail string) *AppError {
	return &AppError{Code: http.StatusBadRequest, Message: "Permintaan tidak valid", Detail: detail}
}

func ErrUnauthorized(detail string) *AppError {
	return &AppError{Code: http.StatusUnauthorized, Message: "Anda belum terautentikasi", Detail: detail}
}

func ErrForbidden(detail string) *AppError {
	return &AppError{Code: http.StatusForbidden, Message: "Akses ditolak", Detail: detail}
}

func ErrNotFound(detail string) *AppError {
	return &AppError{Code: http.StatusNotFound, Message: "Data tidak ditemukan", Detail: detail}
}

func ErrConflict(detail string) *AppError {
	return &AppError{Code: http.StatusConflict, Message: "Terjadi konflik data", Detail: detail}
}

func ErrInternal(detail string) *AppError {
	return &AppError{Code: http.StatusInternalServerError, Message: "Terjadi kesalahan pada server", Detail: detail}
}

// --- Response Helpers ---

// Success sends a standardized success JSON response
func Success(c *gin.Context, code int, message string, data interface{}) {
	c.JSON(code, gin.H{
		"status":  "success",
		"message": message,
		"data":    data,
	})
}

// Error sends a standardized error JSON response
func Error(c *gin.Context, err *AppError) {
	c.JSON(err.Code, gin.H{
		"status":  "error",
		"message": err.Message,
		"detail":  err.Detail,
	})
}
