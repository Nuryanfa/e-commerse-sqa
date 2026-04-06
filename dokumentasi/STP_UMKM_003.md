

SOFTWARE TEST PLAN — APLIKASI UMKM PENJUALAN SAYURAN SEGAR STP-UMKM-003  |  Rev. A  |
## Maret 2026
Program Studi Teknik Informatika — Universitas Kebangsaan Republik Indonesia Halaman 1
## SOFTWARE TEST PLAN (STP)
## APLIKASI UMKM PENJUALAN SAYURAN SEGAR
## KELOMPOK 3
Nomor Dokumen STP-UMKM-003
## Versi / Revisi 1.0 / A
## Tanggal Maret 2026
Referensi SKPL SKPL-UMKM-003
Standar Acuan IEEE 829-2008 / ISO/IEC/IEEE 29119
## Disusun Oleh M. Irvan Alfiansyah (20231310046)  |  M. Nur
## Yanfa (20231310047)  |  Ilham Ramdan
## (20231310061)
## Program Studi Teknik Informatika — Universitas Kebangsaan
## Republik Indonesia


SOFTWARE TEST PLAN — APLIKASI UMKM PENJUALAN SAYURAN SEGAR STP-UMKM-003  |  Rev. A  |
## Maret 2026
Program Studi Teknik Informatika — Universitas Kebangsaan Republik Indonesia Halaman 2
## DAFTAR PERUBAHAN DOKUMEN
## Revisi Tanggal Ditulis Oleh Deskripsi Perubahan
A Maret 2026 M. Irvan Alfiansyah Versi pertama — dokumen STP Aplikasi UMKM Sayuran
Segar berdasarkan SKPL-UMKM-003


SOFTWARE TEST PLAN — APLIKASI UMKM PENJUALAN SAYURAN SEGAR STP-UMKM-003  |  Rev. A  |
## Maret 2026
Program Studi Teknik Informatika — Universitas Kebangsaan Republik Indonesia Halaman 3
## DAFTAR ISI
DAFTAR PERUBAHAN DOKUMEN ................................................................................................ 2
DAFTAR ISI ...................................................................................................................................... 3
- PENDAHULUAN........................................................................................................................... 5
1.1 Tujuan Dokumen ..................................................................................................................... 5
1.2 Ruang Lingkup ........................................................................................................................ 5
1.3 Definisi, Akronim, dan Istilah................................................................................................... 5
1.4 Referensi Dokumen ................................................................................................................ 6
- ITEM YANG DIUJI DAN DIKECUALIKAN .................................................................................... 7
2.1 Item yang Diuji (Test Items) .................................................................................................... 7
2.2 Item yang Dikecualikan (Out of Scope) .................................................................................. 7
- FITUR YANG DIUJI DAN TIDAK DIUJI ....................................................................................... 8
3.1 Fitur yang Diuji ........................................................................................................................ 8
3.2 Fitur yang Tidak Diuji .............................................................................................................. 8
- PENDEKATAN PENGUJIAN ........................................................................................................ 9
4.1 Strategi Pengujian ................................................................................................................... 9
4.2 Level Pengujian ...................................................................................................................... 9
4.2.1 Pengujian Unit (Unit Testing) ........................................................................................... 9
4.2.2 Pengujian Integrasi (Integration Testing) ......................................................................... 9
4.2.3 Pengujian Fungsional (Functional Testing) ...................................................................... 9
4.2.4 Pengujian Keamanan (Security Testing) .......................................................................... 9
4.2.5 Pengujian Performa (Performance Testing)................................................................... 10
4.2.6 Pengujian Regresi (Regression Testing) ....................................................................... 10
4.3 Teknik Perancangan Test Case............................................................................................ 10
- KRITERIA MASUK, KELUAR, DAN PENANGGUHAN .............................................................. 11
5.1 Kriteria Masuk Pengujian (Entry Criteria) ............................................................................. 11
5.2 Kriteria Keluar Pengujian (Exit Criteria) ................................................................................ 11
5.3 Kriteria Penangguhan (Suspension Criteria) ........................................................................ 11
- MATRIKS PENGUJIAN DETAIL ................................................................................................ 12
6.1 Modul Autentikasi (AUTH) .................................................................................................... 12
6.2 Modul Manajemen Katalog Supplier (CAT) .......................................................................... 12
6.3 Modul Checkout & Transaksi ACID (CHK) ........................................................................... 13
6.4 Modul Rekonsiliasi Pembayaran Webhook (PAY)................................................................ 14
6.5 Modul Manajemen Logistik Kurir (SHP) ................................................................................ 14
- KRITERIA KEBERHASILAN DAN KEGAGALAN ...................................................................... 16
7.1 Klasifikasi Tingkat Keparahan Cacat (Defect Severity) ........................................................ 16
7.2 Kriteria Pass/Fail per Test Case ........................................................................................... 16
- LINGKUNGAN PENGUJIAN ...................................................................................................... 17
8.1 Konfigurasi Lingkungan ........................................................................................................ 17
8.2 Data Pengujian (Test Fixtures) ............................................................................................. 17
- JADWAL DAN SUMBER DAYA ................................................................................................. 18

SOFTWARE TEST PLAN — APLIKASI UMKM PENJUALAN SAYURAN SEGAR STP-UMKM-003  |  Rev. A  |
## Maret 2026
Program Studi Teknik Informatika — Universitas Kebangsaan Republik Indonesia Halaman 4
9.1 Tim Pengujian dan Penanggung Jawab ............................................................................... 18
9.2 Jadwal Pengujian .................................................................................................................. 18
- RISIKO PENGUJIAN DAN MITIGASI ...................................................................................... 19
- DELIVERABLES PENGUJIAN ................................................................................................. 20
- PERSETUJUAN DOKUMEN .................................................................................................... 21



SOFTWARE TEST PLAN — APLIKASI UMKM PENJUALAN SAYURAN SEGAR STP-UMKM-003  |  Rev. A  |
## Maret 2026
Program Studi Teknik Informatika — Universitas Kebangsaan Republik Indonesia Halaman 5
## 1. PENDAHULUAN
## 1.1 Tujuan Dokumen
Dokumen  Software  Test  Plan  (STP)  ini  disusun  mengacu  pada  standar  IEEE  829-2008  dan
ISO/IEC/IEEE 29119-3 sebagai kerangka kerja pengujian perangkat lunak kelas industri. Dokumen
ini  mendefinisikan  strategi,  ruang  lingkup,  pendekatan  teknis,  sumber  daya,  jadwal,  dan  matriks
kriteria  keberhasilan  untuk  seluruh  aktivitas  pengujian  Aplikasi  E-Commerce  UMKM  Penjualan
## Sayuran Segar.

Tujuan utama dokumen ini adalah:
- Menetapkan strategi pengujian menyeluruh yang mencakup pengujian fungsional,
keamanan, performa, dan integrasi.
- Mendefinisikan item yang harus diuji dan item yang dikecualikan dari pengujian.
- Menetapkan kriteria masuk (entry criteria), keluar (exit criteria), dan penangguhan
(suspension criteria) untuk setiap fase pengujian.
- Mengidentifikasi risiko pengujian dan rencana mitigasinya.
- Menjadi acuan mutlak bagi insinyur jaminan mutu (QA Engineer) dalam menyusun test
case, menjalankan eksekusi pengujian, dan melaporkan cacat perangkat lunak (defect).

## 1.2 Ruang Lingkup
Sistem  yang  menjadi  subjek  pengujian  adalah  Aplikasi  E-Commerce  UMKM  Sayuran  Segar
berbasis arsitektur decoupled (Frontend React.js + Backend Golang + Database PostgreSQL 15).
Ruang lingkup pengujian mencakup seluruh komponen yang didefinisikan dalam dokumen SKPL-
UMKM-003, meliputi:
- Modul Autentikasi dan Manajemen Sesi Berbasis JWT
- Modul Manajemen Katalog Produk dan Proteksi IDOR Supplier
- Modul Checkout dan Transaksi ACID dengan Row-Level Locking
- Modul Rekonsiliasi Pembayaran via Webhook Midtrans
- Modul Manajemen Logistik dan Pelacakan Pengiriman oleh Kurir
- Lapisan Keamanan: Role-Based Access Control (RBAC) dan Proteksi IDOR lintas aktor
- Lapisan Performa: Konkurensi tinggi pada proses checkout simultan

1.3 Definisi, Akronim, dan Istilah
## Istilah / Akronim Definisi
STP Software Test Plan — Dokumen perencana pengujian perangkat lunak
SKPL / SRS Spesifikasi Kebutuhan Perangkat Lunak / Software Requirements Specification
SQA Software Quality Assurance — Jaminan mutu perangkat lunak
UC Use Case — Skenario interaksi pengguna dengan sistem
TC Test Case — Kasus uji terstruktur yang mendefinisikan input, aksi, dan ekspektasi
JWT JSON Web Token — Standar RFC 7519 untuk transmisi klaim keamanan antar
pihak
ACID Atomicity, Consistency, Isolation, Durability — Properti transaksi basis data
relasional

SOFTWARE TEST PLAN — APLIKASI UMKM PENJUALAN SAYURAN SEGAR STP-UMKM-003  |  Rev. A  |
## Maret 2026
Program Studi Teknik Informatika — Universitas Kebangsaan Republik Indonesia Halaman 6
IDOR Insecure Direct Object Reference — Kerentanan keamanan akses objek langsung
tanpa validasi
RBAC Role-Based Access Control — Kontrol akses berbasis peran pengguna
SHA-512 Secure Hash Algorithm 512-bit — Algoritma hash kriptografis untuk validasi integritas
data
VU Virtual User — Pengguna simulasi dalam pengujian beban (k6/JMeter)
RPS Requests Per Second — Satuan throughput pengujian performa
P95 / P99 Persentil ke-95 / ke-99 dari distribusi waktu respons
GORM Go Object-Relational Mapping — Pustaka ORM untuk bahasa Go
DUT Device Under Test — Komponen yang sedang diuji
Happy Path Skenario eksekusi nominal tanpa error yang merepresentasikan alur sukses
Alt Flow Alur alternatif — Skenario penyimpangan dari Happy Path

## 1.4 Referensi Dokumen
ID Dokumen Judul Dokumen Keterangan
SKPL-UMKM-003 Spesifikasi Kebutuhan Perangkat Lunak — Aplikasi
UMKM Sayuran Segar
Dokumen acuan utama STP ini
IEEE 829-2008 IEEE Standard for Software and System Test
## Documentation
Standar internasional template
## STP
## ISO/IEC/IEEE
## 29119-3
Software Testing — Part 3: Test Documentation Standar internasional
dokumentasi pengujian
RFC 7519 JSON Web Token (JWT) Spesifikasi standar autentikasi
token
OWASP Testing
Guide v4.2
OWASP Web Security Testing Guide Panduan pengujian keamanan
web
Midtrans API
## Docs
Midtrans Payment Gateway — Snap API &
## Webhook Documentation
Referensi integrasi pembayaran


SOFTWARE TEST PLAN — APLIKASI UMKM PENJUALAN SAYURAN SEGAR STP-UMKM-003  |  Rev. A  |
## Maret 2026
Program Studi Teknik Informatika — Universitas Kebangsaan Republik Indonesia Halaman 7
## 2. ITEM YANG DIUJI DAN DIKECUALIKAN
2.1 Item yang Diuji (Test Items)
Berikut  adalah  komponen-komponen  sistem  yang  wajib  melalui  proses  pengujian  dalam  siklus
jaminan mutu ini:

No Modul / Komponen Deskripsi Referensi UC
1 Autentikasi JWT Validasi kredensial, penerbitan
token, dan perlindungan endpoint
terproteksi
## UC-01
## 2 Manajemen Katalog
## Supplier
CRUD produk dengan validasi
kepemilikan IDOR dan RBAC
role=supplier
## UC-04
3 Keranjang Belanja Penambahan, pembaruan kuantitas,
dan penghapusan item dari
keranjang pembeli
UC-02 (pre)
## 4 Checkout &
Transaksi ACID
Penguncian stok atomik, kalkulasi
total, pembuatan pesanan dan
snap_token Midtrans
## UC-02
## 5 Webhook
## Rekonsiliasi Midtrans
Validasi SHA-512, pembaruan status
PAID, dan idempotency handler
## UC-03
## 6 Manajemen
## Pengiriman Kurir
Pembaruan status fisik barang
dengan validasi IDOR antar kurir
## UC-05
7 RBAC Lintas Aktor Validasi pembatasan akses Admin,
Pembeli, Supplier, dan Kurir
Semua UC
8 Proteksi SQL
## Injection
Parameterisasi kueri GORM
terhadap input manipulatif
Semua UC
## 9 Pengujian Beban
(Load Test)
Konkurensi 50 VU pada endpoint
checkout, throughput API, dan
stabilitas DB
## UC-02
## 10 Pengujian Performa
bcrypt
Validasi bahwa cost-14
menghasilkan latensi > 200ms
sebagai proteksi brute-force
## UC-01

2.2 Item yang Dikecualikan (Out of Scope)
Item-item berikut secara eksplisit dikecualikan dari ruang lingkup pengujian dokumen STP ini:
- Pengujian antarmuka visual (UI/UX) aplikasi React.js dan kompabilitas lintas-peramban
(cross-browser testing).
- Pengujian infrastruktur cloud (konfigurasi server, load balancer, dan jaringan VPC).
- Pengujian sistem pihak ketiga Midtrans pada lingkungan produksi live (hanya sandbox
yang diuji).
- Pengujian migrasi data dari sistem legacy.
- Pengujian aksesibilitas (WCAG compliance).
- Penetration testing tingkat lanjut terhadap infrastruktur jaringan (berada di luar
kompetensi tim QA aplikasi).


SOFTWARE TEST PLAN — APLIKASI UMKM PENJUALAN SAYURAN SEGAR STP-UMKM-003  |  Rev. A  |
## Maret 2026
Program Studi Teknik Informatika — Universitas Kebangsaan Republik Indonesia Halaman 8
## 3. FITUR YANG DIUJI DAN TIDAK DIUJI
3.1 Fitur yang Diuji
ID Fitur Tipe Pengujian Prioritas
F-01 Login dengan JWT dan validasi bcrypt Fungsional,
## Keamanan, Performa
## KRITIS
F-02 Logout dan invalidasi sesi token Fungsional TINGGI
F-03 CRUD Produk oleh Supplier Fungsional, Keamanan
## (IDOR)
## KRITIS
F-04 Proteksi IDOR pada operasi produk lintas
supplier
Keamanan KRITIS
F-05 Penambahan dan pengelolaan keranjang
belanja
Fungsional, Integrasi TINGGI
F-06 Proses Checkout dengan transaksi ACID Fungsional, Integrasi,
## Performa
## KRITIS
F-07 Pencegahan race condition dan
overselling
Performa, Konkurensi KRITIS
F-08 Penerimaan dan validasi Webhook
## Midtrans
Integrasi, Keamanan KRITIS
F-09 Pembaruan status pengiriman oleh Kurir
sah
Fungsional, Keamanan TINGGI
F-10 Proteksi IDOR pada manifest pengiriman
lintas kurir
Keamanan KRITIS
F-11 RBAC — pembatasan akses Admin,
## Pembeli, Supplier, Kurir
Keamanan, Fungsional KRITIS
F-12 Siklus hidup status pesanan
## (PENDING/PAID/CANCELLED/EXPIRED)
Fungsional, Integrasi TINGGI
F-13 Proteksi SQL Injection via GORM
parameterized query
Keamanan KRITIS
F-14 Validasi input dan sanitasi payload JSON Fungsional, Keamanan TINGGI

3.2 Fitur yang Tidak Diuji
- Rendering React.js dan interaksi DOM di sisi klien — diuji secara terpisah oleh tim
frontend.
- Konfigurasi SSL/TLS dan sertifikat HTTPS pada level Nginx reverse proxy.
- Performa query kompleks pada skala data di atas 1 juta baris (berada di fase pengujian
lanjutan).
- Fitur ekspor laporan Admin (direncanakan pada siklus pengujian berikutnya).


SOFTWARE TEST PLAN — APLIKASI UMKM PENJUALAN SAYURAN SEGAR STP-UMKM-003  |  Rev. A  |
## Maret 2026
Program Studi Teknik Informatika — Universitas Kebangsaan Republik Indonesia Halaman 9
## 4. PENDEKATAN PENGUJIAN
## 4.1 Strategi Pengujian
Pengujian sistem ini mengadopsi strategi berlapis (layered testing strategy) yang bergerak dari unit
terkecil  menuju   integrasi   penuh,  mengikuti   piramida  pengujian  modern.   Seluruh  pengujian
dieksekusi pada lingkungan terisolasi yang mereplikasi konfigurasi produksi.

## 4.2 Level Pengujian
4.2.1 Pengujian Unit (Unit Testing)
Pengujian   unit   difokuskan   pada   lapisan   Usecase   dan   Repository   dalam   arsitektur   Clean
Architecture. Setiap fungsi bisnis kritis diuji secara terisolasi menggunakan mock dependency.
- Tools: Go testing package (go test -v -cover), Testify assertion library
- Target coverage: minimal 80% pada lapisan Usecase
- Fokus: Logika validasi stok, perhitungan total tagihan, validasi SHA-512 signature

4.2.2 Pengujian Integrasi (Integration Testing)
Pengujian  integrasi  memvalidasi  interaksi  antar  komponen:  Handler  HTTP  <->  Usecase  <->
Repository  <->  PostgreSQL,  serta  integrasi  dengan  layanan  eksternal  Midtrans  dalam  mode
sandbox.
- Tools: Postman/Newman untuk API collection, Testcontainers untuk database
PostgreSQL terisolasi
- Fokus: Alur end-to-end transaksi ACID, propagasi JWT, dan sinkronisasi Webhook

4.2.3 Pengujian Fungsional (Functional Testing)
Pengujian fungsional memvalidasi kesesuaian perilaku sistem terhadap spesifikasi use case dalam
SKPL-UMKM-003. Setiap use case dieksekusi mengikuti Happy Path dan seluruh Alternative Flow
yang terdefinisi.
- Tools: Postman, cURL, Newman CLI
- Fokus: Semua UC-01 hingga UC-05 beserta Alt Flow masing-masing

4.2.4 Pengujian Keamanan (Security Testing)
Pengujian  keamanan  dilaksanakan  mengacu  pada  OWASP  Testing  Guide  v4.2,  berfokus  pada
vektor serangan yang relevan dengan arsitektur aplikasi ini.
- Pengujian IDOR: Validasi klausa AND id_user pada operasi Supplier dan AND id_kurir
pada operasi Kurir
- Pengujian SQL Injection: Injeksi payload berbahaya pada seluruh parameter input
- Pengujian JWT Manipulation: Token yang dimodifikasi, kedaluwarsa, dan ditandatangani
dengan kunci palsu
- Pengujian RBAC: Percobaan akses endpoint terproteksi menggunakan token dengan
role yang salah
- Pengujian Webhook Forgery: Pengiriman notifikasi Midtrans dengan signature_key palsu


SOFTWARE TEST PLAN — APLIKASI UMKM PENJUALAN SAYURAN SEGAR STP-UMKM-003  |  Rev. A  |
## Maret 2026
Program Studi Teknik Informatika — Universitas Kebangsaan Republik Indonesia Halaman 10
4.2.5 Pengujian Performa (Performance Testing)
Pengujian  performa  mengukur  kemampuan  sistem  dalam  menangani  beban  sesuai  proyeksi
operasional UMKM.
- Tools: k6 (Grafana) untuk simulasi Virtual User, pprof untuk profiling Golang
- Skenario Beban: 50 VU concurrent checkout (CHK-03), 200 VU browsing katalog
- Target SLA: Waktu respons P95 < 500ms pada endpoint non-komputasi berat;
throughput minimal 100 RPS pada endpoint GET

4.2.6 Pengujian Regresi (Regression Testing)
Setiap perbaikan cacat (bug fix) dan perubahan kode harus diikuti eksekusi ulang seluruh test case
dalam kategori KRITIS untuk memastikan tidak ada regresi fungsionalitas yang terjadi.

## 4.3 Teknik Perancangan Test Case
- Equivalence Partitioning: Input dibagi ke kelas-kelas ekuivalen valid dan invalid (contoh:
nilai stok >= 0 vs < 0).
- Boundary Value Analysis: Pengujian pada batas nilai kritis (stok = 0, stok = 1, qty = stok,
qty = stok + 1).
- Decision Table Testing: Kombinasi kondisi pada proses checkout ACID (stok cukup/tidak,
Midtrans OK/error).
- State Transition Testing: Transisi status pesanan dari PENDING hingga DITERIMA
mengikuti state chart.
- Negative Testing: Input di luar batas, karakter khusus SQL, dan payload malformasi.


SOFTWARE TEST PLAN — APLIKASI UMKM PENJUALAN SAYURAN SEGAR STP-UMKM-003  |  Rev. A  |
## Maret 2026
Program Studi Teknik Informatika — Universitas Kebangsaan Republik Indonesia Halaman 11
## 5. KRITERIA MASUK, KELUAR, DAN PENANGGUHAN
5.1 Kriteria Masuk Pengujian (Entry Criteria)
Aktivitas pengujian dapat dimulai apabila seluruh kondisi berikut terpenuhi:
- Dokumen STP ini telah disetujui oleh seluruh anggota tim.
- Build perangkat lunak terbaru telah berhasil dikompilasi tanpa error pada pipeline CI.
- Lingkungan pengujian (test environment) telah dikonfigurasi dan terverifikasi, termasuk
koneksi PostgreSQL sandbox dan akun Midtrans sandbox.
- Data uji (test fixtures) telah disiapkan: akun pengguna dengan semua role, produk
sampel, dan pesanan dalam berbagai status.
- Seluruh test case pada dokumen ini telah di-review dan disetujui oleh lead QA.
- Alat pengujian (Postman, k6, Go test) telah terinstalasi dan terkonfigurasi pada mesin
pengujian.

5.2 Kriteria Keluar Pengujian (Exit Criteria)
Fase pengujian dinyatakan selesai apabila:
- Seluruh test case berprioritas KRITIS telah dieksekusi dan lulus (pass).
- Minimal 95% dari total test case keseluruhan telah dieksekusi.
- Tidak ada cacat terbuka (open defect) berkategori Blocker atau Critical.
- Jumlah cacat berkategori Major tidak melebihi 3 item dengan rencana perbaikan
terdefinisi.
- Laporan pengujian final (Test Summary Report) telah disusun dan diserahkan.
- Hasil pengujian performa menunjukkan tidak ada peristiwa overselling pada skenario
race condition.

5.3 Kriteria Penangguhan (Suspension Criteria)
Aktivitas pengujian akan ditangguhkan sementara apabila:
- Ditemukan cacat berkategori Blocker yang menghentikan lebih dari 30% test case untuk
dapat dieksekusi.
- Lingkungan pengujian mengalami kegagalan kritis (database tidak dapat diakses, server
down).
- Build yang diuji mengalami regresi parah pada lebih dari 20% fitur yang sebelumnya telah
lulus pengujian.

Pengujian dapat dilanjutkan setelah:
- Cacat Blocker telah diperbaiki dan build baru tersedia.
- Lingkungan pengujian dipulihkan ke kondisi stabil.
- Persetujuan formal dari lead QA diberikan untuk melanjutkan.


SOFTWARE TEST PLAN — APLIKASI UMKM PENJUALAN SAYURAN SEGAR STP-UMKM-003  |  Rev. A  |
## Maret 2026
Program Studi Teknik Informatika — Universitas Kebangsaan Republik Indonesia Halaman 12
## 6. MATRIKS PENGUJIAN DETAIL
6.1 Modul Autentikasi (AUTH)
Pengujian  modul  autentikasi  memvalidasi  UC-01:  Login  Pengguna  dengan  Autentikasi  JWT,
mencakup seluruh alur normal dan alternatif yang didefinisikan dalam SKPL.

ID TC Skenario Uji Precondition Input / Aksi Expected Result Prioritas
## AUTH-
## 01
Login berhasil
(Happy Path)
User terdaftar di
DB, password
hash bcrypt cost-
## 14
## POST
## /api/v1/auth/login
## {email:
user@test.com,
password: Pass1234}
## HTTP 200 OK +
JWT token + role +
expires_in
## KRITIS
## AUTH-
## 02
Login gagal —
password salah
User terdaftar di
## DB
## POST
## /api/v1/auth/login
{password: SALAH}
HTTP 401, tidak ada
token, pesan
generik
## KRITIS
## AUTH-
## 03
Login gagal —
email tidak
terdaftar
Email tidak ada di
## DB
## POST
## /api/v1/auth/login
## {email:
tidakada@x.com}
HTTP 401, pesan
generik (user
enumeration
prevention)
## KRITIS
## AUTH-
## 04
## Brute-force —
latensi bcrypt
konstan
Akun valid tersedia 10x percobaan login
salah berturut-turut
dalam 5 detik
Response time rata-
rata > 200ms setiap
percobaan
## KRITIS
## AUTH-
## 05
Akses endpoint
terproteksi
tanpa token
Tidak ada header
## Authorization
## GET
## /api/v1/products/123
(tanpa token)
HTTP 401 dari
AuthMiddleware,
request tidak
mencapai handler
## KRITIS
## AUTH-
## 06
Token expired
digunakan
JWT dengan TTL
yang sudah lewat
24 jam
GET /api/v1/orders
(token expired)
## HTTP 401
## Unauthorized
## TINGGI
## AUTH-
## 07
## Token
dimodifikasi
## (tampered)
JWT valid
kemudian payload-
nya diubah secara
manual
GET endpoint
terproteksi dengan
token yang
dimodifikasi
## HTTP 401,
signature mismatch
## KRITIS
## AUTH-
## 08
Login dengan
email berformat
tidak valid
User terdaftar POST
## /api/v1/auth/login
{email: bukanemail}
HTTP 400 Bad
Request, validasi
format email
## SEDANG

6.2 Modul Manajemen Katalog Supplier (CAT)
Pengujian modul ini  memvalidasi  UC-04:  Manajemen Produk  oleh  Supplier  dengan fokus utama
pada proteksi IDOR dan validasi kepemilikan produk.

## ID
## TC
## Skenario Uji Precondition Input / Aksi Expected Result Prioritas
## CAT-
## 01
## Tambah
produk baru
oleh Supplier
Login sebagai
Supplier (JWT
valid)
POST /api/v1/products
{nama_produk, harga:5000,
stok:50}
## HTTP 201
Created, id_user
pada produk = id
## Supplier
## KRITIS

SOFTWARE TEST PLAN — APLIKASI UMKM PENJUALAN SAYURAN SEGAR STP-UMKM-003  |  Rev. A  |
## Maret 2026
Program Studi Teknik Informatika — Universitas Kebangsaan Republik Indonesia Halaman 13
## CAT-
## 02
## Update
produk milik
sendiri
(Happy Path)
## Login Supplier
A, produk P
milik A
## PUT
/api/v1/products/{id_produk_A}
{harga:15000, stok:100}
## HTTP 200 OK,
data produk ter-
update di DB
## KRITIS
## CAT-
## 03
## IDOR —
update
produk milik
Supplier lain
## Login Supplier
B, produk P
milik Supplier A
## PUT
/api/v1/products/{id_produk_A}
## {harga:1}
## HTTP 403
Forbidden, data
produk A tidak
berubah
## KRITIS
## CAT-
## 04
Hapus produk
milik sendiri
## Login Supplier
A, produk P
milik A
## DELETE
/api/v1/products/{id_produk_A}
## HTTP 200 OK,
produk terhapus
dari DB
## TINGGI
## CAT-
## 05
## IDOR —
hapus produk
Supplier lain
Login Supplier B DELETE
/api/v1/products/{id_produk_A}
## HTTP 403
## Forbidden
## KRITIS
## CAT-
## 06
Update stok
menjadi
negatif
## Login Supplier,
produk valid
PUT /api/v1/products/{id}
## {stok:-10}
## HTTP 400/422,
validasi gagal,
stok tidak berubah
## TINGGI
## CAT-
## 07
Update harga
menjadi
negatif
## Login Supplier,
produk valid
PUT /api/v1/products/{id}
## {harga:-5000}
## HTTP 400/422,
validasi gagal
## TINGGI
## CAT-
## 08
## Pembeli
mencoba
menambah
produk
Login sebagai
role=pembeli
POST /api/v1/products
{nama_produk, harga, stok}
## HTTP 403
Forbidden dari
RoleMiddleware
## KRITIS

6.3 Modul Checkout & Transaksi ACID (CHK)
Pengujian  modul  checkout  adalah  yang  paling  kritis  dalam  sistem  ini.  Fokus  utama  adalah
memvalidasi  integritas  transaksi  ACID,  pencegahan  overselling  melalui  row-level  locking,  dan
penanganan race condition pada checkout simultan.

## ID
## TC
## Skenario Uji Precondition Input / Aksi Expected Result Prioritas
## CHK-
## 01
## Checkout
berhasil (Happy
## Path)
Pembeli login,
keranjang terisi,
stok cukup
## POST
## /api/v1/orders/checkout
(JWT Header)
HTTP 201, pesanan
tersimpan,
keranjang kosong,
stok berkurang,
snap_token returned
## KRITIS
## CHK-
## 02
Checkout stok
tidak mencukupi
Keranjang berisi
10 barang, stok
produk hanya 5
## POST
## /api/v1/orders/checkout
## HTTP 400/422,
ROLLBACK total,
stok tetap 5, tidak
ada pesanan dibuat
## KRITIS
## CHK-
## 03
## Race Condition
## — 50 VU
checkout
bersamaan
Stok produk = 10,
50 user concurrent
checkout qty=1
k6: 50 VU POST
## /api/v1/orders/checkout
secara paralel
Hanya 10 pesanan
sukses (201), 40
gagal (4xx), stok
akhir = 0, tidak ada
overselling
## KRITIS
## CHK-
## 04
## Checkout
keranjang
kosong
Pembeli login,
keranjang kosong
## POST
## /api/v1/orders/checkout
HTTP 400 Bad
## Request
## TINGGI
## CHK-
## 05
Midtrans API
error saat
checkout
## Koneksi Midtrans
sandbox
## POST
## /api/v1/orders/checkout
HTTP 502 Bad
## Gateway,
## KRITIS

SOFTWARE TEST PLAN — APLIKASI UMKM PENJUALAN SAYURAN SEGAR STP-UMKM-003  |  Rev. A  |
## Maret 2026
Program Studi Teknik Informatika — Universitas Kebangsaan Republik Indonesia Halaman 14
diputus/mocked
error
ROLLBACK total,
stok tidak berkurang
## CHK-
## 06
Checkout tanpa
JWT (tidak
autentikasi)
Tidak ada header
## Authorization
## POST
## /api/v1/orders/checkout
HTTP 401 dari
AuthMiddleware
## KRITIS
## CHK-
## 07
## Validasi
atomicity — DB
crash tengah
transaksi
Simulasi DB
connection drop
saat transaksi aktif
## POST
## /api/v1/orders/checkout
Tidak ada partial
data tersimpan,
rollback otomatis
## KRITIS
## CHK-
## 08
## Siklus
PENDING ke
## EXPIRED
Pesanan berstatus
PENDING lebih
dari 24 jam
Tunggu scheduled job
/ trigger manual
status_pesanan
berubah ke
EXPIRED, stok
dikembalikan
## TINGGI

6.4 Modul Rekonsiliasi Pembayaran Webhook (PAY)
Pengujian   modul   ini   memvalidasi   UC-03:   mekanisme   validasi   kriptografis   SHA-512   dan
idempotency handler pada endpoint Webhook Midtrans.

## ID
## TC
## Skenario Uji Precondition Input / Aksi Expected Result Prioritas
## PAY-
## 01
Webhook valid
## Midtrans
(Happy Path)
## Pesanan
berstatus
## PENDING,
server_key valid
## POST
## /api/v1/payments/webhook
## {order_id,
status_code:200,
gross_amount,
signature_key VALID}
## HTTP 200 OK,
status pesanan =>
PAID, waktu_lunas
terisi
## KRITIS
## PAY-
## 02
## Webhook
dengan
signature_key
palsu
## Pesanan
berstatus
## PENDING
## POST
## /api/v1/payments/webhook
## {signature_key:
## PALSU123}
## HTTP 403
Forbidden, status
pesanan tidak
berubah, dicatat di
security log
## KRITIS
## PAY-
## 03
## Webhook
duplikat —
idempotency
Pesanan sudah
berstatus PAID
## POST
## /api/v1/payments/webhook
dikirim 2x dengan data
identik
## HTTP 200 OK
(tidak error), tidak
ada duplikasi
record
pembayaran
## KRITIS
## PAY-
## 04
## Webhook
dengan
order_id tidak
dikenal
ID pesanan tidak
ada di DB
## POST
## /api/v1/payments/webhook
{order_id: tidak-ada}
HTTP 404 atau
## 200 (tergantung
kebijakan
idempotency),
tidak crash
## TINGGI
## PAY-
## 05
## Webhook
dengan
gross_amount
dimanipulasi
## Pesanan
## PENDING
dengan total
## Rp75.000
## POST
## /api/v1/payments/webhook
## {gross_amount: 1}
HTTP 403 karena
hash SHA-512
tidak cocok
## KRITIS
## PAY-
## 06
Transisi PAID
ke
## CANCELLED
oleh Admin
Pesanan PAID,
barang belum
berstatus
## DIKIRIM
Admin: DELETE
## /api/v1/orders/{id}
Status berubah ke
## CANCELLED,
refund Midtrans
diproses
## TINGGI

6.5 Modul Manajemen Logistik Kurir (SHP)

SOFTWARE TEST PLAN — APLIKASI UMKM PENJUALAN SAYURAN SEGAR STP-UMKM-003  |  Rev. A  |
## Maret 2026
Program Studi Teknik Informatika — Universitas Kebangsaan Republik Indonesia Halaman 15
Pengujian  modul  ini  memvalidasi  UC-05:  pembaruan  status  pengiriman  dengan  proteksi  IDOR
antar kurir.

## ID
## TC
## Skenario Uji Precondition Input / Aksi Expected Result Prioritas
## SHP-
## 01
Update status
pengiriman
oleh Kurir sah
(Happy Path)
Kurir A login,
manifest M
ditugaskan ke A
## PATCH
/api/v1/shipping/{id_M}/status
{status_kirim: DIKIRIM}
## HTTP 200 OK,
status_kirim =
DIKIRIM di DB
## KRITIS
## SHP-
## 02
IDOR — Kurir
B update
manifest milik
## Kurir A
Kurir B login,
manifest M milik
## Kurir A
## PATCH
/api/v1/shipping/{id_M}/status
{status_kirim: DITERIMA}
## HTTP 403
Forbidden, status
manifest tidak
berubah
## KRITIS
## SHP-
## 03
Update status
dengan nilai di
luar enum
Kurir login,
manifest valid
## PATCH
## /api/v1/shipping/{id}/status
{status_kirim: HILANG}
HTTP 400 Bad
Request, validasi
enum gagal
## TINGGI
## SHP-
## 04
Transisi status
DIKEMAS ke
## DIKIRIM
Kurir login,
status awal
## DIKEMAS
PATCH status {status_kirim:
## DIKIRIM}
HTTP 200, status
berubah ke
## DIKIRIM
## TINGGI
## SHP-
## 05
Transisi status
DIKIRIM ke
## DITERIMA
Kurir login,
status DIKIRIM
PATCH status {status_kirim:
## DITERIMA}
HTTP 200, status
berubah ke
## DITERIMA
## TINGGI
## SHP-
## 06
## Pembeli
mencoba
update status
pengiriman
Login sebagai
role=pembeli
## PATCH
## /api/v1/shipping/{id}/status
## HTTP 403
Forbidden dari
RoleMiddleware
## KRITIS
## SHP-
## 07
## Update
manifest
tanpa id_kurir
ditetapkan
## (null)
Admin belum
menugaskan
kurir
## PATCH
## /api/v1/shipping/{id}/status
oleh kurir manapun
## HTTP 403/404,
manifest tidak
dapat diakses
## TINGGI


SOFTWARE TEST PLAN — APLIKASI UMKM PENJUALAN SAYURAN SEGAR STP-UMKM-003  |  Rev. A  |
## Maret 2026
Program Studi Teknik Informatika — Universitas Kebangsaan Republik Indonesia Halaman 16
## 7. KRITERIA KEBERHASILAN DAN KEGAGALAN
7.1 Klasifikasi Tingkat Keparahan Cacat (Defect Severity)
## Tingkat Label Kriteria Definisi
S-1 Blocker Cacat yang menghentikan seluruh proses pengujian atau
menyebabkan sistem crash total. Tidak ada workaround. Contoh:
Endpoint login tidak dapat diakses, database tidak dapat
terhubung.
S-2 Critical Cacat pada fungsionalitas inti sistem yang mengakibatkan
kegagalan fatal tanpa workaround. Contoh: Transaksi checkout
memungkinkan overselling, proteksi IDOR tidak berfungsi (data
bocor lintas aktor).
S-3 Major Cacat fungsional signifikan yang memiliki dampak besar namun
masih memiliki workaround sementara. Contoh: Webhook Midtrans
tidak memperbarui status pesanan dengan benar.
S-4 Minor Cacat pada fungsionalitas non-kritis atau pesan error yang tidak
sesuai spesifikasi. Contoh: Pesan error tidak sesuai teks yang
didefinisikan dalam SKPL.
S-5 Trivial Cacat estetika atau inkonsistensi kecil yang tidak memengaruhi
fungsionalitas. Contoh: Kapitalisasi pesan respons tidak konsisten.

7.2 Kriteria Pass/Fail per Test Case
Sebuah test case dinyatakan LULUS (PASS) apabila:
- Kode respons HTTP yang diterima sesuai dengan nilai yang didefinisikan pada kolom
## Expected Result.
- Struktur dan isi payload JSON respons (field, tipe data, nilai) sesuai dengan spesifikasi
API dalam SKPL.
- Kondisi basis data setelah eksekusi test case sesuai dengan Postcondition yang
terdefinisi di use case.
- Tidak ada perubahan tidak terduga pada tabel basis data yang tidak relevan dengan test
case.

Sebuah test case dinyatakan GAGAL (FAIL) apabila salah satu kondisi berikut terpenuhi:
- Kode respons HTTP berbeda dari Expected Result.
- Data di basis data tidak sesuai dengan Postcondition (termasuk data yang seharusnya
tidak berubah tetapi berubah).
- Sistem mengembalikan informasi sensitif dalam pesan error (user enumeration, stack
trace, dll.).
- Sistem crash atau mengembalikan HTTP 500 Internal Server Error pada skenario yang
tidak mengharapkan kondisi tersebut.


SOFTWARE TEST PLAN — APLIKASI UMKM PENJUALAN SAYURAN SEGAR STP-UMKM-003  |  Rev. A  |
## Maret 2026
Program Studi Teknik Informatika — Universitas Kebangsaan Republik Indonesia Halaman 17
## 8. LINGKUNGAN PENGUJIAN
## 8.1 Konfigurasi Lingkungan
## Komponen Spesifikasi Keterangan
## Server Pengujian
## Backend
OS: Ubuntu 22.04 LTS, RAM: 8 GB,
CPU: 4 Core, Go: 1.20+
Menjalankan binary Golang pada port
8088 (test env)
Database Pengujian PostgreSQL 15, terisolasi dari produksi Skema identik produksi, data fixture
seeded sebelum setiap suite
Alat Pengujian API Postman v10+, Newman CLI v6+ Untuk eksekusi collection dan CI/CD
integration
Alat Pengujian Beban k6 v0.46+ (Grafana) Simulasi VU dan pengukuran P95/P99
latensi
Alat Pengujian Unit go test (standar Go), Testify v1.8+ Coverage reporting dengan go test -
cover
Sandbox Midtrans Akun Midtrans Sandbox resmi Server key dan client key terpisah dari
produksi
Manajemen Cacat GitHub Issues (label:
bug/blocker/critical)
Setiap cacat memiliki nomor issue dan
link ke test case terkait

8.2 Data Pengujian (Test Fixtures)
Seluruh  pengujian  memerlukan  data  awal  yang  konsisten.  Data  berikut  harus  di-seed  sebelum
eksekusi setiap test suite:
## Kategori Data Deskripsi Digunakan Pada
Akun Pengguna 1 Admin, 2 Supplier (A & B), 2 Pembeli, 2
Kurir (A & B) — semua dengan password
hash bcrypt
## AUTH, CAT, CHK, PAY, SHP
Katalog Produk 10 produk aktif milik Supplier A, 5 produk
milik Supplier B, stok bervariasi 0-100
## CAT, CHK
## Keranjang
## Belanja
3 item di keranjang Pembeli-1 dengan
total stok cukup, 1 item dengan stok batas
## CHK
Pesanan Sampel 2 pesanan PENDING, 1 pesanan PAID, 1
pesanan CANCELLED — milik Pembeli-1
## PAY, SHP, CHK
## Manifest
## Pengiriman
1 manifest DIKEMAS ditugaskan ke Kurir
A, 1 manifest DIKIRIM ditugaskan ke Kurir
## B
## SHP


SOFTWARE TEST PLAN — APLIKASI UMKM PENJUALAN SAYURAN SEGAR STP-UMKM-003  |  Rev. A  |
## Maret 2026
Program Studi Teknik Informatika — Universitas Kebangsaan Republik Indonesia Halaman 18
## 9. JADWAL DAN SUMBER DAYA
9.1 Tim Pengujian dan Penanggung Jawab
## Nama Peran Tanggung Jawab
## M. Irvan Alfiansyah
## (20231310046)
Lead QA / Test
## Designer
Perancangan test case, review STP, pengujian
keamanan IDOR & JWT
## M. Nur Yanfa
## (20231310047)
QA Engineer —
## Integrasi
Pengujian integrasi API, Webhook Midtrans, siklus
pesanan
## Ilham Ramdan
## (20231310061)
QA Engineer —
## Performa
Pengujian beban k6, pengujian konkurensi,
pelaporan cacat

## 9.2 Jadwal Pengujian
## No Aktivitas Durasi Penanggung Jawab Output
1 Persiapan lingkungan &
seeding data uji
1 hari Semua tim Test environment
siap
2 Eksekusi pengujian unit
(go test)
1 hari Ilham Ramdan Coverage report
3 Eksekusi pengujian
fungsional AUTH & CAT
1 hari M. Irvan Alfiansyah Test execution report
4 Eksekusi pengujian
fungsional CHK & PAY
1 hari M. Nur Yanfa Test execution report
5 Eksekusi pengujian
fungsional SHP & RBAC
1 hari M. Irvan Alfiansyah Test execution report
6 Pengujian keamanan
## (IDOR, JWT, SQL
## Injection)
1 hari Semua tim Security test report
7 Pengujian beban dan
konkurensi (k6)
1 hari Ilham Ramdan Performance report
8 Pengujian regresi dan
verifikasi perbaikan
1 hari Semua tim Regression report
## 9 Penyusunan Test
## Summary Report
1 hari M. Nur Yanfa Test Summary
Report final


SOFTWARE TEST PLAN — APLIKASI UMKM PENJUALAN SAYURAN SEGAR STP-UMKM-003  |  Rev. A  |
## Maret 2026
Program Studi Teknik Informatika — Universitas Kebangsaan Republik Indonesia Halaman 19
## 10. RISIKO PENGUJIAN DAN MITIGASI
ID Deskripsi Risiko Probabilitas Dampak Strategi Mitigasi
R-01 Perubahan kode backend
mendekati tenggat
pengujian menyebabkan
regresi tidak terduga
SEDANG TINGGI Terapkan branch protection pada main;
wajibkan code review sebelum merge ke
test branch.
R-02 Sandbox Midtrans tidak
dapat diakses saat
pengujian Webhook
RENDAH TINGGI Siapkan mock server Midtrans (WireMock)
sebagai fallback; simpan sample payload
webhook di fixture.
R-03 Race condition hanya
muncul di beban tinggi
namun tidak terdeteksi di
lingkungan dev
SEDANG KRITIS Eksekusi CHK-03 wajib menggunakan k6
dengan minimum 50 VU; jalankan
setidaknya 3 kali untuk konsistensi.
R-04 Data fixture
terkontaminasi antara test
run menyebabkan false
positive/negative
TINGGI SEDANG Implementasi database rollback
(transaction per test) atau truncate & re-
seed sebelum setiap test suite.
R-05 Keterbatasan waktu
menyebabkan test case
berprioritas rendah tidak
sempat dieksekusi
SEDANG RENDAH Prioritaskan KRITIS > TINGGI > SEDANG;
catat test case yang belum dieksekusi
dalam laporan akhir.
R-06 Latensi bcrypt cost-14
berbeda antar mesin
pengujian menyebabkan
AUTH-04 fluktuatif
SEDANG RENDAH Tetapkan threshold fleksibel > 150ms
(bukan 200ms eksak); jalankan 5 kali dan
ambil nilai median.


SOFTWARE TEST PLAN — APLIKASI UMKM PENJUALAN SAYURAN SEGAR STP-UMKM-003  |  Rev. A  |
## Maret 2026
Program Studi Teknik Informatika — Universitas Kebangsaan Republik Indonesia Halaman 20
## 11. DELIVERABLES PENGUJIAN
Seluruh dokumen dan artefak berikut wajib dihasilkan dan diserahkan pada akhir siklus pengujian:

## No Deliverable Penanggung Jawab Tenggat
1 Software Test Plan (STP) —
dokumen ini
M. Irvan Alfiansyah Sebelum eksekusi pengujian
dimulai
2 Test Case Spreadsheet (Excel)
— rincian seluruh test case
dengan kolom status eksekusi
M. Nur Yanfa Bersamaan dengan STP
3 Laporan Eksekusi Harian (Daily
## Test Execution Log)
Masing-masing QA
## Engineer
Setiap hari selama fase eksekusi
4 Laporan Cacat (Defect Report)
— GitHub Issues dengan label
dan severity
Siapa yang menemukan Segera saat ditemukan
## 5 Laporan Pengujian Performa
(k6 HTML Report)
Ilham Ramdan Setelah pengujian beban selesai
6 Test Summary Report (TSR) —
ringkasan hasil, metrik, dan
rekomendasi Go/No-Go
M. Nur Yanfa Akhir siklus pengujian


SOFTWARE TEST PLAN — APLIKASI UMKM PENJUALAN SAYURAN SEGAR STP-UMKM-003  |  Rev. A  |
## Maret 2026
Program Studi Teknik Informatika — Universitas Kebangsaan Republik Indonesia Halaman 21
## 12. PERSETUJUAN DOKUMEN
Dengan  menandatangani  dokumen  ini,  pihak-pihak  yang  tercantum  di  bawah  menyatakan  telah
membaca, memahami, dan menyetujui isi Software Test Plan ini sebagai panduan resmi pengujian
Aplikasi UMKM Penjualan Sayuran Segar.

## Disiapkan Oleh Disiapkan Oleh Disiapkan Oleh Disetujui Oleh
## M. Irvan Alfiansyah
## NIM: 20231310046
Lead QA / Test Designer
## M. Nur Yanfa
## NIM: 20231310047
QA Engineer — Integrasi
## Ilham Ramdan
## NIM: 20231310061
QA Engineer — Performa
## Dosen / Pembimbing
Tanda tangan:
## Tanggal: ____________
