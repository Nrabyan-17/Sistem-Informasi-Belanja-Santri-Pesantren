import { useEffect } from 'react';

const Popup = ({ isOpen, type, title, message, onClose }) => {
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case 'success':
        return (
          <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-400 flex items-center justify-center shrink-0 mb-4 mx-auto">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        );
      case 'error':
        return (
          <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 dark:bg-rose-900/50 dark:text-rose-400 flex items-center justify-center shrink-0 mb-4 mx-auto">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        );
      case 'info':
      default:
        return (
          <div className="w-12 h-12 rounded-full bg-sky-100 text-sky-600 dark:bg-sky-900/50 dark:text-sky-400 flex items-center justify-center shrink-0 mb-4 mx-auto">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
    }
  };

  const getButtonClass = () => {
    switch (type) {
      case 'success':
        return 'bg-emerald-600 hover:bg-emerald-700 text-white';
      case 'error':
        return 'bg-rose-600 hover:bg-rose-700 text-white';
      case 'info':
      default:
        return 'bg-sky-600 hover:bg-sky-700 text-white';
    }
  };

  return (
    <div className="fixed inset-0 z-[99999] bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
      <div 
        className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-sm overflow-hidden transform scale-100 animate-pop origin-center transition-all duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 text-center">
          {getIcon()}
          
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
            {title}
          </h3>
          
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
            {message}
          </p>

          <button
            onClick={onClose}
            className={`w-full py-3 px-4 rounded-xl font-bold text-sm shadow-sm transition-all focus:outline-none focus:ring-4 focus:ring-opacity-50 ${getButtonClass()}`}
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};

export default Popup;
