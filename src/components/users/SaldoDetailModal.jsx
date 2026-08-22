import { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import Popup from '../common/Popup';
import { santriApi } from '../../utils/api';

const SaldoDetailModal = ({
  isOpen,
  onClose,
  santri = {},
  onAdjustSaldo,
  canAdjustSaldo = true,
}) => {
  // States untuk Saldo & Riwayat Transaksi
  const [currentSaldo, setCurrentSaldo] = useState(santri?.saldo || 0);
  const [historyList, setHistoryList] = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [activeTab, setActiveTab] = useState('history'); // 'history' | 'adjust'

  // States untuk Form Sesuaikan Saldo (Manual)
  const [adjustType, setAdjustType] = useState('tambah'); // 'tambah' | 'kurang'
  const [adjustNominal, setAdjustNominal] = useState('');
  const [adjustKeterangan, setAdjustKeterangan] = useState('');
  const [adjustSuccessMsg, setAdjustSuccessMsg] = useState('');
  const [popupConfig, setPopupConfig] = useState({ isOpen: false, type: 'error', title: '', message: '' });

  useEffect(() => {
    if (isOpen && santri?.id) {
      setCurrentSaldo(santri.saldo !== undefined ? santri.saldo : 0);
      setHistoryList([]);
      setAdjustSuccessMsg('');
      setAdjustNominal('');
      setAdjustKeterangan('');
      setAdjustType('tambah');
      setActiveTab('history');

      setIsLoadingHistory(true);
      santriApi.mutasi(santri.id)
        .then(res => {
          setHistoryList(res.data || []);
        })
        .catch(err => console.error("Gagal memuat mutasi", err))
        .finally(() => setIsLoadingHistory(false));
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
  const handleSaveAdjustment = async (e) => {
    e.preventDefault();
    if (!nominalVal || nominalVal <= 0) {
      setPopupConfig({ isOpen: true, type: 'error', title: 'Input Tidak Valid', message: 'Masukkan nominal penyesuaian saldo yang valid.' });
      return;
    }

    if (!adjustKeterangan.trim()) {
      setPopupConfig({ isOpen: true, type: 'error', title: 'Input Tidak Lengkap', message: 'Keterangan / alasan penyesuaian wajib diisi.' });
      return;
    }

    if ((adjustType === 'kurang' || adjustType === 'kurangi') && nominalVal > currentSaldo) {
      setPopupConfig({
        isOpen: true,
        type: 'error',
        title: 'Saldo Tidak Cukup',
        message: `Nominal pengurangan (Rp ${nominalVal.toLocaleString('id-ID')}) melebihi sisa saldo saat ini (Rp ${currentSaldo.toLocaleString('id-ID')}).`
      });
      return;
    }

    try {
      const payload = {
        aksi: adjustType,
        nominal: nominalVal,
        keterangan: adjustKeterangan.trim(),
      };

      const res = await santriApi.penyesuaian(santri.id, payload);

      const finalNewSaldo = res.saldo !== undefined ? res.saldo : calculatedSaldo;

      setCurrentSaldo(finalNewSaldo);

      const resHistory = await santriApi.mutasi(santri.id);
      setHistoryList(resHistory.data || []);

      setAdjustSuccessMsg(
        `Saldo ${santri.nama} berhasil disesuaikan menjadi Rp ${finalNewSaldo.toLocaleString('id-ID')}.`
      );

      // Kirim callback ke parent component
      onAdjustSaldo?.(santri.id, finalNewSaldo, res.mutasi);

      // Reset input fields
      setAdjustNominal('');
      setAdjustKeterangan('');

      setTimeout(() => {
        setAdjustSuccessMsg('');
      }, 4000);
    } catch (error) {
      setPopupConfig({ isOpen: true, type: 'error', title: 'Terjadi Kesalahan', message: error.message || 'Terjadi kesalahan saat menyesuaikan saldo.' });
    }
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
        <div className="saldo-identity-card bg-slate-50/90 dark:bg-slate-800/80 border border-slate-200/90 dark:border-slate-700/90 rounded-2xl sm:rounded-3xl p-6 sm:p-7 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 sm:gap-6 min-h-[135px] shadow-xs">
          <div className="saldo-identity-left flex items-center gap-5 sm:gap-6">
            {/* Circular Avatar */}
            <div className="santri-avatar-circle w-16 h-16 sm:w-18 sm:h-18 min-w-[64px] min-h-[64px] rounded-full bg-emerald-700 dark:bg-emerald-800 text-white font-black text-2xl sm:text-3xl flex items-center justify-center shrink-0 overflow-hidden shadow-md aspect-square border-2 border-emerald-600/30">
              {(santri.foto || santri.foto_url) ? (
                <img
                  src={santri.foto || santri.foto_url}
                  alt={santri.nama}
                  className="w-full h-full object-cover rounded-full aspect-square block"
                />
              ) : (
                initialLetter
              )}
            </div>

            <div className="flex flex-col justify-center py-1">
              <span className="identity-tag text-[11px] sm:text-xs font-extrabold text-slate-400 dark:text-slate-400 uppercase tracking-widest block mb-1.5">
                IDENTITAS SANTRI
              </span>
              <h3 className="identity-name text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 leading-snug my-1">
                {santri.nama || 'Muhammad Rizki'}
              </h3>
              <p className="identity-nis text-xs sm:text-sm font-mono font-bold text-slate-500 dark:text-slate-400 mt-1">
                NIS: <span className="text-slate-800 dark:text-slate-200 font-extrabold">{santri.nis || '2024003'}</span>
              </p>
            </div>
          </div>

          <div className="saldo-identity-right text-left sm:text-right shrink-0 flex flex-col justify-center py-1 sm:pl-4">
            <span className="sisa-saldo-tag text-[11px] sm:text-xs font-extrabold text-slate-400 dark:text-slate-400 uppercase tracking-widest block mb-1.5">
              SISA SALDO SAAT INI
            </span>
            <div className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
              Rp {currentSaldo.toLocaleString('id-ID')}
            </div>
          </div>
        </div>

        {/* Tab Navigation (hanya ditampilkan bila canAdjustSaldo true) */}
        {canAdjustSaldo ? (
          <div className="flex bg-slate-100 dark:bg-slate-800/80 p-1.5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 gap-1.5">
            <button
              type="button"
              onClick={() => setActiveTab('history')}
              className={`flex-1 py-2.5 px-3 sm:px-4 text-xs sm:text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${activeTab === 'history'
                ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-2xs font-extrabold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-700/50'
                }`}
            >
              <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Riwayat Transaksi</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('adjust')}
              className={`flex-1 py-2.5 px-3 sm:px-4 text-xs sm:text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${activeTab === 'adjust'
                ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-2xs font-extrabold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-700/50'
                }`}
            >
              <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              <span>Sesuaikan Saldo (Manual)</span>
            </button>
          </div>
        ) : null}

        {/* Adjustment Success Alert */}
        {canAdjustSaldo && adjustSuccessMsg && (
          <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-400 dark:border-emerald-700 text-emerald-800 dark:text-emerald-200 rounded-xl text-xs font-extrabold flex items-center justify-between gap-2.5 animate-fadeIn shadow-2xs">
            <div className="flex items-center gap-2.5">
              <svg className="w-5 h-5 text-emerald-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{adjustSuccessMsg}</span>
            </div>
            {activeTab === 'adjust' && (
              <button
                type="button"
                onClick={() => setActiveTab('history')}
                className="text-xs font-bold text-emerald-700 dark:text-emerald-300 underline hover:text-emerald-900 shrink-0"
              >
                Lihat Riwayat &rarr;
              </button>
            )}
          </div>
        )}

        {/* Tab 1: Riwayat Transaksi Terakhir */}
        {(!canAdjustSaldo || activeTab === 'history') && (
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
                  {isLoadingHistory ? (
                    <tr>
                      <td colSpan="3" className="px-4 py-6 text-center text-slate-400 font-medium">
                        Memuat riwayat transaksi...
                      </td>
                    </tr>
                  ) : historyList.length > 0 ? (
                    historyList.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/60 transition-colors">
                        <td className="px-4 py-3 font-medium whitespace-nowrap">
                          {new Intl.DateTimeFormat('id-ID', {
                            day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                          }).format(new Date(item.created_at))}
                        </td>
                        <td className="px-4 py-3 font-medium">
                          {item.keterangan || (item.tipe === 'tarik_koin' ? 'Tarik Koin' : (item.nominal > 0 ? 'Kredit' : 'Debit'))}
                        </td>
                        <td className="px-4 py-3 text-right font-bold whitespace-nowrap">
                          <span className={item.nominal > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}>
                            {item.nominal > 0 ? '+' : ''} Rp {Math.abs(item.nominal).toLocaleString('id-ID')}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="3" className="px-4 py-6 text-center text-slate-400 font-medium">
                        Belum ada riwayat transaksi.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 2: Form Sesuaikan Saldo (Manual) */}
        {canAdjustSaldo && activeTab === 'adjust' && (
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
                      className={`adjust-btn-toggle ${adjustType === 'tambah'
                        ? 'bg-emerald-50 dark:bg-emerald-950/70 border-2 border-emerald-500 text-emerald-700 dark:text-emerald-300 shadow-2xs'
                        : 'bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100'
                        }`}
                    >
                      <span>+ Tambah</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setAdjustType('kurangi')}
                      className={`adjust-btn-toggle ${adjustType === 'kurangi'
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
      </div>

      <Popup
        isOpen={popupConfig.isOpen}
        type={popupConfig.type}
        title={popupConfig.title}
        message={popupConfig.message}
        onClose={() => setPopupConfig({ ...popupConfig, isOpen: false })}
      />
    </Modal>
  );
};

export default SaldoDetailModal;

