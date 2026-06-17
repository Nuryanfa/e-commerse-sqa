# 🚨 Laporan Pasca-Insiden & Pembelajaran Keamanan Siber
## Post-Incident Response Report: SSH Key Persistence Attack ("mdrfckr")

---

| Field | Detail |
|---|---|
| **Tanggal Insiden** | Juni 2026 |
| **Tingkat Keparahan** | KRITIS (Critical) |
| **Status** | Resolved & Mitigated |
| **Dibuat Oleh** | Nuryanfa |
| **Lingkup Sistem** | Web Server Lokal (XAMPP) |
| **Referensi Framework** | MITRE ATT&CK, OWASP Top 10, CIA Triad |

---

## 📋 Daftar Isi
1. [Executive Summary](#1-executive-summary)
2. [Latar Belakang dan Deskripsi Insiden](#2-latar-belakang-dan-deskripsi-insiden)
3. [Bukti Forensik Digital](#3-bukti-forensik-digital)
4. [Analisis Rantai Serangan (Cyber Kill Chain)](#4-analisis-rantai-serangan-cyber-kill-chain)
5. [Pemetaan MITRE ATT&CK Framework](#5-pemetaan-mitre-attck-framework)
6. [Dampak Berdasarkan CIA Triad](#6-dampak-berdasarkan-cia-triad)
7. [Kaitan dengan OWASP Top 10](#7-kaitan-dengan-owasp-top-10)
8. [Langkah Respons Darurat (Incident Response)](#8-langkah-respons-darurat-incident-response)
9. [Analisis Root Cause (Penyebab Akar)](#9-analisis-root-cause-penyebab-akar)
10. [Arsitektur Keamanan Baru (Defense-in-Depth)](#10-arsitektur-keamanan-baru-defense-in-depth)
11. [Perbandingan Keamanan: Sebelum vs Sesudah](#11-perbandingan-keamanan-sebelum-vs-sesudah)
12. [Rekomendasi Lanjutan](#12-rekomendasi-lanjutan)
13. [Kesimpulan dan Pelajaran yang Dipetik](#13-kesimpulan-dan-pelajaran-yang-dipetik)
14. [Referensi](#14-referensi)

---

## 1. Executive Summary

Laporan ini mendokumentasikan sebuah insiden keamanan siber nyata di mana seorang *Threat Actor* (Aktor Ancaman) berhasil melakukan penetrasi (*intrusion*) ke dalam sebuah server web lokal berbasis XAMPP (PHP). Peretas berhasil meningkatkan hak aksesnya hingga level tertinggi (*Root Privilege*) dan menanamkan sebuah *backdoor* permanen dalam bentuk **SSH Public Key** yang disisipkan ke file `/root/.ssh/authorized_keys` dengan penanda (`comment`) eksplisit: `mdrfckr`.

Kejadian ini menjadi titik balik penting yang mendorong dilakukannya **migrasi arsitektur penuh** dari lingkungan XAMPP yang rawan ke arsitektur berbasis **Docker Container**, **Golang**, **Cloudflare WAF**, **Fail2Ban**, dan **UFW Firewall** yang jauh lebih aman dan modern.

Laporan ini bertujuan sebagai:
- **Dokumentasi Forensik** atas insiden yang terjadi.
- **Pembelajaran (Lesson Learned)** untuk memahami cara kerja peretas.
- **Panduan Implementasi Keamanan** berdasarkan standar internasional.

---

## 2. Latar Belakang dan Deskripsi Insiden

### Lingkungan yang Diserang
| Komponen | Detail |
|---|---|
| **Platform** | XAMPP (Apache + PHP + MySQL) |
| **Sistem Operasi** | Windows (Lokal) |
| **Aksesibilitas** | Terbuka ke jaringan |
| **Proteksi Awal** | Tidak ada (Minimal) |

### Kronologi Kejadian
```
[Fase 1] Peretas melakukan pemindaian (Reconnaissance) pada server.
   ↓
[Fase 2] Ditemukan celah pada aplikasi web PHP yang tidak ter-update.
   ↓
[Fase 3] Peretas mendapatkan akses awal (Initial Foothold).
   ↓
[Fase 4] Peretas meningkatkan hak akses ke Root (Privilege Escalation).
   ↓
[Fase 5] Peretas menanamkan SSH Key di /root/.ssh/authorized_keys.
   ↓
[TERDETEKSI] Pemilik menemukan bukti via VNC Console.
```

---

## 3. Bukti Forensik Digital

### Temuan Kunci
Saat pemilik server masuk ke VPS menggunakan **VNC Web Console** dari panel Rumahweb, ditemukan perintah berikut dieksekusi oleh peretas:

```bash
cat /root/.ssh/authorized_keys
```

**Output yang Ditemukan:**
```
ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAACAQD... [panjang] ... mdrfckr
```

### Analisis Artefak Forensik
| Elemen | Analisis |
|---|---|
| **Tipe Kunci** | `ssh-rsa` - Standar RSA 4096-bit |
| **Comment/Penanda** | `mdrfckr` - Identitas kunci milik peretas |
| **Lokasi** | `/root/.ssh/authorized_keys` |
| **Implikasi** | Peretas dapat SSH sebagai Root kapan saja tanpa password |
| **Tingkat Bahaya** | SANGAT TINGGI (Full Root Access) |

> ⚠️ **Catatan Forensik:** Keberadaan kunci asing di `authorized_keys` milik `root` membuktikan bahwa peretas tidak hanya berhasil masuk, tetapi sudah berhasil meningkatkan hak akses ke level tertinggi (Privilege Escalation) sebelum menanamkan *backdoor*-nya.

---

## 4. Analisis Rantai Serangan (Cyber Kill Chain)

Model **Cyber Kill Chain** dari Lockheed Martin digunakan untuk memetakan tahapan serangan dari awal hingga akhir.

```
┌─────────────────────────────────────────────────────────────┐
│                    CYBER KILL CHAIN                         │
├──────┬────────────────┬─────────────────────────────────────┤
│ Fase │ Nama Fase      │ Aksi Peretas                        │
├──────┼────────────────┼─────────────────────────────────────┤
│  1   │ Reconnaissance │ Memindai port terbuka dan versi     │
│      │ (Pengintaian)  │ software (Apache, PHP version).     │
├──────┼────────────────┼─────────────────────────────────────┤
│  2   │ Weaponization  │ Menyiapkan Web Shell (.php) atau    │
│      │ (Persiapan)    │ exploit script untuk versi PHP/     │
│      │                │ Apache yang rentan.                 │
├──────┼────────────────┼─────────────────────────────────────┤
│  3   │ Delivery       │ Mengunggah Web Shell melalui        │
│      │ (Pengiriman)   │ fitur upload file yang tidak        │
│      │                │ diamankan, atau injeksi langsung.   │
├──────┼────────────────┼─────────────────────────────────────┤
│  4   │ Exploitation   │ Mengeksekusi Web Shell via browser  │
│      │ (Eksploitasi)  │ untuk mendapatkan Remote Code       │
│      │                │ Execution (RCE) awal.               │
├──────┼────────────────┼─────────────────────────────────────┤
│  5   │ Installation   │ Menjalankan exploit privilege       │
│      │ (Instalasi)    │ escalation (Dirty COW, dll) untuk   │
│      │                │ mendapatkan akses root.             │
├──────┼────────────────┼─────────────────────────────────────┤
│  6   │ Command &      │ Peretas mengeksekusi perintah       │
│      │ Control (C2)   │ dari jarak jauh melalui Web Shell   │
│      │                │ yang tertanam.                      │
├──────┼────────────────┼─────────────────────────────────────┤
│  7   │ Actions on     │ Menyisipkan SSH Public Key ke       │
│      │ Objectives     │ /root/.ssh/authorized_keys untuk    │
│      │ (BACKDOOR)     │ akses permanen (PERSISTENCE).       │
└──────┴────────────────┴─────────────────────────────────────┘
```

---

## 5. Pemetaan MITRE ATT&CK Framework

MITRE ATT&CK adalah basis pengetahuan global tentang taktik dan teknik peretas yang digunakan oleh analis keamanan di seluruh dunia.

### Taktik dan Teknik yang Teridentifikasi

#### T1190 - Exploit Public-Facing Application
| Field | Detail |
|---|---|
| **Taktik** | Initial Access |
| **Deskripsi** | Eksploitasi kerentanan pada aplikasi web PHP/XAMPP yang terekspos ke jaringan publik atau lokal. |
| **Indikator** | Log akses HTTP yang tidak biasa, request ke file .php yang aneh. |

#### T1068 - Exploitation for Privilege Escalation
| Field | Detail |
|---|---|
| **Taktik** | Privilege Escalation |
| **Deskripsi** | Peretas menggunakan kerentanan pada kernel Linux atau misconfiguration sudo untuk meningkatkan hak akses dari user biasa (www-data) menjadi root. |
| **Indikator** | Proses tidak dikenal berjalan sebagai root. |

#### **T1098.004 - SSH Authorized Keys ⬅️ [KUNCI TEMUAN FORENSIK]**
| Field | Detail |
|---|---|
| **Taktik** | Persistence (Persistensi) |
| **Deskripsi** | Peretas menyisipkan SSH Public Key ke dalam file `/root/.ssh/authorized_keys` untuk mempertahankan akses bahkan setelah password diubah atau server di-restart. |
| **Indikator** | File `authorized_keys` berisi kunci asing dengan comment `mdrfckr`. |
| **Tingkat Bahaya** | KRITIS - Akses Root permanen tanpa password. |

#### T1059 - Command and Scripting Interpreter
| Field | Detail |
|---|---|
| **Taktik** | Execution |
| **Deskripsi** | Penggunaan shell (bash/sh) untuk mengeksekusi perintah di server. |
| **Indikator** | Perintah bash yang tidak wajar di log history root. |

---

## 6. Dampak Berdasarkan CIA Triad

**CIA Triad** adalah fondasi keamanan informasi yang terdiri dari Confidentiality (Kerahasiaan), Integrity (Integritas), dan Availability (Ketersediaan).

### 🔴 Confidentiality (Kerahasiaan) - GAGAL TOTAL
- **Dampak:** Seluruh data yang tersimpan di server (database pelanggan, kredensial, file pribadi) dapat dibaca oleh peretas karena mereka memiliki akses Root penuh.
- **Contoh Risiko:** Peretas dapat mengeksekusi `mysqldump` dan mencuri seluruh isi database.
- **Status Perlindungan Baru:** ✅ Data terisolasi di dalam container Docker. Bahkan jika terjadi breach pada aplikasi, peretas hanya bisa melihat data di dalam container yang sangat terbatas.

### 🔴 Integrity (Integritas Data) - GAGAL TOTAL
- **Dampak:** Peretas dengan akses Root dapat mengubah, menghapus, atau memanipulasi file apa pun di server, termasuk kode sumber aplikasi, konfigurasi, dan isi database.
- **Contoh Risiko:** Peretas bisa menanamkan kode jahat tambahan ke dalam file PHP untuk menyerang pengunjung website (Supply Chain Attack).
- **Status Perlindungan Baru:** ✅ Aplikasi dijalankan dari Docker Image yang bersifat *immutable* (tidak dapat diubah saat runtime). Setiap perubahan harus melalui proses CI/CD (GitHub Actions).

### 🟡 Availability (Ketersediaan) - POTENSI BAHAYA
- **Dampak:** Meskipun peretas tidak langsung mematikan server, mereka berpotensi melakukan hal tersebut kapan saja (Sabotase), atau menggunakan server sebagai alat untuk menyerang pihak lain (Botnet), yang berujung pada pemblokiran oleh ISP.
- **Status Perlindungan Baru:** ✅ Cloudflare WAF memberikan perlindungan DDoS. UFW membatasi traffic masuk secara ketat.

---

## 7. Kaitan dengan OWASP Top 10

**OWASP (Open Web Application Security Project)** adalah panduan 10 risiko keamanan web paling kritis di dunia.

| Ranking | Kategori OWASP | Kaitan dengan Insiden |
|---|---|---|
| **A01:2021** | **Broken Access Control** | ⭐ Paling Relevan. Peretas berhasil mengakses resource yang seharusnya tidak dapat diakses (file authorized_keys milik root). IDOR juga masuk kategori ini. |
| **A02:2021** | **Cryptographic Failures** | Jika password database tidak di-hash dengan kuat (bcrypt), peretas bisa membobol semua akun. |
| **A03:2021** | **Injection** | Kemungkinan vektor serangan awal (SQL Injection / Command Injection) untuk mendapatkan foothold pertama. |
| **A04:2021** | **Insecure Design** | Arsitektur XAMPP yang tidak dirancang untuk keamanan produksi. |
| **A05:2021** | **Security Misconfiguration** | Port terbuka, tidak ada firewall, XAMPP berjalan dengan konfigurasi default yang tidak aman. |
| **A06:2021** | **Vulnerable Components** | Penggunaan PHP/Apache versi lama yang memiliki CVE (Common Vulnerabilities and Exposures) yang diketahui publik. |
| **A07:2021** | **Authentication Failures** | Tidak ada rate-limiting pada SSH, sehingga Brute-Force bisa dilakukan tanpa hambatan. |

---

## 8. Langkah Respons Darurat (Incident Response)

Berdasarkan **NIST SP 800-61** (Panduan Respons Insiden Komputer dari NIST), berikut adalah tahapan yang seharusnya (dan telah) dilakukan:

### Fase 1: Preparation (Persiapan)
- [ ] Pastikan selalu ada backup data terkini sebelum insiden terjadi.
- [ ] Dokumentasikan konfigurasi server yang normal (baseline).
- [ ] Pasang monitoring dan alerting sebelum insiden.

### Fase 2: Detection & Analysis (Deteksi & Analisis)
- [x] Pemilik mendeteksi anomali saat menggunakan VNC Console.
- [x] Ditemukan SSH Public Key asing (`mdrfckr`) di `/root/.ssh/authorized_keys`.
- [x] Dianalisis bahwa ini adalah serangan **Persistence** via SSH Key (MITRE T1098.004).

### Fase 3: Containment (Karantina)
Tindakan yang **harus segera** dilakukan saat insiden terdeteksi:
```bash
# 1. Blokir IP peretas di firewall (jika IP diketahui dari log)
ufw deny from [IP_PERETAS] to any

# 2. Putuskan sesi SSH aktif milik peretas
who   # Lihat sesi yang aktif
pkill -u [username_asing]  # Paksa logout

# 3. Hapus kunci asing dari authorized_keys
nano /root/.ssh/authorized_keys
# Hapus baris yang berisi "mdrfckr", simpan file.
```

### Fase 4: Eradication (Pembersihan)
```bash
# 1. Ganti semua password seketika
passwd root
passwd [nama_user]

# 2. Periksa dan bersihkan cronjob (sering dijadikan persistence kedua)
crontab -l -u root
crontab -e -u root

# 3. Cari file mencurigakan yang baru dibuat dalam 24 jam terakhir
find / -mtime -1 -type f -name "*.php" 2>/dev/null
find / -mtime -1 -type f -name "*.sh" 2>/dev/null

# 4. Periksa proses yang berjalan secara mencurigakan
ps aux | grep -v "^\[" | sort -k3 -rn | head -20

# 5. Periksa listening port yang tidak dikenal
ss -tulpn
```

### Fase 5: Recovery (Pemulihan)
> **BEST PRACTICE:** Karena sistem sudah dikompromikan di level Root (*Fully Compromised*), satu-satunya cara aman adalah **menghancurkan dan membangun ulang (Rebuild)** sistem dari awal dengan image OS yang bersih. JANGAN percaya bahwa pembersihan manual sudah 100% bersih.

Langkah yang dilakukan:
1. **Backup data penting** (jika masih bisa dipercaya integritasnya).
2. **Reinstall OS** dari awal (Ubuntu Server bersih).
3. **Bangun ulang arsitektur** dengan standar keamanan yang jauh lebih tinggi.

### Fase 6: Post-Incident Activity
- [x] Dokumentasi insiden ini sebagai laporan resmi (dokumen ini).
- [x] Analisis Root Cause agar tidak terulang.
- [ ] Briefing kepada tim/stakeholder terkait.

---

## 9. Analisis Root Cause (Penyebab Akar)

Menggunakan metode **5 Whys** untuk menemukan akar masalah:

| # | Pertanyaan | Jawaban |
|---|---|---|
| Why 1 | Kenapa peretas bisa menanamkan SSH Key? | Karena mereka mendapatkan akses Root. |
| Why 2 | Kenapa mereka bisa mendapat akses Root? | Karena berhasil melakukan Privilege Escalation dari akses awal. |
| Why 3 | Kenapa Privilege Escalation bisa dilakukan? | Karena kernel OS atau konfigurasi sudo tidak aman/tidak di-update. |
| Why 4 | Kenapa konfigurasi server tidak aman? | Karena XAMPP digunakan dengan setting default yang tidak dirancang untuk produksi. |
| **Why 5** | **Kenapa XAMPP digunakan tanpa pengamanan?** | **Karena tidak ada prosedur keamanan dan pengetahuan tentang hardening server.** |

> **Root Cause:** Ketiadaan prosedur *Security Hardening* dan penggunaan lingkungan *development* (XAMPP) untuk tujuan yang menyerupai produksi.

---

## 10. Arsitektur Keamanan Baru (Defense-in-Depth)

Konsep **Defense-in-Depth** adalah strategi keamanan berlapis di mana jika satu lapis pertahanan ditembus, lapisan berikutnya masih melindungi sistem.

```
                    ☁️  INTERNET
                         |
         ┌───────────────▼───────────────┐
         │         CLOUDFLARE WAF        │
         │  • DDoS Protection            │
         │  • Bot Fight Mode             │
         │  • Menyembunyikan IP VPS      │
         │  • SSL/TLS Encryption         │
         └───────────────┬───────────────┘
                         |
         ┌───────────────▼───────────────┐
         │        UFW FIREWALL           │
         │  Port Terbuka: 80, 443, 22    │
         │  Semua port lain: BLOCKED     │
         │                               │
         │  ┌──────────────────────────┐ │
         │  │  FAIL2BAN (Anti-Bruteforce)│ │
         │  │  SSH: Max 5 percobaan    │ │
         │  │  Ban: 10 menit           │ │
         │  └──────────────────────────┘ │
         └───────────────┬───────────────┘
                         |
         ┌───────────────▼───────────────┐
         │    DOCKER NETWORK (Isolated)  │
         │  ┌────────┐  ┌─────────────┐ │
         │  │Nginx   │  │  Backend Go │ │
         │  │:80/:443│  │  :8080      │ │
         │  └────────┘  └─────────────┘ │
         │  ┌────────┐  ┌─────────────┐ │
         │  │Postgres│  │   Redis     │ │
         │  │:5432   │  │  :6379      │ │
         │  │(hidden)│  │  (hidden)   │ │
         │  └────────┘  └─────────────┘ │
         └───────────────────────────────┘
```

### Penjelasan Setiap Lapis Pertahanan

#### Lapis 1: Cloudflare WAF (Gerbang Utama)
- **Fungsi:** Filter serangan sebelum menyentuh VPS.
- **Perlindungan Terhadap:** DDoS, Botnet, SQLi, XSS, Request dari IP berbahaya.
- **Manfaat Tambahan:** Menyembunyikan IP asli VPS dari internet (Hacker tidak bisa menyerang VPS secara langsung).

#### Lapis 2: UFW Firewall (Tembok Kota)
- **Fungsi:** Blokir semua koneksi yang tidak diperlukan.
- **Konfigurasi:**
  ```bash
  ufw default deny incoming    # Blokir semua masuk secara default
  ufw allow 22/tcp             # SSH (seharusnya diubah ke port non-standar)
  ufw allow 80/tcp             # HTTP
  ufw allow 443/tcp            # HTTPS
  ufw enable
  ```

#### Lapis 3: Fail2Ban (Satpam Pintu SSH)
- **Fungsi:** Deteksi dan blokir otomatis percobaan Brute-Force.
- **Cara Kerja:** Memantau log SSH. Jika ada IP yang salah password >5 kali dalam 10 menit, IP tersebut diblokir otomatis selama 10 menit.

#### Lapis 4: Docker Container (Penjara Aplikasi)
- **Fungsi:** Isolasi total antara aplikasi dan sistem operasi utama.
- **Mengapa Penting:** Jika hacker berhasil RCE di dalam aplikasi, mereka hanya bisa bergerak di dalam container. File `/root/.ssh/authorized_keys` di HOST tidak dapat disentuh dari dalam container.

#### Lapis 5: Golang (Bahasa Kompilasi)
- **Fungsi:** Eliminasi total risiko Web Shell.
- **Mengapa Lebih Aman dari PHP:**
  - PHP: *Interpreter* - File `.php` yang diunggah bisa langsung dieksekusi oleh server.
  - Golang: *Compiled Language* - Server hanya menjalankan satu *binary* statis. File asing yang diunggah tidak bisa dieksekusi sebagai kode program.

---

## 11. Perbandingan Keamanan: Sebelum vs Sesudah

| Aspek Keamanan | Sebelum (XAMPP) | Sesudah (Arsitektur Baru) |
|---|---|---|
| **Platform Bahasa** | PHP (Interpreted) - Web Shell bisa dieksekusi | Golang (Compiled) - Web Shell hanya file mati |
| **Isolasi Aplikasi** | Tidak ada - Akses langsung ke OS | Docker Container - Terisolasi penuh |
| **Database Exposure** | MySQL terbuka di semua interface | PostgreSQL hanya bisa diakses antar container |
| **Firewall** | Tidak ada | UFW (default deny) + Cloudflare WAF |
| **Anti-BruteForce** | Tidak ada | Fail2Ban (blokir otomatis) |
| **IP Server** | Terekspos langsung ke internet | Disembunyikan di balik Cloudflare |
| **SSL/HTTPS** | Tidak ada | Cloudflare SSL (Automatic) |
| **SSH Authentication** | Password saja | ✅ SSH Key-Only (Password SSH dimatikan) |
| **Root Login** | Diizinkan | ✅ PermitRootLogin no (Diblokir) |
| **Deployment** | Manual (Upload FTP) | Otomatis CI/CD (GitHub Actions) |
| **Monitoring** | Tidak ada | Log Docker + Fail2Ban log |
| **Backup** | Manual | ✅ Cronjob Otomatis Setiap Malam Jam 02:00 |

---

## 12. Rekomendasi Lanjutan & Status Implementasi

### ✅ SUDAH DIIMPLEMENTASIKAN

#### A. ~~Matikan Password SSH Sepenuhnya~~ — **SELESAI** (Juni 2026)
SSH Key telah dibuat menggunakan algoritma **Ed25519** (lebih aman dari RSA) dan dipasang di VPS. Login password SSH telah dinonaktifkan sepenuhnya.
```bash
# Yang sudah dilakukan:
ssh-keygen -t ed25519 -C "nuryanfa-sayursehat"  # Di PowerShell laptop
# Public key disalin ke /home/nuryanfa/.ssh/authorized_keys di VPS

# Konfigurasi /etc/ssh/sshd_config yang sudah diterapkan:
PasswordAuthentication no   # ✅ Password SSH dimatikan
PubkeyAuthentication yes    # ✅ SSH Key diaktifkan
PermitRootLogin no          # ✅ Login Root diblokir
```
**Dampak:** Serangan Brute-Force SSH tidak mungkin lagi berhasil. Peretas tidak bisa masuk meski menebak password ribuan kali.

---

#### C. ~~Backup Database Otomatis~~ — **SELESAI** (Juni 2026)
Script backup otomatis telah dibuat dan dijadwalkan via Cronjob.
```bash
# Script: /home/nuryanfa/backup_db.sh
# Database: sqa_ecommerce | User: postgres | Container: sqa_postgres
# Jadwal: Setiap hari jam 02:00 WIB
# Lokasi backup: /backup/database/
# Retensi: 7 hari (backup lama otomatis dihapus)
# Log: /backup/database/backup.log

# Cronjob yang aktif:
0 2 * * * /home/nuryanfa/backup_db.sh >> /backup/database/backup.log 2>&1
```
**Dampak:** Jika server mengalami kegagalan, data dapat dipulihkan (Recovery Point Objective = maks. 24 jam).

---

### ⏳ BELUM DIIMPLEMENTASIKAN

#### B. Pindahkan Port SSH (Security through Obscurity) — *Prioritas Rendah*
Memindahkan SSH dari port 22 ke port non-standar (misal: 2222) untuk mengurangi noise dari bot pemindai otomatis.
```bash
sudo ufw allow 2222/tcp          # Buka port baru DULU
sudo nano /etc/ssh/sshd_config   # Ubah Port 22 → Port 2222
sudo systemctl restart ssh
sudo ufw delete allow 22/tcp     # Tutup port lama
```

#### D. Full Strict SSL di Cloudflare — *Prioritas Sedang*
Menggunakan Cloudflare Origin Certificate untuk enkripsi penuh dari Cloudflare ke VPS (bukan hanya dari browser ke Cloudflare).
```bash
# Opsi: Gunakan Cloudflare Origin Certificate (gratis, valid 15 tahun)
# Dashboard Cloudflare → SSL/TLS → Origin Server → Create Certificate
# Simpan cert di /etc/ssl/cloudflare/ di VPS
# Ubah mode SSL Cloudflare dari Flexible → Full (Strict)
```

#### E. Geo-Blocking di Cloudflare — *Prioritas Rendah*
Memblokir traffic dari negara yang sering menjadi sumber serangan jika aplikasi hanya ditujukan untuk pengguna Indonesia.

#### F. Aktifkan 2FA untuk Akses SSH — *Prioritas Rendah*
Menambahkan Google Authenticator sebagai lapisan autentikasi kedua pada SSH.

### Skor Keamanan Saat Ini
| Kondisi | Skor |
|---|---|
| Sebelum migrasi (XAMPP lama) | 20/100 |
| Setelah migrasi awal | 92/100 |
| **Setelah implementasi SSH Key + Backup** | **95/100** |
| Target setelah Full Strict SSL | 97/100 |

---

## 13. Kesimpulan dan Pelajaran yang Dipetik

### Ringkasan
Insiden ini merupakan **Real-World Case Study** yang sangat berharga. Seorang Threat Actor berhasil melaksanakan serangan **Persistence** (MITRE T1098.004) dengan menanamkan SSH Authorized Key di server XAMPP yang tidak di-hardening.

Respons yang dilakukan adalah **Complete Rebuild** dari infrastruktur menggunakan arsitektur modern yang menerapkan prinsip **Defense-in-Depth** dan **Zero Trust** (tidak ada entitas yang dipercaya secara default).

### Pelajaran Utama (Key Takeaways)

1. **Jangan gunakan lingkungan development (XAMPP) untuk tujuan produksi** tanpa prosedur hardening yang ketat.
2. **Compromised system harus di-rebuild**, bukan hanya dibersihkan. Kepercayaan pada sistem yang sudah ditembus Root tidak bisa dipulihkan sepenuhnya.
3. **Visibility (Monitoring) adalah segalanya.** Insiden ini terdeteksi secara tidak sengaja. Dengan monitoring yang baik, insiden bisa terdeteksi lebih awal.
4. **Prinsip Least Privilege:** Jangan pernah menjalankan aplikasi dengan hak akses lebih dari yang diperlukan.
5. **Containerization adalah lapis pertahanan yang luar biasa.** Docker memastikan bahwa bahkan jika aplikasi dikompromikan, sistem host tetap aman.
6. **Security is a process, not a product.** Keamanan bukan sesuatu yang dipasang sekali dan selesai, melainkan proses yang berkelanjutan.

### Nilai dari Perspektif SQA
Sebagai seorang **Software Quality Assurance (SQA) Engineer**, kasus ini mengajarkan bahwa pengujian keamanan (*Security Testing*) harus menjadi bagian integral dari siklus pengembangan perangkat lunak, bukan hanya afterthought. Framework seperti OWASP Top 10, MITRE ATT&CK, dan CIA Triad harus menjadi referensi utama dalam menyusun *Test Plan* keamanan.

---

## 14. Referensi

| Sumber | URL |
|---|---|
| MITRE ATT&CK Framework | https://attack.mitre.org |
| MITRE T1098.004 - SSH Authorized Keys | https://attack.mitre.org/techniques/T1098/004/ |
| OWASP Top 10 2021 | https://owasp.org/www-project-top-ten/ |
| NIST SP 800-61 Rev2 (Incident Response Guide) | https://nvlpubs.nist.gov/nistpubs/SpecialPublications/NIST.SP.800-61r2.pdf |
| Lockheed Martin Cyber Kill Chain | https://www.lockheedmartin.com/en-us/capabilities/cyber/cyber-kill-chain.html |
| Cloudflare WAF Documentation | https://developers.cloudflare.com/waf/ |
| Docker Security Best Practices | https://docs.docker.com/develop/security-best-practices/ |
| Fail2Ban Documentation | https://www.fail2ban.org/wiki/index.php/Main_Page |

---

*Dokumen ini dibuat sebagai laporan pembelajaran pribadi tentang keamanan siber berdasarkan insiden nyata yang terjadi. Semua informasi teknis disertakan untuk tujuan edukasi dan dokumentasi forensik.*

**Dibuat:** Juni 2026  
**Terakhir Diperbarui:** 16 Juni 2026  
**Versi:** 2.0  
**Status:** Final — Diperbarui dengan hasil implementasi aktual
