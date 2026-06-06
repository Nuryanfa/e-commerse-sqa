import { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((message, type = 'info', duration = 4000, action = null) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type, action, duration }]);
    
    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, [removeToast]);

  const toast = {
    success: (msg, dur, act) => addToast(msg, 'success', dur, act),
    error: (msg, dur, act) => addToast(msg, 'error', dur, act),
    info: (msg, dur, act) => addToast(msg, 'info', dur, act),
    warning: (msg, dur, act) => addToast(msg, 'warning', dur, act),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 p-4 pointer-events-none">
        {toasts.map((t) => (
            <div
              key={t.id}
              className={`relative overflow-hidden pointer-events-auto min-w-[320px] max-w-sm rounded-2xl shadow-xl shadow-black/5 border p-4 flex gap-3 glass animate-slide-in-right transition-all hover:-translate-y-1 hover:shadow-2xl ${
                t.type === 'success' ? 'bg-emerald-50/95 dark:bg-emerald-900/40 border-emerald-200 dark:border-emerald-800/60' :
                t.type === 'error' ? 'bg-red-50/95 dark:bg-red-900/40 border-red-200 dark:border-red-800/60' :
                t.type === 'warning' ? 'bg-amber-50/95 dark:bg-amber-900/40 border-amber-200 dark:border-amber-800/60' :
                'bg-blue-50/95 dark:bg-blue-900/40 border-blue-200 dark:border-blue-800/60'
              }`}
            >
              {/* Progress Bar */}
              {t.duration > 0 && (
                <div
                  className={`absolute bottom-0 left-0 h-1 ${
                    t.type === 'success' ? 'bg-emerald-500' :
                    t.type === 'error' ? 'bg-red-500' :
                    t.type === 'warning' ? 'bg-amber-500' :
                    'bg-blue-500'
                  }`}
                  style={{ animation: `toast-progress ${t.duration}ms linear forwards` }}
                />
              )}

              <div className="shrink-0 mt-0.5">
                {t.type === 'success' && <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-800/50 flex items-center justify-center"><CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" /></div>}
                {t.type === 'error' && <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-800/50 flex items-center justify-center"><XCircle className="w-5 h-5 text-red-600 dark:text-red-400" /></div>}
                {t.type === 'warning' && <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-800/50 flex items-center justify-center"><AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" /></div>}
                {t.type === 'info' && <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-800/50 flex items-center justify-center"><Info className="w-5 h-5 text-blue-600 dark:text-blue-400" /></div>}
              </div>
              
              <div className="flex-1 min-w-0 pt-1">
                <h4 className={`font-bold text-sm truncate ${
                  t.type === 'success' ? 'text-emerald-800 dark:text-emerald-300' :
                  t.type === 'error' ? 'text-red-800 dark:text-red-300' :
                  t.type === 'warning' ? 'text-amber-800 dark:text-amber-300' :
                  'text-blue-800 dark:text-blue-300'
                }`}>
                  {t.type === 'success' ? 'Berhasil' : t.type === 'error' ? 'Terjadi Kesalahan' : t.type === 'warning' ? 'Peringatan' : 'Informasi'}
                </h4>
                <p className={`text-[13px] mt-0.5 leading-relaxed break-words ${
                  t.type === 'success' ? 'text-emerald-600 dark:text-emerald-400/80' :
                  t.type === 'error' ? 'text-red-600 dark:text-red-400/80' :
                  t.type === 'warning' ? 'text-amber-700 dark:text-amber-400/80' :
                  'text-blue-600 dark:text-blue-400/80'
                }`}>{t.message}</p>
                {t.action && (
                  <button
                    onClick={() => { t.action.onClick(); removeToast(t.id); }}
                    className={`mt-2 text-xs font-bold px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
                      t.type === 'success' ? 'bg-emerald-100 dark:bg-emerald-800/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-700 hover:bg-emerald-200' :
                      'bg-white/50 dark:bg-slate-800/50 border-gray-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {t.action.label}
                  </button>
                )}
              </div>
              <button 
                onClick={() => removeToast(t.id)}
                className="shrink-0 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors cursor-pointer rounded-full hover:bg-black/5 dark:hover:bg-white/5"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
