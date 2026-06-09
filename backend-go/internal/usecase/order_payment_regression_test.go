package usecase

import (
	"strings"
	"testing"

	"github.com/nuryanfa/e-commerse-sqa/internal/domain"
)

type paymentRegressionRepo struct {
	MockOrderRepository
	order             domain.Order
	updateCalls       int
	conditionalCalls  int
	cancelCalls       int
	lastUpdatedStatus string
}

func (r *paymentRegressionRepo) FindByID(orderID string) (*domain.Order, error) {
	order := r.order
	return &order, nil
}

func (r *paymentRegressionRepo) UpdateStatus(orderID string, status string) error {
	r.updateCalls++
	r.lastUpdatedStatus = status
	r.order.Status = status
	return nil
}

func (r *paymentRegressionRepo) UpdateStatusIfCurrent(orderID string, currentStatuses []string, newStatus string) (bool, error) {
	r.conditionalCalls++
	for _, currentStatus := range currentStatuses {
		if r.order.Status == currentStatus {
			r.order.Status = newStatus
			r.lastUpdatedStatus = newStatus
			return true, nil
		}
	}
	return false, nil
}

func (r *paymentRegressionRepo) CancelOrderTransaction(orderID string) error {
	r.cancelCalls++
	r.order.Status = "CANCELLED"
	return nil
}

func TestPaymentRegression_PayOrderCannotSetPaidManually(t *testing.T) {
	repo := &paymentRegressionRepo{
		order: domain.Order{ID: "order-1", UserID: "buyer-1", Status: "PENDING"},
	}
	uc := NewOrderUsecase(repo, &MockCartRepository{}, nil, nil, nil)

	err := uc.PayOrder("order-1")
	if err == nil || !strings.Contains(err.Error(), "verifikasi Midtrans") {
		t.Fatalf("expected Midtrans verification error, got %v", err)
	}
	if repo.updateCalls != 0 || repo.conditionalCalls != 0 {
		t.Fatalf("manual payment must not update order status")
	}
}

func TestPaymentRegression_SettlementOnlyMovesPendingToPaid(t *testing.T) {
	repo := &paymentRegressionRepo{
		order: domain.Order{ID: "order-1", UserID: "buyer-1", Status: "PENDING"},
	}
	uc := NewOrderUsecase(repo, &MockCartRepository{}, nil, nil, nil)

	err := uc.ProcessPaymentWebhook(map[string]interface{}{
		"order_id":           "order-1",
		"transaction_status": "settlement",
	})
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if repo.order.Status != "PAID" {
		t.Fatalf("expected PAID, got %s", repo.order.Status)
	}
	if repo.conditionalCalls != 1 {
		t.Fatalf("expected one conditional status update, got %d", repo.conditionalCalls)
	}
}

func TestPaymentRegression_LateSettlementCannotReviveCancelledOrder(t *testing.T) {
	repo := &paymentRegressionRepo{
		order: domain.Order{ID: "order-1", UserID: "buyer-1", Status: "CANCELLED"},
	}
	uc := NewOrderUsecase(repo, &MockCartRepository{}, nil, nil, nil)

	err := uc.ProcessPaymentWebhook(map[string]interface{}{
		"order_id":           "order-1",
		"transaction_status": "settlement",
	})
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if repo.order.Status != "CANCELLED" {
		t.Fatalf("cancelled order was incorrectly changed to %s", repo.order.Status)
	}
}

func TestPaymentRegression_PendingWebhookCannotDowngradePaidOrder(t *testing.T) {
	repo := &paymentRegressionRepo{
		order: domain.Order{ID: "order-1", UserID: "buyer-1", Status: "PAID"},
	}
	uc := NewOrderUsecase(repo, &MockCartRepository{}, nil, nil, nil)

	err := uc.ProcessPaymentWebhook(map[string]interface{}{
		"order_id":           "order-1",
		"transaction_status": "pending",
	})
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if repo.order.Status != "PAID" {
		t.Fatalf("paid order was incorrectly downgraded to %s", repo.order.Status)
	}
	if repo.updateCalls != 0 || repo.conditionalCalls != 0 {
		t.Fatalf("pending webhook must not update an already paid order")
	}
}

func TestPaymentRegression_CancelWebhookIsIdempotent(t *testing.T) {
	repo := &paymentRegressionRepo{
		order: domain.Order{ID: "order-1", UserID: "buyer-1", Status: "PENDING"},
	}
	uc := NewOrderUsecase(repo, &MockCartRepository{}, nil, nil, nil)
	payload := map[string]interface{}{
		"order_id":           "order-1",
		"transaction_status": "cancel",
	}

	if err := uc.ProcessPaymentWebhook(payload); err != nil {
		t.Fatalf("first cancellation failed: %v", err)
	}
	if err := uc.ProcessPaymentWebhook(payload); err != nil {
		t.Fatalf("second cancellation failed: %v", err)
	}
	if repo.cancelCalls != 1 {
		t.Fatalf("expected stock restoration transaction once, got %d", repo.cancelCalls)
	}
}
