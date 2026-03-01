import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Truck, Gift } from 'lucide-react';

export default function GamificationBanner({ currentAmount, targetAmount = 150000 }) {
  const [hasCelebrated, setHasCelebrated] = useState(false);
  const progress = Math.min((currentAmount / targetAmount) * 100, 100);
  const isReached = progress === 100;

  useEffect(() => {
    if (isReached && !hasCelebrated) {
      const end = Date.now() + 1.5 * 1000;
      const colors = ['#10b981', '#34d399', '#fef08a', '#fbbf24'];

      (function frame() {
        confetti({
          particleCount: 5,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: colors
        });
        confetti({
          particleCount: 5,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: colors
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      }());

      setHasCelebrated(true);
    } else if (!isReached) {
      setHasCelebrated(false);
    }
  }, [isReached, hasCelebrated]);

  return (
    <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl p-4 mb-6 border border-emerald-100 dark:border-emerald-800/30 shadow-sm animate-fade-in-up">
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isReached ? 'bg-amber-100 text-amber-500' : 'bg-emerald-100 dark:bg-emerald-800/40 text-emerald-600 dark:text-emerald-400'}`}>
          {isReached ? (
            <Gift className="w-4 h-4 animate-bounce" />
          ) : (
            <Truck className="w-4 h-4" />
          )}
        </div>
        <p className="text-sm font-bold text-gray-800 dark:text-gray-200">
          {isReached 
            ? "Hore! Anda berhak mendapatkan GRATIS ONGKIR! 🎉" 
            : `Belanja Rp ${(targetAmount - currentAmount).toLocaleString('id-ID')} lagi untuk Gratis Ongkir!`}
        </p>
      </div>
      <div className="w-full h-2.5 bg-emerald-100/50 dark:bg-slate-700/50 rounded-full overflow-hidden relative">
        <motion.div 
          className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full relative"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.8, type: "spring", bounce: 0.4 }}
        >
          {isReached && (
            <motion.div 
              className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent"
              animate={{ x: ['-100%', '200%'] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
            />
          )}
        </motion.div>
      </div>
    </div>
  );
}
