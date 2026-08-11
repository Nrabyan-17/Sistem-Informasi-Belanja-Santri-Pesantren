import { useState } from 'react';
import WaliLayout from '../components/layout/WaliLayout';

const WaliSaldoPage = () => {
  const [copied, setCopied] = useState(false);

  const vaNumber = '8808 0990 1234 5678';

  const handleCopyVA = () => {
    navigator.clipboard?.writeText(vaNumber.replace(/\s+/g, ''));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    alert(`✅ Nomor VA ${vaNumber} berhasil disalin!`);
  };

  return (
    <WaliLayout pageTitle="Saldo &amp; Cara Pembayaran">
      <div className="wali-saldo-page flex flex-col gap-5">
        <div className="wali-header-subtitle text-sm text-slate-500 -mt-3 mb-2 font-medium">
          Pondok Pesantren Nazhatut Thullab
        </div>

        <div className="wali-grid grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Kolom Kiri: Card Santri + Saldo + Statistik + Info */}
          <div className="wali-left-col lg:col-span-7 flex flex-col gap-6">
            {/* Banner Dark Green */}
            <div className="wali-santri-banner bg-gradient-to-br from-emerald-900 to-emerald-700 rounded-3xl p-7 text-white shadow-xl">
              <div className="wali-santri-profile flex items-center gap-4 mb-6">
                <div className="wali-avatar w-14 h-14 rounded-full bg-white/20 border-2 border-white/40 flex items-center justify-center text-2xl shadow-inner">
                  👤
                </div>
                <div className="wali-santri-meta">
                  <h2 className="wali-santri-name text-2xl font-extrabold text-white tracking-tight">Ahmad Fauzi</h2>
                  <p className="wali-santri-nis text-xs text-emerald-100 font-medium mt-0.5">NIS: 2024001</p>
                </div>
              </div>

              {/* White Overlay Card Sisa Saldo */}
              <div className="wali-saldo-card bg-white rounded-2xl p-6 text-slate-800 shadow-lg">
                <span className="wali-saldo-label text-[11px] font-bold tracking-wider text-slate-400 uppercase">
                  SISA SALDO UANG JAJAN
                </span>
                <div className="wali-saldo-amount text-3xl sm:text-4xl font-extrabold text-slate-900 my-1.5 tracking-tight">
                  Rp 350.000
                </div>
                <div className="wali-saldo-updated text-xs text-slate-400 font-medium">
                  Diperbarui Senin, 1 Agustus 2026 - 09:58 WIB
                </div>
              </div>
            </div>

            {/* Statistik Agustus 2026 */}
            <div className="wali-stats-section flex flex-col gap-3">
              <h3 className="wali-section-title text-base font-bold text-slate-800">Statistik Agustus 2026</h3>
              <div className="wali-stats-grid grid grid-cols-2 gap-4">
                <div className="wali-stat-box bg-emerald-50 border border-emerald-200 rounded-2xl p-5 flex flex-col gap-1">
                  <span className="wali-stat-label text-xs font-semibold text-slate-500">Total Isi</span>
                  <span className="wali-stat-val text-xl font-extrabold text-emerald-600">Rp 200.000</span>
                </div>
                <div className="wali-stat-box bg-amber-50 border border-amber-200 rounded-2xl p-5 flex flex-col gap-1">
                  <span className="wali-stat-label text-xs font-semibold text-slate-500">Total Tarik</span>
                  <span className="wali-stat-val text-xl font-extrabold text-amber-600">Rp 90.000</span>
                </div>
              </div>
            </div>

            {/* Info Cara Kerja */}
            <div className="wali-info-box bg-emerald-50/80 border border-emerald-200 rounded-2xl p-5 flex gap-3.5 items-start text-xs sm:text-sm text-slate-700 leading-relaxed shadow-xs">
              <div className="wali-info-icon text-lg shrink-0">ℹ️</div>
              <div className="wali-info-text">
                <strong className="text-slate-900 font-bold">Cara Kerja Sistem Koin:</strong> Santri dapat menarik koin senilai <strong className="text-slate-900 font-bold">Rp 30.000</strong> per hari di loket Rumah Koin. Saldo bertambah otomatis setelah Wali Santri transfer ke nomor VA Jajan di sebelah kanan.
              </div>
            </div>
          </div>

          {/* Kolom Kanan: Card Virtual Account */}
          <div className="wali-right-col lg:col-span-5 flex flex-col gap-6">
            <div className="wali-va-card bg-white rounded-3xl p-7 border border-slate-200 shadow-xs flex flex-col gap-5">
              <div className="wali-va-header flex justify-between items-start">
                <div>
                  <h3 className="wali-va-title text-sm font-extrabold text-slate-800 tracking-wider">
                    VIRTUAL ACCOUNT — UANG JAJAN
                  </h3>
                  <p className="wali-va-subtitle text-xs text-slate-500 mt-1">
                    Transfer ke sini untuk isi saldo harian Ahmad Fauzi
                  </p>
                </div>
                <span className="wali-bni-badge bg-slate-100 border border-slate-300 text-slate-800 font-extrabold text-xs px-3 py-1 rounded-lg">
                  BNI
                </span>
              </div>

              {/* Box Nomor VA */}
              <div className="wali-va-box bg-slate-50 border border-slate-200 rounded-2xl p-5 text-center flex flex-col gap-1.5">
                <span className="wali-va-box-label text-[11px] font-bold tracking-wider text-slate-400 uppercase">
                  Nomor Virtual Account
                </span>
                <div className="wali-va-number text-2xl font-extrabold tracking-widest text-emerald-800 font-mono my-1">
                  {vaNumber}
                </div>
                <span className="wali-va-an text-xs text-slate-500 font-medium">
                  a.n. Ahmad Fauzi - PP Nazhatut Thullab
                </span>
              </div>

              {/* 3 Detail Info */}
              <div className="wali-va-details grid grid-cols-3 gap-2 bg-slate-50 p-3 rounded-xl text-center">
                <div className="wali-va-detail-item">
                  <span className="detail-label text-[10px] font-bold text-slate-400 uppercase tracking-wider block">MIN TRANSFER</span>
                  <span className="detail-val text-xs font-bold text-slate-800 mt-0.5 block">Rp 10.000</span>
                </div>
                <div className="wali-va-detail-item">
                  <span className="detail-label text-[10px] font-bold text-slate-400 uppercase tracking-wider block">PROSES</span>
                  <span className="detail-val text-xs font-bold text-slate-800 mt-0.5 block">Otomatis</span>
                </div>
                <div className="wali-va-detail-item">
                  <span className="detail-label text-[10px] font-bold text-slate-400 uppercase tracking-wider block">BANK</span>
                  <span className="detail-val text-xs font-bold text-slate-800 mt-0.5 block">BNI</span>
                </div>
              </div>

              {/* Tombol Salin */}
              <button
                className="wali-copy-btn w-full py-3.5 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-xl text-sm shadow-md shadow-emerald-900/10 transition-all cursor-pointer"
                onClick={handleCopyVA}
              >
                {copied ? '✅ VA Disalin!' : '📋 Salin Nomor VA Jajan'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </WaliLayout>
  );
};

export default WaliSaldoPage;
