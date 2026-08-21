const RecentTransactionsWidget = ({ transactions = [] }) => {
  const data = Array.isArray(transactions) ? transactions : [];

  return (
    <div className="recent-transactions bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xs">
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100 dark:border-slate-800 gap-2">
        <div>
          <h3 className="widget-title text-base font-extrabold text-slate-800 dark:text-slate-100 !mb-0 !pb-0 !border-none">
            Transaksi Terbaru
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Aktivitas transaksi koin dan isi saldo santri hari ini
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[11px] font-extrabold text-emerald-800 dark:text-emerald-300 bg-emerald-100/80 dark:bg-emerald-950/80 px-2.5 py-1 rounded-full border border-emerald-300/80 dark:border-emerald-700/80 sm:hidden">
            ← Geser Tabel →
          </span>
          <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 hidden sm:inline">
            {data.length} Transaksi Hari Ini
          </span>
        </div>
      </div>

      <div className="overflow-x-auto pb-2">
        <table className="user-table w-full text-left min-w-[540px]">
          <thead>
            <tr>
              <th className="text-left">SANTRI</th>
              <th className="text-left">KATEGORI</th>
              <th className="text-left">WAKTU</th>
              <th className="text-right">NOMINAL</th>
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan="4" className="text-center py-6 text-slate-400 font-medium">
                  Belum ada transaksi hari ini.
                </td>
              </tr>
            ) : (
              data.map((trx, idx) => (
                <tr key={trx.id || idx} className="user-table-row">
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 font-bold text-xs flex items-center justify-center shrink-0">
                        {(trx.namaSantri || 'S').charAt(0).toUpperCase()}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-900 dark:text-slate-100 text-xs sm:text-sm">
                          {trx.namaSantri}
                        </span>
                        {trx.nis && (
                          <span className="text-[11px] text-slate-400 font-mono">
                            NIS: {trx.nis}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {trx.kategori || 'Penarikan Koin'}
                    </span>
                  </td>
                  <td className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    {trx.waktu || '10:00 WIB'}
                  </td>
                  <td className="text-right font-extrabold text-xs sm:text-sm text-emerald-700 dark:text-emerald-400">
                    Rp {(trx.nominal || 0).toLocaleString('id-ID')}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RecentTransactionsWidget;
