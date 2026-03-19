import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, useAnimation } from 'framer-motion';
import { Mail, Lock, ArrowRight, AlertCircle, Leaf, Eye, EyeOff } from 'lucide-react';

export default function Login() {
  const [email,     setEmail]     = useState('');
  const [password,  setPassword]  = useState('');
  const [showPass,  setShowPass]  = useState(false);
  const [error,     setError]     = useState('');
  const [loading,   setLoading]   = useState(false);
  const navigate  = useNavigate();
  const controls  = useAnimation();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const role = await login(email, password);
      if      (role === 'admin')    navigate('/admin');
      else if (role === 'supplier') navigate('/supplier');
      else if (role === 'courier')  navigate('/courier');
      else                          navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Email atau kata sandi salah.');
      controls.start({ x: [0, -10, 10, -7, 7, 0], transition: { duration: 0.4 } });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2" style={{ background: 'var(--bg)', fontFamily: 'var(--font-body)' }}>

      {/* ── Left: Botanical full-bleed ──────────────────────── */}
      <div className="hidden lg:block relative overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1488459716781-31db52582fe9?q=80&w=2070&auto=format&fit=crop"
          alt="Fresh organic vegetables"
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Dark green gradient overlay */}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(150deg, rgba(0,50,20,0.88) 0%, rgba(0,90,40,0.70) 100%)' }} />

        {/* Content over overlay */}
        <div className="relative z-10 flex flex-col justify-between h-full p-14">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div style={{ width: '2.5rem', height: '2.5rem', borderRadius: '0.75rem', background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Leaf style={{ width: '1.125rem', height: '1.125rem', color: 'white' }} />
            </div>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.2rem', color: 'white' }}>SayurSehat</span>
          </div>

          {/* Headline */}
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.75rem', fontWeight: 800, lineHeight: 1.1, letterSpacing: '-0.025em', color: 'white', marginBottom: '1.25rem' }}>
              Datang Kembali ke<br />Ekosistem<br />Kesegaran Digital.
            </h1>
            <p style={{ color: 'rgba(200,255,210,0.75)', fontSize: '0.9rem', lineHeight: 1.75, maxWidth: '22rem' }}>
              Lanjutkan perjalanan hidup sehat Anda bersama ribuan keluarga Indonesia.
            </p>
            <div className="mt-6 inline-flex items-center gap-2 px-4 py-1.5 rounded-full" style={{ background: 'rgba(107,255,143,0.12)', border: '1px solid rgba(107,255,143,0.22)' }}>
              <span style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.07em', color: '#6bff8f' }}>✦ 100% ORGANIK · PANEN HARI INI</span>
            </div>
          </div>

          <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.35)' }}>© 2024 SayurSehat — The Digital Greenhouse</p>
        </div>
      </div>

      {/* ── Right: Login Form ────────────────────────────────── */}
      <div className="flex items-center justify-center p-8 sm:p-14">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2.5 mb-10">
            <div style={{ width: '2rem', height: '2rem', borderRadius: '0.625rem', background: 'var(--brand-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Leaf style={{ width: '1rem', height: '1rem', color: 'white' }} />
            </div>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.1rem', color: 'var(--text-heading)' }}>SayurSehat</span>
          </div>

          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.875rem', fontWeight: 800, color: 'var(--text-heading)', marginBottom: '0.35rem' }}>
              Masuk ke Akun Anda
            </h2>
            <p style={{ color: 'var(--outline)', fontSize: '0.875rem', marginBottom: '2rem' }}>
              Belum punya akun?{' '}
              <Link to="/register" style={{ color: 'var(--md-primary)', fontWeight: 700, textDecoration: 'none' }}>Daftar gratis</Link>
            </p>
          </motion.div>

          {/* Error */}
          {error && (
            <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
              className="flex items-start gap-2.5 px-4 py-3 rounded-xl mb-6"
              style={{ background: 'rgba(176,37,0,0.08)', color: 'var(--md-error)' }}>
              <AlertCircle style={{ width: '1rem', height: '1rem', flexShrink: 0, marginTop: '0.05rem' }} />
              <p style={{ fontSize: '0.83rem', fontWeight: 500 }}>{error}</p>
            </motion.div>
          )}

          <motion.form onSubmit={handleSubmit} className="space-y-5" animate={controls}>
            {/* Email */}
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--on-surface-variant)', marginBottom: '0.5rem', letterSpacing: '0.025em' }}>Alamat Email</label>
              <div style={{ position: 'relative' }}>
                <Mail style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', width: '1rem', height: '1rem', color: 'var(--outline)' }} />
                <input
                  type="email" required value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="anda@email.com"
                  style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.75rem', borderRadius: 'var(--radius-md)', background: 'var(--surface-container)', border: 'none', color: 'var(--on-surface)', fontSize: '0.875rem', outline: 'none', fontFamily: 'var(--font-body)', boxSizing: 'border-box' }}
                  onFocus={e => e.target.style.boxShadow = '0 0 0 2px var(--md-primary)'}
                  onBlur={e => e.target.style.boxShadow = 'none'}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex justify-between items-center" style={{ marginBottom: '0.5rem' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--on-surface-variant)', letterSpacing: '0.025em' }}>Kata Sandi</label>
                <button type="button" style={{ fontSize: '0.78rem', color: 'var(--md-primary)', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>Lupa kata sandi?</button>
              </div>
              <div style={{ position: 'relative' }}>
                <Lock style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', width: '1rem', height: '1rem', color: 'var(--outline)' }} />
                <input
                  type={showPass ? 'text' : 'password'} required value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  style={{ width: '100%', padding: '0.75rem 2.75rem 0.75rem 2.75rem', borderRadius: 'var(--radius-md)', background: 'var(--surface-container)', border: 'none', color: 'var(--on-surface)', fontSize: '0.875rem', outline: 'none', fontFamily: 'var(--font-body)', boxSizing: 'border-box' }}
                  onFocus={e => e.target.style.boxShadow = '0 0 0 2px var(--md-primary)'}
                  onBlur={e => e.target.style.boxShadow = 'none'}
                />
                <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: '0.875rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--outline)', display: 'flex', alignItems: 'center' }}>
                  {showPass ? <EyeOff style={{ width: '1rem', height: '1rem' }} /> : <Eye style={{ width: '1rem', height: '1rem' }} />}
                </button>
              </div>
            </div>

            <button
              type="submit" disabled={loading}
              className="btn-primary w-full justify-center"
              style={{ paddingTop: '0.875rem', paddingBottom: '0.875rem', marginTop: '0.5rem', fontSize: '0.925rem' }}
            >
              {loading ? (
                <><span style={{ width: '1rem', height: '1rem', borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} /> Masuk...</>
              ) : (
                <>Masuk ke Akun <ArrowRight style={{ width: '1rem', height: '1rem' }} /></>
              )}
            </button>
          </motion.form>
        </div>
      </div>
    </div>
  );
}
