import { useState, useEffect } from 'react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { useModal } from '../../context/ModalContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import ImageDropzone from '../../components/ImageDropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, Package, Tags, BarChart2, DollarSign, Plus, Edit, Trash2 } from 'lucide-react';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ef4444', '#14b8a6', '#f43f5e'];

export default function AdminDashboard() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('products');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '' });
  const [prodForm, setProdForm] = useState({ name: '', description: '', price: '', stock: '', id_category: '', image_url: '' });
  const [editingProd, setEditingProd] = useState(null);
  const [showProdForm, setShowProdForm] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const toast = useToast();
  const modal = useModal();

  const fetchData = () => {
    setLoading(true);
    Promise.all([api.get('/products'), api.get('/categories')]).then(([p, c]) => {
      setProducts(p.data.data || []); setCategories(c.data.data || []);
    }).catch(() => {}).finally(() => setLoading(false));
  };
  useEffect(fetchData, []);

  const submitCat = async (e) => {
    e.preventDefault();
    try {
      if (editing) { 
        await api.put(`/categories/${editing}`, form); 
        toast.success('Kategori berhasil diperbarui');
      } else { 
        await api.post('/categories', form); 
        toast.success('Kategori berhasil ditambahkan');
      }
      setForm({ name: '' }); setEditing(null); setShowForm(false); fetchData();
    } catch (err) { toast.error(err.response?.data?.error || 'Gagal menyimpan kategori'); }
  };
  const delCat = (id) => { 
    modal.confirm({
      title: 'Hapus Kategori',
      message: 'Apakah Anda yakin ingin menghapus kategori ini? Pastikan tidak ada produk yang terikat.',
      type: 'danger',
      onConfirm: async () => {
        try { await api.delete(`/categories/${id}`); toast.success('Kategori dihapus'); fetchData(); } 
        catch { toast.error('Gagal menghapus kategori'); }
      }
    });
  };

  const submitProd = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('name', prodForm.name);
    formData.append('description', prodForm.description);
    formData.append('price', parseFloat(prodForm.price));
    formData.append('stock', parseInt(prodForm.stock));
    formData.append('id_category', prodForm.id_category);
    if (prodForm.image_url) formData.append('image_url', prodForm.image_url);
    if (imageFile) formData.append('image', imageFile);

    try {
      if (editingProd) { 
        await api.put(`/products/${editingProd}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }); 
        toast.success('Produk berhasil diperbarui');
      } else { 
        await api.post('/products', formData, { headers: { 'Content-Type': 'multipart/form-data' } }); 
        toast.success('Produk berhasil ditambahkan');
      }
      setProdForm({ name: '', description: '', price: '', stock: '', id_category: '', image_url: '' }); 
      setEditingProd(null); 
      setShowProdForm(false); 
      setImageFile(null);
      fetchData();
    } catch (err) { toast.error(err.response?.data?.error || 'Gagal menyimpan produk'); }
  };
  const delProd = (id) => { 
    modal.confirm({
      title: 'Hapus Produk',
      message: 'Apakah Anda yakin ingin menghapus produk ini?',
      type: 'danger',
      onConfirm: async () => {
        try { await api.delete(`/products/${id}`); toast.success('Produk dihapus'); fetchData(); } 
        catch { toast.error('Gagal menghapus produk'); }
      }
    });
  };

  const totalStock = products.reduce((s, p) => s + p.stock, 0);
  const totalValue = products.reduce((s, p) => s + p.price * p.stock, 0);

  // Analytics Data Prep
  const categoryStats = categories.map(c => {
    const catProducts = products.filter(p => p.id_category === c.id_category);
    return {
      name: c.name,
      totalProducts: catProducts.length,
      totalStock: catProducts.reduce((s, p) => s + p.stock, 0),
      value: catProducts.reduce((s, p) => s + p.price * p.stock, 0)
    };
  }).filter(c => c.totalProducts > 0);

  if (loading) return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">{[...Array(4)].map((_, i) => <div key={i} className="h-28 rounded-2xl shimmer" />)}</div>
      <div className="h-96 rounded-2xl shimmer" />
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8 animate-fade-in-up">
        <div className="w-14 h-14 bg-gradient-to-br from-amber-500 to-red-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-amber-200">
          <Settings className="w-7 h-7" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Admin Panel</h1>
          <p className="text-gray-400 text-sm">Kelola seluruh produk dan kategori</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { icon: <Package className="w-5 h-5" />, label: 'Produk', value: products.length, color: 'from-emerald-500 to-green-600' },
          { icon: <Tags className="w-5 h-5" />, label: 'Kategori', value: categories.length, color: 'from-blue-500 to-indigo-600' },
          { icon: <BarChart2 className="w-5 h-5" />, label: 'Total Stok', value: totalStock.toLocaleString('id-ID'), color: 'from-amber-500 to-orange-600' },
          { icon: <DollarSign className="w-5 h-5" />, label: 'Nilai Stok', value: `Rp ${(totalValue / 1000000).toFixed(1)}M`, color: 'from-purple-500 to-pink-600' },
        ].map((s, i) => (
          <div key={i} className={`stat-card bg-white rounded-2xl p-5 border border-gray-100 card-hover animate-fade-in-up stagger-${i + 1} group cursor-default`}>
            <div className={`w-10 h-10 bg-gradient-to-br ${s.color} rounded-xl flex items-center justify-center text-white text-sm mb-2 shadow-sm group-hover:scale-110 transition-transform duration-300`}>{s.icon}</div>
            <p className="text-xl font-bold text-gray-800">{s.value}</p>
            <p className="text-xs text-gray-400">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 animate-fade-in-up">
        {[
          { key: 'products', label: `Produk (${products.length})`, icon: <Package className="w-4 h-4 inline mr-1.5" /> },
          { key: 'categories', label: `Kategori (${categories.length})`, icon: <Tags className="w-4 h-4 inline mr-1.5" /> },
          { key: 'analytics', label: `Analisis Data`, icon: <BarChart2 className="w-4 h-4 inline mr-1.5" /> },
        ].map(t => (
          <button 
            key={t.key} 
            onClick={() => setTab(t.key)} 
            className={`relative px-5 py-2.5 rounded-xl font-medium text-sm cursor-pointer transition-colors duration-300 ${tab === t.key ? 'text-white' : 'text-gray-600 hover:text-amber-600'}`}
          >
            {tab === t.key && (
              <motion.div 
                layoutId="adminTabIndicator" 
                className="absolute inset-0 bg-gradient-to-r from-amber-500 to-red-500 rounded-xl shadow-md shadow-amber-200 -z-10" 
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
          <div className="flex justify-between items-center p-5 border-b border-gray-50">
            <h3 className="font-semibold text-gray-800 flex items-center gap-2"><Package className="w-5 h-5 text-emerald-500" /> Semua Produk</h3>
            <button onClick={() => { setProdForm({ name: '', description: '', price: '', stock: '', id_category: '', image_url: '' }); setEditingProd(null); setShowProdForm(!showProdForm); setImageFile(null); }} className="bg-gradient-to-r from-primary-600 to-accent-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:shadow-lg transition-all cursor-pointer flex items-center gap-1">
              {showProdForm ? '✕ Batal' : <><Plus className="w-4 h-4" /> Tambah</>}
            </button>
          </div>
          {showProdForm && (
            <form onSubmit={submitProd} className="p-6 border-b border-gray-100 dark:border-slate-800 flex flex-col gap-5 animate-fade-in-down">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5 focus-within:text-emerald-500 group">
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 group-focus-within:text-emerald-500 transition-colors">Nama Produk</label>
                  <input required placeholder="Contoh: Kemeja Formal" value={prodForm.name} onChange={e => setProdForm({ ...prodForm, name: e.target.value })} className="w-full border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 bg-slate-50 dark:bg-[#131c31] transition-all font-medium text-gray-900 dark:text-white placeholder-gray-400" />
                </div>
                
                <div className="space-y-1.5 focus-within:text-emerald-500 group">
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 group-focus-within:text-emerald-500 transition-colors">Kategori</label>
                  <div className="relative">
                    <select required value={prodForm.id_category} onChange={e => setProdForm({ ...prodForm, id_category: e.target.value })} className="w-full border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 bg-slate-50 dark:bg-[#131c31] transition-all font-medium text-gray-900 dark:text-white appearance-none">
                      <option value="" className="dark:bg-slate-800 text-gray-500">Pilih Kategori</option>
                      {categories.map(c => <option key={c.id_category} value={c.id_category} className="dark:bg-slate-800">{c.name}</option>)}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg></div>
                  </div>
                </div>

                <div className="space-y-1.5 focus-within:text-emerald-500 group">
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 group-focus-within:text-emerald-500 transition-colors">Harga (Rp)</label>
                  <input required type="number" min="1" placeholder="250000" value={prodForm.price} onChange={e => setProdForm({ ...prodForm, price: e.target.value })} className="w-full border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 bg-slate-50 dark:bg-[#131c31] transition-all font-medium text-gray-900 dark:text-white placeholder-gray-400" />
                </div>

                <div className="space-y-1.5 focus-within:text-emerald-500 group">
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 group-focus-within:text-emerald-500 transition-colors">Stok Tersedia</label>
                  <input required type="number" min="0" placeholder="50" value={prodForm.stock} onChange={e => setProdForm({ ...prodForm, stock: e.target.value })} className="w-full border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 bg-slate-50 dark:bg-[#131c31] transition-all font-medium text-gray-900 dark:text-white placeholder-gray-400" />
                </div>

                <div className="space-y-1.5 md:col-span-2 focus-within:text-emerald-500 group">
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 group-focus-within:text-emerald-500 transition-colors">Deskripsi Produk</label>
                  <textarea placeholder="Tulis deskripsi detail produk..." value={prodForm.description} onChange={e => setProdForm({ ...prodForm, description: e.target.value })} className="w-full border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 bg-slate-50 dark:bg-[#131c31] transition-all font-medium text-gray-900 dark:text-white placeholder-gray-400" rows={3} />
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Foto Produk</label>
                  <ImageDropzone valueUrl={prodForm.image_url} onImageChange={setImageFile} />
                </div>
              </div>
              <button type="submit" className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 shadow-[0_4px_20px_rgba(16,185,129,0.25)] text-white px-5 py-3.5 rounded-xl text-sm font-bold cursor-pointer hover:-translate-y-0.5 transition-all mt-2">{editingProd ? '💾 Update Produk' : '✅ Simpan Produk'}</button>
            </form>
          )}
          {products.length === 0 ? (
            <div className="p-12 text-center flex flex-col items-center"><Package className="w-16 h-16 text-gray-300 mb-4 animate-bounce-in" /><p className="text-gray-400">Belum ada produk</p></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50/80 text-gray-500 text-xs uppercase tracking-wider">
                  <tr><th className="px-5 py-3 text-left">Produk</th><th className="px-5 py-3 text-left">Kategori</th><th className="px-5 py-3 text-right">Harga</th><th className="px-5 py-3 text-right">Stok</th><th className="px-5 py-3 text-right">Aksi</th></tr>
                </thead>
                <tbody>{products.map((p, i) => (
                  <tr key={p.id_product} className={`border-t border-gray-50 hover:bg-primary-50/30 transition-colors animate-fade-in-up stagger-${Math.min(i + 1, 8)}`}>
                    <td className="px-5 py-3"><div className="flex items-center gap-2"><div className="w-8 h-8 rounded bg-emerald-50 flex items-center justify-center"><Package className="w-4 h-4 text-emerald-600" /></div><span className="font-medium">{p.name}</span></div></td>
                    <td className="px-5 py-3 text-gray-400 text-xs">{p.category?.name || '-'}</td>
                    <td className="px-5 py-3 text-right font-semibold text-primary-700">Rp {p.price?.toLocaleString('id-ID')}</td>
                    <td className="px-5 py-3 text-right">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${p.stock > 10 ? 'bg-green-50 text-green-600' : p.stock > 0 ? 'bg-yellow-50 text-yellow-600' : 'bg-red-50 text-red-600'}`}>{p.stock}</span>
                    </td>
                    <td className="px-5 py-3 text-right space-x-2">
                      <button onClick={() => { setProdForm({ name: p.name, description: p.description || '', price: p.price, stock: p.stock, id_category: p.id_category, image_url: p.image_url || '' }); setEditingProd(p.id_product); setShowProdForm(true); }} className="text-primary-600 hover:text-primary-800 hover:underline cursor-pointer text-xs font-medium transition-colors">Edit</button>
                      <button onClick={() => delProd(p.id_product)} className="text-red-400 hover:text-red-600 hover:underline cursor-pointer text-xs font-medium transition-colors">Hapus</button>
                    </td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          )}
        </motion.div>
      )}

      {/* Categories Tab */}
      {tab === 'categories' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
          <div className="flex justify-between items-center p-5 border-b border-gray-50">
            <h3 className="font-semibold text-gray-800 flex items-center gap-2"><Tags className="w-5 h-5 text-blue-500" /> Semua Kategori</h3>
            <button onClick={() => { setForm({ name: '' }); setEditing(null); setShowForm(!showForm); }} className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:shadow-lg transition-all cursor-pointer flex items-center gap-1">
              {showForm ? '✕ Batal' : <><Plus className="w-4 h-4" /> Tambah</>}
            </button>
          </div>
          {showForm && (
            <form onSubmit={submitCat} className="p-6 border-b border-gray-100 dark:border-slate-800 flex flex-col sm:flex-row items-end gap-3 animate-fade-in-down">
              <div className="flex-1 w-full space-y-1.5 focus-within:text-blue-500 group">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 group-focus-within:text-blue-500 transition-colors">Nama Kategori</label>
                <input required placeholder="Contoh: Sayuran Hijau" value={form.name} onChange={e => setForm({ name: e.target.value })} className="w-full border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 bg-slate-50 dark:bg-[#131c31] transition-all font-medium text-gray-900 dark:text-white placeholder-gray-400" />
              </div>
              <button type="submit" className="w-full sm:w-auto bg-gradient-to-r from-blue-500 to-indigo-600 shadow-[0_4px_20px_rgba(59,130,246,0.25)] text-white px-6 py-2.5 rounded-xl text-sm font-bold cursor-pointer hover:-translate-y-0.5 transition-all">{editing ? '💾 Update' : '✅ Simpan'}</button>
            </form>
          )}
          {categories.length === 0 ? (
            <div className="p-12 text-center flex flex-col items-center"><Tags className="w-16 h-16 text-gray-300 mb-4 animate-bounce-in" /><p className="text-gray-400">Belum ada kategori</p></div>
          ) : (
            <div className="divide-y divide-gray-50">
              {categories.map((c, i) => (
                <div key={c.id_category} className={`px-5 py-4 flex justify-between items-center hover:bg-blue-50/30 transition-colors animate-fade-in-up stagger-${Math.min(i + 1, 8)} group`}>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform"><Tags className="w-4 h-4" /></div>
                    <div>
                      <span className="font-medium text-gray-800">{c.name}</span>
                      {c.description && <p className="text-xs text-gray-400">{c.description}</p>}
                    </div>
                  </div>
                  <div className="space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => { setForm({ name: c.name }); setEditing(c.id_category); setShowForm(true); }} className="text-blue-600 text-sm cursor-pointer hover:underline font-medium">Edit</button>
                    <button onClick={() => delCat(c.id_category)} className="text-red-400 text-sm cursor-pointer hover:underline font-medium">Hapus</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      )}

      {/* Analytics Tab */}
      {tab === 'analytics' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Chart 1: Bar Chart */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center gap-2"><BarChart2 className="w-5 h-5 text-amber-500" /> Stok per Kategori</h3>
              {categoryStats.length > 0 ? (
                <div className="h-80 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={categoryStats} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                      <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                      <Bar dataKey="totalStock" name="Total Stok" fill="#10b981" radius={[6, 6, 0, 0]}>
                        {categoryStats.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-80 flex items-center justify-center text-gray-400">Data tidak cukup</div>
              )}
            </div>

            {/* Chart 2: Pie Chart */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center gap-2"><DollarSign className="w-5 h-5 text-purple-500" /> Nilai Aset Kategori</h3>
              {categoryStats.length > 0 ? (
                <div className="h-80 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={categoryStats} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={80} outerRadius={110} paddingAngle={2} stroke="none">
                        {categoryStats.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `Rp ${value.toLocaleString('id-ID')}`} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                      <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', color: '#64748b' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-80 flex items-center justify-center text-gray-400">Data tidak cukup</div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
