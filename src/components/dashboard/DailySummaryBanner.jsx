import React from 'react';

// Banner Ringkasan Harian pada Dashboard Keuangan Admin
const DailySummaryBanner = ({
  dateStr = 'SABTU, 1 Agustus 2026',
  masuk = 200000,
  keluar = 90000,
  transaksi = 4,
}) => {
  const formatRupiah = (val) => {
    return new Intl.NumberFormat('id-ID').format(val);
  };

  return (
    <div className="daily-summary-banner">
      {/* Tanggal Hari Ini */}
      <div className="banner-date-wrapper">
        <h2 className="banner-date">{dateStr}</h2>
      </div>

      {/* Ringkasan Finansial (Masuk, Keluar, Transaksi) */}
      <div className="banner-metrics">
        {/* Masuk */}
        <div className="metric-item">
          <span className="metric-label">MASUK</span>
          <span className="metric-value metric-value--masuk">
            +Rp {formatRupiah(masuk)}
          </span>
        </div>

        {/* Divider 1 */}
        <div className="metric-divider"></div>

        {/* Keluar */}
        <div className="metric-item">
          <span className="metric-label">KELUAR</span>
          <span className="metric-value metric-value--keluar">
            -Rp {formatRupiah(keluar)}
          </span>
        </div>

        {/* Divider 2 */}
        <div className="metric-divider"></div>

        {/* Transaksi */}
        <div className="metric-item">
          <span className="metric-label">TRANSAKSI</span>
          <span className="metric-value">{transaksi}</span>
        </div>
      </div>
    </div>
  );
};

export default DailySummaryBanner;
