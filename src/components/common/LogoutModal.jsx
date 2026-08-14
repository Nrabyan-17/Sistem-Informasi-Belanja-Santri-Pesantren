import React from 'react';
import Modal from './Modal';

// Modal Pop-Up Konfirmasi Keluar (Logout Confirmation Modal)
const LogoutModal = ({ isOpen, onClose, onConfirm }) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Konfirmasi Keluar"
      subtitle="Apakah Anda yakin ingin keluar dari sistem?"
    >
      <div className="logout-modal-content flex flex-col items-center text-center py-4 px-2">
        {/* Logout Icon Circle */}
        <div className="logout-icon-wrapper w-16 h-16 rounded-full bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800/60 flex items-center justify-center text-3xl mb-4 text-rose-600 dark:text-rose-400 shadow-sm animate-pulse">
          🚪
        </div>

        <h4 className="text-base font-extrabold text-slate-800 dark:text-slate-100 mb-1.5">
          Anda akan keluar dari akun
        </h4>

        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs leading-relaxed">
          Sesi aktif Anda akan diakhiri. Anda perlu memasukkan nama pengguna dan kata sandi kembali untuk mengakses sistem.
        </p>

        {/* Garis Pembatas (Divider Line) dengan Jarak (Gap) Yang Jelas */}
        <div className="w-full h-px bg-slate-200 dark:bg-slate-800 my-6"></div>

        {/* Action Buttons */}
        <div className="logout-action-buttons w-full flex items-center justify-end gap-4 sm:gap-5 mt-4">
          <button
            type="button"
            onClick={onClose}
            className="btn-logout-cancel h-11 sm:h-12 px-6 sm:px-7 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-sm font-bold hover:bg-slate-100 dark:hover:bg-slate-700 transition-all cursor-pointer min-w-[110px]"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="btn-logout-confirm h-11 sm:h-12 px-7 sm:px-8 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-sm font-extrabold shadow-lg shadow-rose-600/30 transition-all cursor-pointer flex items-center justify-center gap-2 min-w-[140px]"
          >
            <span>Ya, Keluar</span>
            <span className="text-base">➔</span>
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default LogoutModal;
