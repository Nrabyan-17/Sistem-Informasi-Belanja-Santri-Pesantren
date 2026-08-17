import { useState, useRef } from 'react';
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
      }));
      setParsedData(items);
      setUploadId(res.upload?.id || null);
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

  const handleConfirmSave = async () => {
    if (!uploadId) return;
    setIsUploading(true);
    try {
      const res = await bniApi.apply(uploadId);
      setIsConfirmed(true);
      showPopup('Berhasil', res.message || 'Berhasil konfirmasi & simpan!', 'success');
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

        {/* Upload Error Alert */}
        {uploadError && (
          <div className="px-4 py-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 rounded-2xl text-sm font-semibold text-rose-700 dark:text-rose-300">
            {uploadError}
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
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-200">
                    {displayedData.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="text-center py-6 text-slate-400">
                          Tidak ada data yang sesuai filter.
                        </td>
                      </tr>
                    ) : (
                      displayedData.map((item, idx) => (
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
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })()}
      </div>
    </Layout>
  );
};

export default UploadBNIPage;
