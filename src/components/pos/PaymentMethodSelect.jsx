// Selector Metode Pembayaran: Saldo Santri atau Tunai
const PaymentMethodSelect = ({ selected, onSelect, saldoSantri = 0 }) => {
  return (
    <div className="payment-method">
      <h4 className="payment-method-title">Metode Pembayaran</h4>
      <div className="method-options">
        <label className={`method-option ${selected === 'saldo' ? 'method-option--active' : ''}`}>
          <div className="method-info">
            <span className="method-icon">💳</span>
            <div>
              <p className="method-name">Saldo Santri</p>
              <p className="method-sub">Sisa: Rp {saldoSantri.toLocaleString('id-ID')}</p>
            </div>
          </div>
          <input
            type="radio"
            name="paymentMethod"
            value="saldo"
            checked={selected === 'saldo'}
            onChange={() => onSelect?.('saldo')}
          />
        </label>

        <label className={`method-option ${selected === 'tunai' ? 'method-option--active' : ''}`}>
          <div className="method-info">
            <span className="method-icon">💵</span>
            <div>
              <p className="method-name">Tunai</p>
              <p className="method-sub">Pembayaran dengan uang tunai</p>
            </div>
          </div>
          <input
            type="radio"
            name="paymentMethod"
            value="tunai"
            checked={selected === 'tunai'}
            onChange={() => onSelect?.('tunai')}
          />
        </label>
      </div>
    </div>
  );
};

export default PaymentMethodSelect;
