import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Loader2, ArrowRight, PackageOpen } from 'lucide-react';
import api from '../services/api';

export default function CommandPalette({ isOpen, onClose }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [recommendations, setRecommendations] = useState([]);
  const navigate = useNavigate();
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setResults([]);
      setSelectedIndex(0);
      document.body.style.overflow = 'hidden';
      setTimeout(() => inputRef.current?.focus(), 100);

      // Fetch default recommendations if empty
      api.get('/products').then(res => {
         setRecommendations((res.data.data || []).slice(0, 4));
      }).catch(() => {});
    } else {
      document.body.style.overflow = 'auto';
    }
    
    // Cleanup on unmount
    return () => { document.body.style.overflow = 'auto'; };
  }, [isOpen]);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (!query.trim()) {
        setResults([]);
        return;
      }
      setLoading(true);
      try {
        const res = await api.get(`/products/search?q=${encodeURIComponent(query)}`);
        setResults(res.data.data || []);
        setSelectedIndex(0);
      } catch (err) {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 400); // 400ms debounce

    return () => clearTimeout(timer);
  }, [query]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        const max = query.trim() ? results.length : recommendations.length;
        setSelectedIndex(prev => (prev < max - 1 ? prev + 1 : prev));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const activeList = query.trim() ? results : recommendations;
        if (activeList[selectedIndex]) {
           handleSelect(activeList[selectedIndex]);
        } else if (query.trim()) {
           // Go to search page if entered on empty
           navigate(`/products?q=${encodeURIComponent(query)}`);
           onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIndex, results, recommendations, query, onClose, navigate]);

  const handleSelect = (product) => {
    navigate(`/products/${product.id_product}`);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-16 sm:pt-24 px-4 font-sans">
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm z-0"
          />

          {/* Palette */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="relative z-10 w-full max-w-2xl bg-white dark:bg-slate-900 shadow-2xl rounded-2xl overflow-hidden border border-gray-100 dark:border-slate-800 flex flex-col max-h-[85vh]"
          >
            {/* Search Input */}
            <div className="flex items-center px-4 py-4 border-b border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900 relative">
              <Search className="w-5 h-5 text-gray-400 dark:text-gray-500 mr-3" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Cari sayuran, buah, atau paket promo..."
                className="flex-1 bg-transparent border-none text-base sm:text-lg focus:outline-none focus:ring-0 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                spellCheck={false}
              />
              {loading && <Loader2 className="absolute right-16 w-5 h-5 animate-spin text-emerald-500" />}
              <div className="hidden sm:flex items-center gap-1.5 ml-3">
                <kbd className="px-2 py-1 bg-gray-100 dark:bg-slate-800 rounded-md border border-gray-200 dark:border-slate-700 text-[10px] font-bold text-gray-500 dark:text-gray-400">ESC</kbd>
              </div>
            </div>

            {/* Results Area */}
            <div className="overflow-y-auto p-2 custom-scrollbar flex-1 bg-white dark:bg-slate-900">
              {!query.trim() ? (
                <div className="p-2">
                   <p className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3 px-2">Rekomendasi Hari Ini</p>
                   {recommendations.length > 0 ? recommendations.map((p, i) => (
                     <button
                       key={p.id_product}
                       onClick={() => handleSelect(p)}
                       onMouseEnter={() => setSelectedIndex(i)}
                       className={`w-full text-left flex items-center p-3 rounded-xl transition-colors duration-150 ${selectedIndex === i ? 'bg-emerald-50 dark:bg-emerald-900/20' : 'hover:bg-gray-50 dark:hover:bg-slate-800/50'}`}
                     >
                       <img src={api.defaults.baseURL.replace('/api', '') + p.image} alt={p.name} className="w-12 h-12 rounded-xl object-cover border border-gray-100 dark:border-slate-800 mr-4" />
                       <div className="flex-1 min-w-0">
                         <p className={`font-bold text-sm truncate ${selectedIndex === i ? 'text-emerald-700 dark:text-emerald-400' : 'text-gray-900 dark:text-white'}`}>{p.name}</p>
                         <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">{p.category?.name || 'Sayuran Segar'}</p>
                       </div>
                       <div className="text-right">
                         <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">Rp {p.price.toLocaleString('id-ID')}</p>
                       </div>
                     </button>
                   )) : (
                       <Loader2 className="w-6 h-6 animate-spin text-emerald-500 mx-auto my-6" />
                   )}
                </div>
              ) : results.length > 0 ? (
                <div className="p-2">
                   <p className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3 px-2">Hasil Pencarian</p>
                   {results.map((p, i) => (
                     <button
                       key={p.id_product}
                       onClick={() => handleSelect(p)}
                       onMouseEnter={() => setSelectedIndex(i)}
                       className={`w-full text-left flex items-center p-3 rounded-xl transition-all duration-150 ${selectedIndex === i ? 'bg-emerald-50 dark:bg-emerald-900/20' : 'hover:bg-gray-50 dark:hover:bg-slate-800/50'}`}
                     >
                       <img src={api.defaults.baseURL.replace('/api', '') + p.image} alt={p.name} className="w-12 h-12 rounded-xl object-cover border border-gray-100 dark:border-slate-800 mr-4" />
                       <div className="flex-1 min-w-0">
                         <div className="flex items-center gap-2">
                            <p className={`font-bold text-sm truncate ${selectedIndex === i ? 'text-emerald-700 dark:text-emerald-400' : 'text-gray-900 dark:text-white'}`}>{p.name}</p>
                            {p.stock > 0 && p.stock <= 5 && <span className="text-[9px] bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 px-1.5 py-0.5 rounded mr-1 font-bold tracking-wide">Stok Tipis</span>}
                            {p.stock === 0 && <span className="text-[9px] bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 px-1.5 py-0.5 rounded mr-1 font-bold tracking-wide">Habis</span>}
                         </div>
                         <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-1">{p.category?.name}</p>
                       </div>
                       <div className="text-right flex items-center gap-3">
                         <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">Rp {p.price.toLocaleString('id-ID')}</p>
                         <ArrowRight className={`w-4 h-4 transition-all ${selectedIndex === i ? 'text-emerald-500 opacity-100 translate-x-0' : 'text-gray-300 dark:text-slate-600 opacity-0 -translate-x-2'}`} />
                       </div>
                     </button>
                   ))}
                   
                   <button 
                     onClick={() => {
                        navigate(`/products?q=${encodeURIComponent(query)}`);
                        onClose();
                     }}
                     className="w-full mt-2 p-3 text-center text-sm font-bold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-xl transition-colors"
                   >
                     Lihat Semua Hasil untuk "{query}"
                   </button>
                </div>
              ) : !loading && (
                <div className="py-16 flex flex-col items-center justify-center text-center px-4">
                   <div className="w-16 h-16 bg-gray-50 dark:bg-slate-800/50 rounded-full flex items-center justify-center mb-4 text-gray-400 dark:text-gray-500">
                     <PackageOpen className="w-8 h-8" strokeWidth={1.5} />
                   </div>
                   <p className="text-gray-900 dark:text-white font-bold text-lg">Produk tidak ditemukan</p>
                   <p className="text-gray-500 dark:text-gray-400 text-sm mt-1 max-w-[260px] leading-relaxed">Kami tidak memanen sayur dengan kata kunci <span className="text-gray-900 dark:text-white font-semibold">"{query}"</span>. Coba kata kunci yang lain.</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="hidden sm:flex items-center px-4 py-3 bg-gray-50 dark:bg-slate-800/80 border-t border-gray-100 dark:border-slate-800 text-xs text-gray-500 dark:text-gray-400 gap-5">
              <span className="flex items-center gap-1.5">
                <kbd className="px-1.5 py-0.5 bg-white dark:bg-slate-700 rounded border border-gray-200 dark:border-slate-600 font-sans shadow-sm text-[10px] font-bold">↑</kbd>
                <kbd className="px-1.5 py-0.5 bg-white dark:bg-slate-700 rounded border border-gray-200 dark:border-slate-600 font-sans shadow-sm text-[10px] font-bold">↓</kbd> 
                Navigasi
              </span>
              <span className="flex items-center gap-1.5">
                <kbd className="px-1.5 py-0.5 bg-white dark:bg-slate-700 rounded border border-gray-200 dark:border-slate-600 font-sans shadow-sm text-[10px] font-bold">↵</kbd> 
                Pilih Produk
              </span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
