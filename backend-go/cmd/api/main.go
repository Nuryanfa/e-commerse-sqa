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
	"github.com/nuryanfa/e-commerse-sqa/internal/repository"
	"github.com/nuryanfa/e-commerse-sqa/internal/usecase"
)

func main() {
	// 1. Init Database
	db := config.InitDB()

	// Auto Migrate the database structures
	err := db.AutoMigrate(&domain.User{}, &domain.Category{}, &domain.Product{})
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
	// Users
	userRepo := repository.NewUserRepository(db)
	userUsecase := usecase.NewUserUsecase(userRepo)
	deliveryHTTP.NewUserHandler(router, userUsecase)

	// Catalog (Category & Product)
	categoryRepo := repository.NewCategoryRepository(db)
	categoryUsecase := usecase.NewCategoryUsecase(categoryRepo)
	deliveryHTTP.NewCategoryHandler(router, categoryUsecase)

	productRepo := repository.NewProductRepository(db)
	productUsecase := usecase.NewProductUsecase(productRepo, categoryRepo)
	deliveryHTTP.NewProductHandler(router, productUsecase)

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