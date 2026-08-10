// Widget Transaksi Terbaru untuk Halaman Dashboard
const RecentTransactionsWidget = ({ transactions = [] }) => {
  return (
    <div className="recent-transactions">
      <h3 className="widget-title">Transaksi Terbaru</h3>
      <ul className="transaction-list">
        {transactions.length === 0 ? (
          <li className="transaction-empty">Belum ada transaksi</li>
        ) : (
          transactions.map((trx, idx) => (
            <li key={idx} className="transaction-item">
              <span className="trx-name">{trx.namaSantri}</span>
              <span className="trx-amount">Rp {trx.nominal?.toLocaleString('id-ID')}</span>
            </li>
          ))
        )}
      </ul>
    </div>
  );
};

export default RecentTransactionsWidget;
