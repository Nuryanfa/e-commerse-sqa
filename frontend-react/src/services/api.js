import axios from "axios";

const apiBaseURL = import.meta.env.PROD
  ? "/api/v1"
  : import.meta.env.VITE_API_URL || "http://localhost:8080/api/v1";

// Membuat instance axios dengan konfigurasi default
const api = axios.create({
  baseURL: apiBaseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor untuk menambahkan JWT token di setiap request (jika ada)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("auth_token");
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
