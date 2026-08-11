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
      <div className="wali-riwayat-page flex flex-col gap-6">
        <div className="wali-header-subtitle text-sm text-slate-500 -mt-3 mb-1 font-medium">
          Pondok Pesantren Nazhatut Thullab
        </div>

        {/* Filter Bar & Export */}
        <div className="wali-filter-card bg-white border border-slate-200 rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4 shadow-xs">
          <div className="wali-filter-left flex flex-wrap items-center gap-6">
            <div className="wali-type-buttons flex gap-2">
              <button
                className={`wali-type-btn px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
                  filterType === 'semua'
                    ? 'wali-type-btn--active bg-emerald-800 text-white border-emerald-800 shadow-xs'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
                onClick={() => setFilterType('semua')}
              >
                Semua
              </button>
              <button
                className={`wali-type-btn px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
                  filterType === 'masuk'
                    ? 'wali-type-btn--active bg-emerald-800 text-white border-emerald-800 shadow-xs'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
                onClick={() => setFilterType('masuk')}
              >
                + Masuk
              </button>
              <button
                className={`wali-type-btn px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
                  filterType === 'keluar'
                    ? 'wali-type-btn--active bg-emerald-800 text-white border-emerald-800 shadow-xs'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
                onClick={() => setFilterType('keluar')}
              >
                - Keluar
              </button>
            </div>

            <div className="wali-date-inputs flex items-center gap-3">
              <div className="date-input-group flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">DARI TANGGAL</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="filter-date px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:border-emerald-600"
                />
              </div>
              <div className="date-input-group flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">SAMPAI TANGGAL</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="filter-date px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:border-emerald-600"
                />
              </div>
            </div>
          </div>

          <button
            className="btn btn-export-excel px-4 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-xl text-xs shadow-md transition-all cursor-pointer"
            onClick={handleExportExcel}
          >
            📥 Ekspor .xlsx
          </button>
        </div>

        {/* 3 Summary Stat Cards */}
        <div className="wali-summary-grid grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="wali-summary-card bg-white border border-slate-200 rounded-2xl p-5 flex flex-col gap-1.5 shadow-xs">
            <span className="summary-label text-[11px] font-bold tracking-wider text-slate-400 uppercase">
              TOTAL TRANSAKSI
            </span>
            <span className="summary-val text-xl font-extrabold text-slate-800">
              {mockWaliTransactions.length} entri
            </span>
          </div>
          <div className="wali-summary-card wali-summary-card--green bg-emerald-50 border border-emerald-200 rounded-2xl p-5 flex flex-col gap-1.5 shadow-xs">
            <span className="summary-label text-[11px] font-bold tracking-wider text-emerald-800 uppercase">
              TOTAL SALDO MASUK
            </span>
            <span className="summary-val text-xl font-extrabold text-emerald-600">
              Rp {totalMasuk.toLocaleString('id-ID')}
            </span>
          </div>
          <div className="wali-summary-card wali-summary-card--orange bg-amber-50 border border-amber-200 rounded-2xl p-5 flex flex-col gap-1.5 shadow-xs">
            <span className="summary-label text-[11px] font-bold tracking-wider text-amber-800 uppercase">
              TOTAL KOIN DITARIK
            </span>
            <span className="summary-val text-xl font-extrabold text-amber-600">
              Rp {totalKeluar.toLocaleString('id-ID')}
            </span>
          </div>
        </div>

        {/* Data Table */}
        <div className="wali-table-card bg-white border border-slate-200 rounded-3xl p-6 shadow-xs flex flex-col gap-5">
          <div className="wali-table-header flex justify-between items-center">
            <h3 className="wali-table-title text-base font-bold text-slate-800">Daftar Arus Kas Saldo</h3>
            <span className="wali-table-count text-xs text-slate-400 font-medium">
              {filteredData.length} dari {mockWaliTransactions.length} transaksi
            </span>
          </div>

          <div className="data-table-wrapper overflow-x-auto border border-slate-200 rounded-2xl">
            <table className="data-table w-full text-left border-collapse text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase">
                <tr>
                  <th className="px-4 py-3">#</th>
                  <th className="px-4 py-3">TANGGAL</th>
                  <th className="px-4 py-3">SANTRI / NIS</th>
                  <th className="px-4 py-3">KETERANGAN</th>
                  <th className="px-4 py-3">NOMINAL</th>
                  <th className="px-4 py-3">SALDO SETELAH</th>
                  <th className="px-4 py-3">STATUS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredData.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3.5 text-xs text-slate-400 font-medium">{idx + 1}</td>
                    <td className="px-4 py-3.5 text-xs font-medium whitespace-nowrap">{item.tanggal}</td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <div className="santri-cell flex flex-col">
                        <strong className="text-slate-800 font-bold">{item.nama}</strong>
                        <span className="santri-nis text-xs text-slate-400">{item.nis}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 font-medium">{item.ket}</td>
                    <td className="nominal-cell px-4 py-3.5 font-bold whitespace-nowrap">
                      <span className={item.nominal > 0 ? 'text-emerald-600' : 'text-rose-600'}>
                        {item.nominal > 0 ? '+' : ''} Rp {Math.abs(item.nominal).toLocaleString('id-ID')}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 font-semibold text-slate-800 whitespace-nowrap">
                      Rp {item.saldoAfter.toLocaleString('id-ID')}
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      {item.type === 'masuk' ? (
                        <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-full text-xs font-semibold">
                          + Masuk
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-1 rounded-full text-xs font-semibold">
                          - Keluar
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="wali-table-footer flex flex-wrap justify-between items-center pt-4 border-t border-slate-100 text-xs text-slate-500 font-medium">
            <div className="table-footer-left flex items-center gap-3">
              <span>Total masuk: <strong className="text-emerald-700">Rp {totalMasuk.toLocaleString('id-ID')}</strong></span>
              <span className="divider text-slate-300">•</span>
              <span>Total keluar: <strong className="text-amber-700">Rp {totalKeluar.toLocaleString('id-ID')}</strong></span>
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
