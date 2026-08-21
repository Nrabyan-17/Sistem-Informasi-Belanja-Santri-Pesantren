// Tabel Daftar Pengguna Sistem
const UserTable = ({
  category = 'all',
  loading = false,
  loadingText = 'Memuat data...',
  data = [],
  totalCount = 7,
  activeCount = 6,
  nonactiveCount = 1,
  selectedIds = [],
  onToggleSelectAll,
  onToggleSelectRow,
  onViewDetail,
  onEdit,
  onDelete,
}) => {
  const isWaliCategory = category === 'wali';
  const allSelected = data.length > 0 && selectedIds.length === data.length;

  return (
    <div className="user-table-card">
      <div className="user-table-header flex items-center justify-between gap-2">
        <div>
          <h3 className="user-table-title">
            {isWaliCategory ? 'Daftar Akun Wali Santri' : 'Daftar Pengguna Sistem'}
          </h3>
          <p className="user-table-subtitle">
            {loading ? (
              <span className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold animate-pulse">
                <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                {loadingText}
              </span>
            ) : (
              `${data.length} ${isWaliCategory ? 'akun wali santri' : 'pengguna'} ditampilkan · Klik nama untuk lihat detail`
            )}
          </p>
        </div>
        <span className="text-[11px] font-extrabold text-emerald-800 dark:text-emerald-300 bg-emerald-100/80 dark:bg-emerald-950/80 px-2.5 py-1 rounded-full border border-emerald-300/80 dark:border-emerald-700/80 sm:hidden shrink-0">
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
                  disabled={loading || data.length === 0}
                  className="user-checkbox"
                />
              </th>
              <th className="text-left">{isWaliCategory ? 'WALI SANTRI' : 'PENGGUNA'}</th>
              {isWaliCategory ? (
                <>
                  <th className="text-left">SANTRI TERHUBUNG / NIS</th>
                  <th className="text-left">NO. VA BNI SANTRI</th>
                </>
              ) : (
                <th className="text-left">ROLE</th>
              )}
              <th className="text-left">STATUS</th>
              <th className="text-left">LOGIN TERAKHIR</th>
              <th className="text-center">AKSI</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={isWaliCategory ? 7 : 6}
                  className="text-center py-14 text-slate-500 dark:text-slate-400 font-semibold"
                >
                  <div className="flex flex-col items-center justify-center gap-3">
                    <svg
                      className="w-8 h-8 text-emerald-600 dark:text-emerald-400 animate-spin"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-200">
                      {loadingText}
                    </span>
                  </div>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={isWaliCategory ? 7 : 6} className="text-center py-8 text-slate-400 font-medium">
                  Tidak ada {isWaliCategory ? 'wali santri' : 'pengguna'} yang sesuai filter.
                </td>
              </tr>
            ) : (
              data.map((user) => {
                const isChecked = selectedIds.includes(user.id);
                return (
                  <tr key={user.id} className="user-table-row hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="text-center">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => onToggleSelectRow?.(user.id)}
                        className="user-checkbox"
                      />
                    </td>
                    <td onClick={() => onViewDetail?.(user)} className="cursor-pointer group py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 font-extrabold text-xs flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:bg-emerald-700 group-hover:text-white transition-all shadow-2xs">
                          {(user.nama || 'U').charAt(0).toUpperCase()}
                        </div>
                        <span className="font-extrabold text-slate-900 dark:text-slate-100 text-sm group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                          {user.nama}
                        </span>
                      </div>
                    </td>
                    {isWaliCategory ? (
                      <>
                        <td className="py-3">
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-800 dark:text-slate-200 text-sm">
                              {user.santri || '—'}
                            </span>
                            <span className="text-[11px] font-mono font-bold text-emerald-700 dark:text-emerald-400">
                              NIS: {user.nis || '—'}
                            </span>
                          </div>
                        </td>
                        <td className="py-3">
                          <span className="font-mono text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-200/80 dark:border-slate-700/80 inline-block">
                            {user.noVa || '—'}
                          </span>
                        </td>
                      </>
                    ) : (
                      <td>
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                            user.role === 'Kabid BAK & Manajerial'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : user.role === 'Staff Rumah Koin'
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                              : 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                          }`}
                        >
                          {user.role}
                        </span>
                      </td>
                    )}
                    <td>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          user.status === 'Aktif'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                        }`}
                      >
                        <span className="mr-1">{user.status === 'Aktif' ? '●' : '○'}</span>
                        {user.status}
                      </span>
                    </td>
                    <td className="text-slate-600 dark:text-slate-400 text-sm font-medium">
                      {user.loginTerakhir}
                    </td>
                    <td className="text-center">
                      <div className="flex items-center justify-center gap-2.5">
                        <button
                          type="button"
                          onClick={() => onEdit?.(user)}
                          className="btn-edit-user cursor-pointer"
                        >
                          Edit
                        </button>
                        {onDelete && (
                          <button
                            type="button"
                            onClick={() => onDelete?.(user)}
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
          {data.length} dari {totalCount} pengguna &middot; {activeCount} aktif &middot; {nonactiveCount} nonaktif
        </span>
      </div>
    </div>
  );
};

export default UserTable;
