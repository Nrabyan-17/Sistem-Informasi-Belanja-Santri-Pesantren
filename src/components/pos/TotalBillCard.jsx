// Banner Total Tagihan pada POS Checkout (warna hijau gelap)
const TotalBillCard = ({ total = 0 }) => {
  return (
    <div className="total-bill-card">
      <p className="total-bill-label">TOTAL TAGIHAN</p>
      <h2 className="total-bill-amount">Rp {total.toLocaleString('id-ID')}</h2>
    </div>
  );
};

export default TotalBillCard;
