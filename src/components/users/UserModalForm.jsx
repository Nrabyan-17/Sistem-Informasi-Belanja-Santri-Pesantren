import { useState, useEffect } from 'react';
import Modal from '../common/Modal';

const roleOptions = [
  { id: 'kabid',   label: 'Kabid BAK & Manajerial', color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0', dot: '🟢' },
  { id: 'staff',   label: 'Staff Rumah Koin',       color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe', dot: '🔵' },
];

// Modal Form Tambah / Ubah Profil Pengguna (Admin & Staff)
const UserModalForm = ({ isOpen, onClose, onSubmit, initialData = {} }) => {
  const isEdit = Boolean(initialData?.id);

  const [role, setRole] = useState('staff');
  const [nama, setNama] = useState('');
  const [username, setUsername] = useState('');
  const [status, setStatus] = useState('aktif');
  const [password, setPassword] = useState('');

  useEffect(() => {
    if (isOpen) {
      setRole(initialData.role || (isEdit ? 'kabid' : 'staff'));
      setNama(initialData.nama || '');
      setUsername(initialData.username || '');
      setStatus(String(initialData.status || 'aktif').toLowerCase());
      setPassword('');
    }
  }, [isOpen, initialData, isEdit]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit?.({
      ...initialData,
      role,
      nama,
      username,
      status,
      password,
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Ubah Profil Pengguna' : 'Tambah Pengguna Baru'}
      subtitle={
        isEdit
          ? 'Perbarui detail data, NIP / username, hak akses, atau sandi pengguna.'
          : 'Masukkan detail pengguna admin atau staff baru ke dalam sistem.'
      }
    >
      <form className="user-form-modal flex flex-col gap-3.5" onSubmit={handleSubmit}>
        {/* NAMA LENGKAP */}
        <div className="form-group-section flex flex-col gap-1">
          <label className="form-section-label text-[10px] font-bold tracking-wider text-slate-500 dark:text-slate-400 uppercase">
            NAMA LENGKAP
          </label>
          <input
            type="text"
            className="form-control-input w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-emerald-600 focus:bg-white dark:focus:bg-slate-900 transition-all"
            placeholder="Contoh: Ahmad Fauzi, S.Kom."
            value={nama}
            onChange={(e) => setNama(e.target.value)}
            required
          />
        </div>

        {/* NIP / USERNAME */}
        <div className="form-group-section flex flex-col gap-1">
          <label className="form-section-label text-[10px] font-bold tracking-wider text-slate-500 dark:text-slate-400 uppercase">
            NIP / USERNAME
          </label>
          <input
            type="text"
            className="form-control-input w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-emerald-600 focus:bg-white dark:focus:bg-slate-900 transition-all font-mono"
            placeholder="Masukkan NIP atau username login..."
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>

        {/* MASUKKAN PASSWORD (Tampil Saat Tambah Pengguna Baru) */}
        {!isEdit && (
          <div className="form-group-section flex flex-col gap-1">
            <label className="form-section-label text-[10px] font-bold tracking-wider text-slate-500 dark:text-slate-400 uppercase">
              MASUKKAN PASSWORD
            </label>
            <input
              type="password"
              className="form-control-input w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-emerald-600 focus:bg-white dark:focus:bg-slate-900 transition-all"
              placeholder="Masukkan password awal untuk login..."
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
        )}

        {/* STATUS AKUN & KEAMANAN SANDI (Hanya Tampil Saat Edit / Ubah Profil) */}
        {isEdit && (
          <div className="form-grid-2col grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="form-group-section flex flex-col gap-1">
              <label className="form-section-label text-[10px] font-bold tracking-wider text-slate-500 dark:text-slate-400 uppercase">
                STATUS AKUN
              </label>
              <div className="status-toggle-group flex gap-2">
                <button
                  type="button"
                  className={`status-toggle-btn flex-1 py-1.5 px-3 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
                    status === 'aktif'
                      ? 'status-toggle-btn--active bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                  onClick={() => setStatus('aktif')}
                >
                  Aktif
                </button>
                <button
                  type="button"
                  className={`status-toggle-btn flex-1 py-1.5 px-3 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
                    status === 'nonaktif'
                      ? 'status-toggle-btn--inactive bg-rose-600 text-white border-rose-600 shadow-2xs'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                  onClick={() => setStatus('nonaktif')}
                >
                  Nonaktif
                </button>
              </div>
            </div>

            <div className="form-group-section flex flex-col gap-1">
              <label className="form-section-label text-[10px] font-bold tracking-wider text-slate-500 dark:text-slate-400 uppercase">
                GANTI PASSWORD
              </label>
              <input
                type="password"
                className="form-control-input w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-emerald-600 focus:bg-white dark:focus:bg-slate-900 transition-all"
                placeholder="Kosongkan jika tidak diubah..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>
        )}

        {/* Form Actions */}
        <div className="modal-actions-footer flex justify-end gap-2.5 pt-3 mt-1 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            className="btn btn-secondary px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 font-bold rounded-xl text-xs transition-all cursor-pointer"
            onClick={onClose}
          >
            Batal
          </button>
          <button
            type="submit"
            className="btn btn-primary btn-save px-5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-xl text-xs shadow-xs transition-all cursor-pointer"
          >
            {isEdit ? 'Simpan Perubahan' : 'Tambah Pengguna'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default UserModalForm;
