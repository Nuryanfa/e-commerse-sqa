import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Banknote, ShoppingCart, AlertTriangle, ChevronRight, Package, Truck } from 'lucide-react';

const S = {
  card:  { background: 'var(--surface-container-lowest)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border)', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' },
  label: { fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.02em', color: 'var(--outline)', fontFamily: 'var(--font-display)' },
  h:     { fontFamily: 'var(--font-display)', fontWeight: 800, color: 'var(--text-heading)' },
  muted: { fontSize: '0.875rem', color: 'var(--outline)' },
};

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
        setProducts(p.data.data || []);
        setOrders(o.data.data || []);
      })
      .catch(() => toast.error('Gagal memuat data dashboard'))
      .finally(() => setLoading(false));
  }, []);

  const totalSales = orders
    .filter(o => o.status !== 'CANCELLED' && o.status !== 'REFUNDED')
    .reduce((sum, o) => sum + o.total_amount, 0);
  
  const activeOrders = orders.filter(o => ['PAID', 'PROCESSED', 'SHIPPED'].includes(o.status)).length;
  const stockAlerts = products.filter(p => p.stock <= 10).length;

  const recentProducts = products.slice(0, 5);
  const recentOrders   = orders.filter(o => o.status === 'PAID').slice(0, 3);

  const processOrder = (id) => {
    api.put(`/supplier/orders/${id}/status`, { status: "PROCESSED" })
      .then(() => { toast.success('Pesanan diproses'); setOrders(orders.map(o => o.id_order === id ? { ...o, status: 'PROCESSED' } : o)); })
      .catch(() => toast.error('Gagal proses pesanan'));
  };

  return (
    <div style={{ padding: '2.5rem 2rem', maxWidth: '75rem', margin: '0 auto', minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Header */}
      <div style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ ...S.h, fontSize: '1.75rem', margin: 0 }}>Dashboard Overview</h1>
        <p style={{ ...S.muted, marginTop: '0.35rem' }}>Welcome back, {user?.nama || 'Seller'}. Here's what's happening today.</p>
      </div>

      {/* Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '2.5rem' }}>
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} style={{ ...S.card, padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
            <div style={{ width: '3rem', height: '3rem', borderRadius: '0.75rem', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#16a34a' }}>
              <Banknote size={20} strokeWidth={2.5} />
            </div>
            <span style={{ background: '#dcfce7', color: '#16a34a', fontSize: '0.75rem', fontWeight: 700, padding: '0.25rem 0.6rem', borderRadius: 'var(--radius-full)' }}>+12.5%</span>
          </div>
          <p style={{ ...S.label }}>Total Sales (MTD)</p>
          <p style={{ ...S.h, fontSize: '2rem', marginTop: '0.25rem' }}>Rp {(totalSales/1000000).toFixed(2)}M</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} style={{ ...S.card, padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
            <div style={{ width: '3rem', height: '3rem', borderRadius: '0.75rem', background: '#e0f2fe', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0284c7' }}>
              <ShoppingCart size={20} strokeWidth={2.5} />
            </div>
            <span style={{ background: '#dcfce7', color: '#16a34a', fontSize: '0.75rem', fontWeight: 700, padding: '0.25rem 0.6rem', borderRadius: 'var(--radius-full)' }}>+5%</span>
          </div>
          <p style={{ ...S.label }}>Active Orders</p>
          <p style={{ ...S.h, fontSize: '2rem', marginTop: '0.25rem' }}>{activeOrders}</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} style={{ ...S.card, padding: '1.5rem', border: stockAlerts > 0 ? '1px solid #fca5a5' : '1px solid var(--border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
            <div style={{ width: '3rem', height: '3rem', borderRadius: '0.75rem', background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#dc2626' }}>
              <AlertTriangle size={20} strokeWidth={2.5} />
            </div>
            {stockAlerts > 0 && <span style={{ color: '#dc2626', fontSize: '0.75rem', fontWeight: 700 }}>{stockAlerts} Items Low</span>}
          </div>
          <p style={{ ...S.label }}>Stock Alerts</p>
          <p style={{ ...S.h, fontSize: '2rem', marginTop: '0.25rem', color: stockAlerts > 0 ? '#dc2626' : 'var(--text-heading)' }}>{stockAlerts > 0 ? 'Requires Attention' : 'All Good'}</p>
        </motion.div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
        {/* Inventory Management Preview */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.25rem' }}>
            <h2 style={{ ...S.h, fontSize: '1.25rem', margin: 0 }}>Inventory Management</h2>
            <Link to="/supplier/products" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.875rem', color: '#16a34a', fontWeight: 600, textDecoration: 'none' }}>
              View All <ChevronRight size={16} />
            </Link>
          </div>
          
          <div style={{ ...S.card, padding: 0, overflow: 'hidden', flex: 1 }}>
            {loading ? (
              <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--outline)' }}>Loading inventory...</div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                <thead>
                  <tr style={{ background: 'var(--surface-container-low)' }}>
                    <th style={{ padding: '1rem 1.5rem', textAlign: 'left', ...S.label }}>PRODUCT</th>
                    <th style={{ padding: '1rem 1.5rem', textAlign: 'left', ...S.label }}>CATEGORY</th>
                    <th style={{ padding: '1rem 1.5rem', textAlign: 'center', ...S.label }}>STOCK</th>
                    <th style={{ padding: '1rem 1.5rem', textAlign: 'left', ...S.label }}>PRICE</th>
                    <th style={{ padding: '1rem 1.5rem', textAlign: 'center', ...S.label }}>STATUS</th>
                  </tr>
                </thead>
                <tbody>
                  {recentProducts.map(p => (
                    <tr key={p.id_product} style={{ borderTop: '1px solid var(--border)', transition: 'background 0.2s' }} onMouseOver={e => e.currentTarget.style.background = 'var(--surface-container-low)'} onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                      <td style={{ padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
                        {p.image_url ? <img src={p.image_url} style={{ width: '2rem', height: '2rem', borderRadius: '0.35rem', objectFit: 'cover' }} /> : <div style={{ width: '2rem', height: '2rem', borderRadius: '0.35rem', background: 'var(--surface-container-high)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Package size={14} color="var(--outline)" /></div>}
                        <span style={{ fontWeight: 600, color: 'var(--text-heading)' }}>{p.name}</span>
                      </td>
                      <td style={{ padding: '1rem 1.5rem', color: 'var(--outline)' }}>{p.category?.name || 'Sayuran'}</td>
                      <td style={{ padding: '1rem 1.5rem', textAlign: 'center', fontWeight: 600, color: p.stock <= 5 ? '#dc2626' : 'var(--text-heading)' }}>{p.stock} kg</td>
                      <td style={{ padding: '1rem 1.5rem', fontWeight: 600, color: 'var(--text-heading)' }}>Rp {p.price.toLocaleString('id-ID')}</td>
                      <td style={{ padding: '1rem 1.5rem', textAlign: 'center' }}>
                        {p.stock > 10 ? <span style={{ background: '#dcfce7', color: '#16a34a', padding: '0.25rem 0.6rem', borderRadius: 'var(--radius-full)', fontSize: '0.7rem', fontWeight: 700 }}>Available</span> : p.stock > 0 ? <span style={{ background: '#fef08a', color: '#854d0e', padding: '0.25rem 0.6rem', borderRadius: 'var(--radius-full)', fontSize: '0.7rem', fontWeight: 700 }}>Low Stock</span> : <span style={{ background: '#fee2e2', color: '#dc2626', padding: '0.25rem 0.6rem', borderRadius: 'var(--radius-full)', fontSize: '0.7rem', fontWeight: 700 }}>Out of Stock</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Orders to Fulfill */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.25rem' }}>
            <h2 style={{ ...S.h, fontSize: '1.25rem', margin: 0 }}>Orders to Fulfill</h2>
            <span style={{ background: '#dcfce7', color: '#16a34a', padding: '0.25rem 0.75rem', borderRadius: 'var(--radius-full)', fontSize: '0.75rem', fontWeight: 700 }}>{recentOrders.length} New</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {recentOrders.length === 0 && !loading && (
              <div style={{ ...S.card, padding: '3rem', textAlign: 'center', color: 'var(--outline)' }}>Semua pesanan sudah diproses!</div>
            )}
            {recentOrders.map(o => (
              <motion.div key={o.id_order} initial={{opacity:0, y:10}} animate={{opacity:1,y:0}} style={{ ...S.card, padding: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--outline)' }}>Order #{o.id_order?.slice(0,8).toUpperCase()}</span>
                  <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--outline)', background: 'var(--surface-container-high)', padding: '0.2rem 0.5rem', borderRadius: '0.25rem' }}>BARU SAJA</span>
                </div>
                <h4 style={{ ...S.h, margin: '0 0 0.5rem 0', fontSize: '1rem' }}>{o.user?.nama || 'Guest Customer'}</h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--outline)', marginBottom: '1rem' }}>
                  <Package size={14} /> <span>{o.items?.length || 1} items</span>
                  <span style={{ width: 3, height: 3, borderRadius: '50%', background: 'var(--outline)' }} />
                  <span>Rp {o.total_amount?.toLocaleString('id-ID')}</span>
                </div>
                <button onClick={() => processOrder(o.id_order)} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', background: '#006c3e', color: 'white', padding: '0.65rem', borderRadius: '0.5rem', border: 'none', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-display)', transition: 'background 0.2s' }} onMouseOver={e=>e.currentTarget.style.background='#005a33'} onMouseOut={e=>e.currentTarget.style.background='#006c3e'}>
                  <Truck size={16} strokeWidth={2.5} /> Process Order
                </button>
              </motion.div>
            ))}
            {recentOrders.length > 0 && (
              <Link to="/supplier/orders" style={{ textAlign: 'center', color: '#16a34a', fontWeight: 600, fontSize: '0.875rem', textDecoration: 'none', padding: '0.5rem' }}>
                Lihat Semua Pesanan
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
