// Modal Dialog Reusable
const Modal = ({ isOpen, onClose, title, subtitle, maxWidth = 'max-w-xl', children }) => {
  if (!isOpen) return null;

  return (
    <div
      className="modal-overlay fixed inset-0 z-[99999] bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fadeIn"
      onClick={onClose}
    >
      <div
        className={`modal-content modal-animate-pop bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl p-6 sm:p-8 ${maxWidth} w-full max-h-[88vh] flex flex-col border border-slate-200 dark:border-slate-800 shadow-2xl relative my-auto text-slate-800 dark:text-slate-100 transition-colors duration-200`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - Fixed at Top */}
        <div className="modal-header flex items-start justify-between pb-3 mb-3 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div>
            <h3 className="text-lg sm:text-xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">{title}</h3>
            {subtitle && <p className="modal-subtitle text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">{subtitle}</p>}
          </div>
          <button
            className="modal-close p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-sm cursor-pointer ml-2"
            onClick={onClose}
            aria-label="Tutup Modal"
          >
            ✕
          </button>
        </div>

        {/* Body - Scrollable inside if content is tall */}
        <div className="modal-body flex-1 overflow-y-auto text-sm custom-scrollbar">{children}</div>
      </div>
    </div>
  );
};

export default Modal;
