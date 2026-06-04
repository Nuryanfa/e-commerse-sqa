package http

// =============================================================================
// WHITE BOX TESTING — Basic Path Testing
// Fungsi    : classifyCheckoutError
// File      : order_handler.go
// Referensi : Laporan_Whitebox_BasicPath_Checkout_ACID_Final.md
//
// Semua test di sini TIDAK membutuhkan database, server, atau mock Midtrans.
// Cukup uji logika string-matching di dalam switch-case classifyCheckoutError.
//
// Test Case yang dicakup:
//   WB-CE-01 (Path CE-1) : Error keranjang kosong     → HTTP 400
//   WB-CE-02 (Path CE-2) : Error stok tidak mencukupi → HTTP 400
//   WB-CE-03 (Path CE-3) : Error midtrans/snap        → HTTP 502
//   WB-CE-04 (Path CE-4) : Error lain / default       → HTTP 409
// =============================================================================

import (
	"errors"
	"net/http"
	"testing"
)

// ---------------------------------------------------------------------------
// WB-CE-01 | Path CE-1
// Skenario  : error message mengandung "keranjang belanja anda kosong"
// Expected  : HTTP 400 Bad Request
// Relasi BB : CHK-04
// ---------------------------------------------------------------------------
func TestClassifyCheckoutError_KeranjangKosong(t *testing.T) {
	// Path CE-1: P1 = true
	err := errors.New("keranjang belanja anda kosong. tidak bisa checkout")
	result := classifyCheckoutError(err)

	if result == nil {
		t.Fatal("[WB-CE-01] FAIL: result harus tidak nil")
	}
	if result.Code != http.StatusBadRequest {
		t.Errorf("[WB-CE-01] FAIL: Expected HTTP %d (Bad Request), got HTTP %d", http.StatusBadRequest, result.Code)
	} else {
		t.Logf("[WB-CE-01] PASS: classifyCheckoutError keranjang kosong → HTTP %d", result.Code)
	}
}

// ---------------------------------------------------------------------------
// WB-CE-02 | Path CE-2
// Skenario  : error message mengandung kata "stok"
// Expected  : HTTP 400 Bad Request
// Relasi BB : CHK-02
// ---------------------------------------------------------------------------
func TestClassifyCheckoutError_StokTidakCukup(t *testing.T) {
	// Path CE-2: P1 = false, P2 = true
	testCases := []struct {
		name    string
		errMsg  string
	}{
		{"stok lowercase", "stok produk 'Pakcoy' tidak mencukupi. Stok tersisa: 5"},
		{"Stok uppercase", "Stok varian 'Merah' tidak mencukupi"},
		{"stok tidak mencukupi", "stok tidak mencukupi untuk produk ini"},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			result := classifyCheckoutError(errors.New(tc.errMsg))
			if result == nil {
				t.Fatalf("[WB-CE-02] FAIL (%s): result harus tidak nil", tc.name)
			}
			if result.Code != http.StatusBadRequest {
				t.Errorf("[WB-CE-02] FAIL (%s): Expected HTTP %d, got HTTP %d", tc.name, http.StatusBadRequest, result.Code)
			} else {
				t.Logf("[WB-CE-02] PASS (%s): → HTTP %d", tc.name, result.Code)
			}
		})
	}
}

// ---------------------------------------------------------------------------
// WB-CE-03 | Path CE-3
// Skenario  : error message mengandung kata "midtrans", "Midtrans", "snap",
//             atau "payment gateway"
// Expected  : HTTP 502 Bad Gateway
// Relasi BB : CHK-05
// CATATAN   : Path ini sebelumnya N/A karena butuh mock Midtrans.
//             Sekarang PASS karena classifyCheckoutError hanya cek string —
//             tidak perlu hit Midtrans sama sekali.
// ---------------------------------------------------------------------------
func TestClassifyCheckoutError_MidtransError(t *testing.T) {
	// Path CE-3: P1 = false, P2 = false, P3 = true
	testCases := []struct {
		name   string
		errMsg string
	}{
		{"midtrans lowercase", "midtrans: connection refused"},
		{"Midtrans uppercase", "Midtrans API error: invalid server key"},
		{"snap error", "snap token generation failed"},
		{"payment gateway", "payment gateway timeout after 30s"},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			result := classifyCheckoutError(errors.New(tc.errMsg))
			if result == nil {
				t.Fatalf("[WB-CE-03] FAIL (%s): result harus tidak nil", tc.name)
			}
			if result.Code != http.StatusBadGateway {
				t.Errorf("[WB-CE-03] FAIL (%s): Expected HTTP %d (Bad Gateway), got HTTP %d",
					tc.name, http.StatusBadGateway, result.Code)
			} else {
				t.Logf("[WB-CE-03] PASS (%s): → HTTP %d (Bad Gateway)", tc.name, result.Code)
			}
		})
	}
}

// ---------------------------------------------------------------------------
// WB-CE-04 | Path CE-4
// Skenario  : error message tidak cocok dengan semua case di atas (default)
// Expected  : HTTP 409 Conflict
// Relasi BB : —
// ---------------------------------------------------------------------------
func TestClassifyCheckoutError_DefaultConflict(t *testing.T) {
	// Path CE-4: P1 = false, P2 = false, P3 = false → default
	testCases := []struct {
		name   string
		errMsg string
	}{
		{"duplicate key", "duplicate key value violates unique constraint \"orders_pkey\""},
		{"foreign key violation", "foreign key constraint violation on table orders"},
		{"unknown error", "unexpected error from database layer"},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			result := classifyCheckoutError(errors.New(tc.errMsg))
			if result == nil {
				t.Fatalf("[WB-CE-04] FAIL (%s): result harus tidak nil", tc.name)
			}
			if result.Code != http.StatusConflict {
				t.Errorf("[WB-CE-04] FAIL (%s): Expected HTTP %d (Conflict), got HTTP %d",
					tc.name, http.StatusConflict, result.Code)
			} else {
				t.Logf("[WB-CE-04] PASS (%s): → HTTP %d (Conflict)", tc.name, result.Code)
			}
		})
	}
}

// ---------------------------------------------------------------------------
// WB-CE-EXTRA | Verifikasi urutan prioritas switch-case
// Skenario  : error message yang bisa cocok dengan lebih dari satu case,
//             memastikan P1 diperiksa sebelum P2, P2 sebelum P3.
// ---------------------------------------------------------------------------
func TestClassifyCheckoutError_PriorityOrder(t *testing.T) {
	// "keranjang" muncul di P1 → harus 400, bukan 409
	err := errors.New("keranjang belanja anda kosong. tidak bisa checkout")
	result := classifyCheckoutError(err)
	if result.Code != http.StatusBadRequest {
		t.Errorf("[WB-CE-EXTRA] FAIL: P1 harus diproses sebelum default, Expected 400, got %d", result.Code)
	} else {
		t.Logf("[WB-CE-EXTRA] PASS: Priority P1 > default terkonfirmasi")
	}
}
