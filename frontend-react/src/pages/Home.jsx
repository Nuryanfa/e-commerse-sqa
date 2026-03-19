import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Leaf, ShoppingCart, Truck, Users, ShieldCheck, ArrowRight, Star } from 'lucide-react';
import api from '../services/api';
import Footer from '../components/Footer';

export default function Home() {
  const { isAuthenticated } = useAuth();
  const [products, setProducts]     = useState([]);
  const [productCount, setProductCount] = useState(0);

  useEffect(() => {
    api.get('/products').then(res => {
      const data = res.data.data || [];
      setProducts(data.slice(0, 4));
      setProductCount(data.length);
    }).catch(() => {});
  }, []);

  const stats = [
    { icon: <Users className="w-5 h-5" style={{ color: 'var(--md-primary)' }} />, value: '50+', label: 'Petani Lokal' },
    { icon: <Leaf className="w-5 h-5" style={{ color: 'var(--md-primary)' }} />,  value: productCount || '100+', label: 'Produk Segar' },
    { icon: <Truck className="w-5 h-5" style={{ color: 'var(--md-primary)' }} />, value: '24h', label: 'Pengiriman' },
    { icon: <ShieldCheck className="w-5 h-5" style={{ color: 'var(--md-primary)' }} />, value: '100%', label: 'Organik Terverifikasi' },
  ];

  const features = [
    { title: 'Organik & Segar', desc: 'Dipetik langsung dari kebun pilihan, tanpa bahan kimia tambahan.', icon: <Leaf className="w-6 h-6" /> },
    { title: 'Kualitas Premium', desc: 'Melewati quality control ketat sebelum sampai ke meja makan Anda.', icon: <Star className="w-6 h-6" /> },
    { title: 'Pengiriman Cepat', desc: 'Kurir terlatih mengantarkan pesanan dalam hitungan jam untuk menjaga kesegaran.', icon: <Truck className="w-6 h-6" /> },
  ];

  const categories = [
    { name: 'Sayuran Daun', emoji: '🥬' },
    { name: 'Sayuran Buah', emoji: '🍅' },
    { name: 'Umbi & Akar', emoji: '🥕' },
    { name: 'Rempah', emoji: '🌿' },
  ];

  return (
    <div style={{ background: 'var(--bg)', fontFamily: 'var(--font-body)' }}>
      {/* ── HERO ──────────────────────────────────────────────── */}
      <section className="relative overflow-hidden" style={{ paddingTop: 'var(--space-20)', paddingBottom: 'var(--space-24)' }}>
        {/* Decorative blobs */}
        <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] rounded-full -z-10 pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(107,255,143,0.15) 0%, transparent 70%)' }} />
        <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] rounded-full -z-10 pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(0,229,253,0.10) 0%, transparent 70%)' }} />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Copy */}
            <motion.div initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.65 }}>
              {/* Eyebrow pill */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-8" style={{ background: 'var(--md-primary-container)', color: 'var(--md-on-primary-container)', fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.07em', textTransform: 'uppercase' }}>
                <Leaf className="w-3.5 h-3.5" />
                Kesegaran Guaranteed · Langsung dari Petani
              </div>

              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2.5rem, 5vw, 3.5rem)', fontWeight: 800, lineHeight: 1.08, letterSpacing: '-0.025em', color: 'var(--text-heading)', marginBottom: '1.25rem' }}>
                Sayur Segar,{' '}<span className="gradient-text">Hidup</span>{' '}Lebih Sehat.
              </h1>
              <p style={{ fontSize: '1.0625rem', color: 'var(--text-body)', lineHeight: 1.7, maxWidth: '34rem', marginBottom: '2.5rem' }}>
                Kurasi hasil bumi terbaik dari petani pilihan. Kami mengantarkan kesegaran alam langsung ke depan pintu rumah Anda.
              </p>

              <div className="flex flex-wrap gap-4">
                <Link to="/products" className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.925rem' }}>
                  <ShoppingCart className="w-4 h-4" /> Mulai Belanja <ArrowRight className="w-4 h-4" />
                </Link>
                {!isAuthenticated && (
                  <Link to="/register" className="btn-secondary" style={{ fontSize: '0.925rem' }}>Daftar Member</Link>
                )}
              </div>
            </motion.div>

            {/* Visual */}
            <motion.div initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8 }} className="hidden lg:block relative">
              <div className="relative w-full h-[420px] rounded-3xl overflow-hidden" style={{ background: 'var(--surface-container)' }}>
                <img
                  src="https://images.unsplash.com/photo-1566385101042-1a0aa0c1268c?q=80&w=1932&auto=format&fit=crop"
                  alt="Fresh vegetables"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,74,29,0.3) 0%, transparent 60%)' }} />
              </div>
              {/* Floating stat card */}
              <div className="absolute -bottom-5 -left-5 px-5 py-4 rounded-2xl animate-float" style={{ background: 'var(--surface-container-lowest)', boxShadow: 'var(--shadow-lg)' }}>
                <p style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 800, color: 'var(--md-primary)' }}>{productCount}+</p>
                <p className="label-sm">Produk Tersedia</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── STATS STRIP ───────────────────────────────────────── */}
      <section style={{ background: 'var(--surface-container-lowest)', paddingTop: 'var(--space-10)', paddingBottom: 'var(--space-10)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {stats.map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.07 }}>
                <div className="flex justify-center mb-3">
                  <div style={{ width: '2.75rem', height: '2.75rem', borderRadius: 'var(--radius-md)', background: 'var(--md-primary-container)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {s.icon}
                  </div>
                </div>
                <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-heading)' }}>{s.value}</p>
                <p className="label-sm mt-1">{s.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CATEGORY EXPLORER ─────────────────────────────────── */}
      <section style={{ padding: 'var(--space-16) 0' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap gap-3 items-center justify-center">
            {categories.map((c, i) => (
              <Link to={`/products?category=${c.name}`} key={i}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.4rem', borderRadius: 'var(--radius-full)', background: 'var(--surface-container-low)', color: 'var(--on-surface)', fontWeight: 600, fontSize: '0.85rem', textDecoration: 'none', transition: 'background 0.2s ease, transform 0.2s ease' }}
                onMouseOver={e => { e.currentTarget.style.background = 'var(--md-primary-container)'; e.currentTarget.style.color = 'var(--md-on-primary-container)'; e.currentTarget.style.transform = 'scale(1.04)'; }}
                onMouseOut={e => { e.currentTarget.style.background = 'var(--surface-container-low)'; e.currentTarget.style.color = 'var(--on-surface)'; e.currentTarget.style.transform = 'scale(1)'; }}
              >
                {c.emoji} {c.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHY SECTION ───────────────────────────────────────── */}
      <section style={{ background: 'var(--surface-container-low)', paddingTop: 'var(--space-20)', paddingBottom: 'var(--space-20)' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-14 text-center">
            <p className="label-sm mb-3">Kenapa SayurSehat?</p>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2.25rem', fontWeight: 800, color: 'var(--text-heading)' }}>Pengalaman Premium</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                style={{ background: 'var(--surface-container-lowest)', borderRadius: 'var(--radius-lg)', padding: '2rem', boxShadow: 'var(--shadow-sm)' }}>
                <div style={{ width: '3rem', height: '3rem', borderRadius: 'var(--radius-md)', background: 'var(--md-primary-container)', color: 'var(--md-on-primary-container)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
                  {f.icon}
                </div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-heading)', marginBottom: '0.6rem' }}>{f.title}</h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-body)', lineHeight: 1.65 }}>{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURED PRODUCTS ─────────────────────────────────── */}
      {products.length > 0 && (
        <section style={{ padding: 'var(--space-20) 0' }}>
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between mb-10">
              <div>
                <p className="label-sm mb-2">Musim Panen Ini</p>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-heading)' }}>Pilihan Segar Hari Ini</h2>
              </div>
              <Link to="/products" style={{ color: 'var(--md-primary)', fontWeight: 700, fontSize: '0.85rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                Lihat Semua <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
              {products.map((p, i) => (
                <motion.div key={p.id_product} initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.07 }}>
                  <Link to={`/products/${p.id_product}`} className="product-card block" style={{ textDecoration: 'none' }}>
                    <div className="image-wrap">
                      {p.image_url ? (
                        <img src={p.image_url} alt={p.name} />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center" style={{ background: 'var(--surface-container)' }}>
                          <Leaf style={{ width: '3.5rem', height: '3.5rem', color: 'var(--md-primary)', opacity: 0.25 }} />
                        </div>
                      )}
                    </div>
                    <div style={{ padding: '1.125rem 1.25rem' }}>
                      <p className="label-sm mb-1">{p.category?.name || 'Organik'}</p>
                      <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-heading)', marginBottom: '0.75rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</h3>
                      <p style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.1rem', color: 'var(--md-primary)' }}>
                        Rp {p.price?.toLocaleString('id-ID')}
                      </p>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── CTA BANNER ────────────────────────────────────────── */}
      <section style={{ padding: 'var(--space-16) var(--space-4)' }}>
        <div className="max-w-6xl mx-auto">
          <div className="relative overflow-hidden" style={{ borderRadius: 'calc(var(--radius-lg) * 2)', background: 'linear-gradient(135deg, #003a18 0%, #006a2d 60%, #00a347 100%)', padding: 'clamp(3rem, 6vw, 5rem) clamp(1.5rem, 5vw, 5rem)', textAlign: 'center' }}>
            {/* Decorative circles */}
            <div className="absolute top-[-20%] left-[-8%] w-64 h-64 rounded-full pointer-events-none" style={{ background: 'rgba(107,255,143,0.12)', filter: 'blur(40px)' }} />
            <div className="absolute bottom-[-20%] right-[-8%] w-80 h-80 rounded-full pointer-events-none" style={{ background: 'rgba(0,229,253,0.08)', filter: 'blur(60px)' }} />
            <div className="relative z-10">
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.75rem, 4vw, 2.75rem)', fontWeight: 800, color: 'white', marginBottom: '1rem', lineHeight: 1.15 }}>
                Bergabung dengan Komunitas Sehat
              </h2>
              <p style={{ color: 'rgba(206,255,208,0.80)', fontSize: '1rem', marginBottom: '2.5rem', maxWidth: '32rem', marginLeft: 'auto', marginRight: 'auto', lineHeight: 1.7 }}>
                Dapatkan penawaran eksklusif dan info panen sayur langsung di dashboard Anda.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link to="/register" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.85rem 2rem', borderRadius: 'var(--radius-full)', background: 'white', color: 'var(--md-on-primary-container)', fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '0.9rem', textDecoration: 'none', transition: 'opacity 0.2s ease' }}>
                  Daftar Sekarang <ArrowRight className="w-4 h-4" />
                </Link>
                <Link to="/products" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.85rem 2rem', borderRadius: 'var(--radius-full)', background: 'rgba(255,255,255,0.12)', color: 'white', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.9rem', textDecoration: 'none', border: '1px solid rgba(255,255,255,0.25)' }}>
                  Lihat Produk
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
