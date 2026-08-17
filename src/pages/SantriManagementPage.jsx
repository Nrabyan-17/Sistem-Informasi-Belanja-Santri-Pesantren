import { useState, useEffect, useMemo, useRef } from 'react';
import MainLayout from '../components/layout/MainLayout';
import SantriKpiCards from '../components/santri/SantriKpiCards';
import SantriFilterBar from '../components/santri/SantriFilterBar';
import SantriTable from '../components/santri/SantriTable';
import SantriModalForm from '../components/santri/SantriModalForm';
import SantriDetailModal from '../components/santri/SantriDetailModal';
import { santriApi } from '../utils/api';

// API → bentuk yang dibaca komponen santri
const apiToUi = (s) => ({
  id: s.id,
  nis: s.nis,
  nama: s.nama,
  jenisKelamin: s.jenis_kelamin || '',
  tglLahir: s.tanggal_lahir || '',
  vaJajan: s.va_jajan || '',
  vaTagihan: s.va_pembayaran || '',
  status: s.status || 'aktif',
  saldo: s.saldo || 0,
  foto: s.foto_url || null,
});

// Form (UI) → payload API (snake_case); update via method spoofing _method=PUT
const uiToFormData = (f, isEdit) => {
  const fd = new FormData();
  fd.append('nis', f.nis);
  fd.append('nama', f.nama);
  fd.append('jenis_kelamin', f.jenisKelamin);
  if (f.tglLahir) fd.append('tanggal_lahir', f.tglLahir);
  if (f.vaJajan) fd.append('va_jajan', f.vaJajan);
  if (f.vaTagihan) fd.append('va_pembayaran', f.vaTagihan);
  fd.append('status', f.status);
  if (f.foto instanceof File) fd.append('foto', f.foto);
  if (isEdit) fd.append('_method', 'PUT');
  return fd;
};

const SantriManagementPage = ({ Layout = MainLayout }) => {
  const [santriList, setSantriList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('Semua Status');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editSantri, setEditSantri] = useState(null);

  const [detailTarget, setDetailTarget] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const importFileRef = useRef(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importReport, setImportReport] = useState(null);
  const [importError, setImportError] = useState('');

  const fetchSantri = () => {
    setLoading(true);
    santriApi
      .list({ per_page: 100 })
      .then((res) => setSantriList((res.data || []).map(apiToUi)))
      .catch((e) => setError(e.message || 'Gagal memuat data santri.'))
      .finally(() => setLoading(false));
  };

  useEffect(fetchSantri, []);

  // Filter data santri
  const filteredSantri = useMemo(() => {
    return santriList.filter((s) => {
      // 1. Search (NIS atau Nama)
      if (search.trim()) {
        const query = search.toLowerCase();
        const matchesNama = s.nama.toLowerCase().includes(query);
        const matchesNis = s.nis.toLowerCase().includes(query);
        if (!matchesNama && !matchesNis) return false;
      }

      // 2. Filter Status
      if (statusFilter !== 'Semua Status') {
        if (s.status !== statusFilter) return false;
      }

      return true;
    });
  }, [santriList, search, statusFilter]);

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

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setError('');
    try {
      await santriApi.destroy(deleteTarget.id);
      setIsDeleteOpen(false);
      setDeleteTarget(null);
      fetchSantri();
    } catch (e) {
      setError(e.message || 'Gagal menghapus data santri.');
      setIsDeleteOpen(false);
    }
  };

  // Submit Form
  const handleSubmitForm = async (formData) => {
    setError('');
    try {
      const isEdit = Boolean(editSantri?.id);
      const fd = uiToFormData(formData, isEdit);
      if (isEdit) await santriApi.update(editSantri.id, fd);
      else await santriApi.store(fd);
      setIsModalOpen(false);
      fetchSantri();
    } catch (e) {
      setError(e.message || 'Gagal menyimpan data santri.');
    }
  };

  // Import Batch (xlsx)
  const handleImportClick = () => importFileRef.current?.click();

  const handleImportFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('file', file);
    setIsImporting(true);
    setImportError('');
    setImportReport(null);
    try {
      const report = await santriApi.import(fd);
      setImportReport(report);
      fetchSantri();
    } catch (err) {
      setImportError(err.message || 'Gagal mengimpor data santri.');
    } finally {
      setIsImporting(false);
      if (importFileRef.current) importFileRef.current.value = '';
    }
  };

  return (
    <Layout pageTitle="Data Santri">
      {/* Hidden file input untuk import batch */}
      <input
        ref={importFileRef}
        type="file"
        accept=".xlsx,.xls,.csv"
        className="hidden"
        onChange={handleImportFile}
      />

      {/* Header Title & Subtitle */}
      <div className="report-header-card mb-6">
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">
          Manajemen Data Santri
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">
          Kelola data identitas, saldo, dan akun virtual seluruh santri pesantren
        </p>
      </div>

      {error && (
        <div className="mb-6 px-4 py-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 rounded-2xl text-sm font-semibold text-rose-700 dark:text-rose-300">
          {error}
        </div>
      )}

      {importError && (
        <div className="mb-6 px-4 py-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 rounded-2xl text-sm font-semibold text-rose-700 dark:text-rose-300">
          {importError}
        </div>
      )}

      {importReport && (
        <div className="mb-6 px-4 py-3 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900 rounded-2xl text-sm font-semibold text-emerald-700 dark:text-emerald-300">
          Import selesai: diproses {importReport.diproses ?? 0}, ditambah {importReport.ditambah ?? 0},
          diupdate {importReport.diupdate ?? 0}, error {importReport.error ?? 0}.
        </div>
      )}

      {isImporting && (
        <div className="flex items-center justify-center h-32 text-slate-500 dark:text-slate-400 font-medium">
          Mengimpor data santri...
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center h-32 text-slate-500 dark:text-slate-400 font-medium">
          Memuat data santri...
        </div>
      )}

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
        status={statusFilter}
        onStatusChange={setStatusFilter}
        onAddSantri={handleAddSantri}
        onImportSantri={handleImportClick}
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
