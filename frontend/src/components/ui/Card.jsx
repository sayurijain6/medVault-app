import React from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Standard Deep Protected Card
 */
export function Card({
  children,
  className,
}) {
  return (
    <div
      className={cn(
        "rounded-[2.5rem] p-1.5 bg-black/5 ring-1 ring-black/5",
        className
      )}
    >
      <div className="h-full rounded-[calc(2.5rem-0.375rem)] bg-white shadow-diffused shadow-inner-glow px-8 py-10">
        {children}
      </div>
    </div>
  );
}

/**
 * Modern Flat Card with Border
 */
export function FlatCard({
  children,
  className,
}) {
  return (
    <div
      className={cn(
        "rounded-3xl border border-whisper bg-surface shadow-diffused p-8",
        className
      )}
    >
      {children}
    </div>
  );
}
