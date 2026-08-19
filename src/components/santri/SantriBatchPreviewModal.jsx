import { useState, useMemo } from 'react';
import Modal from '../common/Modal';

const SantriBatchPreviewModal = ({
  isOpen,
  onClose,
  previewData = [],
  onConfirmSave,
  isSaving = false,
}) => {
  const [items, setItems] = useState(previewData);
  const [selectedIds, setSelectedIds] = useState(() => new Set(previewData.map((it) => it.temp_id)));
  const [search, setSearch] = useState('');
  const [editingItem, setEditingItem] = useState(null);

  // Sync state if previewData changes
  useMemo(() => {
    setItems(previewData);
    setSelectedIds(new Set(previewData.map((it) => it.temp_id)));
  }, [previewData]);

  const filteredItems = useMemo(() => {
    return items.filter((it) => {
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchesNama = it.nama?.toLowerCase().includes(q);
        const matchesNis = it.nis?.toLowerCase().includes(q);
        const matchesVa = it.va_jajan?.toLowerCase().includes(q);
        if (!matchesNama && !matchesNis && !matchesVa) return false;
      }
      return true;
    });
  }, [items, search]);

  const isAllSelected = filteredItems.length > 0 && filteredItems.every((it) => selectedIds.has(it.temp_id));

  const handleToggleSelectAll = () => {
    if (isAllSelected) {
      const next = new Set(selectedIds);
      filteredItems.forEach((it) => next.delete(it.temp_id));
      setSelectedIds(next);
    } else {
      const next = new Set(selectedIds);
      filteredItems.forEach((it) => next.add(it.temp_id));
      setSelectedIds(next);
    }
  };

  const handleToggleSelect = (id) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const handleDeleteItem = (id) => {
    setItems((prev) => prev.filter((it) => it.temp_id !== id));
    const next = new Set(selectedIds);
    next.delete(id);
    setSelectedIds(next);
  };

  const handleOpenEdit = (item) => {
    setEditingItem({ ...item });
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!editingItem) return;
    setItems((prev) =>
      prev.map((it) => (it.temp_id === editingItem.temp_id ? editingItem : it))
    );
    setEditingItem(null);
  };

  const handleConfirm = () => {
    const selectedList = items.filter((it) => selectedIds.has(it.temp_id));
    if (selectedList.length === 0) return;
    onConfirmSave?.(selectedList);
  };

  const selectedCount = items.filter((it) => selectedIds.has(it.temp_id)).length;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Preview & Crosscheck Data Santri (Batch Upload)"
      subtitle="Periksa dan sesuaikan data yang diekstrak dari file Excel sebelum disimpan permanen ke database."
      maxWidth="max-w-[95vw] lg:max-w-[1400px]"
    >
      <div className="flex flex-col gap-5 pt-1">
        {/* Top Control Bar: Search & Filter Unit */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700/80">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:min-w-[320px]">
              <svg
                className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Cari NIS, Nama, atau VA..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-10 pl-10 pr-3.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:border-emerald-600"
              />
            </div>

          </div>

          <div className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300 w-full sm:w-auto justify-between sm:justify-end">
            <span>
              Terpilih: <strong className="text-emerald-700 dark:text-emerald-400">{selectedCount}</strong> dari {items.length} santri
            </span>
          </div>
        </div>

        {/* Table Container */}
        <div className="overflow-x-auto border border-slate-200 dark:border-slate-700/80 rounded-2xl max-h-[65vh] overflow-y-auto custom-scrollbar">
          <table className="w-full text-left border-collapse text-[13px]">
            <thead className="bg-slate-100/90 dark:bg-slate-800/90 sticky top-0 z-10 text-xs font-extrabold text-slate-600 dark:text-slate-300 uppercase tracking-wider border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="px-3 py-3 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={handleToggleSelectAll}
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                  />
                </th>
                <th className="px-3 py-3">NIS</th>
                <th className="px-3 py-3 min-w-[180px]">Nama Santri</th>
                <th className="px-3 py-3 text-center">L/P</th>
                <th className="px-3 py-3 text-center">Tgl Lahir</th>
                <th className="px-3 py-3">VA Jajan</th>
                <th className="px-3 py-3 text-center">Status Data</th>
                <th className="px-3 py-3 text-center w-20">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 font-medium">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan="10" className="p-8 text-center text-slate-400">
                    Tidak ada data santri yang cocok.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => {
                  const isSelected = selectedIds.has(item.temp_id);
                  return (
                    <tr
                      key={item.temp_id}
                      className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors ${
                        isSelected ? 'bg-emerald-50/20 dark:bg-emerald-950/10' : ''
                      }`}
                    >
                      <td className="px-3 py-2 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelect(item.temp_id)}
                          className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                        />
                      </td>
                      <td className="px-3 py-2 font-mono font-bold text-slate-900 dark:text-slate-100">
                        {item.nis}
                      </td>
                      <td className="px-3 py-2 font-bold text-slate-900 dark:text-slate-100 min-w-[180px]">
                        {item.nama}
                      </td>
                      <td className="px-3 py-2 text-center">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                          item.jenis_kelamin === 'L'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300'
                            : 'bg-pink-100 text-pink-800 dark:bg-pink-950/60 dark:text-pink-300'
                        }`}>
                          {item.jenis_kelamin === 'L' ? 'L' : 'P'}
                        </span>
                      </td>
                      <td className="px-3 py-2 font-mono text-slate-600 dark:text-slate-400 text-xs text-center">
                        {item.tanggal_lahir || '—'}
                      </td>
                      <td className="px-3 py-2 font-mono font-semibold text-emerald-700 dark:text-emerald-400 text-xs">
                        {item.va_jajan || '—'}
                      </td>
                      <td className="px-3 py-2 text-center">
                        {item.is_exists ? (
                          <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 text-[11px] font-bold border border-amber-200 dark:border-amber-800">
                            Update
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 text-[11px] font-bold border border-emerald-200 dark:border-emerald-800">
                            Baru
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-2 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(item)}
                            className="p-1 text-slate-600 hover:text-emerald-700 dark:text-slate-400 dark:hover:text-emerald-400 rounded transition-colors"
                            title="Edit baris"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteItem(item.temp_id)}
                            className="p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded transition-colors"
                            title="Hapus dari preview"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            💡 <em>Data yang dicentang akan disimpan &amp; disinkronkan ke akun portal santri.</em>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="h-11 px-6 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-sm transition-all cursor-pointer disabled:opacity-60"
            >
              Batal Semua
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={selectedCount === 0 || isSaving}
              className="h-11 px-7 bg-emerald-800 hover:bg-emerald-900 text-white font-extrabold rounded-xl text-sm shadow-md transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSaving ? 'Menyimpan...' : `Simpan ${selectedCount} Data Santri`}
            </button>
          </div>
        </div>
      </div>

      {/* Mini Edit Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-[100000] bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-lg font-extrabold text-slate-900 dark:text-slate-100 mb-1">
              Edit Baris Data Santri
            </h3>
            <p className="text-xs text-slate-500 mb-4 font-medium">
              Sesuaikan identitas santri sebelum disimpan ke database.
            </p>

            <form onSubmit={handleSaveEdit} className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">NIS</label>
                <input
                  type="text"
                  value={editingItem.nis}
                  onChange={(e) => setEditingItem({ ...editingItem, nis: e.target.value })}
                  className="h-9 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-100 focus:outline-none focus:border-emerald-600"
                  required
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Nama Lengkap</label>
                <input
                  type="text"
                  value={editingItem.nama}
                  onChange={(e) => setEditingItem({ ...editingItem, nama: e.target.value })}
                  className="h-9 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-100 focus:outline-none focus:border-emerald-600"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Jenis Kelamin</label>
                  <select
                    value={editingItem.jenis_kelamin}
                    onChange={(e) => setEditingItem({ ...editingItem, jenis_kelamin: e.target.value })}
                    className="h-9 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-emerald-600"
                  >
                    <option value="L">Laki-laki (L)</option>
                    <option value="P">Perempuan (P)</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Tgl Lahir</label>
                  <input
                    type="date"
                    value={editingItem.tanggal_lahir}
                    onChange={(e) => setEditingItem({ ...editingItem, tanggal_lahir: e.target.value })}
                    className="h-9 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-emerald-600"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">No. VA Jajan</label>
                <input
                  type="text"
                  value={editingItem.va_jajan}
                  onChange={(e) => setEditingItem({ ...editingItem, va_jajan: e.target.value })}
                  className="h-9 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-mono text-slate-800 dark:text-slate-100 focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div className="flex justify-end gap-2 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-xs"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-800 text-white font-bold rounded-xl text-xs"
                >
                  Terapkan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default SantriBatchPreviewModal;
