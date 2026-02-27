package middleware

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
	"golang.org/x/time/rate"
)

func init() {
	gin.SetMode(gin.TestMode)
}

// setupRateLimitedRouter membuat router Gin dengan rate limiter untuk testing
func setupRateLimitedRouter(rps rate.Limit, burst int) *gin.Engine {
	router := gin.New()
	router.POST("/api/users/login", RateLimitMiddleware(rps, burst), func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"message": "login success"})
	})
	return router
}

// TestRateLimiter_AllowsWithinLimit — Request dalam batas harus berhasil (HTTP 200)
func TestRateLimiter_AllowsWithinLimit(t *testing.T) {
	// burst=3 berarti 3 request pertama langsung diizinkan
	router := setupRateLimitedRouter(rate.Limit(1), 3)

	for i := 0; i < 3; i++ {
		w := httptest.NewRecorder()
		req, _ := http.NewRequest("POST", "/api/users/login", nil)
		req.RemoteAddr = "192.168.1.1:12345"
		router.ServeHTTP(w, req)

		if w.Code != http.StatusOK {
			t.Errorf("Request %d: expected status 200, got %d", i+1, w.Code)
		}
	}
}

// TestRateLimiter_BlocksExcessRequests — Request di atas limit harus ditolak (HTTP 429)
func TestRateLimiter_BlocksExcessRequests(t *testing.T) {
	// burst=2, rate sangat rendah → request ke-3 pasti ditolak
	router := setupRateLimitedRouter(rate.Limit(0.01), 2)

	// Habiskan burst
	for i := 0; i < 2; i++ {
		w := httptest.NewRecorder()
		req, _ := http.NewRequest("POST", "/api/users/login", nil)
		req.RemoteAddr = "10.0.0.1:12345"
		router.ServeHTTP(w, req)
	}

	// Request ke-3 harus kena rate limit
	w := httptest.NewRecorder()
	req, _ := http.NewRequest("POST", "/api/users/login", nil)
	req.RemoteAddr = "10.0.0.1:12345"
	router.ServeHTTP(w, req)

	if w.Code != http.StatusTooManyRequests {
		t.Errorf("Expected status 429, got %d", w.Code)
	}
}

// TestRateLimiter_DifferentIPsIndependent — Rate limit per IP, IP yang berbeda tidak terpengaruh
func TestRateLimiter_DifferentIPsIndependent(t *testing.T) {
	router := setupRateLimitedRouter(rate.Limit(0.01), 1)

	// IP A: habiskan burst-nya
	w1 := httptest.NewRecorder()
	req1, _ := http.NewRequest("POST", "/api/users/login", nil)
	req1.RemoteAddr = "10.0.0.1:12345"
	router.ServeHTTP(w1, req1)

	if w1.Code != http.StatusOK {
		t.Errorf("IP A first request: expected 200, got %d", w1.Code)
	}

	// IP A: request kedua harus ditolak
	w2 := httptest.NewRecorder()
	req2, _ := http.NewRequest("POST", "/api/users/login", nil)
	req2.RemoteAddr = "10.0.0.1:12345"
	router.ServeHTTP(w2, req2)

	if w2.Code != http.StatusTooManyRequests {
		t.Errorf("IP A second request: expected 429, got %d", w2.Code)
	}

	// IP B: harus masih bisa (independent rate limit)
	w3 := httptest.NewRecorder()
	req3, _ := http.NewRequest("POST", "/api/users/login", nil)
	req3.RemoteAddr = "10.0.0.2:12345"
	router.ServeHTTP(w3, req3)

	if w3.Code != http.StatusOK {
		t.Errorf("IP B first request: expected 200, got %d", w3.Code)
	}
}

// TestRateLimiter_ResponseBody — Pesan error harus informatif
func TestRateLimiter_ResponseBody(t *testing.T) {
	router := setupRateLimitedRouter(rate.Limit(0.01), 1)

	// Habiskan burst
	w1 := httptest.NewRecorder()
	req1, _ := http.NewRequest("POST", "/api/users/login", nil)
	req1.RemoteAddr = "172.16.0.1:12345"
	router.ServeHTTP(w1, req1)

	// Request berikutnya harus di-rate limit dan memiliki pesan yang benar
	w2 := httptest.NewRecorder()
	req2, _ := http.NewRequest("POST", "/api/users/login", nil)
	req2.RemoteAddr = "172.16.0.1:12345"
	router.ServeHTTP(w2, req2)

	if w2.Code != http.StatusTooManyRequests {
		t.Errorf("Expected status 429, got %d", w2.Code)
	}

	body := w2.Body.String()
	if body == "" {
		t.Error("Expected non-empty response body for rate-limited request")
	}
}

// TestRateLimiter_VisitorCleanup — Memastikan visitor map berfungsi
func TestRateLimiter_VisitorCreation(t *testing.T) {
	cfg := RateLimiterConfig{
		RequestsPerSecond: rate.Limit(1),
		BurstSize:         5,
		CleanupInterval:   1<<63 - 1, // Sangat lama agar cleanup tidak jalan saat test
		MaxAge:            1<<63 - 1,
	}
	rl := newIPRateLimiter(cfg)

	// Buat beberapa visitor
	rl.getVisitor("ip1")
	rl.getVisitor("ip2")
	rl.getVisitor("ip3")

	rl.mu.RLock()
	defer rl.mu.RUnlock()

	if len(rl.visitors) != 3 {
		t.Errorf("Expected 3 visitors, got %d", len(rl.visitors))
	}
}
