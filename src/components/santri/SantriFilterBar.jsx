import React from 'react';

const SantriFilterBar = ({
  search = '',
  onSearchChange,
  status = 'Semua Status',
  onStatusChange,
  onAddSantri,
  onUploadBatch,
}) => {
  return (
    <div className="user-filter-card">
      <div className="user-filter-wrapper">
        {/* Search Input */}
        <div className="user-search-field relative flex items-center">
          <svg
            className="absolute left-3.5 w-4 h-4 text-slate-400 dark:text-slate-500 pointer-events-none z-10"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2.2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            placeholder="Cari NIS atau nama santri..."
            value={search}
            onChange={(e) => onSearchChange?.(e.target.value)}
            className="user-search-input pl-10"
          />
        </div>

        {/* Status Dropdown */}
        <div className="user-select-field">
          <select
            value={status}
            onChange={(e) => onStatusChange?.(e.target.value)}
            className="user-filter-select"
          >
            <option value="Semua Status">Semua Status</option>
            <option value="aktif">Aktif</option>
            <option value="nonaktif">Nonaktif</option>
          </select>
        </div>

        {/* Button Tambah & Import Batch Santri */}
        <div className="user-add-field flex items-center gap-3">
          {onUploadBatch && (
            <button
              type="button"
              onClick={onUploadBatch}
              className="h-11 sm:h-12 px-6 bg-white dark:bg-slate-800 border-2 border-emerald-600/50 dark:border-emerald-500/50 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 hover:border-emerald-700 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer flex items-center justify-center gap-2.5 shadow-xs active:scale-95 shrink-0 whitespace-nowrap min-w-[150px]"
              title="Import data banyak santri sekaligus via CSV/Excel"
            >
              <svg className="w-4 h-4 text-emerald-700 dark:text-emerald-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              <span className="tracking-wide">Import Batch</span>
            </button>
          )}

          {onAddSantri && (
            <button
              type="button"
              onClick={onAddSantri}
              className="btn-add-user h-11 sm:h-12 px-6 flex items-center justify-center gap-2 text-xs sm:text-sm font-extrabold rounded-xl sm:rounded-2xl shadow-md transition-all active:scale-95 shrink-0 whitespace-nowrap"
            >
              <span>+ Tambah Santri</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SantriFilterBar;
