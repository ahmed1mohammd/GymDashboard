import React, { createContext, useState, useContext, useEffect } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  // Theme mode: dark (default) vs light
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme-mode');
    return saved !== 'light';
  });

  // Effect to apply theme colors and mode class
  useEffect(() => {
    const root = document.documentElement;
    
    // Inject permanent brand colors matching Flexora Cyberpunk-Luxury
    root.style.setProperty('--theme-primary', '#e50914'); 
    root.style.setProperty('--theme-secondary', isDarkMode ? '#0f0f0f' : '#000000');
    root.style.setProperty('--theme-tertiary', '#10b981');
  }, [isDarkMode]);

  useEffect(() => {
    const root = document.documentElement;
    localStorage.setItem('theme-mode', isDarkMode ? 'dark' : 'light');

    if (isDarkMode) {
      root.classList.add('dark');
      root.classList.remove('light');
      
      // Set Dark mode root variables matching Flexora Cinematic Dark
      root.style.setProperty('--color-bg-main', '#050505');
      root.style.setProperty('--color-bg-darker', '#0c0c0c');
      root.style.setProperty('--color-bg-card', 'rgba(15, 15, 15, 0.7)');
      root.style.setProperty('--color-border-main', 'rgba(255, 255, 255, 0.08)');
      root.style.setProperty('--color-border-active', 'rgba(229, 9, 20, 0.35)');
      root.style.setProperty('--color-text-main', '#f5f5f5');
      root.style.setProperty('--color-text-muted', '#9ca3af');
      root.style.setProperty('--bg-image-dynamic', 'radial-gradient(circle at top right, rgba(229, 9, 20, 0.04), transparent 60%), radial-gradient(circle at bottom left, rgba(16, 185, 129, 0.02), transparent 50%)');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');

      // Set Light mode root variables exactly as user specified (Background white, text black/red)
      root.style.setProperty('--color-bg-main', '#ffffff');
      root.style.setProperty('--color-bg-darker', '#f8fafc');
      root.style.setProperty('--color-bg-card', '#ffffff');
      root.style.setProperty('--color-border-main', 'rgba(0, 0, 0, 0.15)');
      root.style.setProperty('--color-border-active', '#e50914');
      root.style.setProperty('--color-text-main', '#000000');
      root.style.setProperty('--color-text-muted', '#e50914');
      root.style.setProperty('--bg-image-dynamic', 'none');
    }
  }, [isDarkMode]);

  const toggleThemeMode = () => {
    setIsDarkMode((prev) => !prev);
  };

  return (
    <ThemeContext.Provider value={{ colors: { primary: '#e50914', secondary: '#0f0f0f', tertiary: '#10b981' }, isDarkMode, toggleThemeMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
