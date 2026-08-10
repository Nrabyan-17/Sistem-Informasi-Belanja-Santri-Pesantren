// StatCards: Kartu Ringkasan Statistik (Total Saldo, Pemasukan, Jumlah Transaksi)
const StatCards = ({ totalSaldo, totalPemasukan, totalTransaksi }) => {
  return (
    <div className="stat-cards">
      <div className="stat-card stat-card--saldo">
        <p className="stat-label">Total Saldo Santri</p>
        <h2 className="stat-value">Rp {totalSaldo?.toLocaleString('id-ID') || '0'}</h2>
      </div>
      <div className="stat-card stat-card--pemasukan">
        <p className="stat-label">Pemasukan Hari Ini</p>
        <h2 className="stat-value">Rp {totalPemasukan?.toLocaleString('id-ID') || '0'}</h2>
      </div>
      <div className="stat-card stat-card--transaksi">
        <p className="stat-label">Total Transaksi</p>
        <h2 className="stat-value">{totalTransaksi || 0}</h2>
      </div>
    </div>
  );
};

export default StatCards;
