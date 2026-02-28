import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import ProtectedRoute from './components/ProtectedRoute';
import PageWrapper from './components/PageWrapper';
import SplashScreen from './components/SplashScreen';

import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { ModalProvider } from './context/ModalContext';

import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import Cart from './pages/Cart';
import Orders from './pages/Orders';
import OrderDetail from './pages/OrderDetail';
import Wishlist from './pages/Wishlist';
import Profile from './pages/Profile';
import AdminDashboard from './pages/admin/Dashboard';
import SupplierDashboard from './pages/supplier/Dashboard';
import CourierDashboard from './pages/courier/Dashboard';

// ScrollToTop — scrolls to top on route change
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'smooth' }); }, [pathname]);
  return null;
}

// Floating scroll-to-top button
function ScrollToTopButton() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const toggle = () => setVisible(window.scrollY > 400);
    window.addEventListener('scroll', toggle, { passive: true });
    return () => window.removeEventListener('scroll', toggle);
  }, []);

  if (!visible) return null;
  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className="fixed bottom-6 right-6 w-11 h-11 rounded-2xl flex items-center justify-center z-50 cursor-pointer transition-all duration-300 hover:-translate-y-1 animate-scale-in"
      style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', boxShadow: 'var(--shadow-elevated)', color: 'var(--text-secondary)' }}
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 15l7-7 7 7" /></svg>
    </button>
  );
}

// Komponen route animasi
function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageWrapper><Home /></PageWrapper>} />
        <Route path="/products" element={<PageWrapper><Products /></PageWrapper>} />
        <Route path="/products/:id" element={<PageWrapper><ProductDetail /></PageWrapper>} />
        <Route path="/login" element={<PageWrapper><Login /></PageWrapper>} />
        <Route path="/register" element={<PageWrapper><Register /></PageWrapper>} />
        <Route path="/cart" element={<ProtectedRoute><PageWrapper><Cart /></PageWrapper></ProtectedRoute>} />
        <Route path="/orders" element={<ProtectedRoute><PageWrapper><Orders /></PageWrapper></ProtectedRoute>} />
        <Route path="/orders/:id" element={<ProtectedRoute><PageWrapper><OrderDetail /></PageWrapper></ProtectedRoute>} />
        <Route path="/wishlist" element={<PageWrapper><Wishlist /></PageWrapper>} />
        <Route path="/profile" element={<ProtectedRoute><PageWrapper><Profile /></PageWrapper></ProtectedRoute>} />
        <Route path="/admin/*" element={<ProtectedRoute allowedRoles={['admin']}><PageWrapper><AdminDashboard /></PageWrapper></ProtectedRoute>} />
        <Route path="/supplier/*" element={<ProtectedRoute allowedRoles={['supplier']}><PageWrapper><SupplierDashboard /></PageWrapper></ProtectedRoute>} />
        <Route path="/courier/*" element={<ProtectedRoute allowedRoles={['courier']}><PageWrapper><CourierDashboard /></PageWrapper></ProtectedRoute>} />
        <Route path="*" element={
          <PageWrapper>
            <div className="min-h-[60vh] flex items-center justify-center animate-fade-in-up">
              <div className="text-center">
                <span className="text-8xl block mb-6 animate-float">🌿</span>
                <h1 className="text-4xl font-black tracking-tight" style={{ color: 'var(--text-heading)' }}>404</h1>
                <p className="text-sm mt-2 mb-6" style={{ color: 'var(--text-secondary)' }}>Halaman tidak ditemukan</p>
                <a href="/" className="btn-primary px-6 py-2.5 text-sm inline-block">Kembali ke Beranda</a>
              </div>
            </div>
          </PageWrapper>
        } />
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    // Tampilkan Splash Screen selama 2 detik
    const timer = setTimeout(() => setShowSplash(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <ModalProvider>
            <BrowserRouter>
              <AnimatePresence mode="wait">
                {showSplash ? (
                  <SplashScreen key="splash" />
                ) : (
                  <motion.div 
                    key="app"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="flex min-h-screen" 
                    style={{ background: 'var(--surface-base)' }}
                  >
                    <ScrollToTop />

                    <Sidebar
                      isOpen={sidebarOpen}
                      onClose={() => setSidebarOpen(false)}
                      collapsed={sidebarCollapsed}
                      onToggleCollapse={() => setSidebarCollapsed(c => !c)}
                    />

                    <div className="flex-1 flex flex-col min-w-0">
                      <Navbar onToggleSidebar={() => setSidebarOpen(o => !o)} />

                      <main className="flex-1">
                        <AnimatedRoutes />
                      </main>
                    </div>

                    <ScrollToTopButton />
                  </motion.div>
                )}
              </AnimatePresence>
            </BrowserRouter>
          </ModalProvider>
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
