import { useState, useEffect } from 'react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { Settings2, Plus, Edit2, Trash2, Tag, Loader2, Save, X } from 'lucide-react';

const S = {
  h: { fontFamily: 'var(--font-display)', fontWeight: 800, color: 'var(--text-heading)' },
  muted: { fontSize: '0.78rem', color: 'var(--outline)' },
  btn: { padding: '0.6rem 1rem', borderRadius: 'var(--radius-md)', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', transition: 'all 0.2s', border: 'none' },
  input: { padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'var(--surface-containerLowest)', color: 'var(--text-body)', width: '100%', outline: 'none' }
};

export default function AdminSettings() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editData, setEditData] = useState(null);
  
  // Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const toast = useToast();

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await api.get('/categories');
      setCategories(res.data.data || []);
    } catch (error) {
      toast.error('Gagal mengambil kategori');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleOpenModal = (category = null) => {
    setEditData(category);
    setName(category?.name || '');
    setDescription(category?.description || '');
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditData(null);
    setName('');
    setDescription('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return toast.error('Nama kategori harus diisi');

    try {
      setSubmitting(true);
      if (editData) {
        await api.put(`/categories/${editData.id_category}`, { name, description });
        toast.success('Kategori berhasil diperbarui');
      } else {
        await api.post('/categories', { name, description });
        toast.success('Kategori berhasil ditambahkan');
      }
      fetchCategories();
      handleCloseModal();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Terjadi kesalahan sistem');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Yakin ingin menghapus kategori ini?')) return;
    try {
      await api.delete(`/categories/${id}`);
      toast.success('Kategori berhasil dihapus');
      fetchCategories();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Gagal menghapus kategori');
    }
  };

  return (
    <div style={{ padding: '2.5rem 2rem', maxWidth: '80rem', margin: '0 auto', minHeight: '100vh', background: 'var(--bg)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
        <div>
          <h1 style={{ ...S.h, fontSize: '1.75rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Settings2 size={24} color="#10b981" /> Platform Settings
          </h1>
          <p style={{ ...S.muted, marginTop: '0.25rem' }}>Configure global settings and manage product categories.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          style={{ ...S.btn, background: '#10b981', color: 'white', opacity: 0.9 }}
          onMouseOver={(e) => e.currentTarget.style.opacity = 1}
          onMouseOut={(e) => e.currentTarget.style.opacity = 0.9}
        >
          <Plus size={16} /> Tambah Kategori
        </button>
      </div>
      
      <div style={{ background: 'var(--surface-container-lowest)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border)', overflow: 'hidden' }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Tag size={18} color="var(--outline)" />
          <h2 style={{ ...S.h, fontSize: '1.1rem', margin: 0 }}>Ketegori Produk</h2>
        </div>
        
        {loading ? (
          <div style={{ padding: '4rem', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'var(--outline)' }}>
            <Loader2 className="animate-spin" />
          </div>
        ) : categories.length === 0 ? (
          <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--outline)' }}>
            Belum ada kategori terdaftar.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
              <thead style={{ background: 'var(--surface-container)', color: 'var(--outline)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                <tr>
                  <th style={{ padding: '1rem 1.5rem', fontWeight: 700 }}>Nama Kategori</th>
                  <th style={{ padding: '1rem 1.5rem', fontWeight: 700 }}>Deskripsi</th>
                  <th style={{ padding: '1rem 1.5rem', fontWeight: 700, width: '150px' }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((cat, i) => (
                  <tr key={cat.id_category || i} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '1.25rem 1.5rem', fontWeight: 600, color: 'var(--text-heading)' }}>
                      {cat.name}
                    </td>
                    <td style={{ padding: '1.25rem 1.5rem', color: 'var(--text-body)' }}>
                      {cat.description || '-'}
                    </td>
                    <td style={{ padding: '1.25rem 1.5rem' }}>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button onClick={() => handleOpenModal(cat)} style={{ ...S.btn, padding: '0.4rem', background: 'var(--surface-container-high)', color: 'var(--text-body)' }}>
                          <Edit2 size={14} />
                        </button>
                        <button onClick={() => handleDelete(cat.id_category)} style={{ ...S.btn, padding: '0.4rem', background: '#ffe4e6', color: '#e11d48' }}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(2px)' }}>
          <div style={{ background: 'var(--surface-container-lowest)', width: '100%', maxWidth: '450px', borderRadius: 'var(--radius-xl)', padding: '2rem', boxShadow: 'var(--shadow-lg)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ ...S.h, fontSize: '1.25rem', margin: 0 }}>{editData ? 'Edit Kategori' : 'Tambah Kategori'}</h3>
              <button type="button" onClick={handleCloseModal} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--outline)' }}><X size={20}/></button>
            </div>
            
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.8rem', fontWeight: 700, color: 'var(--outline)', textTransform: 'uppercase' }}>Nama Kategori</label>
                <input 
                  type="text" 
                  value={name} 
                  onChange={e => setName(e.target.value)} 
                  placeholder="Misal: Elektronik" 
                  style={S.input} 
                  required 
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.8rem', fontWeight: 700, color: 'var(--outline)', textTransform: 'uppercase' }}>Deskripsi</label>
                <textarea 
                  value={description} 
                  onChange={e => setDescription(e.target.value)} 
                  placeholder="Deskripsi kategori..." 
                  style={{ ...S.input, minHeight: '100px', resize: 'vertical' }} 
                />
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                <button type="button" onClick={handleCloseModal} style={{ ...S.btn, background: 'var(--surface-container)', color: 'var(--text-body)' }}>Batal</button>
                <button type="submit" disabled={submitting} style={{ ...S.btn, background: '#10b981', color: 'white', opacity: submitting ? 0.7 : 1 }}>
                  {submitting ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
