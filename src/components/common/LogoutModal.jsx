import React from 'react';

// Modal Pop-Up Konfirmasi Keluar (Logout Confirmation Modal)
const LogoutModal = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[99999] bg-slate-950/50 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="modal-animate-pop bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full shadow-2xl relative text-center flex flex-col items-center border border-slate-100 dark:border-slate-800 transition-colors"
        style={{ padding: '44px 36px 36px 36px' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Icon Box (Warna Merah dengan Animasi Pop) */}
        <div
          className="modal-badge-bounce rounded-2xl bg-red-50 dark:bg-red-950/60 border border-red-100 dark:border-red-900/50 flex items-center justify-center shrink-0 shadow-xs"
          style={{ width: '64px', height: '64px', marginBottom: '24px' }}
        >
          <svg
            className="text-red-600 dark:text-red-400"
            style={{ width: '32px', height: '32px' }}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2.2"
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
          </svg>
        </div>

        {/* Title & Subtitle */}
        <h3
          className="font-extrabold text-slate-900 dark:text-slate-100 tracking-tight"
          style={{ fontSize: '22px', marginBottom: '10px' }}
        >
          Konfirmasi Keluar
        </h3>
        <p
          className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed"
          style={{ fontSize: '15px', maxWidth: '300px', marginBottom: '28px' }}
        >
          Apakah Anda yakin ingin mengakhiri sesi Anda saat ini?
        </p>

        {/* Garis Pembatas (Divider) */}
        <div
          className="w-full border-t border-slate-200 dark:border-slate-800"
          style={{ marginBottom: '24px' }}
        />

        {/* Action Buttons */}
        <div className="flex items-center w-full" style={{ gap: '14px' }}>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 active:scale-95 hover:scale-[1.02] text-slate-700 dark:text-slate-200 font-bold rounded-2xl transition-all duration-150 cursor-pointer shadow-2xs flex items-center justify-center"
            style={{ height: '50px', fontSize: '15px' }}
          >
            Batal
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 bg-[#c61d23] hover:bg-[#a8161b] active:scale-95 hover:scale-[1.02] text-white font-bold rounded-2xl shadow-md shadow-red-900/20 transition-all duration-150 cursor-pointer flex items-center justify-center"
            style={{ height: '50px', fontSize: '15px' }}
          >
            Keluar
          </button>
        </div>
      </div>
    </div>
  );
};

export default LogoutModal;