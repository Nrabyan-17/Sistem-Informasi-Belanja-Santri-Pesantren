import { useState, useRef, useEffect } from 'react';
import Modal from '../common/Modal';
import { santriApi } from '../../utils/api';

const formatTanggal = (iso) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
};

const SaldoDetailModal = ({ isOpen, onClose, santri = {}, onUpdatePhoto }) => {
  const fileInputRef = useRef(null);
  const [photoUrl, setPhotoUrl] = useState(santri?.foto || null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    if (isOpen) {
      setPhotoUrl(santri?.foto || null);
      setUploadSuccess(false);
      setUploadError('');
      if (santri?.id) {
        santriApi
          .mutasi(santri.id)
          .then((res) =>
            setHistory((res.data || []).map((t) => ({
              id: t.id,
              tanggal: formatTanggal(t.created_at),
              keterangan: t.keterangan || (t.tipe === 'topup' ? 'Setor BNI Virtual Account' : 'Tarik Koin (Rumah Koin)'),
              nominal: t.nominal || 0,
            })))
          )
          .catch(() => setHistory([]));
      }
    }
  }, [isOpen, santri]);

  if (!santri) return null;

  const currentSaldo = santri.saldo || 0;
  const initialLetter = (santri.nama || 'S').charAt(0).toUpperCase();

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
    // ponytail: backend punya update foto tapi tidak ada hapus-foto; hanya bersihkan preview lokal.
    setPhotoUrl(null);
    onUpdatePhoto?.(santri.id, null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Detail Saldo &amp; Pasfoto Santri"
      subtitle="Lihat detail saldo, kelola pasfoto verifikasi, dan pantau riwayat transaksi santri."
      maxWidth="max-w-2xl"
    >
      <div className="saldo-modal-content flex flex-col gap-6">
        {/* Identitas Santri & Pasfoto Card (Ditingkatkan Ukuran & Padding) */}
        <div className="saldo-identity-card bg-slate-50/90 dark:bg-slate-800/70 border border-slate-200/90 dark:border-slate-700/90 rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-xs">
          <div className="saldo-identity-left flex items-center gap-5">
            {/* Area Avatar / Foto Santri dengan Upload Trigger */}
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

              {/* Tombol Kamera Overlay */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-1 -right-1 w-8 h-8 bg-emerald-800 hover:bg-emerald-900 text-white rounded-full flex items-center justify-center shadow-md cursor-pointer border-2 border-white dark:border-slate-800 transition-transform active:scale-90"
                title="Unggah / Ganti Pasfoto"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>

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
                {santri.nama || 'Muhammad Rizki'}
              </h3>
              <p className="identity-nis text-xs font-mono font-bold text-slate-500 dark:text-slate-400 mt-1">
                NIS: <span className="text-emerald-800 dark:text-emerald-400 font-extrabold">{santri.nis || '2024003'}</span>
              </p>

              {/* Action Buttons: Upload & Hapus Foto */}
              <div className="saldo-photo-actions">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="btn-upload-photo"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  {isUploading ? 'Mengunggah...' : photoUrl ? 'Ganti Pasfoto' : 'Upload Pasfoto'}
                </button>
                {photoUrl && (
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    className="btn-delete-photo"
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
            <div className="sisa-saldo-val text-2xl sm:text-3xl font-black text-emerald-700 dark:text-emerald-400 mt-1">
              Rp {(currentSaldo || 15000).toLocaleString('id-ID')}
            </div>
          </div>
        </div>

        {/* Upload Error Alert */}
        {uploadError && (
          <div className="p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-300 dark:border-rose-700 text-rose-700 dark:text-rose-200 rounded-xl text-xs font-bold flex items-center gap-2 animate-fadeIn">
            <svg className="w-4 h-4 text-rose-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            </svg>
            {uploadError}
          </div>
        )}

        {/* Upload Success Toast Alert */}
        {uploadSuccess && (
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-200 rounded-xl text-xs font-bold flex items-center gap-2 animate-fadeIn">
            <svg className="w-4 h-4 text-emerald-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
            </svg>
            Pasfoto santri berhasil diunggah dan disimpan ke sistem verifikasi loket!
          </div>
        )}

        {/* Riwayat Transaksi Terakhir */}
        <div className="saldo-history-section flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <h4 className="section-title-sm text-xs font-extrabold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
              Riwayat Transaksi Terakhir
            </h4>
            <span className="text-[11px] font-semibold text-slate-400">Arus Kas Masuk &amp; Penarikan</span>
          </div>
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
