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
      <div className="bni-upload-page">
        {/* Header Title + Subtitle */}
        <div className="bni-header-subtitle">
          Sinkronisasi data masuk dari rekening BNI eCollection
        </div>

        {/* 3 Step Process Cards */}
        <div className="bni-steps-grid">
          {/* Step 1 */}
          <div className="bni-step-card">
            <div className="bni-step-number">1</div>
            <div className="bni-step-content">
              <h3 className="bni-step-title">Unduh Mutasi BNI</h3>
              <p className="bni-step-desc">
                Login ke BNI e-Collection, unduh file mutasi rekening e-Collection dalam format Excel (.xlsx).
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="bni-step-card">
            <div className="bni-step-number">2</div>
            <div className="bni-step-content">
              <h3 className="bni-step-title">Upload File di Sini</h3>
              <p className="bni-step-desc">
                Unggah file mutasi. Sistem akan otomatis mencocokkan nomor VA dengan data santri terdaftar.
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="bni-step-card">
            <div className="bni-step-number">3</div>
            <div className="bni-step-content">
              <h3 className="bni-step-title">Konfirmasi &amp; Simpan</h3>
              <p className="bni-step-desc">
                Periksa hasil validasi , data valid langsung menambah saldo santri setelah dikonfirmasi.
              </p>
            </div>
          </div>
        </div>

        {/* Drag & Drop Upload Zone */}
        <div
          className={`bni-dropzone ${isDragging ? 'bni-dropzone--dragging' : ''} ${file ? 'bni-dropzone--has-file' : ''}`}
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

          <div className="bni-dropzone-icon-wrapper">
            <svg
              className="bni-upload-icon"
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
              <h3 className="bni-dropzone-title">📄 {file.name}</h3>
              <p className="bni-dropzone-subtitle">
                {(file.size / 1024).toFixed(1)} KB — Klik untuk mengganti file
              </p>
            </div>
          ) : (
            <>
              <h3 className="bni-dropzone-title">
                Tarik &amp; Lepas File Mutasi BNI eCollection
              </h3>
              <p className="bni-dropzone-subtitle">
                atau klik untuk memilih file dari komputer Anda
              </p>
              <div className="bni-format-badges">
                <span className="bni-badge">.xlsx</span>
                <span className="bni-badge">.xls</span>
                <span className="bni-badge">.csv</span>
              </div>
            </>
          )}
        </div>

        {/* Loading Spinner */}
        {isUploading && (
          <div className="bni-loading-card">
            <div className="bni-spinner"></div>
            <p>Membaca dan mencocokkan data mutasi BNI eCollection...</p>
          </div>
        )}

        {/* Parsed Data Preview Table */}
        {parsedData && !isUploading && (
          <div className="bni-results-card">
            <div className="bni-results-header">
              <div>
                <h3 className="bni-results-title">Hasil Pencocokan Mutasi BNI</h3>
                <p className="bni-results-subtitle">
                  Ditemukan {parsedData.length} data transaksi mutasi ({parsedData.filter(d => d.status === 'valid').length} valid, {parsedData.filter(d => d.status === 'invalid').length} tidak cocok)
                </p>
              </div>

              <div className="bni-results-actions">
                <button className="btn btn-secondary" onClick={handleReset}>
                  Reset / File Baru
                </button>
                <button
                  className="btn btn-primary"
                  onClick={handleConfirmSave}
                  disabled={isConfirmed}
                >
                  {isConfirmed ? '✅ Sudah Disimpan' : '✨ Konfirmasi & Simpan Saldo'}
                </button>
              </div>
            </div>

            <div className="data-table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>No</th>
                    <th>Nomor VA</th>
                    <th>NIS</th>
                    <th>Nama Santri</th>
                    <th>Tanggal Transaksi</th>
                    <th>Nominal</th>
                    <th>Status Validasi</th>
                  </tr>
                </thead>
                <tbody>
                  {parsedData.map((item, idx) => (
                    <tr key={item.id}>
                      <td>{idx + 1}</td>
                      <td><code>{item.va}</code></td>
                      <td>{item.nis}</td>
                      <td><strong>{item.nama}</strong></td>
                      <td>{item.tanggal}</td>
                      <td><span className="text-success">+ Rp {item.nominal.toLocaleString('id-ID')}</span></td>
                      <td>
                        {item.status === 'valid' ? (
                          <span className="badge badge--green">✅ Valid</span>
                        ) : (
                          <span className="badge badge--red">❌ VA Tidak Cocok</span>
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
