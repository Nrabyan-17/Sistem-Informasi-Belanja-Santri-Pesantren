import Modal from '../common/Modal';

// Modal Detail Informasi Lengkap Data Santri
const SantriDetailModal = ({ isOpen, onClose, santri = {}, onEdit }) => {
  if (!santri) return null;

  const initialLetter = (santri.nama || 'S').charAt(0).toUpperCase();

  const formatRupiah = (val) =>
    'Rp ' + Number(val).toLocaleString('id-ID');

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Detail Data Santri"
      subtitle="Informasi lengkap profil dan akun virtual santri."
    >
      <div className="flex flex-col gap-6 pt-1 pb-2">

        {/* ── Avatar & Identitas ─────────────────────────── */}
        <div className="flex items-center gap-5 sm:gap-7 p-5 sm:p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
          <div className="w-32 h-32 sm:w-40 sm:h-40 min-w-[128px] min-h-[128px] sm:min-w-[160px] sm:min-h-[160px] rounded-full bg-amber-600 dark:bg-amber-700 flex items-center justify-center text-4xl sm:text-5xl font-black text-white shrink-0 overflow-hidden shadow-xl aspect-square border-3 sm:border-4 border-amber-400/50 ring-6 sm:ring-8 ring-amber-100/80 dark:ring-amber-950/40">
            {santri.foto ? (
              <img
                src={santri.foto}
                alt={santri.nama}
                className="w-full h-full object-cover rounded-full aspect-square block"
              />
            ) : (
              initialLetter
            )}
          </div>
          <div className="flex flex-col gap-1.5 flex-1">
            <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight leading-snug">
              {santri.nama}
            </h3>
            <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-emerald-700 dark:text-emerald-400 font-mono">
              <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
              </svg>
              <span>NIS: {santri.nis}</span>
              {santri.kelas && (
                <>
                  <span className="text-slate-300 dark:text-slate-600">•</span>
                  <span>Kelas {santri.kelas}</span>
                </>
              )}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                santri.status === 'aktif'
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                  : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
              }`}>
                <span className={`w-2 h-2 rounded-full ${santri.status === 'aktif' ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                {santri.status === 'aktif' ? 'Aktif' : 'Nonaktif'}
              </span>
            </div>
          </div>
        </div>

        {/* ── Divider ─────────────────────────────────────── */}
        <div className="h-px bg-slate-100 dark:bg-slate-800" />

        {/* ── Info Detail ─────────────────────────────────── */}
        <div className="grid grid-cols-2 gap-x-6 gap-y-5">

          {/* Kelas */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
              Kelas
            </span>
            {santri.kelas ? (
              <span className="text-sm font-bold text-slate-800 dark:text-slate-200 inline-flex items-center">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-extrabold bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200/80 dark:border-amber-800/60 font-mono">
                  {santri.kelas}
                </span>
              </span>
            ) : (
              <span className="text-sm font-bold text-slate-400 dark:text-slate-500">
                —
              </span>
            )}
          </div>

          {/* Tanggal Lahir */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
              Tanggal Lahir
            </span>
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              {santri.tglLahirFormatted || santri.tglLahir || '—'}
            </span>
          </div>

          {/* Saldo Koin */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
              Saldo Koin
            </span>
            <span className="text-sm font-bold text-emerald-700 dark:text-emerald-400 font-mono">
              {formatRupiah(santri.saldo || 0)}
            </span>
          </div>

          {/* VA Jajan (BNI) */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
              No. VA Jajan (BNI)
            </span>
            <span className="text-sm font-mono font-bold text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200/80 dark:border-slate-700/80 w-fit">
              {santri.vaJajan || (santri.nis ? `8808 0990 ${santri.nis}` : '—')}
            </span>
          </div>
        </div>

        {/* ── Divider ─────────────────────────────────────── */}
        <div className="h-px bg-slate-100 dark:bg-slate-800" />

        {/* ── Aksi ────────────────────────────────────────── */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="h-11 sm:h-12 px-7 sm:px-8 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all cursor-pointer flex items-center justify-center min-w-[110px]"
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
              className="h-11 sm:h-12 px-7 sm:px-8 rounded-xl text-sm font-bold text-white bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-700 dark:hover:bg-emerald-600 shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 min-w-[150px]"
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
