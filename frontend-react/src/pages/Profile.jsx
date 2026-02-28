import { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { motion } from 'framer-motion';
import { User, Mail, Phone, MapPin, ShieldCheck, Loader2 } from 'lucide-react';

export default function Profile() {
  const { user } = useAuth();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ nama: user?.nama || '', phone: user?.phone || '', address: user?.address || '' });

  useEffect(() => { if (user) setForm({ nama: user.nama || '', phone: user.phone || '', address: user.address || '' }); }, [user]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.put('/users/profile', { name: form.nama, phone: form.phone, address: form.address });
      toast.success(res.data.message || 'Profil diperbarui!');
    } catch (err) { toast.error(err.response?.data?.error || 'Gagal memperbarui profil'); }
    finally { setLoading(false); }
  };

  if (!user) return null;

  return (
    <div className="bg-gray-50 dark:bg-slate-900 min-h-screen py-12 transition-colors duration-300">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Profil */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row items-center md:items-start gap-6 mb-10 text-center md:text-left">
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-3xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity duration-500" />
            <div className="w-24 h-24 sm:w-28 sm:h-28 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-3xl flex items-center justify-center text-white text-3xl sm:text-4xl font-black shadow-xl shadow-emerald-500/30 relative z-10 border-4 border-white dark:border-slate-800">
              {user.nama?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            {user.role === 'admin' && (
              <div className="absolute -bottom-2 -right-2 bg-amber-500 text-white p-1.5 rounded-xl shadow-lg border-2 border-white dark:border-slate-800 z-20">
                <ShieldCheck className="w-4 h-4" />
              </div>
            )}
          </div>
          <div className="pt-2">
            <h1 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white mb-1.5">{user.nama}</h1>
            <p className="text-gray-500 dark:text-gray-400 font-medium flex items-center justify-center md:justify-start gap-1.5">
              <Mail className="w-4 h-4" /> {user.email}
            </p>
            <div className="mt-4 flex flex-wrap justify-center md:justify-start gap-2">
              <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 text-xs font-bold uppercase tracking-widest rounded-lg">
                Member {user.role}
              </span>
              <span className="px-3 py-1 bg-gray-200 dark:bg-slate-800 text-gray-700 dark:text-gray-300 text-xs font-bold rounded-lg shadow-sm border border-gray-300 dark:border-slate-700">
                Lengkapi Profil Anda
              </span>
            </div>
          </div>
        </motion.div>

        {/* Card Form Profil */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card-organic p-8 sm:p-10 border-default shadow-sm bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl">
          <div className="mb-8 border-b border-gray-100 dark:border-slate-700 pb-4">
             <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
               <User className="w-5 h-5 text-emerald-500" /> Informasi Pribadi
             </h2>
             <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Kelola data diri dan alamat pengiriman Anda di bawah ini.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Nama Lengkap */}
              <div className="space-y-1.5 focus-within:text-emerald-600 dark:focus-within:text-emerald-400 group col-span-1 md:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 group-focus-within:text-emerald-600 transition-colors">Nama Lengkap</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-emerald-500 transition-colors">
                    <User className="w-5 h-5" />
                  </div>
                  <input 
                    type="text" name="nama" required value={form.nama} onChange={handleChange}
                    className="w-full pl-11 pr-4 py-3.5 bg-gray-50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-700 rounded-2xl text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all font-medium placeholder-gray-400 shadow-sm"
                    placeholder="Masukkan nama lengkap Anda" 
                  />
                </div>
              </div>

              {/* Email (Disabled) */}
              <div className="space-y-1.5 focus-within:text-emerald-600 dark:focus-within:text-emerald-400 group opacity-80 cursor-not-allowed">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 transition-colors">Alamat Email (Tidak Dapat Diubah)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-300 dark:text-gray-600 transition-colors">
                    <Mail className="w-5 h-5" />
                  </div>
                  <input 
                    type="email" disabled value={user.email}
                    className="w-full pl-11 pr-4 py-3.5 bg-gray-100 dark:bg-slate-800/80 border border-gray-200 dark:border-slate-700 rounded-2xl text-sm text-gray-500 dark:text-gray-400 focus:outline-none transition-all font-medium cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Nomor Telepon */}
              <div className="space-y-1.5 focus-within:text-emerald-600 dark:focus-within:text-emerald-400 group">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 group-focus-within:text-emerald-600 transition-colors">Nomor Telepon</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-emerald-500 transition-colors">
                    <Phone className="w-5 h-5" />
                  </div>
                  <input 
                    type="tel" name="phone" value={form.phone} onChange={handleChange}
                    className="w-full pl-11 pr-4 py-3.5 bg-gray-50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-700 rounded-2xl text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all font-medium placeholder-gray-400 shadow-sm"
                    placeholder="Contoh: 081234567890" 
                  />
                </div>
              </div>

              {/* Alamat */}
              <div className="space-y-1.5 focus-within:text-emerald-600 dark:focus-within:text-emerald-400 group col-span-1 md:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 group-focus-within:text-emerald-600 transition-colors">Alamat Pengiriman Utama</label>
                <div className="relative">
                  <div className="absolute top-4 left-0 pl-4 flex items-start pointer-events-none text-gray-400 group-focus-within:text-emerald-500 transition-colors">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <textarea 
                    name="address" rows={4} value={form.address} onChange={handleChange}
                    className="w-full pl-11 pr-4 py-3.5 bg-gray-50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-700 rounded-2xl text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all font-medium placeholder-gray-400 shadow-sm resize-none"
                    placeholder="Masukkan alamat lengkap (Jalan, No, RT/RW, Kelurahan, Kecamatan, Kota, Kodepos)" 
                  />
                </div>
              </div>

            </div>

            <div className="flex justify-end pt-8 border-t border-gray-100 dark:border-slate-700 mt-8">
              <button 
                type="submit" 
                disabled={loading} 
                className="w-full sm:w-auto bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white px-10 py-3.5 rounded-2xl text-sm font-bold shadow-lg shadow-emerald-500/25 active:scale-95 transition-all duration-300 disabled:opacity-70 flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Menyimpan...</> : 'Simpan Perubahan Profil'}
              </button>
            </div>
          </form>
        </motion.div>

      </div>
    </div>
  );
}
