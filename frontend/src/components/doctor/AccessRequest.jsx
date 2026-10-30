import React, { useState } from 'react';
import { Send, Loader2 } from 'lucide-react';
import OTPModal from '../OTPModal';
import { api, getErrorMessage } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function AccessRequest({ onToast }) {
  const { currentUser } = useAuth();
  const [patientEmail, setPatientEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [otpOpen, setOtpOpen] = useState(false);
  const [requestId, setRequestId] = useState(null);

  const handleRequest = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const doctorId = currentUser?.uid || 'unknown';
      const res = await api.requestAccess({ doctorId, email: patientEmail });
      setRequestId(res.data.request?.requestId);
      setOtpOpen(true);
      onToast?.('Access request sent. The patient will receive a secure OTP via their registered email.');
    } catch (err) { 
      onToast?.(getErrorMessage(err), 'error'); 
    } finally { 
      setLoading(false); 
    }
  };

  const handleSuccess = () => {
    onToast?.('OTP verified – record access granted!');
    setPatientEmail('');
  };

  return (
    <div className="glass-card p-6">
      <h3 className="section-title">Forward-Secure Identity Retrieval</h3>
      <p className="text-sm text-slate-400 mb-6">Enter a Patient Email to trigger a secure 6-digit authorization bridge to their registered email.</p>
      
      <form onSubmit={handleRequest} className="flex gap-3">
        <input 
          type="email" 
          value={patientEmail} 
          onChange={e => setPatientEmail(e.target.value)} 
          placeholder="patient@example.com" 
          className="input-field flex-1" 
          required 
        />
        <button type="submit" disabled={loading} className="btn-primary whitespace-nowrap px-6">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          Request Access
        </button>
      </form>

      <OTPModal 
        isOpen={otpOpen} 
        onClose={() => setOtpOpen(false)} 
        onSuccess={handleSuccess} 
        requestId={requestId} 
      />
    </div>
  );
}
