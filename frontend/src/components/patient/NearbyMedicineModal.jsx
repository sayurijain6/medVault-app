import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  MapPin,
  Navigation,
  Phone,
  Pill,
  ArrowRight,
  Loader2,
  Package,
  ShieldCheck,
  AlertCircle,
  ExternalLink
} from 'lucide-react';
import { getGenericName } from '../../utils/medicineMap';
import { calculateQuantity } from '../../utils/dosageCalculator';
import { findNearbyStores, getDirectionsUrl } from '../../services/janaushadhiService';

export default function NearbyMedicineModal({ med, onClose }) {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);

  const genericName = getGenericName(med.drug);
  const isGenericDifferent = genericName.toLowerCase() !== med.drug.toLowerCase();
  const quantityInfo = calculateQuantity(med.frequency, med.durationDays || med.duration);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const nearby = await findNearbyStores();
        setStores(nearby);
      } catch {
        setStores([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Close on Escape key
  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  return createPortal(
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
        onClick={onClose}
      >
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/70 backdrop-blur-md" />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-3xl border border-white/10 bg-slate-950 shadow-2xl shadow-brand-500/10"
        >
          {/* Header */}
          <div className="sticky top-0 z-10 bg-gradient-to-b from-slate-950 via-slate-950 to-slate-950/95 p-6 pb-4 border-b border-white/5">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                  <ShieldCheck className="w-6 h-6 text-emerald-400" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-white tracking-tight">Affordable Medicine Finder</h2>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">
                    Powered by Jan Aushadhi Scheme
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-xl hover:bg-white/5 text-slate-500 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="p-6 space-y-5">
            {/* Medicine Info */}
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] space-y-3">
              {/* Prescribed */}
              <div>
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">PRESCRIBED MEDICINE</p>
                <p className="text-lg font-black text-white">{med.drug} {med.dosage && <span className="text-brand-400">{med.dosage}</span>}</p>
              </div>

              {/* Generic Equivalent */}
              {isGenericDifferent && (
                <div className="flex items-center gap-3 p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/15">
                  <Pill className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                  <div>
                    <p className="text-[9px] font-black text-emerald-500/70 uppercase tracking-widest mb-0.5">GENERIC EQUIVALENT (JAN AUSHADHI)</p>
                    <p className="text-sm font-black text-emerald-400">{genericName}</p>
                  </div>
                </div>
              )}

              {!isGenericDifferent && (
                <div className="flex items-center gap-3 p-3 rounded-xl bg-brand-500/5 border border-brand-500/15">
                  <Pill className="w-5 h-5 text-brand-400 flex-shrink-0" />
                  <div>
                    <p className="text-[9px] font-black text-brand-500/70 uppercase tracking-widest mb-0.5">GENERIC NAME</p>
                    <p className="text-sm font-black text-brand-400">{genericName}</p>
                  </div>
                </div>
              )}

              {/* Quantity Required */}
              <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                <Package className="w-5 h-5 text-amber-400 flex-shrink-0" />
                <div>
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-0.5">ESTIMATED QUANTITY REQUIRED</p>
                  <p className="text-sm font-bold text-white">
                    {quantityInfo.quantity !== null ? (
                      <>{quantityInfo.quantity} tablets<span className="text-slate-500 ml-2 text-xs">({med.frequency} × {med.durationDays || med.duration} days)</span></>
                    ) : (
                      <span className="text-amber-400 italic">{quantityInfo.note}</span>
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* Nearby Stores */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <MapPin className="w-4 h-4 text-brand-400" />
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">NEARBY JAN AUSHADHI STORES</p>
              </div>

              {loading ? (
                <div className="flex flex-col items-center justify-center py-12 gap-3">
                  <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Detecting location & finding stores...</p>
                </div>
              ) : stores.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 gap-3 text-center">
                  <AlertCircle className="w-10 h-10 text-slate-700" />
                  <p className="text-sm font-bold text-slate-500">No nearby Jan Aushadhi stores found.</p>
                  <p className="text-xs text-slate-600">Try searching on Google Maps for "Jan Aushadhi Kendra near me"</p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {stores.slice(0, 5).map((store, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.08 }}
                      className="group p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-brand-500/20 hover:bg-white/[0.04] transition-all"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="flex items-center justify-center w-6 h-6 rounded-lg bg-brand-500/10 text-brand-400 text-[10px] font-black">
                              {i + 1}
                            </span>
                            <h4 className="text-sm font-black text-white truncate">{store.name}</h4>
                          </div>
                          <p className="text-xs text-slate-500 font-medium ml-8 line-clamp-1">{store.address}</p>
                          {store.phone && (
                            <div className="flex items-center gap-1.5 ml-8 mt-1">
                              <Phone className="w-3 h-3 text-slate-600" />
                              <span className="text-[10px] text-slate-600 font-bold">{store.phone}</span>
                            </div>
                          )}
                        </div>

                        <div className="flex flex-col items-end gap-2 flex-shrink-0">
                          <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-black text-emerald-400 whitespace-nowrap">
                            {store.distanceText}
                          </span>
                          <a
                            href={getDirectionsUrl(store.lat, store.lng, store.name)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-brand-500/10 hover:bg-brand-500/20 border border-brand-500/20 text-[10px] font-black text-brand-400 uppercase tracking-widest transition-all hover:scale-105 active:scale-95"
                          >
                            <Navigation className="w-3 h-3" />
                            Directions
                          </a>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* BPPI Attribution */}
            <div className="flex items-center justify-center gap-2 pt-2 pb-1">
              <p className="text-[9px] text-slate-600 font-bold uppercase tracking-widest">
                Jan Aushadhi Scheme — Bureau of Pharma PSUs of India (BPPI)
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 p-4 border-t border-white/5 bg-slate-950/95 backdrop-blur-sm">
            <button
              onClick={onClose}
              className="w-full py-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-sm font-black text-slate-300 uppercase tracking-widest transition-all hover:scale-[1.01] active:scale-[0.99]"
            >
              Close
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
}
