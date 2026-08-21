import React, { useState, useRef } from 'react';
import Modal from '../common/Modal';
import { santriApi } from '../../utils/api';

// Modal Pop-Up Upload Batch Santri dengan Fitur Preview Lega & Rapi, Edit, Delete, dan Handler Data Ganda
const SantriBatchUploadModal = ({ isOpen, onClose, onImportSuccess, existingSantriList = [] }) => {
  const fileInputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [previewList, setPreviewList] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [editingRowId, setEditingRowId] = useState(null);
  const [editFormData, setEditFormData] = useState({});

  // States untuk Pop-Up Resolusi Data Ganda (Duplicate Resolution Handler)
  const [isDuplicateModalOpen, setIsDuplicateModalOpen] = useState(false);
  const [duplicateItems, setDuplicateItems] = useState([]); // { newItem, existingItem, action: 'skip' | 'update' }
  const [cleanNewItems, setCleanNewItems] = useState([]);
  const [globalResolution, setGlobalResolution] = useState('skip'); // 'skip' | 'update' | 'custom'

  // States untuk Dua Pop-Up Form (Pop-Up 1: Crosscheck/Validasi & Pop-Up 2: Berhasil)
  const [isValidationModalOpen, setIsValidationModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [pendingImportPayload, setPendingImportPayload] = useState(null);
  const [isConfirmedCheck, setIsConfirmedCheck] = useState(true);

  if (!isOpen && !isValidationModalOpen && !isSuccessModalOpen) return null;

  const handleFileProcess = async (selectedFile) => {
    if (!selectedFile) return;
    setFile(selectedFile);

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const res = await santriApi.importPreview(formData);
      const parsedItems = res.items || [];
      if (parsedItems.length > 0) {
        const withIds = parsedItems.map((item, idx) => ({
          ...item,
          id: item.temp_id || `import-${Date.now()}-${idx}`,
          tglLahir: item.tanggal_lahir,
          namaWali: item.nama_wali || 'Wali Santri',
          status: 'aktif'
        }));
        setPreviewList(withIds);
      } else {
        alert('File CSV / Excel tidak memuat data santri yang dapat diproses.');
        setPreviewList([]);
        setFile(null);
      }
    } catch (err) {
      console.error('Gagal memproses file via server:', err);
      alert(err.message || 'Gagal memproses struktur file CSV/Excel.');
      setPreviewList([]);
      setFile(null);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  const handleDeleteRow = (id) => {
    setPreviewList(prev => prev.filter(item => item.id !== id));
  };

  const handleStartEdit = (row) => {
    setEditingRowId(row.id);
    setEditFormData({ ...row });
  };

  const handleSaveEdit = () => {
    setPreviewList(prev =>
      prev.map(item => (item.id === editingRowId ? { ...item, ...editFormData } : item))
    );
    setEditingRowId(null);
    setEditFormData({});
  };

  const handleCancelEdit = () => {
    setEditingRowId(null);
    setEditFormData({});
  };

  // Validasi Awal: Deteksi Data Ganda berdasarkan NIS sebelum Konfirmasi & Simpan
  const handleValidateAndPush = () => {
    if (previewList.length === 0) return;

    const detectedDuplicates = [];
    const pureNewItems = [];

    previewList.forEach((item) => {
      const matched = existingSantriList.find((s) => String(s.nis).trim() === String(item.nis).trim());
      if (matched) {
        detectedDuplicates.push({
          newItem: item,
          existingItem: matched,
          action: 'skip', // default: lewati (skip)
        });
      } else {
        pureNewItems.push(item);
      }
    });

    if (detectedDuplicates.length > 0) {
      setDuplicateItems(detectedDuplicates);
      setCleanNewItems(pureNewItems);
      setGlobalResolution('skip');
      setIsDuplicateModalOpen(true);
    } else {
      // Tidak ada data ganda, langsung ke Pop-Up 1 (Crosscheck & Validasi)
      executePush(previewList, []);
    }
  };

  const handleRowResolutionChange = (index, action) => {
    setDuplicateItems((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], action };
      return updated;
    });
  };

  const handleApplyGlobalResolution = (mode) => {
    setGlobalResolution(mode);
    if (mode === 'skip' || mode === 'update') {
      setDuplicateItems((prev) =>
        prev.map((item) => ({ ...item, action: mode }))
      );
    }
  };

  const handleConfirmDuplicateResolution = () => {
    const itemsToUpdate = [];
    const itemsToAdd = [...cleanNewItems];

    duplicateItems.forEach((d) => {
      if (d.action === 'update') {
        itemsToUpdate.push(d.newItem);
      }
    });

    setIsDuplicateModalOpen(false);
    executePush(itemsToAdd, itemsToUpdate);
  };

  // Siapkan data & Buka Pop-Up Form 1 (Crosscheck & Validasi)
  const executePush = (newItemsList, updatedItemsList) => {
    const formattedNew = newItemsList.map(s => ({
      id: Date.now() + Math.random(),
      nis: s.nis,
      nama: s.nama,
      kelas: s.kelas || 'VII A',
      tanggal_lahir: s.tglLahir || '1 Jan 2012',
      nama_wali: s.namaWali || 'Wali Santri',
      va_jajan: s.va_jajan || s.vaJajan || '',
      va_tagihan: s.va_tagihan || s.vaTagihan || '',
      status: s.status || 'aktif',
      saldo: 0,
    }));

    setPendingImportPayload({
      newSantri: formattedNew,
      updatedSantri: updatedItemsList,
      totalCount: formattedNew.length + updatedItemsList.length,
      newCount: formattedNew.length,
      updateCount: updatedItemsList.length,
    });
    setIsConfirmedCheck(true);
    setIsValidationModalOpen(true);
  };

  // Handler eksekusi simpan saldo final setelah staff meyakini di Pop-Up Form 1
  const handleFinalConfirmSave = () => {
    if (pendingImportPayload) {
      onImportSuccess?.({
        newSantri: pendingImportPayload.newSantri,
        updatedSantri: pendingImportPayload.updatedSantri,
      });
    }
    setIsValidationModalOpen(false);
    setIsSuccessModalOpen(true);
  };

  const handleFinalSuccessClose = () => {
    setIsSuccessModalOpen(false);
    setPendingImportPayload(null);
    handleResetModal();
  };

  const handleResetModal = () => {
    setFile(null);
    setPreviewList([]);
    setEditingRowId(null);
    setEditFormData({});
    setIsDuplicateModalOpen(false);
    setIsValidationModalOpen(false);
    setIsSuccessModalOpen(false);
    setDuplicateItems([]);
    setCleanNewItems([]);
    onClose();
  };

  return (
    <>
      {/* Modal Utama Import Batch */}
      <Modal
        isOpen={isOpen && !isDuplicateModalOpen && !isValidationModalOpen && !isSuccessModalOpen}
        onClose={handleResetModal}
        title="Import Batch Data Santri"
        subtitle="Import data banyak santri sekaligus via CSV/Excel, tinjau, ubah, atau hapus sebelum disimpan ke database."
        maxWidth="max-w-4xl"
      >
        <div className="flex flex-col gap-6 pt-1">
          {/* Upload Dropzone */}
          {previewList.length === 0 ? (
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`import-batch-dropzone ${
                isDragging ? 'border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/20' : ''
              }`}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={(e) => e.target.files?.[0] && handleFileProcess(e.target.files[0])}
                accept=".csv, .xlsx, .xls"
                className="hidden"
              />
              <div className="import-batch-icon">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
              </div>
              <div className="flex flex-col gap-1.5 px-4 pb-2">
                <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  Tarik &amp; lepas file CSV / Excel di sini, atau <span className="text-emerald-700 dark:text-emerald-400 underline">klik untuk memilih file</span>
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Format yang didukung: .csv, .xlsx (Kolom: NIS, Nama, Kelas, Tanggal Lahir, Nama Wali)
                </p>
              </div>
            </div>
          ) : (
            /* Preview Data Table */
            <div className="flex flex-col gap-5">
              {/* Header Preview Bar (Lega & Rapi dengan Dedicated CSS) */}
              <div className="import-batch-preview-header">
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="import-batch-preview-badge">
                    {previewList.length}
                  </div>
                  <div className="flex flex-col gap-1 min-w-0">
                    <h4 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-slate-100 leading-snug">
                      Preview {previewList.length} Data Santri Siap Diimpor
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Periksa kesesuaian data, edit baris yang keliru, atau hapus sebelum disimpan ke database.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => { setFile(null); setPreviewList([]); }}
                  className="import-batch-preview-btn-change"
                >
                  Ganti File
                </button>
              </div>

              {/* Scrollable Preview Table dengan Spacing & Lebar Kolom Tegas */}
              <div className="import-batch-table-container overflow-x-scroll overflow-y-auto max-h-[380px] w-full border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xs">
                <table className="import-batch-table w-full min-w-[750px]">
                  <thead>
                    <tr>
                      <th className="import-batch-col-no">No</th>
                      <th className="import-batch-col-nis">NIS</th>
                      <th className="import-batch-col-nama">Nama Santri</th>
                      <th className="import-batch-col-kelas">Kelas</th>
                      <th className="import-batch-col-wali">Wali Santri</th>
                      <th className="import-batch-col-action">Aksi Preview</th>
                    </tr>
                  </thead>
                  <tbody>
                    {previewList.map((row, idx) => {
                      const isEditing = editingRowId === row.id;
                      const isAlreadyExist = existingSantriList.some(s => String(s.nis).trim() === String(row.nis).trim());

                      if (isEditing) {
                        return (
                          <tr key={row.id} className="bg-emerald-50/70 dark:bg-emerald-950/40">
                            <td className="import-batch-col-no font-bold text-slate-500">{idx + 1}</td>
                            <td className="import-batch-col-nis">
                              <input
                                type="text"
                                className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-emerald-500 rounded-lg text-xs font-mono font-bold"
                                value={editFormData.nis || ''}
                                onChange={(e) => setEditFormData({ ...editFormData, nis: e.target.value })}
                              />
                            </td>
                            <td className="import-batch-col-nama">
                              <input
                                type="text"
                                className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-emerald-500 rounded-lg text-xs font-bold"
                                value={editFormData.nama || ''}
                                onChange={(e) => setEditFormData({ ...editFormData, nama: e.target.value })}
                              />
                            </td>
                            <td className="import-batch-col-kelas">
                              <input
                                type="text"
                                className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-emerald-500 rounded-lg text-xs font-bold"
                                value={editFormData.kelas || ''}
                                onChange={(e) => setEditFormData({ ...editFormData, kelas: e.target.value })}
                              />
                            </td>
                            <td className="import-batch-col-wali">
                              <input
                                type="text"
                                className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-emerald-500 rounded-lg text-xs"
                                value={editFormData.namaWali || ''}
                                onChange={(e) => setEditFormData({ ...editFormData, namaWali: e.target.value })}
                              />
                            </td>
                            <td className="import-batch-col-action">
                              <div className="flex items-center justify-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={handleSaveEdit}
                                  className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-[11px] font-bold shadow-xs cursor-pointer"
                                >
                                  Simpan
                                </button>
                                <button
                                  type="button"
                                  onClick={handleCancelEdit}
                                  className="px-3 py-1.5 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-700 dark:text-slate-200 rounded-lg text-[11px] font-bold cursor-pointer"
                                >
                                  Batal
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      }

                      return (
                        <tr key={row.id} className={isAlreadyExist ? 'bg-amber-50/40 dark:bg-amber-950/20' : ''}>
                          <td className="import-batch-col-no text-slate-400 font-bold">{idx + 1}</td>
                          <td className="import-batch-col-nis">
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-extrabold text-emerald-700 dark:text-emerald-400">
                                {row.nis}
                              </span>
                              {isAlreadyExist && (
                                <span className="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300 font-extrabold text-[10px]" title="NIS ini sudah ada di database">
                                  Duplikat
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="import-batch-col-nama">
                            <span className="font-extrabold text-slate-800 dark:text-slate-100 block">
                              {row.nama}
                            </span>
                          </td>
                          <td className="import-batch-col-kelas">
                            <span className="inline-block px-2.5 py-1 rounded-lg bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300 font-extrabold text-[11px]">
                              {row.kelas}
                            </span>
                          </td>
                          <td className="import-batch-col-wali font-medium text-slate-700 dark:text-slate-300">
                            {row.namaWali}
                          </td>
                          <td className="import-batch-col-action">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                type="button"
                                onClick={() => handleStartEdit(row)}
                                className="px-3 py-1.5 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 rounded-lg font-extrabold text-xs transition-colors cursor-pointer"
                                title="Edit data baris ini"
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteRow(row.id)}
                                className="px-3 py-1.5 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/60 rounded-lg font-extrabold text-xs transition-colors cursor-pointer"
                                title="Hapus baris ini dari daftar import"
                              >
                                Hapus
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Modal Footer Actions */}
          <div className="flex items-center justify-between pt-5 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={handleResetModal}
              className="h-11 sm:h-12 px-8 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center min-w-[120px]"
            >
              Tutup
            </button>

            {previewList.length > 0 && (
              <button
                type="button"
                onClick={handleValidateAndPush}
                className="h-11 sm:h-12 px-8 bg-emerald-700 hover:bg-emerald-800 active:scale-95 text-white font-extrabold rounded-xl text-xs shadow-md shadow-emerald-900/20 transition-all flex items-center justify-center gap-2.5 cursor-pointer min-w-[210px]"
              >
                <span>Konfirmasi &amp; Simpan</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </Modal>

      {/* POP-UP RESOLUSI DATA GANDA (Duplicate Resolution Modal) */}
      <Modal
        isOpen={isDuplicateModalOpen}
        onClose={() => setIsDuplicateModalOpen(false)}
        title="Deteksi Data Santri Ganda"
        subtitle="Ditemukan data dengan NIS yang sudah terdaftar di database. Tentukan tindakan untuk data ganda ini."
        maxWidth="max-w-3xl"
      >
        <div className="flex flex-col gap-5 pt-1">
          {/* Warning Banner */}
          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 flex items-start gap-3.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-white font-black text-lg flex items-center justify-center shrink-0">
              ⚠️
            </div>
            <div className="flex flex-col gap-0.5">
              <h4 className="text-sm font-extrabold text-amber-950 dark:text-amber-200">
                Terdeteksi {duplicateItems.length} Data Ganda (NIS Sudah Ada di Database)
              </h4>
              <p className="text-xs text-amber-800 dark:text-amber-300">
                Terdapat <strong>{cleanNewItems.length} data baru</strong> yang siap disimpan, dan <strong>{duplicateItems.length} data yang bentrok</strong>. Silakan pilih opsi penanganan di bawah ini:
              </p>
            </div>
          </div>

          {/* Opsi Tindakan Cepat (Global Options) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <button
              type="button"
              onClick={() => handleApplyGlobalResolution('skip')}
              className={`p-3.5 rounded-xl border text-left flex flex-col gap-1 transition-all cursor-pointer ${
                globalResolution === 'skip'
                  ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 shadow-2xs'
                  : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-black">⏭️ Lewati Duplikat</span>
                {globalResolution === 'skip' && <span className="text-emerald-600 text-xs font-bold">● Aktif</span>}
              </div>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
                Hanya simpan {cleanNewItems.length} data baru. Abaikan {duplicateItems.length} data lama.
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleApplyGlobalResolution('update')}
              className={`p-3.5 rounded-xl border text-left flex flex-col gap-1 transition-all cursor-pointer ${
                globalResolution === 'update'
                  ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 shadow-2xs'
                  : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-black">🔄 Perbarui / Timpa</span>
                {globalResolution === 'update' && <span className="text-emerald-600 text-xs font-bold">● Aktif</span>}
              </div>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
                Timpa data lama di database dengan data baru dari file ini.
              </span>
            </button>

            <button
              type="button"
              onClick={() => setGlobalResolution('custom')}
              className={`p-3.5 rounded-xl border text-left flex flex-col gap-1 transition-all cursor-pointer ${
                globalResolution === 'custom'
                  ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 shadow-2xs'
                  : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-black">🔍 Pilih Per Baris</span>
                {globalResolution === 'custom' && <span className="text-emerald-600 text-xs font-bold">● Aktif</span>}
              </div>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
                Atur secara manual per baris santri di tabel berikut.
              </span>
            </button>
          </div>

          {/* Tabel Perbandingan Data Lama vs Data Baru */}
          <div className="max-h-56 overflow-y-auto border border-slate-200 dark:border-slate-700 rounded-2xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 dark:bg-slate-800 sticky top-0 font-bold text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="py-3 px-3.5">NIS</th>
                  <th className="py-3 px-3.5">Data Lama di Database</th>
                  <th className="py-3 px-3.5">Data Baru di File</th>
                  <th className="py-3 px-3.5 text-center">Tindakan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {duplicateItems.map((dup, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="py-3 px-3.5 font-mono font-bold text-emerald-700 dark:text-emerald-400">
                      {dup.newItem.nis}
                    </td>
                    <td className="py-3 px-3.5">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-700 dark:text-slate-300">{dup.existingItem.nama}</span>
                        <span className="text-[11px] text-slate-400">{dup.existingItem.kelas}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3.5">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-900 dark:text-slate-100">{dup.newItem.nama}</span>
                        <span className="text-[11px] text-slate-500">{dup.newItem.kelas}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3.5 text-center">
                      <select
                        value={dup.action}
                        onChange={(e) => handleRowResolutionChange(idx, e.target.value)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold border cursor-pointer ${
                          dup.action === 'update'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-400 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300'
                        }`}
                      >
                        <option value="skip">⏭️ Lewati</option>
                        <option value="update">🔄 Timpa</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Modal Footer Actions */}
          <div className="flex items-center justify-between pt-5 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsDuplicateModalOpen(false)}
              className="h-11 sm:h-12 px-8 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center min-w-[150px]"
            >
              Kembali ke Preview
            </button>

            <button
              type="button"
              onClick={handleConfirmDuplicateResolution}
              className="h-11 sm:h-12 px-8 bg-emerald-700 hover:bg-emerald-800 active:scale-95 text-white font-extrabold rounded-xl text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-2.5 min-w-[210px]"
            >
              <span>Konfirmasi &amp; Simpan</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
              </svg>
            </button>
          </div>
        </div>
      </Modal>

      {/* POP-UP FORM 1: CROSSCHECK & VALIDASI KONFIRMASI */}
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
            {/* Top Shield Icon Box */}
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
              Crosscheck &amp; Validasi Import
            </h3>

            {/* Description */}
            <p
              className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed"
              style={{ fontSize: '14px', maxWidth: '350px', marginBottom: '20px' }}
            >
              Apakah Anda sudah yakin data santri ini sudah benar &amp; siap dimasukkan ke dalam database sistem?
            </p>

            {/* Ringkasan Box (Sama Persis Seperti Modal Upload BNI) */}
            {pendingImportPayload && (
              <div
                className="w-full bg-slate-50 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700/80 rounded-2xl text-left flex flex-col"
                style={{ padding: '18px 20px', marginBottom: '20px', gap: '10px' }}
              >
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">Total Santri Diimpor:</span>
                  <span className="font-extrabold text-slate-900 dark:text-slate-100 font-mono text-sm">
                    {pendingImportPayload.totalCount} santri
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">Data Santri Baru:</span>
                  <span className="font-bold text-emerald-700 dark:text-emerald-400 font-mono text-sm">
                    + {pendingImportPayload.newCount} santri
                  </span>
                </div>
                {pendingImportPayload.updateCount > 0 && (
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500 dark:text-slate-400 font-medium">Data Santri Ditimpa:</span>
                    <span className="font-bold text-amber-700 dark:text-amber-400 font-mono text-sm">
                      {pendingImportPayload.updateCount} santri
                    </span>
                  </div>
                )}
                <div
                  className="flex justify-between items-center text-xs border-t border-slate-200 dark:border-slate-700/80"
                  style={{ paddingTop: '10px' }}
                >
                  <span className="text-slate-500 dark:text-slate-400 font-medium">Status Konfirmasi:</span>
                  <span className="inline-flex items-center gap-1.5 font-bold text-amber-700 dark:text-amber-400">
                    <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                    Menunggu Konfirmasi Petugas
                  </span>
                </div>
              </div>
            )}

            {/* Checkbox Crosscheck */}
            <label className="flex items-start gap-2.5 text-left mb-6 cursor-pointer group">
              <input
                type="checkbox"
                checked={isConfirmedCheck}
                onChange={(e) => setIsConfirmedCheck(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded text-emerald-700 focus:ring-emerald-600 border-slate-300 dark:border-slate-700 cursor-pointer"
              />
              <span className="text-xs text-slate-600 dark:text-slate-300 font-medium leading-normal group-hover:text-slate-900 dark:group-hover:text-slate-100">
                Saya telah memeriksa kelengkapan data santri ini dan menyatakan data sudah sesuai &amp; valid.
              </span>
            </label>

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
                disabled={!isConfirmedCheck}
                onClick={handleFinalConfirmSave}
                className={`w-full font-bold rounded-2xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  isConfirmedCheck
                    ? 'bg-emerald-800 hover:bg-emerald-900 active:scale-95 text-white shadow-emerald-900/20'
                    : 'bg-slate-300 dark:bg-slate-800 text-slate-500 cursor-not-allowed shadow-none'
                }`}
                style={{ height: '50px', fontSize: '14px' }}
              >
                <span>Ya, Saya Yakin</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* POP-UP FORM 2: NOTIFIKASI BERHASIL IMPORT BATCH */}
      {isSuccessModalOpen && (
        <div
          className="fixed inset-0 z-[99999] bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn"
          onClick={handleFinalSuccessClose}
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
              Import Batch Santri Berhasil!
            </h3>

            {/* Description */}
            <p
              className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed"
              style={{ fontSize: '14px', maxWidth: '340px', marginBottom: '20px' }}
            >
              Data santri telah berhasil diproses dan disimpan ke dalam database sistem.
            </p>

            {/* Ringkasan Box (Sama Persis Seperti Modal Upload BNI) */}
            {pendingImportPayload && (
              <div
                className="w-full bg-slate-50 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700/80 rounded-2xl text-left flex flex-col"
                style={{ padding: '18px 20px', marginBottom: '28px', gap: '10px' }}
              >
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">Total Santri Diimpor:</span>
                  <span className="font-extrabold text-emerald-700 dark:text-emerald-400 font-mono text-sm">
                    {pendingImportPayload.totalCount} santri
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">Santri Baru Ditambahkan:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 font-mono text-sm">
                    {pendingImportPayload.newCount} santri
                  </span>
                </div>
                {pendingImportPayload.updateCount > 0 && (
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500 dark:text-slate-400 font-medium">Santri Diperbarui (Ditimpa):</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200 font-mono text-sm">
                      {pendingImportPayload.updateCount} santri
                    </span>
                  </div>
                )}
                <div
                  className="flex justify-between items-center text-xs border-t border-slate-200 dark:border-slate-700/80"
                  style={{ paddingTop: '10px' }}
                >
                  <span className="text-slate-500 dark:text-slate-400 font-medium">Status:</span>
                  <span className="inline-flex items-center gap-1.5 font-bold text-emerald-700 dark:text-emerald-400">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    Tersimpan di Database
                  </span>
                </div>
              </div>
            )}

            {/* Action Button */}
            <button
              type="button"
              onClick={handleFinalSuccessClose}
              className="w-full bg-emerald-800 hover:bg-emerald-900 active:scale-95 hover:scale-[1.01] text-white font-bold rounded-2xl shadow-md shadow-emerald-900/20 transition-all duration-150 cursor-pointer flex items-center justify-center"
              style={{ height: '50px', fontSize: '15px' }}
            >
              Selesai &amp; Lihat Data Santri
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default SantriBatchUploadModal;
