package upload

import (
	"errors"
	"fmt"
	"mime/multipart"
	"path/filepath"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

// [SQA SECURITY FIX K7] Validasi file upload untuk mencegah:
// 1. Upload file executable/script berbahaya (hanya izinkan gambar)
// 2. Path traversal via nama file yang mengandung "../"
// 3. File terlalu besar yang bisa menyebabkan DoS

// MaxUploadSize adalah batas maksimal ukuran file upload (5MB)
const MaxUploadSize = 5 * 1024 * 1024

// allowedImageExts berisi ekstensi file gambar yang diizinkan
var allowedImageExts = map[string]bool{
	".jpg":  true,
	".jpeg": true,
	".png":  true,
	".webp": true,
	".gif":  true,
}

// ValidateAndSaveImage memvalidasi file upload dan menyimpannya dengan nama aman.
// Mengembalikan URL path untuk disimpan di database, atau error jika validasi gagal.
func ValidateAndSaveImage(c *gin.Context, file *multipart.FileHeader) (string, error) {
	// 1. Validasi ukuran file
	if file.Size > MaxUploadSize {
		return "", fmt.Errorf("ukuran file melebihi batas maksimum %dMB", MaxUploadSize/(1024*1024))
	}

	// 2. Validasi ekstensi file (whitelist hanya gambar)
	ext := strings.ToLower(filepath.Ext(file.Filename))
	if !allowedImageExts[ext] {
		return "", errors.New("tipe file tidak diizinkan. Hanya: jpg, jpeg, png, webp, gif")
	}

	// 3. Gunakan UUID sebagai nama file — mencegah path traversal
	// Nama file asli TIDAK digunakan untuk mencegah injeksi path seperti "../../etc/cron.d/malware.sh"
	safeFilename := fmt.Sprintf("%d_%s%s", time.Now().Unix(), uuid.New().String(), ext)
	savePath := filepath.Join("uploads", safeFilename)

	// 4. Simpan file
	if err := c.SaveUploadedFile(file, savePath); err != nil {
		return "", fmt.Errorf("gagal menyimpan file: %v", err)
	}

	return "/uploads/" + safeFilename, nil
}
