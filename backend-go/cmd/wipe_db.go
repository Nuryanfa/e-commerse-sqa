//go:build ignore

package main

import (
	"fmt"

	"github.com/nuryanfa/e-commerse-sqa/config"
)

func main() {
	db := config.InitDB()
	
	// Delete all data in all tables
	err := db.Exec(`TRUNCATE TABLE 
		users, categories, products, product_variants, 
		cart_items, orders, order_items, reviews, 
		wishlists, vouchers, audit_logs, disputes, dispute_messages 
		CASCADE;`).Error
	
	if err != nil {
		fmt.Printf("Gagal membersihkan database: %v\n", err)
		return
	}
	fmt.Println("Semua tabel berhasil dibersihkan (Wipe DB Berhasil).")
}
