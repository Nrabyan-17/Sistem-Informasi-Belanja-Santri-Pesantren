import React, { useState, useRef } from 'react';
import Modal from '../common/Modal';

// Helper function untuk membersihkan karakter tanda petik dan formula Excel ="..."
const cleanCell = (val) => {
  if (val === null || val === undefined) return '';
  return String(val)
    .replace(/^="?|"?$/g, '')
    .replace(/^["']|["']$/g, '')
    .trim();
};

// Sample data demo: sengaja menyertakan NIS 2024001 dan 2024002 (yang sudah ada di mockSantri) untuk menguji handler data ganda
const mockSampleImportData = [
  { id: 'import-1', nis: '2024001', nama: 'Ahmad Fauzi (Update)', kelas: 'VII B', tglLahir: '10 Jan 2012', namaWali: 'Bpk. Fauzi Baru', status: 'aktif' },
  { id: 'import-2', nis: '2024091', nama: 'Gita Permata', kelas: 'VIII B', tglLahir: '15 Feb 2011', namaWali: 'Ibu Ningsih', status: 'aktif' },
  { id: 'import-3', nis: '2024002', nama: 'Siti Nurhaliza (Update)', kelas: 'VIII A', tglLahir: '20 Mar 2012', namaWali: 'Ibu Hj. Aminah', status: 'aktif' },
  { id: 'import-4', nis: '2024093', nama: 'Ibrahim Malik', kelas: 'IX A', tglLahir: '05 Apr 2010', namaWali: 'Ibu Mariam', status: 'aktif' },
];

const parseSantriCSV = (text) => {
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
  if (lines.length < 2) return [];

  const delimiter = lines[0].includes(';') ? ';' : lines[0].includes(',') ? ',' : '\t';
  const headers = lines[0].split(delimiter).map(cleanCell).map(h => h.toLowerCase());

  const nisIdx = headers.findIndex(h => /nis|nomor\s*induk|id\s*santri|va\s*number/i.test(h));
  const namaIdx = headers.findIndex(h => /(^nama$|nama\s*santri|nama\s*siswa|nama\s*lengkap|customer\s*name)/i.test(h) && !/wali/i.test(h));
  const kelasIdx = headers.findIndex(h => /(^kelas$|tingkat|rombel|asrama|kamar)/i.test(h));
  const tglIdx = headers.findIndex(h => /(tgl|tanggal|lahir|birth)/i.test(h));
  const waliIdx = headers.findIndex(h => /(wali|orang\s*tua|ayah|ibu)/i.test(h));

  const results = [];
  for (let i = 1; i < lines.length; i++) {
    const parts = lines[i].split(delimiter).map(cleanCell);
    if (parts.length < 2) continue;

    let nis = nisIdx !== -1 ? parts[nisIdx] : parts[0] || `2024${String(i).padStart(3, '0')}`;
    let nama = namaIdx !== -1 ? parts[namaIdx] : parts[1] || `Santri Baru ${i}`;
    let kelas = kelasIdx !== -1 ? parts[kelasIdx] : parts[2] || 'VII A';
    let tglLahir = tglIdx !== -1 ? parts[tglIdx] : parts[3] || '1 Jan 2012';
    let namaWali = waliIdx !== -1 ? parts[waliIdx] : parts[4] || 'Wali Santri';

    // Bersihkan jika ada nilai kelas yang berupa angka tanggal Excel (misal 44333 -> VII A)
    if (/^\d{4,6}$/.test(kelas)) {
      kelas = 'VII A';
    }

    // Jika nama wali kosong atau sama persis dengan nama santri, berikan default yang rapi
    if (!namaWali || namaWali === nama) {
      namaWali = `Wali ${nama}`;
    }

    results.push({
      id: `import-${Date.now()}-${i}`,
      nis,
      nama,
      kelas,
      tglLahir,
      namaWali,
      status: 'aktif',
    });
  }
  return results;
};

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

  if (!isOpen) return null;

  const handleFileProcess = (selectedFile) => {
    if (!selectedFile) return;
    setFile(selectedFile);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result;
        if (typeof text === 'string') {
          const parsed = parseSantriCSV(text);
          if (parsed.length > 0) {
            setPreviewList(parsed);
          } else {
            setPreviewList(mockSampleImportData);
          }
        }
      } catch (err) {
        console.error('Gagal memproses file:', err);
        setPreviewList(mockSampleImportData);
      }
    };
    reader.onerror = () => {
      setPreviewList(mockSampleImportData);
    };
    reader.readAsText(selectedFile);
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

  const handleLoadDemo = () => {
    setFile({ name: 'template_data_santri_2026.csv', size: 1420 });
    setPreviewList(mockSampleImportData);
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
      // Tidak ada data ganda, langsung simpan
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

    executePush(itemsToAdd, itemsToUpdate);
    setIsDuplicateModalOpen(false);
  };

  const executePush = (newItemsList, updatedItemsList) => {
    const formattedNew = newItemsList.map(s => ({
      id: Date.now() + Math.random(),
      nis: s.nis,
      nama: s.nama,
      kelas: s.kelas || 'VII A',
      tglLahir: s.tglLahir || '1 Jan 2012',
      namaWali: s.namaWali || 'Wali Santri',
      vaJajan: `8808 0990 ${s.nis.slice(0, 4)} ${s.nis.slice(4)}`,
      vaTagihan: `8808 0990 9${s.nis.slice(1, 4)} ${s.nis.slice(4)}`,
      status: s.status || 'aktif',
      saldo: 0,
    }));

    onImportSuccess?.({
      newSantri: formattedNew,
      updatedSantri: updatedItemsList,
    });

    handleResetModal();
  };

  const handleResetModal = () => {
    setFile(null);
    setPreviewList([]);
    setEditingRowId(null);
    setEditFormData({});
    setIsDuplicateModalOpen(false);
    setDuplicateItems([]);
    setCleanNewItems([]);
    onClose();
  };

  return (
    <>
      {/* Modal Utama Import Batch */}
      <Modal
        isOpen={isOpen && !isDuplicateModalOpen}
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
              <div className="flex flex-col gap-1.5 px-4">
                <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  Tarik &amp; lepas file CSV / Excel di sini, atau <span className="text-emerald-700 dark:text-emerald-400 underline">klik untuk memilih file</span>
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Format yang didukung: .csv, .xlsx (Kolom: NIS, Nama, Kelas, Tanggal Lahir, Nama Wali)
                </p>
              </div>
              <div className="pt-1 flex items-center justify-center">
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); handleLoadDemo(); }}
                  className="import-batch-btn-demo"
                >
                  Muat Contoh Data Demo
                </button>
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
              <div className="import-batch-table-container">
                <table className="import-batch-table">
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
    </>
  );
};

export default SantriBatchUploadModal;
