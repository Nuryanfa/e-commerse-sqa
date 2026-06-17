import { useState, useEffect } from 'react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { motion } from 'framer-motion';
import { Search, Filter, UserPlus, Users, Store, ShieldAlert, TrendingUp, Edit3, Trash2 } from 'lucide-react';

const S = {
  card:  { background: 'var(--surface-container-lowest)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border)', boxShadow: '0 4px 24px rgba(0,0,0,0.02)' },
  label: { fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--outline)', fontFamily: 'var(--font-display)' },
  h:     { fontFamily: 'var(--font-display)', fontWeight: 800, color: 'var(--text-heading)' },
  muted: { fontSize: '0.78rem', color: 'var(--outline)' },
};

const inp = { padding: '0.6rem 1rem', borderRadius: 'var(--radius-full)', background: 'var(--surface-container)', border: 'none', color: 'var(--on-surface)', fontSize: '0.85rem', outline: 'none', width: '100%' };

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const toast = useToast();

  const fetchUsers = () => {
    api.get('/admin/users').then(res => {
      setUsers(res.data.data || []);
    }).catch(() => {
      toast.error('Gagal mengambil data user');
    }).finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSuspend = async (id, currentStatus) => {
    const newStatus = currentStatus === 'Active' ? 'Suspended' : 'Active';
    try {
      await api.put(`/admin/users/${id}/status`, { status: newStatus });
      toast.success(`User berhasil di-${newStatus.toLowerCase()}`);
      fetchUsers();
    } catch (err) {
      toast.error('Gagal mengupdate status user');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Yakin ingin menghapus user ini secara permanen?')) return;
    try {
      await api.delete(`/admin/users/${id}`);
      toast.success('User berhasil dihapus');
      fetchUsers();
    } catch (err) {
      toast.error('Gagal menghapus user');
    }
  };

  const totalUsers = users.length;
  const totalSellers = users.filter(u => u.role === 'supplier').length;
  const suspended = users.filter(u => u.status === 'Suspended').length;

  const filtered = users.filter(u => u.name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div style={{ padding: '2.5rem 2rem', maxWidth: '80rem', margin: '0 auto', minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2.5rem' }}>
        <div>
          <h1 style={{ ...S.h, fontSize: '1.75rem', margin: 0 }}>User Management</h1>
          <p style={{ ...S.muted, marginTop: '0.25rem' }}>Manage and monitor your platform user base</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 1.25rem', borderRadius: 'var(--radius-full)', background: 'var(--surface-container)', color: 'var(--on-surface-variant)', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '0.875rem' }}>
            <Filter size={15} /> Filter
          </button>
          <button style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 1.25rem', borderRadius: 'var(--radius-full)', background: '#16a34a', color: 'white', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.875rem', boxShadow: '0 4px 12px rgba(22, 163, 74, 0.2)' }}>
            <UserPlus size={15} /> Invite User
          </button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '2.5rem' }}>
        {[
          { label: 'Active Users', val: totalUsers.toLocaleString(), icon: <Users size={16}/>, color: '#16a34a', bg: '#dcfce7' },
          { label: 'Sellers', val: totalSellers.toLocaleString(), icon: <Store size={16}/>, color: '#0284c7', bg: '#e0f2fe' },
          { label: 'Suspended', val: suspended, icon: <ShieldAlert size={16}/>, color: '#dc2626', bg: '#fee2e2' },
          { label: 'WoW (%)', val: '+12%', icon: <TrendingUp size={16}/>, color: '#16a34a', bg: '#f0fdf4' },
        ].map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} style={{ ...S.card, padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: '3rem', height: '3rem', borderRadius: 'var(--radius-full)', background: s.bg, color: s.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {s.icon}
            </div>
            <div>
              <p style={{ ...S.label, marginBottom: '0.25rem' }}>{s.label}</p>
              <p style={{ ...S.h, fontSize: '1.5rem', margin: 0 }}>{s.val}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Table Section */}
      <div style={{ ...S.card, padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)' }}>
          <div style={{ position: 'relative', width: '20rem' }}>
            <Search style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', width: '1rem', height: '1rem', color: 'var(--outline)' }} />
            <input placeholder="Search users by name or email..." value={search} onChange={e => setSearch(e.target.value)} style={{ ...inp, paddingLeft: '2.25rem' }} />
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ background: 'var(--surface-container-low)' }}>
                <th style={{ padding: '1rem 1.5rem', textAlign: 'left', ...S.label }}>USER</th>
                <th style={{ padding: '1rem 1.5rem', textAlign: 'center', ...S.label }}>ROLE</th>
                <th style={{ padding: '1rem 1.5rem', textAlign: 'center', ...S.label }}>STATUS</th>
                <th style={{ padding: '1rem 1.5rem', textAlign: 'right', ...S.label }}>JOINED DATE</th>
                <th style={{ padding: '1rem 1.5rem', textAlign: 'right', ...S.label }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u, i) => (
                <tr key={i} style={{ borderTop: i > 0 ? '1px solid var(--border)' : 'none', transition: 'background 0.2s' }} onMouseOver={e => e.currentTarget.style.background = 'var(--surface-container-low)'} onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                  <td style={{ padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
                    <div style={{ width: '2rem', height: '2rem', borderRadius: '50%', background: 'var(--surface-container-high)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: 'var(--text-heading)', fontSize: '0.8rem' }}>
                      {u.name?.charAt(0)}
                    </div>
                    <div>
                      <p style={{ margin: 0, fontWeight: 700, color: 'var(--text-heading)' }}>{u.name}</p>
                      <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--outline)' }}>{u.email}</p>
                    </div>
                  </td>
                  <td style={{ padding: '1rem 1.5rem', textAlign: 'center' }}>
                    <span style={{ fontSize: '0.65rem', fontWeight: 800, padding: '0.2rem 0.6rem', borderRadius: 'var(--radius-full)', background: u.role === 'admin' ? '#eef2ff' : u.role === 'supplier' ? '#dcfce7' : '#f1f5f9', color: u.role === 'admin' ? '#4f46e5' : u.role === 'supplier' ? '#16a34a' : 'var(--outline)', textTransform: 'uppercase' }}>
                      {u.role}
                    </span>
                  </td>
                  <td style={{ padding: '1rem 1.5rem', textAlign: 'center' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', fontWeight: 600, color: u.status === 'Active' ? '#16a34a' : '#dc2626' }}>
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: u.status === 'Active' ? '#16a34a' : '#dc2626' }} />
                      {u.status || 'Active'}
                    </span>
                  </td>
                  <td style={{ padding: '1rem 1.5rem', textAlign: 'right', color: 'var(--outline)', fontSize: '0.8rem' }}>
                    {new Date(u.created_at).toLocaleDateString('id-ID', {day:'numeric', month:'short', year:'numeric'})}
                  </td>
                  <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                      {u.role !== 'admin' && (
                        <>
                          <button 
                            onClick={() => handleSuspend(u.id, u.status)}
                            title={u.status === 'Active' ? 'Suspend User' : 'Activate User'}
                            style={{ background: 'transparent', border: 'none', color: u.status === 'Active' ? '#f59e0b' : '#16a34a', cursor: 'pointer', padding: '0.25rem' }}>
                            <ShieldAlert size={16} />
                          </button>
                          <button 
                            onClick={() => handleDelete(u.id)}
                            title="Delete User"
                            style={{ background: 'transparent', border: 'none', color: '#dc2626', cursor: 'pointer', padding: '0.25rem' }}>
                            <Trash2 size={16} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
