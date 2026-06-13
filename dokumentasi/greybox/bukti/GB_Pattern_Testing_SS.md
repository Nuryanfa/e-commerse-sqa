## **LAPORAN SOFTWARE QUALITY ASSURANCE METODE GREYBOX – PATTERN TESTING** 

## Anggota kelompok: 

20231310046 20231310047 

M. Irvan Alfiansyah M. Nur Yanfa 

**PROGRAM STUDI TEKNIK INFORMATIKA UNIVERSITAS KEBANGSAAN REPUBLIK INDONESIA** _Jln. Terusan Halimun No. 37 (Pelajar Pejuang 45) Lingkar Selatan Kec. Lengkong kota Bandung Jawa Barat 40263_ 

## **1. Dasar Teori Pattern Testing** 

Pattern Testing adalah metode grey box testing yang menguji pola perilaku sistem berdasarkan pola kesalahan atau pola response yang sering muncul. Dalam grey box, penguji tidak hanya melihat output dari luar, tetapi juga memahami source code yang membentuk pola tersebut. 

Pada fitur Checkout ACID, pola yang penting adalah: 

1. Checkout sukses harus menghasilkan HTTP 201 

2. Cart kosong harus menghasilkan HTTP 400 

3. Stok kurang harus menghasilkan HTTP 400 

4. Checkout tanpa token harus menghasilkan HTTP 401 

5. Midtrans/payment gateway error harus menghasilkan HTTP 502 

6. Error bisnis tidak boleh menjadi HTTP 500 

7. Error tidak dikenal dapat menjadi HTTP 409 

Pola ini penting karena response HTTP menjadi kontrak antara backend dan frontend. Jika pola berubah, frontend dapat menampilkan pesan yang salah, pengujian black-box gagal, atau error bisnis terlihat seperti server crash. 

## **2. Alasan Pemilihan Pattern Testing** 

Pattern Testing dipilih karena hasil pengujian sebelumnya menunjukkan pola yang konsisten: 

|||
|---|---|
|**Sumber Pengujian**|**Pola yang Terlihat**|
|||
|||
|Black-Box Sample Testing|Valid checkout 201, cart kosong 400, unauthorized 401|
|||
|||
|Performance Testing|Checkout tidak menghasilkan 500/502 untuk rejection valid|
|||
|||
|Endurance Testing|Server stabil, server_error_rate=0.00%|
|||
|||
|White-Box Basic Path|classifyCheckoutError memetakan cart/stok/Midtrans|
|||
|||
|Code Walkthrough|Handler memakai classifyCheckoutError|
|||
|||
|Formal Inspection|Error bisnis dipisahkan dari server error|
|||



Dengan Pattern Testing, pola-pola tersebut diuji secara otomatis di level handler. 

## **3. Ruang Lingkup Pengujian** 

|||||
|---|---|---|---|
|**ID**|**Pola**|**Dicakup**|**Keterangan**|
|||||
|||||
|PT-S01|Cart kosong → 400|**Ya**|Error bisnis|
|||||
|||||
|PT-S02|Stok kurang → 400|**Ya**|Error bisnis|
|||||
|||||
|PT-S03|Midtrans error → 502|**Ya**|Error gateway|
|||||
|||||
|PT-S04|Snap error → 502|**Ya**|Error gateway|
|||||
|||||
|PT-S05|Unknown checkout error →<br>409|**Ya**|Fallback conflict|
|||||
|||||
|PT-S06|Tanpa token → 401|**Ya**|Unauthorized|
|||||
|||||
|PT-S07|Checkout sukses → 201|**Ya**|Success pattern|
|||||
|||||
|PT-S08|Error bisnis tidak boleh 500|**Ya**|Anti-pattern check|
|||||



## **4. Source Code yang Diuji** 

## **4.1  Fungsi classifyCheckoutError** 

```
func classifyCheckoutError(err error) *response.AppError {
    msg := err.Error()
    switch {
    case strings.Contains(msg, "keranjang belanja anda kosong"):
        return response.ErrBadRequest(msg)
    case strings.Contains(msg, "stok tidak mencukupi"),
         strings.Contains(msg, "Stok"), strings.Contains(msg, "stok"):
        return response.ErrBadRequest(msg)
    case strings.Contains(msg, "midtrans"),
         strings.Contains(msg, "snap"),
         strings.Contains(msg, "payment gateway"):
        return &response.AppError{
            Code:    http.StatusBadGateway,
            Message: "Layanan pembayaran tidak tersedia",
            Detail:  msg,
        }
    default:
        return response.ErrConflict(msg)
    }
}
```

## **4.2  Fungsi OrderHandler.Checkout** 

```
func (h *OrderHandler) Checkout(c *gin.Context) {
    uidVal, exists := c.Get("user_id")
    if !exists {
        response.Error(c, response.ErrUnauthorized("Sesi pengguna tidak valid"))
        return
    }
    uid, ok := uidVal.(string)
    if !ok {
```

```
        response.Error(c, response.ErrUnauthorized("Sesi pengguna tidak valid"))
        return
```

```
    var req struct {
        VoucherCode string `json:"voucher_code"`
```

```
    }
    _ = c.ShouldBindJSON(&req)
    order, err := h.orderUsecase.Checkout(uid, req.VoucherCode)
    if err != nil {
        response.Error(c, classifyCheckoutError(err))
        return
    }
    response.Success(c, http.StatusCreated, "Checkout berhasil.", order)
}
```

## **5. Pattern yang Diuji** 

|||||
|---|---|---|---|
|**Pattern ID**|**Kondisi / Input**|**Expected**<br>**HTTP**|**Alasan**|
|||||
|||||
|PT-CHK-01|Error cart kosong|400|Kesalahan state user, bukan<br>server crash|
|||||
|||||
|PT-CHK-02|Error stok kurang|400|Kesalahan bisnis valid|
|||||
|||||
|PT-CHK-03|Error Midtrans|502|Kegagalan external gateway|
|||||
|||||
|PT-CHK-04|Error Snap Token|502|Kegagalan external gateway|
|||||
|||||
|PT-CHK-05|Error tidak dikenal|409|Conflict fallback|
|||||
|||||
|PT-H-01|Tidak ada token/user_id|401|Unauthorized|
|||||
|||||
|PT-H-02|user_id bukan string|401|Context auth tidak valid|
|||||
|||||
|PT-H-03|Handler: cart kosong dari<br>usecase|400|Error bisnis|
|||||
|||||
|PT-H-04|Handler: stok kurang dari<br>usecase|400|Error bisnis|
|||||
|||||
|PT-H-05|Handler: Midtrans error|502|Gateway failure|
|||||
|||||
|PT-H-06|Checkout sukses|201|Order dibuat|
|||||



## **6. Source Code Automated Test** 

## **6.1  TestPatternTesting_CheckoutErrorResponsePatterns** 

```
func TestPatternTesting_CheckoutErrorResponsePatterns(t *testing.T) {
    tests := []struct {
        id         string
        err        error
        wantStatus int
        pattern    string
    }{
        {"PT-CHK-01", errors.New("keranjang belanja anda kosong..."),
            http.StatusBadRequest, "cart kosong -> 400"},
        {"PT-CHK-02", errors.New("stok produk 'Pakcoy' tidak mencukupi..."),
            http.StatusBadRequest, "stok kurang -> 400"},
        {"PT-CHK-03", errors.New("midtrans: connection refused"),
            http.StatusBadGateway, "midtrans error -> 502"},
        {"PT-CHK-04", errors.New("snap token generation failed"),
            http.StatusBadGateway, "snap error -> 502"},
        {"PT-CHK-05", errors.New("duplicate key value violates unique constraint"),
            http.StatusConflict, "unknown checkout error -> 409"},
    }
    ...
}
```

## **6.2  TestPatternTesting_CheckoutHandlerStatusPatterns** 

```
func TestPatternTesting_CheckoutHandlerStatusPatterns(t *testing.T) {
    tests := []struct {
        id, userID  interface{}
        hasUser     bool
        usecaseErr  error
        wantStatus  int
        pattern     string
    }{
        {"PT-H-01", nil,  false, nil,  http.StatusUnauthorized, "tanpa token -> 401"},
        {"PT-H-02", 12345, true, nil,  http.StatusUnauthorized, "user_id invalid ->
401"},
        {"PT-H-03", "user-pattern", true,
            errors.New("keranjang belanja anda kosong..."),
            http.StatusBadRequest, "cart kosong -> 400"},
        {"PT-H-04", "user-pattern", true,
            errors.New("stok produk Pakcoy tidak mencukupi..."),
            http.StatusBadRequest, "stok kurang -> 400"},
        {"PT-H-05", "user-pattern", true,
            errors.New("midtrans: payment gateway unavailable"),
            http.StatusBadGateway, "payment gateway -> 502"},
        {"PT-H-06", "user-pattern", true, nil,
            http.StatusCreated, "checkout sukses -> 201"},
    }
    ...
}
```

## **7. Eksekusi Pengujian** 

## **7.1  Command** 

```
cd backend-go
go test ./internal/delivery/http -run TestPatternTesting -v
```

## **7.2  Output Aktual** 

```
=== RUN   TestPatternTesting_CheckoutErrorResponsePatterns
=== RUN   .../PT-CHK-01-cart-empty-business-error
=== RUN   .../PT-CHK-02-stock-business-error
=== RUN   .../PT-CHK-03-midtrans-gateway-error
=== RUN   .../PT-CHK-04-snap-gateway-error
=== RUN   .../PT-CHK-05-default-conflict-pattern
--- PASS: TestPatternTesting_CheckoutErrorResponsePatterns (0.00s)
    --- PASS: .../PT-CHK-01-cart-empty-business-error (0.00s)
    --- PASS: .../PT-CHK-02-stock-business-error (0.00s)
    --- PASS: .../PT-CHK-03-midtrans-gateway-error (0.00s)
    --- PASS: .../PT-CHK-04-snap-gateway-error (0.00s)
    --- PASS: .../PT-CHK-05-default-conflict-pattern (0.00s)
=== RUN   TestPatternTesting_CheckoutHandlerStatusPatterns
=== RUN   .../PT-H-01-no-token
=== RUN   .../PT-H-02-invalid-user-context
=== RUN   .../PT-H-03-cart-empty
=== RUN   .../PT-H-04-stock-error
=== RUN   .../PT-H-05-midtrans-error
=== RUN   .../PT-H-06-success
--- PASS: TestPatternTesting_CheckoutHandlerStatusPatterns (0.00s)
    --- PASS: .../PT-H-01-no-token (0.00s)
    --- PASS: .../PT-H-02-invalid-user-context (0.00s)
    --- PASS: .../PT-H-03-cart-empty (0.00s)
    --- PASS: .../PT-H-04-stock-error (0.00s)
    --- PASS: .../PT-H-05-midtrans-error (0.00s)
    --- PASS: .../PT-H-06-success (0.00s)
PASS
ok   github.com/nuryanfa/e-commerse-sqa/internal/delivery/http
```

## **8. Analisis Hasil Per Pattern** 

||||
|---|---|---|
|**Pattern**|**Hasil**<br>**Aktual**|**Analisis**|
||||
||||
|Cart kosong → 400|**PASS**|Error cart kosong tetap menjadi client/business error|
||||
||||
|Stok kurang → 400|**PASS**|Error stok tidak diperlakukan sebagai server crash|
||||
||||
|Midtrans → 502|**PASS**|Kegagalan gateway dipetakan sebagai gateway error|
||||
||||
|Snap → 502|**PASS**|Pola error payment tetap konsisten|
||||
||||
|Unknown → 409|**PASS**|Fallback conflict berjalan|
||||
||||
|Tanpa token → 401|**PASS**|Unauthorized pattern valid|
||||
||||
|User context invalid → 401|**PASS**|Context auth tidak valid ditolak|
||||
||||
|Checkout sukses → 201|**PASS**|Success pattern valid|
||||
||||
|Error bisnis bukan 500|**PASS**|Anti-pattern HTTP 500 tidak ditemukan|
||||



## **9. Analisis Grey Box** 

|||
|---|---|
|**Unsur Black-Box**|**Unsur White-Box**|
|||
|||
|Menguji pola response HTTP yang dilihat<br>client/frontend|Mengetahui fungsi internal classifyCheckoutError|
|||
|||
|Mengacu pada skenario cart kosong, stok<br>kurang, unauthorized, dan success|Menggunakan mock usecase untuk memicu<br>branch handler|
|||
|||
|Menilai status code endpoint|Menilai mapping internal error string ke AppError|
|||



Pattern Testing ini tidak memanggil database atau Midtrans nyata. Kondisi tersebut disengaja agar pola response dapat diuji deterministik tanpa efek samping production. 

## **10. Hubungan Dengan Hasil Pengujian Sebelumnya** 

|||
|---|---|
|**Pengujian Sebelumnya**|**Pola yang Dikonfirmasi Ulang**|
|||
|||
|Black-Box Sample Testing|201, 400, 401|
|||
|||
|Checkout Performance Testing|Tidak ada 500/502 untuk rejection valid|
|||
|||
|Checkout Endurance Testing|Server error rate 0.00%|
|||
|||
|Basic Path Testing|Branch classifyCheckoutError|
|||
|||
|Code Walkthrough|Handler memakai classifyCheckoutError|
|||
|||
|Formal Inspection|Error bisnis dipisahkan dari error server|
|||



## **11. Analisis ACID Berdasarkan Pattern** 

||||
|---|---|---|
|**Prinsip ACID**|**Pola yang Relevan**|**Analisis**|
||||
||||
|Atomicity|Stok kurang → 400|Error bisnis menghentikan checkout, bukan success<br>parsial|
||||
||||
|Consistency|Cart kosong/stok kurang →<br>400|Data invalid tidak menjadi order|
||||
||||
|Isolation|Unauthorized → 401|User tanpa sesi tidak masuk alur transaksi|
||||
||||
|Durability|Success → 201|Order sukses dikembalikan sebagai hasil transaksi<br>valid|
||||



## **12. Temuan** 

|||||
|---|---|---|---|
|**ID**|**Temuan**|**Dampak**|**Rekomendasi**|
|||||
|||||
|PT-F01|Semua pattern response<br>utama PASS|**Positif**|Jadikan test ini regression gate|
|||||
|||||
|PT-F02|Error bisnis tidak berubah<br>menjadi 500|**Positif**|Pertahankan classifyCheckoutError|
|||||
|||||
|PT-F03|Error Midtrans/Snap<br>konsisten menjadi 502|**Positif**|Cocok untuk monitoring gateway|
|||||
|||||
|PT-F04|Fallback error menjadi 409|Dapat diterima|Ke depan gunakan typed error agar<br>lebih kuat|
|||||



## **13. Kesimpulan** 

Grey Box Pattern Testing — Checkout ACID: Lulus 

Hasil pengujian menunjukkan bahwa pola response checkout konsisten: 

1. Checkout sukses menghasilkan HTTP 201 

2. Cart kosong menghasilkan HTTP 400 

3. Stok kurang menghasilkan HTTP 400 

4. Checkout tanpa token menghasilkan HTTP 401 

5. Midtrans/Snap error menghasilkan HTTP 502 

6. Error tidak dikenal menghasilkan HTTP 409 

7. Error bisnis tidak berubah menjadi HTTP 500 

Dengan demikian, pola perilaku Checkout ACID sudah sesuai dengan hasil black-box sebelumnya dan sesuai dengan implementasi white-box pada handler. 

