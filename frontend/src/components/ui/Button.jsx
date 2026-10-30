import React from "react";
import { ArrowUpRight } from "@phosphor-icons/react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utility for combining Tailwind classes
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function Button({
  children,
  onClick,
  className,
  variant = "primary",
  showArrow = false,
  disabled = false,
  type = "button"
}) {
  const baseStyles =
    "group relative flex items-center justify-center font-medium transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.98] outline-none rounded-full disabled:opacity-50 disabled:pointer-events-none";

  const variants = {
    primary: "bg-charcoal text-white hover:bg-black px-6 py-3",
    secondary:
      "bg-white text-charcoal border border-whisper shadow-sm hover:shadow-diffused px-6 py-3",
    ghost: "bg-transparent text-steel hover:text-charcoal hover:bg-black/5 px-4 py-2",
  };

  return (
    <button 
      type={type}
      onClick={onClick} 
      disabled={disabled}
      className={cn(baseStyles, variants[variant], className)}
    >
      <span className="relative z-10 font-sans tracking-wide">{children}</span>
      {showArrow && (
        <span
          className={cn(
            "flex items-center justify-center w-8 h-8 rounded-full ml-3 transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-1 group-hover:-translate-y-[1px] group-hover:scale-105",
            variant === "primary" ? "bg-white/10" : "bg-black/5"
          )}
        >
          <ArrowUpRight weight="light" className="w-4 h-4" />
        </span>
      )}
    </button>
  );
}
