import React from 'react';

// Bar Kontrol Laporan: Dropdown Periode Bulan, Tombol Unduh PDF, dan Tombol Unduh Excel
const ExportButtons = ({
  selectedMonth = 'Agustus 2025',
  onMonthChange,
  months = ['Agustus 2025', 'Juli 2025', 'Juni 2025', 'Mei 2025', 'April 2025', 'Maret 2025'],
  onExportPDF,
  onExportExcel,
}) => {
  return (
    <div className="report-action-controls">
      {/* Dropdown Tanggal / Periode */}
      <select
        value={selectedMonth}
        onChange={(e) => onMonthChange?.(e.target.value)}
        className="report-month-select"
      >
        {months.map((m) => (
          <option key={m} value={m}>
            {m}
          </option>
        ))}
      </select>

      {/* Tombol Unduh PDF */}
      <button type="button" onClick={onExportPDF} className="btn-download-pdf">
        <svg className="w-4 h-4 mr-1.5 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        Unduh PDF
      </button>

      {/* Tombol Unduh Excel */}
      <button type="button" onClick={onExportExcel} className="btn-download-excel">
        <svg className="w-4 h-4 mr-1.5 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        Unduh Excel
      </button>
    </div>
  );
};

export default ExportButtons;
