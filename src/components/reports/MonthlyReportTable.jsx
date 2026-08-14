import React from 'react';

// Tabel Rekap Laporan Bulanan
const MonthlyReportTable = ({
  data = [],
  selectedMonth = 'Agustus 2025',
  onSelectMonth,
  onDownloadRowPDF,
  onDownloadRowExcel,
}) => {
  const formatRupiah = (val) => new Intl.NumberFormat('id-ID').format(val);

  return (
    <div className="rekap-report-card">
      <div className="rekap-report-header">
        <h3 className="rekap-report-title">Rekap Laporan Bulanan</h3>
        <p className="rekap-report-subtitle">
          Klik baris untuk pilih periode &middot; unduh PDF/Excel per bulan
        </p>
      </div>

      <div className="rekap-table-wrapper overflow-x-auto">
        <table className="rekap-table w-full">
          <thead>
            <tr>
              <th className="text-left">PERIODE</th>
              <th className="text-left">TOTAL MASUK</th>
              <th className="text-left">TOTAL KELUAR</th>
              <th className="text-left">NET</th>
              <th className="text-left">JML TRX</th>
              <th className="text-left">STATUS</th>
              <th className="text-center">AKSI</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row) => {
              const isSelected = row.periode === selectedMonth;
              return (
                <tr
                  key={row.periode}
                  onClick={() => onSelectMonth?.(row.periode)}
                  className={`rekap-table-row ${isSelected ? 'rekap-table-row--active' : ''}`}
                >
                  <td className="font-bold text-slate-900 dark:text-slate-100">
                    {row.periode}
                  </td>
                  <td className="font-bold text-emerald-700 dark:text-emerald-400">
                    +Rp {formatRupiah(row.totalMasuk)}
                  </td>
                  <td className="font-medium text-slate-600 dark:text-slate-400">
                    &minus;Rp {formatRupiah(row.totalKeluar)}
                  </td>
                  <td className="font-bold text-emerald-800 dark:text-emerald-300">
                    Rp {formatRupiah(row.net)}
                  </td>
                  <td className="text-slate-600 dark:text-slate-400">
                    {row.jmlTrx} trx
                  </td>
                  <td>
                    <span
                      className={`inline-flex items-center px-3 py-0.5 rounded-full text-xs font-bold ${
                        row.status === 'Berjalan'
                          ? 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300'
                          : 'bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-300'
                      }`}
                    >
                      {row.status}
                    </span>
                  </td>
                  <td>
                    <div className="flex items-center justify-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={() => onDownloadRowPDF?.(row)}
                        className="btn-row-action"
                      >
                        PDF
                      </button>
                      <button
                        type="button"
                        onClick={() => onDownloadRowExcel?.(row)}
                        className="btn-row-action"
                      >
                        Excel
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MonthlyReportTable;
