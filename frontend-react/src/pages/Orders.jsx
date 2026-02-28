import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { motion } from 'framer-motion';
import { Box, Clock, CreditCard, Truck, CheckCircle, PackageOpen, ChevronRight, FileText } from 'lucide-react';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/orders').then(res => setOrders(res.data.data || [])).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const statusConfig = {
    PENDING: { bg: 'bg-amber-100 dark:bg-amber-900/20', text: 'text-amber-700 dark:text-amber-400', icon: <Clock className="w-5 h-5" /> },
    PAID: { bg: 'bg-blue-100 dark:bg-blue-900/20', text: 'text-blue-700 dark:text-blue-400', icon: <CreditCard className="w-5 h-5" /> },
    SHIPPED: { bg: 'bg-purple-100 dark:bg-purple-900/20', text: 'text-purple-700 dark:text-purple-400', icon: <Truck className="w-5 h-5" /> },
    DELIVERED: { bg: 'bg-emerald-100 dark:bg-emerald-900/20', text: 'text-emerald-700 dark:text-emerald-400', icon: <CheckCircle className="w-5 h-5" /> },
  };

  if (loading) return <div className="max-w-4xl mx-auto px-4 py-8 space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-24 skeleton" />)}</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8" style={{ background: 'var(--surface-base)' }}>
      <h1 className="text-2xl font-black mb-6 animate-fade-in-up tracking-tight flex items-center gap-2" style={{ color: 'var(--text-heading)' }}><Box className="w-7 h-7 text-primary-500" /> Pesanan Saya</h1>

      {orders.length === 0 ? (
        <div className="card-organic p-16 text-center animate-fade-in-up flex flex-col items-center">
          <PackageOpen className="w-20 h-20 text-gray-300 mb-5 animate-float opacity-60" />
          <h3 className="text-lg font-bold" style={{ color: 'var(--text-heading)' }}>Belum Ada Pesanan</h3>
          <p className="text-sm mt-1 mb-6" style={{ color: 'var(--text-muted)' }}>Mulai belanja untuk melihat pesanan Anda</p>
          <Link to="/products" className="btn-primary px-6 py-2.5 text-sm inline-block">Mulai Belanja →</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((o, i) => {
            const cfg = statusConfig[o.status] || { bg: 'bg-slate-100', text: 'text-slate-600', icon: <FileText className="w-5 h-5" /> };
            return (
              <Link key={o.id_order} to={`/orders/${o.id_order}`} className={`card-organic p-5 block group animate-fade-in-up stagger-${Math.min(i + 1, 8)}`}>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-2xl ${cfg.bg} flex items-center justify-center ${cfg.text}`}>{cfg.icon}</div>
                    <div>
                      <p className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>#{o.id_order?.slice(0, 8)}</p>
                      <p className="font-black text-lg" style={{ color: 'var(--text-accent)' }}>Rp {o.total_amount?.toLocaleString('id-ID')}</p>
                      <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{new Date(o.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-[10px] font-bold px-3 py-1 rounded-full ${cfg.bg} ${cfg.text}`}>{o.status}</span>
                    <ChevronRight className="w-5 h-5 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" style={{ color: 'var(--text-muted)' }} />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
