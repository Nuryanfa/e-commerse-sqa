import { useState, useEffect } from 'react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { useModal } from '../../context/ModalContext';

export default function CourierDashboard() {
  const [available, setAvailable] = useState([]);
  const [myOrders, setMyOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('available');
  const [shipping, setShipping] = useState(null);
  const [delivering, setDelivering] = useState(null);
  const toast = useToast();
  const modal = useModal();

  const fetchData = () => {
    setLoading(true);
    Promise.all([
      api.get('/courier/available'),
      api.get('/courier/my-orders'),
    ]).then(([a, m]) => {
      setAvailable(a.data.data || []);
      setMyOrders(m.data.data || []);
    }).catch(() => {}).finally(() => setLoading(false));
  };
  useEffect(fetchData, []);

  const ship = async (id) => {
    setShipping(id);
    try { 
      await api.post(`/courier/orders/${id}/ship`); 
      toast.success('Pesanan berhasil diambil untuk dikirim');
      fetchData(); 
    } catch (err) { 
      toast.error(err.response?.data?.error || 'Gagal mengambil pesanan'); 
    }
    setShipping(null);
  };

  const deliver = (id) => {
    modal.confirm({
      title: 'Tandai Selesai',
      message: 'Apakah Anda yakin pesanan ini telah diterima oleh pembeli?',
      type: 'success',
      confirmText: 'Ya, Terkirim',
      onConfirm: async () => {
        setDelivering(id);
        try { 
          await api.patch(`/courier/orders/${id}/deliver`); 
          toast.success('Pesanan ditandai sebagai terkirim');
          fetchData(); 
        } catch (err) { 
          toast.error(err.response?.data?.error || 'Gagal menandai selesai'); 
        }
        setDelivering(null);
      }
    });
  };

  const statusConfig = {
    PAID: { bg: 'bg-blue-100 text-blue-700 border-blue-200', icon: '💳' },
    SHIPPED: { bg: 'bg-purple-100 text-purple-700 border-purple-200', icon: '🚚' },
    DELIVERED: { bg: 'bg-green-100 text-green-700 border-green-200', icon: '✅' },
  };

  const shippedOrders = myOrders.filter(o => o.status === 'SHIPPED');
  const deliveredOrders = myOrders.filter(o => o.status === 'DELIVERED');

  if (loading) return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="grid grid-cols-2 gap-4 mb-8">{[...Array(4)].map((_, i) => <div key={i} className="h-28 rounded-2xl shimmer" />)}</div>
      <div className="h-64 rounded-2xl shimmer" />
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8 animate-fade-in-up">
        <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white text-2xl shadow-lg shadow-purple-200">🚚</div>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Dashboard Kurir</h1>
          <p className="text-gray-400 text-sm">Ambil dan antar pesanan pelanggan</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { icon: '📬', label: 'Tersedia', value: available.length, color: 'from-blue-500 to-cyan-600' },
          { icon: '🚚', label: 'Sedang Kirim', value: shippedOrders.length, color: 'from-purple-500 to-indigo-600' },
          { icon: '✅', label: 'Terkirim', value: deliveredOrders.length, color: 'from-green-500 to-emerald-600' },
          { icon: '📦', label: 'Total', value: myOrders.length, color: 'from-amber-500 to-orange-600' },
        ].map((s, i) => (
          <div key={i} className={`stat-card bg-white rounded-2xl p-5 border border-gray-100 card-hover animate-fade-in-up stagger-${i + 1} group cursor-default`}>
            <div className={`w-10 h-10 bg-gradient-to-br ${s.color} rounded-xl flex items-center justify-center text-white text-sm mb-2 shadow-sm group-hover:scale-110 transition-transform duration-300`}>{s.icon}</div>
            <p className="text-2xl font-bold text-gray-800">{s.value}</p>
            <p className="text-xs text-gray-400">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 animate-fade-in-up">
        {[
          { key: 'available', label: `📬 Tersedia (${available.length})`, hasNew: available.length > 0 },
          { key: 'active', label: `🚚 Sedang Kirim (${shippedOrders.length})` },
          { key: 'done', label: `✅ Selesai (${deliveredOrders.length})` },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} className={`relative px-4 py-2.5 rounded-xl font-medium text-sm cursor-pointer transition-all duration-300 ${tab === t.key ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-200' : 'bg-white text-gray-600 border border-gray-100 hover:border-purple-200 hover:text-purple-600'}`}>
            {t.label}
            {t.hasNew && tab !== t.key && <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse-soft" />}
          </button>
        ))}
      </div>

      {/* Available Orders */}
      {tab === 'available' && (
        <div className="space-y-3 animate-fade-in">
          {available.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
              <span className="text-5xl block mb-3 animate-float">📭</span>
              <p className="text-gray-400 font-medium">Tidak ada pesanan tersedia saat ini</p>
              <p className="text-gray-300 text-sm mt-1">Cek lagi nanti ya!</p>
            </div>
          ) : (
            available.map((o, i) => (
              <div key={o.id_order} className={`bg-white rounded-xl border border-gray-100 p-5 card-hover animate-fade-in-up stagger-${Math.min(i + 1, 8)} group`}>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-xl group-hover:scale-110 transition-transform duration-300">💳</div>
                    <div>
                      <p className="text-sm font-mono text-gray-400">#{o.id_order?.slice(0, 8)}</p>
                      <p className="font-bold text-lg text-gray-800">Rp {o.total_amount?.toLocaleString('id-ID')}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{o.items?.length || 0} item • {new Date(o.created_at).toLocaleDateString('id-ID')}</p>
                    </div>
                  </div>
                  <button onClick={() => ship(o.id_order)} disabled={shipping === o.id_order} className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:shadow-lg hover:shadow-purple-200 transition-all duration-300 hover:-translate-y-0.5 cursor-pointer disabled:opacity-50 inline-flex items-center gap-2">
                    {shipping === o.id_order ? <span className="animate-spin">⏳</span> : '📦'} {shipping === o.id_order ? 'Mengambil...' : 'Ambil & Kirim'}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Active / Shipped Orders */}
      {tab === 'active' && (
        <div className="space-y-3 animate-fade-in">
          {shippedOrders.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
              <span className="text-5xl block mb-3 animate-float">🚚</span>
              <p className="text-gray-400">Tidak ada pengiriman aktif</p>
            </div>
          ) : (
            shippedOrders.map((o, i) => (
              <div key={o.id_order} className={`bg-white rounded-xl border-2 border-purple-100 p-5 card-hover animate-fade-in-up stagger-${Math.min(i + 1, 8)} group`}>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center text-xl animate-pulse-soft">🚚</div>
                    <div>
                      <p className="text-sm font-mono text-gray-400">#{o.id_order?.slice(0, 8)}</p>
                      <p className="font-bold text-purple-700">Rp {o.total_amount?.toLocaleString('id-ID')}</p>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${statusConfig.SHIPPED.bg}`}>🚚 Sedang Dikirim</span>
                    </div>
                  </div>
                  <button onClick={() => deliver(o.id_order)} disabled={delivering === o.id_order} className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:shadow-lg hover:shadow-green-200 transition-all duration-300 hover:-translate-y-0.5 cursor-pointer disabled:opacity-50 inline-flex items-center gap-2">
                    {delivering === o.id_order ? <span className="animate-spin">⏳</span> : '✅'} {delivering === o.id_order ? 'Menandai...' : 'Tandai Terkirim'}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Done / Delivered */}
      {tab === 'done' && (
        <div className="space-y-3 animate-fade-in">
          {deliveredOrders.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
              <span className="text-5xl block mb-3 animate-bounce-in">✅</span>
              <p className="text-gray-400">Belum ada pengiriman selesai</p>
            </div>
          ) : (
            deliveredOrders.map((o, i) => (
              <div key={o.id_order} className={`bg-white rounded-xl border border-green-100 p-5 animate-fade-in-up stagger-${Math.min(i + 1, 8)}`}>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center text-xl">✅</div>
                    <div>
                      <p className="text-sm font-mono text-gray-400">#{o.id_order?.slice(0, 8)}</p>
                      <p className="font-bold text-green-700">Rp {o.total_amount?.toLocaleString('id-ID')}</p>
                    </div>
                  </div>
                  <span className={`text-xs font-medium px-3 py-1.5 rounded-full border ${statusConfig.DELIVERED.bg}`}>✅ Terkirim</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
