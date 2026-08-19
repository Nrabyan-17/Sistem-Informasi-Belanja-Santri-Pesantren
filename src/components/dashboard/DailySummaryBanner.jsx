import React from 'react';

const getTodayString = () => {
  return new Date().toLocaleDateString('id-ID', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  }).toUpperCase();
};

// Banner Ringkasan Harian pada Dashboard Keuangan Admin
const DailySummaryBanner = ({
  dateStr,
  masuk = 0,
  keluar = 0,
  transaksi = 0,
}) => {
  const displayDate = dateStr || getTodayString();
  const formatRupiah = (val) => {
    return new Intl.NumberFormat('id-ID').format(val);
  };

  return (
    <div className="daily-summary-banner">
      {/* Tanggal Hari Ini */}
      <div className="banner-date-wrapper">
        <h2 className="banner-date">{displayDate}</h2>
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
