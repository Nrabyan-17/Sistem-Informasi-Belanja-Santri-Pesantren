import React from 'react';

// Kartu Ringkasan KPI Data Santri
const SantriKpiCards = ({
  totalSantri = 0,
  santriAktif = 0,
  santriNonaktif = 0,
  totalSaldo = 0,
}) => {
  const formatRupiah = (val) =>
    'Rp ' + Number(val).toLocaleString('id-ID');

  return (
    <div className="user-kpi-grid">
      {/* Total Santri */}
      <div className="user-kpi-card user-kpi-card--total">
        <span className="user-kpi-label">TOTAL DATA SANTRI</span>
        <h3 className="user-kpi-value">{totalSantri} santri</h3>
      </div>

      {/* Santri Aktif */}
      <div className="user-kpi-card user-kpi-card--aktif">
        <span className="user-kpi-label user-kpi-label--aktif">SANTRI AKTIF</span>
        <h3 className="user-kpi-value user-kpi-value--aktif">{santriAktif} santri</h3>
      </div>

      {/* Santri Nonaktif */}
      <div className="user-kpi-card user-kpi-card--keluar">
        <span className="user-kpi-label user-kpi-label--keluar">SANTRI NONAKTIF</span>
        <h3 className="user-kpi-value user-kpi-value--keluar">{santriNonaktif} santri</h3>
      </div>

      {/* Total Saldo Keseluruhan */}
      <div className="user-kpi-card user-kpi-card--wali">
        <span className="user-kpi-label user-kpi-label--wali">TOTAL SALDO</span>
        <h3 className="user-kpi-value user-kpi-value--wali">{formatRupiah(totalSaldo)}</h3>
      </div>
    </div>
  );
};

export default SantriKpiCards;
