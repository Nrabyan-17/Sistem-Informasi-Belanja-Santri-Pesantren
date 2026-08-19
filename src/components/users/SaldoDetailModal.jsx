import { useState, useEffect } from 'react';
import Modal from '../common/Modal';

const initialSantriHistory = [
  { id: 1, tanggal: '01 Agts 2025', keterangan: 'Tarik Koin (Rumah Koin)', nominal: -30000 },
  { id: 2, tanggal: '28 Jul 2025', keterangan: 'Setor BNI Virtual Account', nominal: 100000 },
  { id: 3, tanggal: '25 Jul 2025', keterangan: 'Tarik Koin (Rumah Koin)', nominal: -30000 },
];

const SaldoDetailModal = ({
  isOpen,
  onClose,
  santri = {},
  onAdjustSaldo,
  canAdjustSaldo = true,
}) => {
  // States untuk Saldo & Riwayat Transaksi
  const [currentSaldo, setCurrentSaldo] = useState(santri?.saldo || 15000);
  const [historyList, setHistoryList] = useState(initialSantriHistory);

  // States untuk Form Sesuaikan Saldo (Manual)
  const [adjustType, setAdjustType] = useState('tambah'); // 'tambah' | 'kurang'
  const [adjustNominal, setAdjustNominal] = useState('');
  const [adjustKeterangan, setAdjustKeterangan] = useState('');
  const [adjustSuccessMsg, setAdjustSuccessMsg] = useState('');

  useEffect(() => {
    if (isOpen) {
      setCurrentSaldo(santri?.saldo !== undefined ? santri.saldo : 15000);
      setAdjustSuccessMsg('');
      setAdjustNominal('');
      setAdjustKeterangan('');
      setAdjustType('tambah');
    }
  }, [isOpen, santri]);

  if (!santri) return null;

  const initialLetter = (santri.nama || 'Muhammad Rizki').charAt(0).toUpperCase();

  // Kalkulasi Saldo Akhir Setelah Penyesuaian
  const nominalVal = parseInt(adjustNominal || '0', 10);
  const calculatedSaldo =
    adjustType === 'tambah'
      ? currentSaldo + (nominalVal > 0 ? nominalVal : 0)
      : Math.max(0, currentSaldo - (nominalVal > 0 ? nominalVal : 0));

  // Handler Submit Penyesuaian Saldo Manual
  const handleSaveAdjustment = (e) => {
    e.preventDefault();
    if (!nominalVal || nominalVal <= 0) {
      alert('Masukkan nominal penyesuaian saldo yang valid.');
      return;
    }

    if (!adjustKeterangan.trim()) {
      alert('Keterangan / alasan penyesuaian wajib diisi.');
      return;
    }

    if (adjustType === 'kurang' && nominalVal > currentSaldo) {
      alert(
        `Nominal pengurangan (Rp ${nominalVal.toLocaleString(
          'id-ID'
        )}) melebihi sisa saldo saat ini (Rp ${currentSaldo.toLocaleString('id-ID')}).`
      );
      return;
    }

    const finalNewSaldo = calculatedSaldo;

    const todayStr = new Intl.DateTimeFormat('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(new Date());

    const newHistoryItem = {
      id: Date.now(),
      tanggal: todayStr,
      keterangan: adjustKeterangan.trim(),
      nominal: adjustType === 'tambah' ? nominalVal : -nominalVal,
    };

    // Update local modal states
    setCurrentSaldo(finalNewSaldo);
    setHistoryList([newHistoryItem, ...historyList]);
    setAdjustSuccessMsg(
      `Saldo ${santri.nama} berhasil disesuaikan menjadi Rp ${finalNewSaldo.toLocaleString('id-ID')}.`
    );

    // Kirim callback ke parent component (TopUpPage)
    onAdjustSaldo?.(santri.id, finalNewSaldo, newHistoryItem);

    // Reset input fields
    setAdjustNominal('');
    setAdjustKeterangan('');

    setTimeout(() => {
      setAdjustSuccessMsg('');
    }, 4000);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={canAdjustSaldo ? 'Detail & Penyesuaian Saldo' : 'Detail Saldo Santri'}
      subtitle={
        canAdjustSaldo
          ? 'Lihat info detail dan sesuaikan saldo untuk santri ini.'
          : 'Lihat informasi saldo dan pantau riwayat transaksi santri.'
      }
      maxWidth="max-w-2xl"
    >
      <div className="saldo-modal-content flex flex-col gap-5 pt-1">
        {/* Identitas Santri Card */}
        <div className="bg-slate-50/90 dark:bg-slate-800/70 border border-slate-200/90 dark:border-slate-700/90 rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-2xs">
          <div className="flex items-center gap-4">
            {/* Circular Avatar */}
            <div className="w-14 h-14 rounded-full bg-emerald-600 text-white font-black text-2xl flex items-center justify-center shrink-0 shadow-sm">
              {initialLetter}
            </div>

            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">
                IDENTITAS SANTRI
              </span>
              <h3 className="text-xl font-black text-slate-900 dark:text-slate-100 leading-tight mt-0.5">
                {santri.nama || 'Muhammad Rizki'}
              </h3>
              <p className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400 mt-1">
                NIS: <span className="text-slate-800 dark:text-slate-200 font-extrabold">{santri.nis || '2024003'}</span>
              </p>
            </div>
          </div>

          <div className="text-left sm:text-right shrink-0">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">
              SISA SALDO SAAT INI
            </span>
            <div className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
              Rp {currentSaldo.toLocaleString('id-ID')}
            </div>
          </div>
        </div>

        {/* Adjustment Success Alert (Hanya untuk Admin) */}
        {canAdjustSaldo && adjustSuccessMsg && (
          <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-400 dark:border-emerald-700 text-emerald-800 dark:text-emerald-200 rounded-xl text-xs font-extrabold flex items-center gap-2.5 animate-fadeIn shadow-2xs">
            <svg className="w-5 h-5 text-emerald-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {adjustSuccessMsg}
          </div>
        )}

        {/* Form Sesuaikan Saldo (Manual) - Khusus Admin BAK, Disembunyikan untuk Staff Rumah Koin */}
        {canAdjustSaldo && (
          <div className="adjust-saldo-box shadow-xs">
            <h4 className="adjust-saldo-title">
              SESUAIKAN SALDO (MANUAL)
            </h4>

            <form onSubmit={handleSaveAdjustment} className="flex flex-col gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
                {/* Kolom Kiri: Aksi Penyesuaian */}
                <div className="flex flex-col">
                  <label className="adjust-field-label">
                    AKSI PENYESUAIAN
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setAdjustType('tambah')}
                      className={`adjust-btn-toggle ${
                        adjustType === 'tambah'
                          ? 'bg-emerald-50 dark:bg-emerald-950/70 border-2 border-emerald-500 text-emerald-700 dark:text-emerald-300 shadow-2xs'
                          : 'bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100'
                      }`}
                    >
                      <span>+ Tambah</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setAdjustType('kurang')}
                      className={`adjust-btn-toggle ${
                        adjustType === 'kurang'
                          ? 'bg-rose-50 dark:bg-rose-950/70 border-2 border-rose-500 text-rose-700 dark:text-rose-300 shadow-2xs'
                          : 'bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100'
                      }`}
                    >
                      <span>- Kurangi</span>
                    </button>
                  </div>
                </div>

                {/* Kolom Kanan: Nominal (RP) */}
                <div className="flex flex-col">
                  <label className="adjust-field-label">
                    NOMINAL (RP)
                  </label>
                  <input
                    type="number"
                    min="1000"
                    step="1000"
                    placeholder="Misal: 25000"
                    value={adjustNominal}
                    onChange={(e) => setAdjustNominal(e.target.value)}
                    className="adjust-input-field"
                    required
                  />
                </div>
              </div>

              {/* Keterangan / Alasan (Wajib) */}
              <div className="flex flex-col">
                <label className="adjust-field-label">
                  KETERANGAN / ALASAN (WAJIB)
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Koreksi kasir salah input..."
                  value={adjustKeterangan}
                  onChange={(e) => setAdjustKeterangan(e.target.value)}
                  className="adjust-input-field"
                  required
                />
              </div>

              {/* Tombol Konfirmasi Penyesuaian */}
              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="adjust-btn-submit"
                >
                  Konfirmasi Penyesuaian
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Riwayat Transaksi Terakhir */}
        <div className="saldo-history-section flex flex-col gap-2.5">
          <h4 className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider">
            RIWAYAT TRANSAKSI TERAKHIR
          </h4>
          <div className="overflow-x-auto border border-slate-200 dark:border-slate-700/80 rounded-2xl bg-white dark:bg-slate-900 shadow-2xs">
            <table className="mini-data-table w-full text-left border-collapse text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="px-4 py-3 font-bold text-slate-500 dark:text-slate-400 uppercase">TANGGAL</th>
                  <th className="px-4 py-3 font-bold text-slate-500 dark:text-slate-400 uppercase">KETERANGAN</th>
                  <th className="px-4 py-3 font-bold text-slate-500 dark:text-slate-400 uppercase text-right">NOMINAL</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300">
                {historyList.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/60 transition-colors">
                    <td className="px-4 py-3 font-medium whitespace-nowrap">{item.tanggal}</td>
                    <td className="px-4 py-3 font-medium">{item.keterangan}</td>
                    <td className="px-4 py-3 text-right font-bold whitespace-nowrap">
                      <span className={item.nominal > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}>
                        {item.nominal > 0 ? '+' : ''} Rp {Math.abs(item.nominal).toLocaleString('id-ID')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default SaldoDetailModal;
