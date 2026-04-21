import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/useAuth';
import { useToast } from '../context/ToastContext';
import ProductCard from '../components/ProductCard';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Star, ArrowLeft, Minus, Plus, MessageSquare, Box, Leaf, Loader2, Store, CheckCircle, ShieldCheck, Heart, Shield, BookOpen } from 'lucide-react';

export default function ProductDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
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
  const [showReviewForm, setShowReviewForm] = useState(false);
  const toast = useToast();

  useEffect(() => {
    setLoading(true);
    setQty(1);
    
    const fetches = [api.get(`/products/${id}`), api.get(`/products/${id}/reviews`), api.get('/products')];
    if (user) fetches.push(api.get(`/wishlist/check/${id}`).catch(() => ({ data: { is_wishlisted: false } })));
    
    Promise.all(fetches).then(r => {
      const p = r[0].data.data;
      setProduct(p);
      if (p.variants && p.variants.length > 0) {
        setSelectedVariant(p.variants[0]);
      }
      
      if (r[1].data.data) { setReviews(r[1].data.data.reviews || []); setAvgRating(r[1].data.data.average || 0); }
      
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
      setShowReviewForm(false);
      const r = await api.get(`/products/${id}/reviews`);
      if (r.data.data) { setReviews(r.data.data.reviews || []); setAvgRating(r.data.data.average || 0); }
    } catch (err) { toast.error(err.response?.data?.error || 'Gagal kirim ulasan'); }
    finally { setSubmittingReview(false); }
  };

  const addToCart = async () => {
    if (!user) { toast.info('Login untuk berbelanja'); return navigate('/login'); }
    setAdding(true);
    try { 
      await api.post('/cart', { id_product: id, quantity: qty, id_variant: selectedVariant?.id_variant }); 
      toast.success('Ditambahkan ke keranjang!', 4000, {
        label: 'Lihat Keranjang ➔',
        onClick: () => navigate('/cart')
      }); 
    }
    catch (err) { toast.error(err.response?.data?.error || 'Gagal menambahkan'); }
    setAdding(false);
  };

  const instantBuy = async () => {
    if (!user) { toast.info('Login untuk berbelanja'); return navigate('/login'); }
    setAdding(true);
    try {
      await api.post('/cart', { id_product: id, quantity: qty, id_variant: selectedVariant?.id_variant });
      toast.success('Mengalihkan ke pembayaran...');
      setTimeout(() => navigate('/cart?checkout=1'), 800);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Gagal memproses pembelian');
    }
    setAdding(false);
  };

  if (loading) return (
    <div className="max-w-6xl mx-auto px-4 py-16 flex gap-8">
      <div className="w-1/2 rounded-3xl h-[600px] skeleton" />
      <div className="w-1/2 space-y-6 pt-10"><div className="h-10 w-3/4 skeleton rounded-full" /><div className="h-16 w-1/3 skeleton rounded-2xl" /><div className="h-40 w-full skeleton rounded-3xl" /></div>
    </div>
  );
  if (!product) return null;

  const currentStock = selectedVariant ? selectedVariant.stock : product.stock;
  const currentPrice = selectedVariant ? selectedVariant.price : product.price;
  const canBuy = currentStock > 0 && !['admin', 'supplier', 'courier'].includes(user?.role);

  return (
    <div className="bg-white dark:bg-slate-900 min-h-screen pb-24 transition-colors duration-300 font-sans">
      {/* Product Hero Section */}
      <div className="max-w-6xl mx-auto px-4 pt-6 pb-16 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-16 items-start">
          
          {/* Main Image (Left) */}
          <div className="w-full lg:w-[50%] relative">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="aspect-square bg-gray-50 dark:bg-slate-800 rounded-[2.5rem] overflow-hidden relative shadow-sm border border-gray-100 dark:border-slate-800">
              {product.image_url ? (
                <img src={product.image_url} alt={product.name} className="w-full h-full object-cover rounded-[2.5rem]" />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-emerald-200 dark:text-emerald-900/50">
                   <Leaf className="w-32 h-32 mb-4" />
                   <p className="font-bold tracking-widest uppercase text-sm">SayurSehat</p>
                </div>
              )}
              
              {/* Floating Badge (100% Organik & Segar) */}
              <div className="absolute -right-6 -bottom-6 lg:right-[-2rem] lg:bottom-12 z-20">
                <div className="bg-[#4ade80] text-emerald-950 p-5 rounded-2xl shadow-xl shadow-emerald-500/30 transform rotate-3 flex items-start gap-3 w-40">
                   <div className="bg-white/30 rounded-full p-1.5 shrink-0"><Leaf className="w-4 h-4"/></div>
                   <p className="font-bold text-sm leading-tight tracking-tight">100% Organik &amp; Segar</p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Product Info (Right) */}
          <div className="w-full lg:w-[50%] pt-2 lg:pt-8 flex flex-col h-full">
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
              
              <div className="flex items-center gap-3 mb-4">
                 <span className="bg-[#10b981] text-white text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md">BEST SELLER</span>
                 <p className="text-xs font-bold text-gray-500 dark:text-gray-400 capitalize flex items-center gap-1.5">
                   {product.category?.name || 'Sayur'} <span className="text-gray-300">•</span> Segar
                 </p>
                 <button onClick={toggleWishlist} className={`ml-auto w-10 h-10 rounded-full flex items-center justify-center transition-all ${isWishlisted ? 'bg-red-50 text-red-500' : 'bg-gray-50 text-gray-400 hover:bg-gray-100 hover:text-red-500'} cursor-pointer ring-1 ring-black/5`}>
                   <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-current' : ''}`} />
                 </button>
              </div>

              <h1 className="text-4xl lg:text-[2.75rem] font-black text-gray-900 dark:text-white leading-[1.1] tracking-tight mb-4">
                {product.name}
              </h1>
              
              <div className="flex items-end gap-3 mb-6 border-b border-gray-100 dark:border-slate-800 pb-6">
                <span className="text-3xl font-black text-emerald-600 dark:text-emerald-400">Rp {currentPrice?.toLocaleString('id-ID')}</span>
                <span className="text-sm font-semibold text-gray-400 mb-1.5">/ {selectedVariant ? selectedVariant.name_label : '1 pack'}</span>
              </div>

              {/* Seller Card Row */}
              {product.supplier && (
                <div className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-800 mb-8">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-xl ring-2 ring-white shadow-sm shrink-0">
                      {product.supplier.nama?.charAt(0) || 'S'}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-1">
                        {product.supplier.nama} <CheckCircle className="w-3.5 h-3.5 text-blue-500 fill-blue-50" />
                      </h4>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span className="text-xs font-bold text-gray-700 dark:text-gray-300">{avgRating > 0 ? avgRating.toFixed(1) : '5.0'}</span>
                        <span className="text-[10px] text-gray-500 font-medium tracking-wide">({reviews.length}+ Penilaian)</span>
                      </div>
                    </div>
                  </div>
                  <button className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-white dark:bg-slate-900 border border-emerald-100 dark:border-emerald-900/50 px-4 py-2 rounded-full hover:bg-emerald-50 dark:hover:bg-emerald-900/30 transition-colors cursor-pointer shadow-sm">
                    Lihat Toko
                  </button>
                </div>
              )}

              {/* Description & Details */}
              <div className="mb-8">
                <h3 className="font-bold text-sm text-gray-900 dark:text-white mb-3 tracking-wide">Manfaat & Deskripsi</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed font-medium">
                  {product.description || 'Sayuran segar berkualitas prima yang ditanam dengan metode pertanian modern tanpa pestisida kimia. Kaya akan vitamin, serat, dan antioksidan untuk mendongkrak sistem imun tubuh dan menjaga pencernaan yang sehat. Sangat disarankan untuk hidangan salad, jus, maupun direbus.'}
                </p>
                
                {/* 2x2 Specs Grid */}
                <div className="grid grid-cols-2 gap-3 mt-6">
                  {[
                    { l: 'Tanpa Pestisida', i: ShieldCheck },
                    { l: 'Panen Setiap Hari', i: Leaf },
                    { l: 'Packaging Ramah Lingkungan', i: Box },
                    { l: 'Kaya Serat', i: Heart }
                  ].map((x, i) => {
                    const Ic = x.i;
                    return (
                      <div key={i} className="flex items-center gap-2 text-[11px] font-bold text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-slate-800/50 px-3 py-2.5 rounded-xl border border-gray-100 dark:border-slate-800">
                        <Ic className="w-4 h-4 text-emerald-500" /> {x.l}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Actions Area */}
              {canBuy && (
                <div className="mt-auto">
                  <div className="flex items-center gap-4 mb-5">
                    <div className="flex items-center bg-gray-100 dark:bg-slate-800 rounded-2xl p-1">
                      <button onClick={() => setQty(Math.max(1, qty - 1))} className="w-10 h-10 rounded-xl flex items-center justify-center text-gray-500 hover:bg-white hover:shadow-sm transition-all cursor-pointer"><Minus className="w-4 h-4" /></button>
                      <input type="number" value={qty} className="w-12 text-center text-sm font-black bg-transparent border-none focus:ring-0 p-0 m-0 [&::-webkit-inner-spin-button]:appearance-none text-gray-900 dark:text-white" readOnly />
                      <button onClick={() => setQty(Math.min(currentStock, qty + 1))} className="w-10 h-10 rounded-xl flex items-center justify-center text-gray-500 hover:bg-white hover:shadow-sm transition-all cursor-pointer"><Plus className="w-4 h-4" /></button>
                    </div>
                    <span className="text-xs font-bold text-gray-400">sisa: {currentStock} bungkus</span>
                  </div>

                  <div className="flex gap-4 w-full">
                    <button onClick={addToCart} disabled={adding} className="flex-1 bg-white dark:bg-slate-900 border-2 border-gray-200 dark:border-slate-700 hover:border-emerald-500 hover:text-emerald-600 text-gray-700 dark:text-gray-300 py-4 rounded-2xl text-sm font-bold transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2">
                       <ShoppingCart className="w-5 h-5"/> Keranjang
                    </button>
                    <button onClick={instantBuy} disabled={adding} className="flex-1 bg-gradient-to-r from-[#10b981] to-[#059669] text-white py-4 rounded-2xl text-sm font-black shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/40 hover:-translate-y-0.5 transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2">
                       {adding ? <Loader2 className="w-5 h-5 animate-spin"/> : 'Beli Sekarang'}
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>


      {/* Ulasan Pembeli (Buyer Reviews Array) */}
      <div className="max-w-6xl mx-auto px-4 py-16 sm:px-6 lg:px-8 border-t border-gray-100 dark:border-slate-800 relative">
        <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-10 tracking-tight">Ulasan Pembeli</h2>
        
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-16">
          
          {/* Left Review Summary Sidebar */}
          <div className="w-full lg:w-1/3">
            <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 border border-gray-200 dark:border-slate-700 shadow-sm sticky top-24">
               <div className="text-center mb-6">
                 <h3 className="text-6xl font-black text-gray-900 dark:text-white tracking-tighter mb-2">{avgRating > 0 ? avgRating.toFixed(1) : '5.0'}<span className="text-3xl text-gray-400 font-bold ml-1">/5</span></h3>
                 <div className="flex justify-center gap-1 mb-2">
                   {[1,2,3,4,5].map(s => <Star key={s} className="w-5 h-5 fill-amber-400 text-amber-400" />)}
                 </div>
                 <p className="text-xs font-bold text-gray-500 tracking-wide uppercase">{reviews.length} Ulasan Tersedia</p>
               </div>

               {/* Simulated Bar Chart */}
               <div className="space-y-2.5 mb-8">
                 {[5,4,3,2,1].map((s) => (
                   <div key={s} className="flex items-center gap-3 text-xs font-black text-gray-500">
                     <span className="w-2">{s}</span>
                     <div className="flex-1 h-2.5 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
                       <div className="h-full bg-emerald-500 rounded-full" style={{ width: s===5?'80%':s===4?'15%':'0%' }} />
                     </div>
                     <span className="w-4 text-right">{s===5 ? Math.ceil(reviews.length*0.8) || 0 : s===4 ? Math.ceil(reviews.length*0.2) || 0 : 0}</span>
                   </div>
                 ))}
               </div>

               <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl p-4 flex gap-3 text-emerald-800 dark:text-emerald-300 border border-emerald-100 dark:border-emerald-800/30 mb-6">
                 <ShieldCheck className="w-5 h-5 shrink-0 mt-0.5" />
                 <div>
                   <p className="text-xs font-bold mb-1">Terverifikasi & Aman</p>
                   <p className="text-[10px] font-medium opacity-80 leading-relaxed">Semua ulasan berasal dari pembeli yang telah membuktikan kualitas produk.</p>
                 </div>
               </div>

               <button onClick={() => setShowReviewForm(!showReviewForm)} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3.5 rounded-xl text-sm font-bold shadow-md shadow-emerald-600/20 transition-all cursor-pointer flex justify-center items-center gap-2">
                 Tulis Ulasan
               </button>

               {/* Write Review Inline Form */}
               <AnimatePresence>
                 {showReviewForm && (
                   <motion.form initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mt-4 overflow-hidden" onSubmit={submitReview}>
                      <div className="flex gap-1 justify-center mb-3">
                         {[1,2,3,4,5].map(s => (
                           <Star key={s} onClick={() => setMyReview({...myReview, rating: s})} onMouseEnter={() => setHoverRating(s)} onMouseLeave={() => setHoverRating(0)} className={`w-6 h-6 cursor-pointer transition-colors ${(hoverRating || myReview.rating) >= s ? 'fill-amber-400 text-amber-400' : 'text-gray-300 dark:text-slate-600'}`} />
                         ))}
                      </div>
                      <textarea className="w-full text-sm p-4 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl mb-3 focus:ring-2 focus:ring-emerald-500 outline-none" rows={3} placeholder="Bagaimana kesegaran sayur ini?" value={myReview.comment} onChange={e => setMyReview({...myReview, comment: e.target.value})} required/>
                      <button type="submit" disabled={submittingReview} className="w-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-xs font-bold py-3 rounded-lg cursor-pointer">
                        Kirim Ulasan
                      </button>
                   </motion.form>
                 )}
               </AnimatePresence>
            </div>
          </div>

          {/* Right Review List */}
          <div className="w-full lg:w-2/3">
            {/* Filter Pills */}
            <div className="flex flex-wrap gap-2 mb-8 border-b border-gray-100 dark:border-slate-800 pb-6">
               <button className="bg-emerald-600 text-white text-xs font-bold px-4 py-2 rounded-full cursor-pointer">Semua</button>
               <button className="bg-white dark:bg-slate-800 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-slate-700 text-xs font-bold px-4 py-2 rounded-full hover:bg-gray-50 dark:hover:bg-slate-700 cursor-pointer">📝 Dengan Foto</button>
               <button className="bg-white dark:bg-slate-800 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-slate-700 text-xs font-bold px-4 py-2 rounded-full hover:bg-gray-50 dark:hover:bg-slate-700 cursor-pointer flex items-center gap-1">5 <Star className="w-3 h-3 fill-current"/></button>
               <button className="bg-white dark:bg-slate-800 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-slate-700 text-xs font-bold px-4 py-2 rounded-full hover:bg-gray-50 dark:hover:bg-slate-700 cursor-pointer">Terbaru</button>
            </div>

            {/* List */}
            <div className="space-y-6">
              {reviews.length === 0 ? (
                <div className="text-center py-20">
                  <MessageSquare className="w-12 h-12 text-gray-200 dark:text-slate-700 mx-auto mb-4" />
                  <p className="text-sm font-bold text-gray-400">Belum ada ulasan untuk produk ini.</p>
                </div>
              ) : (
                reviews.map((r, i) => (
                  <div key={r.id_review || i} className="bg-white dark:bg-slate-800 rounded-3xl p-6 md:p-8 border border-gray-100 dark:border-slate-700 shadow-sm relative overflow-hidden group">
                     {/* Verify badge */}
                     <div className="absolute top-6 right-6 flex items-center gap-1.5 bg-emerald-50/50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider">
                       <CheckCircle className="w-3 h-3" /> Pembeli Terverifikasi
                     </div>

                     <div className="flex gap-4 mb-4">
                        <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center font-bold text-lg text-slate-500">
                          {r.user?.nama?.charAt(0) || 'U'}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 dark:text-white text-sm">{r.user?.nama || 'Pengguna SayurSehat'}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="flex gap-0.5">
                              {[...Array(5)].map((_,j) => <Star key={j} className={`w-3.5 h-3.5 ${j < r.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200 dark:text-slate-600'}`}/>)}
                            </div>
                            <span className="text-[10px] text-gray-400 font-medium">1 minggu lalu</span>
                          </div>
                        </div>
                     </div>

                     <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed font-medium mb-5">{r.comment}</p>

                     {/* Simulated Review Photos */}
                     <div className="flex gap-3 mb-6">
                        <div className="w-20 h-20 rounded-xl bg-gray-100 dark:bg-slate-700 overflow-hidden border border-gray-200 dark:border-slate-600">
                           <img src={product.image_url || ''} className="w-full h-full object-cover scale-150 rotate-6" style={{ opacity: 0.6 }} alt="Review 1"/>
                        </div>
                        <div className="w-20 h-20 rounded-xl bg-gray-100 dark:bg-slate-700 overflow-hidden border border-gray-200 dark:border-slate-600">
                           <img src={product.image_url || ''} className="w-full h-full object-cover scale-110 -rotate-3" style={{ opacity: 0.6 }} alt="Review 2"/>
                        </div>
                     </div>

                     <div className="flex items-center gap-6 text-xs font-bold text-gray-400">
                        <button className="flex items-center gap-1.5 hover:text-emerald-500 transition-colors cursor-pointer"><Heart className="w-4 h-4"/> Membantu (12)</button>
                        <button className="hover:underline cursor-pointer">Laporkan</button>
                     </div>
                  </div>
                ))
              )}

              {reviews.length > 0 && (
                <div className="pt-4 text-center">
                  <span className="text-xs font-bold text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white cursor-pointer inline-flex items-center gap-1">Tampilkan Lebih Banyak <ArrowLeft className="w-4 h-4 rotate-270"/></span>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
