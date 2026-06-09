package http

import (
	"errors"
	"net/http"
	"testing"
)

func TestPatternTesting_CheckoutErrorResponsePatterns(t *testing.T) {
	tests := []struct {
		id         string
		err        error
		wantStatus int
		pattern    string
	}{
		{
			id:         "PT-CHK-01-cart-empty-business-error",
			err:        errors.New("keranjang belanja anda kosong. tidak bisa checkout"),
			wantStatus: http.StatusBadRequest,
			pattern:    "cart kosong -> 400",
		},
		{
			id:         "PT-CHK-02-stock-business-error",
			err:        errors.New("stok produk 'Pakcoy' tidak mencukupi. Stok tersisa: 0"),
			wantStatus: http.StatusBadRequest,
			pattern:    "stok kurang -> 400",
		},
		{
			id:         "PT-CHK-03-midtrans-gateway-error",
			err:        errors.New("midtrans: connection refused"),
			wantStatus: http.StatusBadGateway,
			pattern:    "midtrans error -> 502",
		},
		{
			id:         "PT-CHK-04-snap-gateway-error",
			err:        errors.New("snap token generation failed"),
			wantStatus: http.StatusBadGateway,
			pattern:    "snap error -> 502",
		},
		{
			id:         "PT-CHK-05-default-conflict-pattern",
			err:        errors.New("duplicate key value violates unique constraint"),
			wantStatus: http.StatusConflict,
			pattern:    "unknown checkout error -> 409",
		},
	}

	for _, tt := range tests {
		t.Run(tt.id, func(t *testing.T) {
			appErr := classifyCheckoutError(tt.err)
			if appErr == nil {
				t.Fatalf("%s: expected AppError, got nil", tt.pattern)
			}
			if appErr.Code != tt.wantStatus {
				t.Fatalf("%s: expected HTTP %d, got %d", tt.pattern, tt.wantStatus, appErr.Code)
			}
			if appErr.Code == http.StatusInternalServerError {
				t.Fatalf("%s: business/gateway pattern must not become HTTP 500", tt.pattern)
			}
		})
	}
}

func TestPatternTesting_CheckoutHandlerStatusPatterns(t *testing.T) {
	tests := []struct {
		id         string
		userID     interface{}
		hasUser    bool
		usecaseErr error
		wantStatus int
		pattern    string
	}{
		{
			id:         "PT-H-01-no-token",
			hasUser:    false,
			wantStatus: http.StatusUnauthorized,
			pattern:    "tanpa token -> 401",
		},
		{
			id:         "PT-H-02-invalid-user-context",
			userID:     12345,
			hasUser:    true,
			wantStatus: http.StatusUnauthorized,
			pattern:    "user_id invalid -> 401",
		},
		{
			id:         "PT-H-03-cart-empty",
			userID:     "user-pattern",
			hasUser:    true,
			usecaseErr: errors.New("keranjang belanja anda kosong. tidak bisa checkout"),
			wantStatus: http.StatusBadRequest,
			pattern:    "cart kosong -> 400",
		},
		{
			id:         "PT-H-04-stock-error",
			userID:     "user-pattern",
			hasUser:    true,
			usecaseErr: errors.New("Checkout gagal: stok produk 'Pakcoy' tidak mencukupi. Stok tersisa: 0"),
			wantStatus: http.StatusBadRequest,
			pattern:    "stok kurang -> 400",
		},
		{
			id:         "PT-H-05-midtrans-error",
			userID:     "user-pattern",
			hasUser:    true,
			usecaseErr: errors.New("midtrans: payment gateway unavailable"),
			wantStatus: http.StatusBadGateway,
			pattern:    "payment gateway -> 502",
		},
		{
			id:         "PT-H-06-success",
			userID:     "user-pattern",
			hasUser:    true,
			wantStatus: http.StatusCreated,
			pattern:    "checkout sukses -> 201",
		},
	}

	for _, tt := range tests {
		t.Run(tt.id, func(t *testing.T) {
			h := &OrderHandler{orderUsecase: &mockOrderUsecaseForHandler{checkoutErr: tt.usecaseErr}}
			w := runHandlerRequest(h.Checkout, tt.userID, tt.hasUser)
			if w.Code != tt.wantStatus {
				t.Fatalf("%s: expected HTTP %d, got %d. body=%s", tt.pattern, tt.wantStatus, w.Code, w.Body.String())
			}
			if w.Code == http.StatusInternalServerError {
				t.Fatalf("%s: checkout pattern must not become HTTP 500", tt.pattern)
			}
		})
	}
}
