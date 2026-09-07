import { useState, useEffect, useRef } from 'react';
import Modal from '../common/Modal';

// Modal Form Tambah / Edit Data Santri
const SantriModalForm = ({ isOpen, onClose, onSubmit, initialData = {}, kelasOptions = [] }) => {
  const isEdit = Boolean(initialData?.id);
  const fileInputRef = useRef(null);

  const [nis, setNis] = useState('');
  const [nama, setNama] = useState('');
  const [kelas, setKelas] = useState('');
  const [jenisKelamin, setJenisKelamin] = useState('L');
  const [tglLahir, setTglLahir] = useState('');
  const [vaJajan, setVaJajan] = useState('');
  const [status, setStatus] = useState('aktif');
  const [foto, setFoto] = useState(null);
  const [fotoPreview, setFotoPreview] = useState('');
  const [hapusFoto, setHapusFoto] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setNis(initialData.nis || '');
      setNama(initialData.nama || '');
      setKelas(initialData.kelas || initialData.class || '');
      setJenisKelamin(initialData.jenisKelamin || initialData.jenis_kelamin || 'L');
      setTglLahir(initialData.tglLahir || initialData.tanggal_lahir || '');
      setVaJajan(initialData.vaJajan || initialData.va_jajan || '');
      setStatus(initialData.status || 'aktif');
      setFoto(null);
      setFotoPreview(initialData.foto || initialData.foto_url || '');
      setHapusFoto(false);
      setIsSubmitting(false);
    }
  }, [isOpen, initialData]);

  const handleFotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFoto(file);
    setFotoPreview(URL.createObjectURL(file));
    setHapusFoto(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit?.({
        ...initialData,
        nis,
        nama,
        kelas,
        jenisKelamin,
        tglLahir,
        vaJajan,
        status,
        foto,
        fotoPreview,
        hapusFoto,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass =
    'form-control-input w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-emerald-600 focus:bg-white dark:focus:bg-slate-900 transition-all';
  const labelClass =
    'form-section-label text-[10px] font-bold tracking-wider text-slate-500 dark:text-slate-400 uppercase';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Ubah Data Santri' : 'Tambah Data Santri Baru'}
      subtitle={
        isEdit
          ? 'Perbarui informasi data santri pesantren.'
          : 'Masukkan data santri baru ke dalam sistem.'
      }
    >
      <form className="user-form-modal flex flex-col gap-3.5" onSubmit={handleSubmit}>
        {/* NIS & NAMA — 2 kolom */}
        <div className="form-grid-2col grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="form-group-section flex flex-col gap-1">
            <label className={labelClass}>NIS (NOMOR INDUK SANTRI)</label>
            <input
              type="text"
              className={inputClass}
              placeholder="Contoh: 2024001"
              value={nis}
              onChange={(e) => setNis(e.target.value)}
              required
            />
          </div>
          <div className="form-group-section flex flex-col gap-1">
            <label className={labelClass}>NAMA LENGKAP</label>
            <input
              type="text"
              className={inputClass}
              placeholder="Contoh: Ahmad Fauzi"
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              required
            />
          </div>
        </div>

        {/* JENIS KELAMIN & TANGGAL LAHIR — 2 kolom */}
        <div className="form-grid-2col grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="form-group-section flex flex-col gap-1">
            <label className={labelClass}>JENIS KELAMIN</label>
            <select
              className={inputClass}
              value={jenisKelamin}
              onChange={(e) => setJenisKelamin(e.target.value)}
            >
              <option value="L">Laki-laki</option>
              <option value="P">Perempuan</option>
            </select>
          </div>
          <div className="form-group-section flex flex-col gap-1">
            <label className={labelClass}>TANGGAL LAHIR</label>
            <input
              type="date"
              className={inputClass}
              value={tglLahir}
              onChange={(e) => setTglLahir(e.target.value)}
            />
          </div>
        </div>

        {/* FOTO SANTRI (OPSIONAL) */}
        <div className="form-group-section flex flex-col gap-2">
          <label className={labelClass}>FOTO SANTRI <span className="normal-case font-medium text-slate-400 dark:text-slate-500">(Opsional — bisa diunggah nanti)</span></label>
          <div className="flex items-center gap-5">
            <div className="w-22 h-22 sm:w-26 sm:h-26 min-w-[88px] min-h-[88px] sm:min-w-[104px] sm:min-h-[104px] rounded-full bg-slate-100 dark:bg-slate-800 border-2 sm:border-3 border-emerald-500/40 dark:border-emerald-600/40 ring-4 ring-emerald-50 dark:ring-emerald-950/40 flex items-center justify-center overflow-hidden shrink-0 shadow-md aspect-square">
              {fotoPreview ? (
                <img
                  src={fotoPreview}
                  alt={nama || 'Foto Santri'}
                  className="w-full h-full object-cover rounded-full aspect-square block"
                />
              ) : (
                <span className="text-3xl sm:text-4xl font-black text-slate-400">
                  {(nama || 'S').charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50 rounded-xl text-xs sm:text-sm font-bold hover:bg-emerald-100 dark:hover:bg-emerald-950 transition-all cursor-pointer w-fit shadow-xs"
              >
                {fotoPreview ? 'Ganti Foto' : 'Upload Foto'}
              </button>
              {fotoPreview && (
                <button
                  type="button"
                  onClick={() => {
                    setFoto(null);
                    setFotoPreview('');
                    setHapusFoto(true);
                    if (fileInputRef.current) fileInputRef.current.value = '';
                  }}
                  className="px-3 py-1 text-rose-600 dark:text-rose-400 text-xs font-semibold hover:underline cursor-pointer w-fit text-left"
                >
                  Hapus Foto
                </button>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/jpg"
              className="hidden"
              onChange={handleFotoChange}
            />
          </div>
        </div>

        {/* KELAS & VA JAJAN — 2 kolom */}
        <div className="form-grid-2col grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="form-group-section flex flex-col gap-1">
            <label className={labelClass}>KELAS</label>
            <input
              type="text"
              className={inputClass}
              placeholder="Contoh: VII A"
              list="kelas-options"
              value={kelas}
              onChange={(e) => setKelas(e.target.value)}
            />
            <datalist id="kelas-options">
              {kelasOptions.map((k) => (
                <option key={k} value={k} />
              ))}
            </datalist>
          </div>
          <div className="form-group-section flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <label className={labelClass}>NO. VA JAJAN (BNI)</label>
            </div>
            <input
              type="text"
              className={inputClass}
              placeholder="Contoh: 88080990..."
              value={vaJajan}
              onChange={(e) => setVaJajan(e.target.value)}
            />
          </div>
        </div>

        {/* STATUS SANTRI (Hanya tampil saat edit) */}
        {isEdit && (
          <div className="form-group-section flex flex-col gap-1">
            <label className={labelClass}>STATUS SANTRI</label>
            <div className="status-toggle-group flex gap-2">
              <button
                type="button"
                className={`status-toggle-btn flex-1 py-1.5 px-3 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
                  status === 'aktif'
                    ? 'status-toggle-btn--active bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
                onClick={() => setStatus('aktif')}
              >
                Aktif
              </button>
              <button
                type="button"
                className={`status-toggle-btn flex-1 py-1.5 px-3 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
                  status === 'nonaktif'
                    ? 'status-toggle-btn--inactive bg-rose-600 text-white border-rose-600 shadow-2xs'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
                onClick={() => setStatus('nonaktif')}
              >
                Nonaktif
              </button>
            </div>
          </div>
        )}

        {/* Form Actions */}
        <div className="modal-actions-footer flex justify-end gap-2.5 pt-3 mt-1 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            disabled={isSubmitting}
            className={`btn btn-secondary px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-xs transition-all ${
              isSubmitting ? 'opacity-60 cursor-not-allowed' : 'hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer'
            }`}
            onClick={onClose}
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn btn-primary btn-save px-5 py-2 bg-emerald-800 hover:bg-emerald-900 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold rounded-xl text-xs shadow-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 min-w-[140px]"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin h-3.5 w-3.5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Memproses...</span>
              </>
            ) : (
              isEdit ? 'Simpan Perubahan' : 'Tambah Santri'
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default SantriModalForm;
