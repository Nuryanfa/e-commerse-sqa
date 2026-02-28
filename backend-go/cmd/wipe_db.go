package main

import (
	"fmt"

	"github.com/nuryanfa/e-commerse-sqa/config"
)

func main() {
	db := config.InitDB()
	
	// Delete all users
	db.Exec("TRUNCATE TABLE users CASCADE;")
	fmt.Println("Users table cleared.")
}
