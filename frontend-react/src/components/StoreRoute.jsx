import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function StoreRoute({ children }) {
  const { user, isAuthenticated, loading } = useAuth();

  // Tunggu loading pengecekan kredensial selesai (jangan langsung ditendang)
  if (loading) return null;

  // Jika sudah login, tetapi bukan pembeli, tendang paksa ke Dashboard mereka.
  if (isAuthenticated && user.role !== 'pembeli') {
    return <Navigate to={`/${user.role}`} replace />;
  }

  // Jika belum login (Guest) atau login sebagai Pembeli, izinkan masuk halaman publik.
  return children;
}
