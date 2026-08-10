// Kartu Ringkasan Keuangan: Total Pemasukan, Pengeluaran, Saldo
const FinancialSummaryCards = ({ pemasukan = 0, pengeluaran = 0, saldo = 0 }) => {
  return (
    <div className="financial-summary">
      <div className="fin-card fin-card--pemasukan">
        <p>Total Pemasukan</p>
        <h3>Rp {pemasukan.toLocaleString('id-ID')}</h3>
      </div>
      <div className="fin-card fin-card--pengeluaran">
        <p>Total Pengeluaran</p>
        <h3>Rp {pengeluaran.toLocaleString('id-ID')}</h3>
      </div>
      <div className="fin-card fin-card--saldo">
        <p>Saldo Bersih</p>
        <h3>Rp {saldo.toLocaleString('id-ID')}</h3>
      </div>
    </div>
  );
};

export default FinancialSummaryCards;
