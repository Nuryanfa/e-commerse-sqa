package domain

import (
	"time"

	"gorm.io/gorm"
)


type User struct {
	ID        string    `json:"id_user" gorm:"column:id_user;primaryKey"`
	Nama      string    `json:"nama" gorm:"column:nama" binding:"required,min=3,max=100"`
	Email     string    `gorm:"type:varchar(255);unique;not null;column:email" json:"email"`
	Password  string    `gorm:"type:varchar(255);not null;column:password" json:"password"`
	Role      string    `gorm:"type:varchar(50);not null;column:role" json:"role"`
	Phone     string    `gorm:"type:varchar(20);column:phone" json:"phone"`
	Address   string    `gorm:"type:text;column:address" json:"address"`
	CreatedAt time.Time      `gorm:"autoCreateTime;column:created_at" json:"created_at"`
	UpdatedAt time.Time      `gorm:"autoUpdateTime;column:updated_at" json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index;column:deleted_at" json:"-"`
}


type UserRepository interface {
	Create(user *User) error
	FindByEmail(email string) (*User, error)
	FindByID(id string) (*User, error)
	Update(user *User) error
}

// UserUsecase defines the business logic operations
type UserUsecase interface {
	Register(user *User) error
	Login(email, password string) (string, string, error)
	UpdateProfile(userID, name, phone, address string) error
}