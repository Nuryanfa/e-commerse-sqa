import { lazy, Suspense, useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import StoreRoute from './components/StoreRoute';
import PageWrapper from './components/PageWrapper';

import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { ModalProvider } from './context/ModalContext';

import Home from './pages/Home';

const Sidebar = lazy(() => import('./components/Sidebar'));
const SellerSidebar = lazy(() => import('./components/SellerSidebar'));
const AdminSidebar = lazy(() => import('./components/AdminSidebar'));
const AdminNavbar = lazy(() => import('./components/AdminNavbar'));
const Products = lazy(() => import('./pages/Products'));
const ProductDetail = lazy(() => import('./pages/ProductDetail'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Cart = lazy(() => import('./pages/Cart'));
const Orders = lazy(() => import('./pages/Orders'));
const OrderDetail = lazy(() => import('./pages/OrderDetail'));
const Invoice = lazy(() => import('./pages/Invoice'));
const DisputeDetail = lazy(() => import('./pages/DisputeDetail'));
const Wishlist = lazy(() => import('./pages/Wishlist'));
const Profile = lazy(() => import('./pages/Profile'));
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'));
const AdminDisputes = lazy(() => import('./pages/admin/Disputes'));
const AdminRevenue = lazy(() => import('./pages/admin/Revenue'));
const AdminUsers = lazy(() => import('./pages/admin/Users'));
const AdminSellers = lazy(() => import('./pages/admin/Sellers'));
const AdminLogistics = lazy(() => import('./pages/admin/Logistics'));
const AdminLogs = lazy(() => import('./pages/admin/Logs'));
const AdminSettings = lazy(() => import('./pages/admin/Settings'));
const SupplierDashboard = lazy(() => import('./pages/supplier/Dashboard'));
const SupplierInventory = lazy(() => import('./pages/supplier/Inventory'));
const SupplierOrders = lazy(() => import('./pages/supplier/Orders'));
const SupplierAnalytics = lazy(() => import('./pages/supplier/Analytics'));
const SupplierDisputes = lazy(() => import('./pages/supplier/Disputes'));
const SupplierSettings = lazy(() => import('./pages/supplier/Settings'));
const SupplierSupport = lazy(() => import('./pages/supplier/Support'));
const CourierDashboard = lazy(() => import('./pages/courier/Dashboard'));

function RouteFallback() {
  return <div className="min-h-[50vh]" aria-hidden="true" />;
}

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

const INTERNAL_ROUTES    = ['/admin', '/supplier', '/courier'];
const SELLER_ROUTES      = ['/supplier'];
const ADMIN_ROUTES       = ['/admin'];
const BUYER_ROUTES       = ['/', '/products', '/cart', '/orders', '/wishlist', '/profile', '/login', '/register'];

function AnimatedRoutes() {
  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
          <Route path="/" element={<StoreRoute><PageWrapper><Home /></PageWrapper></StoreRoute>} />
          <Route path="/products" element={<StoreRoute><PageWrapper><Products /></PageWrapper></StoreRoute>} />
          <Route path="/products/:id" element={<StoreRoute><PageWrapper><ProductDetail /></PageWrapper></StoreRoute>} />
          <Route path="/login" element={<StoreRoute><PageWrapper><Login /></PageWrapper></StoreRoute>} />
          <Route path="/register" element={<StoreRoute><PageWrapper><Register /></PageWrapper></StoreRoute>} />
          <Route path="/wishlist" element={<StoreRoute><PageWrapper><Wishlist /></PageWrapper></StoreRoute>} />
          <Route path="/cart" element={<ProtectedRoute allowedRoles={['pembeli']}><PageWrapper><Cart /></PageWrapper></ProtectedRoute>} />
          <Route path="/orders" element={<ProtectedRoute allowedRoles={['pembeli']}><PageWrapper><Orders /></PageWrapper></ProtectedRoute>} />
          <Route path="/orders/:id" element={<ProtectedRoute allowedRoles={['pembeli']}><PageWrapper><OrderDetail /></PageWrapper></ProtectedRoute>} />
          <Route path="/invoice/:id" element={<ProtectedRoute allowedRoles={['pembeli', 'supplier', 'admin']}><Invoice /></ProtectedRoute>} />
          <Route path="/disputes/:id" element={<ProtectedRoute allowedRoles={['pembeli', 'supplier', 'admin']}><PageWrapper><DisputeDetail /></PageWrapper></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute allowedRoles={['pembeli']}><PageWrapper><Profile /></PageWrapper></ProtectedRoute>} />
        
        {/* Admin Routes */}
        <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><PageWrapper><AdminDashboard /></PageWrapper></ProtectedRoute>} />
        <Route path="/admin/revenue" element={<ProtectedRoute allowedRoles={['admin']}><PageWrapper><AdminRevenue /></PageWrapper></ProtectedRoute>} />
        <Route path="/admin/users" element={<ProtectedRoute allowedRoles={['admin']}><PageWrapper><AdminUsers /></PageWrapper></ProtectedRoute>} />
        <Route path="/admin/sellers" element={<ProtectedRoute allowedRoles={['admin']}><PageWrapper><AdminSellers /></PageWrapper></ProtectedRoute>} />
        <Route path="/admin/logistics" element={<ProtectedRoute allowedRoles={['admin']}><PageWrapper><AdminLogistics /></PageWrapper></ProtectedRoute>} />
        <Route path="/admin/complaints" element={<ProtectedRoute allowedRoles={['admin']}><PageWrapper><AdminDisputes /></PageWrapper></ProtectedRoute>} />
        <Route path="/admin/logs" element={<ProtectedRoute allowedRoles={['admin']}><PageWrapper><AdminLogs /></PageWrapper></ProtectedRoute>} />
        <Route path="/admin/settings" element={<ProtectedRoute allowedRoles={['admin']}><PageWrapper><AdminSettings /></PageWrapper></ProtectedRoute>} />
        
        {/* Supplier Routes */}
        <Route path="/supplier" element={<ProtectedRoute allowedRoles={['supplier']}><PageWrapper><SupplierDashboard /></PageWrapper></ProtectedRoute>} />
        <Route path="/supplier/products" element={<ProtectedRoute allowedRoles={['supplier']}><PageWrapper><SupplierInventory /></PageWrapper></ProtectedRoute>} />
        <Route path="/supplier/orders" element={<ProtectedRoute allowedRoles={['supplier']}><PageWrapper><SupplierOrders /></PageWrapper></ProtectedRoute>} />
        <Route path="/supplier/analytics" element={<ProtectedRoute allowedRoles={['supplier']}><PageWrapper><SupplierAnalytics /></PageWrapper></ProtectedRoute>} />
        <Route path="/supplier/disputes" element={<ProtectedRoute allowedRoles={['supplier']}><PageWrapper><SupplierDisputes /></PageWrapper></ProtectedRoute>} />
        <Route path="/supplier/settings" element={<ProtectedRoute allowedRoles={['supplier']}><PageWrapper><SupplierSettings /></PageWrapper></ProtectedRoute>} />
        <Route path="/supplier/support" element={<ProtectedRoute allowedRoles={['supplier']}><PageWrapper><SupplierSupport /></PageWrapper></ProtectedRoute>} />
        
        {/* Courier Routes */}
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
    </Suspense>
  );
}

// Layout wrapper — shows Sidebar only for internal panel routes
function AppLayout({ sidebarOpen, setSidebarOpen, sidebarCollapsed, setSidebarCollapsed }) {
  const location = useLocation();
  const isInternalRoute = INTERNAL_ROUTES.some(r => location.pathname.startsWith(r));
  const isSellerRoute   = SELLER_ROUTES.some(r => location.pathname.startsWith(r));
  const isAdminRoute    = ADMIN_ROUTES.some(r => location.pathname.startsWith(r));

  return (
    <div
      className="flex min-h-screen"
      style={{ background: isAdminRoute ? 'var(--bg)' : 'var(--bg)' }} // Can adjust admin background here if needed
    >
      <ScrollToTop />

      {/* Dark SellerSidebar for supplier */}
      {isSellerRoute && (
        <Suspense fallback={null}>
          <SellerSidebar
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
            collapsed={sidebarCollapsed}
            onToggleCollapse={() => setSidebarCollapsed(c => !c)}
          />
        </Suspense>
      )}

      {/* AdminSidebar for admin */}
      {isAdminRoute && (
        <Suspense fallback={null}>
          <AdminSidebar
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
            collapsed={sidebarCollapsed}
            onToggleCollapse={() => setSidebarCollapsed(c => !c)}
          />
        </Suspense>
      )}

      {/* Generic Sidebar for courier */}
      {isInternalRoute && !isSellerRoute && !isAdminRoute && (
        <Suspense fallback={null}>
          <Sidebar
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
            collapsed={sidebarCollapsed}
            onToggleCollapse={() => setSidebarCollapsed(c => !c)}
          />
        </Suspense>
      )}

      <div className="flex-1 flex flex-col min-w-0">
        {/* Navbar shown only for public/buyer routes */}
        {!isInternalRoute && !isAdminRoute && <Navbar onToggleSidebar={() => setSidebarOpen(o => !o)} />}
        
        {/* PanelNavbar (AdminNavbar) shown for admin and seller routes */}
        {(isAdminRoute || isSellerRoute) && (
          <Suspense fallback={null}>
            <AdminNavbar onToggleSidebar={() => setSidebarOpen(o => !o)} />
          </Suspense>
        )}

        <main className="flex-1">
          <AnimatedRoutes />
        </main>
      </div>

      <ScrollToTopButton />
    </div>
  );
}

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <ModalProvider>
            <BrowserRouter>
              <AppLayout
                sidebarOpen={sidebarOpen}
                setSidebarOpen={setSidebarOpen}
                sidebarCollapsed={sidebarCollapsed}
                setSidebarCollapsed={setSidebarCollapsed}
              />
            </BrowserRouter>
          </ModalProvider>
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
