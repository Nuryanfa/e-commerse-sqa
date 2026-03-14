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
	"github.com/nuryanfa/e-commerse-sqa/internal/infrastructure/email"
	"github.com/nuryanfa/e-commerse-sqa/internal/middleware"
	"github.com/nuryanfa/e-commerse-sqa/internal/repository"
	"github.com/nuryanfa/e-commerse-sqa/internal/usecase"
	"golang.org/x/time/rate"
)

func main() {
	// 1. Init Database
	db := config.InitDB()

	// 1b. Init Redis (opsional — graceful degradation jika tidak tersedia)
	redisClient := config.InitRedis()

	// Auto Migrate the database structures
	err := db.AutoMigrate(
		&domain.User{},
		&domain.Category{},
		&domain.Product{},
		&domain.ProductVariant{},
		&domain.CartItem{},
		&domain.Order{},
		&domain.OrderItem{},
		&domain.Review{},
		&domain.Wishlist{},
		&domain.Voucher{},
		&domain.AuditLog{},
		&domain.Dispute{},
		&domain.DisputeMessage{},
	)
	if err != nil {
		log.Fatalf("Gagal melakukan migrasi database: %v", err)
	}
	log.Println("Database migration berhasil.")

	// 2. Setup Gin Router with Custom Middleware
	router := gin.New() // Menggunakan gin.New() alih-alih Default() agar middleware terkontrol penuh
	router.Use(middleware.RecoveryMiddleware()) // Menangkap panic agar server tidak crash
	router.Use(middleware.LoggerMiddleware())   // Logging terstruktur untuk setiap request

	// CORS Middleware
	router.Use(cors.New(cors.Config{
		AllowAllOrigins:  true,
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
	}))

	// Health Check
	router.GET("/api/v1/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"status":  "success",
			"message": "Server berjalan dan siap!",
		})
	})

	// Serve Static Files for Uploads
	router.Static("/uploads", "./uploads")

	// 3. Dependency Injection for Clean Architecture

	// Users (public — register & login)
	// SQA Security: Rate limiter diterapkan pada endpoint login
	// Konfigurasi: rate.Every(12*time.Second) = ~5 request/menit, burst 5
	userRepo := repository.NewUserRepository(db)
	userUsecase := usecase.NewUserUsecase(userRepo)
	deliveryHTTP.NewUserHandler(router, userUsecase, middleware.RateLimitMiddleware(rate.Every(12*time.Second), 5))

	// Repositories for Catalog
	categoryRepo := repository.NewCategoryRepository(db)
	categoryUsecase := usecase.NewCategoryUsecase(categoryRepo)

	// SQA Performance: Product repository dibungkus dengan Redis caching
	baseProductRepo := repository.NewProductRepository(db)
	productRepo := repository.NewCachedProductRepository(baseProductRepo, redisClient)
    auditLogRepo := repository.NewAuditLogRepository(db)
	productUsecase := usecase.NewProductUsecase(productRepo, categoryRepo, auditLogRepo)

	reviewRepo := repository.NewReviewRepository(db)
	reviewUsecase := usecase.NewReviewUsecase(reviewRepo, productRepo)

	wishlistRepo := repository.NewWishlistRepository(db)
	wishlistUsecase := usecase.NewWishlistUsecase(wishlistRepo, productRepo)

	// Shopping Cart and Orders
	cartRepo := repository.NewCartRepository(db)
	cartUsecase := usecase.NewCartUsecase(cartRepo, productRepo)

	emailSvc := email.NewMockEmailService()
	orderRepo := repository.NewOrderRepository(db)
	orderUsecase := usecase.NewOrderUsecase(orderRepo, cartRepo, auditLogRepo, emailSvc, userRepo)

	// Dispute / Pusat Resolusi
	disputeRepo := repository.NewDisputeRepository(db)
	disputeUsecase := usecase.NewDisputeUseCase(disputeRepo, orderRepo)

	// 4. Protected Routes

	// 4a. Admin-only routes (JWT + Role "admin")
	// Digunakan untuk manipulasi Katalog (Create/Update/Delete Produk & Kategori)
	adminRoutes := router.Group("/api/v1")
	adminRoutes.Use(middleware.AuthMiddleware(), middleware.RoleMiddleware("admin"))
	{
		deliveryHTTP.NewCategoryHandler(router, adminRoutes, categoryUsecase)
		deliveryHTTP.NewProductHandler(router, adminRoutes, productUsecase)
	}

	// 4b. Auth-only routes (JWT — semua role: pembeli, admin, dll)
	// Digunakan untuk Keranjang Belanja, Checkout, dan Riwayat Pesanan
	authRoutes := router.Group("/api/v1")
	authRoutes.Use(middleware.AuthMiddleware())
	{
		deliveryHTTP.NewCartHandler(authRoutes, cartUsecase)
		deliveryHTTP.NewOrderHandler(authRoutes, orderUsecase)
	}

	// Open endpoints that also have protected childs
	deliveryHTTP.NewReviewHandler(router.Group("/api/v1"), reviewUsecase)
	deliveryHTTP.NewWishlistHandler(router.Group("/api/v1"), wishlistUsecase)

	// 4c. Supplier-only routes (JWT + Role "supplier")
	supplierRoutes := router.Group("/api/v1/supplier")
	supplierRoutes.Use(middleware.AuthMiddleware(), middleware.RoleMiddleware("supplier"))
	{
		deliveryHTTP.NewSupplierHandler(supplierRoutes, productUsecase, orderUsecase)
	}

	// 4d. Courier-only routes (JWT + Role "courier")
	courierRoutes := router.Group("/api/v1/courier")
	courierRoutes.Use(middleware.AuthMiddleware(), middleware.RoleMiddleware("courier"))
	{
		deliveryHTTP.NewCourierHandler(courierRoutes, orderUsecase, disputeUsecase)
	}

	// 4e. Dispute / Pusat Resolusi (Campuran Role)
	disputeRoutes := router.Group("/api/v1/disputes")
	disputeRoutes.Use(middleware.AuthMiddleware()) // Harus login
	{
		disputeHandler := deliveryHTTP.NewDisputeHandler(disputeUsecase)

		// Semua yang punya order bisa ajukan komplain, semua bisa lihat miliknya, dan tambah obrolan
		disputeRoutes.POST("/:id", disputeHandler.OpenDispute) // :id here serves as order_id to prevent Gin router conflict
		disputeRoutes.GET("", disputeHandler.GetMyDisputes)
		disputeRoutes.GET("/:id", disputeHandler.GetDisputeDetail)
		disputeRoutes.POST("/:id/reply", disputeHandler.ReplyDispute)

		// Hanya Admin dan Supplier yang bisa mengetok palu penyelesaian mediasi sengketa
		adminDispute := disputeRoutes.Group("")
		adminDispute.Use(middleware.RoleMiddleware("admin", "supplier"))
		{
			adminDispute.PUT("/:id/resolve", disputeHandler.ResolveDispute)
		}
	}

	// 4e. Webhook Public Endpoints (Tanpa Auth / Token JWT)
	webhookRoutes := router.Group("/api/v1/payments")
	{
		deliveryHTTP.NewWebhookHandler(webhookRoutes, orderUsecase)
	}

	// 5. Setup Worker for Background Jobs (Cron)
	go func() {
		log.Println("[WORKER] Background Service untuk membatalkan pesanan kedaluwarsa telah aktif.")
		// Jalankan setiap 1 jam
		ticker := time.NewTicker(1 * time.Hour)
		for {
			<-ticker.C
			canceled, err := orderUsecase.ProcessCancelExpiredJobs()
			if err != nil {
				log.Printf("[CRON ERROR] Gagal mengeksekusi cronjob pembatalan pesanan: %v", err)
			} else if canceled > 0 {
				log.Printf("[CRON SUCCESS] Membatalkan %d pesanan kedaluwarsa (Limit stok dikembalikan).", canceled)
			}
		}
	}()

	// 6. Setup Server with Graceful Shutdown
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