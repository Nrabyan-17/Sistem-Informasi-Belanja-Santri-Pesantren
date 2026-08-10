import DataTable from '../common/DataTable';
import Badge from '../common/Badge';

// Tabel Daftar Santri & Admin
const UserTable = ({ data = [], onEdit, onDelete }) => {
  const columns = [
    { key: 'nis',       label: 'NIS' },
    { key: 'nama',      label: 'Nama Santri' },
    { key: 'kelas',     label: 'Kelas' },
    { key: 'status',    label: 'Status',  render: (row) => <Badge status={row.status} /> },
    { key: 'saldo',     label: 'Saldo',   render: (row) => `Rp ${row.saldo?.toLocaleString('id-ID')}` },
    {
      key: 'aksi',
      label: 'Aksi',
      render: (row) => (
        <div className="action-buttons">
          <button className="btn btn-edit" onClick={() => onEdit?.(row)}>Edit</button>
          <button className="btn btn-delete" onClick={() => onDelete?.(row)}>Hapus</button>
        </div>
      ),
    },
  ];

  return <DataTable columns={columns} data={data} emptyText="Tidak ada data pengguna." />;
};

export default UserTable;
