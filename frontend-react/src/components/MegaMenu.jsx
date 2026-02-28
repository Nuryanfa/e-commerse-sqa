import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Leaf, ArrowRight, Loader2 } from 'lucide-react';
import api from '../services/api';

export default function MegaMenu({ isOpen }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (categories.length === 0 && isOpen) {
      setLoading(true);
      api.get('/categories')
        .then(res => setCategories(res.data.data || []))
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [isOpen, categories.length]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="absolute left-0 top-full mt-4 w-[650px] bg-white dark:bg-slate-900 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.4)] rounded-2xl border border-gray-100 dark:border-slate-800 overflow-hidden z-50 origin-top-left flex"
        >
          {/* Menu Items */}
          <div className="w-2/3 p-6 grid grid-cols-2 gap-x-6 gap-y-4">
            <div className="col-span-2 mb-2">
              <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2 text-base">
                <Leaf className="w-4 h-4 text-emerald-500" />
                Jelajahi Kategori
              </h3>
            </div>
            
            {loading ? (
              <div className="col-span-2 flex justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-emerald-500" />
              </div>
            ) : categories.map(cat => (
              <Link 
                key={cat.id_category} 
                to={`/products?category=${cat.id_category}`}
                className="group flex items-center p-2 rounded-xl hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-emerald-100/50 dark:bg-slate-800 flex items-center justify-center mr-3 group-hover:bg-emerald-200/50 dark:group-hover:bg-emerald-800/50 transition-colors text-emerald-600 dark:text-emerald-400 font-bold text-lg">
                  {cat.name.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">{cat.name}</p>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">Produk pilihan terbaik</p>
                </div>
              </Link>
            ))}
            {!loading && categories.length === 0 && (
              <p className="col-span-2 text-sm text-gray-500">Tidak ada kategori.</p>
            )}
          </div>

          {/* Promo Widget */}
          <div className="w-1/3 bg-emerald-50 dark:bg-slate-800/50 p-6 flex flex-col items-center justify-center text-center border-l border-emerald-100 dark:border-slate-800">
            <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center mb-4 shadow-lg shadow-emerald-500/30 ring-4 ring-white dark:ring-slate-900 relative overflow-hidden">
               <span className="text-white text-2xl font-black relative z-10">%</span>
               <motion.div 
                 animate={{ rotate: 360 }} 
                 transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
                 className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_30%,_rgba(255,255,255,0.3)_100%)]" 
               />
            </div>
            <h4 className="font-black text-gray-900 dark:text-white text-lg leading-tight mb-2">Diskon Spesial<br/>Akhir Pekan!</h4>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 px-2">Dapatkan potongan harga hingga 50% untuk sayur hidroponik pilihan.</p>
            <Link to="/products" className="btn-primary py-2 px-4 rounded-xl text-xs font-bold shadow-md shadow-emerald-500/20 hover:scale-105 transition-transform flex items-center gap-1.5 w-full justify-center">
              Belanja Sekarang <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
