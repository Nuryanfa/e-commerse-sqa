import { useState, useEffect } from 'react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { useModal } from '../../context/ModalContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import ImageDropzone from '../../components/ImageDropzone';
import { Package, Plus, Edit, Trash2, Tag, Search, X, CheckCircle, AlertTriangle, ChevronDown } from 'lucide-react';

const S = {
  card:  { background: 'var(--surface-container-lowest)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border)', boxShadow: '0 4px 24px rgba(0,0,0,0.02)' },
  label: { fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--outline)', fontFamily: 'var(--font-display)' },
  h:     { fontFamily: 'var(--font-display)', fontWeight: 800, color: 'var(--text-heading)' },
  muted: { fontSize: '0.78rem', color: 'var(--outline)' },
};
const inp = { width: '100%', padding: '0.65rem 1rem', borderRadius: 'var(--radius-md)', background: 'var(--surface-container)', border: 'none', color: 'var(--on-surface)', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box' };

export default function SupplierInventory() {
  const [products,    setProducts]  = useState([]);
  const [categories,  setCategories]= useState([]);
  const [loading,     setLoading]   = useState(true);
  const location = useLocation();
  const [showForm,    setShowForm]  = useState(location.state?.openAddMenu || false);
  const [editing,     setEditing]   = useState(null);
  const [form,        setForm]      = useState({ name: '', description: '', price: '', stock: '', id_category: '', image_url: '' });
  const [imageFile,   setImageFile] = useState(null);
  const [search,      setSearch]    = useState('');
  const [catFilter,   setCatFilter] = useState('');
  const toast = useToast();
  const modal = useModal();

  const fetch = () => {
    setLoading(true);
    Promise.all([api.get('/supplier/products'), api.get('/categories')])
      .then(([p, c]) => { setProducts(p.data.data || []); setCategories(c.data.data || []); })
      .catch(() => toast.error('Gagal memuat produk'))
      .finally(() => setLoading(false));
  };
  
  useEffect(() => {
    fetch();
    if (location.state?.openAddMenu) {
      setShowForm(true);
      window.history.replaceState({}, document.title); // clear state
    }
  }, [location.state?.openAddMenu]);

  const resetForm = () => { setForm({ name: '', description: '', price: '', stock: '', id_category: '', image_url: '' }); setEditing(null); setShowForm(false); setImageFile(null); };

  const submit = async (e) => {
    e.preventDefault();
    const fd = new FormData();
    fd.append('name', form.name); fd.append('description', form.description || '');
    fd.append('price', parseFloat(form.price)); fd.append('stock', parseInt(form.stock));
    fd.append('id_category', form.id_category);
    if (form.image_url) fd.append('image_url', form.image_url);
    if (imageFile) fd.append('image', imageFile);
    try {
      if (editing) { await api.put(`/supplier/products/${editing}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } }); toast.success('Produk diperbarui'); }
      else         { await api.post('/supplier/products', fd, { headers: { 'Content-Type': 'multipart/form-data' } }); toast.success('Produk ditambahkan'); }
      resetForm(); fetch();
    } catch (err) { toast.error(err.response?.data?.error || 'Gagal menyimpan produk'); }
  };

  const del = (id) => modal.confirm({ title: 'Hapus Produk', message: 'Yakin ingin menghapus produk ini?', type: 'danger', confirmText: 'Hapus',
    onConfirm: async () => { try { await api.delete(`/supplier/products/${id}`); toast.success('Dihapus'); fetch(); } catch { toast.error('Gagal hapus'); } }
  });

  const startEdit = (p) => { setForm({ name: p.name, description: p.description||'', price: p.price, stock: p.stock, id_category: p.id_category, image_url: p.image_url||'' }); setEditing(p.id_product); setShowForm(true); };

  const filtered = products.filter(p => {
    const nameOk = !search || p.name.toLowerCase().includes(search.toLowerCase());
    const catOk  = !catFilter || p.id_category === catFilter;
    return nameOk && catOk;
  });

  const lowStock = products.filter(p => p.stock <= 10).length;
  const totalVal = products.reduce((s, p) => s + p.price * p.stock, 0);

  return (
    <div style={{ padding: '2.5rem 2rem', maxWidth: '75rem', margin: '0 auto', minHeight: '100vh', background: 'var(--bg)' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2.5rem' }}>
        <div>
          <h1 style={{ ...S.h, fontSize: '1.75rem', margin: 0 }}>Inventory Management</h1>
          <p style={{ ...S.muted, marginTop: '0.25rem' }}>Update dan kelola katalog produk musiman Anda</p>
        </div>
        <button onClick={() => { resetForm(); setShowForm(s => !s); }}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 1.25rem', borderRadius: 'var(--radius-full)', background: showForm ? 'var(--surface-container)' : '#16a34a', color: showForm ? 'var(--on-surface)' : 'white', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.875rem' }}>
          {showForm ? <><X size={15} /> Batal</> : <><Plus size={15} /> Add Product</>}
        </button>
      </div>

      {/* Stat strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        {[
          { label: 'TOTAL PRODUCTS', val: products.length, icon: <Package size={18} />, color: '#16a34a', desc: 'Active in your catalog' },
          { label: 'LOW STOCK',      val: lowStock,         icon: <AlertTriangle size={18} />, color: '#d97706', desc: 'Requires attention' },
          { label: 'TOTAL VALUE',    val: `Rp ${(totalVal/1_000_000).toFixed(1)}jt`, icon: <Package size={18} />, color: '#2563eb', desc: '+Value of inventory' },
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

      {/* Add / Edit Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} style={{ overflow: 'hidden', marginBottom: '1.5rem' }}>
            <div style={{ ...S.card, padding: 0 }}>
              <div style={{ padding: '1.1rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ ...S.h, fontSize: '1rem', margin: 0 }}>{editing ? 'Edit Produk' : 'Add New Product'}</h3>
                <button onClick={resetForm} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--outline)' }}><X size={18} /></button>
              </div>
              <form onSubmit={submit} style={{ padding: '1.5rem' }}>
                {editing && (
                  <div style={{ background: 'rgba(217,119,6,0.08)', border: '1px solid rgba(217,119,6,0.2)', borderRadius: 'var(--radius-md)', padding: '0.65rem 1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: '#d97706', fontWeight: 600 }}>
                    <Edit size={14} /> Mode edit aktif — perubahan akan tersimpan ke produk yang dipilih
                  </div>
                )}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <input required placeholder="e.g. Premium Spinach" value={form.name} onChange={e => setForm({...form, name: e.target.value})} style={inp} />
                  <select required value={form.id_category} onChange={e => setForm({...form, id_category: e.target.value})} style={{ ...inp, cursor: 'pointer' }}>
                    <option value="">Pilih Kategori</option>
                    {categories.map(c => <option key={c.id_category} value={c.id_category}>{c.name}</option>)}
                  </select>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--outline)', fontSize: '0.875rem' }}>Rp</span>
                    <input required type="number" min="1" placeholder="0,000" value={form.price} onChange={e => setForm({...form, price: e.target.value})} style={{ ...inp, paddingLeft: '2.5rem' }} />
                  </div>
                  <div style={{ position: 'relative' }}>
                    <input required type="number" min="0" placeholder="Stok / KG" value={form.stock} onChange={e => setForm({...form, stock: e.target.value})} style={{ ...inp, paddingRight: '3rem' }} />
                    <span style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--outline)', fontSize: '0.8rem', fontWeight: 600 }}>KG</span>
                  </div>
                  <textarea placeholder="Deskripsi produk..." value={form.description} onChange={e => setForm({...form, description: e.target.value})} style={{ ...inp, gridColumn: '1/-1', resize: 'vertical' }} rows={2} />
                  <div style={{ gridColumn: '1/-1' }}><ImageDropzone valueUrl={form.image_url} onImageChange={setImageFile} /></div>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button type="submit" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.65rem 1.5rem', borderRadius: 'var(--radius-full)', background: '#16a34a', color: 'white', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.875rem' }}>
                    <CheckCircle size={14} /> {editing ? 'Update Produk' : 'Save Product'}
                  </button>
                  <button type="button" onClick={resetForm} style={{ padding: '0.65rem 1.25rem', borderRadius: 'var(--radius-full)', background: 'var(--surface-container)', color: 'var(--on-surface-variant)', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '0.875rem' }}>Cancel</button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '14rem' }}>
          <Search style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', width: '1rem', height: '1rem', color: 'var(--outline)' }} />
          <input placeholder="Search inventory..." value={search} onChange={e => setSearch(e.target.value)} style={{ ...inp, paddingLeft: '2.5rem', borderRadius: 'var(--radius-full)' }} />
        </div>
        <div style={{ position: 'relative' }}>
          <select value={catFilter} onChange={e => setCatFilter(e.target.value)} style={{ ...inp, paddingRight: '2rem', width: 'auto', cursor: 'pointer', borderRadius: 'var(--radius-full)', appearance: 'none' }}>
            <option value="">All Categories</option>
            {categories.map(c => <option key={c.id_category} value={c.id_category}>{c.name}</option>)}
          </select>
          <ChevronDown style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', width: '0.875rem', height: '0.875rem', color: 'var(--outline)', pointerEvents: 'none' }} />
        </div>
      </div>

      {/* Table */}
      <div style={{ ...S.card, overflow: 'hidden' }}>
        <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h3 style={{ ...S.h, fontSize: '1rem', margin: 0 }}>Stock Inventory</h3>
          <span style={{ ...S.muted }}>Showing {filtered.length} of {products.length} products</span>
        </div>

        {loading ? (
          <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--outline)' }}>Memuat inventori...</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '4rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
            <Package style={{ width: '3rem', height: '3rem', color: 'var(--outline)', opacity: 0.4 }} />
            <p style={{ ...S.h, fontSize: '1rem', margin: 0 }}>Tidak ada produk</p>
            <p style={{ ...S.muted }}>Klik "Add Product" untuk mulai</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ background: 'var(--surface-container-low)' }}>
                  {['Product', 'Category', 'Stock (KG/Unit)', 'Price (Rp)', 'Status', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '0.75rem 1.25rem', textAlign: h === 'Product' ? 'left' : 'center', ...S.label }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(p => {
                  const stockStatus = p.stock > 10 ? { label: 'Available', bg: 'rgba(22,163,74,0.1)', color: '#16a34a' } : p.stock > 0 ? { label: 'Low Stock', bg: 'rgba(217,119,6,0.1)', color: '#d97706' } : { label: 'Out of Stock', bg: 'rgba(220,38,38,0.08)', color: '#dc2626' };
                  return (
                    <tr key={p.id_product} style={{ borderTop: '1px solid var(--border)', transition: 'background 0.15s' }}
                      onMouseOver={e => e.currentTarget.style.background = 'var(--surface-container-low)'}
                      onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                      <td style={{ padding: '0.875rem 1.25rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
                          {p.image_url
                            ? <img src={p.image_url} alt={p.name} style={{ width: '2.5rem', height: '2.5rem', borderRadius: 'var(--radius-md)', objectFit: 'cover', flexShrink: 0 }} />
                            : <div style={{ width: '2.5rem', height: '2.5rem', borderRadius: 'var(--radius-md)', background: 'var(--md-primary-container)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Tag style={{ width: '1rem', height: '1rem', color: 'var(--md-on-primary-container)' }} /></div>
                          }
                          <div>
                            <p style={{ fontWeight: 700, color: 'var(--text-heading)', margin: 0 }}>{p.name}</p>
                            <p style={{ fontSize: '0.7rem', color: 'var(--outline)' }}>SKU: {p.id_product?.slice(0,8).toUpperCase()}</p>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '0.875rem 1.25rem', textAlign: 'center' }}>
                        <span style={{ background: 'var(--md-primary-container)', color: 'var(--md-on-primary-container)', fontSize: '0.7rem', fontWeight: 700, padding: '0.2rem 0.625rem', borderRadius: 'var(--radius-full)' }}>{p.category?.name || categories.find(c => c.id_category === p.id_category)?.name || '—'}</span>
                      </td>
                      <td style={{ padding: '0.875rem 1.25rem', textAlign: 'center' }}>
                        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1rem', color: p.stock <= 5 ? '#dc2626' : 'var(--text-heading)' }}>{p.stock}</span>
                      </td>
                      <td style={{ padding: '0.875rem 1.25rem', textAlign: 'center', fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--md-primary)' }}>
                        {p.price?.toLocaleString('id-ID')}
                      </td>
                      <td style={{ padding: '0.875rem 1.25rem', textAlign: 'center' }}>
                        <span style={{ background: stockStatus.bg, color: stockStatus.color, fontSize: '0.7rem', fontWeight: 700, padding: '0.25rem 0.75rem', borderRadius: 'var(--radius-full)' }}>{stockStatus.label}</span>
                      </td>
                      <td style={{ padding: '0.875rem 1.25rem', textAlign: 'center' }}>
                        <button onClick={() => startEdit(p)} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', padding: '0.35rem 0.75rem', borderRadius: 'var(--radius-md)', background: 'var(--surface-container)', border: 'none', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600, color: 'var(--on-surface-variant)', marginRight: '0.5rem' }}>
                          <Edit size={12} />
                        </button>
                        <button onClick={() => del(p.id_product)} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', padding: '0.35rem 0.75rem', borderRadius: 'var(--radius-md)', background: 'rgba(220,38,38,0.08)', border: 'none', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600, color: '#dc2626' }}>
                          <Trash2 size={12} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <div style={{ padding: '0.875rem 1.25rem', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <p style={{ ...S.muted }}>Showing {filtered.length} to {filtered.length} of {products.length} products • Prices and stock levels are synced in real-time.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
