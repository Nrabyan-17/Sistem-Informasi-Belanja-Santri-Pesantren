import Modal from '../common/Modal';

// Modal Form Tambah / Edit Data Santri
const UserModalForm = ({ isOpen, onClose, onSubmit, initialData = {} }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={initialData?.id ? 'Edit Santri' : 'Tambah Santri Baru'}>
      <form
        className="user-form"
        onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(e.target);
          onSubmit?.(Object.fromEntries(formData));
        }}
      >
        <div className="form-group">
          <label>NIS</label>
          <input name="nis" type="text" defaultValue={initialData.nis} required />
        </div>
        <div className="form-group">
          <label>Nama Santri</label>
          <input name="nama" type="text" defaultValue={initialData.nama} required />
        </div>
        <div className="form-group">
          <label>Kelas</label>
          <input name="kelas" type="text" defaultValue={initialData.kelas} />
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

export default UserModalForm;
