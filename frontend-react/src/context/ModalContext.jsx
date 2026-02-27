import { createContext, useContext, useState, useCallback } from 'react';

const ModalContext = createContext(null);

export function ModalProvider({ children }) {
  const [modal, setModal] = useState(null);

  const confirm = useCallback(({ title, message, confirmText = 'Ya', cancelText = 'Batal', onConfirm, onCancel, type = 'danger' }) => {
    setModal({
      title,
      message,
      confirmText,
      cancelText,
      onConfirm,
      onCancel,
      type
    });
  }, []);

  const close = useCallback(() => setModal(null), []);

  const handleConfirm = () => {
    if (modal?.onConfirm) modal.onConfirm();
    close();
  };

  const handleCancel = () => {
    if (modal?.onCancel) modal.onCancel();
    close();
  };

  return (
    <ModalContext.Provider value={{ confirm }}>
      {children}
      {modal && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in" onClick={handleCancel}></div>
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 max-w-sm w-full p-6 relative z-10 animate-scale-in">
            <div className="flex items-center gap-4 mb-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl animate-bounce-in ${
                modal.type === 'danger' ? 'bg-red-50 text-red-500' :
                modal.type === 'success' ? 'bg-green-50 text-green-500' :
                'bg-blue-50 text-blue-500'
              }`}>
                {modal.type === 'danger' ? '⚠️' : modal.type === 'success' ? '✅' : '❓'}
              </div>
              <h3 className="text-xl font-bold text-gray-800">{modal.title}</h3>
            </div>
            <p className="text-gray-500 mb-8 leading-relaxed">{modal.message}</p>
            <div className="flex gap-3 justify-end animate-fade-in-up stagger-2">
              <button 
                onClick={handleCancel}
                className="px-5 py-2.5 rounded-xl font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 transition-all cursor-pointer"
              >
                {modal.cancelText}
              </button>
              <button 
                onClick={handleConfirm}
                className={`px-5 py-2.5 rounded-xl font-medium text-white shadow-md transition-all cursor-pointer hover:-translate-y-0.5 ${
                  modal.type === 'danger' ? 'bg-gradient-to-r from-red-500 to-rose-600 shadow-red-200 hover:shadow-lg' :
                  modal.type === 'success' ? 'bg-gradient-to-r from-green-500 to-emerald-600 shadow-green-200 hover:shadow-lg' :
                  'bg-gradient-to-r from-blue-500 to-indigo-600 shadow-blue-200 hover:shadow-lg'
                }`}
              >
                {modal.confirmText}
              </button>
            </div>
          </div>
        </div>
      )}
    </ModalContext.Provider>
  );
}

export const useModal = () => useContext(ModalContext);
