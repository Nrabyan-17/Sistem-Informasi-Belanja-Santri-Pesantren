import { useState } from 'react';
import Modal from '../common/Modal';

const mockSantriHistory = [
  { id: 1, tanggal: '01 Agts 2025', keterangan: 'Tarik Koin (Rumah Koin)', nominal: -30000 },
  { id: 2, tanggal: '28 Jul 2025', keterangan: 'Setor BNI Virtual Account', nominal: 100000 },
  { id: 3, tanggal: '25 Jul 2025', keterangan: 'Tarik Koin (Rumah Koin)', nominal: -30000 },
];

const SaldoDetailModal = ({ isOpen, onClose, santri = {} }) => {
  const [actionType, setActionType] = useState('tambah'); // 'tambah' | 'kurangi'
  const [nominal, setNominal] = useState('');
  const [keterangan, setKeterangan] = useState('');
  const [currentSaldo, setCurrentSaldo] = useState(santri.saldo || 15000);

  const initialLetter = (santri.nama || 'Muhammad Rizki').charAt(0).toUpperCase();

  const handleConfirmAdjustment = (e) => {
    e.preventDefault();
    const amount = parseInt(nominal || '0', 10);
    if (amount <= 0) {
      alert('Masukkan nominal penyesuaian yang valid.');
      return;
    }
    if (!keterangan.trim()) {
      alert('Keterangan / alasan wajib diisi.');
      return;
    }

    const newSaldo = actionType === 'tambah' ? currentSaldo + amount : currentSaldo - amount;
    setCurrentSaldo(newSaldo);
    alert(`✅ Penyesuaian saldo berhasil!\nSaldo ${santri.nama || 'Muhammad Rizki'} sekarang: Rp ${newSaldo.toLocaleString('id-ID')}`);
    setNominal('');
    setKeterangan('');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Detail &amp; Penyesuaian Saldo"
      subtitle="Lihat info detail dan sesuaikan saldo untuk santri ini."
    >
      <div className="saldo-modal-content">
        {/* Identitas Santri Card */}
        <div className="saldo-identity-card">
          <div className="saldo-identity-left">
            <div className="santri-avatar-circle">{initialLetter}</div>
            <div>
              <span className="identity-tag">IDENTITAS SANTRI</span>
              <h3 className="identity-name">{santri.nama || 'Muhammad Rizki'}</h3>
              <p className="identity-nis">NIS: {santri.nis || '2024003'}</p>
            </div>
          </div>
          <div className="saldo-identity-right">
            <span className="sisa-saldo-tag">Sisa Saldo Saat Ini</span>
            <div className="sisa-saldo-val">
              Rp {(currentSaldo || 15000).toLocaleString('id-ID')}
            </div>
          </div>
        </div>

        {/* Sesuaikan Saldo (Manual) */}
        <form className="saldo-adjust-form" onSubmit={handleConfirmAdjustment}>
          <h4 className="section-title-sm">Sesuaikan Saldo (Manual)</h4>

          <div className="form-grid-2col">
            <div className="form-group-section">
              <label className="form-section-label">AKSI PENYESUAIAN</label>
              <div className="action-toggle-group">
                <button
                  type="button"
                  className={`action-toggle-btn ${actionType === 'tambah' ? 'action-toggle-btn--tambah' : ''}`}
                  onClick={() => setActionType('tambah')}
                >
                  + Tambah
                </button>
                <button
                  type="button"
                  className={`action-toggle-btn ${actionType === 'kurangi' ? 'action-toggle-btn--kurangi' : ''}`}
                  onClick={() => setActionType('kurangi')}
                >
                  - Kurangi
                </button>
              </div>
            </div>

            <div className="form-group-section">
              <label className="form-section-label">NOMINAL (RP)</label>
              <input
                type="number"
                className="form-control-input"
                placeholder="Misal: 25000"
                value={nominal}
                onChange={(e) => setNominal(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group-section">
            <label className="form-section-label">KETERANGAN / ALASAN (WAJIB)</label>
            <input
              type="text"
              className="form-control-input"
              placeholder="Contoh: Koreksi kasir salah input..."
              value={keterangan}
              onChange={(e) => setKeterangan(e.target.value)}
              required
            />
          </div>

          <div className="saldo-btn-wrapper">
            <button type="submit" className="btn btn-primary btn-confirm-adjust">
              Konfirmasi Penyesuaian
            </button>
          </div>
        </form>

        {/* Riwayat Transaksi Terakhir */}
        <div className="saldo-history-section">
          <h4 className="section-title-sm">Riwayat Transaksi Terakhir</h4>
          <table className="mini-data-table">
            <thead>
              <tr>
                <th>TANGGAL</th>
                <th>KETERANGAN</th>
                <th style={{ textAlign: 'right' }}>NOMINAL</th>
              </tr>
            </thead>
            <tbody>
              {mockSantriHistory.map((item) => (
                <tr key={item.id}>
                  <td>{item.tanggal}</td>
                  <td>{item.keterangan}</td>
                  <td style={{ textAlign: 'right' }}>
                    <span className={item.nominal > 0 ? 'text-success' : 'text-danger'}>
                      {item.nominal > 0 ? '+' : ''} Rp {Math.abs(item.nominal).toLocaleString('id-ID')}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Modal>
  );
};

export default SaldoDetailModal;
