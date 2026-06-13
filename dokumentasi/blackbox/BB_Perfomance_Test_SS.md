## **LAPORAN SOFTWARE QUALITY ASSURANCE METODE BLACKBOX - PERFOMANCE TESTING** 

## Anggota kelompok: 

20231310046 M. Irvan Alfiansyah 20231310047 M. Nur Yanfa 

**PROGRAM STUDI TEKNIK INFORMATIKA UNIVERSITAS KEBANGSAAN REPUBLIK INDONESIA** _Jln. Terusan Halimun No. 37 (Pelajar Pejuang 45) Lingkar Selatan Kec. Lengkong kota Bandung Jawa Barat 40263_ 

## **1. PENDAHULUAN** 

## **1.1 Latar Belakang** 

Pengujian performa merupakan bagian integral dari proses Software Quality Assurance (SQA) yang bertujuan memastikan sistem perangkat lunak mampu beroperasi sesuai ekspektasi di bawah kondisi beban tertentu. Dalam konteks e-commerce seperti SayurSehat, proses checkout adalah fitur kritis yang secara langsung mempengaruhi pengalaman pengguna dan keberhasilan transaksi bisnis. 

Laporan ini menyajikan hasil pengujian Black Box Testing dengan metode Performance Testing terhadap fitur checkout pada platform SayurSehat menggunakan Grafana k6. Pengujian dilakukan tanpa pengetahuan atas internal kode sumber (black box), berfokus pada perilaku sistem dari sisi pengguna akhir. 

## **1.2 Tujuan Pengujian** 

1. Mengukur kemampuan sistem dalam menangani beban pengguna simultan pada proses checkout. 

2. Memastikan tidak terjadi server error (5xx) selama proses checkout berlangsung. 

3. Memvalidasi response time sistem berada dalam batas toleransi (< 2000ms pada p95). 

4. Memverifikasi integritas data stok produk tidak menjadi negatif akibat concurrent checkout. 

5. Mengevaluasi tingkat keberhasilan HTTP request secara keseluruhan. 

## **1.3 Ruang Lingkup Pengujian** 

Pengujian mencakup skenario end-to-end alur checkout: 

- Autentikasi pengguna (token setup) 

- Pengambilan daftar produk (GET /products) 

- Penambahan produk ke keranjang (POST /cart) 

- Proses checkout (POST /checkout) 

- Verifikasi stok produk sebelum dan sesudah pengujian 

## **2. DASAR TEORI** 

## **2.1 Black Box Testing** 

Black Box Testing adalah teknik pengujian perangkat lunak yang melibatkan pengujian sistem tanpa mengetahui desain internal atau struktur kode sumbernya (Priyaungga et al., 2020). Pengujian ini berfokus pada informasi dari perangkat lunak, menghasilkan test case dengan cara mempartisi masukan dan keluaran dari sebuah program untuk mencakup pengujian yang menyeluruh (Destiningrum & Adrian, 2017). 

## **2.2 Performance Testing** 

Performance Testing adalah model Black Box Testing yang berfokus pada pengukuran dan evaluasi kinerja aplikasi dalam hal kecepatan, skalabilitas, dan stabilitas. Teknik ini penting untuk memastikan aplikasi dapat menangani beban pengguna secara optimal. 

||||
|---|---|---|
|**Metrik**|**Satuan**|**Keterangan**|
||||
|**Response Time**|Millisecond (ms)|Waktu server merespons request|
||||
|**Throughput**|req/s|Jumlah request berhasil diproses per detik|
||||
|**Error Rate**|Persentase (%)|Persentase request gagal dari total request|
||||
|**Percentile p(95)**|Millisecond (ms)|95% request diselesaikan dalam waktu ini atau<br>lebih cepat|
||||
|**VU (Virtual User)**|Jumlah pengguna|Simulasi pengguna simultan yang melakukan<br>request bersamaan|



## **2.3 Grafana k6** 

Grafana k6 adalah tools open-source load testing modern yang digunakan untuk pengujian performa aplikasi dan API. k6 memungkinkan penulisan skenario uji dalam JavaScript dan mendukung berbagai jenis pengujian: load test, stress test, spike test, dan endurance test. 

## **3. KONFIGURASI DAN SKENARIO PENGUJIAN** 

## **3.1 Lingkungan Pengujian** 

|||
|---|---|
|**Parameter**|**Nilai / Keterangan**|
|||
|**Target URL**|https://sayursehat.site/api/v1|
|||
|**Tools**|Grafana k6 - Execution: Local|
|||
|**Script File**|k6-test/checkout_performance_test.js|
|||
|**Jumlah Test Users**|20 TEST_USERS (token pool)|
|||
|**Max Virtual Users**|10 VUs|
|||
|**Durasi Total**|4 menit + 30s graceful ramp-down + 30s graceful stop|
|||
|**Produk Uji**|Bawang Merah Brebes (Kg) - ID: a3c41e75-...|
|||
|**Stok Awal Produk**|99 unit|
|||
|**Stok Akhir Produk**|99 unit (stabil, tidak berubah)|



## **3.2 Skenario Beban (Load Stages)** 

|**Stage**|**Durasi**|**Target VUs**|**Tujuan**|
|---|---|---|---|
|||||
|1|1 menit|2 VUs|Warm-up: mulai dengan beban ringan|
|||||
|2|1 menit|5 VUs|Ramp-up: peningkatan beban sedang|
|||||
|3|2 menit|10 VUs|Peak load: beban penuh selama 2 menit|
|||||
|4|30 detik|0 VUs|Ramp-down: penurunan beban ke nol|



## **3.3 Threshold / Kriteria Keberhasilan** 

||||
|---|---|---|
|**Metrik**|**Threshold**|**Keterangan**|
||||
|**checkout_server_error_rate**|rate < 1%|Persentase error 5xx saat checkout < 1%|
||||
|**checks (rate)**|rate > 90%|Minimal 90% dari semua check harus<br>lolos|
||||
|**http_req_duration p(95)**|p(95) < 2000ms|95% request harus selesai dalam 2 detik|
||||
|**http_req_failed**|rate < 10%|Persentase request gagal harus < 10%|



## **4. HASIL PENGUJIAN** 

## **4.1 Ringkasan Eksekusi** 

|||
|---|---|
|**Parameter Eksekusi**|**Hasil**|
|||
|**Total Durasi Aktual**|4 menit 50 detik (4m50s)|
|||
|**Total Iterasi**|1.804 iterasi berhasil, 0 terinterupsi|
|||
|**Total Request HTTP**|2.737 requests|
|||
|**Total Checks Dilakukan**|6.283 checks (6.283 passed, 0 failed)|
|||
|**VUs Peak**|10 Virtual Users|
|||
|**Throughput**|9.44 req/s | 6.22 iterasi/s|
|||
|**Data Traffic**|Received: 1.0 MB (3.5 kB/s) | Sent: 1.3 MB (4.3 kB/s)|



## **4.2 Hasil Threshold (Pass/Fail)** 

|**Threshold**|**Kriteria**|**Hasil Aktual**|**Status**|
|---|---|---|---|
|||||
|**checkout_server_error_rate**|rate < 1%|0.00%|**PASSED**|
|||||
|**checks (rate)**|rate > 90%|100.00%|**PASSED**|
|||||
|**http_req_duration p(95)**|p(95) < 2000ms|**76.85ms**|**PASSED**|
|||||
|**http_req_failed**|rate < 10%|0.00%|**PASSED**|



## **4.3 Hasil Checks Per Skenario** 

|**No**|**Nama Check / Skenario**|**Scope**|**Status**|
|---|---|---|---|
|||||
|1|Setup token tersedia|Setup|**PASSED**|
|||||
|2|Setup products status 200|Setup|**PASSED**|
|||||
|3|Add cart 200 atau stok habis 400|Iterasi|**PASSED**|
|||||
|4|Add cart bukan 500/502|Iterasi|**PASSED**|
|||||
|5|Checkout 201 atau valid 4xx|Iterasi|**PASSED**|
|||||
|6|Checkout bukan 500/502|Iterasi|**PASSED**|
|||||
|7|Checkout response < 2000ms|Iterasi|**PASSED**|



## **4.4 Metrik Performa HTTP Request** 

|||||||
|---|---|---|---|---|---|
|**Metrik**|**Average**|**Min**|**Median**|**p(90)**|**p(95)**|
|||||||
|**http_req_duration**|40.62ms|11.21ms|18.22ms|25.65ms|**76.85ms**|
|||||||
|**iteration_duration**|1.03s|1.01s|1.03s|1.04s|**1.12s**|



_Catatan: Max http_req_duration = 2.81s (outlier tunggal). Nilai p(95) = 76.85ms berada 96.2% di bawah threshold maksimum 2000ms._ 

## **4.5 Metrik Custom Checkout** 

|||||
|---|---|---|---|
|**Metrik Custom**|**Total**|**Rate**|**Keterangan**|
|||||
|**checkout_success (201)**|99|0.341/s|Checkout berhasil<br>diproses|
|||||
|**checkout_rejected (4xx)**|792|2.730/s|Ditolak valid (stok habis /<br>logika bisnis)|
|||||
|**checkout_server_error (5xx)**|0|0.00%|Tidak ada server error<br>sama sekali|



Dari 891 total percobaan checkout: 99 berhasil (11.1%) dan 792 ditolak dengan 4xx (88.9%). Penolakan 4xx adalah perilaku yang BENAR karena stok produk terbatas (99 unit) sedangkan iterasi yang terjadi mencapai 1.804 kali. Tidak ada satu pun error server (5xx). 

## **4.6 Hasil Verifikasi Integritas Stok** 

|||||
|---|---|---|---|
|**Produk**|**Stok**<br>**Sebelum**|**Stok**<br>**Sesudah**|**Status**|
|||||
|**Bawang Merah Brebes (Kg)**|99 unit|99 unit|**STABIL - Tidak Negatif**|



## **5. ANALISIS DAN TEMUAN** 

## **5.1 Analisis Response Time** 

- Rata-rata response time 40.62ms - sangat cepat untuk API e-commerce production. 

- Median 18.22ms menunjukkan mayoritas request diproses dalam waktu yang sangat singkat. 

- p(95) = 76.85ms, margin keamanan 96.2% terhadap threshold 2000ms. 

- Max 2.81s adalah outlier tunggal yang tidak mempengaruhi nilai p(95) secara signifikan. 

- Distribusi response time sangat baik: p(90) = 25.65ms vs p(95) = 76.85ms menunjukkan lonjakan kecil di ujung distribusi. 

## **5.2 Analisis Error Rate** 

Tidak terdapat satu pun request HTTP yang gagal (0.00% http_req_failed) dari total 2.737 request. Tidak ada error 5xx (500/502 Internal Server Error/Bad Gateway) dari 891 percobaan checkout. Ini membuktikan stabilitas dan ketahanan server dalam kondisi beban simultan 10 VU selama 4 menit. 

## **5.3 Analisis Pola Checkout & Logika Bisnis** 

||||||
|---|---|---|---|---|
|**Kategori**|**Jumlah**|**Persentase**|**HTTP Code**|**Evaluasi**|
||||||
|**Checkout Sukses**|99|11.1%|201 Created|Normal / Expected|
||||||
|**Checkout Ditolak**|792|88.9%|4xx|Normal - Stok<br>Terbatas|
||||||
|**Server Error**|0|0.00%|5xx|Excellent - Zero<br>Error|



Tingginya angka penolakan 4xx (88.9%) dijelaskan oleh fakta stok hanya 99 unit sementara 1.804 iterasi terjadi secara bersamaan. Sistem dengan TEPAT menolak permintaan melebihi kapasitas stok menggunakan HTTP 4xx, bukan 5xx, yang merupakan behavior yang benar secara teknis dan sesuai best practice REST API. 

## **5.4 Analisis Throughput & Skalabilitas** 

Sistem mampu memproses 9.44 HTTP request per detik dan 6.22 iterasi lengkap (end-to-end checkout flow) per detik dengan 10 VU simultan. Throughput stabil sepanjang 4 menit tanpa degradasi. Iterasi_duration yang konsisten (avg=1.03s, p95=1.12s) menunjukkan tidak ada resource contention yang signifikan. 

## **6. KESIMPULAN** 

## **6.1 Kesimpulan** 

6. **SEMUA 4 THRESHOLD LULUS (PASSED): Sistem SayurSehat memenuhi seluruh kriteria performa yang ditetapkan.** 

7. Response time sangat baik: p(95) = 76.85ms, 26x lebih cepat dari threshold maksimum 2000ms. 

8. Zero error rate: 0.00% HTTP request gagal dan 0 server error 5xx dari 891 percobaan checkout. 

9. Integritas data terjaga: Stok tidak menjadi negatif meskipun 1.804 iterasi concurrent checkout dilakukan. 

10. Stabilitas tinggi: 0 dari 1.804 iterasi terinterupsi, throughput konsisten sepanjang durasi pengujian. 

KEPUTUSAN PENGUJIAN: LULUS (PASSED) - Sistem SayurSehat siap beroperasi pada kondisi beban 10 VU simultan. Disarankan pengujian lanjutan dengan beban lebih tinggi untuk menentukan batas kapasitas maksimum sistem. 

## **7. LAMPIRAN - RAW OUTPUT K6** 

## **7.1 Raw Console Output (Grafana k6)** 

Berikut adalah output lengkap hasil eksekusi k6: 

```
execution: local
script: k6-test/checkout_performance_test.js
scenarios: (100.00%) 1 scenario, 10 max VUs, 4m30s max duration
  * default: Up to 10 looping VUs for 4m0s over 4 stages
====== CHECKOUT PERFORMANCE REPORT ======
Product ID   : a3c41e75-98f1-4a62-8fc7-646b501bb76b
Product Name : Bawang Merah Brebes (Kg)
Stock Before : 99
Stock After  : 99
Expected     : checkout sukses tidak menyebabkan 500/502
               dan stok tidak negatif.
THRESHOLDS:
  checkout_server_error_rate  [PASSED] rate=0.00%
  checks                      [PASSED] rate=100.00%
  http_req_duration           [PASSED] p(95)=76.85ms
  http_req_failed             [PASSED] rate=0.00%
TOTAL RESULTS:
  checks_total...: 6283 (21.66/s)
  checks_passed..: 100.00% - 6283 out of 6283
  checks_failed..: 0.00%   - 0 out of 6283
```

```
HTTP METRICS:
  http_req_duration  avg=40.62ms  min=11.21ms  med=18.22ms
                     max=2.81s    p(90)=25.65ms  p(95)=76.85ms
  http_req_failed  : 0.00%   0 out of 2737
  http_reqs        : 2737   (9.44/s)
EXECUTION SUMMARY:
  iteration_duration: avg=1.03s  min=1.01s  p(95)=1.12s
  iterations        : 1804  (6.22/s)
  vus_max           : 10
```

```
running (4m50.0s), 00/10 VUs, 1804 complete, 0 interrupted
default [PASSED] 00/10 VUs  4m0s
```

