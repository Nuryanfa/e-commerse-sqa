## **LAPORAN SOFTWARE QUALITY ASSURANCE METODE WHITEBOX – CODE WALKTHROUGH** 

## Anggota kelompok: 

20231310046 M. Irvan Alfiansyah 20231310047 M. Nur Yanfa 

**PROGRAM STUDI TEKNIK INFORMATIKA UNIVERSITAS KEBANGSAAN REPUBLIK INDONESIA** _Jln. Terusan Halimun No. 37 (Pelajar Pejuang 45) Lingkar Selatan Kec. Lengkong kota Bandung Jawa Barat 40263_ 

## **1. DASAR TEORI CODE WALKTHROUGH** 

Code Walkthrough adalah metode white box testing yang dilakukan dengan menelusuri source code secara sistematis dari titik masuk hingga titik keluar program. Penguji membaca alur kode, menandai keputusan penting, memeriksa aliran data, lalu membandingkan implementasi dengan kebutuhan sistem. 

Pada fitur Checkout ACID, metode ini digunakan karena proses checkout tidak hanya membuat order, melainkan juga mencakup: 

1. Validasi sesi pengguna (autentikasi JWT) 

2. Pembacaan keranjang belanja (cart) 

3. Pembentukan transaksi database (BEGIN / COMMIT / ROLLBACK) 

4. Validasi stok produk dan varian 

5. Pengurangan stok secara atomik 

6. Pembuatan order dan order item 

7. Penghapusan cart setelah order berhasil 

8. Pembuatan Snap Token Midtrans (payment gateway) 

9. Pengembalian respons HTTP yang sesuai 

Jika salah satu tahap tersebut tidak sesuai, dapat terjadi transaksi parsial, stok minus, order tanpa item, atau respons HTTP yang keliru. Oleh karena itu, code walkthrough dilakukan menyeluruh pada ketiga layer: Handler, Usecase, dan Repository. 

## **2. RUANG LINGKUP PENGUJIAN** 

Pengujian difokuskan pada fitur Checkout ACID yang sama dengan pengujian black-box sebelumnya. Tidak mencakup landing page, katalog, login, register, atau fitur non-checkout. 

|||||
|---|---|---|---|
|**ID Black-**<br>**Box**|**Skenario**|**Dicakup**|**Titik Kode yang Ditelusuri**|
|**CHK-01**|Checkout berhasil|Ya|Handler, usecase, repository transaction|
|**CHK-02**|Stok tidak mencukupi|Ya|Validasi stok produk dan varian|
|**CHK-03**|Race condition checkout<br>bersamaan|Ya|Locking FOR UPDATE dalam transaksi|
|**CHK-04**|Keranjang kosong|Ya|Guard len(cartItems) == 0|
|**CHK-05**|Midtrans API error|Ya|snapTokenFn dan fallback Midtrans error|
|**CHK-06**|Checkout tanpa<br>JWT/session|Ya|Validasi user_id di handler|
|**CHK-07**|Atomicity stok dan order|Ya|db.Transaction dan rollback otomatis|
|**CHK-08**|Status order PENDING|Ya|Pembuatan domain.Order di repository|



## **3. OBJEK SOURCE CODE YANG DIUJI** 

|||||||
|---|---|---|---|---|---|
|**No**|**File**|**Baris**|**Fungsi / Bagian**|**Layer**|**Alasan**<br>**Diuji**|
|1|_order_handler.go_|15-26|classifyCheckoutError|HTTP<br>helper|Pemetaan<br>error bisnis<br>& gateway<br>ke status<br>HTTP|
|2|_order_handler.go_|60-87|OrderHandler.Checkout|Handler|Titik masuk<br>endpoint<br>checkout|
|3|_order_usecase.go_|72-99|orderUsecase.Checkout|Usecase|Pusat<br>orkestrasi<br>cart,<br>transaction,<br>dan<br>payment<br>token|
|4|_order_repository.go_|23-<br>120|CheckoutTransaction|Repository|Area utama<br>transaksi<br>ACID|
|5|_order_repository.go_|33-81|Loop cart item|Repository|Validasi<br>stok,<br>subtotal,<br>dan order<br>item|
|6|_order_repository.go_|85-<br>109|Create order, items,<br>delete cart|Repository|Bukti<br>atomicity<br>dan<br>durability|
|7|_order_whitebox_additional_test.go_|110-<br>259|Data flow & loop tests|Unit test|Bukti<br>otomatis<br>tambahan<br>untuk hasil<br>walkthrough|



## **4. GAMBARAN ALUR CHECKOUT** 

Alur keseluruhan sistem checkout melewati tiga layer utama secara berurutan: 

## `Client` 

- `-> POST /api/v1/orders/checkout` 

- `-> Auth middleware mengisi user_id` 

- `-> OrderHandler.Checkout` 

- `-> orderUsecase.Checkout` 

- `-> cartRepo.FindByUserID` 

- `-> orderRepo.CheckoutTransaction` 

```
  -> PostgreSQL transaction (BEGIN)
     -> lock product FOR UPDATE
     -> lock variant FOR UPDATE (jika ada)
     -> validasi & kurangi stok
     -> create order + order_items
     -> delete cart
```

```
  -> COMMIT
```

```
  -> snapTokenFn / Midtrans (opsional)
```

```
  -> response 201 Created atau error valid
```

||||
|---|---|---|
|**Layer**|**Tanggung Jawab**|**Bukti Kode**|
|**Handler**|Validasi sesi, membaca body<br>opsional, mengubah error menjadi<br>HTTP response|_OrderHandler.Checkout_|
|**Usecase**|Mengambil cart, menolak cart<br>kosong, memanggil transaction,<br>membuat token pembayaran|_orderUsecase.Checkout_|
|**Repository**|Menjalankan transaksi database<br>atomik (lock, validasi stok, create,<br>delete)|_CheckoutTransaction_|



## **5. WALKTHROUGH FUNGSI: classifyCheckoutError** 

## 5.1 Source Code yang Diuji 

```
func classifyCheckoutError(err error) *response.AppError {
    msg := err.Error()
    switch {
    case strings.Contains(msg, "keranjang belanja anda kosong"):
        return response.ErrBadRequest(msg)
    case strings.Contains(msg, "stok tidak mencukupi"),
         strings.Contains(msg, "Stok"),
         strings.Contains(msg, "stok"):
        return response.ErrBadRequest(msg)
    case strings.Contains(msg, "midtrans"),
         strings.Contains(msg, "Midtrans"),
         strings.Contains(msg, "snap"),
         strings.Contains(msg, "payment gateway"):
        return &response.AppError{
            Code: http.StatusBadGateway,
            Message: "Layanan pembayaran tidak tersedia",
            Detail: msg,
```

```
    default:
        return response.ErrConflict(msg)
```

```
}
```

## **5.2 Langkah Walkthrough** 

|||||
|---|---|---|---|
|**Langkah**|**Observasi Kode**|**Penilaian**|**Status**|
|1|Error diubah menjadi string melalui<br>err.Error()|Sesuai — sumber error dari<br>repository/usecase berupa pesan<br>bisnis||
||||**PASS**|
|2|Pesan cart kosong dikembalikan<br>sebagai 400 Bad Request|Sesuai CHK-04||
||||**PASS**|
|3|Pesan stok kurang dikembalikan<br>sebagai 400 Bad Request|Sesuai CHK-02 dan sample<br>testing||
||||**PASS**|
|4|Error Midtrans/snap/payment gateway<br>dikembalikan sebagai 502 Bad<br>Gateway|Sesuai CHK-05 — kegagalan<br>layanan eksternal||
||||**PASS**|
|5|Error lain dikembalikan sebagai<br>Conflict (409)|Sesuai sebagai fallback non-<br>server-crash||
||||**PASS**|



## **5.3 Analisis** 

Fungsi ini memperjelas batas antara error bisnis dan error server. Cart kosong atau stok kurang bukan kegagalan server sehingga status 400 lebih tepat daripada 500. Error Midtrans merupakan kegagalan layanan eksternal sehingga 502 lebih tepat daripada 500. Pemisahan ini konsisten dengan prinsip bahwa server tidak boleh mengembalikan 5xx untuk kondisi yang dapat diantisipasi. 

## **6. WALKTHROUGH FUNGSI: OrderHandler.Checkout** 

## 6.1 Source Code yang Diuji 

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
    var req struct {
        VoucherCode string `json:"voucher_code"`
_ = c.ShouldBindJSON(&req)    // error diabaikan — body opsional
```

```
    order, err := h.orderUsecase.Checkout(uid, req.VoucherCode)
    if err != nil {
        response.Error(c, classifyCheckoutError(err))
        return
```

```
    response.Success(c, http.StatusCreated,
        "Checkout berhasil. Silakan lakukan pembayaran.", order)
}
```

## **6.2 Langkah Walkthrough** 

||||||
|---|---|---|---|---|
|**Langkah**|**Baris**|**Kode / Kondisi**|**Hasil Pemeriksaan**|**Status**|
||||||
|**H-01**|62-66|c.Get("user_id") tidak ada|Request tanpa JWT ditolak<br>401|**PASS**|
||||||
|**H-02**|67-71|user_id bukan string|Request ditolak sebagai<br>sesi tidak valid|**PASS**|
||||||
|**H-03**|73-77|ShouldBindJSON tidak diwajibkan<br>sukses (_ =)|Body kosong tetap valid —<br>voucher opsional|**PASS**|
||||||
|**H-04**|79|h.orderUsecase.Checkout(uid,<br>req.VoucherCode)|Handler tidak memproses<br>bisnis checkout sendiri|**PASS**|
||||||
|**H-05**|80-83|Usecase error|Error diklasifikasi ke<br>response tepat|**PASS**|
||||||
|**H-06**|86|Usecase sukses|Response 201 Created|**PASS**|



## **6.3 Analisis Keamanan** 

Handler tidak mengambil user_id dari body request. Identitas pengguna berasal dari context yang diisi oleh middleware autentikasi JWT. Ini penting untuk mencegah pengguna melakukan checkout atas nama pengguna lain — sebuah celah keamanan yang umum ditemukan pada sistem yang tidak memvalidasi identitas dari sisi server. 

## **7. WALKTHROUGH FUNGSI: orderUsecase.Checkout** 

## 7.1 Source Code yang Diuji 

```
func (u *orderUsecase) Checkout(userID string, voucherCode string)
(*domain.Order, error) {
    cartItems, err := u.cartRepo.FindByUserID(userID)
    if err != nil {
        return nil, errors.New("gagal memuat keranjang belanja")
    }
    if len(cartItems) == 0 {
        return nil, errors.New("keranjang belanja anda kosong. tidak bisa
checkout")
    }
    order, err := u.orderRepo.CheckoutTransaction(userID, cartItems,
voucherCode)
    if err != nil {
        return nil, errors.New("Checkout gagal: " + err.Error())
    }
```

```
    snapResp, snapErr := u.snapTokenFn(order.ID, order.TotalAmount)
    if snapErr == nil && snapResp != nil {
        order.PaymentToken = &snapResp.Token
        order.PaymentURL  = &snapResp.RedirectURL
        u.orderRepo.SavePaymentToken(order.ID, snapResp.Token,
snapResp.RedirectURL)
    } else if snapErr != nil {
        fmt.Printf("[MIDTRANS ERROR] Gagal generate Snap Token: %v\n", snapErr)
    }
    return order, nil
}
```

## **7.2 Langkah Walkthrough** 

|||||
|---|---|---|---|
|**Langkah**|**Baris**|**Observasi Kode**|**Dampak Terhadap Checkout ACID**|
|**U-01**|73|Cart diambil berdasarkan userID|Isolation antar user terjaga — setiap checkout<br>hanya membaca cart miliknya sendiri|
|**U-02**|74-76|Error cart repository<br>menghentikan proses|Mencegah checkout dengan data cart tidak<br>valid atau tidak terbaca|
|**U-03**|78-80|Cart kosong ditolak sebelum<br>transaction|Tidak ada order kosong — sesuai CHK-04|
|**U-04**|82|Cart valid diteruskan ke<br>repository transaction|Transaksi database dipusatkan di repository —<br>usecase tidak menyentuh DB langsung|
|**U-05**|83-85|Transaction error dibungkus<br>sebagai error checkout|Error stok/DB tidak menjadi success palsu|
|**U-06**|89|snapTokenFn(order.ID,<br>order.TotalAmount)|Payment token memakai order dan amount<br>hasil transaksi yang telah commit|
|**U-07**|90-93|Token sukses disimpan ke order<br>dan database|Payment URL tersedia setelah checkout<br>berhasil|
|**U-08**|94-96|Midtrans error hanya di-log,<br>tidak di-return|Order internal tetap durable — sesuai CHK-05<br>dan CHK-07|



## **7.3 Analisis** 

Usecase memisahkan dua jenis proses secara tegas: 

- Proses internal wajib konsisten: cart menjadi order. Kegagalan di sini menyebabkan return error dan tidak ada order yang tersimpan. 

- Proses eksternal dapat gagal: pembuatan Snap Token Midtrans. Kegagalan di sini hanya dicatat (log) dan tidak membatalkan order yang sudah tersimpan. 

Desain ini sesuai dengan CHK-05: kegagalan Midtrans tidak boleh menyebabkan server crash atau rollback order yang sudah berhasil dibuat. Skenario ini juga telah divalidasi oleh unit test TestCheckout_MidtransFails_OrderTetapKembali. 

## **8. WALKTHROUGH FUNGSI: CheckoutTransaction (Repository)** 

## 8.1 Source Code yang Diuji 

```
err := r.db.Transaction(func(tx *gorm.DB) error {
    var totalAmount float64
    var orderItems []domain.OrderItem
    orderID := uuid.New().String()
    for _, item := range cartItems {
        var product domain.Product
        tx.Clauses(clause.Locking{Strength: "UPDATE"}).
            Where("id_product = ?", item.ProductID).
            First(&product)  // lock FOR UPDATE
        priceAtPurchase := product.Price
        if item.VariantID != nil {
            var variant domain.ProductVariant
            tx.Clauses(clause.Locking{Strength: "UPDATE"}).
                Where("id_variant = ?", *item.VariantID).
                First(&variant)  // lock variant FOR UPDATE
            if variant.Stock < item.Quantity {
                return fmt.Errorf("stok varian '%s' tidak mencukupi...",
variant.NameLabel, variant.Stock)
            }
            variant.Stock -= item.Quantity
            tx.Save(&variant)
            priceAtPurchase = variant.Price
        } else {
            if product.Stock < item.Quantity {
                return fmt.Errorf("stok produk '%s' tidak mencukupi...",
product.Name, product.Stock)
            }
            product.Stock -= item.Quantity
            tx.Save(&product)
        }
        totalAmount += priceAtPurchase * float64(item.Quantity)
        orderItems = append(orderItems, domain.OrderItem{ PriceAtPurchase:
priceAtPurchase, ... })
```

```
    }
```

```
    createdOrder = domain.Order{ Status: "PENDING", TotalAmount:
totalAmount, ... }
```

```
    tx.Create(&createdOrder)
```

```
    tx.Create(&orderItems)
```

```
    tx.Where("id_user = ?", userID).Delete(&domain.CartItem{})
```

```
    return nil  // trigger COMMIT
```

```
})
```

```
// Jika return err sebelum nil -> GORM rollback otomatis
```

## **8.2 Langkah Walkthrough Repository** 

||||||
|---|---|---|---|---|
|**Langkah**|**Baris**|**Observasi Kode**|**Bukti ACID**|**Status**|
|**R-01**|27|Seluruh proses berada dalam<br>db.Transaction|Atomicity||
|||||**PASS**|
|**R-02**|31|orderID dibuat sekali sebelum loop|Konsistensi relasi order-<br>item||
|||||**PASS**|
|**R-03**|34|Loop memproses seluruh cart item|Semua item masuk<br>transaksi||
|||||**PASS**|
|**R-04**|37|Produk dikunci FOR UPDATE|Isolation saat concurrency||
|||||**PASS**|
|**R-05**|45|Varian juga dikunci FOR UPDATE|Isolation stok varian||
|||||**PASS**|
|**R-06**|48-54|Stok varian dicek sebelum<br>dikurangi|Stok tidak negatif||
|||||**PASS**|
|**R-07**|58-65|Stok produk dicek sebelum<br>dikurangi|Stok tidak negatif||
|||||**PASS**|
|**R-08**|69|totalAmount dihitung dari harga<br>saat checkout|Consistency total<br>pembayaran||
|||||**PASS**|
|**R-09**|71-80|Order item dibuat dengan<br>PriceAtPurchase|Snapshot harga transaksi||
|||||**PASS**|
|**R-10**|86-95|Order dibuat dengan status<br>PENDING|Sesuai CHK-08||
|||||**PASS**|
|**R-11**|97-<br>104|Order dan order item disimpan ke<br>database|Durability||
|||||**PASS**|
|**R-12**|107|Cart user dihapus dalam satu<br>transaction|Atomic cleanup||
|||||**PASS**|
|**R-13**|115-<br>117|Error menyebabkan rollback<br>otomatis (GORM)|Atomicity — tidak ada<br>partial commit||
|||||**PASS**|



## **8.3 Analisis Repository** 

Repository adalah lapisan paling kritikal untuk menjamin ACID. Urutan eksekusi dalam satu transaksi adalah sebagai berikut: 

```
lock product/variant (FOR UPDATE)
```

- `-> cek stok (< quantity = error = rollback)` 

- `-> kurangi stok` 

- `-> hitung totalAmount` 

- `-> append orderItems` 

- `-> create order (status: PENDING)` 

- `-> create order items (PriceAtPurchase)` 

- `-> delete cart items` 

- `-> return nil  =>  COMMIT` 

Jika terjadi error sebelum return nil, GORM secara otomatis menjalankan ROLLBACK. Dengan demikian, order tidak akan tersimpan sebagian ketika stok tidak cukup atau query gagal di tengah proses. 

## **9. CHECKLIST WALKTHROUGH** 

||||||
|---|---|---|---|---|
|**ID**|**Area**|**Pertanyaan Pemeriksaan**|**Hasil**|**Status**|
|**CW-**<br>**01**|Auth|Apakah checkout wajib menggunakan<br>user terautentikasi?|user_id wajib ada<br>di context||
|||||**PASS**|
|**CW-**<br>**02**|Auth|Apakah user dapat menentukan user_id<br>dari body?|Tidak — handler<br>memakai context<br>JWT||
|||||**PASS**|
|**CW-**<br>**03**|Input|Apakah body checkout boleh kosong?|Ya — voucher<br>opsional<br>(ShouldBindJSON)||
|||||**PASS**|
|**CW-**<br>**04**|Cart|Apakah cart kosong ditolak sebelum<br>transaksi?|Ya — usecase cek<br>len(cartItems) == 0||
|||||**PASS**|
|**CW-**<br>**05**|Transaction|Apakah pengurangan stok dan<br>pembuatan order atomik?|Ya —<br>db.Transaction<br>GORM||
|||||**PASS**|
|**CW-**<br>**06**|Stok|Apakah stok dicek sebelum dikurangi?|Ya — produk dan<br>varian divalidasi||
|||||**PASS**|
|**CW-**<br>**07**|Stok|Apakah stok dilindungi dari race<br>condition?|Ya — FOR<br>UPDATE locking||
|||||**PASS**|
|**CW-**<br>**08**|Order|Apakah order item menyimpan harga<br>saat checkout?|Ya —<br>PriceAtPurchase||
|||||**PASS**|
|**CW-**<br>**09**|Order|Apakah status awal order benar?|Ya — Status:<br>PENDING||
|||||**PASS**|



||||||
|---|---|---|---|---|
|**ID**|**Area**|**Pertanyaan Pemeriksaan**|**Hasil**|**Status**|
|**CW-**<br>**10**|Cart|Apakah cart dihapus setelah order<br>dibuat?|Ya — masih dalam<br>transaction yang<br>sama||
|||||**PASS**|
|**CW-**<br>**11**|Error|Apakah error bisnis tidak menjadi HTTP<br>500?|Ya — dipetakan ke<br>400 / 409 / 502||
|||||**PASS**|
|**CW-**<br>**12**|Payment|Apakah Midtrans error tidak<br>menggagalkan order internal?|Ya — error di-log,<br>order tetap di-<br>return||
|||||**PASS**|



## **Seluruh 12 checklist terpenuhi (12/12 PASS).** 

## **10. HUBUNGAN DENGAN PRINSIP ACID** 

||||
|---|---|---|
|**Prinsip**|**Bukti Source Code**|**Penjelasan**|
|**Atomicity**|_r.db.Transaction(...) pada_<br>_repository_|Pengurangan stok, pembuatan order, order items,<br>dan penghapusan cart terjadi sebagai satu unit —<br>semua berhasil atau semua dibatalkan.|
|**Consistency**|Validasi stok sebelum<br>pengurangan; PriceAtPurchase;<br>Status PENDING|Data order tidak dibuat jika stok tidak cukup. Harga<br>di-snapshot saat transaksi sehingga tidak<br>terpengaruh perubahan harga setelah checkout.|
|**Isolation**|_clause.Locking{Strength:_<br>_"UPDATE"}_|Mencegah dua checkout bersamaan membaca dan<br>mengurangi stok yang sama secara tidak terkendali<br>— basis penanganan race condition (CHK-03).|
|**Durability**|_tx.Create(&createdOrder),_<br>_tx.Create(&orderItems)_|Setelah COMMIT sukses, order dan seluruh item<br>tersimpan permanen di PostgreSQL dan tidak<br>terpengaruh restart server.|



## **11. TEST PENDUKUNG (UNIT TEST)** 

## 11.1 Command Pengujian 

```
cd backend-go
```

```
go test ./internal/usecase -run "TestCheckout|TestDataFlow|TestLoopTesting" -v
```

## 11.2 Hasil Eksekusi 

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

## 11.3 Interpretasi Hasil 

||||
|---|---|---|
|**Nama Test**|**Skenario yang**<br>**Divalidasi**|**Status**|
|_TestCheckout_CartRepoError_|Error pada pembacaan<br>cart repository|PASS|
|_TestCheckout_EmptyCart_|Cart kosong ditolak<br>sebelum transaksi (CHK-<br>04)|PASS|
|_TestCheckout_TransactionFails_StokKurang_|Stok tidak cukup,<br>transaksi rollback (CHK-<br>02)|PASS|
|_TestCheckout_Success_|Alur checkout normal end-<br>to-end (CHK-01)|PASS|
|_TestCheckout_MidtransFails_OrderTetapKembali_|Midtrans error, order<br>internal tetap tersimpan<br>(CHK-05)|PASS|



||||
|---|---|---|
|**Nama Test**|**Skenario yang**<br>**Divalidasi**|**Status**|
|_TestCheckout_SnapRespNil_OrderTetapKembali_|Snap response nil, order<br>tetap return|PASS|
|_TestDataFlow_CheckoutCartToOrderAndPaymentToken_|Alur data cart -> order -><br>payment token|PASS|
|_TestLoopTesting_CheckoutCartItemCounts_|Jumlah cart item<br>bervariasi (loop testing)|PASS|
|_TestLoopTesting_BatchProcessSupplierOrders_|Batch pemrosesan order<br>supplier valid|PASS|
|_TestLoopTesting_BatchProcessSupplierOrders_NoValidOrder_|Batch tanpa order valid —<br>edge case loop|PASS|



Seluruh 10 unit test lulus (10/10 PASS). Hasil ini memperkuat temuan walkthrough karena skenario utama telah diverifikasi secara otomatis dan dapat direproduksi. 

## **12. TRACEABILITY MATRIX** 

|||||
|---|---|---|---|
|**Skenario**<br>**Black-Box**|**Bukti**<br>**Walkthrough**|**Test Pendukung**|**Kesimpulan**|
|**CHK-01**<br>**Checkout**<br>**berhasil**|Handler return<br>201, usecase<br>return order,<br>repository<br>commit|_TestCheckout_Success_|Terpenuhi|
|**CHK-02**<br>**Stok**<br>**kurang**|Repository<br>return error<br>sebelum order<br>dibuat —<br>rollback|_TestCheckout_TransactionFails_StokKurang_|Terpenuhi|
|**CHK-03**<br>**Race**<br>**condition**|FOR UPDATE<br>pada produk dan<br>varian|Walkthrough repository (desain)|Terpenuhi secara<br>desain|
|**CHK-04**<br>**Cart**<br>**kosong**|Usecase<br>menolak cart<br>kosong sebelum<br>transaksi|_TestCheckout_EmptyCart_|Terpenuhi|
|**CHK-05**<br>**Midtrans**<br>**error**|snapErr di-log,<br>order tetap<br>return|_TestCheckout_MidtransFails_OrderTetapKembali_|Terpenuhi|
|**CHK-06**<br>**Tanpa JWT**|Handler menolak<br>jika user_id tidak<br>ada di context|Basic Path handler test|Terpenuhi|



|||||
|---|---|---|---|
|**Skenario**<br>**Black-Box**|**Bukti**<br>**Walkthrough**|**Test Pendukung**|**Kesimpulan**|
|**CHK-07**<br>**Atomicity**|db.Transaction<br>dan rollback<br>otomatis GORM|Walkthrough repository|Terpenuhi|
|**CHK-08**<br>**Status**<br>**PENDING**|Status:<br>PENDING saat<br>create order|Walkthrough repository|Terpenuhi|



## **13. TEMUAN DAN REKOMENDASI** 

||||||
|---|---|---|---|---|
|**ID**|**Temuan**|**Dampak**|**Rekomendasi**|**Prioritas**|
|**CW-**<br>**F01**|Checkout ACID<br>sudah memakai<br>transaction dan<br>locking (FOR<br>UPDATE)|Positif: stok<br>terlindungi dari race<br>condition|Dipertahankan dan jadikan<br>standar pada modul lain||
|||||**Tinggi**|
|**CW-**<br>**F02**|Error Midtrans tidak<br>menggagalkan order<br>internal|Positif: order tetap<br>tersimpan meski<br>payment gateway<br>down|Tambahkan monitoring<br>alert dan mekanisme retry<br>payment token bila perlu||
|||||**Sedang**|
|**CW-**<br>**F03**|Voucher masih<br>diteruskan antar<br>layer namun tidak<br>aktif di repository|Dapat<br>membingungkan<br>dokumentasi dan<br>pembaca kode|Jelaskan di SKPL/laporan<br>bahwa voucher tidak<br>termasuk scope checkout<br>ACID aktif||
|||||**Rendah**|
|**CW-**<br>**F04**|Mapping error<br>berbasis string<br>matching<br>(strings.Contains)|Rapuh jika pesan<br>error berubah —<br>mapping dapat salah<br>klasifikasi|Gunakan typed error atau<br>sentinel error untuk<br>mapping yang lebih robust||
|||||**Sedang**|



## **14. KESIMPULAN** 

Berdasarkan Code Walkthrough terhadap ketiga layer (Handler, Usecase, Repository), fitur Checkout ACID dinyatakan **LULUS** dengan seluruh skenario black-box (CHK-01 s.d. CHK-08) terpenuhi secara implementasi. 

Alur kode telah terbukti konsisten dengan rancangan transaksi checkout: 

10. User harus terautentikasi — identitas diambil dari JWT context, bukan body request. 

11. Cart kosong ditolak di level usecase sebelum transaksi database dimulai. 

12. Stok dicek dan dikurangi dalam satu database transaction (BEGIN / COMMIT / ROLLBACK). 

13. Produk dan varian dikunci dengan FOR UPDATE untuk mencegah race condition. 

14. Order dibuat dengan status PENDING dan menyimpan snapshot harga (PriceAtPurchase). 

15. Cart dikosongkan dalam transaction yang sama — tidak ada cart tersisa setelah order berhasil. 

16. Error bisnis dipetakan ke HTTP 400/409/502 — tidak ada unhandled 500. 

17. Kegagalan Midtrans tidak membatalkan order internal — order tetap durable. 

Dengan demikian, implementasi checkout mendukung seluruh prinsip ACID dan konsisten dengan skenario black-box yang telah diuji sebelumnya. Rekomendasi utama adalah migrasi dari stringmatching error menuju typed/sentinel error untuk meningkatkan ketahanan jangka panjang. 

