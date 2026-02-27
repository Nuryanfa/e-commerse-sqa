import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 3000) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    
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
    success: (msg, dur) => addToast(msg, 'success', dur),
    error: (msg, dur) => addToast(msg, 'error', dur),
    info: (msg, dur) => addToast(msg, 'info', dur),
    warning: (msg, dur) => addToast(msg, 'warning', dur),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 p-4 pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto min-w-[300px] max-w-sm rounded-xl shadow-xl border p-4 flex items-start gap-3 animate-slide-in-right glass transition-all duration-300 hover:-translate-x-1 ${
              t.type === 'success' ? 'bg-green-50/90 border-green-200' :
              t.type === 'error' ? 'bg-red-50/90 border-red-200' :
              t.type === 'warning' ? 'bg-amber-50/90 border-amber-200' :
              'bg-blue-50/90 border-blue-200'
            }`}
          >
            <div className="text-xl">
              {t.type === 'success' && '✅'}
              {t.type === 'error' && '❌'}
              {t.type === 'warning' && '⚠️'}
              {t.type === 'info' && '💡'}
            </div>
            <div className="flex-1">
              <h4 className={`font-semibold text-sm ${
                t.type === 'success' ? 'text-green-800' :
                t.type === 'error' ? 'text-red-800' :
                t.type === 'warning' ? 'text-amber-800' :
                'text-blue-800'
              }`}>
                {t.type.charAt(0).toUpperCase() + t.type.slice(1)}
              </h4>
              <p className={`text-sm mt-0.5 ${
                t.type === 'success' ? 'text-green-600' :
                t.type === 'error' ? 'text-red-600' :
                t.type === 'warning' ? 'text-amber-600' :
                'text-blue-600'
              }`}>{t.message}</p>
            </div>
            <button 
              onClick={() => removeToast(t.id)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
