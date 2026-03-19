import { useState, useEffect, useMemo } from 'react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { useModal } from '../../context/ModalContext';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import ImageDropzone from '../../components/ImageDropzone';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Store, Package, ClipboardList, TrendingUp, DollarSign,
  Plus, Edit, Trash2, Tag, Star, CheckCircle, X,
  ShoppingBag, BarChart2, AlertTriangle, Search, ChevronRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const CHART_COLORS = ['#006c3e', '#2eb87a', '#10b981', '#34d399', '#6ee7b7', '#a7f3d0', '#d1fae5'];

/* ── Token shorthands ──────────────────────────────────── */
const S = {
  card:    { background: 'var(--surface-container-lowest)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', padding: '1.5rem' },
  cardSm:  { background: 'var(--surface-container-lowest)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', padding: '1rem 1.25rem' },
  label:   { fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: 'var(--outline)', fontFamily: 'var(--font-display)' },
  heading: { fontFamily: 'var(--font-display)', fontWeight: 800, color: 'var(--text-heading)' },
  muted:   { fontSize: '0.8rem', color: 'var(--outline)' },
};

const inputSt = {
  width: '100%', padding: '0.7rem 1rem', borderRadius: 'var(--radius-md)', background: 'var(--surface-container)',
  border: 'none', color: 'var(--on-surface)', fontSize: '0.875rem', outline: 'none', fontFamily: 'var(--font-body)', boxSizing: 'border-box',
};

/* ── Status Badge ──────────────────────────────────────── */
function StatusBadge({ status }) {
  const cfg = {
    PENDING:   { bg: 'rgba(251,191,36,0.12)', color: '#d97706' },
    PAID:      { bg: 'rgba(59,130,246,0.12)',  color: '#2563eb' },
    PROCESSED: { bg: 'rgba(16,185,129,0.12)', color: '#059669' },
    SHIPPED:   { bg: 'rgba(139,92,246,0.12)', color: '#7c3aed' },
    DELIVERED: { bg: 'rgba(0,108,62,0.15)',   color: 'var(--md-primary)' },
    CANCELLED: { bg: 'rgba(239,68,68,0.10)',  color: '#dc2626' },
  };
  const s = cfg[status] || { bg: 'var(--surface-container)', color: 'var(--outline)' };
  return (
    <span style={{ background: s.bg, color: s.color, fontSize: '0.7rem', fontWeight: 700, padding: '0.2rem 0.65rem', borderRadius: 'var(--radius-full)', letterSpacing: '0.06em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
      {status}
    </span>
  );
}

/* ── Internal Panel Header ─────────────────────────────── */
function PanelHeader({ title, subtitle, action }) {
  return (
    <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--surface-container-lowest)', borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0' }}>
      <div>
        <h2 style={{ ...S.heading, fontSize: '1rem', margin: 0 }}>{title}</h2>
        {subtitle && <p style={{ ...S.muted, marginTop: '0.15rem' }}>{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export default function SupplierDashboard() {
  const { user } = useAuth();
  const [products,       setProducts]       = useState([]);
  const [orders,         setOrders]         = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [showForm,       setShowForm]       = useState(false);
  const [editing,        setEditing]        = useState(null);
  const [categories,     setCategories]     = useState([]);
  const [form,           setForm]           = useState({ name: '', description: '', price: '', stock: '', id_category: '', image_url: '' });
  const [imageFile,      setImageFile]      = useState(null);
  const [tab,            setTab]            = useState('products');
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [search,         setSearch]         = useState('');
  const toast  = useToast();
  const modal  = useModal();

  const fetchData = () => {
    setLoading(true);
    Promise.all([
      api.get('/supplier/products'),
      api.get('/supplier/orders'),
      api.get('/categories'),
    ]).then(([p, o, c]) => {
      setProducts(p.data.data || []);
      setOrders(o.data.data || []);
      setCategories(c.data.data || []);
    }).catch(() => {}).finally(() => setLoading(false));
  };
  useEffect(fetchData, []);

  const resetForm = () => { setForm({ name: '', description: '', price: '', stock: '', id_category: '', image_url: '' }); setEditing(null); setShowForm(false); setImageFile(null); };

  const handleProcessOrder = (orderId) => {
    modal.confirm({
      title: 'Proses Pesanan', message: 'Apakah pesanan ini siap untuk dipacking dan diserahkan ke kurir?', type: 'warning', confirmText: 'Ya, Proses Sekarang',
      onConfirm: async () => {
        try { await api.put(`/supplier/orders/${orderId}/process`); toast.success('Pesanan berhasil diproses!'); const { data } = await api.get('/supplier/orders'); setOrders(data.data || []); }
        catch (err) { toast.error(err.response?.data?.error || 'Gagal merubah status pesanan'); }
      }
    });
  };

  const handleBulkProcess = () => {
    if (selectedOrders.length === 0) return;
    modal.confirm({
      title: 'Proses Massal', message: `Apakah Anda yakin memproses ${selectedOrders.length} pesanan sekaligus?`, type: 'warning', confirmText: 'Proses Semua',
      onConfirm: async () => {
        try { await api.post('/supplier/orders/batch-process', { order_ids: selectedOrders }); toast.success(`${selectedOrders.length} pesanan berhasil diproses!`); const { data } = await api.get('/supplier/orders'); setOrders(data.data || []); setSelectedOrders([]); }
        catch (err) { toast.error(err.response?.data?.error || 'Gagal memproses massal'); }
      }
    });
  };

  const toggleSelectOrder = (id) => setSelectedOrders(prev => prev.includes(id) ? prev.filter(oId => oId !== id) : [...prev, id]);
  const toggleSelectAll   = () => {
    const processable = orders.filter(o => o.status === 'PAID').map(o => o.id_order);
    setSelectedOrders(selectedOrders.length === processable.length ? [] : processable);
  };

  const submit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('name', form.name); formData.append('description', form.description || '');
    formData.append('price', parseFloat(form.price)); formData.append('stock', parseInt(form.stock));
    formData.append('id_category', form.id_category);
    if (form.image_url) formData.append('image_url', form.image_url);
    if (imageFile) formData.append('image', imageFile);
    try {
      if (editing) { await api.put(`/supplier/products/${editing}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }); toast.success('Produk berhasil diperbarui'); }
      else         { await api.post('/supplier/products', formData, { headers: { 'Content-Type': 'multipart/form-data' } }); toast.success('Produk berhasil ditambahkan'); }
      resetForm(); fetchData();
    } catch (err) { toast.error(err.response?.data?.error || 'Gagal menyimpan produk'); }
  };

  const del = (id) => modal.confirm({
    title: 'Hapus Produk', message: 'Apakah Anda yakin ingin menghapus produk ini?', type: 'danger', confirmText: 'Ya, Hapus',
    onConfirm: async () => { try { await api.delete(`/supplier/products/${id}`); toast.success('Produk berhasil dihapus'); fetchData(); } catch { toast.error('Gagal menghapus produk'); } }
  });

  const startEdit = (p) => { setForm({ name: p.name, description: p.description || '', price: p.price, stock: p.stock, id_category: p.id_category, image_url: p.image_url || '' }); setEditing(p.id_product); setShowForm(true); setTab('products'); };

  const totalRevenue = orders.reduce((s, o) => s + (o.total_amount || 0), 0);
  const totalStock   = products.reduce((s, p) => s + p.stock, 0);

  const topProducts = [...products].sort((a, b) => b.stock - a.stock).slice(0, 5).map(p => ({ name: p.name.length > 16 ? p.name.substring(0, 16) + '…' : p.name, stock: p.stock }));
  const orderTrends = useMemo(() => {
    const grouped = {};
    orders.forEach(o => { const d = new Date(o.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }); grouped[d] = (grouped[d] || 0) + (o.total_amount || 0); });
    return Object.keys(grouped).slice(-7).map(k => ({ date: k, revenue: grouped[k] }));
  }, [orders]);

  const filteredProducts = search ? products.filter(p => p.name.toLowerCase().includes(search.toLowerCase())) : products;

  const statCards = [
    { icon: <Package style={{ width: '1.25rem', height: '1.25rem' }} />, label: 'Total Produk',   value: products.length,    color: 'var(--md-primary)' },
    { icon: <ClipboardList style={{ width: '1.25rem', height: '1.25rem' }} />, label: 'Total Pesanan', value: orders.length,      color: '#2563eb' },
    { icon: <TrendingUp style={{ width: '1.25rem', height: '1.25rem' }} />, label: 'Total Stok',   value: totalStock,         color: '#d97706' },
    { icon: <DollarSign style={{ width: '1.25rem', height: '1.25rem' }} />, label: 'Pendapatan',   value: `Rp ${(totalRevenue / 1_000_000).toFixed(1)}jt`, color: '#7c3aed' },
  ];

  const TABS = [
    { key: 'products',  label: `Produk (${products.length})`,   icon: <Package style={{ width: '0.875rem', height: '0.875rem' }} /> },
    { key: 'orders',    label: `Pesanan (${orders.length})`,   icon: <ClipboardList style={{ width: '0.875rem', height: '0.875rem' }} /> },
    { key: 'analytics', label: 'Analitik',                      icon: <BarChart2 style={{ width: '0.875rem', height: '0.875rem' }} /> },
  ];

  if (loading) return (
    <div style={{ padding: '2rem', maxWidth: '72rem', margin: '0 auto' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
        {[...Array(4)].map((_, i) => <div key={i} className="skeleton" style={{ height: '6.5rem', borderRadius: 'var(--radius-lg)' }} />)}
      </div>
      <div className="skeleton" style={{ height: '24rem', borderRadius: 'var(--radius-lg)' }} />
    </div>
  );

  return (
    <div style={{ padding: '2rem 1.5rem', maxWidth: '72rem', margin: '0 auto', background: 'var(--bg)', minHeight: '100vh' }}>

      {/* ── Page Header ─────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '3rem', height: '3rem', borderRadius: 'var(--radius-md)', background: 'var(--md-primary-container)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--md-on-primary-container)' }}>
            <Store style={{ width: '1.5rem', height: '1.5rem' }} />
          </div>
          <div>
            <h1 style={{ ...S.heading, fontSize: '1.5rem', margin: 0 }}>Dashboard Seller</h1>
            <p style={{ ...S.muted, marginTop: '0.2rem' }}>Selamat datang, {user?.nama || 'Seller'} 👋</p>
          </div>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(!showForm); setTab('products'); }}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.7rem 1.25rem', borderRadius: 'var(--radius-full)', background: showForm ? 'var(--surface-container)' : 'var(--brand-gradient)', color: showForm ? 'var(--on-surface)' : 'white', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.875rem', border: 'none', cursor: 'pointer', boxShadow: showForm ? 'none' : 'var(--shadow-md)' }}
        >
          {showForm ? <><X style={{ width: '1rem', height: '1rem' }} /> Batal</> : <><Plus style={{ width: '1rem', height: '1rem' }} /> Tambah Produk</>}
        </button>
      </div>

      {/* ── Stat Cards ──────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '2rem' }} className="md:grid-cols-4">
        {statCards.map((c, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
            style={{ ...S.card, display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem' }}>
            <div style={{ width: '2.75rem', height: '2.75rem', borderRadius: 'var(--radius-md)', background: `${c.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: c.color, flexShrink: 0 }}>
              {c.icon}
            </div>
            <div>
              <p style={{ ...S.label, marginBottom: '0.25rem' }}>{c.label}</p>
              <p style={{ ...S.heading, fontSize: '1.5rem', margin: 0 }}>{c.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ── Add / Edit Form ─────────────────────────────────── */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} style={{ overflow: 'hidden', marginBottom: '1.5rem' }}>
            <div style={{ ...S.card, padding: 0 }}>
              <PanelHeader
                title={editing ? 'Edit Produk' : 'Tambah Produk Baru'}
                subtitle="Isi semua field yang diperlukan"
              />
              <form onSubmit={submit} style={{ padding: '1.5rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <input required placeholder="Nama produk" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} style={inputSt} onFocus={e => e.target.style.boxShadow = '0 0 0 2px var(--md-primary)'} onBlur={e => e.target.style.boxShadow = 'none'} />
                  <select required value={form.id_category} onChange={e => setForm({ ...form, id_category: e.target.value })} style={{ ...inputSt, cursor: 'pointer' }}>
                    <option value="">Pilih Kategori</option>
                    {categories.map(c => <option key={c.id_category} value={c.id_category}>{c.name}</option>)}
                  </select>
                  <input required type="number" min="1" placeholder="Harga (Rp)" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} style={inputSt} onFocus={e => e.target.style.boxShadow = '0 0 0 2px var(--md-primary)'} onBlur={e => e.target.style.boxShadow = 'none'} />
                  <input required type="number" min="0" placeholder="Stok" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} style={inputSt} onFocus={e => e.target.style.boxShadow = '0 0 0 2px var(--md-primary)'} onBlur={e => e.target.style.boxShadow = 'none'} />
                  <textarea placeholder="Deskripsi produk" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} style={{ ...inputSt, gridColumn: '1 / -1', resize: 'vertical' }} rows={2} onFocus={e => e.target.style.boxShadow = '0 0 0 2px var(--md-primary)'} onBlur={e => e.target.style.boxShadow = 'none'} />
                  <div style={{ gridColumn: '1 / -1' }}><ImageDropzone valueUrl={form.image_url} onImageChange={setImageFile} /></div>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button type="submit" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.65rem 1.5rem', borderRadius: 'var(--radius-full)', background: 'var(--brand-gradient)', color: 'white', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.875rem', border: 'none', cursor: 'pointer' }}>
                    <CheckCircle style={{ width: '0.875rem', height: '0.875rem' }} /> {editing ? 'Update Produk' : 'Simpan Produk'}
                  </button>
                  <button type="button" onClick={resetForm} style={{ padding: '0.65rem 1.25rem', borderRadius: 'var(--radius-full)', background: 'var(--surface-container)', color: 'var(--on-surface-variant)', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '0.875rem', border: 'none', cursor: 'pointer' }}>Batal</button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Tabs ────────────────────────────────────────────── */}
      <div style={{ display: 'flex', gap: '0.375rem', marginBottom: '1.5rem', background: 'var(--surface-container-low)', padding: '0.35rem', borderRadius: 'var(--radius-md)', width: 'fit-content' }}>
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1rem', borderRadius: 'var(--radius-sm)', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '0.825rem', transition: 'all 0.2s ease', background: tab === t.key ? 'var(--surface-container-lowest)' : 'transparent', color: tab === t.key ? 'var(--text-heading)' : 'var(--outline)', boxShadow: tab === t.key ? 'var(--shadow-sm)' : 'none' }}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* ── Products Tab ─────────────────────────────────────── */}
      {tab === 'products' && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} style={{ ...S.card, padding: 0, overflow: 'hidden' }}>
          <PanelHeader title="Manajemen Inventori" subtitle={`${products.length} produk terdaftar`}
            action={
              <div style={{ position: 'relative' }}>
                <Search style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', width: '0.875rem', height: '0.875rem', color: 'var(--outline)' }} />
                <input placeholder="Cari produk..." value={search} onChange={e => setSearch(e.target.value)}
                  style={{ padding: '0.5rem 1rem 0.5rem 2.25rem', borderRadius: 'var(--radius-md)', background: 'var(--surface-container)', border: 'none', fontSize: '0.8rem', color: 'var(--on-surface)', outline: 'none', width: '14rem' }} />
              </div>
            }
          />
          {filteredProducts.length === 0 ? (
            <div style={{ padding: '5rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Package style={{ width: '3.5rem', height: '3.5rem', color: 'var(--outline)', marginBottom: '1rem', opacity: 0.4 }} />
              <p style={{ ...S.heading, fontSize: '1rem', marginBottom: '0.4rem' }}>Belum ada produk</p>
              <p style={{ ...S.muted }}>Klik "+ Tambah Produk" untuk memulai</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                <thead>
                  <tr style={{ background: 'var(--surface-container-low)' }}>
                    {['Produk', 'Kategori', 'Harga', 'Stok', 'Aksi'].map(h => (
                      <th key={h} style={{ padding: '0.75rem 1.25rem', textAlign: h === 'Produk' ? 'left' : 'center', ...S.label }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((p, i) => (
                    <tr key={p.id_product} style={{ borderTop: '1px solid var(--border)', transition: 'background 0.15s ease' }}
                      onMouseOver={e => e.currentTarget.style.background = 'var(--surface-container-low)'}
                      onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                      <td style={{ padding: '0.875rem 1.25rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
                          {p.image_url
                            ? <img src={p.image_url} alt={p.name} style={{ width: '2.5rem', height: '2.5rem', borderRadius: 'var(--radius-md)', objectFit: 'cover', flexShrink: 0 }} />
                            : <div style={{ width: '2.5rem', height: '2.5rem', borderRadius: 'var(--radius-md)', background: 'var(--md-primary-container)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Tag style={{ width: '1rem', height: '1rem', color: 'var(--md-on-primary-container)' }} /></div>
                          }
                          <div>
                            <p style={{ fontWeight: 700, color: 'var(--text-heading)', fontSize: '0.875rem' }}>{p.name}</p>
                            <p style={{ fontSize: '0.7rem', color: 'var(--outline)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '16rem' }}>{p.description || '—'}</p>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '0.875rem 1.25rem', textAlign: 'center' }}>
                        <span style={{ background: 'var(--md-primary-container)', color: 'var(--md-on-primary-container)', fontSize: '0.7rem', fontWeight: 700, padding: '0.2rem 0.625rem', borderRadius: 'var(--radius-full)' }}>{p.category?.name || '—'}</span>
                      </td>
                      <td style={{ padding: '0.875rem 1.25rem', textAlign: 'center', fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--md-primary)' }}>
                        Rp {p.price?.toLocaleString('id-ID')}
                      </td>
                      <td style={{ padding: '0.875rem 1.25rem', textAlign: 'center' }}>
                        <span style={{ background: p.stock > 10 ? 'rgba(0,108,62,0.1)' : p.stock > 0 ? 'rgba(217,119,6,0.1)' : 'rgba(220,38,38,0.1)', color: p.stock > 10 ? 'var(--md-primary)' : p.stock > 0 ? '#d97706' : '#dc2626', fontSize: '0.8rem', fontWeight: 700, padding: '0.25rem 0.75rem', borderRadius: 'var(--radius-full)' }}>
                          {p.stock}
                        </span>
                      </td>
                      <td style={{ padding: '0.875rem 1.25rem', textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                          <button onClick={() => startEdit(p)} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', padding: '0.4rem 0.875rem', borderRadius: 'var(--radius-md)', background: 'var(--surface-container)', border: 'none', cursor: 'pointer', fontSize: '0.775rem', fontWeight: 600, color: 'var(--on-surface-variant)' }}>
                            <Edit style={{ width: '0.75rem', height: '0.75rem' }} /> Edit
                          </button>
                          <button onClick={() => del(p.id_product)} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', padding: '0.4rem 0.875rem', borderRadius: 'var(--radius-md)', background: 'rgba(220,38,38,0.08)', border: 'none', cursor: 'pointer', fontSize: '0.775rem', fontWeight: 600, color: '#dc2626' }}>
                            <Trash2 style={{ width: '0.75rem', height: '0.75rem' }} /> Hapus
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      )}

      {/* ── Orders Tab ───────────────────────────────────────── */}
      {tab === 'orders' && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          {/* Bulk action bar */}
          {orders.filter(o => o.status === 'PAID').length > 0 && (
            <div style={{ ...S.cardSm, marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
                <div onClick={toggleSelectAll} style={{ width: '1.125rem', height: '1.125rem', borderRadius: '0.3rem', border: `2px solid ${selectedOrders.length > 0 ? 'var(--md-primary)' : 'var(--outline-variant)'}`, background: selectedOrders.length > 0 ? 'var(--md-primary)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
                  {selectedOrders.length > 0 && <CheckCircle style={{ width: '0.7rem', height: '0.7rem', color: 'white' }} />}
                </div>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-heading)' }}>Pilih Semua Pesanan PAID</span>
              </label>
              <button onClick={handleBulkProcess} disabled={selectedOrders.length === 0}
                style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.55rem 1.25rem', borderRadius: 'var(--radius-full)', background: selectedOrders.length > 0 ? 'var(--brand-gradient)' : 'var(--surface-container)', color: selectedOrders.length > 0 ? 'white' : 'var(--outline)', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.825rem', border: 'none', cursor: selectedOrders.length > 0 ? 'pointer' : 'default' }}>
                <ClipboardList style={{ width: '0.875rem', height: '0.875rem' }} />
                Proses {selectedOrders.length > 0 ? `(${selectedOrders.length})` : ''} Pesanan
              </button>
            </div>
          )}

          <div style={{ ...S.card, padding: 0, overflow: 'hidden' }}>
            <PanelHeader title="Manajemen Pesanan" subtitle={`${orders.length} pesanan`} />
            {orders.length === 0 ? (
              <div style={{ padding: '5rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <ClipboardList style={{ width: '3.5rem', height: '3.5rem', color: 'var(--outline)', marginBottom: '1rem', opacity: 0.4 }} />
                <p style={{ ...S.heading, fontSize: '1rem' }}>Belum ada pesanan</p>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                  <thead>
                    <tr style={{ background: 'var(--surface-container-low)' }}>
                      {['', 'ID Pesanan', 'Total', 'Tanggal', 'Status', 'Aksi'].map(h => (
                        <th key={h} style={{ padding: '0.75rem 1.25rem', textAlign: h === 'Total' || h === '' ? 'center' : 'left', ...S.label, whiteSpace: 'nowrap' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map(o => (
                      <tr key={o.id_order} style={{ borderTop: '1px solid var(--border)', transition: 'background 0.15s ease', background: selectedOrders.includes(o.id_order) ? 'rgba(0,108,62,0.05)' : 'transparent' }}
                        onMouseOver={e => { if (!selectedOrders.includes(o.id_order)) e.currentTarget.style.background = 'var(--surface-container-low)'; }}
                        onMouseOut={e => { e.currentTarget.style.background = selectedOrders.includes(o.id_order) ? 'rgba(0,108,62,0.05)' : 'transparent'; }}>
                        <td style={{ padding: '0.75rem 1.25rem', textAlign: 'center' }}>
                          {o.status === 'PAID' && (
                            <div onClick={() => toggleSelectOrder(o.id_order)} style={{ width: '1.125rem', height: '1.125rem', borderRadius: '0.3rem', border: `2px solid ${selectedOrders.includes(o.id_order) ? 'var(--md-primary)' : 'var(--outline-variant)'}`, background: selectedOrders.includes(o.id_order) ? 'var(--md-primary)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', margin: 'auto' }}>
                              {selectedOrders.includes(o.id_order) && <CheckCircle style={{ width: '0.7rem', height: '0.7rem', color: 'white' }} />}
                            </div>
                          )}
                        </td>
                        <td style={{ padding: '0.75rem 1.25rem' }}>
                          <span style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--outline)' }}>#{o.id_order?.slice(0, 8)}</span>
                        </td>
                        <td style={{ padding: '0.75rem 1.25rem', textAlign: 'center', fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--md-primary)' }}>
                          Rp {o.total_amount?.toLocaleString('id-ID')}
                        </td>
                        <td style={{ padding: '0.75rem 1.25rem', ...S.muted, whiteSpace: 'nowrap' }}>
                          {new Date(o.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </td>
                        <td style={{ padding: '0.75rem 1.25rem' }}><StatusBadge status={o.status} /></td>
                        <td style={{ padding: '0.75rem 1.25rem' }}>
                          {o.status === 'PAID' && (
                            <button onClick={() => handleProcessOrder(o.id_order)} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', padding: '0.4rem 0.875rem', borderRadius: 'var(--radius-md)', background: 'rgba(217,119,6,0.1)', border: 'none', cursor: 'pointer', fontSize: '0.775rem', fontWeight: 700, color: '#d97706', whiteSpace: 'nowrap' }}>
                              📦 Proses
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
        </motion.div>
      )}

      {/* ── Analytics Tab ───────────────────────────────────── */}
      {tab === 'analytics' && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          {/* Revenue Trend */}
          <div style={{ ...S.card, padding: 0, overflow: 'hidden' }}>
            <PanelHeader title="Pendapatan 7 Hari Terakhir" subtitle="Tren revenue pesanan" />
            <div style={{ padding: '1.5rem' }}>
              {orderTrends.length > 0 ? (
                <div style={{ height: '18rem' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={orderTrends} margin={{ top: 10, right: 10, left: 0, bottom: 10 }}>
                      <defs>
                        <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%"  stopColor="#006c3e" stopOpacity={0.25} />
                          <stop offset="95%" stopColor="#006c3e" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                      <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: 'var(--outline)', fontSize: 11 }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--outline)', fontSize: 11 }} width={70} tickFormatter={v => `Rp ${(v/1000).toFixed(0)}k`} />
                      <Tooltip formatter={v => `Rp ${v.toLocaleString('id-ID')}`} contentStyle={{ borderRadius: '0.75rem', border: '1px solid var(--border)', background: 'var(--surface-container-lowest)', color: 'var(--text-heading)', boxShadow: 'var(--shadow-md)' }} />
                      <Area type="monotone" dataKey="revenue" stroke="#006c3e" strokeWidth={2.5} fillOpacity={1} fill="url(#revGrad)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div style={{ height: '18rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--outline)', fontSize: '0.875rem' }}>Belum ada data pendapatan</div>
              )}
            </div>
          </div>

          {/* Top Products */}
          <div style={{ ...S.card, padding: 0, overflow: 'hidden' }}>
            <PanelHeader title="Produk Stok Terbanyak" subtitle="Top 5 produk berdasarkan stok" />
            <div style={{ padding: '1.5rem' }}>
              {topProducts.length > 0 ? (
                <div style={{ height: '18rem' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart layout="vertical" data={topProducts} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border)" />
                      <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: 'var(--outline)', fontSize: 11 }} />
                      <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: 'var(--outline)', fontSize: 11 }} width={110} />
                      <Tooltip contentStyle={{ borderRadius: '0.75rem', border: '1px solid var(--border)', background: 'var(--surface-container-lowest)', color: 'var(--text-heading)', boxShadow: 'var(--shadow-md)' }} />
                      <Bar dataKey="stock" name="Stok" radius={[0, 6, 6, 0]} barSize={26}>
                        {topProducts.map((_, idx) => <Cell key={idx} fill={CHART_COLORS[idx % CHART_COLORS.length]} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div style={{ height: '18rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--outline)', fontSize: '0.875rem' }}>Belum ada data produk</div>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* ── Dispute shortcut ────────────────────────────────── */}
      <div style={{ marginTop: '2rem' }}>
        <Link to="/supplier/disputes" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', textDecoration: 'none', ...S.cardSm }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
            <div style={{ width: '2.5rem', height: '2.5rem', borderRadius: 'var(--radius-md)', background: 'rgba(220,38,38,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <AlertTriangle style={{ width: '1.125rem', height: '1.125rem', color: '#dc2626' }} />
            </div>
            <div>
              <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-heading)', margin: 0 }}>Pusat Sengketa</p>
              <p style={{ ...S.muted, marginTop: '0.125rem' }}>Kelola komplain dan retur dari pembeli</p>
            </div>
          </div>
          <ChevronRight style={{ width: '1.125rem', height: '1.125rem', color: 'var(--outline)' }} />
        </Link>
      </div>
    </div>
  );
}
