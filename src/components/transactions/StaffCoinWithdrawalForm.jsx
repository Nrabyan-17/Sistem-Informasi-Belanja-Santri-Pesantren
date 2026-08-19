import { useState, useEffect, useRef } from 'react';
import { santriApi, penarikanApi } from '../../utils/api';
import { usePopup } from '../../context/PopupContext';

const getInitials = (name) => {
  if (!name) return 'S';
  const parts = name.trim().split(' ');
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  return name.slice(0, 2).toUpperCase();
};

const StaffCoinWithdrawalForm = ({ onWithdrawalSuccess }) => {
  const { showPopup } = usePopup();
  const [santriOptions, setSantriOptions] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [nominal, setNominal] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccessModal, setIsSuccessModal] = useState(false);
  const [lastTxData, setLastTxData] = useState(null);

  const searchBoxRef = useRef(null);

  useEffect(() => {
    santriApi
      .list({ per_page: 100, status: 'aktif' })
      .then((res) => {
        const list = (res.data || []).map((s) => ({
          id: s.id,
          nis: s.nis,
          nama: s.nama,
          saldo: s.saldo || 0,
          foto: s.foto_url || null,
        }));
        setSantriOptions(list);
        if (list.length) {
          setSelectedId(String(list[0].id));
          setSearchTerm(`${list[0].nis} - ${list[0].nama}`);
        }
      })
      .catch((e) => showPopup('Gagal Memuat Data', 'Gagal memuat data santri: ' + e.message, 'error'));
  }, [showPopup]);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchBoxRef.current && !searchBoxRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const activeSantri = santriOptions.find((s) => String(s.id) === selectedId) || null;

  const filteredSantri = santriOptions.filter((s) => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    return s.nama.toLowerCase().includes(q) || s.nis.toLowerCase().includes(q);
  });

  const handleSelectSantri = (s) => {
    setSelectedId(String(s.id));
    setSearchTerm(`${s.nis} - ${s.nama}`);
    setIsDropdownOpen(false);
  };

  const handleProcessWithdrawal = async (e) => {
    e.preventDefault();
    if (!activeSantri) {
      showPopup('Peringatan', 'Pilih santri terlebih dahulu.', 'info');
      return;
    }
    const amount = parseInt(nominal || '0', 10);
    if (amount <= 0) {
      showPopup('Peringatan', 'Masukkan nominal penarikan koin yang valid.', 'info');
      return;
    }
    if (amount > activeSantri.saldo) {
      showPopup('Saldo Tidak Cukup', `Saldo tidak mencukupi! Sisa saldo ${activeSantri.nama} hanya Rp ${activeSantri.saldo.toLocaleString('id-ID')}`, 'error');
      return;
    }

    setIsProcessing(true);
    try {
      const res = await penarikanApi.store({ santri_id: activeSantri.id, nominal: amount });
      const t = res.transaction;
      setLastTxData({
        nominal: amount,
        nis: t.santri?.nis || activeSantri.nis,
        namaSantri: t.santri?.nama || activeSantri.nama,
        sisaSaldo: t.saldo_setelah ?? activeSantri.saldo - amount,
        staff: t.created_by?.name || '—',
        foto: activeSantri.foto,
      });
      // Update local santri balance
      setSantriOptions((prev) =>
        prev.map((s) => (s.id === activeSantri.id ? { ...s, saldo: (t.saldo_setelah ?? s.saldo - amount) } : s))
      );
      setIsSuccessModal(true);
      onWithdrawalSuccess?.(res);
      setNominal('');
    } catch (err) {
      showPopup('Penarikan Gagal', err.message || 'Penarikan gagal diproses.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const formatRupiah = (val) => new Intl.NumberFormat('id-ID').format(val);

  return (
    <div className="staff-withdrawal-card bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-7 shadow-xs transition-colors mb-7">
      <div className="card-header border-b border-slate-100 dark:border-slate-800 pb-5 mb-6 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            🪙 Form Penarikan Koin / Saldo Santri
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Validasi identitas santri, masukkan nominal, dan proses penarikan koin secara instan
          </p>
        </div>
        <span className="px-3.5 py-1.5 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 rounded-full text-xs font-bold">
          Loket Rumah Koin
        </span>
      </div>

      <form onSubmit={handleProcessWithdrawal} className="flex flex-col">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          
          {/* Left Column: Search & Autocomplete Santri */}
          <div className="lg:col-span-6 flex flex-col gap-4">
            <div className="form-group flex flex-col gap-2 relative" ref={searchBoxRef}>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                Pilih Santri (Ketik NIS / Nama)
              </label>
              
              <div className="relative">
                <input
                  type="text"
                  placeholder="Ketik NIS atau Nama Santri untuk mencari..."
                  value={searchTerm}
                  onFocus={() => setIsDropdownOpen(true)}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setIsDropdownOpen(true);
                  }}
                  className="w-full h-12 pl-10 pr-10 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-2xl text-sm font-bold text-slate-800 dark:text-slate-100 focus:outline-none focus:border-emerald-600 shadow-xs"
                />
                <svg
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchTerm('');
                      setIsDropdownOpen(true);
                    }}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Autocomplete Dropdown List */}
              {isDropdownOpen && (
                <div className="absolute top-[72px] left-0 right-0 z-30 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl max-h-60 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredSantri.length === 0 ? (
                    <div className="p-4 text-center text-xs font-medium text-slate-400">
                      Santri dengan kata kunci tersebut tidak ditemukan.
                    </div>
                  ) : (
                    filteredSantri.map((s) => (
                      <button
                        type="button"
                        key={s.id}
                        onClick={() => handleSelectSantri(s)}
                        className={`w-full p-3 text-left flex items-center justify-between gap-3 hover:bg-emerald-50/50 dark:hover:bg-slate-800 transition-colors cursor-pointer ${
                          String(s.id) === selectedId ? 'bg-emerald-50 dark:bg-slate-800/80 font-bold' : ''
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {s.foto ? (
                            <img
                              src={s.foto}
                              alt={s.nama}
                              className="w-8 h-8 rounded-xl object-cover border border-emerald-600/40 shrink-0"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-xl bg-emerald-700 text-white font-extrabold text-xs flex items-center justify-center shrink-0">
                              {getInitials(s.nama)}
                            </div>
                          )}
                          <div className="flex flex-col min-w-0">
                            <span className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">{s.nama}</span>
                            <span className="text-[11px] font-mono text-slate-400">NIS: {s.nis}</span>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-xs font-extrabold text-emerald-700 dark:text-emerald-400 font-mono">
                            Rp {formatRupiah(s.saldo)}
                          </span>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Info Card Santri Terpilih — Foto Besar & Jelas */}
            {activeSantri && (
              <div className="p-4 sm:p-5 rounded-3xl bg-slate-50/90 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 flex flex-col sm:flex-row items-center sm:items-start gap-5 shadow-xs">
                {/* Foto Santri Besar */}
                <div className="relative shrink-0">
                  {activeSantri.foto ? (
                    <img
                      src={activeSantri.foto}
                      alt={activeSantri.nama}
                      className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border-2 border-emerald-600 shadow-md ring-4 ring-emerald-100 dark:ring-emerald-950/60"
                    />
                  ) : (
                    <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-emerald-700 text-white font-black text-3xl sm:text-4xl flex items-center justify-center shadow-md ring-4 ring-emerald-100 dark:ring-emerald-950/60">
                      {getInitials(activeSantri.nama)}
                    </div>
                  )}
                  <span
                    className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-800 shadow-xs"
                    title="Santri Aktif Terpilih"
                  />
                </div>

                <div className="flex flex-col gap-1.5 flex-1 text-center sm:text-left">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
                    INFO SANTRI TERPILIH
                  </span>
                  <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-base sm:text-lg leading-tight">
                    {activeSantri.nama}
                  </h3>
                  <p className="text-xs font-mono font-semibold text-slate-500 dark:text-slate-400">
                    NIS: <span className="text-emerald-700 dark:text-emerald-400 font-bold">{activeSantri.nis}</span>
                  </p>

                  <div className="mt-2 pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-center sm:justify-start gap-2">
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400">SISA SALDO:</span>
                    <span className="text-base sm:text-lg font-black text-emerald-700 dark:text-emerald-400 font-mono">
                      Rp {formatRupiah(activeSantri.saldo)}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Input Nominal & Action Button */}
          <div className="lg:col-span-6 flex flex-col gap-5 justify-between h-full">
            <div className="form-group flex flex-col gap-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                Nominal Penarikan Koin (RP)
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-extrabold text-slate-400">
                  Rp
                </span>
                <input
                  type="number"
                  placeholder="Masukkan nominal (contoh: 25000)"
                  value={nominal}
                  onChange={(e) => setNominal(e.target.value)}
                  className="w-full h-14 pl-12 pr-4 bg-slate-50 dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-700 rounded-2xl text-lg font-black text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-600 focus:bg-white dark:focus:bg-slate-900 transition-all shadow-xs"
                  required
                />
              </div>
              {nominal && parseInt(nominal, 10) > 0 && (
                <div className="text-xs font-bold text-emerald-700 dark:text-emerald-400 mt-1 pl-1">
                  Terbilang: Rp {formatRupiah(parseInt(nominal, 10))}
                </div>
              )}
            </div>

            {/* Submit Action */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isProcessing || !activeSantri || !nominal}
                className="w-full h-14 bg-emerald-800 hover:bg-emerald-900 text-white font-extrabold rounded-2xl text-base shadow-lg shadow-emerald-950/20 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 active:scale-[0.99]"
              >
                {isProcessing ? (
                  <span>Memproses Penarikan...</span>
                ) : (
                  <span>Proses &amp; Serahkan Koin Tunai</span>
                )}
              </button>
            </div>
          </div>
        </div>
      </form>

      {/* Pop-up Modal Sukses Penarikan */}
      {isSuccessModal && lastTxData && (
        <div className="fixed inset-0 z-[99999] bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-fadeIn">
          <div className="success-modal-card modal-animate-pop bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl text-center">
            
            {/* Green Checkmark Badge Icon */}
            <div className="modal-badge-bounce w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 text-3xl font-extrabold flex items-center justify-center mx-auto mb-6 shadow-lg ring-8 ring-emerald-50 dark:ring-emerald-900/20">
              ✓
            </div>

            {/* Title & Subtitle */}
            <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight mb-2">
              Penarikan Koin Berhasil!
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 leading-relaxed px-2">
              Koin sebesar <strong className="font-bold text-emerald-700 dark:text-emerald-400">Rp {formatRupiah(lastTxData.nominal)}</strong> telah berhasil diproses untuk <span className="font-bold text-slate-800 dark:text-slate-200">{lastTxData.namaSantri}</span>.
            </p>

            {/* Detail Summary Card */}
            <div className="my-6 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 flex flex-col gap-3 text-left text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-semibold">Santri:</span>
                <span className="font-bold text-slate-900 dark:text-slate-100">{lastTxData.namaSantri} ({lastTxData.nis})</span>
              </div>
              <div className="h-px bg-slate-200 dark:bg-slate-700" />
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-semibold">Sisa Saldo Koin:</span>
                <strong className="text-sm font-extrabold text-emerald-700 dark:text-emerald-400">Rp {formatRupiah(lastTxData.sisaSaldo)}</strong>
              </div>
              <div className="h-px bg-slate-200 dark:bg-slate-700" />
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-semibold">Petugas Loket:</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">{lastTxData.staff}</span>
              </div>
            </div>

            {/* Button Selesai */}
            <button
              type="button"
              onClick={() => setIsSuccessModal(false)}
              className="w-full h-12 bg-emerald-800 hover:bg-emerald-900 text-white font-extrabold rounded-2xl text-sm shadow-md transition-all cursor-pointer flex items-center justify-center"
            >
              Tutup &amp; Selesai
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffCoinWithdrawalForm;
