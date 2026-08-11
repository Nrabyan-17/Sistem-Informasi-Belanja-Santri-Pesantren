import { useState, useRef } from 'react';
import StaffLayout from '../components/layout/StaffLayout';

const mockParsedTransactions = [
  { id: 1, va: '9881234567890001', nis: '123456', nama: 'Ahmad Fauzi', nominal: 100000, tanggal: '2026-08-01 08:30', status: 'valid' },
  { id: 2, va: '9881234567890002', nis: '123457', nama: 'Budi Santoso', nominal: 50000, tanggal: '2026-08-01 09:15', status: 'valid' },
  { id: 3, va: '9881234567890003', nis: '123458', nama: 'Citra Dewi', nominal: 75000, tanggal: '2026-08-01 10:45', status: 'valid' },
  { id: 4, va: '9881234567899999', nis: '-', nama: 'Tidak Ditemukan', nominal: 25000, tanggal: '2026-08-01 11:20', status: 'invalid' },
];

const UploadBNIPage = ({ Layout = StaffLayout }) => {
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [parsedData, setParsedData] = useState(null);
  const [isConfirmed, setIsConfirmed] = useState(false);

  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const processFile = (selectedFile) => {
    if (!selectedFile) return;
    setFile(selectedFile);
    setIsUploading(true);
    setIsConfirmed(false);

    // Simulasi pembacaan & validasi file Excel/CSV mutasi BNI
    setTimeout(() => {
      setIsUploading(false);
      setParsedData(mockParsedTransactions);
    }, 1200);
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

  const handleConfirmSave = () => {
    setIsConfirmed(true);
    alert('✅ Berhasil konfirmasi & simpan! Saldo santri telah berhasil diperbarui otomatis.');
  };

  const handleReset = () => {
    setFile(null);
    setParsedData(null);
    setIsConfirmed(false);
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
          className={`bni-dropzone border-2 border-dashed rounded-3xl p-12 text-center cursor-pointer transition-all flex flex-col items-center justify-center bg-white shadow-xs ${
            isDragging ? 'bni-dropzone--dragging border-emerald-600 bg-emerald-50/50 scale-[1.005]' : 'border-slate-300 hover:border-emerald-600 hover:bg-emerald-50/30'
          } ${file ? 'bni-dropzone--has-file border-emerald-500 bg-emerald-50/40' : ''}`}
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
        {parsedData && !isUploading && (
          <div className="bni-results-card bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col gap-5">
            <div className="bni-results-header flex justify-between items-center flex-wrap gap-3">
              <div>
                <h3 className="bni-results-title text-lg font-bold text-slate-800">Hasil Pencocokan Mutasi BNI</h3>
                <p className="bni-results-subtitle text-xs text-slate-500 mt-0.5">
                  Ditemukan {parsedData.length} data transaksi mutasi ({parsedData.filter(d => d.status === 'valid').length} valid, {parsedData.filter(d => d.status === 'invalid').length} tidak cocok)
                </p>
              </div>

              <div className="bni-results-actions flex gap-3">
                <button
                  className="btn btn-secondary px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-all"
                  onClick={handleReset}
                >
                  Reset / File Baru
                </button>
                <button
                  className="btn btn-primary px-5 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-xl text-xs shadow-md transition-all disabled:opacity-60"
                  onClick={handleConfirmSave}
                  disabled={isConfirmed}
                >
                  {isConfirmed ? '✅ Sudah Disimpan' : '✨ Konfirmasi & Simpan Saldo'}
                </button>
              </div>
            </div>

            <div className="data-table-wrapper overflow-x-auto border border-slate-200 rounded-2xl">
              <table className="data-table w-full text-left border-collapse text-sm">
                <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase">
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
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {parsedData.map((item, idx) => (
                    <tr key={item.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium">{idx + 1}</td>
                      <td className="px-4 py-3"><code className="bg-slate-100 px-2 py-1 rounded text-xs font-mono text-slate-800">{item.va}</code></td>
                      <td className="px-4 py-3">{item.nis}</td>
                      <td className="px-4 py-3 font-bold text-slate-800">{item.nama}</td>
                      <td className="px-4 py-3 text-xs">{item.tanggal}</td>
                      <td className="px-4 py-3 font-bold text-emerald-600">+ Rp {item.nominal.toLocaleString('id-ID')}</td>
                      <td className="px-4 py-3">
                        {item.status === 'valid' ? (
                          <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-full text-xs font-semibold">
                            ✅ Valid
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 bg-rose-50 text-rose-700 border border-rose-200 px-2.5 py-1 rounded-full text-xs font-semibold">
                            ❌ VA Tidak Cocok
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default UploadBNIPage;
