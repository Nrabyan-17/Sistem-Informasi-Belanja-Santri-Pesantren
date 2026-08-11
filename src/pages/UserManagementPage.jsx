import { useState } from 'react';
import MainLayout from '../components/layout/MainLayout';
import UserTable from '../components/users/UserTable';
import UserModalForm from '../components/users/UserModalForm';
import SaldoDetailModal from '../components/users/SaldoDetailModal';

const mockSantri = [
  { id: 1, nis: '123456', nama: 'Ahmad Fauzi', kelas: 'VII A', noHp: '0812-3456-7890', status: 'aktif', saldo: 50000 },
  { id: 2, nis: '123457', nama: 'Budi Santoso', kelas: 'VIII B', noHp: '0813-4567-8901', status: 'aktif', saldo: 75000 },
  { id: 3, nis: '123458', nama: 'Citra Dewi', kelas: 'IX A', noHp: '0821-5678-9012', status: 'nonaktif', saldo: 0 },
];

const UserManagementPage = ({ Layout = MainLayout, isStaffVersion = false }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editData, setEditData] = useState({});

  const [isSaldoModalOpen, setIsSaldoModalOpen] = useState(false);
  const [selectedSantriSaldo, setSelectedSantriSaldo] = useState({});

  const handleEdit = (santri) => {
    setEditData(santri);
    setIsModalOpen(true);
  };

  const handleDetailSaldo = (santri) => {
    setSelectedSantriSaldo(santri);
    setIsSaldoModalOpen(true);
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
    <Layout pageTitle="Manajemen Pengguna">
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

      <UserTable
        data={mockSantri}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onDetailSaldo={handleDetailSaldo}
        showDelete={!isStaffVersion}
        showPhone={isStaffVersion}
      />

      <UserModalForm
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        initialData={editData}
      />

      <SaldoDetailModal
        isOpen={isSaldoModalOpen}
        onClose={() => setIsSaldoModalOpen(false)}
        santri={selectedSantriSaldo}
      />
    </Layout>
  );
};

export default UserManagementPage;
