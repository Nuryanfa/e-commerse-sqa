import { useState, useEffect } from 'react';
import { useAuth } from '../../context/useAuth';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Package, Truck, ChevronRight, TrendingUp, AlertTriangle, CheckCircle, CreditCard, Loader2, Store, Download } from 'lucide-react';

export default function SupplierDashboard() {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([api.get('/supplier/products'), api.get('/supplier/orders')])
      .then(([p, o]) => {
        setProducts(Array.isArray(p.data.data) ? p.data.data : (p.data.data?.data || []));
        setOrders(Array.isArray(o.data.data) ? o.data.data : (o.data.data?.data || []));
      })
      .catch(() => toast.error('Gagal memuat data dashboard'))
      .finally(() => setLoading(false));
  }, []);

  // Potong 5% fee platform
  const totalSales = orders
    .filter(o => !['CANCELLED', 'REFUND_PENDING', 'REFUNDED'].includes(o.status))
    .reduce((sum, o) => sum + (o.total_amount * 0.95), 0);
  
  const activeOrders = orders.filter(o => ['PAID', 'PROCESSED', 'SHIPPED'].includes(o.status)).length;
  const stockAlerts = products.filter(p => p.stock <= 10).length;

  const recentProducts = products.slice(0, 5);
  const recentOrders   = orders.filter(o => o.status === 'PAID').slice(0, 3);

  const processOrder = (id) => {
    api.put(`/supplier/orders/${id}/process`)
      .then(() => { toast.success('Pesanan diproses'); setOrders(orders.map(o => o.id_order === id ? { ...o, status: 'PROCESSED' } : o)); })
      .catch((err) => toast.error(err.response?.data?.error || 'Gagal merespon pesanan'));
  };

  const exportPDF = async () => {
    toast.info('Mempersiapkan PDF...');
    const element = document.getElementById('supplier-dashboard-content');
    if (!element) return;
    try {
      const html2canvas = (await import('html2canvas')).default;
      const { jsPDF } = await import('jspdf');
      
      const canvas = await html2canvas(element, { scale: 1.5, useCORS: true, backgroundColor: '#ffffff' });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save('Dashboard_Supplier.pdf');
      toast.success('PDF berhasil diunduh!');
    } catch (err) {
      toast.error('Gagal mengekspor PDF');
    }
  };

  return (
    <div id="supplier-dashboard-content" className="p-6 md:p-8 max-w-[85rem] mx-auto min-h-screen">
      {/* Header Premium */}
      <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-indigo-900 to-slate-900 p-8 sm:p-10 mb-8 border border-slate-700 shadow-2xl shadow-indigo-900/10 isolate animate-fade-in-up">
        {/* Dekorasi BG */}
        <div data-html2canvas-ignore="true" className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-500 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-pulse-soft" />
        <div data-html2canvas-ignore="true" className="absolute -bottom-24 left-1/4 w-64 h-64 bg-emerald-500 rounded-full mix-blend-screen filter blur-3xl opacity-10" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20 shadow-inner">
              <Store className="w-8 h-8 text-indigo-300" />
            </div>
            <div>
              <p className="text-indigo-200 font-medium text-xs tracking-widest uppercase mb-1">Dashboard Mitra Toko</p>
              <h1 className="text-3xl font-black text-white tracking-tight">Halo, {user?.nama || 'Pengelola'}!</h1>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 px-6 py-3.5 rounded-2xl text-center">
              <p className="text-xs text-indigo-200 uppercase font-bold tracking-widest mb-1">Omzet Aktif (Berjalan)</p>
              <p className="text-2xl font-black text-white font-mono">Rp {(totalSales).toLocaleString('id-ID')}</p>
            </div>
            <button onClick={exportPDF} data-html2canvas-ignore="true" className="bg-indigo-600 hover:bg-indigo-500 text-white p-4 rounded-2xl shadow-lg border border-indigo-400/30 transition-all flex items-center justify-center cursor-pointer" title="Export PDF">
              <Download className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Grid Statistik Utma */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[
          { icon: TrendingUp, label: 'Kinerja Penjualan (MTD)', val: `Rp ${(totalSales/1000000).toFixed(2)}M`, pct: '+12.5%', isAlert: false, colorClass: 'text-emerald-500', bgClass: 'bg-emerald-50 dark:bg-emerald-900/20' },
          { icon: Package, label: 'Pesanan Diproses', val: activeOrders, pct: 'Aktif', isAlert: false, colorClass: 'text-indigo-500', bgClass: 'bg-indigo-50 dark:bg-indigo-900/20' },
          { icon: AlertTriangle, label: 'Peringatan Stok', val: stockAlerts > 0 ? `${stockAlerts} Barang` : 'Stok Aman', pct: stockAlerts > 0 ? 'Urgent' : 'Aman', isAlert: stockAlerts > 0, colorClass: stockAlerts > 0 ? 'text-rose-500' : 'text-slate-500', bgClass: stockAlerts > 0 ? 'bg-rose-50 dark:bg-rose-900/20' : 'bg-slate-50 dark:bg-slate-900/20' },
        ].map((s, i) => (
          <motion.div 
            key={i} 
            initial={{ opacity: 0, y: 15 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: i * 0.1 }} 
            className="group relative overflow-hidden bg-white dark:bg-slate-800 rounded-3xl p-6 border border-gray-100 dark:border-slate-700 shadow-sm hover:shadow-xl hover:border-indigo-500/30 transition-all duration-300"
          >
            <div className="absolute top-0 left-0 w-2 h-full bg-indigo-500 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300" />
            <div className="relative z-10 flex items-start justify-between mb-4">
               <div>
                 <p className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-slate-500 mb-1.5">{s.label}</p>
                 <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md ${s.isAlert ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-400' : 'bg-gray-100 text-gray-700 dark:bg-slate-700 dark:text-gray-300'}`}>
                   {s.pct}
                 </span>
               </div>
               <div className={`w-12 h-12 rounded-2xl ${s.bgClass} flex flex-col items-center justify-center group-hover:scale-110 transition-transform`}>
                 <s.icon className={`w-6 h-6 ${s.colorClass}`} />
               </div>
            </div>
            <h3 className={`relative z-10 text-3xl font-black ${s.isAlert ? 'text-rose-600 dark:text-rose-400' : 'text-gray-900 dark:text-white'}`}>{s.val}</h3>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Inventori Overview */}
        <div className="lg:col-span-2">
          <div className="flex justify-between items-center mb-5">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Package className="w-5 h-5 text-indigo-500" /> Ringkasan Inventori
            </h3>
            <Link to="/supplier/products" className="text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 flex items-center gap-1 bg-indigo-50 dark:bg-indigo-900/20 px-3 py-1.5 rounded-lg transition-colors">
              Lihat Katalog <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          
          <div className="bg-white dark:bg-slate-800 rounded-3xl border border-gray-100 dark:border-slate-700 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-gray-50 dark:bg-slate-900/50 text-gray-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4">Produk</th>
                    <th className="px-6 py-4 text-center">Stok (Kg)</th>
                    <th className="px-6 py-4 text-right">Harga</th>
                    <th className="px-6 py-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-slate-700/50 font-medium">
                  {loading ? (
                    <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-400 bg-gray-50/50 dark:bg-slate-800/50">Memuat data produk...</td></tr>
                  ) : recentProducts.map((p) => (
                    <tr key={p.id_product} className="hover:bg-gray-50 dark:hover:bg-slate-750 transition-colors">
                      <td className="px-6 py-4 flex items-center gap-4 border-none">
                        {p.image_url ? (
                          <img src={p.image_url} alt={p.name} className="w-10 h-10 rounded-xl object-cover border border-gray-200 dark:border-slate-700" />
                        ) : (
                          <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-slate-700 flex items-center justify-center text-gray-400">
                            <Package className="w-5 h-5" />
                          </div>
                        )}
                        <span className="font-bold text-gray-900 dark:text-white truncate max-w-[150px]">{p.name}</span>
                      </td>
                      <td className={`px-6 py-4 text-center font-bold font-mono ${p.stock <= 5 ? 'text-rose-600 dark:text-rose-400' : 'text-gray-900 dark:text-white'}`}>
                        {p.stock}
                      </td>
                      <td className="px-6 py-4 text-right text-gray-600 dark:text-gray-300">
                        Rp {p.price.toLocaleString('id-ID')}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${p.stock > 10 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400'}`}>
                          {p.stock > 10 ? 'Tersedia' : 'Restock'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {recentProducts.length === 0 && !loading && (
               <div className="p-8 text-center text-gray-500 font-medium">Belum ada produk di daftar katalog Anda.</div>
            )}
          </div>
        </div>

        {/* Antrean Pengiriman (Live Order Feed) */}
        <div>
          <div className="flex justify-between items-center mb-5">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Truck className="w-5 h-5 text-indigo-500" /> Antrean Kiriman
            </h3>
            <span className="text-xs font-bold tracking-widest text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 px-2 py-1.5 rounded-lg uppercase">
              {recentOrders.length} Tertunda
            </span>
          </div>
          
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-gray-100 dark:border-slate-700 shadow-sm flex flex-col gap-4">
            {recentOrders.length === 0 && !loading && (
              <div className="py-12 text-center flex flex-col items-center justify-center border-2 border-dashed border-gray-200 dark:border-slate-700 rounded-2xl">
                <CheckCircle className="w-10 h-10 text-emerald-400 mb-2" />
                <p className="text-sm font-bold text-gray-500 dark:text-gray-400">Semua pesanan selesai diproses.</p>
              </div>
            )}
            {recentOrders.map(o => (
              <div key={o.id_order} className="group relative overflow-hidden bg-white dark:bg-slate-800 p-4 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm hover:shadow-lg hover:border-indigo-500/30 transition-all duration-300 flex flex-col">
                <div className="absolute top-0 left-0 w-1.5 h-full bg-indigo-500 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300" />
                <div className="relative z-10 flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse-soft" />
                    <p className="font-bold text-gray-900 dark:text-white text-sm">Pemesan: {o.user?.nama || 'Tamu'}</p>
                  </div>
                  <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest bg-indigo-50 dark:bg-indigo-900/20 px-2 py-1 rounded border border-indigo-100 dark:border-indigo-800">Baru</span>
                </div>
                
                <div className="relative z-10 bg-gray-50 dark:bg-slate-900/50 p-3 rounded-xl border border-gray-100 dark:border-slate-700/50 mb-3">
                   <p className="text-xs font-mono text-gray-500 mb-1 flex items-center gap-1.5"><Package className="w-3.5 h-3.5" /> #{o.id_order?.split('-')[0].toUpperCase()}</p>
                   <p className="text-sm font-black text-gray-900 dark:text-white">Rp {o.total_amount?.toLocaleString('id-ID')}</p>
                </div>
                
                <button 
                  onClick={() => processOrder(o.id_order)} 
                  className="relative z-10 w-full bg-indigo-600 hover:bg-indigo-500 text-white py-3 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-transform shadow-md shadow-indigo-500/20 hover:-translate-y-0.5"
                >
                  <Package className="w-4 h-4" /> Proses Sekarang
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
