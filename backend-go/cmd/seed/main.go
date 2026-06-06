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
		{ID: uuid.New().String(), Name: "Bayam Organik Segar (Ikat)", Description: "Bayam hijau segar dari kebun lokal, cocok untuk sayur bening, tumisan, dan jus.", Price: 7500, Stock: 50, CategoryID: catDaunID, SupplierID: supplier1ID, ImageURL: "/images/products/bayam-organik.webp", IsActive: true, CreatedAt: time.Now(), UpdatedAt: time.Now()},
		{ID: uuid.New().String(), Name: "Kangkung Hidroponik (Ikat)", Description: "Kangkung hidroponik berakar bersih dengan batang renyah untuk tumisan.", Price: 6000, Stock: 80, CategoryID: catDaunID, SupplierID: supplier1ID, ImageURL: "/images/products/kangkung-hidroponik.webp", IsActive: true, CreatedAt: time.Now(), UpdatedAt: time.Now()},
		{ID: uuid.New().String(), Name: "Sawi Putih Pilihan (Kg)", Description: "Sawi putih padat dan segar untuk capcay, sup, serta fermentasi kimchi.", Price: 12000, Stock: 35, CategoryID: catDaunID, SupplierID: supplier1ID, ImageURL: "/images/products/sawi-putih.webp", IsActive: true, CreatedAt: time.Now(), UpdatedAt: time.Now()},
		{ID: uuid.New().String(), Name: "Pakcoy Mini (500g)", Description: "Pakcoy muda bertekstur lembut, ideal untuk sup, tumis, dan hidangan berkuah.", Price: 9000, Stock: 40, CategoryID: catDaunID, SupplierID: supplier1ID, ImageURL: "/images/products/pakcoy-mini.webp", IsActive: true, CreatedAt: time.Now(), UpdatedAt: time.Now()},
		{ID: uuid.New().String(), Name: "Tomat Ceri Segar (250g)", Description: "Tomat ceri matang dengan rasa manis segar untuk salad dan camilan sehat.", Price: 18000, Stock: 30, CategoryID: catBuahID, SupplierID: supplier1ID, ImageURL: "/images/products/tomat-ceri.webp", IsActive: true, CreatedAt: time.Now(), UpdatedAt: time.Now()},
		{ID: uuid.New().String(), Name: "Terong Ungu Premium (Kg)", Description: "Terong ungu segar dengan daging lembut, cocok untuk balado dan tumisan.", Price: 14000, Stock: 60, CategoryID: catBuahID, SupplierID: supplier1ID, ImageURL: "/images/products/terong-ungu.webp", IsActive: true, CreatedAt: time.Now(), UpdatedAt: time.Now()},
		{ID: uuid.New().String(), Name: "Pare Hijau Super (Kg)", Description: "Pare hijau segar dengan tekstur renyah, pilihan baik untuk tumisan dan siomai.", Price: 11000, Stock: 35, CategoryID: catBuahID, SupplierID: supplier1ID, ImageURL: "/images/products/pare-hijau.webp", IsActive: true, CreatedAt: time.Now(), UpdatedAt: time.Now()},

		// Produk Supplier 2 (Sayur Organik Brebes - Fokus Umbi & Bumbu)
		{ID: uuid.New().String(), Name: "Bawang Merah Brebes (Kg)", Description: "Bawang merah Brebes beraroma kuat untuk bumbu dasar dan taburan bawang goreng.", Price: 42000, Stock: 100, CategoryID: catBumbuID, SupplierID: supplier2ID, ImageURL: "/images/products/bawang-merah.webp", IsActive: true, CreatedAt: time.Now(), UpdatedAt: time.Now()},
		{ID: uuid.New().String(), Name: "Bawang Putih Kating (Kg)", Description: "Bawang putih kating berumbi besar dengan aroma kuat untuk berbagai masakan.", Price: 38000, Stock: 120, CategoryID: catBumbuID, SupplierID: supplier2ID, ImageURL: "/images/products/bawang-putih.webp", IsActive: true, CreatedAt: time.Now(), UpdatedAt: time.Now()},
		{ID: uuid.New().String(), Name: "Cabai Rawit Merah (Kg)", Description: "Cabai rawit merah segar dengan tingkat kepedasan tinggi untuk sambal dan bumbu.", Price: 85000, Stock: 25, CategoryID: catBuahID, SupplierID: supplier2ID, ImageURL: "/images/products/cabai-rawit-merah.webp", IsActive: true, CreatedAt: time.Now(), UpdatedAt: time.Now()},
		{ID: uuid.New().String(), Name: "Kentang Dieng Besar (Kg)", Description: "Kentang Dieng bertekstur pulen untuk perkedel, sup, dan kentang goreng.", Price: 21000, Stock: 90, CategoryID: catUmbiID, SupplierID: supplier2ID, ImageURL: "/images/products/kentang-dieng.webp", IsActive: true, CreatedAt: time.Now(), UpdatedAt: time.Now()},
		{ID: uuid.New().String(), Name: "Wortel Berastagi Manis (Kg)", Description: "Wortel segar berwarna cerah dengan rasa manis alami untuk masakan dan jus.", Price: 16000, Stock: 70, CategoryID: catUmbiID, SupplierID: supplier2ID, ImageURL: "/images/products/wortel-berastagi.webp", IsActive: true, CreatedAt: time.Now(), UpdatedAt: time.Now()},
		{ID: uuid.New().String(), Name: "Jahe Merah Segar (250g)", Description: "Jahe segar beraroma hangat untuk minuman herbal, wedang, dan bumbu masakan.", Price: 15000, Stock: 45, CategoryID: catBumbuID, SupplierID: supplier2ID, ImageURL: "/images/products/jahe-merah.webp", IsActive: true, CreatedAt: time.Now(), UpdatedAt: time.Now()},
		{ID: uuid.New().String(), Name: "Kunyit Induk (500g)", Description: "Kunyit induk segar untuk bumbu, jamu, dan pewarna alami makanan.", Price: 10000, Stock: 55, CategoryID: catBumbuID, SupplierID: supplier2ID, ImageURL: "/images/products/kunyit-induk.webp", IsActive: true, CreatedAt: time.Now(), UpdatedAt: time.Now()},
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
