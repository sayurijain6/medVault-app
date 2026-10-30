import React, { useState, useRef } from 'react';
import { X, ShieldCheck, Loader2 } from 'lucide-react';
import { api, getErrorMessage } from '../services/api';

export default function OTPModal({ isOpen, onClose, onSuccess, requestId }) {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const inputs = useRef([]);

  if (!isOpen) return null;

  const handleChange = (e, index) => {
    const val = e.target.value;
    if (isNaN(val)) return;

    const newOtp = [...otp];
    newOtp[index] = val;
    setOtp(newOtp);

    // Auto advance
    if (val && index < 5) {
      inputs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputs.current[index - 1].focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await api.verifyOtp({ requestId, otp: otp.join('') });
      setSuccess(true);
      setTimeout(() => {
        onSuccess?.();
        onClose();
        setSuccess(false);
        setOtp(['', '', '', '', '', '']);
      }, 1500);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm px-4">
      <div className="bg-slate-900 border border-white/10 rounded-2xl shadow-2xl w-full max-w-md p-8 relative animate-in zoom-in-95 duration-200">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors">
          <X className="w-5 h-5" />
        </button>
        
        <div className="flex justify-center mb-6">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${success ? 'bg-success-500/20 text-success-400' : 'bg-brand-500/20 text-brand-400'}`}>
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>
        
        <h2 className="text-xl font-display font-bold text-center mb-2 text-white">Patient Authorization</h2>
        <p className="text-slate-400 text-sm text-center mb-8">Enter the 6-digit OTP provided by the patient to decrypt their records.</p>
        
        <form onSubmit={handleSubmit}>
          <div className="flex justify-between gap-2 mb-8">
            {otp.map((digit, i) => (
              <input
                key={i}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(e, i)}
                onKeyDown={(e) => handleKeyDown(e, i)}
                ref={(el) => (inputs.current[i] = el)}
                disabled={loading || success}
                className="w-12 h-14 text-center text-xl font-display font-bold bg-white/[0.03] border border-white/10 rounded-lg focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/50 transition-all text-white disabled:opacity-50"
              />
            ))}
          </div>
          
          {error && <p className="text-danger-400 text-xs text-center mb-4 font-medium animate-in fade-in slide-in-from-top-1">{error}</p>}
          
          <button type="submit" disabled={otp.join('').length < 6 || loading || success} className={`btn-primary w-full h-12 flex items-center justify-center gap-2 ${success ? 'bg-success-600 border-success-500' : ''}`}>
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : success ? 'Verified!' : 'Verify & Unlock'}
          </button>
        </form>
      </div>
    </div>
  );
}
