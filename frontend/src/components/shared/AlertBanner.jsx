import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertTriangle, X, Info } from 'lucide-react';

const icons = { success: CheckCircle, error: AlertTriangle, info: Info };
const styles = {
  success: 'bg-success-500/10 border-success-500/30 text-success-400',
  error: 'bg-danger-500/10 border-danger-500/30 text-danger-400',
  info: 'bg-brand-500/10 border-brand-500/30 text-brand-400',
};

export default function AlertBanner({ message, type = 'success', onClose, duration = 4000 }) {
  const [visible, setVisible] = useState(true);
  const Icon = icons[type];

  useEffect(() => {
    if (duration) {
      const t = setTimeout(() => { setVisible(false); setTimeout(() => onClose?.(), 300); }, duration);
      return () => clearTimeout(t);
    }
  }, [duration, onClose]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl border shadow-glass-lg backdrop-blur-xl ${styles[type]}`}
        >
          <Icon className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm font-medium pr-2">{message}</p>
          <button onClick={() => { setVisible(false); onClose?.(); }} className="p-1 hover:bg-white/10 rounded-lg transition-colors">
            <X className="w-4 h-4" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
