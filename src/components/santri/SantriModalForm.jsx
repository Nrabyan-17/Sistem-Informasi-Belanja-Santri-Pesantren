import { useState, useEffect, useRef } from 'react';
import Modal from '../common/Modal';

// Modal Form Tambah / Edit Data Santri
const SantriModalForm = ({ isOpen, onClose, onSubmit, initialData = {} }) => {
  const isEdit = Boolean(initialData?.id);
  const fileInputRef = useRef(null);

  const [nis, setNis] = useState('');
  const [nama, setNama] = useState('');
  const [jenisKelamin, setJenisKelamin] = useState('L');
  const [tglLahir, setTglLahir] = useState('');
  const [vaJajan, setVaJajan] = useState('');
  const [status, setStatus] = useState('aktif');
  const [foto, setFoto] = useState(null);
  const [fotoPreview, setFotoPreview] = useState('');

  useEffect(() => {
    if (isOpen) {
      setNis(initialData.nis || '');
      setNama(initialData.nama || '');
      setJenisKelamin(initialData.jenisKelamin || 'L');
      setTglLahir(initialData.tglLahir || '');
      setVaJajan(initialData.vaJajan || '');
      setStatus(initialData.status || 'aktif');
      setFoto(null);
      setFotoPreview('');
    }
  }, [isOpen, initialData]);

  const handleFotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFoto(file);
    setFotoPreview(URL.createObjectURL(file));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit?.({
      ...initialData,
      nis,
      nama,
      jenisKelamin,
      tglLahir,
      vaJajan,
      status,
      foto,
    });
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

        {/* FOTO SANTRI — Opsional */}
        <div className="form-group-section flex flex-col gap-1.5">
          <label className={labelClass}>FOTO SANTRI <span className="normal-case font-medium text-slate-400 dark:text-slate-500">(Opsional — bisa diunggah nanti)</span></label>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-2xl font-black text-slate-400 shrink-0">
              {(nama || 'S').charAt(0).toUpperCase()}
            </div>
            <div className="flex flex-col gap-1.5">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50 rounded-lg text-xs font-bold hover:bg-emerald-100 dark:hover:bg-emerald-950 transition-all cursor-pointer w-fit"
              >
                {fotoPreview ? 'Ganti Foto' : 'Upload Foto'}
              </button>
              {fotoPreview && (
                <button
                  type="button"
                  onClick={() => {
                    setFoto(null);
                    setFotoPreview('');
                    if (fileInputRef.current) fileInputRef.current.value = '';
                  }}
                  className="px-3 py-1 text-rose-600 dark:text-rose-400 text-[11px] font-semibold hover:underline cursor-pointer w-fit"
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

        {/* VA JAJAN — 1 kolom */}
        <div className="form-grid-2col grid grid-cols-1 sm:grid-cols-2 gap-3">
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
            className="btn btn-secondary px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 font-bold rounded-xl text-xs transition-all cursor-pointer"
            onClick={onClose}
          >
            Batal
          </button>
          <button
            type="submit"
            className="btn btn-primary btn-save px-5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-xl text-xs shadow-xs transition-all cursor-pointer"
          >
            {isEdit ? 'Simpan Perubahan' : 'Tambah Santri'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default SantriModalForm;
