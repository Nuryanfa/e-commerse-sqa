import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileOpen(false);
  };

  const getDashboardLink = () => {
    if (!user) return '/';
    switch (user.role) {
      case 'admin': return '/admin';
      case 'supplier': return '/supplier';
      case 'courier': return '/courier';
      default: return '/orders';
    }
  };

  const getRoleLabel = () => {
    if (!user) return '';
    const labels = { admin: 'Admin', supplier: 'Supplier', courier: 'Kurir', pembeli: 'Pembeli' };
    return labels[user.role] || user.role;
  };

  const getRoleIcon = () => {
    if (!user) return '';
    const icons = { admin: '🛡️', supplier: '🧑‍🌾', courier: '🚚', pembeli: '🛒' };
    return icons[user.role] || '👤';
  };

  return (
    <nav className="bg-white/80 backdrop-blur-lg shadow-sm sticky top-0 z-50 animate-fade-in-down border-b border-gray-100/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2 group">
              <span className="text-2xl group-hover:animate-bounce-in transition-transform">🥬</span>
              <span className="text-xl font-bold gradient-text">SayurSehat</span>
            </Link>
          </div>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6">
            <Link to="/" className="text-gray-600 hover:text-primary-600 font-medium transition-all duration-200 hover:-translate-y-0.5">Beranda</Link>
            <Link to="/products" className="text-gray-600 hover:text-primary-600 font-medium transition-all duration-200 hover:-translate-y-0.5">Produk</Link>

            {isAuthenticated ? (
              <>
                {user.role === 'pembeli' && (
                  <Link to="/cart" className="relative text-gray-600 hover:text-primary-600 transition-all duration-200 hover:scale-110 text-xl">
                    🛒
                  </Link>
                )}
                <Link to={getDashboardLink()} className="text-gray-600 dark:text-gray-300 hover:text-primary-600 font-medium transition-all duration-200 hover:-translate-y-0.5">
                  {user.role === 'pembeli' ? 'Pesanan' : 'Dashboard'}
                </Link>
                <span className="inline-flex items-center gap-1 text-xs bg-gradient-to-r from-primary-50 to-accent-50 text-primary-700 px-3 py-1.5 rounded-full font-medium border border-primary-100 animate-scale-in">
                  {getRoleIcon()} {getRoleLabel()}
                </span>
                <button onClick={handleLogout} className="text-gray-400 hover:text-red-500 font-medium transition-all duration-200 hover:scale-105 cursor-pointer text-sm">Logout</button>
                <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1"></div>
                <button onClick={toggleTheme} className="text-xl hover:scale-110 transition-transform cursor-pointer" title="Toggle Dark Mode">
                  {theme === 'light' ? '🌙' : '☀️'}
                </button>
              </>
            ) : (
              <>
                <button onClick={toggleTheme} className="text-xl hover:scale-110 transition-transform cursor-pointer mr-2" title="Toggle Dark Mode">
                  {theme === 'light' ? '🌙' : '☀️'}
                </button>
                <Link to="/login" className="bg-gradient-to-r from-primary-600 to-accent-600 text-white px-6 py-2 rounded-full font-medium hover:shadow-lg hover:shadow-primary-200 transition-all duration-300 hover:-translate-y-0.5">
                  Login / Daftar
                </Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <div className="md:hidden flex items-center gap-2">
            <button onClick={toggleTheme} className="p-2 text-xl hover:scale-110 transition-transform cursor-pointer">
              {theme === 'light' ? '🌙' : '☀️'}
            </button>
            <button onClick={() => setMobileOpen(!mobileOpen)} className="text-gray-600 dark:text-gray-300 p-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors">
              <svg className="w-6 h-6 transition-transform duration-300" style={{ transform: mobileOpen ? 'rotate(90deg)' : 'rotate(0deg)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileOpen ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /> : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${mobileOpen ? 'max-h-80 opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="bg-white border-t px-4 pb-4 space-y-1">
          <Link to="/" onClick={() => setMobileOpen(false)} className="block py-2.5 px-3 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all">Beranda</Link>
          <Link to="/products" onClick={() => setMobileOpen(false)} className="block py-2.5 px-3 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all">Produk</Link>
          {isAuthenticated ? (
            <>
              {user.role === 'pembeli' && <Link to="/cart" onClick={() => setMobileOpen(false)} className="block py-2.5 px-3 text-gray-600 hover:bg-primary-50 rounded-lg transition-all">🛒 Keranjang</Link>}
              <Link to={getDashboardLink()} onClick={() => setMobileOpen(false)} className="block py-2.5 px-3 text-gray-600 hover:bg-primary-50 rounded-lg transition-all">{user.role === 'pembeli' ? '📦 Pesanan Saya' : '📊 Dashboard'}</Link>
              <button onClick={handleLogout} className="block w-full text-left py-2.5 px-3 text-red-500 hover:bg-red-50 rounded-lg transition-all cursor-pointer">🚪 Logout</button>
            </>
          ) : (
            <Link to="/login" onClick={() => setMobileOpen(false)} className="block py-2.5 px-3 text-primary-600 font-medium hover:bg-primary-50 rounded-lg transition-all">Login / Daftar</Link>
          )}
        </div>
      </div>
    </nav>
  );
}
