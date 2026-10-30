import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Clock, AlertCircle, User, Calendar, MapPin } from 'lucide-react';
import NearbyMedicineModal from './NearbyMedicineModal';

export default function MedicationCard({ med, onToggle }) {
  const isTaken = med.taken;
  const [showNearby, setShowNearby] = useState(false);
  
  // Define colors based on status
  const getStatusColors = () => {
    if (isTaken) return 'border-emerald-500/30 bg-emerald-500/5 text-emerald-400';
    // Logic for 'missed' could go here if we had a 'missed' flag from backend
    return 'border-slate-800 bg-slate-900/50 text-slate-400';
  };

  return (
    <>
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01 }}
      className={`relative overflow-hidden rounded-2xl border p-5 transition-all ${getStatusColors()}`}
    >
      {/* Background Glow */}
      {isTaken && (
        <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-emerald-500/10 blur-3xl" />
      )}

      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="mb-2 flex items-center gap-2">
            <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${isTaken ? 'text-emerald-400' : 'text-slate-500'}`}>
              {med.slot}
            </span>
            <div className={`h-1 w-1 rounded-full ${isTaken ? 'bg-emerald-500' : 'bg-slate-700'}`} />
            <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-bold tracking-widest">
              <Clock className="h-3 w-3" />
              {med.time}
            </div>
          </div>
          
          <h3 className="text-xl font-black text-white leading-tight whitespace-nowrap overflow-hidden text-ellipsis">{med.drug}</h3>
          <p className="mt-1 text-xs font-black uppercase tracking-widest text-slate-500">{med.dosage} • {med.frequency}</p>
          
          {/* Doctor & Date metadata */}
          {(med.doctorName || med.prescriptionDate) && (
            <div className="mt-2.5 flex items-center gap-3 flex-wrap">
              {med.doctorName && med.doctorName !== 'Doctor' && (
                <div className="flex items-center gap-1 text-[9px] font-bold text-brand-400/70 uppercase tracking-widest">
                  <User className="h-3 w-3" />
                  {med.doctorName}
                </div>
              )}
              {med.prescriptionDate && (
                <div className="flex items-center gap-1 text-[9px] font-bold text-slate-600 uppercase tracking-widest">
                  <Calendar className="h-3 w-3" />
                  {new Date(med.prescriptionDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                </div>
              )}
            </div>
          )}

          {/* Affordable Nearby Button */}
          <button
            onClick={(e) => { e.stopPropagation(); setShowNearby(true); }}
            className="mt-3 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-500/10 hover:bg-brand-500/20 border border-brand-500/20 hover:border-brand-500/30 text-[9px] font-black text-brand-400 uppercase tracking-widest transition-all hover:scale-105 active:scale-95"
          >
            <MapPin className="w-3 h-3" />
            Check Affordable Nearby
          </button>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onToggle(med)}
          className={`flex-shrink-0 flex h-14 w-14 items-center justify-center rounded-2xl border-2 transition-all duration-300 ${
            isTaken 
              ? 'bg-emerald-600 border-emerald-400 text-white shadow-[0_0_25px_rgba(16,185,129,0.5)]' 
              : 'border-white/10 bg-slate-900 shadow-lg hover:border-emerald-500/50 hover:bg-slate-800'
          }`}
        >
          {isTaken ? (
            <Check className="h-7 w-7 stroke-[3px]" />
          ) : (
            <div className="h-2.5 w-2.5 rounded-full bg-slate-700 transition-all group-hover:scale-150 group-hover:bg-emerald-500" />
          )}
        </motion.button>
      </div>

      {/* Progress Line */}
      <div className="mt-4 h-1.5 w-full rounded-full bg-slate-800/50 overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: isTaken ? '100%' : '0%' }}
          className="h-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"
        />
      </div>
    </motion.div>

    {/* Nearby Medicine Modal */}
    {showNearby && (
      <NearbyMedicineModal med={med} onClose={() => setShowNearby(false)} />
    )}
    </>
  );
}
