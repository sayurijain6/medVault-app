import React, { useRef, useState } from 'react';
import { UploadCloud } from 'lucide-react';

export default function UploadZone({ onFileSelect }) {
  const [isDrag, setIsDrag] = useState(false);
  const [file, setFile] = useState(null);
  const inputRef = useRef(null);

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDrag(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
      onFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      onFileSelect(e.target.files[0]);
    }
  };

  return (
    <div 
      onDragOver={(e) => { e.preventDefault(); setIsDrag(true); }}
      onDragLeave={() => setIsDrag(false)}
      onDrop={handleDrop}
      className={`relative w-full h-40 flex flex-col items-center justify-center border-2 border-dashed rounded-xl transition-all duration-200 ${
        isDrag ? 'border-primary bg-primary/10' : 'border-border bg-subtle/30 hover:bg-subtle'
      }`}
    >
      <input type="file" ref={inputRef} onChange={handleChange} className="hidden" />
      <UploadCloud className={`w-10 h-10 mb-3 ${isDrag ? 'text-primary' : 'text-text-secondary'}`} />
      <p className="text-text-primary font-medium">
        {file ? file.name : "Drag & drop report or click"}
      </p>
      <p className="text-xs text-text-secondary mt-2">Supports PDF, JPG, PNG</p>
      <button 
        type="button"
        onClick={() => inputRef.current.click()}
        className="absolute inset-0 w-full h-full cursor-pointer z-10 opacity-0"
      />
    </div>
  );
}
