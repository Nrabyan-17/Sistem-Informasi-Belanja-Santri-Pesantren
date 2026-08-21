// DataTable: Tabel dengan header dan baris data
const DataTable = ({
  columns = [],
  data = [],
  loading = false,
  loadingText = 'Memuat data...',
  emptyText = 'Tidak ada data.',
}) => {
  return (
    <div className="data-table-wrapper w-full overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs transition-colors duration-200 pb-1">
      <table className="data-table w-full text-left border-collapse text-sm text-slate-700 dark:text-slate-200 min-w-[640px]">
        <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className="px-5 py-3.5 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider"
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
          {loading ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-5 py-12 text-center text-slate-500 dark:text-slate-400 font-semibold"
              >
                <div className="flex flex-col items-center justify-center gap-3">
                  <svg
                    className="w-7 h-7 text-emerald-600 dark:text-emerald-400 animate-spin"
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
              <td
                colSpan={columns.length}
                className="px-5 py-8 text-center text-slate-400 dark:text-slate-500 font-medium"
              >
                {emptyText}
              </td>
            </tr>
          ) : (
            data.map((row, idx) => (
              <tr key={idx} className="hover:bg-slate-100/80 dark:hover:bg-slate-800/80 transition-colors">
                {columns.map((col) => (
                  <td key={col.key} className="px-5 py-4 whitespace-nowrap">
                    {col.render ? col.render(row, idx) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;