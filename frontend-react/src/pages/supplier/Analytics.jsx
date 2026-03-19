import { useState, useEffect } from 'react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Calendar, Download, TrendingUp, Users, DollarSign, Package } from 'lucide-react';

const S = {
  card:  { background: 'var(--surface-container-lowest)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border)', boxShadow: '0 4px 24px rgba(0,0,0,0.02)' },
  label: { fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--outline)', fontFamily: 'var(--font-display)' },
  h:     { fontFamily: 'var(--font-display)', fontWeight: 800, color: 'var(--text-heading)' },
  muted: { fontSize: '0.78rem', color: 'var(--outline)' },
};

export default function SupplierAnalytics() {
  const [trends, setTrends] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    Promise.all([api.get('/supplier/orders'), api.get('/supplier/products')])
      .then(([oRes, pRes]) => {
        const orders = oRes.data.data || [];
        const products= pRes.data.data || [];
        
        // Mock trends based on existing orders
        const revMap = {};
        orders.forEach(o => {
          const d = new Date(o.created_at).toLocaleDateString('id-ID', {day:'numeric', month:'short'});
          revMap[d] = (revMap[d] || 0) + o.total_amount;
        });
        const trendData = Object.entries(revMap).map(([date, revenue]) => ({ date, revenue }));
        setTrends(trendData.length > 0 ? trendData : [{date:'Jan', revenue:0}, {date:'Feb', revenue:0}]); // fallback for empty

        // Top products by stock value
        const top = [...products].sort((a,b) => (b.stock*b.price) - (a.stock*a.price)).slice(0, 5);
        setTopProducts(top);
      })
      .catch(() => toast.error('Gagal memuat analitik'))
      .finally(() => setLoading(false));
  }, []);

  const totalRev = trends.reduce((sum, t) => sum + t.revenue, 0);

  return (
    <div style={{ padding: '2.5rem 2rem', maxWidth: '75rem', margin: '0 auto', minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2.5rem' }}>
        <div>
          <h1 style={{ ...S.h, fontSize: '1.75rem', margin: 0 }}>Analytics Dashboard</h1>
          <p style={{ ...S.muted, marginTop: '0.25rem' }}>Monitor your growth and stock performance</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 1.25rem', borderRadius: 'var(--radius-full)', background: 'var(--surface-container)', color: 'var(--on-surface-variant)', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '0.875rem' }}>
            <Calendar size={15} /> Last 30 Days
          </button>
          <button style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 1.25rem', borderRadius: 'var(--radius-full)', background: '#16a34a', color: 'white', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.875rem' }}>
            <Download size={15} /> Export PDF
          </button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        {[
          { label: 'TOTAL REVENUE', val: `Rp ${(totalRev/1_000_000).toFixed(1)}M`, icon: <DollarSign size={18} />, color: '#16a34a', desc: 'Active in your catalog' },
          { label: 'ACTIVE ORDERS', val: 1248, icon: <Package size={18} />, color: '#0ea5e9', desc: 'Steady' },
          { label: 'CUSTOMER GROWTH',val: 856, icon: <Users size={18} />, color: '#16a34a', desc: '+8.2% new users' },
        ].map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
            style={{ ...S.card, padding: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
            <div style={{ width: '2.75rem', height: '2.75rem', borderRadius: 'var(--radius-md)', background: `${s.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.color, flexShrink: 0 }}>{s.icon}</div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                <p style={{ ...S.muted, margin: 0 }}>{s.label}</p>
                {i !== 1 && <span style={{ background: 'rgba(22,163,74,0.1)', color: '#16a34a', fontSize: '0.65rem', padding: '0.1rem 0.4rem', borderRadius: '4px', fontWeight: 700 }}>+12.5%</span>}
              </div>
              <p style={{ ...S.h, fontSize: '2rem', margin: 0, lineHeight: 1.2 }}>{s.val}</p>
              <p style={{ ...S.muted, marginTop: '0.5rem' }}>{s.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
        <div style={{ ...S.card, padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <div>
              <h3 style={{ ...S.h, fontSize: '1.1rem', margin: 0 }}>Sales Trajectory</h3>
              <p style={{ ...S.muted, margin: 0 }}>Revenue performance across key harvest cycles</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-heading)' }}>
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#16a34a' }} /> Revenue
            </div>
          </div>
          <div style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trends} margin={{ top: 0, right: 0, left: -20, bottom: 0 }} barSize={12}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: 'var(--outline)', fontSize: 11 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--outline)', fontSize: 11 }} tickFormatter={v => `${(v/1000000).toFixed(0)}M`} />
                <Tooltip cursor={{ fill: 'var(--surface-container)' }} contentStyle={{ borderRadius: 'var(--radius-md)', border: 'none', background: 'var(--surface-container-high)', color: 'var(--text-heading)', boxShadow: 'var(--shadow-md)' }} />
                <Bar dataKey="revenue" fill="#4ade80" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div style={{ ...S.card, padding: '1.5rem' }}>
          <h3 style={{ ...S.h, fontSize: '1.1rem', marginBottom: '1.5rem' }}>Top Performing Stocks</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {topProducts.map(p => {
              const cap = Math.max(...topProducts.map(x => x.stock));
              const pct = (p.stock / cap) * 100;
              return (
                <div key={p.id_product}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.85rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, color: 'var(--text-heading)' }}>
                      {p.image_url ? <img src={p.image_url} style={{ width: '1.5rem', height: '1.5rem', borderRadius: 4, objectFit: 'cover' }}/> : <div style={{width: '1.5rem', height: '1.5rem', borderRadius: 4, background: 'var(--bg)'}}/>} 
                      {p.name}
                    </div>
                    <span style={{ color: 'var(--outline)', fontWeight: 500 }}>{p.stock}kg</span>
                  </div>
                  <div style={{ height: 6, background: 'var(--surface-container-high)', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: '#006c3e', borderRadius: 3 }} />
                  </div>
                </div>
              );
            })}
          </div>
          <button style={{ width: '100%', padding: '0.75rem', marginTop: '1.5rem', background: 'transparent', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', color: '#16a34a', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}>View Detailed Inventory →</button>
        </div>
      </div>
    </div>
  );
}
