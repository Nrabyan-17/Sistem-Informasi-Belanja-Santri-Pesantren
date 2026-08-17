import Modal from '../common/Modal';

// Modal Detail Informasi Pengguna Sistem
const UserDetailModal = ({ isOpen, onClose, user = {}, onEdit }) => {
  if (!user) return null;

  const initialLetter = (user.nama || 'U').charAt(0).toUpperCase();

  const getRoleConfig = (role) => {
    switch (role) {
      case 'Kabid BAK & Manajerial':
        return {
          color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
          dot: 'bg-emerald-500',
        };
      case 'Staff Rumah Koin':
        return {
          color: 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300',
          dot: 'bg-sky-500',
        };
      case 'Wali Santri / Wali':
        return {
          color: 'bg-violet-100 text-violet-800 dark:bg-violet-950 dark:text-violet-300',
          dot: 'bg-violet-500',
        };
      default:
        return {
          color: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
          dot: 'bg-amber-500',
        };
    }
  };

  const roleConfig = getRoleConfig(user.role);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Detail Pengguna"
      subtitle="Informasi lengkap akun pengguna sistem."
    >
      <div className="flex flex-col gap-6 pt-1 pb-2">

        {/* ── Avatar & Identitas ─────────────────────────── */}
        <div className="flex items-center gap-5 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
          <div className="w-16 h-16 rounded-2xl bg-emerald-700 dark:bg-emerald-800 flex items-center justify-center text-2xl font-black text-white shrink-0 shadow-md">
            {initialLetter}
          </div>
          <div className="flex flex-col gap-1.5 flex-1">
            <h3 className="text-xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight leading-snug">
              {user.nama}
            </h3>
            <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300 font-mono">
              <svg className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <span>{user.noHp || user.telepon || '—'}</span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${roleConfig.color}`}>
                <span className={`w-2 h-2 rounded-full ${roleConfig.dot}`}></span>
                {user.role}
              </span>
            </div>
          </div>
        </div>

        {/* ── Divider ─────────────────────────────────────── */}
        <div className="h-px bg-slate-100 dark:bg-slate-800" />

        {/* ── Info Detail ─────────────────────────────────── */}
        <div className="grid grid-cols-2 gap-x-6 gap-y-5">

          {/* Status Akun */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
              Status Akun
            </span>
            <span className={`inline-flex items-center gap-1.5 w-fit px-3 py-1 rounded-full text-xs font-bold ${
              user.status === 'Aktif'
                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${user.status === 'Aktif' ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
              {user.status || 'Aktif'}
            </span>
          </div>

          {/* Login Terakhir */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
              Login Terakhir
            </span>
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              {user.loginTerakhir || 'Belum pernah'}
            </span>
          </div>

          {/* Nomor HP */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
              No. Telephone / WA
            </span>
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 font-mono">
              {user.noHp || user.telepon || '—'}
            </span>
          </div>

          {/* Santri Terhubung — tampil jika ada */}
          {user.santri && user.santri !== '—' && (
            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                Santri Terhubung
              </span>
              <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                {user.santri}
              </span>
            </div>
          )}

          {/* NIS Santri — tampil jika ada */}
          {user.nis && user.nis !== '—' && (
            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                NIS Santri
              </span>
              <span className="text-sm font-bold text-emerald-700 dark:text-emerald-400 font-mono">
                {user.nis}
              </span>
            </div>
          )}

          {/* No VA BNI — tampil jika ada */}
          {user.noVa && user.noVa !== '—' && (
            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                No. Virtual Account BNI
              </span>
              <span className="text-sm font-mono font-bold text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-200/80 dark:border-slate-700/80 w-fit">
                {user.noVa}
              </span>
            </div>
          )}
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
                onEdit(user);
              }}
              className="h-11 sm:h-12 px-7 sm:px-8 rounded-xl text-sm font-bold text-white bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-700 dark:hover:bg-emerald-600 shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 min-w-[150px]"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
              </svg>
              Ubah Profil
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default UserDetailModal;
