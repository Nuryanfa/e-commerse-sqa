import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { ShieldAlert, Eye, MessageSquare, CheckCircle, XCircle } from 'lucide-react';

export default function AdminDisputes() {
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    api.get('/disputes')
      .then(res => setDisputes(res.data.data || []))
      .catch(() => toast.error('Gagal memuat daftar sengketa'))
      .finally(() => setLoading(false));
  }, []);

  const getStatusBadge = (s) => {
    switch(s) {
      case 'OPEN': return <span className="px-2.5 py-1 inline-flex items-center gap-1 rounded-full text-[10px] font-black tracking-widest bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400"><MessageSquare className="w-3 h-3"/> SELESAIKAN</span>;
      case 'REFUNDED': return <span className="px-2.5 py-1 inline-flex items-center gap-1 rounded-full text-[10px] font-black tracking-widest bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400"><CheckCircle className="w-3 h-3"/> DIKEMBALIKAN</span>;
      case 'REJECTED': return <span className="px-2.5 py-1 inline-flex items-center gap-1 rounded-full text-[10px] font-black tracking-widest bg-slate-100 dark:bg-slate-800 text-slate-500"><XCircle className="w-3 h-3"/> DITOLAK</span>;
      default: return <span className="px-2.5 py-1 rounded-full text-xs bg-gray-100 text-gray-700">{s}</span>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex items-center gap-4 mb-8 animate-fade-in-up">
        <div className="w-14 h-14 bg-gradient-to-br from-amber-500 to-red-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-amber-200">
          <ShieldAlert className="w-7 h-7" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Pusat Resolusi Admin (Hakim)</h1>
          <p className="text-gray-500 text-sm">Menjadi penengah dan memutus klaim sengketa di suluruh platform.</p>
        </div>
      </div>

      <div className="card-organic overflow-hidden animate-fade-in-up shadow-sm border border-gray-100 dark:border-gray-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 text-xs uppercase tracking-wider">
                <th className="p-4 font-bold border-b dark:border-gray-700">ID Pesanan</th>
                <th className="p-4 font-bold border-b dark:border-gray-700">User Komplain</th>
                <th className="p-4 font-bold border-b dark:border-gray-700">Alasan Singkat</th>
                <th className="p-4 font-bold border-b dark:border-gray-700 text-center">Status Sengketa</th>
                <th className="p-4 font-bold border-b dark:border-gray-700 text-right">Aksi Penengah</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {loading ? (
                <tr><td colSpan="5" className="p-8 text-center text-slate-400">Menyinkronkan data mediasi seluruh platform...</td></tr>
              ) : disputes.length === 0 ? (
                <tr>
                   <td colSpan="5" className="p-16 text-center">
                     <ShieldAlert className="w-12 h-12 text-slate-300 mx-auto mb-3 opacity-50" />
                     <p className="text-slate-500">Seluruh pesanan platform bebas dari teguran.</p>
                   </td>
                </tr>
              ) : (
                disputes.map((d) => (
                  <tr key={d.id_dispute} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="p-4 font-mono text-sm text-gray-700 dark:text-gray-300">
                      #{d.id_order?.slice(0, 8)}
                    </td>
                    <td className="p-4 text-sm font-bold text-gray-500">
                      {d.buyer?.name || 'Pelanggan'}
                    </td>
                    <td className="p-4 text-sm font-medium text-gray-800 dark:text-gray-200 max-w-[200px] truncate">
                      {d.reason}
                    </td>
                    <td className="p-4 text-center">
                      {getStatusBadge(d.status)}
                    </td>
                    <td className="p-4 text-right">
                      <Link to={`/disputes/${d.id_dispute}`} className="btn-secondary px-4 py-2 text-xs flex items-center gap-2 max-w-max ml-auto border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100">
                        <Eye className="w-3.5 h-3.5" /> Masuk ke Mediasi
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
