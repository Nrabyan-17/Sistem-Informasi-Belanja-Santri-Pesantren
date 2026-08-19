import { useState, useRef, useEffect } from 'react';
import Modal from '../common/Modal';
import { santriApi } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

const formatTanggal = (iso) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
};

const SaldoDetailModal = ({
  isOpen,
  onClose,
  santri = {},
  initialMode = 'view', // 'view' | 'edit'
  allowAdjustment = false,
  onUpdatePhoto,
  onUpdateSaldo,
}) => {
  const { user } = useAuth();
  const fileInputRef = useRef(null);
  const [activeTab, setActiveTab] = useState(initialMode === 'edit' && allowAdjustment ? 'adjust' : 'detail');
  const [photoUrl, setPhotoUrl] = useState(santri?.foto || null);
  const [currentSaldo, setCurrentSaldo] = useState(santri?.saldo || 0);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [history, setHistory] = useState([]);

  // Form Penyesuaian State
  const [actionType, setActionType] = useState('tambah'); // 'tambah' | 'kurang'
  const [adjustNominal, setAdjustNominal] = useState('');
  const [adjustNote, setAdjustNote] = useState('');
  const [isAdjusting, setIsAdjusting] = useState(false);
  const [adjustSuccess, setAdjustSuccess] = useState('');
  const [adjustError, setAdjustError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialMode === 'edit' && allowAdjustment ? 'adjust' : 'detail');
      setPhotoUrl(santri?.foto || null);
      setCurrentSaldo(santri?.saldo || 0);
      setUploadSuccess(false);
      setUploadError('');
      setAdjustSuccess('');
      setAdjustError('');
      setAdjustNominal('');
      setAdjustNote('');

      if (santri?.id) {
        santriApi
          .mutasi(santri.id)
          .then((res) =>
            setHistory(
              (res.data || []).map((t) => ({
                id: t.id,
                tanggal: formatTanggal(t.created_at),
                keterangan: t.keterangan || (t.tipe === 'topup' ? 'Setor BNI Virtual Account' : 'Tarik Koin (Rumah Koin)'),
                nominal: t.nominal || 0,
              }))
            )
          )
          .catch(() => setHistory([]));
      }
    }
  }, [isOpen, santri, initialMode, allowAdjustment]);

  if (!santri) return null;

  const initialLetter = (santri.nama || 'S').charAt(0).toUpperCase();
  const formatRupiah = (val) => new Intl.NumberFormat('id-ID').format(val || 0);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('foto', file);
    fd.append('_method', 'PUT');
    setIsUploading(true);
    setUploadError('');
    try {
      const updated = await santriApi.update(santri.id, fd);
      setPhotoUrl(updated.foto_url || URL.createObjectURL(file));
      onUpdatePhoto?.(santri.id, updated.foto_url || null);
      setUploadSuccess(true);
      setTimeout(() => setUploadSuccess(false), 3000);
    } catch (err) {
      setUploadError(err.message || 'Gagal mengunggah pasfoto.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemovePhoto = () => {
    setPhotoUrl(null);
    onUpdatePhoto?.(santri.id, null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmitAdjustment = async (e) => {
    e.preventDefault();
    const amount = parseInt(adjustNominal || '0', 10);
    if (amount <= 0) {
      setAdjustError('Masukkan nominal penyesuaian yang valid.');
      return;
    }
    if (!adjustNote.trim()) {
      setAdjustError('Catatan alasan penyesuaian wajib diisi.');
      return;
    }
    if (actionType === 'kurang' && amount > currentSaldo) {
      setAdjustError(`Saldo tidak cukup untuk dikurangi! Maksimal pengurangan adalah Rp ${formatRupiah(currentSaldo)}.`);
      return;
    }

    setIsAdjusting(true);
    setAdjustError('');
    setAdjustSuccess('');

    try {
      const payload = {
        aksi: actionType, // 'tambah' | 'kurang'
        nominal: amount,
        keterangan: `Penyesuaian Saldo (${actionType === 'tambah' ? '+' : '-'}Rp ${formatRupiah(amount)}): ${adjustNote.trim()}`,
      };

      const res = await santriApi.penyesuaian(santri.id, payload);
      const newSaldo = actionType === 'tambah' ? currentSaldo + amount : currentSaldo - amount;
      setCurrentSaldo(newSaldo);
      onUpdateSaldo?.(santri.id, newSaldo);

      setAdjustSuccess(`Berhasil menyesuaikan saldo! Saldo baru ${santri.nama} adalah Rp ${formatRupiah(newSaldo)}.`);
      setAdjustNominal('');
      setAdjustNote('');

      // Refresh mutation history
      santriApi.mutasi(santri.id).then((mut) =>
        setHistory(
          (mut.data || []).map((t) => ({
            id: t.id,
            tanggal: formatTanggal(t.created_at),
            keterangan: t.keterangan || 'Penyesuaian Saldo',
            nominal: t.nominal || 0,
          }))
        )
      );
    } catch (err) {
      setAdjustError(err.message || 'Gagal memproses penyesuaian saldo.');
    } finally {
      setIsAdjusting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={allowAdjustment ? "Cek &amp; Penyesuaian Saldo Santri" : "Detail Saldo &amp; Pasfoto Santri"}
      subtitle="Lihat detail saldo, kelola pasfoto verifikasi, dan pantau riwayat transaksi santri."
      maxWidth="max-w-2xl"
    >
      <div className="saldo-modal-content flex flex-col gap-6">
        {/* Identitas Santri & Pasfoto Card */}
        <div className="saldo-identity-card bg-slate-50/90 dark:bg-slate-800/70 border border-slate-200/90 dark:border-slate-700/90 rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-xs">
          <div className="saldo-identity-left flex items-center gap-5">
            {/* Foto Santri */}
            <div className="relative shrink-0 group">
              {photoUrl ? (
                <img
                  src={photoUrl}
                  alt={santri.nama}
                  className="w-20 h-20 sm:w-22 sm:h-22 rounded-2xl object-cover border-2 border-emerald-600/60 shadow-md ring-4 ring-emerald-100 dark:ring-emerald-950/60"
                />
              ) : (
                <div className="w-20 h-20 sm:w-22 sm:h-22 rounded-2xl bg-emerald-700 text-white font-black text-3xl flex items-center justify-center shadow-md ring-4 ring-emerald-100 dark:ring-emerald-950/60">
                  {initialLetter}
                </div>
              )}

              {/* Hidden File Input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png, image/jpeg, image/jpg"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>

            <div className="flex flex-col">
              <span className="identity-tag text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block">
                IDENTITAS SANTRI
              </span>
              <h3 className="identity-name text-xl font-black text-slate-900 dark:text-slate-100 leading-tight mt-0.5">
                {santri.nama}
              </h3>
              <p className="identity-nis text-xs font-mono font-bold text-slate-500 dark:text-slate-400 mt-1">
                NIS: <span className="text-emerald-800 dark:text-emerald-400 font-extrabold">{santri.nis}</span>
              </p>

              {/* Action Buttons: Upload & Hapus Foto */}
              <div className="saldo-photo-actions mt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-lg shadow-2xs hover:bg-slate-50"
                >
                  {isUploading ? 'Mengunggah...' : photoUrl ? 'Ganti Pasfoto' : 'Upload Pasfoto'}
                </button>
                {photoUrl && (
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    className="px-2.5 py-1 text-rose-600 dark:text-rose-400 text-xs font-bold hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg"
                  >
                    Hapus
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="saldo-identity-right text-left sm:text-right shrink-0">
            <span className="sisa-saldo-tag text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block">
              SISA SALDO SAAT INI
            </span>
            <div className="sisa-saldo-val text-2xl sm:text-3xl font-black text-emerald-700 dark:text-emerald-400 mt-1 font-mono">
              Rp {formatRupiah(currentSaldo)}
            </div>
          </div>
        </div>

        {/* Upload Alert */}
        {uploadError && (
          <div className="p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-300 text-rose-700 rounded-xl text-xs font-bold">
            {uploadError}
          </div>
        )}
        {uploadSuccess && (
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 text-emerald-800 rounded-xl text-xs font-bold">
            Pasfoto santri berhasil diperbarui!
          </div>
        )}

        {/* Navigation Tabs if Staff Adjustment is allowed */}
        {allowAdjustment && (
          <div className="flex border-b border-slate-200 dark:border-slate-700 gap-4">
            <button
              type="button"
              onClick={() => setActiveTab('detail')}
              className={`pb-3 text-xs font-extrabold border-b-2 transition-all cursor-pointer ${
                activeTab === 'detail'
                  ? 'border-emerald-700 text-emerald-700 dark:text-emerald-400'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              Riwayat Mutasi Saldo
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('adjust')}
              className={`pb-3 text-xs font-extrabold border-b-2 transition-all cursor-pointer ${
                activeTab === 'adjust'
                  ? 'border-emerald-700 text-emerald-700 dark:text-emerald-400'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              ⚙️ Form Penyesuaian Saldo (Koreksi)
            </button>
          </div>
        )}

        {/* TAB 1: Riwayat Mutasi */}
        {activeTab === 'detail' && (
          <div className="saldo-history-section flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <h4 className="section-title-sm text-xs font-extrabold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                Mutasi Transaksi
              </h4>
              <span className="text-[11px] font-semibold text-slate-400">Pemasukan &amp; Penarikan</span>
            </div>
            <div className="overflow-x-auto border border-slate-200 dark:border-slate-700/80 rounded-2xl bg-white dark:bg-slate-900 shadow-2xs max-h-56 overflow-y-auto">
              <table className="mini-data-table w-full text-left border-collapse text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800 sticky top-0 border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="px-4 py-3 font-bold text-slate-500 uppercase">TANGGAL</th>
                    <th className="px-4 py-3 font-bold text-slate-500 uppercase">KETERANGAN</th>
                    <th className="px-4 py-3 font-bold text-slate-500 uppercase text-right">NOMINAL</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300">
                  {history.length === 0 ? (
                    <tr>
                      <td colSpan="3" className="px-4 py-6 text-center text-slate-400 font-medium">
                        Belum ada riwayat transaksi.
                      </td>
                    </tr>
                  ) : (
                    history.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/60 transition-colors">
                        <td className="px-4 py-3 font-medium whitespace-nowrap">{item.tanggal}</td>
                        <td className="px-4 py-3 font-medium">{item.keterangan}</td>
                        <td className="px-4 py-3 text-right font-bold whitespace-nowrap">
                          <span className={item.nominal > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}>
                            {item.nominal > 0 ? '+' : ''} Rp {Math.abs(item.nominal).toLocaleString('id-ID')}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: Form Penyesuaian Saldo */}
        {activeTab === 'adjust' && (
          <form onSubmit={handleSubmitAdjustment} className="flex flex-col gap-4 p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
            {adjustSuccess && (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 text-emerald-800 dark:text-emerald-200 rounded-xl text-xs font-bold">
                ✓ {adjustSuccess}
              </div>
            )}
            {adjustError && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/60 border border-rose-300 text-rose-700 dark:text-rose-300 rounded-xl text-xs font-bold">
                ⚠ {adjustError}
              </div>
            )}

            {/* Aksi: Tambah atau Kurang */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase text-slate-600 dark:text-slate-400">
                Tipe Penyesuaian Saldo
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setActionType('tambah')}
                  className={`py-3 px-4 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 border transition-all cursor-pointer ${
                    actionType === 'tambah'
                      ? 'bg-emerald-800 text-white border-emerald-800 shadow-xs'
                      : 'bg-white dark:bg-slate-900 border-slate-300 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <span className="text-sm">+</span> Tambah Saldo (Kredit)
                </button>
                <button
                  type="button"
                  onClick={() => setActionType('kurang')}
                  className={`py-3 px-4 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 border transition-all cursor-pointer ${
                    actionType === 'kurang'
                      ? 'bg-rose-700 text-white border-rose-700 shadow-xs'
                      : 'bg-white dark:bg-slate-900 border-slate-300 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <span className="text-sm">-</span> Kurangi Saldo (Debet)
                </button>
              </div>
            </div>

            {/* Nominal */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase text-slate-600 dark:text-slate-400">
                Nominal Koreksi (RP) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                  Rp
                </span>
                <input
                  type="number"
                  placeholder="Contoh: 15000"
                  value={adjustNominal}
                  onChange={(e) => setAdjustNominal(e.target.value)}
                  className="w-full h-11 pl-10 pr-3.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-600"
                  required
                />
              </div>
            </div>

            {/* Catatan / Alasan (Wajib) */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase text-slate-600 dark:text-slate-400">
                Catatan Alasan Penyesuaian <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={2}
                placeholder="Tuliskan alasan penyesuaian (misal: koreksi human error salah input / kendala mutasi)..."
                value={adjustNote}
                onChange={(e) => setAdjustNote(e.target.value)}
                className="w-full p-3 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:border-emerald-600"
                required
              />
            </div>

            {/* Staff Logger Info */}
            <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between pt-1">
              <span>
                Petugas Penyesuai: <strong className="text-slate-800 dark:text-slate-200">{user?.name || 'Staff Loket'}</strong>
              </span>
              <span>Dicatat otomatis dalam log transaksi</span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isAdjusting || !adjustNominal || !adjustNote}
              className={`h-11 px-6 font-extrabold rounded-xl text-xs text-white shadow-md transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 ${
                actionType === 'tambah' ? 'bg-emerald-800 hover:bg-emerald-900' : 'bg-rose-700 hover:bg-rose-800'
              }`}
            >
              {isAdjusting ? 'Memproses Penyesuaian...' : `Terapkan ${actionType === 'tambah' ? 'Penambahan' : 'Pengurangan'} Saldo`}
            </button>
          </form>
        )}

        {/* Footer Modal Action */}
        <div className="flex justify-end pt-2 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl transition-all cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default SaldoDetailModal;
