import { useState, useEffect } from 'react';
import Modal from '../common/Modal';

const roleOptions = [
  { id: 'kabid',   label: 'Kabid BAK & Manajerial', color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0', dot: '🟢' },
  { id: 'staff',   label: 'Staff Rumah Koin',       color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe', dot: '🔵' },
  { id: 'wali',    label: 'Wali Santri / Wali',     color: '#9333ea', bg: '#faf5ff', border: '#e9d5ff', dot: '🟣' },
  { id: 'santri',  label: 'Santri',                 color: '#ea580c', bg: '#fff7ed', border: '#ffedd5', dot: '🟠' },
];

// Modal Form Tambah / Ubah Profil Pengguna (Modal 1 & Modal 2)
const UserModalForm = ({ isOpen, onClose, onSubmit, initialData = {} }) => {
  const isEdit = Boolean(initialData?.id);

  const [role, setRole] = useState('wali');
  const [nama, setNama] = useState('');
  const [username, setUsername] = useState('');
  const [noHp, setNoHp] = useState('');
  const [nis, setNis] = useState('');
  const [status, setStatus] = useState('aktif');
  const [password, setPassword] = useState('');

  useEffect(() => {
    if (isOpen) {
      setRole(initialData.role || (isEdit ? 'kabid' : 'wali'));
      setNama(initialData.nama || '');
      setUsername(initialData.username || '');
      setNoHp(initialData.noHp || '');
      setNis(initialData.nis || '');
      setStatus(initialData.status || 'aktif');
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
      noHp,
      nis,
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
          ? 'Perbarui detail data, hak akses, atau sandi pengguna.'
          : 'Masukkan detail pengguna baru ke dalam sistem.'
      }
    >
      <form className="user-form-modal flex flex-col gap-5" onSubmit={handleSubmit}>
        {/* PERAN & HAK AKSES */}
        <div className="form-group-section flex flex-col gap-1.5">
          <label className="form-section-label text-xs font-bold tracking-wider text-slate-500 uppercase">
            PERAN &amp; HAK AKSES
          </label>
          <div className="role-selector-grid grid grid-cols-1 sm:grid-cols-2 gap-3">
            {roleOptions.map((item) => {
              const isSelected = role === item.id;
              return (
                <button
                  type="button"
                  key={item.id}
                  className={`role-option-card flex items-center gap-2.5 p-3 rounded-xl border-2 transition-all cursor-pointer text-left text-sm font-semibold ${
                    isSelected ? 'shadow-xs scale-[1.01]' : 'hover:bg-slate-50'
                  }`}
                  style={{
                    borderColor: isSelected ? item.color : '#e2e8f0',
                    backgroundColor: isSelected ? item.bg : '#ffffff',
                  }}
                  onClick={() => setRole(item.id)}
                >
                  <span className="role-option-dot text-xs" style={{ color: item.color }}>
                    ●
                  </span>
                  <span className="role-option-text flex-1 text-slate-800">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* NAMA LENGKAP */}
        <div className="form-group-section flex flex-col gap-1.5">
          <label className="form-section-label text-xs font-bold tracking-wider text-slate-500 uppercase">
            NAMA LENGKAP
          </label>
          <input
            type="text"
            className="form-control-input w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-emerald-600 focus:bg-white focus:ring-3 focus:ring-emerald-600/10 transition-all"
            placeholder="Contoh: Bpk. Ahmad Fauzi"
            value={nama}
            onChange={(e) => setNama(e.target.value)}
            required
          />
        </div>

        {/* USERNAME & NO TELEPHONE Grid */}
        <div className="form-grid-2col grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="form-group-section flex flex-col gap-1.5">
            <label className="form-section-label text-xs font-bold tracking-wider text-slate-500 uppercase">
              USERNAME
            </label>
            <input
              type="text"
              className="form-control-input w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-emerald-600 focus:bg-white focus:ring-3 focus:ring-emerald-600/10 transition-all"
              placeholder="ahmad.fauzi"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="form-group-section flex flex-col gap-1.5">
            <label className="form-section-label text-xs font-bold tracking-wider text-slate-500 uppercase">
              NO TELEPHONE
            </label>
            <input
              type="tel"
              className="form-control-input w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-emerald-600 focus:bg-white focus:ring-3 focus:ring-emerald-600/10 transition-all"
              placeholder="+6281268799981"
              value={noHp}
              onChange={(e) => setNoHp(e.target.value)}
            />
          </div>
        </div>

        {/* TAUTAN NIS SANTRI (jika role wali atau santri) */}
        {(role === 'wali' || role === 'santri') && (
          <div className="form-group-section flex flex-col gap-1.5">
            <label className="form-section-label text-xs font-bold tracking-wider text-slate-500 uppercase">
              TAUTAN NIS SANTRI
            </label>
            <input
              type="text"
              className="form-control-input form-control-input--highlight w-full px-4 py-3 bg-emerald-50/50 border border-emerald-300 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-emerald-600 focus:bg-white focus:ring-3 focus:ring-emerald-600/10 transition-all"
              placeholder="Masukkan NIS..."
              value={nis}
              onChange={(e) => setNis(e.target.value)}
            />
          </div>
        )}

        {/* STATUS AKUN & KEAMANAN SANDI */}
        <div className={isEdit ? 'form-grid-2col grid grid-cols-1 sm:grid-cols-2 gap-4' : 'form-group-section flex flex-col gap-1.5'}>
          <div className="form-group-section flex flex-col gap-1.5">
            <label className="form-section-label text-xs font-bold tracking-wider text-slate-500 uppercase">
              STATUS AKUN
            </label>
            <div className="status-toggle-group flex gap-2">
              <button
                type="button"
                className={`status-toggle-btn flex-1 py-2.5 px-4 rounded-xl border text-sm font-semibold transition-all ${
                  status === 'aktif'
                    ? 'status-toggle-btn--active bg-emerald-600 text-white border-emerald-600 shadow-xs'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
                onClick={() => setStatus('aktif')}
              >
                Aktif
              </button>
              <button
                type="button"
                className={`status-toggle-btn flex-1 py-2.5 px-4 rounded-xl border text-sm font-semibold transition-all ${
                  status === 'nonaktif'
                    ? 'status-toggle-btn--inactive bg-rose-600 text-white border-rose-600 shadow-xs'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
                onClick={() => setStatus('nonaktif')}
              >
                Nonaktif
              </button>
            </div>
          </div>

          {isEdit && (
            <div className="form-group-section flex flex-col gap-1.5">
              <label className="form-section-label text-xs font-bold tracking-wider text-slate-500 uppercase">
                KEAMANAN SANDI
              </label>
              <input
                type="password"
                className="form-control-input w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-emerald-600 focus:bg-white focus:ring-3 focus:ring-emerald-600/10 transition-all"
                placeholder="Password baru..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          )}
        </div>

        {/* Form Actions */}
        <div className="modal-actions-footer flex justify-end gap-3 pt-4 mt-2 border-t border-slate-100">
          <button
            type="button"
            className="btn btn-secondary px-5 py-2.5 bg-slate-100 text-slate-700 hover:bg-slate-200 font-bold rounded-xl text-sm transition-all"
            onClick={onClose}
          >
            Batal
          </button>
          <button
            type="submit"
            className="btn btn-primary btn-save px-6 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-xl text-sm shadow-md transition-all"
          >
            Simpan Perubahan
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default UserModalForm;
