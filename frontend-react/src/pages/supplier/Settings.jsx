import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { User, Lock, Store, Save, ShieldCheck } from 'lucide-react';

export default function SupplierSettings() {
  const { user } = useAuth();
  const toast = useToast();
  
  const [activeTab, setActiveTab] = useState('profile');

  const handleSave = (e) => {
    e.preventDefault();
    toast.success('Pengaturan berhasil disimpan!');
  };

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight mb-2">Pengaturan Akun</h1>
        <p className="text-gray-500 dark:text-gray-400">Atur profil, kata sandi, dan preferensi toko Anda di sini.</p>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-3xl border border-gray-100 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-4 min-h-[500px]">
          {/* Sidebar Tabs */}
          <div className="bg-gray-50/50 dark:bg-slate-900/50 p-6 border-b md:border-b-0 md:border-r border-gray-100 dark:border-slate-700 space-y-2">
            {[
              { id: 'profile', icon: User, label: 'Profil Saya' },
              { id: 'security', icon: Lock, label: 'Keamanan & Password' },
              { id: 'store', icon: Store, label: 'Info Toko' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                  activeTab === tab.id 
                    ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20' 
                    : 'text-gray-500 dark:text-gray-400 hover:bg-white dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <tab.icon className="w-5 h-5" /> {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="md:col-span-3 p-6 md:p-10">
            {activeTab === 'profile' && (
              <form onSubmit={handleSave} className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                    <User className="w-5 h-5 text-emerald-500" /> Profil Saya
                  </h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2 block">Nama Lengkap</label>
                    <input type="text" defaultValue={user?.nama || ''} className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-sm font-bold focus:ring-2 focus:ring-emerald-500 outline-none" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2 block">Email</label>
                    <input type="email" defaultValue={user?.email || ''} readOnly className="w-full px-4 py-3 bg-gray-100 dark:bg-slate-800/80 border border-gray-200 dark:border-slate-700 rounded-xl text-sm font-bold text-gray-400 cursor-not-allowed" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2 block">Nomor Telepon</label>
                    <input type="tel" defaultValue={user?.no_hp || ''} className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-sm font-bold focus:ring-2 focus:ring-emerald-500 outline-none" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2 block">Alamat Gudang/Toko</label>
                    <textarea rows="3" defaultValue={user?.address || ''} className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-sm font-medium focus:ring-2 focus:ring-emerald-500 outline-none resize-none"></textarea>
                  </div>
                </div>

                <div className="pt-6 border-t border-gray-100 dark:border-slate-700 flex justify-end">
                  <button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 transition-colors">
                    <Save className="w-4 h-4" /> Simpan Perubahan
                  </button>
                </div>
              </form>
            )}

            {activeTab === 'security' && (
              <form onSubmit={handleSave} className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-500" /> Keamanan Akun
                  </h2>
                </div>
                <div className="space-y-6">
                  <div>
                   <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2 block">Password Sekarang</label>
                   <input type="password" placeholder="••••••••" className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-sm font-bold focus:ring-2 focus:ring-emerald-500 outline-none" />
                  </div>
                  <div>
                   <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2 block">Password Baru</label>
                   <input type="password" placeholder="••••••••" className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-sm font-bold focus:ring-2 focus:ring-emerald-500 outline-none" />
                  </div>
                </div>
                <div className="pt-6 border-t border-gray-100 dark:border-slate-700 flex justify-end">
                  <button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 transition-colors">
                    <Save className="w-4 h-4" /> Update Password
                  </button>
                </div>
              </form>
            )}

            {activeTab === 'store' && (
              <form onSubmit={handleSave} className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                    <Store className="w-5 h-5 text-emerald-500" /> Informasi & Operasional Toko
                  </h2>
                </div>
                
                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2 block">Slogan / Deskripsi Singkat Toko</label>
                    <input type="text" placeholder="Misal: Sayuran Segar Langsung dari Kebun" className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-sm font-bold focus:ring-2 focus:ring-emerald-500 outline-none" />
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2 block">Jam Buka</label>
                      <input type="time" defaultValue="08:00" className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-sm font-bold focus:ring-2 focus:ring-emerald-500 outline-none" />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2 block">Jam Tutup</label>
                      <input type="time" defaultValue="17:00" className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-sm font-bold focus:ring-2 focus:ring-emerald-500 outline-none" />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2 block">Pesan Otomatis (Auto-Reply Chat)</label>
                    <textarea rows="3" placeholder="Halo! Toko sedang sibuk, mohon tunggu sebentar..." className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-sm font-medium focus:ring-2 focus:ring-emerald-500 outline-none resize-none"></textarea>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-100 dark:bg-emerald-900/20 dark:border-emerald-800 rounded-xl">
                    <input type="checkbox" id="auto-process" defaultChecked className="w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500 bg-white" />
                    <label htmlFor="auto-process" className="text-sm font-bold text-gray-900 dark:text-gray-100 cursor-pointer">
                      Terima Pesanan Secara Otomatis (Auto-Process)
                    </label>
                  </div>
                </div>

                <div className="pt-6 border-t border-gray-100 dark:border-slate-700 flex justify-end">
                  <button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 transition-colors">
                    <Save className="w-4 h-4" /> Simpan Konfigurasi Toko
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
