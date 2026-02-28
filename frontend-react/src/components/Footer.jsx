import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Footer() {
  const { isAuthenticated } = useAuth();

  return (
    <footer style={{ background: 'linear-gradient(135deg, #022c22 0%, #064e3b 50%, #065f46 100%)' }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">🥬</span>
              <span className="text-lg font-black text-white">SayurSehat</span>
            </div>
            <p className="text-emerald-200/70 text-xs leading-relaxed">Marketplace sayur segar langsung dari petani lokal pilihan. Kualitas premium, harga terjangkau.</p>
            <div className="flex gap-2 mt-4">
              {['📘', '📸', '🐦'].map((e, i) => (
                <span key={i} className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-sm hover:bg-white/20 transition-colors cursor-pointer">{e}</span>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-bold text-xs text-white uppercase tracking-wider mb-3">Navigasi</h4>
            <div className="space-y-2">
              {[{ to: '/', label: 'Beranda' }, { to: '/products', label: 'Produk' }, ...(!isAuthenticated ? [{ to: '/register', label: 'Daftar' }, { to: '/login', label: 'Login' }] : [])].map(l => (
                <Link key={l.to} to={l.to} className="block text-emerald-200/60 text-xs hover:text-emerald-300 transition-colors">{l.label}</Link>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-bold text-xs text-white uppercase tracking-wider mb-3">Kategori</h4>
            <div className="space-y-2">
              {['Sayuran Daun', 'Sayuran Buah', 'Umbi-umbian', 'Bumbu Dapur'].map(c => (
                <span key={c} className="block text-emerald-200/60 text-xs">{c}</span>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-bold text-xs text-white uppercase tracking-wider mb-3">Kontak</h4>
            <div className="space-y-2 text-emerald-200/60 text-xs">
              <p>📧 halo@sayursehat.id</p>
              <p>📞 +62 812-3456-7890</p>
              <p>📍 Bandung, Indonesia</p>
            </div>
          </div>
        </div>

        <div className="border-t border-emerald-800/50 mt-10 pt-6 flex flex-col md:flex-row justify-between items-center gap-3">
          <p className="text-emerald-300/40 text-[10px]">© 2026 SayurSehat. All rights reserved.</p>
          <p className="text-emerald-300/40 text-[10px]">Made with 💚 for fresh vegetables</p>
        </div>
      </div>
    </footer>
  );
}
