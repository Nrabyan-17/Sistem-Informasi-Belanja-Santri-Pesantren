import QuickNominalSelector from './QuickNominalSelector';
import { useState } from 'react';

// Form Top Up Saldo Santri
const TopUpForm = ({ santri, onSubmit }) => {
  const [nominal, setNominal] = useState(0);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (nominal > 0) {
      onSubmit?.({ santri, nominal });
    }
  };

  return (
    <form className="topup-form" onSubmit={handleSubmit}>
      <div className="topup-santri-info">
        <p><strong>NIS:</strong> {santri?.nis}</p>
        <p><strong>Nama:</strong> {santri?.nama}</p>
        <p><strong>Saldo Saat Ini:</strong> Rp {santri?.saldo?.toLocaleString('id-ID')}</p>
      </div>

      <QuickNominalSelector selected={nominal} onSelect={setNominal} />

      <div className="form-group">
        <label>Atau Masukkan Nominal Lain:</label>
        <input
          type="number"
          min={1000}
          value={nominal || ''}
          onChange={(e) => setNominal(Number(e.target.value))}
          placeholder="Contoh: 75000"
        />
      </div>

      <button type="submit" className="btn btn-primary btn-block" disabled={!nominal}>
        ✅ Konfirmasi Top Up — Rp {nominal.toLocaleString('id-ID')}
      </button>
    </form>
  );
};

export default TopUpForm;
