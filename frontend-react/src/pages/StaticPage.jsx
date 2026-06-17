import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Building2, Briefcase, FileText, Shield, ScrollText, LifeBuoy, Phone } from 'lucide-react';
import Footer from '../components/Footer';

const PAGE_DATA = {
  'about': {
    title: 'Tentang Kami',
    icon: <Building2 className="w-8 h-8 text-emerald-500 mb-4" />,
    content: (
      <>
        <h2 className="text-2xl font-black mb-4 dark:text-white">Pionir Sayuran Organik Digital</h2>
        <p className="mb-4">SayurSehat didirikan dengan satu misi sederhana: Membawa kesegaran kebun langsung ke dapur Anda. Kami bermitra langsung dengan lebih dari 500+ petani lokal di seluruh Indonesia untuk memastikan bahwa setiap daun yang Anda terima adalah yang terbaik.</p>
        <p>Dengan memotong rantai pasokan tradisional, kami tidak hanya memberikan sayuran segar dengan harga lebih terjangkau, tetapi juga membantu menyejahterakan kehidupan petani lokal kita.</p>
      </>
    )
  },
  'careers': {
    title: 'Karier',
    icon: <Briefcase className="w-8 h-8 text-emerald-500 mb-4" />,
    content: (
      <>
        <h2 className="text-2xl font-black mb-4 dark:text-white">Bergabung Bersama Kami</h2>
        <p className="mb-4">Kami selalu mencari talenta-talenta luar biasa yang memiliki visi yang sama dengan kami: mendemokratisasi akses terhadap makanan sehat dan mendukung pertanian lokal.</p>
        <div className="bg-emerald-50 dark:bg-emerald-900/10 p-6 rounded-2xl border border-emerald-100 dark:border-emerald-800/50 mt-6">
          <p className="font-bold text-emerald-800 dark:text-emerald-400">Belum ada posisi terbuka.</p>
          <p className="text-sm text-emerald-600 dark:text-emerald-500 mt-1">Silakan pantau halaman ini secara berkala atau kirimkan resume Anda ke <strong>careers@sayursehat.id</strong></p>
        </div>
      </>
    )
  },
  'blog': {
    title: 'Blog',
    icon: <FileText className="w-8 h-8 text-emerald-500 mb-4" />,
    content: (
      <>
        <h2 className="text-2xl font-black mb-4 dark:text-white">Inspirasi Hidup Sehat</h2>
        <p className="mb-6">Temukan artikel, resep, dan tips seputar gaya hidup organik dari para pakar kami.</p>
        <div className="grid gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex gap-4 p-4 rounded-2xl border border-gray-100 dark:border-slate-800 hover:shadow-md transition-shadow cursor-pointer">
              <div className="w-24 h-24 bg-gray-200 dark:bg-slate-700 rounded-xl flex-shrink-0"></div>
              <div>
                <p className="text-xs font-bold text-emerald-600 mb-1">Tips Kesehatan</p>
                <h3 className="font-bold text-gray-900 dark:text-white line-clamp-2">5 Alasan Mengapa Sayuran Organik Lebih Baik untuk Pencernaan Anda</h3>
                <p className="text-xs text-gray-500 mt-2">Ditulis pada 12 Okt 2024</p>
              </div>
            </div>
          ))}
        </div>
      </>
    )
  },
  'privacy': {
    title: 'Kebijakan Privasi',
    icon: <Shield className="w-8 h-8 text-emerald-500 mb-4" />,
    content: (
      <>
        <h2 className="text-2xl font-black mb-4 dark:text-white">Perlindungan Data Anda</h2>
        <p className="mb-4">Privasi Anda sangat penting bagi kami. Kebijakan ini menjelaskan bagaimana kami mengumpulkan, menggunakan, dan melindungi informasi pribadi Anda saat menggunakan layanan SayurSehat.</p>
        <ul className="list-disc pl-5 space-y-2 mb-4 text-gray-600 dark:text-gray-300">
          <li>Kami hanya mengumpulkan data yang diperlukan untuk memproses pesanan.</li>
          <li>Data alamat dan kontak Anda dienkripsi dan disimpan dengan aman.</li>
          <li>Kami tidak pernah menjual data Anda ke pihak ketiga.</li>
        </ul>
        <p>Dengan menggunakan SayurSehat, Anda menyetujui pengumpulan dan penggunaan informasi sesuai dengan kebijakan ini.</p>
      </>
    )
  },
  'terms': {
    title: 'Syarat & Ketentuan',
    icon: <ScrollText className="w-8 h-8 text-emerald-500 mb-4" />,
    content: (
      <>
        <h2 className="text-2xl font-black mb-4 dark:text-white">Syarat Penggunaan Layanan</h2>
        <p className="mb-4">Harap baca Syarat dan Ketentuan ini secara saksama sebelum menggunakan website SayurSehat.</p>
        <p className="mb-2"><strong>1. Akun Pengguna</strong></p>
        <p className="mb-4">Anda bertanggung jawab untuk menjaga kerahasiaan akun dan kata sandi Anda. Anda menyetujui untuk menerima tanggung jawab atas semua aktivitas yang terjadi di bawah akun Anda.</p>
        <p className="mb-2"><strong>2. Kebijakan Pengembalian (Refund)</strong></p>
        <p className="mb-4">Komplain terkait kualitas sayur yang diterima hanya dapat diajukan dalam waktu maksimal 1x24 jam setelah barang berstatus 'Delivered' dengan menyertakan bukti foto melalui fitur Pusat Sengketa.</p>
      </>
    )
  },
  'help': {
    title: 'Pusat Bantuan',
    icon: <LifeBuoy className="w-8 h-8 text-emerald-500 mb-4" />,
    content: (
      <>
        <h2 className="text-2xl font-black mb-4 dark:text-white">Ada yang bisa kami bantu?</h2>
        <div className="space-y-4">
          <details className="p-4 bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm">
            <summary className="font-bold cursor-pointer text-gray-900 dark:text-white">Berapa lama waktu pengiriman?</summary>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">Pesanan Anda akan dikirim dalam waktu maksimal 2 jam setelah pembayaran terverifikasi, menggunakan sistem pengiriman instan kurir mitra kami.</p>
          </details>
          <details className="p-4 bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm">
            <summary className="font-bold cursor-pointer text-gray-900 dark:text-white">Bagaimana cara menjadi Supplier?</summary>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">Anda dapat mendaftar dengan memilih role "Supplier" di halaman registrasi. Pastikan Anda memiliki sertifikat kebun organik yang valid.</p>
          </details>
        </div>
      </>
    )
  },
  'contact': {
    title: 'Hubungi Kami',
    icon: <Phone className="w-8 h-8 text-emerald-500 mb-4" />,
    content: (
      <>
        <h2 className="text-2xl font-black mb-4 dark:text-white">Tetap Terhubung</h2>
        <p className="mb-6">Tim dukungan kami tersedia 24/7 untuk menjawab segala pertanyaan Anda.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-gray-100 dark:border-slate-700">
            <h3 className="font-bold mb-2 dark:text-white">Email Dukungan</h3>
            <p className="text-emerald-600 font-medium">halo@sayursehat.id</p>
          </div>
          <div className="bg-gray-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-gray-100 dark:border-slate-700">
            <h3 className="font-bold mb-2 dark:text-white">WhatsApp / Telepon</h3>
            <p className="text-emerald-600 font-medium">+62 812-3456-7890</p>
          </div>
          <div className="bg-gray-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-gray-100 dark:border-slate-700 md:col-span-2">
            <h3 className="font-bold mb-2 dark:text-white">Alamat Kantor Pusat</h3>
            <p className="text-gray-600 dark:text-gray-300">Jl. Sayuran Hijau No. 12, Bandung, Jawa Barat 40123, Indonesia</p>
          </div>
        </div>
      </>
    )
  }
};

export default function StaticPage() {
  const { pageId } = useParams();
  const page = PAGE_DATA[pageId];

  if (!page) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900">
        <div className="text-center">
          <h1 className="text-4xl font-black text-gray-900 dark:text-white mb-4">404</h1>
          <p className="text-gray-500 mb-6">Halaman tidak ditemukan.</p>
          <Link to="/" className="btn-primary px-6 py-2 rounded-full inline-flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" /> Kembali ke Beranda
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-slate-900 transition-colors">
      <main className="flex-grow max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <Link to="/" className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors mb-10">
          <ArrowLeft className="w-4 h-4" /> Kembali ke Beranda
        </Link>
        
        <div className="bg-white dark:bg-slate-800 rounded-[2rem] p-8 md:p-12 shadow-sm border border-gray-100 dark:border-slate-700/50">
          {page.icon}
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tight mb-8">{page.title}</h1>
          <div className="prose prose-emerald dark:prose-invert max-w-none prose-p:leading-relaxed prose-headings:font-black">
            {page.content}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
