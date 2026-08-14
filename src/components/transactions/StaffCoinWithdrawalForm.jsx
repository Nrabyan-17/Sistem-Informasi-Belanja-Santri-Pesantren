import React, { useState } from 'react';

// Form Penarikan Koin / Saldo khusus Staff Rumah Koin
const mockSantriOptions = [
  { nis: '2024003', nama: 'Muhammad Rizki',  saldo: 150000 },
  { nis: '2024007', nama: 'Zainab Mustafa',   saldo: 95000 },
  { nis: '2024006', nama: 'Nurul Hidayah',   saldo: 120000 },
  { nis: '2024002', nama: 'Siti Nurhaliza',  saldo: 200000 },
  { nis: '2024001', nama: 'Ahmad Fauzi',     saldo: 80000 },
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
      <div className="card-header border-b border-slate-100 dark:border-slate-800 pb-4 mb-6 flex items-center justify-between flex-wrap gap-3">
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

      <form onSubmit={handleProcessWithdrawal} className="flex flex-col">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 items-start">
          {/* Left Column: Pilih / Cari Santri */}
          <div className="lg:col-span-5 flex flex-col gap-5">
            <div className="form-group flex flex-col gap-2">
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

            {/* Info Card Santri Terpilih */}
            <div className="santri-preview-box bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-xl p-4 sm:p-5 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-1">
                  INFO SANTRI TERPILIH
                </span>
                <h3 className="text-base font-extrabold text-slate-800 dark:text-slate-100">
                  {activeSantri.nama}
                </h3>
                <p className="text-xs font-mono text-slate-500 dark:text-slate-400 mt-0.5">
                  NIS: {activeSantri.nis}
                </p>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-1">
                  Sisa Saldo
                </span>
                <span className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400">
                  Rp {formatRupiah(activeSantri.saldo)}
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Nominal Penarikan & Action */}
          <div className="lg:col-span-7 flex flex-col gap-5">
            <div className="form-group flex flex-col gap-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                Pilih Nominal Penarikan (Cepat)
              </label>
              <div className="grid grid-cols-5 gap-2.5">
                {quickAmounts.map((amt) => (
                  <button
                    type="button"
                    key={amt}
                    onClick={() => setNominal(amt.toString())}
                    className={`py-2.5 px-1 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      nominal === amt.toString()
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
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

      {/* Pop-up Modal Sukses Penarikan */}
      {isSuccessModal && lastTxData && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-7 max-w-md w-full shadow-2xl text-center flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 text-3xl font-bold flex items-center justify-center mb-4">
              ✓
            </div>
            <h3 className="text-lg font-extrabold text-slate-900 dark:text-slate-100">
              Penarikan Koin Berhasil!
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5">
              Koin sebesar <strong className="text-emerald-700 dark:text-emerald-400">Rp {formatRupiah(lastTxData.nominal)}</strong> telah diserahkan kepada {lastTxData.namaSantri}.
            </p>
            <div className="w-full bg-slate-50 dark:bg-slate-800/80 rounded-xl p-4 my-5 text-xs space-y-2 text-left border border-slate-200/60 dark:border-slate-700/60">
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Santri:</span> <strong className="text-slate-800 dark:text-slate-200">{lastTxData.namaSantri} ({lastTxData.nis})</strong>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Sisa Saldo:</span> <strong className="text-emerald-600 dark:text-emerald-400">Rp {formatRupiah(lastTxData.sisaSaldo)}</strong>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Staff Kasir:</span> <span className="text-slate-700 dark:text-slate-300">{lastTxData.staff}</span>
              </div>
            </div>

            {/* Garis Pembatas Modal Pop-up */}
            <div className="w-full h-px bg-slate-200 dark:bg-slate-800 mb-5"></div>

            <button
              onClick={() => setIsSuccessModal(false)}
              className="w-full h-12 bg-[#0e5d26] hover:bg-[#0b471d] text-white font-extrabold rounded-xl text-sm shadow-md cursor-pointer flex items-center justify-center"
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
