package usecase

import (
	"errors"
	"testing"
	"time"

	"github.com/nuryanfa/e-commerse-sqa/internal/domain"
	"github.com/nuryanfa/e-commerse-sqa/pkg/password"
)

// MockUserRepository implements domain.UserRepository for unit testing
type MockUserRepository struct {
	users map[string]*domain.User
}

func NewMockUserRepository() *MockUserRepository {
	return &MockUserRepository{
		users: make(map[string]*domain.User),
	}
}

func (m *MockUserRepository) Create(user *domain.User) error {
	m.users[user.Email] = user
	return nil
}

func (m *MockUserRepository) FindByEmail(email string) (*domain.User, error) {
	user, exists := m.users[email]
	if !exists {
		return nil, errors.New("user not found")
	}
	return user, nil
}

func (m *MockUserRepository) FindByID(id string) (*domain.User, error) {
	for _, user := range m.users {
		if user.ID == id {
			return user, nil
		}
	}
	return nil, errors.New("user not found")
}

// -----------------------------------------------------

func TestRegister_Success(t *testing.T) {
	mockRepo := NewMockUserRepository()
	usecase := NewUserUsecase(mockRepo)

	req := &domain.User{
		Nama:     "Tester",
		Email:    "test@example.com",
		Password: "password123",
	}

	err := usecase.Register(req)
	
	if err != nil {
		t.Fatalf("Expected no error, got %v", err)
	}

	// Verify User saved
	savedUser, err := mockRepo.FindByEmail("test@example.com")
	if err != nil || savedUser == nil {
		t.Fatalf("Expected user to be saved, got err: %v", err)
	}

	if savedUser.ID == "" {
		t.Errorf("Expected user ID to be generated")
	}
	
	if savedUser.Role != "pembeli" { // Default role
		t.Errorf("Expected default role 'pembeli', got %s", savedUser.Role)
	}

	// Verify password was hashed
	if savedUser.Password == "password123" {
		t.Errorf("Expected password to be hashed before saving")
	}

	if !password.CheckPasswordHash("password123", savedUser.Password) {
		t.Errorf("Expected hashed password to match original")
	}
}

func TestRegister_DuplicateEmail(t *testing.T) {
	mockRepo := NewMockUserRepository()
	
	// Create seed user
	mockRepo.users["existing@example.com"] = &domain.User{
		Nama:      "Existing",
		Email:     "existing@example.com",
		Password:  "hashed",
		Role:      "pembeli",
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	usecase := NewUserUsecase(mockRepo)

	req := &domain.User{
		Nama:     "Tester 2",
		Email:    "existing@example.com",
		Password: "password123",
	}

	err := usecase.Register(req)

	if err == nil {
		t.Fatalf("Expected error for duplicate email, got nil")
	}

	if err.Error() != "email sudah terdaftar" {
		t.Errorf("Expected error message 'email sudah terdaftar', got %v", err.Error())
	}
}

func TestLogin_Success(t *testing.T) {
	mockRepo := NewMockUserRepository()
	hashedPassword, _ := password.HashPassword("password123")
	
	mockRepo.users["test@example.com"] = &domain.User{
		ID:        "user-id-123",
		Nama:      "Tester",
		Email:     "test@example.com",
		Password:  hashedPassword,
		Role:      "pembeli",
	}

	usecase := NewUserUsecase(mockRepo)

	token, err := usecase.Login("test@example.com", "password123")

	if err != nil {
		t.Fatalf("Expected login to succeed, got error: %v", err)
	}

	if token == "" {
		t.Errorf("Expected a JWT token, got empty string")
	}
}

func TestLogin_WrongPassword(t *testing.T) {
	mockRepo := NewMockUserRepository()
	hashedPassword, _ := password.HashPassword("password123")
	
	mockRepo.users["test@example.com"] = &domain.User{
		ID:        "user-id-123",
		Nama:      "Tester",
		Email:     "test@example.com",
		Password:  hashedPassword,
		Role:      "pembeli",
	}

	usecase := NewUserUsecase(mockRepo)

	_, err := usecase.Login("test@example.com", "wrongpass")

	if err == nil {
		t.Fatalf("Expected login to fail, got success")
	}

	if err.Error() != "email atau password salah" {
		t.Errorf("Expected error 'email atau password salah', got %v", err.Error())
	}
}
