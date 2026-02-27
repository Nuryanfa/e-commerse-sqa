import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/orders').then(res => setOrders(res.data.data || [])).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const statusBadge = (s) => {
    const m = { PENDING: 'bg-yellow-100 text-yellow-700', PAID: 'bg-blue-100 text-blue-700', SHIPPED: 'bg-purple-100 text-purple-700', DELIVERED: 'bg-green-100 text-green-700' };
    return m[s] || 'bg-gray-100 text-gray-600';
  };

  if (loading) return <div className="max-w-4xl mx-auto px-4 py-8"><div className="bg-white rounded-2xl h-48 animate-pulse" /></div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">📦 Pesanan Saya</h1>
      {orders.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <p className="text-gray-500 mb-4">Belum ada pesanan</p>
          <Link to="/products" className="text-primary-600 font-medium">Mulai Belanja →</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map(o => (
            <Link key={o.id_order} to={`/orders/${o.id_order}`} className="block bg-white rounded-xl border border-gray-100 p-5 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-400 font-mono">#{o.id_order?.slice(0, 8)}</p>
                  <p className="font-bold text-primary-700 text-lg mt-1">Rp {o.total_amount?.toLocaleString('id-ID')}</p>
                  <p className="text-xs text-gray-400 mt-1">{new Date(o.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                </div>
                <span className={`text-xs font-medium px-3 py-1 rounded-full ${statusBadge(o.status)}`}>{o.status}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
