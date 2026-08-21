import { useState, useEffect } from 'react';
import WaliLayout from '../components/layout/WaliLayout';
import { waliApi } from '../utils/api';

const formatTanggal = (iso) => {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
};

const WaliRiwayatPage = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterType, setFilterType] = useState('semua');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    waliApi
      .transactions({ per_page: 100 })
      .then((res) =>
        setTransactions(
          (res.data || []).map((t) => {
            let timeStr = '';
            if (t.created_at) {
              const d = new Date(t.created_at);
              if (!isNaN(d.getTime())) {
                timeStr = d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB';
              }
            }
            return {
              id: t.id,
              tanggal: formatTanggal(t.created_at),
              waktu: timeStr,
              rawDate: t.created_at ? t.created_at.slice(0, 10) : '',
              nis: t.santri?.nis || '—',
              nama: t.santri?.nama || '—',
              ket: t.keterangan || (t.tipe === 'topup' ? 'Setor BNI Virtual Account' : 'Tarik Koin (Rumah Koin)'),
              nominal: t.nominal || 0,
              saldoAfter: t.saldo_setelah ?? null,
              type: (t.nominal || 0) > 0 ? 'masuk' : 'keluar',
            };
          })
        )
      )
      .catch((e) => setError(e.message || 'Gagal memuat riwayat transaksi.'))
      .finally(() => setLoading(false));
  }, []);

  // Filtering
  const filteredData = transactions.filter((item) => {
    if (filterType === 'masuk' && item.type !== 'masuk') return false;
    if (filterType === 'keluar' && item.type !== 'keluar') return false;
    if (startDate && item.rawDate < startDate) return false;
    if (endDate && item.rawDate > endDate) return false;
    return true;
  });

  const totalMasuk = transactions
    .filter((t) => t.type === 'masuk')
    .reduce((sum, t) => sum + t.nominal, 0);

  const totalKeluar = Math.abs(
    transactions
      .filter((t) => t.type === 'keluar')
      .reduce((sum, t) => sum + t.nominal, 0)
  );

  const handleExportExcel = () => {
    waliApi
      .export({
        tipe: filterType === 'semua' ? undefined : filterType,
        dari: startDate || undefined,
        sampai: endDate || undefined,
      })
      .catch((e) => setError(e.message || 'Gagal mengekspor riwayat transaksi.'));
  };

  return (
    <WaliLayout pageTitle="Riwayat Transaksi — Arus Kas Saldo">
      <div className="wali-riwayat-page flex flex-col gap-6">
        <div className="wali-header-subtitle text-sm text-slate-500 -mt-3 mb-1 font-medium">
          Pondok Pesantren Nazhatut Thullab
        </div>

        {error && (
          <div className="px-4 py-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 rounded-2xl text-sm font-semibold text-rose-700 dark:text-rose-300">
            {error}
          </div>
        )}

        {loading && (
          <div className="flex items-center justify-center h-32 text-slate-500 dark:text-slate-400 font-medium">
            Memuat riwayat transaksi...
          </div>
        )}

        {/* Filter Bar & Export */}
        <div className="wali-filter-card bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4 shadow-xs">
          <div className="wali-filter-left flex flex-wrap items-center gap-6">
            <div className="wali-type-buttons flex gap-2">
              <button
                className={`wali-type-btn px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
                  filterType === 'semua'
                    ? 'wali-type-btn--active bg-emerald-800 dark:bg-emerald-700 text-white border-emerald-800 shadow-xs'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
                }`}
                onClick={() => setFilterType('semua')}
              >
                Semua
              </button>
              <button
                className={`wali-type-btn px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
                  filterType === 'masuk'
                    ? 'wali-type-btn--active bg-emerald-800 dark:bg-emerald-700 text-white border-emerald-800 shadow-xs'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
                }`}
                onClick={() => setFilterType('masuk')}
              >
                + Masuk
              </button>
              <button
                className={`wali-type-btn px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
                  filterType === 'keluar'
                    ? 'wali-type-btn--active bg-emerald-800 dark:bg-emerald-700 text-white border-emerald-800 shadow-xs'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
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
                  className="filter-date px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-700 dark:text-slate-100 focus:outline-none focus:border-emerald-600"
                />
              </div>
              <div className="date-input-group flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">SAMPAI TANGGAL</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="filter-date px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-700 dark:text-slate-100 focus:outline-none focus:border-emerald-600"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 3 Summary Stat Cards */}
        <div className="wali-summary-grid grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="wali-summary-card bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 flex flex-col gap-1.5 shadow-xs">
            <span className="summary-label text-[11px] font-bold tracking-wider text-slate-400 uppercase">
              TOTAL TRANSAKSI
            </span>
            <span className="summary-val text-xl font-extrabold text-slate-800 dark:text-slate-100">
              {transactions.length} entri
            </span>
          </div>
          <div className="wali-summary-card wali-summary-card--green bg-emerald-50 dark:bg-slate-800 border border-emerald-200 dark:border-emerald-800/80 rounded-2xl p-5 flex flex-col gap-1.5 shadow-xs">
            <span className="summary-label text-[11px] font-bold tracking-wider text-emerald-800 dark:text-emerald-400 uppercase">
              TOTAL SALDO MASUK
            </span>
            <span className="summary-val text-xl font-extrabold text-emerald-600 dark:text-emerald-400">
              Rp {totalMasuk.toLocaleString('id-ID')}
            </span>
          </div>
          <div className="wali-summary-card wali-summary-card--orange bg-amber-50 dark:bg-slate-800 border border-amber-200 dark:border-amber-800/80 rounded-2xl p-5 flex flex-col gap-1.5 shadow-xs">
            <span className="summary-label text-[11px] font-bold tracking-wider text-amber-800 dark:text-amber-400 uppercase">
              TOTAL KOIN DITARIK
            </span>
            <span className="summary-val text-xl font-extrabold text-amber-600 dark:text-amber-400">
              Rp {totalKeluar.toLocaleString('id-ID')}
            </span>
          </div>
        </div>

        {/* Data Table */}
        <div className="wali-table-card bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-6 shadow-xs flex flex-col gap-5">
          <div className="wali-table-header flex justify-between items-center">
            <h3 className="wali-table-title text-base font-bold text-slate-800 dark:text-slate-100">Daftar Arus Kas Saldo</h3>
            <span className="wali-table-count text-xs text-slate-400 font-medium">
              {filteredData.length} dari {transactions.length} transaksi
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
                    <td className="px-4 py-3.5 text-xs font-medium whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-800 dark:text-slate-100">{item.tanggal}</span>
                        {item.waktu && <span className="text-[11px] font-mono text-slate-400 dark:text-slate-500">{item.waktu}</span>}
                      </div>
                    </td>
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
                      {item.saldoAfter != null
                        ? `Rp ${item.saldoAfter.toLocaleString('id-ID')}`
                        : '—'}
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

          <div className="wali-table-footer flex justify-end items-center pt-4 border-t border-slate-100 text-xs text-slate-500 font-medium">
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
