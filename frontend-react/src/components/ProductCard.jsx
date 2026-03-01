import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../services/api';
import { Leaf, Plus, Eye } from 'lucide-react';
import QuickViewModal from './QuickViewModal';

export default function ProductCard({ product, index = 0 }) {
  const { user } = useAuth();
  const toast = useToast();
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  const stockLow = product.stock > 0 && product.stock < 5;
  const outOfStock = product.stock === 0;

  const addToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      toast.info('Silakan login untuk berbelanja');
      return;
    }
    try {
      await api.post('/cart', { id_product: product.id_product, quantity: 1 });
      toast.success(`${product.name} ditambahkan ke keranjang!`);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Gagal menambahkan');
    }
  };

  const openQuickView = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsQuickViewOpen(true);
  };

  return (
    <>
    <Link
      to={`/products/${product.id_product}`}
      className={`group block card-organic overflow-hidden animate-fade-in-up stagger-${Math.min(index + 1, 8)}`}
    >
      {/* Image area */}
      <div className="aspect-square relative overflow-hidden flex items-center justify-center" style={{ background: 'var(--surface-muted)' }}>
        {product.image_url ? (
          <img src={product.image_url} alt={product.name} className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500 ease-out" />
        ) : (
          <Leaf className="w-16 h-16 text-emerald-500 opacity-50 group-hover:scale-110 transition-transform duration-500" />
        )}

        {/* Low stock pulse badge */}
        {stockLow && (
          <div className="absolute top-3 left-3 bg-red-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full badge-stock flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse-soft" />
            Sisa {product.stock} kg!
          </div>
        )}
        {outOfStock && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-[2px]">
            <span className="text-white font-bold text-sm px-4 py-1.5 rounded-full bg-red-500/90">Habis</span>
          </div>
        )}

        {/* Hover action buttons */}
        {!outOfStock && user?.role !== 'admin' && user?.role !== 'supplier' && user?.role !== 'courier' && (
          <div className="absolute bottom-3 right-3 flex flex-col gap-2 translate-y-[150%] opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 ease-out z-10">
            <button
              onClick={openQuickView}
              className="w-10 h-10 rounded-full bg-white text-gray-700 flex items-center justify-center shadow-lg hover:text-emerald-600 hover:scale-110 active:scale-95 transition-all cursor-pointer"
              title="Lihat Cepat"
            >
              <Eye className="w-5 h-5" />
            </button>
            <button
              onClick={addToCart}
              className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-lg hover:bg-emerald-700 hover:scale-110 hover:shadow-emerald-500/30 active:scale-95 transition-all cursor-pointer"
              title="Tambah ke Keranjang"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        {product.category && (
          <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-accent)' }}>{product.category.name}</span>
        )}
        <h3 className="text-base font-bold mt-0.5 mb-1.5 truncate group-hover:text-emerald-600 transition-colors duration-300" style={{ color: 'var(--text-heading)' }}>
          {product.name}
        </h3>
        <p className="text-xl font-black" style={{ color: 'var(--text-accent)' }}>
          Rp {product.price?.toLocaleString('id-ID')}
        </p>
      </div>
    </Link>
    <QuickViewModal 
      product={product} 
      isOpen={isQuickViewOpen} 
      onClose={() => setIsQuickViewOpen(false)} 
    />
    </>
  );
}
