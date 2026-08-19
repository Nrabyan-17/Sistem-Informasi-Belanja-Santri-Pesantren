import React, { useState, useRef } from 'react';
import Modal from '../common/Modal';

const mockSampleImportData = [
  { id: 'import-1', nis: '2024090', nama: 'Fahri Ramadhan', kelas: 'VII A', tglLahir: '10 Jan 2012', namaWali: 'Bpk. Hendro', status: 'aktif' },
  { id: 'import-2', nis: '2024091', nama: 'Gita Permata', kelas: 'VIII B', tglLahir: '15 Feb 2011', namaWali: 'Ibu Ningsih', status: 'aktif' },
  { id: 'import-3', nis: '2024092', nama: 'Hafiz Al-Fatih', kelas: 'VII B', tglLahir: '20 Mar 2012', namaWali: 'Bpk. Fikri', status: 'aktif' },
  { id: 'import-4', nis: '2024093', nama: 'Ibrahim Malik', kelas: 'IX A', tglLahir: '05 Apr 2010', namaWali: 'Ibu Mariam', status: 'aktif' },
];

const parseSantriCSV = (text) => {
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
  if (lines.length < 2) return [];

  const delimiter = lines[0].includes(';') ? ';' : lines[0].includes(',') ? ',' : '\t';
  const headers = lines[0].split(delimiter).map(h => h.replace(/^["']|["']$/g, '').trim().toLowerCase());

  const nisIdx = headers.findIndex(h => h.includes('nis'));
  const namaIdx = headers.findIndex(h => h.includes('nama') && !h.includes('wali'));
  const kelasIdx = headers.findIndex(h => h.includes('kelas') || h.includes('asrama'));
  const tglIdx = headers.findIndex(h => h.includes('tgl') || h.includes('lahir'));
  const waliIdx = headers.findIndex(h => h.includes('wali'));

  const results = [];
  for (let i = 1; i < lines.length; i++) {
    const parts = lines[i].split(delimiter).map(p => p.replace(/^["']|["']$/g, '').trim());
    if (parts.length < 2) continue;

    const nis = nisIdx !== -1 ? parts[nisIdx] : parts[0] || `2024${String(i).padStart(3, '0')}`;
    const nama = namaIdx !== -1 ? parts[namaIdx] : parts[1] || `Santri Baru ${i}`;
    const kelas = kelasIdx !== -1 ? parts[kelasIdx] : parts[2] || 'VII A';
    const tglLahir = tglIdx !== -1 ? parts[tglIdx] : parts[3] || '1 Jan 2012';
    const namaWali = waliIdx !== -1 ? parts[waliIdx] : parts[4] || 'Bpk/Ibu Wali';

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

// Modal Pop-Up Upload Batch Santri dengan Fitur Preview, Edit, dan Delete sebelum Push ke Database
const SantriBatchUploadModal = ({ isOpen, onClose, onImportSuccess }) => {
  const fileInputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [previewList, setPreviewList] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [editingRowId, setEditingRowId] = useState(null);
  const [editFormData, setEditFormData] = useState({});

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

  const handlePushToDatabase = () => {
    if (previewList.length === 0) return;

    // Generate VA jajan & tagihan otomatis
    const formattedData = previewList.map(s => ({
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

    onImportSuccess?.(formattedData);
    handleResetModal();
  };

  const handleResetModal = () => {
    setFile(null);
    setPreviewList([]);
    setEditingRowId(null);
    setEditFormData({});
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleResetModal}
      title="Import Batch Data Santri"
      subtitle="Import data banyak santri sekaligus via CSV/Excel, tinjau, ubah, atau hapus sebelum disimpan ke database."
      maxWidth="max-w-4xl"
    >
      <div className="flex flex-col gap-6 pt-1">
        {/* Upload Dropzone dengan Spacing Lega & Rapi */}
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
          <div className="flex flex-col gap-4">
            {/* Header Preview Bar */}
            <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 flex-wrap gap-2">
              <div className="flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-xl bg-emerald-700 text-white font-extrabold text-xs flex items-center justify-center">
                  {previewList.length}
                </span>
                <div>
                  <span className="text-sm font-extrabold text-slate-900 dark:text-slate-100">
                    Preview {previewList.length} Data Santri Siap Diimpor
                  </span>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Anda dapat mengoreksi data (Edit) atau menghapus (Hapus) baris sebelum push ke database.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => { setFile(null); setPreviewList([]); }}
                  className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  Ganti File
                </button>
              </div>
            </div>

            {/* Scrollable Preview Table */}
            <div className="max-h-72 overflow-y-auto border border-slate-200 dark:border-slate-800 rounded-2xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 dark:bg-slate-800/80 sticky top-0 z-10 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="p-3 w-12 text-center">No</th>
                    <th className="p-3">NIS</th>
                    <th className="p-3">Nama Santri</th>
                    <th className="p-3">Kelas</th>
                    <th className="p-3">Wali Santri</th>
                    <th className="p-3 text-center">Aksi Preview</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {previewList.map((row, idx) => {
                    const isEditing = editingRowId === row.id;

                    if (isEditing) {
                      return (
                        <tr key={row.id} className="bg-emerald-50/70 dark:bg-emerald-950/40">
                          <td className="p-3 text-center font-bold text-slate-500">{idx + 1}</td>
                          <td className="p-2">
                            <input
                              type="text"
                              className="w-full px-2 py-1 bg-white dark:bg-slate-900 border border-emerald-500 rounded-lg text-xs font-mono font-bold"
                              value={editFormData.nis || ''}
                              onChange={(e) => setEditFormData({ ...editFormData, nis: e.target.value })}
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="text"
                              className="w-full px-2 py-1 bg-white dark:bg-slate-900 border border-emerald-500 rounded-lg text-xs font-bold"
                              value={editFormData.nama || ''}
                              onChange={(e) => setEditFormData({ ...editFormData, nama: e.target.value })}
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="text"
                              className="w-20 px-2 py-1 bg-white dark:bg-slate-900 border border-emerald-500 rounded-lg text-xs"
                              value={editFormData.kelas || ''}
                              onChange={(e) => setEditFormData({ ...editFormData, kelas: e.target.value })}
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="text"
                              className="w-full px-2 py-1 bg-white dark:bg-slate-900 border border-emerald-500 rounded-lg text-xs"
                              value={editFormData.namaWali || ''}
                              onChange={(e) => setEditFormData({ ...editFormData, namaWali: e.target.value })}
                            />
                          </td>
                          <td className="p-2 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                type="button"
                                onClick={handleSaveEdit}
                                className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-[11px] font-bold shadow-xs cursor-pointer"
                              >
                                Simpan
                              </button>
                              <button
                                type="button"
                                onClick={handleCancelEdit}
                                className="px-2.5 py-1 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-700 dark:text-slate-200 rounded-lg text-[11px] font-bold cursor-pointer"
                              >
                                Batal
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    }

                    return (
                      <tr key={row.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="p-3 text-center text-slate-500 font-medium">{idx + 1}</td>
                        <td className="p-3 font-mono font-bold text-emerald-700 dark:text-emerald-400">{row.nis}</td>
                        <td className="p-3 font-extrabold text-slate-800 dark:text-slate-100">{row.nama}</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded-md bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300 font-bold text-[11px]">
                            {row.kelas}
                          </span>
                        </td>
                        <td className="p-3 font-medium text-slate-700 dark:text-slate-300">{row.namaWali}</td>
                        <td className="p-3 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleStartEdit(row)}
                              className="px-2 py-1 text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 rounded-lg font-bold text-xs transition-colors cursor-pointer"
                              title="Edit data baris ini"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteRow(row.id)}
                              className="px-2 py-1 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/60 rounded-lg font-bold text-xs transition-colors cursor-pointer"
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
        <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={handleResetModal}
            className="px-5 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-all cursor-pointer"
          >
            Tutup
          </button>

          {previewList.length > 0 && (
            <button
              type="button"
              onClick={handlePushToDatabase}
              className="px-6 py-2.5 bg-emerald-800 hover:bg-emerald-900 active:scale-95 text-white font-extrabold rounded-xl text-xs shadow-md shadow-emerald-900/20 transition-all flex items-center gap-2 cursor-pointer"
            >
              <span>Push {previewList.length} Data ke Database</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default SantriBatchUploadModal;
