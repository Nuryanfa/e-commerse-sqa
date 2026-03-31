import { useState, useEffect } from 'react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { motion } from 'framer-motion';
import { ShoppingCart, CheckCircle, Package, Search, Filter } from 'lucide-react';

const S = {
  card:  { background: 'var(--surface-container-lowest)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border)', boxShadow: '0 4px 24px rgba(0,0,0,0.02)' },
  label: { fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--outline)', fontFamily: 'var(--font-display)' },
  h:     { fontFamily: 'var(--font-display)', fontWeight: 800, color: 'var(--text-heading)' },
  muted: { fontSize: '0.78rem', color: 'var(--outline)' },
};
const inp = { width: '100%', padding: '0.65rem 1rem', borderRadius: 'var(--radius-md)', background: 'var(--surface-container)', border: 'none', color: 'var(--on-surface)', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box' };

const StatusBadge = ({ status }) => {
  const map = {
    'PENDING':   { bg: 'var(--surface-container)', color: 'var(--on-surface-variant)', label: 'Menunggu', dot: '#94a3b8' },
    'PAID':      { bg: 'rgba(56,189,248,0.1)', color: '#0369a1', label: 'Dibayar', dot: '#38bdf8' },
    'PROCESSED': { bg: 'rgba(217,119,6,0.1)', color: '#d97706', label: 'Diproses', dot: '#f59e0b' },
    'SHIPPED':   { bg: 'rgba(139,92,246,0.1)', color: '#6d28d9', label: 'Dikirim', dot: '#8b5cf6' },
    'DELIVERED': { bg: 'rgba(22,163,74,0.1)', color: '#15803d', label: 'Selesai', dot: '#22c55e' },
    'CANCELLED': { bg: 'rgba(220,38,38,0.1)', color: '#b91c1c', label: 'Dibatalkan', dot: '#ef4444' },
    'REFUNDED':  { bg: 'rgba(236,72,153,0.1)', color: '#be185d', label: 'Dikembalikan', dot: '#ec4899' },
  };
  const c = map[status] || map.PENDING;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', background: c.bg, color: c.color, fontSize: '0.7rem', fontWeight: 700, padding: '0.25rem 0.6rem', borderRadius: 'var(--radius-full)' }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: c.dot }} /> {c.label}
    </span>
  );
};

export default function SupplierOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const toast = useToast();

  const fetchOrders = () => {
    setLoading(true);
    api.get('/supplier/orders')
      .then(res => setOrders(res.data.data || []))
      .catch(() => toast.error('Gagal memuat pesanan'))
      .finally(() => setLoading(false));
  };
  useEffect(fetchOrders, []);

  const toggleSelect = (id) => setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);
  const toggleAll = () => setSelected(s => s.length === orders.filter(o=>o.status==='PAID').length ? [] : orders.filter(o=>o.status==='PAID').map(o=>o.id_order));

  const processOrder = (id) => {
    api.put(`/supplier/orders/${id}/process`)
      .then(() => { toast.success('Pesanan diproses'); fetchOrders(); setSelected(s => s.filter(x => x !== id)); })
      .catch((err) => toast.error(err.response?.data?.error || 'Gagal update status'));
  };
  const processBulk = () => {
    if(!selected.length) return;
    Promise.all(selected.map(id => api.put(`/supplier/orders/${id}/process`)))
      .then(() => { toast.success(`${selected.length} pesanan diproses`); setSelected([]); fetchOrders(); })
      .catch(() => toast.error('Beberapa gagal diproses'));
  };

  const filtered = orders.filter(o => {
    const sOk = !search || o.id_order.toLowerCase().includes(search.toLowerCase());
    const fOk = !statusFilter || o.status === statusFilter;
    return sOk && fOk;
  });

  const newOrders = orders.filter(o => o.status === 'PAID').length;
  const processed = orders.filter(o => o.status === 'PROCESSED').length;

  return (
    <div style={{ padding: '2.5rem 2rem', maxWidth: '75rem', margin: '0 auto', minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2.5rem' }}>
        <div>
          <h1 style={{ ...S.h, fontSize: '1.75rem', margin: 0 }}>Orders to Fulfill</h1>
          <p style={{ ...S.muted, marginTop: '0.25rem' }}>Kelola pesanan masuk dan pengiriman</p>
        </div>
        {selected.length > 0 && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: '#006c3e', padding: '0.5rem 1rem', borderRadius: 'var(--radius-full)' }}>
            <span style={{ color: 'white', fontSize: '0.8rem', fontWeight: 600 }}>{selected.length} dipilih</span>
            <button onClick={processBulk} style={{ padding: '0.4rem 1rem', borderRadius: 'var(--radius-full)', background: 'white', color: '#006c3e', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.8rem' }}>Proses Massal</button>
          </motion.div>
        )}
      </div>

      {/* Stat strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        {[
          { label: 'NEW ORDERS', val: newOrders, icon: <ShoppingCart size={18} />, color: '#0ea5e9', desc: 'Selesai dibayar' },
          { label: 'PROCESSING', val: processed, icon: <Package size={18} />,      color: '#d97706', desc: 'Sedang disiapkan' },
          { label: 'TOTAL ORDERS', val: orders.length, icon: <ShoppingCart size={18} />, color: '#16a34a', desc: 'Keseluruhan' },
        ].map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
            style={{ ...S.card, padding: '1.25rem', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
            <div style={{ width: '2.75rem', height: '2.75rem', borderRadius: 'var(--radius-md)', background: `${s.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.color, flexShrink: 0 }}>{s.icon}</div>
            <div>
              <p style={{ ...S.label, color: s.color, marginBottom: '0.25rem' }}>{s.label}</p>
              <p style={{ ...S.h, fontSize: '1.75rem', margin: 0 }}>{s.val}</p>
              <p style={{ ...S.muted }}>{s.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem' }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: '20rem' }}>
          <Search style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', width: '1rem', height: '1rem', color: 'var(--outline)' }} />
          <input placeholder="Cari ID Pesanan..." value={search} onChange={e => setSearch(e.target.value)} style={{ ...inp, paddingLeft: '2.5rem', borderRadius: 'var(--radius-full)' }} />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ ...inp, width: 'auto', cursor: 'pointer', borderRadius: 'var(--radius-full)' }}>
          <option value="">Semua Status</option>
          <option value="PAID">Perlu Diproses</option>
          <option value="PROCESSED">Sedang Diproses</option>
          <option value="SHIPPED">Dikirim</option>
          <option value="DELIVERED">Selesai</option>
        </select>
      </div>

      {/* Table */}
      <div style={{ ...S.card, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--outline)' }}>Memuat pesanan...</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '4rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
            <ShoppingCart style={{ width: '3rem', height: '3rem', color: 'var(--outline)', opacity: 0.4 }} />
            <p style={{ ...S.h, fontSize: '1rem', margin: 0 }}>Tidak ada pesanan</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ background: 'var(--surface-container-low)' }}>
                  <th style={{ padding: '0.75rem 1.25rem', width: '3rem', textAlign: 'center' }}>
                    <input type="checkbox" onChange={toggleAll} checked={selected.length > 0 && selected.length === orders.filter(o=>o.status==='PAID').length} style={{ cursor: 'pointer' }}/>
                  </th>
                  {['Order ID / Customer', 'Total Amount', 'Date', 'Status', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '0.75rem 1.25rem', textAlign: h === 'Order ID / Customer' ? 'left' : 'center', ...S.label }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(o => (
                  <tr key={o.id_order} style={{ borderTop: '1px solid var(--border)', transition: 'background 0.15s', background: selected.includes(o.id_order) ? 'rgba(22,163,74,0.05)' : 'transparent' }}
                    onMouseOver={e => { if(!selected.includes(o.id_order)) e.currentTarget.style.background = 'var(--surface-container-low)' }}
                    onMouseOut={e => { e.currentTarget.style.background = selected.includes(o.id_order) ? 'rgba(22,163,74,0.05)' : 'transparent' }}>
                    <td style={{ padding: '0.875rem 1.25rem', textAlign: 'center' }}>
                      {o.status === 'PAID' && <input type="checkbox" checked={selected.includes(o.id_order)} onChange={() => toggleSelect(o.id_order)} style={{ cursor: 'pointer' }}/>}
                    </td>
                    <td style={{ padding: '0.875rem 1.25rem' }}>
                      <p style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--text-heading)', margin: 0 }}>#{o.id_order?.slice(0,8).toUpperCase()}</p>
                      <p style={{ fontSize: '0.7rem', color: 'var(--outline)' }}>{o.user?.nama || 'Guest'}</p>
                    </td>
                    <td style={{ padding: '0.875rem 1.25rem', textAlign: 'center', fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--md-primary)' }}>
                      Rp {o.total_amount?.toLocaleString('id-ID')}
                    </td>
                    <td style={{ padding: '0.875rem 1.25rem', textAlign: 'center', color: 'var(--outline)', fontSize: '0.8rem' }}>
                      {new Date(o.created_at).toLocaleDateString('id-ID', { day:'numeric', month:'short', year:'numeric' })}
                    </td>
                    <td style={{ padding: '0.875rem 1.25rem', textAlign: 'center' }}>
                      <StatusBadge status={o.status} />
                    </td>
                    <td style={{ padding: '0.875rem 1.25rem', textAlign: 'center' }}>
                      {o.status === 'PAID' && (
                        <button onClick={() => processOrder(o.id_order)} style={{ padding: '0.4rem 1rem', borderRadius: 'var(--radius-full)', background: '#16a34a', color: 'white', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.75rem' }}>
                          Process
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
