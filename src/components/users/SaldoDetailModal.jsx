import { useState } from 'react';
import Modal from '../common/Modal';

const mockSantriHistory = [
  { id: 1, tanggal: '01 Agts 2025', keterangan: 'Tarik Koin (Rumah Koin)', nominal: -30000 },
  { id: 2, tanggal: '28 Jul 2025', keterangan: 'Setor BNI Virtual Account', nominal: 100000 },
  { id: 3, tanggal: '25 Jul 2025', keterangan: 'Tarik Koin (Rumah Koin)', nominal: -30000 },
];

const SaldoDetailModal = ({ isOpen, onClose, santri = {} }) => {
  const [actionType, setActionType] = useState('tambah'); // 'tambah' | 'kurangi'
  const [nominal, setNominal] = useState('');
  const [keterangan, setKeterangan] = useState('');
  const [currentSaldo, setCurrentSaldo] = useState(santri.saldo || 15000);

  const initialLetter = (santri.nama || 'Muhammad Rizki').charAt(0).toUpperCase();

  const handleConfirmAdjustment = (e) => {
    e.preventDefault();
    const amount = parseInt(nominal || '0', 10);
    if (amount <= 0) {
      alert('Masukkan nominal penyesuaian yang valid.');
      return;
    }
    if (!keterangan.trim()) {
      alert('Keterangan / alasan wajib diisi.');
      return;
    }

    const newSaldo = actionType === 'tambah' ? currentSaldo + amount : currentSaldo - amount;
    setCurrentSaldo(newSaldo);
    alert(`✅ Penyesuaian saldo berhasil!\nSaldo ${santri.nama || 'Muhammad Rizki'} sekarang: Rp ${newSaldo.toLocaleString('id-ID')}`);
    setNominal('');
    setKeterangan('');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Detail &amp; Penyesuaian Saldo"
      subtitle="Lihat info detail dan sesuaikan saldo untuk santri ini."
    >
      <div className="saldo-modal-content flex flex-col gap-3.5">
        {/* Identitas Santri Card */}
        <div className="saldo-identity-card bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-xl p-3.5 sm:p-4 flex items-center justify-between gap-3">
          <div className="saldo-identity-left flex items-center gap-3">
            <div className="santri-avatar-circle w-10 h-10 rounded-full bg-emerald-600 text-white font-extrabold text-lg flex items-center justify-center shrink-0 shadow-2xs">
              {initialLetter}
            </div>
            <div>
              <span className="identity-tag text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                IDENTITAS SANTRI
              </span>
              <h3 className="identity-name text-base font-extrabold text-slate-800 dark:text-slate-100 leading-tight">
                {santri.nama || 'Muhammad Rizki'}
              </h3>
              <p className="identity-nis text-[11px] font-medium text-slate-500 dark:text-slate-400">
                NIS: {santri.nis || '2024003'}
              </p>
            </div>
          </div>
          <div className="saldo-identity-right text-right">
            <span className="sisa-saldo-tag text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
              Sisa Saldo Saat Ini
            </span>
            <div className="sisa-saldo-val text-xl font-extrabold text-emerald-600 dark:text-emerald-400">
              Rp {(currentSaldo || 15000).toLocaleString('id-ID')}
            </div>
          </div>
        </div>

        {/* Sesuaikan Saldo (Manual) */}
        <form className="saldo-adjust-form bg-white dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/80 rounded-xl p-3.5 sm:p-4 flex flex-col gap-3" onSubmit={handleConfirmAdjustment}>
          <h4 className="section-title-sm text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">Sesuaikan Saldo (Manual)</h4>

          <div className="form-grid-2col grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="form-group-section flex flex-col gap-1">
              <label className="form-section-label text-[10px] font-bold tracking-wider text-slate-500 dark:text-slate-400 uppercase">
                AKSI PENYESUAIAN
              </label>
              <div className="action-toggle-group flex gap-2">
                <button
                  type="button"
                  className={`action-toggle-btn flex-1 py-1.5 px-3 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
                    actionType === 'tambah'
                      ? 'action-toggle-btn--tambah bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-500 font-bold shadow-2xs'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                  onClick={() => setActionType('tambah')}
                >
                  + Tambah
                </button>
                <button
                  type="button"
                  className={`action-toggle-btn flex-1 py-1.5 px-3 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
                    actionType === 'kurangi'
                      ? 'action-toggle-btn--kurangi bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-500 font-bold shadow-2xs'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                  onClick={() => setActionType('kurangi')}
                >
                  - Kurangi
                </button>
              </div>
            </div>

            <div className="form-group-section flex flex-col gap-1">
              <label className="form-section-label text-[10px] font-bold tracking-wider text-slate-500 dark:text-slate-400 uppercase">
                NOMINAL (RP)
              </label>
              <input
                type="number"
                className="form-control-input w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-emerald-600 focus:bg-white dark:focus:bg-slate-900 transition-all"
                placeholder="Misal: 25000"
                value={nominal}
                onChange={(e) => setNominal(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group-section flex flex-col gap-1">
            <label className="form-section-label text-[10px] font-bold tracking-wider text-slate-500 dark:text-slate-400 uppercase">
              KETERANGAN / ALASAN (WAJIB)
            </label>
            <input
              type="text"
              className="form-control-input w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-emerald-600 focus:bg-white dark:focus:bg-slate-900 transition-all"
              placeholder="Contoh: Koreksi kasir salah input..."
              value={keterangan}
              onChange={(e) => setKeterangan(e.target.value)}
              required
            />
          </div>

          <div className="saldo-btn-wrapper flex justify-end mt-0.5">
            <button
              type="submit"
              className="btn btn-primary btn-confirm-adjust px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-lg text-xs shadow-xs transition-all cursor-pointer"
            >
              Konfirmasi Penyesuaian
            </button>
          </div>
        </form>

        {/* Riwayat Transaksi Terakhir */}
        <div className="saldo-history-section flex flex-col gap-2">
          <h4 className="section-title-sm text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">Riwayat Transaksi Terakhir</h4>
          <div className="overflow-x-auto border border-slate-200 dark:border-slate-700/80 rounded-xl bg-white dark:bg-slate-900">
            <table className="mini-data-table w-full text-left border-collapse text-[11px]">
              <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="px-3 py-2 font-bold text-slate-500 dark:text-slate-400 uppercase">TANGGAL</th>
                  <th className="px-3 py-2 font-bold text-slate-500 dark:text-slate-400 uppercase">KETERANGAN</th>
                  <th className="px-3 py-2 font-bold text-slate-500 dark:text-slate-400 uppercase text-right">NOMINAL</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300">
                {mockSantriHistory.map((item) => (
                  <tr key={item.id} className="bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                    <td className="px-3 py-2 font-medium whitespace-nowrap bg-white dark:bg-slate-900">{item.tanggal}</td>
                    <td className="px-3 py-2 font-medium bg-white dark:bg-slate-900">{item.keterangan}</td>
                    <td className="px-3 py-2 text-right font-bold whitespace-nowrap bg-white dark:bg-slate-900">
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
