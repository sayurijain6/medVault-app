import React from 'react';
import { motion } from 'framer-motion';
import { FileText, Download, Eye } from 'lucide-react';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: "easeOut" }
  }
};

export default function ReportsList({ reports = [], loading }) {
  if (loading) {
    return (
      <div className="glass-morphism rounded-[2rem] p-8 border-white/[0.08]">
        <h3 className="text-sm font-black text-slate-500 uppercase tracking-[0.3em] mb-8">Clinical Archives</h3>
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-24 bg-white/[0.03] rounded-2xl animate-pulse border border-white/[0.05]" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="glass-morphism rounded-[2rem] p-8 border-white/[0.08] shadow-2xl relative overflow-hidden">
      <div className="absolute -right-20 -top-20 w-64 h-64 bg-brand-500/5 rounded-full blur-[100px]" />
      <h3 className="text-sm font-black text-slate-500 uppercase tracking-[0.3em] mb-8 relative z-10">Clinical Archives</h3>
      
      {reports.length === 0 ? (
        <div className="text-center py-20 text-slate-500 relative z-10">
          <div className="w-16 h-16 bg-slate-900 border border-white/5 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl">
            <FileText className="w-8 h-8 opacity-20" />
          </div>
          <p className="font-bold text-slate-300">No Intelligence Records</p>
          <p className="text-xs mt-2 uppercase tracking-widest opacity-50 font-black">Awaiting data extraction</p>
        </div>
      ) : (
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-4 relative z-10"
        >
          {reports.map((r, i) => (
            <motion.div 
              key={r.reportId || i} 
              variants={itemVariants}
              whileHover={{ y: -4, backgroundColor: 'rgba(255,255,255,0.04)' }}
              className="flex items-center justify-between p-5 bg-white/[0.02] border border-white/[0.06] rounded-2xl smooth-transition group hover:border-brand-500/30 hover:shadow-[0_8px_30px_rgb(0,0,0,0.2)]"
            >
              <div className="flex items-center gap-5">
                <div className="w-12 h-12 rounded-2xl bg-brand-500/10 flex items-center justify-center transition-transform group-hover:scale-110 shadow-lg">
                  <FileText className="w-6 h-6 text-brand-400" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-black text-white tracking-tight">{r.filename || 'Untitled Intelligence Analysis'}</p>
                  <div className="flex items-center gap-3">
                    <span className="px-2 py-0.5 rounded-md bg-brand-500/10 text-[9px] font-black text-brand-400 uppercase tracking-widest border border-brand-500/20">
                      {r.reportType || 'vector_data'}
                    </span>
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">
                      {r.processedDate ? new Date(r.processedDate).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }) : 'Pending Timestamp'}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                {r.fileUrl && r.fileUrl !== 'mock_url_since_firebase_not_configured' && (
                  <motion.a 
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    href={r.fileUrl} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="p-3 bg-white/5 hover:bg-white/10 rounded-xl text-slate-400 hover:text-brand-400 border border-white/5 transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                  </motion.a>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
