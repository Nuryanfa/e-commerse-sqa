package repository

import (
	"database/sql/driver"
	"errors"
	"regexp"
	"testing"

	"github.com/DATA-DOG/go-sqlmock"
	"github.com/nuryanfa/e-commerse-sqa/internal/domain"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

// =============================================================================
// WHITE BOX TESTING — SQLMock DB Failure Paths
// Fungsi    : CheckoutTransaction
// File      : order_repository.go
// Referensi : Laporan_Whitebox_BasicPath_Checkout_ACID_Final.md
//
// Test di bawah ini MENGGUNAKAN SQLMOCK sungguhan untuk memvalidasi
// GORM query dan behavior Rollback pada kegagalan query aktual.
// =============================================================================

// Helper untuk setup DB Mock
func setupSQLMock(t *testing.T) (*gorm.DB, sqlmock.Sqlmock) {
	dbSQL, mock, err := sqlmock.New()
	if err != nil {
		t.Fatalf("Failed to open sqlmock: %v", err)
	}

	dialector := postgres.New(postgres.Config{
		Conn:       dbSQL,
		DriverName: "postgres",
	})

	gormDB, err := gorm.Open(dialector, &gorm.Config{})
	if err != nil {
		t.Fatalf("Failed to open gorm DB: %v", err)
	}

	return gormDB, mock
}

func anyArgs(count int) []driver.Value {
	args := make([]driver.Value, count)
	for i := range args {
		args[i] = sqlmock.AnyArg()
	}
	return args
}

// ---------------------------------------------------------------------------
// WB-CHK-R04 | Path R-04
// Skenario: DB Error saat Save Variant
// ---------------------------------------------------------------------------
func TestCheckoutTransaction_DBError_SaveVariant(t *testing.T) {
	gormDB, mock := setupSQLMock(t)
	repo := NewOrderRepository(gormDB)

	var variantID = "var-1"
	cartItems := []domain.CartItem{
		{ProductID: "prod-1", VariantID: &variantID, Quantity: 2},
	}

	mock.ExpectBegin()

	// Mock Product Select FOR UPDATE
	mock.ExpectQuery(regexp.QuoteMeta(`SELECT * FROM "products"`)).
		WillReturnRows(sqlmock.NewRows([]string{"id_product", "stock"}).
			AddRow("prod-1", 10))

	// Mock Variant Select FOR UPDATE
	mock.ExpectQuery(regexp.QuoteMeta(`SELECT * FROM "product_variants"`)).
		WillReturnRows(sqlmock.NewRows([]string{"id_variant", "stock", "name_label"}).
			AddRow("var-1", 5, "Merah"))

	// Mock Variant Save -> GAGAL (Simulasi R-04)
	mock.ExpectExec(regexp.QuoteMeta(`UPDATE "product_variants"`)).
		WillReturnError(errors.New("ERROR: deadlock detected (SQLSTATE 40P01)"))

	mock.ExpectRollback() // Harus rollback karena transaksi gagal

	_, err := repo.CheckoutTransaction("user-1", cartItems, "")

	if err == nil {
		t.Fatal("[WB-CHK-R04] Expected error, got nil")
	}
	if err.Error() != "ERROR: deadlock detected (SQLSTATE 40P01)" {
		t.Errorf("[WB-CHK-R04] Unexpected error message: %v", err)
	} else {
		t.Log("[WB-CHK-R04] PASS: DB Error Save Variant -> Rollback OK")
	}
	if err := mock.ExpectationsWereMet(); err != nil {
		t.Fatalf("[WB-CHK-R04] SQL expectation tidak terpenuhi: %v", err)
	}
}

// ---------------------------------------------------------------------------
// WB-CHK-R06 | Path R-06
// Skenario: DB Error saat Save Product (Non-variant)
// ---------------------------------------------------------------------------
func TestCheckoutTransaction_DBError_SaveProduct(t *testing.T) {
	gormDB, mock := setupSQLMock(t)
	repo := NewOrderRepository(gormDB)

	cartItems := []domain.CartItem{
		{ProductID: "prod-1", Quantity: 2}, // tanpa variant
	}

	mock.ExpectBegin()

	// Mock Product Select FOR UPDATE
	mock.ExpectQuery(regexp.QuoteMeta(`SELECT * FROM "products"`)).
		WillReturnRows(sqlmock.NewRows([]string{"id_product", "stock"}).
			AddRow("prod-1", 10))

	// Mock Product Save -> GAGAL (Simulasi R-06)
	mock.ExpectExec(regexp.QuoteMeta(`UPDATE "products"`)).
		WillReturnError(errors.New("ERROR: disk full"))

	mock.ExpectRollback()

	_, err := repo.CheckoutTransaction("user-1", cartItems, "")

	if err == nil {
		t.Fatal("[WB-CHK-R06] Expected error, got nil")
	}
	if err.Error() != "ERROR: disk full" {
		t.Errorf("[WB-CHK-R06] Unexpected error: %v", err)
	} else {
		t.Log("[WB-CHK-R06] PASS: DB Error Save Product -> Rollback OK")
	}
	if err := mock.ExpectationsWereMet(); err != nil {
		t.Fatalf("[WB-CHK-R06] SQL expectation tidak terpenuhi: %v", err)
	}
}

// ---------------------------------------------------------------------------
// WB-CHK-R13 | Path R-13
// Skenario: DB Error saat Create Order Utama
// ---------------------------------------------------------------------------
func TestCheckoutTransaction_DBError_CreateOrder(t *testing.T) {
	gormDB, mock := setupSQLMock(t)
	repo := NewOrderRepository(gormDB)

	cartItems := []domain.CartItem{
		{ProductID: "prod-1", Quantity: 2},
	}

	mock.ExpectBegin()

	// Product Lock OK
	mock.ExpectQuery(regexp.QuoteMeta(`SELECT * FROM "products"`)).
		WillReturnRows(sqlmock.NewRows([]string{"id_product", "stock"}).
			AddRow("prod-1", 10))

	// Product Update OK
	mock.ExpectExec(regexp.QuoteMeta(`UPDATE "products"`)).
		WillReturnResult(sqlmock.NewResult(1, 1))

	// Create Order -> GAGAL (Simulasi R-13)
	mock.ExpectExec(regexp.QuoteMeta(`INSERT INTO "orders"`)).
		WithArgs(anyArgs(14)...).
		WillReturnError(errors.New("ERROR: unique violation"))

	mock.ExpectRollback()

	_, err := repo.CheckoutTransaction("user-1", cartItems, "")

	if err == nil {
		t.Fatal("[WB-CHK-R13] Expected error, got nil")
	}
	t.Log("[WB-CHK-R13] PASS: DB Error Create Order -> Rollback OK")
	if err := mock.ExpectationsWereMet(); err != nil {
		t.Fatalf("[WB-CHK-R13] SQL expectation tidak terpenuhi: %v", err)
	}
}

// ---------------------------------------------------------------------------
// WB-CHK-R14 & R15 
// Skenario: Delete Cart Failure (Simulasi R-15)
// ---------------------------------------------------------------------------
func TestCheckoutTransaction_DBError_DeleteCart(t *testing.T) {
	gormDB, mock := setupSQLMock(t)
	repo := NewOrderRepository(gormDB)

	cartItems := []domain.CartItem{
		{ProductID: "prod-1", Quantity: 2},
	}

	mock.ExpectBegin()

	// 1. Product OK
	mock.ExpectQuery(regexp.QuoteMeta(`SELECT * FROM "products"`)).
		WillReturnRows(sqlmock.NewRows([]string{"id_product", "stock"}).AddRow("prod-1", 10))
	mock.ExpectExec(regexp.QuoteMeta(`UPDATE "products"`)).
		WillReturnResult(sqlmock.NewResult(1, 1))

	// 2. Order OK
	mock.ExpectExec(regexp.QuoteMeta(`INSERT INTO "orders"`)).
		WithArgs(anyArgs(14)...).
		WillReturnResult(sqlmock.NewResult(1, 1))

	// 3. Order Items OK
	mock.ExpectExec(regexp.QuoteMeta(`INSERT INTO "order_items"`)).
		WithArgs(anyArgs(8)...).
		WillReturnResult(sqlmock.NewResult(1, 1))

	// 4. Delete Cart -> GAGAL (Simulasi R-15)
	mock.ExpectExec(regexp.QuoteMeta(`DELETE FROM "cart_items"`)).
		WithArgs("user-1").
		WillReturnError(errors.New("ERROR: db lost connection"))

	mock.ExpectRollback()

	_, err := repo.CheckoutTransaction("user-1", cartItems, "")

	if err == nil {
		t.Fatal("[WB-CHK-R15] Expected error, got nil")
	}
	t.Log("[WB-CHK-R15] PASS: DB Error Delete Cart -> Rollback OK")
	if err := mock.ExpectationsWereMet(); err != nil {
		t.Fatalf("[WB-CHK-R15] SQL expectation tidak terpenuhi: %v", err)
	}
}
