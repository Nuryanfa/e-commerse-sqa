import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function ProductDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const toast = useToast();

  useEffect(() => {
    api.get(`/products/${id}`).then(res => setProduct(res.data.data)).catch(() => navigate('/products')).finally(() => setLoading(false));
  }, [id]);

  const addToCart = async () => {
    if (!user) {
      toast.info('Silakan login terlebih dahulu untuk mulai berbelanja.');
      navigate('/login');
      return;
    }
    setAdding(true);
    try {
      await api.post('/cart', { id_product: id, quantity: qty });
      toast.success('Sayuran berhasil ditambahkan ke keranjang!');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Gagal menambahkan ke keranjang');
    }
    setAdding(false);
  };

  if (loading) return <div className="max-w-4xl mx-auto px-4 py-16"><div className="bg-white rounded-2xl h-96 animate-pulse" /></div>;
  if (!product) return null;

  const stockColor = product.stock > 10 ? 'text-green-600' : product.stock > 0 ? 'text-yellow-600' : 'text-red-600';

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <button onClick={() => navigate(-1)} className="text-gray-500 hover:text-primary-600 mb-6 inline-flex items-center gap-1 cursor-pointer">← Kembali</button>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2">
          <div className="aspect-square bg-gradient-to-br from-primary-50 to-accent-50 flex items-center justify-center">
            {product.image_url ? <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" /> : <span className="text-[100px]">🥬</span>}
          </div>
          <div className="p-8 flex flex-col justify-between">
            <div>
              {product.category && <span className="text-xs bg-primary-100 text-primary-700 px-3 py-1 rounded-full font-medium">{product.category.name}</span>}
              <h1 className="text-2xl font-bold text-gray-800 mt-3 mb-2">{product.name}</h1>
              <p className="text-gray-500 text-sm mb-4">{product.description || 'Sayur segar berkualitas tinggi.'}</p>
              <p className="text-3xl font-bold text-primary-700 mb-2">Rp {product.price?.toLocaleString('id-ID')}</p>
              <p className={`text-sm font-medium ${stockColor}`}>Stok: {product.stock > 0 ? product.stock + ' unit' : 'Habis'}</p>
            </div>

            {product.stock > 0 && user?.role !== 'admin' && user?.role !== 'supplier' && user?.role !== 'courier' && (
              <div className="mt-6">
                <div className="flex items-center gap-3 mb-4">
                  <label className="text-sm text-gray-600">Jumlah:</label>
                  <div className="flex items-center border border-gray-200 rounded-lg">
                    <button onClick={() => setQty(Math.max(1, qty - 1))} className="px-3 py-2 hover:bg-gray-50 transition-colors cursor-pointer">−</button>
                    <span className="px-4 py-2 font-medium">{qty}</span>
                    <button onClick={() => setQty(Math.min(product.stock, qty + 1))} className="px-3 py-2 hover:bg-gray-50 transition-colors cursor-pointer">+</button>
                  </div>
                </div>
                <button onClick={addToCart} disabled={adding} className="w-full bg-primary-600 text-white py-3 rounded-xl font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50 cursor-pointer">
                  {adding ? 'Menambahkan...' : '🛒 Tambah ke Keranjang'}
                </button>
                {msg && <p className="text-sm mt-3 text-center">{msg}</p>}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
