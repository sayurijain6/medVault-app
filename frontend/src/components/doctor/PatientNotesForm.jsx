import React, { useState } from 'react';
import { Send, FileText, Loader2, Mail, MessageSquare } from 'lucide-react';
import { api, getErrorMessage } from '../../services/api';

export default function PatientNotesForm({ onToast }) {
  const [patientEmail, setPatientEmail] = useState('');
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('observation');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.createPatientNoteByEmail({
        patientEmail,
        title: title || 'Clinical Observation',
        content,
        category
      });
      
      onToast?.('Clinical note added successfully');
      // Reset form
      setPatientEmail('');
      setContent('');
      setTitle('');
      setCategory('observation');
    } catch (err) {
      onToast?.(getErrorMessage(err), 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card p-6 border-brand-500/20">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 rounded-xl bg-brand-500/10 text-brand-400">
          <MessageSquare className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-xl font-black text-white leading-none">Add Clinical Note</h3>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Direct Patient Sync via Email</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div>
            <label className="label">PATIENT EMAIL ID</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input 
                type="email" 
                value={patientEmail} 
                onChange={e => setPatientEmail(e.target.value)} 
                className="input-field pl-10" 
                placeholder="patient@example.com" 
                required 
              />
            </div>
          </div>

          <div>
            <label className="label">NOTE TITLE</label>
            <input 
              type="text" 
              value={title} 
              onChange={e => setTitle(e.target.value)} 
              className="input-field" 
              placeholder="e.g. Follow-up Observation" 
            />
          </div>

          <div>
            <label className="label">CATEGORY</label>
            <select 
              value={category} 
              onChange={e => setCategory(e.target.value)} 
              className="input-field"
            >
              <option value="observation">General Observation</option>
              <option value="diagnosis">Diagnosis Update</option>
              <option value="medication">Medication Adjustments</option>
              <option value="warning">Precautions / Warnings</option>
              <option value="follow-up">Follow-up Instructions</option>
            </select>
          </div>

          <div>
            <label className="label">CLINICAL OBSERVATIONS</label>
            <textarea 
              value={content} 
              onChange={e => setContent(e.target.value)} 
              className="input-field h-32 resize-none" 
              placeholder="Type your clinical observation here..." 
              required
            />
          </div>
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full py-3.5 shadow-brand-500/20 shadow-lg">
          {loading ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> SYNCHRONIZING...</>
          ) : (
            <><Send className="w-4 h-4" /> ADD CLINICAL NOTE</>
          )}
        </button>
      </form>
    </div>
  );
}
