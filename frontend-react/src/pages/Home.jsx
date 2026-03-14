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
    { icon: <Leaf className="w-6 h-6 text-white" />, value: '100+', label: 'Produk Segar', gradient: 'from-emerald-500 to-emerald-700' },
    { icon: <Heart className="w-6 h-6 text-white" />, value: '1000+', label: 'Pelanggan', gradient: 'from-emerald-300 to-emerald-500' },
    { icon: <Truck className="w-6 h-6 text-white" />, value: '24h', label: 'Pengiriman', gradient: 'from-emerald-600 to-emerald-800' },
  ];

  const features = [
    { 
      title: 'Organik & Segar', 
      description: 'Dipetik langsung dari kebun pilihan, tanpa bahan kimia tambahan.',
      link: '#', 
    },
    { 
      title: 'Kualitas Premium', 
      description: 'Melewati quality control ketat sebelum sampai ke meja makan Anda.',
      link: '#',
    },
    { 
      title: 'Pengiriman Cepat', 
      description: 'Kurir terlatih mengantarkan pesanan dalam hitungan jam untuk menjaga kesegaran.',
      link: '#',
    },
  ];

  const bentoItems = [
    {
      title: "Sayur Organik Pilihan",
      description: "Kami hanya bekerja sama dengan petani yang memiliki sertifikasi organik.",
      color: "bg-emerald-50 dark:bg-emerald-900/20",
      icon: <Leaf className="h-6 w-6 text-emerald-600" />,
    },
    {
      title: "Langsung Dari Petani",
      description: "Memangkas jalur distribusi untuk harga yang lebih adil bagi petani dan konsumen.",
      color: "bg-emerald-100 dark:bg-emerald-800/20",
      icon: <Users className="h-6 w-6 text-emerald-600" />,
    },
    {
      title: "Keamanan Transaksi",
      description: "Sistem pembayaran terenkripsi untuk melindungi setiap rupiah Anda.",
      color: "bg-emerald-200/50 dark:bg-emerald-700/20",
      icon: <Lock className="h-6 w-6 text-emerald-600" />,
    },
  ];

  return (
    <div className="font-sans" style={{ background: 'var(--surface-base)' }}>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/60 via-white to-emerald-100/40 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 -z-10" />
        <div className="absolute top-20 right-10 w-72 h-72 bg-emerald-300/20 rounded-full blur-3xl -z-10" />
        <div className="absolute bottom-10 left-10 w-60 h-60 bg-emerald-200/20 rounded-full blur-3xl -z-10" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left */}
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-bold mb-8 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 shadow-sm uppercase tracking-widest">
                🌿 Freshness Guaranteed from Local Farmers
              </div>
              <h1 className="text-4xl md:text-6xl font-black leading-[1.1] tracking-tight" style={{ color: 'var(--text-heading)' }}>
                Sayur Segar,{' '}
                <span className="text-emerald-500">Hidup</span>{' '}
                Lebih Sehat.
              </h1>
              <p className="mt-6 text-lg leading-relaxed max-w-md font-medium" style={{ color: 'var(--text-secondary)' }}>
                Kurasi hasil bumi terbaik dari petani pilihan. Kami mengantarkan kesegaran alam langsung ke depan pintu rumah Anda.
              </p>
              <div className="flex flex-wrap gap-5 mt-10">
                <Link to="/products" className="btn-primary px-8 py-4 text-sm inline-flex items-center gap-2 shadow-xl shadow-emerald-500/20">
                  <ShoppingCart className="w-4 h-4" /> Mulai Belanja
                </Link>
                {!isAuthenticated && (
                  <Link to="/register" className="btn-outline px-8 py-4 text-sm border-2">Daftar Member</Link>
                )}
              </div>
            </motion.div>

            {/* Right Visual */}
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8 }} className="hidden lg:block relative">
               <div className="w-full h-[400px] rounded-2xl bg-gradient-to-tr from-emerald-500/20 to-emerald-200/10 backdrop-blur-sm border border-white/20 flex items-center justify-center">
                  <Leaf className="w-40 h-40 text-emerald-500 opacity-30 animate-pulse" />
               </div>
               <div className="absolute -bottom-6 -left-6 p-6 rounded-2xl glass shadow-2xl animate-float">
                  <p className="text-3xl font-black text-emerald-500">{productCount}+</p>
                  <p className="text-[10px] uppercase font-bold tracking-widest text-gray-500">Produk Tersedia</p>
               </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 bg-white dark:bg-[#1a1c18] border-y border-[var(--border-light)]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center group">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${s.gradient} flex items-center justify-center mx-auto mb-4 transform group-hover:rotate-6 transition-transform`}>{s.icon}</div>
                <h3 className="text-3xl font-black text-[var(--text-heading)]">{s.value}</h3>
                <p className="text-xs font-bold uppercase tracking-widest text-[var(--text-muted)] mt-1">{s.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
         <div className="mb-12">
            <h2 className="text-3xl font-black text-[var(--text-heading)]">Kenapa SayurSehat?</h2>
            <p className="text-[var(--text-secondary)] mt-2">Standar kualitas tinggi untuk setiap helai daun.</p>
         </div>
         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {bentoItems.map((item, i) => (
              <div key={i} className={`p-8 rounded-3xl ${item.color} border border-emerald-100 dark:border-emerald-800/30 flex flex-col justify-between ${i === 0 ? 'md:col-span-2' : ''}`}>
                 <div className="w-12 h-12 rounded-2xl bg-white dark:bg-gray-800 shadow-sm flex items-center justify-center mb-6">
                    {item.icon}
                 </div>
                 <div>
                    <h3 className="text-xl font-bold text-[var(--text-heading)] mb-2">{item.title}</h3>
                    <p className="text-[var(--text-secondary)] leading-relaxed">{item.description}</p>
                 </div>
              </div>
            ))}
         </div>
      </section>

      {/* Premium Experience Section */}
      <section className="py-24 bg-gray-50 dark:bg-gray-900/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
           <div className="text-center mb-16">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-600">Fitur Utama</span>
              <h2 className="text-4xl font-black text-[var(--text-heading)] mt-4">Pengalaman Premium</h2>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {features.map((feature, i) => (
                 <div key={i} className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-sm hover:shadow-md transition-shadow border border-gray-100 dark:border-gray-700">
                    <h3 className="text-xl font-bold text-[var(--text-heading)] mb-4">{feature.title}</h3>
                    <p className="text-[var(--text-secondary)] leading-relaxed">{feature.description}</p>
                 </div>
              ))}
           </div>
        </div>
      </section>

      {/* Featured Products */}
      {products.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="flex items-end justify-between mb-12">
            <div>
              <h2 className="text-3xl font-black text-[var(--text-heading)]">Musim Panen Ini</h2>
              <p className="text-[var(--text-secondary)] mt-1">Stok terbatas langsung dari petani.</p>
            </div>
            <Link to="/products" className="text-sm font-bold text-[#9CA986] hover:underline">Lihat Semua Katalog</Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.slice(0, 4).map((p, i) => (
              <Link key={p.id_product} to={`/products/${p.id_product}`} className="rounded-2xl overflow-hidden group bg-white dark:bg-[#2a2e25] border border-transparent hover:border-[#9CA986]/30 transition-all duration-300">
                <div className="aspect-[4/5] bg-[#f7f8f4] dark:bg-[#1a1c18] overflow-hidden">
                  {p.image_url ? (
                    <img src={p.image_url} alt={p.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center grayscale group-hover:grayscale-0 transition-all">
                      <Leaf className="w-20 h-20 text-emerald-500 opacity-20" />
                    </div>
                  )}
                </div>
                <div className="p-5">
                  <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">{p.category?.name || 'Organik'}</p>
                  <h3 className="text-lg font-bold text-[var(--text-heading)] mt-1 truncate">{p.name}</h3>
                  <p className="text-xl font-black text-emerald-500 mt-4">Rp {p.price?.toLocaleString('id-ID')}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
         <div className="rounded-[40px] bg-gray-900 border border-emerald-900/30 p-16 relative overflow-hidden text-center shadow-xl">
            <div className="absolute top-[-20%] left-[-10%] w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl" />
            <div className="absolute bottom-[-20%] right-[-10%] w-80 h-80 bg-emerald-400/10 rounded-full blur-3xl" />
            <div className="relative z-10">
              <h2 className="text-4xl font-black text-white">Bergabung dengan Komunitas Sehat</h2>
              <p className="text-gray-400 mt-5 max-w-xl mx-auto text-lg font-medium leading-relaxed">Dapatkan penawaran eksklusif dan info panen sayur langka langsung di dashboard Anda.</p>
              <div className="mt-10 flex flex-wrap justify-center gap-5">
                 <Link to="/register" className="btn-primary px-10 py-4 shadow-xl shadow-emerald-500/20">Daftar Sekarang</Link>
                 <Link to="/products" className="btn-outline px-10 py-4 bg-gray-900 text-white border-gray-700">Lihat Produk</Link>
              </div>
            </div>
         </div>
      </section>

      <Footer />
    </div>
  );
}
