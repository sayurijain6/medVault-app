import React from 'react';
import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';

export default function IntelligenceBanner({ summary }) {
  if (!summary) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative overflow-hidden rounded-[2.5rem] border border-white/[0.08] bg-gradient-to-br from-brand-600/20 via-slate-900/40 to-slate-950 p-8 shadow-2xl backdrop-blur-3xl glass-morphism"
    >
      {/* Animated Background Highlights */}
      <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-brand-500/10 blur-[100px] animate-pulse pointer-events-none" />
      <div className="absolute -right-20 -bottom-20 h-64 w-64 rounded-full bg-indigo-500/10 blur-[100px] animate-pulse pointer-events-none" />
      
      <div className="relative z-10 flex flex-col xl:flex-row xl:items-center justify-between gap-10">
        <div className="flex-1">
          <div className="flex items-center gap-4 mb-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 border border-white/10 backdrop-blur-md shadow-lg">
              <Zap className="w-6 h-6 text-brand-400" />
            </div>
            <div>
              <h4 className="text-[11px] font-black text-brand-400 uppercase tracking-[0.3em]">Neural Intelligence Analysis</h4>
              <p className="text-[9px] text-slate-500 font-bold uppercase tracking-[0.2em] opacity-60">Comparative Logic Engine v4.2</p>
            </div>
          </div>
          <p className="text-xl md:text-2xl font-bold text-white leading-tight drop-shadow-sm italic max-w-2xl">
            "{summary.summary}"
          </p>
        </div>

        {summary.condition_tracker && (
          <div className="min-w-[340px] rounded-[2rem] border border-white/10 bg-black/40 p-7 backdrop-blur-2xl shadow-xl group hover:border-brand-500/30 transition-colors">
            <div className="flex items-center justify-between mb-6">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em]">
                {summary.condition_tracker.conditionName} Progress
              </span>
              <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ring-1 transition-all group-hover:ring-offset-2 group-hover:ring-offset-black ${
                summary.condition_tracker.status === 'Improving' ? 'bg-emerald-500/10 text-emerald-400 ring-emerald-500/20' : 
                summary.condition_tracker.status === 'Stable' ? 'bg-amber-500/10 text-amber-400 ring-amber-500/20' : 
                'bg-rose-500/10 text-rose-400 ring-rose-500/20'
              }`}>
                {summary.condition_tracker.status}
              </span>
            </div>
            
            <div className="flex items-center gap-8 mb-6">
              <div className="space-y-1">
                <div className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Latest Vector</div>
                <div className="text-2xl font-black text-white">{summary.condition_tracker.latestValue}</div>
              </div>
              <div className="h-10 w-px bg-white/10" />
              <div className="space-y-1">
                <div className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Baseline</div>
                <div className="text-xl font-bold text-slate-400">{summary.condition_tracker.previousValue}</div>
              </div>
            </div>
            
            <p className="text-[11px] text-slate-400 leading-relaxed font-medium bg-white/[0.03] p-4 rounded-xl border border-white/5">
              {summary.condition_tracker.assessment}
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
