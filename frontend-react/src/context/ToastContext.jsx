import { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 3000, action = null) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type, action }]);
    
    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

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
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              layout
              key={t.id}
              initial={{ opacity: 0, x: 50, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 20, scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              className={`pointer-events-auto min-w-[300px] max-w-sm rounded-xl shadow-xl border p-4 flex items-start gap-4 glass transition-all hover:shadow-2xl ${
                t.type === 'success' ? 'bg-green-50/90 dark:bg-green-900/30 border-green-200 dark:border-green-800' :
                t.type === 'error' ? 'bg-red-50/90 dark:bg-red-900/30 border-red-200 dark:border-red-800' :
                t.type === 'warning' ? 'bg-amber-50/90 dark:bg-amber-900/30 border-amber-200 dark:border-amber-800' :
                'bg-blue-50/90 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800'
              }`}
            >
              <div className="shrink-0 mt-0.5">
                {t.type === 'success' && <CheckCircle className="w-5 h-5 text-green-500" />}
                {t.type === 'error' && <XCircle className="w-5 h-5 text-red-500" />}
                {t.type === 'warning' && <AlertTriangle className="w-5 h-5 text-amber-500" />}
                {t.type === 'info' && <Info className="w-5 h-5 text-blue-500" />}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className={`font-semibold text-sm truncate ${
                  t.type === 'success' ? 'text-green-800 dark:text-green-300' :
                  t.type === 'error' ? 'text-red-800 dark:text-red-300' :
                  t.type === 'warning' ? 'text-amber-800 dark:text-amber-300' :
                  'text-blue-800 dark:text-blue-300'
                }`}>
                  {t.type.charAt(0).toUpperCase() + t.type.slice(1)}
                </h4>
                <p className={`text-sm mt-0.5 break-words ${
                  t.type === 'success' ? 'text-green-600 dark:text-green-400' :
                  t.type === 'error' ? 'text-red-600 dark:text-red-400' :
                  t.type === 'warning' ? 'text-amber-600 dark:text-amber-400' :
                  'text-blue-600 dark:text-blue-400'
                }`}>{t.message}</p>
                {t.action && (
                  <button
                    onClick={() => { t.action.onClick(); removeToast(t.id); }}
                    className={`mt-3 text-xs font-bold px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
                      t.type === 'success' ? 'bg-green-100 dark:bg-green-800/50 text-green-700 dark:text-green-300 border-green-200 dark:border-green-700 hover:bg-green-200 dark:hover:bg-green-800' :
                      'bg-white/50 dark:bg-slate-800/50 border-gray-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800'
                    }`}
                  >
                    {t.action.label}
                  </button>
                )}
              </div>
              <button 
                onClick={() => removeToast(t.id)}
                className="shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
