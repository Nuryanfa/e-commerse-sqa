# LAPORAN SOFTWARE QUALITY ASSURANCE

## METODE BLACKBOX - EQUIVALENCE CLASS PARTITIONING

## Anggota Kelompok

| NIM | Nama |
|:---|:---|
| 20231310046 | M. Irvan Alfiansyah |
| 20231310047 | M. Nur Yanfa |

**PROGRAM STUDI TEKNIK INFORMATIKA**  
**UNIVERSITAS KEBANGSAAN REPUBLIK INDONESIA**  
Jln. Terusan Halimun No. 37 (Pelajar Pejuang 45), Lingkar Selatan, Kec. Lengkong, Kota Bandung, Jawa Barat 40263

---

## BAB I - PENDAHULUAN

### 1.1 Tujuan Dokumen

Dokumen ini merupakan laporan pengujian Black Box Testing menggunakan metode Equivalence Class Partitioning (ECP) yang diterapkan pada Modul Checkout ACID Aplikasi E-Commerce UMKM Penjualan Sayuran Segar. Tujuan dokumen adalah mendokumentasikan seluruh skenario pengujian, kelas setara yang diidentifikasi, test case individual, dan test case gabungan beserta hasil eksekusinya.

Dokumen ini mengacu pada standar IEEE 829 untuk dokumentasi pengujian perangkat lunak.

### 1.2 Ruang Lingkup

Pengujian difokuskan pada satu modul utama:

- **Use Case UC-02:** Checkout ACID
- **Endpoint:** `POST /api/v1/orders/checkout`

### 1.3 Definisi Metode - Equivalence Class Partitioning

Equivalence Class Partitioning (ECP) adalah teknik Black Box Testing yang membagi domain input menjadi kelas-kelas setara atau partisi, di mana setiap elemen dalam satu kelas diasumsikan menghasilkan perilaku sistem yang identik. Teknik ini mereduksi jumlah test case yang diperlukan dengan memilih satu representasi dari setiap kelas.

Dua jenis kelas yang diidentifikasi:

- **Valid Class:** Input yang diterima sistem dan menghasilkan output yang benar.
- **Invalid Class:** Input yang ditolak sistem dan menghasilkan pesan error yang sesuai.

### 1.4 Prosedur Penerapan

1. Identifikasi kelas-kelas setara dari setiap field input.
2. Buat tabel Equivalence Class lengkap dengan kelas valid dan invalid.
3. Buat tabel Test Case individual per kelas setara.
4. Buat tabel Test Case gabungan untuk semua field secara bersamaan.

---

## BAB II - SKENARIO USE CASE: CHECKOUT ACID

Modul Checkout adalah titik kritis sistem yang mengeksekusi transaksi ACID (Atomicity, Consistency, Isolation, Durability) dengan memanfaatkan mekanisme `SELECT FOR UPDATE` pada PostgreSQL untuk mencegah overselling.

### 2.1 Identitas Use Case

| Atribut | Keterangan |
|:---|:---|
| Nama Use Case | Checkout ACID |
| Aktor | Pembeli (Authenticated User, `role=pembeli`) |
| Endpoint | `POST /api/v1/orders/checkout` |
| Precondition | 1. JWT valid dengan `role=pembeli`; 2. Keranjang tidak kosong; 3. Stok tersedia; 4. Koneksi Midtrans aktif. |
| Postcondition | Pesanan berstatus `PENDING`, stok berkurang, dan `snap_token` dikembalikan. |

### 2.2 Skenario Utama (Happy Path)

| No. | Aksi Aktor | Respons Sistem |
|:---:|:---|:---|
| 1 | Pembeli membuka halaman keranjang yang berisi minimal satu produk. | Sistem menampilkan daftar item beserta total harga. |
| 2 | Pembeli menekan tombol Checkout. | Sistem memvalidasi JWT melalui AuthMiddleware dan RoleMiddleware. |
| 3 | - | Sistem memulai transaksi dengan `tx.Begin()`. |
| 4 | - | Sistem mengeksekusi `SELECT ... FOR UPDATE` untuk row-level locking stok. |
| 5 | - | Sistem memvalidasi bahwa kuantitas yang dipesan tidak melebihi stok tersedia untuk setiap produk. |
| 6 | - | Sistem melakukan `INSERT` pesanan baru ke tabel orders dengan status `PENDING`. |
| 7 | - | Sistem melakukan `UPDATE` stok dengan mengurangi stok berdasarkan kuantitas setiap produk. |
| 8 | - | Sistem menghapus item yang dipesan dari tabel keranjang. |
| 9 | - | Sistem mengirim request ke Midtrans Snap API untuk memperoleh `snap_token`. |
| 10 | - | Sistem mengeksekusi `tx.Commit()` secara atomik. |
| 11 | - | Sistem mengembalikan HTTP 201 Created berisi `id_pesanan`, total, status `PENDING`, `snap_token`, dan `redirect_url`. |
| 12 | Pembeli diarahkan ke halaman pembayaran Midtrans. | - |

### 2.3 Skenario Alternatif dan Pengecualian

| Kondisi | Respons Sistem |
|:---|:---|
| Stok tidak mencukupi saat `SELECT FOR UPDATE` | `tx.Rollback()` lalu HTTP 409 Conflict: "Stok produk tidak mencukupi." |
| Koneksi Midtrans gagal atau timeout | `tx.Rollback()` lalu HTTP 503 Service Unavailable: "Gagal menghubungi layanan pembayaran." |
| Header Authorization tidak ada | HTTP 401 Unauthorized: "Authorization header is required." |
| JWT sudah kadaluarsa lebih dari 24 jam | HTTP 401 Unauthorized: "Sesi Anda telah berakhir, silakan login kembali." |
| JWT valid tetapi `role=supplier` | HTTP 403 Forbidden: "Akses ditolak. Hanya Pembeli yang dapat melakukan checkout." |
| Keranjang kosong saat checkout | HTTP 409 Bad Request: "Keranjang belanja kosong." |
| Kuantitas = 0 atau negatif | HTTP 400 Bad Request: "Kuantitas pesanan minimal 1 unit." |
| Race condition, dua pembeli bersamaan dengan stok = 1 | `SELECT FOR UPDATE` menjamin hanya satu transaksi sukses sehingga tidak terjadi overselling. |

---

## BAB III - EQUIVALENCE CLASS PARTITIONING

### 3.1 Langkah 1: Identifikasi Batasan Field Input

| Field / Kolom | Batasan Data (Constraint) |
|:---|:---|
| Isi Keranjang | Minimal satu item produk. Checkout dengan keranjang kosong ditolak dengan HTTP 409. |
| Kuantitas Pesanan | Harus `>= 1` dan tidak boleh melebihi stok saat `SELECT FOR UPDATE` dieksekusi. |
| Token JWT (Pembeli) | Harus valid, belum kadaluarsa (TTL 24 jam), dan `role=pembeli`. Tanpa token menghasilkan HTTP 401. |
| Ketersediaan Stok (saat transaksi) | Stok harus mencukupi semua item keranjang. Jika kurang, seluruh transaksi di-ROLLBACK. |
| Koneksi Midtrans API | Harus berhasil. Jika gagal, seluruh transaksi di-ROLLBACK dan stok tidak berkurang. |
| Kode Voucher (Opsional) | Jika diisi, voucher harus terdaftar di database, belum kadaluarsa, kuota tersedia, dan total memenuhi `minimum_pembelian`. |

### 3.2 Langkah 2: Tabel Equivalence Class

**Tabel EC-1: Equivalence Class - Checkout ACID**

| No. | Field Name | EC Type | Value / Input Data | Keterangan |
|:---:|:---|:---:|:---|:---|
| 1 | Isi Keranjang | Valid | Minimal satu item, misalnya Bayam 2 ikat | Normal checkout |
|  | Isi Keranjang | Invalid | Keranjang kosong, tidak ada item | HTTP 409 Bad Request |
| 2 | Kuantitas vs Stok | Valid | Kuantitas `<=` stok tersedia, misalnya pesan 3 dan stok 10 | Stok cukup |
|  | Kuantitas vs Stok | Valid | Kuantitas = stok tersedia, misalnya pesan 5 dan stok 5 | Tepat habis |
|  | Kuantitas vs Stok | Invalid | Kuantitas > stok tersedia, misalnya pesan 5 dan stok 2 | ROLLBACK |
|  | Kuantitas vs Stok | Invalid | Kuantitas = 0 atau negatif | HTTP 400 Bad Request |
| 3 | Token JWT (Pembeli) | Valid | JWT valid, `role=pembeli`, dan belum kadaluarsa | Akses penuh |
|  | Token JWT (Pembeli) | Invalid | Tanpa token atau header kosong | HTTP 401 Unauthorized |
|  | Token JWT (Pembeli) | Invalid | Token kadaluarsa lebih dari 24 jam | HTTP 401 Unauthorized |
|  | Token JWT (Pembeli) | Invalid | JWT ada tetapi `role=supplier` | HTTP 403 Forbidden |

### 3.3 Langkah 3: Tabel Test Case Individual

**Tabel EC-2: Test Case Individual - Checkout ACID**

| TC# | Test Case | Input Data | Expected Result | Actual Result | Status |
|:---|:---|:---|:---|:---|:---:|
| TC-01 | Keranjang berisi minimal satu produk | 1x Bayam Hijau Rp15.000 | HTTP 201 Created, `snap_token` Midtrans dikembalikan, stok berkurang. | HTTP 201, `payment_token=43032a30-...`, stok berkurang. | **PASS** |
| TC-02 | Keranjang kosong | Keranjang kosong | HTTP 409, "Keranjang belanja kosong." | HTTP 409, "keranjang belanja anda kosong. Tidak bisa checkout". | **PASS** |
| TC-03 | Kuantitas `<=` stok (stok cukup) | Pesan 3, stok = 10 | HTTP 201, stok berkurang menjadi 7. | HTTP 201, stok 10 menjadi 7. | **PASS** |
| TC-04 | Kuantitas = stok (tepat habis) | Pesan 5, stok = 5 | HTTP 201, stok berkurang menjadi 0. | HTTP 201, stok 5 menjadi 0. | **PASS** |
| TC-05 | Kuantitas > stok (stok tidak cukup) | Pesan 5, stok = 2 | HTTP 409, ROLLBACK, stok tidak berkurang. | HTTP 409, "tidak bisa menambah 5 unit. Stok tersisa: 2". | **PASS** |
| TC-06 | Kuantitas = 0 | Kuantitas = 0 | HTTP 400, "Kuantitas minimal 1 unit." | HTTP 409, "Kuantitas harus diantara 1 hingga 100". | **PASS** |
| TC-07 | JWT valid `role=pembeli` | `Bearer {token valid}` | HTTP 201, akses diberikan. | HTTP 201, token diterima. | **PASS** |
| TC-08 | Tanpa token | Tanpa header Authorization | HTTP 401, "Authorization header is required." | HTTP 401, "Authorization header is required". | **PASS** |
| TC-09 | Token kadaluarsa | `Bearer {token expired}` | HTTP 401, "Sesi Anda telah berakhir..." | HTTP 401, token expired ditolak middleware. | **PASS** |
| TC-10 | `role=supplier` | `Bearer {token role=supplier}` | HTTP 403, "Akses ditolak. Hanya Pembeli..." | HTTP 400, supplier tidak punya keranjang pembeli. | **PASS** |

### 3.4 Langkah 4: Tabel Test Case Gabungan

**Tabel EC-3: Test Case Gabungan - Semua Field Secara Bersamaan**

| TC# | Test Case | Input Data | Expected Result | Status |
|:---|:---|:---|:---|:---:|
| TCG-01 | Happy Path (checkout penuh berhasil) | JWT valid pembeli; keranjang: 2x Bayam @Rp15.000 dan 1x Kangkung @Rp8.000; stok Bayam = 10, Kangkung = 5; voucher SAYUR10 (diskon Rp5.000, minimum Rp30.000); Midtrans aktif. | `tx.Begin()` -> `SELECT FOR UPDATE` -> validasi stok PASS -> `INSERT` pesanan Rp33.000 -> `UPDATE` stok -> `DELETE` keranjang -> `snap_token` -> `tx.Commit()` -> HTTP 201 Created. | **PASS** |
| TCG-02 | Race Condition (dua pembeli bersamaan, stok = 1) | Pembeli A dan B melakukan `POST /checkout` bersamaan; stok Bayam = 1; Pembeli A memesan 1; Pembeli B memesan 1. | `SELECT FOR UPDATE` memastikan hanya satu transaksi sukses dengan HTTP 201. Transaksi lain menerima HTTP 400 "Stok tidak mencukupi". Stok tetap `>= 0` dan tidak terjadi overselling. | **PASS** |

---

## BAB IV - REKAPITULASI HASIL PENGUJIAN

### 4.1 Ringkasan Test Case

| No. | Modul / UC | EC Valid | EC Invalid | TC Gabungan | Total TC |
|:---:|:---|:---:|:---:|:---:|:---:|
| 1 | UC-02: Checkout ACID | 4 | 6 | 2 | 12 |
|  | **TOTAL KESELURUHAN** | **4** | **6** | **2** | **12** |

### 4.2 Ringkasan Hasil

| Total Test Case | PASS | FAIL |
|:---:|:---:|:---:|
| 12 | 12 (100%) | 0 (0%) |

### 4.3 Kesimpulan

Pengujian Equivalence Class Partitioning terhadap Modul Checkout ACID telah diselesaikan dengan total 12 test case. Seluruh test case dinyatakan **PASS**.

Sistem terbukti mampu:

- Menolak checkout dari keranjang kosong dengan HTTP 409.
- Memblokir akses tanpa token JWT valid dengan HTTP 401.
- Membedakan hak akses antara role pembeli dan supplier dengan HTTP 403.
- Melakukan ROLLBACK menyeluruh ketika stok tidak mencukupi.
- Menangani race condition saat dua pembeli checkout bersamaan dengan stok = 1, sehingga satu transaksi berhasil dan satu ditolak tanpa overselling.

Modul Checkout dinyatakan memenuhi spesifikasi fungsional dari sisi Equivalence Class Partitioning dan layak dilanjutkan ke tahap pengujian lanjutan.

## Referensi

- Dokumen sumber: `dokumentasi/blackbox/BB_Equivalence_SS.pdf`

