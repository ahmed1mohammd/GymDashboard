import React from 'react';
import clsx from 'clsx';

export const CyberCard = ({ children, className, hover = true, title, subtitle }) => {
  return (
    <div
      className={clsx(
        'glass-panel rounded-2xl p-6 relative overflow-hidden transition-all duration-300',
        hover && 'glass-panel-hover',
        className
      )}
    >
      {/* Decorative cyber corner elements */}
      <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-[var(--color-neon-emerald)] opacity-50" />
      <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-[var(--color-neon-primary)] opacity-50" />
      
      {/* Dynamic glow decoration */}
      <div className="absolute -top-10 -left-10 w-32 h-32 bg-[var(--color-neon-emerald)] opacity-5 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-[var(--color-neon-primary)] opacity-5 rounded-full blur-2xl pointer-events-none" />

      {title && (
        <div className="mb-4 border-b border-[var(--color-cyber-border)] pb-3">
          <h3 className="text-lg font-bold text-white neon-text-emerald flex items-center gap-2">
            {title}
          </h3>
          {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
        </div>
      )}
      
      <div className="relative z-10">{children}</div>
    </div>
  );
};

export default CyberCard;
