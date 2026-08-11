// Modal Dialog Reusable
const Modal = ({ isOpen, onClose, title, subtitle, children }) => {
  if (!isOpen) return null;

  return (
    <div
      className="modal-overlay fixed inset-0 z-50 bg-slate-900/60 dark:bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="modal-content bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 max-w-xl w-full border border-slate-100 dark:border-slate-800 shadow-2xl relative my-auto animate-scaleUp text-slate-800 dark:text-slate-100 transition-colors duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header flex items-start justify-between pb-4 mb-5 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">{title}</h3>
            {subtitle && <p className="modal-subtitle text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">{subtitle}</p>}
          </div>
          <button
            className="modal-close p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors text-base cursor-pointer"
            onClick={onClose}
          >
            ✕
          </button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
};

export default Modal;
