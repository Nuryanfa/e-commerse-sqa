import { motion } from 'framer-motion';
import { Leaf } from 'lucide-react';

export default function SplashScreen() {
  return (
    <motion.div 
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-white dark:bg-slate-950 px-4"
    >
      <div className="relative">
        {/* Glow Effect di Background */}
        <motion.div 
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-0 bg-emerald-400 dark:bg-emerald-600 rounded-full blur-3xl opacity-30"
          style={{ width: '150px', height: '150px', left: '-25px', top: '-25px' }}
        />
        
        {/* Ikon SayurSehat (Leaf) Animated */}
        <motion.div
          animate={{
            y: [0, -10, 0],
          }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          className="relative z-10 w-24 h-24 sm:w-28 sm:h-28 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-emerald-500/40 border-4 border-white dark:border-slate-800"
        >
          <Leaf className="w-12 h-12 sm:w-16 sm:h-16 text-white" />
        </motion.div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="mt-8 text-center"
      >
        <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight mb-2">
          Sayur<span className="text-emerald-500">Sehat</span>
        </h1>
        <p className="text-gray-500 dark:text-gray-400 font-medium text-sm sm:text-base tracking-widest uppercase">
          Sayuran Segar, Langsung Dari Petani
        </p>

        {/* Loading Bar Animatif */}
        <div className="mt-8 w-48 sm:w-64 h-1.5 bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden mx-auto relative">
          <motion.div 
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 2, ease: "easeInOut" }}
            className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full"
          />
        </div>
      </motion.div>
    </motion.div>
  );
}
