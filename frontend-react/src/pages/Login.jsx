import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, useAnimation } from 'framer-motion';
import { Mail, Lock, ArrowRight, AlertCircle, Leaf } from 'lucide-react';

export default function Login() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const { login }   = useAuth();
  const navigate    = useNavigate();
  const controls    = useAnimation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const role = await login(email, password);
      navigate({ admin: '/admin', supplier: '/supplier', courier: '/courier' }[role] || '/');
    } catch (err) {
      setError(err.response?.data?.error || 'Email atau password salah.');
      controls.start({ x: [0, -12, 12, -8, 8, -4, 4, 0], transition: { duration: 0.45 } });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--bg)', fontFamily: 'var(--font-body)' }}>
      {/* ── Left Panel ─────────────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden" style={{ background: 'var(--md-on-primary-container)' }}>
        {/* Background image */}
        <img
          src="https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=1974&auto=format&fit=crop"
          alt="Fresh Vegetables"
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Overlay */}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(160deg, rgba(0,74,29,0.88) 0%, rgba(0,101,61,0.75) 100%)' }} />

        <div className="relative z-10 flex flex-col justify-between p-16 h-full text-white">
          {/* Logo */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.25)' }}>
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.35rem', fontWeight: 800, letterSpacing: '-0.02em' }}>SayurSehat</span>
          </motion.div>

          {/* Headline */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7, delay: 0.15 }}>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.8rem', fontWeight: 800, lineHeight: 1.1, letterSpacing: '-0.02em', marginBottom: '1.25rem' }}>
              Membawa Kesegaran<br />Kebun Digital<br />ke Pintu Rumah Anda.
            </h1>
            <p style={{ color: 'rgba(206,255,208,0.85)', fontSize: '1rem', lineHeight: 1.65, maxWidth: '22rem' }}>
              Kualitas premium, dipanen hari ini. Bergabung dengan ribuan keluarga yang mempercayakan kebutuhan dapur sehat mereka kepada kami.
            </p>
            {/* Trust badge */}
            <div className="mt-8 inline-flex items-center gap-2 px-4 py-2 rounded-full" style={{ background: 'rgba(107,255,143,0.15)', border: '1px solid rgba(107,255,143,0.30)' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.06em', color: '#6bff8f' }}>✦ 100% ORGANIK · PANEN HARI INI</span>
            </div>
          </motion.div>

          <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.50)' }}>© 2024 SayurSehat — The Digital Greenhouse.</p>
        </div>
      </div>

      {/* ── Right Panel: Login Form ──────────────────────────── */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-sm">

          {/* Mobile logo */}
          <div className="lg:hidden flex justify-center mb-8">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: 'var(--brand-gradient)' }}>
              <Leaf className="w-7 h-7 text-white" />
            </div>
          </div>

          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-heading)', marginBottom: '0.35rem' }}>
              Selamat Datang
            </h2>
            <p style={{ fontSize: '0.87rem', color: 'var(--text-body)', marginBottom: '2rem' }}>
              Silakan masuk ke akun Anda untuk melanjutkan belanja.
            </p>
          </motion.div>

          {/* Error */}
          {error && (
            <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
              className="flex items-start gap-2 px-4 py-3 rounded-xl mb-5"
              style={{ background: 'rgba(176,37,0,0.08)', color: 'var(--md-error)' }}>
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <p style={{ fontSize: '0.83rem', fontWeight: 500 }}>{error}</p>
            </motion.div>
          )}

          <motion.form onSubmit={handleSubmit} className="space-y-4" animate={controls}>
            {/* Email */}
            <div>
              <label className="label-sm block mb-1.5">Alamat Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--outline)' }} />
                <input
                  type="email" required value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="anda@email.com"
                  className="input-field pl-10"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="label-sm">Kata Sandi</label>
                <button type="button"
                  onClick={() => alert('Fitur reset password belum aktif. Hubungi admin@sayursehat.id.')}
                  style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--md-primary)', background: 'none', border: 'none', cursor: 'pointer' }}>
                  Lupa Password?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--outline)' }} />
                <input
                  type="password" required value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input-field pl-10"
                />
              </div>
            </div>

            {/* Submit */}
            <button type="submit" disabled={loading} className="btn-primary w-full justify-center mt-2" style={{ paddingTop: '0.9rem', paddingBottom: '0.9rem' }}>
              {loading ? (
                <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Sedang masuk...</>
              ) : (
                <>Masuk Sekarang <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </motion.form>

          <p className="text-center mt-7" style={{ fontSize: '0.83rem', color: 'var(--text-body)' }}>
            Belum punya akun?{' '}
            <Link to="/register" style={{ color: 'var(--md-primary)', fontWeight: 700 }}>Daftar Sekarang</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
