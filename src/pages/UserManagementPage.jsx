import { useState, useMemo } from 'react';
import MainLayout from '../components/layout/MainLayout';
import UserKpiCards from '../components/users/UserKpiCards';
import UserFilterBar from '../components/users/UserFilterBar';
import UserTable from '../components/users/UserTable';
import UserModalForm from '../components/users/UserModalForm';
import { mockUsers } from '../data/mockUsers';

const UserManagementPage = ({ Layout = MainLayout, isStaffVersion = false }) => {
  const [users, setUsers] = useState(mockUsers);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('Semua Role');
  const [statusFilter, setStatusFilter] = useState('Semua Status');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editUser, setEditUser] = useState(null);

  const [deleteUserTarget, setDeleteUserTarget] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

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

  // Open modal for deleting user
  const handleDeleteUser = (user) => {
    setDeleteUserTarget(user);
    setIsDeleteModalOpen(true);
  };

  // Confirm delete user handler
  const confirmDeleteUser = () => {
    if (deleteUserTarget) {
      setUsers((prev) => prev.filter((u) => u.id !== deleteUserTarget.id));
      setIsDeleteModalOpen(false);
      setDeleteUserTarget(null);
    }
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
        onDelete={isStaffVersion ? undefined : handleDeleteUser}
      />

      {/* User Modal Form */}
      <UserModalForm
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmitForm}
        initialData={editUser || {}}
      />

      {/* Modal Konfirmasi Hapus Pengguna (Ukuran Lebih Besar & Lega) */}
      {isDeleteModalOpen && deleteUserTarget && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-7 sm:p-9 max-w-lg w-full shadow-2xl text-center flex flex-col items-center">
            {/* Header Red Icon Badge */}
            <div className="w-20 h-20 rounded-full bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 text-3xl font-bold flex items-center justify-center mb-5 shadow-inner">
              🗑️
            </div>

            {/* Title */}
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100">
              Konfirmasi Hapus Pengguna
            </h3>

            {/* Description Body Text */}
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mt-3 leading-relaxed max-w-md">
              Apakah Anda yakin ingin menghapus akun pengguna <strong className="text-slate-900 dark:text-slate-100 font-bold">{deleteUserTarget.nama}</strong> (<span className="font-mono text-rose-700 dark:text-rose-400">@{deleteUserTarget.username}</span>)? Tindakan ini tidak dapat dibatalkan.
            </p>

            {/* Garis Pembatas (Divider Line) dengan Jarak (Gap) Yang Sangat Jelas */}
            <div className="w-full h-px bg-slate-200 dark:bg-slate-800 my-7"></div>

            {/* Action Buttons Row */}
            <div className="flex items-center justify-end gap-4 sm:gap-5 w-full">
              <button
                type="button"
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setDeleteUserTarget(null);
                }}
                className="h-12 sm:h-13 px-7 sm:px-8 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-sm font-bold hover:bg-slate-100 dark:hover:bg-slate-700 transition-all cursor-pointer min-w-[120px]"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={confirmDeleteUser}
                className="h-12 sm:h-13 px-7 sm:px-8 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-sm font-bold shadow-md shadow-rose-900/20 transition-all cursor-pointer flex items-center justify-center gap-2 min-w-[160px]"
              >
                Ya, Hapus Pengguna
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default UserManagementPage;
