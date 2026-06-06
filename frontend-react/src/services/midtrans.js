let snapPromise;

export function loadMidtransSnap() {
  if (window.snap) return Promise.resolve(window.snap);
  if (snapPromise) return snapPromise;

  const clientKey = import.meta.env.VITE_MIDTRANS_CLIENT_KEY;
  if (!clientKey) {
    return Promise.reject(new Error('Midtrans client key belum dikonfigurasi.'));
  }

  snapPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://app.sandbox.midtrans.com/snap/snap.js';
    script.async = true;
    script.dataset.clientKey = clientKey;
    script.onload = () => window.snap
      ? resolve(window.snap)
      : reject(new Error('Midtrans Snap gagal diinisialisasi.'));
    script.onerror = () => reject(new Error('Midtrans Snap gagal dimuat.'));
    document.head.appendChild(script);
  });

  return snapPromise;
}
