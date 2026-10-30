import React from 'react';
import { useNavigate } from 'react-router-dom';
import { UserCircle2, Stethoscope, ArrowRight, ShieldAlert, ShieldPlus } from 'lucide-react';

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      {/* Left Marketing Half */}
      <div className="md:w-1/2 flex flex-col justify-center p-12 lg:p-24 border-r border-border relative overflow-hidden bg-panels">
        {/* Subtle glow effect behind text */}
        <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl -translate-y-1/2" />
        
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-success/10 border border-success/20 mb-8 animate-pulse">
            <div className="w-2 h-2 rounded-full bg-success" />
            <span className="text-xs font-semibold text-success tracking-widest uppercase">Agent Active</span>
          </div>
          
          <div className="flex items-center gap-4 mb-8">
            <div className="w-16 h-16 bg-slate-900 rounded-[2rem] flex items-center justify-center shadow-2xl shadow-brand-500/20 border border-white/5 overflow-hidden">
              <img src="/logo-icon.png" alt="MedVault" className="w-full h-full object-cover" />
            </div>
          </div>
          
          <h1 className="text-5xl lg:text-7xl font-display font-bold text-text-primary tracking-tight mb-4">
            Med<span className="text-primary">Vault</span>
          </h1>
          <h2 className="text-2xl text-text-secondary font-medium mb-8">AI-Powered Healthcare Platform</h2>
          
          <p className="text-text-secondary leading-relaxed max-w-md">
            Seamlessly coordinate your healthcare journey. Agents automatically extract OCR data, monitor health compliance, and restrict dynamic OTP-bound record sharing.
          </p>
        </div>
      </div>

      {/* Right Navigation Half */}
      <div className="md:w-1/2 flex flex-col justify-center p-8 lg:p-24 bg-base relative">
        <div className="grid gap-6 w-full max-w-md mx-auto">
          {/* Patient Card */}
          <button 
            onClick={() => navigate('/login/patient')}
            className="group card-panel flex flex-col text-left hover:border-primary/50 transition-all duration-300"
          >
            <div className="w-12 h-12 bg-subtle rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
              <UserCircle2 className="w-6 h-6 text-text-accent" />
            </div>
            <h3 className="text-xl font-display font-bold text-text-primary mb-2">I'm a Patient</h3>
            <p className="text-text-secondary text-sm mb-6">View health scores, upload medical reports, and generate emergency QR access.</p>
            <div className="flex items-center text-primary font-semibold text-sm tracking-wide uppercase mt-auto">
              Continue as Patient
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>

          {/* Doctor Card */}
          <button 
            onClick={() => navigate('/login/doctor')}
            className="group card-panel flex flex-col text-left hover:border-primary/50 transition-all duration-300"
          >
            <div className="w-12 h-12 bg-subtle rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
              <Stethoscope className="w-6 h-6 text-text-accent" />
            </div>
            <h3 className="text-xl font-display font-bold text-text-primary mb-2">I'm a Doctor</h3>
            <p className="text-text-secondary text-sm mb-6">Access patient records, view AI clinical summaries, and write prescriptions.</p>
            <div className="flex items-center text-primary font-semibold text-sm tracking-wide uppercase mt-auto">
              Continue as Doctor
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>
        </div>

        <button 
          onClick={() => navigate('/emergency')}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 md:translate-x-0 md:left-auto md:right-8 flex items-center gap-2 text-text-secondary hover:text-danger transition-colors text-sm font-semibold uppercase tracking-widest"
        >
          <ShieldAlert className="w-4 h-4" />
          Emergency Responder? →
        </button>
      </div>
    </div>
  );
}
