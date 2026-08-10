import MainLayout from '../components/layout/MainLayout';
import FinancialSummaryCards from '../components/reports/FinancialSummaryCards';
import ExportButtons from '../components/reports/ExportButtons';

const FinancialReportPage = () => {
  const handleExportPDF = () => {
    console.log('Export PDF...');
    // TODO: Implementasi export PDF (jspdf / html2canvas)
  };

  const handleExportExcel = () => {
    console.log('Export Excel...');
    // TODO: Implementasi export Excel (xlsx / SheetJS)
  };

  return (
    <MainLayout pageTitle="Laporan Keuangan">
      <div className="report-header">
        <div className="report-filter">
          <select className="filter-select">
            <option>Agustus 2026</option>
            <option>Juli 2026</option>
          </select>
        </div>
        <ExportButtons onExportPDF={handleExportPDF} onExportExcel={handleExportExcel} />
      </div>

      <FinancialSummaryCards
        pemasukan={3025000}
        pengeluaran={450000}
        saldo={2575000}
      />

      <div className="report-table-placeholder">
        <p>📋 Tabel detail laporan arus kas akan ditampilkan di sini.</p>
      </div>
    </MainLayout>
  );
};

export default FinancialReportPage;
