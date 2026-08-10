/**
 * Memformat string tanggal ISO menjadi format Indonesia
 * @param {string} isoDate - Tanggal dalam format "2026-08-07"
 * @returns {string} - Format: "7 Agustus 2026"
 */
export const formatDate = (isoDate) => {
  if (!isoDate) return '-';
  const date = new Date(isoDate);
  return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
};

/**
 * Memformat tanggal dengan jam
 * @param {string} isoDate
 * @returns {string} - Format: "7 Agu 2026, 14:30"
 */
export const formatDateTime = (isoDate) => {
  if (!isoDate) return '-';
  const date = new Date(isoDate);
  return date.toLocaleString('id-ID', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
};
