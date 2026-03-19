import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, SlidersHorizontal, ShoppingCart, Eye, Leaf, SearchX } from 'lucide-react';
import QuickViewModal from '../components/QuickViewModal';

/* ── Individual Product Card (inline) ─────────────────────── */
function ProductCard({ product, index = 0 }) {
  const { user } = useAuth();
  const toast = useToast();
  const [qvOpen, setQvOpen] = useState(false);
  const outOfStock = product.stock === 0;
  const stockLow   = product.stock > 0 && product.stock < 5;

  const addToCart = async (e) => {
    e.preventDefault(); e.stopPropagation();
    if (!user) { toast.info('Silakan login untuk berbelanja'); return; }
    try {
      await api.post('/cart', { id_product: product.id_product, quantity: 1 });
      toast.success(`${product.name} ditambahkan!`);
    } catch (err) { toast.error(err.response?.data?.error || 'Gagal'); }
  };

  return (
    <>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
        <Link to={`/products/${product.id_product}`} style={{ textDecoration: 'none', display: 'block' }}>
          <div
            className="group"
            style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden', background: 'var(--surface-container-lowest)', border: '1px solid var(--border)', transition: 'transform 0.2s ease, box-shadow 0.2s ease', cursor: 'pointer' }}
            onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = 'var(--shadow-lg)'; }}
            onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
          >
            {/* Image */}
            <div style={{ position: 'relative', aspectRatio: '1/1', overflow: 'hidden', background: 'var(--surface-container-low)' }}>
              {product.image_url ? (
                <img src={product.image_url} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }} className="group-hover:scale-110" />
              ) : (
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Leaf style={{ width: '3rem', height: '3rem', color: 'var(--md-primary)', opacity: 0.2 }} />
                </div>
              )}
              {/* Badges */}
              {stockLow && (
                <div style={{ position: 'absolute', top: '0.75rem', left: '0.75rem', background: 'var(--md-primary)', color: 'white', fontSize: '0.65rem', fontWeight: 700, padding: '0.2rem 0.6rem', borderRadius: 'var(--radius-full)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <span style={{ width: '0.4rem', height: '0.4rem', borderRadius: '50%', background: 'white', animation: 'pulse 1s infinite' }} />
                  Sisa {product.stock}
                </div>
              )}
              {outOfStock && (
                <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ color: 'white', fontWeight: 700, fontSize: '0.75rem', background: 'rgba(180,0,0,0.85)', padding: '0.3rem 1rem', borderRadius: 'var(--radius-full)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Habis</span>
                </div>
              )}
              {/* Hover Actions */}
              {!outOfStock && (
                <div style={{ position: 'absolute', bottom: '0.75rem', right: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', transform: 'translateY(120%)', opacity: 0, transition: 'all 0.3s ease' }} className="group-hover:translate-y-0 group-hover:opacity-100">
                  <button onClick={e => { e.preventDefault(); e.stopPropagation(); setQvOpen(true); }}
                    style={{ width: '2.25rem', height: '2.25rem', borderRadius: 'var(--radius-md)', background: 'var(--surface-container-lowest)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--on-surface)', boxShadow: 'var(--shadow-md)' }}
                    title="Lihat Cepat">
                    <Eye style={{ width: '1rem', height: '1rem' }} />
                  </button>
                  {user?.role === 'pembeli' && (
                    <button onClick={addToCart}
                      style={{ width: '2.25rem', height: '2.25rem', borderRadius: 'var(--radius-md)', background: 'var(--md-primary)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', boxShadow: 'var(--shadow-md)' }}
                      title="Tambah ke Keranjang">
                      <ShoppingCart style={{ width: '1rem', height: '1rem' }} />
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Info */}
            <div style={{ padding: '1rem 1.25rem 1.25rem' }}>
              <p style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: 'var(--md-primary)', marginBottom: '0.35rem', fontFamily: 'var(--font-display)' }}>
                {product.category?.name || 'Organik'}
              </p>
              <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-heading)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: '0.625rem' }}>
                {product.name}
              </h3>
              <p style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.05rem', color: 'var(--md-primary)' }}>
                {product.variants?.length > 0 && <span style={{ fontSize: '0.725rem', fontWeight: 600, color: 'var(--outline)', marginRight: '0.25rem' }}>Mulai</span>}
                Rp {(product.variants?.length > 0 ? product.variants[0].price : product.price)?.toLocaleString('id-ID')}
              </p>
            </div>
          </div>
        </Link>
      </motion.div>
      <QuickViewModal product={product} isOpen={qvOpen} onClose={() => setQvOpen(false)} />
    </>
  );
}

/* ── Products Page ──────────────────────────────────────────── */
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
      const params = new URLSearchParams({ page: targetPage, limit: 8 });
      if (keyword) params.set('q', keyword);
      if (categoryID) params.set('category', categoryID);
      const res = await api.get(`/products/search?${params}`);
      const newP = res.data.data || [];
      setHasMore(newP.length === 8);
      setProducts(prev => isFirst ? newP : [...prev, ...newP]);
    } catch { if (isFirst) setProducts([]); }
    setLoading(false); setIsFetchingMore(false);
  };

  useEffect(() => {
    setPage(1); setProducts([]); setHasMore(true);
    const t = setTimeout(() => fetchProducts(search, selectedCategory, 1), 350);
    return () => clearTimeout(t);
  }, [search, selectedCategory]);

  useEffect(() => { if (page > 1) fetchProducts(search, selectedCategory, page); }, [page]);

  const catBtnStyle = (active) => ({
    display: 'block', width: '100%', padding: '0.6rem 0.875rem', borderRadius: 'var(--radius-md)', border: 'none', cursor: 'pointer', textAlign: 'left', fontSize: '0.85rem', fontWeight: active ? 700 : 500, fontFamily: 'var(--font-body)', background: active ? 'var(--md-primary-container)' : 'transparent', color: active ? 'var(--md-on-primary-container)' : 'var(--on-surface-variant)', transition: 'all 0.15s ease',
  });

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      {/* ── Page Header ──────────────────────────────────────── */}
      <div style={{ padding: '2.5rem 0 0', background: 'var(--surface-container-lowest)', borderBottom: '1px solid var(--border)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-5">
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '2rem', color: 'var(--text-heading)', marginBottom: '0.35rem' }}>Katalog Produk</h1>
          <p style={{ color: 'var(--outline)', fontSize: '0.875rem' }}>Kesegaran Kebun dalam Genggaman.</p>

          {/* Search + Sort bar */}
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem' }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <Search style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', width: '1rem', height: '1rem', color: 'var(--outline)' }} />
              <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari kangkung, bayam, tomat..."
                style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.75rem', borderRadius: 'var(--radius-md)', background: 'var(--surface-container)', border: 'none', color: 'var(--on-surface)', fontSize: '0.875rem', outline: 'none', fontFamily: 'var(--font-body)', boxSizing: 'border-box' }}
                onFocus={e => e.target.style.boxShadow = '0 0 0 2px var(--md-primary)'}
                onBlur={e => e.target.style.boxShadow = 'none'}
              />
              {search && <button onClick={() => setSearch('')} style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--outline)', fontSize: '0.875rem' }}>✕</button>}
            </div>
            <select value={sortKey} onChange={e => setSortKey(e.target.value)}
              style={{ padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', background: 'var(--surface-container)', border: 'none', color: 'var(--on-surface)', fontSize: '0.875rem', fontFamily: 'var(--font-body)', cursor: 'pointer', minWidth: '11rem', outline: 'none' }}>
              <option value="newest">Terbaru</option>
              <option value="price_asc">Harga: Termurah</option>
              <option value="price_desc">Harga: Termahal</option>
              <option value="name_asc">Nama: A–Z</option>
              <option value="name_desc">Nama: Z–A</option>
            </select>
            {/* Mobile filter toggle */}
            <button onClick={() => setFilterOpen(!filterOpen)} className="md:hidden"
              style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', background: filterOpen ? 'var(--md-primary-container)' : 'var(--surface-container)', border: 'none', cursor: 'pointer', color: filterOpen ? 'var(--md-on-primary-container)' : 'var(--on-surface-variant)', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              <SlidersHorizontal style={{ width: '1rem', height: '1rem' }} />
            </button>
          </div>

          {/* Mobile categories */}
          {filterOpen && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="md:hidden" style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', paddingTop: '0.875rem', paddingBottom: '0.25rem' }}>
              {[{ id_category: '', name: 'Semua' }, ...categories].map(c => (
                <button key={c.id_category} onClick={() => setSelectedCategory(c.id_category)}
                  style={{ padding: '0.35rem 0.875rem', borderRadius: 'var(--radius-full)', border: 'none', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600, background: selectedCategory === c.id_category ? 'var(--md-primary-container)' : 'var(--surface-container)', color: selectedCategory === c.id_category ? 'var(--md-on-primary-container)' : 'var(--on-surface-variant)', fontFamily: 'var(--font-body)' }}>
                  {c.name}
                </button>
              ))}
            </motion.div>
          )}
        </div>
      </div>

      {/* ── Main Content: Sidebar + Grid ─────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-7" style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>

        {/* Desktop Filter Sidebar */}
        <aside className="hidden md:block" style={{ width: '15rem', flexShrink: 0, position: 'sticky', top: '5.5rem' }}>
          <div style={{ background: 'var(--surface-container-lowest)', borderRadius: 'var(--radius-lg)', padding: '1.25rem', border: '1px solid var(--border)' }}>
            <p style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--outline)', marginBottom: '0.875rem', fontFamily: 'var(--font-display)' }}>Filter Kategori</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <button onClick={() => setSelectedCategory('')} style={catBtnStyle(selectedCategory === '')}>Semua Produk</button>
              {categories.map(c => (
                <button key={c.id_category} onClick={() => setSelectedCategory(c.id_category)} style={catBtnStyle(selectedCategory === c.id_category)}>{c.name}</button>
              ))}
            </div>

            {/* Price range (static – style only) */}
            <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border)' }}>
              <p style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--outline)', marginBottom: '0.875rem', fontFamily: 'var(--font-display)' }}>Harga (IDR)</p>
              <input type="range" min={0} max={100000} defaultValue={100000} style={{ width: '100%', accentColor: 'var(--md-primary)' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--outline)', marginTop: '0.375rem' }}>
                <span>Rp 0</span><span>Rp 100k</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Product Grid */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1.25rem' }}>
              {[...Array(8)].map((_, i) => (
                <div key={i} style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden', background: 'var(--surface-container-lowest)', border: '1px solid var(--border)' }}>
                  <div style={{ aspectRatio: '1/1', background: 'var(--surface-container)' }} className="skeleton" />
                  <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                    <div className="skeleton" style={{ height: '0.75rem', width: '40%', borderRadius: '9999px' }} />
                    <div className="skeleton" style={{ height: '1rem', width: '80%', borderRadius: '9999px' }} />
                    <div className="skeleton" style={{ height: '1.25rem', width: '55%', borderRadius: '9999px' }} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <>
              <p style={{ fontSize: '0.8rem', color: 'var(--outline)', marginBottom: '1rem' }}>{sorted.length} produk ditemukan</p>
              <AnimatePresence mode="popLayout">
                {sorted.length === 0 ? (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: 'center', padding: '6rem 0', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{ width: '5rem', height: '5rem', borderRadius: 'var(--radius-full)', background: 'var(--md-primary-container)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
                      <SearchX style={{ width: '2rem', height: '2rem', color: 'var(--md-on-primary-container)' }} />
                    </div>
                    <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.1rem', color: 'var(--text-heading)' }}>Tidak ada produk ditemukan</p>
                    <p style={{ color: 'var(--outline)', fontSize: '0.875rem', marginTop: '0.5rem' }}>Coba kata kunci atau kategori lain</p>
                  </motion.div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1.25rem' }}>
                    {sorted.map((p, i) => <ProductCard key={p.id_product} product={p} index={i} />)}
                  </div>
                )}
              </AnimatePresence>

              {/* Infinite scroll trigger */}
              {sorted.length > 0 && (
                <div style={{ textAlign: 'center', padding: '2.5rem 0' }}>
                  {isFetchingMore ? (
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem', padding: '0.625rem 1.25rem', borderRadius: 'var(--radius-full)', background: 'var(--surface-container-lowest)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
                      <span style={{ width: '1rem', height: '1rem', borderRadius: '50%', border: '2px solid var(--md-primary)', borderTopColor: 'transparent', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />
                      <span style={{ fontSize: '0.85rem', color: 'var(--on-surface-variant)' }}>Memuat lebih banyak...</span>
                    </div>
                  ) : hasMore ? (
                    <button onClick={() => setPage(p => p + 1)} style={{ padding: '0.75rem 2rem', borderRadius: 'var(--radius-full)', background: 'var(--md-primary-container)', color: 'var(--md-on-primary-container)', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.875rem' }}>
                      Muat Lebih Banyak
                    </button>
                  ) : (
                    <p style={{ color: 'var(--outline)', fontSize: '0.8rem', fontStyle: 'italic' }}>Semua produk sudah ditampilkan 🥬</p>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
