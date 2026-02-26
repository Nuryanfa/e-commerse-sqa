import axios from "axios";

// Membuat instance axios dengan konfigurasi default
const api = axios.create({
  baseURL: "http://localhost:8080/api", // Base URL ke backend Golang
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor untuk menambahkan JWT token di setiap request (jika ada)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
