package middleware

import (
	"net/http"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
	"golang.org/x/time/rate"
)

// visitor menyimpan rate limiter dan waktu terakhir akses per IP
type visitor struct {
	limiter  *rate.Limiter
	lastSeen time.Time
}

// RateLimiterConfig berisi konfigurasi untuk rate limiter
type RateLimiterConfig struct {
	RequestsPerSecond rate.Limit    // Jumlah request per detik yang diizinkan
	BurstSize         int           // Maksimum burst yang diizinkan
	CleanupInterval   time.Duration // Interval pembersihan visitor lama
	MaxAge            time.Duration // Durasi sebelum visitor dihapus dari memory
}

// ipRateLimiter menyimpan state per-IP rate limiter
type ipRateLimiter struct {
	visitors map[string]*visitor
	mu       sync.RWMutex
	config   RateLimiterConfig
}

// newIPRateLimiter membuat instance rate limiter baru
func newIPRateLimiter(cfg RateLimiterConfig) *ipRateLimiter {
	rl := &ipRateLimiter{
		visitors: make(map[string]*visitor),
		config:   cfg,
	}

	// Goroutine untuk membersihkan visitor yang sudah lama tidak aktif
	go rl.cleanupVisitors()

	return rl
}

// getVisitor mengambil atau membuat limiter baru untuk IP tertentu
func (rl *ipRateLimiter) getVisitor(ip string) *rate.Limiter {
	rl.mu.Lock()
	defer rl.mu.Unlock()

	v, exists := rl.visitors[ip]
	if !exists {
		limiter := rate.NewLimiter(rl.config.RequestsPerSecond, rl.config.BurstSize)
		rl.visitors[ip] = &visitor{limiter: limiter, lastSeen: time.Now()}
		return limiter
	}

	v.lastSeen = time.Now()
	return v.limiter
}

// cleanupVisitors menghapus visitor yang sudah lama tidak aktif untuk mencegah memory leak
func (rl *ipRateLimiter) cleanupVisitors() {
	for {
		time.Sleep(rl.config.CleanupInterval)

		rl.mu.Lock()
		for ip, v := range rl.visitors {
			if time.Since(v.lastSeen) > rl.config.MaxAge {
				delete(rl.visitors, ip)
			}
		}
		rl.mu.Unlock()
	}
}

// RateLimitMiddleware membuat middleware rate limiter untuk endpoint tertentu.
// SQA Security: Mencegah serangan brute force dengan membatasi jumlah request per IP.
//
// Contoh: Untuk login, batas 5 percobaan per menit per IP.
// Konfigurasi default: rate.Every(12*time.Second) = ~5 request/menit, burst 5
func RateLimitMiddleware(rps rate.Limit, burst int) gin.HandlerFunc {
	limiter := newIPRateLimiter(RateLimiterConfig{
		RequestsPerSecond: rps,
		BurstSize:         burst,
		CleanupInterval:   3 * time.Minute,
		MaxAge:            5 * time.Minute,
	})

	return func(c *gin.Context) {
		ip := c.ClientIP()
		l := limiter.getVisitor(ip)

		if !l.Allow() {
			c.JSON(http.StatusTooManyRequests, gin.H{
				"status":  "error",
				"message": "Terlalu banyak percobaan. Silakan coba lagi nanti.",
			})
			c.Abort()
			return
		}

		c.Next()
	}
}
