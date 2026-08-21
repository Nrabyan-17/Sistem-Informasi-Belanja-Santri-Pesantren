import { useState, useEffect } from 'react';
import WaliLayout from '../components/layout/WaliLayout';
import { waliApi } from '../utils/api';
import { usePopup } from '../context/PopupContext';
import { getSantriSaldos } from '../utils/saldoStorage';

const getInitials = (name) => {
  if (!name) return 'S';
  const parts = name.trim().split(' ');
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  return name.slice(0, 2).toUpperCase();
};

const WaliSaldoPage = () => {
  const { showPopup } = usePopup();
  const [copied, setCopied] = useState(false);
  const [santri, setSantri] = useState(null);
  const [stats, setStats] = useState({ total_isi: 0, total_tarik: 0 });
  const [error, setError] = useState('');

  useEffect(() => {
    waliApi
      .dashboard()
      .then((res) => {
        const rawSantri = res.santri_terpilih || null;
        if (rawSantri) {
          const localSaldos = getSantriSaldos();
          const overrideSaldo = localSaldos[rawSantri.id] !== undefined
            ? localSaldos[rawSantri.id]
            : (localSaldos[rawSantri.nis] !== undefined ? localSaldos[rawSantri.nis] : rawSantri.saldo);
          setSantri({ ...rawSantri, saldo: Number(overrideSaldo !== undefined ? overrideSaldo : 0) });
        } else {
          setSantri(null);
        }
        setStats(res.statistik || { total_isi: 0, total_tarik: 0 });
      })
      .catch((e) => setError(e.message || 'Gagal memuat data saldo.'));
  }, []);

  const vaNumber = santri?.va_jajan || '—';

  const [isCopyModalOpen, setIsCopyModalOpen] = useState(false);

  const handleCopyVA = () => {
    if (!santri?.va_jajan) return;
    navigator.clipboard?.writeText(vaNumber.replace(/\s+/g, ''));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    setIsCopyModalOpen(true);
  };

  return (
    <WaliLayout pageTitle="Saldo &amp; Cara Pembayaran">
      <div className="wali-saldo-page flex flex-col gap-5">
        <div className="wali-header-subtitle text-base font-semibold text-slate-600 dark:text-slate-400 -mt-3 mb-2">
          Pondok Pesantren Nazhatut Thullab
        </div>

        {error && (
          <div className="px-4 py-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 rounded-2xl text-sm font-semibold text-rose-700 dark:text-rose-300">
            {error}
          </div>
        )}

        {!santri ? (
          <div className="flex items-center justify-center h-40 text-slate-500 dark:text-slate-400 font-medium">
            {error ? 'Belum ada santri yang terhubung ke akun ini.' : 'Memuat data saldo...'}
          </div>
        ) : (
          <div className="wali-grid grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Kolom Kiri: Card Santri + Saldo + Statistik + Info */}
            <div className="wali-left-col lg:col-span-7 flex flex-col gap-6">
              {/* Banner Dark Green */}
              <div className="wali-santri-banner bg-gradient-to-br from-emerald-900 to-emerald-700 dark:bg-none dark:bg-slate-800 dark:border dark:border-slate-700 rounded-3xl p-7 text-white shadow-xl dark:shadow-none">
                <div className="wali-santri-profile flex items-center gap-4 mb-6">
                  <div className="wali-avatar w-14 h-14 rounded-2xl bg-white/20 dark:bg-slate-700/80 border-2 border-white/40 dark:border-slate-600 flex items-center justify-center text-xl font-black text-white shadow-md tracking-wider shrink-0">
                    {getInitials(santri.nama)}
                  </div>
                  <div className="wali-santri-meta">
                    <h2 className="wali-santri-name text-2xl sm:text-3xl font-extrabold text-white tracking-tight">{santri.nama}</h2>
                    <p className="wali-santri-nis text-sm sm:text-base font-semibold text-emerald-100 dark:text-slate-300 mt-0.5">NIS: {santri.nis}</p>
                  </div>
                </div>

                {/* White Overlay Card Sisa Saldo */}
                <div className="wali-saldo-card bg-white dark:bg-slate-900 border dark:border-slate-700 rounded-2xl p-6 text-slate-800 dark:text-slate-100 shadow-lg">
                  <span className="wali-saldo-label text-xs sm:text-sm font-extrabold tracking-wider text-slate-500 dark:text-slate-400 uppercase">
                    SISA SALDO UANG JAJAN
                  </span>
                  <div className="wali-saldo-amount text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white my-1.5 tracking-tight">
                    Rp {(santri.saldo || 0).toLocaleString('id-ID')}
                  </div>
                  <div className="wali-saldo-updated text-sm font-medium text-slate-500 dark:text-slate-400">
                    Saldo terbaru dari sistem Rumah Koin
                  </div>
                </div>
              </div>

              {/* Statistik Keseluruhan */}
              <div className="wali-stats-section flex flex-col gap-3">
                <h3 className="wali-section-title text-lg font-extrabold text-slate-900 dark:text-slate-100">Statistik Keseluruhan</h3>
                <div className="wali-stats-grid grid grid-cols-2 gap-4">
                  <div className="wali-stat-box bg-emerald-50 dark:bg-slate-800 border border-emerald-200 dark:border-slate-700 rounded-2xl p-5 flex flex-col gap-1">
                    <span className="wali-stat-label text-sm font-bold text-slate-600 dark:text-slate-300">Total Isi</span>
                    <span className="wali-stat-val text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">Rp {(stats.total_isi || 0).toLocaleString('id-ID')}</span>
                  </div>
                  <div className="wali-stat-box bg-amber-50 dark:bg-slate-800 border border-amber-200 dark:border-slate-700 rounded-2xl p-5 flex flex-col gap-1">
                    <span className="wali-stat-label text-sm font-bold text-slate-600 dark:text-slate-300">Total Tarik</span>
                    <span className="wali-stat-val text-2xl sm:text-3xl font-extrabold text-amber-600 dark:text-amber-400">Rp {(stats.total_tarik || 0).toLocaleString('id-ID')}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Kolom Kanan: Card Virtual Account */}
            <div className="wali-right-col lg:col-span-5 flex flex-col gap-6">
              <div className="wali-va-card bg-white dark:bg-slate-800 rounded-3xl p-7 border border-slate-200 dark:border-slate-700 shadow-xs flex flex-col gap-5">
                <div className="wali-va-header flex justify-between items-start">
                  <div>
                    <h3 className="wali-va-title text-base sm:text-lg font-extrabold text-slate-900 dark:text-slate-100 tracking-wide">
                      VIRTUAL ACCOUNT — UANG JAJAN
                    </h3>
                    <p className="wali-va-subtitle text-sm font-medium text-slate-600 dark:text-slate-400 mt-1">
                      Transfer ke sini untuk isi saldo harian {santri.nama}
                    </p>
                  </div>
                  <span className="wali-bni-badge bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100 font-extrabold text-sm px-3.5 py-1.5 rounded-xl">
                    BNI
                  </span>
                </div>

                {/* Box Nomor VA */}
                <div className="wali-va-box bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 text-center flex flex-col gap-1.5">
                  <span className="wali-va-box-label text-xs sm:text-sm font-extrabold tracking-wider text-slate-500 dark:text-slate-400 uppercase">
                    Nomor Virtual Account BNI
                  </span>
                  <div className="wali-va-number text-2xl sm:text-3xl font-extrabold tracking-widest text-emerald-800 dark:text-emerald-400 font-mono my-1">
                    {vaNumber}
                  </div>
                  <span className="wali-va-an text-sm sm:text-base text-slate-700 dark:text-slate-300 font-semibold">
                    a.n. {santri.nama} - PP Nazhatut Thullab
                  </span>
                </div>

                {/* Tombol Salin */}
                <button
                  className="wali-copy-btn w-full py-4 bg-emerald-800 hover:bg-emerald-900 text-white font-extrabold rounded-xl text-base sm:text-lg shadow-md shadow-emerald-900/10 transition-all cursor-pointer disabled:opacity-50"
                  onClick={handleCopyVA}
                  disabled={!santri?.va_jajan}
                >
                  {copied ? 'Nomor VA Berhasil Disalin!' : 'Salin Nomor VA BNI'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* POP-UP MODAL SALIN VA BERHASIL (DESAIN PERSIS POP-UP BERHASIL TAMBAH DATA) */}
        {isCopyModalOpen && santri && (
          <div
            className="fixed inset-0 z-[99999] bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-fadeIn"
            onClick={() => setIsCopyModalOpen(false)}
          >
            <div
              className="modal-animate-pop bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl max-w-md w-full shadow-2xl relative text-center flex flex-col items-center transition-colors"
              style={{ padding: '36px 28px 28px 28px' }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Green Checkmark Badge Icon dengan Efek Ring & Bounce */}
              <div className="modal-badge-bounce w-20 h-20 min-w-[80px] min-h-[80px] rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 text-3xl font-extrabold flex items-center justify-center mx-auto mb-5 shadow-lg shadow-emerald-900/10 ring-8 ring-emerald-50 dark:ring-emerald-900/20">
                ✓
              </div>

              {/* Title & Subtitle */}
              <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight mb-2">
                Nomor VA Berhasil Disalin!
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed px-2 mb-6">
                Nomor Virtual Account telah disalin ke papan klip Anda. Silakan tempel pada aplikasi mobile banking atau ATM BNI.
              </p>

              {/* Detail Breakdown Card dengan Spacing Teratur */}
              <div className="w-full bg-slate-50 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700/80 rounded-2xl p-5 text-left flex flex-col gap-3 mb-6">
                <div className="flex justify-between items-center text-xs sm:text-sm py-0.5">
                  <span className="text-slate-500 dark:text-slate-400 font-semibold">Nama Santri:</span>
                  <strong className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                    {santri.nama}
                  </strong>
                </div>

                <div className="w-full h-px bg-slate-200/70 dark:bg-slate-700/70"></div>

                <div className="flex justify-between items-center text-xs sm:text-sm py-0.5">
                  <span className="text-slate-500 dark:text-slate-400 font-semibold">Metode:</span>
                  <span className="inline-block px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-extrabold text-xs">
                    BNI Virtual Account (Uang Jajan)
                  </span>
                </div>

                <div className="w-full h-px bg-slate-200/70 dark:bg-slate-700/70"></div>

                <div className="flex justify-between items-center text-xs sm:text-sm py-0.5">
                  <span className="text-slate-500 dark:text-slate-400 font-semibold">Nomor VA:</span>
                  <strong className="font-mono font-extrabold text-emerald-800 dark:text-emerald-400 text-sm sm:text-base tracking-wider bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-lg border border-emerald-200/60 dark:border-emerald-800/60">
                    {vaNumber}
                  </strong>
                </div>
              </div>

              {/* Button Selesai */}
              <button
                type="button"
                onClick={() => setIsCopyModalOpen(false)}
                className="w-full h-12 py-3 bg-[#0e5d26] hover:bg-[#0b471d] active:scale-[0.99] text-white font-extrabold rounded-xl text-sm shadow-lg shadow-emerald-950/20 transition-all cursor-pointer flex items-center justify-center"
              >
                Mengerti &amp; Tutup
              </button>
            </div>
          </div>
        )}
      </div>
    </WaliLayout>
  );
};

export default WaliSaldoPage;
