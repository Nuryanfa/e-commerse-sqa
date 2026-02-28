import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import { motion } from 'framer-motion';
import { User, Mail, Lock, ShoppingCart, Tractor, Truck, ArrowRight, AlertCircle, Leaf } from 'lucide-react';

export default function Register() {
  const [nama, setNama] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('pembeli');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/users/register', { name: nama, email, password, role });
      toast.success('Pendaftaran berhasil! Silakan login.');
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.error || 'Pendaftaran gagal.');
    }
    setLoading(false);
  };

  const roles = [
    { value: 'pembeli', icon: <ShoppingCart className="w-6 h-6" />, name: 'Pembeli', desc: 'Belanja sayur segar' },
    { value: 'supplier', icon: <Tractor className="w-6 h-6" />, name: 'Supplier', desc: 'Jual produk lahan Anda' },
    { value: 'courier', icon: <Truck className="w-6 h-6" />, name: 'Kurir', desc: 'Antar pesanan sehat' },
  ];

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-slate-900 transition-colors duration-300">
      {/* Left Splash Screen - Hidden on Mobile */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-emerald-900">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/80 to-teal-900/90 mix-blend-multiply z-10" />
        <img 
          src="https://images.unsplash.com/photo-1595856121406-03f4aab82a88?q=80&w=1974&auto=format&fit=crop" 
          alt="Lahan Pertanian Hijau" 
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
              Mulai Langka Sehat,<br />Bersama-sama.
            </h1>
            <p className="text-lg text-emerald-100 max-w-md font-medium">
              Dari kebun ke piring Anda. Bergabunglah dengan platform tepercaya yang menghubungkan alam, petani mandiri, dan dapur sehat keluarga.
            </p>
          </motion.div>
          
          <div className="flex items-center gap-4 text-sm font-medium text-emerald-200">
            <span>© 2026 SayurSehat. All rights reserved.</span>
          </div>
        </div>
      </div>

      {/* Right Register Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 relative overflow-y-auto">
        <div className="w-full max-w-md py-8">
          {/* Mobile Logo Only */}
          <div className="lg:hidden flex justify-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-3xl flex items-center justify-center shadow-xl shadow-emerald-200 dark:shadow-none animate-bounce-in">
              <Leaf className="w-8 h-8 text-white" />
            </div>
          </div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-gray-900 dark:text-white mb-2">Buat Akun 🚀</h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-8">Silakan lengkapi data profil di bawah untuk mendaftar akun.</p>
          </motion.div>

          {error && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm px-4 py-3 rounded-2xl mb-6 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <p className="font-medium">{error}</p>
            </motion.div>
          )}

          <motion.form onSubmit={handleSubmit} className="space-y-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1, duration: 0.5 }}>
            
            {/* Roles Selection */}
            <div className="space-y-3">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Pilih Tipe Akun Anda</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {roles.map((r) => (
                  <button 
                    key={r.value} 
                    type="button" 
                    onClick={() => setRole(r.value)}
                    className={`relative p-4 rounded-xl text-center transition-all duration-300 border-2 overflow-hidden flex flex-col items-center justify-center gap-2 ${
                      role === r.value 
                        ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-900/20 shadow-md shadow-emerald-100 dark:shadow-none' 
                        : 'border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 hover:border-emerald-300 dark:hover:border-emerald-700'
                    }`}
                  >
                    {/* Active Background Indicator Glow */}
                    {role === r.value && <div className="absolute inset-0 bg-gradient-to-b from-white/40 to-transparent pointer-events-none" />}
                    
                    <div className={`transition-transform duration-300 ${role === r.value ? 'scale-110 text-emerald-600 dark:text-emerald-400' : 'text-gray-400 dark:text-gray-500'}`}>
                      {r.icon}
                    </div>
                    <div>
                      <span className={`block text-xs font-bold ${role === r.value ? 'text-emerald-700 dark:text-emerald-300' : 'text-gray-700 dark:text-gray-300'}`}>
                        {r.name}
                      </span>
                      <span className="block text-[10px] text-gray-400 font-medium leading-tight mt-0.5">
                        {r.desc}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              {[{ label: 'Nama Lengkap', type: 'text', value: nama, set: setNama, ph: 'Mis: Budi Santoso', icon: <User /> },
                { label: 'Alamat Email', type: 'email', value: email, set: setEmail, ph: 'anda@email.com', icon: <Mail /> },
                { label: 'Kata Sandi', type: 'password', value: password, set: setPassword, ph: 'Minimal 8 karakter rahasia', icon: <Lock /> }
              ].map((f, i) => (
                <div key={i} className="space-y-1.5 focus-within:text-emerald-600 dark:focus-within:text-emerald-400 group">
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 group-focus-within:text-emerald-600 transition-colors">{f.label}</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-emerald-500 transition-colors">
                      <div className="w-5 h-5">{f.icon}</div>
                    </div>
                    <input 
                      type={f.type} required minLength={f.type === 'password' ? 8 : (f.type === 'text' ? 3 : 0)} value={f.value} onChange={e => f.set(e.target.value)}
                      className="w-full pl-11 pr-4 py-3.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all font-medium placeholder-gray-400 dark:placeholder-gray-500"
                      placeholder={f.ph} 
                    />
                  </div>
                </div>
              ))}
            </div>

            <button 
              type="submit" 
              disabled={loading} 
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white py-3.5 rounded-2xl text-sm font-bold shadow-lg shadow-emerald-200 dark:shadow-none hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-70 disabled:hover:translate-y-0 flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <>
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> 
                  Membuat Akun...
                </>
              ) : (
                <>
                  Daftar Sekarang <ArrowRight className="w-4 h-4 ml-1" />
                </>
              )}
            </button>
          </motion.form>

          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="text-center text-sm mt-8 text-gray-500 dark:text-gray-400 font-medium pb-8 lg:pb-0">
            Sudah pengguna SayurSehat? <Link to="/login" className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline ml-1">Masuk di sini</Link>
          </motion.p>
        </div>
      </div>
    </div>
  );
}
