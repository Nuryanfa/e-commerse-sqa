# LAPORAN SOFTWARE QUALITY ASSURANCE

## METODE BLACKBOX - BOUNDARY VALUE ANALYSIS

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

Dokumen ini merupakan laporan pengujian Black Box Testing menggunakan metode Boundary Value Analysis (BVA) yang diterapkan pada Modul Checkout ACID Aplikasi E-Commerce UMKM Penjualan Sayuran Segar. Tujuan dokumen adalah mendokumentasikan semua titik batas (*boundary points*) yang diuji beserta hasil eksekusinya secara sistematis.

Dokumen ini mengacu pada standar IEEE 829 untuk dokumentasi pengujian perangkat lunak dan merupakan dokumen terpisah dari laporan Equivalence Class Partitioning.

### 1.2 Ruang Lingkup

Pengujian difokuskan pada field numerik yang memiliki batas bawah dan batas atas terdefinisi:

- **Field:** Kuantitas Pesanan (Modul UC-02: Checkout ACID)
- **Batas Bawah:** 1 unit (minimum pemesanan)
- **Batas Atas:** Stok tersedia di database (contoh pengujian: 10 unit)

### 1.3 Definisi Metode - Boundary Value Analysis

Boundary Value Analysis (BVA) adalah teknik pengujian yang melengkapi Equivalence Class Partitioning dengan menguji nilai-nilai tepat pada dan di sekitar batas partisi. Teknik ini didasarkan pada temuan empiris bahwa sebagian besar cacat perangkat lunak terjadi pada nilai-nilai di sekitar batas (*edge cases*).

Enam titik uji standar BVA:

| Titik Uji | Notasi | Deskripsi |
|:---|:---:|:---|
| Di bawah batas bawah | Min-1 | Satu nilai di bawah nilai minimum - diharapkan **DITOLAK** sistem. |
| Tepat batas bawah | Min | Nilai minimum yang valid - diharapkan **DITERIMA** sistem. |
| Satu di atas batas bawah | Min+1 | Nilai tepat satu di atas minimum - diharapkan **DITERIMA** sistem. |
| Satu di bawah batas atas | Max-1 | Nilai tepat satu di bawah maksimum - diharapkan **DITERIMA** sistem. |
| Tepat batas atas | Max | Nilai maksimum yang valid - diharapkan **DITERIMA** sistem. |
| Di atas batas atas | Max+1 | Satu nilai di atas maksimum - diharapkan **DITOLAK** sistem. |

### 1.4 Prosedur Penerapan

1. Identifikasi field numerik dengan batas bawah dan batas atas terdefinisi.
2. Tentukan nilai Min, Min-1, Min+1, Max-1, Max, dan Max+1 untuk setiap field.
3. Buat tabel BVA lengkap dengan titik uji dan nilai input.
4. Buat tabel Test Case BVA dan eksekusi setiap test case.

---

## BAB II - ANALISIS BATAS NILAI: KUANTITAS PESANAN

### 2.1 Identifikasi Batas Field

| Atribut | Detail |
|:---|:---|
| Field | Kuantitas Pesanan |
| Endpoint | `POST /api/v1/orders/checkout` |
| Tipe Data | Integer |
| Batas Bawah (Min) | 1 unit - kuantitas minimum yang dapat dipesan |
| Batas Atas (Max) | Stok tersedia di database (skenario pengujian: 10 unit) |
| Behavior di bawah Min | HTTP 400/409 Bad Request - kuantitas ditolak |
| Behavior di atas Max | HTTP 409 Conflict + ROLLBACK - stok tidak mencukupi |
| Validasi di level | Cart level (pre-checkout) dan transaksi ACID (`SELECT FOR UPDATE`) |

### 2.2 Diagram Partisi Nilai Batas

Ilustrasi pembagian partisi dan titik uji BVA untuk field Kuantitas Pesanan (stok = 10):

| Min-1 | Min | Min+1 | Rentang Valid | Max-1 | Max | Max+1 |
|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| 0 unit | 1 unit | 2 unit | 3-8 unit | 9 unit | 10 unit | 11 unit |
| **INVALID** | **VALID** | **VALID** | **VALID** | **VALID** | **VALID** | **INVALID** |

Keterangan: titik Min-1 dan Max+1 ditolak sistem, sedangkan nilai Min hingga Max diterima sistem.

### 2.3 Tabel Boundary Value Analysis

**Tabel BVA-1: Titik Uji Boundary Value Analysis - Kuantitas Pesanan**

| No. | Field Name | Batas Acuan | Titik Uji | Nilai Input | Keterangan |
|:---:|:---|:---|:---:|:---:|:---|
| 1 | Kuantitas Pesanan | Min = 1 unit | Min-1 | 0 unit | Di bawah minimum - **DITOLAK** |
| 2 | Kuantitas Pesanan | Min = 1 unit | Min | 1 unit | Tepat minimum - **DITERIMA** |
| 3 | Kuantitas Pesanan | Min = 1 unit | Min+1 | 2 unit | Satu di atas minimum - **DITERIMA** |
| 4 | Kuantitas Pesanan | Max = 10 unit (stok = 10) | Max-1 | 9 unit | Satu di bawah stok - **DITERIMA** |
| 5 | Kuantitas Pesanan | Max = 10 unit (stok = 10) | Max | 10 unit | Tepat sama stok - **DITERIMA** |
| 6 | Kuantitas Pesanan | Max = 10 unit (stok = 10) | Max+1 | 11 unit | Melebihi stok - **ROLLBACK, DITOLAK** |

---

## BAB III - TEST CASE BOUNDARY VALUE ANALYSIS

### 3.1 Tabel Test Case BVA - Kuantitas Pesanan (Stok = 10)

**Tabel BVA-2: Test Case BVA - Kuantitas Pesanan**

| TC# | Titik Uji | Input Data | Expected Result | Actual Result | Status |
|:---|:---:|:---|:---|:---|:---:|
| TC-BVA-01 | Min-1 | 0 unit (stok = 10) | Sistem menolak. HTTP 400 Bad Request: "Kuantitas pesanan minimal 1 unit." Stok tidak berubah. | HTTP 400, "Kuantitas harus diantara 1 hingga 100", stok tetap 10. | **PASS** |
| TC-BVA-02 | Min | 1 unit (stok = 10) | Sistem menerima kuantitas minimum. Validasi `1 <= 10`. `tx.Commit()`. Stok berkurang menjadi 9. HTTP 201 Created. | HTTP 201, stok 10 menjadi 9. | **PASS** |
| TC-BVA-03 | Min+1 | 2 unit (stok = 10) | Sistem menerima. Validasi `2 <= 10` lolos. `tx.Commit()`. Stok berkurang menjadi 8. HTTP 201 Created. | HTTP 201, stok 10 menjadi 8. | **PASS** |
| TC-BVA-04 | Max-1 | 9 unit (stok = 10) | Sistem menerima. Validasi `9 <= 10` lolos. `tx.Commit()`. Stok berkurang menjadi 1. HTTP 201 Created. | HTTP 201, stok 10 menjadi 1. | **PASS** |
| TC-BVA-05 | Max | 10 unit (stok = 10) | Sistem menerima tepat sama dengan stok. Validasi `10 <= 10` lolos. `tx.Commit()`. Stok berkurang menjadi 0. HTTP 201 Created. | HTTP 201, stok 10 menjadi 0. | **PASS** |
| TC-BVA-06 | Max+1 | 11 unit (stok = 10) | Validasi gagal: `11 > 10`. `tx.Rollback()`. HTTP 400 Bad Request: "Stok tidak mencukupi. Stok tersedia: 10, Anda memesan: 11." Stok tetap 10. | HTTP 400, "tidak bisa menambah 11 unit. Stok tersisa: 10", stok tetap 10. | **PASS** |

### 3.2 Analisis Detail Setiap Titik Batas

| TC# | Titik | Analisis SQA |
|:---|:---|:---|
| TC-BVA-01 | Min-1 (0) | Input 0 unit merepresentasikan batas bawah yang tidak valid. Sistem berhasil menolak sebelum transaksi ACID dimulai karena validasi dilakukan di cart level. Tidak ada perubahan pada database. Response code dan pesan error sesuai spesifikasi. |
| TC-BVA-02 | Min (1) | Input 1 unit adalah nilai minimum valid. Ini merupakan edge case kritis karena tepat di batas bawah partisi valid. Sistem berhasil memproses `SELECT FOR UPDATE`, `INSERT`, `UPDATE` stok, dan `Commit` secara normal. Stok 10 menjadi 9. |
| TC-BVA-03 | Min+1 (2) | Input 2 unit adalah satu langkah di atas batas bawah. Pengujian memverifikasi bahwa sistem tidak hanya menerima nilai minimum, tetapi juga nilai di atas minimum secara konsisten. Stok 10 menjadi 8. |
| TC-BVA-04 | Max-1 (9) | Input 9 unit, satu di bawah stok, adalah nilai kritis di batas atas. Validasi `9 <= 10` lolos. Pengujian memastikan tidak ada off-by-one error pada validasi atas. Stok 10 menjadi 1. |
| TC-BVA-05 | Max (10) | Input 10 unit tepat sama dengan stok tersedia. Ini adalah edge case paling kritis di batas atas karena menguji penggunaan operator `<=` atau `<`. Sistem menerima `10 <= 10`. Stok 10 menjadi 0 tanpa error. |
| TC-BVA-06 | Max+1 (11) | Input 11 unit melampaui stok tersedia. Validasi gagal karena `11 > 10`. `tx.Rollback()` dieksekusi sehingga tidak ada perubahan stok dan pesanan tidak dibuat. Respons HTTP dan pesan error informatif. Mekanisme ACID berfungsi dengan benar. |

---

## BAB IV - REKAPITULASI HASIL PENGUJIAN BVA

### 4.1 Ringkasan Titik Uji BVA

| No. | Modul / Field | BVA Points | TC Total | PASS | FAIL |
|:---:|:---|:---:|:---:|:---:|:---:|
| 1 | UC-02: Kuantitas Pesanan Checkout ACID | 6 | 6 | 6 | 0 |
|  | **TOTAL KESELURUHAN** | **6** | **6** | **6 (100%)** | **0 (0%)** |

### 4.2 Ringkasan Hasil per Jenis Titik Batas

| Titik Uji | Nilai Input | Perilaku Diharapkan | HTTP Response Aktual | Status |
|:---|:---:|:---|:---|:---:|
| Min-1 (0 unit) | 0 | Ditolak - INVALID | HTTP 400, "Kuantitas harus diantara 1 hingga 100" | **PASS** |
| Min (1 unit) | 1 | Diterima - VALID | HTTP 201, stok 10 menjadi 9 | **PASS** |
| Min+1 (2 unit) | 2 | Diterima - VALID | HTTP 201, stok 10 menjadi 8 | **PASS** |
| Max-1 (9 unit) | 9 | Diterima - VALID | HTTP 201, stok 10 menjadi 1 | **PASS** |
| Max (10 unit) | 10 | Diterima - VALID | HTTP 201, stok 10 menjadi 0 | **PASS** |
| Max+1 (11 unit) | 11 | Ditolak - INVALID | HTTP 400, "tidak bisa menambah 11 unit" | **PASS** |

### 4.3 Temuan dan Observasi SQA

| Aspek | Temuan |
|:---|:---|
| Validasi Batas Bawah | Sistem menggunakan kondisi `>= 1` dengan benar. Nilai 0 konsisten ditolak. Validasi terjadi di level cart sebelum transaksi ACID sehingga tidak ada overhead database yang tidak perlu. |
| Validasi Batas Atas | Sistem menggunakan kondisi `<= stok` dengan benar (inclusive). Nilai Max (10) diterima dan menghasilkan stok 0 tanpa error. Tidak ditemukan off-by-one error. |
| Mekanisme ROLLBACK | Pada titik Max+1 (11 unit), `tx.Rollback()` berhasil dieksekusi. Stok tidak berkurang dan pesanan tidak dibuat. Atomicity ACID terjaga. |
| Pesan Error | Pesan error pada titik invalid Min-1 dan Max+1 informatif serta menyertakan nilai aktual stok tersedia sehingga memudahkan debugging. |
| Tidak Ada Off-by-One Bug | Tidak ditemukan off-by-one error pada kedua batas. Min (1) diterima dan Min-1 (0) ditolak. Max (10 = stok) diterima dan Max+1 (11) ditolak dengan benar. |

### 4.4 Kesimpulan

Pengujian Boundary Value Analysis terhadap field Kuantitas Pesanan pada Modul Checkout ACID telah diselesaikan. Seluruh 6 test case, yang mencakup enam titik batas Min-1, Min, Min+1, Max-1, Max, dan Max+1, dinyatakan **PASS**.

Temuan utama menunjukkan bahwa sistem tidak mengandung bug off-by-one pada validasi kuantitas. Batas bawah (`>= 1`) dan batas atas (`<= stok_tersedia`) diimplementasikan dengan benar menggunakan operator inclusive. Mekanisme ROLLBACK ACID berfungsi optimal pada kasus pelampauan batas atas.

Modul Checkout dinyatakan memenuhi spesifikasi fungsional dari sisi Boundary Value Analysis dan tidak ditemukan defect pada nilai-nilai batas yang diuji.

## Referensi

- Dokumen sumber: `dokumentasi/blackbox/BB_Boundary_Value_Analysis_SS.pdf`

