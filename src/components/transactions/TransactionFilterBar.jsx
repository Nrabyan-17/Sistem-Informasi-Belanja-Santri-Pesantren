import React from 'react';

// Filter Bar Transaksi: Cari Santri, Jenis (Semua, Masuk, Keluar), Dari, Sampai, Ekspor .xlsx
const TransactionFilterBar = ({
  search = '',
  onSearchChange,
  jenis = 'Semua',
  onJenisChange,
  dari = '',
  onDariChange,
  sampai = '',
  onSampaiChange,
  onExport,
}) => {
  return (
    <div className="transaction-filter-card">
      <div className="filter-group-wrapper">
        {/* CARI SANTRI */}
        <div className="filter-field filter-field--search">
          <label className="filter-label">CARI SANTRI</label>
          <div className="search-input-wrapper">
            <svg className="search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Nama atau NIS..."
              value={search}
              onChange={(e) => onSearchChange?.(e.target.value)}
              className="filter-input tx-search-input"
            />
          </div>
        </div>

        {/* JENIS */}
        <div className="filter-field">
          <label className="filter-label">JENIS</label>
          <div className="segmented-control">
            <button
              type="button"
              className={`segmented-btn ${jenis === 'Semua' ? 'segmented-btn--active' : ''}`}
              onClick={() => onJenisChange?.('Semua')}
            >
              Semua
            </button>
            <button
              type="button"
              className={`segmented-btn ${jenis === 'Masuk' ? 'segmented-btn--active' : ''}`}
              onClick={() => onJenisChange?.('Masuk')}
            >
              &darr; Masuk
            </button>
            <button
              type="button"
              className={`segmented-btn ${jenis === 'Keluar' ? 'segmented-btn--active' : ''}`}
              onClick={() => onJenisChange?.('Keluar')}
            >
              &uarr; Keluar
            </button>
          </div>
        </div>

        {/* DARI */}
        <div className="filter-field">
          <label className="filter-label">DARI</label>
          <div className="date-input-wrapper">
            <input
              type="date"
              value={dari}
              onChange={(e) => onDariChange?.(e.target.value)}
              className="filter-input date-input"
            />
          </div>
        </div>

        {/* SAMPAI */}
        <div className="filter-field">
          <label className="filter-label">SAMPAI</label>
          <div className="date-input-wrapper">
            <input
              type="date"
              value={sampai}
              onChange={(e) => onSampaiChange?.(e.target.value)}
              className="filter-input date-input"
            />
          </div>
        </div>

        {/* EKSPOR .XLSX */}
        <div className="filter-field filter-field--action">
          <label className="filter-label opacity-0 pointer-events-none hidden sm:block">EKSPOR</label>
          <button type="button" onClick={onExport} className="btn-export-excel">
            <svg className="w-4 h-4 mr-2 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Ekspor .xlsx
          </button>
        </div>
      </div>
    </div>
  );
};

export default TransactionFilterBar;
