import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, Truck, History, ShieldAlert,
  Settings, LogOut, ChevronLeft, ChevronRight
} from 'lucide-react';
import { useAuth } from '../context/useAuth';

export default function CourierSidebar({ isOpen, onClose, collapsed, onToggleCollapse }) {
  const { pathname } = useLocation();
  const { logout } = useAuth();

  const links = [
    { label: 'Terminal',    path: '/courier',           icon: <LayoutDashboard size={18} /> },
    { label: 'Riwayat',     path: '/courier/history',   icon: <History size={18} /> },
    { label: 'Sengketa',    path: '/courier/disputes',  icon: <ShieldAlert size={18} /> },
    { label: 'Pengaturan',  path: '/courier/settings',  icon: <Settings size={18} /> },
  ];

  const handleLogout = () => { logout(); };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/20 z-40 lg:hidden backdrop-blur-sm" onClick={onClose} />
      )}

      {/* Sidebar Container */}
      <motion.aside
        initial={false}
        animate={{ width: collapsed ? 80 : 260, x: isOpen || window.innerWidth >= 1024 ? 0 : -260 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        style={{
          background: 'var(--surface-container-lowest)',
          borderRight: '1px solid var(--border)',
          display: 'flex', flexDirection: 'column',
          position: 'fixed', top: 0, bottom: 0, left: 0, zIndex: 50
        }}
        className="h-screen flex-shrink-0 lg:sticky"
      >
        {/* Brand Header */}
        <div style={{ padding: collapsed ? '1.5rem 0' : '1.5rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'space-between', borderBottom: '1px solid transparent' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', overflow: 'hidden' }}>
            <div style={{ width: '2rem', height: '2rem', borderRadius: '0.5rem', background: '#e0e7ff', color: '#4f46e5', display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Truck size={20} />
            </div>
            {!collapsed && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ whiteSpace: 'nowrap' }}>
                <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1rem', color: 'var(--text-heading)', margin: 0, letterSpacing: '-0.02em' }}>SayurSehat</h2>
                <p style={{ fontSize: '0.65rem', fontWeight: 700, color: '#4f46e5', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>Kurir Operasional</p>
              </motion.div>
            )}
          </div>
        </div>

        {/* Navigation Wrapper */}
        <div style={{ flex: 1, padding: collapsed ? '1rem 0.5rem' : '1rem', overflowY: 'auto' }} className="custom-scrollbar">
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            {links.map((link) => {
              const isActive = link.path === '/courier' ? pathname === '/courier' : pathname.startsWith(link.path);
              const activeStyle = isActive ? { background: '#e0e7ff', color: '#4f46e5', fontWeight: 700 } : { background: 'transparent', color: 'var(--outline)', fontWeight: 600 };

              return (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    onClick={() => { if (window.innerWidth < 1024) onClose(); }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: collapsed ? '0' : '0.875rem',
                      padding: collapsed ? '0.75rem' : '0.75rem 1rem',
                      borderRadius: 'var(--radius-md)',
                      textDecoration: 'none',
                      fontSize: '0.875rem',
                      fontFamily: 'var(--font-display)',
                      transition: 'all 0.15s ease',
                      justifyContent: collapsed ? 'center' : 'flex-start',
                      ...activeStyle
                    }}
                    onMouseOver={(e) => { if (!isActive) e.currentTarget.style.background = 'var(--surface-container)'; }}
                    onMouseOut={(e) => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
                    title={collapsed ? link.label : ''}
                  >
                    <span style={{ flexShrink: 0 }}>{link.icon}</span>
                    {!collapsed && <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ whiteSpace: 'nowrap' }}>{link.label}</motion.span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Footer Actions */}
        <div style={{ padding: collapsed ? '1rem 0.5rem' : '1.5rem', borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <button
            onClick={handleLogout}
            style={{
              display: 'flex', alignItems: 'center', gap: collapsed ? '0' : '0.875rem',
              padding: collapsed ? '0.75rem' : '0.75rem 1rem',
              borderRadius: 'var(--radius-md)', background: 'transparent',
              color: 'var(--outline)', border: 'none', cursor: 'pointer',
              fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '0.875rem',
              justifyContent: collapsed ? 'center' : 'flex-start',
              transition: 'background 0.15s', width: '100%'
            }}
            onMouseOver={(e) => { e.currentTarget.style.background = 'var(--surface-container)'; e.currentTarget.style.color = '#dc2626'; }}
            onMouseOut={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--outline)'; }}
            title={collapsed ? "Logout" : ""}
          >
            <LogOut size={18} />
            {!collapsed && <span style={{ whiteSpace: 'nowrap' }}>Logout</span>}
          </button>
          
          <button
            onClick={onToggleCollapse}
            style={{
              alignItems: 'center', gap: collapsed ? '0' : '0.875rem',
              padding: collapsed ? '0.75rem' : '0.75rem 1rem',
              borderRadius: 'var(--radius-md)', background: 'transparent',
              color: 'var(--outline)', border: 'none', cursor: 'pointer',
              fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '0.875rem',
              justifyContent: collapsed ? 'center' : 'flex-start', width: '100%'
            }}
            className="hidden lg:flex hover:bg-slate-50 dark:hover:bg-slate-800/50"
          >
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
            {!collapsed && <span style={{ whiteSpace: 'nowrap' }}>Collapse</span>}
          </button>
        </div>
      </motion.aside>
    </>
  );
}
