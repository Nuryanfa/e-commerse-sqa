package middleware

import "github.com/gin-gonic/gin"

// SecurityHeadersMiddleware adds essential HTTP security headers to every response.
func SecurityHeadersMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		// Mencegah Clickjacking (tidak bisa dimasukkan ke dalam iframe)
		c.Header("X-Frame-Options", "DENY")
		
		// Perlindungan tambahan dari XSS attack di browser lama
		c.Header("X-XSS-Protection", "1; mode=block")
		
		// Mencegah browser menebak tipe konten, menghindari eksekusi script yang menyamar jadi gambar/dll
		c.Header("X-Content-Type-Options", "nosniff")
		
		// Memaksa browser menggunakan HTTPS selama 1 tahun ke depan
		c.Header("Strict-Transport-Security", "max-age=31536000; includeSubDomains")
		
		// Mengontrol informasi referrer yang dikirim saat user berpindah halaman
		c.Header("Referrer-Policy", "strict-origin-when-cross-origin")

		c.Next()
	}
}
