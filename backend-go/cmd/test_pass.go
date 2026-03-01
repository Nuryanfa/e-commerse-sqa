//go:build ignore

package main

import (
	"fmt"

	"github.com/nuryanfa/e-commerse-sqa/config"
	"github.com/nuryanfa/e-commerse-sqa/internal/domain"
	password "github.com/nuryanfa/e-commerse-sqa/pkg/password"
)

func main() {
	db := config.InitDB()
	var users []domain.User
	db.Find(&users)

	fmt.Println("\n--- USERS IN DB ---")
	for _, u := range users {
		valid := password.CheckPasswordHash("password123", u.Password)
		fmt.Printf("Email: %s | Role: %s | Has Valid password123: %v\n", u.Email, u.Role, valid)
	}
	fmt.Println("-------------------\n")
}
