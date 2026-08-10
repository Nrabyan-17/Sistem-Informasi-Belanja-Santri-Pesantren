// Tombol Export Laporan ke PDF dan Excel
const ExportButtons = ({ onExportPDF, onExportExcel }) => {
  return (
    <div className="export-buttons">
      <button className="btn btn-export-pdf" onClick={onExportPDF}>
        📄 Export PDF
      </button>
      <button className="btn btn-export-excel" onClick={onExportExcel}>
        📊 Export Excel
      </button>
    </div>
  );
};

export default ExportButtons;
