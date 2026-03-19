import { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ShoppingCart, User, Package, LogOut, Leaf, Heart, Moon, Sun, X } from 'lucide-react';
import CommandPalette from './CommandPalette';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';
  const location  = useLocation();
  const navigate  = useNavigate();
  const [searchOpen,   setSearchOpen]   = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenu,   setMobileMenu]   = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const h = e => { if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setDropdownOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  // Ctrl+K shortcut
  useEffect(() => {
    const h = e => { if ((e.ctrlKey || e.metaKey) && e.key === 'k') { e.preventDefault(); setSearchOpen(true); } };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, []);

  // Don't render on internal routes (those have their own headers)
  if (['/admin', '/supplier', '/courier'].some(r => location.pathname.startsWith(r))) return null;

  const navLinks = [
    { to: '/', label: 'Beranda' },
    { to: '/products', label: 'Katalog' },
  ];

  const isActive = (path) => path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  return (
    <>
      {/* ── Main Navbar ─────────────────────────────────────── */}
      <header
        className="sticky top-0 z-40"
        style={{
          background: 'var(--surface-container-lowest)',
          borderBottom: '1px solid var(--border)',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center h-16 gap-6">

          {/* ── Logo ─────────────────────────────────────────── */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0" style={{ textDecoration: 'none' }}>
            <div style={{ width: '2rem', height: '2rem', borderRadius: 'var(--radius-md)', background: 'var(--brand-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Leaf style={{ width: '1rem', height: '1rem', color: 'white' }} />
            </div>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.1rem', color: 'var(--text-heading)', letterSpacing: '-0.02em' }}>
              SayurSehat
            </span>
          </Link>

          {/* ── Nav Links (desktop) ──────────────────────────── */}
          <nav className="hidden md:flex items-center gap-1 flex-1">
            {navLinks.map(link => (
              <Link key={link.to} to={link.to}
                style={{
                  padding: '0.4rem 0.875rem',
                  borderRadius: 'var(--radius-full)',
                  textDecoration: 'none',
                  fontFamily: 'var(--font-body)',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  color: isActive(link.to) ? 'var(--md-on-primary-container)' : 'var(--on-surface-variant)',
                  background: isActive(link.to) ? 'var(--md-primary-container)' : 'transparent',
                  transition: 'all 0.2s ease',
                }}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* ── Spacer (mobile) ─────────────────────────────── */}
          <div className="flex-1 md:hidden" />

          {/* ── Right Actions ────────────────────────────────── */}
          <div className="flex items-center gap-2">

            {/* Search Bar (desktop) */}
            <button
              onClick={() => setSearchOpen(true)}
              className="hidden sm:flex items-center gap-3"
              style={{
                padding: '0.5rem 1rem',
                borderRadius: 'var(--radius-md)',
                background: 'var(--surface-container)',
                border: 'none',
                cursor: 'text',
                width: '14rem',
                justifyContent: 'space-between',
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--outline)', fontSize: '0.8rem' }}>
                <Search style={{ width: '0.875rem', height: '0.875rem' }} />
                Cari sayur, buah...
              </span>
              <span style={{ fontSize: '0.6rem', color: 'var(--outline)', border: '1px solid var(--outline-variant)', borderRadius: '0.2rem', padding: '0.05rem 0.3rem', fontFamily: 'monospace' }}>⌘K</span>
            </button>

            {/* Search icon (mobile) */}
            <button onClick={() => setSearchOpen(true)} className="sm:hidden" style={{ width: '2.25rem', height: '2.25rem', borderRadius: 'var(--radius-md)', background: 'var(--surface-container)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--on-surface-variant)' }}>
              <Search style={{ width: '1rem', height: '1rem' }} />
            </button>

            {/* Wishlist */}
            {isAuthenticated && user?.role === 'pembeli' && (
              <Link to="/wishlist" style={{ width: '2.25rem', height: '2.25rem', borderRadius: 'var(--radius-md)', background: 'var(--surface-container)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--on-surface-variant)', textDecoration: 'none', transition: 'background 0.2s ease' }}>
                <Heart style={{ width: '1rem', height: '1rem' }} />
              </Link>
            )}

            {/* Cart */}
            {isAuthenticated && user?.role === 'pembeli' && (
              <Link to="/cart" style={{ width: '2.25rem', height: '2.25rem', borderRadius: 'var(--radius-md)', background: 'var(--surface-container)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--on-surface-variant)', textDecoration: 'none', position: 'relative' }}>
                <ShoppingCart style={{ width: '1rem', height: '1rem' }} />
              </Link>
            )}

            {/* Dark mode toggle */}
            <button onClick={toggleTheme} style={{ width: '2.25rem', height: '2.25rem', borderRadius: 'var(--radius-md)', background: 'var(--surface-container)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--on-surface-variant)', transition: 'background 0.2s ease' }}>
              {isDark ? <Sun style={{ width: '1rem', height: '1rem' }} /> : <Moon style={{ width: '1rem', height: '1rem' }} />}
            </button>

            {/* User Avatar / Login */}
            {isAuthenticated ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  style={{ width: '2.25rem', height: '2.25rem', borderRadius: 'var(--radius-full)', background: 'var(--brand-gradient)', color: 'white', fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '0.8rem', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'transform 0.2s ease' }}
                  onMouseOver={e => e.currentTarget.style.transform = 'scale(1.08)'}
                  onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
                >
                  {user?.nama?.charAt(0)?.toUpperCase() || '?'}
                </button>

                <AnimatePresence>
                  {dropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      style={{ position: 'absolute', right: 0, top: '2.75rem', width: '13rem', borderRadius: 'var(--radius-lg)', background: 'var(--surface-container-lowest)', boxShadow: 'var(--shadow-lg)', border: '1px solid var(--border)', overflow: 'hidden', zIndex: 50 }}
                    >
                      {/* User info header */}
                      <div style={{ padding: '0.875rem 1rem', borderBottom: '1px solid var(--border)' }}>
                        <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-heading)', marginBottom: '0.15rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.nama}</p>
                        <p style={{ fontSize: '0.75rem', color: 'var(--outline)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.email}</p>
                      </div>
                      <div style={{ padding: '0.5rem' }}>
                        {[
                          { to: '/profile', icon: <User style={{ width: '0.875rem', height: '0.875rem' }} />, label: 'Profil Saya' },
                          ...(user?.role === 'pembeli' ? [{ to: '/orders', icon: <Package style={{ width: '0.875rem', height: '0.875rem' }} />, label: 'Pesanan' }] : []),
                        ].map(item => (
                          <Link key={item.to} to={item.to} onClick={() => setDropdownOpen(false)}
                            style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', padding: '0.6rem 0.75rem', borderRadius: 'var(--radius-md)', color: 'var(--on-surface-variant)', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 500, transition: 'background 0.15s ease' }}
                            onMouseOver={e => e.currentTarget.style.background = 'var(--surface-container-low)'}
                            onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                          >
                            {item.icon} {item.label}
                          </Link>
                        ))}
                        <button onClick={() => { logout(); setDropdownOpen(false); }}
                          style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', padding: '0.6rem 0.75rem', borderRadius: 'var(--radius-md)', color: 'var(--md-error)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 500, width: '100%', textAlign: 'left', transition: 'background 0.15s ease' }}
                          onMouseOver={e => e.currentTarget.style.background = 'rgba(176,37,0,0.06)'}
                          onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                        >
                          <LogOut style={{ width: '0.875rem', height: '0.875rem' }} /> Keluar
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link to="/login" className="btn-primary" style={{ padding: '0.5rem 1.25rem', fontSize: '0.85rem', textDecoration: 'none' }}>Masuk</Link>
            )}
          </div>
        </div>
      </header>

      <CommandPalette isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
