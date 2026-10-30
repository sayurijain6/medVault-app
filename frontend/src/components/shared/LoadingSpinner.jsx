import React from 'react';
import { Loader2 } from 'lucide-react';

export default function LoadingSpinner({ size = 24, className = '' }) {
  return <Loader2 className={`animate-spin text-brand-400 ${className}`} size={size} />;
}

export function LoadingSkeleton({ className = '', count = 1 }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={`bg-white/[0.06] rounded-xl animate-pulse ${className}`} />
      ))}
    </div>
  );
}

export function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="w-12 h-12 border-4 border-white/10 rounded-full" />
          <div className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full absolute inset-0 animate-spin" />
        </div>
        <p className="text-sm text-slate-400 uppercase tracking-widest font-semibold">Loading</p>
      </div>
    </div>
  );
}
