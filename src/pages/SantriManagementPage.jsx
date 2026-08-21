import { useState, useMemo, useEffect } from 'react';
import MainLayout from '../components/layout/MainLayout';
import SantriKpiCards from '../components/santri/SantriKpiCards';
import SantriFilterBar from '../components/santri/SantriFilterBar';
import SantriTable from '../components/santri/SantriTable';
import SantriModalForm from '../components/santri/SantriModalForm';
import SantriDetailModal from '../components/santri/SantriDetailModal';
import SantriBatchUploadModal from '../components/santri/SantriBatchUploadModal';
import BatchActionBar from '../components/common/BatchActionBar';
import { santriApi } from '../utils/api';

const mapSantriFromApi = (item) => ({
  id: item.id,
  nis: item.nis || '',
  nama: item.nama || item.name || '',
  kelas: item.kelas || 'VII A',
  tglLahir: item.tanggal_lahir || item.tgl_lahir || item.tglLahir || '',
  namaWali: item.nama_wali || item.namaWali || item.wali_user?.name || '',
  noHpWali: item.no_hp_wali || item.noHpWali || '',
  vaJajan: item.va_jajan || item.vaJajan || '',
  vaTagihan: item.va_tagihan || item.vaTagihan || '',
  status: item.status || 'aktif',
  saldo: Number(item.saldo || 0),
  foto: item.foto || item.foto_url || null,
});

const SantriManagementPage = ({ Layout = MainLayout }) => {
  const [santriList, setSantriList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [kelasFilter, setKelasFilter] = useState('Semua Kelas');
  const [statusFilter, setStatusFilter] = useState('Semua Status');

  const [selectedIds, setSelectedIds] = useState([]);
  const [isBatchDeleteOpen, setIsBatchDeleteOpen] = useState(false);
  const [isBatchUploadOpen, setIsBatchUploadOpen] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editSantri, setEditSantri] = useState(null);

  const [detailTarget, setDetailTarget] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const [isSuccessSantriCreatedOpen, setIsSuccessSantriCreatedOpen] = useState(false);
  const [createdSantriData, setCreatedSantriData] = useState(null);

  const [isSuccessEditedSantriOpen, setIsSuccessEditedSantriOpen] = useState(false);
  const [editedSantriData, setEditedSantriData] = useState(null);

  const [isSuccessDeletedSantriOpen, setIsSuccessDeletedSantriOpen] = useState(false);
  const [deletedSantriPayload, setDeletedSantriPayload] = useState(null);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const loadSantriData = () => {
    setLoading(true);
    santriApi.list({ per_page: 500 })
      .then((res) => {
        const rawData = res.data || (Array.isArray(res) ? res : []);
        if (Array.isArray(rawData)) {
          setSantriList(rawData.map(mapSantriFromApi));
        }
      })
      .catch((err) => {
        console.warn('Gagal memuat data santri:', err.message);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadSantriData();
  }, []);

  // Daftar kelas unik dari data santri
  const kelasOptions = useMemo(() => {
    const kelasSet = new Set(santriList.map((s) => s.kelas).filter(Boolean));
    return Array.from(kelasSet).sort();
  }, [santriList]);

  // Filter santri
  const filteredSantri = useMemo(() => {
    return santriList.filter((s) => {
      if (search.trim()) {
        const q = search.toLowerCase();
        const mNama = s.nama?.toLowerCase().includes(q);
        const mNis = s.nis?.toLowerCase().includes(q);
        const mWali = s.namaWali?.toLowerCase().includes(q);
        if (!mNama && !mNis && !mWali) return false;
      }
      if (kelasFilter !== 'Semua Kelas' && s.kelas !== kelasFilter) return false;
      if (statusFilter !== 'Semua Status' && s.status !== statusFilter) return false;
      return true;
    });
  }, [santriList, search, kelasFilter, statusFilter]);

  // Compute KPI secara dinamis dan real-time dari data santri
  const kpiStats = useMemo(() => {
    const totalSantri = santriList.length;
    const santriAktif = santriList.filter((s) => (s.status || '').toLowerCase() === 'aktif').length;
    const santriNonaktif = santriList.filter((s) => (s.status || '').toLowerCase() === 'nonaktif').length;
    const totalSaldo = santriList.reduce((acc, curr) => acc + Number(curr.saldo || 0), 0);

    return {
      totalSantri,
      santriAktif,
      santriNonaktif,
      totalSaldo,
    };
  }, [santriList]);

  // Multi-Select Handlers
  const toggleSelectAll = () => {
    if (selectedIds.length === filteredSantri.length && filteredSantri.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredSantri.map((s) => s.id));
    }
  };

  const toggleSelectRow = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleBatchStatusChange = (newStatus) => {
    selectedIds.forEach((id) => {
      santriApi.update(id, { status: newStatus }).catch(() => {});
    });
    setSantriList((prev) =>
      prev.map((s) =>
        selectedIds.includes(s.id) ? { ...s, status: newStatus } : s
      )
    );
    setSelectedIds([]);
  };

  const handleBatchDelete = () => {
    setIsBatchDeleteOpen(true);
  };

  const confirmBatchDelete = () => {
    const deletedCount = selectedIds.length;
    const deletedInfo = {
      nama: `${deletedCount} Santri Terpilih`,
      count: deletedCount,
    };

    selectedIds.forEach((id) => {
      santriApi.destroy(id).catch(() => {});
    });

    setSantriList((prev) => prev.filter((s) => !selectedIds.includes(s.id)));
    setSelectedIds([]);
    setIsBatchDeleteOpen(false);

    setDeletedSantriPayload(deletedInfo);
    setIsSuccessDeletedSantriOpen(true);
  };

  // Actions
  const handleViewDetail = (santri) => {
    setDetailTarget(santri);
    setIsDetailOpen(true);
  };

  const handleAddSantri = () => {
    setEditSantri(null);
    setIsModalOpen(true);
  };

  const handleEditSantri = (santri) => {
    setEditSantri(santri);
    setIsModalOpen(true);
  };

  // Delete Single
  const handleDeleteSantri = (santri) => {
    setDeleteTarget(santri);
    setIsDeleteOpen(true);
  };

  const confirmDelete = () => {
    if (deleteTarget) {
      const deletedInfo = {
        nama: deleteTarget.nama,
        nis: deleteTarget.nis,
        count: 1,
      };
      santriApi.destroy(deleteTarget.id)
        .then(() => loadSantriData())
        .catch(() => {
          setSantriList((prev) => prev.filter((s) => s.id !== deleteTarget.id));
        })
        .finally(() => {
          setIsDeleteOpen(false);
          setDeleteTarget(null);
        });

      setDeletedSantriPayload(deletedInfo);
      setIsSuccessDeletedSantriOpen(true);
    }
  };

  // Submit Form (Single Add/Edit)
  const handleSubmitForm = async (formData) => {
    const payload = {
      nis: formData.nis,
      nama: formData.nama,
      jenis_kelamin: formData.jenisKelamin || formData.jenis_kelamin || 'L',
      tanggal_lahir: formData.tglLahir || formData.tanggal_lahir || null,
      kelas: formData.kelas || null,
      unit: formData.unit || null,
      va_jajan: formData.vaJajan || formData.va_jajan || null,
      status: (formData.status || 'aktif').toLowerCase(),
      alamat: formData.alamat || null,
    };

    try {
      if (editSantri && editSantri.id) {
        // Edit existing
        if (formData.foto && formData.foto instanceof File) {
          const dataToSend = new FormData();
          Object.keys(payload).forEach((k) => {
            if (payload[k] !== null && payload[k] !== undefined) dataToSend.append(k, payload[k]);
          });
          dataToSend.append('foto', formData.foto);
          dataToSend.append('_method', 'PUT');
          await santriApi.update(editSantri.id, dataToSend);
        } else {
          await santriApi.update(editSantri.id, payload);
        }

        const updated = { ...editSantri, ...formData };
        setEditedSantriData(updated);
        setIsSuccessEditedSantriOpen(true);
      } else {
        // Add new
        if (formData.foto && formData.foto instanceof File) {
          const dataToSend = new FormData();
          Object.keys(payload).forEach((k) => {
            if (payload[k] !== null && payload[k] !== undefined) dataToSend.append(k, payload[k]);
          });
          dataToSend.append('foto', formData.foto);
          await santriApi.store(dataToSend);
        } else {
          await santriApi.store(payload);
        }

        setCreatedSantriData({ ...formData, saldo: 0 });
        setIsSuccessSantriCreatedOpen(true);
      }
      await loadSantriData();
    } catch (err) {
      console.warn('Gagal simpan santri ke server:', err.message);
    }
    setIsModalOpen(false);
  };

  // Batch Upload Success Handler (Push data dari pop-up preview ke database/state)
  const handleBatchUploadSuccess = (payload) => {
    if (Array.isArray(payload)) {
      santriApi.importConfirm(payload).catch(() => {});
      setSantriList((prev) => [...payload.map(mapSantriFromApi), ...prev]);
    } else if (payload && typeof payload === 'object') {
      const { newSantri = [], updatedSantri = [] } = payload;
      santriApi.importConfirm([...newSantri, ...updatedSantri]).catch(() => {});
      setSantriList((prev) => {
        const updatedList = prev.map((item) => {
          const matchedUpdate = updatedSantri.find((u) => String(u.nis) === String(item.nis));
          return matchedUpdate ? { ...item, ...mapSantriFromApi(matchedUpdate) } : item;
        });
        return [...newSantri.map(mapSantriFromApi), ...updatedList];
      });
    }
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

      {/* KPI Cards Ringkasan Data Santri (Real-time) */}
      <SantriKpiCards
        totalSantri={kpiStats.totalSantri}
        santriAktif={kpiStats.santriAktif}
        santriNonaktif={kpiStats.santriNonaktif}
        totalSaldo={kpiStats.totalSaldo}
      />

      {/* Filter Bar dengan Tombol Import Batch & Tambah Santri */}
      <SantriFilterBar
        search={search}
        onSearchChange={setSearch}
        kelas={kelasFilter}
        onKelasChange={setKelasFilter}
        status={statusFilter}
        onStatusChange={setStatusFilter}
        onAddSantri={handleAddSantri}
        onUploadBatch={() => setIsBatchUploadOpen(true)}
        kelasOptions={kelasOptions}
      />

      {/* Batch Action Bar (Model B: Tampil tepat di atas tabel saat checkbox dicentang) */}
      <BatchActionBar
        selectedCount={selectedIds.length}
        onClearSelection={() => setSelectedIds([])}
        onBatchStatusChange={handleBatchStatusChange}
        onBatchDelete={handleBatchDelete}
        itemLabel="santri"
      />

      {/* Tabel Data Santri */}
      <SantriTable
        loading={loading}
        loadingText="Memuat data Santri..."
        data={filteredSantri}
        totalCount={kpiStats.totalSantri}
        activeCount={kpiStats.santriAktif}
        nonactiveCount={kpiStats.santriNonaktif}
        selectedIds={selectedIds}
        onToggleSelectAll={toggleSelectAll}
        onToggleSelectRow={toggleSelectRow}
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

      {/* Modal Pop-Up Import Batch Santri dengan Fitur Preview, Edit, Delete, dan Handler Data Ganda */}
      <SantriBatchUploadModal
        isOpen={isBatchUploadOpen}
        onClose={() => setIsBatchUploadOpen(false)}
        onImportSuccess={handleBatchUploadSuccess}
        existingSantriList={santriList}
      />

      {/* Modal Konfirmasi Hapus Single Data Santri */}
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
              Hapus Data Santri
            </h3>

            <p
              className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed"
              style={{ fontSize: '15px', maxWidth: '340px', marginBottom: '28px' }}
            >
              Apakah Anda yakin ingin menghapus data santri <strong className="text-slate-900 dark:text-slate-100 font-bold">{deleteTarget.nama}</strong> (NIS: {deleteTarget.nis})? Tindakan ini tidak dapat dibatalkan.
            </p>

            <div
              className="w-full border-t border-slate-200 dark:border-slate-800"
              style={{ marginBottom: '24px' }}
            />

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

      {/* Modal Konfirmasi Hapus Massal (Batch Delete) */}
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
              Hapus {selectedIds.length} Santri Terpilih?
            </h3>

            <p
              className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed"
              style={{ fontSize: '15px', maxWidth: '340px', marginBottom: '28px' }}
            >
              Apakah Anda yakin ingin menghapus <strong className="text-rose-600 font-bold">{selectedIds.length} data santri</strong> sekaligus? Tindakan ini tidak dapat dibatalkan.
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

      {/* POP-UP FORM SANTRI BARU BERHASIL DITAMBAHKAN */}
      {isSuccessSantriCreatedOpen && createdSantriData && (
        <div
          className="fixed inset-0 z-[99999] bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-fadeIn"
          onClick={() => setIsSuccessSantriCreatedOpen(false)}
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
              Data Santri Berhasil Ditambahkan!
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed px-2 mb-6">
              Data santri atas nama <strong className="font-bold text-slate-800 dark:text-slate-200">{createdSantriData.nama}</strong> telah berhasil didaftarkan dan disimpan.
            </p>

            {/* Detail Breakdown Card dengan Spacing Teratur */}
            <div className="w-full bg-slate-50 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700/80 rounded-2xl p-5 text-left flex flex-col gap-3 mb-6">
              <div className="flex justify-between items-center text-xs sm:text-sm py-0.5">
                <span className="text-slate-500 dark:text-slate-400 font-semibold">Nama Santri:</span>
                <strong className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                  {createdSantriData.nama}
                </strong>
              </div>

              <div className="w-full h-px bg-slate-200/70 dark:bg-slate-700/70"></div>

              <div className="flex justify-between items-center text-xs sm:text-sm py-0.5">
                <span className="text-slate-500 dark:text-slate-400 font-semibold">NIS:</span>
                <strong className="font-mono font-bold text-emerald-700 dark:text-emerald-400 text-xs sm:text-sm">
                  {createdSantriData.nis}
                </strong>
              </div>

              <div className="w-full h-px bg-slate-200/70 dark:bg-slate-700/70"></div>

              <div className="flex justify-between items-center text-xs sm:text-sm py-0.5">
                <span className="text-slate-500 dark:text-slate-400 font-semibold">Kelas:</span>
                <span className="inline-block px-2.5 py-1 rounded-lg bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300 font-extrabold text-xs">
                  {createdSantriData.kelas}
                </span>
              </div>

              {createdSantriData.namaWali && (
                <>
                  <div className="w-full h-px bg-slate-200/70 dark:bg-slate-700/70"></div>
                  <div className="flex justify-between items-center text-xs sm:text-sm py-0.5">
                    <span className="text-slate-500 dark:text-slate-400 font-semibold">Nama Wali:</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {createdSantriData.namaWali}
                    </span>
                  </div>
                </>
              )}

              <div className="w-full h-px bg-slate-200/70 dark:bg-slate-700/70"></div>

              <div className="flex justify-between items-center text-xs sm:text-sm py-0.5">
                <span className="text-slate-500 dark:text-slate-400 font-semibold">Status:</span>
                <span className="inline-flex items-center gap-1.5 font-bold text-emerald-700 dark:text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  Tersimpan di Database
                </span>
              </div>
            </div>

            {/* Button Tutup & Selesai */}
            <button
              type="button"
              onClick={() => setIsSuccessSantriCreatedOpen(false)}
              className="w-full h-12 py-3 bg-[#0e5d26] hover:bg-[#0b471d] active:scale-[0.99] text-white font-extrabold rounded-xl text-sm shadow-lg shadow-emerald-950/20 transition-all cursor-pointer flex items-center justify-center"
            >
              Selesai &amp; Lihat Data Santri
            </button>
          </div>
        </div>
      )}

      {/* POP-UP FORM DATA SANTRI BERHASIL DIUBAH */}
      {isSuccessEditedSantriOpen && editedSantriData && (
        <div
          className="fixed inset-0 z-[99999] bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-fadeIn"
          onClick={() => setIsSuccessEditedSantriOpen(false)}
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
              Data Santri Berhasil Diubah!
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed px-2 mb-6">
              Perubahan data santri atas nama <strong className="font-bold text-slate-800 dark:text-slate-200">{editedSantriData.nama}</strong> telah berhasil diperbarui ke dalam sistem.
            </p>

            {/* Detail Breakdown Card */}
            <div className="w-full bg-slate-50 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700/80 rounded-2xl p-5 text-left flex flex-col gap-3 mb-6">
              <div className="flex justify-between items-center text-xs sm:text-sm py-0.5">
                <span className="text-slate-500 dark:text-slate-400 font-semibold">Nama Santri:</span>
                <strong className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                  {editedSantriData.nama}
                </strong>
              </div>

              <div className="w-full h-px bg-slate-200/70 dark:bg-slate-700/70"></div>

              <div className="flex justify-between items-center text-xs sm:text-sm py-0.5">
                <span className="text-slate-500 dark:text-slate-400 font-semibold">NIS:</span>
                <strong className="font-mono font-bold text-emerald-700 dark:text-emerald-400 text-xs sm:text-sm">
                  {editedSantriData.nis}
                </strong>
              </div>

              <div className="w-full h-px bg-slate-200/70 dark:bg-slate-700/70"></div>

              <div className="flex justify-between items-center text-xs sm:text-sm py-0.5">
                <span className="text-slate-500 dark:text-slate-400 font-semibold">Kelas:</span>
                <span className="inline-block px-2.5 py-1 rounded-lg bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300 font-extrabold text-xs">
                  {editedSantriData.kelas}
                </span>
              </div>

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
              onClick={() => setIsSuccessEditedSantriOpen(false)}
              className="w-full h-12 py-3 bg-[#0e5d26] hover:bg-[#0b471d] active:scale-[0.99] text-white font-extrabold rounded-xl text-sm shadow-lg shadow-emerald-950/20 transition-all cursor-pointer flex items-center justify-center"
            >
              Selesai &amp; Lihat Data Santri
            </button>
          </div>
        </div>
      )}

      {/* POP-UP FORM DATA SANTRI BERHASIL DIHAPUS */}
      {isSuccessDeletedSantriOpen && deletedSantriPayload && (
        <div
          className="fixed inset-0 z-[99999] bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-fadeIn"
          onClick={() => setIsSuccessDeletedSantriOpen(false)}
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
              Data Santri Berhasil Dihapus!
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed px-2 mb-6">
              {deletedSantriPayload.count > 1 ? (
                <>Sebanyak <strong className="font-bold text-slate-800 dark:text-slate-200">{deletedSantriPayload.count} data santri</strong> telah berhasil dihapus dari sistem.</>
              ) : (
                <>Data santri atas nama <strong className="font-bold text-slate-800 dark:text-slate-200">{deletedSantriPayload.nama}</strong> telah berhasil dihapus dari sistem.</>
              )}
            </p>

            {/* Detail Breakdown Card */}
            <div className="w-full bg-slate-50 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700/80 rounded-2xl p-5 text-left flex flex-col gap-3 mb-6">
              <div className="flex justify-between items-center text-xs sm:text-sm py-0.5">
                <span className="text-slate-500 dark:text-slate-400 font-semibold">Keterangan:</span>
                <strong className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                  {deletedSantriPayload.count > 1 ? `${deletedSantriPayload.count} Santri Terpilih` : deletedSantriPayload.nama}
                </strong>
              </div>

              {deletedSantriPayload.nis && (
                <>
                  <div className="w-full h-px bg-slate-200/70 dark:bg-slate-700/70"></div>
                  <div className="flex justify-between items-center text-xs sm:text-sm py-0.5">
                    <span className="text-slate-500 dark:text-slate-400 font-semibold">NIS:</span>
                    <strong className="font-mono font-bold text-emerald-700 dark:text-emerald-400 text-xs">
                      {deletedSantriPayload.nis}
                    </strong>
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
              onClick={() => setIsSuccessDeletedSantriOpen(false)}
              className="w-full h-12 py-3 bg-[#0e5d26] hover:bg-[#0b471d] active:scale-[0.99] text-white font-extrabold rounded-xl text-sm shadow-lg shadow-emerald-950/20 transition-all cursor-pointer flex items-center justify-center"
            >
              Selesai &amp; Lihat Data Santri
            </button>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default SantriManagementPage;
