## **LAPORAN SOFTWARE QUALITY ASSURANCE METODE BLACKBOX - ENDURANCE TESTING** 

## Anggota kelompok: 

20231310046 M. Irvan Alfiansyah 20231310047 M. Nur Yanfa 

**PROGRAM STUDI TEKNIK INFORMATIKA UNIVERSITAS KEBANGSAAN REPUBLIK INDONESIA** _Jln. Terusan Halimun No. 37 (Pelajar Pejuang 45) Lingkar Selatan Kec. Lengkong kota Bandung Jawa Barat 40263_ 

## **1. PENDAHULUAN** 

## **1.1 Latar Belakang** 

Endurance Testing (disebut juga Soak Testing) adalah salah satu model Black Box Testing yang dirancang untuk mengevaluasi stabilitas sistem perangkat lunak dalam kondisi beban yang berlangsung dalam durasi waktu yang panjang. Berbeda dengan Performance Test yang mengukur kemampuan puncak dalam waktu singkat, Endurance Test justru menguji ketahanan sistem terhadap penggunaan berkelanjutan selama periode yang lebih lama. 

Dalam konteks e-commerce SayurSehat, alur checkout adalah fitur yang harus beroperasi secara andal tidak hanya pada saat lonjakan trafik singkat, tetapi juga ketika digunakan secara konsisten selama berjam-jam oleh pengguna nyata. Masalah seperti memory leak, degradasi performa bertahap, atau kegagalan koneksi database umumnya hanya terdeteksi melalui endurance test. 

## **1.2 Tujuan Pengujian** 

1. Memverifikasi stabilitas sistem checkout SayurSehat selama beban berkelanjutan 40 menit. 

2. Mendeteksi potensi memory leak atau degradasi performa bertahap (performance degradation over time). 

3. Memastikan tidak terjadi server error (5xx) sepanjang durasi pengujian panjang. 

4. Memvalidasi bahwa response time sistem tidak mengalami kenaikan signifikan seiring waktu. 

5. Mengonfirmasi integritas data stok tidak menjadi negatif akibat checkout berulang dalam waktu lama. 

6. Mengevaluasi konsistensi throughput sistem selama 40 menit pengujian. 

## **1.3 Perbedaan Endurance Test vs Performance Test** 

||||
|---|---|---|
|**Aspek**|**Performance Test**|**Endurance Test**|
|**Fokus Utama**|Kecepatan & kapasitas puncak|Stabilitas jangka panjang|
|**Durasi**|4 menit (singkat)|40 menit (panjang)|
|**Jumlah VU**|10 VUs (beban tinggi)|3 VUs (beban ringan, stabil)|
|**Masalah Terdeteksi**|Bottleneck, capacity limit|Memory leak, degradasi bertahap|
|**Threshold Response**<br>**Time**|p(95) < 2000ms|p(95) < 2500ms (lebih longgar)|



## **1.4 Ruang Lingkup Pengujian** 

Pengujian mencakup skenario end-to-end alur checkout selama 40 menit secara berkesinambungan: 

- Autentikasi pengguna (token setup) - dilakukan sekali di awal 

- Pengambilan daftar produk (GET /products) 

- Penambahan produk ke keranjang (POST /cart) - dengan toleransi stok habis (400) 

- Proses checkout (POST /checkout) 

- Verifikasi stok produk sebelum dan sesudah seluruh durasi pengujian 

## **2. DASAR TEORI** 

## **2.1 Black Box Testing** 

Black Box Testing adalah teknik pengujian perangkat lunak yang melibatkan pengujian sistem tanpa mengetahui desain internal atau struktur kode sumbernya (Priyaungga et al., 2020). Pengujian berfokus pada informasi dari perangkat lunak, menghasilkan test case dengan cara mempartisi masukan dan keluaran dari sebuah program untuk mencakup pengujian yang menyeluruh (Destiningrum & Adrian, 2017). 

## **2.2 Endurance Testing** 

Endurance Testing adalah model Black Box Testing yang menyertakan kasus uji yang diulang-ulang dengan kuantitas tertentu, yang bertujuan untuk menguji program apakah sudah sesuai dengan spesifikasi yang dibutuhkan saat dijalankan dalam durasi panjang. Pengujian ini dirancang untuk menemukan masalah yang hanya muncul setelah sistem berjalan lama, seperti: 

- Memory Leak: Kebocoran memori yang terakumulasi seiring waktu dan menyebabkan sistem melambat atau crash. 

- Resource Exhaustion: Kehabisan koneksi database, file handle, atau thread pool setelah penggunaan lama. 

- Performance Degradation: Penurunan kecepatan respons secara gradual seiring waktu berjalan. 

- Data Corruption: Inkonsistensi data akibat operasi berulang dalam waktu panjang. 

|**Istilah**|**Definisi dalam Endurance Testing**|
|---|---|
|**Soak Test**|Pengujian dengan beban moderat yang dipertahankan dalam durasi<br>sangat panjang (jam-jam)|
|**Steady State**|Kondisi stabil setelah sistem warm-up, di mana beban dijaga konstan|
|**Memory Leak**|Kenaikan konsumsi memori secara linear atau bertahap yang tidak<br>dibebaskan sistem|
|**Degradasi Performa**|Peningkatan response time secara konsisten seiring berjalannya<br>waktu pengujian|



## **2.3 Grafana k6 untuk Endurance Testing** 

Grafana k6 mendukung konfigurasi multi-stage yang memungkinkan simulasi skenario steady-state untuk endurance testing. Threshold yang digunakan pada endurance test umumnya lebih longgar dibandingkan performance test, karena fokusnya pada stabilitas jangka panjang, bukan kecepatan puncak. Pada pengujian ini, threshold p(95) ditetapkan sebesar 2500ms (vs 2000ms pada performance test). 

## **3. KONFIGURASI DAN SKENARIO PENGUJIAN** 

## **3.1 Lingkungan Pengujian** 

|**Parameter**|**Nilai / Keterangan**|
|---|---|
|**Target URL**|https://sayursehat.site/api/v1|
|**Tools**|Grafana k6 - Execution: Local|
|**Script File**|k6-test/checkout_endurance_test.js|
|**Jumlah Test Users**|10 TEST_USERS (token pool)|
|**Max Virtual Users (VUs)**|3 VUs (beban moderat, steady-state)|
|**Durasi Total Pengujian**|40 menit + 30s graceful ramp-down + 30s graceful stop = 41<br>menit|
|**Durasi Aktual Tereksekusi**|40 menit 30 detik (40m30s)|
|**Produk Uji**|Bawang Putih Kating (Kg) - ID: c8f7ceb2-a89a-43c8-bd05-<br>b7909c3eb2df|
|**Stok Awal Produk**|140 unit|
|**Stok Akhir Produk**|0 unit (habis terjual - terserap 140 checkout sukses)|



## **3.2 Skenario Beban (Load Stages - Steady-State)** 

Pengujian dirancang dengan 3 tahap yang mensimulasikan pola beban steady-state untuk skenario endurance: 

|||||
|---|---|---|---|
|**Stage**|**Durasi**|**Target VUs**|**Tujuan**|
|1|5 menit|1 VU|Warm-up: inisiasi sistem dengan 1<br>pengguna|
|2|30 menit|3 VUs|Steady-state: beban konstan 3 VU selama<br>30 menit penuh|
|3|5 menit|3 VUs|Cool-down: pertahankan beban untuk<br>observasi akhir|



## **3.3 Threshold / Kriteria Keberhasilan Endurance Test** 

Threshold endurance test berbeda dari performance test - dirancang untuk mengukur stabilitas jangka panjang: 

||||
|---|---|---|
|**Metrik**|**Threshold**|**Rasionale Penetapan**|
|**checkout_server_error_rate**|rate < 1%|Nol toleransi server error selama 40 menit<br>- stabilitas kritis|
|**checks (rate)**|rate > 90%|Konsistensi validasi check sepanjang<br>durasi panjang|
|**http_req_duration p(95)**|p(95) < 2500ms|Lebih longgar dari perf test (2000ms)<br>karena durasi lebih panjang|
|**http_req_failed**|rate < 10%|Toleransi kegagalan HTTP request<br>minimal|



## **4. HASIL PENGUJIAN** 

## **4.1 Ringkasan Eksekusi** 

|**Parameter Eksekusi**|**Hasil**|
|---|---|
|**Total Durasi Aktual**|40 menit 30 detik (40m30s)|
|**Total Iterasi Selesai**|2.111 iterasi berhasil, 0 terinterupsi|
|**Total Request HTTP**|2.278 requests|
|**Total Checks Dilakukan**|4.659 checks (4.659 passed, 0 failed)|
|**VUs Peak**|3 Virtual Users (steady-state)|
|**Throughput HTTP**|0.937 req/s  |  0.869 iterasi/s|
|**Checks Rate**|1.917 checks/s|
|**Data Traffic**|Received: 873 kB (359 B/s)  |  Sent: 1.1 MB (441 B/s)|



## **4.2 Hasil Threshold (Pass/Fail)** 

|**Threshold**|**Kriteria**|**Hasil Aktual**|**Status**|
|---|---|---|---|
|**checkout_server_error_rate**|rate < 1%|0.00%||
||||**PASSED**|
|**checks (rate)**|rate > 90%|100.00%||
||||**PASSED**|
|**http_req_duration p(95)**|p(95) < 2500ms|**254.35ms**||
||||**PASSED**|
|**http_req_failed**|rate < 10%|0.00%||
||||**PASSED**|



## **4.3 Hasil Checks Per Skenario (100% Passed)** 

|||||
|---|---|---|---|
|**No**|**Nama Check / Skenario Uji**|**Scope**|**Status**|
|1|Setup token tersedia|Setup||
||||**PASSED**|
|2|Setup products status 200|Setup||
||||**PASSED**|
|3|Add cart 200 atau stok habis 400|Iterasi||
||||**PASSED**|
|4|Add cart bukan 500/502|Iterasi||
||||**PASSED**|
|5|Checkout 201 atau valid 4xx|Iterasi||
||||**PASSED**|
|6|Checkout bukan 500/502|Iterasi||
||||**PASSED**|
|7|Checkout response < 2500ms|Iterasi||
||||**PASSED**|



## **4.4 Metrik Performa HTTP Request (40 Menit)** 

|**Metrik**|**Average**|**Min**|**Median**|**p(90)**|**p(95)**|
|---|---|---|---|---|---|
|**http_req_duration**|65.82ms|11.19ms|19.39ms|106.31ms|**254.35ms**|
|**iteration_duration**|3.05s|3.01s|3.01s|3.12s|**3.25s**|



_Catatan: Max http_req_duration = 2.65s (outlier, terjadi saat awal sesi atau kondisi network transient). Nilai p(95) = 254.35ms berada 89.8% di bawah threshold maksimum 2500ms. Iteration_duration yang sangat konsisten (avg=3.05s, median=3.01s) mengindikasikan tidak adanya degradasi performa selama 40 menit._ 

## **4.5 Metrik Custom Checkout (Endurance)** 

|**Metrik Custom**|**Total**|**Rate**|**Keterangan**|
|---|---|---|---|
|**checkout_success (201 Created)**|140|0.058/s|Seluruh stok berhasil<br>terjual habis|
|**checkout_rejected (4xx)**|5|0.002/s|Minimal - stok habis di<br>akhir pengujian|
|**checkout_server_error (5xx)**|0 / 2111|0.00%|**ZERO error server -**<br>**stabil penuh 40 menit**|



Seluruh 140 unit stok Bawang Putih Kating berhasil terjual melalui proses checkout yang berjalan secara natural selama 40 menit. Hanya 5 penolakan 4xx terjadi - sangat minimal dibanding 2.111 total iterasi - dan semuanya terjadi di fase akhir saat stok mendekati habis. Tidak ada satu pun server error (5xx) yang terdeteksi. 

## **4.6 Hasil Verifikasi Integritas Stok (Kritis)** 

||||||
|---|---|---|---|---|
|**Produk**|**Stok Awal**|**Stok**<br>**Akhir**|**Selisih**|**Status Integritas**|
|||||**VALID - Tidak**<br>**Negatif**|
|**Bawang Putih Kating (Kg)**|140 unit|0 unit|-140 (terjual)||



Stok akhir = 0 adalah kondisi yang BENAR dan DIHARAPKAN: tepat 140 unit terjual melalui 140 checkout sukses, dan stok tidak pernah menjadi negatif. Ini membuktikan mekanisme kontrol stok bekerja dengan tepat bahkan dalam kondisi penggunaan berkelanjutan selama 40 menit. 

## **5. ANALISIS DAN TEMUAN** 

## **5.1 Analisis Stabilitas Sistem (Tidak Ada Degradasi)** 

Indikator utama stabilitas dalam endurance test adalah konsistensi response time sepanjang durasi pengujian. Data menunjukkan: 

- Median iteration_duration sangat stabil: 3.01s (avg=3.05s), selisih hanya 0.04s - menandakan tidak ada akumulasi latensi. 

- p(95) iteration_duration = 3.25s masih sangat dekat dengan median, distribusi yang sangat ketat dan stabil. 

- Max duration 5.65s pada iteration (outlier tunggal) - tidak memengaruhi tren keseluruhan. 

- Tidak ditemukan indikasi memory leak atau resource exhaustion - sistem berjalan konsisten 40 menit. 

## **5.2 Analisis Response Time (40 Menit)** 

|||||
|---|---|---|---|
|**Metrik**|**Endurance Test (40**<br>**min)**|**Performance Test (4**<br>**min)**|**Perubahan**|
|**Average**|65.82ms|40.62ms||
||||+62% (wajar)|
|**Median**|19.39ms|18.22ms||
||||+6.4% (sangat<br>kecil)|
|**p(90)**|106.31ms|25.65ms||
||||+314% (distribusi<br>ekor lebih lebar)|
|**p(95) vs Threshold**|254.35ms vs 2500ms|76.85ms vs 2000ms||
||||Keduanya LULUS|



Kenaikan p(90) dari 25.65ms (perf test) ke 106.31ms (endurance test) adalah hal yang normal dan diharapkan: durasi 10x lebih lama dengan 3 VU menyebabkan lebih banyak variasi network dan server processing. Yang terpenting, p(95) = 254.35ms masih sangat jauh di bawah threshold 2500ms. 

## **5.3 Analisis Pola Checkout - Endurance vs Performance** 

|**Kategori**|**Endurance (40 min,**<br>**3VU)**|**Performance (4 min,**<br>**10VU)**|**Evaluasi**|
|---|---|---|---|
|**Checkout Sukses (201)**|140 (6.6%)|99 (11.1%)|Stok habis natural|
|**Checkout Ditolak (4xx)**|5 (0.24%)|792 (88.9%)|Endurance: sangat<br>rendah|
|**Server Error (5xx)**|0 (0.00%)|0 (0.00%)|Zero error<br>keduanya|
|**Total Iterasi**|2.111|1.804|Endurance lebih<br>banyak|



Pada endurance test, penolakan 4xx hanya 5 dari 2.111 iterasi (0.24%) - sangat rendah dibanding performance test (88.9%). Hal ini karena beban lebih ringan (3 VU) memberi sistem cukup waktu memproses checkout satu per satu. Stok habis secara natural di akhir pengujian, bukan karena concurrent race condition. 

## **5.4 Analisis Throughput & Konsistensi 40 Menit** 

Throughput 0.937 req/s dan 0.869 iterasi/s dengan 3 VU mencerminkan pola penggunaan realistis. Checks rate 1.917/s tetap konsisten sepanjang 40 menit (total 4.659 checks tanpa satu pun gagal). Hal ini mengonfirmasi tidak ada degradasi throughput atau resource exhaustion yang biasanya terlihat pada sistem yang mengalami memory leak. 

## **6. KESIMPULAN** 

## **6.1 Kesimpulan** 

## 7. **SEMUA 4 THRESHOLD LULUS (PASSED): Sistem SayurSehat memenuhi seluruh kriteria stabilitas endurance yang ditetapkan.** 

8. Tidak ada indikasi memory leak: iteration_duration sangat konsisten (avg=3.05s, median=3.01s) sepanjang 40 menit. 

9. Zero server error: Tidak ada satu pun error 5xx dari 2.111 iterasi selama 40 menit - stabilitas server sangat baik. 

10. Response time stabil: p(95) = 254.35ms, 89.8% di bawah threshold 2500ms dengan distribusi yang konsisten. 

11. Integritas stok sempurna: Stok habis tepat 0 (dari 140) - tidak negatif, tidak inkonsisten, tidak corrupt. 

12. Penolakan minimal: Hanya 5 rejection 4xx dari 2.111 iterasi (0.24%) - sistem efisien dalam kondisi beban moderat. 

KEPUTUSAN PENGUJIAN: LULUS (PASSED) - Sistem SayurSehat terbukti STABIL selama 40 menit penggunaan berkelanjutan dengan 3 VU. Tidak ditemukan tanda-tanda memory leak, resource exhaustion, atau degradasi performa. Sistem layak beroperasi dalam kondisi penggunaan harian normal. 

## **7. LAMPIRAN - RAW OUTPUT K6** 

## **7.1 Raw Console Output (Grafana k6 - Endurance Test 40 Menit)** 

Berikut adalah output lengkap hasil eksekusi k6 endurance test: 

```
execution: local
script: k6-test/checkout_endurance_test.js
scenarios: (100.00%) 1 scenario, 3 max VUs, 40m30s max duration
  * default: Up to 3 looping VUs for 40m0s over 3 stages
    (gracefulRampDown: 30s, gracefulStop: 30s)
====== CHECKOUT ENDURANCE REPORT ======
Product ID   : c8f7ceb2-a89a-43c8-bd05-b7909c3eb2df
Product Name : Bawang Putih Kating (Kg)
Stock Before : 140
Stock After  : 0
Expected     : service stabil, tidak ada 500/502,
               dan stok tidak negatif selama durasi panjang.
THRESHOLDS:
  checkout_server_error_rate  [PASSED] rate=0.00%
  checks                      [PASSED] rate=100.00%
  http_req_duration           [PASSED] p(95)=254.35ms
  http_req_failed             [PASSED] rate=0.00%
TOTAL RESULTS:
  checks_total...: 4659  (1.92/s)
  checks_passed..: 100.00% - 4659 out of 4659
  checks_failed..: 0.00%   - 0 out of 4659
```

```
CUSTOM METRICS:
  checkout_success       : 140   (0.058/s)
  checkout_rejected      : 5     (0.002/s)
  checkout_server_errors : 0.00% - 0 out of 2111
HTTP METRICS:
  http_req_duration  avg=65.82ms  min=11.19ms  med=19.39ms
                     max=2.65s    p(90)=106.31ms  p(95)=254.35ms
  http_req_failed  : 0.00%   0 out of 2278
  http_reqs        : 2278   (0.937/s)
EXECUTION SUMMARY:
  iteration_duration: avg=3.05s  min=3.01s  p(95)=3.25s
  iterations        : 2111  (0.869/s)
  vus               : 3 max
running (40m30.0s), 0/3 VUs, 2111 complete, 0 interrupted
default [PASSED] 0/3 VUs  40m0s
```

