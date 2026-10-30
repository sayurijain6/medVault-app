import React, { useState, useEffect } from 'react';
import { Bell, X, AlertTriangle, ShieldCheck, Mail } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);

  // Mock listener for system events (in a real app, this would be a Context or WebSockets)
  useEffect(() => {
    const handleNotification = (e) => {
      const newNotif = {
        id: Date.now(),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        ...e.detail
      };
      setNotifications(prev => [newNotif, ...prev].slice(0, 10));
    };

    window.addEventListener('app-notification', handleNotification);

    // Periodic System Heartbeat (Every 2 Minutes as requested)
    const heartbeatInterval = setInterval(() => {
      notify({
        type: 'system',
        category: 'Heartbeat',
        title: 'Neural System Pulse',
        message: 'Clinical monitoring nodes are synchronized. All vitals are within normal range.'
      });
    }, 300000);

    return () => {
      window.removeEventListener('app-notification', handleNotification);
      clearInterval(heartbeatInterval);
    };
  }, []);

  const unreadCount = notifications.length;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative rounded-full bg-slate-900 p-2 text-slate-400 border border-slate-800 transition-all hover:bg-slate-800 hover:text-slate-100"
      >
        <Bell className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-[0_0_10px_rgba(244,63,94,0.5)]">
            {unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[1px]"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -20 }}
              transition={{ type: "spring", damping: 20, stiffness: 300 }}
              className="absolute right-0 z-50 mt-5 w-80 sm:w-[420px] origin-top-right rounded-[2.5rem] border border-white/[0.1] bg-slate-950/95 p-1 shadow-[0_20px_50px_rgba(0,0,0,0.6)] backdrop-blur-3xl"
            >
              {/* Pointing Arrow (Caret) */}
              <div className="absolute -top-1.5 right-[14px] w-3 h-3 bg-slate-950 border-l border-t border-white/[0.1] rotate-45 z-[1]" />

              <div className="flex items-center justify-between p-6 border-b border-white/[0.05]">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs font-black text-white uppercase tracking-[0.2em]">Clinical Alerts</h3>
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
                  </div>
                  <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-1">Neural Node Monitoring</p>
                </div>
                <button 
                  onClick={() => {
                    setNotifications([]);
                    setIsOpen(false);
                  }}
                  className="px-4 py-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] text-[9px] font-black text-slate-400 hover:text-white uppercase tracking-widest transition-all border border-white/[0.05] hover:border-white/10"
                >
                  Flush Buffer
                </button>
              </div>

              <div className="max-h-[460px] overflow-y-auto p-4 scrollbar-none space-y-4">
                {notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="w-20 h-20 rounded-[2.5rem] bg-emerald-500/[0.02] flex items-center justify-center mb-6 border border-emerald-500/10 relative">
                      <div className="absolute inset-0 rounded-[2.5rem] bg-emerald-500/5 blur-xl animate-pulse" />
                      <ShieldCheck className="h-10 w-10 text-emerald-500/30 relative z-10" />
                    </div>
                    <p className="text-[11px] font-black text-white uppercase tracking-[0.25em]">Neural Path Secure</p>
                    <p className="text-[9px] text-slate-600 font-bold uppercase tracking-widest mt-2 leading-relaxed">No active anomalies detected in current cycle</p>
                  </div>
                ) : (
                  notifications.map((notif, i) => (
                    <motion.div 
                      key={notif.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className={`group relative flex items-start gap-4 rounded-[1.8rem] p-5 transition-all duration-500 border ${
                        notif.type === 'critical' 
                          ? 'bg-rose-500/[0.03] border-rose-500/20 hover:bg-rose-500/[0.06] hover:border-rose-500/40' 
                          : 'bg-white/[0.01] border-white/[0.05] hover:bg-white/[0.03] hover:border-white/20'
                      } ${notif.type === 'critical' ? 'shadow-[0_0_40px_rgba(244,63,94,0.05)]' : ''}`}
                    >
                      <div className={`mt-0.5 rounded-2xl p-3 transition-all duration-500 ${
                        notif.type === 'critical' ? 'bg-rose-500/20 text-rose-400 shadow-[0_0_20px_rgba(244,63,94,0.2)]' : 'bg-slate-800/40 text-slate-500 group-hover:text-brand-400'
                      }`}>
                        {notif.type === 'critical' ? <AlertTriangle className="h-5 w-5" /> : <Mail className="h-5 w-5" />}
                      </div>
                      <div className="flex-1 min-w-0 pt-0.5">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em]">{notif.time}</span>
                          <span className={`text-[8px] font-black uppercase tracking-[0.2em] px-2.5 py-1 rounded-lg border ${
                             notif.type === 'critical' ? 'text-rose-400 border-rose-500/20 bg-rose-500/10' : 'text-slate-500 border-white/10 bg-white/5'
                          }`}>
                            {notif.category || 'System'}
                          </span>
                        </div>
                        <h4 className="text-[14px] font-black text-white tracking-tight leading-snug mb-1.5 group-hover:text-brand-400 transition-colors uppercase">{notif.title}</h4>
                        <p className="text-[11px] text-slate-400 leading-relaxed font-medium opacity-70 group-hover:opacity-100 transition-opacity">{notif.message}</p>
                      </div>
                      
                      {/* Interactive Hover Glow */}
                      <div className={`absolute inset-0 rounded-[1.8rem] opacity-0 group-hover:opacity-10 pointer-events-none transition-opacity duration-500 ${
                        notif.type === 'critical' ? 'bg-rose-500' : 'bg-brand-500'
                      }`} />
                    </motion.div>
                  ))
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// Utility to trigger notifications globally
export const notify = (data) => {
  window.dispatchEvent(new CustomEvent('app-notification', { detail: data }));
};
