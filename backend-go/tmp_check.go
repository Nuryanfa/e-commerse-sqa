package main

import (
	"fmt"
	"log"
	"os"

	"github.com/joho/godotenv"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func main() {
	if err := godotenv.Load("c:/xampp/htdocs/e-commerse-sqa/backend-go/.env"); err != nil {
		log.Fatal("Error loading .env file")
	}

	dsn := fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=%s sslmode=disable",
		os.Getenv("DB_HOST"), os.Getenv("DB_PORT"), os.Getenv("DB_USER"), os.Getenv("DB_PASSWORD"), os.Getenv("DB_NAME"))

	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}

	type Product struct {
		IDName     string `gorm:"column:name"`
		SupplierID string `gorm:"column:supplier_id"`
	}

	var products []Product
	if err := db.Table("products").Select("name, supplier_id").Find(&products).Error; err != nil {
		log.Fatal(err)
	}

	fmt.Println("=== DAFTAR PRODUK & SUPPLIER ID ===")
	for _, p := range products {
		supplierStr := p.SupplierID
		if supplierStr == "" {
			supplierStr = "NULL (Tidak ada pemilik)"
		}
		fmt.Printf("- Produk: %s | Supplier: %s\n", p.IDName, supplierStr)
	}
}
