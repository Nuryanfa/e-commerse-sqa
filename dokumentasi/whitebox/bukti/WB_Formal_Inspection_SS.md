## **LAPORAN SOFTWARE QUALITY ASSURANCE METODE WHITEBOX – FORMAL INSPECTION** 

## Anggota kelompok: 

20231310046 M. Irvan Alfiansyah 20231310047 M. Nur Yanfa 

**PROGRAM STUDI TEKNIK INFORMATIKA UNIVERSITAS KEBANGSAAN REPUBLIK INDONESIA** _Jln. Terusan Halimun No. 37 (Pelajar Pejuang 45) Lingkar Selatan Kec. Lengkong kota Bandung Jawa Barat 40263_ 

## **1. DASAR TEORI FORMAL INSPECTION** 

Formal Inspection adalah metode white box testing berbasis pemeriksaan sistematis terhadap source code menggunakan checklist yang terstruktur. Setiap aspek penting diperiksa secara konsisten oleh reviewer yang bertindak sebagai inspektur independen. 

Berbeda dari unit test yang berfokus pada input-output, Formal Inspection mengevaluasi kualitas internal program dari berbagai dimensi: 

1. Struktur layer dan pemisahan tanggung jawab (separation of concerns) 

2. Validasi akses dan mekanisme autentikasi 

3. Validasi dan sanitasi data masukan 

4. Integritas transaksi database (ACID properties) 

5. Penanganan error yang terklasifikasi dengan benar 

6. Keamanan query database (SQL injection prevention) 

7. Konsistensi status objek domain 

8. Keterlacakan dan jejak audit (auditability) 

9. Identifikasi risiko implementasi 

Metode ini dipilih untuk modul Checkout ACID karena checkout adalah proses kritis yang secara langsung mempengaruhi integritas stok, data pembayaran, dan rekaman order. Kesalahan pada satu titik dapat berdampak finansial dan operasional. 

## **2. RUANG LINGKUP INSPEKSI** 

Inspeksi mencakup seluruh kode yang langsung mendukung fitur Checkout ACID. Pengujian tidak mencakup audit keamanan menyeluruh seluruh aplikasi; beberapa catatan hardening produksi dicantumkan secara terpisah sebagai risiko di luar scope inti. 

|||||
|---|---|---|---|
|**ID Black-**<br>**Box**|**Skenario**|**Dicakup**|**Bukti Pemeriksaan**|
|**CHK-01**|Checkout berhasil|**Ya**|Handler, usecase, repository<br>transaction|
|**CHK-02**|Stok tidak cukup|**Ya**|Validasi stok produk/varian|
|**CHK-03**|Race condition checkout<br>bersamaan|**Ya**|Locking FOR UPDATE di repository|
|**CHK-04**|Cart kosong|**Ya**|Guard cart kosong di usecase|
|**CHK-05**|Midtrans API error|**Ya**|snapTokenFn, error log, order tetap<br>return|
|**CHK-06**|Checkout tanpa<br>JWT/session|**Ya**|Handler membaca user_id dari context<br>JWT|



|||||
|---|---|---|---|
|**ID Black-**<br>**Box**|**Skenario**|**Dicakup**|**Bukti Pemeriksaan**|
|**CHK-07**|Atomicity stok/order|**Ya**|db.Transaction dan rollback otomatis|
|**CHK-08**|Status order PENDING|**Ya**|Repository membuat order dengan<br>status PENDING|



## **3. SOURCE CODE YANG DIINSPEKSI** 

||||||
|---|---|---|---|---|
|**No**|**File**|**Baris**|**Bagian Kode**|**Item Inspeksi**|
|1|_order_handler.go_|15-26|classifyCheckoutError|Mapping error bisnis<br>dan gateway|
|2|_order_handler.go_|60-87|OrderHandler.Checkout|Auth, session, response<br>sukses/error|
|3|_order_usecase.go_|72-99|orderUsecase.Checkout|Cart, transaction,<br>Midtrans handling|
|4|_order_repository.go_|23-120|CheckoutTransaction|Transaction, stok, order,<br>cart cleanup|
|5|_order_repository.go_|37, 45|Locking FOR UPDATE|Isolation checkout<br>bersamaan|
|6|_order_repository.go_|48-64|Validasi & pengurangan stok|Consistency stok,<br>cegah stok negatif|
|7|_order_repository.go_|71-80|Order item snapshot|Konsistensi harga dan<br>item|
|8|_order_repository.go_|86-95|Pembuatan order|Status awal dan relasi<br>user|
|9|_order_repository.go_|101-<br>108|Create items dan delete cart|Atomic completion|
|10|_order_usecase.go_|286-<br>333|BatchProcessSupplierOrders|Loop/filter order pasca-<br>checkout + audit log|



## **4. KRITERIA CHECKLIST INSPEKSI** 

Checklist disusun berdasarkan kebutuhan transaksi checkout, prinsip ACID, dan standar keamanan dasar. Setiap kode kriteria mewakili satu dimensi kualitas yang diperiksa secara independen. 

||||
|---|---|---|
|**Kode**<br>**Kriteria**|**Area**|**Pertanyaan Utama**|
|**AUTH**|Authentication /<br>Authorization|Apakah checkout hanya dapat dilakukan oleh user yang valid dan<br>terautentikasi?|
|**INPUT**|Input & Request|Apakah input tidak dipercaya secara berlebihan? Apakah user<br>dapat memanipulasi identitas dari body?|
|**CART**|Cart Validation|Apakah cart kosong atau cart error ditangani dengan benar<br>sebelum transaksi dimulai?|
|**TX**|Database<br>Transaction|Apakah semua operasi penting (stok, order, cart) berada dalam<br>satu transaksi atomik?|
|**STOCK**|Stock Consistency|Apakah stok selalu dicek dan divalidasi sebelum dikurangi?<br>Apakah stok dapat menjadi negatif?|
|**ISO**|Isolation|Apakah update stok dilindungi dari race condition saat checkout<br>bersamaan?|
|**ORDER**|Order Consistency|Apakah order dan order item dibuat secara konsisten dengan<br>snapshot harga yang benar?|
|**ERROR**|Error Handling|Apakah error bisnis dan error server dipisahkan dengan status<br>HTTP yang tepat?|
|**PAY**|Payment Handling|Apakah kegagalan Midtrans tidak merusak atau menghilangkan<br>order internal yang sudah dibuat?|
|**SEC**|Security Baseline|Apakah semua query database memakai parameter binding untuk<br>mencegah SQL injection?|
|**AUDIT**|Auditability|Apakah perubahan status order pasca-checkout dapat dicatat<br>untuk keperluan audit?|



## **5. CHECKLIST INSPEKSI DETAIL** 

Seluruh 25 butir checklist diperiksa secara independen terhadap source code aktual. Setiap baris mencatat lokasi kode, ekspektasi, temuan aktual, dan status akhir. 

## **5.1 Kelompok AUTH — Autentikasi & Otorisasi** 

|||||||
|---|---|---|---|---|---|
|**ID**|**Kriteria**|**Source Code**|**Ekspektasi**|**Hasil Pemeriksaan**|**Status**|
|**FI-**<br>**01**|**AUTH**|_order_handler.go:62-_<br>_66_|user_id wajib ada<br>di context|Handler return 401<br>Unauthorized jika<br>user_id tidak ada|**PASS**|
|**FI-**<br>**02**|**AUTH**|_order_handler.go:67-_<br>_71_|user_id harus<br>bertipe string|Handler return 401 jika<br>type assertion gagal||
||||||**PASS**|
|**FI-**<br>**03**|**INPUT**|_order_handler.go:73-_<br>_79_|User tidak dapat<br>mengirim user_id<br>dari body|Body hanya membaca<br>voucher_code; user_id<br>dari JWT context||
||||||**PASS**|



## **5.2 Kelompok CART — Validasi Keranjang** 

|||||||
|---|---|---|---|---|---|
|**ID**|**Kriteria**|**Source Code**|**Ekspektasi**|**Hasil Pemeriksaan**|**Status**|
|**FI-**<br>**04**|**CART**|_order_usecase.go:73-_<br>_76_|Error cart<br>repository<br>menghentikan<br>checkout|Return 'gagal memuat<br>keranjang belanja' jika<br>repo error|**PASS**|
|**FI-**<br>**05**|**CART**|_order_usecase.go:78-_<br>_80_|Cart kosong ditolak<br>sebelum transaksi|Return error 'keranjang<br>belanja kosong'||
||||||**PASS**|



## **5.3 Kelompok TX — Transaksi Database** 

|||||||
|---|---|---|---|---|---|
|**ID**|**Kriteria**|**Source Code**|**Ekspektasi**|**Hasil Pemeriksaan**|**Status**|
|**FI-**<br>**06**|**TX**|_order_repository.go:27_|Seluruh operasi<br>checkout atomik|Menggunakan<br>r.db.Transaction —<br>semua atau tidak sama<br>sekali|**PASS**|
|**FI-**<br>**15**|**TX**|_order_repository.go:97-_<br>_104_|Order dan item<br>dibuat dalam<br>transaction|tx.Create masih berada<br>di dalam callback<br>transaction||
||||||**PASS**|
|**FI-**<br>**16**|**TX**|_order_repository.go:107_|Cart dihapus<br>setelah order<br>sukses|Delete CartItem masih<br>dalam transaction yang<br>sama||
||||||**PASS**|
|**FI-**<br>**17**|**TX**|_order_repository.go:115-_<br>_117_|Error<br>menyebabkan<br>rollback otomatis|GORM rollback saat<br>error dikembalikan dari<br>callback||
||||||**PASS**|



## **5.4 Kelompok ISO & STOCK — Isolation dan Konsistensi Stok** 

|||||||
|---|---|---|---|---|---|
|**ID**|**Kriteria**|**Source Code**|**Ekspektasi**|**Hasil Pemeriksaan**|**Status**|
|**FI-**<br>**07**|**ISO**|_order_repository.go:37_|Produk<br>dikunci saat<br>checkout|clause.Locking{Strength:"UPDATE"}<br>pada produk|**PASS**|
|**FI-**<br>**08**|**ISO**|_order_repository.go:45_|Varian<br>dikunci saat<br>checkout|clause.Locking{Strength:"UPDATE"}<br>pada varian||
||||||**PASS**|
|**FI-**<br>**09**|**STOCK**|_order_repository.go:48-_<br>_54_|Stok varian<br>dicek<br>sebelum<br>dikurangi|Return error jika variant.Stock <<br>item.Quantity||
||||||**PASS**|
|**FI-**<br>**10**|**STOCK**|_order_repository.go:58-_<br>_65_|Stok produk<br>dicek<br>sebelum<br>dikurangi|Return error jika product.Stock <<br>item.Quantity||
||||||**PASS**|
|**FI-**<br>**11**|**STOCK**|_order_repository.go:51-_<br>_63_|Stok tidak<br>boleh<br>negatif|Pengurangan dilakukan setelah<br>validasi — tidak pernah di bawah<br>nol||
||||||**PASS**|



## **5.5 Kelompok ORDER — Konsistensi Order** 

|||||||
|---|---|---|---|---|---|
|**ID**|**Kriteria**|**Source Code**|**Ekspektasi**|**Hasil Pemeriksaan**|**Status**|
|**FI-**<br>**12**|**ORDER**|_order_repository.go:69_|Total dihitung dari<br>harga saat<br>checkout|totalAmount +=<br>priceAtPurchase *<br>quantity|**PASS**|
|**FI-**<br>**13**|**ORDER**|_order_repository.go:71-_<br>_80_|Order item<br>menyimpan<br>snapshot harga|PriceAtPurchase<br>disimpan per item||
||||||**PASS**|
|**FI-**<br>**14**|**ORDER**|_order_repository.go:86-_<br>_95_|Order punya user<br>dan status yang<br>benar|UserID=userID,<br>Status="PENDING" saat<br>create||
||||||**PASS**|



## **5.6 Kelompok ERROR & PAY — Penanganan Error dan Pembayaran** 

|||||||
|---|---|---|---|---|---|
|**ID**|**Kriteria**|**Source Code**|**Ekspektasi**|**Hasil Pemeriksaan**|**Status**|
|**FI-**<br>**18**|**ERROR**|_order_handler.go:15-_<br>_26_|Cart/stok bukan<br>server error|Dipetakan ke 400 Bad<br>Request — bukan 500|**PASS**|
|**FI-**<br>**19**|**ERROR**|_order_handler.go:22-_<br>_23_|Payment gateway<br>error menjadi 502|Dipetakan ke 502 Bad<br>Gateway — bukan 500||
||||||**PASS**|
|**FI-**<br>**20**|**PAY**|_order_usecase.go:89-_<br>_96_|Midtrans error<br>tidak crash atau<br>batalkan order|Error hanya di-log; order<br>tetap di-return ke client||
||||||**PASS**|



|||||||
|---|---|---|---|---|---|
|**ID**|**Kriteria**|**Source Code**|**Ekspektasi**|**Hasil Pemeriksaan**|**Status**|
|**FI-**<br>**21**|**PAY**|_order_usecase.go:90-_<br>_93_|Token sukses<br>disimpan ke<br>database|SavePaymentToken<br>dipanggil jika snapErr ==<br>nil|**PASS**|



## **5.7 Kelompok SEC & AUDIT — Keamanan dan Keterlacakan** 

|||||||
|---|---|---|---|---|---|
|**ID**|**Kriteria**|**Source Code**|**Ekspektasi**|**Hasil Pemeriksaan**|**Status**|
|**FI-**<br>**22**|**SEC**|_order_repository.go:37_|Query product<br>memakai<br>parameter binding|Where("id_product = ?",<br>item.ProductID)|**PASS**|
|**FI-**<br>**23**|**SEC**|_order_repository.go:45_|Query variant<br>memakai<br>parameter binding|Where("id_variant = ?",<br>*item.VariantID)||
||||||**PASS**|
|**FI-**<br>**24**|**SEC**|_order_repository.go:107_|Delete cart<br>dibatasi per user|Where("id_user = ?",<br>userID) — tidak bisa<br>hapus cart user lain||
||||||**PASS**|
|**FI-**<br>**25**|**AUDIT**|_order_usecase.go:313-_<br>_323_|Batch supplier<br>mencatat audit<br>log|Audit log dibuat untuk<br>setiap order valid dalam<br>batch supplier||
||||||**PASS**|



Ringkasan: Seluruh 25 butir checklist (FI-01 s.d. FI-25) mendapat status PASS. Tidak ada temuan defect kritis pada core transaksi Checkout ACID. 

## **6. BUKTI SOURCE CODE KRITIS** 

## **6.1 Bukti Transaksi Atomik (TX)** 

Seluruh operasi inti — pembuatan order, order item, pengurangan stok, dan penghapusan cart — berada dalam satu callback db.Transaction. Jika salah satu operasi mengembalikan error, GORM secara otomatis melakukan rollback. 

```
err := r.db.Transaction(func(tx *gorm.DB) error {
    // ... validasi dan pengurangan stok ...
    if err := tx.Create(&createdOrder).Error; err != nil {
        return err   // trigger ROLLBACK
    }
    if err := tx.Create(&orderItems).Error; err != nil {
        return err   // trigger ROLLBACK
    }
    if err := tx.Where("id_user = ?", userID).Delete(&domain.CartItem{}).Error;
err != nil {
        return err   // trigger ROLLBACK
    }
    return nil       // trigger COMMIT
})
```

## **6.2 Bukti Locking Stok (ISO)** 

Baris produk dan varian dikunci menggunakan FOR UPDATE sebelum stok dibaca dan dikurangi. Hal ini memastikan dua checkout bersamaan tidak dapat membaca stok yang sama secara tidak terkendali. 

```
// Lock produk
tx.Clauses(clause.Locking{Strength: "UPDATE"}).
    Where("id_product = ?", item.ProductID).
    First(&product)
// Lock varian (jika ada)
tx.Clauses(clause.Locking{Strength: "UPDATE"}).
    Where("id_variant = ?", *item.VariantID).
    First(&variant)
```

## **6.3 Bukti Validasi Stok (STOCK)** 

Pengurangan stok hanya dilakukan setelah validasi berhasil. Jika stok tidak mencukupi, fungsi mengembalikan error dan transaction melakukan rollback — stok tidak pernah menjadi negatif. 

```
if product.Stock < item.Quantity {
    return fmt.Errorf("stok produk '%s' tidak mencukupi. Stok tersisa: %d",
        product.Name, product.Stock)
}
product.Stock -= item.Quantity   // pengurangan hanya setelah validasi
tx.Save(&product)
```

## **6.4 Bukti Payment Handling (PAY)** 

Pembuatan Snap Token Midtrans adalah proses eksternal yang dapat gagal secara independen. Kegagalan token hanya dicatat (log) dan tidak membatalkan order internal yang sudah tersimpan di database. 

```
snapResp, snapErr := u.snapTokenFn(order.ID, order.TotalAmount)
if snapErr == nil && snapResp != nil {
    order.PaymentToken = &snapResp.Token
    order.PaymentURL   = &snapResp.RedirectURL
    u.orderRepo.SavePaymentToken(order.ID, snapResp.Token,
snapResp.RedirectURL)
} else if snapErr != nil {
    // Log only — order internal TIDAK dibatalkan
    fmt.Printf("[MIDTRANS ERROR] Gagal generate Snap Token: %v\n", snapErr)
}
return order, nil   // order selalu dikembalikan
```

## **6.5 Bukti Security Baseline (SEC)** 

Semua query kritis menggunakan parameter binding GORM yang mencegah SQL injection. Scope Delete cart dibatasi ke userID milik session aktif. 

```
// Parameter binding — bukan string concatenation
Where("id_product = ?",  item.ProductID)    // FI-22
Where("id_variant = ?",  *item.VariantID)   // FI-23
Where("id_user   = ?",   userID)            // FI-24: scope delete per-user
```

## **7. TEST PENDUKUNG INSPEKSI** 

## **7.1 Command Eksekusi** 

```
cd backend-go
```

```
go test ./internal/usecase -run "TestCheckout|TestDataFlow|TestLoopTesting" -v
```

## **7.2 Hasil Eksekusi** 

```
=== RUN   TestCheckout_CartRepoError
--- PASS: TestCheckout_CartRepoError
=== RUN   TestCheckout_EmptyCart
--- PASS: TestCheckout_EmptyCart
=== RUN   TestCheckout_TransactionFails_StokKurang
--- PASS: TestCheckout_TransactionFails_StokKurang
=== RUN   TestCheckout_Success
--- PASS: TestCheckout_Success
=== RUN   TestCheckout_MidtransFails_OrderTetapKembali
--- PASS: TestCheckout_MidtransFails_OrderTetapKembali
=== RUN   TestCheckout_SnapRespNil_OrderTetapKembali
--- PASS: TestCheckout_SnapRespNil_OrderTetapKembali
=== RUN   TestDataFlow_CheckoutCartToOrderAndPaymentToken
--- PASS: TestDataFlow_CheckoutCartToOrderAndPaymentToken
=== RUN   TestLoopTesting_CheckoutCartItemCounts
--- PASS: TestLoopTesting_CheckoutCartItemCounts
=== RUN   TestLoopTesting_BatchProcessSupplierOrders
--- PASS: TestLoopTesting_BatchProcessSupplierOrders
=== RUN   TestLoopTesting_BatchProcessSupplierOrders_NoValidOrder
--- PASS: TestLoopTesting_BatchProcessSupplierOrders_NoValidOrder
PASS
ok   github.com/nuryanfa/e-commerse-sqa/internal/usecase
```

## **7.3 Pemetaan Test ke Checklist** 

|||||
|---|---|---|---|
|**Nama Test**|**Checklist**<br>**yang**<br>**Didukung**|**Skenario**<br>**Tervalidasi**|**Status**|
|_TestCheckout_CartRepoError_|FI-04|Error cart repo<br>tidak lanjut|**PASS**|
|_TestCheckout_EmptyCart_|FI-05|Cart kosong<br>ditolak (CHK-<br>04)||
||||**PASS**|
|_TestCheckout_TransactionFails_StokKurang_|FI-09, FI-10, FI-<br>17|Stok kurang,<br>transaction<br>rollback||
||||**PASS**|
|_TestCheckout_Success_|FI-06, FI-12, FI-<br>13, FI-14|Checkout<br>normal, order<br>terbuat||
||||**PASS**|
|_TestCheckout_MidtransFails_OrderTetapKembali_|FI-20|Midtrans<br>gagal, order<br>aman||
||||**PASS**|
|_TestCheckout_SnapRespNil_OrderTetapKembali_|FI-20|Snap nil, tidak<br>crash||
||||**PASS**|
|_TestDataFlow_CheckoutCartToOrderAndPaymentToken_|FI-21|Token & URL<br>tersimpan||
||||**PASS**|
|_TestLoopTesting_CheckoutCartItemCounts_|FI-05, FI-15|Variasi jumlah<br>cart item||
||||**PASS**|
|_TestLoopTesting_BatchProcessSupplierOrders_|FI-25|Audit log<br>batch supplier||
||||**PASS**|



## **8. ANALISIS ACID HASIL INSPEKSI** 

|||||
|---|---|---|---|
|**Prinsip ACID**|**Status**|**Bukti Source Code**|**Penjelasan**|
|**Atomicity**|**Terpenuhi**|_r.db.Transaction(...) — semua atau_<br>_tidak sama sekali_|Stok, order, order item, dan<br>cart cleanup dalam satu<br>unit transaksi|
|**Consistency**|**Terpenuhi**|_Validasi stok sebelum dikurangi;_<br>_PriceAtPurchase; Status PENDING_|Data order tidak dibuat jika<br>stok tidak cukup; harga di-<br>snapshot|
|**Isolation**|**Terpenuhi**|_clause.Locking{Strength: "UPDATE"}_<br>_pada produk & varian_|Dua checkout bersamaan<br>tidak bebas mengurangi<br>stok yang sama|
|**Durability**|**Terpenuhi**|_tx.Create(&createdOrder),_<br>_tx.Create(&orderItems) →_<br>_PostgreSQL_|Setelah COMMIT, order<br>tersimpan permanen dan<br>tidak hilang saat restart|



## **9. ANALISIS RISIKO** 

||||||
|---|---|---|---|---|
|**Risiko**|**Kondisi Saat Ini**|**Dampak**|**Status**|**Prioritas**|
|Overselling saat<br>checkout bersamaan|Ada FOR UPDATE<br>pada produk & varian|Risiko berkurang<br>signifikan|**Terkendali**|**Rendah**|
|Order dibuat tanpa item|Cart kosong ditolak;<br>order item dalam<br>transaction|Risiko sangat<br>rendah|**Terkendali**|**Rendah**|
|Stok minus / negatif|Validasi stok sebelum<br>pengurangan|Risiko sangat<br>rendah|**Terkendali**|**Rendah**|
|Transaksi parsial (partial<br>commit)|GORM transaction<br>rollback otomatis saat<br>error|Risiko sangat<br>rendah|**Terkendali**|**Rendah**|
|Kegagalan Midtrans tidak<br>terdeteksi client|Order tersimpan, error<br>di-log, tidak ada retry<br>otomatis|Risiko operasional<br>— client tidak<br>punya link<br>pembayaran|**Perlu**<br>**Monitor**|**Sedang**|
|Mapping error berbasis<br>string matching|classifyCheckoutError<br>memakai<br>strings.Contains|Rapuh jika pesan<br>error berubah|**Perlu**<br>**Perbaikan**|**Sedang**|
|Voucher tidak aktif tetapi<br>parameter masih ada|voucherCode<br>diteruskan antar layer<br>tanpa implementasi|Membingungkan<br>dokumentasi dan<br>pembaca kode|**Perlu**<br>**Catatan**|**Rendah**|



## **10. CATATAN HARDENING DI LUAR SCOPE FORMAL INSPECTION** 

Formal Inspection ini difokuskan pada core transaksi Checkout ACID. Beberapa aspek berikut memerlukan pengujian keamanan terpisah pada fase hardening produksi: 

10. CORS pada environment production harus dibatasi hanya ke domain resmi — bukan wildcard. 

11. Webhook Midtrans perlu validasi signature untuk mencegah pemalsuan notifikasi pembayaran. 

12. Endpoint Swagger/OpenAPI sebaiknya dibatasi aksesnya atau dihapus pada environment production. 

13. Rate limiting dapat diperluas ke endpoint checkout dan seluruh endpoint sensitif lainnya. 

14. File konfigurasi .env tidak boleh masuk ke version control repository. 

15. Upload file perlu validasi MIME type, ukuran maksimal, dan ekstensi yang diizinkan. 

16. JWT secret harus berupa nilai acak yang kuat dan unik untuk setiap environment production. 

## **11. TRACEABILITY MATRIX** 

Tabel berikut menunjukkan pemetaan lengkap antara butir checklist Formal Inspection, skenario blackbox yang direferensikan, bukti kode, dan status akhir. 

||||||
|---|---|---|---|---|
|**Checklist**|**Skenario Black-**<br>**Box**|**Bukti Source Code**|**Jumlah**<br>**Item**|**Status**|
|**FI-01 s.d. FI-03**|CHK-06 (Tanpa<br>JWT)|_Handler auth context —_<br>_c.Get("user_id")_|3|**PASS**|
|**FI-04 s.d. FI-05**|CHK-04 (Cart<br>kosong)|_Usecase cart validation —_<br>_len(cartItems)_|2||
|||||**PASS**|
|**FI-06 s.d. FI-17**|CHK-01, 02, 03, 07,<br>08|_Repository transaction, lock,_<br>_stok, order_|12||
|||||**PASS**|
|**FI-18 s.d. FI-19**|CHK-02, 04, 05|_classifyCheckoutError —_<br>_HTTP mapping_|2||
|||||**PASS**|
|**FI-20 s.d. FI-21**|CHK-05 (Midtrans<br>error)|_snapTokenFn, log,_<br>_SavePaymentToken_|2||
|||||**PASS**|
|**FI-22 s.d. FI-24**|Security baseline|_Parameter binding GORM —_<br>_Where("? = ?", val)_|3||
|||||**PASS**|
|**FI-25**|Pasca-checkout<br>supplier|_BatchProcessSupplierOrders_<br>_— audit log_|1||
|||||**PASS**|



## **12. RINGKASAN EKSEKUTIF** 

||||
|---|---|---|
|**Kategori**|**Nilai**|**Status**|
|Total Butir Checklist|25 butir (FI-01 s.d. FI-25)|**Semua Tereksekusi**|
|Checklist PASS|25 / 25 (100%)|**PASS**|
|Checklist FAIL / Defect Kritis|0|**Tidak Ada**|
|Prinsip ACID Terpenuhi|4 / 4 (Atomicity,<br>Consistency, Isolation,<br>Durability)|**Terpenuhi Penuh**|
|Unit Test Pendukung|10 / 10 PASS|**PASS**|
|Risiko Kritis (core transaksi)|0 risiko kritis|**Terkendali**|
|Risiko Perlu Monitoring/Perbaikan|2 (Midtrans retry, string-<br>based error mapping)|**Sedang**|
|Catatan Hardening di Luar Scope|7 poin (CORS, webhook,<br>secret, dsb.)|**Perlu Security Review**|



## **13. KESIMPULAN** 

Formal Inspection pada fitur Checkout ACID dinyatakan **LULUS** berdasarkan seluruh 25 butir checklist (FI-01 s.d. FI-25) yang mendapat status PASS. 

Source code checkout telah memenuhi seluruh aspek berikut sesuai hasil inspeksi: 

17. Autentikasi checkout dilakukan melalui JWT context — user tidak dapat memanipulasi identitas dari body request. 

18. Cart kosong ditolak di level usecase sebelum transaksi database dimulai. 

19. Seluruh operasi inti berada dalam satu transaksi atomik (db.Transaction) dengan rollback otomatis. 

20. Validasi stok produk dan varian dilakukan sebelum pengurangan — stok tidak dapat menjadi negatif. 

21. Row locking (FOR UPDATE) melindungi dari race condition pada checkout bersamaan. 

22. Order dan order item dibuat secara konsisten dengan snapshot harga (PriceAtPurchase). 

23. Cart dihapus dalam transaksi yang sama — tidak ada cart tersisa setelah order berhasil. 

24. Error bisnis dipetakan ke HTTP 400/409/502 — tidak ada unhandled 500 pada kondisi yang dapat diantisipasi. 

25. Kegagalan Midtrans tidak membatalkan order internal — order tetap durable. 

26. Seluruh query utama menggunakan parameter binding GORM — baseline SQL injection prevention terpenuhi. 

Risiko tersisa yang memerlukan tindak lanjut bukan berada pada core transaksi Checkout ACID, melainkan pada hardening production (CORS, webhook signature, secret management, retry payment token, dan typed error). Seluruh poin tersebut direkomendasikan untuk ditangani dalam Security Review terpisah sebelum go-live. 

