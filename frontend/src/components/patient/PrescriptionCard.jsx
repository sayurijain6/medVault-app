import React from "react";
import { motion } from "framer-motion";
import { Pill, Clock, Stethoscope, ArrowRight } from "@phosphor-icons/react";

/**
 * Premium Prescription Dossier Card
 * Displays clinical diagnosis and detailed medication regimen with timeline-ready aesthetics.
 */
export function PrescriptionCard({ 
  diagnosis, 
  medications = [], 
  nextVisit, 
  doctorName, 
  dateIssued, 
  idx = 0 
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: idx * 0.1, ease: [0.32, 0.72, 0, 1] }}
      className="w-full rounded-[2.5rem] bg-surface border border-whisper p-8 shadow-sm hover:shadow-diffused transition-shadow relative overflow-hidden group"
    >
      {/* Soft gradient corner detail */}
      <div className="absolute top-[-30%] right-[-10%] w-[200px] h-[200px] bg-blue-500/5 blur-[60px] rounded-full pointer-events-none opacity-50 group-hover:opacity-100 transition-opacity duration-1000" />

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
           <div className="text-[10px] uppercase font-mono text-steel tracking-widest mb-1 flex items-center gap-2">
             <Stethoscope weight="fill" className="text-blue-500/50" /> Clinical Diagnosis
           </div>
           <h3 className="text-2xl font-bold text-charcoal tracking-tight">{diagnosis}</h3>
        </div>
        <div className="px-4 py-1.5 bg-black/5 rounded-full text-xs font-medium text-charcoal flex items-center gap-2 shrink-0">
           <Pill /> Active Regimen
        </div>
      </div>

      {/* Medication List */}
      <div className="bg-canvas/50 rounded-2xl border border-whisper overflow-hidden mb-8">
        {medications.map((med, i) => (
          <div key={i} className={`flex flex-col md:flex-row items-start md:items-center p-4 gap-4 ${i !== medications.length - 1 ? 'border-b border-whisper' : ''}`}>
             
             {/* Icon */}
             <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center shrink-0 text-blue-500">
                <Pill weight="duotone" className="w-5 h-5" />
             </div>
             
             {/* Flow container */}
             <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm font-medium flex-1">
                <span className="text-charcoal text-base">{med.name || med.drug}</span>
                <span className="text-steel bg-black/5 px-2 py-0.5 rounded-md font-mono text-xs">{med.dosage}</span>
                <ArrowRight className="text-steel/40" />
                <span className="text-charcoal bg-white border border-whisper px-2 py-1 rounded-md shadow-sm">{med.frequency}</span>
                <ArrowRight className="text-steel/40" />
                <span className="text-steel font-mono">{med.duration}</span>
             </div>

          </div>
        ))}

        {medications.length === 0 && (
          <div className="p-8 text-center text-steel italic text-sm">
            No specific medications listed for this diagnosis.
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end pt-6 border-t border-whisper gap-6">
         <div className="flex items-center gap-2 bg-blue-50 text-blue-600 px-4 py-2 rounded-xl text-sm font-medium">
            <Clock weight="bold" /> Next Visit: {nextVisit || "To be scheduled"}
         </div>
         
         <div className="flex items-center gap-4 text-xs font-mono text-steel text-right">
            {dateIssued && <div>Issued: <span className="text-charcoal">{dateIssued}</span></div>}
            {doctorName && <div>Physician: <span className="text-charcoal">{doctorName}</span></div>}
         </div>
      </div>
    </motion.div>
  );
}
