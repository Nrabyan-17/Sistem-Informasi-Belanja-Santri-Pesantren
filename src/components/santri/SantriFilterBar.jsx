import React from 'react';

// Filter Bar Data Santri: Search, Status Dropdown, Tombol Tambah & Import
const SantriFilterBar = ({
  search = '',
  onSearchChange,
  status = 'Semua Status',
  onStatusChange,
  onAddSantri,
  onImportSantri,
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

        {/* Button Import Santri (Batch) */}
        {onImportSantri && (
          <div className="user-add-field">
            <button
              type="button"
              onClick={onImportSantri}
              className="btn-import-user flex items-center justify-center gap-1.5"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              <span>Import Batch</span>
            </button>
          </div>
        )}

        {/* Button Tambah Santri */}
        {onAddSantri && (
          <div className="user-add-field">
            <button
              type="button"
              onClick={onAddSantri}
              className="btn-add-user flex items-center justify-center gap-1.5"
            >
              <span>+ Tambah Santri</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SantriFilterBar;
