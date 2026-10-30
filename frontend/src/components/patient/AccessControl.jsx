import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, ShieldCheck, ShieldOff, Clock, Lock, Unlock, Loader2 } from 'lucide-react';
import { MOCK_ACCESS_GRANTS } from '../../utils/constants';
import Modal from '../shared/Modal';
import { api, getErrorMessage } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function AccessControl({ onToast }) {
  const { currentUser } = useAuth();
  const [grants, setGrants] = useState([]);
  const [loadingGrants, setLoadingGrants] = useState(true);
  const [otpModal, setOtpModal] = useState(false);
  const [doctorIdInput, setDoctorIdInput] = useState('');
  const [otp, setOtp] = useState(['','','','','','']);
  const [revokeConfirm, setRevokeConfirm] = useState(null);
  const [granting, setGranting] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [updatingPhone, setUpdatingPhone] = useState(false);
  const [isEditing, setIsEditing] = useState(true);
  const otpRefs = Array.from({ length: 6 }, () => React.createRef());

  const fetchGrants = async () => {
    if (!currentUser?.uid) return;
    setLoadingGrants(true);
    try {
      const gRes = await api.getMyGrants(currentUser.uid);
      setGrants(gRes.data.grants || []);
    } catch (err) {
      console.error("Error fetching grants:", err);
    } finally {
      setLoadingGrants(false);
    }
  };

  React.useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.getProfile(currentUser.uid);
        if (res.data.phoneNumber) {
          setPhoneNumber(res.data.phoneNumber || '');
          setIsEditing(false); // Hide input if already linked
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
      }
    };
    if (currentUser?.uid) {
      fetchProfile();
      fetchGrants();
    }
  }, [currentUser]);

  const handleUpdatePhone = async () => {
    if (!phoneNumber) return;
    setUpdatingPhone(true);
    try {
      await api.updateProfile(currentUser.uid, { 
        phoneNumber,
        email: currentUser.email,
        displayName: currentUser.displayName || 'Patient',
        uid: currentUser.uid
      });
      onToast?.('Phone number linked successfully');
      setIsEditing(false);
    } catch (err) {
      onToast?.(getErrorMessage(err), 'error');
    } finally {
      setUpdatingPhone(false);
    }
  };

  const handleOtpChange = (val, idx) => {
    if (isNaN(val)) return;
    const n = [...otp]; n[idx] = val; setOtp(n);
    if (val && idx < 5) otpRefs[idx + 1].current.focus();
  };

  const handleGrantAccess = async () => {
    setGranting(true);
    try {
      const patientId = currentUser?.uid || 'unknown';
      await api.grantAccess(patientId, doctorIdInput);
      setOtpModal(false);
      setOtp(['','','','','','']);
      setDoctorIdInput('');
      onToast?.('Access granted successfully');
      fetchGrants(); // Refresh the real list
    } catch (err) {
      onToast?.(getErrorMessage(err), 'error');
    } finally { setGranting(false); }
  };

  const handleRevokeAccess = (id) => {
    setGrants(grants.filter(g => g.id !== id));
    setRevokeConfirm(null);
    onToast?.('Access revoked successfully');
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
  };

  return (
    <div className="space-y-8">
      {/* PHONE LINKING SECTION */}
      <div className="glass-morphism rounded-[2rem] p-8 border-white/[0.08] relative overflow-hidden group">
        <div className="absolute -right-16 -top-16 w-48 h-48 bg-emerald-500/5 rounded-full blur-[80px] group-hover:bg-emerald-500/10 transition-colors duration-700" />
        <h3 className="text-sm font-black text-slate-500 uppercase tracking-[0.3em] mb-4 relative z-10">Patient Identity Vector</h3>
        <p className="text-sm text-slate-400 mb-8 font-medium relative z-10">Securely link your tele-identity for clinical discovery and cryptographic OTP authorization.</p>
        
        {!isEditing ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center justify-between p-5 bg-emerald-500/[0.03] border border-emerald-500/20 rounded-[1.5rem] relative z-10 shadow-[0_0_30px_rgba(16,185,129,0.05)]"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shadow-lg">
                <ShieldCheck className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <p className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em] mb-1">Encrypted Identity</p>
                <p className="text-sm font-black text-white tracking-widest leading-none">{phoneNumber}</p>
              </div>
            </div>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsEditing(true)} 
              className="px-5 py-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-[10px] font-black text-slate-400 hover:text-white uppercase tracking-widest border border-white/5 transition-all"
            >
              Rotate Secret
            </motion.button>
          </motion.div>
        ) : (
          <div className="flex gap-4 relative z-10">
            <input 
              type="tel" 
              value={phoneNumber} 
              onChange={e => setPhoneNumber(e.target.value)} 
              placeholder="+1 (555) 000-0000" 
              className="flex-1 bg-slate-950/50 border border-white/10 rounded-2xl px-5 py-3.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all font-semibold" 
            />
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleUpdatePhone} 
              disabled={updatingPhone || !phoneNumber} 
              className="btn-primary px-8 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-[0_0_20px_rgba(14,165,233,0.3)]"
            >
              {updatingPhone ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Link Identity'}
            </motion.button>
          </div>
        )}
      </div>

      <div className="glass-morphism rounded-[2rem] p-8 border-white/[0.08] relative overflow-hidden group">
        <div className="absolute -left-16 -bottom-16 w-48 h-48 bg-brand-500/5 rounded-full blur-[80px] group-hover:bg-brand-500/10 transition-colors duration-700" />
        <div className="flex items-center justify-between mb-8 relative z-10">
          <h3 className="text-sm font-black text-slate-500 uppercase tracking-[0.3em]">Access Granularity</h3>
          <motion.button 
            whileHover={{ scale: 1.02, backgroundColor: '#0ea5e9' }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setOtpModal(true)} 
            className="flex items-center gap-2 bg-brand-500/20 text-brand-400 border border-brand-500/30 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
          >
            <Lock className="w-3.5 h-3.5" /> Delegate Access
          </motion.button>
        </div>

        {loadingGrants ? (
          <div className="py-20 flex justify-center relative z-10">
            <div className="w-8 h-8 border-2 border-brand-500/30 border-t-brand-500 rounded-full animate-spin shadow-[0_0_15px_rgba(14,165,233,0.4)]" />
          </div>
        ) : grants.length === 0 ? (
          <div className="text-center py-20 text-slate-500 relative z-10">
            <div className="w-16 h-16 bg-slate-900 border border-white/5 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl">
              <Shield className="w-8 h-8 opacity-20" />
            </div>
            <p className="font-bold text-slate-300">Default Lockdown State</p>
            <p className="text-[10px] mt-2 uppercase tracking-widest opacity-50 font-black">No active clinical delegations</p>
          </div>
        ) : (
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-4 relative z-10"
          >
            {grants.map((g) => (
              <motion.div 
                key={g.grantId} 
                variants={itemVariants}
                whileHover={{ y: -3, backgroundColor: 'rgba(255,255,255,0.04)' }}
                className={`flex items-center justify-between p-5 bg-white/[0.02] border rounded-[1.5rem] smooth-transition group shadow-lg ${
                  g.permission === 'PENDING' ? 'border-amber-500/20 shadow-amber-500/[0.02]' : 'border-white/[0.06] hover:border-emerald-500/30 shadow-emerald-500/[0.02]'
                }`}
              >
                <div className="flex items-center gap-5">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-md relative overflow-hidden ${
                    g.permission === 'PENDING' ? 'bg-amber-500/10 text-amber-400' : 'bg-emerald-500/10 text-emerald-400'
                  }`}>
                    {g.permission === 'PENDING' ? <Clock className="w-6 h-6 animate-pulse" /> : <ShieldCheck className="w-6 h-6" />}
                    <div className={`absolute inset-0 blur-[8px] opacity-20 ${g.permission === 'PENDING' ? 'bg-amber-400' : 'bg-emerald-400'}`} />
                  </div>
                  <div>
                    <p className="text-sm font-black text-white tracking-tight">{g.doctorName}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`px-1.5 py-0.5 rounded bg-white/5 border text-[8px] font-black uppercase tracking-[0.1em] ${
                        g.permission === 'PENDING' ? 'border-amber-500/20 text-amber-400' : 'border-emerald-500/20 text-emerald-400'
                      }`}>
                        {g.permission}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right hidden sm:block">
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-0.5">Termination Date</p>
                    <p className="text-[10px] font-bold text-slate-400 tracking-tighter">{new Date(g.expiresAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                  </div>
                  <motion.button 
                    whileHover={{ scale: 1.05, backgroundColor: 'rgba(225, 29, 72, 0.1)' }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setRevokeConfirm(g.grantId)} 
                    className="p-3 bg-white/5 hover:text-rose-400 rounded-xl text-slate-500 border border-white/5 transition-all shadow-md"
                  >
                    <ShieldOff className="w-4 h-4" />
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Grant Access Modal */}
        <Modal isOpen={otpModal} onClose={() => setOtpModal(false)} title="Grant Doctor Access">
          <div className="space-y-4 mb-6">
            <div>
              <label className="label">Doctor ID</label>
              <input type="text" value={doctorIdInput} onChange={e => setDoctorIdInput(e.target.value)} className="input-field" placeholder="Enter requesting doctor's ID" />
            </div>
            <p className="text-sm text-slate-400">Enter the 6-digit OTP code shared by the doctor to authorize record access.</p>
          </div>
          <div className="flex justify-between gap-2 mb-6">
            {otp.map((d, i) => (
              <input key={i} ref={otpRefs[i]} type="text" maxLength={1} value={d} onChange={(e) => handleOtpChange(e.target.value, i)}
                onKeyDown={(e) => { if (e.key === 'Backspace' && !otp[i] && i > 0) otpRefs[i - 1].current.focus(); }}
                className="w-12 h-14 text-center text-xl font-display font-bold input-field" />
            ))}
          </div>
          <button onClick={handleGrantAccess} disabled={otp.join('').length < 6 || !doctorIdInput || granting} className="btn-primary w-full">
            {granting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Unlock className="w-4 h-4" />}
            {granting ? 'Processing...' : 'Verify & Grant'}
          </button>
        </Modal>

        {/* Revoke Confirmation */}
        <Modal isOpen={!!revokeConfirm} onClose={() => setRevokeConfirm(null)} title="Confirm Revocation">
          <p className="text-sm text-slate-400 mb-6">This will immediately terminate the doctor's access to your records. This action cannot be undone.</p>
          <div className="flex gap-3">
            <button onClick={() => setRevokeConfirm(null)} className="btn-ghost flex-1">Cancel</button>
            <button onClick={() => handleRevokeAccess(revokeConfirm)} className="btn-danger flex-1">Revoke Access</button>
          </div>
        </Modal>
      </div>
    </div>
  );
}
