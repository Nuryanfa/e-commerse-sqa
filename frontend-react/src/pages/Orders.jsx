import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { motion } from 'framer-motion';
import { ShoppingBag, Clock, CreditCard, Truck, CheckCircle, ChevronRight, Package, ArrowRight } from 'lucide-react';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/orders').then(res => setOrders(res.data.data || [])).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const statusConfig = {
    PENDING: { bg: 'bg-amber-100', text: 'text-amber-700', icon: Clock, label: 'Menunggu Pembayaran' },
    PAID: { bg: 'bg-blue-100', text: 'text-blue-700', icon: CreditCard, label: 'Sedang Diproses' },
    PROCESSED: { bg: 'bg-orange-100', text: 'text-orange-700', icon: Package, label: 'Disiapkan Supplier' },
    SHIPPED: { bg: 'bg-indigo-100', text: 'text-indigo-700', icon: Truck, label: 'Dalam Pengiriman' },
    DELIVERED: { bg: 'bg-emerald-100', text: 'text-emerald-700', icon: CheckCircle, label: 'Pesanan Selesai' },
    DISPUTED: { bg: 'bg-red-100', text: 'text-red-700', icon: Package, label: 'Sengketa Pembeli' },
    CANCELLED: { bg: 'bg-gray-100', text: 'text-gray-700', icon: Package, label: 'Dibatalkan' },
    REFUND_PENDING: { bg: 'bg-rose-100', text: 'text-rose-700', icon: Clock, label: 'Refund Diproses' },
    REFUNDED: { bg: 'bg-emerald-100', text: 'text-emerald-700', icon: CheckCircle, label: 'Dana Dikembalikan' }
  };

  const getStatus = (status) => statusConfig[status] || { bg: 'bg-gray-100', text: 'text-gray-700', icon: Package, label: status };

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-slate-900 py-12 pb-24 font-sans">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
           <div>
             <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight mb-2">Riwayat Pesanan</h1>
             <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Lacak pengiriman dan tinjau belanja organik Anda sebelumnya.</p>
           </div>
           <div className="flex gap-2 bg-white dark:bg-slate-800 p-1.5 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm w-fit">
              <button className="px-4 py-2 text-xs font-bold bg-emerald-500 text-white rounded-lg shadow-sm">Semua</button>
              <button className="px-4 py-2 text-xs font-bold text-gray-500 hover:bg-gray-50 dark:hover:bg-slate-700 rounded-lg transition-colors">Aktif</button>
              <button className="px-4 py-2 text-xs font-bold text-gray-500 hover:bg-gray-50 dark:hover:bg-slate-700 rounded-lg transition-colors">Selesai</button>
           </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="space-y-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white dark:bg-slate-800 h-40 rounded-3xl skeleton border border-gray-100 dark:border-slate-700" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          /* Empty State */
          <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] p-16 text-center border border-gray-100 dark:border-slate-700 shadow-sm flex flex-col items-center justify-center">
            <div className="w-24 h-24 bg-gray-50 dark:bg-slate-700/50 rounded-full flex items-center justify-center mb-6">
               <ShoppingBag className="w-10 h-10 text-gray-300 dark:text-gray-500" />
            </div>
            <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2">Belum Ada Pesanan</h3>
            <p className="text-sm text-gray-500 mb-8 max-w-sm mx-auto">Anda belum melakukan pemesanan apa pun. Mulai jelajahi sayuran segar organik kami!</p>
            <Link to="/products" className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-8 py-3.5 rounded-xl text-sm font-bold shadow-lg hover:-translate-y-1 transition-all inline-block hover:shadow-xl">
              Mulai Belanja Sekarang
            </Link>
          </div>
        ) : (
          /* Orders List */
          <div className="space-y-6">
            {orders.map((order, i) => {
              const statusLine = getStatus(order.status);
              const Icon = statusLine.icon;
              
              return (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                  key={order.id_order} 
                  className="bg-white dark:bg-slate-800 rounded-[2rem] border border-gray-100 dark:border-slate-700/80 shadow-sm hover:shadow-md transition-shadow overflow-hidden group"
                >
                   {/* Card Header */}
                   <div className="flex flex-wrap items-center justify-between gap-4 px-6 sm:px-8 py-5 border-b border-gray-50 dark:border-slate-700/50 bg-gray-50/50 dark:bg-slate-800/50">
                      <div className="flex items-center gap-4">
                         <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${statusLine.bg} ${statusLine.text} bg-opacity-20`}>
                           <Icon className="w-5 h-5 fill-current opacity-20" />
                           <Icon className="w-5 h-5 absolute" />
                         </div>
                         <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-0.5">Order ID #{order.id_order.slice(0, 8)}</p>
                            <span className={`text-xs font-black uppercase tracking-wider ${statusLine.text}`}>
                              {statusLine.label}
                            </span>
                         </div>
                      </div>
                      <div className="text-right">
                         <p className="text-xs font-medium text-gray-400 mb-0.5">Tanggal Pembelian</p>
                         <p className="text-sm font-bold text-gray-900 dark:text-white">
                           {new Date(order.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                         </p>
                      </div>
                   </div>

                   {/* Card Body */}
                   <Link to={`/orders/${order.id_order}`} className="block px-6 sm:px-8 py-6 cursor-pointer">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                         
                         {/* Items Preview */}
                         <div className="flex-1">
                            <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-4">Item Pesanan ({order.items?.length || 0})</h4>
                            <div className="flex flex-wrap gap-3">
                               {order.items?.slice(0,4).map((item, idx) => (
                                 <div key={idx} className="relative group/item">
                                    <div className="w-16 h-16 rounded-2xl bg-gray-50 dark:bg-slate-700 border border-gray-100 dark:border-slate-600 overflow-hidden">
                                       {item.product?.image_url ? (
                                         <img src={item.product.image_url} alt="" className="w-full h-full object-cover" />
                                       ) : (
                                         <Package className="w-6 h-6 m-auto mt-5 text-gray-300" />
                                       )}
                                    </div>
                                    <div className="absolute -top-2 -right-2 w-5 h-5 bg-emerald-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white dark:border-slate-800 shadow-sm">
                                       {item.quantity}
                                    </div>
                                 </div>
                               ))}
                               {order.items?.length > 4 && (
                                 <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-slate-700 flex items-center justify-center border border-gray-200 dark:border-slate-600">
                                    <span className="text-xs font-black text-gray-500">+{order.items.length - 4}</span>
                                 </div>
                               )}
                            </div>
                         </div>

                         {/* Total & Action */}
                         <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-4 border-t sm:border-t-0 sm:border-l border-gray-100 dark:border-slate-700 sm:pl-8 pt-4 sm:pt-0">
                            <div className="text-left sm:text-right">
                               <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Total Belanja</p>
                               <p className="text-xl font-black text-emerald-600 dark:text-emerald-400">Rp {order.total_amount?.toLocaleString('id-ID')}</p>
                            </div>
                            <button className="flex items-center gap-2 text-xs font-bold text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-slate-700 hover:bg-emerald-500 hover:text-white rounded-xl px-5 py-2.5 transition-colors group/btn shadow-sm">
                               Lacak Pesanan <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                            </button>
                         </div>
                      </div>
                   </Link>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
