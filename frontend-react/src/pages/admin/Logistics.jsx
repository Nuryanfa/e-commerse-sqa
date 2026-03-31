import { useState, useEffect } from 'react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { Truck, MapPin, Loader2, Play, Pause, Save, CheckCircle } from 'lucide-react';

const S = {
  h: { fontFamily: 'var(--font-display)', fontWeight: 800, color: 'var(--text-heading)' },
  muted: { fontSize: '0.78rem', color: 'var(--outline)' },
  card: { background: 'var(--surface-container-lowest)', borderRadius: 'var(--radius-xl)', padding: '1.5rem', border: '1px solid var(--border)', marginBottom: '1.5rem' },
  btn: { padding: '0.5rem 1rem', borderRadius: 'var(--radius-md)', fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.35rem', transition: 'all 0.2s', border: 'none' },
};

export default function AdminLogistics() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  const [toggles, setToggles] = useState({
    autoAssign: true,
    international: false,
    insurance: true
  });

  useEffect(() => {
    const fetchCouriers = async () => {
      try {
        const res = await api.get('/admin/users');
        // Filter users who are couriers
        const allUsers = res.data.data || [];
        const couriers = allUsers.filter(u => u.role === 'courier');
        setUsers(couriers);
      } catch (error) {
        toast.error('Gagal mengambil data kurir');
      } finally {
        setLoading(false);
      }
    };
    fetchCouriers();
  }, []);

  const handleToggle = (key) => setToggles(prev => ({...prev, [key]: !prev[key]}));
  const handleSaveConfig = () => toast.success('Konfigurasi logistik berhasil disimpan (Mock)');

  return (
    <div style={{ padding: '2.5rem 2rem', maxWidth: '80rem', margin: '0 auto', minHeight: '100vh', background: 'var(--bg)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
        <div>
          <h1 style={{ ...S.h, fontSize: '1.75rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Truck size={24} color="#0ea5e9" /> Logistics Management
          </h1>
          <p style={{ ...S.muted, marginTop: '0.25rem' }}>Configure global shipping routes and active couriers.</p>
        </div>
        <button onClick={handleSaveConfig} style={{ ...S.btn, background: '#0ea5e9', color: 'white' }}>
          <Save size={14} /> Simpan Konfigurasi
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
        <div>
          <div style={S.card}>
            <h3 style={{ ...S.h, fontSize: '1.1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Settings2Icon /> Pengaturan Pengiriman
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              <ToggleRow 
                label="Auto-Assign Kurir Terdekat" 
                desc="Aplikasi akan mencari kurir dengan jarak terpendek secara otomatis."
                active={toggles.autoAssign} 
                onToggle={() => handleToggle('autoAssign')} 
              />
              <ToggleRow 
                label="Buka Pengiriman Internasional" 
                desc="Mengizinkan pengiriman ke luar negeri (Memerlukan API Eskpedisi)."
                active={toggles.international} 
                onToggle={() => handleToggle('international')} 
              />
              <ToggleRow 
                label="Wajib Asuransi Pengiriman" 
                desc="Menambahkan biaya asuransi default untuk barang di atas Rp 1.000.000."
                active={toggles.insurance} 
                onToggle={() => handleToggle('insurance')} 
              />
            </div>
          </div>
        </div>

        <div>
          <div style={S.card}>
            <h3 style={{ ...S.h, fontSize: '1.1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <MapPin size={18} color="var(--outline)" /> Daftar Kurir Aktif
            </h3>
            
            {loading ? (
              <div style={{ padding: '3rem', display: 'flex', justifyContent: 'center', color: 'var(--outline)' }}>
                <Loader2 className="animate-spin" />
              </div>
            ) : users.length === 0 ? (
              <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--outline)' }}>
                Belum ada kurir yang terdaftar di sistem.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {users.map(u => (
                  <div key={u.id_user} style={{ padding: '1rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#f0f9ff', color: '#0ea5e9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>
                        {u.nama.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p style={{ margin: 0, fontWeight: 700, color: 'var(--text-heading)' }}>{u.nama}</p>
                        <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--outline)' }}>{u.email} • {u.no_hp || 'No HP Belum Diatur'}</p>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '0.2rem 0.6rem', borderRadius: 4, background: '#ecfdf5', color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <CheckCircle size={10} /> Aktif
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Settings2Icon() {
  return <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--outline)' }}><path d="M20 7h-9"/><path d="M14 17H5"/><circle cx="17" cy="17" r="3"/><circle cx="7" cy="7" r="3"/></svg>
}

// Komponen Toggle sederhana (UI Only)
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
