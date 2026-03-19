import { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ShoppingCart, User, Package, LogOut, Leaf, Home, LayoutGrid } from 'lucide-react';
import CommandPalette from './CommandPalette';
import MegaMenu from './MegaMenu';
import MiniCartPreview from './MiniCartPreview';

export default function Navbar({ onToggleSidebar }) {
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const [searchOpen, setSearchOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [cartCount] = useState(0);
  const [cartHover, setCartHover] = useState(false);
  const [megaMenuHover, setMegaMenuHover] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setDropdownOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Hotkey pencarian Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Breadcrumb
  const pathParts = location.pathname.split('/').filter(Boolean);
  const breadcrumbs = pathParts.map((part, i) => ({
    label: part.charAt(0).toUpperCase() + part.slice(1).replace(/-/g, ' '),
    path: '/' + pathParts.slice(0, i + 1).join('/'),
    isLast: i === pathParts.length - 1,
  }));

  // Sembunyikan Navbar untuk Dasbor Aktor Internal
  if (['/admin', '/supplier', '/courier'].some(route => location.pathname.startsWith(route))) {
    return null;
  }

  return (
    <>
    <header className="navbar-glass sticky top-0 z-40 animate-fade-in-down">
      <div className="flex items-center h-14 px-4 gap-3">
        {/* Mobile hamburger */}
        <button onClick={onToggleSidebar} className="lg:hidden flex items-center justify-center w-9 h-9 rounded-xl cursor-pointer transition-all duration-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/20" style={{ color: 'var(--text-secondary)' }}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
        </button>

        {/* Categories Mega Menu Trigger & Breadcrumb Wrapper */}
        <nav className="hidden sm:flex items-center gap-1.5 text-sm flex-1 min-w-0">
          <div 
            className="hidden lg:block relative mr-2"
            onMouseEnter={() => setMegaMenuHover(true)}
            onMouseLeave={() => setMegaMenuHover(false)}
          >
            <button style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', padding: '0.4rem 0.875rem', borderRadius: 'var(--radius-full)', background: 'var(--md-primary-container)', color: 'var(--md-on-primary-container)', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.8rem', border: 'none', cursor: 'pointer' }}>
              <LayoutGrid className="w-4 h-4" /> Kategori Belanja
            </button>
            <MegaMenu isOpen={megaMenuHover} />
          </div>

          <Link to="/" className="flex items-center gap-1 transition-colors hover:text-emerald-600" style={{ color: 'var(--text-muted)' }}>
            <Home className="w-4 h-4" />
          </Link>
          {breadcrumbs.map((b, i) => (
            <span key={i} className="flex items-center gap-1.5">
              <span style={{ color: 'var(--text-muted)' }}>/</span>
              {b.isLast ? (
                <span className="font-medium truncate" style={{ color: 'var(--text-heading)' }}>{b.label}</span>
              ) : (
                <Link to={b.path} className="hover:text-emerald-600 transition-colors truncate" style={{ color: 'var(--text-muted)' }}>{b.label}</Link>
              )}
            </span>
          ))}
          {breadcrumbs.length === 0 && <span className="font-medium" style={{ color: 'var(--text-heading)' }}>Beranda</span>}
        </nav>

        {/* Mobile logo */}
        <Link to="/" className="sm:hidden flex items-center gap-1.5 flex-1 text-emerald-600 dark:text-emerald-400">
          <Leaf className="w-5 h-5" />
          <span className="font-bold text-sm gradient-text">SayurSehat</span>
        </Link>

        {/* Right actions */}
        <div className="flex items-center gap-4 ml-6">
          {/* Search */}
          {/* Search Trigger */}
          <div className="hidden sm:flex items-center">
            <button 
              onClick={() => setSearchOpen(true)}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '18rem', padding: '0.6rem 1rem', borderRadius: 'var(--radius-md)', background: 'var(--surface-container)', border: 'none', cursor: 'text', color: 'var(--on-surface-variant)' }}
            >
              <div className="flex items-center gap-2.5">
                <Search style={{ width: '1rem', height: '1rem', color: 'var(--outline)' }} />
                <span style={{ fontSize: '0.85rem', color: 'var(--outline)', fontFamily: 'var(--font-body)' }}>Cari sayur, buah...</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', fontSize: '0.65rem', fontWeight: 700, color: 'var(--outline)' }}>
                <kbd style={{ padding: '0.15rem 0.35rem', borderRadius: '0.2rem', background: 'var(--surface-container-high)' }}>⌘</kbd>
                <kbd style={{ padding: '0.15rem 0.35rem', borderRadius: '0.2rem', background: 'var(--surface-container-high)' }}>K</kbd>
              </div>
            </button>
          </div>

          <button 
             onClick={() => setSearchOpen(true)} 
             className="sm:hidden w-9 h-9 rounded-xl flex items-center justify-center cursor-pointer transition-all duration-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/20" 
             style={{ color: 'var(--text-secondary)' }}
          >
             <Search className="w-[18px] h-[18px]" />
          </button>

          {/* Cart (pembeli only) */}
          {isAuthenticated && user?.role === 'pembeli' && (
            <div className="relative" onMouseEnter={() => setCartHover(true)} onMouseLeave={() => setCartHover(false)}>
              <Link to="/cart" className="relative w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/20" style={{ color: 'var(--text-secondary)' }}>
                <ShoppingCart className="w-[18px] h-[18px]" />
                {cartCount > 0 && <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center badge-stock">{cartCount}</span>}
              </Link>
              <MiniCartPreview isOpen={cartHover} />
            </div>
          )}

          {/* User avatar / Login */}
          {isAuthenticated ? (
            <div className="relative" ref={dropdownRef}>
              <button onClick={() => setDropdownOpen(!dropdownOpen)} style={{ width: '2.25rem', height: '2.25rem', borderRadius: 'var(--radius-full)', background: 'var(--brand-gradient)', color: 'white', fontSize: '0.8rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: 'none', transition: 'transform 0.2s ease', fontFamily: 'var(--font-display)' }} onMouseOver={e=>e.currentTarget.style.transform='scale(1.07)'} onMouseOut={e=>e.currentTarget.style.transform='scale(1)'}>
                {user?.nama?.charAt(0)?.toUpperCase() || '?'}
              </button>
              <AnimatePresence>
                {dropdownOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 top-12 w-52 rounded-2xl overflow-hidden origin-top-right"
                    style={{ background: 'var(--surface-container-lowest)', boxShadow: 'var(--shadow-lg)', border: '1px solid var(--border)' }}
                  >
                    <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--border-light)' }}>
                      <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-heading)' }}>{user?.nama}</p>
                      <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{user?.email}</p>
                    </div>
                    <div className="py-1">
                      <Link to="/profile" onClick={() => setDropdownOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors" style={{ color: 'var(--text-secondary)' }}>
                        <User className="w-4 h-4" /> Profil Saya
                      </Link>
                      {user?.role === 'pembeli' && (
                        <Link to="/orders" onClick={() => setDropdownOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors" style={{ color: 'var(--text-secondary)' }}>
                          <Package className="w-4 h-4" /> Pesanan
                        </Link>
                      )}
                      <button onClick={() => { logout(); setDropdownOpen(false); }} className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors cursor-pointer">
                        <LogOut className="w-4 h-4" /> Keluar
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <Link to="/login" className="btn-primary" style={{ padding: '0.5rem 1.25rem', fontSize: '0.85rem' }}>Masuk</Link>
          )}
        </div>
      </div>
    </header>
      <CommandPalette isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
