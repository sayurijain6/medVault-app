import React, { useState } from 'react';
import { Plus, Trash2, FileText, Loader2 } from 'lucide-react';
import { api, getErrorMessage } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { DRUG_OPTIONS, FREQUENCY_OPTIONS, DURATION_OPTIONS } from '../../utils/constants';

const emptyMed = { drug: '', dosage: '', frequency: '2x daily', durationDays: 1 };

export default function PrescriptionForm({ patientId = 'patient_123', onToast }) {
  const { currentUser } = useAuth();
  const [patientEmail, setPatientEmail] = useState('');
  const [meds, setMeds] = useState([{ ...emptyMed }]);
  const [diagnosis, setDiagnosis] = useState('');
  const [nextVisit, setNextVisit] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [drugSearch, setDrugSearch] = useState({});

  const addMed = () => setMeds([...meds, { ...emptyMed }]);
  const removeMed = (i) => setMeds(meds.filter((_, idx) => idx !== i));
  const updateMed = (i, field, val) => { const n = [...meds]; n[i][field] = val; setMeds(n); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const doctorId = currentUser?.uid || 'unknown';
      const res = await api.createPrescription({ 
        patientEmail, 
        doctorId, 
        medications: meds, 
        diagnosis, 
        nextVisit 
      });
      setResult(res.data.prescription || res.data);
      onToast?.('Prescription created successfully');
      // Reset form
      setPatientEmail('');
      setMeds([{ ...emptyMed }]);
      setDiagnosis('');
      setNextVisit('');
    } catch (err) { onToast?.(getErrorMessage(err), 'error'); }
    finally { setLoading(false); }
  };

  const getSuggestions = (query) => query.length > 0 ? DRUG_OPTIONS.filter(d => d.toLowerCase().includes(query.toLowerCase())) : [];

  return (
    <div className="glass-card p-6">
      <h3 className="section-title">Create Prescription</h3>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div>
            <label className="label">PATIENT EMAIL ID</label>
            <input 
              type="email" 
              value={patientEmail} 
              onChange={e => setPatientEmail(e.target.value)} 
              className="input-field" 
              placeholder="patient@example.com" 
              required 
            />
          </div>

          <div>
            <label className="label">DIAGNOSIS</label>
            <textarea 
              value={diagnosis} 
              onChange={e => setDiagnosis(e.target.value)} 
              className="input-field h-20 resize-none" 
              placeholder="e.g. Type 2 Diabetes Mellitus with Hypertension" 
              required
            />
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="label mb-0">Medications</span>
            <button type="button" onClick={addMed} className="btn-ghost text-xs py-1.5 px-3 text-brand-400">
              <Plus className="w-3.5 h-3.5" /> Add Medication
            </button>
          </div>
          {meds.map((m, i) => (
            <div key={i} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 p-4 bg-white/[0.02] border border-white/[0.06] rounded-xl">
              <div className="relative lg:col-span-1">
                <input type="text" value={m.drug} onChange={e => { updateMed(i, 'drug', e.target.value); setDrugSearch({ ...drugSearch, [i]: e.target.value }); }}
                  placeholder="Drug name" className="input-field" required />
                {drugSearch[i] && getSuggestions(drugSearch[i]).length > 0 && (
                  <div className="absolute z-10 top-full left-0 right-0 mt-1 bg-slate-800 border border-white/[0.1] rounded-xl overflow-hidden shadow-glass-lg">
                    {getSuggestions(drugSearch[i]).slice(0, 4).map(s => (
                      <button key={s} type="button" onClick={() => { updateMed(i, 'drug', s); setDrugSearch({ ...drugSearch, [i]: '' }); }}
                        className="w-full text-left px-3 py-2 text-sm text-slate-300 hover:bg-brand-500/10 hover:text-brand-400">{s}</button>
                    ))}
                  </div>
                )}
              </div>
              <input type="text" value={m.dosage} onChange={e => updateMed(i, 'dosage', e.target.value)} placeholder="e.g. 500mg" className="input-field" required />
              <select value={m.frequency} onChange={e => updateMed(i, 'frequency', e.target.value)} className="input-field">
                {FREQUENCY_OPTIONS.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
              <div className="space-y-1">
                <input 
                  type="number" 
                  min="1"
                  value={m.durationDays} 
                  onChange={e => updateMed(i, 'durationDays', parseInt(e.target.value) || 0)} 
                  placeholder="Days" 
                  className="input-field" 
                  required 
                />
                <p className="text-[10px] text-slate-500 font-bold uppercase ml-1">Days</p>
              </div>
              <div className="flex items-center justify-end">
                {meds.length > 1 && (
                  <button type="button" onClick={() => removeMed(i)} className="p-2 text-danger-400 hover:bg-danger-500/10 rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        <div>
          <label className="label">Next Visit Date</label>
          <input type="date" value={nextVisit} onChange={e => setNextVisit(e.target.value)} className="input-field" />
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full py-3">
          {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</> : <><FileText className="w-4 h-4" /> Issue Prescription</>}
        </button>
      </form>

      {result && (
        <div className="mt-6 p-5 bg-success-500/5 border border-success-500/20 rounded-xl">
          <p className="text-success-400 font-bold text-sm mb-2">✓ Prescription Issued</p>
          <p className="text-xs text-slate-400 font-mono">ID: {result.prescriptionId}</p>
        </div>
      )}
    </div>
  );
}
