import { useState, useEffect } from 'react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { useModal } from '../../context/ModalContext';

export default function SupplierDashboard() {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({ name: '', description: '', price: '', stock: '', id_category: '', image_url: '' });
  const [tab, setTab] = useState('products');
  const toast = useToast();
  const modal = useModal();

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

  const resetForm = () => { setForm({ name: '', description: '', price: '', stock: '', id_category: '', image_url: '' }); setEditing(null); setShowForm(false); };

  const submit = async (e) => {
    e.preventDefault();
    const data = { ...form, price: parseFloat(form.price), stock: parseInt(form.stock) };
    try {
      if (editing) { 
        await api.put(`/supplier/products/${editing}`, data); 
        toast.success('Produk berhasil diperbarui');
      } else { 
        await api.post('/supplier/products', data); 
        toast.success('Produk berhasil ditambahkan');
      }
      resetForm(); fetchData();
    } catch (err) { 
      toast.error(err.response?.data?.error || 'Gagal menyimpan produk'); 
    }
  };

  const del = (id) => {
    modal.confirm({
      title: 'Hapus Produk',
      message: 'Apakah Anda yakin ingin menghapus produk ini? Tindakan ini tidak dapat dibatalkan.',
      type: 'danger',
      confirmText: 'Ya, Hapus',
      onConfirm: async () => {
        try { 
          await api.delete(`/supplier/products/${id}`); 
          toast.success('Produk berhasil dihapus');
          fetchData(); 
        } catch {
          toast.error('Gagal menghapus produk');
        }
      }
    });
  };

  const startEdit = (p) => {
    setForm({ name: p.name, description: p.description, price: p.price, stock: p.stock, id_category: p.id_category, image_url: p.image_url || '' });
    setEditing(p.id_product); setShowForm(true); setTab('products');
  };

  const statusBadge = (s) => {
    const m = { PENDING: 'bg-yellow-100 text-yellow-700 border-yellow-200', PAID: 'bg-blue-100 text-blue-700 border-blue-200', SHIPPED: 'bg-purple-100 text-purple-700 border-purple-200', DELIVERED: 'bg-green-100 text-green-700 border-green-200' };
    return m[s] || 'bg-gray-100 text-gray-600 border-gray-200';
  };

  const totalRevenue = orders.reduce((s, o) => s + (o.total_amount || 0), 0);
  const totalStock = products.reduce((s, p) => s + p.stock, 0);

  if (loading) return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">{[...Array(4)].map((_, i) => <div key={i} className="h-28 rounded-2xl shimmer" />)}</div>
      <div className="h-96 rounded-2xl shimmer" />
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex justify-between items-start mb-8 animate-fade-in-up">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-400 to-accent-500 rounded-2xl flex items-center justify-center text-white text-xl shadow-lg shadow-primary-200">🧑‍🌾</div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Dashboard Supplier</h1>
              <p className="text-gray-400 text-sm">Kelola produk dan pantau pesanan Anda</p>
            </div>
          </div>
        </div>
        <button onClick={() => { resetForm(); setShowForm(!showForm); setTab('products'); }} className="bg-gradient-to-r from-primary-600 to-accent-600 text-white px-5 py-2.5 rounded-xl font-medium hover:shadow-lg hover:shadow-primary-200 transition-all duration-300 hover:-translate-y-0.5 cursor-pointer inline-flex items-center gap-2">
          {showForm ? '✕ Batal' : '+ Tambah Produk'}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { icon: '📦', label: 'Total Produk', value: products.length, color: 'from-emerald-500 to-green-600' },
          { icon: '📋', label: 'Pesanan', value: orders.length, color: 'from-blue-500 to-indigo-600' },
          { icon: '📊', label: 'Total Stok', value: totalStock, color: 'from-amber-500 to-orange-600' },
          { icon: '💰', label: 'Revenue', value: `Rp ${(totalRevenue / 1000).toFixed(0)}K`, color: 'from-purple-500 to-pink-600' },
        ].map((s, i) => (
          <div key={i} className={`stat-card bg-white rounded-2xl p-5 border border-gray-100 card-hover animate-fade-in-up stagger-${i + 1} group cursor-default`}>
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 bg-gradient-to-br ${s.color} rounded-xl flex items-center justify-center text-white text-sm shadow-sm group-hover:scale-110 transition-transform duration-300`}>{s.icon}</div>
              <div>
                <p className="text-xs text-gray-400">{s.label}</p>
                <p className="text-xl font-bold text-gray-800">{s.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-8 shadow-sm animate-fade-in-down">
          <h3 className="font-semibold text-gray-800 text-lg mb-4 flex items-center gap-2">{editing ? '✏️ Edit Produk' : '🆕 Tambah Produk Baru'}</h3>
          <form onSubmit={submit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input required placeholder="Nama produk" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-all" />
              <select required value={form.id_category} onChange={e => setForm({ ...form, id_category: e.target.value })} className="border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-400 bg-white cursor-pointer transition-all">
                <option value="">Pilih Kategori</option>
                {categories.map(c => <option key={c.id_category} value={c.id_category}>{c.name}</option>)}
              </select>
              <input required type="number" min="1" placeholder="Harga (Rp)" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} className="border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-400 transition-all" />
              <input required type="number" min="0" placeholder="Stok" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} className="border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-400 transition-all" />
              <input placeholder="URL Gambar (opsional)" value={form.image_url} onChange={e => setForm({ ...form, image_url: e.target.value })} className="border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-400 md:col-span-2 transition-all" />
              <textarea placeholder="Deskripsi produk" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-400 md:col-span-2 transition-all" rows={2} />
            </div>
            <div className="flex gap-3">
              <button type="submit" className="bg-gradient-to-r from-primary-600 to-accent-600 text-white px-6 py-2.5 rounded-xl font-medium hover:shadow-lg transition-all cursor-pointer">{editing ? '💾 Update' : '✅ Simpan'}</button>
              <button type="button" onClick={resetForm} className="bg-gray-100 text-gray-600 px-6 py-2.5 rounded-xl font-medium hover:bg-gray-200 transition-all cursor-pointer">Batal</button>
            </div>
          </form>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-6 animate-fade-in-up stagger-5">
        {[
          { key: 'products', label: `📦 Produk (${products.length})` },
          { key: 'orders', label: `📋 Pesanan (${orders.length})` },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} className={`px-5 py-2.5 rounded-xl font-medium text-sm cursor-pointer transition-all duration-300 ${tab === t.key ? 'bg-gradient-to-r from-primary-600 to-accent-600 text-white shadow-md shadow-primary-200' : 'bg-white text-gray-600 border border-gray-100 hover:border-primary-200 hover:text-primary-600'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Products Tab */}
      {tab === 'products' && (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm animate-fade-in">
          {products.length === 0 ? (
            <div className="p-12 text-center">
              <span className="text-5xl block mb-3 animate-bounce-in">📦</span>
              <p className="text-gray-400">Belum ada produk. Mulai tambahkan!</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50/80 text-gray-500 text-xs uppercase tracking-wider">
                  <tr><th className="px-5 py-4 text-left">Produk</th><th className="px-5 py-4 text-right">Harga</th><th className="px-5 py-4 text-right">Stok</th><th className="px-5 py-4 text-right">Aksi</th></tr>
                </thead>
                <tbody>
                  {products.map((p, i) => (
                    <tr key={p.id_product} className={`border-t border-gray-50 hover:bg-primary-50/30 transition-colors animate-fade-in-up stagger-${Math.min(i + 1, 8)}`}>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center text-lg">🥬</div>
                          <div>
                            <p className="font-medium text-gray-800">{p.name}</p>
                            <p className="text-xs text-gray-400 truncate max-w-[200px]">{p.description}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-right font-semibold text-primary-700">Rp {p.price?.toLocaleString('id-ID')}</td>
                      <td className="px-5 py-4 text-right">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${p.stock > 10 ? 'bg-green-50 text-green-600' : p.stock > 0 ? 'bg-yellow-50 text-yellow-600' : 'bg-red-50 text-red-600'}`}>{p.stock}</span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <button onClick={() => startEdit(p)} className="text-primary-600 hover:text-primary-800 font-medium mr-3 hover:underline cursor-pointer transition-colors">Edit</button>
                        <button onClick={() => del(p.id_product)} className="text-red-400 hover:text-red-600 font-medium hover:underline cursor-pointer transition-colors">Hapus</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Orders Tab */}
      {tab === 'orders' && (
        <div className="space-y-3 animate-fade-in">
          {orders.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
              <span className="text-5xl block mb-3 animate-bounce-in">📋</span>
              <p className="text-gray-400">Belum ada pesanan masuk</p>
            </div>
          ) : (
            orders.map((o, i) => (
              <div key={o.id_order} className={`bg-white rounded-xl border border-gray-100 p-5 card-hover animate-fade-in-up stagger-${Math.min(i + 1, 8)}`}>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-lg">📦</div>
                    <div>
                      <p className="text-sm font-mono text-gray-400">#{o.id_order?.slice(0, 8)}</p>
                      <p className="font-bold text-primary-700 text-lg">Rp {o.total_amount?.toLocaleString('id-ID')}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`text-xs font-medium px-3 py-1.5 rounded-full border ${statusBadge(o.status)}`}>{o.status}</span>
                    <p className="text-xs text-gray-400 mt-2">{new Date(o.created_at).toLocaleDateString('id-ID')}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
