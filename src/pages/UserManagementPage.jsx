import { useState, useMemo, useEffect } from 'react';
import MainLayout from '../components/layout/MainLayout';
import UserKpiCards from '../components/users/UserKpiCards';
import UserFilterBar from '../components/users/UserFilterBar';
import UserTable from '../components/users/UserTable';
import UserModalForm from '../components/users/UserModalForm';
import UserDetailModal from '../components/users/UserDetailModal';
import BatchActionBar from '../components/common/BatchActionBar';
import { mockUsers } from '../data/mockUsers';
import { adminApi, staffApi, waliUserApi } from '../utils/api';

const mapUserFromApi = (item, defaultRole) => ({
  id: item.id,
  nama: item.name || item.nama || '—',
  username: item.username || '',
  role: item.role || defaultRole || 'Staff Rumah Koin',
  noHp: item.no_hp || item.phone || item.noHp || '—',
  email: item.email || '—',
  status: item.is_active === 0 ? 'Non-Aktif' : (item.status || 'Aktif'),
  createdDate: item.created_at ? item.created_at.slice(0, 10) : '2026-08-01',
  lastLogin: item.last_login || 'Baru saja',
  santriLinked: item.santris ? item.santris.map(s => s.nama).join(', ') : (item.santri_name || '—'),
  nis: item.santris && item.santris[0] ? item.santris[0].nis : (item.nis || ''),
});

const UserManagementPage = ({ Layout = MainLayout, isStaffVersion = false, category = 'all' }) => {
  const [users, setUsers] = useState(mockUsers);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('Semua Role');
  const [statusFilter, setStatusFilter] = useState('Semua Status');

  const [selectedIds, setSelectedIds] = useState([]);
  const [isBatchDeleteOpen, setIsBatchDeleteOpen] = useState(false);

  // Fetch users dynamically from API
  const fetchUsers = () => {
    setLoading(true);
    Promise.allSettled([
      adminApi.list({ per_page: 200 }),
      staffApi.list({ per_page: 200 }),
      waliUserApi.list({ per_page: 200 }),
    ])
      .then(([adminRes, staffRes, waliRes]) => {
        let combined = [];

        if (adminRes.status === 'fulfilled' && adminRes.value?.data) {
          combined = [...combined, ...adminRes.value.data.map(u => mapUserFromApi(u, 'Kabid BAK & Manajerial'))];
        }
        if (staffRes.status === 'fulfilled' && staffRes.value?.data) {
          combined = [...combined, ...staffRes.value.data.map(u => mapUserFromApi(u, 'Staff Rumah Koin'))];
        }
        if (waliRes.status === 'fulfilled' && waliRes.value?.data) {
          combined = [...combined, ...waliRes.value.data.map(u => mapUserFromApi(u, 'Wali Santri / Wali'))];
        }

        if (combined.length > 0) {
          setUsers(combined);
        }
      })
      .catch((err) => {
        console.warn('Menggunakan data user lokal:', err.message);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Otomatis reset centang / multi-select saat berpindah sub-menu / kategori akun
  useEffect(() => {
    setSelectedIds([]);
  }, [category]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editUser, setEditUser] = useState(null);

  const [detailUserTarget, setDetailUserTarget] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const [deleteUserTarget, setDeleteUserTarget] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // State untuk Pop-Up Modal Sukses (Tambah, Edit, & Hapus Pengguna)
  const [isSuccessCreatedModalOpen, setIsSuccessCreatedModalOpen] = useState(false);
  const [createdUserData, setCreatedUserData] = useState(null);

  const [isSuccessEditedModalOpen, setIsSuccessEditedModalOpen] = useState(false);
  const [editedUserData, setEditedUserData] = useState(null);

  const [isSuccessDeletedModalOpen, setIsSuccessDeletedModalOpen] = useState(false);
  const [deletedUserPayload, setDeletedUserPayload] = useState(null);

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
      const deletedInfo = {
        nama: deleteUserTarget.nama,
        role: deleteUserTarget.role,
        count: 1,
      };
      setUsers((prev) => prev.filter((u) => u.id !== deleteUserTarget.id));
      setIsDeleteModalOpen(false);
      setDeleteUserTarget(null);

      // Buka Pop-Up Form Data Pengguna Berhasil Dihapus
      setDeletedUserPayload(deletedInfo);
      setIsSuccessDeletedModalOpen(true);
    }
  };

  // Hanya ID yang benar-benar ada di tabel sub-menu saat ini yang valid
  const validSelectedIds = useMemo(() => {
    const currentIds = new Set(filteredUsers.map((u) => u.id));
    return selectedIds.filter((id) => currentIds.has(id));
  }, [selectedIds, filteredUsers]);

  // Multi-Select Handlers
  const toggleSelectAll = () => {
    if (validSelectedIds.length === filteredUsers.length && filteredUsers.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredUsers.map((u) => u.id));
    }
  };

  const toggleSelectRow = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleBatchStatusChange = (status) => {
    setUsers((prev) =>
      prev.map((u) =>
        validSelectedIds.includes(u.id)
          ? { ...u, status: status === 'aktif' ? 'Aktif' : 'Nonaktif' }
          : u
      )
    );
    setSelectedIds([]);
  };

  const handleBatchDelete = () => {
    setIsBatchDeleteOpen(true);
  };

  const confirmBatchDelete = () => {
    const deletedCount = validSelectedIds.length;
    const deletedInfo = {
      nama: `${deletedCount} Pengguna Terpilih`,
      count: deletedCount,
    };
    setUsers((prev) => prev.filter((u) => !validSelectedIds.includes(u.id)));
    setSelectedIds([]);
    setIsBatchDeleteOpen(false);

    // Buka Pop-Up Form Data Pengguna Berhasil Dihapus
    setDeletedUserPayload(deletedInfo);
    setIsSuccessDeletedModalOpen(true);
  };

  // Submit Handler for Modal Form
  const handleSubmitForm = (formData) => {
    if (editUser && editUser.id) {
      // Edit existing user
      let assignedRole = formData.role || editUser.role || 'Staff Rumah Koin';
      if (formData.role === 'kabid') assignedRole = 'Kabid BAK & Manajerial';
      if (formData.role === 'staff') assignedRole = 'Staff Rumah Koin';
      if (formData.role === 'wali') assignedRole = 'Wali Santri / Wali';
      if (formData.role === 'santri') assignedRole = 'Santri';

      const updatedUser = {
        ...editUser,
        ...formData,
        role: assignedRole,
        status: formData.status ? (formData.status === 'aktif' ? 'Aktif' : 'Non-Aktif') : editUser.status,
      };

      setUsers(
        users.map((u) => (u.id === editUser.id ? updatedUser : u))
      );
      setIsModalOpen(false);

      // Buka Pop-Up Form Data Pengguna Berhasil Diubah
      setEditedUserData(updatedUser);
      setIsSuccessEditedModalOpen(true);
    } else {
      // Add new user
      let assignedRole = formData.role || 'Staff Rumah Koin';
      if (formData.role === 'kabid') assignedRole = 'Kabid BAK & Manajerial';
      if (formData.role === 'staff') assignedRole = 'Staff Rumah Koin';
      if (formData.role === 'wali') assignedRole = 'Wali Santri / Wali';
      if (formData.role === 'santri') assignedRole = 'Santri';

      const newUser = {
        id: Date.now(),
        nama: formData.nama || 'Pengguna Baru',
        noHp: formData.noHp || '081234567890',
        role: assignedRole,
        status: 'Aktif',
        loginTerakhir: 'Baru saja',
        nis: formData.nis || '—',
        username: formData.username || (formData.nama ? formData.nama.toLowerCase().replace(/\s+/g, '') : 'userbaru'),
        createdDate: new Date().toISOString().slice(0, 10),
      };
      setUsers([newUser, ...users]);
      setIsModalOpen(false);

      // Buka Pop-Up Form Pengguna Baru Berhasil Ditambahkan
      setCreatedUserData(newUser);
      setIsSuccessCreatedModalOpen(true);
    }
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

      {/* Batch Action Bar (Model B: Tampil tepat di atas tabel saat checkbox dicentang) */}
      <BatchActionBar
        selectedCount={validSelectedIds.length}
        onClearSelection={() => setSelectedIds([])}
        onBatchStatusChange={handleBatchStatusChange}
        onBatchDelete={handleBatchDelete}
        itemLabel={category === 'wali' ? 'wali santri' : 'pengguna'}
      />

      {/* User Table Card */}
      <UserTable
        category={category}
        data={filteredUsers}
        totalCount={categoryBaseUsers.length}
        activeCount={kpiStats.penggunaAktif}
        nonactiveCount={categoryBaseUsers.length - kpiStats.penggunaAktif}
        selectedIds={validSelectedIds}
        onToggleSelectAll={toggleSelectAll}
        onToggleSelectRow={toggleSelectRow}
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
            {(() => {
              const isTargetStaffOrAdmin =
                deleteUserTarget.role === 'Kabid BAK & Manajerial' ||
                deleteUserTarget.role === 'Staff Rumah Koin' ||
                deleteUserTarget.role === 'admin' ||
                deleteUserTarget.role === 'staff' ||
                deleteUserTarget.role === 'kabid';

              const phoneText = !isTargetStaffOrAdmin && deleteUserTarget.noHp && deleteUserTarget.noHp !== '—'
                ? ` (${deleteUserTarget.noHp})`
                : '';

              return (
                <p
                  className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed"
                  style={{ fontSize: '15px', maxWidth: '340px', marginBottom: '28px' }}
                >
                  Apakah Anda yakin ingin menghapus akun <strong className="text-slate-900 dark:text-slate-100 font-bold">{deleteUserTarget.nama}</strong>{phoneText}? Tindakan ini tidak dapat dibatalkan.
                </p>
              );
            })()}

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

      {/* Modal Konfirmasi Hapus Massal Akun (Batch Delete) */}
      {isBatchDeleteOpen && (
        <div
          className="fixed inset-0 z-[99999] bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setIsBatchDeleteOpen(false)}
        >
          <div
            className="modal-animate-pop bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl max-w-md w-full shadow-2xl relative text-center flex flex-col items-center transition-colors"
            style={{ padding: '44px 36px 36px 36px' }}
            onClick={(e) => e.stopPropagation()}
          >
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

            <h3
              className="font-extrabold text-slate-900 dark:text-slate-100 tracking-tight"
              style={{ fontSize: '22px', marginBottom: '10px' }}
            >
              Hapus {selectedIds.length} Akun Terpilih?
            </h3>

            <p
              className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed"
              style={{ fontSize: '15px', maxWidth: '340px', marginBottom: '28px' }}
            >
              Apakah Anda yakin ingin menghapus <strong className="text-rose-600 font-bold">{selectedIds.length} akun</strong> sekaligus? Tindakan ini tidak dapat dibatalkan.
            </p>

            <div
              className="w-full border-t border-slate-200 dark:border-slate-800"
              style={{ marginBottom: '24px' }}
            />

            <div className="flex items-center w-full" style={{ gap: '14px' }}>
              <button
                type="button"
                onClick={() => setIsBatchDeleteOpen(false)}
                className="flex-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 active:scale-95 hover:scale-[1.02] text-slate-700 dark:text-slate-200 font-bold rounded-2xl transition-all duration-150 cursor-pointer shadow-2xs flex items-center justify-center"
                style={{ height: '50px', fontSize: '15px' }}
              >
                Batal
              </button>
              <button
                type="button"
                onClick={confirmBatchDelete}
                className="flex-1 bg-rose-600 hover:bg-rose-700 active:scale-95 hover:scale-[1.02] text-white font-bold rounded-2xl shadow-md shadow-rose-900/20 transition-all duration-150 cursor-pointer flex items-center justify-center gap-2"
                style={{ height: '50px', fontSize: '15px' }}
              >
                Ya, Hapus Semua
              </button>
            </div>
          </div>
        </div>
      )}

      {/* POP-UP FORM PENGGUNA BARU BERHASIL DITAMBAHKAN (Struktur Sesuai Modal Penarikan Koin & Upload BNI) */}
      {isSuccessCreatedModalOpen && createdUserData && (() => {
        const isStaffOrAdmin =
          createdUserData.role === 'Kabid BAK & Manajerial' ||
          createdUserData.role === 'Staff Rumah Koin' ||
          createdUserData.role === 'admin' ||
          createdUserData.role === 'staff' ||
          createdUserData.role === 'kabid';

        return (
          <div
            className="fixed inset-0 z-[99999] bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-fadeIn"
            onClick={() => setIsSuccessCreatedModalOpen(false)}
          >
            <div
              className="modal-animate-pop bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl max-w-md w-full shadow-2xl relative text-center flex flex-col items-center transition-colors"
              style={{ padding: '36px 28px 28px 28px' }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Green Checkmark Badge Icon */}
              <div className="modal-badge-bounce w-18 h-18 sm:w-20 sm:h-20 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 text-3xl font-extrabold flex items-center justify-center mx-auto mb-5 shadow-lg shadow-emerald-900/10 ring-8 ring-emerald-50 dark:ring-emerald-900/20">
                ✓
              </div>

              {/* Title & Subtitle */}
              <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight mb-2">
                Pengguna Baru Berhasil Ditambahkan!
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed px-2 mb-6">
                Akun pengguna atas nama <strong className="font-bold text-slate-800 dark:text-slate-200">{createdUserData.nama}</strong> telah berhasil didaftarkan dan siap digunakan.
              </p>

              {/* Detail Breakdown Card dengan Spacing & Padding Teratur */}
              <div className="w-full bg-slate-50 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700/80 rounded-2xl p-5 text-left flex flex-col gap-3 mb-6">
                <div className="flex justify-between items-center text-xs sm:text-sm py-0.5">
                  <span className="text-slate-500 dark:text-slate-400 font-semibold">Nama Lengkap:</span>
                  <strong className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                    {createdUserData.nama}
                  </strong>
                </div>

                <div className="w-full h-px bg-slate-200/70 dark:bg-slate-700/70"></div>

                <div className="flex justify-between items-center text-xs sm:text-sm py-0.5">
                  <span className="text-slate-500 dark:text-slate-400 font-semibold">Hak Akses / Role:</span>
                  <span className="inline-block px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-extrabold text-xs">
                    {createdUserData.role}
                  </span>
                </div>

                {createdUserData.nis && createdUserData.nis !== '—' && (
                  <>
                    <div className="w-full h-px bg-slate-200/70 dark:bg-slate-700/70"></div>
                    <div className="flex justify-between items-center text-xs sm:text-sm py-0.5">
                      <span className="text-slate-500 dark:text-slate-400 font-semibold">Tautan NIS Santri:</span>
                      <strong className="font-mono font-bold text-emerald-700 dark:text-emerald-400 text-xs">
                        {createdUserData.nis}
                      </strong>
                    </div>
                  </>
                )}

                {/* No. Handphone HANYA tampil untuk Wali & Santri (Dihilangkan untuk Admin & Staff Rumah Koin) */}
                {!isStaffOrAdmin && createdUserData.noHp && createdUserData.noHp !== '—' && (
                  <>
                    <div className="w-full h-px bg-slate-200/70 dark:bg-slate-700/70"></div>
                    <div className="flex justify-between items-center text-xs sm:text-sm py-0.5">
                      <span className="text-slate-500 dark:text-slate-400 font-semibold">No. Handphone:</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {createdUserData.noHp}
                      </span>
                    </div>
                  </>
                )}

                <div className="w-full h-px bg-slate-200/70 dark:bg-slate-700/70"></div>

                <div className="flex justify-between items-center text-xs sm:text-sm py-0.5">
                  <span className="text-slate-500 dark:text-slate-400 font-semibold">Status Akun:</span>
                  <span className="inline-flex items-center gap-1.5 font-bold text-emerald-700 dark:text-emerald-400">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    Aktif &amp; Siap Diterapkan
                  </span>
                </div>
              </div>

              {/* Button Tutup & Selesai */}
              <button
                type="button"
                onClick={() => setIsSuccessCreatedModalOpen(false)}
                className="w-full h-12 py-3 bg-[#0e5d26] hover:bg-[#0b471d] active:scale-[0.99] text-white font-extrabold rounded-xl text-sm shadow-lg shadow-emerald-950/20 transition-all cursor-pointer flex items-center justify-center"
              >
                Selesai &amp; Lihat Daftar Pengguna
              </button>
            </div>
          </div>
        );
      })()}

      {/* POP-UP FORM DATA PENGGUNA BERHASIL DIUBAH */}
      {isSuccessEditedModalOpen && editedUserData && (() => {
        const isStaffOrAdmin =
          editedUserData.role === 'Kabid BAK & Manajerial' ||
          editedUserData.role === 'Staff Rumah Koin' ||
          editedUserData.role === 'admin' ||
          editedUserData.role === 'staff' ||
          editedUserData.role === 'kabid';

        return (
          <div
            className="fixed inset-0 z-[99999] bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-fadeIn"
            onClick={() => setIsSuccessEditedModalOpen(false)}
          >
            <div
              className="modal-animate-pop bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl max-w-md w-full shadow-2xl relative text-center flex flex-col items-center transition-colors"
              style={{ padding: '36px 28px 28px 28px' }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Green Checkmark Badge Icon */}
              <div className="modal-badge-bounce w-18 h-18 sm:w-20 sm:h-20 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 text-3xl font-extrabold flex items-center justify-center mx-auto mb-5 shadow-lg shadow-emerald-900/10 ring-8 ring-emerald-50 dark:ring-emerald-900/20">
                ✓
              </div>

              {/* Title & Subtitle */}
              <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight mb-2">
                Data Pengguna Berhasil Diubah!
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed px-2 mb-6">
                Perubahan data akun atas nama <strong className="font-bold text-slate-800 dark:text-slate-200">{editedUserData.nama}</strong> telah berhasil diperbarui ke dalam sistem.
              </p>

              {/* Detail Breakdown Card */}
              <div className="w-full bg-slate-50 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700/80 rounded-2xl p-5 text-left flex flex-col gap-3 mb-6">
                <div className="flex justify-between items-center text-xs sm:text-sm py-0.5">
                  <span className="text-slate-500 dark:text-slate-400 font-semibold">Nama Lengkap:</span>
                  <strong className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                    {editedUserData.nama}
                  </strong>
                </div>

                <div className="w-full h-px bg-slate-200/70 dark:bg-slate-700/70"></div>

                <div className="flex justify-between items-center text-xs sm:text-sm py-0.5">
                  <span className="text-slate-500 dark:text-slate-400 font-semibold">Hak Akses / Role:</span>
                  <span className="inline-block px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-extrabold text-xs">
                    {editedUserData.role}
                  </span>
                </div>

                {editedUserData.nis && editedUserData.nis !== '—' && (
                  <>
                    <div className="w-full h-px bg-slate-200/70 dark:bg-slate-700/70"></div>
                    <div className="flex justify-between items-center text-xs sm:text-sm py-0.5">
                      <span className="text-slate-500 dark:text-slate-400 font-semibold">Tautan NIS Santri:</span>
                      <strong className="font-mono font-bold text-emerald-700 dark:text-emerald-400 text-xs">
                        {editedUserData.nis}
                      </strong>
                    </div>
                  </>
                )}

                {!isStaffOrAdmin && editedUserData.noHp && editedUserData.noHp !== '—' && (
                  <>
                    <div className="w-full h-px bg-slate-200/70 dark:bg-slate-700/70"></div>
                    <div className="flex justify-between items-center text-xs sm:text-sm py-0.5">
                      <span className="text-slate-500 dark:text-slate-400 font-semibold">No. Handphone:</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {editedUserData.noHp}
                      </span>
                    </div>
                  </>
                )}

                <div className="w-full h-px bg-slate-200/70 dark:bg-slate-700/70"></div>

                <div className="flex justify-between items-center text-xs sm:text-sm py-0.5">
                  <span className="text-slate-500 dark:text-slate-400 font-semibold">Status Perubahan:</span>
                  <span className="inline-flex items-center gap-1.5 font-bold text-emerald-700 dark:text-emerald-400">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    Perubahan Tersimpan
                  </span>
                </div>
              </div>

              {/* Button Tutup */}
              <button
                type="button"
                onClick={() => setIsSuccessEditedModalOpen(false)}
                className="w-full h-12 py-3 bg-[#0e5d26] hover:bg-[#0b471d] active:scale-[0.99] text-white font-extrabold rounded-xl text-sm shadow-lg shadow-emerald-950/20 transition-all cursor-pointer flex items-center justify-center"
              >
                Selesai &amp; Lihat Daftar Pengguna
              </button>
            </div>
          </div>
        );
      })()}

      {/* POP-UP FORM DATA PENGGUNA BERHASIL DIHAPUS */}
      {isSuccessDeletedModalOpen && deletedUserPayload && (
        <div
          className="fixed inset-0 z-[99999] bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-fadeIn"
          onClick={() => setIsSuccessDeletedModalOpen(false)}
        >
          <div
            className="modal-animate-pop bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl max-w-md w-full shadow-2xl relative text-center flex flex-col items-center transition-colors"
            style={{ padding: '36px 28px 28px 28px' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Green Checkmark Badge Icon */}
            <div className="modal-badge-bounce w-18 h-18 sm:w-20 sm:h-20 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 text-3xl font-extrabold flex items-center justify-center mx-auto mb-5 shadow-lg shadow-emerald-900/10 ring-8 ring-emerald-50 dark:ring-emerald-900/20">
              ✓
            </div>

            {/* Title & Subtitle */}
            <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight mb-2">
              Data Pengguna Berhasil Dihapus!
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed px-2 mb-6">
              {deletedUserPayload.count > 1 ? (
                <>Sebanyak <strong className="font-bold text-slate-800 dark:text-slate-200">{deletedUserPayload.count} data pengguna</strong> telah berhasil dihapus dari sistem.</>
              ) : (
                <>Data pengguna atas nama <strong className="font-bold text-slate-800 dark:text-slate-200">{deletedUserPayload.nama}</strong> telah berhasil dihapus dari sistem.</>
              )}
            </p>

            {/* Detail Breakdown Card */}
            <div className="w-full bg-slate-50 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700/80 rounded-2xl p-5 text-left flex flex-col gap-3 mb-6">
              <div className="flex justify-between items-center text-xs sm:text-sm py-0.5">
                <span className="text-slate-500 dark:text-slate-400 font-semibold">Keterangan:</span>
                <strong className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                  {deletedUserPayload.count > 1 ? `${deletedUserPayload.count} Pengguna Terpilih` : deletedUserPayload.nama}
                </strong>
              </div>

              {deletedUserPayload.role && (
                <>
                  <div className="w-full h-px bg-slate-200/70 dark:bg-slate-700/70"></div>
                  <div className="flex justify-between items-center text-xs sm:text-sm py-0.5">
                    <span className="text-slate-500 dark:text-slate-400 font-semibold">Role:</span>
                    <span className="inline-block px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-extrabold text-xs">
                      {deletedUserPayload.role}
                    </span>
                  </div>
                </>
              )}

              <div className="w-full h-px bg-slate-200/70 dark:bg-slate-700/70"></div>

              <div className="flex justify-between items-center text-xs sm:text-sm py-0.5">
                <span className="text-slate-500 dark:text-slate-400 font-semibold">Status:</span>
                <span className="inline-flex items-center gap-1.5 font-bold text-emerald-700 dark:text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  Telah Dihapus dari Database
                </span>
              </div>
            </div>

            {/* Button Tutup */}
            <button
              type="button"
              onClick={() => setIsSuccessDeletedModalOpen(false)}
              className="w-full h-12 py-3 bg-[#0e5d26] hover:bg-[#0b471d] active:scale-[0.99] text-white font-extrabold rounded-xl text-sm shadow-lg shadow-emerald-950/20 transition-all cursor-pointer flex items-center justify-center"
            >
              Selesai &amp; Lihat Daftar Pengguna
            </button>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default UserManagementPage;
