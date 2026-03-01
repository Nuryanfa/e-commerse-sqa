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

## 🌟 Fitur Utama

- **Role-Based Access Control (RBAC)**: Terdapat sistem otentikasi berdasarkan _Role_ (Peran) yang memisahkan hak akses antara **Admin, Supplier, Courier,** dan **Pembeli**.
- **Marketplace Multi-Pelapak**: Penjual (Supplier) dapat mengelola inventaris sayuran sendiri, serta memantau pesanan masuk secara _real-time_.
- **Sistem Pengiriman Cepat**: Kurir dapat meninjau dan menerima tugas pengiriman pesanan yang telah dibayar oleh pembeli.
- **Transaksi yang Aman**: Seluruh logika dan rute integrasi dirancang untuk mencegah eksploitasi transaksi yang sensitif.
- **RESTful API**: Komunikasi _Frontend_ terintegrasi secara mulus melalui protokol HTTP menggunakan struktur *endpoints* mutakhir dan token otorisasi yang dienkripsi (JWT).

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
