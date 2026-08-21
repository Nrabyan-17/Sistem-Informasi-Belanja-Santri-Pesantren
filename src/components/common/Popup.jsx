import { useEffect } from 'react';

const Popup = ({ isOpen, type = 'info', title, message, onClose }) => {
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && isOpen) onClose?.();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case 'success':
        return (
          <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mb-4 mx-auto shadow-sm border border-emerald-200/60 dark:border-emerald-800/60">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        );
      case 'error':
        return (
          <div className="w-14 h-14 rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 mb-4 mx-auto shadow-sm border border-rose-200/60 dark:border-rose-800/60">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        );
      case 'info':
      default:
        return (
          <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0 mb-4 mx-auto shadow-sm border border-emerald-200/60 dark:border-emerald-800/60">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
    }
  };

  const getButtonClass = () => {
    switch (type) {
      case 'success':
        return 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20';
      case 'error':
        return 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/20';
      case 'info':
      default:
        return 'bg-emerald-800 hover:bg-emerald-900 text-white shadow-emerald-900/20';
    }
  };

  return (
    <div
      className="fixed inset-0 z-[99999] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden p-6 sm:p-7 border border-slate-100 dark:border-slate-800 text-center animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        {getIcon()}
        
        <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-2">
          {title}
        </h3>
        
        <p className="text-sm text-slate-600 dark:text-slate-300 mb-6 leading-relaxed px-1">
          {message}
        </p>

        <button
          type="button"
          onClick={onClose}
          className={`w-full py-3 px-5 rounded-2xl font-bold text-sm shadow-md transition-all cursor-pointer focus:outline-none focus:ring-4 focus:ring-emerald-500/20 ${getButtonClass()}`}
        >
          Tutup
        </button>
      </div>
    </div>
  );
};

export default Popup;
