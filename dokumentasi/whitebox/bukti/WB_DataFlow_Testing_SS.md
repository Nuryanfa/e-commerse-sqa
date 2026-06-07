## **LAPORAN SOFTWARE QUALITY ASSURANCE METODE WHITEBOX – DATA FLOW TEST** 

## Anggota kelompok: 

20231310046 M. Irvan Alfiansyah 20231310047 M. Nur Yanfa 

**PROGRAM STUDI TEKNIK INFORMATIKA UNIVERSITAS KEBANGSAAN REPUBLIK INDONESIA** _Jln. Terusan Halimun No. 37 (Pelajar Pejuang 45) Lingkar Selatan Kec. Lengkong kota Bandung Jawa Barat 40263_ 

## **1. PENDAHULUAN** 

## **1.1 Latar Belakang** 

White Box Testing adalah teknik pengujian perangkat lunak yang menguji sistem dengan memiliki pengetahuan penuh atas struktur internal kode sumber. Berbeda dengan Black Box Testing yang hanya memperhatikan input dan output, White Box Testing memverifikasi jalur eksekusi, kondisi percabangan, dan aliran data di dalam program. 

Dalam siklus pengujian SayurSehat, pengujian Black Box telah dilakukan mencakup Performance Test, Endurance Test, dan Equivalence Class / BVA pada alur checkout. Laporan ini menyajikan kelanjutan pengujian pada level White Box dengan metode Data Flow Testing, yang berfokus secara khusus pada bagaimana data bergerak dan berubah di dalam modul Checkout ACID. 

## **1.2 Tujuan Pengujian** 

1. Memverifikasi bahwa setiap data penting checkout (user_id, cart_items, variant_id, order_id, total_amount, payment_token) mengalir dengan benar dari layer usecase ke layer repository. 

2. Mendeteksi potensi data loss, data corruption, atau data misdirection pada alur checkout. 

3. Membuktikan prinsip ACID (Atomicity, Consistency, Isolation, Durability) terpenuhi ditinjau dari perspektif aliran data. 

4. Menyediakan test yang dapat dijalankan ulang sebagai regression test pada setiap perubahan kode. 

5. Membangun traceability antara test case White Box dengan skenario Black Box yang telah diuji sebelumnya. 

## **1.3 Ruang Lingkup** 

Pengujian difokuskan pada alur checkout keranjang (bukan instant checkout). Skenario yang diuji mengikuti skenario Checkout ACID yang sama dengan Black Box testing, dengan cakupan: 

- Aliran data dari handler HTTP sampai repository database melalui usecase. 

- Validasi bahwa cart_items tidak kehilangan item atau atribut (termasuk VariantID) dalam proses. 

- Validasi bahwa order_id dan total_amount hasil transaksi digunakan dengan benar untuk pembuatan Snap Token. 

- Validasi bahwa payment_token dan payment_url disimpan ke order response dan repository. 

## **1.4 Referensi Black Box Testing Terkait** 

||||
|---|---|---|
|**ID BB**|**Skenario Black Box**|**Relevansi Data Flow**|
|**CHK-01**|Checkout sukses dengan cart valid|user_id, cart_items, order_id, total_amount|
|**CHK-02**|Stok tidak mencukupi|quantity, stock — divalidasi sebelum order|
|**CHK-03**|Concurrent checkout (isolation)|product_id, variant_id, stok terkunci<br>(SELECT FOR UPDATE)|
|**CHK-04**|Cart kosong|cart_items kosong tidak diteruskan ke<br>transaction|
|**CHK-05**|Token pembayaran Midtrans|order_id, total_amount -> Snap Token|
|**CHK-06**|Auth user context|user_id dari JWT mengalir ke usecase|
|**CHK-07**|ACID transaction checkout|Data stok dan order berubah dalam satu<br>transaksi|
|**CHK-08**|Status order PENDING|order.Status dari transaction ke response|



## **2. DASAR TEORI** 

## **2.1 White Box Testing** 

White Box Testing (juga dikenal sebagai Glass Box Testing atau Structural Testing) adalah pendekatan pengujian yang memanfaatkan pengetahuan atas struktur internal kode. Penguji dapat merancang test case berdasarkan jalur eksekusi, kondisi logika, dan aliran data aktual dalam program. Pendekatan ini melengkapi Black Box Testing karena dapat menemukan defect yang tidak terdeteksi hanya dari sisi input/output. 

## **2.2 Data Flow Testing** 

Data Flow Testing adalah metode White Box Testing yang berfokus pada siklus hidup data di dalam program: kapan data didefinisikan (definition), kapan data digunakan (use), bagaimana data berpindah antar fungsi atau layer (propagation), dan bagaimana data berubah (mutation). 

|**Konsep**|**Definisi**|**Contoh pada Checkout ACID**|
|---|---|---|
|**Definition**|Data dibuat atau diberi<br>nilai pertama kali|_cartItems dari cartRepo.FindByUserID(userID)_|
|**Use**|Data dipakai untuk proses<br>atau keputusan|_len(cartItems) == 0 , order.TotalAmount_|
|**Propagation**|Data diteruskan ke fungsi<br>atau layer lain|_cartItems diteruskan ke CheckoutTransaction_|
|**Mutation**|Data berubah akibat<br>proses|_Stok dikurangi, payment_token disisipkan ke order_|



Data Flow Testing penting untuk modul checkout karena transaksi bergantung pada kesinambungan data dari cart sampai order. Kesalahan aliran data dapat menyebabkan order tercatat untuk user yang salah, item tidak lengkap, total pembayaran tidak akurat, atau token pembayaran tidak tersimpan. 

## **2.3 Keterkaitan Data Flow Testing dengan ACID** 

Prinsip ACID pada basis data juga dapat diobservasi melalui perspektif Data Flow Testing: 

- Atomicity: cartItems dikirimkan sebagai satu kumpulan ke CheckoutTransaction — bukan diproses per item di usecase. 

- Consistency: quantity, priceAtPurchase, dan totalAmount dihitung secara berkaitan dan konsisten. 

- Isolation: userID eksplisit sepanjang alur memastikan data cart user berbeda tidak bercampur. 

- Durability: payment_token dan payment_url disimpan melalui SavePaymentToken setelah order terbentuk. 

## **2.4 Perbedaan dengan Basic Path Testing** 

||||
|---|---|---|
|**Aspek**|**Basic Path Testing**|**Data Flow Testing**|
|**Fokus**|Jalur eksekusi (cabang dan loop)|Siklus hidup data (def-use-mutation)|
|**Pertanyaan Utama**|Jalur mana saja yang mungkin dilalui?|Apakah data bergerak dengan benar?|
|**Test Case Design**|Berdasarkan cyclomatic complexity|Berdasarkan pasangan def-use data|
|**Kekuatan**|Memastikan cakupan jalur logika|Mendeteksi data loss dan mismatch|



## **3. SOURCE CODE YANG DIUJI** 

## **3.1 Usecase: Checkout (order_usecase.go)** 

Fungsi ini adalah entry point aliran data checkout. Seluruh data penting mengalir melalui fungsi ini sebelum diteruskan ke repository. 

```
// File: backend-go/internal/usecase/order_usecase.go
```

```
func (u *orderUsecase) Checkout(userID string, voucherCode string)
(*domain.Order, error) {
    // DEF: cartItems
    cartItems, err := u.cartRepo.FindByUserID(userID)
    if err != nil {
        return nil, errors.New("gagal memuat keranjang belanja")
    }
```

```
    // USE: cartItems — validasi kosong
    if len(cartItems) == 0 {
```

```
        return nil, errors.New("keranjang belanja anda kosong. tidak bisa
checkout")
```

```
    }
```

```
    // PROPAGATION: cartItems  -> CheckoutTransaction
    order, err := u.orderRepo.CheckoutTransaction(userID, cartItems,
voucherCode)
    if err != nil {
        return nil, errors.New("Checkout gagal: " + err.Error())
    }
```

```
    // DEF + USE: snapTokenFn memakai order.ID dan order.TotalAmount
    snapResp, snapErr := u.snapTokenFn(order.ID, order.TotalAmount)
    if snapErr == nil && snapResp != nil {
        // MUTATION: order diberi PaymentToken dan PaymentURL
        order.PaymentToken = &snapResp.Token
        order.PaymentURL   = &snapResp.RedirectURL
        u.orderRepo.SavePaymentToken(order.ID, snapResp.Token,
snapResp.RedirectURL)
```

```
    }
```

```
    return order, nil
}
```

## **3.2 Repository: CheckoutTransaction (order_repository.go)** 

Fungsi ini adalah tempat di mana data cart diproses menjadi order dalam konteks transaksi database. Lock pada level baris (SELECT FOR UPDATE) memastikan isolasi stok antar pengguna bersamaan. 

```
// File: backend-go/internal/repository/order_repository.go
```

```
for _, item := range cartItems {
    var product domain.Product
```

```
    // LOCK: isolasi stok per produk (Isolation - ACID)
    if err := tx.Clauses(clause.Locking{Strength: "UPDATE"}).
```

```
        Where("id_product = ?", item.ProductID).First(&product).Error; err !=
nil {
        return errors.New("produk " + item.ProductID + " tidak ditemukan")
    }
    // DEF: priceAtPurchase dari harga produk saat transaksi
    priceAtPurchase := product.Price
```

```
    // USE + MUTATION: totalAmount diakumulasi
```

```
    totalAmount += priceAtPurchase * float64(item.Quantity)
```

```
    // DEF: orderItems — PROPAGATION ke tabel order_item
    orderItems = append(orderItems, domain.OrderItem{
        OrderID:         orderID,
        ProductID:       product.ID,
        VariantID:       item.VariantID,   // VariantID tetap dibawa
        Quantity:        item.Quantity,
        PriceAtPurchase: priceAtPurchase,
    })
}
```

## **3.3 Automated Test: Data Flow Test** 

Test ini menggunakan mock repository untuk mengobservasi aliran data secara langsung, tanpa bergantung pada database production. Setiap assertion memverifikasi satu titik def-use dalam aliran data. 

```
// File: backend-go/internal/usecase/order_whitebox_additional_test.go
func TestDataFlow_CheckoutCartToOrderAndPaymentToken(t *testing.T) {
    variantID := "variant-250g"
    cartItems := []domain.CartItem{
        {ID: "cart-1", UserID: "user-flow", ProductID: "prod-1", Quantity: 2},
        {ID: "cart-2", UserID: "user-flow", ProductID: "prod-2",
         VariantID: &variantID, Quantity: 3},
```

```
    }
```

```
    orderRepo := &wbOrderRepo{}
    uc := &orderUsecase{
        orderRepo: orderRepo,
        cartRepo:  &wbCartRepo{items: cartItems},
        snapTokenFn: func(orderID string, amount float64) (*snap.Response,
error) {
            // Validasi: orderID harus sama dengan order hasil transaction
            if orderID != "order-flow-1" {
                t.Fatalf("snapTokenFn menerima orderID salah: %s", orderID)
            }
            // Validasi: amount harus sama dengan totalAmount hasil kalkulasi
            if amount != 75000 {
                t.Fatalf("snapTokenFn menerima amount salah: %.2f", amount)
            }
            return &snap.Response{
                Token:       "snap-token-flow",
                RedirectURL: "https://pay.example/flow",
            }, nil
        },
    }
```

```
    order, err := uc.Checkout("user-flow", "VOUCHER-IGNORED")
    // ... assertions ...
}
```

## **4. PEMETAAN DEF-USE DATA** 

Tabel berikut mendokumentasikan seluruh variabel data penting yang diuji, mencakup titik definition, titik use, dan risiko jika aliran data mengalami kegagalan. 

||||||
|---|---|---|---|---|
|**ID**|**Nama Data**|**Definition**|**Use / Propagation**|**Risiko Jika**<br>**Aliran**<br>**Gagal**|
|**DF-**<br>**D01**|**userID**|_Handler membaca user_id dari_<br>_JWT context, usecase_<br>_menerima sebagai parameter_|_FindByUserID,_<br>_CheckoutTransaction,_<br>_createdOrder.UserID_|Order<br>tercatat<br>untuk user<br>yang salah|
|**DF-**<br>**D02**|**cartItems**|_cartRepo.FindByUserID(userID)_|_Dicek kosong, diteruskan_<br>_ke transaction, diloop di_<br>_repository_|Order<br>kosong atau<br>item hilang|
|**DF-**<br>**D03**|**voucherCode**|_Body request opsional dari_<br>_client_|_Diteruskan ke_<br>_CheckoutTransaction_<br>_sebagai parameter_|Diskon tidak<br>diterapkan<br>atau scope<br>tidak<br>konsisten|
|**DF-**<br>**D04**|**ProductID**|_Setiap CartItem dari repository_|_Query produk dan_<br>_OrderItem.ProductID_|Produk<br>yang diorder<br>salah|
|**DF-**<br>**D05**|**VariantID**|_Optional pada CartItem_<br>_(pointer)_|_Query varian dan_<br>_OrderItem.VariantID_|Varian tidak<br>tercatat<br>dalam order<br>item|
|**DF-**<br>**D06**|**Quantity**|_Setiap CartItem_|_Validasi stok, pengurangan_<br>_stok, subtotal, order item_|Stok salah<br>dikurangi,<br>total tidak<br>akurat|
|**DF-**<br>**D07**|**priceAtPurchase**|_Dari product/variant price saat_<br>_transaksi berlangsung_|_Subtotal dan_<br>_OrderItem.PriceAtPurchase_|Harga<br>historis<br>order salah<br>— berbeda<br>dari harga<br>saat ini|
|**DF-**<br>**D08**|**totalAmount**|_Akumulasi subtotal dalam loop_<br>_repository_|_createdOrder.TotalAmount,_<br>_snapTokenFn(amount)_|Nominal<br>pembayaran<br>Midtrans<br>salah|
|**DF-**<br>**D09**|**orderID**|_uuid.New().String() di repository_|_Order utama, order item,_<br>_Snap Token,_<br>_SavePaymentToken_|Relasi order<br>dan item<br>terputus,<br>token tidak<br>tertaut ke<br>order|
|**DF-**<br>**D10**|**payment_token**|_Response Snap Midtrans_|_order.PaymentToken,_<br>_SavePaymentToken_|User tidak<br>dapat<br>melanjutkan<br>proses<br>pembayaran|



## **5. DIAGRAM ALIRAN DATA** 

## **5.1 Narasi Aliran Data** 

Berikut adalah narasi lengkap perjalanan data dari awal hingga akhir proses checkout: 

1. user_id dibaca dari JWT token oleh HTTP handler, kemudian diteruskan sebagai parameter ke orderUsecase.Checkout(). 

2. cartRepo.FindByUserID(userID) mendefinisikan cartItems. Jika error atau kosong, aliran berhenti dengan pesan error. 

3. cartItems yang valid di-propagate ke orderRepo.CheckoutTransaction(userID, cartItems, voucherCode). 

4. Di dalam transaksi repository, setiap item diloop: produk dikunci (SELECT FOR UPDATE), priceAtPurchase diambil dari database, totalAmount diakumulasi, dan orderItems dibangun. 

5. Setelah loop selesai, order utama dibuat dengan totalAmount final dan orderID baru dari UUID. Cart dihapus. Order dikembalikan ke usecase. 

6. Usecase memanggil snapTokenFn(order.ID, order.TotalAmount). Token Snap memakai data hasil transaksi — bukan data dari input user. 

7. Payment token dan URL yang diterima dari Midtrans dimutasi ke dalam objek order, lalu disimpan ke repository via SavePaymentToken. 

8. Order lengkap dengan payment_token dikembalikan sebagai response HTTP ke client. 

## **5.2 Representasi Aliran Data (ASCII Flow)** 

```
  [JWT Token]
      |
      | user_id
      v
  [orderUsecase.Checkout(userID, voucherCode)]
```

```
      |
      | FindByUserID(userID)
      v
  [cartRepo] ---> cartItems []domain.CartItem
```

```
      |
```

```
      | len(cartItems) == 0 ?
      +-- Ya --> [Return Error: keranjang kosong]
```

```
      |
      | Tidak  (PROPAGATION: userID + cartItems + voucherCode)
```

```
      v
```

```
  [orderRepo.CheckoutTransaction]
```

```
      |
```

```
      | Loop per CartItem:
      |   SELECT FOR UPDATE product (ISOLATION)
      |   DEF priceAtPurchase = product.Price
      |   totalAmount += priceAtPurchase * quantity  (MUTATION)
      |   append orderItems (PROPAGATION VariantID, Quantity, Price)
      |
```

```
      | Buat order{orderID, totalAmount, status=PENDING}
```

```
      | Hapus cart user
```

```
      v
  order{ID, TotalAmount, ...}
      |
      | snapTokenFn(order.ID, order.TotalAmount)
      v
  [Midtrans Snap API]
      |
      | snap.Token + snap.RedirectURL  (DEF)
      v
  [MUTATION] order.PaymentToken = &snap.Token
             order.PaymentURL   = &snap.RedirectURL
             SavePaymentToken(order.ID, token, url)  (DURABILITY)
      |
      v
  [Response HTTP] -> order (lengkap dengan payment_token)
```

## **6. DATA UJI** 

Data uji dirancang menggunakan mock repository agar aliran data dapat diobservasi langsung tanpa bergantung pada database production. Setiap nilai dipilih agar dapat diidentifikasi secara unik dalam assertion. 

||||
|---|---|---|
|**Parameter**|**Nilai Mock**|**Tujuan Validasi**|
|**user_id**|_user-flow_|Memastikan user_id tidak berubah saat<br>mengalir ke repository|
|**Cart item 1**|_ProductID=prod-1, Quantity=2,_<br>_VariantID=nil_|Item tanpa varian — validasi DF-D04 dan DF-<br>D06|
|**Cart item 2**|_ProductID=prod-2, Quantity=3,_<br>_VariantID=variant-250g_|Item dengan varian — validasi DF-D05<br>(VariantID tetap terbawa)|
|**voucher_code**|_VOUCHER-IGNORED_|Memastikan parameter diteruskan ke<br>repository meski tidak aktif|
|**Mock order_id**|_order-flow-1_|Memastikan ID order dipakai oleh<br>snapTokenFn (DF-D09)|
|**Mock**<br>**total_amount**|_75000_|Memastikan total pembayaran dipakai oleh<br>snapTokenFn (DF-D08)|
|**Mock**<br>**payment_token**|_snap-token-flow_|Memastikan token tersimpan ke order dan<br>repository (DF-D10)|
|**Mock**<br>**payment_url**|_https://pay.example/flow_|Memastikan URL tersimpan ke repository<br>(DF-D10)|



## **7. RANCANGAN DAN HASIL TEST CASE** 

## **7.1 Tabel Test Case** 

||||||
|---|---|---|---|---|
|**ID**|**Skenario Uji**|**Input Data**|**Expected Result**|**Status**|
|**DF-**<br>**CHK-**<br>**01**|Data user_id mengalir ke<br>repository tanpa perubahan|_user-flow_|checkoutUserID == user-<br>flow pada mock<br>repository||
|||||**PASS**|
|**DF-**<br>**CHK-**<br>**02**|Data voucherCode<br>diteruskan ke repository|_VOUCHER-_<br>_IGNORED_|checkoutVoucher ==<br>VOUCHER-IGNORED<br>pada mock repository||
|||||**PASS**|
|**DF-**<br>**CHK-**<br>**03**|Jumlah cart item tidak hilang<br>dalam propagation|_2 cart item_|Repository menerima<br>tepat 2 item, tidak kurang<br>atau lebih||
|||||**PASS**|
|**DF-**<br>**CHK-**<br>**04**|VariantID pada item kedua<br>tetap terbawa|_variant-250g_|VariantID tidak nil dan<br>nilainya sama persis||
|||||**PASS**|
|**DF-**<br>**CHK-**<br>**05**|orderID hasil transaction<br>mengalir ke snapTokenFn|_order-flow-1_|snapTokenFn dipanggil<br>dengan orderID order-<br>flow-1||
|||||**PASS**|
|**DF-**<br>**CHK-**<br>**06**|totalAmount hasil kalkulasi<br>mengalir ke snapTokenFn|_75000_|snapTokenFn dipanggil<br>dengan amount ==<br>75000.00||
|||||**PASS**|
|**DF-**<br>**CHK-**<br>**07**|payment_token dari Snap<br>disimpan ke objek order|_snap-token-_<br>_flow_|order.PaymentToken !=<br>nil &&<br>*order.PaymentToken ==<br>snap-token-flow||
|||||**PASS**|
|**DF-**<br>**CHK-**<br>**08**|payment_token dan URL<br>disimpan ke repository|_token + URL_<br>_mock_|SavePaymentToken<br>dipanggil dengan nilai<br>token dan URL yang<br>sama||
|||||**PASS**|



## **7.2 Langkah Pengujian** 

6. Membuat mock wbCartRepo yang mengembalikan 2 cart item (satu dengan VariantID, satu tanpa). 

7. Membuat mock wbOrderRepo yang merekam seluruh parameter yang diterima dari usecase (userID, cartItems, voucherCode, token, URL). 

8. Menginjeksi snapTokenFn palsu yang memvalidasi orderID dan totalAmount, lalu mengembalikan token mock. 

9. Menjalankan uc.Checkout("user-flow", "VOUCHER-IGNORED") dan menangkap hasilnya. 

10. Memeriksa seluruh nilai yang direkam mock repository terhadap expected value. 

11. Memeriksa bahwa order response berisi payment_token yang tidak nil dan nilainya benar. 

## **8. HASIL PENGUJIAN AKTUAL** 

## **8.1 Perintah Eksekusi** 

```
$ cd backend-go
```

```
$ go test ./internal/usecase -run TestDataFlow -v
```

## **8.2 Output Konsol** 

```
$ cd backend-go
```

```
$ go test ./internal/usecase -run TestDataFlow -v
```

```
=== RUN   TestDataFlow_CheckoutCartToOrderAndPaymentToken
--- PASS: TestDataFlow_CheckoutCartToOrderAndPaymentToken (0.00s)
PASS
ok   github.com/nuryanfa/e-commerse-sqa/internal/usecase
```

## **8.3 Ringkasan Hasil Eksekusi** 

||||
|---|---|---|
|**Parameter**|**Nilai**|**Status**|
|**Total Test Case**|8 test case||
|||**PASS**|
|**Test Passed**|8 (100%)||
|||**PASS**|
|**Test Failed**|0 (0%)||
|||**PASS**|
|**Durasi Eksekusi**|0.00s (sangat cepat — tidak ada I/O nyata, semua<br>mock)||
|||**PASS**|
|**Tool**|Go test (go test -v -run TestDataFlow)||
|||**PASS**|



## **9. ANALISIS HASIL PER DATA** 

||||
|---|---|---|
|**Data**|**Hasil Aktual**|**Analisis**|
|**user_id**|_Diterima repository_<br>_sebagai user-flow_|Tidak terjadi perubahan atau loss. userID mengalir lurus<br>dari JWT context ke usecase ke repository —<br>membuktikan isolation data user terjaga.|
|**cart_items**|_Repository menerima 2_<br>_item, tidak kurang_|Tidak ada item yang hilang dalam propagation dari<br>usecase ke repository. Atomicity terpenuhi: cart diproses<br>sebagai satu unit.|
|**variant_id**|_variant-250g tetap ada_<br>_pada item kedua_|VariantID sebagai pointer tidak menjadi nil atau<br>kehilangan nilai saat diteruskan melalui beberapa layer.<br>Produk dengan varian dapat diproses dengan benar.|
|**voucher_code**|_Repository menerima_<br>_VOUCHER-IGNORED_|Parameter kompatibilitas diteruskan dengan benar<br>meski fitur belum aktif di repository. Tidak ada<br>kehilangan parameter.|
|**order_id**|_snapTokenFn menerima_<br>_order-flow-1_|Token Snap dibuat berdasarkan orderID hasil transaksi<br>— bukan ID yang dikonstruksi ulang atau di-hardcode.<br>Relasi antara order dan token terjamin.|
|**total_amount**|_snapTokenFn menerima_<br>_75000.0_|Nominal pembayaran Midtrans berasal dari kalkulasi<br>transaksi database, bukan dari input user. Ini mencegah<br>manipulasi harga dari sisi klien.|
|**payment_token**|_order.PaymentToken_<br>_berisi snap-token-flow_|Order response membawa token pembayaran yang<br>benar. User dapat langsung diarahkan ke halaman<br>pembayaran.|
|**payment_url**|_SavePaymentToken_<br>_menerima URL mock_|URL pembayaran tersimpan ke repository dengan nilai<br>yang sama dari Snap — Durability terpenuhi, data dapat<br>dibaca ulang.|



## **10. ANALISIS ACID BERDASARKAN DATA FLOW** 

Setiap prinsip ACID dianalisis dari perspektif aliran data yang diamati selama pengujian: 

||||
|---|---|---|
|**Prinsip**<br>**ACID**|**Bukti Data Flow**|**Penjelasan**|
|**Atomicity**|_cartItems diteruskan sebagai satu_<br>_kumpulan ke CheckoutTransaction_|Usecase tidak memproses cart item satu per satu<br>secara terpisah. Seluruh item dikirim sekaligus ke<br>repository — jika satu gagal, seluruh transaksi di-<br>rollback. Tidak ada status partial checkout.|
|**Consistency**|_quantity, priceAtPurchase, dan_<br>_totalAmount saling berkaitan_<br>_dalam kalkulasi_|Total order dihitung dari data produk aktual di<br>database saat transaksi, bukan dari input user.<br>Ini memastikan nilai order selalu konsisten<br>dengan kondisi data yang valid.|
|**Isolation**|_userID eksplisit sepanjang seluruh_<br>_alur; SELECT FOR UPDATE pada_<br>_stok_|userID diteruskan secara eksplisit — tidak ada<br>shared state antar request. Lock baris pada<br>produk memastikan dua user tidak dapat<br>mengubah stok yang sama secara bersamaan.|
|**Durability**|_payment_token dan payment_url_<br>_disimpan via SavePaymentToken_<br>_setelah order terbentuk_|Data pembayaran tidak hanya ada di memori<br>aplikasi — ia disimpan ke repository sehingga<br>dapat dibaca kembali bahkan jika aplikasi restart.<br>Checkout yang sukses bersifat permanen.|



## **11. TRACEABILITY MATRIX** 

Tabel di bawah menghubungkan setiap test case White Box Data Flow dengan skenario Black Box yang telah diuji sebelumnya, serta menunjukkan bukti implementasi di source code. 

||||||
|---|---|---|---|---|
|**TC WB**|**TC BB**|**Skenario Black Box**|**Bukti Source Code**|**Status**|
|**DF-CHK-**<br>**01**|**CHK-06**|Auth user context —<br>userID dari JWT ke<br>usecase|_Handler/usecase memakai_<br>_userID dari auth context_<br>_eksplisit_||
|||||**PASS**|
|**DF-CHK-**<br>**02**|**CHK-01**|Checkout sukses —<br>parameter diteruskan<br>lengkap|_CheckoutTransaction(userID,_<br>_cartItems, voucherCode) — 3_<br>_parameter_||
|||||**PASS**|
|**DF-CHK-**<br>**03**|**CHK-01**|Cart items lengkap masuk<br>ke transaksi|_cartItems diteruskan sebagai_<br>_slice penuh ke repository_||
|||||**PASS**|
|**DF-CHK-**<br>**04**|**CHK-01 /**<br>**CHK-03**|VariantID pada concurrent<br>/ cart item|_item.VariantID diteruskan ke_<br>_OrderItem.VariantID di_<br>_repository_||
|||||**PASS**|
|**DF-CHK-**<br>**05**|**CHK-05**|Token pembayaran<br>memakai order hasil<br>transaction|_snapTokenFn(order.ID,_<br>_order.TotalAmount) — bukan_<br>_dari input_||
|||||**PASS**|
|**DF-CHK-**<br>**06**|**CHK-08**|Status order dan total<br>benar dari transaksi|_totalAmount dihitung di_<br>_repository, bukan di-pass dari_<br>_usecase_||
|||||**PASS**|
|**DF-CHK-**<br>**07**|**CHK-05**|Token tersimpan di order<br>response|_order.PaymentToken =_<br>_&snapResp.Token (mutasi_<br>_langsung di usecase)_||
|||||**PASS**|
|**DF-CHK-**<br>**08**|**CHK-05 /**<br>**CHK-07**|Durability — token<br>disimpan ke database|_SavePaymentToken(order.ID,_<br>_token, url) dipanggil setelah_<br>_order_||
|||||**PASS**|



## **12. TEMUAN** 

||||||
|---|---|---|---|---|
|**ID**|**Temuan**|**Dampak**|**Rekomendasi**|**Kategori**|
|**DF-F01**|Data utama checkout<br>(userID, cartItems,<br>orderID, totalAmount)<br>mengalir konsisten<br>dari usecase ke<br>repository tanpa loss<br>atau misdirection.|Tidak ada order salah<br>user, item hilang,<br>atau total<br>pembayaran yang<br>tidak akurat.|Pertahankan dan<br>jadikan sebagai<br>regression test wajib<br>pada setiap<br>perubahan usecase<br>atau repository.|**Positif**|
|**DF-F02**|payment_token dan<br>payment_url disimpan<br>ke repository<br>(Durability) setelah<br>order terbentuk.|Data pembayaran<br>tidak hilang meskipun<br>aplikasi restart<br>setelah checkout.|Tambahkan<br>mekanisme retry<br>atau monitoring alert<br>jika Midtrans API<br>gagal pada<br>production, agar<br>SavePaymentToken<br>tetap dipanggil.|**Positif**|
|**DF-F03**|voucherCode<br>diteruskan ke<br>repository sebagai<br>parameter tetapi tidak<br>aktif diproses di<br>dalam<br>CheckoutTransaction.|Tidak ada dampak<br>negatif aktif, namun<br>scope voucher perlu<br>didokumentasikan<br>agar tidak<br>menimbulkan asumsi<br>keliru.|Dokumentasikan<br>secara eksplisit<br>bahwa voucher<br>berada di luar scope<br>Checkout ACID<br>aktif, atau<br>rencanakan<br>implementasi di<br>sprint berikutnya.|**Netral**|



## **13. KESIMPULAN** 

## **13.1 Ringkasan Hasil** 

KEPUTUSAN PENGUJIAN: LULUS (PASS) — Data Flow Testing pada modul Checkout ACID dinyatakan LULUS. Seluruh 8 test case berhasil dieksekusi dalam 0.00s tanpa satu pun kegagalan. Pengujian White Box dengan metode Data Flow Testing membuktikan bahwa: 

1. user_id tidak berubah dari JWT context ke usecase hingga repository — tidak ada risiko order salah user. 

2. cart_items diteruskan secara lengkap — tidak ada item yang hilang, termasuk VariantID pada item yang memiliki varian produk. 

3. order_id dan total_amount yang dihasilkan oleh transaksi database — bukan dari input user — digunakan sebagai basis pembuatan Snap Token Midtrans. 

4. payment_token dan payment_url dari response Midtrans dimutasi ke dalam objek order dan disimpan ke repository, memenuhi prinsip Durability. 

5. Tidak ditemukan defect berupa data hilang (data loss), data salah arah (data misdirection), atau data yang tidak digunakan (unused definition) pada jalur utama Checkout ACID. 

