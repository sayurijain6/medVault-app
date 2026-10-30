import React from "react";
import { motion } from "framer-motion";
import { Pill } from "@phosphor-icons/react";

/**
 * Premium Empty State for Prescriptions
 */
export function EmptyPrescriptionState() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full h-[400px] flex flex-col items-center justify-center p-12 border-2 border-dashed border-steel/10 rounded-[2.5rem] bg-black/[0.02]"
    >
      <div className="w-20 h-20 rounded-full bg-white text-steel/50 flex items-center justify-center mb-6 shadow-sm border border-whisper">
        <Pill weight="duotone" className="w-10 h-10" />
      </div>
      <h3 className="text-2xl font-bold text-charcoal mb-2 tracking-tight">
        No prescriptions yet
      </h3>
      <p className="text-steel max-w-sm text-center font-medium leading-relaxed mb-8">
        Your doctor-issued prescriptions will appear here once they are digitally signed and finalized.
      </p>
      <button className="px-6 py-3 bg-white border border-whisper text-charcoal rounded-full font-medium hover:bg-black/5 hover:border-black/10 active:scale-[0.98] transition-all shadow-sm">
        Request Prescription
      </button>
    </motion.div>
  );
}
