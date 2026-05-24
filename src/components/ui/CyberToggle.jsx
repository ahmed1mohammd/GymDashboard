import React from 'react';
import clsx from 'clsx';

export const CyberToggle = ({ checked, onChange, label, activeLabel = 'نشط', inactiveLabel = 'غير نشط' }) => {
  return (
    <div className="flex items-center gap-3 select-none cursor-pointer" onClick={() => onChange(!checked)}>
      <div className="relative">
        {/* Track */}
        <div
          className={clsx(
            'w-14 h-7 rounded-full border transition-all duration-300',
            checked
              ? 'bg-emerald-500/20 border-emerald-500/50 shadow-[0_0_10px_rgba(16,185,129,0.2)]'
              : 'bg-gray-800/60 border-gray-700'
          )}
        />
        {/* Thumb */}
        <div
          className={clsx(
            'absolute top-1 w-5 h-5 rounded-full transition-all duration-300',
            checked
              ? 'right-8 bg-[var(--color-neon-emerald)] shadow-[0_0_8px_rgba(16,185,129,0.8)]'
              : 'right-1 bg-gray-500'
          )}
        />
      </div>
      
      {label && (
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-white">{label}</span>
          <span className={clsx('text-[10px] font-bold tracking-wider mt-0.5', checked ? 'text-emerald-400' : 'text-gray-500')}>
            {checked ? activeLabel : inactiveLabel}
          </span>
        </div>
      )}
    </div>
  );
};

export default CyberToggle;
