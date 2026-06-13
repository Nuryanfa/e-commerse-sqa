## **LAPORAN SOFTWARE QUALITY ASSURANCE METODE GREYBOX – REGRESSION TESTING** 

## Anggota kelompok: 

20231310046 M. Irvan Alfiansyah 20231310047 M. Nur Yanfa 

**PROGRAM STUDI TEKNIK INFORMATIKA UNIVERSITAS KEBANGSAAN REPUBLIK INDONESIA** _Jln. Terusan Halimun No. 37 (Pelajar Pejuang 45) Lingkar Selatan Kec. Lengkong kota Bandung Jawa Barat 40263_ 

## **1. PENDAHULUAN** 

## **1.1 Latar Belakang** 

Grey Box Testing adalah pendekatan pengujian yang menggabungkan karakteristik Black Box Testing dan White Box Testing. Penguji memiliki pengetahuan parsial atas struktur internal sistem — cukup untuk merancang test case yang lebih efektif, tetapi tetap mengevaluasi sistem dari perspektif perilaku eksternal yang terukur. 

Dalam konteks proyek SayurSehat, Grey Box Regression Testing dilakukan setelah serangkaian perubahan pada kode, test, konfigurasi CI, dan dokumentasi. Tujuannya adalah memastikan tidak ada fitur yang sebelumnya bekerja dengan benar menjadi rusak (broken) akibat perubahan-perubahan tersebut — kondisi yang dikenal sebagai regression. 

## **1.2 Tujuan Pengujian** 

1. Memverifikasi bahwa fitur Checkout ACID tetap berfungsi setelah seluruh perubahan kode dan konfigurasi. 

2. Memastikan tidak ada regression pada skenario kritis: checkout sukses, cart kosong, stok kurang, Midtrans gagal. 

3. Memvalidasi bahwa pipeline CI (GitHub Actions) berhasil menjalankan test dan build secara otomatis. 

4. Mengonfirmasi frontend React tetap dapat di-build untuk production setelah perubahan konfigurasi API URL. 

5. Menyediakan traceability antara regression test case dengan pengujian Black Box dan White Box sebelumnya. 

## **1.3 Perbedaan Grey Box vs Black Box vs White Box** 

|||||
|---|---|---|---|
|**Aspek**|**Black Box**|**White Box**|**Grey Box (ini)**|
|**Pengetahuan Kode**|Tidak ada|Penuh|**Parsial (terbatas)**|
|**Perspektif Pengujian**|Pengguna akhir|Pengembang|**Keduanya**|
|**Sumber Test Case**|Input/output spec|Struktur kode|**Spec + internal logic**|
|**Contoh pada**<br>**Laporan Ini**|Performance,<br>Endurance Test|Data Flow Test|**Regression Testing**|
|**Kekuatan Utama**|Realistik, user-centric|Deteksi defect internal|**Menyeluruh —**<br>**coverage luas**|



## **1.4 Posisi Regression Testing dalam Siklus Pengujian SayurSehat** 

Regression Testing adalah tahap terakhir dan paling integratif dalam siklus pengujian proyek ini. Laporan ini diposisikan sebagai penutup setelah semua pengujian lain selesai: 

|||||
|---|---|---|---|
|**Urutan**|**Jenis Test**|**Metode**|**Peran dalam Regression**|
|||||
|**1**|**Black Box**|Performance Test|Baseline respons endpoint checkout saat load<br>tinggi|
|||||
|**2**|**Black Box**|Endurance Test|Baseline stabilitas checkout selama 40 menit|
|||||
|**3**|**Black Box**|Sample / BVA /<br>Class Partitioning|Baseline perilaku input checkout|
|||||
|**4**|**White Box**|Basic Path Test|Baseline jalur logika dan cyclomatic complexity|
|||||
|**5**|**White Box**|Data Flow Test|Baseline aliran data cart-order-payment|
|||||
|**6**|**White Box**|Loop Testing|Baseline perilaku loop cart dan batch order|
|||||
|**7**|**Grey Box**|Regression Testing<br>(ini)|Memverifikasi semua baseline di atas tidak<br>rusak|



## **2. DASAR TEORI** 

## **2.1 Regression Testing** 

Regression Testing adalah pengujian ulang terhadap fitur yang sudah pernah diuji untuk memastikan perubahan baru tidak merusak perilaku yang sudah berjalan dengan benar sebelumnya. Dalam konteks grey box, regression testing tidak hanya mengamati output dari luar seperti black box, tetapi juga menjalankan ulang test yang berhubungan dengan struktur internal kode. 

Regression biasanya dipicu oleh: penambahan fitur baru, refactoring kode, perubahan dependency, pembaruan konfigurasi, atau perubahan environment deployment. Tanpa regression testing, setiap perubahan berisiko merusak fitur yang sebelumnya sudah stabil. 

## **2.2 Risiko Regression pada Modul Checkout ACID** 

Checkout ACID adalah modul kritis dalam SayurSehat. Perubahan kecil di mana pun dalam stack dapat menyebabkan: 

- Checkout sukses berubah menjadi gagal tanpa sebab yang jelas. 

- Cart kosong tidak lagi ditolak — order kosong masuk ke database. 

- Stok tidak dikurangi dengan benar — stok ghost terjadi. 

- Order dibuat tanpa order item — data tidak lengkap. 

- Payment token tidak tersimpan — user tidak dapat membayar. 

- Error bisnis (400/404) berubah menjadi 500 Internal Server Error. 

- Race condition muncul kembali karena SELECT FOR UPDATE hilang dari repository. 

## **2.3 Alasan Pemilihan Regression Testing pada Proyek Ini** 

Proyek SayurSehat telah mengalami beberapa perubahan penting yang menjadi pemicu regression testing: 

|||
|---|---|
|**Perubahan**|**Risiko Regression yang Ditimbulkan**|
|||
|**Penambahan test Checkout ACID**<br>**(Black Box)**|Test baru harus tetap lulus bersama test lama yang sudah ada|
|||
|**Penambahan White Box test (Data**<br>**Flow + Loop)**|Mock/interface baru tidak boleh merusak kompatibilitas<br>package|
|||
|**Penambahan CI GitHub Actions**|Build dan test harus reproducible di lingkungan cloud GitHub|
|||
|**Perubahan deployment production**|Endpoint live harus tetap stabil setelah konfigurasi baru|
|||
|**Perbaikan Swagger docs di CI**<br>**pipeline**|Build backend tidak boleh gagal karena package docs baru|
|||
|**Perubahan frontend API URL**|Frontend React tetap harus bisa dibuild dengan konfigurasi<br>baru|



## **2.4 Strategi Regression Testing (Grey Box)** 

Regression testing pada proyek ini menggunakan kombinasi empat lapisan: 

|**No**|**Suite**|**Command**|**Tujuan**|
|---|---|---|---|
|||||
|**1**|**Backend Full**<br>**Regression**|_go test ./..._|Seluruh package Go<br>tetap lulus|
|||||
|**2**|**Checkout**<br>**Focused**<br>**Regression**|_go test ... -run_<br>_'TestCheckout|TestDataFlow|TestLoopTesting'_<br>_-v_|Skenario checkout ACID<br>inti tidak regression|



|**3**|**Frontend Build**<br>**Regression**|_npm run build_|Frontend React tetap bisa<br>dibuild untuk production|
|---|---|---|---|
|||||
|**4**|**CI Quality Gate**|_Push ke branch main_|Test dan build berjalan<br>otomatis di GitHub<br>Actions|



## **3. RUANG LINGKUP PENGUJIAN** 

|**ID**|**Area Regression**|**Dicakup**|**Keterangan**|
|---|---|---|---|
|||||
|**RG-**<br>**S01**|**Checkout usecase (unit**<br>**test)**|**Ya**|Cart kosong, transaction error, Midtrans fallback,<br>checkout sukses|
|||||
|**RG-**<br>**S02**|**Data flow checkout**<br>**(white box test)**|**Ya**|Cart item ke order dan payment token — DF-<br>CHK-01 s/d DF-CHK-08|
|||||
|**RG-**<br>**S03**|**Loop checkout (loop**<br>**test)**|**Ya**|Cart 0 item, 1 item, 3 item, dan batch supplier<br>order|
|||||
|**RG-**<br>**S04**|**Seluruh package**<br>**backend Go**|**Ya**|go test ./... mencakup http, middleware,<br>repository, usecase|
|||||
|**RG-**<br>**S05**|**Frontend React build**|**Ya**|npm run build — memastikan React tidak gagal<br>production build|
|||||
|**RG-**<br>**S06**|**CI otomatis (GitHub**<br>**Actions)**|**Ya**|Workflow success pada commit 22ed766|
|||||
|**RG-**<br>**S07**|**K6 live endpoint**<br>**(performance/endurance)**|**Tidak**|Tidak dijalankan ulang untuk menghindari<br>pengurangan stok production|



## **4. TARGET SOURCE CODE REGRESSION** 

Berikut adalah file dan fungsi yang menjadi target regression test, beserta risiko yang ada jika terjadi perubahan tidak terkontrol: 

|||||
|---|---|---|---|
|**No**|**File**|**Fungsi / Bagian**|**Risiko Regression**|
|||||
|**1**|_order_handler.go_|_OrderHandler.Checkout_|Auth/session berubah,<br>response HTTP salah format|
|||||
|**2**|_order_handler.go_|_classifyCheckoutError_|Error bisnis (4xx) salah<br>dipetakan menjadi 500|
|||||
|**3**|_order_usecase.go_|_Checkout_|Cart kosong, transaction, dan<br>Midtrans fallback berubah<br>perilaku|
|||||
|**4**|_order_repository.go_|_CheckoutTransaction_|Atomicity, pengurangan stok,<br>order item, delete cart<br>terganggu|
|||||
|**5**|_order_whitebox_additional_test.go_|_TestDataFlow,_<br>_TestLoopTesting_|Test tambahan tidak<br>kompatibel dengan interface<br>usecase/repo|
|||||
|**6**|_.github/workflows/ci.yml_|_CI test & build jobs_|Generate Swagger docs atau<br>build gagal di cloud|



## **5. MATRIKS REGRESSION TEST CASE** 

Tabel berikut mendokumentasikan 12 test case dalam regression suite, mencakup area, skenario, expected result, referensi bukti, dan status akhir. 

||||||
|---|---|---|---|---|
|**ID**|**Area**|**Skenario Regression**|**Expected Result**|**Status**|
||||||
|**RG-**<br>**CHK-**<br>**01**|**Usecase**|Cart repository error —<br>FindByUserID gagal|Return error, proses<br>checkout berhenti, tidak<br>ada order dibuat|**PASS**|
||||||
|**RG-**<br>**CHK-**<br>**02**|**Usecase**|Cart kosong — 0 item di<br>keranjang|Return error cart kosong,<br>tidak masuk ke<br>CheckoutTransaction|**PASS**|
||||||
|**RG-**<br>**CHK-**<br>**03**|**Usecase**|Transaction repository<br>gagal (stok kurang)|Checkout gagal dengan<br>pesan valid — bukan<br>success palsu|**PASS**|
||||||
|**RG-**<br>**CHK-**<br>**04**|**Usecase**|Checkout sukses — cart<br>valid, stok cukup|Order berstatus PENDING<br>dibuat dan dikembalikan|**PASS**|
||||||
|**RG-**<br>**CHK-**<br>**05**|**Usecase**|Midtrans Snap Token<br>gagal (snapErr != nil)|Order tetap dikembalikan,<br>payment_token nil|**PASS**|
||||||
|**RG-**<br>**CHK-**<br>**06**|**Usecase**|Snap response nil<br>(snapResp == nil)|Order tetap dikembalikan<br>tanpa modifikasi token|**PASS**|
||||||
|**RG-**<br>**CHK-**<br>**07**|**Data Flow**|Cart item dan VariantID<br>mengalir ke token|Order ID dan total<br>mengalir ke Snap; token &<br>URL tersimpan|**PASS**|
||||||
|**RG-**<br>**CHK-**<br>**08**|**Loop**|Cart dengan 0 / 1 / 3 item<br>— loop behaviour|Loop memproses sesuai<br>jumlah item, tidak ada item<br>hilang|**PASS**|
||||||
|**RG-**<br>**CHK-**<br>**09**|**Loop**|Batch supplier order<br>campuran valid/invalid|Hanya order valid<br>diproses; invalid tidak<br>memengaruhi yang lain|**PASS**|
||||||
|**RG-**<br>**CHK-**<br>**10**|**Package**|Seluruh package Go —<br>go test ./...|Semua package yang<br>memiliki test file berhasil<br>lulus|**PASS**|
||||||
|**RG-**<br>**CHK-**<br>**11**|**Frontend**|Build React production —<br>npm run build|Build sukses, dist/<br>dihasilkan, tanpa error<br>kompilasi|**PASS**|
||||||
|**RG-**<br>**CHK-**<br>**12**|**CI**|GitHub Actions — push<br>ke main|Workflow success —<br>backend Go test & build +<br>frontend build|**PASS**|



## **6. EKSEKUSI REGRESSION TESTING** 

## **6.1 Backend Full Regression — go test ./...** 

Pengujian ini menjalankan seluruh test suite backend Go secara serentak untuk memastikan tidak ada package yang rusak akibat perubahan apapun. 

## **Command** 

```
$ cd backend-go
```

```
$ go test ./...
```

## **Output** 

```
?   github.com/nuryanfa/e-commerse-sqa/cmd/api        [no test files]
?   github.com/nuryanfa/e-commerse-sqa/cmd/loadtest   [no test files]
?   github.com/nuryanfa/e-commerse-sqa/cmd/reset      [no test files]
```

```
?   github.com/nuryanfa/e-commerse-sqa/cmd/seed       [no test files]
```

```
?   github.com/nuryanfa/e-commerse-sqa/config         [no test files]
?   github.com/nuryanfa/e-commerse-sqa/docs           [no test files]
ok  github.com/nuryanfa/e-commerse-sqa/internal/delivery/http
ok  github.com/nuryanfa/e-commerse-sqa/internal/middleware
ok  github.com/nuryanfa/e-commerse-sqa/internal/repository
ok  github.com/nuryanfa/e-commerse-sqa/internal/usecase
?   github.com/nuryanfa/e-commerse-sqa/pkg/jwt        [no test files]
```

```
?   github.com/nuryanfa/e-commerse-sqa/pkg/password   [no test files]
```

```
?   github.com/nuryanfa/e-commerse-sqa/pkg/response   [no test files]
PASS
```

|**Package**|**Hasil**|**Status**|
|---|---|---|
||||
|_internal/delivery/http_|ok — handler checkout dan route regression lulus|**PASS**|
||||
|_internal/middleware_|ok — auth middleware tidak mengalami regression|**PASS**|
||||
|_internal/repository_|ok — repository checkout transaction tidak<br>regression|**PASS**|
||||
|_internal/usecase_|ok — seluruh checkout usecase test lulus|**PASS**|



## **6.2 Checkout Focused Regression** 

Pengujian ini menjalankan hanya test case yang berkaitan langsung dengan modul Checkout ACID, Data Flow, dan Loop Testing — tiga pilar utama pengujian White Box SayurSehat. 

## **Command** 

```
$ cd backend-go
$ go test ./internal/usecase -run "TestCheckout|TestDataFlow|TestLoopTesting" -
v
```

**Output** 

```
=== RUN   TestCheckout_CartRepoError
--- PASS: TestCheckout_CartRepoError (0.00s)
=== RUN   TestCheckout_EmptyCart
--- PASS: TestCheckout_EmptyCart (0.00s)
=== RUN   TestCheckout_TransactionFails_StokKurang
--- PASS: TestCheckout_TransactionFails_StokKurang (0.00s)
=== RUN   TestCheckout_Success
--- PASS: TestCheckout_Success (0.00s)
=== RUN   TestCheckout_MidtransFails_OrderTetapKembali
--- PASS: TestCheckout_MidtransFails_OrderTetapKembali (0.00s)
=== RUN   TestCheckout_SnapRespNil_OrderTetapKembali
--- PASS: TestCheckout_SnapRespNil_OrderTetapKembali (0.00s)
=== RUN   TestDataFlow_CheckoutCartToOrderAndPaymentToken
--- PASS: TestDataFlow_CheckoutCartToOrderAndPaymentToken (0.00s)
=== RUN   TestLoopTesting_CheckoutCartItemCounts
--- PASS: TestLoopTesting_CheckoutCartItemCounts (0.00s)
=== RUN   TestLoopTesting_BatchProcessSupplierOrders
--- PASS: TestLoopTesting_BatchProcessSupplierOrders (0.00s)
=== RUN   TestLoopTesting_BatchProcessSupplierOrders_NoValidOrder
--- PASS: TestLoopTesting_BatchProcessSupplierOrders_NoValidOrder (0.00s)
PASS
ok   github.com/nuryanfa/e-commerse-sqa/internal/usecase
```

|||||
|---|---|---|---|
|**No**|**Nama Test Function**|**Area**|**Status**|
|||||
|**1**|_TestCheckout_CartRepoError_|Usecase — Error<br>Handling|**PASS**|
|||||
|**2**|_TestCheckout_EmptyCart_|Usecase —<br>Validasi Cart|**PASS**|
|||||
|**3**|_TestCheckout_TransactionFails_StokKurang_|Usecase —<br>Transaction Error|**PASS**|
|||||
|**4**|_TestCheckout_Success_|Usecase — Happy<br>Path|**PASS**|
|||||
|**5**|_TestCheckout_MidtransFails_OrderTetapKembali_|Usecase —<br>Midtrans Fallback|**PASS**|
|||||
|**6**|_TestCheckout_SnapRespNil_OrderTetapKembali_|Usecase — Snap<br>Response Nil|**PASS**|
|||||
|**7**|_TestDataFlow_CheckoutCartToOrderAndPaymentToken_|White Box Data<br>Flow|**PASS**|
|||||
|**8**|_TestLoopTesting_CheckoutCartItemCounts_|White Box Loop<br>Testing|**PASS**|
|||||
|**9**|_TestLoopTesting_BatchProcessSupplierOrders_|White Box Loop<br>Testing|**PASS**|
|||||
|**10**|_TestLoopTesting_BatchProcessSupplierOrders_NoValidOrder_|White Box Loop<br>Testing|**PASS**|



## **6.3 Frontend Build Regression — npm run build** 

Pengujian ini memastikan aplikasi frontend React tidak mengalami regression akibat perubahan konfigurasi API URL atau dependency. 

## **Command** 

```
$ cd frontend-react
$ npm run build
```

## **Output** 

```
vite v7.3.1 building client environment for production...
2870 modules transformed.
dist/index.html
dist/assets/index-BPJe8Tst.css
dist/assets/index-CpOcJdo6.js
built in 7.21s
WARNING: Some chunks are larger than 500 kB after minification.
(Bundle size warning — bukan error regression)
```

||||
|---|---|---|
|**Artefak**|**Keterangan**|**Status**|
||||
|_dist/index.html_|Entry point HTML berhasil dihasilkan|**PASS**|
||||
|_dist/assets/index-_<br>_BPJe8Tst.css_|CSS production berhasil di-bundle|**PASS**|
||||
|_dist/assets/index-_<br>_CpOcJdo6.js_|JavaScript production berhasil di-bundle (2870 modules)|**PASS**|
||||
|_Build duration_|7.21 detik — wajar untuk 2870 modules|**PASS**|
||||
|_Bundle size warning_|Beberapa chunk > 500 kB setelah minifikasi — ini<br>WARNING, bukan ERROR. Build tetap sukses dan tidak<br>termasuk regression failure.|**Minor**|



## **6.4 CI Quality Gate — GitHub Actions** 

GitHub Actions menjadi quality gate otomatis yang berjalan pada setiap push ke repository. Ini memastikan regression terdeteksi sedini mungkin, bahkan sebelum code review. 

||||||
|---|---|---|---|---|
|**Commit**|**Status**|**Durasi**|**Job**|**Keterangan**|
||||||
|**_22ed766_**|**Success**|1 menit 40<br>detik|Backend Go Test +<br>Build Frontend<br>React Build|Semua job passed<br>— tidak ada failure|



_File CI yang digunakan: .github/workflows/ci.yml_ 

## **7. ANALISIS HASIL REGRESSION** 

## **7.1 Backend Full Regression** 

Seluruh 4 package backend yang memiliki test file berhasil lulus. Package tanpa test file (cmd/*, config, docs, pkg/*) dikecualikan dengan notasi [no test files] yang merupakan perilaku normal dari Go test runner — bukan indikasi masalah. 

Keberhasilan ini membuktikan bahwa: penambahan test checkout ACID, penambahan White Box test (Data Flow + Loop), perbaikan Swagger CI, dan perubahan konfigurasi deployment tidak menyebabkan breaking change pada package manapun. 

## **7.2 Checkout Focused Regression** 

Seluruh 10 test function yang berhubungan dengan Checkout ACID berhasil lulus dengan durasi 0.00s per test — menandakan semua menggunakan mock tanpa I/O nyata, sehingga deterministik dan tidak bergantung pada state eksternal. 

Cakupan 10 test ini mencakup semua jalur kritis: error handling, validasi input, happy path, dan dua jenis fallback Midtrans. Tidak ada satu pun yang mengalami regression. 

## **7.3 Frontend Build Regression** 

Build React berhasil menghasilkan seluruh artefak production (HTML, CSS, JS). Warning bundle > 500 kB adalah peringatan ukuran yang tidak berdampak pada fungsionalitas aplikasi dan merupakan masalah optimasi, bukan regression functional. 

## **7.4 CI Quality Gate** 

GitHub Actions berhasil menjalankan backend Go test & build serta frontend React build dalam satu workflow berdurasi 1 menit 40 detik. Ini membuktikan pipeline CI berfungsi sebagai quality gate yang andal — setiap push berikutnya akan melewati gate yang sama secara otomatis. 

## **7.5 Ringkasan Kuantitatif Regression** 

|||||
|---|---|---|---|
|**Suite Regression**|**Total Test**|**Lulus**|**Status**|
|||||
|**Backend full — go test ./...**|4 package|**4 package**|**PASS**|
|||||
|**Checkout focused — usecase test**|10 test function|**10 test function**|**PASS**|
|||||
|**Frontend build — npm run build**|1 build|**1 build**|**PASS**|
|||||
|**CI GitHub Actions — workflow**|1 workflow|**1 workflow**|**PASS**|



## **8. HUBUNGAN DENGAN BLACK BOX DAN WHITE BOX TESTING** 

Regression Testing dalam laporan ini bertindak sebagai jaring pengaman (safety net) yang memverifikasi bahwa semua baseline yang telah dibangun oleh pengujian Black Box dan White Box sebelumnya tetap berlaku. 

|||
|---|---|
|**Sumber Bukti Pengujian**|**Peran dalam Regression Testing**|
|||
|**Black Box — Sample**<br>**Testing**|Menjadi baseline perilaku endpoint checkout dari perspektif pengguna<br>akhir (input/output)|
|||
|**Black Box — Performance**<br>**Testing**|Menjadi baseline kemampuan respons checkout saat beban 10 VU<br>selama 4 menit|
|||
|**Black Box — Endurance**<br>**Testing**|Menjadi baseline stabilitas checkout selama 40 menit<br>berkesinambungan|
|||
|**White Box — Basic Path**<br>**Testing**|Menjadi baseline jalur logika dan cyclomatic complexity modul<br>checkout|
|||
|**White Box — Data Flow**<br>**Testing**|Menjadi baseline kebenaran aliran data cart → order → payment token|
|||
|**White Box — Loop Testing**|Menjadi baseline perilaku loop cart item dan batch processing supplier<br>order|
|||
|**CI GitHub Actions**|Menjalankan regression gate otomatis pada setiap push —<br>memperpanjang coverage regression ke depan|



## **9. ANALISIS ACID REGRESSION** 

Setiap prinsip ACID dianalisis dari perspektif risiko regression — apakah ada indikasi bahwa perubahan kode merusak jaminan ACID yang sebelumnya telah diverifikasi: 

||||
|---|---|---|
|**Prinsip**<br>**ACID**|**Risiko Regression**|**Bukti Tidak Terjadi Regression**|
||||
|**Atomicity**|Transaksi parsial muncul<br>setelah perubahan kode<br>repository|TestCheckout_Success dan<br>TestCheckout_TransactionFails lulus — membuktikan<br>transaksi masih atomic. go test ./... juga lulus untuk<br>package repository.|
||||
|**Consistency**|Cart, stok, dan order<br>tidak konsisten setelah<br>perubahan usecase|TestCheckout_TransactionFails_StokKurang PASS —<br>validasi stok masih aktif. TestCheckout_Success PASS —<br>order hanya dibuat jika semua data konsisten.|
||||
|**Isolation**|Locking SELECT FOR<br>UPDATE hilang setelah<br>refactoring repository|Source code masih menggunakan clause.Locking<br>Strength=UPDATE. Endurance test sebelumnya (40 menit,<br>3 VU) tidak menunjukkan race condition.|
||||
|**Durability**|Order tidak tersimpan<br>setelah checkout akibat<br>perubahan konfigurasi<br>DB|TestCheckout_Success PASS — order dikembalikan<br>dengan benar. SavePaymentToken dipanggil dan<br>diverifikasi dalam TestDataFlow.|



## **10. TEMUAN** 

||||||
|---|---|---|---|---|
|**ID**|**Temuan**|**Dampak**|**Rekomendasi**|**Kategori**|
||||||
|**RG-**<br>**F01**|Backend full<br>regression lulus —<br>seluruh 4 package Go<br>berhasil|Tidak ada breaking<br>change pada package<br>backend setelah<br>perubahan kode dan<br>CI|Pertahankan go<br>test ./... sebagai<br>mandatory step di CI<br>pipeline|**Positif**|
||||||
|**RG-**<br>**F02**|Checkout focused<br>regression lulus — 10<br>test function PASS|Seluruh skenario kritis<br>checkout tetap<br>berperilaku sesuai<br>spesifikasi|Jalankan suite ini<br>sebelum setiap<br>deployment ke<br>production<br>environment|**Positif**|
||||||
|**RG-**<br>**F03**|Frontend build lulus<br>dengan warning<br>bundle size > 500 kB|Build sukses dan<br>aplikasi dapat<br>dideploy — tidak ada<br>functional regression|Pertimbangkan code<br>splitting (React.lazy +<br>dynamic import) di<br>sprint berikutnya<br>untuk optimasi<br>performa|**Minor**|
||||||
|**RG-**<br>**F04**|CI GitHub Actions<br>berhasil berjalan —<br>commit 22ed766<br>success|Quality gate otomatis<br>aktif — regression<br>akan terdeteksi pada<br>setiap push|Jadikan CI success<br>sebagai requirement<br>wajib sebelum merge<br>pull request ke main|**Positif**|
||||||
|**RG-**<br>**F05**|K6 live endpoint tidak<br>dijalankan ulang dalam<br>regression ini|Tidak ada risiko<br>langsung — K6 tidak<br>berjalan pada test<br>suite ini|Siapkan product<br>khusus staging/test<br>dengan stok dummy<br>agar K6 live bisa<br>dimasukkan ke<br>regression berkala|**Disengaja**|



## **11. KESIMPULAN** 

## **11.1 Ringkasan Hasil** 

KEPUTUSAN PENGUJIAN: LULUS (PASS) — Grey Box Regression Testing pada modul Checkout ACID dinyatakan LULUS. Seluruh 12 regression test case berhasil dieksekusi tanpa satu pun kegagalan. Pengujian Grey Box dengan metode Regression Testing membuktikan bahwa: 

6. Seluruh package backend Go tetap lulus go test ./... setelah seluruh perubahan kode, test baru, dan konfigurasi CI. 

7. 10 test function Checkout ACID (termasuk Data Flow dan Loop Testing) tetap PASS — tidak ada regression pada skenario kritis checkout. 

8. Frontend React berhasil dibuild untuk production — perubahan konfigurasi API URL tidak menyebabkan build failure. 

9. CI GitHub Actions berjalan sukses pada commit 22ed766 — quality gate otomatis aktif dan andal. 

10. Prinsip ACID (Atomicity, Consistency, Isolation, Durability) tetap terjaga berdasarkan bukti test dan source code yang ada. 

11. Tidak ditemukan regression pada jalur utama Checkout ACID — fitur tetap stabil dan layak dijadikan baseline untuk pengujian berikutnya. 

## **11.2 Perbandingan Lintas Seluruh Laporan Pengujian** 

|||||||
|---|---|---|---|---|---|
|**Laporan**|**Jenis**|**Metode**|**Hasil**|**Defect**|**Status**|
|||||||
|**Performance**<br>**Test**|Black Box|Performance|**4/4 threshold**<br>**PASS**|Tidak ada|**PASS**|
|||||||
|**Endurance**<br>**Test**|Black Box|Endurance|**4/4 threshold**<br>**PASS**|Tidak ada|**PASS**|
|||||||
|**Data Flow**<br>**Test**|White Box|Data Flow|**8/8 TC PASS**|Tidak ada|**PASS**|
|||||||
|**Regression**<br>**Test**|Grey Box|Regression|**12/12 TC PASS**|Tidak ada|**PASS**|



## **11.3 Rekomendasi Tindak Lanjut** 

12. Jadikan go test ./... dan npm run build sebagai mandatory CI check — tidak boleh ada merge ke main tanpa keduanya lulus. 

13. Tambahkan test case regression untuk endpoint lain (cart management, product stock update) setelah fitur tersebut stabil. 

14. Siapkan staging environment dengan data test terpisah agar K6 live dapat dimasukkan ke regression suite berkala tanpa risiko merusak data production. 

15. Implementasikan code splitting di frontend untuk mengatasi warning bundle size > 500 kB — optimasi performa tanpa mengubah fungsionalitas. 

16. Pertimbangkan automated regression report yang di-generate dari CI output untuk audit trail yang lebih lengkap. 

