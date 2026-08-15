import { useState } from 'react';
import Modal from '../common/Modal';

const mockSantriHistory = [
  { id: 1, tanggal: '01 Agts 2025', keterangan: 'Tarik Koin (Rumah Koin)', nominal: -30000 },
  { id: 2, tanggal: '28 Jul 2025', keterangan: 'Setor BNI Virtual Account', nominal: 100000 },
  { id: 3, tanggal: '25 Jul 2025', keterangan: 'Tarik Koin (Rumah Koin)', nominal: -30000 },
];

const SaldoDetailModal = ({ isOpen, onClose, santri = {} }) => {
  const currentSaldo = santri.saldo || 15000;
  const initialLetter = (santri.nama || 'Muhammad Rizki').charAt(0).toUpperCase();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Detail Saldo Santri"
      subtitle="Lihat info detail identitas dan riwayat transaksi saldo santri ini."
    >
      <div className="saldo-modal-content flex flex-col gap-4">
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
