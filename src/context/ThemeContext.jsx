import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  // Mode yang dipilih: 'light' | 'dark' | 'system'
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('app-theme') || 'system';
  });

  const [systemIsDark, setSystemIsDark] = useState(() => {
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Listener perubahan tema sistem (OS)
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => {
      setSystemIsDark(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Tentukan tema efektif yang sedang berjalan ('light' atau 'dark')
  const effectiveTheme = theme === 'system' ? (systemIsDark ? 'dark' : 'light') : theme;

  useEffect(() => {
    localStorage.setItem('app-theme', theme);

    // Terapkan class 'dark' dan atribut 'data-theme' ke element <html>
    const root = document.documentElement;
    if (effectiveTheme === 'dark') {
      root.classList.add('dark');
      root.setAttribute('data-theme', 'dark');
    } else {
      root.classList.remove('dark');
      root.setAttribute('data-theme', 'light');
    }
  }, [theme, effectiveTheme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, effectiveTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme harus digunakan di dalam ThemeProvider');
  }
  return context;
};

export default ThemeContext;
