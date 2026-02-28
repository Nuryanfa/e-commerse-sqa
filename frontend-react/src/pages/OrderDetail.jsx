import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { ArrowLeft, ClipboardSignature, CreditCard, Truck, CheckCircle, Leaf, RefreshCw, Loader2, Clock } from 'lucide-react';

export default function OrderDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const toast = useToast();

  const fetchOrder = () => { api.get(`/orders/${id}`).then(r => setOrder(r.data.data)).catch(() => navigate('/orders')).finally(() => setLoading(false)); };
  useEffect(() => { fetchOrder(); }, [id]);

  const pay = async () => {
    setPaying(true);
    try { await api.patch(`/orders/${id}/pay`); toast.success('Pembayaran berhasil!'); fetchOrder(); }
    catch (err) { toast.error(err.response?.data?.error || 'Gagal bayar'); }
    setPaying(false);
  };

  const statusSteps = [
    { id: 'PENDING', title: 'Pesanan Dibuat', desc: 'Menunggu pembayaran', icon: <ClipboardSignature className="w-5 h-5" /> },
    { id: 'PAID', title: 'Pembayaran Dikonfirmasi', desc: 'Pesanan sedang diproses', icon: <CreditCard className="w-5 h-5" /> },
    { id: 'SHIPPED', title: 'Dalam Perjalanan', desc: 'Pesanan diantar kurir', icon: <Truck className="w-5 h-5" /> },
    { id: 'DELIVERED', title: 'Selesai', desc: 'Pesanan diterima', icon: <CheckCircle className="w-5 h-5" /> },
  ];
  const statuses = ['PENDING', 'PAID', 'SHIPPED', 'DELIVERED'];

  if (loading) return <div className="max-w-4xl mx-auto px-4 py-8"><div className="h-96 skeleton" /></div>;
  if (!order) return null;

  const currentIdx = statuses.indexOf(order.status);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8" style={{ background: 'var(--surface-base)' }}>
      <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm font-medium mb-6 cursor-pointer transition-all duration-300 hover:-translate-x-1" style={{ color: 'var(--text-secondary)' }}>
        <ArrowLeft className="w-4 h-4" /> Kembali
      </button>

      <div className="card-organic p-8 animate-fade-in-up">
        <div className="flex justify-between items-start mb-8">
          <div>
            <p className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>Order #{order.id_order?.slice(0, 8)}</p>
            <p className="text-xs mt-1 flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
              <Clock className="w-3.5 h-3.5" /> {new Date(order.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        </div>

        {/* Timeline */}
        <div className="relative pl-8 mb-10">
          <div className="absolute left-[18px] top-2 bottom-2 w-0.5 rounded-full" style={{ background: 'var(--border-primary)' }} />
          {statusSteps.map((step, i) => {
            const isActive = i <= currentIdx;
            const isCurrent = i === currentIdx;
            return (
              <div key={step.id} className={`relative flex gap-5 mb-8 last:mb-0 animate-fade-in-up stagger-${i + 1}`}>
                <div className={`w-9 h-9 shrink-0 rounded-full flex items-center justify-center text-base shadow-sm transition-all duration-500 z-10 ${
                  isActive ? (isCurrent ? 'bg-gradient-to-br from-emerald-400 to-emerald-600 text-white ring-4 ring-emerald-50 dark:ring-emerald-900/30 scale-110' : 'bg-emerald-600 text-white')
                  : ''
                }`} style={!isActive ? { background: 'var(--surface-card)', border: '2px solid var(--border-primary)', color: 'var(--text-muted)' } : {}}>
                  <span className={!isActive ? 'grayscale opacity-40' : ''}>{step.icon}</span>
                </div>
                <div className={`pt-1 transition-all duration-300 ${isActive ? 'opacity-100' : 'opacity-30'}`}>
                  <h4 className="font-bold text-sm" style={{ color: isActive ? 'var(--text-heading)' : 'var(--text-muted)' }}>{step.title}</h4>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>{step.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Items */}
        <div className="mb-8">
          <h4 className="font-bold text-sm mb-3" style={{ color: 'var(--text-heading)' }}>Daftar Belanja</h4>
          <div className="space-y-2">
            {order.items?.map(item => (
              <div key={item.id_order_item} className="flex items-center gap-4 p-4 rounded-2xl transition-colors duration-300 hover:bg-emerald-50/30 dark:hover:bg-emerald-900/10" style={{ border: '1px solid var(--border-light)' }}>
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0" style={{ background: 'var(--surface-muted)' }}>
                  {item.product?.image_url ? <img src={item.product.image_url} className="w-full h-full object-cover rounded-2xl" /> : <Leaf className="w-6 h-6 text-emerald-600 opacity-80" />}
                </div>
                <div className="flex-1">
                  <p className="font-bold text-sm" style={{ color: 'var(--text-heading)' }}>{item.product?.name || 'Produk'}</p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{item.quantity}x @ Rp {item.price_at_purchase?.toLocaleString('id-ID')}</p>
                </div>
                <p className="font-black text-sm" style={{ color: 'var(--text-accent)' }}>Rp {(item.price_at_purchase * item.quantity).toLocaleString('id-ID')}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Total */}
        <div className="flex justify-between items-center p-6 -mx-8 -mb-8 rounded-b-[19px]" style={{ background: 'var(--surface-muted)', borderTop: '1px solid var(--border-light)' }}>
          <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>Total Pembayaran</p>
          <p className="text-2xl font-black" style={{ color: 'var(--text-accent)' }}>Rp {order.total_amount?.toLocaleString('id-ID')}</p>
        </div>
      </div>

      {order.status === 'PENDING' && user?.role === 'pembeli' && (
        <button onClick={pay} disabled={paying} className="w-full mt-6 btn-primary py-4 text-sm cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 transition-all shadow-md">
          {paying ? <Loader2 className="w-5 h-5 animate-spin" /> : <CreditCard className="w-5 h-5" />} {paying ? 'Memproses...' : 'Bayar Sekarang'}
        </button>
      )}

      {order.status === 'DELIVERED' && user?.role === 'pembeli' && (
        <button onClick={async () => {
          setPaying(true);
          try {
            await Promise.all(order.items.map(item => 
              api.post('/cart', { id_product: item.id_product, quantity: item.quantity })
            ));
            toast.success('Berhasil menambahkan ulang ke keranjang!', 4000, {
              label: 'Lihat Keranjang ➔',
              onClick: () => navigate('/cart')
            });
          } catch (err) {
            toast.error('Beberapa sayur gagal ditambahkan (Mungkin stok habis)');
          }
          setPaying(false);
        }} disabled={paying} className="w-full mt-6 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 dark:bg-emerald-900/30 dark:hover:bg-emerald-900/50 dark:text-emerald-300 font-bold py-4 rounded-2xl transition-all shadow-sm cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2">
          {paying ? <Loader2 className="w-5 h-5 animate-spin" /> : <RefreshCw className="w-5 h-5" />} {paying ? 'Memproses...' : 'Beli Ulang Pesanan Ini'}
        </button>
      )}
    </div>
  );
}
