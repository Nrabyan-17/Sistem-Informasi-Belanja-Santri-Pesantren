import { useState, useMemo } from 'react';
import MainLayout from '../components/layout/MainLayout';
import SantriKpiCards from '../components/santri/SantriKpiCards';
import SantriFilterBar from '../components/santri/SantriFilterBar';
import SantriTable from '../components/santri/SantriTable';
import SantriModalForm from '../components/santri/SantriModalForm';
import SantriDetailModal from '../components/santri/SantriDetailModal';
import { mockSantri } from '../data/mockSantri';

const SantriManagementPage = ({ Layout = MainLayout }) => {
  const [santriList, setSantriList] = useState(mockSantri);
  const [search, setSearch] = useState('');
  const [kelasFilter, setKelasFilter] = useState('Semua Kelas');
  const [statusFilter, setStatusFilter] = useState('Semua Status');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editSantri, setEditSantri] = useState(null);

  const [detailTarget, setDetailTarget] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  // Daftar kelas unik dari data santri
  const kelasOptions = useMemo(() => {
    const kelasSet = new Set(santriList.map((s) => s.kelas));
    return Array.from(kelasSet).sort();
  }, [santriList]);

  // Filter data santri
  const filteredSantri = useMemo(() => {
    return santriList.filter((s) => {
      // 1. Search (NIS atau Nama)
      if (search.trim()) {
        const query = search.toLowerCase();
        const matchesNama = s.nama.toLowerCase().includes(query);
        const matchesNis = s.nis.toLowerCase().includes(query);
        const matchesWali = s.namaWali ? s.namaWali.toLowerCase().includes(query) : false;
        if (!matchesNama && !matchesNis && !matchesWali) return false;
      }

      // 2. Filter Kelas
      if (kelasFilter !== 'Semua Kelas') {
        if (s.kelas !== kelasFilter) return false;
      }

      // 3. Filter Status
      if (statusFilter !== 'Semua Status') {
        if (s.status !== statusFilter) return false;
      }

      return true;
    });
  }, [santriList, search, kelasFilter, statusFilter]);

  // KPI metrics
  const kpiStats = useMemo(() => {
    const total = santriList.length;
    const aktif = santriList.filter((s) => s.status === 'aktif').length;
    const nonaktif = total - aktif;
    const totalSaldo = santriList.reduce((sum, s) => sum + (s.saldo || 0), 0);
    return { total, aktif, nonaktif, totalSaldo };
  }, [santriList]);

  // View Detail
  const handleViewDetail = (santri) => {
    setDetailTarget(santri);
    setIsDetailOpen(true);
  };

  // Add New
  const handleAddSantri = () => {
    setEditSantri({});
    setIsModalOpen(true);
  };

  // Edit
  const handleEditSantri = (santri) => {
    setEditSantri(santri);
    setIsModalOpen(true);
  };

  // Delete
  const handleDeleteSantri = (santri) => {
    setDeleteTarget(santri);
    setIsDeleteOpen(true);
  };

  const confirmDelete = () => {
    if (deleteTarget) {
      setSantriList((prev) => prev.filter((s) => s.id !== deleteTarget.id));
      setIsDeleteOpen(false);
      setDeleteTarget(null);
    }
  };

  // Submit Form
  const handleSubmitForm = (formData) => {
    if (editSantri && editSantri.id) {
      // Edit existing
      setSantriList(
        santriList.map((s) => (s.id === editSantri.id ? { ...s, ...formData } : s))
      );
    } else {
      // Add new
      const newSantri = {
        id: Date.now(),
        nis: formData.nis || '',
        nama: formData.nama || 'Santri Baru',
        kelas: formData.kelas || 'VII A',
        tglLahir: formData.tglLahir || '',
        namaWali: formData.namaWali || '',
        noHpWali: formData.noHpWali || '',
        vaJajan: formData.vaJajan || '',
        vaTagihan: formData.vaTagihan || '',
        status: 'aktif',
        saldo: 0,
      };
      setSantriList([newSantri, ...santriList]);
    }
    setIsModalOpen(false);
  };

  return (
    <Layout pageTitle="Data Santri">
      {/* Header Title & Subtitle */}
      <div className="report-header-card mb-6">
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">
          Manajemen Data Santri
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">
          Kelola data identitas, kelas, wali, dan akun virtual seluruh santri pesantren
        </p>
      </div>

      {/* KPI Cards */}
      <SantriKpiCards
        totalSantri={kpiStats.total}
        santriAktif={kpiStats.aktif}
        santriNonaktif={kpiStats.nonaktif}
        totalSaldo={kpiStats.totalSaldo}
      />

      {/* Filter Bar */}
      <SantriFilterBar
        search={search}
        onSearchChange={setSearch}
        kelas={kelasFilter}
        onKelasChange={setKelasFilter}
        status={statusFilter}
        onStatusChange={setStatusFilter}
        onAddSantri={handleAddSantri}
        kelasOptions={kelasOptions}
      />

      {/* Tabel Data Santri */}
      <SantriTable
        data={filteredSantri}
        totalCount={santriList.length}
        activeCount={kpiStats.aktif}
        nonactiveCount={kpiStats.nonaktif}
        onViewDetail={handleViewDetail}
        onEdit={handleEditSantri}
        onDelete={handleDeleteSantri}
      />

      {/* Modal Form Tambah / Edit */}
      <SantriModalForm
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmitForm}
        initialData={editSantri || {}}
      />

      {/* Modal Detail Santri */}
      {isDetailOpen && detailTarget && (
        <SantriDetailModal
          isOpen={isDetailOpen}
          onClose={() => {
            setIsDetailOpen(false);
            setDetailTarget(null);
          }}
          santri={detailTarget}
          onEdit={handleEditSantri}
        />
      )}

      {/* Modal Konfirmasi Hapus Data Santri */}
      {isDeleteOpen && deleteTarget && (
        <div
          className="fixed inset-0 z-[99999] bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => {
            setIsDeleteOpen(false);
            setDeleteTarget(null);
          }}
        >
          <div
            className="modal-animate-pop bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl max-w-md w-full shadow-2xl relative text-center flex flex-col items-center transition-colors"
            style={{ padding: '44px 36px 36px 36px' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Ikon Trash */}
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

            {/* Judul */}
            <h3
              className="font-extrabold text-slate-900 dark:text-slate-100 tracking-tight"
              style={{ fontSize: '22px', marginBottom: '10px' }}
            >
              Hapus Data Santri
            </h3>

            {/* Deskripsi */}
            <p
              className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed"
              style={{ fontSize: '15px', maxWidth: '340px', marginBottom: '28px' }}
            >
              Apakah Anda yakin ingin menghapus data santri <strong className="text-slate-900 dark:text-slate-100 font-bold">{deleteTarget.nama}</strong> (NIS: {deleteTarget.nis})? Tindakan ini tidak dapat dibatalkan.
            </p>

            {/* Divider */}
            <div
              className="w-full border-t border-slate-200 dark:border-slate-800"
              style={{ marginBottom: '24px' }}
            />

            {/* Tombol Aksi */}
            <div className="flex items-center w-full" style={{ gap: '14px' }}>
              <button
                type="button"
                onClick={() => {
                  setIsDeleteOpen(false);
                  setDeleteTarget(null);
                }}
                className="flex-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 active:scale-95 hover:scale-[1.02] text-slate-700 dark:text-slate-200 font-bold rounded-2xl transition-all duration-150 cursor-pointer shadow-2xs flex items-center justify-center"
                style={{ height: '50px', fontSize: '15px' }}
              >
                Batal
              </button>
              <button
                type="button"
                onClick={confirmDelete}
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

export default SantriManagementPage;
