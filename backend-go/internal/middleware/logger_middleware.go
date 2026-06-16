package middleware

import (
	"fmt"
	"log"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/nuryanfa/e-commerse-sqa/pkg/alert"
)

// LoggerMiddleware logs each HTTP request with method, path, status, latency, and client IP.
func LoggerMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		startTime := time.Now()

		// Process the request
		c.Next()

		// Calculate latency
		latency := time.Since(startTime)

		// Log details
		log.Printf("[%s] %s | %d | %v | %s",
			c.Request.Method,
			c.Request.URL.Path,
			c.Writer.Status(),
			latency,
			c.ClientIP(),
		)
	}
}

// RecoveryMiddleware catches panics in handlers and returns 500 error
func RecoveryMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		defer func() {
			if err := recover(); err != nil {
				log.Printf("[PANIC RECOVERED] %v", err)
				
				// Kirim notifikasi darurat ke Telegram
				alertMsg := fmt.Sprintf("🚨 [CRITICAL] Server Panic Recovered!\n\nPath: %s %s\nError: %v\nIP: %s", 
					c.Request.Method, c.Request.URL.Path, err, c.ClientIP())
				alert.SendTelegramAlert(alertMsg)

				c.JSON(500, gin.H{
					"status":  "error",
					"message": "Terjadi kesalahan fatal pada server",
				})
				c.Abort()
			}
		}()
		c.Next()
	}
}
