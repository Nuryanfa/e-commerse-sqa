package jwt

import (
	"errors"
	"log"
	"os"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

// getSecretKey returns the JWT secret from environment variables.
// [SQA SECURITY FIX K8] JWT_SECRET WAJIB diisi di .env dengan minimal 32 karakter.
// Server akan CRASH jika secret tidak tersedia — mencegah penggunaan secret lemah di production.
func getSecretKey() []byte {
	secret := os.Getenv("JWT_SECRET")
	if secret == "" {
		log.Fatal("[FATAL SECURITY] JWT_SECRET environment variable TIDAK diset. Server menolak untuk berjalan tanpa secret yang kuat.")
	}
	if len(secret) < 32 {
		log.Fatal("[FATAL SECURITY] JWT_SECRET terlalu pendek (minimal 32 karakter). Gunakan: openssl rand -base64 48")
	}
	return []byte(secret)
}

// GenerateToken creates a new JWT token for a user ID and role with a 24-hour expiration.
func GenerateToken(userID, role, nama string) (string, error) {
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"user_id": userID,
		"role":    role,
		"nama":    nama,
		"exp":     time.Now().Add(time.Hour * 24).Unix(),
	})

	tokenString, err := token.SignedString(getSecretKey())
	if err != nil {
		return "", err
	}

	return tokenString, nil
}

// ValidateToken parses and validates a JWT token string.
func ValidateToken(tokenString string) (jwt.MapClaims, error) {
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		// Validate the alg is what we expect
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, errors.New("unexpected signing method")
		}
		return getSecretKey(), nil
	})

	if err != nil {
		return nil, err
	}

	if claims, ok := token.Claims.(jwt.MapClaims); ok && token.Valid {
		return claims, nil
	}

	return nil, errors.New("invalid token")
}
