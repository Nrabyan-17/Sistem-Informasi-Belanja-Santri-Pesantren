import DataTable from '../common/DataTable';
import Badge from '../common/Badge';

// Tabel daftar transaksi pada halaman Manajemen Transaksi
const TransactionTable = ({ data = [] }) => {
  const columns = [
    { key: 'no',          label: 'No' },
    { key: 'tanggal',     label: 'Tanggal' },
    { key: 'namaSantri',  label: 'Santri' },
    { key: 'kategori',    label: 'Kategori' },
    { key: 'nominal',     label: 'Nominal', render: (row) => `Rp ${row.nominal?.toLocaleString('id-ID')}` },
    { key: 'status',      label: 'Status',  render: (row) => <Badge status={row.status} /> },
  ];

  return <DataTable columns={columns} data={data} emptyText="Tidak ada data transaksi." />;
};

export default TransactionTable;
