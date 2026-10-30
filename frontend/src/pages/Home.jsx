import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Activity, UserCircle2, Stethoscope, ArrowRight, ShieldAlert, FileText, Lock, Zap, BarChart3 } from 'lucide-react';

function AnimatedCounter({ target, duration = 2000 }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true;
        let start = 0;
        const step = target / (duration / 16);
        const timer = setInterval(() => {
          start += step;
          if (start >= target) { setCount(target); clearInterval(timer); }
          else setCount(Math.floor(start));
        }, 16);
      }
    });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, duration]);

  return <span ref={ref}>{count.toLocaleString()}</span>;
}

const features = [
  { icon: FileText, title: 'Smart OCR Processing', desc: 'Upload PDFs and images — AI automatically extracts and categorizes medical data.' },
  { icon: Lock, title: 'Zero-Trust Security', desc: 'Granular OTP-based access control with full audit trails and emergency overrides.' },
  { icon: Zap, title: 'Real-Time Health Scores', desc: 'Rule-based health scoring engine with medication adherence monitoring.' },
  { icon: BarChart3, title: 'Clinical Intelligence', desc: 'AI-powered cross-report analysis with trend detection and anomaly flagging.' },
];

const stats = [
  { value: 12500, label: 'Patients Monitored', suffix: '+' },
  { value: 48000, label: 'Reports Processed', suffix: '+' },
  { value: 320, label: 'Doctors Connected', suffix: '' },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" }
  }
};

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#020617] overflow-hidden selection:bg-brand-500/30">
      {/* Hero */}
      <section className="relative min-h-screen flex items-center">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-brand-500/5 rounded-full blur-[120px]" />
          <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-brand-600/5 rounded-full blur-[100px]" />
          <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:32px_32px]" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 py-20 flex flex-col lg:flex-row items-center gap-16 w-full">
          <motion.div initial="hidden" animate="visible" variants={containerVariants} className="flex-1 max-w-2xl">
            <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-success-500/10 border border-success-500/20 mb-8">
              <div className="w-2 h-2 rounded-full bg-success-500 animate-pulse" />
              <span className="text-[10px] font-black text-success-400 tracking-[0.2em] uppercase">Autonomous Health Grid Active</span>
            </motion.div>

            <motion.h1 variants={itemVariants} className="text-5xl sm:text-6xl lg:text-7xl font-display font-black leading-[1.05] mb-6 tracking-tight">
              <span className="text-white">Decentralizing</span><br />
              <span className="text-gradient">Clinical Intelligence</span>
            </motion.h1>

            <motion.p variants={itemVariants} className="text-lg text-slate-400 leading-relaxed max-w-lg mb-10 font-medium">
              MedVault orchestrates 7 autonomous AI agents to manage your entire healthcare journey — from OCR-powered report extraction to emergency QR-based triage.
            </motion.p>

            <motion.div variants={itemVariants} className="flex flex-wrap gap-4">
              <Link to="/login/patient" className="btn-primary text-sm py-4 px-8 tracking-wide">
                <UserCircle2 className="w-5 h-5" /> Initialize Patient Portal
              </Link>
              <Link to="/login/doctor" className="btn-ghost glass-morphism text-sm py-4 px-8 border border-white/[0.08] tracking-wide">
                <Stethoscope className="w-5 h-5" /> Physician Access
              </Link>
            </motion.div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.4 }} className="flex-1 max-w-md w-full">
            <div className="glass-morphism p-8 space-y-4 rounded-3xl">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-4">Portal Entry Points</p>
              {[
                { icon: UserCircle2, title: "I'm a Patient", desc: 'Upload reports, track health, manage access', path: '/login/patient', color: 'text-brand-400', bg: 'bg-brand-500/10' },
                { icon: Stethoscope, title: "I'm a Doctor", desc: 'View patients, write prescriptions, analyze', path: '/login/doctor', color: 'text-success-400', bg: 'bg-success-500/10' },
              ].map((card) => (
                <Link 
                  key={card.path} 
                  to={card.path}
                  className="block group"
                >
                  <motion.div 
                    whileHover={{ y: -6, scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full flex items-center gap-5 p-5 bg-white/[0.02] border border-white/[0.06] rounded-2xl hover:bg-white/[0.04] hover:border-white/[0.12] transition-all text-left relative overflow-hidden"
                  >
                    <div className={`w-14 h-14 rounded-xl ${card.bg} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                      <card.icon className={`w-7 h-7 ${card.color}`} />
                    </div>
                    <div className="flex-1 relative z-10">
                      <p className="font-display font-bold text-white text-lg tracking-tight">{card.title}</p>
                      <p className="text-xs text-slate-500 mt-1 font-medium">{card.desc}</p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-slate-700 group-hover:text-white group-hover:translate-x-1 transition-all" />
                  </motion.div>
                </Link>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-20 border-y border-white/[0.04] bg-slate-900/20">
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={containerVariants}
          className="max-w-5xl mx-auto px-6 grid grid-cols-1 sm:grid-cols-3 gap-12 text-center"
        >
          {stats.map((s) => (
            <motion.div key={s.label} variants={itemVariants}>
              <p className="text-5xl font-black text-white tracking-tighter"><AnimatedCounter target={s.value} />{s.suffix}</p>
              <p className="text-[10px] text-brand-500 font-black uppercase tracking-[0.3em] mt-3">{s.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Features */}
      <section className="py-32 max-w-6xl mx-auto px-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          whileInView={{ opacity: 1, y: 0 }} 
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <h2 className="text-4xl font-display font-black text-white mb-4 tracking-tight">System Architecture</h2>
          <p className="text-slate-500 max-w-2xl mx-auto font-medium">A recursive clinical neural net working across 7 specialized domains to orchestrate biological telemetry.</p>
        </motion.div>

        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={containerVariants}
          className="grid grid-cols-1 sm:grid-cols-2 gap-8"
        >
          {features.map((f) => (
            <motion.div key={f.title} variants={itemVariants}
              className="glass-morphism p-8 group hover:bg-white/[0.04] smooth-transition rounded-3xl"
            >
              <div className="w-14 h-14 rounded-2xl bg-brand-500/5 flex items-center justify-center mb-6 border border-white/5 group-hover:bg-brand-500/10 transition-colors">
                <f.icon className="w-6 h-6 text-brand-400 group-hover:scale-110 transition-transform" />
              </div>
              <h3 className="text-xl font-display font-bold text-white mb-3 tracking-tight">{f.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed font-medium">{f.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Emergency CTA */}
      <section className="py-16 max-w-6xl mx-auto px-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="glass-morphism p-10 flex flex-col sm:flex-row items-center justify-between gap-8 border-danger-500/20 bg-danger-500/5 rounded-[2.5rem] relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-danger-500/5 blur-[80px] rounded-full" />
          <div className="flex items-center gap-6 relative z-10 text-center sm:text-left">
            <div className="p-5 bg-danger-500/10 rounded-2xl text-danger-400 animate-pulse">
              <ShieldAlert className="w-10 h-10" />
            </div>
            <div>
              <p className="text-2xl font-display font-black text-white tracking-tight">Emergency Protocol</p>
              <p className="text-sm text-slate-500 font-medium">Instant biometric triage entry via SHA-verified QR access.</p>
            </div>
          </div>
          <Link to="/emergency" className="btn-danger whitespace-nowrap px-8 py-4 relative z-10 hover:scale-105 active:scale-95 smooth-transition flex items-center justify-center">
             Triage Entry Point
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/[0.04] py-12 text-center bg-slate-950/40">
        <div className="flex flex-col items-center justify-center gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <span className="font-display font-black text-white tracking-tighter text-xl uppercase italic">Medi<span className="text-brand-400">Agent</span></span>
          </div>
          <p className="text-[9px] font-black text-slate-700 uppercase tracking-[0.4em]">Neural Clinical OS v2.0</p>
        </div>
      </footer>
    </div>
  );
}
