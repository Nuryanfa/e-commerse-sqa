import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { Leaf, ShoppingCart, ArrowRight, CheckCircle2, Truck, Shield } from 'lucide-react';
import api from '../services/api';

/* ─── Reusable footer ───────────────────────────────────────── */
function HomeFooter() {
  return (
    <footer style={{ background: 'var(--on-surface)', color: 'var(--surface-dim)', padding: '4rem 0 2rem' }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-10" style={{ borderBottom: '1px solid rgba(255,255,255,0.10)' }}>
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div style={{ width: '2rem', height: '2rem', borderRadius: '0.5rem', background: 'var(--brand-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Leaf style={{ width: '1rem', height: '1rem', color: 'white' }} />
              </div>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, color: 'white', fontSize: '1rem' }}>SayurSehat</span>
            </div>
            <p style={{ fontSize: '0.8rem', lineHeight: 1.8, color: 'rgba(255,255,255,0.55)', maxWidth: '16rem' }}>
              Membawa kesegaran kebun digital langsung ke dapur Anda. Pionir sayuran organik premium di Indonesia.
            </p>
          </div>
          {[
            { title: 'Perusahaan', links: ['Tentang Kami', 'Karier', 'Blog'] },
            { title: 'Bantuan', links: ['Kebijakan Privasi', 'Syarat & Ketentuan', 'Bantuan', 'Kontak'] },
          ].map(col => (
            <div key={col.title}>
              <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.775rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.40)', marginBottom: '1rem' }}>{col.title}</p>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {col.links.map(l => (
                  <li key={l}><a href="#" style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.85rem', textDecoration: 'none', transition: 'color 0.2s' }} onMouseOver={e => e.target.style.color = 'white'} onMouseOut={e => e.target.style.color = 'rgba(255,255,255,0.65)'}>{l}</a></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <p style={{ textAlign: 'center', fontSize: '0.75rem', color: 'rgba(255,255,255,0.30)', paddingTop: '1.5rem' }}>© 2024 SayurSehat — The Digital Greenhouse. All rights reserved.</p>
      </div>
    </footer>
  );
}

/* ─── Main Homepage ────────────────────────────────────────── */
export default function Home() {
  const { isAuthenticated } = useAuth();
  const [products, setProducts] = useState([]);

  useEffect(() => {
    api.get('/products').then(res => {
      setProducts((res.data.data || []).slice(0, 4));
    }).catch(() => {});
  }, []);

  const whyItems = [
    { icon: <Leaf style={{ width: '1.5rem', height: '1.5rem' }} />, title: '100% Organik', desc: 'Tanpa pestisida kimia. Sertifikasi organik internasional untuk setiap produk kami.' },
    { icon: <Truck style={{ width: '1.5rem', height: '1.5rem' }} />, title: 'Pengiriman 2 Jam', desc: 'Sistem logistik cerdas memastikan sayuran sampai dalam kondisi paling segar.' },
    { icon: <Shield style={{ width: '1.5rem', height: '1.5rem' }} />, title: 'Dukungan Petani Lokal', desc: 'Setiap pembelian Anda berkontribusi langsung pada kesejahteraan komunitas petani lokal.' },
  ];

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>

      {/* ══════════════════════════════════════════════════════
          1. HERO — Full-bleed editorial: text left / image right
      ══════════════════════════════════════════════════════ */}
      <section style={{ padding: '5rem 0 4rem', overflow: 'hidden' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">

            {/* Left: Copy */}
            <div>
              {/* Tag */}
              <div className="inline-flex items-center gap-2 mb-6 px-4 py-1.5 rounded-full" style={{ background: 'var(--md-primary-container)', color: 'var(--md-on-primary-container)' }}>
                <Leaf style={{ width: '0.875rem', height: '0.875rem' }} />
                <span style={{ fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.07em', textTransform: 'uppercase' }}>100% Organik · Panen Hari Ini</span>
              </div>

              {/* Headline */}
              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2.5rem, 5.5vw, 3.75rem)', fontWeight: 800, lineHeight: 1.08, letterSpacing: '-0.025em', color: 'var(--text-heading)', marginBottom: '1.25rem' }}>
                Segar dari<br />
                <span className="gradient-text">Kebun Digital</span>
              </h1>

              <p style={{ fontSize: '1.0625rem', color: 'var(--text-body)', lineHeight: 1.75, maxWidth: '32rem', marginBottom: '2.5rem' }}>
                Nikmati hasil bumi terbaik dari petani lokal pilihan, dikirim langsung ke depan pintu rumah Anda dalam hitungan jam.
              </p>

              <div className="flex flex-wrap gap-4">
                <Link to="/products" className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.925rem', textDecoration: 'none' }}>
                  <ShoppingCart style={{ width: '1rem', height: '1rem' }} />
                  Mulai Belanja
                  <ArrowRight style={{ width: '1rem', height: '1rem' }} />
                </Link>
                {!isAuthenticated && (
                  <Link to="/register" className="btn-secondary" style={{ fontSize: '0.925rem', textDecoration: 'none' }}>
                    Daftar Member
                  </Link>
                )}
              </div>
            </div>

            {/* Right: Image */}
            <div className="hidden lg:block relative">
              <div style={{ borderRadius: '1.75rem', overflow: 'hidden', position: 'relative', height: '440px' }}>
                <img
                  src="https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=1974&auto=format&fit=crop"
                  alt="Sayuran segar di keranjang"
                  width="987"
                  height="440"
                  fetchPriority="high"
                  decoding="async"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                {/* Floating card */}
                <div style={{ position: 'absolute', bottom: '1.5rem', left: '1.5rem', background: 'var(--surface-container-lowest)', borderRadius: '1rem', padding: '1rem 1.25rem', boxShadow: 'var(--shadow-lg)' }}>
                  <p style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.75rem', color: 'var(--md-primary)', lineHeight: 1 }}>{products.length || '—'}+</p>
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.7rem', color: 'var(--outline)', textTransform: 'uppercase', letterSpacing: '0.07em', fontWeight: 700, marginTop: '0.25rem' }}>Produk Tersedia</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          2. "PANEN HARI INI" — Featured Products
      ══════════════════════════════════════════════════════ */}
      {products.length > 0 && (
        <section style={{ paddingTop: '4rem', paddingBottom: '4rem', background: 'var(--surface-container-low)' }}>
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between mb-8">
              <div>
                <p className="label-sm mb-2">Musim Panen Ini</p>
                <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.75rem', color: 'var(--text-heading)' }}>Panen Hari Ini</h2>
              </div>
              <Link to="/products" style={{ color: 'var(--md-primary)', fontWeight: 700, fontSize: '0.85rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                Lihat Semua <ArrowRight style={{ width: '0.875rem', height: '0.875rem' }} />
              </Link>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
              {products.map((p) => (
                <div key={p.id_product}>
                  <Link to={`/products/${p.id_product}`} className="product-card block" style={{ textDecoration: 'none' }}>
                    <div className="image-wrap">
                      {p.image_url ? (
                        <img src={p.image_url} alt={p.name} loading="lazy" decoding="async" />
                      ) : (
                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--surface-container-low)' }}>
                          <Leaf style={{ width: '3rem', height: '3rem', color: 'var(--md-primary)', opacity: 0.25 }} />
                        </div>
                      )}
                    </div>
                    <div style={{ padding: '1rem 1.25rem 1.25rem' }}>
                      <p className="label-sm mb-1">{p.category?.name || 'Organik'}</p>
                      <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-heading)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: '0.625rem' }}>{p.name}</h3>
                      <p style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.05rem', color: 'var(--md-primary)' }}>
                        Rp {(p.variants?.length > 0 ? p.variants[0].price : p.price)?.toLocaleString('id-ID')}
                      </p>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ══════════════════════════════════════════════════════
          3. SUBSCRIPTION DARK BANNER — "Langganan Kotak Sayur Mingguan"
      ══════════════════════════════════════════════════════ */}
      <section style={{ background: '#0a1a0f', padding: '5rem 1.5rem' }}>
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Text */}
          <div>
            <p style={{ fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--md-primary)', marginBottom: '1.25rem' }}>Program Eksklusif</p>
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', color: 'white', lineHeight: 1.15, marginBottom: '1.25rem' }}>
              Langganan Kotak<br />Sayur Mingguan
            </h2>
            <p style={{ color: 'rgba(200,255,200,0.75)', fontSize: '0.95rem', lineHeight: 1.8, marginBottom: '2.5rem', maxWidth: '30rem' }}>
              Mulai hidup sehat lebih mudah. Sayuran terbaik pilihan kurator kami, diantar setiap Senin pagi ke rumah Anda.
            </p>
            <div className="flex flex-col gap-3 mb-8">
              {['Dipilih oleh kurator ahli gizi', 'Pengiriman rutin setiap minggu', 'Bisa customisasi pilihan sayuran'].map(item => (
                <div key={item} className="flex items-center gap-2.5">
                  <CheckCircle2 style={{ width: '1rem', height: '1rem', color: 'var(--md-primary)', flexShrink: 0 }} />
                  <span style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.875rem' }}>{item}</span>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-4">
              <button style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.85rem 2rem', borderRadius: 'var(--radius-full)', background: 'var(--brand-gradient)', color: 'white', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.9rem', border: 'none', cursor: 'pointer' }}>
                Berlangganan Sekarang
              </button>
              <button style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.85rem 2rem', borderRadius: 'var(--radius-full)', background: 'rgba(255,255,255,0.08)', color: 'white', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '0.9rem', border: '1px solid rgba(255,255,255,0.15)', cursor: 'pointer' }}>
                Pelajari Lebih Lanjut
              </button>
            </div>
          </div>

          {/* Image collage */}
          <div className="hidden lg:grid" style={{ gridTemplateColumns: '1fr 1fr', gridTemplateRows: '1fr 1fr', gap: '0.75rem', height: '380px' }}>
            {[
              'https://images.unsplash.com/photo-1566385101042-1a0aa0c1268c?q=80&w=800&auto=format&fit=crop',
              'https://images.unsplash.com/photo-1518977676601-b53f82aba655?q=80&w=800&auto=format&fit=crop',
              'https://images.unsplash.com/photo-1597362925123-77861d3fbac7?q=80&w=800&auto=format&fit=crop',
              'https://images.unsplash.com/photo-1528137871618-79d2761e3fd5?q=80&w=800&auto=format&fit=crop',
            ].map((src, i) => (
              <div key={i} style={{ borderRadius: '1rem', overflow: 'hidden' }}>
                <img src={src} alt="" loading="lazy" decoding="async" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          4. WHY SECTION — "Kenapa SayurSehat?"
      ══════════════════════════════════════════════════════ */}
      <section style={{ padding: '5rem 0', background: 'var(--bg)' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="label-sm mb-3">Alasan Kami Berbeda</p>
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '2rem', color: 'var(--text-heading)' }}>Kenapa SayurSehat?</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {whyItems.map((item, i) => (
              <div key={i}
                style={{ background: 'var(--surface-container-lowest)', borderRadius: 'var(--radius-lg)', padding: '2.25rem', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border)' }}>
                <div style={{ width: '3rem', height: '3rem', borderRadius: 'var(--radius-md)', background: 'var(--md-primary-container)', color: 'var(--md-on-primary-container)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
                  {item.icon}
                </div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.125rem', color: 'var(--text-heading)', marginBottom: '0.75rem' }}>{item.title}</h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-body)', lineHeight: 1.7 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <HomeFooter />
    </div>
  );
}
