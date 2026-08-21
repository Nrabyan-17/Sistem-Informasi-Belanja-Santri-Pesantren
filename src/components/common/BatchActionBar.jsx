import React from 'react';

// Batch Action Bar - Tampil di atas tabel dengan tombol proporsional dan jarak lega dari tabel
const BatchActionBar = ({
  selectedCount = 0,
  onBatchStatusChange,
  onBatchDelete,
  itemLabel = 'data',
}) => {
  if (selectedCount === 0) return null;

  return (
    <div className="w-full flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 py-1 px-1 mb-6 sm:mb-8 animate-fadeIn">
      {/* Kolom Kiri: Informasi Jumlah Terpilih */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-black text-xs sm:text-sm flex items-center justify-center shadow-xs shrink-0">
          {selectedCount}
        </div>
        <div className="flex items-center gap-2">
          <span className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-slate-100">
            {selectedCount} {itemLabel} dipilih
          </span>
          <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 hidden md:inline ml-1">
            Pilih aksi massal:
          </span>
        </div>
      </div>

      {/* Kolom Kanan: Tombol-Tombol Aksi Massal */}
      <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap w-full lg:w-auto justify-start lg:justify-end">
        {onBatchStatusChange && (
          <>
            <button
              type="button"
              onClick={() => onBatchStatusChange('aktif')}
              className="h-11 sm:h-12 px-5 sm:px-6 bg-emerald-700 hover:bg-emerald-800 active:scale-95 text-white font-extrabold rounded-xl sm:rounded-2xl text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs min-w-[120px]"
              title="Ubah status semua data terpilih menjadi Aktif"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-300"></span>
              <span>Set Aktif</span>
            </button>

            <button
              type="button"
              onClick={() => onBatchStatusChange('nonaktif')}
              className="h-11 sm:h-12 px-5 sm:px-6 bg-slate-700 hover:bg-slate-800 active:scale-95 text-white font-extrabold rounded-xl sm:rounded-2xl text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs min-w-[130px]"
              title="Ubah status semua data terpilih menjadi Nonaktif"
            >
              <span className="w-2 h-2 rounded-full bg-slate-400"></span>
              <span>Set Nonaktif</span>
            </button>
          </>
        )}

        {onBatchDelete && (
          <button
            type="button"
            onClick={onBatchDelete}
            className="h-11 sm:h-12 px-5 sm:px-6 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-extrabold rounded-xl sm:rounded-2xl text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm shadow-rose-900/20 min-w-[120px]"
            title="Hapus semua data terpilih sekaligus"
          >
            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            <span>Hapus ({selectedCount})</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default BatchActionBar;
