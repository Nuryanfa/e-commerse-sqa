package repository

import (
	"regexp"
	"strings"
	"testing"

	"github.com/DATA-DOG/go-sqlmock"
)

func TestCancelOrderTransaction_PaidOrderDoesNotRestoreStock(t *testing.T) {
	gormDB, mock := setupSQLMock(t)
	repo := NewOrderRepository(gormDB)

	mock.ExpectBegin()
	mock.ExpectQuery(regexp.QuoteMeta(`SELECT * FROM "orders"`)).
		WillReturnRows(sqlmock.NewRows([]string{"id_order", "id_user", "status"}).
			AddRow("order-paid", "buyer-1", "PAID"))
	mock.ExpectQuery(regexp.QuoteMeta(`SELECT * FROM "order_items"`)).
		WillReturnRows(sqlmock.NewRows([]string{"id_order_item", "id_order", "id_product", "quantity"}).
			AddRow("item-1", "order-paid", "product-1", 2))
	mock.ExpectRollback()

	err := repo.CancelOrderTransaction("order-paid")
	if err == nil || !strings.Contains(err.Error(), "tidak dapat dibatalkan") {
		t.Fatalf("expected paid-order cancellation rejection, got %v", err)
	}
	if err := mock.ExpectationsWereMet(); err != nil {
		t.Fatalf("unexpected stock update or unmet SQL expectation: %v", err)
	}
}

func TestCancelOrderTransaction_PendingOrderRestoresStockOnce(t *testing.T) {
	gormDB, mock := setupSQLMock(t)
	repo := NewOrderRepository(gormDB)

	mock.ExpectBegin()
	mock.ExpectQuery(regexp.QuoteMeta(`SELECT * FROM "orders"`)).
		WillReturnRows(sqlmock.NewRows([]string{"id_order", "id_user", "status"}).
			AddRow("order-pending", "buyer-1", "PENDING"))
	mock.ExpectQuery(regexp.QuoteMeta(`SELECT * FROM "order_items"`)).
		WillReturnRows(sqlmock.NewRows([]string{"id_order_item", "id_order", "id_product", "quantity"}).
			AddRow("item-1", "order-pending", "product-1", 2))
	mock.ExpectExec(regexp.QuoteMeta(`UPDATE "orders"`)).
		WillReturnResult(sqlmock.NewResult(0, 1))
	mock.ExpectExec(regexp.QuoteMeta(`UPDATE "products"`)).
		WillReturnResult(sqlmock.NewResult(0, 1))
	mock.ExpectCommit()

	if err := repo.CancelOrderTransaction("order-pending"); err != nil {
		t.Fatalf("unexpected cancellation error: %v", err)
	}
	if err := mock.ExpectationsWereMet(); err != nil {
		t.Fatalf("stock must be restored exactly once in the same transaction: %v", err)
	}
}
