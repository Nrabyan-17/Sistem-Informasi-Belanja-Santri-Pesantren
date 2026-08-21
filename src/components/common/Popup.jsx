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
          <div className="modal-badge-bounce w-20 h-20 min-w-[80px] min-h-[80px] rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 text-3xl font-extrabold flex items-center justify-center mx-auto mb-5 shadow-lg shadow-emerald-900/10 ring-8 ring-emerald-50 dark:ring-emerald-900/20">
            ✓
          </div>
        );
      case 'error':
        return (
          <div className="modal-badge-bounce w-20 h-20 min-w-[80px] min-h-[80px] rounded-full bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 text-3xl font-extrabold flex items-center justify-center mx-auto mb-5 shadow-lg shadow-rose-900/10 ring-8 ring-rose-50 dark:ring-rose-900/20">
            ✕
          </div>
        );
      case 'info':
      default:
        return (
          <div className="modal-badge-bounce w-20 h-20 min-w-[80px] min-h-[80px] rounded-full bg-sky-100 dark:bg-sky-950/80 text-sky-600 dark:text-sky-400 flex items-center justify-center mx-auto mb-5 shadow-lg shadow-sky-900/10 ring-8 ring-sky-50 dark:ring-sky-900/20">
            <svg className="w-9 h-9 text-sky-600 dark:text-sky-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
    }
  };

  const getButtonClass = () => {
    switch (type) {
      case 'success':
        return 'bg-[#0e5d26] hover:bg-[#0b471d] text-white shadow-emerald-950/20';
      case 'error':
        return 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/20';
      case 'info':
      default:
        return 'bg-[#0e5d26] hover:bg-[#0b471d] text-white shadow-emerald-950/20';
    }
  };

  return (
    <div
      className="fixed inset-0 z-[99999] bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="modal-animate-pop bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl max-w-md w-full shadow-2xl relative text-center flex flex-col items-center transition-colors"
        style={{ padding: '36px 28px 28px 28px' }}
        onClick={(e) => e.stopPropagation()}
      >
        {getIcon()}
        
        <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight mb-2">
          {title}
        </h3>
        
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed px-2 mb-6">
          {message}
        </p>

        <button
          type="button"
          onClick={onClose}
          className={`w-full h-12 py-3 font-extrabold rounded-xl text-sm shadow-lg transition-all cursor-pointer flex items-center justify-center active:scale-[0.99] ${getButtonClass()}`}
        >
          Mengerti &amp; Tutup
        </button>
      </div>
    </div>
  );
};

export default Popup;
