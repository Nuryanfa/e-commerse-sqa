import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Truck, Gift } from 'lucide-react';
import { useToast } from '../context/ToastContext';

export default function GamificationBanner({ currentAmount, targetAmount = 150000 }) {
  const [hasToasted, setHasToasted] = useState(false);
  const progress = Math.min((currentAmount / targetAmount) * 100, 100);
  const isReached = progress === 100;
  const toast = useToast();

  useEffect(() => {
    if (isReached && !hasToasted) {
      toast.success("Hore! Anda berhak mendapatkan GRATIS ONGKIR! 🎉");
      setHasToasted(true); // Biarkan true seumur hidup komponen agar tidak ngetrigger lagi kalau kurang lalu nambah
    }
  }, [isReached, hasToasted, toast]);

  return (
    <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl p-4 mb-6 border border-emerald-100 dark:border-emerald-800/30 shadow-sm transition-all duration-300">
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isReached ? 'bg-emerald-100 dark:bg-emerald-800/40 text-emerald-600 dark:text-emerald-400' : 'bg-emerald-100 dark:bg-emerald-800/40 text-emerald-600 dark:text-emerald-400'}`}>
          {isReached ? <Gift className="w-4 h-4" /> : <Truck className="w-4 h-4" />}
        </div>
        <p className="text-sm font-bold text-gray-800 dark:text-gray-200">
          {isReached 
            ? "Hore! Anda berhak mendapatkan GRATIS ONGKIR! 🎉" 
            : `Belanja Rp ${(targetAmount - currentAmount).toLocaleString('id-ID')} lagi untuk Gratis Ongkir!`}
        </p>
      </div>
      <div className="w-full h-2.5 bg-emerald-100/50 dark:bg-slate-700/50 rounded-full overflow-hidden relative">
        <div 
          className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full relative transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
