import React from 'react';
import clsx from 'clsx';

export const CyberInput = React.forwardRef(({ label, icon: Icon, error, className, ...props }, ref) => {
  return (
    <div className={clsx('flex flex-col gap-1.5 w-full', className)}>
      {label && (
        <label className="text-xs font-semibold text-gray-400 select-none mr-1 flex items-center gap-1">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 right-3 flex items-center justify-center text-gray-500 pointer-events-none">
            <Icon size={16} />
          </div>
        )}
        <input
          ref={ref}
          className={clsx(
            'w-full bg-[rgba(10,10,15,0.8)] border border-[var(--color-cyber-border)] rounded-xl py-2.5 px-4 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[var(--color-neon-emerald)] focus:shadow-[0_0_15px_rgba(16,185,129,0.15)] transition-all duration-300',
            Icon && 'pr-10',
            error && 'border-rose-500/50 focus:border-rose-500 focus:shadow-[0_0_15px_rgba(244,63,94,0.15)]'
          )}
          {...props}
        />
      </div>
      {error && <span className="text-xs text-rose-400 mr-1 mt-0.5">{error}</span>}
    </div>
  );
});

CyberInput.displayName = 'CyberInput';
export default CyberInput;
