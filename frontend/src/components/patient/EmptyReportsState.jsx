import React from "react";
import { motion } from "framer-motion";
import { FileText } from "@phosphor-icons/react";

/**
 * Premium Empty State for Reports
 */
export function EmptyReportsState() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full h-[400px] flex flex-col items-center justify-center p-12 border-2 border-dashed border-steel/10 rounded-[2.5rem] bg-black/[0.02]"
    >
      <div className="w-20 h-20 rounded-full bg-white text-steel/50 flex items-center justify-center mb-6 shadow-sm border border-whisper">
        <FileText weight="duotone" className="w-10 h-10" />
      </div>
      <h3 className="text-2xl font-bold text-charcoal mb-2 tracking-tight">
        No reports uploaded yet
      </h3>
      <p className="text-steel max-w-sm text-center font-medium leading-relaxed">
        Upload your first medical report above to start building your clinical record.
      </p>
    </motion.div>
  );
}
