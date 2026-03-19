import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, Package, ShoppingCart, BarChart2,
  Settings, HelpCircle, Plus, LogOut, Leaf, AlertTriangle,
  ChevronLeft, Moon, Sun
} from 'lucide-react';

/* ── Dark Seller Sidebar — matches Stitch "Verdant Seller" design ── */
export default function SellerSidebar({ isOpen, onClose, collapsed, onToggleCollapse }) {
  const { user, logout }  = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location           = useLocation();

  const isActive = (path) => location.pathname === path || (path !== '/supplier' && location.pathname.startsWith(path));

  const NAV_MAIN = [
    { to: '/supplier',          icon: <LayoutDashboard size={18} />, label: 'Dashboard' },
    { to: '/supplier/products', icon: <Package size={18} />,         label: 'Inventory' },
    { to: '/supplier/orders',   icon: <ShoppingCart size={18} />,    label: 'Orders' },
    { to: '/supplier/analytics',icon: <BarChart2 size={18} />,       label: 'Analytics' },
    { to: '/supplier/disputes', icon: <AlertTriangle size={18} />,   label: 'Disputes' },
  ];
  const NAV_BOTTOM = [
    { to: '/supplier/settings', icon: <Settings size={18} />,  label: 'Settings' },
    { to: '/supplier/support',  icon: <HelpCircle size={18} />, label: 'Support' },
  ];

  const handleLogout = () => { logout(); onClose?.(); };

  /* Sidebar colours — always dark */
  const BG      = '#0d1f13';  /* deep forest */
  const BG_HOVER= '#1a3020';
  const BG_ACT  = '#1e4028';
  const TEXT     = '#9cb8a4';
  const TEXT_ACT = '#ffffff';
  const ACCENT   = '#4ade80';  /* green-400 */
  const W = collapsed ? '4.5rem' : '15rem';

  const NavItem = ({ to, icon, label }) => {
    const active = isActive(to);
    return (
      <Link to={to} onClick={onClose}
        style={{
          display: 'flex', alignItems: 'center', gap: collapsed ? 0 : '0.75rem',
          justifyContent: collapsed ? 'center' : 'flex-start',
          padding: collapsed ? '0.75rem' : '0.65rem 1rem',
          borderRadius: '0.625rem', textDecoration: 'none', transition: 'all 0.2s ease',
          fontFamily: 'var(--font-display)', fontWeight: active ? 700 : 500, fontSize: '0.85rem',
          background: active ? BG_ACT : 'transparent',
          color: active ? TEXT_ACT : TEXT,
          position: 'relative', overflow: 'hidden',
        }}
        onMouseOver={e => { if (!active) e.currentTarget.style.background = BG_HOVER; e.currentTarget.style.color = '#fff'; }}
        onMouseOut={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = TEXT; } }}
      >
        {active && (
          <motion.div
            layoutId="sellerNavActive"
            style={{ position: 'absolute', left: 0, top: '15%', width: '3px', height: '70%', borderRadius: '0 3px 3px 0', background: ACCENT }}
            transition={{ type: 'spring', stiffness: 350, damping: 30 }}
          />
        )}
        <span style={{ color: active ? ACCENT : TEXT, flexShrink: 0, display: 'flex' }}>{icon}</span>
        {!collapsed && <span>{label}</span>}
      </Link>
    );
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 40, backdropFilter: 'blur(3px)' }} className="lg:hidden" />}

      <aside
        style={{
          width: W, minWidth: W, maxWidth: W, height: '100vh',
          background: BG, borderRight: '1px solid rgba(255,255,255,0.06)',
          display: 'flex', flexDirection: 'column', position: 'sticky', top: 0,
          overflowX: 'hidden', overflowY: 'auto', flexShrink: 0, transition: 'width 0.3s ease, min-width 0.3s ease',
          zIndex: 50,
        }}
        className={`${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} fixed lg:relative`}
      >
        {/* ── Header ─────────────────────────────────────────── */}
        <div style={{ padding: collapsed ? '1.25rem 0.75rem 1rem' : '1.25rem 1.25rem 1rem', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'space-between' }}>
          {!collapsed ? (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                <div style={{ width: '2.25rem', height: '2.25rem', borderRadius: '0.625rem', background: 'linear-gradient(135deg, #16a34a, #4ade80)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Leaf size={16} color="white" />
                </div>
                <div>
                  <p style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '0.9rem', color: '#fff', lineHeight: 1.2 }}>SayurSehat</p>
                  <p style={{ fontSize: '0.65rem', color: TEXT, lineHeight: 1 }}>{user?.nama || 'Seller'}</p>
                </div>
              </div>
              <button onClick={onToggleCollapse} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: TEXT, padding: '0.25rem', display: 'flex', borderRadius: '0.375rem' }} className="hidden lg:flex">
                <ChevronLeft size={16} />
              </button>
            </>
          ) : (
            <button onClick={onToggleCollapse} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: TEXT, padding: '0.25rem', borderRadius: '0.375rem', display: 'flex' }} className="hidden lg:flex">
              <div style={{ width: '2rem', height: '2rem', borderRadius: '0.5rem', background: 'linear-gradient(135deg, #16a34a, #4ade80)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Leaf size={14} color="white" />
              </div>
            </button>
          )}
        </div>

        {/* ── Main Nav ───────────────────────────────────────── */}
        <nav style={{ flex: 1, padding: '0.75rem 0.75rem', display: 'flex', flexDirection: 'column', gap: '0.25rem', overflowY: 'auto' }}>
          {!collapsed && <p style={{ fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#4a6456', padding: '0.5rem 0.25rem 0.35rem', fontFamily: 'var(--font-display)' }}>SELLER</p>}
          {NAV_MAIN.map(item => <NavItem key={item.to} {...item} />)}

          <div style={{ margin: '0.75rem 0', borderTop: '1px solid rgba(255,255,255,0.06)' }} />

          {!collapsed && <p style={{ fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#4a6456', padding: '0 0.25rem 0.35rem', fontFamily: 'var(--font-display)' }}>SETTINGS</p>}
          {NAV_BOTTOM.map(item => <NavItem key={item.to} {...item} />)}
        </nav>

        {/* ── Grow Section ────────────────────────────────────── */}
        {!collapsed && (
          <div style={{ margin: '0 0.75rem 0.75rem', padding: '1rem', borderRadius: '0.75rem', background: '#1a3020', border: '1px solid rgba(74,222,128,0.15)' }}>
            <p style={{ fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: ACCENT, marginBottom: '0.5rem', fontFamily: 'var(--font-display)' }}>GROW YOUR SHOP</p>
            <Link to="/supplier" onClick={() => { /* scroll to add form */ document.querySelector('[data-add-product]')?.click(); }} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.55rem 0.875rem', borderRadius: '0.5rem', background: '#16a34a', color: 'white', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.8rem', textDecoration: 'none', justifyContent: 'center' }}>
              <Plus size={14} /> Add Product
            </Link>
          </div>
        )}

        {/* ── Bottom: Theme + Logout ──────────────────────────── */}
        <div style={{ padding: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <button onClick={toggleTheme} style={{ display: 'flex', alignItems: 'center', gap: collapsed ? 0 : '0.75rem', justifyContent: collapsed ? 'center' : 'flex-start', padding: collapsed ? '0.7rem' : '0.65rem 1rem', borderRadius: '0.625rem', background: 'transparent', border: 'none', cursor: 'pointer', color: TEXT, transition: 'all 0.15s ease', fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: '0.85rem' }}
            onMouseOver={e => { e.currentTarget.style.background = BG_HOVER; e.currentTarget.style.color = '#fff'; }}
            onMouseOut={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = TEXT; }}>
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            {!collapsed && <span>{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>}
          </button>
          <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: collapsed ? 0 : '0.75rem', justifyContent: collapsed ? 'center' : 'flex-start', padding: collapsed ? '0.7rem' : '0.65rem 1rem', borderRadius: '0.625rem', background: 'transparent', border: 'none', cursor: 'pointer', color: '#f87171', transition: 'all 0.15s ease', fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: '0.85rem' }}
            onMouseOver={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.12)'; e.currentTarget.style.color = '#fca5a5'; }}
            onMouseOut={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#f87171'; }}>
            <LogOut size={18} />
            {!collapsed && <span>Logout</span>}
          </button>

          {/* User chip */}
          {!collapsed && user && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', padding: '0.625rem', borderRadius: '0.625rem', background: 'rgba(255,255,255,0.04)', marginTop: '0.25rem' }}>
              <div style={{ width: '2rem', height: '2rem', borderRadius: '50%', background: 'linear-gradient(135deg, #16a34a, #4ade80)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ color: 'white', fontWeight: 800, fontSize: '0.7rem' }}>{user.nama?.charAt(0)?.toUpperCase() || 'S'}</span>
              </div>
              <div style={{ minWidth: 0 }}>
                <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.725rem', color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.nama || 'Seller'}</p>
                <p style={{ fontSize: '0.6rem', color: TEXT, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Seller Account</p>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
