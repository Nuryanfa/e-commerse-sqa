import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import api from '../services/api';
import { loadMidtransSnap } from '../services/midtrans';
import { useToast } from '../context/ToastContext';
import { useModal } from '../context/ModalContext';
import { useAuth } from '../context/useAuth';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Trash2, Plus, Minus, ArrowRight, Box, Leaf, Loader2, CheckCircle, Truck, CreditCard, ChevronRight, Lock, MapPin, Building2, User, Phone, ArrowLeft, ShieldAlert } from 'lucide-react';

export default function Cart() {
  const { user } = useAuth();
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [checkoutStep, setCheckoutStep] = useState(0); // 0: Cart, 1: Checkout 
  const [checkingOut, setCheckingOut] = useState(false);
  const [checkoutData, setCheckoutData] = useState({ 
    address: '', recipient: '', phone: '', paymentMethod: 'credit_card' 
  });
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const modal = useModal();

  useEffect(() => {
    if (user) setCheckoutData(prev => ({ 
      ...prev, 
      address: user.address || '',
      recipient: user.nama || '',
      phone: user.no_hp || ''
    }));
  }, [user]);

  const fetchCart = async (isInitial = false) => {
    if (isInitial) setLoading(true);
    try {
      const res = await api.get('/cart');
      setCart(res.data.data || []);
    } catch (err) { setCart([]); } 
    finally { if (isInitial) setLoading(false); }
  };
  useEffect(() => { fetchCart(true); }, []);

  const updateQty = async (id, qty) => {
    if (qty < 1) return remove(id);
    setCart(prev => prev.map(item => item.id_cart_item === id ? { ...item, quantity: qty } : item));
    try { await api.put(`/cart/${id}`, { quantity: qty }); fetchCart(false); }
    catch (err) { toast.error(err.response?.data?.error || 'Gagal mengubah jumlah'); fetchCart(false); }
  };

  const remove = (id) => {
    modal.confirm({
      title: 'Hapus Item', message: 'Hapus sayuran ini dari keranjang?', type: 'danger', confirmText: 'Hapus',
      onConfirm: async () => {
        try { await api.delete(`/cart/${id}`); toast.success('Dihapus dari keranjang'); fetchCart(false); }
        catch (err) { toast.error(err.response?.data?.error || 'Gagal menghapus'); }
      }
    });
  };

  const startCheckout = () => {
    if (cart.length === 0) return toast.error('Keranjang kosong');
    if (!user) { toast.info('Login untuk checkout'); return navigate('/login'); }
    if (!checkoutData.address && user?.address) setCheckoutData(prev => ({ ...prev, address: user.address, recipient: user.nama, phone: user.no_hp }));
    setCheckoutStep(1);
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('checkout') === '1' && !loading && cart.length > 0 && checkoutStep === 0) {
      startCheckout();
      navigate('/cart', { replace: true });
    }
  }, [location.search, loading, cart.length, checkoutStep]);

  const handleCheckoutSubmit = async () => {
    if (!checkoutData.address || checkoutData.address.trim().length < 10) return toast.error('Alamat terlalu singkat');
    if (!checkoutData.recipient) return toast.error('Nama penerima wajib diisi');
    
    setCheckingOut(true);
    try {
      const res = await api.post('/orders/checkout', {
        shipping_address: `${checkoutData.recipient} | ${checkoutData.address}`,
        payment_method: 'midtrans'
      });
      
      const orderData = res.data.data;
      if (!orderData?.payment_token) throw new Error("Midtrans error. Token tidak diterima.");
      
      const snap = await loadMidtransSnap();
      snap.pay(orderData.payment_token, {
         onSuccess: async () => { 
           toast.success('Pembayaran berhasil!'); 
           try { await api.post(`/orders/${orderData.id_order}/pay`); } catch(e) {}
           navigate(`/orders/${orderData.id_order}`); 
         },
         onPending: () => { toast.info('Pesanan Dibuat! Menunggu Pembayaran.'); navigate(`/orders/${orderData.id_order}`); },
         onError: () => toast.error('Gagal memproses pembayaran!'),
         onClose: () => { toast.info('Popup ditutup.'); navigate(`/orders/${orderData.id_order}`); }
      });
    } catch (err) { toast.error(err.response?.data?.error || err.message || 'Gagal checkout'); }
    setCheckingOut(false);
  };

  const total = cart.reduce((sum, i) => {
    const p = i.variant?.price || i.product?.price || 0;
    return sum + p * i.quantity;
  }, 0);
  const tax = Math.floor(total * 0.11); // 11% Tax as in mockup
  const delivery = 12000;
  const grandTotal = total + tax + delivery;

  if (loading) return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-4"><div className="h-64 skeleton rounded-3xl" /></div>
  );

  // --- CHECKOUT VIEW --- //
  if (checkoutStep === 1) {
    return (
      <div className="min-h-screen bg-gray-50/50 dark:bg-slate-900 pb-24">
        
        {/* Checkout Header Bar */}
        <div className="bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800 px-4 sm:px-8 py-5 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-4">
             <button onClick={() => setCheckoutStep(0)} className="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-50 dark:bg-slate-800 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors">
               <ArrowLeft className="w-5 h-5" />
             </button>
             <div className="flex items-center gap-2">
               <Leaf className="w-6 h-6 text-emerald-600" />
               <span className="font-black text-xl tracking-tight text-gray-900 dark:text-white">SayurSehat</span>
             </div>
          </div>
          
          <div className="hidden sm:flex items-center gap-2 text-[10px] font-bold tracking-widest uppercase text-gray-400">
             <span>CART</span> <ChevronRight className="w-3 h-3" /> <span className="text-emerald-600 dark:text-emerald-400">CHECKOUT</span> <ChevronRight className="w-3 h-3" /> <span>PAYMENT</span>
          </div>

          <div className="flex items-center gap-3 text-xs font-bold text-gray-500 bg-gray-100 dark:bg-slate-800 rounded-lg px-3 py-1.5">
             <Lock className="w-3.5 h-3.5 text-emerald-600" /> Secure Checkout
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
            
            {/* Left Column (Forms) */}
            <div className="w-full lg:w-2/3 space-y-12">
               
               {/* Shipping Details */}
               <section>
                 <div className="flex items-center gap-3 mb-6">
                   <div className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 p-2 rounded-xl">
                     <Truck className="w-6 h-6" />
                   </div>
                   <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Shipping Details</h2>
                 </div>

                 {/* Address Card */}
                 <div className="bg-white dark:bg-slate-800/50 rounded-3xl p-6 md:p-8 border border-gray-100 dark:border-slate-800 shadow-sm relative mb-6 isolate">
                    <div className="absolute top-8 right-8 text-emerald-600 text-sm font-bold cursor-pointer hover:underline z-10">Change</div>
                    
                    <div className="flex items-start gap-4">
                       <MapPin className="w-5 h-5 text-emerald-600 mt-0.5" />
                       <div className="flex-1">
                          <h4 className="font-bold text-gray-900 dark:text-white mb-2 text-base">Home Address</h4>
                          <textarea rows={3} value={checkoutData.address} onChange={e => setCheckoutData({...checkoutData, address: e.target.value})} className="w-full text-sm font-medium text-gray-500 dark:text-gray-400 leading-relaxed bg-transparent border-none resize-none p-0 focus:ring-0 placeholder-gray-300" placeholder="Jl. Merdeka No. 123, Jakarta Selatan, 12110, Indonesia"></textarea>
                       </div>
                    </div>
                 </div>

                 {/* Recipient Grid */}
                 <div className="grid grid-cols-1 gap-6">
                    <div>
                      <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2 block">Recipient Name</label>
                      <div className="relative">
                        <User className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input type="text" value={checkoutData.recipient} onChange={e => setCheckoutData({...checkoutData, recipient: e.target.value})} placeholder="e.g. Budi Santoso" className="w-full pl-11 pr-4 py-3.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl text-sm font-bold text-gray-900 dark:text-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all shadow-sm" />
                       </div>
                    </div>
                 </div>
               </section>

               {/* Payment Method */}
               <section>
                 <div className="flex items-center gap-3 mb-6">
                   <div className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 p-2 rounded-xl">
                     <CreditCard className="w-6 h-6" />
                   </div>
                   <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Payment Method</h2>
                 </div>

                 <div className="space-y-4">
                    {[
                      { id: 'midtrans', label: 'Midtrans Payment Gateway', sub: 'Gopay, Transfer Bank, QRIS, Kartu Kredit', icon: ShieldAlert }
                    ].map((m) => (
                      <label key={m.id} className="flex items-center justify-between p-6 rounded-3xl border-2 border-emerald-500 bg-emerald-50/50 dark:bg-emerald-500/10 cursor-default">
                         <div className="flex items-center gap-5">
                            <div className="w-5 h-5 rounded-full border-2 border-emerald-500 flex items-center justify-center">
                               <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"/>
                            </div>
                            <div>
                               <h4 className="font-bold text-gray-900 dark:text-white text-sm mb-0.5">{m.label}</h4>
                               <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">{m.sub}</p>
                            </div>
                         </div>
                         <m.icon className="w-6 h-6 text-emerald-500" />
                      </label>
                    ))}
                 </div>

                 <div className="mt-8 flex items-center justify-center gap-8 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    <span className="flex items-center gap-1.5"><ShieldAlert className="w-4 h-4 text-emerald-500"/> Secure Payment by Midtrans</span>
                    <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-emerald-500"/> PCI-DSS Compliant</span>
                 </div>
               </section>

            </div>

            {/* Right Column (Summary) */}
            <div className="w-full lg:w-1/3">
              <div className="bg-gray-100/50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700/50 rounded-[2.5rem] p-8 lg:p-10 sticky top-28 shadow-sm">
                <h3 className="text-xl font-black text-gray-900 dark:text-white tracking-tight mb-8">Order Summary</h3>
                
                <div className="space-y-6 mb-8 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
                  {cart.map(item => (
                    <div key={item.id_cart_item} className="flex gap-4">
                       <div className="w-16 h-16 rounded-2xl bg-white dark:bg-slate-700 overflow-hidden shadow-sm shrink-0 border border-gray-100 dark:border-slate-600">
                          {item.product?.image_url ? <img src={item.product.image_url} alt="" className="w-full h-full object-cover"/> : <Leaf className="w-6 h-6 m-auto mt-5 text-gray-300"/>}
                       </div>
                       <div className="flex-1 min-w-0 pt-0.5">
                          <p className="font-bold text-sm text-gray-900 dark:text-white truncate mb-1">{item.product?.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{item.quantity} {item.variant?.name_label || 'Packs'} x Rp {(item.variant?.price || item.product?.price || 0).toLocaleString()}</p>
                       </div>
                       <span className="font-black text-sm text-gray-900 dark:text-white pt-0.5 whitespace-nowrap">Rp {((item.variant?.price || item.product?.price || 0) * item.quantity).toLocaleString()}</span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-gray-200 dark:border-slate-700 pt-6 space-y-4 mb-8">
                   <div className="flex justify-between text-sm">
                     <span className="text-gray-500 font-medium tracking-wide">Subtotal</span>
                     <span className="font-bold text-gray-900 dark:text-white">Rp {total.toLocaleString('id-ID')}</span>
                   </div>
                   <div className="flex justify-between text-sm">
                     <span className="text-gray-500 font-medium tracking-wide">Delivery Fee</span>
                     <span className="font-bold text-gray-900 dark:text-white">Rp {delivery.toLocaleString('id-ID')}</span>
                   </div>
                   <div className="flex justify-between text-sm">
                     <span className="text-gray-500 font-medium tracking-wide">Tax (11%)</span>
                     <span className="font-bold text-gray-900 dark:text-white">Rp {tax.toLocaleString('id-ID')}</span>
                   </div>
                   <div className="flex justify-between items-end pt-4 border-t border-gray-200 dark:border-slate-700 mt-4">
                     <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">Total Amount</span>
                     <span className="text-2xl font-black text-gray-900 dark:text-white tracking-tighter">Rp {grandTotal.toLocaleString('id-ID')}</span>
                   </div>
                </div>

                <button onClick={handleCheckoutSubmit} disabled={checkingOut} className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-2xl py-4 font-bold text-sm shadow-xl shadow-emerald-500/20 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer">
                  {checkingOut ? <><Loader2 className="w-4 h-4 animate-spin"/> Processing...</> : 'Pay Now'}
                </button>
                <p className="text-[9px] text-gray-400 text-center mt-5 leading-relaxed mx-4 font-medium uppercase tracking-wider">
                  By clicking "Pay Now", you agree to SayurSehat's Terms of Service and Privacy Policy.
                </p>
              </div>
            </div>

          </div>
        </div>
      </div>
    );
  }

  // --- CART VIEW --- //
  return (
    <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8 bg-white dark:bg-slate-900 transition-colors">
      <div className="flex items-center justify-between mb-12">
        <h1 className="text-4xl font-black tracking-tight text-gray-900 dark:text-white">Your Cart</h1>
        <span className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400 px-4 py-2 rounded-xl text-sm font-bold uppercase tracking-widest">{cart.length} Items</span>
      </div>

      {cart.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 dark:bg-slate-800/30 rounded-[3rem] border border-dashed border-gray-200 dark:border-slate-700">
          <ShoppingBag className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-6" />
          <h3 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white">Keranjang Kosong</h3>
          <p className="text-gray-500 mb-8 max-w-sm mx-auto">Mulai isi keranjang dengan sayuran organik pilihan dari petani lokal.</p>
          <Link to="/products" className="inline-block bg-emerald-600 text-white px-8 py-4 rounded-2xl font-bold hover:bg-emerald-700 transition shadow-lg shadow-emerald-600/30">Lanjut Belanja</Link>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Cart Table */}
          <div className="w-full lg:w-2/3">
            <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] p-2 sm:p-8 border border-gray-100 dark:border-slate-700/50 shadow-sm overflow-x-auto">
               <table className="w-full text-left border-collapse min-w-[600px]">
                 <thead>
                   <tr className="border-b-2 border-gray-100 dark:border-slate-700">
                     <th className="pb-4 pt-2 text-xs font-bold text-gray-400 uppercase tracking-widest px-4">Product Details</th>
                     <th className="pb-4 pt-2 text-xs font-bold text-gray-400 uppercase tracking-widest px-4 text-center">Quantity</th>
                     <th className="pb-4 pt-2 text-xs font-bold text-gray-400 uppercase tracking-widest px-4 text-right">Price</th>
                     <th className="pb-4 pt-2 text-xs font-bold text-gray-400 uppercase tracking-widest px-4 text-center">Action</th>
                   </tr>
                 </thead>
                 <tbody>
                   <AnimatePresence>
                     {cart.map(item => (
                       <motion.tr key={item.id_cart_item} initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0, scale:0.95}} className="border-b border-gray-50 dark:border-slate-700/50 last:border-0 hover:bg-gray-50 dark:hover:bg-slate-700/20 transition-colors">
                         <td className="py-6 px-4">
                           <div className="flex items-center gap-5">
                             <div className="w-20 h-20 bg-gray-100 dark:bg-slate-700 rounded-2xl overflow-hidden shrink-0 border border-gray-100 dark:border-slate-600 shadow-sm">
                               {item.product?.image_url ? <img src={item.product.image_url} className="w-full h-full object-cover"/> : <Leaf className="w-8 h-8 m-auto text-gray-300 mt-6"/>}
                             </div>
                             <div>
                               <p className="font-bold text-gray-900 dark:text-white text-base mb-1 truncate max-w-[200px]">{item.product?.name}</p>
                               <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400">Rp {(item.variant?.price || item.product?.price || 0).toLocaleString()}</p>
                             </div>
                           </div>
                         </td>
                         <td className="py-6 px-4 text-center">
                            <div className="inline-flex items-center bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-xl overflow-hidden">
                              <button onClick={() => updateQty(item.id_cart_item, item.quantity - 1)} className="p-2.5 text-gray-500 hover:bg-gray-200 dark:hover:bg-slate-700 transition"><Minus className="w-4 h-4"/></button>
                              <span className="w-10 text-sm font-black text-gray-900 dark:text-white text-center">{item.quantity}</span>
                              <button onClick={() => updateQty(item.id_cart_item, item.quantity + 1)} className="p-2.5 text-gray-500 hover:bg-gray-200 dark:hover:bg-slate-700 transition"><Plus className="w-4 h-4"/></button>
                            </div>
                         </td>
                         <td className="py-6 px-4 text-right">
                            <p className="font-black text-gray-900 dark:text-white text-base">Rp {((item.variant?.price || item.product?.price || 0) * item.quantity).toLocaleString()}</p>
                         </td>
                         <td className="py-6 px-4 text-center">
                            <button onClick={() => remove(item.id_cart_item)} className="p-2.5 rounded-xl text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors inline-block cursor-pointer">
                              <Trash2 className="w-5 h-5"/>
                            </button>
                         </td>
                       </motion.tr>
                     ))}
                   </AnimatePresence>
                 </tbody>
               </table>
            </div>
          </div>

          {/* Simple Sticky Summary for First Step */}
          <div className="w-full lg:w-1/3 pt-6 lg:pt-0">
             <div className="bg-gray-50 dark:bg-slate-800 rounded-[2.5rem] p-8 lg:p-10 sticky top-28 border border-gray-100 dark:border-slate-700/50 shadow-sm">
                <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight mb-8">Summary</h3>
                <div className="space-y-4 mb-8">
                   <div className="flex justify-between items-center text-sm font-bold text-gray-500">
                     <span>Total Items</span><span>{cart.length}</span>
                   </div>
                   <div className="flex justify-between items-center text-sm font-bold text-gray-500">
                     <span>Estimated Total</span><span className="text-gray-900 dark:text-white text-lg font-black">Rp {total.toLocaleString('id-ID')}</span>
                   </div>
                </div>
                <button onClick={startCheckout} className="w-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 py-4 rounded-2xl font-bold text-sm shadow-xl active:scale-95 transition-all mb-4 cursor-pointer hover:-translate-y-1">
                  Checkout
                </button>
                <Link to="/products" className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors cursor-pointer border border-transparent hover:border-gray-200 dark:hover:border-slate-600">
                  Lanjut Belanja
                </Link>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}
