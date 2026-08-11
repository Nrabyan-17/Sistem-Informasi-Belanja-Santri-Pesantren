import DataTable from '../common/DataTable';
import Badge from '../common/Badge';

// Tabel Daftar Santri & Admin
const UserTable = ({ data = [], onEdit, onDelete, onDetailSaldo, showDelete = true, showPhone = false }) => {
  const columns = [
    { key: 'nis',       label: 'NIS' },
    { key: 'nama',      label: 'Nama Santri' },
    { key: 'kelas',     label: 'Kelas' },
    ...(showPhone ? [{ key: 'noHp', label: 'No. Handphone', render: (row) => row.noHp || '-' }] : []),
    { key: 'status',    label: 'Status',  render: (row) => <Badge status={row.status} /> },
    { key: 'saldo',     label: 'Saldo',   render: (row) => `Rp ${row.saldo?.toLocaleString('id-ID')}` },
    {
      key: 'aksi',
      label: 'Aksi',
      render: (row) => (
        <div className="action-buttons">
          <button className="btn btn-saldo" onClick={() => onDetailSaldo?.(row)} title="Detail & Penyesuaian Saldo">
            💳 Saldo
          </button>
          <button className="btn btn-edit" onClick={() => onEdit?.(row)}>Edit</button>
          {showDelete && (
            <button className="btn btn-delete" onClick={() => onDelete?.(row)}>Hapus</button>
          )}
        </div>
      ),
    },
  ];

  return <DataTable columns={columns} data={data} emptyText="Tidak ada data pengguna." />;
};

export default UserTable;
