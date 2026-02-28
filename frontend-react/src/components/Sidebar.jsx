import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Home, ShoppingBag, Heart, ShoppingCart, Package, BarChart2, Truck, Shield, KeyRound, UserPlus, Moon, Sun, LogOut, Leaf } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Sidebar({ isOpen, onClose, collapsed, onToggleCollapse }) {
  const { user, isAuthenticated, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const publicLinks = [
    { to: '/', icon: <Home className="w-[18px] h-[18px]" />, label: 'Beranda' },
    { to: '/products', icon: <ShoppingBag className="w-[18px] h-[18px]" />, label: 'Produk' },
  ];

  const roleConfig = {
    pembeli: {
      links: [
        { to: '/wishlist', icon: <Heart className="w-[18px] h-[18px]" />, label: 'Wishlist' },
        { to: '/cart', icon: <ShoppingCart className="w-[18px] h-[18px]" />, label: 'Keranjang' },
        { to: '/orders', icon: <Package className="w-[18px] h-[18px]" />, label: 'Pesanan' },
      ],
      label: 'Belanja', icon: <ShoppingCart className="w-3 h-3 text-white" />,
    },
    supplier: {
      links: [{ to: '/supplier', icon: <BarChart2 className="w-[18px] h-[18px]" />, label: 'Dashboard' }],
      label: 'Supplier', icon: <Leaf className="w-3 h-3 text-white" />,
    },
    courier: {
      links: [{ to: '/courier', icon: <Truck className="w-[18px] h-[18px]" />, label: 'Dashboard' }],
      label: 'Kurir', icon: <Truck className="w-3 h-3 text-white" />,
    },
    admin: {
      links: [{ to: '/admin', icon: <Shield className="w-[18px] h-[18px]" />, label: 'Admin Panel' }],
      label: 'Admin', icon: <Shield className="w-3 h-3 text-white" />,
    },
  };

  const currentRole = user ? roleConfig[user.role] : null;
  const handleLogout = () => { logout(); onClose(); };

  const NavLink = ({ to, icon, label }) => {
    const active = isActive(to);
    return (
      <Link
        to={to}
        onClick={onClose}
        className={`sidebar-link relative group ${active ? 'text-emerald-700 dark:text-emerald-300' : ''}`}
        title={collapsed ? label : ''}
        style={{
          padding: '0.625rem 0.75rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          borderRadius: '0.75rem',
          fontSize: '0.875rem',
          fontWeight: active ? '700' : '500',
          color: active ? 'var(--text-emerald-700)' : 'var(--text-secondary)',
          textDecoration: 'none',
        }}
      >
        {active && (
          <motion.div
            layoutId="sidebarActiveIndicator"
            className="absolute inset-0 bg-emerald-100 dark:bg-emerald-900/40 rounded-xl -z-10"
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          />
        )}
        <span className="sidebar-icon flex items-center justify-center w-5 shrink-0 group-hover:scale-110 transition-transform duration-200" style={{ color: active ? 'inherit' : 'var(--text-secondary)' }}>{icon}</span>
        <span className="transition-opacity duration-200 truncate relative z-10">{label}</span>
      </Link>
    );
  };

  return (
    <>
      {/* Mobile overlay */}
      <div className={`sidebar-overlay lg:hidden ${isOpen ? 'open backdrop-blur-sm' : ''}`} onClick={onClose} />

      {/* Sidebar */}
      <aside
        className={`sidebar fixed lg:sticky top-0 left-0 h-screen z-50 lg:z-30 flex flex-col overflow-y-auto overflow-x-hidden
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          ${collapsed ? 'sidebar-collapsed' : ''}`}
        style={{ width: collapsed ? 'var(--sidebar-collapsed-width)' : 'var(--sidebar-width)' }}
      >
        {/* Header */}
        <div className="flex items-center h-14 shrink-0 px-3 border-b" style={{ borderColor: 'var(--sidebar-border)' }}>
          {!collapsed ? (
            <Link to="/" onClick={onClose} className="flex items-center gap-2 flex-1 min-w-0 group text-emerald-600 dark:text-emerald-400">
              <Leaf className="w-6 h-6 group-hover:animate-bounce-in transition-transform" />
              <span className="text-base font-bold gradient-text truncate">SayurSehat</span>
            </Link>
          ) : (
            <Link to="/" onClick={onClose} className="mx-auto hover:scale-110 transition-transform text-emerald-600 dark:text-emerald-400">
              <Leaf className="w-6 h-6" />
            </Link>
          )}
          <button
            onClick={onToggleCollapse}
            className="hidden lg:flex items-center justify-center w-6 h-6 rounded-md transition-all cursor-pointer shrink-0 hover:bg-gray-100 dark:hover:bg-gray-700"
            title={collapsed ? 'Expand' : 'Collapse'}
          >
            <svg className={`w-3.5 h-3.5 transition-transform duration-300 ${collapsed ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--sidebar-muted)' }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-2 py-3">
          {/* Public */}
          <p className="sidebar-section-title text-[10px] font-bold uppercase tracking-widest px-2.5 mb-1 mt-0.5" style={{ color: 'var(--sidebar-muted)' }}>
            Menu
          </p>
          <div className="space-y-0.5 mb-3">
            {publicLinks.map(l => <NavLink key={l.to} {...l} />)}
          </div>

          {/* Role links */}
          {isAuthenticated && currentRole && (
            <>
              <div className="sidebar-divider-text mx-2 my-2 border-t" style={{ borderColor: 'var(--sidebar-border)' }} />
              <p className="sidebar-section-title text-[10px] font-bold uppercase tracking-widest px-2.5 mb-1" style={{ color: 'var(--sidebar-muted)' }}>
                {currentRole.label}
              </p>
              <div className="space-y-0.5 mb-3">
                {currentRole.links.map(l => <NavLink key={l.to} {...l} />)}
              </div>
            </>
          )}

          {/* Guest links */}
          {!isAuthenticated && (
            <>
              <div className="sidebar-divider-text mx-2 my-2 border-t" style={{ borderColor: 'var(--sidebar-border)' }} />
              <p className="sidebar-section-title text-[10px] font-bold uppercase tracking-widest px-2.5 mb-1" style={{ color: 'var(--sidebar-muted)' }}>
                Akun
              </p>
              <div className="space-y-0.5">
                <NavLink to="/login" icon={<KeyRound className="w-[18px] h-[18px]" />} label="Login" />
                <NavLink to="/register" icon={<UserPlus className="w-[18px] h-[18px]" />} label="Daftar" />
              </div>
            </>
          )}
        </nav>

        {/* Bottom */}
        <div className="shrink-0 px-2 pb-3 border-t pt-2 space-y-0.5" style={{ borderColor: 'var(--sidebar-border)' }}>
          {/* Theme */}
          <button onClick={toggleTheme} className="sidebar-link w-full cursor-pointer group" title={collapsed ? (theme === 'light' ? 'Mode Gelap' : 'Mode Terang') : ''}>
            <span className="sidebar-icon flex items-center justify-center w-5 shrink-0 group-hover:animate-bounce-in" style={{ color: 'var(--text-secondary)' }}>
              {theme === 'light' ? <Moon className="w-[18px] h-[18px]" /> : <Sun className="w-[18px] h-[18px]" />}
            </span>
            <span>{theme === 'light' ? 'Mode Gelap' : 'Mode Terang'}</span>
          </button>

          {/* User */}
          {isAuthenticated && (
            <>
              <Link to="/profile" onClick={onClose} className={`sidebar-link group ${isActive('/profile') ? 'active' : ''}`} title={collapsed ? 'Profil' : ''}>
                <div className="w-6 h-6 bg-gradient-to-br from-primary-400 to-accent-500 rounded-md flex items-center justify-center text-white text-[10px] font-bold shrink-0 group-hover:scale-110 transition-transform">
                  {user?.nama?.charAt(0)?.toUpperCase() || currentRole?.icon || '?'}
                </div>
                <div className="sidebar-user-info flex-1 min-w-0">
                  <p className="text-xs font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{user?.nama || currentRole?.label}</p>
                  <p className="text-[10px] truncate" style={{ color: 'var(--sidebar-muted)' }}>{currentRole?.label}</p>
                </div>
              </Link>
              <button onClick={handleLogout} className="sidebar-link w-full cursor-pointer text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 group" title={collapsed ? 'Logout' : ''}>
                <span className="sidebar-icon flex items-center justify-center w-5 shrink-0 group-hover:scale-110 transition-transform">
                  <LogOut className="w-[18px] h-[18px]" />
                </span>
                <span>Logout</span>
              </button>
            </>
          )}
        </div>
      </aside>
    </>
  );
}
