import { useState, useEffect } from 'react';
import Modal from '../common/Modal';

// Modal Form Tambah / Edit Data Santri
const SantriModalForm = ({ isOpen, onClose, onSubmit, initialData = {} }) => {
  const isEdit = Boolean(initialData?.id);

  const [nis, setNis] = useState('');
  const [nama, setNama] = useState('');
  const [kelas, setKelas] = useState('VII A');
  const [tglLahir, setTglLahir] = useState('');
  const [namaWali, setNamaWali] = useState('');
  const [noHpWali, setNoHpWali] = useState('');
  const [vaJajan, setVaJajan] = useState('');
  const [vaTagihan, setVaTagihan] = useState('');
  const [status, setStatus] = useState('aktif');

  useEffect(() => {
    if (isOpen) {
      setNis(initialData.nis || '');
      setNama(initialData.nama || '');
      setKelas(initialData.kelas || 'VII A');
      setTglLahir(initialData.tglLahir || '');
      setNamaWali(initialData.namaWali || '');
      setNoHpWali(initialData.noHpWali || '');
      setVaJajan(initialData.vaJajan || '');
      setVaTagihan(initialData.vaTagihan || '');
      setStatus(initialData.status || 'aktif');
    }
  }, [isOpen, initialData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit?.({
      ...initialData,
      nis,
      nama,
      kelas,
      tglLahir,
      namaWali,
      noHpWali,
      vaJajan,
      vaTagihan,
      status,
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

        {/* KELAS & TANGGAL LAHIR — 2 kolom */}
        <div className="form-grid-2col grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="form-group-section flex flex-col gap-1">
            <label className={labelClass}>KELAS / ASRAMA</label>
            <select
              className={inputClass}
              value={kelas}
              onChange={(e) => setKelas(e.target.value)}
            >
              <option value="VII A">VII A</option>
              <option value="VII B">VII B</option>
              <option value="VIII A">VIII A</option>
              <option value="VIII B">VIII B</option>
              <option value="IX A">IX A</option>
              <option value="IX B">IX B</option>
            </select>
          </div>
          <div className="form-group-section flex flex-col gap-1">
            <label className={labelClass}>TANGGAL LAHIR</label>
            <input
              type="text"
              className={inputClass}
              placeholder="Contoh: 12 Mei 2012"
              value={tglLahir}
              onChange={(e) => setTglLahir(e.target.value)}
            />
          </div>
        </div>

        {/* NAMA WALI */}
        <div className="form-group-section flex flex-col gap-1">
          <label className={labelClass}>NAMA WALI</label>
          <input
            type="text"
            className={inputClass}
            placeholder="Contoh: Bpk. Hendra Setiawan"
            value={namaWali}
            onChange={(e) => setNamaWali(e.target.value)}
          />
        </div>

        {/* VA JAJAN & VA TAGIHAN — 2 kolom, status Read-Only (Terkunci) */}
        <div className="form-grid-2col grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="form-group-section flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <label className={labelClass}>NO. VA JAJAN (BNI)</label>
              <span className="text-[9px] font-semibold text-slate-400 dark:text-slate-500 flex items-center gap-1">
                <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Read-Only
              </span>
            </div>
            <input
              type="text"
              readOnly
              className="form-control-input w-full px-3.5 py-2 bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono font-bold text-slate-600 dark:text-slate-300 cursor-not-allowed select-none focus:outline-none"
              placeholder="Otomatis terisi dari NIS..."
              value={vaJajan || (nis ? `8808 0990 ${nis.slice(0, 4)} ${nis.slice(4)}` : '')}
            />
          </div>
          <div className="form-group-section flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <label className={labelClass}>NO. VA TAGIHAN (BNI)</label>
              <span className="text-[9px] font-semibold text-slate-400 dark:text-slate-500 flex items-center gap-1">
                <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Read-Only
              </span>
            </div>
            <input
              type="text"
              readOnly
              className="form-control-input w-full px-3.5 py-2 bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono font-bold text-slate-600 dark:text-slate-300 cursor-not-allowed select-none focus:outline-none"
              placeholder="Otomatis terisi dari NIS..."
              value={vaTagihan || (nis ? `8808 0990 ${nis.slice(0, 4)} ${nis.slice(4)}` : '')}
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
