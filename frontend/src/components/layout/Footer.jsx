import React from 'react';
import { Activity, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-white/[0.04] py-6 px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <Activity className="w-4 h-4 text-brand-500" />
        <span className="font-display font-semibold">MedVault</span>
        <span>· AI-Powered Healthcare</span>
      </div>
      <p className="text-xs text-slate-600 flex items-center gap-1">Built with <Heart className="w-3 h-3 text-danger-400" /> for better health outcomes</p>
    </footer>
  );
}
