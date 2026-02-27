import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-gradient-to-br from-primary-900 to-primary-800 text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">🥬</span>
              <span className="text-xl font-bold">SayurSehat</span>
            </div>
            <p className="text-primary-200 text-sm leading-relaxed">Marketplace sayur segar langsung dari petani lokal pilihan. Kualitas premium, harga terjangkau.</p>
            <div className="flex gap-3 mt-5">
              {['📘', '📸', '🐦'].map((e, i) => (
                <div key={i} className="w-9 h-9 bg-white/10 rounded-lg flex items-center justify-center hover:bg-white/20 transition-all duration-300 cursor-pointer hover:scale-110">{e}</div>
              ))}
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold text-sm uppercase tracking-wider mb-4 text-primary-200">Navigasi</h4>
            <div className="space-y-2.5">
              {[
                { to: '/', label: 'Beranda' },
                { to: '/products', label: 'Produk' },
                { to: '/register', label: 'Daftar' },
                { to: '/login', label: 'Login' },
              ].map(l => (
                <Link key={l.to} to={l.to} className="block text-primary-300 hover:text-white text-sm transition-all duration-200 hover:translate-x-1">{l.label}</Link>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-sm uppercase tracking-wider mb-4 text-primary-200">Kategori</h4>
            <div className="space-y-2.5">
              {['Sayuran Daun', 'Sayuran Buah', 'Umbi-umbian', 'Bumbu Dapur'].map(c => (
                <span key={c} className="block text-primary-300 text-sm">{c}</span>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-sm uppercase tracking-wider mb-4 text-primary-200">Kontak</h4>
            <div className="space-y-2.5 text-primary-300 text-sm">
              <p className="flex items-center gap-2">📧 halo@sayursehat.id</p>
              <p className="flex items-center gap-2">📞 +62 812-3456-7890</p>
              <p className="flex items-center gap-2">📍 Bandung, Indonesia</p>
            </div>
          </div>
        </div>

        <div className="border-t border-primary-700/50 mt-10 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-primary-400 text-xs">&copy; 2026 SayurSehat. All rights reserved.</p>
          <p className="text-primary-400 text-xs">Made with 💚 for fresh vegetables</p>
        </div>
      </div>
    </footer>
  );
}
