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
      <div className="saldo-modal-content flex flex-col gap-5">
        {/* Identitas Santri Card */}
        <div className="saldo-identity-card bg-slate-50 border border-slate-200 rounded-2xl p-5 flex items-center justify-between gap-4">
          <div className="saldo-identity-left flex items-center gap-4">
            <div className="santri-avatar-circle w-12 h-12 rounded-full bg-emerald-600 text-white font-extrabold text-xl flex items-center justify-center shadow-xs">
              {initialLetter}
            </div>
            <div>
              <span className="identity-tag text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                IDENTITAS SANTRI
              </span>
              <h3 className="identity-name text-lg font-extrabold text-slate-800 leading-tight">
                {santri.nama || 'Muhammad Rizki'}
              </h3>
              <p className="identity-nis text-xs font-medium text-slate-500 mt-0.5">
                NIS: {santri.nis || '2024003'}
              </p>
            </div>
          </div>
          <div className="saldo-identity-right text-right">
            <span className="sisa-saldo-tag text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Sisa Saldo Saat Ini
            </span>
            <div className="sisa-saldo-val text-2xl font-extrabold text-emerald-600 mt-0.5">
              Rp {(currentSaldo || 15000).toLocaleString('id-ID')}
            </div>
          </div>
        </div>

        {/* Sesuaikan Saldo (Manual) */}
        <form className="saldo-adjust-form bg-white border border-slate-200 rounded-2xl p-5 flex flex-col gap-4" onSubmit={handleConfirmAdjustment}>
          <h4 className="section-title-sm text-sm font-bold text-slate-800">Sesuaikan Saldo (Manual)</h4>

          <div className="form-grid-2col grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="form-group-section flex flex-col gap-1.5">
              <label className="form-section-label text-xs font-bold tracking-wider text-slate-500 uppercase">
                AKSI PENYESUAIAN
              </label>
              <div className="action-toggle-group flex gap-2">
                <button
                  type="button"
                  className={`action-toggle-btn flex-1 py-2.5 px-4 rounded-xl border text-sm font-semibold transition-all ${
                    actionType === 'tambah'
                      ? 'action-toggle-btn--tambah bg-emerald-50 text-emerald-700 border-emerald-500 font-bold shadow-xs'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                  onClick={() => setActionType('tambah')}
                >
                  + Tambah
                </button>
                <button
                  type="button"
                  className={`action-toggle-btn flex-1 py-2.5 px-4 rounded-xl border text-sm font-semibold transition-all ${
                    actionType === 'kurangi'
                      ? 'action-toggle-btn--kurangi bg-rose-50 text-rose-700 border-rose-500 font-bold shadow-xs'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                  onClick={() => setActionType('kurangi')}
                >
                  - Kurangi
                </button>
              </div>
            </div>

            <div className="form-group-section flex flex-col gap-1.5">
              <label className="form-section-label text-xs font-bold tracking-wider text-slate-500 uppercase">
                NOMINAL (RP)
              </label>
              <input
                type="number"
                className="form-control-input w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-emerald-600 focus:bg-white focus:ring-3 focus:ring-emerald-600/10 transition-all"
                placeholder="Misal: 25000"
                value={nominal}
                onChange={(e) => setNominal(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group-section flex flex-col gap-1.5">
            <label className="form-section-label text-xs font-bold tracking-wider text-slate-500 uppercase">
              KETERANGAN / ALASAN (WAJIB)
            </label>
            <input
              type="text"
              className="form-control-input w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-emerald-600 focus:bg-white focus:ring-3 focus:ring-emerald-600/10 transition-all"
              placeholder="Contoh: Koreksi kasir salah input..."
              value={keterangan}
              onChange={(e) => setKeterangan(e.target.value)}
              required
            />
          </div>

          <div className="saldo-btn-wrapper flex justify-end mt-1">
            <button
              type="submit"
              className="btn btn-primary btn-confirm-adjust px-6 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-xl text-sm shadow-md transition-all"
            >
              Konfirmasi Penyesuaian
            </button>
          </div>
        </form>

        {/* Riwayat Transaksi Terakhir */}
        <div className="saldo-history-section flex flex-col gap-3">
          <h4 className="section-title-sm text-sm font-bold text-slate-800">Riwayat Transaksi Terakhir</h4>
          <div className="overflow-x-auto border border-slate-200 rounded-2xl bg-white">
            <table className="mini-data-table w-full text-left border-collapse text-xs">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-2.5 font-bold text-slate-500 uppercase">TANGGAL</th>
                  <th className="px-4 py-2.5 font-bold text-slate-500 uppercase">KETERANGAN</th>
                  <th className="px-4 py-2.5 font-bold text-slate-500 uppercase text-right">NOMINAL</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {mockSantriHistory.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium whitespace-nowrap">{item.tanggal}</td>
                    <td className="px-4 py-3 font-medium">{item.keterangan}</td>
                    <td className="px-4 py-3 text-right font-bold whitespace-nowrap">
                      <span className={item.nominal > 0 ? 'text-emerald-600' : 'text-rose-600'}>
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
