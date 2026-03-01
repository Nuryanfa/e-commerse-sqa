package main

import (
	"log"

	"github.com/nuryanfa/e-commerse-sqa/config"
	"github.com/nuryanfa/e-commerse-sqa/internal/domain"
)

func main() {
	db := config.InitDB()

	log.Println("Database opened. Fixing invalid supplier_id in products table...")

	// 1. Temukan ID Supplier dummy
	var supplier domain.User
	if err := db.Where("email = ?", "supplier@sayursehat.id").First(&supplier).Error; err != nil {
		log.Fatalf("Kesalahan: Supplier 'supplier@sayursehat.id' tidak ditemukan. Harap jalankan cmd/seed/main.go terlebih dahulu: %v", err)
	}

	log.Printf("Ditemukan Supplier ID: %s", supplier.ID)

	// 2. Timpa semua produk lama dengan supplier ID ini
	res := db.Exec("UPDATE products SET supplier_id = ? WHERE supplier_id = '' OR supplier_id IS NULL OR supplier_id NOT IN (SELECT id_user FROM users)", supplier.ID)
	if res.Error != nil {
		log.Fatalf("Kesalahan saat meng-update tabel produk: %v", res.Error)
	}

	log.Printf("Sukses! Telah memperbaiki %d baris produk. Sekarang Go Backend siap dijalankan.", res.RowsAffected)
}
