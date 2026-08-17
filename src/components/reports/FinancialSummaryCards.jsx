import React from 'react';

// Kartu Ringkasan Keuangan: Total Saldo Aktif, Dana Masuk, Dana Keluar, Selisih Bulan Ini
const FinancialSummaryCards = ({
  totalSaldo = 10000000,
  totalMasuk = 1225000,
  totalKeluar = 90000,
  netBulanIni = 1135000,
  selectedMonth = '',
}) => {
  const formatRupiah = (val) => new Intl.NumberFormat('id-ID').format(val);
  const bulanLabel = selectedMonth || 'bulan ini';

  return (
    <div className="report-kpi-grid">
      {/* Total Saldo Aktif */}
      <div className="report-kpi-card report-kpi-card--saldo">
        <span className="report-kpi-label">TOTAL SALDO AKTIF</span>
        <h3 className="report-kpi-value report-kpi-value--saldo">
          Rp {formatRupiah(totalSaldo)}
        </h3>
        <span className="report-kpi-subtext">Saldo seluruh santri</span>
      </div>

      {/* Dana Masuk Bulan Ini */}
      <div className="report-kpi-card report-kpi-card--masuk">
        <span className="report-kpi-label report-kpi-label--masuk">
          DANA MASUK
        </span>
        <h3 className="report-kpi-value report-kpi-value--masuk">
          Rp {formatRupiah(totalMasuk)}
        </h3>
        <span className="report-kpi-subtext">Pemasukan {bulanLabel}</span>
      </div>

      {/* Dana Keluar Bulan Ini */}
      <div className="report-kpi-card report-kpi-card--keluar">
        <span className="report-kpi-label report-kpi-label--keluar">
          DANA KELUAR
        </span>
        <h3 className="report-kpi-value report-kpi-value--keluar">
          Rp {formatRupiah(totalKeluar)}
        </h3>
        <span className="report-kpi-subtext">Penarikan {bulanLabel}</span>
      </div>

      {/* Selisih / Sisa Dana Bulan Ini */}
      <div className="report-kpi-card report-kpi-card--net">
        <span className="report-kpi-label">SELISIH DANA</span>
        <h3 className="report-kpi-value report-kpi-value--net">
          Rp {formatRupiah(netBulanIni)}
        </h3>
        <span className="report-kpi-subtext">Dana Masuk − Dana Keluar</span>
      </div>
    </div>
  );
};

export default FinancialSummaryCards;
