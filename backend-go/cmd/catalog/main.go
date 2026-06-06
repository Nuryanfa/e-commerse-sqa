package main

import (
	"context"
	"errors"
	"log"
	"time"

	"github.com/google/uuid"
	"github.com/nuryanfa/e-commerse-sqa/config"
	"github.com/nuryanfa/e-commerse-sqa/internal/domain"
	"gorm.io/gorm"
)

type catalogProduct struct {
	Name          string
	Description   string
	Price         float64
	Stock         int
	CategoryName  string
	SupplierEmail string
	ImageURL      string
}

var catalog = []catalogProduct{
	{"Bayam Organik Segar (Ikat)", "Bayam hijau segar dari kebun lokal, cocok untuk sayur bening, tumisan, dan jus.", 7500, 50, "Sayuran Daun", "supplier1@sayursehat.id", "/images/products/bayam-organik.webp"},
	{"Kangkung Hidroponik (Ikat)", "Kangkung hidroponik berakar bersih dengan batang renyah untuk tumisan.", 6000, 80, "Sayuran Daun", "supplier1@sayursehat.id", "/images/products/kangkung-hidroponik.webp"},
	{"Pakcoy Mini (500g)", "Pakcoy muda bertekstur lembut, ideal untuk sup, tumis, dan hidangan berkuah.", 9000, 40, "Sayuran Daun", "supplier1@sayursehat.id", "/images/products/pakcoy-mini.webp"},
	{"Sawi Putih Pilihan (Kg)", "Sawi putih padat dan segar untuk capcay, sup, serta fermentasi kimchi.", 12000, 35, "Sayuran Daun", "supplier1@sayursehat.id", "/images/products/sawi-putih.webp"},
	{"Tomat Ceri Segar (250g)", "Tomat ceri matang dengan rasa manis segar untuk salad dan camilan sehat.", 18000, 30, "Sayuran Buah", "supplier1@sayursehat.id", "/images/products/tomat-ceri.webp"},
	{"Terong Ungu Premium (Kg)", "Terong ungu segar dengan daging lembut, cocok untuk balado dan tumisan.", 14000, 60, "Sayuran Buah", "supplier1@sayursehat.id", "/images/products/terong-ungu.webp"},
	{"Pare Hijau Super (Kg)", "Pare hijau segar dengan tekstur renyah, pilihan baik untuk tumisan dan siomai.", 11000, 35, "Sayuran Buah", "supplier1@sayursehat.id", "/images/products/pare-hijau.webp"},
	{"Cabai Rawit Merah (Kg)", "Cabai rawit merah segar dengan tingkat kepedasan tinggi untuk sambal dan bumbu.", 85000, 25, "Sayuran Buah", "supplier2@sayursehat.id", "/images/products/cabai-rawit-merah.webp"},
	{"Kentang Dieng Besar (Kg)", "Kentang Dieng bertekstur pulen untuk perkedel, sup, dan kentang goreng.", 21000, 90, "Umbi-umbian", "supplier2@sayursehat.id", "/images/products/kentang-dieng.webp"},
	{"Wortel Berastagi Manis (Kg)", "Wortel segar berwarna cerah dengan rasa manis alami untuk masakan dan jus.", 16000, 70, "Umbi-umbian", "supplier2@sayursehat.id", "/images/products/wortel-berastagi.webp"},
	{"Bawang Merah Brebes (Kg)", "Bawang merah Brebes beraroma kuat untuk bumbu dasar dan taburan bawang goreng.", 42000, 100, "Bumbu Dapur", "supplier2@sayursehat.id", "/images/products/bawang-merah.webp"},
	{"Bawang Putih Kating (Kg)", "Bawang putih kating berumbi besar dengan aroma kuat untuk berbagai masakan.", 38000, 120, "Bumbu Dapur", "supplier2@sayursehat.id", "/images/products/bawang-putih.webp"},
	{"Jahe Merah Segar (250g)", "Jahe segar beraroma hangat untuk minuman herbal, wedang, dan bumbu masakan.", 15000, 45, "Bumbu Dapur", "supplier2@sayursehat.id", "/images/products/jahe-merah.webp"},
	{"Kunyit Induk (500g)", "Kunyit induk segar untuk bumbu, jamu, dan pewarna alami makanan.", 10000, 55, "Bumbu Dapur", "supplier2@sayursehat.id", "/images/products/kunyit-induk.webp"},
}

func main() {
	db := config.InitDB()
	if err := db.AutoMigrate(&domain.Product{}); err != nil {
		log.Fatalf("Gagal memperbarui struktur produk: %v", err)
	}

	categoryIDs, err := loadCategoryIDs(db)
	if err != nil {
		log.Fatal(err)
	}
	supplierIDs, err := loadSupplierIDs(db)
	if err != nil {
		log.Fatal(err)
	}

	if err := db.Transaction(func(tx *gorm.DB) error {
		for _, item := range catalog {
			if err := upsertProduct(tx, item, categoryIDs[item.CategoryName], supplierIDs[item.SupplierEmail]); err != nil {
				return err
			}
		}
		return archiveNonCatalogProducts(tx)
	}); err != nil {
		log.Fatalf("Sinkronisasi katalog dibatalkan: %v", err)
	}

	clearProductCache()
	log.Printf("Katalog production berhasil disinkronkan: %d produk aktif.", len(catalog))
}

func loadCategoryIDs(db *gorm.DB) (map[string]string, error) {
	result := make(map[string]string)
	for _, item := range catalog {
		if _, exists := result[item.CategoryName]; exists {
			continue
		}
		var category domain.Category
		if err := db.Where("name = ?", item.CategoryName).First(&category).Error; err != nil {
			return nil, errors.New("kategori tidak ditemukan: " + item.CategoryName)
		}
		result[item.CategoryName] = category.ID
	}
	return result, nil
}

func loadSupplierIDs(db *gorm.DB) (map[string]string, error) {
	result := make(map[string]string)
	for _, item := range catalog {
		if _, exists := result[item.SupplierEmail]; exists {
			continue
		}
		var supplier domain.User
		if err := db.Where("email = ? AND role = ?", item.SupplierEmail, "supplier").First(&supplier).Error; err != nil {
			return nil, errors.New("supplier tidak ditemukan: " + item.SupplierEmail)
		}
		result[item.SupplierEmail] = supplier.ID
	}
	return result, nil
}

func upsertProduct(db *gorm.DB, item catalogProduct, categoryID, supplierID string) error {
	var product domain.Product
	err := db.Unscoped().Where("name = ?", item.Name).First(&product).Error
	if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
		return err
	}

	now := time.Now()
	if errors.Is(err, gorm.ErrRecordNotFound) {
		product.ID = uuid.NewString()
		product.Name = item.Name
		product.CreatedAt = now
	}

	product.Description = item.Description
	product.Price = item.Price
	product.Stock = item.Stock
	product.CategoryID = categoryID
	product.SupplierID = supplierID
	product.ImageURL = item.ImageURL
	product.IsActive = true
	product.DeletedAt = gorm.DeletedAt{}
	product.UpdatedAt = now

	return db.Unscoped().Save(&product).Error
}

func archiveNonCatalogProducts(db *gorm.DB) error {
	canonicalNames := make([]string, 0, len(catalog))
	for _, item := range catalog {
		canonicalNames = append(canonicalNames, item.Name)
	}

	return db.Model(&domain.Product{}).
		Where("name NOT IN ?", canonicalNames).
		Update("is_active", false).Error
}

func clearProductCache() {
	client := config.InitRedis()
	if client == nil {
		return
	}
	defer client.Close()

	ctx := context.Background()
	iter := client.Scan(ctx, 0, "products:*", 100).Iterator()
	for iter.Next(ctx) {
		_ = client.Del(ctx, iter.Val()).Err()
	}
}
