import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, ArrowRight, Loader2, Trash2 } from 'lucide-react';
import api from '../services/api';
import GamificationBanner from './GamificationBanner';

export default function MiniCartPreview({ isOpen }) {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      api.get('/cart')
        .then(res => {
          setCartItems(res.data.data || []);
        })
        .catch(() => setCartItems([]))
        .finally(() => setLoading(false));
    }
  }, [isOpen]);

  const total = cartItems.reduce((sum, item) => sum + ((item.product?.price || 0) * item.quantity), 0);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 15, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.95 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="absolute right-0 top-full mt-3 w-80 bg-white dark:bg-slate-900 shadow-2xl rounded-2xl border border-gray-100 dark:border-slate-800 overflow-hidden z-50 origin-top-right flex flex-col"
        >
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center bg-gray-50/50 dark:bg-slate-800/50">
            <h3 className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-2">
              <ShoppingCart className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              Keranjang Belanja
            </h3>
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400 bg-white dark:bg-slate-800 px-2 py-0.5 rounded-full border border-gray-200 dark:border-slate-700 shadow-sm">
              {cartItems.length} Item
            </span>
          </div>

          <div className="px-3 pt-3 pb-1 border-b border-gray-50 dark:border-slate-800">
             <GamificationBanner currentAmount={total} targetAmount={150000} />
          </div>

          {/* Body */}
          <div className="max-h-[280px] overflow-y-auto custom-scrollbar">
            {loading ? (
              <div className="py-8 flex justify-center items-center">
                <Loader2 className="w-6 h-6 animate-spin text-emerald-500" />
              </div>
            ) : cartItems.length > 0 ? (
              <div className="flex flex-col">
                {cartItems.slice(0, 3).map((item) => (
                  <div key={item.id_cart} className="flex gap-3 px-4 py-3 border-b border-gray-50 dark:border-slate-800/60 hover:bg-gray-50 dark:hover:bg-slate-800/30 transition-colors">
                    <img 
                      src={item.product?.image ? api.defaults.baseURL.replace('/api', '') + item.product.image : '/placeholder.jpg'} 
                      alt={item.product?.name} 
                      className="w-12 h-12 rounded-xl object-cover border border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-800" 
                    />
                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                      <p className="text-xs font-bold text-gray-900 dark:text-white truncate">{item.product?.name}</p>
                      <div className="flex justify-between items-center mt-1">
                        <p className="text-[11px] text-gray-500 dark:text-gray-400">{item.quantity} x Rp {item.product?.price?.toLocaleString('id-ID')}</p>
                        <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400">Rp {(item.quantity * (item.product?.price || 0)).toLocaleString('id-ID')}</p>
                      </div>
                    </div>
                  </div>
                ))}
                {cartItems.length > 3 && (
                  <div className="px-4 py-2 text-center bg-gray-50 dark:bg-slate-800/30">
                    <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Dan {cartItems.length - 3} item lainnya...</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="py-8 flex flex-col items-center justify-center text-center px-4">
                <ShoppingCart className="w-10 h-10 text-gray-300 dark:text-slate-600 mb-3" strokeWidth={1.5} />
                <p className="text-sm font-bold text-gray-900 dark:text-white">Keranjang Kosong</p>
                <p className="text-[11px] mt-1 text-gray-500 dark:text-gray-400">Belum ada sayuran yang dipilih.</p>
              </div>
            )}
          </div>

          {/* Footer */}
          {cartItems.length > 0 && (
            <div className="p-4 bg-white dark:bg-slate-900 border-t border-gray-100 dark:border-slate-800 shadow-[0_-10px_15px_-3px_rgba(0,0,0,0.03)] dark:shadow-[0_-10px_15px_-3px_rgba(0,0,0,0.2)]">
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Subtotal</span>
                <span className="text-sm font-black text-gray-900 dark:text-white">Rp {total.toLocaleString('id-ID')}</span>
              </div>
              <Link to="/cart" className="w-full btn-primary py-2.5 px-4 text-xs font-bold rounded-xl flex justify-center items-center gap-2 shadow-md shadow-emerald-500/20 hover:shadow-lg hover:shadow-emerald-500/30 transition-all">
                Buka Keranjang & Checkout <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
