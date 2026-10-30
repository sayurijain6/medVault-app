import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

function AnimatedCounter({ target, duration = 1500 }) {
  const [count, setCount] = useState(0);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    // If target is not a number (like '—' or 'Calculating...'), just show it
    if (typeof target !== 'number') {
      setCount(target);
      return;
    }

    // Trigger update animation
    setIsUpdating(true);
    const updateTimeout = setTimeout(() => setIsUpdating(false), 1000);

    let start = count === target ? target : 0; // Or keep previous count for smooth transition
    const end = parseInt(target);
    if (end === 0) {
      setCount(0);
      return () => clearTimeout(updateTimeout);
    }
    
    // Smooth framer-motion approach handled in styles, so here we just count up if it's new
    const increment = end / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    
    return () => {
      clearInterval(timer);
      clearTimeout(updateTimeout);
    };
  }, [target, duration]);

  return (
    <motion.div
      animate={{
        textShadow: isUpdating ? '0px 0px 20px rgba(14, 165, 233, 0.8)' : '0px 0px 0px rgba(14, 165, 233, 0)',
        scale: isUpdating ? 1.05 : 1,
        color: isUpdating ? '#bae6fd' : '#ffffff' 
      }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="inline-block"
    >
      {count.toLocaleString()}
    </motion.div>
  );
}

export default function DashboardStats({ stats }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
      {stats.map((stat, i) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ y: -6, scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          transition={{ 
            delay: i * 0.1,
            type: "spring",
            stiffness: 260,
            damping: 20
          }}
          style={{ backgroundColor: 'rgba(30, 41, 59, 0.7)' }}
          className="backdrop-blur-xl border border-white/[0.08] rounded-[2rem] p-6 md:p-8 group relative overflow-hidden transition-shadow duration-300 hover:shadow-[0_20px_50px_rgba(0,0,0,0.3)] hover:border-brand-500/20 shadow-2xl"
        >
          {/* Subtle Glow Overlay */}
          <div className="absolute -right-10 -top-10 w-32 h-32 bg-brand-500/5 rounded-full blur-3xl group-hover:bg-brand-500/10 transition-colors duration-500" />
          
          <div className="flex items-start justify-between mb-6 relative z-10">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] group-hover:text-slate-300 transition-colors duration-300">
              {stat.label}
            </span>
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 group-hover:scale-110 shadow-lg relative ${
              stat.iconBg || 'bg-brand-500/10'
            }`}>
              <div className="absolute inset-0 rounded-2xl blur-md opacity-0 group-hover:opacity-40 transition-opacity duration-500 bg-current" style={{ color: stat.iconColor === 'text-brand-400' ? '#0ea5e9' : '#10b981' }} />
              <stat.icon className={`w-6 h-6 relative z-10 ${stat.iconColor || 'text-brand-400'}`} />
            </div>
          </div>

          <div className="relative z-10">
            <p className="text-4xl font-display font-black text-white tracking-tight">
              <AnimatedCounter target={stat.value} />
            </p>
            {stat.sub && (
              <div className="mt-3 flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-success-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                <p className="text-[10px] font-bold text-success-400 uppercase tracking-widest">{stat.sub}</p>
              </div>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
