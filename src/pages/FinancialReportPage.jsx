import { useState, useMemo } from 'react';
import MainLayout from '../components/layout/MainLayout';
import FinancialSummaryCards from '../components/reports/FinancialSummaryCards';
import ExportButtons from '../components/reports/ExportButtons';
import MonthlyReportTable from '../components/reports/MonthlyReportTable';

const mockMonthlyData = [
  { periode: 'Agustus 2025', totalMasuk: 1225000, totalKeluar: 90000, net: 1135000, jmlTrx: 12, status: 'Berjalan' },
  { periode: 'Juli 2025',    totalMasuk: 3110000, totalKeluar: 480000, net: 2630000, jmlTrx: 87, status: 'Selesai' },
  { periode: 'Juni 2025',    totalMasuk: 2840000, totalKeluar: 510000, net: 2330000, jmlTrx: 79, status: 'Selesai' },
  { periode: 'Mei 2025',     totalMasuk: 3450000, totalKeluar: 600000, net: 2850000, jmlTrx: 95, status: 'Selesai' },
  { periode: 'April 2025',   totalMasuk: 2620000, totalKeluar: 390000, net: 2230000, jmlTrx: 63, status: 'Selesai' },
  { periode: 'Maret 2025',   totalMasuk: 2980000, totalKeluar: 450000, net: 2530000, jmlTrx: 72, status: 'Selesai' },
];

const FinancialReportPage = ({ Layout = MainLayout }) => {
  const [selectedMonth, setSelectedMonth] = useState('Agustus 2025');
  const totalSaldoAktif = 10000000;

  // Active month data item
  const activeMonthReport = useMemo(() => {
    return (
      mockMonthlyData.find((d) => d.periode === selectedMonth) || mockMonthlyData[0]
    );
  }, [selectedMonth]);

  // Export PDF Handler
  const handleExportPDF = () => {
    window.print();
  };

  // Export Excel Handler
  const handleExportExcel = () => {
    const headers = ['Periode', 'Total Masuk', 'Total Keluar', 'Net', 'Jml Trx', 'Status'];
    const rows = mockMonthlyData.map((d) => [
      d.periode,
      d.totalMasuk,
      d.totalKeluar,
      d.net,
      d.jmlTrx,
      d.status,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `rekap_laporan_keuangan_${selectedMonth.replace(' ', '_')}.xlsx`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
          months={mockMonthlyData.map((m) => m.periode)}
          onExportPDF={handleExportPDF}
          onExportExcel={handleExportExcel}
        />
      </div>

      {/* KPI Ringkasan 4 Kartu */}
      <FinancialSummaryCards
        totalSaldo={totalSaldoAktif}
        totalMasuk={activeMonthReport.totalMasuk}
        totalKeluar={activeMonthReport.totalKeluar}
        netBulanIni={activeMonthReport.net}
      />

      {/* Tabel Rekap Laporan Bulanan */}
      <MonthlyReportTable
        data={mockMonthlyData}
        selectedMonth={selectedMonth}
        onSelectMonth={setSelectedMonth}
        onDownloadRowPDF={handleExportPDF}
        onDownloadRowExcel={handleExportExcel}
      />
    </Layout>
  );
};

export default FinancialReportPage;
