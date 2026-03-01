import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingCart, Heart, ShieldCheck, Truck, Star } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../services/api';

export default function QuickViewModal({ product, isOpen, onClose }) {
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const toast = useToast();

  if (!product) return null;

  const handleAddToCart = async () => {
    if (!isAuthenticated) return toast.warning('Silakan login terlebih dahulu');
    if (user.role !== 'pembeli') return toast.error('Hanya pembeli yang dapat belanja');

    setIsAdding(true);
    try {
      await api.post('/cart', { product_id: product.id_product, quantity });
      toast.success(`${quantity} ${product.name} ditambahkan ke keranjang`);
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menambahkan ke keranjang');
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center pt-5 pb-5 px-4 font-sans">
          {/* Backdrop Blur */}
          <motion.div 
             initial={{ opacity: 0 }} 
             animate={{ opacity: 1 }} 
             exit={{ opacity: 0 }}
             onClick={onClose}
             className="absolute inset-0 bg-slate-900/60 backdrop-blur-md z-0"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 30 }}
            transition={{ type: "spring", stiffness: 350, damping: 25 }}
            className="relative z-10 w-full max-w-4xl bg-white dark:bg-slate-900 shadow-2xl rounded-[32px] overflow-hidden border border-gray-100 dark:border-slate-800 flex flex-col md:flex-row max-h-[90vh]"
          >
            {/* Tutup Button */}
            <button 
               onClick={onClose}
               className="absolute top-4 right-4 z-20 w-10 h-10 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-white transition-all cursor-pointer"
            >
               <X className="w-5 h-5" />
            </button>

            {/* Kiri: Gambar */}
            <div className="w-full md:w-1/2 relative bg-gray-50 dark:bg-slate-900/50">
              <img 
                src={product.image ? api.defaults.baseURL.replace('/api', '') + product.image : '/placeholder.jpg'} 
                alt={product.name} 
                className="w-full h-64 md:h-full object-cover"
              />
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                 {product.stock > 0 && product.stock <= 5 && (
                   <span className="bg-amber-100 text-amber-700 dark:bg-amber-900/80 dark:text-amber-300 px-3 py-1 rounded-lg text-xs font-bold tracking-wide shadow-sm">Stok Sisa {product.stock}</span>
                 )}
                 {product.stock === 0 && (
                   <span className="bg-red-500 text-white px-3 py-1 rounded-lg text-xs font-bold tracking-wide shadow-sm">Habis Terjual</span>
                 )}
              </div>
            </div>

            {/* Kanan: Info Produk */}
            <div className="w-full md:w-1/2 p-6 sm:p-8 flex flex-col overflow-y-auto custom-scrollbar">
              <div className="mb-2 flex items-center gap-2">
                 <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest bg-emerald-50 dark:bg-emerald-900/20 px-2.5 py-1 rounded-md">
                   {product.category?.name || 'Sayuran'}
                 </span>
              </div>
              
              <h2 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white leading-tight mb-2">{product.name}</h2>
              
              <div className="flex items-center gap-4 mb-4">
                 <div className="flex items-center gap-1.5 bg-gray-50 dark:bg-slate-800/80 px-2.5 py-1 rounded-lg">
                   <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                   <span className="text-sm font-bold text-gray-900 dark:text-white">4.9</span>
                   <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">(120 Ulasan)</span>
                 </div>
              </div>

              <div className="mb-6">
                <span className="text-3xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight">Rp {product.price?.toLocaleString('id-ID')}</span>
                <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">/ kg</span>
              </div>

              <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed mb-6 line-clamp-4">
                {product.description || 'Sayuran segar berkualitas tinggi yang dipanen langsung dari petani lokal terbaik. Tersedia dalam jumlah terbatas untuk menjaga kesegaran maksimal saat tiba di tangan Anda.'}
              </p>

              {/* Fitur Kepercayaan */}
              <div className="grid grid-cols-2 gap-3 mb-8">
                 <div className="flex items-center gap-2.5 p-3 rounded-xl bg-emerald-50/50 dark:bg-slate-800/30 border border-emerald-100 dark:border-slate-700/50">
                   <ShieldCheck className="w-5 h-5 text-emerald-500" />
                   <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Garansi Segar</span>
                 </div>
                 <div className="flex items-center gap-2.5 p-3 rounded-xl bg-blue-50/50 dark:bg-slate-800/30 border border-blue-100 dark:border-slate-700/50">
                   <Truck className="w-5 h-5 text-blue-500" />
                   <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Dikirim Hari Ini</span>
                 </div>
              </div>

              <div className="mt-auto space-y-4 pt-4 border-t border-gray-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-gray-700 dark:text-gray-300">Jumlah:</span>
                  <div className="flex items-center bg-gray-50 dark:bg-slate-800 rounded-xl p-1 border border-gray-200 dark:border-slate-700">
                    <button 
                      onClick={() => setQuantity(q => Math.max(1, q - 1))}
                      className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white dark:hover:bg-slate-700 text-gray-600 dark:text-gray-300 shadow-sm transition-all cursor-pointer"
                    >-</button>
                    <span className="w-10 text-center font-bold text-sm text-gray-900 dark:text-white">{quantity}</span>
                    <button 
                      onClick={() => setQuantity(q => product.stock > q ? q + 1 : q)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white dark:hover:bg-slate-700 text-gray-600 dark:text-gray-300 shadow-sm transition-all cursor-pointer"
                    >+</button>
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">Tersedia {product.stock} kg</span>
                </div>

                <div className="flex gap-3">
                  <button 
                    onClick={handleAddToCart}
                    disabled={isAdding || product.stock === 0}
                    className="flex-1 btn-primary py-3.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-emerald-500/20 shadow-lg hover:shadow-emerald-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wide"
                  >
                    {isAdding ? (
                      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full" />
                    ) : (
                      <><ShoppingCart className="w-5 h-5" /> Tambah Keranjang</>
                    )}
                  </button>
                  <button className="w-14 h-14 rounded-xl flex items-center justify-center border-2 border-gray-200 dark:border-slate-700 text-gray-400 hover:text-red-500 hover:border-red-200 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all cursor-pointer">
                    <Heart className="w-6 h-6" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
