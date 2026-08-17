import { useState, useMemo } from 'react';
import MainLayout from '../components/layout/MainLayout';
import UserKpiCards from '../components/users/UserKpiCards';
import UserFilterBar from '../components/users/UserFilterBar';
import UserTable from '../components/users/UserTable';
import UserModalForm from '../components/users/UserModalForm';
import UserDetailModal from '../components/users/UserDetailModal';
import { mockUsers } from '../data/mockUsers';

const UserManagementPage = ({ Layout = MainLayout, isStaffVersion = false, category = 'all' }) => {
  const [users, setUsers] = useState(mockUsers);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('Semua Role');
  const [statusFilter, setStatusFilter] = useState('Semua Status');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editUser, setEditUser] = useState(null);

  const [detailUserTarget, setDetailUserTarget] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const [deleteUserTarget, setDeleteUserTarget] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Kategori data dasar berdasarkan sub-menu
  const categoryBaseUsers = useMemo(() => {
    if (category === 'admin') {
      return users.filter((u) => u.role === 'Kabid BAK & Manajerial');
    }
    if (category === 'staff-koin') {
      return users.filter((u) => u.role === 'Staff Rumah Koin');
    }
    if (category === 'wali') {
      return users.filter((u) => u.role === 'Wali Santri / Wali');
    }
    return users;
  }, [users, category]);

  // Filter Users berdasarkan Search, Role, dan Status
  const filteredUsers = useMemo(() => {
    return categoryBaseUsers.filter((u) => {
      // 1. Search Query (Nama, No HP, atau NIS)
      if (search.trim()) {
        const query = search.toLowerCase();
        const matchesName = u.nama.toLowerCase().includes(query);
        const matchesNoHp = u.noHp ? u.noHp.toLowerCase().includes(query) : false;
        const matchesNis = u.nis ? u.nis.toLowerCase().includes(query) : false;
        if (!matchesName && !matchesNoHp && !matchesNis) return false;
      }

      // 2. Role Filter (Hanya berlaku jika kategori 'all')
      if (category === 'all' && roleFilter !== 'Semua Role') {
        if (u.role !== roleFilter) return false;
      }

      // 3. Status Filter
      if (statusFilter !== 'Semua Status') {
        if (u.status !== statusFilter) return false;
      }

      return true;
    });
  }, [categoryBaseUsers, search, roleFilter, statusFilter, category]);

  // Compute KPI metrics dynamically
  const kpiStats = useMemo(() => {
    const totalPengguna = categoryBaseUsers.length;
    const penggunaAktif = categoryBaseUsers.filter((u) => u.status === 'Aktif').length;
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
  }, [categoryBaseUsers, users]);

  // Open modal for viewing user detail
  const handleViewUserDetail = (user) => {
    setDetailUserTarget(user);
    setIsDetailModalOpen(true);
  };

  // Open modal for new user
  const handleAddUser = () => {
    let presetRole = 'staff';
    if (category === 'admin') presetRole = 'kabid';
    if (category === 'staff-koin') presetRole = 'staff';
    if (category === 'wali') presetRole = 'wali';

    setEditUser({ role: presetRole });
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
    if (editUser && editUser.id) {
      // Edit existing user
      setUsers(
        users.map((u) => (u.id === editUser.id ? { ...u, ...formData } : u))
      );
    } else {
      // Add new user
      let assignedRole = formData.role || 'Staff Rumah Koin';
      if (formData.role === 'kabid') assignedRole = 'Kabid BAK & Manajerial';
      if (formData.role === 'staff') assignedRole = 'Staff Rumah Koin';
      if (formData.role === 'wali') assignedRole = 'Wali Santri / Wali';

      const newUser = {
        id: Date.now(),
        nama: formData.nama || 'Pengguna Baru',
        noHp: formData.noHp || '081234567890',
        role: assignedRole,
        status: 'Aktif',
        loginTerakhir: 'Baru saja',
        nis: formData.nis || '—',
      };
      setUsers([newUser, ...users]);
    }
    setIsModalOpen(false);
  };

  // Metadata Judul & Subtitle Halaman
  const getHeaderMeta = () => {
    if (category === 'admin') {
      return {
        title: 'Manajemen Akun — Admin / Manajerial',
        subtitle: 'Kelola akun pimpinan, Kabid BAK, dan staf manajerial keuangan pesantren',
        addBtn: '+ Tambah Admin',
        pageTitle: 'Akun Admin / Manajerial',
      };
    }
    if (category === 'staff-koin') {
      return {
        title: 'Manajemen Akun — Staff Rumah Koin',
        subtitle: 'Kelola akun petugas loket dan staf operasional koin santri',
        addBtn: '+ Tambah Staff Koin',
        pageTitle: 'Akun Staff Rumah Koin',
      };
    }
    if (category === 'wali') {
      return {
        title: 'Manajemen Akun — Wali Santri',
        subtitle: 'Kelola akun wali santri, akses pemantauan saldo, dan tautan NIS santri',
        addBtn: '+ Tambah Wali Santri',
        pageTitle: 'Akun Wali Santri',
      };
    }
    return {
      title: 'Manajemen Akun',
      subtitle: 'Kelola akun dan hak akses seluruh pengguna sistem',
      addBtn: '+ Tambah Pengguna',
      pageTitle: 'Manajemen Akun',
    };
  };

  const headerMeta = getHeaderMeta();

  return (
    <Layout pageTitle={headerMeta.pageTitle}>
      {/* Header Title & Subtitle */}
      <div className="report-header-card mb-6">
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">
          {headerMeta.title}
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">
          {headerMeta.subtitle}
        </p>
      </div>

      {/* 4 KPI Summary Cards Adaptif */}
      <UserKpiCards
        category={category}
        totalPengguna={kpiStats.totalPengguna}
        penggunaAktif={kpiStats.penggunaAktif}
        totalWali={kpiStats.totalWali}
        totalStaffAdmin={kpiStats.totalStaffAdmin}
      />

      {/* Filter Bar: Search, Role Dropdown (jika all), Status Dropdown, + Tambah Pengguna */}
      <UserFilterBar
        search={search}
        onSearchChange={setSearch}
        role={roleFilter}
        onRoleChange={setRoleFilter}
        status={statusFilter}
        onStatusChange={setStatusFilter}
        onAddUser={handleAddUser}
        addButtonLabel={headerMeta.addBtn}
        hideRoleFilter={category !== 'all'}
      />

      {/* User Table Card */}
      <UserTable
        category={category}
        data={filteredUsers}
        totalCount={categoryBaseUsers.length}
        activeCount={kpiStats.penggunaAktif}
        nonactiveCount={categoryBaseUsers.length - kpiStats.penggunaAktif}
        onViewDetail={handleViewUserDetail}
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

      {/* User Detail Modal */}
      {isDetailModalOpen && detailUserTarget && (
        <UserDetailModal
          isOpen={isDetailModalOpen}
          onClose={() => {
            setIsDetailModalOpen(false);
            setDetailUserTarget(null);
          }}
          user={detailUserTarget}
          onEdit={handleEditUser}
        />
      )}

      {/* Modal Konfirmasi Hapus Pengguna (Fullscreen Overlay z-[99999] yang me-blur seluruh layar termasuk sidebar) */}
      {isDeleteModalOpen && deleteUserTarget && (
        <div
          className="fixed inset-0 z-[99999] bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => {
            setIsDeleteModalOpen(false);
            setDeleteUserTarget(null);
          }}
        >
          <div
            className="modal-animate-pop bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl max-w-md w-full shadow-2xl relative text-center flex flex-col items-center transition-colors"
            style={{ padding: '44px 36px 36px 36px' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Red Trash Icon Box */}
            <div
              className="modal-badge-bounce rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-100 dark:border-rose-900/50 flex items-center justify-center shrink-0 shadow-xs"
              style={{ width: '64px', height: '64px', marginBottom: '24px' }}
            >
              <svg
                className="text-rose-600 dark:text-rose-400"
                style={{ width: '32px', height: '32px' }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </div>

            {/* Title */}
            <h3
              className="font-extrabold text-slate-900 dark:text-slate-100 tracking-tight"
              style={{ fontSize: '22px', marginBottom: '10px' }}
            >
              Hapus Akun Pengguna
            </h3>

            {/* Description Body Text */}
            <p
              className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed"
              style={{ fontSize: '15px', maxWidth: '340px', marginBottom: '28px' }}
            >
              Apakah Anda yakin ingin menghapus akun <strong className="text-slate-900 dark:text-slate-100 font-bold">{deleteUserTarget.nama}</strong> ({deleteUserTarget.noHp})? Tindakan ini tidak dapat dibatalkan.
            </p>

            {/* Garis Pembatas (Divider Line) */}
            <div
              className="w-full border-t border-slate-200 dark:border-slate-800"
              style={{ marginBottom: '24px' }}
            />

            {/* Action Buttons Row */}
            <div className="flex items-center w-full" style={{ gap: '14px' }}>
              <button
                type="button"
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setDeleteUserTarget(null);
                }}
                className="flex-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 active:scale-95 hover:scale-[1.02] text-slate-700 dark:text-slate-200 font-bold rounded-2xl transition-all duration-150 cursor-pointer shadow-2xs flex items-center justify-center"
                style={{ height: '50px', fontSize: '15px' }}
              >
                Batal
              </button>
              <button
                type="button"
                onClick={confirmDeleteUser}
                className="flex-1 bg-rose-600 hover:bg-rose-700 active:scale-95 hover:scale-[1.02] text-white font-bold rounded-2xl shadow-md shadow-rose-900/20 transition-all duration-150 cursor-pointer flex items-center justify-center gap-2"
                style={{ height: '50px', fontSize: '15px' }}
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default UserManagementPage;
