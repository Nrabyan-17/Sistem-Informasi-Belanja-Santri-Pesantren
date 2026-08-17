import { useTheme } from '../../context/ThemeContext';

const ThemeToggle = () => {
  const { theme, setTheme, effectiveTheme } = useTheme();

  // Urutan siklus tema: light -> dark -> system -> light
  const themeCycle = ['light', 'dark', 'system'];

  const cycleTheme = () => {
    const currentIndex = themeCycle.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themeCycle.length;
    setTheme(themeCycle[nextIndex]);
  };

  const isDark = effectiveTheme === 'dark';

  const getThemeInfo = () => {
    switch (theme) {
      case 'light':
        return {
          tooltip: 'Tema: Terang (Klik untuk Gelap)',
          icon: (
            <svg className="w-5 h-5 text-amber-500 transition-transform duration-300 group-hover:rotate-45" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          ),
        };
      case 'dark':
        return {
          tooltip: 'Tema: Gelap (Klik untuk Sistem)',
          icon: (
            <svg className="w-5 h-5 text-indigo-400 transition-transform duration-300 group-hover:-rotate-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          ),
        };
      case 'system':
      default:
        return {
          tooltip: `Tema: Sistem (${isDark ? 'Gelap' : 'Terang'}) (Klik untuk Terang)`,
          icon: (
            <svg className={`w-5 h-5 ${isDark ? 'text-emerald-400' : 'text-emerald-600'} transition-transform duration-300 group-hover:scale-110`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          ),
        };
    }
  };

  const current = getThemeInfo();

  return (
    <button
      type="button"
      className={`group relative w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-xl border transition-all duration-200 cursor-pointer shadow-2xs hover:scale-105 active:scale-95 ${
        isDark
          ? 'bg-slate-800 border-slate-700/80 text-slate-200 hover:bg-slate-700/80'
          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
      }`}
      onClick={cycleTheme}
      title={current.tooltip}
      aria-label={current.tooltip}
    >
      {current.icon}
    </button>
  );
};

export default ThemeToggle;
