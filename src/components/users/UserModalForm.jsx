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
      <form className="user-form-modal" onSubmit={handleSubmit}>
        {/* PERAN & HAK AKSES */}
        <div className="form-group-section">
          <label className="form-section-label">PERAN &amp; HAK AKSES</label>
          <div className="role-selector-grid">
            {roleOptions.map((item) => {
              const isSelected = role === item.id;
              return (
                <button
                  type="button"
                  key={item.id}
                  className={`role-option-card ${isSelected ? 'role-option-card--selected' : ''}`}
                  style={{
                    borderColor: isSelected ? item.color : '#e2e8f0',
                    backgroundColor: isSelected ? item.bg : '#ffffff',
                  }}
                  onClick={() => setRole(item.id)}
                >
                  <span className="role-option-dot" style={{ color: item.color }}>
                    ●
                  </span>
                  <span className="role-option-text">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* NAMA LENGKAP */}
        <div className="form-group-section">
          <label className="form-section-label">NAMA LENGKAP</label>
          <input
            type="text"
            className="form-control-input"
            placeholder="Contoh: Bpk. Ahmad Fauzi"
            value={nama}
            onChange={(e) => setNama(e.target.value)}
            required
          />
        </div>

        {/* USERNAME & NO TELEPHONE Grid */}
        <div className="form-grid-2col">
          <div className="form-group-section">
            <label className="form-section-label">USERNAME</label>
            <input
              type="text"
              className="form-control-input"
              placeholder="ahmad.fauzi"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="form-group-section">
            <label className="form-section-label">NO TELEPHONE</label>
            <input
              type="tel"
              className="form-control-input"
              placeholder="+6281268799981"
              value={noHp}
              onChange={(e) => setNoHp(e.target.value)}
            />
          </div>
        </div>

        {/* TAUTAN NIS SANTRI (jika role wali atau santri) */}
        {(role === 'wali' || role === 'santri') && (
          <div className="form-group-section">
            <label className="form-section-label">TAUTAN NIS SANTRI</label>
            <input
              type="text"
              className="form-control-input form-control-input--highlight"
              placeholder="Masukkan NIS..."
              value={nis}
              onChange={(e) => setNis(e.target.value)}
            />
          </div>
        )}

        {/* STATUS AKUN & KEAMANAN SANDI */}
        <div className={isEdit ? 'form-grid-2col' : 'form-group-section'}>
          <div className="form-group-section">
            <label className="form-section-label">STATUS AKUN</label>
            <div className="status-toggle-group">
              <button
                type="button"
                className={`status-toggle-btn ${status === 'aktif' ? 'status-toggle-btn--active' : ''}`}
                onClick={() => setStatus('aktif')}
              >
                Aktif
              </button>
              <button
                type="button"
                className={`status-toggle-btn ${status === 'nonaktif' ? 'status-toggle-btn--inactive' : ''}`}
                onClick={() => setStatus('nonaktif')}
              >
                Nonaktif
              </button>
            </div>
          </div>

          {isEdit && (
            <div className="form-group-section">
              <label className="form-section-label">KEAMANAN SANDI</label>
              <input
                type="password"
                className="form-control-input"
                placeholder="Password baru..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          )}
        </div>

        {/* Form Actions */}
        <div className="modal-actions-footer">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Batal
          </button>
          <button type="submit" className="btn btn-primary btn-save">
            Simpan Perubahan
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default UserModalForm;
