package main

import (
	"log"
	"time"

	"github.com/google/uuid"
	"github.com/nuryanfa/e-commerse-sqa/config"
	"github.com/nuryanfa/e-commerse-sqa/internal/domain"
	"github.com/nuryanfa/e-commerse-sqa/pkg/password"
)

func main() {
	db := config.InitDB()

	// Auto Migrate
	_ = db.AutoMigrate(&domain.User{}, &domain.Category{}, &domain.Product{})

	// Hash password — semua dummy user pakai password yang sama: "password123"
	hashed, err := password.HashPassword("password123")
	if err != nil {
		log.Fatalf("Gagal hash password: %v", err)
	}

	users := []domain.User{
		{
			ID:        uuid.New().String(),
			Nama:      "Super Admin",
			Email:     "superadmin@ecommerce.com",
			Password:  hashed,
			Role:      "admin",
			CreatedAt: time.Now(),
			UpdatedAt: time.Now(),
		},
		{
			ID:        uuid.New().String(),
			Nama:      "Admin Toko",
			Email:     "admin@ecommerce.com",
			Password:  hashed,
			Role:      "admin",
			CreatedAt: time.Now(),
			UpdatedAt: time.Now(),
		},
		{
			ID:        uuid.New().String(),
			Nama:      "Suplier Elektronik",
			Email:     "suplier@ecommerce.com",
			Password:  hashed,
			Role:      "suplier",
			CreatedAt: time.Now(),
			UpdatedAt: time.Now(),
		},
		{
			ID:        uuid.New().String(),
			Nama:      "Pembeli Satu",
			Email:     "pembeli@ecommerce.com",
			Password:  hashed,
			Role:      "pembeli",
			CreatedAt: time.Now(),
			UpdatedAt: time.Now(),
		},
	}

	for _, u := range users {
		// Cek apakah email sudah ada
		var existing domain.User
		result := db.Where("email = ?", u.Email).First(&existing)
		if result.RowsAffected > 0 {
			log.Printf("⏭️  User '%s' (%s) sudah ada, skip.", u.Nama, u.Email)
			continue
		}

		if err := db.Create(&u).Error; err != nil {
			log.Printf("❌ Gagal membuat user '%s': %v", u.Nama, err)
		} else {
			log.Printf("✅ User '%s' [%s] berhasil dibuat (email: %s)", u.Nama, u.Role, u.Email)
		}
	}

	// --- Seed dummy Categories ---
	categories := []domain.Category{
		{ID: uuid.New().String(), Name: "Elektronik", Description: "Perangkat elektronik dan gadget", CreatedAt: time.Now(), UpdatedAt: time.Now()},
		{ID: uuid.New().String(), Name: "Pakaian", Description: "Baju, celana, dan aksesoris", CreatedAt: time.Now(), UpdatedAt: time.Now()},
		{ID: uuid.New().String(), Name: "Makanan", Description: "Makanan dan minuman", CreatedAt: time.Now(), UpdatedAt: time.Now()},
	}

	for _, cat := range categories {
		var existing domain.Category
		result := db.Where("name = ?", cat.Name).First(&existing)
		if result.RowsAffected > 0 {
			log.Printf("⏭️  Kategori '%s' sudah ada, skip.", cat.Name)
			continue
		}
		if err := db.Create(&cat).Error; err != nil {
			log.Printf("❌ Gagal membuat kategori '%s': %v", cat.Name, err)
		} else {
			log.Printf("✅ Kategori '%s' berhasil dibuat", cat.Name)
		}
	}

	// --- Seed dummy Products ---
	// Ambil kategori Elektronik untuk relasi
	var catElektronik domain.Category
	db.Where("name = ?", "Elektronik").First(&catElektronik)

	var catPakaian domain.Category
	db.Where("name = ?", "Pakaian").First(&catPakaian)

	products := []domain.Product{
		{ID: uuid.New().String(), Name: "Laptop Gaming ASUS", Description: "RTX 4060, RAM 16GB", Price: 15000000, Stock: 10, CategoryID: catElektronik.ID, CreatedAt: time.Now(), UpdatedAt: time.Now()},
		{ID: uuid.New().String(), Name: "Smartphone Samsung", Description: "Galaxy S24 Ultra", Price: 12000000, Stock: 25, CategoryID: catElektronik.ID, CreatedAt: time.Now(), UpdatedAt: time.Now()},
		{ID: uuid.New().String(), Name: "Kemeja Formal", Description: "Kemeja slim-fit premium", Price: 250000, Stock: 50, CategoryID: catPakaian.ID, CreatedAt: time.Now(), UpdatedAt: time.Now()},
	}

	for _, prod := range products {
		var existing domain.Product
		result := db.Where("name = ?", prod.Name).First(&existing)
		if result.RowsAffected > 0 {
			log.Printf("⏭️  Produk '%s' sudah ada, skip.", prod.Name)
			continue
		}
		if err := db.Create(&prod).Error; err != nil {
			log.Printf("❌ Gagal membuat produk '%s': %v", prod.Name, err)
		} else {
			log.Printf("✅ Produk '%s' (Rp%.0f, stok: %d) berhasil dibuat", prod.Name, prod.Price, prod.Stock)
		}
	}

	log.Println("\n🎉 Seeding selesai!")
}
