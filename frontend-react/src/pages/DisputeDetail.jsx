import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { ArrowLeft, Send, ShieldAlert, CheckCircle, XCircle, Info, Image as ImageIcon } from 'lucide-react';

export default function DisputeDetail() {
  const { id } = useParams(); /* id dispute */
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  
  const [dispute, setDispute] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);
  const [resolving, setResolving] = useState(false);
  
  const messagesEndRef = useRef(null);

  const fetchDetail = () => {
    api.get(`/disputes/${id}`)
      .then(r => {
        setDispute(r.data.data.dispute);
        setMessages(r.data.data.messages || []);
      })
      .catch(() => {
        toast.error("Sengketa tidak ditemukan");
        navigate('/orders');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchDetail(); }, [id]);

  useEffect(() => {
    // Auto scroll ke bawah saat pesan bertambah
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    setSending(true);
    try {
      await api.post(`/disputes/${id}/reply`, { message: replyText });
      setReplyText('');
      fetchDetail(); // segarkan chat
    } catch (err) {
      toast.error(err.response?.data?.error || "Gagal membalas");
    }
    setSending(false);
  };

  const handleResolve = async (decision) => {
    const note = prompt("Berikan catatan admin untuk putusan ini (Opsional):");
    if (note === null) return; // cancel
    
    setResolving(true);
    try {
      await api.put(`/disputes/${id}/resolve`, { decision, admin_note: note });
      toast.success("Sengketa ditutup!");
      fetchDetail();
    } catch (err) {
      toast.error(err.response?.data?.error || "Gagal menutup sengketa");
    }
    setResolving(false);
  };

  if (loading) return <div className="max-w-3xl mx-auto px-4 py-8"><div className="h-96 skeleton" /></div>;
  if (!dispute) return null;

  const getStatusBadge = (s) => {
    switch(s) {
      case 'OPEN': return <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700 font-mono">AKTIF</span>;
      case 'APPROVED_FOR_RETURN': return <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700 flex items-center gap-1">⏱️ MENUNGGU KURIR</span>;
      case 'RETURNING': return <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-100 text-indigo-700 flex items-center gap-1">🚚 DIPERJALANAN RETUR</span>;
      case 'RETURNED': return <span className="px-3 py-1 rounded-full text-xs font-bold bg-teal-100 text-teal-700 flex items-center gap-1">📦 SUKSES DIKEMBALIKAN</span>;
      case 'REFUNDED': return <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5"/> UANG KEMBALI</span>;
      case 'REJECTED': return <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700 flex items-center gap-1"><XCircle className="w-3.5 h-3.5"/> DITOLAK</span>;
      default: return <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700">{s}</span>;
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8 bg-gray-50 dark:bg-slate-900 min-h-screen">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm font-medium mb-6 cursor-pointer hover:-translate-x-1 transition-all text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
        <ArrowLeft className="w-4 h-4" /> Kembali
      </button>

      <div className="bg-white dark:bg-slate-800 shadow-xl border border-gray-100 dark:border-slate-800 p-6 border-l-4 border-l-emerald-500 mb-6 flex flex-col md:flex-row gap-6 items-start rounded-xl">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-xl font-black flex items-center gap-2 text-gray-900 dark:text-white">
              <ShieldAlert className="w-6 h-6 text-emerald-500" /> Pusat Mediasi
            </h2>
            {getStatusBadge(dispute.status)}
          </div>
          <p className="text-sm font-mono mb-4 text-gray-500 dark:text-gray-400">Order: #{dispute.id_order.slice(0, 8)}</p>
          
          <div className="p-4 rounded-xl bg-gray-50 dark:bg-slate-900/50">
            <p className="text-xs font-bold uppercase mb-1 text-gray-500 dark:text-gray-400">Alasan Komplain:</p>
            <p className="text-sm font-medium text-gray-900 dark:text-white">"{dispute.reason}"</p>
          </div>

          {dispute.admin_note && (
             <div className="mt-4 p-4 rounded-xl border border-emerald-500/30 bg-emerald-50 dark:bg-emerald-900/20">
               <p className="text-xs font-bold uppercase mb-1 flex items-center gap-1 text-emerald-600 dark:text-emerald-400"><Info className="w-4 h-4"/> Putusan Admin:</p>
               <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">"{dispute.admin_note}"</p>
             </div>
          )}
        </div>

        {dispute.image_url && (
          <div className="w-full md:w-48 shrink-0">
             <p className="text-xs font-bold uppercase mb-2 text-gray-500 dark:text-gray-400">Bukti Lampiran:</p>
             <a href={`http://localhost:8080${dispute.image_url}`} target="_blank" rel="noreferrer" className="block relative group overflow-hidden rounded-xl bg-black">
                <img src={`http://localhost:8080${dispute.image_url}`} className="w-full h-32 object-cover opacity-80 group-hover:opacity-100 transition-opacity" alt="Bukti"/>
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="bg-black/60 text-white text-[10px] px-3 py-1 rounded-full flex items-center gap-1"><ImageIcon className="w-3 h-3"/> Lihat Penuh</span>
                </div>
             </a>
          </div>
        )}
      </div>

      {/* Chat Room */}
      <div className="bg-white dark:bg-slate-800 shadow-xl border border-gray-100 dark:border-slate-800 flex flex-col h-[550px] rounded-xl overflow-hidden">
        <div className="p-4 border-b border-gray-100 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-900/30">
          <h3 className="font-bold text-sm text-gray-900 dark:text-white">Ruang Diskusi Premium</h3>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50 dark:bg-slate-900">
          {messages.length === 0 ? (
            <div className="text-center text-sm mt-10 text-gray-500 dark:text-gray-400">Mulai percakapan untuk menyelesaikan kendala.</div>
          ) : (
            messages.map((m) => {
              const isMe = m.sender_id === user?.id;
              const isSystemAdmin = m.sender?.role === 'admin';
              
              return (
                <div key={m.id_message} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-4 shadow-sm transition-all hover:shadow-md ${
                    isSystemAdmin ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-900 dark:text-white border-2 border-amber-200 rounded-xl italic text-xs' :
                    isMe ? 'bg-emerald-500 text-white rounded-xl rounded-br-none' : 'bg-white dark:bg-slate-800 text-gray-900 dark:text-white rounded-xl rounded-bl-none border border-gray-100 dark:border-slate-700'
                  }`}>
                    {!isMe && !isSystemAdmin && (
                      <p className="text-[9px] font-black mb-1 opacity-60 uppercase tracking-tighter">{m.sender?.name} • {m.sender?.role}</p>
                    )}
                    {isSystemAdmin && (
                      <p className="text-[10px] font-black mb-1 flex items-center gap-1 uppercase tracking-widest"><ShieldAlert className="w-3 h-3"/> Moderator SayurSehat</p>
                    )}
                    <p className="text-sm leading-relaxed">{m.message}</p>
                    <div className={`text-[8px] mt-2 font-bold ${isMe ? 'text-emerald-100' : 'text-gray-400 dark:text-gray-500'}`}>
                      {new Date(m.created_at).toLocaleTimeString('id-ID', {hour: '2-digit', minute:'2-digit'})}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Reply Box */}
        {dispute.status === 'OPEN' ? (
          <div className="p-6 border-t border-[var(--border-light)] bg-white dark:bg-[#2a2e25]">
             <form onSubmit={sendReply} className="flex gap-3">
               <input
                 type="text"
                 placeholder="Tulis pesan penyelesaian..."
                 className="flex-1 px-4 py-3 rounded-2xl border border-[var(--border-light)] focus:ring-2 focus:ring-[#9CA986] focus:border-transparent outline-none text-sm transition-all"
                 value={replyText}
                 onChange={(e) => setReplyText(e.target.value)}
                 disabled={sending}
               />
               <button type="submit" disabled={sending || !replyText.trim()} className="w-12 h-12 rounded-2xl bg-[#9CA986] text-white flex items-center justify-center shrink-0 hover:scale-105 active:scale-95 transition-all disabled:opacity-50">
                 <Send className="w-5 h-5" />
               </button>
             </form>

             {(user?.role === 'admin' || user?.role === 'supplier') && (
               <div className="mt-6 pt-5 border-t border-dashed border-[var(--border-light)] flex flex-wrap justify-end gap-3">
                 <p className="text-[10px] text-[#828e6c] font-black uppercase tracking-widest self-center mr-auto">Mediation Actions</p>
                 <button type="button" onClick={() => handleResolve('REJECTED')} disabled={resolving} className="px-5 py-2 rounded-2xl border border-red-200 text-red-600 text-xs font-bold hover:bg-red-50 transition-colors">Tolak Komplain</button>
                 <button type="button" onClick={() => handleResolve('APPROVED_FOR_RETURN')} disabled={resolving} className="px-6 py-2 rounded-2xl bg-[#9CA986] text-white text-xs font-bold hover:bg-[#828e6c] shadow-lg shadow-[#9CA986]/20 transition-all">Setuju Retur Barang</button>
               </div>
             )}
          </div>
        ) : dispute.status === 'RETURNED' ? (
          <div className="p-6 border-t border-[var(--border-light)] bg-[#f7f8f4] dark:bg-[#2a2e25]">
             {(user?.role === 'admin' || user?.role === 'supplier') ? (
               <div className="flex justify-end gap-3 items-center">
                 <p className="text-xs text-[#828e6c] font-bold self-center mr-auto">BARANG DITERIMA. Selesaikan Refund untuk Pembeli:</p>
                 <button type="button" onClick={() => handleResolve('REFUNDED')} disabled={resolving} className="px-8 py-3 rounded-2xl bg-[#9CA986] text-white text-sm font-black flex items-center gap-2 hover:scale-105 transition-all shadow-xl shadow-[#9CA986]/30"><CheckCircle className="w-5 h-5"/> SELESAIKAN SENGKETA</button>
               </div>
             ) : (
                <div className="text-center py-4 text-xs font-black text-[#828e6c] uppercase tracking-[0.2em] animate-pulse">
                  Barang telah sampai. Menunggu Admin/Penjual mencairkan dana Anda.
                </div>
             )}
          </div>
        ) : (
          <div className="p-6 border-t border-[var(--border-light)] bg-[#ecedde]/30 text-center text-[10px] font-black text-[#828e6c] uppercase tracking-[0.3em]">
             Sengketa Selesai / Sedang dalam Penanganan Kurir
          </div>
        )}
      </div>

    </div>
  );
}
