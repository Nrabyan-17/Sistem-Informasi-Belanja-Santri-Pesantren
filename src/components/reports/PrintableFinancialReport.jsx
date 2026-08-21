import React from 'react';
import logoPesantren from '../../assets/logo-pesantren.png';

const formatRupiah = (val) => {
  return 'Rp ' + new Intl.NumberFormat('id-ID').format(Math.abs(val || 0));
};

const PrintableFinancialReport = ({
  selectedMonth,
  totalSaldoAktif = 0,
  activeMonthReport = {},
  rows = [],
}) => {
  const currentDate = new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date());

  const currentTime = new Intl.DateTimeFormat('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date());

  const totalMasukAll = rows.reduce((acc, curr) => acc + Number(curr.totalMasuk || 0), 0);
  const totalKeluarAll = rows.reduce((acc, curr) => acc + Number(curr.totalKeluar || 0), 0);
  const totalNetAll = rows.reduce((acc, curr) => acc + Number(curr.net || 0), 0);
  const totalTrxAll = rows.reduce((acc, curr) => acc + Number(curr.jmlTrx || 0), 0);

  return (
    <div className="printable-report-document bg-white text-slate-900 p-4 max-w-4xl mx-auto">
      {/* 1. KOP SURAT RESMI */}
      <div className="flex items-center gap-5 border-b-4 border-emerald-900 pb-4 mb-5">
        <img
          src={logoPesantren}
          alt="Logo Pesantren"
          className="w-20 h-20 object-contain shrink-0 mix-blend-multiply"
        />
        <div className="flex-1 text-center pr-12">
          <h2 className="text-xl font-bold uppercase tracking-wider text-emerald-950">
            YAYASAN PONDOK PESANTREN NAZHATUT THULLAB
          </h2>
          <h3 className="text-sm font-extrabold tracking-wide uppercase text-slate-800 mt-0.5">
            BAGIAN ADMINISTRASI KEUANGAN (BAK) &amp; RUMAH KOIN
          </h3>
          <p className="text-xs text-slate-600 mt-1 font-sans">
            Jl. Raya Camplong No. 45, Prajjan, Camplong, Sampang, Madura - Jawa Timur 69281
          </p>
          <p className="text-[11px] text-slate-500 font-sans">
            Telepon/Helpdesk: (0323) 456789 | Email: keuangan@nazhatutthullab.sch.id
          </p>
        </div>
      </div>

      {/* 2. JUDUL DOKUMEN LAPORAN */}
      <div className="text-center mb-6">
        <h1 className="text-base font-extrabold uppercase tracking-wide text-slate-900 underline underline-offset-4">
          LAPORAN PERTANGGUNGJAWABAN ARUS KAS SANTRI
        </h1>
        <p className="text-xs text-slate-600 font-sans mt-1.5">
          Periode Rekapitulasi: <strong>{selectedMonth || 'Semua Periode'}</strong> | No. Dokumen: <strong>LPJ/BAK-NT/{new Date().getMonth() + 1}/{new Date().getFullYear()}</strong>
        </p>
      </div>

      {/* 3. INFORMASI METADATA CETAK */}
      <div className="bg-slate-50 border border-slate-300 rounded-lg p-3.5 mb-6 text-xs font-sans flex justify-between items-center">
        <div>
          <p><span className="text-slate-500">Tanggal Dicetak:</span> <strong>{currentDate}</strong> pukul {currentTime} WIB</p>
          <p><span className="text-slate-500">Dicetak Oleh:</span> <strong>Administrator Sistem (BAK Pesantren)</strong></p>
        </div>
        <div className="text-right">
          <p><span className="text-slate-500">Status Dokumen:</span> <strong className="text-emerald-700">RESMI &amp; TERVERIFIKASI</strong></p>
          <p><span className="text-slate-500">Sistem Operasional:</span> Sistem Belanja Santri &amp; Rumah Koin</p>
        </div>
      </div>

      {/* 4. EXECUTIVE SUMMARY (RINGKASAN EKSEKUTIF PERIODE TERPILIH) */}
      <div className="mb-6">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 font-sans">
          I. Ringkasan Eksekutif Keuangan ({selectedMonth || 'Bulan Ini'})
        </h4>
        <table className="w-full text-xs font-sans border-collapse border border-slate-300 mb-4">
          <tbody>
            <tr className="bg-slate-100/80">
              <td className="border border-slate-300 p-2.5 font-bold text-slate-700 w-1/2">Total Saldo Simpanan Santri Aktif</td>
              <td className="border border-slate-300 p-2.5 font-bold text-emerald-800 text-right">{formatRupiah(totalSaldoAktif)}</td>
            </tr>
            <tr>
              <td className="border border-slate-300 p-2.5 text-slate-600">Total Pemasukan / Top Up VA BNI ({selectedMonth})</td>
              <td className="border border-slate-300 p-2.5 text-emerald-700 font-semibold text-right">+{formatRupiah(activeMonthReport?.totalMasuk || 0)}</td>
            </tr>
            <tr>
              <td className="border border-slate-300 p-2.5 text-slate-600">Total Pengeluaran / Tarik Koin Santri ({selectedMonth})</td>
              <td className="border border-slate-300 p-2.5 text-rose-700 font-semibold text-right">-{formatRupiah(activeMonthReport?.totalKeluar || 0)}</td>
            </tr>
            <tr className="bg-emerald-50/50">
              <td className="border border-slate-300 p-2.5 font-bold text-slate-800">Selisih Arus Kas Bersih (Net Cash Flow)</td>
              <td className="border border-slate-300 p-2.5 font-extrabold text-slate-900 text-right">
                {Number(activeMonthReport?.net || 0) >= 0 ? '+' : '-'}
                {formatRupiah(activeMonthReport?.net || 0)}
              </td>
            </tr>
            <tr>
              <td className="border border-slate-300 p-2.5 text-slate-600">Frekuensi Mutasi Transaksi</td>
              <td className="border border-slate-300 p-2.5 font-semibold text-right">{activeMonthReport?.jmlTrx || 0} Transaksi</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* 5. TABEL RINCIAN PERIODE LENGKAP */}
      <div className="mb-8">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 font-sans">
          II. Rincian Rekapitulasi Keuangan Per Periode
        </h4>
        <table className="w-full text-[11px] font-sans border-collapse border border-slate-300">
          <thead>
            <tr className="bg-slate-200 text-slate-800 font-bold uppercase text-[10px]">
              <th className="border border-slate-300 p-2 text-center w-8">No</th>
              <th className="border border-slate-300 p-2 text-left">Periode</th>
              <th className="border border-slate-300 p-2 text-right">Total Masuk</th>
              <th className="border border-slate-300 p-2 text-right">Total Keluar</th>
              <th className="border border-slate-300 p-2 text-right">Selisih (Net)</th>
              <th className="border border-slate-300 p-2 text-center">Jumlah Trx</th>
              <th className="border border-slate-300 p-2 text-left">Petugas Staff</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => (
              <tr key={row.periode || idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/70'}>
                <td className="border border-slate-300 p-2 text-center font-medium">{idx + 1}</td>
                <td className="border border-slate-300 p-2 font-semibold text-slate-800">{row.periode}</td>
                <td className="border border-slate-300 p-2 text-right text-emerald-700 font-medium">+{formatRupiah(row.totalMasuk)}</td>
                <td className="border border-slate-300 p-2 text-right text-rose-700 font-medium">-{formatRupiah(row.totalKeluar)}</td>
                <td className="border border-slate-300 p-2 text-right font-bold text-slate-900">{formatRupiah(row.net)}</td>
                <td className="border border-slate-300 p-2 text-center font-medium">{row.jmlTrx} trx</td>
                <td className="border border-slate-300 p-2 text-slate-700">{row.staff}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-slate-100 font-bold border-t-2 border-slate-400">
              <td colSpan="2" className="border border-slate-300 p-2.5 text-center uppercase tracking-wider">
                Total Akumulasi
              </td>
              <td className="border border-slate-300 p-2.5 text-right text-emerald-800">+{formatRupiah(totalMasukAll)}</td>
              <td className="border border-slate-300 p-2.5 text-right text-rose-800">-{formatRupiah(totalKeluarAll)}</td>
              <td className="border border-slate-300 p-2.5 text-right text-slate-950 font-extrabold">{formatRupiah(totalNetAll)}</td>
              <td className="border border-slate-300 p-2.5 text-center">{totalTrxAll} trx</td>
              <td className="border border-slate-300 p-2.5 text-center text-slate-500 italic">Terverifikasi Database</td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* 6. LEMBAR PENGESAHAN & TANDA TANGAN */}
      <div className="font-sans text-xs mt-10 pt-4 border-t border-slate-300">
        <div className="flex justify-between items-start text-center">
          <div className="w-56">
            <p className="text-slate-500 mb-1">Mengetahui,</p>
            <p className="font-bold text-slate-800">Petugas Kasir Rumah Koin</p>
            <div className="h-20 flex items-center justify-center text-slate-300 italic text-[10px]">
              (Tanda Tangan &amp; Stempel)
            </div>
            <p className="font-extrabold text-slate-900 underline">Ust. Miftahul Huda</p>
            <p className="text-[10px] text-slate-500">NIP. 202208002</p>
          </div>

          <div className="w-64">
            <p className="text-slate-500 mb-1">Sampang, {currentDate}</p>
            <p className="font-bold text-slate-800">Kepala Bagian Keuangan (BAK)</p>
            <div className="h-20 flex items-center justify-center text-slate-300 italic text-[10px]">
              (Tanda Tangan &amp; Stempel)
            </div>
            <p className="font-extrabold text-slate-900 underline">Ustadzah Ina Wahdiah</p>
            <p className="text-[10px] text-slate-500">NIP. 202105001</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrintableFinancialReport;
