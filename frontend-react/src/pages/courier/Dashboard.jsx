import { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/useAuth';
import { useToast } from '../../context/ToastContext';
import { useModal } from '../../context/ModalContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Truck, Package, CheckCircle, ListTodo, Box, CreditCard, Loader2, ShieldAlert, MapPin, Calendar, Clock, ArrowRight } from 'lucide-react';

export default function CourierDashboard() {
  const { user } = useAuth();
  const [available, setAvailable] = useState([]);
  const [myOrders, setMyOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('available');
  const [shipping, setShipping] = useState(null);
  const [delivering, setDelivering] = useState(null);
  const [returnDisputes, setReturnDisputes] = useState([]);
  const [returnActioning, setReturnActioning] = useState(null);
  const toast = useToast();
  const modal = useModal();

  const fetchData = () => {
    setLoading(true);
    Promise.all([
      api.get('/courier/available'),
      api.get('/courier/my-orders'),
      api.get('/disputes')
    ]).then(([a, m, d]) => {
      setAvailable(Array.isArray(a.data.data) ? a.data.data : (a.data.data?.data || []));
      setMyOrders(Array.isArray(m.data.data) ? m.data.data : (m.data.data?.data || []));
      setReturnDisputes(Array.isArray(d.data.data) ? d.data.data : (d.data.data?.data || []));
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
      title: 'Konfirmasi Pengiriman',
      message: 'Apakah Anda yakin pesanan ini telah diterima dengan baik oleh pembeli?',
      type: 'success',
      confirmText: 'Ya, Tandai Terkirim',
      onConfirm: async () => {
        setDelivering(id);
        try { 
          await api.patch(`/courier/orders/${id}/deliver`); 
          toast.success('Luar biasa! Pesanan berhasil diantarkan.');
          fetchData(); 
        } catch (err) { 
          toast.error(err.response?.data?.error || 'Gagal menandai selesai'); 
        }
        setDelivering(null);
      }
    });
  };

  const pickupReturn = async (id) => {
    setReturnActioning(id);
    try {
      await api.post(`/courier/disputes/${id}/pickup`);
      toast.success('Berhasil mengambil tugas retur barang dari Pembeli');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Gagal mengambil tugas retur');
    }
    setReturnActioning(null);
  }

  const deliverReturn = async (id) => {
    setReturnActioning(id);
    try {
      await api.post(`/courier/disputes/${id}/deliver`);
      toast.success('Barang retur sukses dikembalikan ke Toko');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Gagal menyerahkan barang retur');
    }
    setReturnActioning(null);
  }

  const shippedOrders = myOrders.filter(o => o.status === 'SHIPPED');
  const deliveredOrders = myOrders.filter(o => o.status === 'DELIVERED');
  const activeReturns = returnDisputes.filter(d => d.status === 'APPROVED_FOR_RETURN' || d.status === 'RETURNING');

  if (loading) return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="h-32 mb-8 skeleton rounded-3xl" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">{[...Array(4)].map((_, i) => <div key={i} className="h-32 rounded-3xl skeleton" />)}</div>
      <div className="h-64 rounded-3xl skeleton" />
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      {/* Premium Hero Header */}
      <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-slate-900 to-slate-800 p-8 sm:p-10 mb-8 border border-slate-700 shadow-2xl shadow-slate-900/20 isolate animate-fade-in-up">
        {/* Decorative BG */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse-slow" />
        <div className="absolute -bottom-24 left-1/2 w-64 h-64 bg-emerald-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20 shadow-inner">
              <Truck className="w-8 h-8 text-indigo-300" />
            </div>
            <div>
              <p className="text-indigo-200 font-medium text-sm tracking-wide uppercase mb-1">Terminal Operasional Kurir</p>
              <h1 className="text-3xl font-black text-white tracking-tight">Halo, {user?.nama || 'Mitra'}!</h1>
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-md border border-white/20 px-6 py-3 rounded-2xl">
            <p className="text-xs text-indigo-200 uppercase font-black tracking-widest mb-0.5">Pendapatan Hari Ini</p>
            <p className="text-xl font-bold text-white font-mono break-all">+Rp {(deliveredOrders.length * 15000).toLocaleString('id-ID')}</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-10">
        {[
          { icon: ListTodo, label: 'Tersedia', value: available.length, bg: 'bg-blue-50 dark:bg-blue-900/20', textColor: 'text-blue-600 dark:text-blue-400', border: 'border-blue-100 dark:border-blue-800' },
          { icon: Truck, label: 'Sedang Diantar', value: shippedOrders.length, bg: 'bg-indigo-50 dark:bg-indigo-900/20', textColor: 'text-indigo-600 dark:text-indigo-400', border: 'border-indigo-100 dark:border-indigo-800' },
          { icon: CheckCircle, label: 'Selesai', value: deliveredOrders.length, bg: 'bg-emerald-50 dark:bg-emerald-900/20', textColor: 'text-emerald-600 dark:text-emerald-400', border: 'border-emerald-100 dark:border-emerald-800' },
          { icon: ShieldAlert, label: 'Retur Aktif', value: activeReturns.length, bg: 'bg-rose-50 dark:bg-rose-900/20', textColor: 'text-rose-600 dark:text-rose-400', border: 'border-rose-100 dark:border-rose-800' },
        ].map((s, i) => (
          <div key={i} className={`rounded-3xl p-5 border ${s.bg} ${s.border} animate-fade-in-up hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1`} style={{ animationDelay: `${(i+1)*50}ms` }}>
            <div className="flex items-start justify-between">
              <div>
                <p className={`text-xs font-bold uppercase tracking-wider mb-1 ${s.textColor} opacity-80`}>{s.label}</p>
                <p className={`text-3xl font-black ${s.textColor}`}>{s.value}</p>
              </div>
              <s.icon className={`w-8 h-8 ${s.textColor} opacity-50`} />
            </div>
          </div>
        ))}
      </div>

      {/* Tabs / Segmented Control */}
      <div className="flex overflow-x-auto custom-scrollbar gap-2 mb-8 bg-gray-100 dark:bg-slate-800/60 p-1.5 rounded-2xl w-max animate-fade-in-up delay-200 max-w-full">
        {[
          { key: 'available', label: 'Tersedia', count: available.length, pulse: available.length > 0 },
          { key: 'active', label: 'Sedang Kirim', count: shippedOrders.length },
          { key: 'done', label: 'Terkirim', count: deliveredOrders.length },
          { key: 'returns', label: 'Retur', count: activeReturns.length, pulse: activeReturns.length > 0 }
        ].map(t => (
          <button 
            key={t.key} 
            onClick={() => setTab(t.key)} 
            className={`relative px-5 py-2.5 rounded-xl font-bold text-sm whitespace-nowrap transition-all duration-300 flex items-center gap-2 ${tab === t.key ? 'text-white' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
          >
            {tab === t.key && (
              <motion.div layoutId="courierTab" className="absolute inset-0 bg-slate-900 dark:bg-slate-700 rounded-xl shadow-md -z-10" />
            )}
            <span className="relative z-10">{t.label}</span>
            <span className={`relative z-10 px-2 py-0.5 rounded-md text-[10px] ${tab === t.key ? 'bg-white/20 text-white' : 'bg-gray-200 dark:bg-slate-700 text-gray-500 dark:text-gray-300'}`}>
              {t.count}
            </span>
            {t.pulse && tab !== t.key && <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full animate-pulse z-20" />}
          </button>
        ))}
      </div>

      {/* Content Areas */}
      <div className="min-h-[400px]">
        {/* Available Orders View */}
        {tab === 'available' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {available.length === 0 ? (
              <div className="col-span-full py-20 bg-white dark:bg-slate-800/80 rounded-[2rem] border border-dashed border-gray-300 dark:border-slate-700 text-center flex flex-col items-center">
                <Box className="w-16 h-16 text-gray-300 dark:text-slate-600 mb-4" />
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Belum ada paket tersedia</h3>
                <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm">Santai dulu! Coba refresh beberapa saat lagi.</p>
              </div>
            ) : available.map((o, i) => (
              <div key={o.id_order} className="bg-white dark:bg-slate-800 rounded-3xl border border-gray-100 dark:border-slate-700 p-6 flex flex-col justify-between hover:shadow-xl hover:border-indigo-500/30 transition-all duration-300 relative group overflow-hidden">
                <div className="absolute top-0 left-0 w-2 h-full bg-indigo-500 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300" />
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wide flex items-center gap-1.5"><Package className="w-3.5 h-3.5" /> Order Baru</span>
                    <span className="text-xs font-mono text-gray-400">#{o.id_order?.split('-')[0]}</span>
                  </div>
                  <div className="space-y-3 mb-6">
                    <div className="flex items-start gap-3">
                      <div className="mt-1 w-6 flex justify-center"><MapPin className="w-4 h-4 text-gray-400" /></div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase mb-0.5">Destinasi</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2">{o.shipping_address}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="mt-1 w-6 flex justify-center"><Package className="w-4 h-4 text-gray-400" /></div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase mb-0.5">Isi Paket</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{o.items?.length || 0} Barang</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <button 
                  onClick={() => ship(o.id_order)} 
                  disabled={shipping === o.id_order}
                  className="w-full bg-slate-900 hover:bg-indigo-600 dark:bg-white dark:hover:bg-indigo-500 text-white dark:text-slate-900 py-3.5 rounded-xl text-sm font-black flex items-center justify-center gap-2 transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {shipping === o.id_order ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Ambil Pekerjaan Ini'}
                </button>
              </div>
            ))}
          </motion.div>
        )}

        {/* Active Delivery View */}
        {tab === 'active' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            {shippedOrders.length === 0 ? (
              <div className="py-20 bg-white dark:bg-slate-800/80 rounded-[2rem] border border-dashed border-gray-300 dark:border-slate-700 text-center flex flex-col items-center">
                <Truck className="w-16 h-16 text-gray-300 dark:text-slate-600 mb-4" />
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Anda tidak memiliki pengiriman aktif</h3>
                <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm">Ambil pekerjaan dari tab Tersedia.</p>
              </div>
            ) : shippedOrders.map((o) => (
              <div key={o.id_order} className="bg-white dark:bg-slate-800 rounded-3xl border-2 border-indigo-100 dark:border-indigo-900/50 p-4 sm:p-6 pb-5 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm shadow-indigo-500/5">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-3">
                     <span className="relative flex h-3 w-3 mr-1">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-500"></span>
                     </span>
                     <p className="text-sm font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-wide">Sedang Dikirim</p>
                     <p className="text-xs font-mono text-gray-400 ml-auto">#{o.id_order?.split('-')[0]}</p>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 leading-tight">{o.shipping_address}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1.5 font-medium"><CreditCard className="w-4 h-4" /> Pembayaran: Sukses (Midtrans)</p>
                </div>
                
                <div className="w-full md:w-auto shrink-0 border-t md:border-t-0 md:border-l border-gray-100 dark:border-slate-700 pt-4 md:pt-0 md:pl-6 flex flex-col gap-3">
                  <button 
                    onClick={() => deliver(o.id_order)} 
                    disabled={delivering === o.id_order}
                    className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white px-8 py-3.5 rounded-xl text-sm font-black flex items-center justify-center gap-2 transition-all shadow-md shadow-emerald-500/20 disabled:opacity-50 hover:-translate-y-0.5 cursor-pointer"
                  >
                    {delivering === o.id_order ? <Loader2 className="w-5 h-5 animate-spin" /> : <><CheckCircle className="w-5 h-5" /> Tandai Terkirim</>}
                  </button>
                  <button className="w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800 px-8 py-3 rounded-xl text-sm font-bold transition-colors cursor-pointer text-center">
                    Hubungi Pembeli
                  </button>
                </div>
              </div>
            ))}
          </motion.div>
        )}

        {/* Done / Delivered View */}
        {tab === 'done' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
            {deliveredOrders.length === 0 ? (
              <div className="py-20 bg-white dark:bg-slate-800/80 rounded-[2rem] border border-dashed border-gray-300 dark:border-slate-700 text-center flex flex-col items-center">
                <CheckCircle className="w-16 h-16 text-gray-300 dark:text-slate-600 mb-4" />
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Kosong</h3>
              </div>
            ) : deliveredOrders.map((o) => (
              <div key={o.id_order} className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-5 flex items-center justify-between opacity-80 hover:opacity-100 transition-opacity">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/20 rounded-full flex items-center justify-center text-emerald-500">
                    <CheckCircle className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 dark:text-white">Order #{o.id_order?.split('-')[0]}</p>
                    <p className="text-xs text-gray-400">Selesai dikirim pada {new Date(o.updated_at).toLocaleDateString('id-ID')}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-emerald-600 dark:text-emerald-400 font-bold text-sm">+ Poin</p>
                </div>
              </div>
            ))}
          </motion.div>
        )}

        {/* Returns View */}
        {tab === 'returns' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            {activeReturns.length === 0 ? (
              <div className="py-20 bg-white dark:bg-slate-800/80 rounded-[2rem] border border-dashed border-gray-300 dark:border-slate-700 text-center flex flex-col items-center">
                <ShieldAlert className="w-16 h-16 text-gray-300 dark:text-slate-600 mb-4" />
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Tidak Ada Tugas Retur</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Situasi aman terkendali.</p>
              </div>
            ) : activeReturns.map((d) => (
              <div key={d.id_dispute} className="bg-white dark:bg-slate-800 rounded-3xl border-2 border-rose-100 dark:border-rose-900/50 p-6 flex flex-col md:flex-row justify-between gap-6 shadow-sm shadow-rose-500/5">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-3">
                     <span className="bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 px-3 py-1 rounded-full text-xs font-bold tracking-widest uppercase flex items-center gap-1.5 border border-rose-200/50 dark:border-rose-800">
                       <ShieldAlert className="w-3.5 h-3.5" /> URGENT: Retur Barang
                     </span>
                  </div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white mb-2">Order #{d.id_order?.split('-')[0]}</h3>
                  <div className="bg-rose-50 dark:bg-rose-900/10 px-4 py-3 rounded-xl border border-rose-100/50 dark:border-rose-900/30">
                    <p className="text-xs font-bold text-rose-800 dark:text-rose-300 mb-1">Alasan Retur Pembeli:</p>
                    <p className="text-sm font-medium text-rose-950 dark:text-rose-200">{d.reason}</p>
                  </div>
                </div>

                <div className="w-full md:w-max shrink-0 flex flex-col justify-end">
                  {d.status === 'APPROVED_FOR_RETURN' ? (
                     <button 
                       onClick={() => pickupReturn(d.id_dispute)} 
                       disabled={returnActioning === d.id_dispute}
                       className="w-full md:w-auto bg-slate-900 hover:bg-rose-600 dark:bg-white dark:hover:bg-rose-500 text-white dark:text-slate-900 px-8 py-3.5 rounded-xl text-sm font-black flex items-center justify-center gap-2 transition-colors disabled:opacity-50 cursor-pointer"
                     >
                       {returnActioning === d.id_dispute ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Box className="w-5 h-5" /> Ambil dari Pembeli</>}
                     </button>
                  ) : (
                     <button 
                       onClick={() => deliverReturn(d.id_dispute)} 
                       disabled={returnActioning === d.id_dispute}
                       className="w-full md:w-auto bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-3.5 rounded-xl text-sm font-black flex items-center justify-center gap-2 transition-colors disabled:opacity-50 shadow-md shadow-emerald-500/20 cursor-pointer"
                     >
                       {returnActioning === d.id_dispute ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Truck className="w-5 h-5" /> Serahkan ke Toko</>}
                     </button>
                  )}
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
