import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { useToast } from '../context/ToastContext';
import api from '../services/api';
import { Leaf, Plus, Eye, Zap, ShoppingCart } from 'lucide-react';
import QuickViewModal from './QuickViewModal';

export default function ProductCard({ product, index = 0 }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  
  const stockLow = product.stock > 0 && product.stock <= 5;
  const outOfStock = product.stock === 0;

  const addToCart = async (e) => {
    e.preventDefault(); e.stopPropagation();
    if (product.variants?.length > 0) return navigate(`/products/${product.id_product}`);
    if (!user) { toast.info('Silakan login untuk berbelanja'); return navigate('/login'); }
    try {
      await api.post('/cart', { id_product: product.id_product, quantity: 1 });
      toast.success(`${product.name} ditambahkan!`);
    } catch (err) { toast.error(err.response?.data?.error || 'Gagal menambahkan'); }
  };

  const instantBuy = async (e) => {
    e.preventDefault(); e.stopPropagation();
    if (product.variants?.length > 0) return navigate(`/products/${product.id_product}`);
    if (!user) { toast.info('Silakan login untuk berbelanja'); return navigate('/login'); }
    try {
      await api.post('/cart', { id_product: product.id_product, quantity: 1 });
      toast.success('Mengalihkan ke pembayaran...');
      setTimeout(() => navigate('/cart?checkout=1'), 800);
    } catch (err) { toast.error(err.response?.data?.error || 'Gagal memproses pembelian'); }
  };

  return (
    <>
    <Link
      to={`/products/${product.id_product}`}
      className="group block bg-white dark:bg-slate-800 rounded-2xl overflow-hidden border border-gray-100 dark:border-slate-700/50 shadow-sm hover:shadow-xl hover:shadow-emerald-500/10 transition-all duration-300 transform hover:-translate-y-1"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      {/* Image Container */}
      <div className="aspect-[4/3] relative overflow-hidden bg-gray-50 dark:bg-slate-900/50">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            loading="lazy"
            decoding="async"
            width="800"
            height="600"
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-emerald-200/50 dark:text-emerald-900/40 group-hover:scale-110 transition-transform duration-700">
            <Leaf className="w-12 h-12 mb-1" />
            <span className="text-[10px] font-black tracking-widest uppercase">SayurSehat</span>
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1.5 pointer-events-none">
           {stockLow && (
             <div className="bg-red-500 text-white text-[8px] font-black tracking-wider uppercase px-2 py-0.5 rounded-full shadow-lg flex items-center gap-1">
               <span className="w-1 h-1 bg-white rounded-full animate-pulse" /> Sisa {product.stock}
             </div>
           )}
           {product.id_category && product.id_category % 2 === 0 && !outOfStock && (
             <div className="bg-amber-400 text-amber-950 text-[8px] font-black tracking-wider uppercase px-2 py-0.5 rounded-full shadow-lg">
               Terlaris
             </div>
           )}
        </div>

        {outOfStock && (
          <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px] flex items-center justify-center z-10">
            <span className="bg-red-600 text-white font-black text-[9px] tracking-widest uppercase px-3 py-1 rounded-full shadow-xl rotate-[-10deg] border-2 border-red-400">
              Habis Terjual
            </span>
          </div>
        )}

        {/* Floating Action Buttons */}
        {!outOfStock && user?.role !== 'admin' && user?.role !== 'supplier' && user?.role !== 'courier' && (
          <div className="absolute bottom-2 right-2 flex flex-col gap-1.5 translate-y-12 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 z-10 pb-1">
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsQuickViewOpen(true); }}
              className="w-8 h-8 rounded-full bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm text-gray-700 dark:text-gray-300 flex items-center justify-center hover:bg-emerald-500 hover:text-white transition-colors shadow-lg cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={addToCart}
              className="w-8 h-8 rounded-full bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm text-gray-700 dark:text-gray-300 flex items-center justify-center hover:bg-emerald-500 hover:text-white transition-colors shadow-lg cursor-pointer"
            >
              <ShoppingCart className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={instantBuy}
              className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-500/30 cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5 fill-current" />
            </button>
          </div>
        )}
      </div>

      {/* Content Area */}
      <div className="p-3">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[8px] font-black tracking-widest uppercase text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-1.5 py-0.5 rounded">
            {product.category?.name || 'Organik'}
          </span>
          <div className="flex items-center gap-0.5">
            <svg className="w-2.5 h-2.5 text-amber-400 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
            <span className="text-[9px] font-bold text-gray-500 dark:text-gray-400">5.0</span>
          </div>
        </div>
        
        <h3 className="font-bold text-gray-900 dark:text-white text-xs leading-snug mb-1.5 line-clamp-2 min-h-[2rem] group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
          {product.name}
        </h3>
        
        <div className="flex items-end justify-between mt-auto pt-1.5 border-t border-gray-50 dark:border-slate-700/50">
           <div>
             {product.variants?.length > 0 && <p className="text-[8px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Mulai dari</p>}
              <p className="font-black text-sm text-emerald-600 dark:text-emerald-400">
                Rp {(product.variants?.length > 0 ? product.variants[0].price : product.price)?.toLocaleString('id-ID')}
              </p>
           </div>
           
           {/* Mini Add Button for Mobile */}
           <button onClick={addToCart} className="sm:hidden w-7 h-7 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center active:bg-emerald-500 active:text-white transition-colors cursor-pointer">
              <Plus className="w-3.5 h-3.5" />
           </button>
        </div>
      </div>
    </Link>
    <QuickViewModal product={product} isOpen={isQuickViewOpen} onClose={() => setIsQuickViewOpen(false)} />
    </>
  );
}
