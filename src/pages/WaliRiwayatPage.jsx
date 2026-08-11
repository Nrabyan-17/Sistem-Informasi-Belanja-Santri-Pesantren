import { useState } from 'react';
import WaliLayout from '../components/layout/WaliLayout';

const mockWaliTransactions = [
  { id: 1, tanggal: '4 Agts 2025',  nis: '2024001', nama: 'Ahmad Fauzi', ket: 'Tarik Koin (Rumah Koin)',     nominal: -30000,  saldoAfter: 350000, type: 'keluar' },
  { id: 2, tanggal: '3 Agts 2025',  nis: '2024001', nama: 'Ahmad Fauzi', ket: 'Tarik Koin (Rumah Koin)',     nominal: -30000,  saldoAfter: 380000, type: 'keluar' },
  { id: 3, tanggal: '2 Agts 2025',  nis: '2024001', nama: 'Ahmad Fauzi', ket: 'Setor BNI Virtual Account',   nominal: 200000,  saldoAfter: 410000, type: 'masuk' },
  { id: 4, tanggal: '1 Agts 2025',  nis: '2024001', nama: 'Ahmad Fauzi', ket: 'Tarik Koin (Rumah Koin)',     nominal: -30000,  saldoAfter: 210000, type: 'keluar' },
  { id: 5, tanggal: '31 Jul 2025',  nis: '2024001', nama: 'Ahmad Fauzi', ket: 'Setor BNI Virtual Account',   nominal: 200000,  saldoAfter: 240000, type: 'masuk' },
  { id: 6, tanggal: '28 Jul 2025',  nis: '2024001', nama: 'Ahmad Fauzi', ket: 'Tarik Koin (Rumah Koin)',     nominal: -30000,  saldoAfter: 40000,  type: 'keluar' },
  { id: 7, tanggal: '26 Jul 2025',  nis: '2024001', nama: 'Ahmad Fauzi', ket: 'Setor BNI Virtual Account',   nominal: 300000,  saldoAfter: 70000,  type: 'masuk' },
  { id: 8, tanggal: '24 Jul 2025',  nis: '2024001', nama: 'Ahmad Fauzi', ket: 'Tarik Koin (Rumah Koin)',     nominal: -30000,  saldoAfter: 230000, type: 'keluar' },
  { id: 9, tanggal: '21 Jul 2025',  nis: '2024001', nama: 'Ahmad Fauzi', ket: 'Tarik Koin (Rumah Koin)',     nominal: -30000,  saldoAfter: 260000, type: 'keluar' },
  { id: 10, tanggal: '18 Jul 2025', nis: '2024001', nama: 'Ahmad Fauzi', ket: 'Tarik Koin (Rumah Koin)',     nominal: -30000,  saldoAfter: 170000, type: 'keluar' },
  { id: 11, tanggal: '15 Jul 2025', nis: '2024001', nama: 'Ahmad Fauzi', ket: 'Tarik Koin (Rumah Koin)',     nominal: -30000,  saldoAfter: 140000, type: 'keluar' },
  { id: 12, tanggal: '12 Jul 2025', nis: '2024001', nama: 'Ahmad Fauzi', ket: 'Setor BNI Virtual Account',   nominal: 250000,  saldoAfter: 110000, type: 'masuk' },
  { id: 13, tanggal: '8 Jul 2025',  nis: '2024001', nama: 'Ahmad Fauzi', ket: 'Tarik Koin (Rumah Koin)',     nominal: -30000,  saldoAfter: 260000, type: 'keluar' },
  { id: 14, tanggal: '4 Jul 2025',  nis: '2024001', nama: 'Ahmad Fauzi', ket: 'Tarik Koin (Rumah Koin)',     nominal: -30000,  saldoAfter: 290000, type: 'keluar' },
  { id: 15, tanggal: '1 Jul 2025',  nis: '2024001', nama: 'Ahmad Fauzi', ket: 'Setor BNI Virtual Account',   nominal: 500000,  saldoAfter: 320000, type: 'masuk' },
];

const WaliRiwayatPage = () => {
  const [filterType, setFilterType] = useState('semua');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Filtering
  const filteredData = mockWaliTransactions.filter((item) => {
    if (filterType === 'masuk' && item.type !== 'masuk') return false;
    if (filterType === 'keluar' && item.type !== 'keluar') return false;
    return true;
  });

  const totalMasuk = mockWaliTransactions
    .filter((t) => t.type === 'masuk')
    .reduce((sum, t) => sum + t.nominal, 0);

  const totalKeluar = Math.abs(
    mockWaliTransactions
      .filter((t) => t.type === 'keluar')
      .reduce((sum, t) => sum + t.nominal, 0)
  );

  const handleExportExcel = () => {
    alert('📥 Memulai unduh laporan riwayat transaksi (.xlsx)...');
  };

  return (
    <WaliLayout pageTitle="Riwayat Transaksi — Arus Kas Saldo">
      <div className="wali-riwayat-page">
        <div className="wali-header-subtitle">
          Pondok Pesantren Nazhatut Thullab
        </div>

        {/* Filter Bar & Export */}
        <div className="wali-filter-card">
          <div className="wali-filter-left">
            <div className="wali-type-buttons">
              <button
                className={`wali-type-btn ${filterType === 'semua' ? 'wali-type-btn--active' : ''}`}
                onClick={() => setFilterType('semua')}
              >
                Semua
              </button>
              <button
                className={`wali-type-btn ${filterType === 'masuk' ? 'wali-type-btn--active' : ''}`}
                onClick={() => setFilterType('masuk')}
              >
                + Masuk
              </button>
              <button
                className={`wali-type-btn ${filterType === 'keluar' ? 'wali-type-btn--active' : ''}`}
                onClick={() => setFilterType('keluar')}
              >
                - Keluar
              </button>
            </div>

            <div className="wali-date-inputs">
              <div className="date-input-group">
                <label>DARI TANGGAL</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="filter-date"
                />
              </div>
              <div className="date-input-group">
                <label>SAMPAI TANGGAL</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="filter-date"
                />
              </div>
            </div>
          </div>

          <button className="btn btn-export-excel" onClick={handleExportExcel}>
            📥 Ekspor .xlsx
          </button>
        </div>

        {/* 3 Summary Stat Cards */}
        <div className="wali-summary-grid">
          <div className="wali-summary-card">
            <span className="summary-label">TOTAL TRANSAKSI</span>
            <span className="summary-val">{mockWaliTransactions.length} entri</span>
          </div>
          <div className="wali-summary-card wali-summary-card--green">
            <span className="summary-label">TOTAL SALDO MASUK</span>
            <span className="summary-val text-success">
              Rp {totalMasuk.toLocaleString('id-ID')}
            </span>
          </div>
          <div className="wali-summary-card wali-summary-card--orange">
            <span className="summary-label">TOTAL KOIN DITARIK</span>
            <span className="summary-val text-warning">
              Rp {totalKeluar.toLocaleString('id-ID')}
            </span>
          </div>
        </div>

        {/* Data Table */}
        <div className="wali-table-card">
          <div className="wali-table-header">
            <h3 className="wali-table-title">Daftar Arus Kas Saldo</h3>
            <span className="wali-table-count">
              {filteredData.length} dari {mockWaliTransactions.length} transaksi
            </span>
          </div>

          <div className="data-table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>TANGGAL</th>
                  <th>SANTRI / NIS</th>
                  <th>KETERANGAN</th>
                  <th>NOMINAL</th>
                  <th>SALDO SETELAH</th>
                  <th>STATUS</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((item, idx) => (
                  <tr key={item.id}>
                    <td>{idx + 1}</td>
                    <td>{item.tanggal}</td>
                    <td>
                      <div className="santri-cell">
                        <strong>{item.nama}</strong>
                        <span className="santri-nis">{item.nis}</span>
                      </div>
                    </td>
                    <td>{item.ket}</td>
                    <td className="nominal-cell">
                      <strong className={item.nominal > 0 ? 'text-success' : 'text-danger'}>
                        {item.nominal > 0 ? '+' : ''} Rp {Math.abs(item.nominal).toLocaleString('id-ID')}
                      </strong>
                    </td>
                    <td>Rp {item.saldoAfter.toLocaleString('id-ID')}</td>
                    <td>
                      {item.type === 'masuk' ? (
                        <span className="badge badge--green">+ Masuk</span>
                      ) : (
                        <span className="badge badge--orange">- Keluar</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="wali-table-footer">
            <div className="table-footer-left">
              <span>Total masuk: <strong>Rp {totalMasuk.toLocaleString('id-ID')}</strong></span>
              <span className="divider">•</span>
              <span>Total keluar: <strong>Rp {totalKeluar.toLocaleString('id-ID')}</strong></span>
            </div>
            <div className="table-footer-right">
              {filteredData.length} baris ditampilkan
            </div>
          </div>
        </div>
      </div>
    </WaliLayout>
  );
};

export default WaliRiwayatPage;
