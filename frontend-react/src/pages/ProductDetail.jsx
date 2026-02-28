import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import ProductCard from '../components/ProductCard';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Heart, Star, ArrowLeft, Minus, Plus, MessageSquare, Box, Leaf } from 'lucide-react';

export default function ProductDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [avgRating, setAvgRating] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [myReview, setMyReview] = useState({ rating: 5, comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [hoverRating, setHoverRating] = useState(0);
  const toast = useToast();

  useEffect(() => {
    setLoading(true);
    setQty(1);
    
    const fetches = [api.get(`/products/${id}`), api.get(`/products/${id}/reviews`), api.get('/products')];
    if (user) fetches.push(api.get(`/wishlist/check/${id}`).catch(() => ({ data: { is_wishlisted: false } })));
    
    Promise.all(fetches).then(r => {
      const p = r[0].data.data;
      setProduct(p);
      
      if (r[1].data.data) { setReviews(r[1].data.data.reviews || []); setAvgRating(r[1].data.data.average || 0); }
      
      // Filter related products
      const allProducts = r[2].data.data || [];
      const related = allProducts.filter(item => item.id_category === p.id_category && item.id_product !== p.id_product).slice(0, 4);
      setRelatedProducts(related);

      if (user && r[3]) setIsWishlisted(r[3].data.is_wishlisted);
    }).catch(() => navigate('/products')).finally(() => setLoading(false));
  }, [id, navigate, user]);

  const toggleWishlist = async () => {
    if (!user) { toast.info('Login untuk wishlist'); return navigate('/login'); }
    try { const r = await api.post('/wishlist/toggle', { id_product: id }); setIsWishlisted(r.data.added); toast.success(r.data.message); }
    catch { toast.error('Gagal memperbarui wishlist'); }
  };

  const submitReview = async (e) => {
    e.preventDefault();
    if (!user) { toast.info('Login untuk ulasan'); return navigate('/login'); }
    setSubmittingReview(true);
    try {
      await api.post(`/products/${id}/reviews`, myReview);
      toast.success('Ulasan ditambahkan!');
      setMyReview({ rating: 5, comment: '' });
      const r = await api.get(`/products/${id}/reviews`);
      if (r.data.data) { setReviews(r.data.data.reviews || []); setAvgRating(r.data.data.average || 0); }
    } catch (err) { toast.error(err.response?.data?.error || 'Gagal kirim ulasan'); }
    finally { setSubmittingReview(false); }
  };

  const addToCart = async () => {
    if (!user) { toast.info('Login untuk berbelanja'); return navigate('/login'); }
    setAdding(true);
    try { 
      await api.post('/cart', { id_product: id, quantity: qty }); 
      toast.success('Ditambahkan ke keranjang!', 4000, {
        label: 'Lihat Keranjang ➔',
        onClick: () => navigate('/cart')
      }); 
    }
    catch (err) { toast.error(err.response?.data?.error || 'Gagal menambahkan'); }
    setAdding(false);
  };

  if (loading) return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="aspect-square skeleton" />
        <div className="space-y-4 py-8"><div className="h-4 w-20 skeleton rounded-full" /><div className="h-8 w-3/4 skeleton rounded-full" /><div className="h-4 w-full skeleton rounded-full" /><div className="h-10 w-1/2 skeleton rounded-full" /></div>
      </div>
    </div>
  );
  if (!product) return null;

  const stockLow = product.stock > 0 && product.stock < 10;
  const canBuy = product.stock > 0 && !['admin', 'supplier', 'courier'].includes(user?.role);

  return (
    <div className="bg-gray-50 dark:bg-slate-900 min-h-screen pb-24 lg:pb-8 transition-colors duration-300">
      <div className="max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <button onClick={() => navigate('/products')} className="flex items-center gap-2 text-sm font-bold mb-8 cursor-pointer transition-all duration-300 hover:-translate-x-1 text-gray-500 hover:text-emerald-600 dark:text-gray-400 dark:hover:text-emerald-400">
          <ArrowLeft className="w-4 h-4" /> Kembali ke Katalog
        </button>

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 relative items-start">
          
          {/* Kolom Kiri: Gambar Sticky Desktop */}
          <div className="w-full lg:w-1/2 lg:sticky lg:top-24 z-10">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card-organic p-2 aspect-square md:aspect-[4/3] lg:aspect-square flex items-center justify-center relative overflow-hidden group bg-white dark:bg-slate-800 border-default shadow-sm">
              <div className="absolute inset-0 bg-emerald-50/50 dark:bg-slate-800/50 rounded-3xl" />
              {product.image_url ? (
                <img src={product.image_url} alt={product.name} className="w-full h-full object-cover rounded-2xl relative z-10 group-hover:scale-105 transition-transform duration-700 shadow-inner" />
              ) : (
                <Leaf className="w-32 h-32 text-emerald-200 dark:text-emerald-900/50 relative z-10 group-hover:rotate-12 transition-transform duration-500" />
              )}
              
              {/* Badge Ketersediaan Stok */}
              <div className="absolute top-6 right-6 z-20 flex flex-col gap-2">
                {stockLow && <span className="bg-amber-500/90 backdrop-blur-sm text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow-lg shadow-amber-500/20 animate-pulse">Sisa {product.stock} kg!</span>}
                {product.stock === 0 && <span className="bg-red-500/90 backdrop-blur-sm text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow-lg shadow-red-500/20">Stok Habis</span>}
              </div>

              {/* Wishlist Floating Button Overlay */}
              <button 
                onClick={toggleWishlist} 
                className={`absolute top-6 left-6 z-20 w-12 h-12 flex items-center justify-center rounded-2xl backdrop-blur-md transition-all duration-300 shadow-lg cursor-pointer hover:scale-110 ${
                  isWishlisted 
                    ? 'bg-red-50 dark:bg-red-900/80 text-red-500 shadow-red-500/20' 
                    : 'bg-white/80 dark:bg-slate-800/80 text-gray-400 hover:text-red-500 shadow-black/5'
                }`}
              >
                <Heart className={`w-6 h-6 ${isWishlisted ? 'fill-current' : ''}`} />
              </button>
            </motion.div>
          </div>

          {/* Kolom Kanan: Detail Info */}
          <div className="w-full lg:w-1/2 space-y-6">
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="card-organic p-8 lg:p-10 border-default">
              
              {/* Kategori Badge */}
              <div className="mb-4 flex items-center gap-3">
                {product.category && (
                  <span className="text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                    <Box className="w-3.5 h-3.5" /> {product.category.name}
                  </span>
                )}
                <div className="flex items-center gap-1.5 text-sm font-bold text-amber-500 bg-amber-50 dark:bg-amber-900/20 px-3 py-1 rounded-lg">
                  <Star className="w-4 h-4 fill-amber-500" /> {avgRating.toFixed(1)} 
                  <span className="text-gray-400 ml-1 font-medium">({reviews.length})</span>
                </div>
              </div>

              <h1 className="text-3xl sm:text-4xl font-black mt-2 mb-4 tracking-tight leading-tight text-gray-900 dark:text-white">{product.name}</h1>
              <p className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500 mb-6 drop-shadow-sm">
                Rp {product.price?.toLocaleString('id-ID')}
              </p>

              <div className="h-px w-full bg-gray-100 dark:bg-slate-700/50 mb-6" />

              <h3 className="font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2"><Leaf className="w-4 h-4 text-emerald-500" /> Deskripsi Produk</h3>
              <p className="text-sm sm:text-base leading-relaxed text-gray-600 dark:text-gray-400 mb-8 whitespace-pre-wrap">
                {product.description || 'Sayur segar berkualitas tinggi yang dipanen langsung dari kebun petani lokal.'}
              </p>

              {/* Form Interaksi - Desktop Only (Mobile dipindah ke bottom bar) */}
              <div className="hidden lg:block space-y-6 bg-gray-50 dark:bg-slate-800/50 p-6 rounded-3xl border border-gray-100 dark:border-slate-700/50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Status Stok</p>
                    <p className={`text-sm font-bold ${product.stock > 10 ? 'text-emerald-600 dark:text-emerald-400' : product.stock > 0 ? 'text-amber-500' : 'text-red-500'}`}>
                      {product.stock > 0 ? `Tersedia ${product.stock} kg` : 'Stok Habis'}
                    </p>
                  </div>

                  {canBuy && (
                    <div className="flex items-center gap-4">
                      <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Jumlah</span>
                      <div className="flex items-center bg-white dark:bg-slate-700 rounded-xl overflow-hidden border border-gray-200 dark:border-slate-600 shadow-sm">
                        <button onClick={() => setQty(Math.max(1, qty - 1))} className="px-3 py-2 transition-colors duration-300 cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-600 text-gray-600 dark:text-gray-300"><Minus className="w-4 h-4" /></button>
                        <span className="w-10 text-center text-sm font-black text-gray-900 dark:text-white">{qty}</span>
                        <button onClick={() => setQty(Math.min(product.stock, qty + 1))} className="px-3 py-2 transition-colors duration-300 cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-600 text-gray-600 dark:text-gray-300"><Plus className="w-4 h-4" /></button>
                      </div>
                    </div>
                  )}
                </div>

                {canBuy && (
                  <button onClick={addToCart} disabled={adding} className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white py-4 rounded-2xl text-sm font-bold shadow-xl shadow-emerald-200 dark:shadow-none hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-70 disabled:hover:translate-y-0 flex items-center justify-center gap-2 cursor-pointer">
                    {adding ? <><span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Sedang Menambahkan...</> : <><ShoppingCart className="w-5 h-5" /> Masukkan ke Keranjang </>}
                  </button>
                )}
              </div>
            </motion.div>

            {/* Reviews Section */}
            <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} className="card-organic p-8 border-default mt-8">
              <div className="flex items-center justify-between border-b pb-5 mb-6 border-gray-100 dark:border-slate-700/50">
                <h2 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-emerald-500" /> Ulasan Publik
                </h2>
                {reviews.length > 0 && (
                  <div className="flex bg-amber-50 dark:bg-amber-900/20 px-3 py-1.5 rounded-xl border border-amber-100 dark:border-amber-800/30">
                    <span className="text-xl font-black text-amber-500 drop-shadow-sm">{avgRating.toFixed(1)}</span>
                  </div>
                )}
              </div>

              <div className="space-y-6">
                {reviews.length === 0 ? (
                  <div className="text-center py-10 px-4 bg-gray-50 dark:bg-slate-800/30 rounded-3xl border border-dashed border-gray-200 dark:border-slate-700">
                    <MessageSquare className="w-10 h-10 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Jadilah yang pertama memberikan ulasan<br/>untuk sayuran segar ini.</p>
                  </div>
                ) : (
                  <div className="space-y-5">
                    {reviews.map((r, i) => (
                      <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} key={r.id_review || i} className="pb-5 last:pb-0 border-b last:border-0 border-gray-100 dark:border-slate-700/50">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/40 dark:to-teal-900/40 text-emerald-700 dark:text-emerald-400 font-bold flex items-center justify-center text-sm shadow-inner shadow-emerald-200/50 dark:shadow-none">
                              {r.user?.nama?.charAt(0)?.toUpperCase() || 'U'}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-gray-900 dark:text-white leading-tight">{r.user?.nama || 'Pengguna SayurSehat'}</p>
                              <p className="text-[11px] font-medium text-gray-400 mt-0.5">{new Date(r.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric'})}</p>
                            </div>
                          </div>
                          <div className="flex gap-0.5 mt-1">
                            {[...Array(5)].map((_, j) => (
                              <Star key={j} className={`w-3.5 h-3.5 ${j < r.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200 dark:text-slate-700'}`} />
                            ))}
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed ml-13 bg-gray-50 dark:bg-slate-800/30 p-4 rounded-xl rounded-tl-none">{r.comment}</p>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              {/* Komponen Form Review Bawah Kiri */}
              <div className="mt-8 pt-8 border-t border-gray-100 dark:border-slate-700/50">
                <div className="bg-emerald-50/50 dark:bg-slate-800/80 rounded-3xl p-6 border border-emerald-100 dark:border-slate-700 shadow-sm relative overflow-hidden">
                  <div className="absolute -right-10 -top-10 w-32 h-32 bg-emerald-400/10 dark:bg-emerald-500/5 rounded-full blur-3xl" />
                  <h3 className="font-bold text-sm mb-4 text-emerald-800 dark:text-emerald-300 flex items-center gap-2">Beri Penilaian Anda</h3>
                  <form onSubmit={submitReview} className="space-y-5 relative z-10">
                    <div>
                      <div className="flex items-center gap-1 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 p-2 rounded-2xl w-fit shadow-sm">
                        {[1, 2, 3, 4, 5].map(s => (
                          <button key={s} type="button"
                            onClick={() => setMyReview({ ...myReview, rating: s })}
                            onMouseEnter={() => setHoverRating(s)}
                            onMouseLeave={() => setHoverRating(0)}
                            className="p-1 cursor-pointer transition-all duration-200 hover:scale-110 active:scale-95">
                            <Star className={`w-6 h-6 ${(hoverRating || myReview.rating) >= s ? 'fill-amber-400 text-amber-400' : 'text-gray-200 dark:text-slate-600 transition-colors'}`} />
                          </button>
                        ))}
                      </div>
                    </div>
                    <textarea required value={myReview.comment} onChange={e => setMyReview({ ...myReview, comment: e.target.value })}
                      placeholder="Ceritakan pengalaman Anda dengan kesegaran produk ini..."
                      className="w-full rounded-2xl p-4 text-sm bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all resize-none font-medium placeholder-gray-400 dark:placeholder-gray-600 shadow-sm"
                      rows={3} 
                    />
                    <button type="submit" disabled={submittingReview} className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-lg shadow-emerald-500/20 dark:shadow-none py-3.5 rounded-xl text-sm font-bold hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 cursor-pointer">
                      {submittingReview ? 'Sedang Mengirim...' : 'Kirim Ulasan Sekarang'}
                    </button>
                  </form>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

      {/* Mobile Sticky Add to Cart Bar */}
      {canBuy && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 p-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-t border-gray-200 dark:border-slate-800 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)]">
          <div className="max-w-md mx-auto flex items-center gap-3 relative">
             <div className="flex items-center bg-gray-50 dark:bg-slate-800 rounded-xl overflow-hidden border border-gray-200 dark:border-slate-700 shrink-0">
               <button onClick={() => setQty(Math.max(1, qty - 1))} className="px-3 py-3 text-gray-600 dark:text-gray-300 active:bg-gray-200 dark:active:bg-slate-600"><Minus className="w-4 h-4" /></button>
               <span className="w-8 text-center text-sm font-black text-gray-900 dark:text-white">{qty}</span>
               <button onClick={() => setQty(Math.min(product.stock, qty + 1))} className="px-3 py-3 text-gray-600 dark:text-gray-300 active:bg-gray-200 dark:active:bg-slate-600"><Plus className="w-4 h-4" /></button>
             </div>
             <button onClick={addToCart} disabled={adding} className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-3.5 rounded-xl text-sm font-bold shadow-lg shadow-emerald-500/25 active:scale-95 transition-all disabled:opacity-70 flex justify-center items-center gap-2">
                {adding ? <Loader2 className="w-5 h-5 animate-spin" /> : <><ShoppingCart className="w-4 h-4" /> Beli</>}
             </button>
          </div>
        </div>
      )}

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="mt-12 mb-8 animate-fade-in-up stagger-3">
          <h2 className="text-xl font-black mb-6" style={{ color: 'var(--text-heading)' }}>🥬 Mungkin Anda juga suka</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {relatedProducts.map(p => (
              <ProductCard key={p.id_product} product={p} onClick={() => navigate(`/products/${p.id_product}`)} />
            ))}
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
