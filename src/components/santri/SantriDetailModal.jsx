import Modal from '../common/Modal';

// Modal Detail Informasi Lengkap Data Santri
const SantriDetailModal = ({ isOpen, onClose, santri = {}, onEdit }) => {
  if (!santri) return null;

  const initialLetter = (santri.nama || 'S').charAt(0).toUpperCase();

  const formatRupiah = (val) =>
    'Rp ' + Number(val || 0).toLocaleString('id-ID');

  const getFormatTglLahir = (tgl) => {
    if (!tgl) return '—';
    try {
      return new Date(tgl).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    } catch {
      return tgl;
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Detail Data Profil Santri"
      subtitle="Informasi lengkap identitas, kelas, akun virtual, dan akun portal santri."
      maxWidth="max-w-2xl"
    >
      <div className="flex flex-col gap-6 pt-1 pb-2">

        {/* ── Avatar & Identitas Utama ─────────────────────────── */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 p-5 rounded-3xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80">
          {/* Foto Santri Besar & Jelas */}
          <div className="relative shrink-0">
            {santri.foto ? (
              <img
                src={santri.foto}
                alt={santri.nama}
                className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl object-cover border-2 border-emerald-600/50 dark:border-emerald-500/50 shadow-lg ring-4 ring-emerald-50 dark:ring-emerald-950/50"
              />
            ) : (
              <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl bg-emerald-700 dark:bg-emerald-800 flex items-center justify-center text-4xl sm:text-5xl font-black text-white shadow-lg ring-4 ring-emerald-50 dark:ring-emerald-950/50">
                {initialLetter}
              </div>
            )}
            <span
              className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white dark:border-slate-800 shadow-md ${
                santri.status === 'aktif' ? 'bg-emerald-500' : 'bg-rose-500'
              }`}
              title={santri.status === 'aktif' ? 'Santri Aktif' : 'Santri Nonaktif'}
            />
          </div>

          <div className="flex flex-col gap-2 flex-1 text-center sm:text-left">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight leading-snug">
                {santri.nama}
              </h3>
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                santri.status === 'aktif'
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                  : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
              }`}>
                <span className={`w-2 h-2 rounded-full ${santri.status === 'aktif' ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                {santri.status === 'aktif' ? 'Aktif' : 'Nonaktif'}
              </span>
            </div>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs sm:text-sm font-semibold text-emerald-700 dark:text-emerald-400 font-mono">
              <span className="bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800/60">
                NIS: {santri.nis}
              </span>
              {santri.nis2 && (
                <span className="bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                  NIS 2: {santri.nis2}
                </span>
              )}
            </div>

            {/* Saldo Badge */}
            <div className="mt-1 pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-center sm:justify-start gap-2">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Sisa Saldo Koin:</span>
              <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">
                {formatRupiah(santri.saldo)}
              </span>
            </div>
          </div>
        </div>

        {/* ── Grid Detail Data Lengkap ─────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          
          {/* Unit & Jenjang */}
          <div className="p-3.5 rounded-2xl bg-slate-50/60 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60 flex flex-col gap-1">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Unit / Lembaga
            </span>
            <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
              {santri.unit || '—'}
            </span>
          </div>

          {/* Kelas & Detail */}
          <div className="p-3.5 rounded-2xl bg-slate-50/60 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60 flex flex-col gap-1">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Kelas &amp; Ruangan
            </span>
            <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
              {santri.kelas ? `${santri.kelas} ${santri.kelasDetail ? `(${santri.kelasDetail})` : ''}` : '—'}
            </span>
          </div>

          {/* Jenis Kelamin */}
          <div className="p-3.5 rounded-2xl bg-slate-50/60 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60 flex flex-col gap-1">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Jenis Kelamin
            </span>
            <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              {santri.jenisKelamin === 'L' ? 'Laki-laki' : santri.jenisKelamin === 'P' ? 'Perempuan' : '—'}
            </span>
          </div>

          {/* Tempat & Tanggal Lahir */}
          <div className="p-3.5 rounded-2xl bg-slate-50/60 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60 flex flex-col gap-1">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Tempat &amp; Tanggal Lahir
            </span>
            <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              {santri.tempatLahir ? `${santri.tempatLahir}, ` : ''}{getFormatTglLahir(santri.tglLahir)}
            </span>
          </div>

          {/* VA Jajan */}
          <div className="p-3.5 rounded-2xl bg-slate-50/60 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60 flex flex-col gap-1">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Nomor VA Jajan (BNI)
            </span>
            <span className="text-sm font-mono font-bold text-emerald-800 dark:text-emerald-300">
              {santri.vaJajan || '—'}
            </span>
          </div>

          {/* Akun Login Portal */}
          <div className="p-3.5 rounded-2xl bg-emerald-50/40 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-800/40 flex flex-col gap-1">
            <span className="text-[10px] font-bold text-emerald-800 dark:text-emerald-400 uppercase tracking-wider">
              Akun Login Portal Santri / Wali
            </span>
            <div className="text-xs font-mono font-semibold text-slate-800 dark:text-slate-200">
              Username: <strong className="text-emerald-700 dark:text-emerald-400">{santri.nis}</strong>
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400">
              Password default: Tanggal lahir (ddmmyyyy) atau NIS
            </div>
          </div>
        </div>

        {/* Alamat Lengkap */}
        {santri.alamat && (
          <div className="p-3.5 rounded-2xl bg-slate-50/60 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60 flex flex-col gap-1">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Alamat Lengkap
            </span>
            <span className="text-xs font-medium text-slate-700 dark:text-slate-300 leading-relaxed">
              {santri.alamat}
            </span>
          </div>
        )}



        {/* ── Aksi Footer ─────────────────────────── */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="h-11 px-7 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all cursor-pointer flex items-center justify-center"
          >
            Tutup
          </button>
          {onEdit && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onEdit(santri);
              }}
              className="h-11 px-7 rounded-xl text-sm font-bold text-white bg-emerald-700 hover:bg-emerald-800 shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
              </svg>
              Ubah Data
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default SantriDetailModal;
