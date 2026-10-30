import React from "react";
import { motion } from "framer-motion";

/**
 * Enhanced Adherence Visualization
 * @param {Object} props - { taken, total }
 */
export function AdherenceBar({ taken, total }) {
  const percentage = total > 0 ? Math.round((taken / total) * 100) : 0;

  return (
    <div className="w-full bg-surface border border-whisper rounded-3xl p-6 shadow-sm">
      <div className="flex justify-between items-end mb-4">
        <div>
          <h3 className="text-xl font-bold text-charcoal tracking-tight">Daily Adherence</h3>
          <p className="text-steel text-sm font-medium mt-1">{taken}/{total} doses taken</p>
        </div>
        <div className="text-4xl font-mono text-emerald tracking-tighter leading-none">
          {percentage}%
        </div>
      </div>

      <div className="w-full h-3 bg-black/5 rounded-full overflow-hidden">
        <motion.div
           initial={{ width: 0 }}
           animate={{ width: `${percentage}%` }}
           transition={{ duration: 1, ease: [0.32, 0.72, 0, 1] }}
           className="h-full bg-emerald rounded-full"
        />
      </div>
    </div>
  );
}
