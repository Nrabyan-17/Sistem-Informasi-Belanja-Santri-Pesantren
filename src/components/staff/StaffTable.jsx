import DataTable from '../common/DataTable';
import Badge from '../common/Badge';

// Tabel Daftar Staff Rumah Koin
const StaffTable = ({ data = [], loading = false, loadingText = 'Memuat data Staff...', onEdit, onDelete }) => {
  const columns = [
    { key: 'no',       label: 'No',       render: (_, idx) => idx + 1 },
    { key: 'nip',      label: 'NIP' },
    { key: 'nama',     label: 'Nama Staff' },
    { key: 'jabatan',  label: 'Jabatan' },
    { key: 'noHp',     label: 'No. Handphone' },
    { key: 'status',   label: 'Status', render: (row) => <Badge status={row.status} /> },
    { key: 'shift',    label: 'Shift' },
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

  return <DataTable columns={columns} data={data} loading={loading} loadingText={loadingText} emptyText="Tidak ada data staff." />;
};

export default StaffTable;
