import React from 'react';
import { motion } from 'framer-motion';
import { GaugeChart, TrendLineChart } from '../shared/Chart';
import { MOCK_HEALTH_TREND } from '../../utils/constants';
import { TrendingUp, Zap, Heart, ShieldCheck } from 'lucide-react';
import LoadingSpinner from '../shared/LoadingSpinner';

const getCategory = (s) => s >= 80 ? { label: 'HEALTHY', color: 'text-success-400', bg: 'bg-success-500/10' } :
  s >= 60 ? { label: 'MONITOR', color: 'text-warning-400', bg: 'bg-warning-500/10' } :
  s >= 40 ? { label: 'ATTENTION', color: 'text-orange-400', bg: 'bg-orange-500/10' } :
  { label: 'CRITICAL', color: 'text-danger-400', bg: 'bg-danger-500/10' };

const recommendations = {
  HEALTHY: 'Maintain your current lifestyle. Continue regular checkups.',
  MONITOR: 'Some metrics need attention. Review medication adherence.',
  ATTENTION: 'Schedule a consultation with your doctor soon.',
  CRITICAL: 'Seek immediate medical attention. Contact your physician.',
};

import DiseaseProgressTracker from './DiseaseProgressTracker';

// ... (previous helper functions and recommendations)

export default function HealthScoreCard({ score = 0, factors = [], summary = null, loading = false }) {
  const cat = getCategory(score);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="glass-morphism p-6 md:p-8 relative overflow-hidden h-full flex flex-col font-sans border-white/[0.08] shadow-2xl group smooth-transition min-w-0"
    >
      {/* Dynamic Background Glows */}
      <div className={`absolute -right-20 -top-20 w-80 h-80 rounded-full blur-[120px] opacity-20 animate-pulse smooth-transition ${cat.bg.replace('/10', '/30')}`} />
      <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-brand-500/5 rounded-full blur-[100px]" />
      
      <div className="flex items-center justify-between mb-10 relative z-10">
        <div className="space-y-1">
          <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">Core Vital Matrix</h3>
          <p className="text-[9px] text-slate-600 font-bold uppercase tracking-widest">Biometric Integrity Analysis</p>
        </div>
        <div className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-lg ring-1 transition-all duration-500 ${cat.bg} ${cat.color} ${cat.color.replace('text-', 'ring-')}/30`}>
          {cat.label}
        </div>
      </div>

      <div className="flex flex-col md:flex-row items-center gap-8 mb-10 relative z-10">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }} 
          animate={{ opacity: 1, scale: 1 }} 
          transition={{ type: 'spring', stiffness: 100, damping: 15, delay: 0.2 }}
          className="relative group/gauge"
        >
          <div className={`absolute inset-0 rounded-full blur-3xl opacity-20 group-hover/gauge:opacity-40 transition-opacity duration-700 ${cat.bg.replace('/10', '/40')}`} />
          <GaugeChart value={score} size={220} />
        </motion.div>

        <div className="flex-1 space-y-6 w-full min-w-0 overflow-hidden">
          <div className="flex flex-wrap gap-2.5">
            {factors.map((f, i) => (
              <span key={i} className="px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:border-brand-500/40 hover:bg-white/[0.06] hover:text-slate-200 transition-all cursor-default">
                {f}
              </span>
            ))}
          </div>

          <div className="p-5 bg-brand-500/[0.03] rounded-2xl border border-brand-500/10 backdrop-blur-2xl hover:bg-white/[0.05] hover:border-brand-500/20 transition-all group/ai relative overflow-hidden">
            <div className={`absolute top-0 left-0 w-1.5 h-full transition-colors duration-500 ${cat.color.replace('text-', 'bg-')}/40`} />
            <div className="flex items-center gap-3 mb-3 px-1">
              <div className="p-1.5 rounded-lg bg-brand-500/10 text-brand-400">
                <Zap className="w-4 h-4" />
              </div>
              <span className="text-[11px] font-black text-brand-400 uppercase tracking-[0.25em]">Neural Recommendation</span>
            </div>
            <p className="text-[13px] text-slate-300 leading-relaxed font-semibold pl-1">
              {recommendations[cat.label]}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-auto pt-8 border-t border-white/[0.06] relative z-10">
        {loading ? (
          <div className="h-48 flex items-center justify-center">
            <LoadingSpinner />
          </div>
        ) : (
          <div className="space-y-5">
             <div className="flex items-center justify-between text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] px-1">
               <span>Biological Trajectory</span>
               <div className="flex h-5 w-5 items-center justify-center rounded-lg bg-slate-900 border border-white/5">
                <TrendingUp className="w-3.5 h-3.5" />
               </div>
             </div>
             <DiseaseProgressTracker tracker={summary?.condition_tracker} />
          </div>
        )}
      </div>
    </motion.div>
  );
}


