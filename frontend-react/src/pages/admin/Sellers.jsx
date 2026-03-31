import { useState, useEffect } from 'react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { motion } from 'framer-motion';
import { Search, Filter, Share, CheckCircle, Clock, XCircle, Star, Edit3, Shield, Store } from 'lucide-react';

const S = {
  card:  { background: 'var(--surface-container-lowest)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border)', boxShadow: '0 4px 24px rgba(0,0,0,0.02)' },
  label: { fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--outline)', fontFamily: 'var(--font-display)' },
  h:     { fontFamily: 'var(--font-display)', fontWeight: 800, color: 'var(--text-heading)' },
  muted: { fontSize: '0.78rem', color: 'var(--outline)' },
};

const inp = { padding: '0.6rem 1rem', borderRadius: 'var(--radius-full)', background: 'var(--surface-container)', border: 'none', color: 'var(--on-surface)', fontSize: '0.85rem', outline: 'none', width: '100%' };

export default function AdminSellers() {
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const toast = useToast();

  useEffect(() => {
    api.get('/admin/sellers').then(res => {
      setSellers(res.data.data || []);
    }).catch(() => {
      toast.error('Gagal mengambil data seller');
    }).finally(() => setLoading(false));
  }, []);

  const filtered = sellers.filter(s => s.store_name?.toLowerCase().includes(search.toLowerCase()) || s.owner_name?.toLowerCase().includes(search.toLowerCase()));

  const getStatus = (s) => {
    switch(s) {
      case 'Verified': return <span style={{ padding: '0.2rem 0.6rem', background: '#dcfce7', color: '#16a34a', borderRadius: 'var(--radius-full)', fontSize: '0.7rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}><CheckCircle size={12}/> {s}</span>;
      case 'Pending':  return <span style={{ padding: '0.2rem 0.6rem', background: '#fef08a', color: '#854d0e', borderRadius: 'var(--radius-full)', fontSize: '0.7rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}><Clock size={12}/> Menunggu</span>;
      case 'Rejected': return <span style={{ padding: '0.2rem 0.6rem', background: '#fee2e2', color: '#dc2626', borderRadius: 'var(--radius-full)', fontSize: '0.7rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}><XCircle size={12}/> Ditolak</span>;
      default: return <span style={{ padding: '0.2rem 0.6rem', background: 'var(--surface-container)', color: 'var(--outline)', borderRadius: 'var(--radius-full)', fontSize: '0.7rem', fontWeight: 700 }}>{s}</span>;
    }
  };

  return (
    <div style={{ padding: '2.5rem 2rem', maxWidth: '80rem', margin: '0 auto', minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2.5rem' }}>
        <div>
          <h1 style={{ ...S.h, fontSize: '1.75rem', margin: 0 }}>Manajemen Seller</h1>
          <p style={{ ...S.muted, marginTop: '0.25rem' }}>Kelola ekosistem kemitraan petani dan toko organik Anda.</p>
        </div>
        <button style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 1.25rem', borderRadius: 'var(--radius-full)', background: '#16a34a', color: 'white', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.875rem', boxShadow: '0 4px 12px rgba(22, 163, 74, 0.2)' }}>
          <Shield size={15} /> Undang Seller Baru
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '2.5rem' }}>
        {[
          { label: 'Total Seller', val: sellers.length.toLocaleString(), pct: 'Active', c: '#16a34a', bc: '#dcfce7' },
          { label: 'Seller Verifikasi', val: sellers.filter(s => s.status === 'Verified').length.toLocaleString(), pct: 'Approved', c: '#0284c7', bc: '#e0f2fe' },
          { label: 'Menunggu Verif', val: sellers.filter(s => s.status === 'Pending').length, pct: 'Urgent', c: '#ea580c', bc: '#ffedd5', isUrgent: true },
          { label: 'Rata-rata Produk', val: (sellers.reduce((sum, s) => sum + s.products, 0) / (sellers.length || 1)).toFixed(0), pct: 'Katalog', c: '#16a34a', bc: '#dcfce7' },
        ].map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} style={{ ...S.card, padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ width: '2rem', height: '2rem', borderRadius: '0.5rem', background: s.bc, color: s.c, display:'flex', alignItems:'center', justifyContent:'center' }}><Store size={14}/></span>
              <span style={{ fontSize: '0.65rem', fontWeight: 800, padding: '0.15rem 0.5rem', borderRadius: 'var(--radius-full)', background: s.isUrgent ? '#fee2e2' : 'var(--surface-container)', color: s.isUrgent ? '#dc2626' : 'var(--outline)', textTransform: 'uppercase' }}>{s.pct}</span>
            </div>
            <p style={{ ...S.h, fontSize: '1.75rem', margin: 0 }}>{s.val}</p>
            <p style={{ ...S.label, marginTop: '0.25rem' }}>{s.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Table */}
      <div style={{ ...S.card, padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)' }}>
          <h3 style={{ ...S.h, fontSize: '1.1rem', margin: 0 }}>Daftar Seller</h3>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <div style={{ position: 'relative', width: '16rem' }}>
              <Search style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', width: '1rem', height: '1rem', color: 'var(--outline)' }} />
              <input placeholder="Cari seller..." value={search} onChange={e => setSearch(e.target.value)} style={{ ...inp, paddingLeft: '2.25rem' }} />
            </div>
            <button style={{ background: 'transparent', border: 'none', color: 'var(--on-surface-variant)', cursor: 'pointer', padding: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', fontWeight: 600 }}><Filter size={16}/> Filter</button>
            <button style={{ background: 'transparent', border: 'none', color: 'var(--on-surface-variant)', cursor: 'pointer', padding: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', fontWeight: 600 }}><Share size={16}/> Ekspor CSV</button>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ background: 'var(--surface-container-low)' }}>
                <th style={{ padding: '1rem 1.5rem', textAlign: 'left', ...S.label }}>NAMA TOKO</th>
                <th style={{ padding: '1rem 1.5rem', textAlign: 'left', ...S.label }}>PEMILIK</th>
                <th style={{ padding: '1rem 1.5rem', textAlign: 'center', ...S.label }}>KATEGORI</th>
                <th style={{ padding: '1rem 1.5rem', textAlign: 'center', ...S.label }}>STATUS</th>
                <th style={{ padding: '1rem 1.5rem', textAlign: 'right', ...S.label }}>PRODUK</th>
                <th style={{ padding: '1rem 1.5rem', textAlign: 'center', ...S.label }}>RATING</th>
                <th style={{ padding: '1rem 1.5rem', textAlign: 'center', ...S.label }}>AKSI</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s, i) => (
                <tr key={s.id} style={{ borderTop: i > 0 ? '1px solid var(--border)' : 'none', transition: 'background 0.2s' }} onMouseOver={e => e.currentTarget.style.background = 'var(--surface-container-low)'} onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                  <td style={{ padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
                    <div style={{ width: '2.5rem', height: '2.5rem', borderRadius: '0.5rem', background: '#006c3e', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '0.9rem' }}>
                      {s.store_name?.charAt(0) || s.owner_name?.charAt(0)}
                    </div>
                    <div>
                      <p style={{ margin: 0, fontWeight: 700, color: 'var(--text-heading)' }}>{s.store_name}</p>
                    </div>
                  </td>
                  <td style={{ padding: '1rem 1.5rem', color: 'var(--outline)' }}>{s.owner_name}</td>
                  <td style={{ padding: '1rem 1.5rem', textAlign: 'center' }}>
                    <span style={{ fontSize: '0.7rem', padding: '0.2rem 0.6rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-full)', color: 'var(--outline)' }}>{s.category || 'Sayuran'}</span>
                  </td>
                  <td style={{ padding: '1rem 1.5rem', textAlign: 'center' }}>{getStatus(s.status)}</td>
                  <td style={{ padding: '1rem 1.5rem', textAlign: 'right', fontWeight: 600, color: 'var(--text-heading)' }}>{s.products} <span style={{fontSize:'0.65rem',color:'var(--outline)',fontWeight:500,marginLeft:'0.15rem'}}>items</span></td>
                  <td style={{ padding: '1rem 1.5rem', textAlign: 'center' }}>
                    {s.rating > 0 ? (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontWeight: 700, color: '#ca8a04', background: '#fef08a', padding: '0.15rem 0.5rem', borderRadius: '0.25rem', fontSize: '0.75rem' }}>
                        <Star size={12} fill="#ca8a04" color="#ca8a04"/> {s.rating.toFixed(1)}
                      </span>
                    ) : (
                      <span style={{ color: 'var(--outline)', fontSize: '0.75rem' }}>Belum ada</span>
                    )}
                  </td>
                  <td style={{ padding: '1rem 1.5rem', textAlign: 'center' }}>
                    <button style={{ background: 'transparent', border: 'none', color: '#16a34a', cursor: 'pointer', padding: '0.4rem 1rem', borderRadius: 'var(--radius-full)', fontWeight: 700, fontSize: '0.75rem', fontFamily: 'var(--font-display)' }}>
                      Detail Profil
                    </button>
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
