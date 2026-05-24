import React from 'react';
import clsx from 'clsx';

export const CyberButton = ({ children, className, variant = 'primary', size = 'md', ...props }) => {
  const baseStyle = 'relative inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-300 active:scale-95 disabled:opacity-50 disabled:pointer-events-none overflow-hidden';
  
  const variants = {
    primary: 'bg-[var(--theme-primary)] text-white hover:bg-[var(--theme-primary)] hover:brightness-110 shadow-[0_0_10px_rgba(229,9,20,0.2)] hover:shadow-[0_0_20px_rgba(229,9,20,0.4)] transition-all duration-300 min-h-[44px]',
    secondary: 'bg-[rgba(26,26,26,0.6)] text-[var(--color-text-main)] border border-[var(--color-cyber-border)] hover:border-[var(--theme-primary)]/50 hover:bg-[rgba(36,36,36,0.8)] shadow-[0_0_10px_rgba(255,255,255,0.02)] min-h-[44px]',
    danger: 'bg-rose-600/20 text-rose-400 border border-rose-500/40 hover:bg-rose-600/30 hover:border-rose-400 shadow-[0_0_10px_rgba(244,63,94,0.1)] hover:shadow-[0_0_15px_rgba(244,63,94,0.3)] min-h-[44px]',
    outline: 'border border-[var(--color-cyber-border)] text-[var(--color-text-muted)] hover:text-white hover:border-[var(--theme-primary)] hover:shadow-[0_0_15px_rgba(229,9,20,0.15)] bg-transparent min-h-[44px]',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-6 py-3.5 text-base',
  };

  return (
    <button
      className={clsx(baseStyle, variants[variant], sizes[size], className)}
      {...props}
    >
      {/* Laser line animation overlay */}
      <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full hover:animate-shimmer" />
      <span className="relative z-10 flex items-center justify-center gap-2">{children}</span>
    </button>
  );
};

export default CyberButton;
