// Badge Status: Sukses (Hijau), Pending (Kuning), Gagal (Merah)
const Badge = ({ status, label }) => {
  const styles = {
    sukses: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    aktif: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    pending: 'bg-amber-50 text-amber-700 border-amber-200',
    gagal: 'bg-rose-50 text-rose-700 border-rose-200',
    nonaktif: 'bg-rose-50 text-rose-700 border-rose-200',
  };

  const statusKey = status?.toLowerCase() || '';

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${
        styles[statusKey] || 'bg-slate-100 text-slate-700 border-slate-200'
      }`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
      {label || status}
    </span>
  );
};

export default Badge;
