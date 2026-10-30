import React from 'react';
import { motion } from 'framer-motion';

export default function GlassCard({ children, className = '', hover = true }) {
  return (
    <motion.div
      whileHover={hover ? { y: -8, scale: 1.01 } : {}}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={`relative overflow-hidden rounded-2xl glass-card p-6 ${className}`}
    >
      {/* Dynamic background glow */}
      <div className="absolute -inset-24 bg-brand-500/5 blur-[100px] pointer-events-none group-hover:bg-brand-500/10 transition-colors" />
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  );
}
