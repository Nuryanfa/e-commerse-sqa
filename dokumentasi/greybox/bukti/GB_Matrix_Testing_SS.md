## **LAPORAN SOFTWARE QUALITY ASSURANCE METODE GREYBOX – MATRIX TESTING** 

## Anggota kelompok: 

20231310046 20231310047 

M. Irvan Alfiansyah M. Nur Yanfa 

**PROGRAM STUDI TEKNIK INFORMATIKA UNIVERSITAS KEBANGSAAN REPUBLIK INDONESIA** _Jln. Terusan Halimun No. 37 (Pelajar Pejuang 45) Lingkar Selatan Kec. Lengkong kota Bandung Jawa Barat 40263_ 

## **1. DASAR TEORI MATRIX TESTING** 

Matrix Testing adalah metode grey box testing yang memetakan hubungan antara kebutuhan sistem, skenario pengujian, endpoint, source code, unit test, dan hasil aktual secara terstruktur dalam satu matriks. 

Pendekatan ini disebut grey box karena penguji tidak hanya menguji perilaku dari luar (seperti blackbox), tetapi juga menggunakan pengetahuan struktur internal kode (seperti white-box). Hasilnya adalah gambaran menyeluruh tentang kecukupan pengujian dari kedua sisi. 

Pada Matrix Testing, satu skenario tidak dinilai hanya dari respons HTTP. Setiap skenario ditelusuri sampai ke: 

1. Layer Handler — entry point endpoint 

2. Layer Usecase — logika bisnis dan orkestrasi 

3. Layer Repository — eksekusi transaksi database 

4. Transaksi Database — bukti ACID 

5. Test Otomatis — unit test dan k6 

6. Hasil Uji Runtime — output aktual 

Matrix Testing membantu menjawab pertanyaan: Apakah setiap kebutuhan checkout sudah memiliki bukti pengujian dari sisi luar (black-box) sekaligus bukti implementasi dari sisi dalam (white-box)? 

## **2. ALASAN PEMILIHAN MATRIX TESTING** 

Matrix Testing dipilih sebagai tahap penggabung karena fitur Checkout ACID telah diuji secara mendalam dengan dua pendekatan terpisah sebelumnya: 

|||
|---|---|
|**Pendekatan**|**Bukti Pengujian Sebelumnya**|
|**Black-Box Testing**|BVA, Class Partitioning, Performance Testing (k6), Endurance Testing (k6),<br>Sample Testing|
|**White-Box Testing**|Basic Path Testing, Code Walkthrough, Data Flow Testing, Loop Testing,<br>Formal Inspection|



Matrix Testing menjadi lapisan akhir yang memastikan setiap skenario checkout memiliki hubungan yang jelas dan terdokumentasi: 

Requirement  →  Endpoint  →  Source Code  →  Test Case  →  Hasil Aktual  →  Kesimpulan 

## **3. RUANG LINGKUP PENGUJIAN** 

Pengujian berfokus pada fitur Checkout ACID. Tidak mencakup fitur non-checkout seperti katalog umum, upload gambar, admin dashboard, atau kurir, kecuali bagian supplier yang berkaitan langsung dengan order hasil checkout. 

|||||
|---|---|---|---|
|**ID**|**Area**|**Dicakup**|**Keterangan**|
|**S-01**|Checkout keranjang|**Ya**|Fokus utama — alur checkout end-to-end|
|**S-02**|Validasi stok|**Ya**|Bagian utama ACID — consistency dan isolation|
|**S-03**|Auth/JWT checkout|**Ya**|Mencegah checkout tanpa sesi yang valid|
|**S-04**|Payment token Midtrans|**Ya**|Bagian setelah order dibuat — proses eksternal|
|**S-05**|Atomicity transaksi|**Ya**|Pengurangan stok dan pembuatan order dalam<br>satu unit|
|**S-06**|Performance checkout|**Ya**|Menggunakan hasil k6 performance test|
|**S-07**|Endurance checkout|**Ya**|Menggunakan hasil k6 endurance test (40 menit)|
|**S-08**|UI tampilan frontend|**Tidak**|Di luar scope Matrix Testing Checkout ACID|



## **4. OBJEK SOURCE CODE YANG DIUJI** 

||||||
|---|---|---|---|---|
|**No**|**File**|**Baris**|**Fungsi / Bagian**|**Peran Dalam Matrix**|
|1|_order_handler.go_|15-26|classifyCheckoutError|Mapping error bisnis dan<br>gateway ke HTTP response|
|2|_order_handler.go_|60-87|OrderHandler.Checkout|Entry point endpoint checkout<br>— autentikasi dan response|
|3|_order_usecase.go_|72-99|orderUsecase.Checkout|Orkestrasi cart, transaction,<br>dan Snap Token|
|4|_order_repository.go_|23-<br>120|CheckoutTransaction|Transaksi database ACID —<br>inti proses checkout|
|5|_order_repository.go_|37, 45|Locking FOR UPDATE|Isolation transaksi stok —<br>mencegah race condition|
|6|_order_repository.go_|48-64|Validasi stok|Consistency stok — cegah stok<br>negatif|
|7|_order_repository.go_|86-<br>108|Create order, items,<br>delete cart|Atomicity dan durability — satu<br>transaction, satu commit|



## **5. SOURCE CODE KRITIS** 

## **5.1 Handler Checkout** 

Entry point endpoint checkout. Bertanggung jawab memvalidasi sesi JWT, membaca body opsional, dan menerjemahkan error usecase ke respons HTTP. 

```
func (h *OrderHandler) Checkout(c *gin.Context) {
    // Validasi sesi JWT dari context middleware
    uidVal, exists := c.Get("user_id")
    if !exists {
        response.Error(c, response.ErrUnauthorized("Sesi pengguna tidak valid"))
        return
    }
    uid, ok := uidVal.(string)
    if !ok {
        response.Error(c, response.ErrUnauthorized("Sesi pengguna tidak valid"))
        return
    }
    // Body opsional — voucher_code saja
    var req struct {
        VoucherCode string `json:"voucher_code"`
    }
_ = c.ShouldBindJSON(&req)
    order, err := h.orderUsecase.Checkout(uid, req.VoucherCode)
    if err != nil {
        response.Error(c, classifyCheckoutError(err))
        return
    }
    response.Success(c, http.StatusCreated,
        "Checkout berhasil. Silakan lakukan pembayaran.", order)
}
```

## **5.2 Usecase Checkout** 

Orkestrasi alur bisnis checkout: validasi cart, memanggil transaksi repository, dan menangani payment token Midtrans sebagai proses eksternal yang dapat gagal secara independen. 

```
func (u *orderUsecase) Checkout(userID string, voucherCode string) (*domain.Order,
error) {
    cartItems, err := u.cartRepo.FindByUserID(userID)
    if err != nil {
        return nil, errors.New("gagal memuat keranjang belanja")
    }
    if len(cartItems) == 0 {
        return nil, errors.New("keranjang belanja anda kosong. tidak bisa checkout")
    }
```

```
    order, err := u.orderRepo.CheckoutTransaction(userID, cartItems, voucherCode)
    if err != nil {
        return nil, errors.New("Checkout gagal: " + err.Error())
    }
```

```
    // Payment token — proses eksternal, gagal tidak batalkan order
    snapResp, snapErr := u.snapTokenFn(order.ID, order.TotalAmount)
    if snapErr == nil && snapResp != nil {
        order.PaymentToken = &snapResp.Token
        order.PaymentURL   = &snapResp.RedirectURL
        u.orderRepo.SavePaymentToken(order.ID, snapResp.Token, snapResp.RedirectURL)
    } else if snapErr != nil {
        fmt.Printf("[MIDTRANS ERROR] Gagal generate Snap Token: %v\n", snapErr)
    }
```

```
    return order, nil
}
```

## **5.3 Repository Transaction** 

Inti transaksi ACID. Seluruh operasi — lock produk, validasi stok, pengurangan stok, pembuatan order, dan penghapusan cart — dieksekusi dalam satu database transaction. 

```
err := r.db.Transaction(func(tx *gorm.DB) error {
    for _, item := range cartItems {
        // Lock produk FOR UPDATE — isolation
        var product domain.Product
        tx.Clauses(clause.Locking{Strength: "UPDATE"}).
            Where("id_product = ?", item.ProductID).First(&product)
        // Validasi stok — consistency
        if product.Stock < item.Quantity {
            return fmt.Errorf("stok produk '%s' tidak mencukupi. Stok tersisa: %d",
                product.Name, product.Stock)
        }
        product.Stock -= item.Quantity
        tx.Save(&product)
        totalAmount += priceAtPurchase * float64(item.Quantity)
        orderItems = append(orderItems, domain.OrderItem{ ... })
    }
```

```
    // Atomicity: order, items, dan cart cleanup satu commit
    if err := tx.Create(&createdOrder).Error;  err != nil { return err }
    if err := tx.Create(&orderItems).Error;    err != nil { return err }
    if err := tx.Where("id_user = ?", userID).
        Delete(&domain.CartItem{}).Error; err != nil { return err }
    return nil   // COMMIT
})
```

## **6. MATRIKS REQUIREMENT, ENDPOINT, SOURCE CODE, DAN TEST** 

Tabel berikut adalah inti dari Matrix Testing — setiap requirement dipetakan secara horizontal dari bukti black-box, bukti white-box, implementasi source code, hingga status akhir. 

||||||||
|---|---|---|---|---|---|---|
|**ID**<br>**Matr**<br>**ix**|**Requireme**<br>**nt /**<br>**Skenario**|**Endpoint**|**Black-Box**<br>**Evidence**|**White-Box**<br>**Evidence**|**Source Code**||
|**MX-**<br>**CHK**<br>**-01**|Checkout<br>berhasil<br>membuat<br>order|_POST_<br>_/orders/chec_<br>_kout_|Sample ST-CHK-<br>01; Performance<br>success|Basic Path; Code<br>Walkthrough|_OrderHandler.Checkout,_<br>_CheckoutTransaction_|**PAS**<br>**S**|
|**MX-**<br>**CHK**<br>**-02**|Checkout<br>stok kurang<br>ditolak|_POST_<br>_/orders/chec_<br>_kout_|BVA, Class<br>Partitioning,<br>Sample ST-CHK-<br>04|Basic Path;<br>Formal<br>Inspection|_product.Stock <_<br>_item.Quantity_||
|||||||**PAS**<br>**S**|
|**MX-**<br>**CHK**<br>**-03**|Checkout<br>cart kosong<br>ditolak|_POST_<br>_/orders/chec_<br>_kout_|Sample ST-CHK-<br>02|Basic Path; Loop<br>Testing|_len(cartItems) == 0_||
|||||||**PAS**<br>**S**|
|**MX-**<br>**CHK**<br>**-04**|Checkout<br>tanpa token<br>ditolak|_POST_<br>_/orders/chec_<br>_kout_|Sample ST-CHK-<br>05|Basic Path<br>Handler|_c.Get("user_id")_||
|||||||**PAS**<br>**S**|
|**MX-**<br>**CHK**<br>**-05**|Error bisnis<br>tidak<br>menghasilk<br>an 500/502|_POST_<br>_/orders/chec_<br>_kout_|Sample,<br>performance,<br>endurance|classifyCheckout<br>Error|_Error stok/cart → HTTP 400_||
|||||||**PAS**<br>**S**|
|**MX-**<br>**CHK**<br>**-06**|Midtrans<br>error tidak<br>menghilang<br>kan order|_Internal_<br>_(Snap_<br>_Token)_|White-box mock<br>Midtrans|Basic Path; Code<br>Walkthrough|_snapTokenFn, snapErr_<br>_branch_||
|||||||**PAS**<br>**S**|
|**MX-**<br>**CHK**<br>**-07**|Stok tidak<br>boleh<br>negatif|_POST_<br>_/orders/chec_<br>_kout_|Endurance — stok<br>akhir 0, bukan<br>negatif|Formal<br>Inspection|_Validasi stok sebelum_<br>_decrement_||
|||||||**PAS**<br>**S**|
|**MX-**<br>**CHK**<br>**-08**|Order<br>dibuat<br>dengan<br>status<br>PENDING|_POST_<br>_/orders/chec_<br>_kout_|Response<br>checkout/order|Basic Path|_Status: "PENDING"_||
|||||||**PAS**<br>**S**|
|**MX-**<br>**CHK**<br>**-09**|Data<br>checkout<br>mengalir<br>benar dari<br>cart ke<br>order|_POST_<br>_/orders/chec_<br>_kout_|Black-box<br>checkout sukses|Data Flow<br>Testing|_CheckoutTransaction(userID_<br>_, cartItems, voucherCode)_||
|||||||**PAS**<br>**S**|
|**MX-**<br>**CHK**<br>**-10**|Banyak<br>item cart<br>diproses<br>lengkap|_POST_<br>_/orders/chec_<br>_kout_|Skenario cart<br>multi-item|Loop Testing|_for _, item := range cartItems_||
|||||||**PAS**<br>**S**|



||||||||
|---|---|---|---|---|---|---|
|**ID**<br>**Matr**<br>**ix**|**Requireme**<br>**nt /**<br>**Skenario**|**Endpoint**|**Black-Box**<br>**Evidence**|**White-Box**<br>**Evidence**|**Source Code**||
|**MX-**<br>**CHK**<br>**-11**|Race<br>condition<br>dikendalika<br>n|_POST_<br>_/orders/chec_<br>_kout_|Performance/endur<br>ance tanpa<br>500/502|Formal<br>Inspection|_clause.Locking{Strength:"UP_<br>_DATE"}_|**PAS**<br>**S**|
|**MX-**<br>**CHK**<br>**-12**|CI menjaga<br>regresi<br>checkout|_GitHub_<br>_Actions_|CI commit<br>22ed766 —<br>Success|Unit test + build|_.github/workflows/ci.yml_||
|||||||**PAS**<br>**S**|



Seluruh 12 butir matriks (MX-CHK-01 s.d. MX-CHK-12) mendapat status PASS. Setiap requirement memiliki bukti dari kedua sisi pengujian. 

## **7. MATRIKS ACID** 

Matriks berikut memverifikasi bahwa setiap prinsip ACID memiliki requirement yang jelas, implementasi source code yang dapat diidentifikasi, dan bukti test yang mendukung. 

||||||
|---|---|---|---|---|
|**Prinsip**<br>**ACID**|**Requirement**|**Source Code**|**Test Pendukung**|**Hasil**|
|**Atomicity**|Stok, order, order item,<br>dan cart cleanup harus<br>satu transaksi|_r.db.Transaction(...) —_<br>_semua atau rollback_|Basic Path, Formal Inspection|**PASS**|
|**Consistency**|Stok cukup sebelum<br>dikurangi; order item<br>memakai harga saat<br>checkout|_product.Stock <_<br>_item.Quantity,_<br>_PriceAtPurchase_|Data Flow Testing, Sample<br>Testing||
|||||**PASS**|
|**Isolation**|Checkout bersamaan<br>tidak boleh<br>menyebabkan race stok|_clause.Locking{Strength:_<br>_"UPDATE"}_|Performance, Endurance,<br>Formal Inspection||
|||||**PASS**|
|**Durability**|Order tersimpan<br>permanen setelah<br>checkout sukses|_tx.Create(&createdOrder),_<br>_tx.Create(&orderItems)_|Unit test<br>TestCheckout_Success, live<br>checkout||
|||||**PASS**|



## **8. RANCANGAN TEST MATRIX** 

Sepuluh test matrix berikut menggabungkan perspektif black-box (kondisi input/output) dan white-box (implementasi internal) dalam satu rancangan pengujian yang terintegrasi: 

||||||
|---|---|---|---|---|
|**ID**<br>**Test**|**Nama Test**|**Input /**<br>**Kondisi**|**Ekspektasi**|**Bukti Aktual**|
|**GMT-**<br>**01**|Matrix<br>checkout valid|User login,<br>cart berisi 1<br>item, stok<br>cukup|HTTP 201,<br>order dibuat|_K6 ST-CHK-01, unit TestCheckout_Success_|
|**GMT-**<br>**02**|Matrix cart<br>kosong|User login,<br>cart kosong|HTTP 400,<br>tidak ada<br>transaction|_K6 ST-CHK-02, unit TestCheckout_EmptyCart_|
|**GMT-**<br>**03**|Matrix stok<br>kurang|Quantity<br>melebihi<br>stok|HTTP 400/4xx<br>valid, bukan<br>500|_K6 ST-CHK-04, unit_<br>_TestCheckout_TransactionFails_StokKurang_|
|**GMT-**<br>**04**|Matrix<br>unauthorized|Checkout<br>tanpa JWT|HTTP 401|_K6 ST-CHK-05, Basic Path handler_|
|**GMT-**<br>**05**|Matrix<br>Midtrans<br>failure|Snap Token<br>gagal|Order tetap<br>ada, token nil|_unit TestCheckout_MidtransFails_OrderTetapKembali_|
|**GMT-**<br>**06**|Matrix data<br>flow|Cart 2 item,<br>1 item<br>memiliki<br>varian|Data tidak<br>hilang sampai<br>payment<br>token|_unit_<br>_TestDataFlow_CheckoutCartToOrderAndPaymentToken_|
|**GMT-**<br>**07**|Matrix loop|Cart 0, 1, 3<br>item|Perilaku loop<br>sesuai kondisi<br>iterasi|_unit TestLoopTesting_CheckoutCartItemCounts_|
|**GMT-**<br>**08**|Matrix<br>endurance|Checkout<br>durasi 40<br>menit|Tidak ada<br>500/502, stok<br>tidak negatif|_K6 checkout_endurance_test.js_|
|**GMT-**<br>**09**|Matrix<br>performance|Checkout 10<br>VU|p95 <<br>2000ms,<br>server error<br>rate < 1%|_K6 checkout_performance_test.js_|
|**GMT-**<br>**10**|Matrix CI<br>regression|Push ke<br>main branch|Backend dan<br>frontend build<br>lulus|_GitHub Actions commit 22ed766 — Success_|



## **9. EKSEKUSI PENGUJIAN PENDUKUNG** 

## **9.1 Command Unit Test** 

```
cd backend-go
```

```
go test ./internal/usecase -run "TestCheckout|TestDataFlow|TestLoopTesting" -v
```

## **9.2 Output Aktual** 

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

Catatan: Pada TestCheckout_Success, muncul log Midtrans API key kosong karena environment test lokal tidak memakai server key production. Hal ini tidak menggagalkan test dan sesuai desain usecase — kegagalan Snap Token tidak membatalkan order internal. 

## **10. BUKTI BLACK-BOX / K6 YANG DIPAKAI DALAM MATRIX** 

||||
|---|---|---|
|**Jenis Pengujian**|**Ringkasan Hasil Aktual**|**Status**|
|**Checkout Performance**|_p95=76.85ms  |  server_error_rate=0.00%  |  checkout_success=99_<br>_|  checkout_rejected=792_|**PASS**|
|**Checkout Endurance**|_Durasi 40 menit  |  p95=254.35ms  |  server_error_rate=0.00%  |_<br>_checkout_success=140  |  stok akhir=0 (bukan negatif)_||
|||**PASS**|
|**Checkout Sample Testing**|_Valid checkout, cart kosong, invalid quantity, overstock,_<br>_unauthorized — semua sesuai ekspektasi_||
|||**PASS**|
|**Public Catalog**<br>**Performance**|_p95=27.04ms  |  http_req_failed=0.00%  |  endpoint katalog stabil_||
|||**PASS**|



## **11. BUKTI CI / REGRESSION GATE** 

CI diterapkan menggunakan GitHub Actions melalui file .github/workflows/ci.yml. Workflow secara otomatis menjalankan: 

7. Generate Swagger docs 

8. go test ./... — seluruh unit test backend Go 

9. Build Go API binary 

10. npm ci — install dependencies frontend 

11. npm run build — build production frontend 

|||||
|---|---|---|---|
|**Commit**|**Workflow**|**Durasi**|**Status**|
|**_22ed766_**|||**PASS**|
||SayurSehat CI — Backend Go +<br>Ftd Bild|1 menit 40 detik||
||ronen u|||



CI ini memperkuat Matrix Testing karena hasil pengujian checkout dapat dijadikan regression gate otomatis pada setiap perubahan kode yang di-push ke main branch. 

## **12. ANALISIS MATRIX** 

## **12.1 Kecukupan Coverage** 

Matrix menunjukkan bahwa semua skenario utama Checkout ACID memiliki bukti dari kedua sisi secara simultan: 

- Bukti black-box berupa response endpoint, output k6, dan status HTTP. 

- Bukti white-box berupa source code yang dapat ditelusuri dan unit test otomatis. 

Tidak ditemukan requirement Checkout ACID utama yang hanya memiliki bukti dari satu sisi saja. Setiap butir MX-CHK-01 s.d. MX-CHK-12 memiliki kolom bukti yang terisi pada kedua sisi. 

## **12.2 Kesesuaian Error Handling** 

Error bisnis seperti cart kosong dan stok kurang tidak dikembalikan sebagai 500 Internal Server Error. Error tersebut dipetakan secara eksplisit sebagai 400 Bad Request melalui fungsi classifyCheckoutError. Hal ini konsisten antara: 

- Hasil sample testing: ST-CHK-02 dan ST-CHK-04 mendapat HTTP 400. 

- Source code: classifyCheckoutError memetakan pesan error berbasis string ke status HTTP yang tepat. 

- Performance dan endurance: server_error_rate = 0.00% pada seluruh skenario. 

## **12.3 Kesesuaian ACID** 

Matriks ACID pada bagian 7 menunjukkan bahwa keempat prinsip memiliki bukti source code yang jelas dan dapat diverifikasi: 

- Atomicity: r.db.Transaction — satu callback, satu commit atau rollback. 

- Consistency: validasi stok sebelum decrement, PriceAtPurchase di-snapshot. 

- Isolation: FOR UPDATE pada produk dan varian — diperkuat oleh 0% server error saat load test. 

- Durability: tx.Create pada order dan order item — data tersimpan setelah COMMIT. 

## **12.4 Kesesuaian Dengan Production** 

Pengujian performance dan endurance pernah dijalankan ke domain production sayursehat.site. Hasilnya menunjukkan endpoint checkout stabil dengan p95 di bawah ambang batas. Namun, pengujian live terhadap production perlu dilakukan dengan hati-hati karena dapat mengurangi stok produk yang nyata. 

Rekomendasi: Siapkan produk atau environment staging khusus untuk keperluan pengujian load dan endurance agar tidak mengganggu stok production. 

## **13. TEMUAN** 

||||||
|---|---|---|---|---|
|**ID**|**Temuan**|**Dampak**|**Rekomendasi**|**Prioritas**|
|**GMT-**<br>**F01**|Semua skenario Checkout<br>ACID utama sudah punya<br>mapping black-box dan<br>white-box|Positif: tidak ada blind<br>spot pengujian|Pertahankan matrix sebagai<br>artefak traceability untuk versi<br>berikutnya|**Tinggi**|
|**GMT-**<br>**F02**|CI sudah berjalan sukses<br>untuk backend dan<br>frontend|Positif: regresi<br>terdeteksi otomatis|Gunakan sebagai regression<br>gate — wajib hijau sebelum<br>merge ke main|**Tinggi**|
|**GMT-**<br>**F03**|Live checkout testing<br>dapat mengubah stok<br>production|Risiko operasional —<br>mengganggu data stok<br>nyata|Gunakan produk khusus<br>testing atau environment<br>staging terpisah|**Sedang**|
|**GMT-**<br>**F04**|Midtrans test lokal<br>menghasilkan warning<br>API key kosong|Tidak merusak test —<br>hanya log warning|Gunakan mock/injection untuk<br>Midtrans di semua<br>environment test|**Rendah**|
|**GMT-**<br>**F05**|Voucher tidak aktif di<br>repository checkout,<br>parameter masih ada|Potensi salah tafsir<br>scope oleh pembaca<br>kode|Dokumentasikan bahwa<br>voucher di luar scope<br>Checkout ACID aktif saat ini|**Rendah**|



## **14. KESIMPULAN** 

Grey Box Matrix Testing pada fitur Checkout ACID dinyatakan **LULUS** berdasarkan 12 butir matriks (MX-CHK-01 s.d. MX-CHK-12), 10 test matrix (GMT-01 s.d. GMT-10), dan 4 prinsip ACID yang semuanya terpenuhi. 

Berdasarkan matriks requirement, endpoint, source code, test otomatis, hasil k6, dan CI, seluruh skenario utama checkout memiliki bukti pengujian yang memadai dari kedua sisi: 

12. Checkout berhasil — order terbentuk dengan HTTP 201. 

13. Cart kosong ditolak — error bisnis, bukan server crash. 

14. Stok kurang ditolak — validasi sebelum pengurangan. 

15. Checkout tanpa token ditolak — autentikasi via JWT context. 

16. Error bisnis tidak menjadi server crash — classifyCheckoutError memetakan ke 400/409/502. 

17. Midtrans error tidak menghilangkan order internal — order tetap durable. 

18. Stok tidak negatif — terbukti dari endurance test selama 40 menit. 

19. Order dibuat dengan status PENDING — konsisten di seluruh pengujian. 

20. Data checkout mengalir dari cart ke order dan payment token. 

21. CI menjaga regression pada setiap push ke main. 

