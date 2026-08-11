import Modal from '../common/Modal';

// Modal Form Tambah / Edit Data Staff
const StaffModalForm = ({ isOpen, onClose, onSubmit, initialData = {} }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={initialData?.id ? 'Edit Staff' : 'Tambah Staff Baru'}>
      <form
        className="user-form"
        onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(e.target);
          onSubmit?.(Object.fromEntries(formData));
        }}
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
          <label>No. Handphone</label>
          <input name="noHp" type="tel" defaultValue={initialData.noHp} placeholder="08xx-xxxx-xxxx" />
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
        <div className="form-actions">
          <button type="button" className="btn btn-secondary" onClick={onClose}>Batal</button>
          <button type="submit" className="btn btn-primary">Simpan</button>
        </div>
      </form>
    </Modal>
  );
};

export default StaffModalForm;
