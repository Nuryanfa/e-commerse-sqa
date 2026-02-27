package config

import (
	"context"
	"log"
	"os"
	"time"

	"github.com/redis/go-redis/v9"
)

// InitRedis membuat koneksi ke Redis server.
// Jika Redis tidak tersedia, aplikasi tetap berjalan tanpa cache (graceful degradation).
func InitRedis() *redis.Client {
	addr := os.Getenv("REDIS_ADDR")
	if addr == "" {
		addr = "localhost:6379" // Default Redis address
	}

	password := os.Getenv("REDIS_PASSWORD")

	client := redis.NewClient(&redis.Options{
		Addr:     addr,
		Password: password,
		DB:       0, // Default DB
	})

	// Test koneksi dengan timeout
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	_, err := client.Ping(ctx).Result()
	if err != nil {
		log.Printf("[REDIS] Gagal terhubung ke Redis (%s): %v. Aplikasi berjalan TANPA cache.", addr, err)
		return nil // Return nil agar aplikasi tetap jalan tanpa cache
	}

	log.Printf("[REDIS] Terhubung ke Redis di %s", addr)
	return client
}
