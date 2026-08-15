import React, { useState } from 'react';

// Form Penarikan Koin / Saldo khusus Staff Rumah Koin
const mockSantriOptions = [
  { nis: '2024003', nama: 'Muhammad Rizki',  saldo: 150000, foto: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=256' },
  { nis: '2024007', nama: 'Zainab Mustafa',   saldo: 95000,  foto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256' },
  { nis: '2024006', nama: 'Nurul Hidayah',   saldo: 120000, foto: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=256' },
  { nis: '2024002', nama: 'Siti Nurhaliza',  saldo: 200000, foto: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=256' },
  { nis: '2024001', nama: 'Ahmad Fauzi',     saldo: 80000,  foto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=256' },
];

const StaffCoinWithdrawalForm = ({ onWithdrawalSuccess }) => {
  const [selectedNis, setSelectedNis] = useState('2024003');
  const [customNis, setCustomNis] = useState('');
  const [nominal, setNominal] = useState('');
  const [keterangan, setKeterangan] = useState('Penarikan Koin (Rumah Koin)');
  const [isSuccessModal, setIsSuccessModal] = useState(false);
  const [lastTxData, setLastTxData] = useState(null);

  // Find santri object based on selected NIS
  const activeSantri = mockSantriOptions.find((s) => s.nis === selectedNis) || {
    nis: customNis || '2024000',
    nama: 'Santri Terpilih',
    saldo: 100000,
    foto: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=256',
  };

  const quickAmounts = [5000, 10000, 20000, 50000, 100000];

  const handleProcessWithdrawal = (e) => {
    e.preventDefault();
    const amount = parseInt(nominal || '0', 10);
    if (amount <= 0) {
      alert('Masukkan nominal penarikan koin yang valid.');
      return;
    }
    if (amount > activeSantri.saldo) {
      alert(`Saldo tidak mencukupi! Sisa saldo ${activeSantri.nama} hanya Rp ${activeSantri.saldo.toLocaleString('id-ID')}`);
      return;
    }

    const txData = {
      id: Date.now(),
      tanggal: new Date().toISOString().slice(0, 10),
      waktu: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      nis: activeSantri.nis,
      namaSantri: activeSantri.nama,
      fotoSantri: activeSantri.foto,
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
            <span>🪙</span> Form Penarikan Koin / Saldo Santri
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
          {/* Left Column: Pilih / Cari Santri */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <div className="form-group flex flex-col gap-2.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                Pilih Santri (NIS / Nama)
              </label>
              <select
                value={selectedNis}
                onChange={(e) => setSelectedNis(e.target.value)}
                className="w-full h-11 px-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:border-emerald-600 cursor-pointer"
              >
                {mockSantriOptions.map((s) => (
                  <option key={s.nis} value={s.nis}>
                    {s.nis} - {s.nama} (Saldo: Rp {formatRupiah(s.saldo)})
                  </option>
                ))}
              </select>
            </div>

            {/* Info Card Santri Terpilih dengan Foto Santri */}
            <div className="santri-preview-box flex-wrap sm:flex-nowrap gap-4">
              <div className="flex items-center gap-3.5">
                {/* Foto Profil Santri */}
                <div className="relative shrink-0">
                  <img
                    src={activeSantri.foto}
                    alt={activeSantri.nama}
                    className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl object-cover border-2 border-emerald-600/40 dark:border-emerald-400/40 shadow-xs ring-4 ring-emerald-50 dark:ring-emerald-950/40"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(activeSantri.nama)}&background=0e5d26&color=fff&bold=true`;
                    }}
                  />
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
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                Pilih Nominal Penarikan (Cepat)
              </label>
              <div className="grid grid-cols-5 gap-3 max-w-lg sm:max-w-xl">
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
          </div>
        </div>

        {/* Action Button Row dengan Border Top & Spacing Lega */}
        <div className="staff-withdrawal-footer">
          <button type="submit" className="btn-process-withdrawal">
            <span>⚡ Proses Penarikan Koin</span>
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
                  <img
                    src={lastTxData.fotoSantri || activeSantri.foto}
                    alt={lastTxData.namaSantri}
                    className="w-7 h-7 rounded-full object-cover border border-emerald-500/40 shrink-0"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(lastTxData.namaSantri)}&background=0e5d26&color=fff&bold=true`;
                    }}
                  />
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
                <span className="success-modal-label">Staff Kasir:</span>
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
    </div>
  );
};

export default StaffCoinWithdrawalForm;
