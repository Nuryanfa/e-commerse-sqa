import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/useAuth';
import { useToast } from '../context/ToastContext';
import api from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, SlidersHorizontal, Leaf, Loader2 } from 'lucide-react';
import ProductCard from '../components/ProductCard';

export default function Products() {
  const [products,          setProducts]          = useState([]);
  const [categories,        setCategories]        = useState([]);
  const [search,            setSearch]            = useState('');
  const [selectedCategory,  setSelectedCategory]  = useState('');
  const [sortKey,           setSortKey]           = useState('newest');
  const [loading,           setLoading]           = useState(true);
  const [page,              setPage]              = useState(1);
  const [hasMore,           setHasMore]           = useState(true);
  const [isFetchingMore,    setIsFetchingMore]    = useState(false);
  const [filterOpen,        setFilterOpen]        = useState(false);

  const sorted = useMemo(() => {
    const list = [...products];
    if (sortKey === 'price_asc')  return list.sort((a, b) => a.price - b.price);
    if (sortKey === 'price_desc') return list.sort((a, b) => b.price - a.price);
    if (sortKey === 'name_asc')   return list.sort((a, b) => a.name.localeCompare(b.name));
    if (sortKey === 'name_desc')  return list.sort((a, b) => b.name.localeCompare(a.name));
    return list;
  }, [products, sortKey]);

  useEffect(() => { api.get('/categories').then(r => setCategories(r.data.data || [])).catch(() => {}); }, []);

  const fetchProducts = async (keyword = '', categoryID = '', targetPage = 1) => {
    const isFirst = targetPage === 1;
    if (isFirst) setLoading(true); else setIsFetchingMore(true);
    try {
      const params = new URLSearchParams({ page: targetPage, limit: 12 });
      if (keyword) params.set('q', keyword);
      if (categoryID) params.set('category', categoryID);
      const res = await api.get(`/products/search?${params}`);
      // [SQA Fix] Backend sekarang mengembalikan { data: { data: [], total: 0, ... } }
      const newP = res.data.data?.data || [];
      setHasMore(newP.length === 12);
      setProducts(prev => isFirst ? newP : [...prev, ...newP]);
    } catch { if (isFirst) setProducts([]); }
    setLoading(false); setIsFetchingMore(false);
  };

  useEffect(() => {
    setPage(1); setProducts([]); setHasMore(true);
    const t = setTimeout(() => fetchProducts(search, selectedCategory, 1), 350);
    return () => clearTimeout(t);
  }, [search, selectedCategory]);

  const loadMore = () => {
    if (!hasMore || isFetchingMore) return;
    const next = page + 1;
    setPage(next);
    fetchProducts(search, selectedCategory, next);
  };

  return (
    <div className="bg-gray-50/30 dark:bg-slate-900 min-h-screen pb-24 font-sans transition-colors duration-300">
      
      {/* Hero Banner Section */}
      <div className="relative overflow-hidden bg-emerald-900 pt-10 pb-16 px-4 sm:px-6 lg:px-8 mb-6 isolate">
         <div className="absolute inset-0 z-0">
           <img src="https://images.unsplash.com/photo-1542838132-92c53300491e?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80" alt="Sayuran Segar" className="w-full h-full object-cover opacity-20" />
           <div className="absolute inset-0 bg-gradient-to-t from-emerald-900 via-emerald-900/80 to-transparent" />
         </div>
         <div className="relative z-10 max-w-7xl mx-auto text-center">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
               <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-800/50 text-emerald-200 text-xs font-black tracking-widest uppercase mb-3 border border-emerald-500/30 backdrop-blur-md">
                 <Leaf className="w-3.5 h-3.5" /> 100% Organik & Segar
               </span>
               <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight mb-2 leading-tight">
                 Katalog <span className="text-emerald-400">Sayur & Buah</span>
               </h1>
               <p className="text-emerald-100/80 max-w-2xl mx-auto text-sm font-medium leading-relaxed">
                 Hasil panen terbaik dari petani lokal terpercaya, langsung ke dapur Anda.
               </p>
            </motion.div>
         </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 -mt-12 relative z-20">
        
        {/* Search & Filter Bar */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-3 sm:p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xl shadow-emerald-900/5 border border-gray-100 dark:border-slate-700/50 mb-5">
          
          <div className="relative w-full sm:max-w-md">
             <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
             <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari kale, wortel, alpukat..." 
                    className="w-full pl-12 pr-4 py-3 rounded-xl bg-gray-50 dark:bg-slate-900 border border-transparent focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-sm font-bold text-gray-900 dark:text-white outline-none transition-all placeholder-gray-400" />
          </div>

          <div className="flex w-full sm:w-auto items-center gap-3">
             <button onClick={() => setFilterOpen(!filterOpen)} className="flex items-center gap-2 px-5 py-3.5 rounded-2xl bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 text-sm font-bold text-gray-700 dark:text-gray-300 hover:bg-emerald-50 dark:hover:bg-slate-700 hover:text-emerald-600 transition-colors cursor-pointer disabled:opacity-50">
                <SlidersHorizontal className="w-4 h-4" /> <span className="hidden sm:inline">Filter</span>
             </button>
             <select value={sortKey} onChange={e => setSortKey(e.target.value)} className="w-full sm:w-auto px-4 py-3.5 rounded-2xl bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 text-sm font-bold text-gray-700 dark:text-gray-300 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 cursor-pointer transition-colors appearance-none">
                <option value="newest">Paling Baru</option>
                <option value="price_asc">Harga Terendah</option>
                <option value="price_desc">Harga Tertinggi</option>
                <option value="name_asc">A - Z</option>
                <option value="name_desc">Z - A</option>
             </select>
          </div>
        </div>

        {/* Categories Pills */}
        <div className="flex overflow-x-auto gap-2 pb-4 mb-4 custom-scrollbar z-10 bg-transparent pt-1 -mx-4 px-4 sm:mx-0 sm:px-0 scroll-smooth">
           <button onClick={() => setSelectedCategory('')} className={`shrink-0 px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-widest transition-all cursor-pointer shadow-sm border ${selectedCategory === '' ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-white dark:bg-slate-800 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-slate-700/80 hover:border-emerald-500 hover:text-emerald-500'}`}>
             Semua
           </button>
           {categories.map(c => (
             <button key={c.id_category} onClick={() => setSelectedCategory(c.id_category)} className={`shrink-0 px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-widest transition-all cursor-pointer shadow-sm border ${selectedCategory === c.id_category ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-white dark:bg-slate-800 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-slate-700/80 hover:border-emerald-500 hover:text-emerald-500'}`}>
               {c.name}
             </button>
           ))}
        </div>

        {/* Product Grid */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 mt-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white dark:bg-slate-800 rounded-3xl h-[340px] skeleton border border-gray-100 dark:border-slate-700" />
            ))}
          </div>
        ) : sorted.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white dark:bg-slate-800 rounded-[2.5rem] p-16 text-center border border-gray-100 dark:border-slate-700 shadow-sm flex flex-col items-center justify-center mt-8">
            <div className="w-24 h-24 bg-gray-50 dark:bg-slate-700/50 rounded-full flex items-center justify-center mb-6">
              <Leaf className="w-10 h-10 text-gray-300 dark:text-gray-500 opacity-50" />
            </div>
            <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2 tracking-tight">Tidak Ditemukan</h3>
            <p className="text-sm text-gray-500 mb-6 max-w-sm mx-auto font-medium">Sayuran atau buah yang Anda cari tidak tersedia saat ini. Coba kata kunci yang berbeda.</p>
            <button onClick={() => { setSearch(''); setSelectedCategory(''); }} className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-6 py-3 rounded-xl text-sm font-bold hover:bg-emerald-200 dark:hover:bg-emerald-900/50 transition-colors cursor-pointer">
              Reset Filter
            </button>
          </motion.div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 mt-4">
              <AnimatePresence>
                {sorted.map((prod, i) => (
                  <ProductCard key={prod.id_product} product={prod} index={i} />
                ))}
              </AnimatePresence>
            </div>

            {hasMore && (
              <div className="mt-16 text-center">
                <button
                  onClick={loadMore}
                  disabled={isFetchingMore}
                  className="bg-white dark:bg-slate-800 text-gray-900 dark:text-white border-2 border-gray-200 dark:border-slate-700 hover:border-emerald-500 hover:text-emerald-500 px-10 py-4 rounded-2xl text-sm font-bold uppercase tracking-wider shadow-sm transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 mx-auto"
                >
                  {isFetchingMore ? <><Loader2 className="w-4 h-4 animate-spin"/> Memuat...</> : 'Selanjutnya'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
