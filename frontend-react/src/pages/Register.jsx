import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { motion, useAnimation } from 'framer-motion';
import { User, Mail, Lock, ArrowRight, AlertCircle, Leaf, ShoppingCart, Tractor, Truck } from 'lucide-react';

export default function Register() {
  const [nama, setNama]         = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole]         = useState('pembeli');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
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
      controls.start({ x: [0, -12, 12, -8, 8, -4, 4, 0], transition: { duration: 0.45 } });
    }
    setLoading(false);
  };

  const roles = [
    { value: 'pembeli',  icon: <ShoppingCart className="w-6 h-6" />, name: 'Pembeli',  desc: 'Belanja sayur segar pilihan' },
    { value: 'supplier', icon: <Tractor className="w-6 h-6" />,      name: 'Supplier', desc: 'Buka toko sayur digital Anda' },
    { value: 'courier',  icon: <Truck className="w-6 h-6" />,        name: 'Kurir',    desc: 'Antar kesegaran ke pelanggan' },
  ];

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--bg)', fontFamily: 'var(--font-body)' }}>
      {/* ── Left Panel ─────────────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-2/5 relative overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1595856121406-03f4aab82a88?q=80&w=1974&auto=format&fit=crop"
          alt="Lahan Pertanian"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(160deg, rgba(0,74,29,0.90) 0%, rgba(0,77,46,0.78) 100%)' }} />

        <div className="relative z-10 flex flex-col justify-between p-14 h-full text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)' }}>
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 800 }}>SayurSehat</span>
          </div>

          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', fontWeight: 800, lineHeight: 1.15, letterSpacing: '-0.02em', marginBottom: '1rem' }}>
              Gabung dalam<br />Ekosistem<br />Kesegaran Digital.
            </h1>
            <p style={{ color: 'rgba(206,255,208,0.80)', fontSize: '0.9rem', lineHeight: 1.7, maxWidth: '18rem' }}>
              Membawa hasil bumi terbaik langsung dari petani ke meja makan Anda dengan transparansi penuh.
            </p>
            <div className="mt-6 inline-flex items-center gap-2 px-3 py-1.5 rounded-full" style={{ background: 'rgba(107,255,143,0.12)', border: '1px solid rgba(107,255,143,0.25)' }}>
              <span style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.06em', color: '#6bff8f' }}>✦ 100% ORGANIK · PANEN HARI INI</span>
            </div>
          </div>

          <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.40)' }}>© 2024 SayurSehat — The Digital Greenhouse. All rights reserved.</p>
        </div>
      </div>

      {/* ── Right Panel: Registration Form ──────────────────────── */}
      <div className="w-full lg:w-3/5 flex items-start justify-center p-6 sm:p-12 overflow-y-auto">
        <div className="w-full max-w-md py-8">
          {/* Mobile logo */}
          <div className="lg:hidden flex justify-center mb-8">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: 'var(--brand-gradient)' }}>
              <Leaf className="w-6 h-6 text-white" />
            </div>
          </div>

          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-heading)', marginBottom: '0.3rem' }}>
              Mulai Perjalanan Anda
            </h2>
            <p style={{ fontSize: '0.87rem', color: 'var(--text-body)', marginBottom: '1.75rem' }}>
              Pilih peran Anda dan lengkapi data diri.
            </p>
          </motion.div>

          {error && (
            <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
              className="flex items-start gap-2 px-4 py-3 rounded-xl mb-5"
              style={{ background: 'rgba(176,37,0,0.08)', color: 'var(--md-error)' }}>
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <p style={{ fontSize: '0.83rem', fontWeight: 500 }}>{error}</p>
            </motion.div>
          )}

          <motion.form onSubmit={handleSubmit} className="space-y-5" animate={controls}>
            {/* Role Selector */}
            <div>
              <label className="label-sm block mb-2">Pilih Tipe Akun</label>
              <div className="grid grid-cols-3 gap-3">
                {roles.map((r) => {
                  const active = role === r.value;
                  return (
                    <button
                      key={r.value} type="button" onClick={() => setRole(r.value)}
                      style={{
                        padding: '1rem 0.5rem',
                        borderRadius: 'var(--radius-md)',
                        background: active ? 'var(--md-primary-container)' : 'var(--surface-container)',
                        color: active ? 'var(--md-on-primary-container)' : 'var(--on-surface-variant)',
                        border: 'none', cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem',
                        transform: active ? 'scale(1.03)' : 'scale(1)',
                      }}
                    >
                      <span style={{ color: active ? 'var(--md-on-primary-container)' : 'var(--outline)' }}>{r.icon}</span>
                      <span style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, fontFamily: 'var(--font-display)' }}>{r.name}</span>
                      <span style={{ display: 'block', fontSize: '0.62rem', lineHeight: 1.3, color: active ? 'var(--md-on-primary-container)' : 'var(--outline)' }}>{r.desc}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Name */}
            <div>
              <label className="label-sm block mb-1.5">Nama Lengkap</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--outline)' }} />
                <input type="text" required minLength={3} value={nama} onChange={e => setNama(e.target.value)} placeholder="Mis: Budi Santoso" className="input-field pl-10" />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="label-sm block mb-1.5">Alamat Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--outline)' }} />
                <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="anda@email.com" className="input-field pl-10" />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="label-sm block mb-1.5">Kata Sandi</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--outline)' }} />
                <input type="password" required minLength={8} value={password} onChange={e => setPassword(e.target.value)} placeholder="Minimal 8 karakter" className="input-field pl-10" />
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full justify-center" style={{ paddingTop: '0.9rem', paddingBottom: '0.9rem', marginTop: '0.5rem' }}>
              {loading ? (
                <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Membuat Akun...</>
              ) : (
                <>Daftar Sekarang <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </motion.form>

          <p className="text-center mt-6" style={{ fontSize: '0.83rem', color: 'var(--text-body)' }}>
            Sudah punya akun?{' '}<Link to="/login" style={{ color: 'var(--md-primary)', fontWeight: 700 }}>Masuk di sini</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
