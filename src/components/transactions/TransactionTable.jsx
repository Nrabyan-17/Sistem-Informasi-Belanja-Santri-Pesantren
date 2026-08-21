import React from 'react';
import DataTable from '../common/DataTable';
import Badge from '../common/Badge';

// Tabel daftar transaksi pada halaman Manajemen Transaksi
const TransactionTable = ({ data = [] }) => {
  const columns = [
    { key: 'no', label: 'NO', render: (_, idx) => idx + 1 },
    {
      key: 'waktu_transaksi',
      label: 'WAKTU TRANSAKSI',
      render: (row) => {
        const raw = row.created_at || row.tanggal;
        if (!raw) return <span className="text-slate-400 font-mono text-xs">—</span>;

        const d = new Date(raw);
        const isValidDate = !isNaN(d.getTime());

        const dateStr = isValidDate
          ? `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
          : (row.tanggal || '-');

        const timeStr = isValidDate
          ? d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' WIB'
          : (row.waktu || '');

        return (
          <div className="flex flex-col gap-0.5 whitespace-nowrap">
            <span className="font-semibold text-slate-800 dark:text-slate-200 text-xs sm:text-sm">
              {dateStr}
            </span>
            {timeStr ? (
              <span className="text-[11px] font-mono text-slate-400 dark:text-slate-500 font-medium">
                {timeStr}
              </span>
            ) : null}
          </div>
        );
      },
    },
    { key: 'nis',         label: 'NIS', render: (row) => row.nis || '-' },
    { key: 'namaSantri',  label: 'SANTRI' },
    {
      key: 'jenis',
      label: 'JENIS',
      render: (row) => (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
            row.jenis === 'Masuk' || row.kategori === 'Top Up'
              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
              : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
          }`}
        >
          {row.jenis || (row.kategori === 'Top Up' ? 'Masuk' : 'Keluar')}
        </span>
      ),
    },
    {
      key: 'nominal',
      label: 'NOMINAL',
      render: (row) => (
        <span className="font-semibold text-slate-800 dark:text-slate-200">
          Rp {row.nominal?.toLocaleString('id-ID')}
        </span>
      ),
    },
    {
      key: 'staff',
      label: 'STAFF',
      render: (row) => (
        <span className="font-semibold text-slate-700 dark:text-slate-300 text-xs">
          {row.staff || 'Ust. Miftahul Huda'}
        </span>
      ),
    },
    { key: 'status',      label: 'STATUS', render: (row) => <Badge status={row.status} /> },
  ];

  return <DataTable columns={columns} data={data} emptyText="Tidak ada data transaksi yang sesuai filter." />;
};

export default TransactionTable;
