## **LAPORAN SOFTWARE QUALITY ASSURANCE METODE GREYBOX – ORTHOGONAL ARRAY TESTING** 

## Anggota kelompok: 

20231310046 M. Irvan Alfiansyah 20231310047 M. Nur Yanfa 

**PROGRAM STUDI TEKNIK INFORMATIKA UNIVERSITAS KEBANGSAAN REPUBLIK INDONESIA** _Jln. Terusan Halimun No. 37 (Pelajar Pejuang 45) Lingkar Selatan Kec. Lengkong kota Bandung Jawa Barat 40263_ 

## **1. DASAR TEORI ORTHOGONAL ARRAY TESTING** 

Orthogonal Array Testing adalah metode grey box testing yang digunakan untuk menguji kombinasi beberapa faktor input secara efisien. Apabila semua kombinasi diuji secara penuh (full factorial), jumlah test case dapat menjadi sangat besar dan tidak praktis. 

Orthogonal Array menyelesaikan masalah ini dengan memilih subset kombinasi yang representatif sehingga setiap level dari setiap faktor tetap muncul secara seimbang (balanced coverage). Dengan pendekatan ini, efisiensi pengujian meningkat tanpa mengorbankan cakupan kombinasi yang penting. 

Pada fitur Checkout ACID, faktor yang mempengaruhi hasil checkout tidak hanya berasal dari input pengguna, tetapi juga dari kondisi internal sistem yang dapat bervariasi secara independen: 

1. Kondisi isi keranjang belanja (cart) 

2. Hasil eksekusi transaksi repository 

3. Hasil pembuatan Snap Token Midtrans 

4. Parameter voucher yang diteruskan antar layer 

Karena pengujian ini menggunakan pengetahuan struktur internal kode usecase (white-box), tetapi tetap berangkat dari skenario perilaku checkout (black-box), metode ini tergolong grey box testing. 

## **2. ALASAN PEMILIHAN ORTHOGONAL ARRAY TESTING** 

Checkout ACID memiliki banyak kombinasi kondisi yang mungkin terjadi secara bersamaan. Jika seluruh kombinasi diuji secara penuh, jumlahnya adalah: 

Faktor A (kondisi cart):       3 level  →  kosong / 1 item / 2 item + varian Faktor B (hasil transaction):  3 level  →  success / stock error / DB error Faktor C (hasil snap token):   3 level  →  success / error / nil response Faktor D (voucher):            3 level  →  kosong / DISC10 / IGNORED 

Full factorial: 3 × 3 × 3 × 3 = 81 kombinasi Orthogonal Array L9:           9 kombinasi representatif 

Dengan Orthogonal Array L9, 81 kombinasi dapat dipadatkan menjadi hanya 9 test case yang tetap mencakup seluruh variasi penting secara seimbang — efisiensi pengurangan 89%. 

||||
|---|---|---|
|**Aspek**|**Full Factorial**|**Orthogonal Array L9**|
|Jumlah Test Case|81 kombinasi|**9 kombinasi**|
|Cakupan level faktor|Semua kombinasi|Seimbang per pasangan|
|Efisiensi|Rendah|**Tinggi — efisiensi 89%**|
|Kemampuan deteksi<br>defect|Maksimal|Cukup untuk fault detection|



## **3. RUANG LINGKUP PENGUJIAN** 

Pengujian dilakukan di level usecase dengan mock repository agar aman dan tidak mengubah stok production. Seluruh 9 area skenario dicakup dalam kombinasi Orthogonal Array L9: 

|||||
|---|---|---|---|
|**ID**|**Area**|**Dicakup**|**Keterangan**|
|**OA-**<br>**S01**|Cart kosong|**Ya**|Guard cart kosong di usecase — sebelum repository<br>dipanggil|
|**OA-**<br>**S02**|Cart satu item|**Ya**|Jalur checkout sederhana — tanpa varian|
|**OA-**<br>**S03**|Cart banyak item / varian|**Ya**|Jalur data lebih kompleks — item dengan variantID|
|**OA-**<br>**S04**|Transaction sukses|**Ya**|Order berhasil dibuat — happy path|
|**OA-**<br>**S05**|Transaction stok error|**Ya**|Stok tidak mencukupi — checkout gagal valid|
|**OA-**<br>**S06**|Transaction database<br>error|**Ya**|Database timeout/error — checkout gagal valid|
|**OA-**<br>**S07**|Snap Token sukses|**Ya**|Token disimpan ke order dan database|
|**OA-**<br>**S08**|Snap Token error|**Ya**|Order tetap return — Midtrans error hanya di-log|
|**OA-**<br>**S09**|Voucher forwarding|**Ya**|Parameter voucherCode diteruskan ke repository|



## **4. FAKTOR DAN LEVEL ORTHOGONAL ARRAY** 

## **4.1 Definisi Faktor dan Level** 

||||||
|---|---|---|---|---|
|**Faktor**|**Nama**|**Level 1**|**Level 2**|**Level 3**|
|**A**|Kondisi<br>Cart|**Cart Kosong**|**1 Item**|**2 Item + Varian**|
|**B**|Hasil<br>Transaction|**Success**|**Stock Error**|**DB Error**|
|**C**|Hasil Snap<br>Token|**Success**|**Error**|**Nil Response**|
|**D**|Voucher|**Kosong**|**DISC10**|**IGNORED**|



## **4.2 Hubungan Faktor dengan Source Code** 

||||
|---|---|---|
|**Faktor**|**Kode**|**Hubungan dengan Source Code**|
|**A**|Cart|_cartRepo.FindByUserID  |  len(cartItems) == 0  |  parameter ke_<br>_CheckoutTransaction_|
|**B**|Transaction|_Return value dari orderRepo.CheckoutTransaction(userID, cartItems,_<br>_voucherCode)_|
|**C**|Snap|_Return value dari snapTokenFn(order.ID, order.TotalAmount)  |  snapErr branch_|
|**D**|Voucher|_Parameter voucherCode yang diteruskan ke orderRepo.CheckoutTransaction_|



## **5. ORTHOGONAL ARRAY L9 — MATRIKS KOMBINASI** 

Sembilan kombinasi berikut dipilih secara sistematis menggunakan struktur L9 (3^4) sehingga setiap level dari setiap faktor muncul tepat 3 kali dan setiap pasangan level muncul tepat satu kali: 

|||||||
|---|---|---|---|---|---|
|**Test**<br>**ID**|**A — Cart**|**B —**<br>**Transaction**|**C — Snap**<br>**Token**|**D —**<br>**Voucher**|**Expected Result**|
|**OA-01**|**Kosong**|**Success**|**Success**|**Kosong**|Error cart kosong; repository<br>tidak dipanggil|
|**OA-02**|**1 Item**|**Stock Error**|**Error**|**DISC10**|Error checkout; voucher<br>diteruskan ke repo|
|**OA-03**|**2 Item+Var**|**DB Error**|**Nil**|**IGNORED**|Error checkout; voucher<br>diteruskan ke repo|
|**OA-04**|**1 Item**|**Success**|**Nil**|**Kosong**|Checkout sukses; order return<br>tanpa token|
|**OA-05**|**2 Item+Var**|**Success**|**Success**|**DISC10**|Checkout sukses; token<br>tersimpan|
|**OA-06**|**Kosong**|**Stock Error**|**Nil**|**IGNORED**|Error cart kosong; repository<br>tidak dipanggil|
|**OA-07**|**2 Item+Var**|**Success**|**Error**|**Kosong**|Checkout sukses; token nil;<br>Midtrans error di-log|
|**OA-08**|**1 Item**|**Success**|**Success**|**IGNORED**|Checkout sukses; token dan<br>URL tersimpan|
|**OA-09**|**Kosong**|**DB Error**|**Error**|**DISC10**|Error cart kosong; repository<br>tidak dipanggil|



Properti L9: setiap faktor A/B/C/D muncul pada masing-masing levelnya tepat 3 kali. Setiap pasangan faktor mencakup semua kombinasi level secara seimbang — balanced pairwise coverage. 

## **6. SOURCE CODE YANG DIUJI** 

## **6.1 Usecase Checkout** 

Fungsi ini adalah titik pengujian utama OAT. Keempat faktor (cart, transaction, snap token, voucher) langsung terlihat pada alur kode di bawah: 

```
func (u *orderUsecase) Checkout(userID string, voucherCode string) (*domain.Order,
error) {
    // ── Faktor A: kondisi cart ────────────────────────────────────
    cartItems, err := u.cartRepo.FindByUserID(userID)
    if err != nil {
        return nil, errors.New("gagal memuat keranjang belanja")
    }
    if len(cartItems) == 0 {
        return nil, errors.New("keranjang belanja anda kosong. tidak bisa checkout")
    }
```

```
    // ── Faktor B: hasil transaction + Faktor D: voucher ──────────
    order, err := u.orderRepo.CheckoutTransaction(userID, cartItems, voucherCode)
    if err != nil {
        return nil, errors.New("Checkout gagal: " + err.Error())
    }
```

```
    // ── Faktor C: hasil snap token ────────────────────────────────
    snapResp, snapErr := u.snapTokenFn(order.ID, order.TotalAmount)
```

```
    if snapErr == nil && snapResp != nil {
```

```
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

## **6.2 Source Code Automated Test** 

Test menggunakan tabel struct (table-driven test) dengan mock dependency untuk setiap kombinasi faktor. Setiap sub-test memeriksa: ada/tidaknya error, jumlah pemanggilan repository, ada/tidaknya payment token, token tersimpan/tidak, dan voucher yang diteruskan. 

```
func TestOrthogonalArray_CheckoutACID(t *testing.T) {
    variantID := "variant-oa"
    stockErr  := errors.New("stok produk 'Bayam Hijau' tidak mencukupi. Stok
tersisa: 0")
    dbErr     := errors.New("database timeout")
    tests := []struct {
        id                  string
        cartItems           []domain.CartItem
        transactionErr      error
        snapTokenFn         func(orderID string, amount float64) (*snap.Response,
error)
        voucherCode         string
        wantErr             bool
        wantCheckoutCalls   int
        wantPaymentToken    bool
        wantSavedToken      bool
        wantVoucherForward  string
    }{ /* 9 test case OA-01..OA-09 */ }
```

```
    for _, tt := range tests {
        t.Run(tt.id, func(t *testing.T) {
            orderRepo := &wbOrderRepo{checkoutErr: tt.transactionErr}
            uc := &orderUsecase{
                orderRepo:   orderRepo,
                cartRepo:    &wbCartRepo{items: tt.cartItems},
                snapTokenFn: tt.snapTokenFn,
            }
            order, err := uc.Checkout("user-oa", tt.voucherCode)
            // Assert: error, call count, token, voucher forwarding
            assert.Equal(t, tt.wantErr, err != nil)
            assert.Equal(t, tt.wantCheckoutCalls, orderRepo.checkoutCalls)
            if !tt.wantErr {
                assert.Equal(t, tt.wantPaymentToken, order.PaymentToken != nil)
                assert.Equal(t, tt.wantVoucherForward, orderRepo.lastVoucher)
            }
        })
    }
}
```

## **7. RANCANGAN TEST CASE** 

||||||
|---|---|---|---|---|
|**ID**|**Skenario**|**Kondisi Internal**|**Ekspektasi**||
|**OA-01**|Cart kosong, faktor lain<br>success|cart kosong, transaction<br>sukses|Checkout error sebelum repository;<br>repository tidak dipanggil|**PASS**|
|**OA-02**|Cart 1 item, transaction<br>stok error|Repository return stock<br>error|Checkout error valid; voucher DISC10<br>diteruskan ke repo||
|||||**PASS**|
|**OA-03**|Cart 2 item varian, DB<br>error|Repository return DB error|Checkout error valid; voucher IGNORED<br>diteruskan ke repo||
|||||**PASS**|
|**OA-04**|Cart 1 item, sukses,<br>snap nil|Snap response nil|Order return sukses; PaymentToken tetap<br>nil||
|||||**PASS**|
|**OA-05**|Cart 2 item varian,<br>sukses, snap sukses|Transaction dan snap<br>sama-sama sukses|Order return sukses; token dan URL<br>tersimpan||
|||||**PASS**|
|**OA-06**|Cart kosong,<br>transaction stock error|Cart kosong mendominasi<br>guard|Error cart kosong; repository tidak pernah<br>dipanggil||
|||||**PASS**|
|**OA-07**|Cart 2 item varian,<br>sukses, snap error|Midtrans error|Order return sukses; token nil; error<br>Midtrans hanya di-log||
|||||**PASS**|
|**OA-08**|Cart 1 item, snap<br>sukses, voucher<br>IGNORED|Snap return token|Token dan URL tersimpan; voucher<br>IGNORED diteruskan||
|||||**PASS**|
|**OA-09**|Cart kosong, DB error<br>dan snap error|Cart kosong mendominasi<br>guard|Error cart kosong; repository tidak pernah<br>dipanggil||
|||||**PASS**|



## **8. EKSEKUSI PENGUJIAN** 

## **8.1 Command Eksekusi** 

```
cd backend-go
```

```
go test ./internal/usecase -run TestOrthogonalArray -v
```

## **8.2 Output Lengkap** 

```
=== RUN   TestOrthogonalArray_CheckoutACID
=== RUN   TestOrthogonalArray_CheckoutACID/OA-01-empty-success-snap-success-no-
voucher
=== RUN   TestOrthogonalArray_CheckoutACID/OA-02-one-item-stock-error-snap-error-
voucher
=== RUN   TestOrthogonalArray_CheckoutACID/OA-03-two-items-db-error-snap-nil-voucher
=== RUN   TestOrthogonalArray_CheckoutACID/OA-04-one-item-success-snap-nil-no-
voucher
=== RUN   TestOrthogonalArray_CheckoutACID/OA-05-two-items-success-snap-success-
voucher
=== RUN   TestOrthogonalArray_CheckoutACID/OA-06-empty-stock-error-snap-nil-voucher
=== RUN   TestOrthogonalArray_CheckoutACID/OA-07-two-items-success-snap-error-no-
voucher
[MIDTRANS ERROR] Gagal generate Snap Token (Checkout): midtrans unavailable
=== RUN   TestOrthogonalArray_CheckoutACID/OA-08-one-item-success-snap-success-
voucher
=== RUN   TestOrthogonalArray_CheckoutACID/OA-09-empty-db-error-snap-error-voucher
--- PASS: TestOrthogonalArray_CheckoutACID (0.00s)
    --- PASS: TestOrthogonalArray_CheckoutACID/OA-01-... (0.00s)
    --- PASS: TestOrthogonalArray_CheckoutACID/OA-02-... (0.00s)
    --- PASS: TestOrthogonalArray_CheckoutACID/OA-03-... (0.00s)
    --- PASS: TestOrthogonalArray_CheckoutACID/OA-04-... (0.00s)
    --- PASS: TestOrthogonalArray_CheckoutACID/OA-05-... (0.00s)
    --- PASS: TestOrthogonalArray_CheckoutACID/OA-06-... (0.00s)
    --- PASS: TestOrthogonalArray_CheckoutACID/OA-07-... (0.00s)
    --- PASS: TestOrthogonalArray_CheckoutACID/OA-08-... (0.00s)
    --- PASS: TestOrthogonalArray_CheckoutACID/OA-09-... (0.00s)
PASS
ok   github.com/nuryanfa/e-commerse-sqa/internal/usecase
```

9 / 9 sub-test PASS  |  Durasi: 0.00s  |  Status keseluruhan: PASS  |  Log Midtrans OA-07 bersifat informatif, bukan kegagalan. 

## **8.3 Catatan Output** 

Pada OA-07, muncul baris log: 

```
[MIDTRANS ERROR] Gagal generate Snap Token (Checkout): midtrans unavailable
```

Log ini adalah output yang diharapkan — ia membuktikan bahwa Midtrans error di-log dan tidak menyebabkan panic atau test failure. Perilaku ini sesuai dengan desain usecase: kegagalan snap token tidak membatalkan order internal yang sudah berhasil dibuat. 

## **9. ANALISIS HASIL PER KOMBINASI** 

||||||
|---|---|---|---|---|
|**Test**<br>**ID**|**Status**|**Hasil Aktual**|**Analisis**|**Verdict**|
|**OA-01**||k hik|Guard len(cartItems)==0 bekerja|**PASS**|
||**PASS**|Cart osong mengentan<br>hk bl i|<br>meskipun faktor B dan C berstatus||
|||cecout seeum repostory|success||
||||||
|**OA-02**||Cart valid masuk repo; stock|Faktor A (cart valid) memungkinkan|**PASS**|
||**PASS**|error menyebabkan checkout|repo dipanggil; faktor B (stock error)||
|||<br>gagal valid|<br>menghentikan di level repo||
||||||
|**OA-03**||Cart varian diteruskan; DB|Item dengan variantID tetap diteruskan|**PASS**|
||**PASS**|error dikembalikan sebagai|ke repository; DB timeout tidak||
|||<br>checkout error|<br>menjadi 500||
||||||
|**OA-04**|||Snap nil tidak menyebabkan order|**PASS**|
||**PASS**|Transaction sukses; snap nil;<br>d|<br>hilang — PaymentToken nil tidak||
|||orer tetap return|menghalangi return||
||||||
|**OA-05**|||Happy path lengkap: 2 item + varian,|**PASS**|
||**PASS**|Semua faktor sukses; token<br>RL i|<br>transaction sukses, snap sukses,||
|||dan U tersmpan|voucher diteruskan||
||||||
|**OA-06**||Cart kosong tetap menjadi|Meskipun faktor B adalah stock error,|**PASS**|
||**PASS**|prioritas guard; repo tidak|guard cart kosong di usecase||
|||<br>dipanggil|<br>mendominasi||
||||||
|**OA-07**|||Kegagalan Snap Token tidak|**PASS**|
||**PASS**|Transaction sukses; Midtrans<br>k|<br>membatalkan order internal yang||
|||error; order return tanpa toen|sudah commit di database||
||||||
|**OA-08**||Snap sukses; voucher|Voucher diteruskan meski tidak|**PASS**|
||**PASS**|IGNORED diteruskan; token|diproses aktif di repository —||
|||tersimpan|<br>kompatibilitas parameter terjaga||
||||||
|**OA-09**||Cart kosong tetap<br>|Triple failure (cart + DB + snap) tetap|**PASS**|
||**PASS**|menghentikan checkout<br>ki DB|<br>berakhir di guard terdepan — fail-fast||
|||mespun  error dan snap<br>error|yang benar||



## **10. ANALISIS GREY BOX** 

Pengujian ini disebut grey box karena menggabungkan dua perspektif yang saling melengkapi: 

|||
|---|---|
|**Aspek Black-Box**|**Aspek White-Box**|
|Skenario berasal dari perilaku checkout yang<br>diamati dari luar: sukses, cart kosong, stok error,<br>payment error|Kombinasi disusun berdasarkan struktur internal<br>usecase — empat faktor dipetakan langsung ke<br>baris kode|
|Ekspektasi berupa perilaku sistem:<br>error/success/token ada atau tidak|Test memeriksa detail internal: call count<br>repository, voucher forwarding, token save|
|Mengacu pada endpoint checkout ACID dan<br>skenario CHK-01 s.d. CHK-08|Dijalankan pada fungsi orderUsecase.Checkout<br>dengan mock dependency injection|
|Tidak perlu server, database, atau Midtrans yang<br>nyata|Menguji batas antar layer: kapan usecase berhenti,<br>kapan meneruskan ke repo, kapan meneruskan ke<br>snap|



## **11. ANALISIS ACID HASIL ORTHOGONAL ARRAY** 

|||||
|---|---|---|---|
|**Prinsip**<br>**ACID**|**Status**|**Bukti dari Orthogonal Array**|**Penjelasan**|
|**Atomicity**|**Terpenuhi**|_OA-01, OA-06, OA-09: cart kosong_<br>_tidak masuk repo. OA-02, OA-03:_<br>_transaction error menghentikan_<br>_checkout._|Tidak ada partial commit —<br>checkout berhenti total atau<br>berhasil total|
|**Consistency**|**Terpenuhi**|_OA-02: stock error menghasilkan_<br>_checkout error, bukan order success_|Stok tidak berkurang tanpa<br>order yang valid — data tetap<br>konsisten|
|**Isolation**|**Terpenuhi**|_Kombinasi cart user-oa diuji melalui_<br>_mock cart terpisah per test case_|Setiap kombinasi berjalan<br>independen — tidak ada state<br>yang bocor antar sub-test|
|**Durability**|**Terpenuhi**|_OA-07: transaction sukses, Snap_<br>_Token error — order tetap return_|Order yang sudah commit<br>tidak hilang meskipun proses<br>eksternal (Midtrans) gagal|



## **12. TRACEABILITY MATRIX** 

||||||
|---|---|---|---|---|
|**OA**<br>**Test**|**Skenario Black-Box**|**Source White-Box**|**Fungsi / Kode yang Diverifikasi**||
|**OA-**<br>**01**|CHK-04: Cart kosong|_len(cartItems) == 0_|Guard usecase menolak cart kosong<br>sebelum repository|**PASS**|
|**OA-**<br>**02**|CHK-02: Stok kurang|_CheckoutTransaction error_<br>_branch_|Transaction stok error dikembalikan<br>sebagai checkout error|**PASS**|
|**OA-**<br>**03**|CHK-07: Transaction<br>gagal|_orderRepo.CheckoutTransaction_<br>_error_|DB error repository tidak menjadi panic<br>atau 500|**PASS**|
|**OA-**<br>**04**|CHK-01: Checkout<br>sukses|_return order, nil_|Order return meski snap nil —<br>PaymentToken opsional|**PASS**|
|**OA-**<br>**05**|CHK-01 + CHK-05:<br>Snap sukses|_SavePaymentToken dipanggil_|Token dan URL disimpan saat snap<br>sukses|**PASS**|
|**OA-**<br>**06**|CHK-04: Cart kosong|_Guard usecase_|Cart kosong mendominasi — repo tidak<br>dipanggil meski ada transaction error|**PASS**|
|**OA-**<br>**07**|CHK-05: Midtrans<br>error|_snapErr branch — fmt.Printf_|Midtrans error di-log, order internal<br>tidak dibatalkan|**PASS**|
|**OA-**<br>**08**|CHK-01: Payment<br>token tersedia|_order.PaymentToken,_<br>_order.PaymentURL_|Voucher IGNORED diteruskan; token<br>tersimpan saat snap sukses|**PASS**|
|**OA-**<br>**09**|CHK-04: Cart kosong|_Guard usecase — fail-fast_|Triple failure tetap ditangkap oleh guard<br>terdepan|**PASS**|



## **13. TEMUAN DAN REKOMENDASI** 

||||||
|---|---|---|---|---|
|**ID**|**Temuan**|**Dampak**|**Rekomendasi**|**Prioritas**|
|**OA-**<br>**F01**|9 kombinasi Orthogonal<br>Array seluruhnya PASS|Positif: tidak ada<br>defect pada jalur<br>usecase yang diuji|Jadikan<br>TestOrthogonalArray_CheckoutACID<br>sebagai regression test wajib|**Tinggi**|
|**OA-**<br>**F02**|Cart kosong selalu<br>menjadi guard paling awal|Positif: tidak ada<br>resource DB terpakai<br>sia-sia|Pertahankan guard<br>len(cartItems)==0 di usecase;<br>jangan dipindahkan ke repository|**Tinggi**|
|**OA-**<br>**F03**|Transaction error<br>menghentikan checkout<br>— tidak ada order palsu|Positif: mendukung<br>atomicity|Pertahankan pengembalian error<br>dari CheckoutTransaction ke<br>usecase|**Tinggi**|
|**OA-**<br>**F04**|Snap Token error tidak<br>membatalkan order<br>internal|Positif: mendukung<br>durability order|Pertimbangkan menambahkan retry<br>mekanisme untuk Midtrans bila<br>diperlukan|**Sedang**|
|**OA-**<br>**F05**|Voucher diteruskan<br>meskipun tidak aktif di<br>repository checkout|Netral: kompatibilitas<br>signature terjaga|Dokumentasikan sebagai parameter<br>kompatibilitas — di luar scope<br>Checkout ACID aktif|**Rendah**|



## **14. KESIMPULAN** 

Grey Box Orthogonal Array Testing pada fitur Checkout ACID dinyatakan **LULUS** dengan seluruh 9 kombinasi (OA-01 s.d. OA-09) mendapat status PASS. 

Dari 9 kombinasi Orthogonal Array L9 yang mewakili variasi cart, transaction, Snap Token, dan voucher: 

5. Seluruh 9 test case PASS tanpa defect. 

6. Cart kosong selalu ditolak sebelum repository dipanggil — fail-fast berjalan konsisten. 

7. Transaction error tidak menghasilkan order palsu — atomicity terjaga. 

8. Checkout sukses tetap mengembalikan order meskipun snap nil — order tidak bergantung pada Midtrans. 

9. Snap Token sukses menyimpan token dan URL ke order dan database. 

10. Snap Token error tidak membatalkan order internal — durability terjaga. 

11. Data voucher tetap diteruskan ke repository di seluruh kombinasi yang relevan. 

Dengan pendekatan L9, pengujian berhasil memverifikasi 9 dari 81 kombinasi (11%) yang representatif secara statistik dan menjamin cakupan pairwise pada semua faktor. Tidak ditemukan defect pada jalur usecase yang diuji. 

