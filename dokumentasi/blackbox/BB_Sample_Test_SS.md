## **LAPORAN SOFTWARE QUALITY ASSURANCE METODE BLACKBOX - SAMPLE TESTING** 

## Anggota kelompok: 

20231310046 M. Irvan Alfiansyah 20231310047 M. Nur Yanfa 

**PROGRAM STUDI TEKNIK INFORMATIKA UNIVERSITAS KEBANGSAAN REPUBLIK INDONESIA** _Jln. Terusan Halimun No. 37 (Pelajar Pejuang 45) Lingkar Selatan Kec. Lengkong kota Bandung Jawa Barat 40263_ 

## **1. PENDAHULUAN** 

Dokumen ini merupakan laporan resmi hasil pengujian blackbox menggunakan metode sample test pada sistem API Sayur Sehat, khususnya modul Checkout. Pengujian dilakukan menggunakan tool k6 Load Testing Framework untuk mensimulasikan berbagai skenario transaksi secara otomatis dan terukur. 

## **1.1 Tujuan Pengujian** 

- Memvalidasi alur checkout end-to-end sesuai business rules yang berlaku. 

- Memastikan sistem mengembalikan respons HTTP yang sesuai untuk setiap skenario. 

- Memverifikasi penanganan edge case: keranjang kosong, quantity tidak valid, overstock, dan akses tanpa otorisasi. 

- Memastikan tidak ada error server fatal (HTTP 500/502) pada semua skenario pengujian. 

## **1.2 Ruang Lingkup** 

Pengujian mencakup 5 (lima) skenario utama pada endpoint checkout dengan metode sample testing menggunakan 1 Virtual User (VU), 1 iterasi, dengan durasi eksekusi maksimal 10 menit. Produk yang digunakan sebagai data uji adalah: 

|||
|---|---|
|**Atribut**|**Nilai**|
|Product ID|dba6f086-be56-4eec-97f2-68819cd5ab54|
|||
|Product Name|Pare Hijau Super (Kg)|
|||
|Stock Setup|30 unit|



## **2. LINGKUNGAN PENGUJIAN** 

## **2.1 Konfigurasi Teknis** 

|||
|---|---|
|**Parameter**|**Konfigurasi**|
|Framework|k6 Load Testing Framework|
|||
|Eksekusi|Local execution|
|||
|Skenario|1 scenario, 1 max VU|
|||
|Iterasi|1 shared iteration|
|||
|Max Duration|10 menit (+ 30s graceful stop)|
|||
|Durasi Aktual|17.0 detik|
|||
|Output|Console stdout (standard)|



## **2.2 Threshold (Ambang Batas) yang Ditetapkan** 

||||
|---|---|---|
|**Metrik**|**Ambang Batas**|**Status**|
|checks rate|rate > 90%|**PASS**|
||||
|http_req_duration p(95)|p(95) < 3000 ms|**PASS**|
||||
|http_req_failed rate|rate < 5%|**PASS**|



## **3. DESAIN TEST CASE** 

Pengujian dirancang menggunakan pendekatan Blackbox dengan 5 (lima) skenario yang mencakup path positif (happy path) maupun path negatif (negative path) untuk memverifikasi business rules sistem checkout. 

||||||
|---|---|---|---|---|
|**Test ID**|**Nama Skenario**|**Deskripsi**|**Input**|**Expected**<br>**Output**|
|**ST-CHK-**<br>**01**|Valid Checkout|Checkout normal dengan<br>produk valid, quantity<br>wajar, dan token sah.|Cart terisi, token<br>valid|HTTP 201<br>Created|
||||||
|**ST-CHK-**<br>**02**|Empty Cart|Checkout dilakukan saat<br>keranjang belanja<br>kosong.|Cart kosong,<br>token valid|HTTP 400 Bad<br>Request|
||||||
|**ST-CHK-**<br>**03**|Invalid Quantity|Add cart dengan quantity<br>0 dan quantity 101 (batas<br>maksimal).|qty=0 dan<br>qty=101|HTTP 400 Bad<br>Request|
||||||
|**ST-CHK-**<br>**04**|Overstock|Checkout dengan<br>quantity melebihi stok<br>tersedia (stok: 30 unit).|qty > stok<br>tersedia|HTTP 400/422<br>(ditolak valid)|
||||||
|**ST-CHK-**<br>**05**|Unauthorized|Checkout tanpa<br>menyertakan token<br>autentikasi dalam<br>request.|Tanpa<br>Authorization<br>header|HTTP 401<br>Unauthorized|



## **4. HASIL EKSEKUSI PENGUJIAN** 

## **4.1 Ringkasan Hasil Checks** 

|||||
|---|---|---|---|
|**No**|**Nama Check**|**Keterangan**|**Hasil**|
|1|register sample-valid-...@sayursehat.id|HTTP 201 atau 409<br>(email duplikat)|**PASS**|
|||||
|2|register sample-empty-...@sayursehat.id|HTTP 201 atau 409<br>(email duplikat)|**PASS**|
|||||
|3|register sample-invalid-...@sayursehat.id|HTTP 201 atau 409<br>(email duplikat)|**PASS**|
|||||
|4|register sample-<br>overstock-...@sayursehat.id|HTTP 201 atau 409<br>(email duplikat)|**PASS**|
|||||
|5|setup produk dapat diakses|Produk ditemukan di<br>katalog|**PASS**|
|||||
|6|ST-CHK-01 add cart berhasil|Produk berhasil<br>ditambahkan ke cart|**PASS**|
|||||
|7|ST-CHK-01 checkout berhasil 201|Transaksi sukses,<br>HTTP 201|**PASS**|
|||||
|8|ST-CHK-01 checkout bukan 500/502|Tidak ada error server<br>fatal|**PASS**|
|||||
|9|ST-CHK-02 keranjang kosong ditolak 400|Empty cart ditolak<br>dengan HTTP 400|**PASS**|
|||||
|10|ST-CHK-02 bukan 500/502|Tidak ada error server<br>fatal|**PASS**|
|||||
|11|ST-CHK-03 quantity 0 ditolak 400|Quantity nol ditolak<br>dengan HTTP 400|**PASS**|
|||||
|12|ST-CHK-03 quantity 101 ditolak 400|Quantity berlebih ditolak<br>dengan HTTP 400|**PASS**|
|||||
|13|ST-CHK-04 add cart overstock<br>ditolak/diterima untuk validasi|Validasi overstock pada<br>level cart atau checkout|**PASS**|
|||||
|14|ST-CHK-04 add cart bukan 500/502|Tidak ada error server<br>fatal|**PASS**|
|||||
|15|ST-CHK-04 checkout overstock ditolak<br>valid|Overstock ditolak<br>sesuai business rule|**PASS**|
|||||
|16|ST-CHK-04 checkout overstock bukan<br>500/502|Tidak ada error server<br>fatal|**PASS**|
|||||
|17|ST-CHK-05 tanpa token ditolak 401|Akses tanpa autentikasi<br>ditolak HTTP 401|**PASS**|



**Total Checks: 17 dari 17 PASSED  |  Tingkat Keberhasilan: 100.00%** 

## **4.2 Detail Hasil per Test Case** 

## **ST-CHK-01: Valid Checkout** 

|**Deskripsi**|Checkout normal dengan produk valid (Pare Hijau Super), quantity<br>wajar, token autentikasi sah.|
|---|---|
|||
|**Precondition**|User terdaftar, produk tersedia di katalog, stok = 30 unit.|
|||
|**Steps**|1. Register user  2. Login dan ambil token  3. Add produk ke cart  4.<br>Eksekusi checkout|
|||
|**Expected**|HTTP 201 Created, transaksi tercatat, bukan 500/502.|
|||
|**Actual**|HTTP 201 Created. Add cart berhasil, checkout berhasil, tidak ada error<br>server.|
|||
|Verdict|**PASS**|



## **ST-CHK-02: Empty Cart Checkout** 

|||
|---|---|
|**Deskripsi**|Checkout dilakukan saat keranjang belanja dalam kondisi kosong.|
|||
|**Precondition**|User terdaftar dan login, cart kosong.|
|||
|**Steps**|1. Register user  2. Login dan ambil token  3. Langsung checkout tanpa<br>add cart|
|||
|**Expected**|HTTP 400 Bad Request, bukan 500/502.|
|||
|**Actual**|HTTP 400 Bad Request. Sistem menolak checkout dengan pesan error<br>yang sesuai.|
|||
|Verdict|**PASS**|



## **ST-CHK-03: Invalid Quantity** 

|||
|---|---|
|**Deskripsi**|Penambahan produk ke cart dengan quantity di luar batas valid (0 dan<br>101).|
|||
|**Precondition**|User terdaftar dan login dengan token sah.|
|||
|**Steps**|1. Add cart qty=0  2. Verifikasi HTTP 400  3. Add cart qty=101  4.<br>Verifikasi HTTP 400|
|||
|**Expected**|HTTP 400 Bad Request untuk kedua skenario quantity invalid.|
|||
|**Actual**|HTTP 400 pada qty=0 dan qty=101. Validasi input berjalan sesuai rule.|
|||
|Verdict|**PASS**|



## **ST-CHK-04: Overstock Checkout** 

|**ST-CHK-04: Overstock**|**Checkout**|
|---|---|
|||
|**Deskripsi**|Checkout dengan quantity melebihi stok yang tersedia (stok awal: 30<br>unit).|
|||
|**Precondition**|User terdaftar, stok produk = 30 unit.|
|||
|**Steps**|1. Add cart qty > 30  2. Verifikasi add cart  3. Eksekusi checkout  4.<br>Verifikasi penolakan|
|||
|**Expected**|Overstock ditolak (HTTP 400/422) di level cart atau checkout, bukan<br>500/502.|
|||
|**Actual**|Overstock ditolak valid. Sistem mempertahankan integritas stok tanpa<br>error fatal.|
|||
|Verdict|**PASS**|



## **ST-CHK-05: Unauthorized Access** 

|||
|---|---|
|**Deskripsi**|Checkout dilakukan tanpa menyertakan token autentikasi (Authorization<br>header).|
|||
|**Precondition**|Request tanpa header Authorization.|
|||
|**Steps**|1. Buat request checkout  2. Kirim tanpa Authorization header  3.<br>Verifikasi respons|
|||
|**Expected**|HTTP 401 Unauthorized.|
|||
|**Actual**|HTTP 401 Unauthorized. Sistem melindungi endpoint dengan<br>mekanisme autentikasi yang tepat.|
|||
|Verdict|**PASS**|



## **5. METRIK PERFORMA** 

## **5.1 Statistik HTTP Request Duration** 

||||
|---|---|---|
|**Metrik**|**Nilai (ms)**|**Keterangan**|
|Average (avg)|936.25 ms|Rata-rata keseluruhan|
||||
|Minimum (min)|8.01 ms|Request tercepat|
||||
|Median (med)|224.87 ms|Nilai tengah distribusi|
||||
|Maximum (max)|2,520 ms|Request terlama|
||||
|Persentil ke-90 (p90)|2,270 ms|90% request di bawah nilai ini|
||||
|Persentil ke-95 (p95)|2,470 ms|**Threshold: < 3000 ms**<br>**(PASS)**|



## **5.2 Statistik Request & Network** 

||||
|---|---|---|
|**Metrik**|**Nilai**|**Keterangan**|
|Total HTTP Requests|17 requests|Seluruh transaksi HTTP|
||||
|Request Rate|~1.0 req/s|0.999954 req/detik|
||||
|Failed Requests|0 (0.00%)|**Tidak ada request gagal**|
||||
|Data Received|31 kB|1.8 kB/s|
||||
|Data Sent|9.0 kB|528 B/s|
||||
|Total Iterations|1 iteration|Durasi: 1.32 detik|



## **6. RINGKASAN EKSEKUTIF** 

||||
|---|---|---|
|**Kategori**|**Nilai**|**Status**|
|Total Test Cases|5 skenario utama|Semua tereksekusi|
||||
|Total Checks|17 checks|**17/17 PASS (100%)**|
||||
|Failed Checks|0 checks|**PASS**|
||||
|Threshold Violations|0 violations|**PASS**|
||||
|Server Errors (5xx)|0 errors|**PASS**|
||||
|Response Time p(95)|2,470 ms|**PASS**|



## **7. ANALISIS & TEMUAN** 

## **7.1 Temuan Positif** 

- Seluruh 17 checks berhasil (100%) tanpa satu pun kegagalan. 

- Tidak ada error HTTP 500/502 pada seluruh skenario — sistem stabil dan aman dari unhandled exception. 

- Business rules checkout terpenuhi: validasi empty cart, invalid quantity, overstock, dan unauthorized access berjalan sesuai spesifikasi. 

- Response time p(95) = 2.47 detik, berada di bawah threshold 3 detik yang ditetapkan. 

- Mekanisme autentikasi (JWT/token) bekerja dengan benar, menolak akses tanpa token dengan HTTP 401. 

## **7.2 Perhatian & Catatan** 

- Response time rata-rata 936 ms dan p90 mencapai 2.27 detik. Perlu pemantauan pada kondisi concurrent user yang tinggi. 

- Skenario ST-CHK-04 (overstock) dirancang fleksibel — validasi dapat dilakukan di layer cart maupun checkout. Disarankan mempertegas lapisan validasi stok pada dokumentasi API. 

- Pengujian saat ini menggunakan 1 VU (Virtual User). Rekomendasi pengujian lanjutan: load test dengan 50-100 VU untuk mengukur performa di kondisi riil. 

## **8. REKOMENDASI** 

1. Load Testing Lanjutan: Jalankan pengujian dengan 50-100 VU simultan untuk mengukur skalabilitas sistem pada beban produksi yang realistis. 

2. Optimasi Response Time: Investigasi penyebab p90 mencapai 2.27 detik — kemungkinan terdapat bottleneck pada query database atau proses validasi stok. 

3. Regression Testing: Jadwalkan eksekusi script ini secara berkala (CI/CD pipeline) untuk mendeteksi regresi secara otomatis setiap deployment. 

4. Perluas Cakupan Uji: Tambahkan skenario untuk proses pembayaran (payment gateway), cancel order, dan notifikasi untuk cakupan yang lebih komprehensif. 

5. Klarifikasi Business Rule Overstock: Dokumentasikan dan standarisasi layer validasi stok (cart vs checkout) untuk konsistensi implementasi. 

## **9. KESIMPULAN** 

Modul Checkout Sayur Sehat **LULUS (PASS)** dalam pengujian blackbox sample method. Semua 17 checks berhasil dengan tingkat keberhasilan 100%, tidak ada error server fatal, dan seluruh threshold performa terpenuhi. Sistem dinilai stabil, aman, dan siap untuk pengujian lanjutan pada skala beban yang lebih tinggi. 

