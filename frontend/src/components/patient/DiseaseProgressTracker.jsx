import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus, Calendar, Activity, CheckCircle2, AlertCircle } from 'lucide-react';

export default function DiseaseProgressTracker({ tracker }) {
  if (!tracker) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-white/[0.02] rounded-xl border border-dashed border-white/10 p-8 text-center">
        <Activity className="w-10 h-10 text-slate-600 mb-3" />
        <h5 className="text-sm font-bold text-slate-400 mb-1">Awaiting Comparative Data</h5>
        <p className="text-xs text-slate-500 leading-relaxed">
          Upload at least two lab reports with different dates to enable medical progress tracking.
        </p>
      </div>
    );
  }

  const isBetter = tracker.status === 'Improving';
  const isWorse = tracker.status === 'Declining';

  const StatusIcon = isBetter ? TrendingDown : isWorse ? TrendingUp : Minus;
  const statusColor = isBetter ? 'text-success-400' : isWorse ? 'text-danger-400' : 'text-warning-400';
  const bgColor = isBetter ? 'bg-success-500/10' : isWorse ? 'bg-danger-500/10' : 'bg-warning-500/10';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-bold text-white tracking-wide">{tracker.conditionName} Progress</h4>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Focus Metric: {tracker.metricName}</p>
        </div>
        <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full ${bgColor} ${statusColor} border border-current/20`}>
          <StatusIcon className="w-3.5 h-3.5" />
          <span className="text-[10px] font-black uppercase tracking-wider">{tracker.status}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Previous State */}
        <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-2 opacity-5 scale-150 rotate-12 transition-transform group-hover:scale-[1.7]">
            <Calendar className="w-12 h-12" />
          </div>
          <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">Previous Result</p>
          <div className="text-xl font-display font-black text-slate-400">{tracker.previousValue || 'N/A'}</div>
          {tracker.previousDate && (
            <p className="text-[10px] text-slate-500 mt-1 italic">{tracker.previousDate}</p>
          )}
        </div>

        {/* Latest State */}
        <div className="p-4 rounded-xl bg-brand-500/5 border border-brand-500/20 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-2 opacity-5 scale-150 -rotate-12 transition-transform group-hover:scale-[1.7]">
            <CheckCircle2 className="w-12 h-12 text-brand-400" />
          </div>
          <p className="text-[9px] font-bold text-brand-400/70 uppercase tracking-widest mb-1">Latest Status</p>
          <div className="text-xl font-display font-black text-white">{tracker.latestValue}</div>
          <div className="flex items-center gap-1 text-[10px] text-brand-400 mt-1 font-bold">
            <Activity className="w-3 h-3" />
            <span>Most Recent Lab</span>
          </div>
        </div>
      </div>

      <div className="p-4 rounded-xl bg-slate-900/50 border border-white/[0.05] flex gap-3">
        <div className={`mt-0.5 ${statusColor}`}>
          <AlertCircle className="w-4 h-4" />
        </div>
        <div>
          <h5 className="text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">Clinical Assessment</h5>
          <p className="text-xs text-slate-400 leading-relaxed font-medium">
            {tracker.assessment}
          </p>
        </div>
      </div>
    </div>
  );
}
