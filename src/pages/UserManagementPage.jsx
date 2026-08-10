import { useState } from 'react';
import MainLayout from '../components/layout/MainLayout';
import UserTable from '../components/users/UserTable';
import UserModalForm from '../components/users/UserModalForm';

const mockSantri = [
  { id: 1, nis: '123456', nama: 'Ahmad Fauzi', kelas: 'VII A', status: 'aktif', saldo: 50000 },
  { id: 2, nis: '123457', nama: 'Budi Santoso', kelas: 'VIII B', status: 'aktif', saldo: 75000 },
  { id: 3, nis: '123458', nama: 'Citra Dewi', kelas: 'IX A', status: 'nonaktif', saldo: 0 },
];

const UserManagementPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editData, setEditData] = useState({});

  const handleEdit = (santri) => {
    setEditData(santri);
    setIsModalOpen(true);
  };

  const handleDelete = (santri) => {
    if (confirm(`Hapus santri ${santri.nama}?`)) {
      console.log('Hapus:', santri);
      // TODO: Implementasi delete
    }
  };

  const handleSubmit = (data) => {
    console.log('Submit:', data);
    setIsModalOpen(false);
    // TODO: Implementasi simpan data
  };

  return (
    <MainLayout pageTitle="Manajemen Pengguna">
      <div className="page-actions">
        <div className="stat-badges">
          <span className="stat-badge">👥 50 Santri</span>
          <span className="stat-badge stat-badge--green">✅ 48 Aktif</span>
          <span className="stat-badge stat-badge--red">❌ 2 Non-Aktif</span>
        </div>
        <button className="btn btn-primary" onClick={() => { setEditData({}); setIsModalOpen(true); }}>
          + Tambah Pengguna Baru
        </button>
      </div>

      <UserTable data={mockSantri} onEdit={handleEdit} onDelete={handleDelete} />

      <UserModalForm
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        initialData={editData}
      />
    </MainLayout>
  );
};

export default UserManagementPage;
