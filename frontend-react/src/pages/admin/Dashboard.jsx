import { useState, useEffect } from 'react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { useModal } from '../../context/ModalContext';

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
    const d = { ...prodForm, price: parseFloat(prodForm.price), stock: parseInt(prodForm.stock) };
    try {
      if (editingProd) { 
        await api.put(`/products/${editingProd}`, d); 
        toast.success('Produk berhasil diperbarui');
      } else { 
        await api.post('/products', d); 
        toast.success('Produk berhasil ditambahkan');
      }
      setProdForm({ name: '', description: '', price: '', stock: '', id_category: '', image_url: '' }); setEditingProd(null); setShowProdForm(false); fetchData();
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
        <div className="w-14 h-14 bg-gradient-to-br from-amber-500 to-red-500 rounded-2xl flex items-center justify-center text-white text-2xl shadow-lg shadow-amber-200">⚙️</div>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Admin Panel</h1>
          <p className="text-gray-400 text-sm">Kelola seluruh produk dan kategori</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { icon: '📦', label: 'Produk', value: products.length, color: 'from-emerald-500 to-green-600' },
          { icon: '🏷️', label: 'Kategori', value: categories.length, color: 'from-blue-500 to-indigo-600' },
          { icon: '📊', label: 'Total Stok', value: totalStock.toLocaleString('id-ID'), color: 'from-amber-500 to-orange-600' },
          { icon: '💎', label: 'Nilai Stok', value: `Rp ${(totalValue / 1000000).toFixed(1)}M`, color: 'from-purple-500 to-pink-600' },
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
          { key: 'products', label: `📦 Produk (${products.length})` },
          { key: 'categories', label: `🏷️ Kategori (${categories.length})` },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} className={`px-5 py-2.5 rounded-xl font-medium text-sm cursor-pointer transition-all duration-300 ${tab === t.key ? 'bg-gradient-to-r from-amber-500 to-red-500 text-white shadow-md shadow-amber-200' : 'bg-white text-gray-600 border border-gray-100 hover:border-amber-200 hover:text-amber-600'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Products Tab */}
      {tab === 'products' && (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm animate-fade-in">
          <div className="flex justify-between items-center p-5 border-b border-gray-50">
            <h3 className="font-semibold text-gray-800 flex items-center gap-2">📦 Semua Produk</h3>
            <button onClick={() => { setProdForm({ name: '', description: '', price: '', stock: '', id_category: '', image_url: '' }); setEditingProd(null); setShowProdForm(!showProdForm); }} className="bg-gradient-to-r from-primary-600 to-accent-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:shadow-lg transition-all cursor-pointer">
              {showProdForm ? '✕ Batal' : '+ Tambah'}
            </button>
          </div>
          {showProdForm && (
            <form onSubmit={submitProd} className="p-5 border-b border-gray-50 space-y-3 animate-fade-in-down">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input required placeholder="Nama produk" value={prodForm.name} onChange={e => setProdForm({ ...prodForm, name: e.target.value })} className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 transition-all" />
                <select required value={prodForm.id_category} onChange={e => setProdForm({ ...prodForm, id_category: e.target.value })} className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-white cursor-pointer focus:ring-2 focus:ring-primary-400 transition-all">
                  <option value="">Kategori</option>{categories.map(c => <option key={c.id_category} value={c.id_category}>{c.name}</option>)}
                </select>
                <input required type="number" min="1" placeholder="Harga (Rp)" value={prodForm.price} onChange={e => setProdForm({ ...prodForm, price: e.target.value })} className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 transition-all" />
                <input required type="number" min="0" placeholder="Stok" value={prodForm.stock} onChange={e => setProdForm({ ...prodForm, stock: e.target.value })} className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 transition-all" />
              </div>
              <button type="submit" className="bg-gradient-to-r from-primary-600 to-accent-600 text-white px-5 py-2 rounded-xl text-sm cursor-pointer hover:shadow-lg transition-all">{editingProd ? '💾 Update' : '✅ Simpan'}</button>
            </form>
          )}
          {products.length === 0 ? (
            <div className="p-12 text-center"><span className="text-5xl block mb-3 animate-bounce-in">📦</span><p className="text-gray-400">Belum ada produk</p></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50/80 text-gray-500 text-xs uppercase tracking-wider">
                  <tr><th className="px-5 py-3 text-left">Produk</th><th className="px-5 py-3 text-left">Kategori</th><th className="px-5 py-3 text-right">Harga</th><th className="px-5 py-3 text-right">Stok</th><th className="px-5 py-3 text-right">Aksi</th></tr>
                </thead>
                <tbody>{products.map((p, i) => (
                  <tr key={p.id_product} className={`border-t border-gray-50 hover:bg-primary-50/30 transition-colors animate-fade-in-up stagger-${Math.min(i + 1, 8)}`}>
                    <td className="px-5 py-3"><div className="flex items-center gap-2"><span>🥬</span><span className="font-medium">{p.name}</span></div></td>
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
        </div>
      )}

      {/* Categories Tab */}
      {tab === 'categories' && (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm animate-fade-in">
          <div className="flex justify-between items-center p-5 border-b border-gray-50">
            <h3 className="font-semibold text-gray-800 flex items-center gap-2">🏷️ Semua Kategori</h3>
            <button onClick={() => { setForm({ name: '' }); setEditing(null); setShowForm(!showForm); }} className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:shadow-lg transition-all cursor-pointer">
              {showForm ? '✕ Batal' : '+ Tambah'}
            </button>
          </div>
          {showForm && (
            <form onSubmit={submitCat} className="p-5 border-b border-gray-50 flex gap-3 animate-fade-in-down">
              <input required placeholder="Nama kategori baru" value={form.name} onChange={e => setForm({ name: e.target.value })} className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all" />
              <button type="submit" className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm cursor-pointer hover:shadow-lg transition-all">{editing ? '💾 Update' : '✅ Simpan'}</button>
            </form>
          )}
          {categories.length === 0 ? (
            <div className="p-12 text-center"><span className="text-5xl block mb-3 animate-bounce-in">🏷️</span><p className="text-gray-400">Belum ada kategori</p></div>
          ) : (
            <div className="divide-y divide-gray-50">
              {categories.map((c, i) => (
                <div key={c.id_category} className={`px-5 py-4 flex justify-between items-center hover:bg-blue-50/30 transition-colors animate-fade-in-up stagger-${Math.min(i + 1, 8)} group`}>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center text-sm group-hover:scale-110 transition-transform">🏷️</div>
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
        </div>
      )}
    </div>
  );
}
