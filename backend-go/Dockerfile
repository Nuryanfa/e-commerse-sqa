# Tahap 1: Membangun binary aplikasi (Builder Stage)
FROM golang:1.22-alpine AS builder

# Mengatur environment variables untuk build Go
ENV GO111MODULE=on \
    CGO_ENABLED=0 \
    GOOS=linux \
    GOARCH=amd64

# Membuat dan mengatur working directory di dalam container
WORKDIR /app

# Menyalin file go.mod dan go.sum terlebih dahulu untuk memanfaatkan caching Docker
COPY go.mod go.sum ./
RUN go mod download

# Menyalin seluruh source code ke dalam container
COPY . .

# Membangun aplikasi menjadi sebuah binary executeable bernama 'main'
RUN go build -o main ./cmd/api/main.go

# Tahap 2: Menyiapkan image yang sangat kecil untuk dijalankan di produksi
FROM alpine:latest

# Menambahkan sertifikat CA agar bisa melakukan request HTTPS (misal ke Telegram/Midtrans)
RUN apk --no-cache add ca-certificates tzdata

# Mengatur timezone server (WIB)
ENV TZ=Asia/Jakarta

WORKDIR /root/

# Menyalin file binary hasil kompilasi dari tahap builder
COPY --from=builder /app/main .

# Mengekspos port 8080 agar bisa diakses oleh Nginx
EXPOSE 8080

# Menjalankan aplikasi
CMD ["./main"]
