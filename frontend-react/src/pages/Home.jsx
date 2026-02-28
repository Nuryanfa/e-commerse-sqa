import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Users, Leaf, ShieldCheck, Heart, Zap, Lock, Search, ShoppingCart, CreditCard, Package, Truck, Smile } from 'lucide-react';
import api from '../services/api';
import Footer from '../components/Footer';

export default function Home() {
  const { isAuthenticated } = useAuth();
  const [products, setProducts] = useState([]);
  const [productCount, setProductCount] = useState(0);

  useEffect(() => {
    api.get('/products').then(res => {
      const data = res.data.data || [];
      setProducts(data.slice(0, 8));
      setProductCount(data.length);
    }).catch(() => {});
  }, []);

  const stats = [
    { icon: <Users className="w-6 h-6 text-white" />, value: '50+', label: 'Petani Lokal', gradient: 'from-emerald-400 to-emerald-600' },
    { icon: <Leaf className="w-6 h-6 text-white" />, value: '100+', label: 'Produk Segar', gradient: 'from-teal-400 to-teal-600' },
    { icon: <Heart className="w-6 h-6 text-white" />, value: '1000+', label: 'Pelanggan', gradient: 'from-green-400 to-green-600' },
    { icon: <Truck className="w-6 h-6 text-white" />, value: '24h', label: 'Pengiriman', gradient: 'from-emerald-500 to-teal-500' },
  ];

  const features = [
    { icon: <Leaf className="w-10 h-10 mx-auto text-emerald-500" />, title: 'Organik & Segar', desc: 'Dipetik langsung dari kebun pilihan, tanpa bahan kimia.' },
    { icon: <ShieldCheck className="w-10 h-10 mx-auto text-emerald-500" />, title: 'Kualitas Premium', desc: 'Melewati quality control ketat sebelum sampai ke Anda.' },
    { icon: <Zap className="w-10 h-10 mx-auto text-emerald-500" />, title: 'Pengiriman Cepat', desc: 'Kurir terlatih mengantarkan pesanan dalam hitungan jam.' },
    { icon: <Lock className="w-10 h-10 mx-auto text-emerald-500" />, title: 'Pembayaran Aman', desc: 'Transaksi dilindungi dengan sistem keamanan berlapis.' },
  ];

  const steps = [
    { num: '01', icon: <Search className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />, title: 'Pilih Produk', desc: 'Jelajahi katalog sayur segar kami' },
    { num: '02', icon: <CreditCard className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />, title: 'Checkout', desc: 'Masukkan ke keranjang dan bayar' },
    { num: '03', icon: <Package className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />, title: 'Dikemas', desc: 'Sayur dikemas dengan segar oleh petani' },
    { num: '04', icon: <Truck className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />, title: 'Diantar', desc: 'Kurir mengantarkan ke rumah Anda' },
  ];

  return (
    <div style={{ background: 'var(--surface-base)' }}>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/60 via-slate-50 to-teal-50/40 dark:from-emerald-950/20 dark:via-slate-900 dark:to-teal-950/10 -z-10" />
        <div className="absolute top-20 right-10 w-72 h-72 bg-emerald-200/20 dark:bg-emerald-500/5 rounded-full blur-3xl -z-10" />
        <div className="absolute bottom-10 left-10 w-60 h-60 bg-teal-200/20 dark:bg-teal-500/5 rounded-full blur-3xl -z-10" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left */}
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-6 bg-emerald-100/80 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300">
                🌿 Fresh From Local Farmers
              </div>
              <h1 className="text-4xl md:text-5xl font-black leading-tight tracking-tight" style={{ color: 'var(--text-heading)' }}>
                Sayur Segar,{' '}
                <span className="gradient-text">Langsung dari</span>{' '}
                Petani Lokal.
              </h1>
              <p className="mt-5 text-base leading-relaxed max-w-md" style={{ color: 'var(--text-secondary)' }}>
                Nikmati kualitas terbaik hasil panen hari ini. Kami menghubungkan Anda langsung dengan petani untuk kesegaran yang tak tertandingi.
              </p>
              <div className="flex flex-wrap gap-3 mt-8">
                <Link to="/products" className="btn-primary px-7 py-3 text-sm inline-flex items-center gap-2">
                  <ShoppingCart className="w-4 h-4" /> Belanja Sekarang
                </Link>
                {!isAuthenticated && (
                  <Link to="/register" className="btn-outline px-7 py-3 text-sm">Daftar Gratis</Link>
                )}
              </div>
              <div className="flex items-center gap-2 mt-8">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((_, i) => (
                    <div key={i} className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 border-2 border-white dark:border-slate-800">
                      <Smile className="w-4 h-4" />
                    </div>
                  ))}
                </div>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Didukung oleh <strong className="text-emerald-600 dark:text-emerald-400">50+</strong> Petani Lokal</p>
              </div>
            </motion.div>

            {/* Right — Product Grid Visual */}
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }} className="hidden lg:block">
              <div className="relative">
                <div className="w-80 h-80 rounded-3xl grid grid-cols-3 gap-3 p-4 mx-auto" style={{ backgroundColor: 'var(--surface-card)', boxShadow: 'var(--shadow-elevated)' }}>
                  {[...Array(9)].map((_, i) => (
                    <div key={i} className="rounded-2xl flex items-center justify-center text-emerald-500 transition-all duration-300 hover:scale-110 cursor-default" style={{ background: 'var(--surface-muted)' }}>
                      <Leaf className="w-8 h-8 opacity-50" />
                    </div>
                  ))}
                </div>
                <div className="absolute -bottom-4 -left-4 px-4 py-2.5 rounded-2xl animate-slide-up" style={{ backgroundColor: 'var(--surface-card)', boxShadow: 'var(--shadow-glow)' }}>
                  <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Tersedia</p>
                  <p className="text-sm font-black text-emerald-600 dark:text-emerald-400">{productCount}+ Produk</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y" style={{ borderColor: 'var(--border-light)', background: 'var(--surface-card)' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-50px' }} transition={{ duration: 0.5, delay: i * 0.1 }} className="text-center">
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${s.gradient} flex items-center justify-center text-xl mx-auto mb-3 shadow-lg shadow-emerald-100/50 dark:shadow-emerald-900/20`}>{s.icon}</div>
                <p className="text-2xl font-black" style={{ color: 'var(--text-heading)' }}>{s.value}</p>
                <p className="text-xs font-medium mt-0.5" style={{ color: 'var(--text-muted)' }}>{s.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12 animate-fade-in-up">
          <span className="text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full bg-emerald-100/80 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300">Mengapa SayurSehat?</span>
          <h2 className="text-3xl font-black mt-5 tracking-tight" style={{ color: 'var(--text-heading)' }}>Keunggulan Kami</h2>
          <p className="mt-2 text-sm max-w-md mx-auto" style={{ color: 'var(--text-secondary)' }}>Kami berkomitmen menghadirkan pengalaman belanja sayur terbaik.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map((f, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-50px' }} transition={{ duration: 0.5, delay: i * 0.1 }} className="card-organic p-6 text-center group">
              <div className="block mb-4 group-hover:scale-110 transition-transform duration-300">{f.icon}</div>
              <h3 className="font-bold text-sm" style={{ color: 'var(--text-heading)' }}>{f.title}</h3>
              <p className="text-xs mt-2 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section style={{ background: 'var(--surface-card)', borderTop: '1px solid var(--border-light)', borderBottom: '1px solid var(--border-light)' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-12 animate-fade-in-up">
            <span className="text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full bg-emerald-100/80 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300">Mudah & Cepat</span>
            <h2 className="text-3xl font-black mt-5 tracking-tight" style={{ color: 'var(--text-heading)' }}>Cara Belanja</h2>
            <p className="mt-2 text-sm max-w-md mx-auto" style={{ color: 'var(--text-secondary)' }}>Hanya 4 langkah mudah untuk mendapatkan sayuran segar.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {steps.map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true, margin: '-50px' }} transition={{ duration: 0.5, delay: i * 0.1 }} className="relative p-6 rounded-2xl group" style={{ background: 'var(--surface-muted)', border: '1px solid var(--border-light)' }}>
                <span className="absolute top-4 right-4 text-5xl font-black opacity-5" style={{ color: 'var(--text-heading)' }}>{s.num}</span>
                <div className="block mb-3 group-hover:scale-110 transition-transform duration-300">{s.icon}</div>
                <h3 className="font-bold text-sm" style={{ color: 'var(--text-heading)' }}>{s.title}</h3>
                <p className="text-xs mt-1.5" style={{ color: 'var(--text-secondary)' }}>{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      {products.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex items-end justify-between mb-8 animate-fade-in-up">
            <div>
              <h2 className="text-2xl font-black tracking-tight" style={{ color: 'var(--text-heading)' }}>Produk Unggulan</h2>
              <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>Pilihan terbaik minggu ini</p>
            </div>
            <Link to="/products" className="btn-outline px-5 py-2 text-xs">Lihat Semua →</Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {products.slice(0, 4).map((p, i) => (
              <Link key={p.id_product} to={`/products/${p.id_product}`} className={`card-organic overflow-hidden group animate-fade-in-up stagger-${i + 1}`}>
                <div className="aspect-square flex items-center justify-center" style={{ background: 'var(--surface-muted)' }}>
                  {p.image_url ? <img src={p.image_url} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" /> : <span className="text-6xl group-hover:scale-110 transition-transform duration-500">🥬</span>}
                </div>
                <div className="p-4">
                  {p.category && <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-accent)' }}>{p.category.name}</span>}
                  <h3 className="text-sm font-bold mt-0.5 truncate" style={{ color: 'var(--text-heading)' }}>{p.name}</h3>
                  <p className="text-lg font-black mt-1" style={{ color: 'var(--text-accent)' }}>Rp {p.price?.toLocaleString('id-ID')}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* CTA */}
      {!isAuthenticated && (
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="rounded-3xl p-12 text-center animate-fade-in-up" style={{ background: 'linear-gradient(135deg, #059669, #10b981)', boxShadow: '0 20px 60px rgba(16,185,129,0.25)' }}>
            <span className="text-5xl block mb-4">🥬</span>
            <h2 className="text-3xl font-black text-white">Mulai Belanja Sekarang!</h2>
            <p className="text-emerald-100 mt-2 text-sm max-w-md mx-auto">Daftar gratis dan nikmati sayuran segar langsung dari petani lokal pilihan.</p>
            <div className="flex flex-wrap justify-center gap-3 mt-8">
              <Link to="/register" className="bg-white text-emerald-700 px-7 py-3 rounded-2xl font-bold text-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">Daftar Gratis</Link>
              <Link to="/products" className="border-2 border-white/40 text-white px-7 py-3 rounded-2xl font-bold text-sm hover:bg-white/10 transition-all duration-300">Lihat Produk</Link>
            </div>
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
}
