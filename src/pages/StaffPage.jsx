import { useState, useEffect } from 'react';
import MainLayout from '../components/layout/MainLayout';
import StaffTable from '../components/staff/StaffTable';
import StaffModalForm from '../components/staff/StaffModalForm';
import { staffApi } from '../utils/api';

// Data mock staff
const mockStaff = [
  { id: 1, nip: 'STF-001', nama: 'Ustadz Ahmad',     jabatan: 'Supervisor', noHp: '0812-3456-7890', status: 'aktif',    shift: 'Full' },
  { id: 2, nip: 'STF-002', nama: 'Ustadz Hasan',      jabatan: 'Admin',      noHp: '0813-4567-8901', status: 'aktif',    shift: 'Pagi' },
  { id: 3, nip: 'STF-003', nama: 'Ustadzah Fatimah',   jabatan: 'Kasir',      noHp: '0821-5678-9012', status: 'aktif',    shift: 'Pagi' },
  { id: 4, nip: 'STF-004', nama: 'Ustadz Yusuf',       jabatan: 'Kasir',      noHp: '0857-6789-0123', status: 'aktif',    shift: 'Siang' },
  { id: 5, nip: 'STF-005', nama: 'Ustadzah Aisyah',    jabatan: 'Kasir',      noHp: '0878-7890-1234', status: 'nonaktif', shift: 'Pagi' },
  { id: 6, nip: 'STF-006', nama: 'Ustadz Rahman',      jabatan: 'Manajer',    noHp: '0856-8901-2345', status: 'aktif',    shift: 'Full' },
];

const mapStaffFromApi = (s) => ({
  id: s.id,
  nip: s.nip || `STF-00${s.id}`,
  nama: s.name || s.nama || '—',
  jabatan: s.jabatan || s.role || 'Kasir',
  noHp: s.no_hp || s.phone || s.noHp || '—',
  status: s.is_active === 0 ? 'nonaktif' : (s.status || 'aktif'),
  shift: s.shift || 'Full',
});

const StaffPage = () => {
  const [staffList, setStaffList] = useState(mockStaff);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editData, setEditData] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [filterJabatan, setFilterJabatan] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const fetchStaffData = () => {
    setLoading(true);
    staffApi.list({ per_page: 200 })
      .then((res) => {
        const raw = res.data || (Array.isArray(res) ? res : null);
        if (raw && raw.length >= 0) {
          setStaffList(raw.map(mapStaffFromApi));
        }
      })
      .catch((err) => {
        console.warn('Menggunakan data staff lokal:', err.message);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchStaffData();
  }, []);

  // Filter & search
  const filteredStaff = staffList.filter((staff) => {
    const matchSearch =
      staff.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      staff.nip.toLowerCase().includes(searchTerm.toLowerCase());
    const matchJabatan = filterJabatan ? staff.jabatan === filterJabatan : true;
    const matchStatus = filterStatus ? staff.status === filterStatus : true;
    return matchSearch && matchJabatan && matchStatus;
  });

  const totalStaff = staffList.length;
  const activeStaff = staffList.filter((s) => s.status === 'aktif').length;
  const inactiveStaff = staffList.filter((s) => s.status === 'nonaktif').length;

  const handleEdit = (staff) => {
    setEditData(staff);
    setIsModalOpen(true);
  };

  const handleDelete = (staff) => {
    if (confirm(`Hapus staff ${staff.nama}?`)) {
      staffApi.destroy(staff.id)
        .then(() => fetchStaffData())
        .catch(() => {
          setStaffList((prev) => prev.filter((s) => s.id !== staff.id));
        });
    }
  };

  const handleSubmit = (data) => {
    if (editData && editData.id) {
      staffApi.update(editData.id, data)
        .then(() => fetchStaffData())
        .catch(() => {
          setStaffList((prev) => prev.map((s) => (s.id === editData.id ? { ...s, ...data } : s)));
        });
    } else {
      staffApi.store(data)
        .then(() => fetchStaffData())
        .catch(() => {
          setStaffList((prev) => [{ id: Date.now(), nip: `STF-00${prev.length + 1}`, ...data }, ...prev]);
        });
    }
    setIsModalOpen(false);
  };

  return (
    <MainLayout pageTitle="Staff Rumah Koin">
      {/* Header: Badges + Tombol Tambah */}
      <div className="page-actions">
        <div className="stat-badges">
          <span className="stat-badge">🏪 {totalStaff} Total Staff</span>
          <span className="stat-badge stat-badge--green">✅ {activeStaff} Aktif</span>
          <span className="stat-badge stat-badge--red">❌ {inactiveStaff} Non-Aktif</span>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => {
            setEditData({});
            setIsModalOpen(true);
          }}
        >
          + Tambah Staff Baru
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="staff-filters">
        <input
          type="text"
          className="filter-search"
          placeholder="🔍 Cari nama atau NIP staff..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select
          className="filter-select"
          value={filterJabatan}
          onChange={(e) => setFilterJabatan(e.target.value)}
        >
          <option value="">Semua Jabatan</option>
          <option value="Kasir">Kasir</option>
          <option value="Admin">Admin</option>
          <option value="Supervisor">Supervisor</option>
          <option value="Manajer">Manajer</option>
        </select>
        <select
          className="filter-select"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="">Semua Status</option>
          <option value="aktif">Aktif</option>
          <option value="nonaktif">Non-Aktif</option>
        </select>
      </div>

      {/* Tabel Staff */}
      <StaffTable
        loading={loading}
        loadingText="Memuat data Staff..."
        data={filteredStaff}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* Modal Form */}
      <StaffModalForm
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        initialData={editData}
      />
    </MainLayout>
  );
};

export default StaffPage;
