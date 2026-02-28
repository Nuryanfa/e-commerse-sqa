import { useState, useRef, useEffect } from 'react';

export default function ImageDropzone({ valueUrl, onImageChange }) {
  const [preview, setPreview] = useState(valueUrl || '');
  const [isDragActive, setIsDragActive] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (valueUrl) {
      // Prepend backend URL if it's a relative path from the backend
      const fullUrl = valueUrl.startsWith('/') ? `http://localhost:8080${valueUrl}` : valueUrl;
      setPreview(fullUrl);
    } else {
      setPreview('');
    }
  }, [valueUrl]);

  const handleFile = (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) return;
    
    onImageChange(file);
    
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleRemove = (e) => {
    e.stopPropagation();
    setPreview('');
    onImageChange(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="w-full md:col-span-2">
      <label className="block text-[10px] font-semibold uppercase tracking-wide mb-1" style={{ color: 'var(--text-muted)' }}>Foto Produk</label>
      <div 
        onClick={handleClick}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={`relative w-full rounded-2xl border-2 border-dashed overflow-hidden flex flex-col items-center justify-center cursor-pointer transition-all duration-300 min-h-[160px] ${
          isDragActive 
            ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-900/20 shadow-[0_0_20px_rgba(16,185,129,0.2)] scale-[1.02]' 
            : 'border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 hover:border-emerald-400 hover:bg-emerald-50/20 dark:hover:bg-emerald-900/10'
        }`}
      >
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleChange} 
          accept="image/*" 
          className="hidden" 
        />
        
        {preview ? (
          <div className="absolute inset-0 w-full h-full group">
            <img 
              src={preview} 
              alt="Preview" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
              <button 
                type="button" 
                onClick={handleRemove}
                className="bg-red-500 hover:bg-red-600 text-white p-3 rounded-full font-bold text-sm transform hover:scale-110 transition-transform shadow-lg"
              >
                <svg className="w-5 h-5 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center p-6 flex flex-col items-center">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-3 transition-colors ${isDragActive ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400' : 'bg-slate-200 dark:bg-slate-700 text-slate-400'}`}>
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            </div>
            <p className="font-semibold" style={{ color: 'var(--text-heading)' }}>
              Tarik & Lepas Gambar ke Sini
            </p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
              atau klik untuk memilih file (PNG, JPG)
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
