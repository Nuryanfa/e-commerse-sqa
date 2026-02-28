import { useState, useEffect, useMemo } from 'react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { useModal } from '../../context/ModalContext';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import ImageDropzone from '../../components/ImageDropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { Store, Package, ClipboardList, TrendingUp, DollarSign, Plus, Edit, Trash2, Tag, Star } from 'lucide-react';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ef4444', '#14b8a6', '#f43f5e'];

export default function SupplierDashboard() {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({ name: '', description: '', price: '', stock: '', id_category: '', image_url: '' });
  const [imageFile, setImageFile] = useState(null);
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

  const resetForm = () => { setForm({ name: '', description: '', price: '', stock: '', id_category: '', image_url: '' }); setEditing(null); setShowForm(false); setImageFile(null); };

  const submit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('name', form.name);
    formData.append('description', form.description || '');
    formData.append('price', parseFloat(form.price));
    formData.append('stock', parseInt(form.stock));
    formData.append('id_category', form.id_category);
    if (form.image_url) formData.append('image_url', form.image_url);
    if (imageFile) formData.append('image', imageFile);

    try {
      if (editing) { 
        await api.put(`/supplier/products/${editing}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }); 
        toast.success('Produk berhasil diperbarui');
      } else { 
        await api.post('/supplier/products', formData, { headers: { 'Content-Type': 'multipart/form-data' } }); 
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
    setForm({ name: p.name, description: p.description || '', price: p.price, stock: p.stock, id_category: p.id_category, image_url: p.image_url || '' });
    setEditing(p.id_product); setShowForm(true); setTab('products');
  };

  const statusBadge = (s) => {
    const m = { PENDING: 'bg-yellow-100 text-yellow-700 border-yellow-200', PAID: 'bg-blue-100 text-blue-700 border-blue-200', SHIPPED: 'bg-purple-100 text-purple-700 border-purple-200', DELIVERED: 'bg-green-100 text-green-700 border-green-200' };
    return m[s] || 'bg-gray-100 text-gray-600 border-gray-200';
  };

  const totalRevenue = orders.reduce((s, o) => s + (o.total_amount || 0), 0);
  const totalStock = products.reduce((s, p) => s + p.stock, 0);

  // Analytics Data Prep
  const topProducts = [...products]
    .sort((a, b) => b.stock - a.stock)
    .slice(0, 5)
    .map(p => ({
      name: p.name.length > 15 ? p.name.substring(0, 15) + '...' : p.name,
      stock: p.stock
    }));

  const orderTrends = useMemo(() => {
    // Group orders by date for trend line (mocking recent days if needed, but using actual dates here)
    const grouped = {};
    orders.forEach(o => {
      const d = new Date(o.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
      grouped[d] = (grouped[d] || 0) + (o.total_amount || 0);
    });
    return Object.keys(grouped).slice(-7).map(k => ({ date: k, revenue: grouped[k] }));
  }, [orders]);

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
            <div className="w-12 h-12 bg-gradient-to-br from-primary-400 to-accent-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-primary-200">
              <Store className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Dashboard Supplier</h1>
              <p className="text-gray-400 text-sm">Kelola produk dan pantau pesanan Anda</p>
            </div>
          </div>
        </div>
        <button onClick={() => { resetForm(); setShowForm(!showForm); setTab('products'); }} className="bg-gradient-to-r from-primary-600 to-accent-600 text-white px-5 py-2.5 rounded-xl font-medium hover:shadow-lg hover:shadow-primary-200 transition-all duration-300 hover:-translate-y-0.5 cursor-pointer inline-flex items-center gap-2">
          {showForm ? '✕ Batal' : <><Plus className="w-4 h-4" /> Tambah Produk</>}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { icon: <Package className="w-5 h-5" />, label: 'Total Produk', value: products.length, color: 'from-emerald-500 to-green-600' },
          { icon: <ClipboardList className="w-5 h-5" />, label: 'Pesanan', value: orders.length, color: 'from-blue-500 to-indigo-600' },
          { icon: <TrendingUp className="w-5 h-5" />, label: 'Total Stok', value: totalStock, color: 'from-amber-500 to-orange-600' },
          { icon: <DollarSign className="w-5 h-5" />, label: 'Revenue', value: `Rp ${(totalRevenue / 1000).toFixed(0)}K`, color: 'from-purple-500 to-pink-600' },
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
          <h3 className="font-semibold text-gray-800 text-lg mb-4 flex items-center gap-2">
            {editing ? <Edit className="w-5 h-5 text-primary-500" /> : <Plus className="w-5 h-5 text-primary-500" />} {editing ? 'Edit Produk' : 'Tambah Produk Baru'}
          </h3>
          <form onSubmit={submit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input required placeholder="Nama produk" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-all" />
              <select required value={form.id_category} onChange={e => setForm({ ...form, id_category: e.target.value })} className="border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-400 bg-white cursor-pointer transition-all">
                <option value="">Pilih Kategori</option>
                {categories.map(c => <option key={c.id_category} value={c.id_category}>{c.name}</option>)}
              </select>
              <input required type="number" min="1" placeholder="Harga (Rp)" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} className="border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-400 transition-all" />
              <input required type="number" min="0" placeholder="Stok" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} className="border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-400 transition-all" />
              <textarea placeholder="Deskripsi produk" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-400 md:col-span-2 transition-all" rows={2} />
              <ImageDropzone valueUrl={form.image_url} onImageChange={setImageFile} />
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
          { key: 'products', label: `Produk (${products.length})`, icon: <Package className="w-4 h-4 inline mr-1.5" /> },
          { key: 'orders', label: `Pesanan (${orders.length})`, icon: <ClipboardList className="w-4 h-4 inline mr-1.5" /> },
          { key: 'analytics', label: `Performa & Statistik`, icon: <TrendingUp className="w-4 h-4 inline mr-1.5" /> },
        ].map(t => (
          <button 
            key={t.key} 
            onClick={() => setTab(t.key)} 
            className={`relative px-5 py-2.5 rounded-xl font-medium text-sm cursor-pointer transition-colors duration-300 ${tab === t.key ? 'text-white' : 'text-gray-600 hover:text-primary-600'}`}
          >
            {tab === t.key && (
              <motion.div 
                layoutId="supplierTabIndicator" 
                className="absolute inset-0 bg-gradient-to-r from-primary-600 to-accent-600 rounded-xl shadow-md shadow-primary-200 -z-10" 
                transition={{ type: 'spring', stiffness: 300, damping: 30 }} 
              />
            )}
            <span className="relative z-10 flex items-center">{t.icon}{t.label}</span>
          </button>
        ))}
      </div>

      {/* Products Tab */}
      {tab === 'products' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
          {products.length === 0 ? (
            <div className="p-12 text-center flex flex-col items-center">
              <Package className="w-16 h-16 text-gray-300 mb-4 animate-bounce-in" />
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
                          <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center text-primary-600"><Tag className="w-5 h-5" /></div>
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
        </motion.div>
      )}

      {/* Orders Tab */}
      {tab === 'orders' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
          {orders.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center flex flex-col items-center">
              <ClipboardList className="w-16 h-16 text-gray-300 mb-4 animate-bounce-in" />
              <p className="text-gray-400">Belum ada pesanan masuk</p>
            </div>
          ) : (
            orders.map((o, i) => (
              <div key={o.id_order} className={`bg-white rounded-xl border border-gray-100 p-5 card-hover animate-fade-in-up stagger-${Math.min(i + 1, 8)}`}>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-500"><ClipboardList className="w-5 h-5" /></div>
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
        </motion.div>
      )}

      {/* Analytics Tab */}
      {tab === 'analytics' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Chart 1: Order Revenue Trends */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center gap-2"><TrendingUp className="w-5 h-5 text-emerald-500" /> Pendapatan 7 Hari Terakhir</h3>
              {orderTrends.length > 0 ? (
                <div className="h-80 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={orderTrends} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                      <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} width={80} tickFormatter={(val) => `Rp ${(val/1000)}k`} />
                      <Tooltip formatter={(value) => `Rp ${value.toLocaleString('id-ID')}`} cursor={{ stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '4 4' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                      <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-80 flex items-center justify-center text-gray-400 border-2 border-dashed border-gray-100 rounded-xl">Belum ada data pendapatan</div>
              )}
            </div>

            {/* Chart 2: Top Products Bar Chart */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center gap-2"><Star className="w-5 h-5 text-amber-500" /> Produk dengan Stok Terbanyak (Top 5)</h3>
              {topProducts.length > 0 ? (
                <div className="h-80 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart layout="vertical" data={topProducts} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                      <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                      <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} width={120} />
                      <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                      <Bar dataKey="stock" name="Stok" radius={[0, 6, 6, 0]} barSize={32}>
                        {topProducts.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-80 flex items-center justify-center text-gray-400 border-2 border-dashed border-gray-100 rounded-xl">Belum ada data produk</div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
