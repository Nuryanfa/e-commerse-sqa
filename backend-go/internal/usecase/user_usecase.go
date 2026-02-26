package usecase

import (
	"errors"
	"time"

	"github.com/google/uuid"
	"github.com/nuryanfa/e-commerse-sqa/internal/domain"
	"github.com/nuryanfa/e-commerse-sqa/pkg/jwt"
	"github.com/nuryanfa/e-commerse-sqa/pkg/password"
)

type userUsecase struct {
	userRepo domain.UserRepository
}

// NewUserUsecase creates a new usecase instance
func NewUserUsecase(repo domain.UserRepository) domain.UserUsecase {
	return &userUsecase{
		userRepo: repo,
	}
}

func (u *userUsecase) Register(user *domain.User) error {
	// 1. Check if email already exists
	existingUser, _ := u.userRepo.FindByEmail(user.Email)
	if existingUser != nil {
		return errors.New("email sudah terdaftar")
	}

	// 2. Hash the password
	hashedPassword, err := password.HashPassword(user.Password)
	if err != nil {
		return errors.New("gagal memproses password")
	}
	user.Password = hashedPassword

	// 3. Set default values
	user.ID = uuid.New().String()
	user.CreatedAt = time.Now()
	user.UpdatedAt = time.Now()

	// Set default role if not provided
	if user.Role == "" {
		user.Role = "pembeli" // Default
	}

	// 4. Save to database
	return u.userRepo.Create(user)
}

func (u *userUsecase) Login(email, pass string) (string, error) {
	// 1. Find user by email
	user, err := u.userRepo.FindByEmail(email)
	if err != nil {
		return "", errors.New("email atau password salah")
	}

	// 2. Compare password
	if !password.CheckPasswordHash(pass, user.Password) {
		return "", errors.New("email atau password salah")
	}

	// 3. Generate JWT Token
	token, err := jwt.GenerateToken(user.ID, user.Role)
	if err != nil {
		return "", errors.New("gagal membuat token sesi")
	}

	return token, nil
}
