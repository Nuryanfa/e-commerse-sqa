import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Loader2, ArrowLeft, Download, Printer } from 'lucide-react';

export default function Invoice() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/orders/${id}`)
      .then(res => setOrder(res.data.data))
      .catch(() => navigate('/orders'))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  if (!order) return null;

  const invoiceDate = new Date(order.created_at).toLocaleDateString('id-ID', {
    day: 'numeric', month: 'long', year: 'numeric'
  });

  const dueDate = new Date(new Date(order.created_at).getTime() + 24 * 60 * 60 * 1000).toLocaleDateString('id-ID', {
    day: 'numeric', month: 'long', year: 'numeric'
  });

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 font-sans text-gray-800">
      
      {/* Controls Form - Only visible on screen, hidden on print */}
      <div className="max-w-4xl mx-auto mb-6 flex justify-between items-center print:hidden">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors bg-white px-4 py-2 rounded-xl border border-gray-200 shadow-sm cursor-pointer">
          <ArrowLeft className="w-4 h-4" /> Kembali
        </button>
        <div className="flex gap-3">
          <button onClick={() => window.print()} className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl shadow-sm transition-colors font-medium cursor-pointer">
            <Printer className="w-4 h-4" /> Cetak / PDF
          </button>
        </div>
      </div>

      {/* Invoice Document */}
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-sm border border-gray-100 p-8 sm:p-12 print:shadow-none print:border-none print:p-0">
        
        {/* Header */}
        <div className="flex justify-between items-start mb-12">
          {/* If there's a logo, you can put it here. Currently leaving empty for right alignment focus. */}
          <div className="flex-1">
            <h1 className="text-3xl font-black text-emerald-600 mb-1">SayurSehat</h1>
            <p className="text-sm text-gray-500">Pasar Induk Digital UMKM</p>
          </div>
          
          <div className="text-right">
            <h2 className="text-3xl font-bold text-gray-800 tracking-wider mb-2">INVOICE</h2>
            <p className="text-sm text-gray-500 mb-1">{order.id_order}</p>
            <p className="text-sm text-gray-500">{invoiceDate}</p>
          </div>
        </div>

        {/* Due Date & Info Cards */}
        <div className="flex flex-col md:flex-row justify-between items-start gap-8 mb-12">
          <div className="space-y-6 flex-1">
            {/* Due Date Pill */}
            <div className="inline-block px-4 py-2 bg-amber-50 rounded-lg border border-amber-100">
              <p className="text-amber-800 font-bold text-sm">
                Due date: {order.status === 'PENDING' ? dueDate : 'Lunas'}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-8 sm:gap-16">
              {/* From */}
              <div>
                <p className="text-sm font-bold text-gray-800 mb-2">From:</p>
                <div className="text-sm text-gray-600 space-y-1">
                  <p className="font-semibold text-gray-800">SuperSayuran</p>
                  <p>+62 882 18950966</p>
                  <p>nuryanfa93@gmail.com</p>
                  <p>NPWP: 100000000000001</p>
                </div>
              </div>

              {/* Bill To */}
              <div>
                <p className="text-sm font-bold text-gray-800 mb-2">Bill to:</p>
                <div className="text-sm text-gray-600 space-y-1">
                  <p className="font-semibold text-gray-800">{order.user?.nama || 'Pelanggan'}</p>
                  <p className="max-w-[250px]">{order.shipping_address || '-'}</p>
                  <p>{order.user?.phone || '-'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Pay Via Box */}
          <div className="bg-gray-100 rounded-2xl p-6 min-w-[250px] border border-gray-200">
            <p className="text-sm font-bold text-gray-800 mb-2">Pay via:</p>
            <p className="text-sm text-gray-600">
              {order.payment_method === 'midtrans' ? 'Midtrans Payment Gateway' : 
               order.payment_method === 'cod' ? 'Cash on Delivery (COD)' : 
               order.payment_method === 'transfer' ? 'Manual Transfer' : '-'}
            </p>
            {order.payment_status === 'paid' && (
              <div className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-100 text-emerald-700 rounded-md text-xs font-bold uppercase tracking-wider">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div> Lunas
              </div>
            )}
            {order.payment_status !== 'paid' && order.status === 'PENDING' && (
               <div className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-100 text-amber-700 rounded-md text-xs font-bold uppercase tracking-wider">
                 <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></div> Belum Lunas
               </div>
            )}
          </div>
        </div>

        {/* Order Summary Heading */}
        <div className="mb-6">
          <h3 className="text-xl font-bold text-gray-800 mb-1">
            Total amount due: Rp {order.total_amount?.toLocaleString('id-ID')}
          </h3>
          <p className="text-sm text-gray-700 font-medium">
            Order ID: {order.id_order}
          </p>
        </div>

        {/* Items Table */}
        <div className="w-full overflow-x-auto mb-8">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b-2 border-gray-200 text-sm font-bold text-gray-800">
                <th className="py-3 px-2">Description</th>
                <th className="py-3 px-2 text-center">Qty</th>
                <th className="py-3 px-2 text-right">Price (Rp)</th>
                <th className="py-3 px-2 text-center">Disc (%)</th>
                <th className="py-3 px-2 text-right">Total (Rp)</th>
              </tr>
            </thead>
            <tbody className="text-sm text-gray-600">
              {order.items?.map((item, index) => (
                <tr key={index} className="border-b border-gray-100">
                  <td className="py-4 px-2 font-medium text-gray-800">{item.product?.name || '-'}</td>
                  <td className="py-4 px-2 text-center">{item.quantity}</td>
                  <td className="py-4 px-2 text-right">{item.price_at_purchase?.toLocaleString('id-ID')}</td>
                  <td className="py-4 px-2 text-center">0%</td>
                  <td className="py-4 px-2 text-right font-medium text-gray-800">
                    {(item.price_at_purchase * item.quantity).toLocaleString('id-ID')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="flex justify-end">
          <div className="w-full max-w-[350px]">
            <div className="flex justify-between py-3 border-b border-gray-100 text-sm">
              <span className="font-bold text-gray-800">Subtotal</span>
              <span className="text-gray-800">Rp {order.total_amount?.toLocaleString('id-ID')}</span>
            </div>
            {/* If you have tax or shipping, add here */}
            <div className="flex justify-between py-3 border-b-2 border-gray-200 text-sm">
              <span className="font-bold text-gray-800">Biaya Pengiriman</span>
              <span className="text-gray-500">Gratis</span>
            </div>
            <div className="flex justify-between py-4 text-base font-bold">
              <span className="text-gray-800 text-lg">Total amount due</span>
              <span className="text-emerald-600 text-lg">Rp {order.total_amount?.toLocaleString('id-ID')}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-16 pt-8 border-t border-gray-200 text-center text-xs text-gray-500">
          <p>Terima kasih telah berbelanja di SayurSehat!</p>
          <p className="mt-1">Invoice ini sah dan diterbitkan secara elektronik.</p>
        </div>

      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body {
            background: white !important;
            -webkit-print-color-adjust: exact;
          }
          @page {
            margin: 0.5cm;
          }
        }
      `}} />
    </div>
  );
}
