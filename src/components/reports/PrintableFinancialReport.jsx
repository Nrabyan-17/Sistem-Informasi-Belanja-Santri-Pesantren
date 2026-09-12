import React, { useState, useEffect } from 'react';
import { reportApi } from '../../utils/api';
import logoPesantren from '../../assets/logo-pesantren.png';

const PrintableFinancialReport = ({
  selectedMonth,
  totalSaldoAktif = 0,
  activeMonthReport = null,
  rows = [],
}) => {
  const [transactionDetails, setTransactionDetails] = useState([]);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const formatRupiah = (val) => new Intl.NumberFormat('id-ID').format(Math.abs(val || 0));

  const currentDate = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const currentTime = new Date().toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
  });

  useEffect(() => {
    const monthCode = activeMonthReport?.bulan || rows.find((r) => r.periode === selectedMonth)?.bulan;
    if (monthCode) {
      setLoadingDetails(true);
      reportApi
        .financial(monthCode)
        .then((res) => {
          setTransactionDetails(res?.detail?.data || []);
        })
        .catch(() => setTransactionDetails([]))
        .finally(() => setLoadingDetails(false));
    }
  }, [selectedMonth, activeMonthReport, rows]);

  const totalMasukAll = rows.reduce((acc, curr) => acc + Number(curr.totalMasuk || 0), 0);
  const totalKeluarAll = rows.reduce((acc, curr) => acc + Number(curr.totalKeluar || 0), 0);
  const totalNetAll = totalMasukAll - totalKeluarAll;
  const totalTrxAll = rows.reduce((acc, curr) => acc + Number(curr.jmlTrx || 0), 0);

  const detailMasukSum = transactionDetails
    .filter((t) => Number(t.nominal) > 0 || t.tipe === 'topup' || t.tipe === 'bni')
    .reduce((acc, t) => acc + Math.abs(Number(t.nominal)), 0);

  const detailKeluarSum = transactionDetails
    .filter((t) => Number(t.nominal) < 0 && t.tipe !== 'topup' && t.tipe !== 'bni')
    .reduce((acc, t) => acc + Math.abs(Number(t.nominal)), 0);

  const detailNetSum = detailMasukSum - detailKeluarSum;

  return (
    <div className="printable-report-wrapper hidden print:block bg-white text-slate-900 p-8 max-w-4xl mx-auto font-sans leading-relaxed">
      {/* 1. KOP SURAT RESMI PESANTREN */}
      <div className="flex items-center justify-between pb-4 mb-5 border-b-2 border-emerald-800">
        <div className="w-24 flex-shrink-0 text-left">
          <img
            src={logoPesantren}
            alt="Logo Pesantren Nazhatut Thullab"
            className="h-20 w-auto object-contain"
          />
        </div>
        <div className="flex-1 text-center px-2">
          <h2 className="text-lg font-black tracking-wide text-emerald-800 uppercase">
            YAYASAN PONDOK PESANTREN NAZHATUT THULLAB
          </h2>
          <h3 className="text-sm font-extrabold tracking-wide uppercase text-slate-900 mt-0.5">
            BAGIAN ADMINISTRASI KEUANGAN (BAK) &amp; RUMAH KOIN
          </h3>
          <p className="text-xs text-slate-600 mt-1">
            Jl. Raya Camplong No. 45, Prajjan, Camplong, Sampang, Madura - Jawa Timur 69281
          </p>
          <p className="text-[11px] text-slate-500">
            Telepon/Helpdesk: (0323) 456789 | Email: keuangan@nazhatutthullab.sch.id
          </p>
        </div>
        <div className="w-24 flex-shrink-0"></div>
      </div>

      {/* 2. JUDUL DOKUMEN LAPORAN */}
      <div className="text-center mb-6">
        <h1 className="text-base font-extrabold uppercase tracking-wide text-slate-900 underline underline-offset-4">
          LAPORAN PERTANGGUNGJAWABAN ARUS KAS SANTRI
        </h1>
        <p className="text-xs text-slate-600 mt-1.5 font-semibold">
          Periode Rekapitulasi: <strong>{selectedMonth || 'Semua Periode'}</strong> | No. Dokumen: <strong>LPJ/BAK-NT/{new Date().getMonth() + 1}/{new Date().getFullYear()}</strong>
        </p>
      </div>

      {/* 3. INFORMASI METADATA CETAK */}
      <div className="bg-slate-50 border border-slate-300 rounded-lg p-3 mb-6 text-xs flex justify-between items-center">
        <div>
          <p><span className="text-slate-500">Tanggal Dicetak:</span> <strong>{currentDate}</strong> pukul {currentTime} WIB</p>
          <p><span className="text-slate-500">Dicetak Oleh:</span> <strong>Manajer BAK / Rumah Koin</strong></p>
        </div>
        <div className="text-right">
          <p><span className="text-slate-500">Status Dokumen:</span> <strong className="text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300">RESMI &amp; TERVERIFIKASI</strong></p>
          <p><span className="text-slate-500 mt-1 block">Sistem Operasional: Sistem Belanja Santri &amp; Rumah Koin</span></p>
        </div>
      </div>

      {/* 4. I. RINGKASAN EKSEKUTIF KEUANGAN */}
      <div className="mb-7">
        <div className="bg-slate-200 border border-slate-300 px-3 py-2 font-bold text-xs text-slate-900 uppercase tracking-wide">
          I. Ringkasan Eksekutif Keuangan ({selectedMonth || 'Bulan Ini'})
        </div>
        <table className="w-full text-xs border-collapse border border-slate-300 border-t-0">
          <tbody>
            <tr className="bg-white">
              <td className="border border-slate-300 p-2.5 font-bold text-slate-800 w-1/2">Total Saldo Simpanan Santri Aktif</td>
              <td className="border border-slate-300 p-2.5 font-bold text-emerald-800 text-right">Rp {formatRupiah(totalSaldoAktif)}</td>
            </tr>
            <tr className="bg-slate-50">
              <td className="border border-slate-300 p-2.5 text-slate-700">Total Pemasukan / Top Up VA BNI ({selectedMonth})</td>
              <td className="border border-slate-300 p-2.5 text-emerald-700 font-bold text-right">+{formatRupiah(activeMonthReport?.totalMasuk || 0)}</td>
            </tr>
            <tr className="bg-white">
              <td className="border border-slate-300 p-2.5 text-slate-700">Total Pengeluaran / Tarik Koin Santri ({selectedMonth})</td>
              <td className="border border-slate-300 p-2.5 text-rose-700 font-bold text-right">-{formatRupiah(activeMonthReport?.totalKeluar || 0)}</td>
            </tr>
            <tr className="bg-slate-50 font-bold">
              <td className="border border-slate-300 p-2.5 text-slate-900">Selisih Arus Kas Bersih (Net Cash Flow)</td>
              <td className="border border-slate-300 p-2.5 font-extrabold text-slate-900 text-right">
                {Number(activeMonthReport?.net || 0) >= 0 ? '+Rp ' : '-Rp '}
                {formatRupiah(activeMonthReport?.net || 0)}
              </td>
            </tr>
            <tr className="bg-white">
              <td className="border border-slate-300 p-2.5 text-slate-700">Frekuensi Mutasi Transaksi</td>
              <td className="border border-slate-300 p-2.5 font-semibold text-right">{activeMonthReport?.jmlTrx || 0} Transaksi</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* 5. II. RINCIAN REKAPITULASI KEUANGAN PER PERIODE */}
      <div className="mb-7">
        <div className="bg-slate-200 border border-slate-300 px-3 py-2 font-bold text-xs text-slate-900 uppercase tracking-wide">
          II. Rincian Rekapitulasi Keuangan Per Periode
        </div>
        <table className="w-full text-[11px] border-collapse border border-slate-300 border-t-0">
          <thead>
            <tr className="bg-slate-200 text-slate-900 font-bold uppercase text-[10px]">
              <th className="border border-slate-300 p-2.5 text-center w-8">No</th>
              <th className="border border-slate-300 p-2.5 text-left">Periode</th>
              <th className="border border-slate-300 p-2.5 text-right">Total Masuk</th>
              <th className="border border-slate-300 p-2.5 text-right">Total Keluar</th>
              <th className="border border-slate-300 p-2.5 text-right">Selisih (Net)</th>
              <th className="border border-slate-300 p-2.5 text-center">Jumlah Trx</th>
              <th className="border border-slate-300 p-2.5 text-left">Petugas Staff</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => (
              <tr key={row.periode || idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                <td className="border border-slate-300 p-2 text-center font-medium">{idx + 1}</td>
                <td className="border border-slate-300 p-2 font-semibold text-slate-800">{row.periode}</td>
                <td className="border border-slate-300 p-2 text-right text-emerald-700 font-semibold">+{formatRupiah(row.totalMasuk)}</td>
                <td className="border border-slate-300 p-2 text-right text-rose-700 font-semibold">-{formatRupiah(row.totalKeluar)}</td>
                <td className="border border-slate-300 p-2 text-right font-bold text-slate-900">
                  {Number(row.net || 0) >= 0 ? 'Rp ' : '-Rp '}
                  {formatRupiah(row.net)}
                </td>
                <td className="border border-slate-300 p-2 text-center font-medium">{row.jmlTrx} trx</td>
                <td className="border border-slate-300 p-2 text-slate-700">
                  {(!row.staff || row.staff === 'Staff Rumah Koin' || String(row.staff).toLowerCase().includes('staff'))
                    ? 'Manajer BAK / Rumah Koin'
                    : row.staff}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-slate-100 font-bold">
              <td colSpan="2" className="border border-slate-300 p-2.5 text-center uppercase tracking-wider">
                Total Akumulasi
              </td>
              <td className="border border-slate-300 p-2.5 text-right text-emerald-800">+{formatRupiah(totalMasukAll)}</td>
              <td className="border border-slate-300 p-2.5 text-right text-rose-800">-{formatRupiah(totalKeluarAll)}</td>
              <td className="border border-slate-300 p-2.5 text-right text-slate-950 font-extrabold">
                {totalNetAll >= 0 ? 'Rp ' : '-Rp '}
                {formatRupiah(totalNetAll)}
              </td>
              <td className="border border-slate-300 p-2.5 text-center">{totalTrxAll} trx</td>
              <td className="border border-slate-300 p-2.5 text-center text-slate-500 italic text-[10px]">Terverifikasi Database</td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* 6. III. RINCIAN PEMASUKAN DAN PENGAMBILAN */}
      <div className="mb-8">
        <div className="bg-slate-200 border border-slate-300 px-3 py-2 font-bold text-xs text-slate-900 uppercase tracking-wide">
          III. Rincian Pemasukan Dan Pengambilan ({selectedMonth || 'Bulan Ini'})
        </div>
        <table className="w-full text-[10px] border-collapse border border-slate-300 border-t-0">
          <thead>
            <tr className="bg-slate-200 text-slate-900 font-bold uppercase text-[9.5px]">
              <th className="border border-slate-300 p-2 text-center w-8">No</th>
              <th className="border border-slate-300 p-2 text-left">Tanggal &amp; Waktu</th>
              <th className="border border-slate-300 p-2 text-left">Santri</th>
              <th className="border border-slate-300 p-2 text-center">Jenis</th>
              <th className="border border-slate-300 p-2 text-right">Pemasukan (+Rp)</th>
              <th className="border border-slate-300 p-2 text-right">Pengambilan (-Rp)</th>
              <th className="border border-slate-300 p-2 text-left">Keterangan / Petugas</th>
            </tr>
          </thead>
          <tbody>
            {loadingDetails ? (
              <tr>
                <td colSpan="7" className="border border-slate-300 p-4 text-center text-slate-500 italic">
                  Memuat rincian mutasi transaksi...
                </td>
              </tr>
            ) : transactionDetails.length > 0 ? (
              transactionDetails.map((t, idx) => {
                const isMasuk = Number(t.nominal) > 0 || t.tipe === 'topup' || t.tipe === 'bni';
                const absNominal = Math.abs(Number(t.nominal));

                return (
                  <tr key={t.id || idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                    <td className="border border-slate-300 p-1.5 text-center font-medium">{idx + 1}</td>
                    <td className="border border-slate-300 p-1.5 whitespace-nowrap">
                      {t.created_at ? new Date(t.created_at).toLocaleString('id-ID', {
                        day: '2-digit', month: '2-digit', year: 'numeric',
                        hour: '2-digit', minute: '2-digit'
                      }) : '-'}
                    </td>
                    <td className="border border-slate-300 p-1.5">
                      <strong className="text-slate-900">{t.santri?.nama || '-'}</strong>
                      <br /><span className="text-[9px] text-slate-500">NIS: {t.santri?.nis || '-'}</span>
                    </td>
                    <td className="border border-slate-300 p-1.5 text-center">
                      {isMasuk ? (
                        <span className="px-1.5 py-0.5 rounded text-[8.5px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                          PEMASUKAN
                        </span>
                      ) : (
                        <span className="px-1.5 py-0.5 rounded text-[8.5px] font-bold bg-red-100 text-red-800 border border-red-300">
                          PENGAMBILAN
                        </span>
                      )}
                    </td>
                    <td className="border border-slate-300 p-1.5 text-right font-bold text-emerald-700">
                      {isMasuk ? `+Rp ${formatRupiah(absNominal)}` : '-'}
                    </td>
                    <td className="border border-slate-300 p-1.5 text-right font-bold text-rose-700">
                      {!isMasuk ? `-Rp ${formatRupiah(absNominal)}` : '-'}
                    </td>
                    <td className="border border-slate-300 p-1.5">
                      <div>{t.keterangan || '-'}</div>
                      <span className="text-[9px] text-slate-500">Petugas: {t.creator?.name || 'Sistem'}</span>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="7" className="border border-slate-300 p-4 text-center text-slate-500 italic">
                  Tidak ada rincian transaksi mutasi pada periode ini.
                </td>
              </tr>
            )}
          </tbody>
          {transactionDetails.length > 0 && (
            <tfoot>
              <tr className="bg-slate-100 font-bold">
                <td colSpan="4" className="border border-slate-300 p-2 text-center uppercase">
                  Subtotal Rincian Mutasi ({transactionDetails.length} Transaksi)
                </td>
                <td className="border border-slate-300 p-2 text-right text-emerald-800">+Rp {formatRupiah(detailMasukSum)}</td>
                <td className="border border-slate-300 p-2 text-right text-rose-800">-Rp {formatRupiah(detailKeluarSum)}</td>
                <td className="border border-slate-300 p-2 text-left text-slate-900 text-[9px]">
                  Net: {detailNetSum >= 0 ? '+Rp ' : '-Rp '}{formatRupiah(detailNetSum)}
                </td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      {/* 7. LEMBAR PENGESAHAN & TANDA TANGAN */}
      <div className="font-sans text-xs mt-10 pt-4 border-t border-slate-300 break-inside-avoid">
        <div className="flex justify-between items-start text-center">
          <div className="w-64">
            <p className="text-slate-500 mb-1">Mengetahui,</p>
            <p className="font-bold text-slate-800">Petugas Kasir Rumah Koin</p>
            <div className="h-16 flex items-center justify-center text-slate-300 italic text-[10px]">
              (Tanda Tangan &amp; Stempel)
            </div>
            <p className="font-extrabold text-slate-900 underline">Ust. Miftahul Huda</p>
            <p className="text-[10px] text-slate-500">NIP. 202208002</p>
          </div>

          <div className="w-64">
            <p className="text-slate-500 mb-1">Sampang, {currentDate}</p>
            <p className="font-bold text-slate-800">Kepala Bagian Keuangan (BAK)</p>
            <div className="h-16 flex items-center justify-center text-slate-300 italic text-[10px]">
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
