import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Mail, Lock, ArrowRight, AlertCircle, Leaf } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const role = await login(email, password);
      navigate({ admin: '/admin', supplier: '/supplier', courier: '/courier' }[role] || '/');
    } catch (err) {
      setError(err.response?.data?.error || 'Email atau password salah.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-slate-900 transition-colors duration-300">
      {/* Left Splash Screen - Hidden on Mobile */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-emerald-900">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/80 to-teal-900/90 mix-blend-multiply z-10" />
        <img 
          src="https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=1974&auto=format&fit=crop" 
          alt="Fresh Vegetables" 
          className="absolute inset-0 w-full h-full object-cover z-0"
        />
        <div className="relative z-20 flex flex-col justify-between p-16 h-full text-white">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/30">
              <Leaf className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-black tracking-tight">SayurSehat</span>
          </motion.div>
          
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.2 }}>
            <h1 className="text-5xl font-black leading-tight mb-6">
              Bahan Segar<br />Langsung dari<br />Petani Lokal
            </h1>
            <p className="text-lg text-emerald-100 max-w-md font-medium">
              Bergabunglah dengan ribuan keluarga yang telah mempercayakan kebutuhan dapur sehat mereka kepada kami.
            </p>
          </motion.div>
          
          <div className="flex items-center gap-4 text-sm font-medium text-emerald-200">
            <span>© 2026 SayurSehat. All rights reserved.</span>
          </div>
        </div>
      </div>

      {/* Right Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 lg:p-16 relative">
        <div className="w-full max-w-md">
          {/* Mobile Logo Only */}
          <div className="lg:hidden flex justify-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-3xl flex items-center justify-center shadow-xl shadow-emerald-200 dark:shadow-none animate-bounce-in">
              <Leaf className="w-8 h-8 text-white" />
            </div>
          </div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-gray-900 dark:text-white mb-2">Selamat Datang! 👋</h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-8">Silakan masukkan kredensial Anda untuk masuk ke akun Anda.</p>
          </motion.div>

          {error && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} file={{ opacity: 1, scale: 1 }} className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm px-4 py-3 rounded-2xl mb-6 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <p className="font-medium">{error}</p>
            </motion.div>
          )}

          <motion.form onSubmit={handleSubmit} className="space-y-5" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1, duration: 0.5 }}>
            <div className="space-y-1.5 focus-within:text-emerald-600 dark:focus-within:text-emerald-400 group">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 group-focus-within:text-emerald-600 transition-colors">Alamat Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="w-5 h-5 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
                </div>
                <input 
                  type="email" required value={email} onChange={e => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all font-medium placeholder-gray-400 dark:placeholder-gray-500"
                  placeholder="anda@email.com" 
                />
              </div>
            </div>

            <div className="space-y-1.5 focus-within:text-emerald-600 dark:focus-within:text-emerald-400 group">
              <div className="flex justify-between items-center">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 group-focus-within:text-emerald-600 transition-colors">Kata Sandi</label>
                <Link to="#" className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline">Lupa sandi?</Link>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="w-5 h-5 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
                </div>
                <input 
                  type="password" required value={password} onChange={e => setPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all font-medium placeholder-gray-400 dark:placeholder-gray-500"
                  placeholder="••••••••" 
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading} 
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white py-3.5 rounded-2xl text-sm font-bold shadow-lg shadow-emerald-200 dark:shadow-none hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-70 disabled:hover:translate-y-0 flex items-center justify-center gap-2 mt-4"
            >
              {loading ? (
                <>
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> 
                  Sedang masuk...
                </>
              ) : (
                <>
                  Masuk Sekarang <ArrowRight className="w-4 h-4 ml-1" />
                </>
              )}
            </button>
          </motion.form>

          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="text-center text-sm mt-8 text-gray-500 dark:text-gray-400 font-medium">
            Pengguna baru SayurSehat? <Link to="/register" className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline ml-1">Daftar Akun Gratis</Link>
          </motion.p>
        </div>
      </div>
    </div>
  );
}
