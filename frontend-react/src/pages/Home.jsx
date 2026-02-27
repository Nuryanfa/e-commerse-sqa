import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import ProductCard from '../components/ProductCard';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/products').then(res => {
      setProducts((res.data.data || []).slice(0, 8));
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="h-screen flex text-5xl items-center justify-center animate-bounce-in">🥬</div>;

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-green-50 via-emerald-50/50 to-white dark:from-gray-900 dark:via-emerald-950/20 dark:to-gray-900">
      {/* Abstract Background Shapes */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary-100/50 dark:bg-primary-900/10 blur-3xl mix-blend-multiply dark:mix-blend-lighten animate-float" style={{ animationDuration: '15s' }}></div>
        <div className="absolute top-[20%] right-[-5%] w-[30%] h-[30%] rounded-full bg-accent-100/40 dark:bg-accent-900/10 blur-3xl mix-blend-multiply dark:mix-blend-lighten animate-float" style={{ animationDuration: '20s', animationDelay: '2s' }}></div>
        <div className="absolute bottom-[-10%] left-[20%] w-[50%] h-[50%] rounded-full bg-green-100/30 dark:bg-green-900/10 blur-3xl mix-blend-multiply dark:mix-blend-lighten animate-float" style={{ animationDuration: '18s', animationDelay: '5s' }}></div>
      </div>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-in-up">
              <span className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm text-primary-700 text-sm font-medium px-4 py-1.5 rounded-full mb-6 shadow-sm border border-primary-100 animate-scale-in">
                🌿 Fresh From Local Farmers
              </span>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight mb-6">
                Sayur Segar,<br />
                <span className="gradient-text">Langsung dari</span><br />
                Petani Lokal.
              </h1>
              <p className="text-gray-500 text-lg mb-8 max-w-md animate-fade-in-up stagger-3">Nikmati kualitas terbaik hasil panen hari ini. Kami menghubungkan Anda langsung dengan petani untuk kesegaran yang tak tertandingi.</p>
              <div className="flex flex-wrap gap-4 animate-fade-in-up stagger-4">
                <Link to="/products" className="group px-8 py-4 bg-gradient-to-r from-primary-600 to-accent-600 text-white rounded-full font-bold text-lg hover:shadow-xl hover:shadow-primary-200 transition-all duration-300 hover:-translate-y-1 flex items-center justify-center gap-2 cursor-pointer inline-flex">
                  <span className="text-xl group-hover:animate-bounce-in">🛒</span> Belanja Sekarang
                </Link>
                <Link to="/register" className="px-8 py-4 bg-white dark:bg-gray-800 text-primary-600 dark:text-primary-400 border-2 border-primary-100 dark:border-primary-900/50 rounded-full font-bold text-lg hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all duration-300 cursor-pointer text-center">
                  Daftar Gratis
                </Link>
              </div>

              {/* Trust Badge */}
              <div className="mt-12 flex items-center gap-4 animate-fade-in-up stagger-4">
                <div className="flex -space-x-3">
                  {[1,2,3,4].map(i => (
                    <div key={i} className="w-10 h-10 rounded-full border-2 border-white dark:border-gray-900 bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-sm shadow-sm relative z-0 hover:z-10 hover:-translate-y-1 transition-transform">
                      🧑‍🌾
                    </div>
                  ))}
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Didukung oleh <strong className="text-primary-600 dark:text-primary-400">50+</strong> Petani Lokal</p>
              </div>
            </div>
            <div className="hidden lg:flex items-center justify-center animate-scale-in">
              <div className="relative">
                <div className="w-80 h-80 bg-gradient-to-br from-primary-200 to-accent-200 rounded-full opacity-30 absolute -inset-4 blur-3xl animate-pulse-soft" />
                <div className="relative bg-white/60 backdrop-blur-xl rounded-3xl p-10 shadow-2xl border border-white/40">
                  <div className="grid grid-cols-3 gap-4">
                    {['🥬', '🥕', '🍅', '🌽', '🥦', '🧅', '🥒', '🫑', '🧄'].map((e, i) => (
                      <div key={i} className="w-16 h-16 bg-primary-50 rounded-2xl flex items-center justify-center text-2xl hover:scale-110 hover:bg-primary-100 transition-all duration-300 cursor-default animate-scale-in" style={{ animationDelay: `${i * 0.05 + 0.3}s` }}>{e}</div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      {/* Stats */}
      <section className="py-4 -mt-6 relative z-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 grid grid-cols-3 divide-x divide-gray-100 animate-fade-in-up">
            {[
              { value: '50+', label: 'Petani Lokal', icon: '🧑‍🌾' },
              { value: '100+', label: 'Produk Segar', icon: '🥬' },
              { value: '1000+', label: 'Pelanggan', icon: '❤️' },
            ].map((s, i) => (
              <div key={i} className="p-5 text-center group cursor-default">
                <span className="text-xl group-hover:scale-125 inline-block transition-transform duration-300">{s.icon}</span>
                <p className="text-2xl font-bold text-gray-800 mt-1">{s.value}</p>
                <p className="text-xs text-gray-400">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 animate-fade-in-up">
            <h2 className="text-3xl font-bold text-gray-800">Kenapa <span className="gradient-text">SayurSehat?</span></h2>
            <p className="text-gray-400 mt-2">Kami beda dari yang lain</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: '🚚', title: 'Pengiriman Cepat', desc: 'Sayur segar diantar langsung ke rumah Anda dalam hitungan jam.', color: 'from-blue-50 to-blue-100' },
              { icon: '🌱', title: '100% Organik', desc: 'Dipilih langsung dari petani lokal yang terpercaya dan tersertifikasi.', color: 'from-green-50 to-green-100' },
              { icon: '💰', title: 'Harga Terjangkau', desc: 'Tanpa perantara. Langsung dari petani. Harga kualitas premium.', color: 'from-amber-50 to-amber-100' },
            ].map((f, i) => (
              <div key={i} className={`text-center p-8 rounded-2xl bg-gradient-to-br ${f.color} card-hover animate-fade-in-up stagger-${i + 1} group cursor-default`}>
                <span className="text-5xl mb-4 block group-hover:scale-110 group-hover:animate-bounce-in transition-transform duration-300">{f.icon}</span>
                <h3 className="font-bold text-gray-800 text-lg mb-2">{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-10 animate-fade-in-up">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">🔥 Produk Terlaris</h2>
              <p className="text-gray-400 mt-1">Sayur segar pilihan hari ini</p>
            </div>
            <Link to="/products" className="text-primary-600 font-medium hover:text-primary-700 transition-all hover:-translate-x-1 inline-flex items-center gap-1">
              Lihat Semua <span className="text-lg">→</span>
            </Link>
          </div>
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => <div key={i} className="bg-white rounded-2xl h-64 shimmer" />)}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {products.map((p, i) => <ProductCard key={p.id_product} product={p} index={i} />)}
              {products.length === 0 && <p className="col-span-4 text-center text-gray-400 py-12 animate-fade-in">Belum ada produk tersedia.</p>}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      {/* Call to Action */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="bg-gradient-to-r from-primary-600 to-accent-600 rounded-3xl p-10 sm:p-16 text-center text-white relative overflow-hidden shadow-2xl">
          <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[150%] bg-white/10 blur-3xl transform rotate-12"></div>
          <div className="relative z-10">
            <h2 className="text-3xl sm:text-4xl font-extrabold mb-6">Mulai Gaya Hidup Sehat Hari Ini</h2>
            <p className="text-lg text-primary-50 mb-10 max-w-2xl mx-auto">Dapatkan sayuran segar pilihan dengan harga terbaik. Pengiriman cepat langsung ke dapur Anda.</p>
            <Link to="/products" className="inline-block px-8 py-4 bg-white text-primary-700 rounded-full font-bold text-lg hover:shadow-lg hover:-translate-y-1 transition-transform cursor-pointer">
              Lihat Katalog Produk
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
