import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { DollarSign, TrendingUp, Download, PieChart, Loader2, CreditCard } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

const S = {
  card:  { background: 'var(--surface-container-lowest)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border)', boxShadow: '0 4px 24px rgba(0,0,0,0.02)' },
  label: { fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--outline)', fontFamily: 'var(--font-display)' },
  h:     { fontFamily: 'var(--font-display)', fontWeight: 800, color: 'var(--text-heading)' },
  muted: { fontSize: '0.78rem', color: 'var(--outline)' },
};

export default function AdminRevenue() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ 
    gross_revenue: 0, 
    platform_fee: 0,
    supplier_revenue: 0,
    revenue_trends: [],
    recent_transactions: []
  });
  const toast = useToast();

  useEffect(() => {
    api.get('/admin/revenue?days=30')
      .then(res => setStats(res.data.data))
      .catch(() => toast.error('Gagal memuat analitik pendapatan'))
      .finally(() => setLoading(false));
  }, []);

  const exportPDF = async () => {
    toast.success('Mempersiapkan PDF (Gambar Tidak Bisa Diedit)...');
    const element = document.getElementById('revenue-content');
    if (!element) return;
    try {
      const canvas = await html2canvas(element, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Revenue_Laporan_${new Date().toISOString().split('T')[0]}.pdf`);
      toast.success('PDF berhasil diunduh!');
    } catch (err) {
      toast.error('Gagal mengekspor PDF');
    }
  };

  const chartData = stats.revenue_trends?.length > 0 ? stats.revenue_trends.map(t => ({
    name: new Date(t.date).toLocaleDateString('id-ID', { month: 'short', day: 'numeric' }),
    revenue: t.revenue,
    profit: t.revenue * 0.05
  })) : [
    { name: 'Min 1', revenue: 0, profit: 0 },
    { name: 'Min 2', revenue: 0, profit: 0 },
    { name: 'Min 3', revenue: 0, profit: 0 },
  ];

  const avgOrderValue = stats.gross_revenue / (stats.revenue_trends?.length || 1);

  if (loading) return <div className="flex justify-center items-center h-screen"><Loader2 className="animate-spin" /></div>;

  return (
    <div id="revenue-content" style={{ padding: '2.5rem 2rem', maxWidth: '80rem', margin: '0 auto', minHeight: '100vh', background: 'var(--bg)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2.5rem' }}>
        <div>
          <h1 style={{ ...S.h, fontSize: '1.75rem', margin: 0 }}>Analitik Pendapatan</h1>
          <p style={{ ...S.muted, marginTop: '0.25rem' }}>Rincian finansial akurat dari pendapatan penjualan sesungguhnya.</p>
        </div>
        <button onClick={exportPDF} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 1.25rem', borderRadius: 'var(--radius-full)', background: '#16a34a', color: 'white', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.875rem' }}>
          <Download size={15} /> Export (PDF)
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
        {[
          { label: 'Total Uang Masuk', val: `Rp ${stats.gross_revenue.toLocaleString('id-ID')}`, icon: <DollarSign size={16}/> },
          { label: 'Komisi Platform (5%)', val: `Rp ${stats.platform_fee.toLocaleString('id-ID')}`, icon: <PieChart size={16}/> },
          { label: 'Sisa Pembayaran Supplier', val: `Rp ${stats.supplier_revenue.toLocaleString('id-ID')}`, icon: <CreditCard size={16}/> },
        ].map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} style={{ ...S.card, padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <div style={{ width: '3.5rem', height: '3.5rem', borderRadius: '1rem', background: '#dcfce7', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {s.icon}
            </div>
            <div>
              <p style={{ ...S.label, marginBottom: '0.25rem' }}>{s.label}</p>
              <p style={{ ...S.h, fontSize: '1.3rem', margin: 0 }}>{s.val}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ ...S.card, padding: '2rem' }}>
        <h3 style={{ ...S.h, fontSize: '1.1rem', margin: 0, marginBottom: '2rem' }}>Pendapatan vs Estimasi Profit</h3>
        <div style={{ height: '350px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'var(--outline)' }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'var(--outline)' }} tickFormatter={v => `Rp ${v/1000}k`} />
              <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }} formatter={(value) => `Rp ${value.toLocaleString('id-ID')}`} />
              <Area type="monotone" dataKey="revenue" name="Pendapatan (Rp)" stroke="#10b981" fillOpacity={0.1} fill="#10b981" />
              <Area type="monotone" dataKey="profit" name="Estimasi Profit (Rp)" stroke="#3b82f6" fillOpacity={0.1} fill="#3b82f6" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ ...S.card, padding: '2rem', marginTop: '2rem' }}>
        <h3 style={{ ...S.h, fontSize: '1.1rem', margin: 0, marginBottom: '1.5rem' }}>Transaksi Terakhir</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ background: 'var(--surface-container-low)', textAlign: 'left' }}>
                <th style={{ padding: '1rem', ...S.label }}>ID Pesanan</th>
                <th style={{ padding: '1rem', ...S.label }}>Pembeli</th>
                <th style={{ padding: '1rem', ...S.label }}>Total (Rp)</th>
                <th style={{ padding: '1rem', ...S.label }}>Komisi Admin (5%)</th>
                <th style={{ padding: '1rem', ...S.label }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {stats.recent_transactions?.map((trx, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '1rem', color: 'var(--text-heading)', fontWeight: 'bold' }}>{trx.id_order.substring(0,8)}...</td>
                  <td style={{ padding: '1rem', color: 'var(--on-surface)' }}>{trx.buyer_name}</td>
                  <td style={{ padding: '1rem', color: 'var(--on-surface)' }}>{trx.total_amount.toLocaleString('id-ID')}</td>
                  <td style={{ padding: '1rem', color: '#16a34a', fontWeight: 'bold' }}>{(trx.total_amount * 0.05).toLocaleString('id-ID')}</td>
                  <td style={{ padding: '1rem' }}><span style={{ padding: '0.2rem 0.5rem', background: '#dcfce7', color: '#16a34a', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold' }}>{trx.status}</span></td>
                </tr>
              ))}
              {(!stats.recent_transactions || stats.recent_transactions.length === 0) && (
                <tr><td colSpan="5" style={{ padding: '2rem', textAlign: 'center', color: 'var(--outline)' }}>Belum ada transaksi</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
