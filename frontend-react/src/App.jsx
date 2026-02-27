import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { ModalProvider } from './context/ModalContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Public Pages
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Login from './pages/Login';
import Register from './pages/Register';

// Buyer Pages
import Cart from './pages/Cart';
import Orders from './pages/Orders';
import OrderDetail from './pages/OrderDetail';

// Role Dashboards
import SupplierDashboard from './pages/supplier/Dashboard';
import CourierDashboard from './pages/courier/Dashboard';
import AdminDashboard from './pages/admin/Dashboard';

function App() {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <ToastProvider>
            <ModalProvider>
            <div className="flex flex-col min-h-screen">
              <Navbar />
              <main className="flex-1">
                <Routes>
                  {/* Public */}
                  <Route path="/" element={<Home />} />
                  <Route path="/products" element={<Products />} />
                  <Route path="/products/:id" element={<ProductDetail />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />

                  {/* Buyer */}
                  <Route path="/cart" element={<ProtectedRoute roles={['pembeli']}><Cart /></ProtectedRoute>} />
                  <Route path="/orders" element={<ProtectedRoute roles={['pembeli']}><Orders /></ProtectedRoute>} />
                  <Route path="/orders/:id" element={<ProtectedRoute roles={['pembeli']}><OrderDetail /></ProtectedRoute>} />

                  {/* Supplier */}
                  <Route path="/supplier" element={<ProtectedRoute roles={['supplier']}><SupplierDashboard /></ProtectedRoute>} />

                  {/* Courier */}
                  <Route path="/courier" element={<ProtectedRoute roles={['courier']}><CourierDashboard /></ProtectedRoute>} />

                  {/* Admin */}
                  <Route path="/admin" element={<ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>} />

                  {/* 404 */}
                  <Route path="*" element={<div className="p-10 text-center text-red-500 font-bold">404 - Halaman tidak ditemukan</div>} />
                </Routes>
              </main>
              <Footer />
            </div>
          </ModalProvider>
        </ToastProvider>
      </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;
