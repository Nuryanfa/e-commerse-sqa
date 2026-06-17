import { useAuth } from '../context/useAuth';
import { useTheme } from '../context/ThemeContext';
import { Search, Bell, Moon, Sun, Menu } from 'lucide-react';
import { useLocation } from 'react-router-dom';

export default function AdminNavbar({ onToggleSidebar }) {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');
  const isCourier = location.pathname.startsWith('/courier');

  return (
    <header style={{ 
      background: 'var(--surface-container-lowest)', 
      borderBottom: '1px solid var(--border)', 
      position: 'sticky', top: 0, zIndex: 40,
      padding: '0.75rem 1.5rem',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button 
          onClick={onToggleSidebar}
          style={{ background: 'transparent', border: 'none', color: 'var(--text-heading)', cursor: 'pointer', padding: '0.5rem' }}
          className="lg:hidden"
        >
          <Menu size={20} />
        </button>
        
        <div style={{ position: 'relative', width: '20rem' }} className="hidden md:block">
          <Search style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', width: '1rem', height: '1rem', color: 'var(--outline)' }} />
          <input 
            placeholder="Search users, orders, sellers..." 
            style={{ 
              width: '100%', padding: '0.6rem 1rem 0.6rem 2.5rem', 
              borderRadius: 'var(--radius-full)', background: 'var(--bg)', border: 'none', 
              color: 'var(--on-surface)', fontSize: '0.85rem', outline: 'none' 
            }}
          />
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
        <button onClick={toggleTheme} style={{ background: 'var(--bg)', border: 'none', width: '2rem', height: '2rem', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-heading)', cursor: 'pointer' }}>
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </button>
        
        <div style={{ width: '1px', height: '1.5rem', background: 'var(--border)' }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ textAlign: 'right' }} className="hidden sm:block">
            <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 700, fontFamily: 'var(--font-display)', color: 'var(--text-heading)' }}>{user?.nama || (isAdmin ? 'Admin Core' : isCourier ? 'Courier Account' : 'Supplier Account')}</p>
            <p style={{ margin: 0, fontSize: '0.65rem', fontWeight: 600, color: 'var(--outline)', textTransform: 'uppercase' }}>{isAdmin ? 'SUPERUSER' : isCourier ? 'COURIER' : 'SELLER'}</p>
          </div>
          <div style={{ width: '2.25rem', height: '2.25rem', borderRadius: '50%', background: isCourier ? '#4f46e5' : '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '0.875rem' }}>
            {user?.nama?.charAt(0)?.toUpperCase() || (isAdmin ? 'A' : isCourier ? 'C' : 'S')}
          </div>
        </div>
      </div>
    </header>
  );
}
