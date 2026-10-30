import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { UploadCloud, FileText, CheckCircle, Loader2 } from 'lucide-react';
import FilePreview from '../shared/FilePreview';
import { REPORT_TYPES } from '../../utils/constants';
import { api, getErrorMessage } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const stages = ['Uploading file...', 'Scanning document...', 'Extracting metrics via OCR...', 'Categorizing report...', 'Complete!'];

export default function ReportUpload({ onSuccess, onError }) {
  const { currentUser } = useAuth();
  const [file, setFile] = useState(null);
  const [reportType, setReportType] = useState('blood_test');
  const [uploading, setUploading] = useState(false);
  const [stage, setStage] = useState(0);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState(null);

  const onDrop = useCallback((accepted) => {
    if (accepted.length) { setFile(accepted[0]); setResult(null); setProgress(0); }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, accept: { 'application/pdf': ['.pdf'], 'image/*': ['.png', '.jpg', '.jpeg'] }, maxFiles: 1,
  });

  const handleUpload = async () => {
    if (!file || !currentUser) return;
    setUploading(true); setStage(0); setResult(null); setProgress(0);
    const interval = setInterval(() => setStage((s) => Math.min(s + 1, 4)), 800);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('patientId', currentUser.uid); // Use actual Firebase UID
      fd.append('reportType', reportType);
      
      const res = await api.uploadReport(fd, (event) => {
        const pct = Math.round((event.loaded * 100) / event.total);
        setProgress(pct);
      });
      
      clearInterval(interval); setStage(4); setProgress(100);
      setResult(res.data.report || res.data);
      const msg = res.data.message || 'Report processed successfully';
      onSuccess?.(msg);
      // Trigger global refresh for medications
      window.dispatchEvent(new CustomEvent('refresh-meds'));
      setFile(null); // Clear form after success
    } catch (e) {
      clearInterval(interval);
      onError?.(getErrorMessage(e));
    } finally { setUploading(false); }
  };

  return (
    <div className="glass-morphism rounded-[2rem] p-8 border-white/[0.08] shadow-2xl relative overflow-hidden">
      <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-brand-500/5 rounded-full blur-[100px]" />
      <h3 className="text-sm font-black text-slate-500 uppercase tracking-[0.3em] mb-8 relative z-10">Upload Intelligence Data</h3>

      <motion.div 
        {...getRootProps()} 
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        animate={{ 
          scale: isDragActive ? 1.02 : 1,
          borderColor: isDragActive ? 'rgba(14, 165, 233, 0.5)' : 'rgba(255, 255, 255, 0.1)',
          backgroundColor: isDragActive ? 'rgba(14, 165, 233, 0.05)' : 'rgba(255, 255, 255, 0.02)'
        }}
        className="relative w-full h-48 flex flex-col items-center justify-center border-2 border-dashed rounded-3xl cursor-pointer transition-all duration-300 z-10 overflow-hidden"
      >
        <input {...getInputProps()} />
        <AnimatePresence mode="wait">
          {file ? (
            <motion.div 
              key="preview"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="w-full h-full"
            >
              <FilePreview file={file} />
            </motion.div>
          ) : (
            <motion.div 
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center"
            >
              <div className={`p-4 rounded-2xl mb-4 transition-colors ${isDragActive ? 'bg-brand-500/20 text-brand-400' : 'bg-slate-900 text-slate-500'}`}>
                <UploadCloud className="w-10 h-10" />
              </div>
              <p className="text-sm font-bold text-slate-300">Drag & drop clinical report, or click to browse</p>
              <p className="text-[10px] text-slate-500 mt-2 uppercase tracking-widest font-black">PDF, PNG, JPG up to 10MB</p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-8 relative z-10">
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Report Classification</label>
          <select 
            value={reportType} 
            onChange={(e) => setReportType(e.target.value)} 
            className="w-full bg-slate-900/50 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition-all font-semibold"
          >
            {REPORT_TYPES.map((r) => <option key={r.value} value={r.value} className="bg-slate-950">{r.label}</option>)}
          </select>
        </div>
        <div className="flex items-end">
          <button 
            onClick={handleUpload} 
            disabled={!file || uploading} 
            className="btn-primary w-full py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 group overflow-hidden relative"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-brand-400 to-brand-600 opacity-0 group-hover:opacity-100 transition-opacity" />
            <span className="relative z-10 flex items-center gap-2">
              {uploading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Analyzing Intelligence...</>
              ) : (
                <><UploadCloud className="w-4 h-4" /> Trigger Extraction</>
              )}
            </span>
          </button>
        </div>
      </div>

      <AnimatePresence>
        {uploading && progress > 0 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="mt-8 relative z-10">
            <div className="flex items-center justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 px-1">
              <span>Uplinking to Core Intelligence...</span>
              <span className="text-brand-400">{progress}%</span>
            </div>
            <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden border border-white/5 shadow-inner">
              <motion.div 
                className="h-full bg-gradient-to-r from-brand-500 to-brand-400 rounded-full shadow-[0_0_15px_rgba(14,165,233,0.4)]" 
                initial={{ width: 0 }} 
                animate={{ width: `${progress}%` }} 
                transition={{ duration: 0.5, ease: "circOut" }} 
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {uploading && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mt-8 space-y-3 overflow-hidden relative z-10 border-t border-white/5 pt-6">
            {stages.map((s, i) => (
              <div key={i} className={`flex items-center gap-4 text-xs font-bold uppercase tracking-wider transition-all duration-500 ${i <= stage ? 'text-brand-400 opacity-100' : 'text-slate-700 opacity-50'}`}>
                <div className={`w-5 h-5 rounded-lg flex items-center justify-center border transition-all ${
                  i < stage ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400' : 
                  i === stage ? 'bg-brand-500/20 border-brand-500/40 text-brand-400 shadow-[0_0_10px_rgba(14,165,233,0.3)]' : 
                  'bg-slate-900 border-slate-800 text-slate-600'
                }`}>
                  {i < stage ? <CheckCircle className="w-3.5 h-3.5" /> : i === stage ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <span className="text-[8px]">{i + 1}</span>}
                </div>
                {s}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {result && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }} 
            animate={{ opacity: 1, scale: 1, y: 0 }} 
            className="mt-8 p-6 bg-emerald-500/[0.03] border border-emerald-500/20 rounded-[2rem] relative overflow-hidden z-10"
          >
            <div className="absolute -right-8 -top-8 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl" />
            <div className="flex items-center gap-3 mb-6 relative z-10">
              <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-400">
                <CheckCircle className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Processing Complete</span>
                <p className="text-xs text-slate-300 font-bold mt-0.5 text-white">Intelligence Vector successfully extracted</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-[11px] relative z-10">
              <div className="p-3 bg-white/[0.03] rounded-xl border border-white/5">
                <span className="text-slate-500 uppercase font-black text-[9px] tracking-widest block mb-1">Vector ID:</span> 
                <span className="text-white font-mono break-all">{result.reportId}</span>
              </div>
              <div className="p-3 bg-white/[0.03] rounded-xl border border-white/5">
                <span className="text-slate-500 uppercase font-black text-[9px] tracking-widest block mb-1">Classification:</span> 
                <span className="px-1.5 py-0.5 rounded bg-brand-500/20 text-brand-400 font-black">{result.reportType || 'UNCATEGORIZED'}</span>
              </div>
              {result.extractedData && Object.entries(result.extractedData).map(([k, v]) => (
                <div key={k} className="p-3 bg-white/[0.03] rounded-xl border border-white/5 col-span-2 sm:col-span-1">
                  <span className="text-slate-500 uppercase font-black text-[9px] tracking-widest block mb-1">{k}:</span> 
                  <span className="text-white font-bold">{v}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
