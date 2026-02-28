import { useState, useEffect } from 'react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { useModal } from '../../context/ModalContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Truck, Package, CheckCircle, ListTodo, Box, CreditCard, Loader2 } from 'lucide-react';

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
    PAID: { bg: 'bg-blue-100 text-blue-700 border-blue-200', icon: <CreditCard className="w-5 h-5" /> },
    SHIPPED: { bg: 'bg-purple-100 text-purple-700 border-purple-200', icon: <Truck className="w-5 h-5" /> },
    DELIVERED: { bg: 'bg-green-100 text-green-700 border-green-200', icon: <CheckCircle className="w-5 h-5" /> },
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
        <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-purple-200">
          <Truck className="w-7 h-7" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Dashboard Kurir</h1>
          <p className="text-gray-400 text-sm">Ambil dan antar pesanan pelanggan</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { icon: <ListTodo className="w-5 h-5" />, label: 'Tersedia', value: available.length, color: 'from-blue-500 to-cyan-600' },
          { icon: <Truck className="w-5 h-5" />, label: 'Sedang Kirim', value: shippedOrders.length, color: 'from-purple-500 to-indigo-600' },
          { icon: <CheckCircle className="w-5 h-5" />, label: 'Terkirim', value: deliveredOrders.length, color: 'from-green-500 to-emerald-600' },
          { icon: <Package className="w-5 h-5" />, label: 'Total', value: myOrders.length, color: 'from-amber-500 to-orange-600' },
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
          { key: 'available', label: `Tersedia (${available.length})`, hasNew: available.length > 0, icon: <ListTodo className="w-4 h-4 inline mr-1.5" /> },
          { key: 'active', label: `Sedang Kirim (${shippedOrders.length})`, icon: <Truck className="w-4 h-4 inline mr-1.5" /> },
          { key: 'done', label: `Selesai (${deliveredOrders.length})`, icon: <CheckCircle className="w-4 h-4 inline mr-1.5" /> },
        ].map(t => (
          <button 
            key={t.key} 
            onClick={() => setTab(t.key)} 
            className={`relative px-4 py-2.5 rounded-xl font-medium text-sm cursor-pointer transition-colors duration-300 ${tab === t.key ? 'text-white' : 'text-gray-600 hover:text-purple-600'}`}
          >
            {tab === t.key && (
              <motion.div 
                layoutId="courierTabIndicator" 
                className="absolute inset-0 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl shadow-md shadow-purple-200 -z-10" 
                transition={{ type: 'spring', stiffness: 300, damping: 30 }} 
              />
            )}
            <span className="relative z-10 flex items-center">{t.icon}{t.label}</span>
            {t.hasNew && tab !== t.key && <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse-soft z-20" />}
          </button>
        ))}
      </div>

      {/* Available Orders */}
      {tab === 'available' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
          {available.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center flex flex-col items-center">
              <Box className="w-16 h-16 text-gray-300 mb-4 animate-float" />
              <p className="text-gray-400 font-medium">Tidak ada pesanan tersedia saat ini</p>
              <p className="text-gray-300 text-sm mt-1">Cek lagi nanti ya!</p>
            </div>
          ) : (
            available.map((o, i) => (
              <div key={o.id_order} className={`bg-white rounded-xl border border-gray-100 p-5 card-hover animate-fade-in-up stagger-${Math.min(i + 1, 8)} group`}>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300"><CreditCard className="w-6 h-6 text-blue-500" /></div>
                    <div>
                      <p className="text-sm font-mono text-gray-400">#{o.id_order?.slice(0, 8)}</p>
                      <p className="font-bold text-lg text-gray-800">Rp {o.total_amount?.toLocaleString('id-ID')}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{o.items?.length || 0} item • {new Date(o.created_at).toLocaleDateString('id-ID')}</p>
                    </div>
                  </div>
                  <button onClick={() => ship(o.id_order)} disabled={shipping === o.id_order} className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:shadow-lg hover:shadow-purple-200 transition-all duration-300 hover:-translate-y-0.5 cursor-pointer disabled:opacity-50 inline-flex items-center gap-2">
                    {shipping === o.id_order ? <Loader2 className="w-4 h-4 animate-spin" /> : <Package className="w-4 h-4" />} {shipping === o.id_order ? 'Mengambil...' : 'Ambil & Kirim'}
                  </button>
                </div>
              </div>
            ))
          )}
        </motion.div>
      )}

      {/* Active / Shipped Orders */}
      {tab === 'active' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
          {shippedOrders.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center flex flex-col items-center">
              <Truck className="w-16 h-16 text-gray-300 mb-4 animate-float" />
              <p className="text-gray-400">Tidak ada pengiriman aktif</p>
            </div>
          ) : (
            shippedOrders.map((o, i) => (
              <div key={o.id_order} className={`bg-white rounded-xl border-2 border-purple-100 p-5 card-hover animate-fade-in-up stagger-${Math.min(i + 1, 8)} group`}>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600 animate-pulse-soft"><Truck className="w-6 h-6" /></div>
                    <div>
                      <p className="text-sm font-mono text-gray-400">#{o.id_order?.slice(0, 8)}</p>
                      <p className="font-bold text-purple-700">Rp {o.total_amount?.toLocaleString('id-ID')}</p>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full border flex items-center gap-1 mt-1 ${statusConfig.SHIPPED.bg}`}><Truck className="w-3 h-3" /> Sedang Dikirim</span>
                    </div>
                  </div>
                  <button onClick={() => deliver(o.id_order)} disabled={delivering === o.id_order} className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:shadow-lg hover:shadow-green-200 transition-all duration-300 hover:-translate-y-0.5 cursor-pointer disabled:opacity-50 inline-flex items-center gap-2">
                    {delivering === o.id_order ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />} {delivering === o.id_order ? 'Menandai...' : 'Tandai Terkirim'}
                  </button>
                </div>
              </div>
            ))
          )}
        </motion.div>
      )}

      {/* Done / Delivered */}
      {tab === 'done' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
          {deliveredOrders.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center flex flex-col items-center">
              <CheckCircle className="w-16 h-16 text-gray-300 mb-4 animate-bounce-in" />
              <p className="text-gray-400">Belum ada pengiriman selesai</p>
            </div>
          ) : (
            deliveredOrders.map((o, i) => (
              <div key={o.id_order} className={`bg-white rounded-xl border border-green-100 p-5 animate-fade-in-up stagger-${Math.min(i + 1, 8)}`}>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center text-green-500"><CheckCircle className="w-6 h-6" /></div>
                    <div>
                      <p className="text-sm font-mono text-gray-400">#{o.id_order?.slice(0, 8)}</p>
                      <p className="font-bold text-green-700">Rp {o.total_amount?.toLocaleString('id-ID')}</p>
                    </div>
                  </div>
                  <span className={`text-xs font-medium px-3 py-1.5 rounded-full border flex items-center gap-1 ${statusConfig.DELIVERED.bg}`}><CheckCircle className="w-3 h-3" /> Terkirim</span>
                </div>
              </div>
            ))
          )}
        </motion.div>
      )}
    </div>
  );
}
