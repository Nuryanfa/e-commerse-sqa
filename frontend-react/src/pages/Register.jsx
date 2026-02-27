import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useToast } from '../context/ToastContext';

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
      toast.success('Pendaftaran berhasil! Silakan login untuk memulai.');
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.error || 'Pendaftaran gagal. Silakan coba lagi.');
    }
    setLoading(false);
  };

  const roles = [
    { value: 'pembeli', label: '🛒 Pembeli', desc: 'Belanja sayur segar' },
    { value: 'supplier', label: '🧑‍🌾 Supplier', desc: 'Jual produk Anda' },
    { value: 'courier', label: '🚚 Kurir', desc: 'Antar pesanan' },
  ];

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <span className="text-4xl">🥬</span>
          <h2 className="text-2xl font-bold text-gray-800 mt-3">Daftar di SayurSehat</h2>
          <p className="text-gray-500 mt-1">Buat akun baru untuk mulai</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          {error && <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl mb-4">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Pilih Role</label>
              <div className="grid grid-cols-3 gap-2">
                {roles.map(r => (
                  <button key={r.value} type="button" onClick={() => setRole(r.value)}
                    className={`p-3 rounded-xl border-2 text-center transition-all cursor-pointer ${role === r.value ? 'border-primary-500 bg-primary-50' : 'border-gray-100 hover:border-gray-200'}`}>
                    <span className="text-lg block">{r.label.split(' ')[0]}</span>
                    <span className="text-xs text-gray-500 block mt-1">{r.desc}</span>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
              <input type="text" required minLength={3} value={nama} onChange={e => setNama(e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent" placeholder="Nama lengkap" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent" placeholder="nama@email.com" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input type="password" required minLength={8} value={password} onChange={e => setPassword(e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent" placeholder="Minimal 8 karakter" />
            </div>
            <button type="submit" disabled={loading} className="w-full bg-primary-600 text-white py-3 rounded-xl font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50 cursor-pointer">
              {loading ? 'Memproses...' : 'Daftar Sekarang'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Sudah punya akun? <Link to="/login" className="text-primary-600 font-medium hover:text-primary-700">Login di sini</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
