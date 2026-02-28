import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import { useModal } from '../context/ModalContext';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Trash2, Plus, Minus, ArrowRight, Box, Leaf, Loader2, CheckCircle, X, Truck, CreditCard } from 'lucide-react';

export default function Cart() {
  const { user } = useAuth();
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [checkoutStep, setCheckoutStep] = useState(0); // 0: Hidden, 1: Address, 2: Payment/Confirm
  const [checkingOut, setCheckingOut] = useState(false);
  const [checkoutData, setCheckoutData] = useState({ 
    address: '', paymentMethod: 'cod' 
  });
  const navigate = useNavigate();
  const toast = useToast();
  const modal = useModal();

  useEffect(() => {
    if (user) setCheckoutData(prev => ({ ...prev, address: user.address || '' }));
  }, [user]);

  const fetchCart = () => {
    setLoading(true);
    api.get('/cart').then(res => setCart(res.data.data || [])).catch(() => setCart([])).finally(() => setLoading(false));
  };
  useEffect(() => { fetchCart(); }, []);

  const updateQty = async (id, qty) => {
    if (qty < 1) return remove(id);
    try { await api.post('/cart', { id_product: id, quantity: qty }); fetchCart(); }
    catch (err) { toast.error(err.response?.data?.error || 'Gagal mengubah jumlah'); }
  };

  const remove = (id) => {
    modal.confirm({
      title: 'Hapus Item', message: 'Hapus sayuran ini dari keranjang?', type: 'danger', confirmText: 'Hapus',
      onConfirm: async () => {
        try { await api.delete(`/cart/${id}`); toast.success('Dihapus dari keranjang'); fetchCart(); }
        catch (err) { toast.error(err.response?.data?.error || 'Gagal menghapus'); }
      }
    });
  };

  const startCheckout = () => {
    if (cart.length === 0) return toast.error('Keranjang kosong');
    if (!user) { toast.info('Login untuk checkout'); return navigate('/login'); }
    if (!checkoutData.address && user?.address) {
      setCheckoutData(prev => ({ ...prev, address: user.address }));
    }
    setCheckoutStep(1);
  };

  const handleCheckoutSubmit = async () => {
    if (!checkoutData.address) return toast.error('Alamat pengiriman wajib diisi');
    
    setCheckingOut(true);
    try {
      const res = await api.post('/orders/checkout', {
        shipping_address: checkoutData.address,
        payment_method: checkoutData.paymentMethod
      });
      toast.success('Pesanan berhasil dibuat!');
      navigate(`/orders/${res.data.id_order}`);
    } catch (err) { 
      toast.error(err.response?.data?.error || 'Gagal checkout'); 
    }
    setCheckingOut(false);
  };

  const total = cart.reduce((sum, i) => sum + (i.product?.price || 0) * i.quantity, 0);

  if (loading) return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-4">
      {[...Array(3)].map((_, i) => <div key={i} className="h-32 skeleton rounded-3xl" />)}
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 sm:px-6 lg:px-8" style={{ background: 'var(--surface-base)' }}>
      <div className="flex items-center gap-3 mb-8 animate-fade-in-up">
        <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/40 rounded-2xl flex items-center justify-center text-emerald-600 dark:text-emerald-400">
          <ShoppingBag className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-black tracking-tight" style={{ color: 'var(--text-heading)' }}>Keranjang Anda</h1>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{cart.length} barang tersedia</p>
        </div>
      </div>

      {cart.length === 0 ? (
        <div className="card-organic p-16 text-center animate-fade-in-up flex flex-col items-center justify-center border-dashed border-2 border-gray-200 dark:border-slate-700 bg-transparent">
          <div className="w-24 h-24 bg-gray-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6 animate-float">
            <ShoppingBag className="w-12 h-12 text-gray-300 dark:text-slate-600" />
          </div>
          <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--text-heading)' }}>Keranjang Masih Kosong</h3>
          <p className="text-sm mb-8 max-w-sm" style={{ color: 'var(--text-muted)' }}>Belum ada sayur segar atau paket sehat di keranjang Anda. Yuk penuhi kebutuhan dapurmu!</p>
          <Link to="/products" className="btn-primary px-8 py-3.5 text-sm font-bold shadow-lg shadow-emerald-200 dark:shadow-none flex items-center gap-2 hover:-translate-y-1 transition-all">
            Mulai Belanja <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          
          {/* Bagian Kiri: List Cart Item */}
          <div className="w-full lg:w-2/3 space-y-4">
            <AnimatePresence mode="popLayout">
              {cart.map((item, i) => (
                <motion.div 
                  key={item.id_cart_item} 
                  layout
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8, x: -50, transition: { duration: 0.2 } }}
                  transition={{ type: "spring", stiffness: 300, damping: 25, delay: i * 0.05 }}
                  className="card-organic p-5 flex flex-col sm:flex-row items-start sm:items-center gap-5 relative group"
                >
                  {/* Delete Button Absolut (Boleh pindah ke dalam flow flex juga) */}
                  <button onClick={() => remove(item.id_cart_item)} className="absolute top-4 right-4 sm:relative sm:top-0 sm:right-0 w-8 h-8 rounded-xl flex items-center justify-center text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-300 cursor-pointer sm:order-last shrink-0">
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl flex items-center justify-center shrink-0 overflow-hidden relative shadow-inner" style={{ background: 'var(--surface-muted)' }}>
                    {item.product?.image_url ? (
                      <img src={item.product.image_url} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    ) : (
                      <Leaf className="w-8 h-8 text-emerald-500/50" />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0 pr-8 sm:pr-0">
                    <h3 className="font-bold text-base sm:text-lg mb-1 truncate" style={{ color: 'var(--text-heading)' }}>{item.product?.name || 'Produk Tanpa Nama'}</h3>
                    <p className="text-sm font-black mb-4 sm:mb-0" style={{ color: 'var(--text-accent)' }}>Rp {item.product?.price?.toLocaleString('id-ID')}</p>
                  </div>
                  
                  <div className="flex items-center gap-4 sm:gap-6 w-full sm:w-auto justify-between sm:justify-end">
                    <div className="flex items-center rounded-xl overflow-hidden bg-gray-50 dark:bg-slate-800" style={{ border: '1px solid var(--border-primary)' }}>
                      <button onClick={() => updateQty(item.id_cart_item, Math.max(1, item.quantity - 1))} className="px-3 py-2 transition-colors duration-300 cursor-pointer hover:bg-emerald-100 dark:hover:bg-emerald-900/40 text-gray-500 hover:text-emerald-700 dark:hover:text-emerald-400">
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-8 text-center text-sm font-black" style={{ color: 'var(--text-heading)' }}>{item.quantity}</span>
                      <button onClick={() => updateQty(item.id_cart_item, item.quantity + 1)} className="px-3 py-2 transition-colors duration-300 cursor-pointer hover:bg-emerald-100 dark:hover:bg-emerald-900/40 text-gray-500 hover:text-emerald-700 dark:hover:text-emerald-400">
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    <p className="font-black text-base" style={{ color: 'var(--text-heading)' }}>Rp {((item.product?.price || 0) * item.quantity).toLocaleString('id-ID')}</p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Bagian Kanan: Sticky Summary */}
          <div className="w-full lg:w-1/3 lg:sticky lg:top-24">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card-organic p-6 border-default">
              <h2 className="text-lg font-bold mb-4 flex items-center justify-between" style={{ color: 'var(--text-heading)' }}>
                Ringkasan Belanja <Box className="w-5 h-5 text-emerald-500" />
              </h2>
              
              <div className="space-y-3 mb-6 pb-6 border-b border-gray-100 dark:border-slate-700">
                <div className="flex justify-between items-center text-sm">
                  <span style={{ color: 'var(--text-secondary)' }}>Total Item</span>
                  <span className="font-bold text-gray-800 dark:text-gray-200">{cart.length} Sayuran</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span style={{ color: 'var(--text-secondary)' }}>Subtotal Produk</span>
                  <span className="font-bold text-gray-800 dark:text-gray-200">Rp {total.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span style={{ color: 'var(--text-secondary)' }}>Biaya Pengiriman</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded-md">Gratis</span>
                </div>
              </div>

              <div className="flex justify-between items-end mb-8">
                <span className="text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Total Tagihan</span>
                <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">Rp {total.toLocaleString('id-ID')}</span>
              </div>

              <button 
                onClick={startCheckout} 
                className="w-full btn-primary py-4 text-sm font-bold flex justify-center items-center gap-2 shadow-xl shadow-emerald-200 dark:shadow-none hover:-translate-y-1 transition-all"
              >
                Lanjutkan ke Pembayaran <ArrowRight className="w-4 h-4 ml-1" />
              </button>
              
              <p className="text-center text-[10px] mt-4 flex items-center justify-center gap-1.5 font-medium" style={{ color: 'var(--text-muted)' }}>
                <CheckCircle className="w-3 h-3 text-emerald-500" /> Transaksi aman & terenkripsi
              </p>
            </motion.div>
          </div>

        </div>
      )}

      {/* Checkout Drawer Overlay */}
      <AnimatePresence>
        {checkoutStep > 0 && (
          <div className="fixed inset-0 z-50 flex justify-end">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => setCheckoutStep(0)}
              className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm z-0"
            />
            
            <motion.div 
              initial={{ x: '100%' }} 
              animate={{ x: 0 }} 
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative z-10 w-full max-w-md h-full bg-white dark:bg-slate-900 shadow-2xl flex flex-col pt-8"
            >
              <div className="px-6 pb-6 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Checkout Pesanan</h2>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mt-1">
                    Langkah {checkoutStep} dari 2
                  </p>
                </div>
                <button onClick={() => setCheckoutStep(0)} className="w-10 h-10 rounded-full bg-gray-100 dark:bg-slate-800 flex items-center justify-center text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-6 py-6 custom-scrollbar">
                
                {/* Step 1: Address */}
                {checkoutStep === 1 && (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                        <Truck className="w-5 h-5" />
                      </div>
                      <h3 className="font-bold text-gray-900 dark:text-white">Alamat Pengiriman</h3>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">Alamat Lengkap</label>
                        <textarea 
                          rows={4} 
                          value={checkoutData.address || ''} 
                          onChange={(e) => setCheckoutData({...checkoutData, address: e.target.value})}
                          placeholder="Contoh: Jalan, No Rumah, RT/RW, Kecamatan, Kota"
                          className="w-full rounded-2xl p-4 text-sm bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all resize-none text-gray-900 dark:text-white"
                        />
                      </div>
                      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/30 rounded-2xl p-4">
                        <p className="text-xs text-amber-800 dark:text-amber-400 font-medium leading-relaxed">
                          Pastikan alamat diisi dengan lengkap dan benar untuk menghindari kesalahan pengiriman kurir.
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Step 2: Payment */}
                {checkoutStep === 2 && (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                        <CreditCard className="w-5 h-5" />
                      </div>
                      <h3 className="font-bold text-gray-900 dark:text-white">Metode Pembayaran</h3>
                    </div>

                    <div className="space-y-4">
                      {/* COD Option */}
                      <label className={`block border-2 rounded-2xl p-4 cursor-pointer transition-all ${checkoutData.paymentMethod === 'cod' ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' : 'border-gray-200 dark:border-slate-700 hover:border-emerald-300'}`}>
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-3">
                            <input 
                              type="radio" 
                              name="payment" 
                              value="cod" 
                              checked={checkoutData.paymentMethod === 'cod'} 
                              onChange={() => setCheckoutData({...checkoutData, paymentMethod: 'cod'})}
                              className="w-4 h-4 text-emerald-600 focus:ring-emerald-500"
                            />
                            <div>
                              <p className="font-bold text-sm text-gray-900 dark:text-white">Bayar di Tempat (COD)</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Bayar saat sayuran tiba di rumah</p>
                            </div>
                          </div>
                        </div>
                      </label>

                      {/* Bank Transfer (Mock) */}
                      <label className={`block border-2 rounded-2xl p-4 cursor-pointer transition-all ${checkoutData.paymentMethod === 'transfer' ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' : 'border-gray-200 dark:border-slate-700 hover:border-emerald-300'}`}>
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-3">
                            <input 
                              type="radio" 
                              name="payment" 
                              value="transfer" 
                              checked={checkoutData.paymentMethod === 'transfer'} 
                              onChange={() => setCheckoutData({...checkoutData, paymentMethod: 'transfer'})}
                              className="w-4 h-4 text-emerald-600 focus:ring-emerald-500"
                            />
                            <div>
                              <p className="font-bold text-sm text-gray-900 dark:text-white">Transfer Bank</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Verifikasi manual via WhatsApp</p>
                            </div>
                          </div>
                        </div>
                      </label>
                    </div>

                    <div className="mt-8 bg-gray-50 dark:bg-slate-800/80 rounded-2xl p-5 border border-gray-100 dark:border-slate-700">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 uppercase font-bold tracking-wider">Ringkasan Akhir</p>
                      <div className="flex justify-between items-center mb-2 text-sm">
                        <span className="text-gray-600 dark:text-gray-300">Total Belanja</span>
                        <span className="font-bold text-gray-900 dark:text-white">Rp {total.toLocaleString('id-ID')}</span>
                      </div>
                      <div className="flex justify-between items-center mb-3 text-sm">
                        <span className="text-gray-600 dark:text-gray-300">Biaya Pengiriman</span>
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">Gratis</span>
                      </div>
                      <div className="border-t border-gray-200 dark:border-slate-700 pt-3 flex justify-between items-end">
                        <span className="text-sm font-bold text-gray-900 dark:text-white">Total Bayar</span>
                        <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">Rp {total.toLocaleString('id-ID')}</span>
                      </div>
                    </div>
                  </motion.div>
                )}

              </div>

              {/* Drawer Footer Actions */}
              <div className="p-6 bg-gray-50 dark:bg-slate-900/90 border-t border-gray-100 dark:border-slate-800 flex gap-3">
                {checkoutStep === 2 && (
                  <button 
                    onClick={() => setCheckoutStep(1)} 
                    className="flex-1 py-3.5 rounded-xl border-2 border-gray-200 dark:border-slate-700 font-bold text-gray-700 dark:text-gray-300 text-sm hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    Kembali
                  </button>
                )}
                
                {checkoutStep === 1 ? (
                  <button 
                    onClick={() => {
                        if (!checkoutData.address) return toast.error('Mohon isi alamat Anda');
                        setCheckoutStep(2);
                    }} 
                    className="flex-[2] btn-primary py-3.5 rounded-xl text-sm font-bold shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    Lanjut Pilih Pembayaran <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button 
                    onClick={handleCheckoutSubmit} 
                    disabled={checkingOut}
                    className="flex-[2] bg-gray-900 dark:bg-white text-white dark:text-gray-900 py-3.5 rounded-xl text-sm font-black shadow-xl hover:-translate-y-1 transition-all disabled:opacity-70 disabled:hover:translate-y-0 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {checkingOut ? <><Loader2 className="w-5 h-5 animate-spin" /> Proses...</> : 'Konfirmasi Pesanan'}
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
