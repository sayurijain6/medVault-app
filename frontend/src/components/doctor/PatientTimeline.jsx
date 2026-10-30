import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Pill, Stethoscope, AlertTriangle, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import { MOCK_TIMELINE } from '../../utils/constants';

const iconMap = { FileText, Pill, Stethoscope, AlertTriangle };
const typeColors = {
  report: 'bg-brand-500/10 text-brand-400 border-brand-500/30',
  prescription: 'bg-success-500/10 text-success-400 border-success-500/30',
  visit: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
  alert: 'bg-danger-500/10 text-danger-400 border-danger-500/30',
};

export default function PatientTimeline() {
  const [filter, setFilter] = useState('all');
  const [expanded, setExpanded] = useState(null);
  const filters = ['all', 'report', 'prescription', 'visit', 'alert'];
  const filtered = filter === 'all' ? MOCK_TIMELINE : MOCK_TIMELINE.filter(e => e.type === filter);

  return (
    <div className="glass-card p-6">
      <h3 className="section-title">Patient Timeline</h3>
      <div className="flex gap-2 mb-6 flex-wrap">
        {filters.map(f => (
          <button key={f} onClick={() => setFilter(f)} className={`text-xs font-semibold capitalize px-3 py-1.5 rounded-lg transition-all ${filter === f ? 'bg-brand-500/15 text-brand-400 border border-brand-500/20' : 'text-slate-500 hover:text-slate-300 hover:bg-white/[0.04]'}`}>
            {f}
          </button>
        ))}
      </div>

      <div className="relative pl-8">
        <div className="absolute left-3 top-0 bottom-0 w-px bg-white/[0.08]" />
        {filtered.map((event, i) => {
          const Icon = iconMap[event.icon] || FileText;
          const isExpanded = expanded === event.id;
          return (
            <motion.div key={event.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
              className="relative pb-6 last:pb-0">
              <div className={`absolute left-[-22px] w-7 h-7 rounded-full flex items-center justify-center border ${typeColors[event.type]}`} style={{ top: '2px' }}>
                <Icon className="w-3.5 h-3.5" />
              </div>
              <button onClick={() => setExpanded(isExpanded ? null : event.id)} className="w-full text-left p-4 bg-white/[0.02] border border-white/[0.06] rounded-xl hover:bg-white/[0.04] transition-colors">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs text-slate-500 font-semibold mb-1">{event.date}</p>
                    <p className="text-sm font-semibold text-white">{event.title}</p>
                    <p className="text-xs text-slate-400 mt-1">{event.summary}</p>
                  </div>
                  {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
                </div>
                {isExpanded && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="mt-4 pt-4 border-t border-white/[0.06]">
                    <div className="flex items-center gap-2 text-xs mb-2">
                      <Sparkles className="w-3.5 h-3.5 text-brand-400" />
                      <span className="text-brand-400 font-bold uppercase tracking-wider">AI Insight</span>
                    </div>
                    <p className="text-sm text-slate-300">Values within expected clinical range. No significant deviations from prior baselines detected. Continue current treatment protocol.</p>
                  </motion.div>
                )}
              </button>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
