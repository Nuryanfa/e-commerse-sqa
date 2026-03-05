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
      case 'REFUNDED': return <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5"/> UANG KEMBALI</span>;
      case 'REJECTED': return <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700 flex items-center gap-1"><XCircle className="w-3.5 h-3.5"/> DITOLAK</span>;
      default: return <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700">{s}</span>;
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8" style={{ background: 'var(--surface-base)' }}>
      <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm font-medium mb-6 cursor-pointer hover:-translate-x-1 transition-all" style={{ color: 'var(--text-secondary)' }}>
        <ArrowLeft className="w-4 h-4" /> Kembali
      </button>

      <div className="card-organic p-6 border-l-4 border-amber-500 mb-6 flex flex-col md:flex-row gap-6 items-start">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-xl font-black flex items-center gap-2" style={{ color: 'var(--text-heading)' }}>
              <ShieldAlert className="w-6 h-6 text-amber-500" /> Pusat Mediasi
            </h2>
            {getStatusBadge(dispute.status)}
          </div>
          <p className="text-sm font-mono mb-4" style={{ color: 'var(--text-muted)' }}>Order: #{dispute.id_order.slice(0, 8)}</p>
          
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
            <p className="text-xs font-bold uppercase mb-1" style={{ color: 'var(--text-muted)' }}>Alasan Komplain (Dispute Reason):</p>
            <p className="text-sm font-medium" style={{ color: 'var(--text-heading)' }}>"{dispute.reason}"</p>
          </div>

          {dispute.admin_note && (
             <div className="mt-4 p-4 rounded-xl border border-emerald-200 bg-emerald-50 dark:bg-emerald-900/20 dark:border-emerald-800/50">
               <p className="text-xs font-bold uppercase mb-1 flex items-center gap-1 flex items-center text-emerald-600"><Info className="w-4 h-4"/> Catatan Putusan Admin:</p>
               <p className="text-sm font-medium text-emerald-800 dark:text-emerald-400">"{dispute.admin_note}"</p>
             </div>
          )}
        </div>

        {dispute.image_url && (
          <div className="w-full md:w-48 shrink-0">
             <p className="text-xs font-bold uppercase mb-2" style={{ color: 'var(--text-muted)' }}>Bukti Lampiran:</p>
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
      <div className="card-organic flex flex-col h-[500px]">
        <div className="p-4 rounded-t-[19px] border-b border-[var(--border-light)] bg-slate-50 dark:bg-slate-800/30">
          <h3 className="font-bold text-sm" style={{ color: 'var(--text-heading)' }}>Ruang Diskusi</h3>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="text-center text-sm mt-10" style={{ color: 'var(--text-muted)' }}>Belum ada obrolan. Silakan mulai diskusi penyelesaian masalah.</div>
          ) : (
            messages.map((m) => {
              const isMe = m.sender_id === user?.id; // user dari AuthContext
              const isSystemAdmin = m.sender?.role === 'admin';
              
              return (
                <div key={m.id_message} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[75%] p-3 rounded-2xl ${
                    isSystemAdmin ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-900 dark:text-amber-100 border border-amber-200 uppercase text-xs font-bold' :
                    isMe ? 'bg-emerald-600 text-white rounded-br-none' : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-bl-none'
                  }`}>
                    {!isMe && !isSystemAdmin && (
                      <p className="text-[10px] font-bold mb-1 opacity-60 uppercase">{m.sender?.name} ({m.sender?.role})</p>
                    )}
                    {isSystemAdmin && (
                      <p className="text-[10px] font-black mb-1 flex items-center gap-1"><ShieldAlert className="w-3 h-3"/> HAKIM ADMIN</p>
                    )}
                    <p className={`text-sm ${isSystemAdmin ? 'font-mono' : ''}`}>{m.message}</p>
                    <p className="text-[9px] text-right mt-1 opacity-50">
                      {new Date(m.created_at).toLocaleTimeString('id-ID', {hour: '2-digit', minute:'2-digit'})}
                    </p>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Reply Box */}
        {dispute.status === 'OPEN' ? (
          <div className="p-4 rounded-b-[19px] border-t border-[var(--border-light)] bg-white dark:bg-slate-900">
             <form onSubmit={sendReply} className="flex gap-2">
               <input
                 type="text"
                 placeholder="Tulis pesan penyelesaian / argumen..."
                 className="flex-1 input-field"
                 value={replyText}
                 onChange={(e) => setReplyText(e.target.value)}
                 disabled={sending}
               />
               <button type="submit" disabled={sending || !replyText.trim()} className="btn-primary w-12 h-12 rounded-xl flex items-center justify-center shrink-0 disabled:opacity-50">
                 <Send className="w-5 h-5" />
               </button>
             </form>

             {/* Action for Admin */}
             {user?.role === 'admin' && (
               <div className="mt-4 pt-4 border-t border-dashed border-slate-200 dark:border-slate-800 flex justify-end gap-2">
                 <p className="text-xs text-amber-600 font-bold self-center mr-auto">TINDAKAN MEDIASI (ADMIN):</p>
                 <button type="button" onClick={() => handleResolve('REJECTED')} disabled={resolving} className="btn-secondary text-xs px-3 py-1.5 border-red-200 text-red-600 hover:bg-red-50">Tolak Komplain</button>
                 <button type="button" onClick={() => handleResolve('REFUNDED')} disabled={resolving} className="bg-emerald-600 text-white rounded-xl font-medium shadow-sm transition-all text-xs px-4 py-1.5 hover:bg-emerald-700">Setujui & Refund</button>
               </div>
             )}
          </div>
        ) : (
          <div className="p-4 rounded-b-[19px] border-t border-[var(--border-light)] bg-slate-50 dark:bg-slate-900/50 text-center text-xs font-bold text-slate-400 uppercase tracking-widest">
             Sengketa Telah Ditutup Permanen
          </div>
        )}
      </div>

    </div>
  );
}
