import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { Search, ShieldAlert, Eye, MessageSquare, CheckCircle, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const S = {
  card:  { background: 'var(--surface-container-lowest)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border)', boxShadow: '0 4px 24px rgba(0,0,0,0.02)' },
  label: { fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--outline)', fontFamily: 'var(--font-display)' },
  h:     { fontFamily: 'var(--font-display)', fontWeight: 800, color: 'var(--text-heading)' },
  muted: { fontSize: '0.78rem', color: 'var(--outline)' },
};
const inp = { width: '100%', padding: '0.65rem 1rem', borderRadius: 'var(--radius-md)', background: 'var(--surface-container)', border: 'none', color: 'var(--on-surface)', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box' };

export default function SupplierDisputes() {
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const toast = useToast();

  useEffect(() => {
    api.get('/disputes')
      .then(res => setDisputes(res.data.data || []))
      .catch(() => toast.error('Gagal memuat daftar sengketa'))
      .finally(() => setLoading(false));
  }, []);

  const getStatusBadge = (s) => {
    switch(s) {
      case 'OPEN': return <span className="px-2.5 py-1 inline-flex items-center gap-1 rounded-full text-[10px] font-black tracking-widest bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400"><MessageSquare className="w-3 h-3"/> SELESAIKAN</span>;
      case 'REFUNDED': return <span className="px-2.5 py-1 inline-flex items-center gap-1 rounded-full text-[10px] font-black tracking-widest bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400"><CheckCircle className="w-3 h-3"/> DIKEMBALIKAN</span>;
      case 'REJECTED': return <span className="px-2.5 py-1 inline-flex items-center gap-1 rounded-full text-[10px] font-black tracking-widest bg-slate-100 dark:bg-slate-800 text-slate-500"><XCircle className="w-3 h-3"/> DITOLAK</span>;
      default: return <span className="px-2.5 py-1 rounded-full text-xs bg-gray-100 text-gray-700">{s}</span>;
    }
  };

  const filtered = disputes.filter(d => !search || d.id_order.toLowerCase().includes(search.toLowerCase()));

  return (
    <div style={{ padding: '2.5rem 2rem', maxWidth: '75rem', margin: '0 auto', minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2.5rem' }}>
        <div>
          <h1 style={{ ...S.h, fontSize: '1.75rem', margin: 0 }}>Dispute Resolution</h1>
          <p style={{ ...S.muted, marginTop: '0.25rem' }}>Tanggapi keluhan pembeli terkait pesanan</p>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: '24rem' }}>
          <Search style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', width: '1rem', height: '1rem', color: 'var(--outline)' }} />
          <input placeholder="Cari ID Pesanan..." value={search} onChange={e => setSearch(e.target.value)} style={{ ...inp, paddingLeft: '2.5rem', borderRadius: 'var(--radius-full)' }} />
        </div>
      </div>

      {/* Table */}
      <div style={{ ...S.card, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--outline)' }}>Memuat data sengketa...</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '4rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
            <ShieldAlert style={{ width: '3rem', height: '3rem', color: 'var(--outline)', opacity: 0.4 }} />
            <p style={{ ...S.h, fontSize: '1rem', margin: 0 }}>Toko Anda bersih!</p>
            <p style={{ ...S.muted }}>Tidak ada komplain pembeli yang perlu ditangani.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ background: 'var(--surface-container-low)' }}>
                  {['ID Pesanan', 'Tgl Masuk', 'Alasan', 'Status', 'Aksi'].map(h => (
                    <th key={h} style={{ padding: '0.75rem 1.25rem', textAlign: h==='Status'||h==='Aksi' ? 'center' : 'left', ...S.label }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((d) => (
                  <tr key={d.id_dispute} style={{ borderTop: '1px solid var(--border)', transition: 'background 0.15s' }}
                    onMouseOver={e => e.currentTarget.style.background = 'var(--surface-container-low)'}
                    onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                    <td style={{ padding: '0.875rem 1.25rem' }}>
                      <p style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--text-heading)', margin: 0 }}>#{d.id_order?.slice(0, 8).toUpperCase()}</p>
                    </td>
                    <td style={{ padding: '0.875rem 1.25rem', color: 'var(--outline)', fontSize: '0.8rem' }}>
                      {new Date(d.created_at).toLocaleDateString('id-ID', {day:'numeric', month:'short', year:'numeric'})}
                    </td>
                    <td style={{ padding: '0.875rem 1.25rem', maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: 'var(--text-heading)', fontWeight: 500 }}>
                      {d.reason}
                    </td>
                    <td style={{ padding: '0.875rem 1.25rem', textAlign: 'center' }}>
                      {getStatusBadge(d.status)}
                    </td>
                    <td style={{ padding: '0.875rem 1.25rem', textAlign: 'center' }}>
                      <Link to={`/disputes/${d.id_dispute}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.4rem 1rem', borderRadius: 'var(--radius-full)', background: 'var(--surface-container)', color: 'var(--on-surface-variant)', textDecoration: 'none', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.75rem', transition: 'all 0.15s' }} onMouseOver={e => { e.currentTarget.style.background = 'rgba(217,119,6,0.1)'; e.currentTarget.style.color = '#d97706'; }} onMouseOut={e => { e.currentTarget.style.background = 'var(--surface-container)'; e.currentTarget.style.color = 'var(--on-surface-variant)'; }}>
                        <Eye size={14} /> Lihat Detail
                      </Link>
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
