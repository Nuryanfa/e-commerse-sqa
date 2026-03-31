import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { DollarSign, TrendingUp, Download, PieChart } from 'lucide-react';

const S = {
  card:  { background: 'var(--surface-container-lowest)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border)', boxShadow: '0 4px 24px rgba(0,0,0,0.02)' },
  label: { fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--outline)', fontFamily: 'var(--font-display)' },
  h:     { fontFamily: 'var(--font-display)', fontWeight: 800, color: 'var(--text-heading)' },
  muted: { fontSize: '0.78rem', color: 'var(--outline)' },
};

const data = [
  { name: 'Week 1', revenue: 24000, profit: 4500 },
  { name: 'Week 2', revenue: 35000, profit: 8200 },
  { name: 'Week 3', revenue: 42000, profit: 11000 },
  { name: 'Week 4', revenue: 58000, profit: 16500 },
];

export default function AdminRevenue() {
  return (
    <div style={{ padding: '2.5rem 2rem', maxWidth: '80rem', margin: '0 auto', minHeight: '100vh', background: 'var(--bg)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2.5rem' }}>
        <div>
          <h1 style={{ ...S.h, fontSize: '1.75rem', margin: 0 }}>Revenue Analytics</h1>
          <p style={{ ...S.muted, marginTop: '0.25rem' }}>Detailed financial breakdown and margin analysis.</p>
        </div>
        <button style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 1.25rem', borderRadius: 'var(--radius-full)', background: '#16a34a', color: 'white', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.875rem' }}>
          <Download size={15} /> Export Finance Report
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
        {[
          { label: 'Total Revenue (MTD)', val: '$159,000', icon: <DollarSign size={16}/> },
          { label: 'Net Profit Margin', val: '28.4%', icon: <PieChart size={16}/> },
          { label: 'Avg Order Value', val: '$42.50', icon: <TrendingUp size={16}/> },
        ].map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} style={{ ...S.card, padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <div style={{ width: '3.5rem', height: '3.5rem', borderRadius: '1rem', background: '#dcfce7', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {s.icon}
            </div>
            <div>
              <p style={{ ...S.label, marginBottom: '0.25rem' }}>{s.label}</p>
              <p style={{ ...S.h, fontSize: '1.75rem', margin: 0 }}>{s.val}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ ...S.card, padding: '2rem' }}>
        <h3 style={{ ...S.h, fontSize: '1.1rem', margin: 0, marginBottom: '2rem' }}>Revenue vs Profit</h3>
        <div style={{ height: '350px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'var(--outline)' }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'var(--outline)' }} tickFormatter={v => `$${v/1000}k`} />
              <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }} />
              <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#10b981" fillOpacity={0.1} fill="#10b981" />
              <Area type="monotone" dataKey="profit" name="Profit" stroke="#3b82f6" fillOpacity={0.1} fill="#3b82f6" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>
    </div>
  );
}
