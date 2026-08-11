import { useState, useRef, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';

const ThemeToggle = () => {
  const { theme, setTheme, effectiveTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const options = [
    { id: 'light',  label: 'Terang', icon: '☀️' },
    { id: 'dark',   label: 'Gelap',  icon: '🌙' },
    { id: 'system', label: 'Sistem', icon: '💻' },
  ];

  const currentOption = options.find((o) => o.id === theme) || options[2];

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        className="flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-semibold transition-all cursor-pointer shadow-2xs"
        onClick={() => setIsOpen((prev) => !prev)}
        title="Ubah Tema Tampilan"
      >
        <span className="text-sm">{currentOption.icon}</span>
        <span className="hidden sm:inline-block">{currentOption.label}</span>
        <span className="text-[10px] opacity-60">▼</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-36 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl z-50 p-1.5 flex flex-col gap-1 animate-fadeIn">
          {options.map((opt) => {
            const isActive = theme === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                className={`flex items-center justify-between w-full px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 font-bold'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
                onClick={() => {
                  setTheme(opt.id);
                  setIsOpen(false);
                }}
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm">{opt.icon}</span>
                  <span>{opt.label}</span>
                </div>
                {isActive && <span className="text-emerald-600 dark:text-emerald-400 text-xs">✓</span>}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ThemeToggle;
