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
	_ = db.AutoMigrate(&domain.User{}, &domain.Category{}, &domain.Product{}, &domain.ProductVariant{})

	// Hash password — semua dummy user pakai password yang sama: "password123"
	hashed, err := password.HashPassword("password123")
	if err != nil {
		log.Fatalf("Gagal hash password: %v", err)
	}

	// --- Seed Users (Aktor Riil) ---
	supplier1ID := uuid.New().String()
	supplier2ID := uuid.New().String()
	kurirID := uuid.New().String()
	pembeli1ID := uuid.New().String()
	pembeli2ID := uuid.New().String()
	adminID := uuid.New().String()

	users := []domain.User{
		{ID: adminID, Nama: "Admin Naufal", Email: "admin@sayursehat.id", Password: hashed, Role: "admin", Phone: "081234567890", Address: "Kantor Pusat SayurSehat, Jakarta", CreatedAt: time.Now(), UpdatedAt: time.Now()},
		{ID: supplier1ID, Nama: "Kebun Pak Budi", Email: "supplier1@sayursehat.id", Password: hashed, Role: "supplier", Phone: "085711112222", Address: "Lembang, Jawa Barat", CreatedAt: time.Now(), UpdatedAt: time.Now()},
		{ID: supplier2ID, Nama: "Sayur Organik Brebes", Email: "supplier2@sayursehat.id", Password: hashed, Role: "supplier", Phone: "081933334444", Address: "Brebes, Jawa Tengah", CreatedAt: time.Now(), UpdatedAt: time.Now()},
		{ID: kurirID, Nama: "Kurir Express", Email: "kurir@sayursehat.id", Password: hashed, Role: "courier", Phone: "081299998888", Address: "Hub Jakarta Selatan", CreatedAt: time.Now(), UpdatedAt: time.Now()},
		{ID: pembeli1ID, Nama: "Budi Santoso", Email: "pembeli1@sayursehat.id", Password: hashed, Role: "pembeli", Phone: "085677776666", Address: "Jl. Sudirman No 12, Jakarta", CreatedAt: time.Now(), UpdatedAt: time.Now()},
		{ID: pembeli2ID, Nama: "Siti Aisyah", Email: "pembeli2@sayursehat.id", Password: hashed, Role: "pembeli", Phone: "089655554444", Address: "Jl. Thamrin No 9, Jakarta", CreatedAt: time.Now(), UpdatedAt: time.Now()},
	}

	for _, u := range users {
		if err := db.Create(&u).Error; err != nil {
			log.Printf("❌ Gagal membuat user '%s': %v", u.Nama, err)
		} else {
			log.Printf("✅ User '%s' [%s] berhasil dibuat", u.Nama, u.Role)
		}
	}

	// --- Seed Categories ---
	catDaunID := uuid.New().String()
	catBuahID := uuid.New().String()
	catUmbiID := uuid.New().String()
	catBumbuID := uuid.New().String()

	categories := []domain.Category{
		{ID: catDaunID, Name: "Sayuran Daun", Description: "Sayuran hijau berdaun segar seperti bayam, kangkung", CreatedAt: time.Now(), UpdatedAt: time.Now()},
		{ID: catBuahID, Name: "Sayuran Buah", Description: "Sayuran hasil pembuahan seperti tomat, cabai, terong", CreatedAt: time.Now(), UpdatedAt: time.Now()},
		{ID: catUmbiID, Name: "Umbi-umbian", Description: "Sayuran dari akar atau batang bawah tanah seperti kentang, wortel", CreatedAt: time.Now(), UpdatedAt: time.Now()},
		{ID: catBumbuID, Name: "Bumbu Dapur", Description: "Rempah dan bumbu segar masakan seperti bawang, jahe", CreatedAt: time.Now(), UpdatedAt: time.Now()},
	}

	for _, cat := range categories {
		if err := db.Create(&cat).Error; err != nil {
			log.Printf("❌ Gagal membuat kategori '%s': %v", cat.Name, err)
		} else {
			log.Printf("✅ Kategori '%s' berhasil dibuat", cat.Name)
		}
	}

	// --- Seed Products ---
	products := []domain.Product{
		// Produk Supplier 1 (Kebun Pak Budi - Fokus Daun & Buah)
		{ID: uuid.New().String(), Name: "Bayam Merah Organik (Ikat)", Description: "Bayam merah super segar ditanam secara organik tanpa pestisida. Cocok buat sop atau jus.", Price: 7500, Stock: 50, CategoryID: catDaunID, SupplierID: supplier1ID, ImageURL: "https://images.unsplash.com/photo-1576045057995-568f588f82fb?q=80&w=200&auto=format&fit=crop", CreatedAt: time.Now(), UpdatedAt: time.Now()},
		{ID: uuid.New().String(), Name: "Kangkung Hidroponik (Ikat)", Description: "Kangkung hidroponik akar bersih. Renyah saat ditumis.", Price: 6000, Stock: 80, CategoryID: catDaunID, SupplierID: supplier1ID, ImageURL: "https://images.unsplash.com/photo-1628773822503-eeac23ecfb0b?q=80&w=200&auto=format&fit=crop", CreatedAt: time.Now(), UpdatedAt: time.Now()},
		{ID: uuid.New().String(), Name: "Sawi Putih Pilihan (Kg)", Description: "Sawi putih segar, padat dan manis. Bagus untuk masakan capcay atau fermentasi kimchi.", Price: 12000, Stock: 30, CategoryID: catDaunID, SupplierID: supplier1ID, ImageURL: "https://images.unsplash.com/photo-1595855768297-8c4672621ecb?q=80&w=200&auto=format&fit=crop", CreatedAt: time.Now(), UpdatedAt: time.Now()},
		{ID: uuid.New().String(), Name: "Pakcoy Mini (Pouch 500g)", Description: "Pakcoy kecil yang lembut, favorit untuk menu restoran dan tumisan rumahan.", Price: 9000, Stock: 40, CategoryID: catDaunID, SupplierID: supplier1ID, ImageURL: "https://images.unsplash.com/photo-1582035272633-874db49dbec0?q=80&w=200&auto=format&fit=crop", CreatedAt: time.Now(), UpdatedAt: time.Now()},
		{ID: uuid.New().String(), Name: "Tomat Ceri Kencana (Pack 250g)", Description: "Tomat ceri merah menyala, manis dan segar, langsung dipetik dari dahan.", Price: 18000, Stock: 25, CategoryID: catBuahID, SupplierID: supplier1ID, ImageURL: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?q=80&w=200&auto=format&fit=crop", CreatedAt: time.Now(), UpdatedAt: time.Now()},
		{ID: uuid.New().String(), Name: "Terong Ungu Premium (Kg)", Description: "Terong ungu berkilau tanpa cacat. Pas untuk balado atau terong krispi.", Price: 14000, Stock: 60, CategoryID: catBuahID, SupplierID: supplier1ID, ImageURL: "https://images.unsplash.com/photo-1650831682496-e24c2fc9dfac?q=80&w=200&auto=format&fit=crop", CreatedAt: time.Now(), UpdatedAt: time.Now()},
		{ID: uuid.New().String(), Name: "Pare Hijau Super (Kg)", Description: "Pare hijau kualitas ekspor, pahitnya pas untuk kesehatan.", Price: 11000, Stock: 35, CategoryID: catBuahID, SupplierID: supplier1ID, ImageURL: "https://images.unsplash.com/photo-1594916183311-6df7beba8cc0?q=80&w=200&auto=format&fit=crop", CreatedAt: time.Now(), UpdatedAt: time.Now()},

		// Produk Supplier 2 (Sayur Organik Brebes - Fokus Umbi & Bumbu)
		{ID: uuid.New().String(), Name: "Bawang Merah Brebes (Kg)", Description: "Bawang merah asli Brebes grade A. Ukuran besar dan aroma tajam yang menggugah selera.", Price: 42000, Stock: 100, CategoryID: catBumbuID, SupplierID: supplier2ID, ImageURL: "https://images.unsplash.com/photo-1628773822503-eeac23ecfb0b?q=80&w=200&auto=format&fit=crop", CreatedAt: time.Now(), UpdatedAt: time.Now()},
		{ID: uuid.New().String(), Name: "Bawang Putih Kating (Kg)", Description: "Bawang putih kating tanpa bahan pemutih. Wangi kuat untuk bumbu dasar.", Price: 38000, Stock: 150, CategoryID: catBumbuID, SupplierID: supplier2ID, ImageURL: "https://images.unsplash.com/photo-1615486511484-93ff51bef78e?q=80&w=200&auto=format&fit=crop", CreatedAt: time.Now(), UpdatedAt: time.Now()},
		{ID: uuid.New().String(), Name: "Cabai Rawit Merah Setan (Kg)", Description: "Cabai rawit super pedas segar dari petani lokal. Bikin nangis!", Price: 85000, Stock: 20, CategoryID: catBuahID, SupplierID: supplier2ID, ImageURL: "https://images.unsplash.com/photo-1588013273468-315fd88ea34c?q=80&w=200&auto=format&fit=crop", CreatedAt: time.Now(), UpdatedAt: time.Now()},
		{ID: uuid.New().String(), Name: "Kentang Dieng Besar (Kg)", Description: "Kentang khas Dieng kuning dan pulen. Cocok untuk french fries atau perkedel.", Price: 21000, Stock: 90, CategoryID: catUmbiID, SupplierID: supplier2ID, ImageURL: "https://images.unsplash.com/photo-1518977676601-b53f82aba655?q=80&w=200&auto=format&fit=crop", CreatedAt: time.Now(), UpdatedAt: time.Now()},
		{ID: uuid.New().String(), Name: "Wortel Berastagi Manis (Kg)", Description: "Wortel dengan warna orange cerah alami, sangat manis jika di jus.", Price: 16000, Stock: 70, CategoryID: catUmbiID, SupplierID: supplier2ID, ImageURL: "https://images.unsplash.com/photo-1598170845058-20eb81ceec78?q=80&w=200&auto=format&fit=crop", CreatedAt: time.Now(), UpdatedAt: time.Now()},
		{ID: uuid.New().String(), Name: "Jahe Merah Super (250g)", Description: "Jahe merah tua kaya minyak atsiri. Cocok diseduh saat hujan.", Price: 15000, Stock: 40, CategoryID: catBumbuID, SupplierID: supplier2ID, ImageURL: "https://images.unsplash.com/photo-1620980918735-d225dcac1048?q=80&w=200&auto=format&fit=crop", CreatedAt: time.Now(), UpdatedAt: time.Now()},
		{ID: uuid.New().String(), Name: "Kunyit Induk (500g)", Description: "Kunyit warna kuning tajam yang memberikan warna alami pada makanan Anda.", Price: 10000, Stock: 55, CategoryID: catBumbuID, SupplierID: supplier2ID, ImageURL: "https://images.unsplash.com/photo-1615486511484-93ff51bef78e?q=80&w=200&auto=format&fit=crop", CreatedAt: time.Now(), UpdatedAt: time.Now()},
	}

	for _, prod := range products {
		if err := db.Create(&prod).Error; err != nil {
			log.Printf("❌ Gagal membuat produk '%s': %v", prod.Name, err)
		} else {
			log.Printf("✅ Produk '%s' (Rp %.0f) berhasil dibuat", prod.Name, prod.Price)
		}
	}

	log.Println("\n🎉 SEEDING DATA RIIL SAYURSEHAT 100% SELESAI!")
	log.Println("Silakan login menggunakan email berikut:")
	log.Println("- admin@sayursehat.id | supplier1@sayursehat.id | supplier2@sayursehat.id")
	log.Println("- kurir@sayursehat.id | pembeli1@sayursehat.id  | pembeli2@sayursehat.id")
	log.Println("(Semua password: password123)")
}
