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

	// --- Seed Users (4 role) ---
	supplierID := uuid.New().String()

	users := []domain.User{
		{
			ID:        uuid.New().String(),
			Nama:      "Admin SayurSehat",
			Email:     "admin@sayursehat.id",
			Password:  hashed,
			Role:      "admin",
			CreatedAt: time.Now(),
			UpdatedAt: time.Now(),
		},
		{
			ID:        supplierID,
			Nama:      "Pak Tani Segar",
			Email:     "supplier@sayursehat.id",
			Password:  hashed,
			Role:      "supplier",
			CreatedAt: time.Now(),
			UpdatedAt: time.Now(),
		},
		{
			ID:        uuid.New().String(),
			Nama:      "Kurir Cepat",
			Email:     "kurir@sayursehat.id",
			Password:  hashed,
			Role:      "courier",
			CreatedAt: time.Now(),
			UpdatedAt: time.Now(),
		},
		{
			ID:        uuid.New().String(),
			Nama:      "Budi Pembeli",
			Email:     "pembeli@sayursehat.id",
			Password:  hashed,
			Role:      "pembeli",
			CreatedAt: time.Now(),
			UpdatedAt: time.Now(),
		},
	}

	for _, u := range users {
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

	// --- Seed Categories (Sayuran) ---
	categories := []domain.Category{
		{ID: uuid.New().String(), Name: "Sayuran Daun", Description: "Sayuran hijau berdaun segar", CreatedAt: time.Now(), UpdatedAt: time.Now()},
		{ID: uuid.New().String(), Name: "Sayuran Buah", Description: "Sayuran berbentuk buah", CreatedAt: time.Now(), UpdatedAt: time.Now()},
		{ID: uuid.New().String(), Name: "Umbi-umbian", Description: "Umbi dan akar segar", CreatedAt: time.Now(), UpdatedAt: time.Now()},
		{ID: uuid.New().String(), Name: "Bumbu Dapur", Description: "Rempah dan bumbu segar", CreatedAt: time.Now(), UpdatedAt: time.Now()},
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

	// --- Seed Products (Sayuran) ---
	var catDaun domain.Category
	db.Where("name = ?", "Sayuran Daun").First(&catDaun)

	var catBuah domain.Category
	db.Where("name = ?", "Sayuran Buah").First(&catBuah)

	var catUmbi domain.Category
	db.Where("name = ?", "Umbi-umbian").First(&catUmbi)

	var catBumbu domain.Category
	db.Where("name = ?", "Bumbu Dapur").First(&catBumbu)

	products := []domain.Product{
		{ID: uuid.New().String(), Name: "Kangkung Segar", Description: "Kangkung hidroponik, renyah dan segar. Cocok untuk tumis dan plecing.", Price: 5000, Stock: 100, CategoryID: catDaun.ID, SupplierID: supplierID, CreatedAt: time.Now(), UpdatedAt: time.Now()},
		{ID: uuid.New().String(), Name: "Bayam Hijau", Description: "Bayam organik dari petani lokal. Kaya zat besi dan vitamin.", Price: 6000, Stock: 80, CategoryID: catDaun.ID, SupplierID: supplierID, CreatedAt: time.Now(), UpdatedAt: time.Now()},
		{ID: uuid.New().String(), Name: "Sawi Putih", Description: "Sawi putih segar, ideal untuk sup dan capcay.", Price: 8000, Stock: 60, CategoryID: catDaun.ID, SupplierID: supplierID, CreatedAt: time.Now(), UpdatedAt: time.Now()},
		{ID: uuid.New().String(), Name: "Selada Romaine", Description: "Selada romaine hidroponik, renyah untuk salad.", Price: 12000, Stock: 40, CategoryID: catDaun.ID, SupplierID: supplierID, CreatedAt: time.Now(), UpdatedAt: time.Now()},
		{ID: uuid.New().String(), Name: "Tomat Merah", Description: "Tomat merah matang sempurna. Segar dari kebun.", Price: 10000, Stock: 120, CategoryID: catBuah.ID, SupplierID: supplierID, CreatedAt: time.Now(), UpdatedAt: time.Now()},
		{ID: uuid.New().String(), Name: "Cabai Rawit", Description: "Cabai rawit merah, pedas mantap untuk sambal.", Price: 25000, Stock: 50, CategoryID: catBuah.ID, SupplierID: supplierID, CreatedAt: time.Now(), UpdatedAt: time.Now()},
		{ID: uuid.New().String(), Name: "Paprika Merah", Description: "Paprika merah manis, cocok untuk salad dan tumisan.", Price: 35000, Stock: 30, CategoryID: catBuah.ID, SupplierID: supplierID, CreatedAt: time.Now(), UpdatedAt: time.Now()},
		{ID: uuid.New().String(), Name: "Terong Ungu", Description: "Terong ungu segar, pas untuk balado dan terong goreng.", Price: 8000, Stock: 70, CategoryID: catBuah.ID, SupplierID: supplierID, CreatedAt: time.Now(), UpdatedAt: time.Now()},
		{ID: uuid.New().String(), Name: "Wortel", Description: "Wortel organik manis, kaya beta-karoten.", Price: 12000, Stock: 90, CategoryID: catUmbi.ID, SupplierID: supplierID, CreatedAt: time.Now(), UpdatedAt: time.Now()},
		{ID: uuid.New().String(), Name: "Kentang", Description: "Kentang segar dari Dieng. Cocok untuk sup dan goreng.", Price: 15000, Stock: 100, CategoryID: catUmbi.ID, SupplierID: supplierID, CreatedAt: time.Now(), UpdatedAt: time.Now()},
		{ID: uuid.New().String(), Name: "Bawang Merah", Description: "Bawang merah Brebes pilihan, harum dan pedas.", Price: 30000, Stock: 80, CategoryID: catBumbu.ID, SupplierID: supplierID, CreatedAt: time.Now(), UpdatedAt: time.Now()},
		{ID: uuid.New().String(), Name: "Bawang Putih", Description: "Bawang putih tunggal, aroma kuat untuk masakan.", Price: 35000, Stock: 60, CategoryID: catBumbu.ID, SupplierID: supplierID, CreatedAt: time.Now(), UpdatedAt: time.Now()},
		{ID: uuid.New().String(), Name: "Jahe Merah", Description: "Jahe merah segar, cocok untuk wedang dan jamu.", Price: 20000, Stock: 45, CategoryID: catBumbu.ID, SupplierID: supplierID, CreatedAt: time.Now(), UpdatedAt: time.Now()},
		{ID: uuid.New().String(), Name: "Brokoli", Description: "Brokoli premium, kaya serat dan antioksidan.", Price: 18000, Stock: 35, CategoryID: catDaun.ID, SupplierID: supplierID, CreatedAt: time.Now(), UpdatedAt: time.Now()},
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

	log.Println("\n🎉 Seeding SayurSehat selesai!")
}
