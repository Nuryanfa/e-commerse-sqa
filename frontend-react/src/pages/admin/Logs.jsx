import { useState, useEffect } from 'react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { motion } from 'framer-motion';
import { Activity, ServerCrash, Cpu, AlertTriangle, AlertCircle } from 'lucide-react';

const S = {
  card:  { background: 'var(--surface-container-lowest)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border)', boxShadow: '0 4px 24px rgba(0,0,0,0.02)' },
  label: { fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--outline)', fontFamily: 'var(--font-display)' },
  h:     { fontFamily: 'var(--font-display)', fontWeight: 800, color: 'var(--text-heading)' },
  muted: { fontSize: '0.78rem', color: 'var(--outline)' },
};

export default function AdminLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    api.get('/admin/logs')
      .then(res => setLogs(res.data.data || []))
      .catch(() => toast.error('Gagal mengambil data sistem logs'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ padding: '2.5rem 2rem', maxWidth: '80rem', margin: '0 auto', minHeight: '100vh', background: 'var(--bg)' }}>
      <div style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ ...S.h, fontSize: '1.75rem', margin: 0 }}>System Logs</h1>
        <p style={{ ...S.muted, marginTop: '0.25rem' }}>Infrastructure health monitoring and incident logs.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
        <div style={{ ...S.card, padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{ width: '3.5rem', height: '3.5rem', borderRadius: '1rem', background: '#dcfce7', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Activity size={16}/></div>
          <div><p style={{ ...S.label, marginBottom: '0.25rem' }}>API Latency</p><p style={{ ...S.h, fontSize: '1.5rem', margin: 0 }}>42ms</p></div>
        </div>
        <div style={{ ...S.card, padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{ width: '3.5rem', height: '3.5rem', borderRadius: '1rem', background: '#e0f2fe', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Cpu size={16}/></div>
          <div><p style={{ ...S.label, marginBottom: '0.25rem' }}>CPU Utilization</p><p style={{ ...S.h, fontSize: '1.5rem', margin: 0 }}>28%</p></div>
        </div>
        <div style={{ ...S.card, padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{ width: '3.5rem', height: '3.5rem', borderRadius: '1rem', background: '#fee2e2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ServerCrash size={16}/></div>
          <div><p style={{ ...S.label, marginBottom: '0.25rem' }}>5xx Errors</p><p style={{ ...S.h, fontSize: '1.5rem', margin: 0 }}>{logs.filter(l => l.status === 'ERROR' || l.status === 'FAILED').length}</p></div>
        </div>
      </div>

      <div style={{ ...S.card, padding: '2rem' }}>
        <h3 style={{ ...S.h, fontSize: '1.1rem', margin: 0, marginBottom: '1.5rem' }}>Live Incident Stream</h3>
        <div style={{ background: '#0f172a', padding: '1.5rem', borderRadius: 'var(--radius-lg)', color: '#38bdf8', fontFamily: 'monospace', fontSize: '0.85rem', lineHeight: 1.8, height: '400px', overflowY: 'auto' }}>
          {logs.map((log, i) => {
            const timeStr = new Date(log.time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second:'2-digit'});
            const color = log.status === 'ERROR' || log.status === 'FAILED' ? '#f87171' : log.status === 'WARNING' ? '#fbbf24' : '#94a3b8';
            const logType = log.status === 'ERROR' || log.status === 'FAILED' ? 'ERROR' : log.status === 'WARNING' ? 'WARN ' : 'INFO ';
            return (
              <p key={i}>
                <span style={{ color: '#94a3b8' }}>[{timeStr}]</span> <span style={{ color }}>{logType}</span>: {log.event} (Client IP: {log.user_ip})
              </p>
            );
          })}
          {logs.length === 0 && <p style={{ color: '#64748b' }}>Awaiting system events...</p>}
        </div>
      </div>
    </div>
  );
}
