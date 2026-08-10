// Selector Nominal Cepat Top Up Saldo Santri
const nominals = [10000, 20000, 50000, 100000, 200000, 500000];

const QuickNominalSelector = ({ selected, onSelect }) => {
  return (
    <div className="quick-nominal">
      <p className="quick-nominal-label">Pilih Nominal Cepat:</p>
      <div className="nominal-grid">
        {nominals.map((nominal) => (
          <button
            key={nominal}
            className={`nominal-btn ${selected === nominal ? 'nominal-btn--active' : ''}`}
            onClick={() => onSelect?.(nominal)}
          >
            Rp {nominal.toLocaleString('id-ID')}
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuickNominalSelector;
