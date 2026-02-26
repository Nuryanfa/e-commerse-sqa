package domain

import "time"


type User struct {
	ID        string    `json:"id_user" gorm:"column:id_user;primaryKey"`
	Nama      string    `json:"nama" gorm:"column:nama" binding:"required,min=3,max=100"`
	Email     string    `json:"email" gorm:"column:email" binding:"required,email"`
	Password  string    `json:"-" gorm:"column:password" binding:"required,min=8"` // json:"-" Mencegah password bocor ke respons API
	Role      string    `json:"role" gorm:"column:role"`                           // Tidak di-bind dari JSON — hanya di-set server-side (di Usecase)
	CreatedAt time.Time `json:"created_at" gorm:"column:created_at"`
	UpdatedAt time.Time `json:"updated_at" gorm:"column:updated_at"`
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