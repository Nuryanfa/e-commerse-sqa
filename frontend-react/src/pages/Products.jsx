import { useState, useEffect } from 'react';
import api from '../services/api';
import ProductCard from '../components/ProductCard';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/categories').then(res => setCategories(res.data.data || [])).catch(() => {});
    fetchProducts();
  }, []);

  // Debounce search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProducts(search, selectedCategory);
    }, 500); // 500ms delay

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

  const handleSearch = (e) => {
    e.preventDefault();
    fetchProducts(search, selectedCategory);
  };

  const handleCategoryFilter = (catId) => {
    setSelectedCategory(catId);
    fetchProducts(search, catId);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 animate-fade-in-up">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">🛒 Katalog Produk</h1>
        <p className="text-gray-500">Temukan sayur segar berkualitas dari petani lokal</p>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6 animate-fade-in-up stagger-2">
        <div className="flex-1 relative">
          <input 
            type="text" 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
            placeholder="🔍 Cari kangkung, bayam, tomat..." 
            className="w-full border border-gray-200 rounded-xl px-4 py-3 pl-11 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-all shadow-sm hover:shadow-md" 
          />
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 transition-colors">✕</button>
          )}
        </div>
        <select value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)} className="border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-400 bg-white cursor-pointer shadow-sm hover:shadow-md transition-all">
          <option value="">Semua Kategori</option>
          {categories.map(c => <option key={c.id_category} value={c.id_category}>{c.name}</option>)}
        </select>
      </div>

      {/* Category chips */}
      <div className="flex flex-wrap gap-2 mb-8 animate-fade-in-up stagger-3">
        <button onClick={() => setSelectedCategory('')} className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-300 cursor-pointer hover:-translate-y-0.5 ${selectedCategory === '' ? 'bg-primary-600 text-white shadow-md shadow-primary-200' : 'bg-white text-gray-600 border border-gray-200 hover:border-primary-300'}`}>
          Semua
        </button>
        {categories.map(c => (
          <button key={c.id_category} onClick={() => setSelectedCategory(c.id_category)} className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-300 cursor-pointer hover:-translate-y-0.5 ${selectedCategory === c.id_category ? 'bg-primary-600 text-white shadow-md shadow-primary-200' : 'bg-white text-gray-600 border border-gray-200 hover:border-primary-300'}`}>
            {c.name}
          </button>
        ))}
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => <div key={i} className="bg-white rounded-2xl h-64 shimmer" />)}
        </div>
      ) : (
        <>
          <p className="text-sm text-gray-400 mb-4 animate-fade-in">{products.length} produk ditemukan</p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((p, i) => <ProductCard key={p.id_product} product={p} index={i} />)}
            {products.length === 0 && (
              <div className="col-span-4 text-center py-16 animate-fade-in">
                <span className="text-5xl block mb-3 animate-float">🔍</span>
                <p className="text-gray-400 text-lg font-medium">Tidak ada produk ditemukan</p>
                <p className="text-gray-300 text-sm mt-1">Coba kata kunci lain</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
