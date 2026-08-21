import React, { useState, useEffect, useRef } from 'react';
import Popup from '../common/Popup';
import { santriApi, penarikanApi } from '../../utils/api';

const getInitials = (name) => {
  if (!name) return 'S';
  const parts = name.trim().split(' ');
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  return name.slice(0, 2).toUpperCase();
};

const StaffCoinWithdrawalForm = ({ onWithdrawalSuccess }) => {
  const [santriOptions, setSantriOptions] = useState([]);
  const [selectedNis, setSelectedNis] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isOpenDropdown, setIsOpenDropdown] = useState(false);
  const dropdownRef = useRef(null);

  const [customNis, setCustomNis] = useState('');
  const [nominal, setNominal] = useState('');
  const [isConfirmWithdrawalModalOpen, setIsConfirmWithdrawalModalOpen] = useState(false);
  const [isSuccessModal, setIsSuccessModal] = useState(false);
  const [isInsufficientModal, setIsInsufficientModal] = useState(false);
  const [insufficientData, setInsufficientData] = useState(null);
  const [lastTxData, setLastTxData] = useState(null);
  const [popupConfig, setPopupConfig] = useState({ isOpen: false, type: 'error', title: '', message: '' });

  useEffect(() => {
    santriApi.list({ per_page: 500 })
      .then((res) => {
        const rawData = res.data || (Array.isArray(res) ? res : []);
        if (Array.isArray(rawData) && rawData.length > 0) {
          const mapped = rawData.map((s) => ({
            id: s.id,
            nis: s.nis || '',
            nama: s.nama || s.name || '',
            kelas: s.kelas || 'VII A',
            saldo: Number(s.saldo || 0),
            foto: s.foto || s.foto_url || null,
          }));
          setSantriOptions(mapped);
          if (mapped.length > 0 && !selectedNis) {
            setSelectedNis(mapped[0].nis);
          }
        } else {
          setSantriOptions([]);
        }
      })
      .catch((err) => {
        console.warn('Gagal memuat data santri untuk penarikan koin:', err.message);
        setSantriOptions([]);
      });
  }, []);

  // Handle click outside to close autocomplete popup
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpenDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter daftar santri untuk rekomendasi autocomplete
  const filteredSuggestions = searchQuery
    ? santriOptions.filter(
        (s) =>
          s.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.nis.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  // Find santri object based on selected NIS or search match
  const activeSantri = santriOptions.find((s) => s.nis === selectedNis) || {
    id: Date.now(),
    nis: customNis || '2024000',
    nama: 'Santri Terpilih',
    saldo: 100000,
  };

  // Step 1: Inisiasi & Validasi awal sebelum menampilkan modal konfirmasi
  const handleInitiateWithdrawal = (e) => {
    e.preventDefault();
    const amount = parseInt(nominal || '0', 10);
    if (amount <= 0) {
      setPopupConfig({ isOpen: true, type: 'error', title: 'Nominal Tidak Valid', message: 'Masukkan nominal penarikan koin yang valid.' });
      return;
    }
    if (amount > 30000) {
      setPopupConfig({ isOpen: true, type: 'error', title: 'Melebihi Batas', message: 'Batas penarikan koin santri maksimal Rp 30.000 per 2 hari.' });
      return;
    }
    if (amount > activeSantri.saldo) {
      setInsufficientData({
        namaSantri: activeSantri.nama,
        nis: activeSantri.nis,
        saldo: activeSantri.saldo,
        nominalDiminta: amount,
      });
      setIsInsufficientModal(true);
      return;
    }

    // Buka Pop-up Validasi Data Penarikan Koin
    setIsConfirmWithdrawalModalOpen(true);
  };

  // Step 2: Eksekusi penarikan koin setelah staff mengonfirmasi di modal validasi
  const handleExecuteWithdrawal = async () => {
    const amount = parseInt(nominal || '0', 10);
    const newSaldo = activeSantri.saldo - amount;
    const santriKey = activeSantri.id || activeSantri.nis;

    // Panggil API penarikan backend
    let savedTx = null;
    try {
      const apiRes = await penarikanApi.store({ santri_id: activeSantri.id, nominal: amount });
      savedTx = apiRes?.data || apiRes?.transaction || apiRes;
    } catch (err) {
      console.warn('Gagal panggil API penarikan:', err.message);
    }

    // Refresh daftar santri dari API agar saldo santri selalu sinkron
    santriApi.list({ per_page: 500 })
      .then((res) => {
        const rawData = res.data || (Array.isArray(res) ? res : []);
        if (Array.isArray(rawData) && rawData.length > 0) {
          const mapped = rawData.map((s) => ({
            id: s.id,
            nis: s.nis || '',
            nama: s.nama || s.name || '',
            kelas: s.kelas || 'VII A',
            saldo: Number(s.saldo || 0),
            foto: s.foto || s.foto_url || null,
          }));
          setSantriOptions(mergeSantriSaldos(mapped));
        }
      })
      .catch(() => {});

    // Update state options lokal
    setSantriOptions((prev) =>
      prev.map((s) => (s.nis === activeSantri.nis ? { ...s, saldo: newSaldo } : s))
    );

    const txData = {
      id: savedTx?.id || Date.now(),
      created_at: savedTx?.created_at || new Date().toISOString(),
      tanggal: new Date().toISOString().slice(0, 10),
      waktu: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      nis: activeSantri.nis,
      namaSantri: activeSantri.nama,
      kategori: 'Penarikan Koin',
      jenis: 'Keluar',
      nominal: amount,
      sisaSaldo: newSaldo,
      staff: savedTx?.creator?.name || savedTx?.created_by?.name || 'Staff Rumah Koin',
      status: 'sukses',
    };

    setIsConfirmWithdrawalModalOpen(false);
    setLastTxData(txData);
    setIsSuccessModal(true);
    onWithdrawalSuccess?.(savedTx || txData);

    // Reset form
    setNominal('');
  };

  const formatRupiah = (val) => new Intl.NumberFormat('id-ID').format(val);

  return (
    <div className="staff-withdrawal-card bg-white dark:bg-slate-900 mt-7">
      <div className="card-header border-b border-slate-100 dark:border-slate-800 pb-5 mb-8 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            Form Penarikan Koin / Saldo Santri
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Proses penarikan koin tunai santri dan potong saldo secara otomatis
          </p>
        </div>
        <span className="px-3.5 py-1.5 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 rounded-full text-xs font-bold">
          Loket Rumah Koin
        </span>
      </div>

      <form onSubmit={handleInitiateWithdrawal} className="flex flex-col pt-1 gap-6">
        {/* Row 1: Search Bar & Input Nominal Side-by-Side */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          {/* Left Column: Input Search Bar Santri */}
          <div ref={dropdownRef} className="lg:col-span-6 flex flex-col gap-2 relative">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 flex items-center justify-between">
              <span>Cari Santri (NIS / Nama)</span>
              <span className="text-[11px] font-normal text-emerald-700 dark:text-emerald-400 font-sans">
                {activeSantri.nis ? `Terpilih: ${activeSantri.nama}` : 'Ketik untuk mencari'}
              </span>
            </label>

            {/* Search Bar Input Field */}
            <div className="relative flex items-center">
              <svg
                className="absolute left-3.5 w-4 h-4 text-slate-400 dark:text-slate-500 pointer-events-none z-10"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2.2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>

              <input
                type="text"
                value={searchQuery}
                onFocus={() => setIsOpenDropdown(true)}
                onChange={(e) => {
                  const query = e.target.value;
                  setSearchQuery(query);
                  setIsOpenDropdown(true);
                  const matched = santriOptions.find(
                    (s) =>
                      s.nis.toLowerCase().includes(query.toLowerCase()) ||
                      s.nama.toLowerCase().includes(query.toLowerCase())
                  );
                  if (matched) {
                    setSelectedNis(matched.nis);
                  } else {
                    setCustomNis(query);
                  }
                }}
                placeholder="Ketik NIS atau nama santri..."
                style={{ paddingLeft: '40px', paddingRight: '40px' }}
                className="w-full h-11 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 transition-all"
              />

              {/* Clear Button */}
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedNis('2024003');
                    setIsOpenDropdown(false);
                  }}
                  className="absolute right-3 w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-600 dark:text-slate-300 text-xs flex items-center justify-center transition-colors cursor-pointer"
                  title="Hapus pencarian"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Autocomplete Recommendation Dropdown Popup */}
            {isOpenDropdown && filteredSuggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl max-h-64 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 animate-fadeIn">
                {filteredSuggestions.map((item) => (
                  <div
                    key={item.nis}
                    onClick={() => {
                      setSelectedNis(item.nis);
                      setSearchQuery(item.nama);
                      setIsOpenDropdown(false);
                    }}
                    className="p-3 hover:bg-emerald-50/80 dark:hover:bg-slate-800/80 cursor-pointer transition-colors flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      {item.foto ? (
                        <img
                          src={item.foto}
                          alt={item.nama}
                          className="w-9 h-9 rounded-xl object-cover border border-emerald-600/30 shrink-0"
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-xl bg-emerald-700 text-white font-extrabold text-xs flex items-center justify-center shrink-0">
                          {getInitials(item.nama)}
                        </div>
                      )}
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-900 dark:text-slate-100 text-sm leading-tight">
                          {item.nama}
                        </span>
                        <span className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                          NIS: {item.nis} • Kelas {item.kelas}
                        </span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">SALDO</span>
                      <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">
                        Rp {formatRupiah(item.saldo)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Nominal Penarikan & Action */}
          <div className="lg:col-span-6 flex flex-col gap-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 flex items-center justify-between">
              <span>Nominal Penarikan (RP)</span>
              <span className="text-[11px] font-bold text-amber-700 dark:text-amber-400">Maks. 30rb</span>
            </label>
            <input
              type="number"
              placeholder="Contoh: 30000"
              max="30000"
              value={nominal}
              onChange={(e) => setNominal(e.target.value)}
              className="w-full h-11 px-3.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-600"
              required
            />
            {/* Pengingat Batas Penarikan Santri */}
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
              <strong className="text-slate-700 dark:text-slate-300 font-bold">Batas penarikan santri:</strong> Maks. Rp 30.000 per 2 hari.
            </p>
          </div>
        </div>

        {/* Row 2: Info Santri Terpilih (Sama lebar dengan Input Search Bar di atasnya) & Tombol Proses Penarikan Koin */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center pt-4 border-t border-slate-100 dark:border-slate-800">
          {/* Info Card Santri Terpilih (lg:col-span-6, persis selebar Input Search Bar) */}
          <div className="lg:col-span-6">
            <div className="santri-preview-box flex-wrap sm:flex-nowrap gap-3 my-0 w-full">
              <div className="flex items-center gap-3 min-w-0">
                {/* Foto / Inisial Profil Santri */}
                <div className="relative shrink-0">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 min-w-[48px] min-h-[48px] rounded-full bg-emerald-700 dark:bg-emerald-800 text-white font-extrabold text-base sm:text-lg flex items-center justify-center border-2 border-emerald-600/40 dark:border-emerald-400/40 shadow-xs ring-4 ring-emerald-50 dark:ring-emerald-950/40 overflow-hidden aspect-square">
                    {activeSantri.foto ? (
                      <img
                        src={activeSantri.foto}
                        alt={activeSantri.nama}
                        className="w-full h-full object-cover rounded-full aspect-square block"
                      />
                    ) : (
                      getInitials(activeSantri.nama)
                    )}
                  </div>
                  <span
                    className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-800 shadow-2xs"
                    title="Santri Aktif"
                  />
                </div>

                <div className="flex flex-col min-w-0">
                  <span className="santri-preview-label truncate">
                    INFO SANTRI TERPILIH
                  </span>
                  <h3 className="santri-preview-name font-extrabold text-slate-900 dark:text-slate-100 text-sm sm:text-base leading-snug truncate">
                    {activeSantri.nama}
                  </h3>
                  <p className="santri-preview-nis text-xs font-mono text-slate-500 dark:text-slate-400 mt-0.5">
                    NIS: {activeSantri.nis}
                  </p>
                </div>
              </div>

              <div className="text-left sm:text-right shrink-0">
                <span className="santri-preview-label">
                  SISA SALDO
                </span>
                <span className="santri-preview-saldo text-emerald-600 dark:text-emerald-400 font-extrabold text-base sm:text-lg">
                  Rp {formatRupiah(activeSantri.saldo)}
                </span>
              </div>
            </div>
          </div>

          {/* Tombol Proses Penarikan Koin (lg:col-span-6) */}
          <div className="lg:col-span-6 flex items-center justify-start">
            <button
              type="submit"
              className="btn-process-withdrawal w-full lg:w-auto h-13 sm:h-14 px-8 sm:px-10 bg-emerald-800 hover:bg-emerald-900 active:scale-95 text-white font-extrabold rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 text-sm sm:text-base cursor-pointer"
            >
              <span>Proses Penarikan Koin</span>
            </button>
          </div>
        </div>
      </form>

      {/* Pop-up Modal Validasi Konfirmasi Data Penarikan Koin */}
      {isConfirmWithdrawalModalOpen && (
        <div
          className="fixed inset-0 z-[99999] bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setIsConfirmWithdrawalModalOpen(false)}
        >
          <div
            className="modal-animate-pop bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl max-w-md w-full shadow-2xl relative text-center flex flex-col items-center transition-colors"
            style={{ padding: '40px 32px 32px 32px' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Amber Shield / Question Icon Box */}
            <div
              className="modal-badge-bounce rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-100 dark:border-amber-900/50 flex items-center justify-center shrink-0 shadow-xs"
              style={{ width: '64px', height: '64px', marginBottom: '20px' }}
            >
              <svg
                className="text-amber-600 dark:text-amber-400"
                style={{ width: '34px', height: '34px' }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2.2"
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
            </div>

            {/* Title */}
            <h3
              className="font-extrabold text-slate-900 dark:text-slate-100 tracking-tight"
              style={{ fontSize: '22px', marginBottom: '8px' }}
            >
              Konfirmasi Penarikan Koin
            </h3>

            {/* Description */}
            <p
              className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed"
              style={{ fontSize: '14px', maxWidth: '340px', marginBottom: '20px' }}
            >
              Apakah Anda sudah yakin data penarikan koin santri ini sudah benar?
            </p>

            {/* Ringkasan Box */}
            <div
              className="w-full bg-slate-50 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700/80 rounded-2xl text-left flex flex-col"
              style={{ padding: '18px 20px', marginBottom: '28px', gap: '10px' }}
            >
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 dark:text-slate-400 font-medium">Santri:</span>
                <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                  {activeSantri.nama} ({activeSantri.nis})
                </span>
              </div>
              <div className="flex justify-between items-center text-xs border-t border-slate-200 dark:border-slate-700/80 pt-2">
                <span className="text-slate-500 dark:text-slate-400 font-medium">Nominal Penarikan:</span>
                <span className="font-extrabold text-emerald-700 dark:text-emerald-400 font-mono text-sm">
                  Rp {formatRupiah(parseInt(nominal || '0', 10))}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs border-t border-slate-200 dark:border-slate-700/80 pt-2">
                <span className="text-slate-500 dark:text-slate-400 font-medium">Estimasi Sisa Saldo:</span>
                <span className="font-extrabold text-slate-900 dark:text-slate-100 font-mono text-sm">
                  Rp {formatRupiah(activeSantri.saldo - parseInt(nominal || '0', 10))}
                </span>
              </div>
              <div
                className="flex justify-between items-center text-xs border-t border-slate-200 dark:border-slate-700/80"
                style={{ paddingTop: '10px' }}
              >
                <span className="text-slate-500 dark:text-slate-400 font-medium">Status Penarikan:</span>
                <span className="inline-flex items-center gap-1.5 font-bold text-amber-700 dark:text-amber-400">
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                  Menunggu Konfirmasi Staff
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3 w-full">
              <button
                type="button"
                onClick={() => setIsConfirmWithdrawalModalOpen(false)}
                className="w-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-2xl transition-all cursor-pointer flex items-center justify-center"
                style={{ height: '50px', fontSize: '14px' }}
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleExecuteWithdrawal}
                className="w-full bg-emerald-800 hover:bg-emerald-900 active:scale-95 text-white font-bold rounded-2xl shadow-md shadow-emerald-900/20 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                style={{ height: '50px', fontSize: '14px' }}
              >
                <span>Ya, Proses</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pop-up Modal Sukses Penarikan - Display Lega & Spacing Proporsional */}
      {isSuccessModal && lastTxData && (
        <div className="fixed inset-0 z-[99999] bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-fadeIn">
          <div className="success-modal-card modal-animate-pop">
            
            {/* Green Checkmark Badge Icon */}
            <div className="modal-badge-bounce w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 text-3xl font-extrabold flex items-center justify-center mx-auto mb-7 shadow-lg shadow-emerald-900/10 ring-8 ring-emerald-50 dark:ring-emerald-900/20">
              ✓
            </div>

            {/* Title & Subtitle */}
            <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight mb-2">
              Penarikan Koin Berhasil!
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 leading-relaxed px-2">
              Koin sebesar <strong className="font-bold text-emerald-700 dark:text-emerald-400">Rp {formatRupiah(lastTxData.nominal)}</strong> telah diserahkan kepada <span className="font-bold text-slate-800 dark:text-slate-200">{lastTxData.namaSantri}</span>.
            </p>

            {/* Detail Summary Card dengan Padding & Row Gap Sangat Lega */}
            <div className="success-modal-details">
              <div className="success-modal-row items-center">
                <span className="success-modal-label">Santri:</span>
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-emerald-700 text-white text-xs font-extrabold flex items-center justify-center shrink-0">
                    {getInitials(lastTxData.namaSantri)}
                  </div>
                  <strong className="success-modal-value">{lastTxData.namaSantri} ({lastTxData.nis})</strong>
                </div>
              </div>
              <div className="success-modal-divider"></div>
              <div className="success-modal-row">
                <span className="success-modal-label">Sisa Saldo:</span>
                <strong className="success-modal-value text-emerald-600 dark:text-emerald-400 text-base font-extrabold">Rp {formatRupiah(lastTxData.sisaSaldo)}</strong>
              </div>
              <div className="success-modal-divider"></div>
              <div className="success-modal-row">
                <span className="success-modal-label">Staff:</span>
                <span className="success-modal-value font-semibold">{lastTxData.staff}</span>
              </div>
            </div>

            {/* Garis Pembatas dengan Margin Pembatas */}
            <div className="w-full h-px bg-slate-200 dark:bg-slate-800 mb-6"></div>

            {/* Button Selesai */}
            <button
              type="button"
              onClick={() => setIsSuccessModal(false)}
              className="w-full h-13 py-3.5 bg-[#0e5d26] hover:bg-[#0b471d] text-white font-extrabold rounded-xl text-sm sm:text-base shadow-lg shadow-emerald-950/20 transition-all cursor-pointer flex items-center justify-center active:scale-[0.99]"
            >
              Tutup &amp; Selesai
            </button>
          </div>
        </div>
      )}

      {/* Pop-up Modal Saldo Tidak Cukup - Tampilan Rapi, Lega & Proporsional */}
      {isInsufficientModal && insufficientData && (
        <div
          className="fixed inset-0 z-[99999] bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-fadeIn"
          onClick={() => setIsInsufficientModal(false)}
        >
          <div
            className="insufficient-modal-card modal-animate-pop my-auto relative pt-8"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Tombol Ikon Silang (✕) di Pojok Kanan Atas */}
            <button
              type="button"
              onClick={() => setIsInsufficientModal(false)}
              className="absolute top-4 right-4 w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors flex items-center justify-center cursor-pointer"
              title="Tutup Modal"
              aria-label="Tutup Modal"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Title & Subtitle */}
            <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight mb-2 mt-1">
              Saldo Tidak Cukup
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed px-2">
              Saldo santri tidak mencukupi untuk melakukan penarikan koin sebesar{' '}
              <strong className="font-bold text-rose-600 dark:text-rose-400">
                Rp {formatRupiah(insufficientData.nominalDiminta)}
              </strong>.
            </p>

            {/* Detail Breakdown Card dengan Spacing Teratur */}
            <div className="insufficient-modal-details">
              <div className="success-modal-row">
                <span className="success-modal-label">Santri:</span>
                <strong className="success-modal-value">
                  {insufficientData.namaSantri} ({insufficientData.nis})
                </strong>
              </div>
              <div className="success-modal-divider"></div>
              <div className="success-modal-row">
                <span className="success-modal-label">Sisa Saldo Saat Ini:</span>
                <strong className="success-modal-value text-emerald-700 dark:text-emerald-400 text-sm sm:text-base font-extrabold font-mono">
                  Rp {formatRupiah(insufficientData.saldo)}
                </strong>
              </div>
              <div className="success-modal-divider"></div>
              <div className="success-modal-row">
                <span className="success-modal-label">Nominal Penarikan:</span>
                <strong className="success-modal-value text-rose-600 dark:text-rose-400 font-bold font-mono">
                  Rp {formatRupiah(insufficientData.nominalDiminta)}
                </strong>
              </div>
            </div>

            {/* Button Tutup dengan Jarak / Gap yang Pasti */}
            <button
              type="button"
              onClick={() => setIsInsufficientModal(false)}
              className="insufficient-modal-btn"
            >
              Tutup &amp; Kembali
            </button>
          </div>
        </div>
      )}

      {/* ERROR POPUP */}
      <Popup
        isOpen={popupConfig.isOpen}
        type={popupConfig.type}
        title={popupConfig.title}
        message={popupConfig.message}
        onClose={() => setPopupConfig({ ...popupConfig, isOpen: false })}
      />
    </div>
  );
};

export default StaffCoinWithdrawalForm;
