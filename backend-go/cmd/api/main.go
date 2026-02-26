package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/nuryanfa/e-commerse-sqa/config"
	deliveryHTTP "github.com/nuryanfa/e-commerse-sqa/internal/delivery/http"
	"github.com/nuryanfa/e-commerse-sqa/internal/domain"
	"github.com/nuryanfa/e-commerse-sqa/internal/middleware"
	"github.com/nuryanfa/e-commerse-sqa/internal/repository"
	"github.com/nuryanfa/e-commerse-sqa/internal/usecase"
)

func main() {
	// 1. Init Database
	db := config.InitDB()

	// Auto Migrate the database structures
	err := db.AutoMigrate(
		&domain.User{},
		&domain.Category{},
		&domain.Product{},
		&domain.CartItem{},
		&domain.Order{},
		&domain.OrderItem{},
	)
	if err != nil {
		log.Fatalf("Gagal melakukan migrasi database: %v", err)
	}
	log.Println("Database migration berhasil.")

	// 2. Setup Gin Router
	router := gin.Default()

	// CORS Middleware
	router.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:5173"}, // Alamat Vite Default
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	// Health Check
	router.GET("/api/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"status":  "success",
			"message": "Server berjalan dan siap!",
		})
	})

	// 3. Dependency Injection for Clean Architecture
	// Users (public — register & login)
	userRepo := repository.NewUserRepository(db)
	userUsecase := usecase.NewUserUsecase(userRepo)
	deliveryHTTP.NewUserHandler(router, userUsecase)

	// Repositories for Catalog
	categoryRepo := repository.NewCategoryRepository(db)
	categoryUsecase := usecase.NewCategoryUsecase(categoryRepo)

	productRepo := repository.NewProductRepository(db)
	productUsecase := usecase.NewProductUsecase(productRepo, categoryRepo)

	// Shopping Cart and Orders
	cartRepo := repository.NewCartRepository(db)
	cartUsecase := usecase.NewCartUsecase(cartRepo, productRepo)

	orderRepo := repository.NewOrderRepository(db)
	orderUsecase := usecase.NewOrderUsecase(orderRepo, cartRepo)

	// 4. Protected Routes

	// 4a. Admin-only routes (JWT + Role "admin")
	// Digunakan untuk manipulasi Katalog (Create/Update/Delete Produk & Kategori)
	adminRoutes := router.Group("/api")
	adminRoutes.Use(middleware.AuthMiddleware(), middleware.RoleMiddleware("admin"))
	{
		deliveryHTTP.NewCategoryHandler(router, adminRoutes, categoryUsecase)
		deliveryHTTP.NewProductHandler(router, adminRoutes, productUsecase)
	}

	// 4b. Auth-only routes (JWT — semua role: pembeli, admin, dll)
	// Digunakan untuk Keranjang Belanja, Checkout, dan Riwayat Pesanan
	authRoutes := router.Group("/api")
	authRoutes.Use(middleware.AuthMiddleware())
	{
		deliveryHTTP.NewCartHandler(authRoutes, cartUsecase)
		deliveryHTTP.NewOrderHandler(authRoutes, orderUsecase)
	}

	// 4. Setup Server with Graceful Shutdown
	srv := &http.Server{
		Addr:    ":8080",
		Handler: router,
	}

	// Menjalankan server dalam goroutine terpisah
	go func() {
		log.Println("Server Golang menyala di http://localhost:8080")
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("Gagal menjalankan server: %v", err)
		}
	}()

	// Menunggu sinyal interrupt untuk graceful shutdown
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit
	log.Println("Mematikan server...")

	// Timeout untuk menunda mematikan server yang sedang melayani request
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	if err := srv.Shutdown(ctx); err != nil {
		log.Fatal("Server dihentikan paksa:", err)
	}

	log.Println("Server berhasil dimatikan dengan aman.")
}