import React from 'react';

// Kartu Ringkasan Keuangan: Total Saldo Aktif, Total Masuk Bulan Ini, Total Keluar Bulan Ini, Net Bulan Ini
const FinancialSummaryCards = ({
  totalSaldo = 10000000,
  totalMasuk = 1225000,
  totalKeluar = 90000,
  netBulanIni = 1135000,
}) => {
  const formatRupiah = (val) => new Intl.NumberFormat('id-ID').format(val);

  return (
    <div className="report-kpi-grid">
      {/* Total Saldo Aktif */}
      <div className="report-kpi-card report-kpi-card--saldo">
        <span className="report-kpi-label">TOTAL SALDO AKTIF</span>
        <h3 className="report-kpi-value report-kpi-value--saldo">
          Rp {formatRupiah(totalSaldo)}
        </h3>
      </div>

      {/* Total Masuk Bulan Ini */}
      <div className="report-kpi-card report-kpi-card--masuk">
        <span className="report-kpi-label report-kpi-label--masuk">
          TOTAL MASUK BULAN INI
        </span>
        <h3 className="report-kpi-value report-kpi-value--masuk">
          Rp {formatRupiah(totalMasuk)}
        </h3>
      </div>

      {/* Total Keluar Bulan Ini */}
      <div className="report-kpi-card report-kpi-card--keluar">
        <span className="report-kpi-label report-kpi-label--keluar">
          TOTAL KELUAR BULAN INI
        </span>
        <h3 className="report-kpi-value report-kpi-value--keluar">
          Rp {formatRupiah(totalKeluar)}
        </h3>
      </div>

      {/* Net Bulan Ini */}
      <div className="report-kpi-card report-kpi-card--net">
        <span className="report-kpi-label">NET BULAN INI</span>
        <h3 className="report-kpi-value report-kpi-value--net">
          Rp {formatRupiah(netBulanIni)}
        </h3>
        <span className="report-kpi-subtext">Masuk - Keluar</span>
      </div>
    </div>
  );
};

export default FinancialSummaryCards;
