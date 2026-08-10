/**
 * Memformat angka menjadi format mata uang Rupiah Indonesia
 * @param {number} amount - Nilai angka
 * @returns {string} - Format: "Rp 9.000"
 */
export const formatCurrency = (amount = 0) => {
  return `Rp ${amount.toLocaleString('id-ID')}`;
};

/**
 * Memformat angka menjadi format mata uang Rupiah dengan simbol penuh
 * @param {number} amount - Nilai angka
 * @returns {string} - Format: "Rp9.000,00"
 */
export const formatCurrencyFull = (amount = 0) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
  }).format(amount);
};
