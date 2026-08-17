import { useState } from 'react';
import Modal from './Modal';
import { authApi } from '../../utils/api';
import { usePopup } from '../../context/PopupContext';

const ChangePasswordModal = ({ isOpen, onClose }) => {
  const { showPopup } = usePopup();
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!oldPassword) {
      showPopup('Peringatan', 'Masukkan password lama Anda.', 'info');
      return;
    }
    if (newPassword.length < 6) {
      showPopup('Peringatan', 'Password baru minimal 6 karakter.', 'info');
      return;
    }
    if (newPassword !== confirmPassword) {
      showPopup('Peringatan', 'Konfirmasi password baru tidak cocok.', 'info');
      return;
    }

    setIsSubmitting(true);
    try {
      await authApi.changePassword({
        password_lama: oldPassword,
        password_baru: newPassword,
        konfirmasi: confirmPassword,
      });
      showPopup('Berhasil', 'Password berhasil diperbarui!', 'success');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      onClose();
    } catch (err) {
      showPopup('Gagal', err.message || 'Gagal memperbarui password.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Ganti Password"
      subtitle="Masukkan password lama dan password baru untuk memperbarui kata sandi akun Anda."
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-5 py-2">
        <div className="flex flex-col gap-2">
          <label className="text-xs font-extrabold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
            Password Lama
          </label>
          <input
            type="password"
            placeholder="Masukkan password saat ini..."
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            className="w-full px-5 sm:px-6 py-3 sm:py-3.5 h-12 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl sm:rounded-2xl text-sm font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:border-emerald-600 focus:bg-white dark:focus:bg-slate-900 transition-all"
            required
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xs font-extrabold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
            Password Baru
          </label>
          <input
            type="password"
            placeholder="Minimal 6 karakter..."
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full px-5 sm:px-6 py-3 sm:py-3.5 h-12 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl sm:rounded-2xl text-sm font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:border-emerald-600 focus:bg-white dark:focus:bg-slate-900 transition-all"
            required
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xs font-extrabold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
            Konfirmasi Password Baru
          </label>
          <input
            type="password"
            placeholder="Ketik ulang password baru..."
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full px-5 sm:px-6 py-3 sm:py-3.5 h-12 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl sm:rounded-2xl text-sm font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:border-emerald-600 focus:bg-white dark:focus:bg-slate-900 transition-all"
            required
          />
        </div>

        <div className="flex justify-end items-center gap-3 sm:gap-4 pt-4 mt-3 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-6 sm:px-7 py-3 sm:py-3.5 h-11 sm:h-12 min-w-[100px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 font-extrabold rounded-xl sm:rounded-2xl text-xs sm:text-sm transition-all cursor-pointer flex items-center justify-center"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 sm:px-8 py-3 sm:py-3.5 h-11 sm:h-12 min-w-[190px] bg-emerald-800 hover:bg-emerald-900 text-white font-extrabold rounded-xl sm:rounded-2xl text-xs sm:text-sm shadow-md shadow-emerald-900/10 transition-all cursor-pointer disabled:opacity-60 flex items-center justify-center"
          >
            {isSubmitting ? 'Menyimpan...' : 'Simpan Password Baru'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default ChangePasswordModal;
