import React from 'react';
import { CheckCircle, AlertTriangle, X } from 'lucide-react';

export default function Toast({ message, type = 'success', onClose }) {
  if (!message) return null;
  const isError = type === 'error';

  return (
    <div className={`fixed bottom-6 right-6 flex items-center gap-3 px-4 py-3 rounded-lg shadow-2xl z-50 animate-in fade-in duration-300 border ${
      isError ? 'bg-danger/10 border-danger/30 text-danger' : 'bg-success/10 border-success/30 text-success'
    }`}>
      {isError ? <AlertTriangle className="w-5 h-5" /> : <CheckCircle className="w-5 h-5" />}
      <p className="text-sm font-medium pr-4">{message}</p>
      <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-full transition-colors">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
