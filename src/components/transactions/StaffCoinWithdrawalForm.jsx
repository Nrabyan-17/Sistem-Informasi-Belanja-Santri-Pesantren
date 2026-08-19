import React, { useState } from 'react';

// Form Penarikan Koin / Saldo khusus Staff Rumah Koin
const mockSantriOptions = [
  { nis: '2024003', nama: 'Muhammad Rizki',  kelas: 'VII A', saldo: 0, foto: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=256' },
  { nis: '2024007', nama: 'Zainab Mustafa',  kelas: 'VIII B', saldo: 0, foto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256' },
  { nis: '2024006', nama: 'Nurul Hidayah',  kelas: 'IX A', saldo: 0, foto: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=256' },
  { nis: '2024002', nama: 'Siti Nurhaliza', kelas: 'VII B', saldo: 0, foto: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=256' },
  { nis: '2024001', nama: 'Ahmad Fauzi',    kelas: 'VIII A', saldo: 0, foto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=256' },
  { nis: '2024082', nama: 'Budi Santoso',   kelas: 'VIII B', saldo: 0, foto: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=256' },
  { nis: '2024084', nama: 'Dani Pratama',   kelas: 'VII B', saldo: 0, foto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=256' },
  { nis: '2024085', nama: 'Eka Rahmawati',  kelas: 'VIII A', saldo: 0, foto: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=256' },
];

const getInitials = (name) => {
  if (!name) return 'S';
  const parts = name.trim().split(' ');
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  return name.slice(0, 2).toUpperCase();
};

const StaffCoinWithdrawalForm = ({ onWithdrawalSuccess }) => {
  const [selectedNis, setSelectedNis] = useState('2024003');
  const [searchQuery, setSearchQuery] = useState('');

  const [customNis, setCustomNis] = useState('');
  const [nominal, setNominal] = useState('');
  const [keterangan, setKeterangan] = useState('Penarikan Koin (Rumah Koin)');
  const [isSuccessModal, setIsSuccessModal] = useState(false);
  const [isInsufficientModal, setIsInsufficientModal] = useState(false);
  const [insufficientData, setInsufficientData] = useState(null);
  const [lastTxData, setLastTxData] = useState(null);

  // Find santri object based on selected NIS or search match
  const activeSantri = mockSantriOptions.find((s) => s.nis === selectedNis) || {
    nis: customNis || '2024000',
    nama: 'Santri Terpilih',
    saldo: 100000,
  };

  const quickAmounts = [5000, 10000, 20000, 30000];

  const handleProcessWithdrawal = (e) => {
    e.preventDefault();
    const amount = parseInt(nominal || '0', 10);
    if (amount <= 0) {
      alert('Masukkan nominal penarikan koin yang valid.');
      return;
    }
    if (amount > 30000) {
      alert('Batas penarikan koin santri maksimal Rp 30.000 per 2 hari.');
      return;
    }
    if (amount > activeSantri.saldo) {
      setInsufficientData({
        namaSantri: activeSantri.nama,
        nis: activeSantri.nis,
        saldo: activeSantri.saldo,
        nominalDiminta: amount,
      });
      setIsInsufficientModal(true);
      return;
    }

    const txData = {
      id: Date.now(),
      tanggal: new Date().toISOString().slice(0, 10),
      waktu: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      nis: activeSantri.nis,
      namaSantri: activeSantri.nama,
      kategori: 'Penarikan Koin',
      jenis: 'Keluar',
      nominal: amount,
      sisaSaldo: activeSantri.saldo - amount,
      staff: 'Ust. Miftahul Huda',
      status: 'sukses',
    };

    setLastTxData(txData);
    setIsSuccessModal(true);
    onWithdrawalSuccess?.(txData);

    // Reset form
    setNominal('');
  };

  const formatRupiah = (val) => new Intl.NumberFormat('id-ID').format(val);

  return (
    <div className="staff-withdrawal-card">
      <div className="card-header border-b border-slate-100 dark:border-slate-800 pb-5 mb-8 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            Form Penarikan Koin / Saldo Santri
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Proses penarikan koin tunai santri dan potong saldo secara otomatis
          </p>
        </div>
        <span className="px-3.5 py-1.5 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 rounded-full text-xs font-bold">
          Loket Rumah Koin
        </span>
      </div>

      <form onSubmit={handleProcessWithdrawal} className="flex flex-col pt-1">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          {/* Left Column: Search Bar & Info Santri */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            {/* Input Search Bar Santri (Tanpa Rekomendasi Pop-up) */}
            <div className="form-group flex flex-col gap-2.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 flex items-center justify-between">
                <span>Cari Santri (NIS / Nama)</span>
                <span className="text-[11px] font-normal text-emerald-700 dark:text-emerald-400 font-sans">
                  {activeSantri.nis ? `Terpilih: ${activeSantri.nama}` : 'Ketik untuk mencari'}
                </span>
              </label>

              {/* Search Bar Input Field */}
              <div className="relative flex items-center">
                <svg
                  className="absolute left-3.5 w-4 h-4 text-slate-400 dark:text-slate-500 pointer-events-none z-10"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2.2"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>

                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    const query = e.target.value;
                    setSearchQuery(query);
                    // Match santri secara dinamis berdasarkan NIS atau Nama
                    const matched = mockSantriOptions.find(
                      (s) =>
                        s.nis.toLowerCase().includes(query.toLowerCase()) ||
                        s.nama.toLowerCase().includes(query.toLowerCase())
                    );
                    if (matched) {
                      setSelectedNis(matched.nis);
                    } else {
                      setCustomNis(query);
                    }
                  }}
                  placeholder="Ketik NIS atau nama santri..."
                  style={{ paddingLeft: '40px', paddingRight: '40px' }}
                  className="w-full h-11 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 transition-all"
                />

                {/* Clear Button */}
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedNis('2024003');
                    }}
                    className="absolute right-3 w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-600 dark:text-slate-300 text-xs flex items-center justify-center transition-colors cursor-pointer"
                    title="Hapus pencarian"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            {/* Info Card Santri Terpilih dengan Inisial Santri */}
            <div className="santri-preview-box flex-wrap sm:flex-nowrap gap-4">
              <div className="flex items-center gap-3.5">
                {/* Inisial Profil Santri */}
                <div className="relative shrink-0">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-emerald-700 dark:bg-emerald-800 text-white font-extrabold text-lg sm:text-xl flex items-center justify-center border-2 border-emerald-600/40 dark:border-emerald-400/40 shadow-xs ring-4 ring-emerald-50 dark:ring-emerald-950/40">
                    {getInitials(activeSantri.nama)}
                  </div>
                  <span
                    className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-800 shadow-2xs"
                    title="Santri Aktif"
                  />
                </div>

                <div className="flex flex-col">
                  <span className="santri-preview-label">
                    INFO SANTRI TERPILIH
                  </span>
                  <h3 className="santri-preview-name font-extrabold text-slate-900 dark:text-slate-100 text-sm sm:text-base leading-snug">
                    {activeSantri.nama}
                  </h3>
                  <p className="santri-preview-nis text-xs font-mono text-slate-500 dark:text-slate-400 mt-0.5">
                    NIS: {activeSantri.nis}
                  </p>
                </div>
              </div>

              <div className="text-left sm:text-right shrink-0">
                <span className="santri-preview-label">
                  SISA SALDO
                </span>
                <span className="santri-preview-saldo text-emerald-600 dark:text-emerald-400 font-extrabold text-base sm:text-lg">
                  Rp {formatRupiah(activeSantri.saldo)}
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Nominal Penarikan & Action */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            <div className="form-group flex flex-col gap-2.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 flex items-center justify-between">
                <span>Pilih Nominal Penarikan (Cepat)</span>
                <span className="text-[11px] font-bold text-amber-700 dark:text-amber-400">Maks. 30rb</span>
              </label>
              <div className="grid grid-cols-4 gap-3 max-w-lg sm:max-w-xl">
                {quickAmounts.map((amt) => (
                  <button
                    type="button"
                    key={amt}
                    onClick={() => setNominal(amt.toString())}
                    className={`quick-amt-btn h-12 sm:h-13 py-3 px-2 rounded-xl text-xs sm:text-sm font-extrabold border transition-all cursor-pointer flex items-center justify-center ${
                      nominal === amt.toString()
                        ? 'quick-amt-btn--active bg-[#0e5d26] text-white border-[#0e5d26] shadow-sm scale-[1.02]'
                        : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                    }`}
                  >
                    {amt >= 1000 ? `${amt / 1000}rb` : amt}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="form-group flex flex-col gap-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  Nominal Penarikan (RP)
                </label>
                <input
                  type="number"
                  placeholder="Contoh: 30000"
                  max="30000"
                  value={nominal}
                  onChange={(e) => setNominal(e.target.value)}
                  className="w-full h-11 px-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-600"
                  required
                />
              </div>

              <div className="form-group flex flex-col gap-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  Keterangan
                </label>
                <input
                  type="text"
                  value={keterangan}
                  onChange={(e) => setKeterangan(e.target.value)}
                  className="w-full h-11 px-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:border-emerald-600"
                />
              </div>
            </div>

            {/* Pengingat Batas Penarikan Santri (Tanpa Background) */}
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
              <strong className="text-slate-700 dark:text-slate-300 font-bold">Batas penarikan santri:</strong> Maks. Rp 30.000 per 2 hari.
            </p>
          </div>
        </div>

        {/* Action Button Row dengan Border Top & Spacing Lega */}
        <div className="staff-withdrawal-footer">
          <button type="submit" className="btn-process-withdrawal">
            <span>Proses Penarikan Koin</span>
          </button>
        </div>
      </form>

      {/* Pop-up Modal Sukses Penarikan - Display Lega & Spacing Proporsional */}
      {isSuccessModal && lastTxData && (
        <div className="fixed inset-0 z-[99999] bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-fadeIn">
          <div className="success-modal-card modal-animate-pop">
            
            {/* Green Checkmark Badge Icon */}
            <div className="modal-badge-bounce w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 text-3xl font-extrabold flex items-center justify-center mx-auto mb-7 shadow-lg shadow-emerald-900/10 ring-8 ring-emerald-50 dark:ring-emerald-900/20">
              ✓
            </div>

            {/* Title & Subtitle */}
            <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight mb-2">
              Penarikan Koin Berhasil!
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 leading-relaxed px-2">
              Koin sebesar <strong className="font-bold text-emerald-700 dark:text-emerald-400">Rp {formatRupiah(lastTxData.nominal)}</strong> telah diserahkan kepada <span className="font-bold text-slate-800 dark:text-slate-200">{lastTxData.namaSantri}</span>.
            </p>

            {/* Detail Summary Card dengan Padding & Row Gap Sangat Lega */}
            <div className="success-modal-details">
              <div className="success-modal-row items-center">
                <span className="success-modal-label">Santri:</span>
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-emerald-700 text-white text-xs font-extrabold flex items-center justify-center shrink-0">
                    {getInitials(lastTxData.namaSantri)}
                  </div>
                  <strong className="success-modal-value">{lastTxData.namaSantri} ({lastTxData.nis})</strong>
                </div>
              </div>
              <div className="success-modal-divider"></div>
              <div className="success-modal-row">
                <span className="success-modal-label">Sisa Saldo:</span>
                <strong className="success-modal-value text-emerald-600 dark:text-emerald-400 text-base font-extrabold">Rp {formatRupiah(lastTxData.sisaSaldo)}</strong>
              </div>
              <div className="success-modal-divider"></div>
              <div className="success-modal-row">
                <span className="success-modal-label">Staff:</span>
                <span className="success-modal-value font-semibold">{lastTxData.staff}</span>
              </div>
            </div>

            {/* Garis Pembatas dengan Margin Pembatas */}
            <div className="w-full h-px bg-slate-200 dark:bg-slate-800 mb-6"></div>

            {/* Button Selesai */}
            <button
              type="button"
              onClick={() => setIsSuccessModal(false)}
              className="w-full h-13 py-3.5 bg-[#0e5d26] hover:bg-[#0b471d] text-white font-extrabold rounded-xl text-sm sm:text-base shadow-lg shadow-emerald-950/20 transition-all cursor-pointer flex items-center justify-center active:scale-[0.99]"
            >
              Tutup &amp; Selesai
            </button>
          </div>
        </div>
      )}

      {/* Pop-up Modal Saldo Tidak Cukup - Tampilan Rapi, Lega & Proporsional */}
      {isInsufficientModal && insufficientData && (
        <div
          className="fixed inset-0 z-[99999] bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-fadeIn"
          onClick={() => setIsInsufficientModal(false)}
        >
          <div
            className="insufficient-modal-card modal-animate-pop my-auto relative pt-8"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Tombol Ikon Silang (✕) di Pojok Kanan Atas */}
            <button
              type="button"
              onClick={() => setIsInsufficientModal(false)}
              className="absolute top-4 right-4 w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors flex items-center justify-center cursor-pointer"
              title="Tutup Modal"
              aria-label="Tutup Modal"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Title & Subtitle */}
            <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight mb-2 mt-1">
              Saldo Tidak Cukup
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed px-2">
              Saldo santri tidak mencukupi untuk melakukan penarikan koin sebesar{' '}
              <strong className="font-bold text-rose-600 dark:text-rose-400">
                Rp {formatRupiah(insufficientData.nominalDiminta)}
              </strong>.
            </p>

            {/* Detail Breakdown Card dengan Spacing Teratur */}
            <div className="insufficient-modal-details">
              <div className="success-modal-row">
                <span className="success-modal-label">Santri:</span>
                <strong className="success-modal-value">
                  {insufficientData.namaSantri} ({insufficientData.nis})
                </strong>
              </div>
              <div className="success-modal-divider"></div>
              <div className="success-modal-row">
                <span className="success-modal-label">Sisa Saldo Saat Ini:</span>
                <strong className="success-modal-value text-emerald-700 dark:text-emerald-400 text-sm sm:text-base font-extrabold font-mono">
                  Rp {formatRupiah(insufficientData.saldo)}
                </strong>
              </div>
              <div className="success-modal-divider"></div>
              <div className="success-modal-row">
                <span className="success-modal-label">Nominal Penarikan:</span>
                <strong className="success-modal-value text-rose-600 dark:text-rose-400 font-bold font-mono">
                  Rp {formatRupiah(insufficientData.nominalDiminta)}
                </strong>
              </div>
            </div>

            {/* Button Tutup dengan Jarak / Gap yang Pasti */}
            <button
              type="button"
              onClick={() => setIsInsufficientModal(false)}
              className="insufficient-modal-btn"
            >
              Tutup &amp; Kembali
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffCoinWithdrawalForm;
