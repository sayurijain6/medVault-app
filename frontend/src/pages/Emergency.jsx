import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Activity, ArrowLeft, Droplets, Phone, FileText, Download, Loader2 } from 'lucide-react';
import { api } from '../services/api';
import AlertBanner from '../components/shared/AlertBanner';

export default function Emergency() {
  const [qrData, setQrData] = useState('');
  const [loading, setLoading] = useState(false);
  const [criticalInfo, setCriticalInfo] = useState(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const navigate = useNavigate();

  // Auto-scan if PID is in URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const pid = params.get('pid');
    if (pid) {
      handleAutoScan(pid);
    }
  }, []);

  const handleAutoScan = async (pid) => {
    setLoading(true);
    try {
      const infoRes = await api.getCriticalInfo(pid);
      setCriticalInfo(infoRes.data);
    } catch (err) {
      setToast({ message: 'Emergency access override failed', type: 'error' });
    }
    setLoading(false);
  };

  const handleScan = async (e) => {
    e.preventDefault();
    handleAutoScan(qrData);
  };

  const downloadPDF = async () => {
    setPdfLoading(true);
    try {
      const response = await api.apiClient.get(`/api/emergency/download-summary/${criticalInfo.patientId}`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `emergency_summary_${criticalInfo.patientId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch {
      setToast({ message: 'Failed to generate medical dossier', type: 'error' });
    } finally {
      setPdfLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080808] text-white selection:bg-danger-500/30">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <button onClick={() => navigate('/')} className="flex items-center gap-2 text-slate-500 hover:text-white text-sm font-bold uppercase tracking-widest transition-colors">
            <ArrowLeft className="w-4 h-4" /> Terminate Session
          </button>
          <span className="animate-pulse bg-danger-500 text-white text-[10px] uppercase font-bold tracking-widest px-2.5 py-1 rounded-full">Secure Override Active</span>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-black border border-danger-500/30 rounded-2xl p-8 md:p-12 text-center mb-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-danger-500 to-transparent animate-pulse" />
          <AlertTriangle className="w-16 h-16 text-danger-500 mx-auto mb-4 drop-shadow-[0_0_15px_rgba(239,68,68,0.4)]" />
          <h1 className="text-3xl md:text-5xl font-display font-extrabold mb-2 tracking-tight">EMERGENCY ACCESS</h1>
          <p className="text-danger-400/80 text-sm font-semibold uppercase tracking-[0.3em]">Critical Responder Override Protocol</p>
        </motion.div>

        <AnimatePresence mode="wait">
          {!criticalInfo ? (
            <motion.form key="form" onSubmit={handleScan} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              className="bg-black/80 border border-white/[0.08] rounded-2xl p-8">
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Input Decrypted QR Payload</label>
              <textarea value={qrData} onChange={e => setQrData(e.target.value)} className="w-full h-32 bg-white/[0.03] border border-white/[0.08] rounded-xl p-5 font-mono text-sm text-slate-300 focus:border-danger-500 focus:outline-none focus:ring-1 focus:ring-danger-500 resize-none placeholder-slate-700 transition-all" placeholder="eyJhbGciOiJIUzI1NiIsInR..." required />
              <button type="submit" disabled={loading} className="w-full mt-6 bg-danger-500 hover:bg-danger-600 disabled:opacity-50 text-white font-display font-bold uppercase tracking-widest py-5 rounded-xl transition-all shadow-lg shadow-danger-500/20 active:scale-[0.98]">
                {loading ? 'ANALYZING BYPASS...' : 'OVERRIDE & ACCESS Dossier'}
              </button>
            </motion.form>
          ) : (
            <motion.div key="info" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6">
              <div className="bg-black border border-danger-500 rounded-2xl p-8 md:p-12 relative shadow-[0_0_50px_rgba(239,68,68,0.1)]">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-danger-500 text-white text-xs font-bold uppercase tracking-widest px-4 py-1 rounded-full shadow-lg">Authorized Read</div>

                <h2 className="text-xs font-bold text-danger-400 uppercase tracking-[0.3em] mb-10 flex items-center gap-3 border-b border-danger-500/20 pb-6">
                  <Activity className="w-5 h-5 animate-pulse" /> Critical Medical Dossier: {criticalInfo.displayName}
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="bg-white/[0.02] p-8 rounded-2xl border border-white/[0.06] shadow-inner">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Biometric Blood Type</p>
                    <div className="flex items-center gap-4">
                      <Droplets className="w-10 h-10 text-danger-400" />
                      <p className="text-6xl font-display font-black text-white">{criticalInfo.bloodType || 'O+'}</p>
                    </div>
                  </div>
                  <div className="bg-white/[0.02] p-8 rounded-2xl border border-white/[0.06] shadow-inner">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Severe Allergies</p>
                    <div className="flex flex-wrap gap-2">
                      {criticalInfo.allergies?.length > 0 ? (
                        criticalInfo.allergies.map(a => <span key={a} className="px-4 py-2 bg-danger-500/10 border border-danger-500/20 text-danger-400 rounded-xl text-sm font-bold uppercase tracking-wider">{a}</span>)
                      ) : <span className="text-slate-500 font-medium">No recorded allergies</span>}
                    </div>
                  </div>
                  <div className="md:col-span-2 bg-white/[0.02] p-8 rounded-2xl border border-white/[0.06] shadow-inner">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Active Chronic Conditions</p>
                    <div className="space-y-4">
                      {criticalInfo.chronicConditions?.length > 0 ? (
                        criticalInfo.chronicConditions.map(c => (
                          <div key={c} className="flex items-center gap-4 text-xl md:text-2xl font-bold text-white">
                            <div className="w-2.5 h-2.5 rounded-full bg-danger-500 animate-pulse" /> {c}
                          </div>
                        ))
                      ) : <span className="text-slate-500 font-medium italic">No chronic conditions listed</span>}
                    </div>
                  </div>

                  <div className="md:col-span-2 bg-white/[0.02] p-8 rounded-2xl border border-white/[0.06] shadow-inner">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Emergency Contact Protocol</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {criticalInfo.emergencyContacts?.length > 0 ? (
                        criticalInfo.emergencyContacts.map((contact, idx) => (
                          <div key={idx} className="flex items-center justify-between p-4 bg-brand-500/5 border border-brand-500/10 rounded-xl">
                            <div className="flex flex-col">
                              <span className="text-white font-bold">{contact.name}</span>
                              <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">{contact.relation}</span>
                            </div>
                            <a href={`tel:${contact.phone}`} className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white px-4 py-2 rounded-lg text-sm font-bold transition-all active:scale-95 shadow-lg shadow-brand-500/20">
                              <Phone className="w-4 h-4" /> {contact.phone}
                            </a>
                          </div>
                        ))
                      ) : <span className="text-slate-500 font-medium italic">No emergency contacts registered</span>}
                    </div>
                  </div>
                </div>

                <div className="mt-12 pt-8 border-t border-danger-500/10 flex flex-col items-center gap-6">
                  <button 
                    onClick={downloadPDF} 
                    disabled={pdfLoading}
                    className="flex items-center gap-3 bg-white/5 hover:bg-white/10 text-white px-8 py-4 rounded-xl border border-white/10 transition-all font-bold uppercase tracking-widest text-xs"
                  >
                    {pdfLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                    {pdfLoading ? "Compiling Dossier..." : "Generate & Download Official PDF Summary"}
                  </button>
                  <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest bg-danger-500/5 px-4 py-2 rounded-full border border-danger-500/10 animate-pulse">
                    Session expires in: 23:59:59
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {toast && <AlertBanner message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
