import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../services/api';
import { Leaf, Plus, Eye, Zap } from 'lucide-react';
import QuickViewModal from './QuickViewModal';

export default function ProductCard({ product, index = 0 }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  const stockLow = product.stock > 0 && product.stock < 5;
  const outOfStock = product.stock === 0;

  const addToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.variants?.length > 0) {
      navigate(`/products/${product.id_product}`);
      return;
    }
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

  const instantBuy = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.variants?.length > 0) {
      navigate(`/products/${product.id_product}`);
      return;
    }
    if (!user) {
      toast.info('Silakan login untuk berbelanja');
      return;
    }
    try {
      const res = await api.post('/orders/instant-checkout', { product_id: product.id_product, quantity: 1 });
      toast.success('Pesanan Instan Dibuat!');
      setTimeout(() => {
        if (res.data?.order?.payment_url) {
          window.location.href = res.data.order.payment_url;
        }
      }, 1000);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Gagal memproses pembelian');
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
      className={`group product-card block animate-fade-in-up stagger-${Math.min(index + 1, 8)}`}
      style={{ textDecoration: 'none' }}
    >
      {/* Image area */}
      <div className="image-wrap relative">
        {product.image_url ? (
          <img src={product.image_url} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out" />
        ) : (
          <Leaf className="w-16 h-16 text-emerald-500 opacity-50 group-hover:scale-110 transition-transform duration-500" />
        )}

        {/* Low stock badge */}
        {stockLow && (
          <div className="absolute top-3 left-3 text-[10px] font-bold px-3 py-1 rounded-full flex items-center gap-1" style={{ background: 'var(--md-primary)', color: 'var(--md-on-primary)', fontFamily: 'var(--font-display)' }}>
            <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
            Sisa {product.stock}
          </div>
        )}
        {outOfStock && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-[2px]">
            <span className="text-white font-bold text-xs px-4 py-1.5 rounded-full bg-red-500/90 tracking-widest uppercase">Habis</span>
          </div>
        )}

        {/* Hover action buttons */}
        {!outOfStock && user?.role !== 'admin' && user?.role !== 'supplier' && user?.role !== 'courier' && (
          <div className="absolute bottom-3 right-3 flex flex-col gap-2 translate-y-[150%] opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-400 ease-out z-10">
            <button onClick={openQuickView} style={{ width: '2.25rem', height: '2.25rem', borderRadius: 'var(--radius-md)', background: 'var(--surface-container-lowest)', color: 'var(--on-surface)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-md)', transition: 'transform 0.2s ease' }} onMouseOver={e=>e.currentTarget.style.transform='scale(1.1)'} onMouseOut={e=>e.currentTarget.style.transform='scale(1)'} title="Lihat Cepat">
              <Eye className="w-4 h-4" />
            </button>
            <button onClick={addToCart} style={{ width: '2.25rem', height: '2.25rem', borderRadius: 'var(--radius-md)', background: 'var(--md-primary)', color: 'white', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-md)', transition: 'transform 0.2s ease' }} onMouseOver={e=>e.currentTarget.style.transform='scale(1.1)'} onMouseOut={e=>e.currentTarget.style.transform='scale(1)'} title="Tambah ke Keranjang">
              <Plus className="w-4 h-4" />
            </button>
            <button onClick={instantBuy} style={{ width: '2.25rem', height: '2.25rem', borderRadius: 'var(--radius-md)', background: 'var(--inverse-surface)', color: 'var(--inverse-on-surface)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-md)', transition: 'transform 0.2s ease' }} onMouseOver={e=>e.currentTarget.style.transform='scale(1.1)'} onMouseOut={e=>e.currentTarget.style.transform='scale(1)'} title="Beli Langsung">
              <Zap className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Info */}
      <div style={{ padding: '1rem 1.25rem' }}>
        {product.category && (
          <p className="label-sm mb-1">{product.category.name}</p>
        )}
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-heading)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: '0.6rem' }}>
          {product.name}
        </h3>
        <p style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.05rem', color: 'var(--md-primary)' }}>
          {product.variants?.length > 0 ? <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--outline)', marginRight: '0.25rem' }}>Mulai</span> : ''}
          Rp {(product.variants?.length > 0 ? product.variants[0].price : product.price)?.toLocaleString('id-ID')}
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
