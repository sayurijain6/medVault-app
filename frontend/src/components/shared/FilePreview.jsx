import React from 'react';

export default function FilePreview({ file }) {
  if (!file) return null;
  const isImage = file.type?.startsWith('image/');
  const url = URL.createObjectURL(file);

  return (
    <div className="relative group">
      {isImage ? (
        <img src={url} alt={file.name} className="w-full h-40 object-cover rounded-xl border border-white/[0.08]" />
      ) : (
        <div className="w-full h-40 flex flex-col items-center justify-center bg-white/[0.03] rounded-xl border border-white/[0.08]">
          <div className="text-4xl mb-2">📄</div>
          <p className="text-sm text-slate-400 font-medium">{file.name}</p>
          <p className="text-xs text-slate-500 mt-1">{(file.size / 1024).toFixed(1)} KB</p>
        </div>
      )}
    </div>
  );
}
