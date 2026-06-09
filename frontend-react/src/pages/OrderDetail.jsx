import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation, Link } from "react-router-dom";
import api from "../services/api";
import { loadMidtransSnap } from "../services/midtrans";
import { useAuth } from "../context/useAuth";
import { useToast } from "../context/ToastContext";
import { useModal } from "../context/ModalContext";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  CheckCircle,
  Package,
  Truck,
  Home,
  MapPin,
  Phone,
  ShieldAlert,
  CreditCard,
  ShoppingBag,
  Loader2,
  ArrowRight,
} from "lucide-react";

export default function OrderDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [order, setOrder] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const toast = useToast();
  const modal = useModal();

  const fetchOrderAndRecent = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      const [orderRes, allOrdersRes] = await Promise.all([
        api.get(`/orders/${id}`),
        api.get("/orders?limit=4"), // fetch recent for sidebar
      ]);
      const loadedOrder = orderRes.data.data;
      setOrder(loadedOrder);
      if (allOrdersRes.data.data) {
        setRecentOrders(
          allOrdersRes.data.data.filter((o) => o.id_order !== id).slice(0, 3),
        );
      }
      return loadedOrder;
    } catch (err) {
      toast.error("Gagal memuat pesanan");
      navigate("/orders");
      return null;
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    let disposed = false;

    const loadOrder = async () => {
      let currentOrder = await fetchOrderAndRecent();
      if (!location.state?.verifyPayment || !currentOrder || disposed) return;

      for (
        let attempt = 0;
        attempt < 6 && currentOrder.status === "PENDING";
        attempt += 1
      ) {
        await new Promise((resolve) => setTimeout(resolve, 2000));
        if (disposed) return;

        try {
          const response = await api.get(`/orders/${id}`);
          currentOrder = response.data.data;
          setOrder(currentOrder);
        } catch {
          break;
        }
      }

      if (!disposed) {
        if (
          currentOrder.status === "PAID" ||
          currentOrder.status === "PROCESSED"
        ) {
          toast.success(
            "Pembayaran terverifikasi. Pesanan menunggu diproses supplier.",
          );
        } else {
          toast.info(
            "Pembayaran masih diverifikasi. Status akan diperbarui otomatis.",
          );
        }
        navigate(`/orders/${id}`, { replace: true, state: null });
      }
    };

    loadOrder();
    return () => {
      disposed = true;
    };
  }, [id, location.state?.verifyPayment]);

  const pay = async () => {
    if (!order?.payment_token) {
      toast.error("Token pembayaran tidak ditemukan. Silakan hubungi admin.");
      return;
    }
    setPaying(true);
    try {
      const snap = await loadMidtransSnap();
      snap.pay(order.payment_token, {
        onSuccess: () => {
          toast.info("Pembayaran diterima. Sedang memverifikasi status...");
          setPaying(false);
          navigate(`/orders/${id}`, {
            replace: true,
            state: { verifyPayment: true },
          });
        },
        onPending: () => {
          toast.info("Menunggu Pembayaran.");
          setPaying(false);
        },
        onError: () => {
          toast.error("Gagal memproses pembayaran!");
          setPaying(false);
        },
        onClose: () => {
          toast.info("Popup ditutup.");
          setPaying(false);
        },
      });
    } catch (err) {
      toast.error(err.message || "Layanan pembayaran gagal dimuat.");
      setPaying(false);
    }
  };

  const [canceling, setCanceling] = useState(false);
  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const [disputeCategory, setDisputeCategory] = useState("");
  const [disputeDesc, setDisputeDesc] = useState("");

  const cancelOrder = async () => {
    setCanceling(true);
    try {
      await api.patch(`/orders/${id}/cancel`);
      const isPaidOrder =
        order?.status === "PAID" || order?.status === "PROCESSED";
      toast.success(
        isPaidOrder
          ? "Pembatalan diterima. Pengembalian dana sedang diproses."
          : "Pesanan berhasil dibatalkan",
      );
      fetchOrderAndRecent();
    } catch (err) {
      toast.error(err.response?.data?.error || "Gagal membatalkan pesanan");
    }
    setCanceling(false);
  };

  const confirmCancelOrder = () => {
    const isPaidOrder =
      order?.status === "PAID" || order?.status === "PROCESSED";
    modal.confirm({
      title: isPaidOrder ? "Batalkan & Ajukan Refund?" : "Batalkan Pesanan?",
      message: isPaidOrder
        ? "Pesanan sudah dibayar. Pembatalan akan mengajukan pengembalian dana dan tidak dapat dibatalkan kembali."
        : "Pesanan akan dibatalkan dan stok dikembalikan. Tindakan ini tidak dapat dibatalkan kembali.",
      confirmText: isPaidOrder ? "Ya, Ajukan Refund" : "Ya, Batalkan",
      cancelText: "Kembali",
      type: "danger",
      onConfirm: cancelOrder,
    });
  };

  const submitDispute = async (e) => {
    e.preventDefault();
    if (!disputeCategory || !disputeDesc) {
      toast.error("Harap lengkapi jenis keluhan dan deskripsi");
      return;
    }
    setPaying(true);
    const formData = new FormData();
    formData.append("reason", `[${disputeCategory}] ${disputeDesc}`);
    try {
      const res = await api.post(`/disputes/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success(res.data.message);
      setShowDisputeModal(false);
      navigate(`/disputes/${res.data.data.id_dispute}`);
    } catch (err) {
      toast.error(err.response?.data?.error || "Gagal mengajukan komplain");
    }
    setPaying(false);
  };

  if (loading)
    return (
      <div className="max-w-6xl mx-auto px-4 py-8 flex gap-8">
        <div className="flex-1 space-y-4">
          <div className="h-64 skeleton" />
          <div className="h-96 skeleton" />
        </div>
        <div className="w-1/3 hidden lg:block space-y-4">
          <div className="h-full skeleton" />
        </div>
      </div>
    );
  if (!order) return null;

  const orderStatuses = [
    "PENDING",
    "PAID",
    "PROCESSED",
    "SHIPPED",
    "DELIVERED",
  ];
  const currentIdx =
    orderStatuses.indexOf(order.status) >= 0
      ? orderStatuses.indexOf(order.status)
      : 0;

  const getStatusLabel = (s) => {
    switch (s) {
      case "PENDING":
        return "Menunggu Pembayaran";
      case "PAID":
        return "Pembayaran Berhasil";
      case "PROCESSED":
        return "Diproses Supplier";
      case "SHIPPED":
        return "Dikirim";
      case "DELIVERED":
        return "Selesai";
      case "DISPUTED":
        return "Diklaim";
      case "CANCELLED":
        return "Dibatalkan";
      case "REFUND_PENDING":
        return "Refund Diproses";
      case "REFUNDED":
        return "Dana Dikembalikan";
      case "EXPIRED":
        return "Kedaluwarsa";
      default:
        return s;
    }
  };

  return (
    <div className="bg-gray-50/50 dark:bg-slate-900 min-h-screen py-8 pb-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={() => navigate("/orders")}
            className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" /> Daftar Pesanan
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content (Left Column) */}
          <div className="flex-1 space-y-6">
            {/* Active Order Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="card-organic p-6 sm:p-8 border border-gray-100 dark:border-slate-800 shadow-sm relative overflow-hidden"
            >
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-10">
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400">
                      {getStatusLabel(order.status)}
                    </span>
                    {order.status === "DISPUTED" && (
                      <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400 flex items-center gap-1">
                        <ShieldAlert className="w-3.5 h-3.5" /> BERSENGKETA
                      </span>
                    )}
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight">
                    Order #{order.id_order?.slice(0, 8).toUpperCase()}
                  </h1>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-1">
                    Placed on{" "}
                    {new Date(order.created_at).toLocaleDateString("id-ID", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}{" "}
                    •{" "}
                    {new Date(order.created_at).toLocaleTimeString("id-ID", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                {![
                  "PENDING",
                  "CANCELLED",
                  "EXPIRED",
                  "DELIVERED",
                  "DISPUTED",
                ].includes(order.status) && (
                  <div className="sm:text-right">
                    <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1">
                      Estimated Delivery
                    </p>
                    <p className="text-lg font-black text-emerald-600 dark:text-emerald-400">
                      Hari ini, 15:00 WIB
                    </p>
                  </div>
                )}
              </div>

              {/* Horizontal Timeline */}
              <div className="relative mb-12 isolate px-2">
                {/* Connecting Line */}
                <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-100 dark:bg-slate-800 -translate-y-1/2 -z-10 rounded-full" />
                <div
                  className="absolute top-1/2 left-0 h-1 bg-emerald-500 -translate-y-1/2 z-0 rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${Math.min(100, (currentIdx / 4) * 100)}%` }}
                />

                <div className="flex justify-between relative z-10 w-full">
                  {[
                    {
                      id: "PENDING",
                      label: "Menunggu Bayar",
                      icon: CreditCard,
                    },
                    { id: "PAID", label: "Pembayaran Sah", icon: CheckCircle },
                    {
                      id: "PROCESSED",
                      label: "Diproses Supplier",
                      icon: Package,
                    },
                    { id: "SHIPPED", label: "On the Way", icon: Truck },
                    { id: "DELIVERED", label: "Received", icon: Home },
                  ].map((step, i) => {
                    const isActive = i <= currentIdx;
                    const Icon = step.icon;
                    return (
                      <div
                        key={step.id}
                        className="flex flex-col items-center gap-3"
                      >
                        <div
                          className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                            isActive
                              ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/30"
                              : "bg-white dark:bg-slate-900 text-gray-300 dark:text-gray-600 border-2 border-gray-100 dark:border-slate-800"
                          }`}
                        >
                          <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                        </div>
                        <span
                          className={`text-[10px] sm:text-xs font-bold uppercase tracking-wide ${isActive ? "text-gray-900 dark:text-white" : "text-gray-400 dark:text-gray-500"}`}
                        >
                          {step.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Lower Section Grid: Map/Courier & Summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                {/* Courier / Map Widget */}
                {order.status === "SHIPPED" || order.status === "DELIVERED" ? (
                  <div className="relative w-full h-64 bg-gray-100 dark:bg-slate-800 rounded-3xl overflow-hidden border border-gray-200 dark:border-slate-700 isolate group">
                    {/* Simulated Map Background */}
                    <div
                      className="absolute inset-0 opacity-40 dark:opacity-20 flex items-center justify-center p-4"
                      style={{
                        backgroundImage:
                          "radial-gradient(#d1d5db 1px, transparent 1px)",
                        backgroundSize: "20px 20px",
                      }}
                    >
                      <MapPin className="w-8 h-8 text-emerald-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                    </div>

                    {/* Courier Overlay Plate */}
                    <div className="absolute bottom-4 left-4 right-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-2xl p-4 flex items-center justify-between shadow-lg border border-white/50 dark:border-slate-700/50 transition-transform duration-300 group-hover:-translate-y-1">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center overflow-hidden">
                          <img
                            src={`https://ui-avatars.com/api/?name=${order.id_courier ? "Kurir" : "Anto"}&background=10b981&color=fff`}
                            alt="Courier"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                            Your Courier
                          </p>
                          <p className="text-sm font-bold text-gray-900 dark:text-white">
                            {order.courier?.nama || "Ahmad Rizky"}
                          </p>
                        </div>
                      </div>
                      <button className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/30 hover:bg-emerald-600 transition-colors cursor-pointer">
                        <Phone className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : order.status === "PAID" ? (
                  <div className="relative w-full h-64 bg-emerald-50 dark:bg-emerald-900/10 rounded-3xl overflow-hidden border border-emerald-100 dark:border-emerald-900/30 flex flex-col items-center justify-center p-6 text-center">
                    <CheckCircle className="w-12 h-12 text-emerald-500 mb-4" />
                    <h3 className="font-bold text-emerald-800 dark:text-emerald-400 mb-1">
                      Pembayaran Berhasil
                    </h3>
                    <p className="text-xs text-emerald-600/70 dark:text-emerald-500/70">
                      Pembayaran telah terverifikasi. Menunggu supplier menerima
                      dan menyiapkan pesanan.
                    </p>
                  </div>
                ) : order.status === "PENDING" ? (
                  <div className="relative w-full h-64 bg-amber-50 dark:bg-amber-900/10 rounded-3xl overflow-hidden border border-amber-100 dark:border-amber-900/30 flex flex-col items-center justify-center p-6 text-center">
                    <CreditCard className="w-12 h-12 text-amber-400 mb-4" />
                    <h3 className="font-bold text-amber-800 dark:text-amber-400 mb-1">
                      Menunggu Pembayaran
                    </h3>
                    <p className="text-xs text-amber-700/70 dark:text-amber-500/70">
                      Selesaikan pembayaran melalui Midtrans agar supplier dapat
                      memproses pesanan.
                    </p>
                  </div>
                ) : [
                    "CANCELLED",
                    "EXPIRED",
                    "REFUND_PENDING",
                    "REFUNDED",
                  ].includes(order.status) ? (
                  <div className="relative w-full h-64 bg-red-50 dark:bg-red-900/10 rounded-3xl overflow-hidden border border-red-100 dark:border-red-900/30 flex flex-col items-center justify-center p-6 text-center">
                    <ShieldAlert className="w-12 h-12 text-red-400 mb-4" />
                    <h3 className="font-bold text-red-800 dark:text-red-400 mb-1">
                      {order.status === "REFUND_PENDING"
                        ? "Pengembalian Dana Diproses"
                        : order.status === "REFUNDED"
                          ? "Dana Telah Dikembalikan"
                          : "Pesanan Dibatalkan"}
                    </h3>
                    <p className="text-xs text-red-700/70 dark:text-red-500/70">
                      {order.status === "REFUND_PENDING"
                        ? "Permintaan refund telah dikirim ke penyedia pembayaran. Waktu masuk dana mengikuti metode pembayaran."
                        : "Stok produk telah dikembalikan dan pesanan ini tidak dapat diproses lagi."}
                    </p>
                  </div>
                ) : (
                  <div className="relative w-full h-64 bg-emerald-50 dark:bg-emerald-900/10 rounded-3xl overflow-hidden border border-emerald-100 dark:border-emerald-900/30 flex flex-col items-center justify-center p-6 text-center">
                    <Package className="w-12 h-12 text-emerald-300 dark:text-emerald-700 mb-4 animate-bounce" />
                    <h3 className="font-bold text-emerald-800 dark:text-emerald-400 mb-1">
                      Pesanan Sedang Disiapkan
                    </h3>
                    <p className="text-xs text-emerald-600/70 dark:text-emerald-500/70">
                      Toko sedang mengemas pesanan organik Anda.
                    </p>
                  </div>
                )}

                {/* Order Summary Widget */}
                <div className="bg-white dark:bg-slate-800/50 rounded-3xl p-6 border border-gray-100 dark:border-slate-700/50 shadow-sm flex flex-col h-full">
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4">
                    Order Summary
                  </h3>

                  {/* Items list truncated */}
                  <div className="space-y-4 mb-6 flex-1">
                    {order.items?.slice(0, 2).map((item) => (
                      <div
                        key={item.id_order_item}
                        className="flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center shrink-0 border border-gray-100">
                            {item.product?.image_url ? (
                              <img
                                src={item.product.image_url}
                                alt=""
                                className="w-full h-full object-cover rounded-xl"
                              />
                            ) : (
                              <Package className="w-5 h-5 text-gray-300" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                              {item.product?.name || "Sayur Organik"}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {item.quantity} kg x Rp{" "}
                              {item.price_at_purchase.toLocaleString("id-ID")}
                            </p>
                          </div>
                        </div>
                        <p className="text-sm font-bold text-gray-900 dark:text-white shrink-0">
                          Rp{" "}
                          {(
                            item.price_at_purchase * item.quantity
                          ).toLocaleString("id-ID")}
                        </p>
                      </div>
                    ))}
                    {order.items?.length > 2 && (
                      <p className="text-xs font-bold text-gray-400 text-center pt-2">
                        + {order.items.length - 2} item lainnya
                      </p>
                    )}
                  </div>

                  <div className="space-y-2 border-t border-gray-100 dark:border-slate-700 pt-4 mb-4">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500 dark:text-gray-400">
                        Subtotal
                      </span>
                      <span className="font-semibold text-gray-700 dark:text-gray-300">
                        Rp {order.total_amount?.toLocaleString("id-ID")}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500 dark:text-gray-400">
                        Delivery Fee
                      </span>
                      <span className="font-semibold text-gray-700 dark:text-gray-300">
                        Rp 0
                      </span>
                    </div>
                    <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-50 dark:border-slate-700/50">
                      <span className="text-sm font-bold text-gray-900 dark:text-white">
                        Total
                      </span>
                      <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">
                        Rp {order.total_amount?.toLocaleString("id-ID")}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2 w-full mt-auto">
                    {order.status === "PENDING" ? (
                      <>
                        <button
                          onClick={confirmCancelOrder}
                          disabled={canceling}
                          className="flex-1 border border-red-200 dark:border-red-900/30 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/10 text-xs font-bold py-3 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors cursor-pointer flex justify-center items-center gap-1"
                        >
                          {canceling ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            "Batalkan Pesanan"
                          )}
                        </button>
                        <button
                          onClick={pay}
                          disabled={paying}
                          className="flex-1 btn-primary text-xs py-3 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          {paying ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <>
                              <CreditCard className="w-4 h-4" /> Bayar Sekarang
                            </>
                          )}
                        </button>
                      </>
                    ) : ["PAID", "PROCESSED"].includes(order.status) ? (
                      <>
                        <button
                          onClick={confirmCancelOrder}
                          disabled={canceling}
                          className="flex-1 border border-red-200 dark:border-red-900/30 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/10 text-xs font-bold py-3 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors cursor-pointer flex justify-center items-center gap-1"
                        >
                          {canceling ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            "Batalkan & Ajukan Refund"
                          )}
                        </button>
                        <button
                          onClick={() =>
                            window.open(`/invoice/${order.id_order}`, "_blank")
                          }
                          className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs font-bold py-3 rounded-xl shadow-md shadow-emerald-500/20 hover:from-emerald-600 hover:to-teal-600 transition-colors cursor-pointer flex justify-center items-center gap-1"
                        >
                          <ArrowRight className="w-3.5 h-3.5" /> Invoice Detail
                        </button>
                      </>
                    ) : (
                      <>
                        {(order.status === "SHIPPED" ||
                          order.status === "DELIVERED") && (
                          <button
                            onClick={() => setShowDisputeModal(true)}
                            className="flex-1 border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 text-xs font-bold py-3 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors cursor-pointer flex justify-center items-center gap-1"
                          >
                            <ShieldAlert className="w-3.5 h-3.5" /> Ajukan
                            Komplain
                          </button>
                        )}
                        <button
                          onClick={() =>
                            window.open(`/invoice/${order.id_order}`, "_blank")
                          }
                          className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs font-bold py-3 rounded-xl shadow-md shadow-emerald-500/20 hover:from-emerald-600 hover:to-teal-600 transition-colors cursor-pointer flex justify-center items-center gap-1"
                        >
                          <ArrowRight className="w-3.5 h-3.5" /> Invoice Detail
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Sidebar (Right Column) */}
          <div className="w-full lg:w-80 space-y-6">
            {/* Recent Orders Widget */}
            <div className="bg-gray-100/50 dark:bg-slate-800/30 rounded-3xl p-6 border border-gray-100 dark:border-slate-800">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-5">
                Recent Orders
              </h3>

              <div className="space-y-4">
                {recentOrders.length === 0 ? (
                  <p className="text-xs text-gray-500">
                    Belum ada riwayat lain.
                  </p>
                ) : (
                  recentOrders.map((ro) => (
                    <Link
                      to={`/orders/${ro.id_order}`}
                      key={ro.id_order}
                      className="flex items-start gap-3 group block"
                    >
                      <div className="w-10 h-10 bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 flex items-center justify-center shadow-sm group-hover:border-emerald-500 transition-colors shrink-0">
                        <ShoppingBag className="w-4 h-4 text-gray-400 group-hover:text-emerald-500 transition-colors" />
                      </div>
                      <div className="flex-1 min-w-0 pt-0.5">
                        <div className="flex items-center justify-between mb-0.5">
                          <p className="text-xs font-bold text-gray-900 dark:text-white truncate">
                            #{ro.id_order.slice(0, 8).toUpperCase()}
                          </p>
                          <span
                            className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-md ${
                              ro.status === "DELIVERED"
                                ? "bg-emerald-100 text-emerald-700"
                                : ro.status === "PENDING"
                                  ? "bg-amber-100 text-amber-700"
                                  : ro.status === "DISPUTED"
                                    ? "bg-red-100 text-red-700"
                                    : "bg-gray-200 text-gray-600"
                            }`}
                          >
                            {getStatusLabel(ro.status)}
                          </span>
                        </div>
                        <p className="text-[10px] text-gray-500 truncate mb-1">
                          {new Date(ro.created_at).toLocaleDateString()} •{" "}
                          {ro.items?.length || 0} items
                        </p>
                        <p className="text-xs font-bold text-gray-700 dark:text-gray-300">
                          Rp {ro.total_amount?.toLocaleString("id-ID")}
                        </p>
                      </div>
                    </Link>
                  ))
                )}
              </div>

              <div className="mt-5 pt-4 border-t border-gray-200 dark:border-slate-700">
                <Link
                  to="/orders"
                  className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center justify-center gap-1 transition-colors"
                >
                  View All History <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Dispute */}
        {showDisputeModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setShowDisputeModal(false)}
            ></div>
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-md p-6 relative z-10 border border-gray-100 dark:border-slate-800">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                Ajukan Komplain / Retur
              </h3>
              <form onSubmit={submitDispute} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                    Jenis Keluhan
                  </label>
                  <select
                    value={disputeCategory}
                    onChange={(e) => setDisputeCategory(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="">-- Pilih Jenis Keluhan --</option>
                    <option value="Barang tidak sesuai">
                      Barang tidak sesuai — sayuran diretur berbeda
                    </option>
                    <option value="Kualitas tidak sesuai">
                      Kualitas tidak sesuai — sayuran rusak/busuk
                    </option>
                    <option value="Kuantitas kurang">
                      Kuantitas kurang — berat/jumlah tidak sesuai pesanan
                    </option>
                    <option value="Barang tidak sampai">
                      Barang tidak sampai — diklaim DELIVERED tapi tidak
                      diterima
                    </option>
                    <option value="Return/pengembalian barang">
                      Return/pengembalian barang — salah satu alasan di atas
                    </option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                    Deskripsi Singkat
                  </label>
                  <textarea
                    value={disputeDesc}
                    onChange={(e) => setDisputeDesc(e.target.value)}
                    placeholder="Ceritakan detail keluhan Anda..."
                    rows="3"
                    className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 resize-none"
                  ></textarea>
                </div>
                <div className="flex gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setShowDisputeModal(false)}
                    className="flex-1 py-2.5 bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 font-bold text-sm rounded-xl hover:bg-gray-200 dark:hover:bg-slate-700 transition cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={paying}
                    className="flex-1 py-2.5 bg-emerald-500 text-white font-bold text-sm rounded-xl hover:bg-emerald-600 transition flex justify-center items-center gap-2 cursor-pointer"
                  >
                    {paying ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      "Kirim Komplain"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
