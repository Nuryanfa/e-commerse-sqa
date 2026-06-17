import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Download, Calendar, Activity, CheckCircle, AlertTriangle, AlertCircle, Users, Store, TrendingUp, PackageCheck, Zap } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [daysFilter, setDaysFilter] = useState(7);
  const [stats, setStats] = useState({
    gross_revenue: 0,
    total_users: 0,
    total_sellers: 0,
    revenue_trends: [],
    top_categories: [],
    recent_logs: [],
    live_feed: []
  });
  const toast = useToast();

  const fetchDashboard = (days) => {
    setLoading(true);
    api.get(`/admin/dashboard?days=${days}`)
      .then(res => setStats(res.data.data))
      .catch(() => toast.error('Gagal memuat statistik dashboard'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchDashboard(daysFilter);
  }, [daysFilter]);

  const exportPDF = async () => {
    toast.info('Mempersiapkan PDF...');
    const element = document.getElementById('dashboard-content');
    if (!element) return;
    try {
      const canvas = await html2canvas(element, { scale: 1.5, useCORS: true, backgroundColor: '#ffffff' });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Dashboard_Laporan_${new Date().toISOString().split('T')[0]}.pdf`);
      toast.success('PDF berhasil diunduh!');
    } catch (err) {
      console.error("PDF Export Error:", err);
      toast.error('Gagal mengekspor PDF.');
    }
  };

  const chartData = stats.revenue_trends?.length > 0 ? stats.revenue_trends : [
    { name: 'Sen', revenue: 65000 }, { name: 'Sel', revenue: 75000 },
    { name: 'Rab', revenue: 68000 }, { name: 'Kam', revenue: 95000 },
    { name: 'Jum', revenue: 110000 }, { name: 'Sab', revenue: 125000 },
    { name: 'Min', revenue: stats.gross_revenue || 128430 },
  ];

  const topCats = stats.top_categories?.length > 0 ? stats.top_categories : [
    { name: 'Sayuran Daun', percentage: 45 },
    { name: 'Sayuran Akar', percentage: 24 },
    { name: 'Buah & Melon', percentage: 18 },
    { name: 'Bumbu & Rempah', percentage: 13 },
  ];

  const logs = stats.recent_logs?.length > 0 ? stats.recent_logs : [
    { event: 'Pencairan Berhasil', user_ip: 'Toko Pak Budi', status: 'COMPLETED', time: new Date().toISOString() },
    { event: 'Penjual Baru', user_ip: 'Agro Makmur', status: 'PENDING', time: new Date(Date.now() - 600000).toISOString() },
  ];

  const feedItems = stats.live_feed?.length > 0 ? stats.live_feed : [
    { title: 'Pelanggan Baru', description: 'Pengguna baru mendaftar', time: new Date().toISOString() },
    { title: 'Pesanan Baru', description: 'Pembayaran Rp 140k diterima', time: new Date().toISOString() },
  ];

  return (
    <div id="dashboard-content" className="p-6 md:p-8 max-w-[85rem] mx-auto min-h-screen bg-white dark:bg-slate-900">
      {/* Header Premium */}
      <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-emerald-900 to-slate-900 p-8 sm:p-10 mb-8 border border-slate-700 shadow-2xl shadow-emerald-900/10 isolate animate-fade-in-up">
        {/* Dekorasi BG Artistik */}
        <div data-html2canvas-ignore="true" className="absolute -top-24 -right-24 w-64 h-64 bg-emerald-500 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-pulse-soft" />
        <div data-html2canvas-ignore="true" className="absolute -bottom-24 left-1/3 w-64 h-64 bg-cyan-500 rounded-full mix-blend-screen filter blur-3xl opacity-10" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20 shadow-inner">
              <Activity className="w-8 h-8 text-emerald-300" />
            </div>
            <div>
              <p className="text-emerald-200 font-medium text-xs tracking-widest uppercase mb-1">Pusat Komando Admin</p>
              <h1 className="text-3xl font-black text-white tracking-tight">Analytics Dashboard</h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={daysFilter}
              onChange={(e) => setDaysFilter(Number(e.target.value))}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white font-semibold text-sm transition-all focus:outline-none cursor-pointer"
            >
              <option value={3} className="text-gray-900">3 Hari Terakhir</option>
              <option value={7} className="text-gray-900">7 Hari Terakhir</option>
              <option value={30} className="text-gray-900">30 Hari Terakhir</option>
            </select>
            <button 
              onClick={exportPDF}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-sm transition-all shadow-lg shadow-emerald-500/30">
              <Download className="w-4 h-4" /> Export PDF
            </button>
          </div>
        </div>
      </div>

      {/* Grid Statistik Utma */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          { icon: TrendingUp, title: 'Total Pendapatan', val: `Rp ${stats.gross_revenue.toLocaleString('id-ID')}`, pct: '+12.4%', isPos: true },
          { icon: Users, title: 'Total Pengguna', val: stats.total_users.toLocaleString(), pct: '+5%', isPos: true },
          { icon: Store, title: 'Penjual Aktif', val: stats.total_sellers.toLocaleString(), pct: '+2%', isPos: true },
          { icon: PackageCheck, title: 'Sukses Kirim', val: '98.2%', pct: '-1.5%', isPos: false },
        ].map((s, i) => (
          <motion.div 
            key={i} 
            initial={{ opacity: 0, y: 15 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: i * 0.05 }} 
            className="group relative overflow-hidden bg-white dark:bg-slate-800 rounded-3xl p-6 border border-gray-100 dark:border-slate-700 shadow-sm hover:shadow-xl hover:border-emerald-500/30 transition-all duration-300"
          >
            <div className="absolute top-0 left-0 w-2 h-full bg-emerald-500 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300" />
            <div className="relative z-10 flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <s.icon className="w-6 h-6" />
              </div>
              <span className={`text-xs font-bold px-2 py-1 rounded-lg ${s.isPos ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400'}`}>
                {s.pct}
              </span>
            </div>
            <div className="relative z-10">
              <p className="text-sm font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider mb-1">{s.title}</p>
              <h3 className="text-2xl font-black text-gray-900 dark:text-white">{s.val}</h3>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Charts & Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-3xl p-6 border border-gray-100 dark:border-slate-700 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Tren Pendapatan</h3>
              <p className="text-sm text-gray-500 dark:text-slate-400">Arus finansial bulanan seluruh ekosistem</p>
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-gray-500 dark:text-slate-400 bg-gray-50 dark:bg-slate-900/50 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-slate-700">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> PENDAPATAN GROSS
            </div>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-gray-200 dark:text-slate-700" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} tickFormatter={v => `Rp${v/1000}k`} />
                <Tooltip contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', background: 'var(--surface-container-lowest)' }} itemStyle={{ color: '#10b981', fontWeight: 800 }} />
                <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" isAnimationActive={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="group relative overflow-hidden bg-white dark:bg-slate-800 rounded-3xl p-6 border border-gray-100 dark:border-slate-700 shadow-sm hover:shadow-xl hover:border-emerald-500/30 transition-all duration-300 flex flex-col">
          <div className="absolute top-0 left-0 w-2 h-full bg-emerald-500 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300" />
          <h3 className="relative z-10 text-lg font-bold text-gray-900 dark:text-white mb-6">Kategori Teratas</h3>
          <div className="relative z-10 flex-1 space-y-5">
            {topCats.map((c, i) => (
              <div key={i} className="group">
                <div className="flex justify-between text-sm font-semibold mb-2">
                  <span className="text-gray-900 dark:text-gray-200">{c.name}</span>
                  <span className="text-gray-500 dark:text-gray-400">{c.percentage}%</span>
                </div>
                <div className="w-full h-2.5 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }} 
                    animate={{ width: `${c.percentage}%` }} 
                    transition={{ duration: 1, delay: i * 0.1 }}
                    className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full group-hover:scale-y-110 transition-transform origin-left" 
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="relative z-10 mt-6 p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl border border-emerald-100 dark:border-emerald-800 flex gap-3 items-start">
            <Zap className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
            <p className="text-xs font-medium text-emerald-800 dark:text-emerald-300 leading-snug">
              <strong>Insight:</strong> Kategori sayuran daun terus mendominasi. Sediakan promo diskon bundel untuk meningkatkan penjualan silang produk lainnya.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
