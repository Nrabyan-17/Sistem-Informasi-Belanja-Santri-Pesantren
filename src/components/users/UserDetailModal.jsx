import React from 'react';
import Modal from '../common/Modal';

// Modal Detail Informasi Pengguna Sistem (Tata Letak Rapi, Jarak Lega, & Komprehensif)
const UserDetailModal = ({ isOpen, onClose, user = {}, onEdit }) => {
  if (!user) return null;

  const initialLetter = (user.nama || 'U').charAt(0).toUpperCase();
  const userIdFormatted = `USR-${String(user.id || 1).padStart(4, '0')}`;
  const usernameFormatted = `@${
    user.username ||
    (user.nama || 'user')
      .toLowerCase()
      .replace(/^(ustadzah|ust\.|bpk\.|ibu|h\.|hj\.)\s*/gi, '')
      .replace(/[^a-z0-9]/g, '')
      .slice(0, 14) ||
    'pengguna'
  }`;

  const getRoleConfig = (role) => {
    switch (role) {
      case 'Kabid BAK & Manajerial':
        return {
          color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800',
          dot: 'bg-emerald-500',
          scopeTitle: 'Akses Penuh Manajemen Keuangan & Sistem',
          permissions: [
            'Manajemen Akun Pengguna & Santri',
            'Rekonsiliasi Mutasi Virtual Account Bank BNI',
            'Penyesuaian Saldo Santri Manual',
            'Ekspor Laporan Finansial & Audit Pesantren',
          ],
        };
      case 'Staff Rumah Koin':
        return {
          color: 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300 border-sky-300 dark:border-sky-800',
          dot: 'bg-sky-500',
          scopeTitle: 'Akses Operasional Loket Penarikan Koin',
          permissions: [
            'Pemrosesan Penarikan Saldo Koin Santri',
            'Pengecekan Saldo & Identitas Santri',
            'Pencatatan Riwayat Transaksi Shift Kasir',
            'Unggah Berkas Mutasi Rekening Koran BNI',
          ],
        };
      case 'Wali Santri / Wali':
        return {
          color: 'bg-violet-100 text-violet-800 dark:bg-violet-950 dark:text-violet-300 border-violet-300 dark:border-violet-800',
          dot: 'bg-violet-500',
          scopeTitle: 'Akses Pemantauan Saldo & Belanja Santri',
          permissions: [
            'Pemantauan Sisa Saldo Jajan & Tagihan Santri',
            'Pengecekan Riwayat Transaksi Jajan & Penarikan',
            'Informasi Nomor Virtual Account BNI Santri',
          ],
        };
      default:
        return {
          color: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-300 dark:border-amber-800',
          dot: 'bg-amber-500',
          scopeTitle: 'Hak Akses Standar Pengguna',
          permissions: ['Akses Navigasi Standar Sistem'],
        };
    }
  };

  const roleConfig = getRoleConfig(user.role);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Detail Profil Pengguna"
      subtitle="Informasi lengkap akun, hak akses wewenang, dan relasi data sistem."
      maxWidth="max-w-3xl"
    >
      <div className="flex flex-col gap-6 pt-1 pb-1">
        {/* ── Header Avatar & Identitas ─────────────────────────── */}
        <div className="user-detail-header-box">
          <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl bg-emerald-700 dark:bg-emerald-800 flex items-center justify-center text-2xl sm:text-3xl font-black text-white shrink-0 shadow-md">
            {initialLetter}
          </div>
          <div className="flex flex-col gap-2 flex-1 min-w-0">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight truncate">
                {user.nama}
              </h3>
              <span className="font-mono text-xs font-extrabold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 px-3 py-1 rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xs">
                {userIdFormatted}
              </span>
            </div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${roleConfig.color}`}>
                <span className={`w-2 h-2 rounded-full ${roleConfig.dot}`}></span>
                {user.role}
              </span>
              <span className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400">
                {usernameFormatted}
              </span>
            </div>
          </div>
        </div>

        {/* ── Grid Informasi Akun & Kredensial ──────────────────────── */}
        <div>
          <span className="user-detail-section-title">
            Informasi Akun &amp; Kredensial
          </span>
          <div className="user-detail-grid">
            {/* ID Pengguna */}
            <div className="user-detail-tile">
              <span className="user-detail-tile-label">
                ID PENGGUNA
              </span>
              <span className="user-detail-tile-val font-mono">
                {userIdFormatted}
              </span>
            </div>

            {/* Username Login */}
            <div className="user-detail-tile">
              <span className="user-detail-tile-label">
                USERNAME LOGIN
              </span>
              <span className="user-detail-tile-val font-mono text-emerald-700 dark:text-emerald-400 truncate">
                {usernameFormatted}
              </span>
            </div>

            {/* Status Akun */}
            <div className="user-detail-tile">
              <span className="user-detail-tile-label">
                STATUS AKUN
              </span>
              <div className="flex items-center">
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-extrabold ${
                  user.status === 'Aktif'
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                    : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${user.status === 'Aktif' ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                  {user.status || 'Aktif'}
                </span>
              </div>
            </div>

            {/* Login Terakhir */}
            <div className="user-detail-tile">
              <span className="user-detail-tile-label">
                LOGIN TERAKHIR
              </span>
              <span className="user-detail-tile-val">
                {user.loginTerakhir || '4 Ags 2025, 08:30'}
              </span>
            </div>

            {/* Tanggal Terdaftar */}
            <div className="user-detail-tile">
              <span className="user-detail-tile-label">
                TERDAFTAR SEJAK
              </span>
              <span className="user-detail-tile-val">
                10 Januari 2025
              </span>
            </div>

            {/* Status Keamanan Sandi */}
            <div className="user-detail-tile">
              <span className="user-detail-tile-label">
                KEAMANAN SANDI
              </span>
              <span className="user-detail-tile-val text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                <span>✓ Terenkripsi</span>
              </span>
            </div>
          </div>
        </div>

        {/* ── Wewenang & Hak Akses Sistem ───────────────────────── */}
        <div>
          <span className="user-detail-section-title">
            Wewenang &amp; Hak Akses Role
          </span>
          <div className="user-detail-perm-box">
            <div className="flex items-center gap-2">
              <h5 className="text-sm font-extrabold text-slate-800 dark:text-slate-200">
                {roleConfig.scopeTitle}
              </h5>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-0.5">
              {roleConfig.permissions.map((perm, idx) => (
                <div key={idx} className="flex items-start gap-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300 leading-relaxed">
                  <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 text-[10px] font-extrabold flex items-center justify-center shrink-0 mt-0.5">
                    ✓
                  </span>
                  <span>{perm}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Data Santri Terhubung (Khusus Wali Santri atau jika ada data santri) ── */}
        {(user.role === 'Wali Santri / Wali' || (user.santri && user.santri !== '—') || (user.nis && user.nis !== '—')) && (
          <div>
            <span className="user-detail-section-title">
              Data Santri Yang Dinaungi
            </span>
            <div className="user-detail-perm-box bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200/80 dark:border-emerald-800/60 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex flex-col gap-1.5">
                <span className="user-detail-tile-label">
                  NAMA SANTRI
                </span>
                <span className="text-sm font-extrabold text-slate-900 dark:text-slate-100">
                  {user.santri && user.santri !== '—' ? user.santri : 'Ahmad Fauzi'}
                </span>
              </div>
              <div className="flex flex-col gap-1.5">
                <span className="user-detail-tile-label">
                  NIS SANTRI
                </span>
                <span className="text-sm font-mono font-extrabold text-emerald-700 dark:text-emerald-400">
                  {user.nis && user.nis !== '—' ? user.nis : '2024001'}
                </span>
              </div>
              <div className="flex flex-col gap-1.5">
                <span className="user-detail-tile-label">
                  NO. VIRTUAL ACCOUNT BNI
                </span>
                <span className="text-xs font-mono font-extrabold text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 w-fit shadow-2xs">
                  {user.noVa && user.noVa !== '—' ? user.noVa : '8808 0990 2024 001'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ── Footer Tombol Aksi ────────────────────────────── */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="h-11 sm:h-12 px-7 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all cursor-pointer flex items-center justify-center min-w-[100px]"
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
              className="h-11 sm:h-12 px-7 rounded-xl text-xs font-extrabold text-white bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-700 dark:hover:bg-emerald-600 shadow-sm transition-all cursor-pointer flex items-center justify-center gap-2 min-w-[130px] active:scale-95"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
              </svg>
              <span>Ubah Profil</span>
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default UserDetailModal;
