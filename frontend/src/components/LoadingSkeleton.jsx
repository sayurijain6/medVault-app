import React from 'react';

export default function LoadingSkeleton({ active = true, className = "", w = "w-full", h = "h-4" }) {
  if (!active) return null;
  return (
    <div className={`animate-pulse bg-subtle rounded-md ${w} ${h} ${className}`}></div>
  );
}
