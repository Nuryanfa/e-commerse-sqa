import { useState, useEffect } from 'react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { Truck, MapPin, Loader2, Save, CheckCircle, Package, UserCheck } from 'lucide-react';

const S = {
  h: { fontFamily: 'var(--font-display)', fontWeight: 800, color: 'var(--text-heading)' },
  muted: { fontSize: '0.78rem', color: 'var(--outline)' },
  card: { background: 'var(--surface-container-lowest)', borderRadius: 'var(--radius-xl)', padding: '1.5rem', border: '1px solid var(--border)', marginBottom: '1.5rem' },
  btn: { padding: '0.5rem 1rem', borderRadius: 'var(--radius-md)', fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.35rem', transition: 'all 0.2s', border: 'none' },
};

const STATUS_MAP = {
  PAID:      { label: 'Menunggu Supplier', color: '#f59e0b', bg: '#fffbeb' },
  PROCESSED: { label: 'Siap Ditugaskan',  color: '#3b82f6', bg: '#eff6ff' },
  SHIPPED:   { label: 'Dikirim',        color: '#8b5cf6', bg: '#f5f3ff' },
  DELIVERED: { label: 'Selesai',        color: '#10b981', bg: '#ecfdf5' },
};

export default function AdminLogistics() {
  const [couriers, setCouriers] = useState([]);
  const [orders, setOrders]     = useState([]);
  const [loading, setLoading]   = useState(true);
  const [assigning, setAssigning] = useState(null); // orderID being assigned
  const [selectedCourier, setSelectedCourier] = useState({}); // { [orderID]: courierID }
  const toast = useToast();

  const [toggles, setToggles] = useState({
    autoAssign: true,
    international: false,
    insurance: true
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [usersRes, ordersRes] = await Promise.all([
        api.get('/admin/users'),
        api.get('/admin/orders'),
      ]);
      const allUsers = Array.isArray(usersRes.data.data) ? usersRes.data.data : (usersRes.data.data?.data || []);
      setCouriers(allUsers.filter(u => u.role === 'courier'));
      setOrders(Array.isArray(ordersRes.data.data) ? ordersRes.data.data : (ordersRes.data.data?.data || []));
    } catch {
      toast.error('Gagal mengambil data logistik');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleAssign = async (orderID) => {
    const courierID = selectedCourier[orderID];
    if (!courierID) { toast.error('Pilih kurir terlebih dahulu'); return; }
    setAssigning(orderID);
    try {
      await api.patch(`/admin/orders/${orderID}/assign-courier`, { courier_id: courierID });
      toast.success('Kurir berhasil ditugaskan!');
      fetchData(); // refresh list
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menugaskan kurir');
    } finally {
      setAssigning(null);
    }
  };

  const handleToggle = (key) => setToggles(prev => ({...prev, [key]: !prev[key]}));
  const handleSaveConfig = () => toast.success('Konfigurasi logistik berhasil disimpan');

  return (
    <div style={{ padding: '2.5rem 2rem', maxWidth: '80rem', margin: '0 auto', minHeight: '100vh', background: 'var(--bg)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
        <div>
          <h1 style={{ ...S.h, fontSize: '1.75rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Truck size={24} color="#0ea5e9" /> Logistics Management
          </h1>
          <p style={{ ...S.muted, marginTop: '0.25rem' }}>Pantau pesanan dan tugaskan kurir setelah supplier selesai menyiapkannya.</p>
        </div>
        <button onClick={handleSaveConfig} style={{ ...S.btn, background: '#0ea5e9', color: 'white' }}>
          <Save size={14} /> Simpan Konfigurasi
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem', alignItems: 'start' }}>
        
        {/* Left: Config */}
        <div>
          <div style={S.card}>
            <h3 style={{ ...S.h, fontSize: '1.1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Settings2Icon /> Pengaturan Pengiriman
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              <ToggleRow label="Auto-Assign Kurir Terdekat" desc="Aplikasi akan mencari kurir dengan jarak terpendek secara otomatis." active={toggles.autoAssign} onToggle={() => handleToggle('autoAssign')} />
              <ToggleRow label="Wajib Asuransi Pengiriman" desc="Menambahkan biaya asuransi default untuk barang di atas Rp 1.000.000." active={toggles.insurance} onToggle={() => handleToggle('insurance')} />
            </div>
          </div>

          <div style={S.card}>
            <h3 style={{ ...S.h, fontSize: '1.1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <MapPin size={18} color="var(--outline)" /> Kurir Aktif ({couriers.length})
            </h3>
            {couriers.length === 0 ? (
              <p style={{ ...S.muted, textAlign: 'center', padding: '1rem 0' }}>Belum ada kurir terdaftar.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {couriers.map(u => (
                  <div key={u.id_user} style={{ padding: '0.75rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#f0f9ff', color: '#0ea5e9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.85rem' }}>
                        {(u.nama || u.name || 'K').charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p style={{ margin: 0, fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-heading)' }}>{u.nama || u.name}</p>
                        <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--outline)' }}>{u.email}</p>
                      </div>
                    </div>
                    <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '0.2rem 0.5rem', borderRadius: 4, background: '#ecfdf5', color: '#10b981', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <CheckCircle size={10} /> Aktif
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Pesanan Aktif */}
        <div style={S.card}>
          <h3 style={{ ...S.h, fontSize: '1.1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Package size={18} color="var(--outline)" /> Aktivitas Kurir & Pengiriman
          </h3>
          {loading ? (
            <div style={{ padding: '3rem', display: 'flex', justifyContent: 'center', color: 'var(--outline)' }}>
              <Loader2 className="animate-spin" />
            </div>
          ) : orders.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--outline)' }}>
              <Package size={40} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
              <p>Tidak ada pesanan yang perlu diproses saat ini.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {orders.map(order => {
                const st = STATUS_MAP[order.status] || STATUS_MAP['PAID'];
                return (
                  <div key={order.id_order} style={{ padding: '1rem 1.25rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', background: 'var(--bg)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                      <div>
                        <p style={{ margin: 0, fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-heading)', fontFamily: 'monospace' }}>#{order.id_order?.slice(0, 8).toUpperCase()}</p>
                        <p style={{ margin: '0.2rem 0 0', fontSize: '0.78rem', color: 'var(--outline)' }}>Pembeli: <strong>{order.buyer_name || '-'}</strong></p>
                        <p style={{ margin: '0.1rem 0 0', fontSize: '0.78rem', color: 'var(--outline)' }}>Total: <strong>Rp {(order.total_amount || 0).toLocaleString('id-ID')}</strong></p>
                      </div>
                      <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '0.25rem 0.65rem', borderRadius: 20, background: st.bg, color: st.color }}>
                        {st.label}
                      </span>
                    </div>

                    {order.courier_name ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0.75rem', background: '#eff6ff', borderRadius: 8, fontSize: '0.78rem', color: '#2563eb', fontWeight: 600 }}>
                        <UserCheck size={14} /> Sedang diproses oleh kurir: {order.courier_name}
                      </div>
                    ) : order.status === 'PROCESSED' ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0.75rem', background: '#fef2f2', borderRadius: 8, fontSize: '0.78rem', color: '#dc2626', fontWeight: 600 }}>
                        <Truck size={14} /> Menunggu diambil kurir di kolam orderan...
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Settings2Icon() {
  return <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--outline)' }}><path d="M20 7h-9"/><path d="M14 17H5"/><circle cx="17" cy="17" r="3"/><circle cx="7" cy="7" r="3"/></svg>
}

function ToggleRow({ label, desc, active, onToggle }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
      <div>
        <p style={{ margin: 0, fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-heading)' }}>{label}</p>
        <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--outline)' }}>{desc}</p>
      </div>
      <button onClick={onToggle} style={{ flexShrink: 0, width: 44, height: 24, borderRadius: 12, background: active ? '#0ea5e9' : 'var(--surface-container-high)', border: 'none', position: 'relative', cursor: 'pointer', transition: 'background 0.3s' }}>
        <div style={{ width: 18, height: 18, borderRadius: '50%', background: 'white', position: 'absolute', top: 3, left: active ? 23 : 3, transition: 'left 0.3s', boxShadow: 'var(--shadow-sm)' }} />
      </button>
    </div>
  );
}
