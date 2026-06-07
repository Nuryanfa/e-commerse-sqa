## **LAPORAN SOFTWARE QUALITY ASSURANCE METODE WHITEBOX – LOOP TESTING** 

## Anggota kelompok: 

20231310046 M. Irvan Alfiansyah 20231310047 M. Nur Yanfa 

**PROGRAM STUDI TEKNIK INFORMATIKA UNIVERSITAS KEBANGSAAN REPUBLIK INDONESIA** _Jln. Terusan Halimun No. 37 (Pelajar Pejuang 45) Lingkar Selatan Kec. Lengkong kota Bandung Jawa Barat 40263_ 

## **1. DASAR TEORI LOOP TESTING** 

Loop Testing adalah metode white box testing yang digunakan untuk memeriksa struktur perulangan (loop) dalam program secara menyeluruh. Pengujian ini memastikan setiap loop bekerja dengan benar pada berbagai kondisi iterasi — dari kondisi paling minimal hingga kondisi data campuran. 

Kondisi iterasi yang diuji dalam Loop Testing: 

||||
|---|---|---|
|**Kondisi Loop**|**Keterangan**|**Contoh pada Checkout ACID**|
|**Zero Iteration**|Loop tidak dijalankan karena<br>data kosong|Cart kosong — tidak ada item untuk diproses|
|**One Iteration**|Loop berjalan tepat satu kali|Cart berisi tepat satu produk|
|**Multiple**<br>**Iteration**|Loop berjalan beberapa kali|Cart berisi beberapa item produk berbeda|
|**Mixed**<br>**Condition**|Loop berisi data valid dan<br>invalid|Batch order: ada order PAID milik supplier, ada<br>PENDING, ada milik supplier lain|
|**Boundary**<br>**Loop**|Jumlah data dekat batas<br>bisnis|Quantity dan stok produk pada skenario checkout|



Loop Testing relevan untuk Checkout ACID karena satu transaksi checkout memproses banyak item sekaligus. Kesalahan pada struktur loop dapat mengakibatkan order tidak lengkap, total harga salah, pengurangan stok parsial, atau pemrosesan order supplier yang tidak berwenang. 

## **2. RUANG LINGKUP PENGUJIAN** 

Pengujian Loop Testing mencakup dua area loop utama yang berhubungan langsung dengan alur checkout dan proses pasca-checkout: 

- Loop cart item pada proses checkout (order_repository.go — CheckoutTransaction) 

- Loop order/supplier pada proses batch order supplier (order_usecase.go — BatchProcessSupplierOrders) 

|||||
|---|---|---|---|
|**ID Black-**<br>**Box**|**Skenario Checkout ACID**|**Dicakup**|**Alasan**|
|**CHK-01**|Checkout berhasil|**Ya**|Cart berisi item harus diproses<br>lengkap tanpa ada yang hilang|
|**CHK-02**|Stok tidak mencukupi|**Ya (source)**|Loop repository memvalidasi stok<br>setiap item satu per satu|
|**CHK-03**|Race condition checkout<br>bersamaan|**Ya (source)**|Loop melakukan FOR UPDATE lock<br>pada setiap produk/varian|
|**CHK-04**|Keranjang kosong|**Ya**|Zero item tidak boleh masuk ke dalam<br>transaction database|



|||||
|---|---|---|---|
|**ID Black-**<br>**Box**|**Skenario Checkout ACID**|**Dicakup**|**Alasan**|
|**CHK-07**|Atomicity stok dan order|**Ya**|Semua item diproses dalam satu<br>transaction — tidak boleh parsial|
|**CHK-08**|Status order PENDING|**Ya (source)**|Setelah loop sukses memproses<br>semua item, order dibuat berstatus<br>PENDING|



BatchProcessSupplierOrders tidak berada tepat di endpoint checkout, tetapi merupakan proses terkait yang terjadi setelah pembayaran dikonfirmasi. Loop pada fungsi ini diuji sebagai tambahan white-box untuk memastikan pemrosesan banyak order tidak salah filter. 

## **3. SOURCE CODE LOOP YANG DIUJI** 

## **3.1 Loop Cart Item pada Repository — CheckoutTransaction** 

Loop ini memproses seluruh item keranjang dalam satu transaksi database. Setiap iterasi melakukan lock produk/varian, validasi stok, pengurangan stok, perhitungan harga, dan pembentukan order item. 

```
for _, item := range cartItems {
    // ── Step 1: Lock produk FOR UPDATE ──────────────────────────
    var product domain.Product
    if err := tx.Clauses(clause.Locking{Strength: "UPDATE"}).
        Where("id_product = ?", item.ProductID).First(&product).Error; err !=
nil {
        return errors.New("produk " + item.ProductID + " tidak ditemukan")
    }
    priceAtPurchase := product.Price
    // ── Step 2: Cek varian (jika ada) ───────────────────────────
    if item.VariantID != nil {
        var variant domain.ProductVariant
        if err := tx.Clauses(clause.Locking{Strength: "UPDATE"}).
            Where("id_variant = ?", *item.VariantID).First(&variant).Error;
err != nil {
            return errors.New("varian produk tidak ditemukan")
        }
        if variant.Stock < item.Quantity {
            return fmt.Errorf("stok varian '%s' tidak mencukupi. Stok
tersisa: %d",
                variant.NameLabel, variant.Stock)
        }
        variant.Stock -= item.Quantity
        tx.Save(&variant)
```

```
        priceAtPurchase = variant.Price
    } else {
        // ── Step 3: Validasi & kurangi stok produk ───────────────
        if product.Stock < item.Quantity {
            return fmt.Errorf("stok produk '%s' tidak mencukupi. Stok
tersisa: %d",
                product.Name, product.Stock)
        }
        product.Stock -= item.Quantity
        tx.Save(&product)
    }
    // ── Step 4: Akumulasi total dan order item ───────────────────
    totalAmount += priceAtPurchase * float64(item.Quantity)
    orderItems = append(orderItems, domain.OrderItem{ ... })
}
```

## **3.2 Guard Cart Kosong pada Usecase** 

Guard ini berada sebelum loop repository dipanggil. Cart kosong langsung ditolak di level usecase — transaksi database tidak pernah dimulai. 

```
cartItems, err := u.cartRepo.FindByUserID(userID)
if err != nil {
    return nil, errors.New("gagal memuat keranjang belanja")
}
// Guard zero iteration — cart kosong ditolak sebelum repository dipanggil
if len(cartItems) == 0 {
    return nil, errors.New("keranjang belanja anda kosong. tidak bisa
checkout")
}
order, err := u.orderRepo.CheckoutTransaction(userID, cartItems, voucherCode)
```

## **3.3 Loop Batch Supplier Orders — BatchProcessSupplierOrders** 

Loop ini memproses daftar order untuk menentukan mana yang valid bagi supplier tertentu. Setiap order dicek kepemilikan supplier-nya dan status pembayarannya sebelum diproses lebih lanjut. 

```
validOrderIDs := []string{}
now := time.Now()
for _, order := range orders {
```

```
    // ── Loop inner: cek kepemilikan supplier ─────────────────────
    isOwnedBySupplier := false
    for _, item := range order.Items {
        if item.Product != nil && item.Product.SupplierID == supplierID {
            isOwnedBySupplier = true
            break   // short-circuit: cukup satu item cocok
        }
    }
```

```
    // ── Filter: harus milik supplier DAN berstatus PAID ──────────
    if isOwnedBySupplier && order.Status == "PAID" {
        validOrderIDs = append(validOrderIDs, order.ID)
        if u.auditLogRepo != nil {
_ = u.auditLogRepo.Insert(&domain.AuditLog{ ... })
        }
    }
}
```

```
// Guard: tidak ada order valid
if len(validOrderIDs) == 0 {
    return errors.New("tidak ada pesanan yang valid untuk diproses")
}
```

```
return u.orderRepo.BatchUpdateStatus(validOrderIDs, "PROCESSED")
```

## **4. IDENTIFIKASI RISIKO LOOP** 

Sebelum merancang test case, risiko yang dapat terjadi akibat kesalahan struktur loop diidentifikasi secara sistematis: 

|||||
|---|---|---|---|
|**ID**<br>**Risiko**|**Area Loop**|**Risiko**|**Dampak Jika Terjadi**|
|**RL-01**|**Cart Item**|Cart kosong tetap<br>diproses|Order kosong dapat dibuat — melanggar<br>business rule|
|**RL-02**|**Cart Item**|Item terakhir tidak ikut<br>diproses|Order item tidak lengkap, total harga salah|
|**RL-03**|**Cart Item**|Item diproses ganda<br>(double processing)|Total harga dan stok salah — kerugian<br>finansial|
|**RL-04**|**Cart Item**|Variant item tidak diproses|Stok varian tidak berkurang — overselling<br>varian|
|**RL-05**|**Cart Item**|Error stok satu item tidak<br>rollback keseluruhan|Transaksi parsial — stok berkurang<br>sebagian tanpa order terbentuk|
|**RL-06**|**Batch Supplier**|Order supplier lain ikut<br>diproses|Pelanggaran otorisasi — supplier A<br>memproses order supplier B|
|**RL-07**|**Batch Supplier**|Order status PENDING<br>ikut diproses|Alur pembayaran rusak — order diproses<br>sebelum dibayar|
|**RL-08**|**Batch Supplier**|Audit log dibuat untuk<br>order invalid|Jejak audit tidak akurat — menyulitkan<br>investigasi|



## **5. RANCANGAN TEST CASE** 

Lima test case dirancang untuk mencakup seluruh kondisi iterasi yang relevan — zero, one, multiple, mixed, dan boundary — sesuai metodologi Loop Testing: 

|||||||
|---|---|---|---|---|---|
|**ID**|**Jenis Loop**|**Kondisi**<br>**Iterasi**|**Data Uji**|**Expected Result**||
|**LP-**<br>**CHK-**<br>**01**|**Cart Loop**|**Zero Iteration**|cartItems = [] (kosong)|Checkout error;<br>CheckoutTransaction<br>tidak dipanggil|**PASS**|
|**LP-**<br>**CHK-**<br>**02**|**Cart Loop**|**One Iteration**|1 cart item (prod-1,<br>qty=1)|Repository dipanggil 1x;<br>1 item diteruskan||
||||||**PASS**|
|**LP-**<br>**CHK-**<br>**03**|**Cart Loop**|**Multiple**<br>**Iteration**|3 cart item (prod-1<br>qty=1, prod-2 qty=2,<br>prod-3 qty=3)|Repository dipanggil 1x;<br>3 item diteruskan<br>lengkap||
||||||**PASS**|
|**LP-**<br>**CHK-**<br>**04**|**Batch**<br>**Supplier**|**Mixed**<br>**Condition**|4 order: 2 valid<br>(PAID+milik), 1<br>PENDING, 1 supplier<br>lain|Hanya 2 order valid<br>diproses; 2 lainnya<br>difilter||
||||||**PASS**|
||**Batch**<br>**Supplier**|**No Valid**<br>**Order**|1 order PENDING<br>(bukan PAID)|Return error;<br>BatchUpdateStatus tidak<br>dipanggil||
|**LP-**<br>**CHK-**<br>**05**|||||**PASS**|



## **6. SOURCE CODE AUTOMATED TEST** 

## **6.1 Test Loop Cart Item — TestLoopTesting_CheckoutCartItemCounts** 

Test table-driven ini mencakup tiga kondisi iterasi sekaligus: zero (cart kosong), one (1 item), dan multiple (3 item). Setiap kondisi memverifikasi jumlah pemanggilan repository dan ada/tidaknya error. 

```
func TestLoopTesting_CheckoutCartItemCounts(t *testing.T) {
    tests := []struct {
        name          string
        items         []domain.CartItem
        wantRepoCalls int
        wantErr       bool
    }{
        {
            name:          "0 item",
            items:         []domain.CartItem{},
            wantRepoCalls: 0,
            wantErr:       true,  // harus error — zero iteration
        },
        {
            name: "1 item",
            items: []domain.CartItem{
                {ID: "cart-1", ProductID: "prod-1", Quantity: 1},
            },
            wantRepoCalls: 1,
        },
        {
            name: "3 items",
            items: []domain.CartItem{
                {ID: "cart-1", ProductID: "prod-1", Quantity: 1},
                {ID: "cart-2", ProductID: "prod-2", Quantity: 2},
                {ID: "cart-3", ProductID: "prod-3", Quantity: 3},
            },
            wantRepoCalls: 1,  // dipanggil 1x dengan 3 item sekaligus
        },
    }
    // ... setup mock, run, assert ...
}
```

## **6.2 Test Loop Batch Supplier — TestLoopTesting_BatchProcessSupplierOrders** 

Test ini menyiapkan 4 order dengan kondisi campuran (mixed condition) untuk memverifikasi filter supplier dan filter status berjalan secara bersamaan dalam satu loop. 

```
func TestLoopTesting_BatchProcessSupplierOrders(t *testing.T) {
    supplierID      := "supplier-loop"
    otherSupplierID := "supplier-other"
    orders := []domain.Order{
        {   //  Valid: PAID + milik supplier
            ID: "order-valid-1", Status: "PAID",
            Items: []domain.OrderItem{
                {Product: &domain.Product{SupplierID: supplierID}},
            },
        },
        {   //  Invalid: PENDING (belum dibayar)
            ID: "order-wrong-status", Status: "PENDING",
            Items: []domain.OrderItem{
                {Product: &domain.Product{SupplierID: supplierID}},
            },
        },
        {   //  Invalid: PAID tapi milik supplier lain
            ID: "order-other-supplier", Status: "PAID",
            Items: []domain.OrderItem{
                {Product: &domain.Product{SupplierID: otherSupplierID}},
            },
        },
        {   //  Valid: PAID + milik supplier
            ID: "order-valid-2", Status: "PAID",
            Items: []domain.OrderItem{
                {Product: &domain.Product{SupplierID: supplierID}},
            },
        },
    }
    // Expected: hanya order-valid-1 dan order-valid-2 yang diproses
}
```

## **6.3 Test No Valid Order — TestLoopTesting_BatchProcessSupplierOrders_NoValidOrder** 

Test ini memverifikasi guard akhir loop: ketika tidak ada order yang lolos filter, sistem harus mengembalikan error dan tidak memanggil BatchUpdateStatus. 

```
func TestLoopTesting_BatchProcessSupplierOrders_NoValidOrder(t *testing.T) {
    // Satu order yang ada berstatus PENDING — tidak lolos filter PAID
    orders := []domain.Order{
        {
            ID: "order-pending", Status: "PENDING",
            Items: []domain.OrderItem{
                {Product: &domain.Product{SupplierID: "supplier-loop"}},
            },
        },
    }
    // Expected: return error, BatchUpdateStatus tidak pernah dipanggil
}
```

## **7. LANGKAH PENGUJIAN** 

Pengujian dilakukan mengikuti urutan langkah berikut: 

1. Menyiapkan mock cart repository dengan variasi jumlah item (0, 1, dan 3 item). 

2. Menjalankan fungsi Checkout untuk masing-masing kondisi dan mencatat respons. 

3. Mengamati jumlah pemanggilan CheckoutTransaction pada mock repository. 

4. Mengamati jumlah cart item yang diteruskan ke repository pada setiap kondisi. 

5. Menyiapkan mock order repository berisi 4 order dengan kombinasi status dan supplier. 

6. Menjalankan BatchProcessSupplierOrders dan mencatat order ID yang masuk validOrderIDs. 

7. Memastikan hanya order yang memenuhi dua syarat (PAID + milik supplier) yang masuk BatchUpdateStatus. 

8. Memverifikasi audit log hanya dibuat untuk order yang valid. 

9. Menjalankan test no-valid-order dan memverifikasi error dikembalikan tanpa memanggil BatchUpdateStatus. 

## **8. HASIL PENGUJIAN AKTUAL** 

## **8.1 Command Eksekusi** 

```
cd backend-go
```

```
go test ./internal/usecase -run TestLoopTesting -v
```

## **8.2 Output Lengkap** 

```
=== RUN   TestLoopTesting_CheckoutCartItemCounts
```

```
=== RUN   TestLoopTesting_CheckoutCartItemCounts/0_item
```

```
=== RUN   TestLoopTesting_CheckoutCartItemCounts/1_item
=== RUN   TestLoopTesting_CheckoutCartItemCounts/3_items
--- PASS: TestLoopTesting_CheckoutCartItemCounts (0.00s)
    --- PASS: TestLoopTesting_CheckoutCartItemCounts/0_item (0.00s)
    --- PASS: TestLoopTesting_CheckoutCartItemCounts/1_item (0.00s)
    --- PASS: TestLoopTesting_CheckoutCartItemCounts/3_items (0.00s)
```

```
=== RUN   TestLoopTesting_BatchProcessSupplierOrders
```

```
--- PASS: TestLoopTesting_BatchProcessSupplierOrders (0.00s)
```

```
=== RUN   TestLoopTesting_BatchProcessSupplierOrders_NoValidOrder
--- PASS: TestLoopTesting_BatchProcessSupplierOrders_NoValidOrder (0.00s)
PASS
```

```
ok   github.com/nuryanfa/e-commerse-sqa/internal/usecase
```

Seluruh 5 sub-test PASS  |  Durasi eksekusi: 0.00s  |  Status keseluruhan: PASS 

## **8.3 Ringkasan Hasil per Sub-Test** 

|||||
|---|---|---|---|
|**Nama Sub-Test**|**Kondisi**<br>**Iterasi**|**Durasi**|**Status**|
|_TestLoopTesting_CheckoutCartItemCounts/0_item_|**Zero**|0.00s|**PASS**|
|_TestLoopTesting_CheckoutCartItemCounts/1_item_|**One**|0.00s||
||||**PASS**|
|_TestLoopTesting_CheckoutCartItemCounts/3_items_|**Multiple**|0.00s||
||||**PASS**|
|_TestLoopTesting_BatchProcessSupplierOrders_|**Mixed**|0.00s||
||||**PASS**|
|_TestLoopTesting_BatchProcessSupplierOrders_NoValidOrder_|**No Valid**|0.00s||
||||**PASS**|



## **9. ANALISIS PER TEST CASE** 

|||||
|---|---|---|---|
|**ID**|**Hasil Aktual**|**Risiko yang Dimitigasi**|**Analisis**|
|**LP-**<br>**CHK-**<br>**01**|Cart kosong menghasilkan error;<br>CheckoutTransaction tidak<br>dipanggil|**RL-01**|Zero iteration aman; tidak<br>ada order kosong yang<br>dapat terbentuk|
|**LP-**<br>**CHK-**<br>**02**|Cart 1 item memanggil repository 1<br>kali dan membawa tepat 1 item|**RL-02 / RL-03**|One iteration valid; tidak<br>ada item yang hilang atau<br>terduplikasi|
|**LP-**<br>**CHK-**<br>**03**|Cart 3 item memanggil repository 1<br>kali dan membawa tepat 3 item|**RL-02 / RL-03**|Multiple iteration tidak<br>menghilangkan item; total<br>item tetap konsisten|
|**LP-**<br>**CHK-**<br>**04**|Dari 4 order campuran, hanya<br>order-valid-1 dan order-valid-2 yang<br>diproses|**RL-06 / RL-07 / RL-08**|Filter ganda (supplier +<br>status) bekerja benar;<br>order invalid tidak bocor|
|**LP-**<br>**CHK-**<br>**05**|Order PENDING saja menghasilkan<br>error; BatchUpdateStatus tidak<br>dipanggil|**RL-07**|Guard akhir loop<br>berfungsi; tidak ada batch<br>update pada kondisi<br>kosong|



## **10. ANALISIS ACID HASIL LOOP TESTING** 

|||||
|---|---|---|---|
|**Prinsip**<br>**ACID**|**Status**|**Bukti Loop Testing**|**Penjelasan**|
|**Atomicity**|**Terpenuhi**|Cart kosong tidak masuk<br>transaction; cart valid diproses<br>sebagai satu set (LP-CHK-01, LP-<br>CHK-03)|Tidak ada transaction parsial<br>— semua item masuk atau<br>tidak sama sekali|
|**Consistency**|**Terpenuhi**|Jumlah item input sama dengan<br>jumlah item yang diteruskan ke<br>repository (LP-CHK-02, LP-CHK-<br>03)|Tidak ada item yang hilang<br>selama traversal loop — data<br>konsisten|
|**Isolation**|**Terpenuhi**<br>**(design)**|Loop repository mengunci<br>produk/varian satu per satu<br>dengan FOR UPDATE (source<br>analysis)|Stok tiap item terlindungi dari<br>race condition pada checkout<br>bersamaan|
|**Durability**|**Terpenuhi**|Batch supplier membuat audit log<br>untuk setiap order valid yang<br>diproses (LP-CHK-04)|Perubahan status order<br>memiliki jejak audit yang<br>tersimpan permanen|



## **11. TRACEABILITY MATRIX** 

|||||||
|---|---|---|---|---|---|
|**Test**<br>**Case**|**Kondisi**<br>**Loop**|**Risiko**<br>**Dimitigasi**|**Skenario Black-**<br>**Box**|**Test Function**||
|**LP-**<br>**CHK-**<br>**01**|**Zero**|RL-01|CHK-04|_CartItemCounts/0_item_|**PASS**|
|**LP-**<br>**CHK-**<br>**02**|**One**|RL-02, RL-03|CHK-01|_CartItemCounts/1_item_||
||||||**PASS**|
|**LP-**<br>**CHK-**<br>**03**|**Multiple**|RL-02, RL-03|CHK-01, CHK-07|_CartItemCounts/3_items_||
||||||**PASS**|
|**LP-**<br>**CHK-**<br>**04**|**Mixed**|RL-06, RL-07,<br>RL-08|Pasca-checkout|_BatchProcessSupplierOrders_||
||||||**PASS**|
|**LP-**<br>**CHK-**<br>**05**|**No Valid**|RL-07|Pasca-checkout|_BatchProcess_NoValidOrder_||
||||||**PASS**|



## **12. TEMUAN DAN REKOMENDASI** 

||||||
|---|---|---|---|---|
|**ID**|**Temuan**|**Dampak**|**Rekomendasi**|**Prioritas**|
|**LP-**<br>**F01**|Cart kosong<br>berhenti sebelum<br>repository<br>transaction dimulai|Positif: tidak ada<br>order kosong,<br>resource DB tidak<br>terpakai sia-sia|Pertahankan guard<br>len(cartItems)==0 di<br>usecase; jangan<br>dipindahkan ke repository|**Tinggi**|
|**LP-**<br>**F02**|Cart 1 dan 3 item<br>diteruskan lengkap<br>tanpa ada yang<br>hilang atau ganda|Positif: total harga<br>dan jumlah order item<br>selalu akurat|Jadikan test<br>CartItemCounts sebagai<br>regression test wajib saat<br>refactor checkout|**Tinggi**|
|**LP-**<br>**F03**|Batch supplier<br>memfilter status<br>PAID dan<br>kepemilikan supplier<br>dengan benar|Positif: tidak ada<br>order supplier lain<br>atau belum dibayar<br>yang bocor|Pertahankan filter ganda;<br>tambahkan test case untuk<br>status PROCESSED dan<br>CANCELLED|**Sedang**|
|**LP-**<br>**F04**|Loop stok repository<br>diuji melalui source<br>analysis, belum ada<br>DB concurrency unit<br>test|Risiko residual: race<br>condition stok belum<br>divalidasi pada level<br>unit test ini|Gunakan hasil<br>performance/endurance<br>test dan basic path sebagai<br>bukti tambahan;<br>pertimbangkan integration<br>test dengan DB nyata|**Sedang**|



## **13. KESIMPULAN** 

Loop Testing pada fitur Checkout ACID dinyatakan **LULUS** dengan seluruh 5 test case (LP-CHK-01 s.d. LP-CHK-05) berhasil. 

Pengujian telah membuktikan bahwa: 

10. Cart kosong tidak masuk ke proses transaksi database — zero iteration aman. 

11. Cart dengan satu item diproses benar tanpa ada item yang hilang — one iteration valid. 

12. Cart dengan banyak item diteruskan secara lengkap ke repository — multiple iteration konsisten. 

13. Batch supplier hanya memproses order milik supplier yang sesuai dan berstatus PAID — filter ganda bekerja. 

14. Tidak ada order invalid yang lolos filter — guard akhir loop berfungsi dengan benar. 

15. Audit log hanya dibuat untuk order yang valid — jejak audit akurat. 

Dengan demikian, struktur perulangan pada proses checkout dan proses terkait supplier telah bekerja sesuai ekspektasi serta mendukung konsistensi transaksi Checkout ACID. Risiko residual pada concurrency stok (RL-04, RL-05) perlu dikonfirmasi lebih lanjut melalui integration test atau hasil performance/endurance test. 

