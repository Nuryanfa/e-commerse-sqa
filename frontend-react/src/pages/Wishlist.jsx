import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import ProductCard from '../components/ProductCard';

export default function Wishlist() {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const toast = useToast();

  useEffect(() => { user ? fetchWishlist() : setLoading(false); }, [user]);

  const fetchWishlist = () => {
    setLoading(true);
    api.get('/wishlist').then(r => setWishlist(r.data.data || [])).catch(() => toast.error('Gagal memuat wishlist')).finally(() => setLoading(false));
  };

  const removeWishlist = async (id_product) => {
    try { await api.post('/wishlist/toggle', { id_product }); toast.success('Dihapus dari wishlist'); fetchWishlist(); }
    catch { toast.error('Gagal menghapus'); }
  };

  if (loading) return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="h-8 w-48 skeleton rounded-full mb-8" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {[...Array(4)].map((_, i) => <div key={i} className="h-72 skeleton" />)}
      </div>
    </div>
  );

  if (!user) return (
    <div className="max-w-4xl mx-auto px-4 py-24 text-center">
      <span className="text-7xl block mb-5 animate-bounce-in">❤️</span>
      <h2 className="text-2xl font-black" style={{ color: 'var(--text-heading)' }}>Login untuk Wishlist</h2>
      <p className="text-sm mt-2 mb-6" style={{ color: 'var(--text-secondary)' }}>Simpan sayuran favorit untuk dibeli nanti.</p>
      <Link to="/login" className="btn-primary px-8 py-3 text-sm inline-block">Masuk →</Link>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8" style={{ background: 'var(--surface-base)' }}>
      <div className="flex items-center gap-3 mb-8 animate-fade-in-up">
        <div className="w-11 h-11 rounded-2xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center text-lg" style={{ border: '1px solid var(--border-light)' }}>❤️</div>
        <div>
          <h1 className="text-2xl font-black tracking-tight" style={{ color: 'var(--text-heading)' }}>Wishlist Saya</h1>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{wishlist.length} item favorit</p>
        </div>
      </div>

      {wishlist.length === 0 ? (
        <div className="card-organic p-16 text-center animate-fade-in">
          <span className="text-7xl block mb-5 animate-float opacity-50">🛒</span>
          <h3 className="text-lg font-bold" style={{ color: 'var(--text-heading)' }}>Wishlist Kosong</h3>
          <p className="text-sm mt-1 mb-6" style={{ color: 'var(--text-muted)' }}>Belum ada produk favorit.</p>
          <Link to="/products" className="btn-primary px-6 py-2.5 text-sm inline-block">Mulai Belanja</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {wishlist.map((item, i) => (
            <div key={item.id_wishlist} className={`relative group animate-fade-in-up stagger-${Math.min(i + 1, 8)}`}>
              {item.product && <ProductCard product={item.product} index={i} />}
              <button onClick={(e) => { e.preventDefault(); removeWishlist(item.id_product); }}
                className="absolute top-4 right-4 w-9 h-9 rounded-full flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 hover:scale-110 transition-all duration-300 z-10 cursor-pointer bg-white/90 dark:bg-slate-800/90 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30" title="Hapus">
                <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" /></svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
