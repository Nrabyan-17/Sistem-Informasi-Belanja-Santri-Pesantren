// Tabel Daftar Data Santri Pesantren
const SantriTable = ({
  data = [],
  totalCount = 0,
  activeCount = 0,
  nonactiveCount = 0,
  selectedIds = [],
  onToggleSelectAll,
  onToggleSelectRow,
  onViewDetail,
  onEdit,
  onDelete,
}) => {
  const formatRupiah = (val) =>
    'Rp ' + Number(val).toLocaleString('id-ID');

  const allSelected = data.length > 0 && selectedIds.length === data.length;

  return (
    <div className="user-table-card">
      <div className="user-table-header flex items-center justify-between gap-2">
        <div>
          <h3 className="user-table-title">Daftar Data Santri</h3>
          <p className="user-table-subtitle">
            {data.length} santri ditampilkan &middot; Klik nama untuk lihat detail
          </p>
        </div>
        <span className="text-[11px] font-extrabold text-amber-800 dark:text-amber-300 bg-amber-100/80 dark:bg-amber-950/80 px-2.5 py-1 rounded-full border border-amber-300/80 dark:border-amber-700/80 sm:hidden shrink-0">
          ← Geser Tabel →
        </span>
      </div>

      <div className="user-table-wrapper overflow-x-auto pb-1">
        <table className="user-table w-full min-w-[680px]">
          <thead>
            <tr>
              <th className="w-10 text-center">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={onToggleSelectAll}
                  className="user-checkbox"
                />
              </th>
              <th className="text-left">SANTRI</th>
              <th className="text-left">KELAS</th>
              <th className="text-left">WALI SANTRI</th>
              <th className="text-left">SALDO</th>
              <th className="text-left">STATUS</th>
              <th className="text-center">AKSI</th>
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-8 text-slate-400 font-medium">
                  Tidak ada data santri yang sesuai filter.
                </td>
              </tr>
            ) : (
              data.map((santri) => {
                const isChecked = selectedIds.includes(santri.id);
                return (
                  <tr key={santri.id} className="user-table-row hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="text-center">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => onToggleSelectRow?.(santri.id)}
                        className="user-checkbox"
                      />
                    </td>
                    <td onClick={() => onViewDetail?.(santri)} className="cursor-pointer group py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 font-extrabold text-xs flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:bg-amber-700 group-hover:text-white transition-all shadow-2xs">
                          {(santri.nama || 'S').charAt(0).toUpperCase()}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-extrabold text-slate-900 dark:text-slate-100 text-sm group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors">
                            {santri.nama}
                          </span>
                          <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-mono font-bold">
                            NIS: {santri.nis}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300">
                        {santri.kelas}
                      </span>
                    </td>
                    <td className="py-3">
                      <span className="font-bold text-slate-800 dark:text-slate-200 text-sm">
                        {santri.namaWali || '—'}
                      </span>
                    </td>
                    <td>
                      <span className="font-bold text-slate-900 dark:text-slate-100 text-sm font-mono">
                        {formatRupiah(santri.saldo || 0)}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          santri.status === 'aktif'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                        }`}
                      >
                        <span className="mr-1">{santri.status === 'aktif' ? '●' : '○'}</span>
                        {santri.status === 'aktif' ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </td>
                    <td className="text-center">
                      <div className="flex items-center justify-center gap-2.5">
                        <button
                          type="button"
                          onClick={() => onEdit?.(santri)}
                          className="btn-edit-user cursor-pointer"
                        >
                          Edit
                        </button>
                        {onDelete && (
                          <button
                            type="button"
                            onClick={() => onDelete?.(santri)}
                            className="btn-delete-user cursor-pointer"
                          >
                            Hapus
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="user-table-footer">
        <span className="text-xs font-semibold text-slate-400">
          {data.length} dari {totalCount} santri &middot; {activeCount} aktif &middot; {nonactiveCount} nonaktif
        </span>
      </div>
    </div>
  );
};

export default SantriTable;
