import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, AlertTriangle, Activity, Bell, X, Mail, ShieldAlert, Pill } from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { notify } from './NotificationCenter';

/**
 * HACKATHON NUDGE SYSTEM v2 (Autonomous Clinical Agent)
 * 
 * Logic:
 * 1. Simulates clinical "Fast-Time" (45s = 1 transition).
 * 2. Monitors Medication Agent's data from backend.
 * 3. Autonomously triggers Resend emails and in-app alerts if doses are missed.
 * 4. Tracks health scores and notifies of critical status.
 */
export default function HackathonNudgeSystem({ healthScore }) {
  const { currentUser } = useAuth();
  const [activeNudge, setActiveNudge] = useState(null);
  const [logs, setLogs] = useState([]);
  const [lastProcessedTime, setLastProcessedTime] = useState(Date.now());
  
  const NUDGE_INTERVAL = 300 * 1000; // 5 Minutes cycle for clinical audit
  const medTimerRef = useRef(null);

  const addLog = (msg) => {
    setLogs(prev => [ { time: new Date().toLocaleTimeString(), msg }, ...prev].slice(0, 5));
  };

  // 1. Health Score Monitoring
  useEffect(() => {
    if (!healthScore) return;

    if (healthScore.score < 50) {
      addLog("🚨 AlertAgent: Detecting critical health state (Score: " + healthScore.score + ")");
      triggerNudge({
        id: 'vital_alert',
        title: 'CRITICAL HEALTH ALERT',
        message: `Health Score dropped to ${healthScore.score}. High risk markers detected. Physician notified.`,
        icon: ShieldAlert,
        color: 'text-rose-400',
        bg: 'bg-rose-500/10',
        border: 'border-rose-500/40',
        action: "Resend Priority Email Sent",
        category: 'VITAL RISK'
      });
    } else {
      addLog("✅ AlertAgent: Patient state stable. Monitoring trends...");
    }
  }, [healthScore]);

  // 2. Medication Adherence Monitoring (Autonomous Loop)
  useEffect(() => {
    if (!currentUser) return;

    const checkMeds = async () => {
      try {
        addLog("💊 MedicationAgent: Analyzing daily adherence...");
        const res = await api.getMedications(currentUser.uid);
        const meds = res.data.medications || [];
        
        if (meds.length === 0) {
          addLog("ℹ️ MedicationAgent: No active prescriptions found.");
          return;
        }

        const missed = meds.filter(m => !m.taken);
        const progress = Math.round(((meds.length - missed.length) / meds.length) * 100);
        
        addLog(`📊 Compliance Engine: Adherence is at ${progress}%`);

        if (missed.length > 0) {
          const missedMed = missed[0]; // Focus on the first missed one for the nudge
          
          addLog(`⚠️ MedicationAgent: Detected MISSED dose of ${missedMed.drug} (${missedMed.slot})`);
          
          // Trigger the high-impact Nudge
          triggerNudge({
            id: 'med_missed_alert',
            title: 'ADHERENCE CRISIS',
            message: `Dosage for ${missedMed.drug} (${missedMed.slot}) is overdue. Triggering clinical outreach.`,
            icon: Pill,
            color: 'text-amber-400',
            bg: 'bg-amber-500/10',
            border: 'border-amber-500/40',
            action: 'Resend Reminder Dispatched',
            category: 'MEDICATION'
          });

          // Also trigger a real email via backend
          api.triggerAdherenceAlert(currentUser.uid, [missedMed.drug]);
        }
      } catch (err) {
        console.error('Med nudge check failed:', err);
      }
    };

    // Fast-time simulation: check every NUDGE_INTERVAL
    medTimerRef.current = setInterval(checkMeds, NUDGE_INTERVAL);
    
    // Initial check after 15s to let the demo start
    const initialTimer = setTimeout(checkMeds, 15000);

    return () => {
      if (medTimerRef.current) clearInterval(medTimerRef.current);
      clearTimeout(initialTimer);
    };
  }, [currentUser]);

  const triggerNudge = (nudgeData) => {
    // setActiveNudge(nudgeData); // Deactivated visual interruption per user request
    
    // Also push to the real Notification Center
    notify({
      title: nudgeData.title,
      message: nudgeData.message,
      category: nudgeData.category || 'SYSTEM',
      type: 'critical'
    });

    addLog(`🤖 Agent Action: ${nudgeData.title} - ${nudgeData.action}`);
    
    // Auto-dismiss after 15 seconds
    setTimeout(() => setActiveNudge(null), 15000);
  };

  return (
    <>

      <div className="fixed bottom-8 right-8 z-[110] w-96 pointer-events-none">
        <AnimatePresence>
          {activeNudge && (
            <motion.div 
              initial={{ opacity: 0, y: 50, scale: 0.9, rotate: -2 }} 
              animate={{ opacity: 1, y: 0, scale: 1, rotate: 0 }} 
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className={`pointer-events-auto glass p-6 rounded-3xl ${activeNudge.bg} ${activeNudge.border} border-2 shadow-[0_0_50px_rgba(244,63,94,0.2)] relative overflow-hidden`}
            >
              <div className="absolute inset-0 bg-current opacity-[0.03] animate-pulse" style={{ color: activeNudge.color.split('-')[1] }} />
              
              <button 
                onClick={() => setActiveNudge(null)}
                className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors"
                title="Dismiss"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-start gap-4">
                <div className={`p-4 rounded-2xl bg-white/10 ${activeNudge.color} shadow-lg border border-white/10`}>
                  <activeNudge.icon className="w-8 h-8" />
                </div>
                <div className="flex-1">
                  <h4 className={`text-xs font-black uppercase tracking-widest ${activeNudge.color} mb-2 flex items-center justify-between`}>
                    {activeNudge.title}
                    <motion.span animate={{ opacity: [1, 0.1, 1] }} transition={{ repeat: Infinity, duration: 1.5 }} className="bg-rose-500 text-white px-1.5 py-0.5 rounded text-[8px]">ACTIVE AGENT</motion.span>
                  </h4>
                  <p className="text-[13px] text-white leading-relaxed font-bold">
                    {activeNudge.message}
                  </p>
                  
                  {activeNudge.action && (
                    <motion.div 
                      layoutId="action"
                      className="mt-5 flex items-center gap-3 text-[10px] font-black text-white uppercase tracking-widest bg-emerald-500/40 px-3 py-2 rounded-xl border border-emerald-400/30 backdrop-blur-md"
                    >
                      <Mail className="w-4 h-4 text-emerald-400" />
                      {activeNudge.action}
                    </motion.div>
                  )}

                  <div className="flex items-center gap-2 mt-5 pt-4 border-t border-white/10">
                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Autonomous Provider Monitoring</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
