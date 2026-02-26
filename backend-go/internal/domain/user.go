package domain

import "time"


type User struct {
	ID        string    `json:"id_user" db:"id_user"`
	Nama      string    `json:"nama" db:"nama" binding:"required,min=3,max=100"`
	Email     string    `json:"email" db:"email" binding:"required,email"`
	Password  string    `json:"-" db:"password" binding:"required,min=8"` // json:"-" Mencegah password bocor ke respons API
	Role      string    `json:"role" db:"role" binding:"required,oneof=pembeli admin suplier kurir"`
	CreatedAt time.Time `json:"created_at" db:"created_at"`
	UpdatedAt time.Time `json:"updated_at" db:"updated_at"`
}


type UserRepository interface {
	Create(user *User) error
	FindByEmail(email string) (*User, error)
	FindByID(id string) (*User, error)
}


type UserUsecase interface {
	Register(user *User) error
	Login(email, password string) (string, error) 
}