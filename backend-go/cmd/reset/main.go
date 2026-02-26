package main

import (
	"log"

	"github.com/nuryanfa/e-commerse-sqa/config"
)

func main() {
	db := config.InitDB()

	tables := []string{"order_items", "orders", "cart_items", "products", "categories", "users"}

	for _, table := range tables {
		if err := db.Exec("DROP TABLE IF EXISTS \"" + table + "\" CASCADE").Error; err != nil {
			log.Printf("❌ Gagal drop table %s: %v", table, err)
		} else {
			log.Printf("✅ Table '%s' berhasil di-drop", table)
		}
	}

	log.Println("\n🎉 Semua table lama berhasil di-drop. Jalankan seeder ulang: go run cmd/seed/main.go")
}
