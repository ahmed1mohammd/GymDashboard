import React, { useState, useEffect } from 'react';
import { Bell, Sun, Moon, Menu } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

export const Navbar = ({ onToggleSidebar }) => {
  const { user } = useAuth();
  const { isDarkMode, toggleThemeMode } = useTheme();
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedDate = time.toLocaleDateString('ar-EG', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const formattedTime = time.toLocaleTimeString('ar-EG', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  return (
    <header className="h-20 bg-[rgba(10,10,15,0.4)] border-b border-[var(--color-cyber-border)] px-4 sm:px-8 flex items-center justify-between backdrop-blur-md sticky top-0 z-30 transition-all duration-300">
      {/* Mobile Sidebar Hamburger Trigger & Date */}
      <div className="flex items-center gap-3 sm:gap-6">
        {/* Hamburger Menu Toggle (Only visible on mobile/tablet) */}
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-xl border border-[var(--color-cyber-border)] text-gray-400 hover:text-white lg:hidden transition-all duration-300 cursor-pointer"
          title="القائمة الرئيسية"
        >
          <Menu size={18} />
        </button>

        <div className="flex flex-col">
          <span className="text-[10px] sm:text-xs text-gray-500 font-semibold">{formattedDate}</span>
          <span className="text-xs sm:text-sm font-bold text-[var(--theme-primary)] mt-0.5 tracking-wider">
            {formattedTime}
          </span>
        </div>
      </div>

      {/* System Status and Alerts */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Status Indicator */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 shadow-[0_0_10px_rgba(229,9,20,0.05)]">
          <div className="w-2 h-2 rounded-full bg-[var(--theme-primary)] animate-ping" />
          <span className="text-[10px] font-bold text-[var(--theme-primary)] select-none">
            النظام نشط
          </span>
        </div>

        {/* Dark/Light Mode Toggle */}
        <button
          onClick={toggleThemeMode}
          className="p-2 rounded-xl border border-[var(--color-cyber-border)] hover:border-[var(--theme-primary)]/50 bg-[rgba(16,18,27,0.3)] text-gray-400 hover:text-white transition-all duration-300 cursor-pointer shadow-[0_0_10px_rgba(229,9,20,0.02)]"
          title={isDarkMode ? "الوضع المضيء" : "الوضع المظلم"}
        >
          {isDarkMode ? <Sun size={18} className="text-amber-400 animate-pulse" /> : <Moon size={18} className="text-indigo-500 animate-pulse" />}
        </button>

        {/* Notifications */}
        <button className="relative p-2 rounded-xl border border-[var(--color-cyber-border)] hover:border-[var(--theme-primary)]/50 bg-[rgba(16,18,27,0.3)] text-gray-400 hover:text-white transition-all duration-300 shadow-[0_0_10px_rgba(229,9,20,0.02)] cursor-pointer">
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[var(--theme-primary)] shadow-[0_0_5px_rgba(229,9,20,0.8)]" />
        </button>
      </div>
    </header>
  );
};

export default Navbar;
