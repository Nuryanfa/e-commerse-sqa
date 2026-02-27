import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function OrderDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const toast = useToast();

  const fetchOrder = () => {
    api.get(`/orders/${id}`).then(res => setOrder(res.data.data)).catch(() => navigate('/orders')).finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const pay = async () => {
    setPaying(true);
    try {
      await api.patch(`/orders/${id}/pay`);
      toast.success('Pembayaran berhasil dikonfirmasi!');
      fetchOrder();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Pembayaran gagal');
    }
    setPaying(false);
  };

  const statusColor = { PENDING: 'bg-yellow-100 text-yellow-700 border-yellow-200', PAID: 'bg-blue-100 text-blue-700 border-blue-200', SHIPPED: 'bg-purple-100 text-purple-700 border-purple-200', DELIVERED: 'bg-green-100 text-green-700 border-green-200' };

  if (loading) return <div className="max-w-4xl mx-auto px-4 py-8"><div className="bg-white rounded-2xl h-48 shimmer" /></div>;
  if (!order) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <button onClick={() => navigate(-1)} className="text-gray-500 hover:text-primary-600 mb-6 cursor-pointer font-medium hover:-translate-x-1 transition-transform inline-block">← Kembali</button>

      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm animate-fade-in-up">
        <div className="flex justify-between items-start mb-6">
          <div>
            <p className="text-sm font-mono text-gray-400">Order #{order.id_order?.slice(0, 8)}</p>
            <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">⌚ {new Date(order.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
          </div>
          <span className={`text-xs font-medium px-3 py-1.5 rounded-full border ${statusColor[order.status] || 'bg-gray-100'}`}>{order.status}</span>
        </div>

        {/* Status tracking */}
        <div className="flex items-center gap-2 mb-8 overflow-x-auto py-2">
          {['PENDING', 'PAID', 'SHIPPED', 'DELIVERED'].map((s, i) => {
            const steps = ['PENDING', 'PAID', 'SHIPPED', 'DELIVERED'];
            const currentIdx = steps.indexOf(order.status);
            const active = i <= currentIdx;
            return (
              <div key={s} className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors duration-500 ${active ? 'bg-primary-600 text-white shadow-md shadow-primary-200' : 'bg-gray-100 text-gray-400'}`}>
                  {i === 0 ? '📝' : i === 1 ? '💳' : i === 2 ? '🚚' : '✅'}
                </div>
                <span className={`text-xs whitespace-nowrap hidden sm:inline-block ${active ? 'text-primary-700 font-bold' : 'text-gray-400 font-medium'}`}>{s}</span>
                {i < 3 && <div className={`w-10 sm:w-16 h-1 rounded-full ${active ? 'bg-gradient-to-r from-primary-400 to-primary-600' : 'bg-gray-100'}`} />}
              </div>
            );
          })}
        </div>

        {/* Items */}
        <div className="space-y-3 mb-8">
          <h4 className="font-semibold text-gray-800 mb-3">Daftar Belanja</h4>
          {order.items?.map(item => (
            <div key={item.id_order_item} className="flex items-center gap-4 p-4 border border-gray-100 rounded-xl hover:bg-gray-50/50 transition-colors">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary-50 to-accent-50 flex items-center justify-center shrink-0 border border-primary-100/50">
                {item.product?.image_url ? <img src={item.product.image_url} className="w-full h-full object-cover rounded-xl" /> : <span className="text-2xl">🥬</span>}
              </div>
              <div className="flex-1">
                <p className="font-bold text-gray-800">{item.product?.name || 'Produk'}</p>
                <p className="text-sm text-gray-500">{item.quantity}x @ Rp {item.price_at_purchase?.toLocaleString('id-ID')}</p>
              </div>
              <p className="font-bold text-primary-700 text-lg">Rp {(item.price_at_purchase * item.quantity).toLocaleString('id-ID')}</p>
            </div>
          ))}
        </div>

        <div className="border-t border-gray-100 pt-6 flex justify-between items-center bg-gray-50 -mx-6 -mb-6 p-6 rounded-b-2xl">
          <p className="text-gray-500 font-medium uppercase tracking-wider text-sm">Total Pembayaran</p>
          <p className="text-3xl font-extrabold text-primary-700">Rp {order.total_amount?.toLocaleString('id-ID')}</p>
        </div>
      </div>

      {order.status === 'PENDING' && user?.role === 'pembeli' && (
        <button onClick={pay} disabled={paying} className="w-full mt-6 bg-gradient-to-r from-primary-600 to-accent-600 text-white py-4 rounded-2xl font-bold text-lg hover:shadow-xl hover:shadow-primary-200 transition-all duration-300 hover:-translate-y-1 disabled:opacity-70 disabled:hover:translate-y-0 cursor-pointer flex justify-center items-center gap-2">
          {paying ? <span className="animate-spin">⏳</span> : '💳'} {paying ? 'Memproses Pembayaran...' : 'Bayar Sekarang'}
        </button>
      )}
    </div>
  );
}
