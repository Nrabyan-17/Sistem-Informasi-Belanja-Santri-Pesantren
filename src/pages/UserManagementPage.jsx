import { useState, useMemo } from 'react';
import MainLayout from '../components/layout/MainLayout';
import UserKpiCards from '../components/users/UserKpiCards';
import UserFilterBar from '../components/users/UserFilterBar';
import UserTable from '../components/users/UserTable';
import UserModalForm from '../components/users/UserModalForm';
import { mockUsers } from '../data/mockUsers';

const UserManagementPage = ({ Layout = MainLayout }) => {
  const [users, setUsers] = useState(mockUsers);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('Semua Role');
  const [statusFilter, setStatusFilter] = useState('Semua Status');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editUser, setEditUser] = useState(null);

  // Filter Users
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      // 1. Search Query (Nama, Username, atau NIS)
      if (search.trim()) {
        const query = search.toLowerCase();
        const matchesName = u.nama.toLowerCase().includes(query);
        const matchesUsername = u.username.toLowerCase().includes(query);
        const matchesNis = u.nis ? u.nis.toLowerCase().includes(query) : false;
        if (!matchesName && !matchesUsername && !matchesNis) return false;
      }

      // 2. Role Filter
      if (roleFilter !== 'Semua Role') {
        if (u.role !== roleFilter) return false;
      }

      // 3. Status Filter
      if (statusFilter !== 'Semua Status') {
        if (u.status !== statusFilter) return false;
      }

      return true;
    });
  }, [users, search, roleFilter, statusFilter]);

  // Compute KPI metrics dynamically
  const kpiStats = useMemo(() => {
    const totalPengguna = users.length;
    const penggunaAktif = users.filter((u) => u.status === 'Aktif').length;
    const totalWali = users.filter((u) => u.role === 'Wali Santri / Wali').length;
    const totalStaffAdmin = users.filter(
      (u) => u.role === 'Kabid BAK & Manajerial' || u.role === 'Staff Rumah Koin'
    ).length;

    return {
      totalPengguna,
      penggunaAktif,
      totalWali,
      totalStaffAdmin,
    };
  }, [users]);

  // Open modal for new user
  const handleAddUser = () => {
    setEditUser(null);
    setIsModalOpen(true);
  };

  // Open modal for editing user
  const handleEditUser = (user) => {
    setEditUser(user);
    setIsModalOpen(true);
  };

  // Submit Handler for Modal Form
  const handleSubmitForm = (formData) => {
    if (editUser) {
      // Edit existing user
      setUsers(
        users.map((u) => (u.id === editUser.id ? { ...u, ...formData } : u))
      );
    } else {
      // Add new user
      const newUser = {
        id: Date.now(),
        nama: formData.nama || 'Pengguna Baru',
        username: formData.username || `user_${Date.now().toString().slice(-4)}`,
        role: formData.role || 'Staff Rumah Koin',
        status: 'Aktif',
        loginTerakhir: 'Baru saja',
        nis: formData.nis || '—',
        email: formData.email || '',
      };
      setUsers([newUser, ...users]);
    }
    setIsModalOpen(false);
  };

  return (
    <Layout pageTitle="Manajemen Pengguna">
      {/* Header Title & Subtitle */}
      <div className="report-header-card mb-6">
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">
          Manajemen Pengguna
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Kelola akun dan hak akses seluruh pengguna sistem
        </p>
      </div>

      {/* 4 KPI Summary Cards */}
      <UserKpiCards
        totalPengguna={kpiStats.totalPengguna}
        penggunaAktif={kpiStats.penggunaAktif}
        totalWali={kpiStats.totalWali}
        totalStaffAdmin={kpiStats.totalStaffAdmin}
      />

      {/* Filter Bar: Search, Role Dropdown, Status Dropdown, + Tambah Pengguna */}
      <UserFilterBar
        search={search}
        onSearchChange={setSearch}
        role={roleFilter}
        onRoleChange={setRoleFilter}
        status={statusFilter}
        onStatusChange={setStatusFilter}
        onAddUser={handleAddUser}
      />

      {/* User Table Card */}
      <UserTable
        data={filteredUsers}
        totalCount={users.length}
        activeCount={kpiStats.penggunaAktif}
        nonactiveCount={users.length - kpiStats.penggunaAktif}
        onEdit={handleEditUser}
      />

      {/* User Modal Form */}
      <UserModalForm
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmitForm}
        initialData={editUser || {}}
      />
    </Layout>
  );
};

export default UserManagementPage;
