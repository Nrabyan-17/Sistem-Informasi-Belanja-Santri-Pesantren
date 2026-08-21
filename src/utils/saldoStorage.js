// Helper utility untuk mengelola saldo dan riwayat mutasi santri di localStorage

const SALDO_KEY = 'santri_saldos';
const HISTORY_PREFIX = 'santri_history_';

/**
 * Mengambil map saldo santri dari localStorage: { [santriId]: number }
 */
export const getSantriSaldos = () => {
  try {
    const raw = localStorage.getItem(SALDO_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (err) {
    console.warn('Gagal membaca saldo dari localStorage:', err);
    return {};
  }
};

/**
 * Menyimpan saldo baru untuk santri tertentu ke localStorage
 */
export const setSantriSaldo = (santriId, newSaldo) => {
  try {
    const current = getSantriSaldos();
    current[santriId] = Number(newSaldo);
    localStorage.setItem(SALDO_KEY, JSON.stringify(current));
  } catch (err) {
    console.warn('Gagal menyimpan saldo ke localStorage:', err);
  }
};

/**
 * Penggabungan (merge) data saldo lokal dari localStorage ke array santri
 */
export const mergeSantriSaldos = (santriList = []) => {
  if (!Array.isArray(santriList)) return [];
  const localSaldos = getSantriSaldos();
  return santriList.map((s) => {
    const overrideSaldo = localSaldos[s.id];
    return {
      ...s,
      saldo: overrideSaldo !== undefined ? Number(overrideSaldo) : Number(s.saldo || 0),
    };
  });
};

/**
 * Mengambil riwayat transaksi santri dari localStorage
 */
export const getSantriHistory = (santriId, defaultHistory = []) => {
  try {
    const raw = localStorage.getItem(`${HISTORY_PREFIX}${santriId}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Gagal membaca riwayat transaksi dari localStorage:', err);
  }
  return defaultHistory;
};

/**
 * Menambahkan item riwayat transaksi baru untuk santri tertentu ke localStorage
 */
export const addSantriHistory = (santriId, historyItem) => {
  try {
    const currentHistory = getSantriHistory(santriId, []);
    const updated = [historyItem, ...currentHistory];
    localStorage.setItem(`${HISTORY_PREFIX}${santriId}`, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.warn('Gagal menyimpan riwayat transaksi ke localStorage:', err);
    return [];
  }
};
