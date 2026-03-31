import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Send, MessageCircle, HelpCircle, FileText, ChevronRight } from 'lucide-react';

export default function SupplierSupport() {
  const { user } = useAuth();
  const toast = useToast();
  const [topic, setTopic] = useState('umum');
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!message.trim()) return toast.error('Pesan tidak boleh kosong!');
    
    setIsSending(true);
    setTimeout(() => {
      toast.success('Pesan bantuan berhasil dikirim! Tim kami akan segera menghubungi Anda.');
      setMessage('');
      setIsSending(false);
    }, 1500);
  };

  const faqs = [
    { q: 'Bagaimana cara menarik dana penjualan?', a: 'Dana hasil penjualan akan otomatis ditransfer ke rekening yang terdaftar setiap hari Senin.' },
    { q: 'Mengapa produk saya ditolak admin?', a: 'Produk ditolak biasanya jika foto buram, deskripsi tidak lengkap, atau bukan sayuran organik bersertifikat.' },
    { q: 'Bagaimana cara memproses pesanan masuk?', a: 'Buka menu Orders, klik Proses pada pesanan berstatus Pending untuk memberitahu pembeli bahwa barang sedang disiapkan.' }
  ];

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight mb-2">Pusat Bantuan</h1>
        <p className="text-gray-500 dark:text-gray-400">Temukan jawaban atau hubungi tim dukungan SayurSehat.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Col: Contact Form */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 md:p-8 border border-gray-100 dark:border-slate-700 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-emerald-500" /> Hubungi Kami
            </h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2 block">Topik Kendala</label>
                <select value={topic} onChange={e => setTopic(e.target.value)} className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-sm font-bold focus:ring-2 focus:ring-emerald-500 outline-none">
                  <option value="umum">Pertanyaan Umum</option>
                  <option value="pesanan">Kendala Pesanan</option>
                  <option value="pembayaran">Pencairan Dana</option>
                  <option value="akun">Masalah Akun</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2 block">Pesan Detail</label>
                <textarea 
                  rows="5" 
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  placeholder="Jelaskan kendala Anda secara rinci..." 
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-sm font-medium focus:ring-2 focus:ring-emerald-500 outline-none resize-none"
                ></textarea>
              </div>
              <div className="pt-2">
                <button type="submit" disabled={isSending} className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white px-8 py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors w-full sm:w-auto">
                  {isSending ? 'Mengirim...' : <><Send className="w-4 h-4" /> Kirim Pesan</>}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Col: FAQs & Guides */}
        <div className="space-y-6">
          
          <div className="bg-emerald-50 dark:bg-emerald-500/10 rounded-3xl p-6 border border-emerald-100 dark:border-emerald-500/20">
            <h3 className="font-bold text-emerald-900 dark:text-emerald-400 mb-4 flex items-center gap-2">
              <HelpCircle className="w-5 h-5" /> F.A.Q Utama
            </h3>
            <div className="space-y-4">
              {faqs.map((faq, i) => (
                <div key={i} className="bg-white/60 dark:bg-slate-800/60 p-4 rounded-2xl">
                  <p className="text-sm font-bold text-gray-900 dark:text-white mb-1">{faq.q}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-gray-100 dark:border-slate-700 shadow-sm">
            <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-gray-400" /> Panduan Pintar
            </h3>
            <div className="space-y-2">
              {['Cara Upload Produk Menarik', 'Panduan Packing Organik', 'Syarat Retur Barang'].map((guide, i) => (
                <button key={i} className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-900/50 text-sm font-medium text-gray-600 dark:text-gray-300 transition-colors group">
                  <span>{guide}</span>
                  <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-emerald-500" />
                </button>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
