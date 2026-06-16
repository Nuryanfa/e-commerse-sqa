# Tahap 1: Membangun file statis React (Builder Stage)
FROM node:alpine AS builder

# Mengatur working directory
WORKDIR /app

# Menyalin file package.json dan package-lock.json terlebih dahulu
COPY package*.json ./

# Menginstal semua dependencies
RUN npm install

# Menyalin seluruh source code React
COPY . .

# Menerima environment variables dari luar (GitHub Actions)
ARG VITE_API_URL
ARG VITE_MIDTRANS_CLIENT_KEY

# Menjadikan argumen tersebut sebagai environment variable saat proses build
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_MIDTRANS_CLIENT_KEY=$VITE_MIDTRANS_CLIENT_KEY

# Membangun aplikasi React menggunakan Vite
RUN npm run build

# Tahap 2: Menyiapkan Nginx untuk melayani file statis
FROM nginx:alpine

# Menyalin hasil build dari tahap 1 ke folder HTML Nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Menyalin konfigurasi kustom Nginx agar mendukung SPA (Single Page Application) React Router
# (Akan diarahkan ke index.html jika rute tidak ditemukan)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Mengekspos port 80
EXPOSE 80

# Menjalankan Nginx di foreground
CMD ["nginx", "-g", "daemon off;"]
