import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageSquare, 
  Calendar, 
  User, 
  RefreshCcw, 
  FileText,
  Clock,
  ChevronRight
} from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function PatientNotesList({ patientId: externalPatientId }) {
  const { currentUser } = useAuth();
  const targetId = externalPatientId || currentUser?.uid;
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotes = async () => {
    if (!targetId) return;
    try {
      setLoading(true);
      const res = await api.getPatientDoctorNotes(targetId);
      setNotes(res.data.notes || []);
    } catch (err) {
      console.error('Failed to fetch notes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, [targetId]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-800 border-t-brand-500" />
      <p className="mt-4 text-slate-500 font-bold tracking-widest text-[10px] uppercase">Retrieving Clinical Pipeline...</p>
    </div>
  );

  return (
    <div className="space-y-6 pb-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tight">Doctor Observations</h2>
          <p className="mt-2 text-sm text-slate-400 font-medium max-w-xl">
            Real-time clinical insights and follow-up guidance synchronized from your healthcare providers.
          </p>
        </div>
        <button 
          onClick={fetchNotes}
          className="p-3 rounded-2xl bg-slate-900/50 text-slate-400 hover:text-brand-400 border border-white/5 hover:border-brand-500/30 transition-all shadow-lg"
          title="Refresh Observations"
        >
          <RefreshCcw className="h-5 w-5" />
        </button>
      </div>

      <div className="grid gap-6">
        <AnimatePresence mode="popLayout">
          {notes.map((note, index) => (
            <motion.div
              key={note.noteId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="glass-card p-6 relative overflow-hidden group"
            >
              {/* Category Badge */}
              <div className="absolute right-6 top-6">
                <span className="px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-[10px] font-black uppercase tracking-widest text-brand-400">
                  {note.category || 'Observation'}
                </span>
              </div>

              <div className="flex items-start gap-5">
                <div className="flex-shrink-0 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-900 border border-white/10 text-slate-300">
                  <FileText className="h-6 w-6" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="mb-1 flex items-center gap-3">
                    <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                      <User className="h-3 w-3" />
                      {note.doctorName || 'Dr. Specialist'}
                    </div>
                    <div className="h-1 w-1 rounded-full bg-slate-700" />
                    <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                      <Calendar className="h-3 w-3" />
                      {new Date(note.createdAt || note.timestamp).toLocaleDateString()}
                    </div>
                  </div>

                  <h3 className="text-xl font-black text-white mb-3 tracking-tight group-hover:text-brand-400 transition-colors">
                    {note.title || 'Clinical Observation'}
                  </h3>
                  
                  <div className="p-4 rounded-xl bg-slate-950/50 border border-white/[0.03] text-slate-400 text-sm leading-relaxed font-medium">
                    {note.content}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {notes.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-[2.5rem] border-2 border-dashed border-slate-800/50 py-24 text-center bg-slate-900/20 backdrop-blur-sm">
            <div className="mb-5 flex h-24 w-24 items-center justify-center rounded-full bg-slate-900/80 text-slate-700 shadow-inner">
              <MessageSquare className="h-10 w-10" />
            </div>
            <h3 className="text-2xl font-black text-white tracking-tight">No Clinical Notes Recorded</h3>
            <p className="mx-auto mt-3 max-w-sm text-sm text-slate-500 font-medium">
              Notes added by your doctors during consultations or after reviewing your reports will appear here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
