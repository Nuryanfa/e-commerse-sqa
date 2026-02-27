import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import { useModal } from '../context/ModalContext';

export default function Cart() {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const toast = useToast();
  const modal = useModal();

  const fetchCart = () => {
    setLoading(true);
    api.get('/cart').then(res => setCart(res.data.data || { items: [] })).catch((err) => {
      toast.error(err.response?.data?.error || 'Gagal memuat keranjang');
      setCart({ items: [] }); // Ensure cart is not null on error
    }).finally(() => setLoading(false));
  };
  useEffect(() => {
    fetchCart();
  }, []);

  const updateQty = async (id_product, qty) => {
    if (qty < 1) return remove(id_product);
    try {
      await api.post('/cart', { id_product, quantity: qty });
      fetchCart();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Gagal mengubah jumlah');
    }
  };

  const remove = (id_product) => {
    modal.confirm({
      title: 'Hapus Item',
      message: 'Apakah Anda yakin ingin menghapus sayuran ini dari keranjang?',
      type: 'danger',
      confirmText: 'Hapus',
      onConfirm: async () => {
        try {
          await api.delete(`/cart/${id_product}`);
          toast.success('Sayuran dihapus dari keranjang');
          fetchCart();
        } catch (err) {
          toast.error(err.response?.data?.error || 'Gagal menghapus item');
        }
      }
    });
  };

  const checkout = async () => {
    try {
      const res = await api.post('/orders/checkout');
      toast.success('Pesanan berhasil dibuat!');
      navigate(`/orders/${res.data.id_order}`);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Gagal membuat pesanan');
    }
  };

  const total = cart?.items?.reduce((sum, i) => sum + (i.product?.price || 0) * i.quantity, 0) || 0;

  if (loading) return <div className="max-w-4xl mx-auto px-4 py-8"><div className="bg-white rounded-2xl h-64 animate-pulse" /></div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">🛒 Keranjang Belanja</h1>

      {items.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <span className="text-5xl block mb-4">🛒</span>
          <p className="text-gray-500 mb-4">Keranjang Anda kosong</p>
          <Link to="/products" className="text-primary-600 font-medium hover:text-primary-700">Mulai Belanja →</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map(item => (
            <div key={item.id_cart_item} className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-4">
              <div className="w-16 h-16 rounded-lg bg-primary-50 flex items-center justify-center shrink-0">
                {item.product?.image_url ? <img src={item.product.image_url} alt="" className="w-full h-full object-cover rounded-lg" /> : <span className="text-2xl">🥬</span>}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-gray-800 truncate">{item.product?.name || 'Produk'}</h3>
                <p className="text-primary-600 font-semibold">Rp {item.product?.price?.toLocaleString('id-ID')}</p>
              </div>
              <div className="flex items-center border border-gray-200 rounded-lg">
                <button onClick={() => updateQty(item.id_cart_item, Math.max(1, item.quantity - 1))} className="px-2 py-1 hover:bg-gray-50 cursor-pointer">−</button>
                <span className="px-3 py-1 text-sm font-medium">{item.quantity}</span>
                <button onClick={() => updateQty(item.id_cart_item, item.quantity + 1)} className="px-2 py-1 hover:bg-gray-50 cursor-pointer">+</button>
              </div>
              <p className="font-semibold text-gray-700 w-28 text-right">Rp {((item.product?.price || 0) * item.quantity).toLocaleString('id-ID')}</p>
              <button onClick={() => remove(item.id_cart_item)} className="text-red-400 hover:text-red-600 cursor-pointer">✕</button>
            </div>
          ))}

          <div className="bg-white rounded-xl border border-gray-100 p-6 flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total ({items.length} item)</p>
              <p className="text-2xl font-bold text-primary-700">Rp {total.toLocaleString('id-ID')}</p>
            </div>
            <button onClick={checkout} className="bg-primary-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-primary-700 transition-colors cursor-pointer">Checkout</button>
          </div>
        </div>
      )}
    </div>
  );
}
