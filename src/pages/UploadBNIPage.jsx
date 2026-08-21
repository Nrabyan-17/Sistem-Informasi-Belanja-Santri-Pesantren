import { useState, useRef } from 'react';
import StaffLayout from '../components/layout/StaffLayout';
import { bniApi } from '../utils/api';

// Helper function untuk membersihkan karakter tanda petik dan formula Excel ="..."
const cleanCell = (val) => {
  if (!val) return '';
  return val
    .replace(/^="?|"?$/g, '')
    .replace(/^"|"$/g, '')
    .trim();
};

// Parser real untuk file mutasi BNI eCollection CSV
const parseBNICSV = (text) => {
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
  if (lines.length < 2) return [];

  // Deteksi delimiter (; atau , atau tab)
  const firstLine = lines[0];
  const delimiter = firstLine.includes(';') ? ';' : firstLine.includes(',') ? ',' : '\t';

  // Parse header
  const headers = lines[0].split(delimiter).map(cleanCell);
  
  const vaIdx = headers.findIndex(h => /va\s*number/i.test(h) || /^va$/i.test(h));
  const nameIdx = headers.findIndex(h => /customer\s*name|nama/i.test(h));
  const dateIdx = headers.findIndex(h => /payment\s*date|tanggal/i.test(h));
  const amountIdx = headers.findIndex(h => /payment\s*amount|nominal|amount/i.test(h));
  const billingIdx = headers.findIndex(h => /billing\s*id/i.test(h));

  const results = [];

  for (let i = 1; i < lines.length; i++) {
    const rawLine = lines[i];
    if (!rawLine) continue;
    const parts = rawLine.split(delimiter).map(cleanCell);
    if (parts.length < 3) continue;

    const va = vaIdx !== -1 ? parts[vaIdx] : parts[3] || '—';
    const nama = nameIdx !== -1 ? parts[nameIdx] : parts[4] || '—';
    const tanggal = dateIdx !== -1 ? parts[dateIdx] : parts[5] || '—';
    const rawAmount = amountIdx !== -1 ? parts[amountIdx] : parts[7] || '0';
    const nominal = parseInt(rawAmount.replace(/[^0-9]/g, ''), 10) || 0;
    const billingId = billingIdx !== -1 ? parts[billingIdx] : parts[8] || '';

    // Deteksi jenis transaksi
    const isJajan = billingId.toUpperCase().startsWith('JJN');
    const isKlinik = nama.toUpperCase().includes('KLINIK');

    let status = 'valid';
    if (isKlinik || !va || va === '—' || va.length < 8) {
      status = 'invalid';
    }

    // Ekstrak NIS santri dari Billing ID (misal: JJNJULI26/1136 -> 1136) atau 4 digit akhir VA
    let nis = '—';
    if (billingId.includes('/')) {
      nis = billingId.split('/')[1] || '—';
    } else if (va && va.length >= 7) {
      nis = va.slice(-7);
    }

    results.push({
      id: i,
      va,
      nis,
      nama,
      tanggal,
      nominal,
      billingId,
      isJajan,
      status,
    });
  }

  return results;
};

const UploadBNIPage = ({ Layout = StaffLayout }) => {
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [parsedData, setParsedData] = useState(null);
  const [uploadId, setUploadId] = useState(null);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [filterMode, setFilterMode] = useState('all'); // 'all' | 'jajan'
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [editingRowId, setEditingRowId] = useState(null);
  const [editRowData, setEditRowData] = useState({});

  // States untuk Pop-up Resolusi Transaksi BNI Ganda (Duplicate Resolution Handler)
  const [isDuplicateModalOpen, setIsDuplicateModalOpen] = useState(false);
  const [duplicateTransactions, setDuplicateTransactions] = useState([]);
  const [duplicateGlobalOption, setDuplicateGlobalOption] = useState('skip'); // 'skip' | 'process' | 'custom'

  // State untuk Pop-up Validasi Keyakinan Staff Sebelum Simpan Saldo
  const [isValidationModalOpen, setIsValidationModalOpen] = useState(false);

  const fileInputRef = useRef(null);

  const handleDeletePreviewRow = (id) => {
    setParsedData((prev) => prev.filter((item) => item.id !== id));
  };

  const handleStartEditRow = (row) => {
    setEditingRowId(row.id);
    setEditRowData({ ...row });
  };

  const handleSaveEditRow = () => {
    setParsedData((prev) =>
      prev.map((item) => {
        if (item.id === editingRowId) {
          const isValid = editRowData.va && editRowData.va.length >= 8 && editRowData.nis && editRowData.nis !== '-';
          return {
            ...item,
            ...editRowData,
            nominal: Number(editRowData.nominal) || 0,
            status: isValid ? 'valid' : 'invalid',
          };
        }
        return item;
      })
    );
    setEditingRowId(null);
    setEditRowData({});
  };

  const handleCancelEditRow = () => {
    setEditingRowId(null);
    setEditRowData({});
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const processFile = async (selectedFile) => {
    if (!selectedFile) return;
    setFile(selectedFile);
    setIsUploading(true);
    setIsConfirmed(false);
    setUploadId(null);

    // Coba upload langsung ke backend Laravel BNI Upload API
    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const apiRes = await bniApi.store(formData);
      if (apiRes && apiRes.upload) {
        setUploadId(apiRes.upload.id);
        if (Array.isArray(apiRes.upload.items) && apiRes.upload.items.length > 0) {
          const mapped = apiRes.upload.items.map((item, idx) => ({
            id: item.id || (idx + 1),
            va: item.va || '—',
            nis: item.santri?.nis || item.nis || '—',
            nama: item.santri?.nama || item.nama_santri_raw || item.nama || '—',
            nominal: Number(item.nominal) || 0,
            tanggal: item.tanggal_transaksi || item.tanggal || new Date().toISOString().slice(0, 10),
            status: item.status_valid ? 'valid' : 'invalid',
            isDuplicate: item.is_duplicate || false,
            isJajan: true,
            santriId: item.santri_id || item.santri?.id || null,
          }));
          setParsedData(mapped);
          setIsUploading(false);
          return;
        }
      }
    } catch (err) {
      console.warn('Backend BNI upload fallback ke client parser:', err.message);
    }

    // Fallback Client-Side CSV Parser
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result;
        if (typeof content === 'string') {
          const parsed = parseBNICSV(content);
          if (parsed.length > 0) {
            setParsedData(parsed);
          } else {
            setErrorMessage('File mutasi tidak memuat baris data transaksi yang valid.');
            setParsedData([]);
          }
        }
      } catch (err) {
        console.error('Gagal parsing CSV:', err);
        setErrorMessage('Gagal memproses struktur file CSV/Excel.');
        setParsedData([]);
      } finally {
        setIsUploading(false);
      }
    };

    reader.onerror = () => {
      setIsUploading(false);
      setErrorMessage('Gagal membaca file. Pastikan format file CSV/Excel valid.');
    };

    reader.readAsText(selectedFile);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  // Validasi Awal: Deteksi Transaksi Duplikat sebelum Top-Up Saldo
  const handleConfirmSave = () => {
    if (!parsedData || parsedData.length === 0) return;

    const duplicates = parsedData.filter((d) => d.isDuplicate);
    if (duplicates.length > 0) {
      setDuplicateTransactions(duplicates.map((d) => ({ ...d, action: 'skip' })));
      setDuplicateGlobalOption('skip');
      setIsDuplicateModalOpen(true);
    } else {
      // Tampilkan modal validasi keyakinan data staff terlebih dahulu
      setIsValidationModalOpen(true);
    }
  };

  const handleRowDuplicateAction = (id, action) => {
    setDuplicateTransactions((prev) =>
      prev.map((d) => (d.id === id ? { ...d, action } : d))
    );
  };

  const handleGlobalDuplicateChange = (mode) => {
    setDuplicateGlobalOption(mode);
    if (mode === 'skip' || mode === 'process') {
      setDuplicateTransactions((prev) =>
        prev.map((d) => ({ ...d, action: mode }))
      );
    }
  };

  const handleFinishDuplicateResolution = () => {
    const skippedIds = new Set(
      duplicateTransactions.filter((d) => d.action === 'skip').map((d) => d.id)
    );
    const finalTransactions = parsedData.filter((d) => !skippedIds.has(d.id));
    setParsedData(finalTransactions);
    setIsDuplicateModalOpen(false);
    // Tampilkan modal validasi konfirmasi
    setIsValidationModalOpen(true);
  };

  // Handler eksekusi simpan saldo final setelah staff yakin di modal validasi
  const handleFinalConfirmSave = async () => {
    setIsValidationModalOpen(false);

    // 1. Eksekusi apply via Backend Laravel API jika uploadId tersedia
    if (uploadId) {
      try {
        const validItemIds = parsedData
          .filter((d) => d.status === 'valid')
          .map((d) => d.id);
        await bniApi.apply(uploadId, validItemIds);
      } catch (err) {
        console.warn('Gagal apply BNI ke backend:', err.message);
      }
    }

    setIsConfirmed(true);
    setIsSuccessModalOpen(true);
  };

  const handleReset = () => {
    setFile(null);
    setParsedData(null);
    setUploadId(null);
    setIsConfirmed(false);
    setFilterMode('all');
    setIsDuplicateModalOpen(false);
    setIsValidationModalOpen(false);
    setDuplicateTransactions([]);
  };

  return (
    <Layout pageTitle="Upload BNI eCollection">
      <div className="bni-upload-page flex flex-col gap-6">
        {/* Header Title + Subtitle */}
        <div className="bni-header-subtitle text-sm text-slate-500 -mt-3 mb-2 font-medium">
          Sinkronisasi data masuk dari rekening BNI eCollection
        </div>

        {/* 3 Step Process Cards */}
        <div className="bni-steps-grid grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Step 1 */}
          <div className="bni-step-card bg-white border border-slate-200 rounded-2xl p-5 flex gap-4 items-start shadow-xs">
            <div className="bni-step-number w-9 h-9 rounded-full bg-emerald-900 text-white flex items-center justify-center font-bold text-sm shrink-0">
              1
            </div>
            <div className="bni-step-content flex-1">
              <h3 className="bni-step-title text-base font-bold text-slate-800 mb-1">Unduh Mutasi BNI</h3>
              <p className="bni-step-desc text-xs text-slate-500 leading-relaxed">
                Login ke BNI e-Collection, unduh file mutasi rekening e-Collection dalam format Excel (.xlsx).
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="bni-step-card bg-white border border-slate-200 rounded-2xl p-5 flex gap-4 items-start shadow-xs">
            <div className="bni-step-number w-9 h-9 rounded-full bg-emerald-900 text-white flex items-center justify-center font-bold text-sm shrink-0">
              2
            </div>
            <div className="bni-step-content flex-1">
              <h3 className="bni-step-title text-base font-bold text-slate-800 mb-1">Upload File di Sini</h3>
              <p className="bni-step-desc text-xs text-slate-500 leading-relaxed">
                Unggah file mutasi. Sistem akan otomatis mencocokkan nomor VA dengan data santri terdaftar.
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="bni-step-card bg-white border border-slate-200 rounded-2xl p-5 flex gap-4 items-start shadow-xs">
            <div className="bni-step-number w-9 h-9 rounded-full bg-emerald-900 text-white flex items-center justify-center font-bold text-sm shrink-0">
              3
            </div>
            <div className="bni-step-content flex-1">
              <h3 className="bni-step-title text-base font-bold text-slate-800 mb-1">Konfirmasi &amp; Simpan</h3>
              <p className="bni-step-desc text-xs text-slate-500 leading-relaxed">
                Periksa hasil validasi , data valid langsung menambah saldo santri setelah dikonfirmasi.
              </p>
            </div>
          </div>
        </div>

        {/* Drag & Drop Upload Zone */}
        <div
          className={`bni-dropzone border-2 border-dashed rounded-3xl p-12 text-center cursor-pointer transition-all flex flex-col items-center justify-center shadow-xs ${
            isDragging ? 'bni-dropzone--dragging scale-[1.005]' : ''
          } ${file ? 'bni-dropzone--has-file' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept=".xlsx,.xls,.csv"
            style={{ display: 'none' }}
          />

          <div className="bni-dropzone-icon-wrapper w-16 h-16 rounded-full bg-emerald-100/80 flex items-center justify-center mb-4">
            <svg
              className="bni-upload-icon w-8 h-8 text-emerald-700"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
              ></path>
            </svg>
          </div>

          {file ? (
            <div className="bni-file-info">
              <h3 className="bni-dropzone-title text-lg font-bold text-slate-800">📄 {file.name}</h3>
              <p className="bni-dropzone-subtitle text-xs text-slate-500 mt-1">
                {(file.size / 1024).toFixed(1)} KB — Klik untuk mengganti file
              </p>
            </div>
          ) : (
            <>
              <h3 className="bni-dropzone-title text-lg font-bold text-slate-800 mb-1">
                Tarik &amp; Lepas File Mutasi BNI eCollection
              </h3>
              <p className="bni-dropzone-subtitle text-xs text-slate-500 mb-5">
                atau klik untuk memilih file dari komputer Anda
              </p>
              <div className="bni-format-badges flex gap-2 justify-center">
                <span className="bni-badge bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1 rounded-full text-xs font-semibold">.xlsx</span>
                <span className="bni-badge bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1 rounded-full text-xs font-semibold">.xls</span>
                <span className="bni-badge bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1 rounded-full text-xs font-semibold">.csv</span>
              </div>
            </>
          )}
        </div>

        {/* Loading Spinner */}
        {isUploading && (
          <div className="bni-loading-card bg-white border border-slate-200 rounded-2xl p-8 text-center flex flex-col items-center gap-3">
            <div className="bni-spinner w-10 h-10 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin"></div>
            <p className="text-sm font-semibold text-slate-700">Membaca dan mencocokkan data mutasi BNI eCollection...</p>
          </div>
        )}

        {/* Parsed Data Preview Table */}
        {parsedData && !isUploading && (() => {
          const displayedData = parsedData.filter((d) => {
            if (filterMode === 'jajan') return d.isJajan;
            if (filterMode === 'non-jajan') return !d.isJajan;
            return true;
          });

          const totalNominal = displayedData.reduce((acc, curr) => acc + curr.nominal, 0);
          const jajanCount = parsedData.filter((d) => d.isJajan).length;
          const validCount = parsedData.filter((d) => d.status === 'valid').length;
          const invalidCount = parsedData.filter((d) => d.status === 'invalid').length;

          return (
            <div className="bni-results-card bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col gap-5">
              <div className="bni-results-header flex justify-between items-center flex-wrap gap-4">
                <div>
                  <h3 className="bni-results-title text-lg font-bold text-slate-800 dark:text-slate-100">
                    Hasil Pencocokan Mutasi BNI
                  </h3>
                  <p className="bni-results-subtitle text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Ditemukan {parsedData.length} baris data transaksi &middot; {validCount} valid &middot; {invalidCount} tidak cocok
                  </p>
                </div>

                <div className="bni-results-actions flex items-center gap-3">
                  <button
                    type="button"
                    className="btn btn-secondary px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-xs transition-all cursor-pointer"
                    onClick={handleReset}
                  >
                    Reset / File Baru
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary px-5 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-xl text-xs shadow-md transition-all disabled:opacity-60 cursor-pointer"
                    onClick={handleConfirmSave}
                    disabled={isConfirmed}
                  >
                    {isConfirmed ? 'Sudah Disimpan' : 'Konfirmasi & Simpan Saldo'}
                  </button>
                </div>
              </div>

              {/* Filter Tabs & Summary Box */}
              <div className="bni-filter-container">
                <div className="bni-filter-buttons-group">
                  <button
                    type="button"
                    onClick={() => setFilterMode('all')}
                    className={`bni-filter-btn ${filterMode === 'all' ? 'bni-filter-btn--active' : ''}`}
                  >
                    Semua ({parsedData.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilterMode('jajan')}
                    className={`bni-filter-btn ${filterMode === 'jajan' ? 'bni-filter-btn--active' : ''}`}
                  >
                    Uang Jajan Santri ({jajanCount})
                  </button>
                  {parsedData.length > jajanCount && (
                    <button
                      type="button"
                      onClick={() => setFilterMode('non-jajan')}
                      className={`bni-filter-btn ${filterMode === 'non-jajan' ? 'bni-filter-btn--active' : ''}`}
                    >
                      Lainnya ({parsedData.length - jajanCount})
                    </button>
                  )}
                </div>

                <div className="bni-total-badge">
                  <span>Total Dana Ditampilkan:</span>
                  <span className="text-emerald-800 dark:text-emerald-300 font-extrabold text-sm">
                    Rp {totalNominal.toLocaleString('id-ID')}
                  </span>
                </div>
              </div>

              <div className="data-table-wrapper overflow-x-auto border border-slate-200 dark:border-slate-700 rounded-2xl">
                <table className="data-table w-full text-left border-collapse text-sm">
                  <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">
                    <tr>
                      <th className="px-4 py-3">No</th>
                      <th className="px-4 py-3">Nomor VA</th>
                      <th className="px-4 py-3">NIS</th>
                      <th className="px-4 py-3">Nama Santri</th>
                      <th className="px-4 py-3">Tanggal Transaksi</th>
                      <th className="px-4 py-3">Nominal</th>
                      <th className="px-4 py-3">Status Validasi</th>
                      <th className="px-4 py-3 text-center">Aksi Preview</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-200">
                    {displayedData.length === 0 ? (
                      <tr>
                        <td colSpan="8" className="text-center py-6 text-slate-400">
                          Tidak ada data yang sesuai filter.
                        </td>
                      </tr>
                    ) : (
                      displayedData.map((item, idx) => {
                        const isEditing = editingRowId === item.id;

                        if (isEditing) {
                          return (
                            <tr key={item.id} className="bg-emerald-50/70 dark:bg-emerald-950/40">
                              <td className="px-4 py-3 font-medium">{idx + 1}</td>
                              <td className="px-3 py-2">
                                <input
                                  type="text"
                                  className="w-full px-2 py-1 bg-white dark:bg-slate-900 border border-emerald-500 rounded-lg text-xs font-mono font-bold"
                                  value={editRowData.va || ''}
                                  onChange={(e) => setEditRowData({ ...editRowData, va: e.target.value })}
                                />
                              </td>
                              <td className="px-3 py-2">
                                <input
                                  type="text"
                                  className="w-20 px-2 py-1 bg-white dark:bg-slate-900 border border-emerald-500 rounded-lg text-xs font-mono font-medium"
                                  value={editRowData.nis || ''}
                                  onChange={(e) => setEditRowData({ ...editRowData, nis: e.target.value })}
                                />
                              </td>
                              <td className="px-3 py-2">
                                <input
                                  type="text"
                                  className="w-full px-2 py-1 bg-white dark:bg-slate-900 border border-emerald-500 rounded-lg text-xs font-bold"
                                  value={editRowData.nama || ''}
                                  onChange={(e) => setEditRowData({ ...editRowData, nama: e.target.value })}
                                />
                              </td>
                              <td className="px-4 py-3 text-xs text-slate-500 dark:text-slate-400">{item.tanggal}</td>
                              <td className="px-3 py-2">
                                <input
                                  type="number"
                                  className="w-28 px-2 py-1 bg-white dark:bg-slate-900 border border-emerald-500 rounded-lg text-xs font-bold font-mono"
                                  value={editRowData.nominal || 0}
                                  onChange={(e) => setEditRowData({ ...editRowData, nominal: e.target.value })}
                                />
                              </td>
                              <td className="px-4 py-3">
                                <span className="inline-flex items-center bg-amber-50 text-amber-800 border border-amber-200 px-2.5 py-1 rounded-full text-xs font-bold">
                                  Mengedit
                                </span>
                              </td>
                              <td className="px-3 py-2 text-center">
                                <div className="flex items-center justify-center gap-1.5">
                                  <button
                                    type="button"
                                    onClick={handleSaveEditRow}
                                    className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer"
                                  >
                                    Simpan
                                  </button>
                                  <button
                                    type="button"
                                    onClick={handleCancelEditRow}
                                    className="px-2.5 py-1 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-bold cursor-pointer"
                                  >
                                    Batal
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        }

                        return (
                          <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                            <td className="px-4 py-3 font-medium">{idx + 1}</td>
                            <td className="px-4 py-3">
                              <code className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-xs font-mono text-slate-800 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700">
                                {item.va}
                              </code>
                            </td>
                            <td className="px-4 py-3 font-mono font-medium">{item.nis}</td>
                            <td className="px-4 py-3 font-bold text-slate-800 dark:text-slate-100">
                              {item.nama}
                              {item.billingId && (
                                <span className="block text-[10px] text-slate-400 font-mono font-normal">
                                  {item.billingId}
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-xs text-slate-500 dark:text-slate-400">{item.tanggal}</td>
                            <td className="px-4 py-3 font-bold text-emerald-700 dark:text-emerald-400">
                              + Rp {item.nominal.toLocaleString('id-ID')}
                            </td>
                            <td className="px-4 py-3">
                              {item.status === 'valid' ? (
                                <span className="inline-flex items-center bg-emerald-50 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 px-3 py-1 rounded-full text-xs font-bold">
                                  Valid
                                </span>
                              ) : (
                                <span className="inline-flex items-center bg-rose-50 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800 px-3 py-1 rounded-full text-xs font-bold">
                                  VA Tidak Cocok
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-center">
                              <div className="flex items-center justify-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleStartEditRow(item)}
                                  className="px-2.5 py-1 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                                  title="Edit data baris ini"
                                >
                                  Edit
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeletePreviewRow(item.id)}
                                  className="px-2.5 py-1 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/60 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                                  title="Hapus baris ini sebelum disimpan"
                                >
                                  Hapus
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })()}
      </div>

      {/* Modal Pop-Up Resolusi Transaksi BNI Duplikat */}
      {isDuplicateModalOpen && (
        <div
          className="fixed inset-0 z-[99999] bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setIsDuplicateModalOpen(false)}
        >
          <div
            className="modal-animate-pop bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl max-w-2xl w-full shadow-2xl relative text-left flex flex-col transition-colors overflow-hidden"
            style={{ padding: '32px 28px' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header Modal */}
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-extrabold text-slate-900 dark:text-slate-100">
                  Deteksi Transaksi BNI Duplikat
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Mencegah penambahan saldo ganda ke rekening santri akibat mutasi yang sudah pernah diunggah.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsDuplicateModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-500 flex items-center justify-center text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Warning Alert Banner */}
            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800/80 mb-4 flex items-start gap-3">
              <span className="text-xl shrink-0">⚠️</span>
              <div className="text-xs text-amber-900 dark:text-amber-200 leading-relaxed">
                Terdeteksi <strong>{duplicateTransactions.length} transaksi</strong> yang sudah tercatat di sistem sebelumnya. Silakan pilih opsi penanganan untuk mencegah saldo ganda:
              </div>
            </div>

            {/* Global Options */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mb-4">
              <button
                type="button"
                onClick={() => handleGlobalDuplicateChange('skip')}
                className={`p-3 rounded-xl border text-left flex flex-col gap-1 transition-all cursor-pointer ${
                  duplicateGlobalOption === 'skip'
                    ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 shadow-2xs'
                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                <span className="text-xs font-extrabold">⏭️ Lewati Duplikat (Aman)</span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  Abaikan transaksi yang pernah diunggah.
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleGlobalDuplicateChange('process')}
                className={`p-3 rounded-xl border text-left flex flex-col gap-1 transition-all cursor-pointer ${
                  duplicateGlobalOption === 'process'
                    ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 shadow-2xs'
                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                <span className="text-xs font-extrabold">🔄 Tetap Proses Semua</span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  Lakukan top-up ulang untuk semua data.
                </span>
              </button>

              <button
                type="button"
                onClick={() => setDuplicateGlobalOption('custom')}
                className={`p-3 rounded-xl border text-left flex flex-col gap-1 transition-all cursor-pointer ${
                  duplicateGlobalOption === 'custom'
                    ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 shadow-2xs'
                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                <span className="text-xs font-extrabold">🔍 Pilih Per Baris</span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  Tentukan tindakan per baris transaksi.
                </span>
              </button>
            </div>

            {/* Duplicate Transactions Table */}
            <div className="max-h-48 overflow-y-auto border border-slate-200 dark:border-slate-700 rounded-2xl mb-4">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 dark:bg-slate-800 sticky top-0 font-bold text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="p-2.5">Billing ID / VA</th>
                    <th className="p-2.5">Nama Santri</th>
                    <th className="p-2.5">Nominal</th>
                    <th className="p-2.5 text-center">Tindakan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {duplicateTransactions.map((dup) => (
                    <tr key={dup.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="p-2.5 font-mono font-bold text-emerald-700 dark:text-emerald-400">
                        {dup.billingId || dup.va}
                      </td>
                      <td className="p-2.5 font-bold text-slate-800 dark:text-slate-200">
                        {dup.nama}
                      </td>
                      <td className="p-2.5 font-mono font-extrabold text-slate-900 dark:text-slate-100">
                        Rp {dup.nominal?.toLocaleString('id-ID')}
                      </td>
                      <td className="p-2.5 text-center">
                        <select
                          value={dup.action}
                          onChange={(e) => handleRowDuplicateAction(dup.id, e.target.value)}
                          className={`px-2 py-1 rounded-lg text-xs font-bold border cursor-pointer ${
                            dup.action === 'process'
                              ? 'bg-amber-50 text-amber-800 border-amber-300'
                              : 'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300'
                          }`}
                        >
                          <option value="skip">⏭️ Lewati (Aman)</option>
                          <option value="process">🔄 Tetap Proses</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsDuplicateModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleFinishDuplicateResolution}
                className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold rounded-xl text-xs shadow-md transition-all cursor-pointer flex items-center gap-1.5"
              >
                <span>Terapkan &amp; Selesaikan</span>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Pop-Up Validasi Keyakinan Staff Sebelum Simpan Saldo */}
      {isValidationModalOpen && (
        <div
          className="fixed inset-0 z-[99999] bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setIsValidationModalOpen(false)}
        >
          <div
            className="modal-animate-pop bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl max-w-md w-full shadow-2xl relative text-center flex flex-col items-center transition-colors"
            style={{ padding: '40px 32px 32px 32px' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Amber Shield / Question Icon Box */}
            <div
              className="modal-badge-bounce rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-100 dark:border-amber-900/50 flex items-center justify-center shrink-0 shadow-xs"
              style={{ width: '64px', height: '64px', marginBottom: '20px' }}
            >
              <svg
                className="text-amber-600 dark:text-amber-400"
                style={{ width: '34px', height: '34px' }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2.2"
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
            </div>

            {/* Title */}
            <h3
              className="font-extrabold text-slate-900 dark:text-slate-100 tracking-tight"
              style={{ fontSize: '22px', marginBottom: '8px' }}
            >
              Konfirmasi Simpan Saldo
            </h3>

            {/* Description */}
            <p
              className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed"
              style={{ fontSize: '14px', maxWidth: '340px', marginBottom: '20px' }}
            >
              Apakah Anda sudah yakin data transaksi mutasi BNI ini sudah benar &amp; siap disinkronkan?
            </p>

            {/* Ringkasan Box (Sama Persis Seperti Modal Berhasil) */}
            {parsedData && (
              <div
                className="w-full bg-slate-50 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700/80 rounded-2xl text-left flex flex-col"
                style={{ padding: '18px 20px', marginBottom: '28px', gap: '10px' }}
              >
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">Transaksi Valid:</span>
                  <span className="font-bold text-emerald-700 dark:text-emerald-400 font-mono text-sm">
                    {parsedData.filter((d) => d.status === 'valid').length} data
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">Tidak Valid / Dilewati:</span>
                  <span className="font-bold text-rose-600 dark:text-rose-400 font-mono text-sm">
                    {parsedData.filter((d) => d.status === 'invalid').length} data
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs border-t border-slate-200 dark:border-slate-700/80 pt-2">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">Total Dana Masuk:</span>
                  <span className="font-extrabold text-slate-900 dark:text-slate-100 font-mono text-sm">
                    Rp {parsedData.filter((d) => d.status === 'valid').reduce((acc, curr) => acc + curr.nominal, 0).toLocaleString('id-ID')}
                  </span>
                </div>
                <div
                  className="flex justify-between items-center text-xs border-t border-slate-200 dark:border-slate-700/80"
                  style={{ paddingTop: '10px' }}
                >
                  <span className="text-slate-500 dark:text-slate-400 font-medium">Status Saldo:</span>
                  <span className="inline-flex items-center gap-1.5 font-bold text-amber-700 dark:text-amber-400">
                    <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                    Menunggu Konfirmasi Staff
                  </span>
                </div>
              </div>
            )}

            {/* Action Buttons (Dua Tombol: Batal & Ya, Saya Yakin) */}
            <div className="grid grid-cols-2 gap-3 w-full">
              <button
                type="button"
                onClick={() => setIsValidationModalOpen(false)}
                className="w-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-2xl transition-all cursor-pointer flex items-center justify-center"
                style={{ height: '50px', fontSize: '14px' }}
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleFinalConfirmSave}
                className="w-full bg-emerald-800 hover:bg-emerald-900 active:scale-95 text-white font-bold rounded-2xl shadow-md shadow-emerald-900/20 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                style={{ height: '50px', fontSize: '14px' }}
              >
                <span>Ya, Saya Yakin</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Pop-Up Berhasil Konfirmasi & Simpan */}
      {isSuccessModalOpen && (
        <div
          className="fixed inset-0 z-[99999] bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setIsSuccessModalOpen(false)}
        >
          <div
            className="modal-animate-pop bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl max-w-md w-full shadow-2xl relative text-center flex flex-col items-center transition-colors"
            style={{ padding: '40px 32px 32px 32px' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Emerald Check Icon Box */}
            <div
              className="modal-badge-bounce rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-100 dark:border-emerald-900/50 flex items-center justify-center shrink-0 shadow-xs"
              style={{ width: '64px', height: '64px', marginBottom: '20px' }}
            >
              <svg
                className="text-emerald-600 dark:text-emerald-400"
                style={{ width: '34px', height: '34px' }}
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

            {/* Title */}
            <h3
              className="font-extrabold text-slate-900 dark:text-slate-100 tracking-tight"
              style={{ fontSize: '22px', marginBottom: '8px' }}
            >
              Sinkronisasi Berhasil!
            </h3>

            {/* Description */}
            <p
              className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed"
              style={{ fontSize: '14px', maxWidth: '340px', marginBottom: '20px' }}
            >
              Saldo santri telah berhasil diperbarui otomatis ke dalam sistem dari mutasi BNI eCollection.
            </p>

            {/* Ringkasan Box */}
            {parsedData && (
              <div
                className="w-full bg-slate-50 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700/80 rounded-2xl text-left flex flex-col"
                style={{ padding: '18px 20px', marginBottom: '28px', gap: '10px' }}
              >
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">Transaksi Valid:</span>
                  <span className="font-bold text-emerald-700 dark:text-emerald-400 font-mono text-sm">
                    {parsedData.filter((d) => d.status === 'valid').length} data
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">Tidak Valid / Dilewati:</span>
                  <span className="font-bold text-rose-600 dark:text-rose-400 font-mono text-sm">
                    {parsedData.filter((d) => d.status === 'invalid').length} data
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs border-t border-slate-200 dark:border-slate-700/80 pt-2">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">Total Dana Masuk:</span>
                  <span className="font-extrabold text-slate-900 dark:text-slate-100 font-mono text-sm">
                    Rp {parsedData.filter((d) => d.status === 'valid').reduce((acc, curr) => acc + curr.nominal, 0).toLocaleString('id-ID')}
                  </span>
                </div>
                <div
                  className="flex justify-between items-center text-xs border-t border-slate-200 dark:border-slate-700/80"
                  style={{ paddingTop: '10px' }}
                >
                  <span className="text-slate-500 dark:text-slate-400 font-medium">Status Saldo:</span>
                  <span className="inline-flex items-center gap-1.5 font-bold text-emerald-700 dark:text-emerald-400">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    Otomatis Masuk ke Saldo Santri
                  </span>
                </div>
              </div>
            )}

            {/* Action Button */}
            <button
              type="button"
              onClick={() => setIsSuccessModalOpen(false)}
              className="w-full bg-emerald-800 hover:bg-emerald-900 active:scale-95 hover:scale-[1.01] text-white font-bold rounded-2xl shadow-md shadow-emerald-900/20 transition-all duration-150 cursor-pointer flex items-center justify-center"
              style={{ height: '50px', fontSize: '15px' }}
            >
              Selesai &amp; Tutup
            </button>
          </div>
        </div>
      )}

      {/* Modal Pop-Up Error File */}
      {errorMessage && (
        <div
          className="fixed inset-0 z-[99999] bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setErrorMessage('')}
        >
          <div
            className="modal-animate-pop bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl max-w-md w-full shadow-2xl relative text-center flex flex-col items-center transition-colors"
            style={{ padding: '40px 32px 32px 32px' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Rose Exclamation Box */}
            <div
              className="modal-badge-bounce rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-100 dark:border-rose-900/50 flex items-center justify-center shrink-0 shadow-xs"
              style={{ width: '64px', height: '64px', marginBottom: '20px' }}
            >
              <svg
                className="text-rose-600 dark:text-rose-400"
                style={{ width: '34px', height: '34px' }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2.5"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>

            {/* Title */}
            <h3
              className="font-extrabold text-slate-900 dark:text-slate-100 tracking-tight"
              style={{ fontSize: '22px', marginBottom: '8px' }}
            >
              Gagal Membaca File
            </h3>

            {/* Description */}
            <p
              className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed"
              style={{ fontSize: '14px', maxWidth: '340px', marginBottom: '24px' }}
            >
              {errorMessage}
            </p>

            {/* Action Button */}
            <button
              type="button"
              onClick={() => setErrorMessage('')}
              className="w-full bg-slate-800 hover:bg-slate-900 active:scale-95 text-white font-bold rounded-2xl shadow-md transition-all duration-150 cursor-pointer flex items-center justify-center"
              style={{ height: '48px', fontSize: '15px' }}
            >
              Tutup &amp; Coba Lagi
            </button>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default UploadBNIPage;
