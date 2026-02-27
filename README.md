# 🥬 SayurSehat — E-Commerce Sayur Segar

Marketplace sayur segar langsung dari petani lokal. Dibangun dengan **Go (Gin + GORM)** backend dan **React + Tailwind CSS v4** frontend.

---

## 🏗️ Tech Stack

| Layer | Teknologi |
|-------|-----------|
| Backend | Go, Gin, GORM, PostgreSQL, Redis, JWT, bcrypt |
| Frontend | React 19, Vite 7, Tailwind CSS v4, React Router |
| Infra | Docker (PostgreSQL + Redis), CORS |

---

## 🚀 Cara Menjalankan

### Prerequisites
- Go 1.21+
- Node.js 20+
- Docker Desktop (untuk PostgreSQL & Redis)
- Git

### 1. Clone & Setup
```bash
git clone https://github.com/Nuryanfa/e-commerse-sqa.git
cd e-commerse-sqa
```

### 2. Jalankan Database (Docker)
```bash
docker-compose up -d
```

### 3. Backend
```bash
cd backend-go
cp .env.example .env   # sesuaikan jika perlu
go run cmd/seed/main.go   # seed dummy data
go run cmd/api/main.go     # jalankan server di :8080
```

### 4. Frontend
```bash
cd frontend-react
npm install
npm run dev   # jalankan di http://localhost:5173
```

---

## 👤 Akun Dummy

> Semua akun menggunakan password: **`password123`**

| Role | Nama | Email | Akses |
|------|------|-------|-------|
| 🛡️ **Admin** | Admin SayurSehat | `admin@sayursehat.id` | Kelola produk & kategori |
| 🧑‍🌾 **Supplier** | Pak Tani Segar | `supplier@sayursehat.id` | CRUD produk milik sendiri, lihat pesanan |
| 🚚 **Courier** | Kurir Cepat | `kurir@sayursehat.id` | Ambil pesanan PAID, tandai delivered |
| 🛒 **Pembeli** | Budi Pembeli | `pembeli@sayursehat.id` | Belanja, keranjang, checkout, bayar |

---

## 📦 API Endpoints

### Public
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| POST | `/api/users/register` | Registrasi (role: pembeli/supplier/courier) |
| POST | `/api/users/login` | Login → JWT token |
| GET | `/api/products` | Semua produk |
| GET | `/api/products/:id` | Detail produk |
| GET | `/api/products/search?q=&category=` | Cari produk |
| GET | `/api/categories` | Semua kategori |

### Pembeli (JWT Required)
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/api/cart` | Lihat keranjang |
| POST | `/api/cart` | Tambah ke keranjang |
| PUT | `/api/cart/:id` | Update jumlah |
| DELETE | `/api/cart/:id` | Hapus item |
| POST | `/api/orders/checkout` | Checkout |
| GET | `/api/orders` | Riwayat pesanan |
| GET | `/api/orders/:id` | Detail pesanan |
| PATCH | `/api/orders/:id/pay` | Bayar pesanan |

### Supplier (JWT + Role)
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/api/supplier/products` | Produk saya |
| POST | `/api/supplier/products` | Tambah produk |
| PUT | `/api/supplier/products/:id` | Update produk |
| DELETE | `/api/supplier/products/:id` | Hapus produk |
| GET | `/api/supplier/orders` | Pesanan produk saya |

### Courier (JWT + Role)
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/api/courier/available` | Pesanan PAID tersedia |
| POST | `/api/courier/orders/:id/ship` | Ambil & kirim |
| PATCH | `/api/courier/orders/:id/deliver` | Tandai terkirim |
| GET | `/api/courier/my-orders` | Pesanan saya |

### Admin (JWT + Role)
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| POST | `/api/products` | Tambah produk |
| PUT | `/api/products/:id` | Update produk |
| DELETE | `/api/products/:id` | Hapus produk |
| POST | `/api/categories` | Tambah kategori |
| PUT | `/api/categories/:id` | Update kategori |
| DELETE | `/api/categories/:id` | Hapus kategori |

---

## 🧪 Testing

```bash
cd backend-go
go test ./internal/... -v
```

---

## 📁 Struktur Project

```
e-commerse-sqa/
├── backend-go/
│   ├── cmd/
│   │   ├── api/main.go         # Entry point server
│   │   └── seed/main.go        # Database seeder
│   ├── config/                  # DB & Redis config
│   ├── internal/
│   │   ├── domain/             # Entity & interfaces
│   │   ├── repository/         # Data access layer
│   │   ├── usecase/            # Business logic
│   │   └── delivery/http/      # HTTP handlers
│   └── pkg/                    # Shared utilities
├── frontend-react/
│   └── src/
│       ├── components/         # Navbar, Footer, ProductCard
│       ├── context/            # AuthContext
│       ├── pages/              # Home, Products, Cart, etc.
│       │   ├── supplier/       # Supplier Dashboard
│       │   ├── courier/        # Courier Dashboard
│       │   └── admin/          # Admin Dashboard
│       └── services/           # API client (axios)
└── docker-compose.yml
```

---

## 📝 Lisensi

E-Commerce SQA Project © 2026
