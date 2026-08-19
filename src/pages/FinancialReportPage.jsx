import { useState, useEffect, useMemo } from 'react';
import MainLayout from '../components/layout/MainLayout';
import FinancialSummaryCards from '../components/reports/FinancialSummaryCards';
import ExportButtons from '../components/reports/ExportButtons';
import MonthlyReportTable from '../components/reports/MonthlyReportTable';
import { reportApi, dashboardApi } from '../utils/api';

const FinancialReportPage = ({ Layout = MainLayout }) => {
  const [rows, setRows] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState('');
  const [totalSaldoAktif, setTotalSaldoAktif] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([reportApi.summary(), dashboardApi.get()])
      .then(([sum, dash]) => {
        const list = (sum.data || []).map((m) => ({
          periode: m.label,
          bulan: m.bulan,
          totalMasuk: m.pemasukan,
          totalKeluar: m.pengeluaran,
          net: m.net,
          jmlTrx: m.jumlah_transaksi ?? 0,
          staff: m.staff || '\u2014',
          status: m.status || 'Selesai',
        }));
        setRows(list);
        if (list.length) setSelectedMonth(list[0].periode);
        setTotalSaldoAktif(dash?.total_saldo ?? 0);
      })
      .catch((e) => setError(e.message || 'Gagal memuat laporan.'))
      .finally(() => setLoading(false));
  }, []);

  // Active month data item
  const activeMonthReport = useMemo(() => {
    return rows.find((d) => d.periode === selectedMonth) || rows[0];
  }, [rows, selectedMonth]);

  // Export PDF Handler
  const handleExportPDF = () => {
    window.print();
  };

  // Export Excel Handler (via API)
  const handleExportExcel = () => {
    const bulan = rows.find((r) => r.periode === selectedMonth)?.bulan;
    reportApi.export(bulan).catch((e) => setError(e.message || 'Gagal mengekspor laporan.'));
  };

  return (
    <Layout pageTitle="Laporan Keuangan">
      {/* Header Halaman Laporan & Bar Kontrol Actions */}
      <div className="report-header-card flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="report-main-title text-2xl font-extrabold text-slate-900 dark:text-slate-100">
            Laporan Keuangan
          </h1>
          <p className="report-main-subtitle text-sm text-slate-500 dark:text-slate-400 mt-1">
            Rekap bulanan keuangan PP Nazhatut Thullab
          </p>
        </div>

        {/* Action Controls: Dropdown Periode + Tombol Unduh PDF + Tombol Unduh Excel */}
        <ExportButtons
          selectedMonth={selectedMonth}
          onMonthChange={setSelectedMonth}
          months={rows.map((m) => m.periode)}
          onExportPDF={handleExportPDF}
          onExportExcel={handleExportExcel}
        />
      </div>

      {error && (
        <div className="mb-6 px-4 py-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 rounded-2xl text-sm font-semibold text-rose-700 dark:text-rose-300">
          {error}
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center h-32 text-slate-500 dark:text-slate-400 font-medium">
          Memuat laporan keuangan...
        </div>
      )}

      {!loading && rows.length > 0 && (
        <>
          {/* KPI Ringkasan 4 Kartu */}
          <FinancialSummaryCards
            totalSaldo={totalSaldoAktif}
            totalMasuk={activeMonthReport.totalMasuk}
            totalKeluar={activeMonthReport.totalKeluar}
            netBulanIni={activeMonthReport.net}
            selectedMonth={selectedMonth}
          />

          {/* Tabel Rekap Laporan Bulanan */}
          <MonthlyReportTable
            data={rows}
            selectedMonth={selectedMonth}
            onSelectMonth={setSelectedMonth}
            onDownloadRowPDF={handleExportPDF}
            onDownloadRowExcel={handleExportExcel}
          />
        </>
      )}
    </Layout>
  );
};

export default FinancialReportPage;
