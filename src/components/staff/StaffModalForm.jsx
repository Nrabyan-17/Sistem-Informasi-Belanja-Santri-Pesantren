import { useState } from 'react';
import Modal from '../common/Modal';

// Modal Form Tambah / Edit Data Staff
const StaffModalForm = ({ isOpen, onClose, onSubmit, initialData = {} }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    setIsSubmitting(true);
    try {
      await onSubmit?.(Object.fromEntries(formData));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={initialData?.id ? 'Edit Staff' : 'Tambah Staff Baru'}>
      <form
        className="user-form"
        onSubmit={handleSubmit}
      >
        <div className="form-group">
          <label>NIP</label>
          <input name="nip" type="text" defaultValue={initialData.nip} placeholder="Masukkan NIP" required />
        </div>
        <div className="form-group">
          <label>Nama Staff</label>
          <input name="nama" type="text" defaultValue={initialData.nama} placeholder="Masukkan nama lengkap" required />
        </div>
        <div className="form-group">
          <label>Jabatan</label>
          <select name="jabatan" defaultValue={initialData.jabatan || 'Kasir'}>
            <option value="Kasir">Kasir</option>
            <option value="Admin">Admin</option>
            <option value="Supervisor">Supervisor</option>
            <option value="Manajer">Manajer</option>
          </select>
        </div>
        <div className="form-group">
          <label>Shift</label>
          <select name="shift" defaultValue={initialData.shift || 'Pagi'}>
            <option value="Pagi">Pagi (07:00 - 14:00)</option>
            <option value="Siang">Siang (14:00 - 21:00)</option>
            <option value="Full">Full Day</option>
          </select>
        </div>
        <div className="form-group">
          <label>Status</label>
          <select name="status" defaultValue={initialData.status || 'aktif'}>
            <option value="aktif">Aktif</option>
            <option value="nonaktif">Non-Aktif</option>
          </select>
        </div>
        <div className="form-actions flex items-center justify-end gap-3 pt-3">
          <button type="button" disabled={isSubmitting} className="btn btn-secondary disabled:opacity-60" onClick={onClose}>Batal</button>
          <button type="submit" disabled={isSubmitting} className="btn btn-primary disabled:opacity-60 flex items-center justify-center gap-2">
            {isSubmitting ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Memproses...</span>
              </>
            ) : (
              <span>Simpan</span>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default StaffModalForm;
