package repository

import (
	"context"
	"encoding/json"
	"log"
	"time"

	"github.com/nuryanfa/e-commerse-sqa/internal/domain"
	"github.com/redis/go-redis/v9"
)

const (
	productAllKey    = "products:all"       // Cache key untuk semua produk
	productKeyPrefix = "products:detail:"   // Cache key prefix untuk produk per ID
	cacheTTL         = 5 * time.Minute      // TTL cache: 5 menit
)

// cachedProductRepository adalah decorator yang membungkus ProductRepository asli
// dengan lapisan Redis caching. Mengikuti pola Decorator dari Clean Architecture.
type cachedProductRepository struct {
	base  domain.ProductRepository // Repository asli (PostgreSQL)
	cache *redis.Client            // Redis client (bisa nil jika Redis tidak tersedia)
}

// NewCachedProductRepository membuat product repository dengan Redis caching.
// Jika redisClient nil, maka semua operasi langsung ke database (fallback).
func NewCachedProductRepository(base domain.ProductRepository, redisClient *redis.Client) domain.ProductRepository {
	return &cachedProductRepository{
		base:  base,
		cache: redisClient,
	}
}

func (r *cachedProductRepository) Create(product *domain.Product) error {
	err := r.base.Create(product)
	if err == nil {
		r.invalidateCache() // Hapus cache setelah data berubah
	}
	return err
}

func (r *cachedProductRepository) FindAll() ([]domain.Product, error) {
	// Jika Redis tidak tersedia, langsung ke database
	if r.cache == nil {
		return r.base.FindAll()
	}

	ctx := context.Background()

	// 1. Coba ambil dari cache
	cached, err := r.cache.Get(ctx, productAllKey).Result()
	if err == nil {
		var products []domain.Product
		if json.Unmarshal([]byte(cached), &products) == nil {
			log.Println("[CACHE HIT] products:all")
			return products, nil
		}
	}

	// 2. Cache miss — ambil dari database
	log.Println("[CACHE MISS] products:all — query database")
	products, err := r.base.FindAll()
	if err != nil {
		return nil, err
	}

	// 3. Simpan ke cache
	data, marshalErr := json.Marshal(products)
	if marshalErr == nil {
		r.cache.Set(ctx, productAllKey, data, cacheTTL)
	}

	return products, nil
}

func (r *cachedProductRepository) FindByID(id string) (*domain.Product, error) {
	// Jika Redis tidak tersedia, langsung ke database
	if r.cache == nil {
		return r.base.FindByID(id)
	}

	ctx := context.Background()
	cacheKey := productKeyPrefix + id

	// 1. Coba ambil dari cache
	cached, err := r.cache.Get(ctx, cacheKey).Result()
	if err == nil {
		var product domain.Product
		if json.Unmarshal([]byte(cached), &product) == nil {
			log.Printf("[CACHE HIT] %s", cacheKey)
			return &product, nil
		}
	}

	// 2. Cache miss — ambil dari database
	log.Printf("[CACHE MISS] %s — query database", cacheKey)
	product, err := r.base.FindByID(id)
	if err != nil {
		return nil, err
	}

	// 3. Simpan ke cache
	data, marshalErr := json.Marshal(product)
	if marshalErr == nil {
		r.cache.Set(ctx, cacheKey, data, cacheTTL)
	}

	return product, nil
}

func (r *cachedProductRepository) Update(product *domain.Product) error {
	err := r.base.Update(product)
	if err == nil {
		r.invalidateCache() // Hapus semua cache produk setelah update
	}
	return err
}

func (r *cachedProductRepository) Delete(id string) error {
	err := r.base.Delete(id)
	if err == nil {
		r.invalidateCache() // Hapus semua cache produk setelah delete
	}
	return err
}

// Search langsung diteruskan ke base repository (tidak di-cache karena query dinamis)
func (r *cachedProductRepository) Search(keyword string, categoryID string) ([]domain.Product, error) {
	return r.base.Search(keyword, categoryID)
}

// invalidateCache menghapus semua cache produk dari Redis.
// Dipanggil setiap kali ada Create/Update/Delete yang mengubah data.
func (r *cachedProductRepository) invalidateCache() {
	if r.cache == nil {
		return
	}

	ctx := context.Background()

	// Hapus cache "all products"
	r.cache.Del(ctx, productAllKey)

	// Hapus semua cache detail produk menggunakan pattern matching
	iter := r.cache.Scan(ctx, 0, productKeyPrefix+"*", 100).Iterator()
	for iter.Next(ctx) {
		r.cache.Del(ctx, iter.Val())
	}

	log.Println("[CACHE INVALIDATED] Semua cache produk dihapus")
}
