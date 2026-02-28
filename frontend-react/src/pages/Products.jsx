import { useState, useEffect, useRef, useMemo } from 'react';
import api from '../services/api';
import ProductCard from '../components/ProductCard';
import { SearchX } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortKey, setSortKey] = useState('newest'); // 'newest', 'price_asc', 'price_desc', 'name_asc', 'name_desc'
  const [loading, setLoading] = useState(true);
  const pillsRef = useRef(null);

  const sortedProducts = useMemo(() => {
    const list = [...products];
    if (sortKey === 'price_asc') return list.sort((a, b) => a.price - b.price);
    if (sortKey === 'price_desc') return list.sort((a, b) => b.price - a.price);
    if (sortKey === 'name_asc') return list.sort((a, b) => a.name.localeCompare(b.name));
    if (sortKey === 'name_desc') return list.sort((a, b) => b.name.localeCompare(a.name));
    return list; // 'newest' uses default backend order
  }, [products, sortKey]);

  useEffect(() => {
    api.get('/categories').then(res => setCategories(res.data.data || [])).catch(() => {});
    fetchProducts();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => fetchProducts(search, selectedCategory), 400);
    return () => clearTimeout(timer);
  }, [search, selectedCategory]);

  const fetchProducts = async (keyword = '', categoryID = '') => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (keyword) params.set('q', keyword);
      if (categoryID) params.set('category', categoryID);
      const url = keyword || categoryID ? `/products/search?${params}` : '/products';
      const res = await api.get(url);
      setProducts(res.data.data || []);
    } catch { setProducts([]); }
    setLoading(false);
  };

  return (
    <div style={{ background: 'var(--surface-base)' }}>
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-2">
        <div className="animate-fade-in-up">
          <h1 className="text-3xl font-black tracking-tight" style={{ color: 'var(--text-heading)' }}>
            Katalog Produk
          </h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>Temukan sayur segar berkualitas dari petani lokal</p>
        </div>

        {/* Search & Sort Container */}
        <div className="mt-5 flex flex-col sm:flex-row gap-4 animate-fade-in-up stagger-1">
          {/* Search */}
          <div className="relative group flex-1 max-w-lg">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors group-focus-within:text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--text-muted)' }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Cari kangkung, bayam, tomat..."
              className="w-full rounded-2xl pl-11 pr-10 py-3 text-sm border focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-400 transition-all duration-300"
              style={{ backgroundColor: 'var(--surface-card)', borderColor: 'var(--border-primary)', color: 'var(--text-primary)', boxShadow: 'var(--shadow-soft)' }}
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center text-xs cursor-pointer transition-all hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-400 hover:text-red-500">✕</button>
            )}
          </div>

          {/* Sort Dropdown */}
          <div className="relative min-w-[180px]">
            <select
              value={sortKey}
              onChange={(e) => setSortKey(e.target.value)}
              className="w-full appearance-none rounded-2xl pl-4 pr-10 py-3 text-sm border focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-400 transition-all cursor-pointer font-medium"
              style={{ backgroundColor: 'var(--surface-card)', borderColor: 'var(--border-primary)', color: 'var(--text-heading)', boxShadow: 'var(--shadow-soft)' }}
            >
              <option value="newest">Baru Ditambahkan</option>
              <option value="price_asc">Harga: Termurah</option>
              <option value="price_desc">Harga: Termahal</option>
              <option value="name_asc">Nama: A - Z</option>
              <option value="name_desc">Nama: Z - A</option>
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--text-muted)' }}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </div>
          </div>
        </div>
      </div>

      {/* Category pills */}
      <div className="sticky top-14 z-20 glass animate-fade-in-up stagger-2" style={{ borderBottom: '1px solid var(--border-light)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div ref={pillsRef} className="flex gap-2 py-3 overflow-x-auto no-scrollbar">
            <button onClick={() => setSelectedCategory('')} className={`pill-category relative ${selectedCategory === '' ? 'text-emerald-700 dark:text-emerald-300' : ''}`}>
              {selectedCategory === '' && <motion.div layoutId="activeCategory" className="absolute inset-0 bg-emerald-100 dark:bg-emerald-900/40 rounded-full -z-10" transition={{ type: 'spring', stiffness: 300, damping: 30 }} />}
              <span className="relative z-10">Semua</span>
            </button>
            {categories.map(c => (
              <button key={c.id_category} onClick={() => setSelectedCategory(c.id_category)} className={`pill-category relative ${selectedCategory === c.id_category ? 'text-emerald-700 dark:text-emerald-300' : ''}`}>
                {selectedCategory === c.id_category && <motion.div layoutId="activeCategory" className="absolute inset-0 bg-emerald-100 dark:bg-emerald-900/40 rounded-full -z-10" transition={{ type: 'spring', stiffness: 300, damping: 30 }} />}
                <span className="relative z-10">{c.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-12">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {[...Array(8)].map((_, i) => (
              <div key={i} className={`animate-fade-in stagger-${Math.min(i + 1, 8)}`}>
                <div className="rounded-[20px] overflow-hidden" style={{ border: '1px solid var(--border-light)' }}>
                  <div className="aspect-square skeleton" />
                  <div className="p-4 space-y-3" style={{ background: 'var(--surface-card)' }}>
                    <div className="h-3 w-16 skeleton rounded-full" />
                    <div className="h-4 w-3/4 skeleton rounded-full" />
                    <div className="h-6 w-1/2 skeleton rounded-full" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            <p className="text-xs font-medium mb-4 animate-fade-in" style={{ color: 'var(--text-muted)' }}>{sortedProducts.length} produk ditemukan {sortKey !== 'newest' && `• Diurutkan`}</p>
            <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              <AnimatePresence mode="popLayout">
                {sortedProducts.map((p, i) => (
                  <motion.div
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.2 }}
                    key={p.id_product}
                  >
                    <ProductCard product={p} index={i} />
                  </motion.div>
                ))}
              </AnimatePresence>
              {sortedProducts.length === 0 && (
                <div className="col-span-full text-center py-24 animate-fade-in-up flex flex-col items-center">
                  <div className="mb-5 animate-float opacity-60 bg-emerald-100 dark:bg-emerald-900/30 p-6 rounded-full text-emerald-600 dark:text-emerald-400">
                    <SearchX className="w-16 h-16" strokeWidth={1.5} />
                  </div>
                  <p className="text-lg font-bold" style={{ color: 'var(--text-heading)' }}>Tidak ada produk ditemukan</p>
                  <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Coba kata kunci atau kategori lain</p>
                </div>
              )}
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
}
