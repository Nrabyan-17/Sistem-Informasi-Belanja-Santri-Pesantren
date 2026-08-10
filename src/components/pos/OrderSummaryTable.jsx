// Tabel Ringkasan Pesanan pada POS Checkout (Item, Qty, Harga)
const OrderSummaryTable = ({ items = [] }) => {
  return (
    <div className="order-summary-card">
      <div className="card-header">
        <span className="card-icon">🧾</span>
        <span className="card-title">Ringkasan Pesanan</span>
      </div>
      <table className="order-table">
        <thead>
          <tr>
            <th>Item</th>
            <th>Qty</th>
            <th>Harga</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, idx) => (
            <tr key={idx}>
              <td>{item.nama}</td>
              <td>{item.qty}</td>
              <td>Rp {(item.harga * item.qty).toLocaleString('id-ID')}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default OrderSummaryTable;
