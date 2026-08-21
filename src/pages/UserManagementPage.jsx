import { useState, useMemo, useEffect } from 'react';
import MainLayout from '../components/layout/MainLayout';
import UserKpiCards from '../components/users/UserKpiCards';
import UserFilterBar from '../components/users/UserFilterBar';
import UserTable from '../components/users/UserTable';
import UserModalForm from '../components/users/UserModalForm';
import UserDetailModal from '../components/users/UserDetailModal';
import BatchActionBar from '../components/common/BatchActionBar';
import { adminApi, staffApi, waliUserApi } from '../utils/api';

const getInitials = (name) => {
  if (!name) return 'U';
  const clean = name.replace(/^(Bpk\.|Ibu\.|Ust\.|Usth\.|dr\.|H\.|Hj\.)\s*/i, '').trim();
  const parts = clean.split(' ').filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return clean.slice(0, 2).toUpperCase() || 'U';
};

const normalizeRole = (role, defaultRole) => {
  const r = String(role || defaultRole || '').toLowerCase();
  if (r.includes('kabid') || r === 'admin') return 'Kabid BAK & Manajerial';
  if (r.includes('staff') || r.includes('kasir') || r.includes('koin')) return 'Staff Rumah Koin';
  if (r.includes('wali')) return 'Wali Santri / Wali';
  return defaultRole || 'Staff Rumah Koin';
};

const mapUserFromApi = (item, defaultRole) => ({
  id: item.id,
  nama: item.name || item.nama || '—',
  username: item.username || '',
  role: normalizeRole(item.role, defaultRole),
  noHp: item.no_hp || item.phone || item.noHp || '—',
  email: item.email || '—',
  status: item.is_active === 0 || item.is_active === false ? 'Non-Aktif' : (item.status || 'Aktif'),
  createdDate: item.created_at ? item.created_at.slice(0, 10) : new Date().toISOString().slice(0, 10),
  lastLogin: item.last_login || 'Baru saja',
  santriLinked: item.santris ? item.santris.map(s => s.nama).join(', ') : (item.santri_name || '—'),
  nis: item.santris && item.santris[0] ? item.santris[0].nis : (item.nis || ''),
});

const UserManagementPage = ({ Layout = MainLayout, isStaffVersion = false, category = 'all' }) => {
  const [users, setUsers] = useState([]);
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

  // Label memuat data dinamis sesuai sub-kategori akun yang sedang dibuka
  const loadingLabel = useMemo(() => {
    switch (category) {
      case 'admin':
        return 'Memuat data Admin...';
      case 'staff-koin':
        return 'Memuat data Staff...';
      case 'wali':
        return 'Memuat data Wali Santri...';
      default:
        return 'Memuat data Pengguna...';
    }
  }, [category]);

  // Otomatis muat data baru dan reset centang saat berpindah sub-menu / kategori akun
  useEffect(() => {
    fetchUsers();
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

      // Call appropriate API
      if (deleteUserTarget.role?.toLowerCase().includes('kabid') || deleteUserTarget.role?.toLowerCase().includes('admin')) {
        adminApi.destroy(deleteUserTarget.id).catch(() => {});
      } else if (deleteUserTarget.role?.toLowerCase().includes('staff')) {
        staffApi.destroy(deleteUserTarget.id).catch(() => {});
      } else if (deleteUserTarget.role?.toLowerCase().includes('wali')) {
        waliUserApi.destroy(deleteUserTarget.id).catch(() => {});
      }

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
    const newStatus = status === 'aktif' ? 'Aktif' : 'Non-Aktif';
    setUsers((prev) =>
      prev.map((u) => {
        if (validSelectedIds.includes(u.id)) {
          const updated = { ...u, status: newStatus };
          if (u.role?.toLowerCase().includes('kabid') || u.role?.toLowerCase().includes('admin')) {
            adminApi.update(u.id, { status: newStatus }).catch(() => {});
          } else if (u.role?.toLowerCase().includes('staff')) {
            staffApi.update(u.id, { status: newStatus }).catch(() => {});
          } else if (u.role?.toLowerCase().includes('wali')) {
            waliUserApi.update(u.id, { status: newStatus }).catch(() => {});
          }
          return updated;
        }
        return u;
      })
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

    // Delete from API/storage for each selected user
    users.forEach((u) => {
      if (validSelectedIds.includes(u.id)) {
        if (u.role?.toLowerCase().includes('kabid') || u.role?.toLowerCase().includes('admin')) {
          adminApi.destroy(u.id).catch(() => {});
        } else if (u.role?.toLowerCase().includes('staff')) {
          staffApi.destroy(u.id).catch(() => {});
        } else if (u.role?.toLowerCase().includes('wali')) {
          waliUserApi.destroy(u.id).catch(() => {});
        }
      }
    });

    setUsers((prev) => prev.filter((u) => !validSelectedIds.includes(u.id)));
    setSelectedIds([]);
    setIsBatchDeleteOpen(false);

    // Buka Pop-Up Form Data Pengguna Berhasil Dihapus
    setDeletedUserPayload(deletedInfo);
    setIsSuccessDeletedModalOpen(true);
  };

  // Submit Handler for Modal Form
  const handleSubmitForm = async (formData) => {
    let assignedRole = formData.role || (editUser ? editUser.role : 'Staff Rumah Koin');
    if (formData.role === 'kabid') assignedRole = 'Kabid BAK & Manajerial';
    if (formData.role === 'staff') assignedRole = 'Staff Rumah Koin';
    if (formData.role === 'wali') assignedRole = 'Wali Santri / Wali';
    if (formData.role === 'santri') assignedRole = 'Santri';

    const isActiveBool = formData.status === 'aktif' || formData.status === 'Aktif' || formData.status === true;
    const generatedUsername = formData.username || (formData.nama ? formData.nama.toLowerCase().replace(/[^a-z0-9]/g, '') : `user_${Date.now()}`);

    const apiPayload = {
      name: formData.nama || formData.name || 'Pengguna Baru',
      username: generatedUsername,
      phone: formData.noHp || formData.phone || '',
      nip: formData.nip || '',
      jabatan: assignedRole,
      is_active: isActiveBool,
      ...(formData.password ? { password: formData.password } : {}),
    };

    if (editUser && editUser.id) {
      // Edit existing user
      try {
        if (assignedRole === 'Kabid BAK & Manajerial' || assignedRole === 'admin') {
          await adminApi.update(editUser.id, apiPayload);
        } else if (assignedRole === 'Staff Rumah Koin' || assignedRole === 'staff') {
          await staffApi.update(editUser.id, apiPayload);
        } else if (assignedRole === 'Wali Santri / Wali' || assignedRole === 'wali') {
          await waliUserApi.update(editUser.id, apiPayload);
        }
      } catch (err) {
        console.warn('Gagal update user ke server:', err.message);
      }

      const updatedUser = {
        ...editUser,
        ...formData,
        nama: apiPayload.name,
        username: apiPayload.username,
        noHp: apiPayload.phone,
        role: assignedRole,
        status: isActiveBool ? 'Aktif' : 'Non-Aktif',
      };

      setUsers((prev) => prev.map((u) => (u.id === editUser.id ? updatedUser : u)));
      setIsModalOpen(false);
      setEditedUserData(updatedUser);
      setIsSuccessEditedModalOpen(true);
    } else {
      // Add new user (password default 123456 jika tidak diisi)
      if (!apiPayload.password) {
        apiPayload.password = 'password123';
      }

      let createdUser = {
        id: Date.now(),
        nama: apiPayload.name,
        username: apiPayload.username,
        noHp: apiPayload.phone,
        role: assignedRole,
        status: 'Aktif',
        loginTerakhir: 'Baru saja',
        nis: formData.nis || '—',
        createdDate: new Date().toISOString().slice(0, 10),
      };

      try {
        let res = null;
        if (assignedRole === 'Kabid BAK & Manajerial' || assignedRole === 'admin') {
          res = await adminApi.store(apiPayload);
        } else if (assignedRole === 'Staff Rumah Koin' || assignedRole === 'staff') {
          res = await staffApi.store(apiPayload);
        } else if (assignedRole === 'Wali Santri / Wali' || assignedRole === 'wali') {
          res = await waliUserApi.store(apiPayload);
        }
        if (res && res.data) {
          createdUser = mapUserFromApi(res.data, assignedRole);
        }
      } catch (err) {
        console.warn('Gagal simpan user ke server:', err.message);
      }

      setUsers((prev) => [createdUser, ...prev]);
      setIsModalOpen(false);
      setCreatedUserData(createdUser);
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
        loading={loading}
        loadingText={loadingLabel}
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

      {/* POP-UP FORM PENGGUNA BARU BERHASIL DITAMBAHKAN */}
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
              className="success-modal-card modal-animate-pop"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Green Checkmark Badge Icon */}
              <div className="modal-badge-bounce w-20 h-20 rounded-full bg-emerald-100/90 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-900/10 ring-8 ring-emerald-50/90 dark:ring-emerald-900/20">
                <svg
                  className="w-10 h-10 text-emerald-600 dark:text-emerald-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2.5"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>

              {/* Title & Subtitle */}
              <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight mb-2">
                Pengguna Berhasil Ditambahkan!
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed px-2">
                Akun atas nama <strong className="font-bold text-slate-800 dark:text-slate-200">{createdUserData.nama}</strong> telah berhasil didaftarkan ke dalam sistem.
              </p>

              {/* Detail Breakdown Card */}
              <div className="success-modal-details">
                <div className="success-modal-row items-center">
                  <span className="success-modal-label">Pengguna:</span>
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-emerald-700 text-white text-xs font-extrabold flex items-center justify-center shrink-0">
                      {getInitials(createdUserData.nama)}
                    </div>
                    <strong className="success-modal-value">
                      {createdUserData.nama} {createdUserData.username ? `(@${createdUserData.username})` : ''}
                    </strong>
                  </div>
                </div>

                <div className="success-modal-divider"></div>

                <div className="success-modal-row">
                  <span className="success-modal-label">Hak Akses / Role:</span>
                  <span className="inline-block px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-extrabold text-xs">
                    {createdUserData.role}
                  </span>
                </div>

                {createdUserData.nis && createdUserData.nis !== '—' && (
                  <>
                    <div className="success-modal-divider"></div>
                    <div className="success-modal-row">
                      <span className="success-modal-label">Tautan NIS:</span>
                      <strong className="success-modal-value font-mono text-emerald-700 dark:text-emerald-400 text-xs sm:text-sm">
                        {createdUserData.nis}
                      </strong>
                    </div>
                  </>
                )}

                {!isStaffOrAdmin && createdUserData.noHp && createdUserData.noHp !== '—' && (
                  <>
                    <div className="success-modal-divider"></div>
                    <div className="success-modal-row">
                      <span className="success-modal-label">No. Handphone:</span>
                      <span className="success-modal-value font-semibold">
                        {createdUserData.noHp}
                      </span>
                    </div>
                  </>
                )}

                <div className="success-modal-divider"></div>

                <div className="success-modal-row">
                  <span className="success-modal-label">Status Akun:</span>
                  <span className="inline-flex items-center gap-1.5 font-bold text-emerald-700 dark:text-emerald-400 text-xs sm:text-sm">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    Aktif &amp; Siap Digunakan
                  </span>
                </div>
              </div>

              {/* Garis Pembatas */}
              <div className="w-full h-px bg-slate-200 dark:bg-slate-800 mb-6"></div>

              {/* Button Tutup & Selesai */}
              <button
                type="button"
                onClick={() => setIsSuccessCreatedModalOpen(false)}
                className="w-full h-13 py-3.5 bg-[#0e5d26] hover:bg-[#0b471d] text-white font-extrabold rounded-xl text-sm sm:text-base shadow-lg shadow-emerald-950/20 transition-all cursor-pointer flex items-center justify-center active:scale-[0.99]"
              >
                Tutup &amp; Selesai
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
              className="success-modal-card modal-animate-pop"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Green Checkmark Badge Icon */}
              <div className="modal-badge-bounce w-20 h-20 rounded-full bg-emerald-100/90 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-900/10 ring-8 ring-emerald-50/90 dark:ring-emerald-900/20">
                <svg
                  className="w-10 h-10 text-emerald-600 dark:text-emerald-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2.5"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>

              {/* Title & Subtitle */}
              <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight mb-2">
                Data Pengguna Berhasil Diubah!
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed px-2">
                Perubahan data akun atas nama <strong className="font-bold text-slate-800 dark:text-slate-200">{editedUserData.nama}</strong> telah berhasil diperbarui ke dalam sistem.
              </p>

              {/* Detail Breakdown Card */}
              <div className="success-modal-details">
                <div className="success-modal-row items-center">
                  <span className="success-modal-label">Pengguna:</span>
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-emerald-700 text-white text-xs font-extrabold flex items-center justify-center shrink-0">
                      {getInitials(editedUserData.nama)}
                    </div>
                    <strong className="success-modal-value">
                      {editedUserData.nama} {editedUserData.username ? `(@${editedUserData.username})` : ''}
                    </strong>
                  </div>
                </div>

                <div className="success-modal-divider"></div>

                <div className="success-modal-row">
                  <span className="success-modal-label">Hak Akses / Role:</span>
                  <span className="inline-block px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-extrabold text-xs">
                    {editedUserData.role}
                  </span>
                </div>

                {editedUserData.nis && editedUserData.nis !== '—' && (
                  <>
                    <div className="success-modal-divider"></div>
                    <div className="success-modal-row">
                      <span className="success-modal-label">Tautan NIS:</span>
                      <strong className="success-modal-value font-mono text-emerald-700 dark:text-emerald-400 text-xs sm:text-sm">
                        {editedUserData.nis}
                      </strong>
                    </div>
                  </>
                )}

                {!isStaffOrAdmin && editedUserData.noHp && editedUserData.noHp !== '—' && (
                  <>
                    <div className="success-modal-divider"></div>
                    <div className="success-modal-row">
                      <span className="success-modal-label">No. Handphone:</span>
                      <span className="success-modal-value font-semibold">
                        {editedUserData.noHp}
                      </span>
                    </div>
                  </>
                )}

                <div className="success-modal-divider"></div>

                <div className="success-modal-row">
                  <span className="success-modal-label">Status:</span>
                  <span className="inline-flex items-center gap-1.5 font-bold text-emerald-700 dark:text-emerald-400 text-xs sm:text-sm">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    Perubahan Tersimpan
                  </span>
                </div>
              </div>

              {/* Garis Pembatas */}
              <div className="w-full h-px bg-slate-200 dark:bg-slate-800 mb-6"></div>

              {/* Button Tutup & Selesai */}
              <button
                type="button"
                onClick={() => setIsSuccessEditedModalOpen(false)}
                className="w-full h-13 py-3.5 bg-[#0e5d26] hover:bg-[#0b471d] text-white font-extrabold rounded-xl text-sm sm:text-base shadow-lg shadow-emerald-950/20 transition-all cursor-pointer flex items-center justify-center active:scale-[0.99]"
              >
                Tutup &amp; Selesai
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
            className="success-modal-card modal-animate-pop"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Green Checkmark Badge Icon */}
            <div className="modal-badge-bounce w-20 h-20 rounded-full bg-emerald-100/90 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-900/10 ring-8 ring-emerald-50/90 dark:ring-emerald-900/20">
              <svg
                className="w-10 h-10 text-emerald-600 dark:text-emerald-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2.5"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>

            {/* Title & Subtitle */}
            <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight mb-2">
              Data Pengguna Berhasil Dihapus!
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed px-2">
              {deletedUserPayload.count > 1 ? (
                <>Sebanyak <strong className="font-bold text-slate-800 dark:text-slate-200">{deletedUserPayload.count} data akun pengguna</strong> telah berhasil dihapus dari sistem.</>
              ) : (
                <>Data akun atas nama <strong className="font-bold text-slate-800 dark:text-slate-200">{deletedUserPayload.nama}</strong> telah berhasil dihapus dari sistem.</>
              )}
            </p>

            {/* Detail Breakdown Card */}
            <div className="success-modal-details">
              <div className="success-modal-row items-center">
                <span className="success-modal-label">Pengguna:</span>
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-emerald-700 text-white text-xs font-extrabold flex items-center justify-center shrink-0">
                    {getInitials(deletedUserPayload.nama)}
                  </div>
                  <strong className="success-modal-value">
                    {deletedUserPayload.count > 1 ? `${deletedUserPayload.count} Pengguna Terpilih` : deletedUserPayload.nama}
                  </strong>
                </div>
              </div>

              {deletedUserPayload.role && (
                <>
                  <div className="success-modal-divider"></div>
                  <div className="success-modal-row">
                    <span className="success-modal-label">Hak Akses / Role:</span>
                    <span className="inline-block px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-extrabold text-xs">
                      {deletedUserPayload.role}
                    </span>
                  </div>
                </>
              )}

              <div className="success-modal-divider"></div>

              <div className="success-modal-row">
                <span className="success-modal-label">Status:</span>
                <span className="inline-flex items-center gap-1.5 font-bold text-emerald-700 dark:text-emerald-400 text-xs sm:text-sm">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  Telah Dihapus dari Sistem
                </span>
              </div>
            </div>

            {/* Garis Pembatas */}
            <div className="w-full h-px bg-slate-200 dark:bg-slate-800 mb-6"></div>

            {/* Button Tutup & Selesai */}
            <button
              type="button"
              onClick={() => setIsSuccessDeletedModalOpen(false)}
              className="w-full h-13 py-3.5 bg-[#0e5d26] hover:bg-[#0b471d] text-white font-extrabold rounded-xl text-sm sm:text-base shadow-lg shadow-emerald-950/20 transition-all cursor-pointer flex items-center justify-center active:scale-[0.99]"
            >
              Tutup &amp; Selesai
            </button>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default UserManagementPage;
