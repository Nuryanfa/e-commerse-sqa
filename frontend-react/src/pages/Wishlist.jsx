import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import ProductCard from '../components/ProductCard';
import { Heart, Trash2, HeartHandshake } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
    try { 
      await api.post('/wishlist/toggle', { id_product }); 
      toast.success('Dihapus dari wishlist'); 
      setWishlist(wishlist.filter(w => w.id_product !== id_product));
    } catch { toast.error('Gagal menghapus'); }
  };

  if (!user) return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center -mt-10">
      <div className="w-24 h-24 bg-red-50 dark:bg-rose-900/20 rounded-full flex items-center justify-center mb-6">
         <Heart className="w-10 h-10 text-red-500" />
      </div>
      <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2 tracking-tight">Login untuk Wishlist</h2>
      <p className="text-sm font-medium text-gray-500 mb-8 max-w-sm text-center line-relaxed">
        Masuk atau daftar sekarang untuk menyimpan sayuran segar organik favorit Anda secara permanen.
      </p>
      <Link to="/login" className="bg-gradient-to-r from-red-500 to-rose-500 text-white px-8 py-3.5 rounded-xl font-bold text-sm shadow-xl shadow-red-500/20 active:scale-95 transition-all text-center">
        Masuk / Daftar
      </Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-slate-900 py-12 pb-24 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex items-end justify-between gap-6 mb-12">
           <div>
             <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-3 mb-2">
               <span className="w-12 h-12 rounded-2xl bg-red-50 dark:bg-rose-900/40 border border-red-100 dark:border-rose-900 flex items-center justify-center">
                 <Heart className="w-6 h-6 text-red-500 fill-current" />
               </span> 
               Wishlist Saya
             </h1>
             <p className="text-sm font-medium text-gray-500 dark:text-gray-400 pl-[3.75rem]">Anda menyimpan {wishlist.length} item favorit.</p>
           </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 lg:gap-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white dark:bg-slate-800 h-[340px] rounded-3xl skeleton border border-gray-100 dark:border-slate-700" />
            ))}
          </div>
        ) : wishlist.length === 0 ? (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-slate-800 rounded-[2.5rem] p-16 text-center border border-gray-100 dark:border-slate-700 shadow-sm flex flex-col items-center justify-center mt-8">
            <div className="w-24 h-24 bg-gray-50 dark:bg-slate-700/50 rounded-full flex items-center justify-center mb-6">
              <HeartHandshake className="w-10 h-10 text-gray-300 dark:text-gray-500 opacity-50" />
            </div>
            <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2 tracking-tight">Wishlist Kosong</h3>
            <p className="text-sm font-medium text-gray-500 mb-6 max-w-sm mx-auto">Anda belum menambahkan sayur atau buah apapun ke favorit. Mulai jelajahi katalog organik kami!</p>
            <Link to="/products" className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-6 py-3.5 rounded-xl text-sm font-bold shadow-sm hover:bg-emerald-200 dark:hover:bg-emerald-900/50 transition-colors inline-block">
              Telusuri Katalog Sayur
            </Link>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 lg:gap-8 mt-6">
            <AnimatePresence>
              {wishlist.map((item, i) => (
                <motion.div 
                  key={item.id_wishlist} 
                  initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                  className="relative group isolate"
                >
                  {/* Remove Button Overlay */}
                  <button 
                    onClick={(e) => { e.preventDefault(); removeWishlist(item.id_product); }}
                    className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/90 dark:bg-slate-800/90 shadow-lg border border-red-500/10 text-red-500 flex items-center justify-center z-20 cursor-pointer opacity-0 group-hover:opacity-100 hover:bg-red-500 hover:text-white hover:scale-110 active:scale-95 transition-all outline-none"
                    title="Hapus dari daftar"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  
                  {item.product && <ProductCard product={item.product} index={i} />}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
