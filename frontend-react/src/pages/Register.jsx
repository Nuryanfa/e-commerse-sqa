import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { motion, useAnimation } from 'framer-motion';
import { User, Mail, Lock, ArrowRight, AlertCircle, Leaf, ShoppingCart, Tractor, Truck } from 'lucide-react';

export default function Register() {
  const [nama,     setNama]     = useState('');
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [role,     setRole]     = useState('pembeli');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);
  const navigate = useNavigate();
  const controls = useAnimation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/auth/register', { nama, email, password, role });
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.error || 'Pendaftaran gagal. Silakan coba lagi.');
      controls.start({ x: [0, -10, 10, -7, 7, 0], transition: { duration: 0.4 } });
    }
    setLoading(false);
  };

  const roles = [
    { value: 'pembeli',  icon: <ShoppingCart style={{ width: '1.25rem', height: '1.25rem' }} />, name: 'Pembeli',  desc: 'Belanja sayur segar pilihan' },
    { value: 'supplier', icon: <Tractor     style={{ width: '1.25rem', height: '1.25rem' }} />, name: 'Supplier', desc: 'Buka toko sayur digital Anda' },
    { value: 'courier',  icon: <Truck       style={{ width: '1.25rem', height: '1.25rem' }} />, name: 'Kurir',    desc: 'Antar kesegaran ke pelanggan' },
  ];

  const inputStyle = { width: '100%', padding: '0.75rem 1rem 0.75rem 2.75rem', borderRadius: 'var(--radius-md)', background: 'var(--surface-container)', border: 'none', color: 'var(--on-surface)', fontSize: '0.875rem', outline: 'none', fontFamily: 'var(--font-body)', boxSizing: 'border-box' };

  return (
    <div className="min-h-screen grid lg:grid-cols-2" style={{ background: 'var(--bg)', fontFamily: 'var(--font-body)' }}>

      {/* ── Left: Botanical full-bleed ──────────────────────── */}
      <div className="hidden lg:block relative overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1595856121406-03f4aab82a88?q=80&w=1974&auto=format&fit=crop"
          alt="Lahan Pertanian"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(155deg, rgba(0,50,20,0.92) 0%, rgba(0,90,40,0.72) 100%)' }} />
        <div className="relative z-10 flex flex-col justify-between h-full p-14">
          <div className="flex items-center gap-3">
            <div style={{ width: '2.5rem', height: '2.5rem', borderRadius: '0.75rem', background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Leaf style={{ width: '1.125rem', height: '1.125rem', color: 'white' }} />
            </div>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.2rem', color: 'white' }}>SayurSehat</span>
          </div>
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.75rem', fontWeight: 800, lineHeight: 1.1, letterSpacing: '-0.025em', color: 'white', marginBottom: '1.25rem' }}>
              Gabung dalam<br />Ekosistem<br />Kesegaran Digital.
            </h1>
            <p style={{ color: 'rgba(200,255,210,0.75)', fontSize: '0.9rem', lineHeight: 1.75, maxWidth: '22rem' }}>
              Membawa hasil bumi terbaik langsung dari petani ke meja makan Anda dengan transparansi penuh.
            </p>
          </div>
          <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.35)' }}>© 2024 SayurSehat — The Digital Greenhouse</p>
        </div>
      </div>

      {/* ── Right: Register Form ─────────────────────────────── */}
      <div className="flex items-start justify-center p-8 sm:p-12 overflow-y-auto">
        <div className="w-full max-w-md py-6">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2.5 mb-8">
            <div style={{ width: '2rem', height: '2rem', borderRadius: '0.625rem', background: 'var(--brand-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Leaf style={{ width: '1rem', height: '1rem', color: 'white' }} />
            </div>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.1rem', color: 'var(--text-heading)' }}>SayurSehat</span>
          </div>

          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.875rem', fontWeight: 800, color: 'var(--text-heading)', marginBottom: '0.35rem' }}>Mulai Perjalanan Anda</h2>
            <p style={{ color: 'var(--outline)', fontSize: '0.875rem', marginBottom: '2rem' }}>
              Sudah punya akun?{' '}
              <Link to="/login" style={{ color: 'var(--md-primary)', fontWeight: 700, textDecoration: 'none' }}>Masuk di sini</Link>
            </p>
          </motion.div>

          {error && (
            <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
              className="flex items-start gap-2.5 px-4 py-3 rounded-xl mb-5"
              style={{ background: 'rgba(176,37,0,0.08)', color: 'var(--md-error)' }}>
              <AlertCircle style={{ width: '1rem', height: '1rem', flexShrink: 0, marginTop: '0.05rem' }} />
              <p style={{ fontSize: '0.83rem', fontWeight: 500 }}>{error}</p>
            </motion.div>
          )}

          <motion.form onSubmit={handleSubmit} animate={controls}>
            {/* Role selector */}
            <div style={{ marginBottom: '1.5rem' }}>
              <p style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--on-surface-variant)', marginBottom: '0.75rem', letterSpacing: '0.025em' }}>Pilih Tipe Akun</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
                {roles.map(r => {
                  const active = role === r.value;
                  return (
                    <button key={r.value} type="button" onClick={() => setRole(r.value)}
                      style={{
                        padding: '1rem 0.5rem', borderRadius: 'var(--radius-md)', border: 'none', cursor: 'pointer',
                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem', textAlign: 'center',
                        background: active ? 'var(--md-primary-container)' : 'var(--surface-container)',
                        color:      active ? 'var(--md-on-primary-container)' : 'var(--on-surface-variant)',
                        transform:  active ? 'scale(1.03)' : 'scale(1)',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      {r.icon}
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, fontFamily: 'var(--font-display)' }}>{r.name}</span>
                      <span style={{ fontSize: '0.62rem', lineHeight: 1.3, color: active ? 'var(--md-on-primary-container)' : 'var(--outline)' }}>{r.desc}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Name */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--on-surface-variant)', marginBottom: '0.5rem', letterSpacing: '0.025em' }}>Nama Lengkap</label>
                <div style={{ position: 'relative' }}>
                  <User style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', width: '1rem', height: '1rem', color: 'var(--outline)' }} />
                  <input type="text" required minLength={3} value={nama} onChange={e => setNama(e.target.value)} placeholder="Mis: Budi Santoso" style={inputStyle} onFocus={e => e.target.style.boxShadow = '0 0 0 2px var(--md-primary)'} onBlur={e => e.target.style.boxShadow = 'none'} />
                </div>
              </div>

              {/* Email */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--on-surface-variant)', marginBottom: '0.5rem', letterSpacing: '0.025em' }}>Alamat Email</label>
                <div style={{ position: 'relative' }}>
                  <Mail style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', width: '1rem', height: '1rem', color: 'var(--outline)' }} />
                  <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="anda@email.com" style={inputStyle} onFocus={e => e.target.style.boxShadow = '0 0 0 2px var(--md-primary)'} onBlur={e => e.target.style.boxShadow = 'none'} />
                </div>
              </div>

              {/* Password */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--on-surface-variant)', marginBottom: '0.5rem', letterSpacing: '0.025em' }}>Kata Sandi</label>
                <div style={{ position: 'relative' }}>
                  <Lock style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', width: '1rem', height: '1rem', color: 'var(--outline)' }} />
                  <input type="password" required minLength={8} value={password} onChange={e => setPassword(e.target.value)} placeholder="Minimal 8 karakter" style={{ ...inputStyle }} onFocus={e => e.target.style.boxShadow = '0 0 0 2px var(--md-primary)'} onBlur={e => e.target.style.boxShadow = 'none'} />
                </div>
              </div>

              <button type="submit" disabled={loading} className="btn-primary w-full justify-center" style={{ paddingTop: '0.875rem', paddingBottom: '0.875rem', fontSize: '0.925rem' }}>
                {loading
                  ? <><span style={{ width: '1rem', height: '1rem', borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} /> Membuat Akun...</>
                  : <>Daftar Sekarang <ArrowRight style={{ width: '1rem', height: '1rem' }} /></>
                }
              </button>
            </div>
          </motion.form>
        </div>
      </div>
    </div>
  );
}
