// Badge Status: Sukses (Hijau), Pending (Kuning), Gagal (Merah)
const Badge = ({ status, label }) => {
  const styles = {
    sukses: 'badge-sukses',
    pending: 'badge-pending',
    gagal: 'badge-gagal',
    aktif: 'badge-sukses',
    nonaktif: 'badge-gagal',
  };

  return (
    <span className={`badge ${styles[status?.toLowerCase()] || 'badge-default'}`}>
      {label || status}
    </span>
  );
};

export default Badge;
