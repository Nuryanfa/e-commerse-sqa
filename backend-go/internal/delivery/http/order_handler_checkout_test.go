package http

import (
	"errors"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/nuryanfa/e-commerse-sqa/internal/domain"
)

type mockOrderUsecaseForHandler struct {
	checkoutErr error
	ordersErr   error
}

func (m *mockOrderUsecaseForHandler) Checkout(userID string, voucherCode string) (*domain.Order, error) {
	if m.checkoutErr != nil {
		return nil, m.checkoutErr
	}
	return &domain.Order{ID: "order-1", UserID: userID, Status: "PENDING", TotalAmount: 10000}, nil
}

func (m *mockOrderUsecaseForHandler) GetMyOrders(userID string) ([]domain.Order, error) {
	if m.ordersErr != nil {
		return nil, m.ordersErr
	}
	return []domain.Order{{ID: "order-1", UserID: userID, Status: "PENDING"}}, nil
}

func (m *mockOrderUsecaseForHandler) InstantCheckout(userID string, productID string, variantID *string, quantity int, voucherCode string) (*domain.Order, error) {
	return nil, nil
}
func (m *mockOrderUsecaseForHandler) GetOrderDetail(userID string, orderID string) (*domain.Order, error) {
	return nil, nil
}
func (m *mockOrderUsecaseForHandler) PayOrder(orderID string) error { return nil }
func (m *mockOrderUsecaseForHandler) GetPaidOrders() ([]domain.Order, error) {
	return nil, nil
}
func (m *mockOrderUsecaseForHandler) AssignAndShip(orderID string, courierID string) error {
	return nil
}
func (m *mockOrderUsecaseForHandler) MarkDelivered(orderID string, courierID string) error {
	return nil
}
func (m *mockOrderUsecaseForHandler) GetCourierOrders(courierID string) ([]domain.Order, error) {
	return nil, nil
}
func (m *mockOrderUsecaseForHandler) GetSupplierOrders(supplierID string) ([]domain.Order, error) {
	return nil, nil
}
func (m *mockOrderUsecaseForHandler) ProcessSupplierOrder(supplierID string, orderID string) error {
	return nil
}
func (m *mockOrderUsecaseForHandler) BatchProcessSupplierOrders(supplierID string, orderIDs []string) error {
	return nil
}
func (m *mockOrderUsecaseForHandler) ProcessPaymentWebhook(payload map[string]interface{}) error {
	return nil
}
func (m *mockOrderUsecaseForHandler) SyncMidtransStatus(orderID string) error { return nil }
func (m *mockOrderUsecaseForHandler) ProcessCancelExpiredJobs() (int, error) { return 0, nil }
func (m *mockOrderUsecaseForHandler) CancelOrder(userID string, orderID string) error {
	return nil
}

var _ domain.OrderUsecase = (*mockOrderUsecaseForHandler)(nil)

func runHandlerRequest(handler gin.HandlerFunc, userID interface{}, hasUser bool) *httptest.ResponseRecorder {
	gin.SetMode(gin.TestMode)
	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)
	c.Request = httptest.NewRequest(http.MethodPost, "/orders/checkout", strings.NewReader("{}"))
	c.Request.Header.Set("Content-Type", "application/json")
	if hasUser {
		c.Set("user_id", userID)
	}
	handler(c)
	return w
}

func TestOrderHandlerCheckout_Paths(t *testing.T) {
	tests := []struct {
		name       string
		userID     interface{}
		hasUser    bool
		usecaseErr error
		wantStatus int
	}{
		{"H-1 user_id tidak ada", nil, false, nil, http.StatusUnauthorized},
		{"H-2 user_id bukan string", 12345, true, nil, http.StatusUnauthorized},
		{"H-3 usecase error", "user-1", true, errors.New("keranjang belanja anda kosong. tidak bisa checkout"), http.StatusBadRequest},
		{"H-4 checkout sukses", "user-1", true, nil, http.StatusCreated},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			h := &OrderHandler{orderUsecase: &mockOrderUsecaseForHandler{checkoutErr: tt.usecaseErr}}
			w := runHandlerRequest(h.Checkout, tt.userID, tt.hasUser)
			if w.Code != tt.wantStatus {
				t.Fatalf("expected HTTP %d, got %d. body=%s", tt.wantStatus, w.Code, w.Body.String())
			}
		})
	}
}

func TestOrderHandlerGetMyOrders_Paths(t *testing.T) {
	tests := []struct {
		name       string
		userID     interface{}
		hasUser    bool
		usecaseErr error
		wantStatus int
	}{
		{"G-1 user_id tidak ada", nil, false, nil, http.StatusUnauthorized},
		{"G-2 user_id bukan string", 12345, true, nil, http.StatusUnauthorized},
		{"G-3 usecase error", "user-1", true, errors.New("database unavailable"), http.StatusInternalServerError},
		{"G-4 sukses", "user-1", true, nil, http.StatusOK},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			h := &OrderHandler{orderUsecase: &mockOrderUsecaseForHandler{ordersErr: tt.usecaseErr}}
			w := httptest.NewRecorder()
			c, _ := gin.CreateTestContext(w)
			c.Request = httptest.NewRequest(http.MethodGet, "/orders", nil)
			if tt.hasUser {
				c.Set("user_id", tt.userID)
			}
			h.GetMyOrders(c)
			if w.Code != tt.wantStatus {
				t.Fatalf("expected HTTP %d, got %d. body=%s", tt.wantStatus, w.Code, w.Body.String())
			}
		})
	}
}
