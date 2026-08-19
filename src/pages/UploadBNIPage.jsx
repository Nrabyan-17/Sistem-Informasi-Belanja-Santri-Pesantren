import { useState, useRef, useMemo } from 'react';
import StaffLayout from '../components/layout/StaffLayout';
import { bniApi } from '../utils/api';
import { usePopup } from '../context/PopupContext';

const UploadBNIPage = ({ Layout = StaffLayout }) => {
  const { showPopup } = usePopup();
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [parsedData, setParsedData] = useState(null);
  const [uploadId, setUploadId] = useState(null);
  const [uploadError, setUploadError] = useState('');
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [filterMode, setFilterMode] = useState('all'); // 'all' | 'jajan'
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [editingItem, setEditingItem] = useState(null);

  const fileInputRef = useRef(null);

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
    setUploadError('');

    const fd = new FormData();
    fd.append('file', selectedFile);

    try {
      const res = await bniApi.store(fd);
      const items = (res.upload?.items || []).map((it) => ({
        id: it.id,
        va: it.va,
        nis: it.santri?.nis || '—',
        nama: it.santri?.nama || it.nama || '—',
        nominal: it.nominal || 0,
        tanggal: it.tanggal || '—',
        billingId: it.billing_id || '',
        isJajan: (it.billing_id || '').toUpperCase().startsWith('JJN'),
        status: it.status_valid ? 'valid' : 'invalid',
        catatan: it.catatan || '',
      }));
      setParsedData(items);
      setUploadId(res.upload?.id || null);
      // Default select all valid items
      const validItemIds = new Set(items.filter((i) => i.status === 'valid').map((i) => i.id));
      setSelectedIds(validItemIds);
    } catch (err) {
      setUploadError(err.message || 'Gagal memproses file.');
      setParsedData(null);
      setUploadId(null);
    } finally {
      setIsUploading(false);
    }
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

  const handleToggleSelect = (id) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const handleToggleSelectAll = (displayedItems) => {
    const allSelected = displayedItems.every((d) => selectedIds.has(d.id));
    const next = new Set(selectedIds);
    if (allSelected) {
      displayedItems.forEach((d) => next.delete(d.id));
    } else {
      displayedItems.forEach((d) => next.add(d.id));
    }
    setSelectedIds(next);
  };

  const handleDeleteItem = async (itemId) => {
    if (!uploadId) return;
    try {
      await bniApi.deleteItem(uploadId, itemId);
      setParsedData((prev) => prev.filter((i) => i.id !== itemId));
      const next = new Set(selectedIds);
      next.delete(itemId);
      setSelectedIds(next);
      showPopup('Sukses', 'Item transaksi berhasil dihapus.', 'info');
    } catch (err) {
      showPopup('Gagal Hapus', err.message || 'Gagal menghapus item.', 'error');
    }
  };

  const handleSaveEditItem = async (e) => {
    e.preventDefault();
    if (!editingItem || !uploadId) return;
    try {
      await bniApi.updateItem(uploadId, editingItem.id, {
        nama: editingItem.nama,
        nominal: editingItem.nominal,
      });
      setParsedData((prev) =>
        prev.map((i) => (i.id === editingItem.id ? { ...i, nama: editingItem.nama, nominal: Number(editingItem.nominal) } : i))
      );
      setEditingItem(null);
      showPopup('Sukses', 'Item transaksi berhasil diperbarui.', 'success');
    } catch (err) {
      showPopup('Gagal Edit', err.message || 'Gagal memperbarui item.', 'error');
    }
  };

  const handleConfirmSave = async () => {
    if (!uploadId) return;
    const itemIds = Array.from(selectedIds);
    if (itemIds.length === 0) {
      showPopup('Peringatan', 'Pilih minimal satu data transaksi untuk disimpan.', 'info');
      return;
    }

    setIsUploading(true);
    try {
      const res = await bniApi.apply(uploadId, itemIds);
      setIsConfirmed(true);
      showPopup('Berhasil', res.message || 'Berhasil konfirmasi & simpan saldo santri!', 'success');
    } catch (err) {
      showPopup('Gagal', err.message || 'Gagal menyimpan.', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setParsedData(null);
    setUploadId(null);
    setUploadError('');
    setIsConfirmed(false);
    setFilterMode('all');
    setSelectedIds(new Set());
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
          <div className="bni-step-card bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex gap-4 items-start shadow-xs">
            <div className="bni-step-number w-9 h-9 rounded-full bg-emerald-800 text-white flex items-center justify-center font-bold text-sm shrink-0">
              1
            </div>
            <div className="bni-step-content flex-1">
              <h3 className="bni-step-title text-base font-bold text-slate-800 dark:text-slate-100 mb-1">Unduh Mutasi BNI</h3>
              <p className="bni-step-desc text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Login ke BNI e-Collection, unduh file mutasi rekening e-Collection dalam format Excel (.xlsx).
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="bni-step-card bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex gap-4 items-start shadow-xs">
            <div className="bni-step-number w-9 h-9 rounded-full bg-emerald-800 text-white flex items-center justify-center font-bold text-sm shrink-0">
              2
            </div>
            <div className="bni-step-content flex-1">
              <h3 className="bni-step-title text-base font-bold text-slate-800 dark:text-slate-100 mb-1">Upload &amp; Crosscheck</h3>
              <p className="bni-step-desc text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Unggah file. Anda dapat mengedit, menghapus, atau memilih transaksi sebelum disimpan.
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="bni-step-card bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex gap-4 items-start shadow-xs">
            <div className="bni-step-number w-9 h-9 rounded-full bg-emerald-800 text-white flex items-center justify-center font-bold text-sm shrink-0">
              3
            </div>
            <div className="bni-step-content flex-1">
              <h3 className="bni-step-title text-base font-bold text-slate-800 dark:text-slate-100 mb-1">Konfirmasi &amp; Simpan</h3>
              <p className="bni-step-desc text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Item transaksi yang dicentang akan otomatis menambah saldo santri secara instan.
              </p>
            </div>
          </div>
        </div>

        {/* Drag & Drop Upload Zone */}
        <div
          className={`bni-dropzone border-2 border-dashed rounded-3xl p-10 text-center cursor-pointer transition-all flex flex-col items-center justify-center shadow-xs ${
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

          <div className="bni-dropzone-icon-wrapper w-16 h-16 rounded-full bg-emerald-100/80 dark:bg-emerald-950/60 flex items-center justify-center mb-4">
            <svg
              className="bni-upload-icon w-8 h-8 text-emerald-800 dark:text-emerald-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path>
            </svg>
          </div>

          {file ? (
            <div className="bni-file-info">
              <h3 className="bni-dropzone-title text-lg font-bold text-slate-800 dark:text-slate-100">📄 {file.name}</h3>
              <p className="bni-dropzone-subtitle text-xs text-slate-500 dark:text-slate-400 mt-1">
                {(file.size / 1024).toFixed(1)} KB — Klik untuk mengganti file
              </p>
            </div>
          ) : (
            <>
              <h3 className="bni-dropzone-title text-lg font-bold text-slate-800 dark:text-slate-100 mb-1">
                Tarik &amp; Lepas File Mutasi BNI eCollection
              </h3>
              <p className="bni-dropzone-subtitle text-xs text-slate-500 dark:text-slate-400 mb-4">
                atau klik untuk memilih file dari komputer Anda
              </p>
              <div className="bni-format-badges flex gap-2 justify-center">
                <span className="bni-badge bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 px-3 py-1 rounded-full text-xs font-semibold">.xlsx</span>
                <span className="bni-badge bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 px-3 py-1 rounded-full text-xs font-semibold">.xls</span>
                <span className="bni-badge bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 px-3 py-1 rounded-full text-xs font-semibold">.csv</span>
              </div>
            </>
          )}
        </div>

        {/* Loading Spinner */}
        {isUploading && (
          <div className="bni-loading-card bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center flex flex-col items-center gap-3">
            <div className="bni-spinner w-10 h-10 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin"></div>
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Membaca dan memproses mutasi BNI eCollection...</p>
          </div>
        )}

        {/* Upload Error Alert */}
        {uploadError && (
          <div className="px-4 py-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 rounded-2xl text-sm font-semibold text-rose-700 dark:text-rose-300">
            {uploadError}
          </div>
        )}

        {/* Parsed Data Preview Table with Edit / Delete / Checkboxes */}
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
          const isAllSelected = displayedData.length > 0 && displayedData.every((d) => selectedIds.has(d.id));
          const selectedCount = displayedData.filter((d) => selectedIds.has(d.id)).length;

          return (
            <div className="bni-results-card bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col gap-5">
              <div className="bni-results-header flex justify-between items-center flex-wrap gap-4">
                <div>
                  <h3 className="bni-results-title text-lg font-bold text-slate-800 dark:text-slate-100">
                    Hasil Ekstraksi Mutasi BNI
                  </h3>
                  <p className="bni-results-subtitle text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Ditemukan {parsedData.length} baris transaksi &middot; {validCount} valid &middot; {invalidCount} tidak cocok &middot; <strong className="text-emerald-700 dark:text-emerald-400">{selectedCount} terpilih</strong>
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
                    className="btn btn-primary px-5 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-xl text-xs shadow-md transition-all disabled:opacity-60 cursor-pointer flex items-center gap-2"
                    onClick={handleConfirmSave}
                    disabled={isConfirmed || selectedCount === 0}
                  >
                    {isConfirmed ? 'Sudah Disimpan' : `Konfirmasi & Simpan (${selectedCount} Item)`}
                  </button>
                </div>
              </div>

              {/* Filter Tabs & Summary Box */}
              <div className="bni-filter-container flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-200/80 dark:border-slate-700/80">
                <div className="bni-filter-buttons-group flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setFilterMode('all')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      filterMode === 'all'
                        ? 'bg-emerald-800 text-white shadow-xs'
                        : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    Semua ({parsedData.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilterMode('jajan')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      filterMode === 'jajan'
                        ? 'bg-emerald-800 text-white shadow-xs'
                        : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    Uang Jajan Santri ({jajanCount})
                  </button>
                </div>

                <div className="text-xs font-bold text-slate-600 dark:text-slate-300 flex items-center gap-2">
                  <span>Total Dana Terpilih:</span>
                  <span className="text-emerald-700 dark:text-emerald-400 font-extrabold text-sm font-mono">
                    Rp {displayedData.filter((d) => selectedIds.has(d.id)).reduce((acc, c) => acc + c.nominal, 0).toLocaleString('id-ID')}
                  </span>
                </div>
              </div>

              <div className="data-table-wrapper overflow-x-auto border border-slate-200 dark:border-slate-700 rounded-2xl">
                <table className="data-table w-full text-left border-collapse text-xs">
                  <thead className="bg-slate-100/90 dark:bg-slate-800/90 sticky top-0 z-10 border-b border-slate-200 dark:border-slate-700 text-[11px] font-extrabold text-slate-600 dark:text-slate-300 uppercase">
                    <tr>
                      <th className="p-3.5 w-10 text-center">
                        <input
                          type="checkbox"
                          checked={isAllSelected}
                          onChange={() => handleToggleSelectAll(displayedData)}
                          className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                        />
                      </th>
                      <th className="px-3.5 py-3">Nomor VA</th>
                      <th className="px-3.5 py-3">NIS</th>
                      <th className="px-3.5 py-3">Nama Santri</th>
                      <th className="px-3.5 py-3">Tanggal</th>
                      <th className="px-3.5 py-3">Nominal</th>
                      <th className="px-3.5 py-3 text-center">Status</th>
                      <th className="px-3.5 py-3 text-center w-24">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 font-medium">
                    {displayedData.length === 0 ? (
                      <tr>
                        <td colSpan="8" className="text-center py-8 text-slate-400">
                          Tidak ada data yang sesuai filter.
                        </td>
                      </tr>
                    ) : (
                      displayedData.map((item) => {
                        const isSelected = selectedIds.has(item.id);
                        return (
                          <tr
                            key={item.id}
                            className={`hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${
                              isSelected ? 'bg-emerald-50/20 dark:bg-emerald-950/10' : ''
                            }`}
                          >
                            <td className="p-3.5 text-center">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => handleToggleSelect(item.id)}
                                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                              />
                            </td>
                            <td className="px-3.5 py-3">
                              <code className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-xs font-mono text-slate-800 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700">
                                {item.va}
                              </code>
                            </td>
                            <td className="px-3.5 py-3 font-mono font-bold">{item.nis}</td>
                            <td className="px-3.5 py-3 font-bold text-slate-800 dark:text-slate-100">
                              {item.nama}
                              {item.billingId && (
                                <span className="block text-[10px] text-slate-400 font-mono font-normal">
                                  {item.billingId}
                                </span>
                              )}
                            </td>
                            <td className="px-3.5 py-3 text-slate-500 dark:text-slate-400 font-mono text-[11px]">{item.tanggal}</td>
                            <td className="px-3.5 py-3 font-bold text-emerald-700 dark:text-emerald-400 font-mono">
                              + Rp {item.nominal.toLocaleString('id-ID')}
                            </td>
                            <td className="px-3.5 py-3 text-center">
                              {item.status === 'valid' ? (
                                <span className="inline-flex items-center bg-emerald-50 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 px-2.5 py-0.5 rounded-full text-[10px] font-bold">
                                  Valid
                                </span>
                              ) : (
                                <span
                                  className="inline-flex items-center bg-rose-50 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800 px-2.5 py-0.5 rounded-full text-[10px] font-bold"
                                  title={item.catatan}
                                >
                                  {item.catatan || 'Tidak Cocok'}
                                </span>
                              )}
                            </td>
                            <td className="px-3.5 py-3 text-center">
                              <div className="flex items-center justify-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => setEditingItem({ ...item })}
                                  className="p-1 text-slate-500 hover:text-emerald-700 dark:hover:text-emerald-400 rounded transition-colors"
                                  title="Edit Item"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                  </svg>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteItem(item.id)}
                                  className="p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded transition-colors"
                                  title="Hapus Item"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
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

        {/* Modal Edit Item BNI */}
        {editingItem && (
          <div className="fixed inset-0 z-[100000] bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl">
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-slate-100 mb-1">
                Edit Item Transaksi BNI
              </h3>
              <p className="text-xs text-slate-500 mb-4 font-medium">
                Sesuaikan nama atau nominal penarikan/setoran sebelum disimpan ke database.
              </p>

              <form onSubmit={handleSaveEditItem} className="flex flex-col gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Nomor VA</label>
                  <input
                    type="text"
                    value={editingItem.va}
                    disabled
                    className="h-9 px-3 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-xl text-xs font-mono font-bold"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Nama Santri / Keterangan</label>
                  <input
                    type="text"
                    value={editingItem.nama}
                    onChange={(e) => setEditingItem({ ...editingItem, nama: e.target.value })}
                    className="h-9 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-100 focus:outline-none focus:border-emerald-600"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Nominal (RP)</label>
                  <input
                    type="number"
                    value={editingItem.nominal}
                    onChange={(e) => setEditingItem({ ...editingItem, nominal: e.target.value })}
                    className="h-9 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-100 focus:outline-none focus:border-emerald-600 font-mono"
                    required
                  />
                </div>

                <div className="flex justify-end gap-2 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setEditingItem(null)}
                    className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-xs"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-emerald-800 text-white font-bold rounded-xl text-xs"
                  >
                    Simpan Perubahan
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default UploadBNIPage;

