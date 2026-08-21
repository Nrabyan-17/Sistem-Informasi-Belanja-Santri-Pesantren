import React from 'react';

// Card KPI Ringkasan Transaksi: TOTAL TRANSAKSI, SALDO MASUK, SALDO KELUAR
const TransactionKpiCards = ({ totalTransaksi = 0, totalMasuk = 0, totalKeluar = 0 }) => {
  const formatRupiah = (val) => new Intl.NumberFormat('id-ID').format(val);

  return (
    <div className="transaction-kpi-grid">
      {/* Total Transaksi */}
      <div className="tx-kpi-card tx-kpi-card--total">
        <span className="tx-kpi-label">TOTAL TRANSAKSI</span>
        <h3 className="tx-kpi-value">{totalTransaksi} entri</h3>
      </div>

      {/* Saldo Masuk */}
      <div className="tx-kpi-card tx-kpi-card--masuk">
        <span className="tx-kpi-label tx-kpi-label--masuk">SALDO MASUK</span>
        <h3 className="tx-kpi-value tx-kpi-value--masuk">Rp {formatRupiah(totalMasuk)}</h3>
      </div>

      {/* Saldo Keluar */}
      <div className="tx-kpi-card tx-kpi-card--keluar">
        <span className="tx-kpi-label tx-kpi-label--keluar">SALDO KELUAR</span>
        <h3 className="tx-kpi-value tx-kpi-value--keluar">Rp {formatRupiah(totalKeluar)}</h3>
      </div>
    </div>
  );
};

export default TransactionKpiCards;
