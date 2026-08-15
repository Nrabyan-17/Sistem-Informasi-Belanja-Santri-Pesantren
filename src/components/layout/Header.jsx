import { useState } from 'react';
import ChangePasswordModal from '../common/ChangePasswordModal';
import { IconKey } from '../common/Icons';

// Header / Top Navbar Admin & Staff
const Header = ({
  pageTitle = 'Dashboard',
  headerDate = 'Sabtu, 1 Agustus 2026',
  onToggleSidebar,
  isSidebarCollapsed = false,
}) => {
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);

  return (
    <>
      <header className="header h-20 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 sm:px-8 flex items-center justify-between shadow-xs sticky top-0 z-30 transition-colors duration-200">
        <div className="header-left flex items-center gap-5 sm:gap-6">
          {onToggleSidebar && (
            <button
              type="button"
              className="header-burger-btn p-1.5 bg-transparent border-none text-slate-700 dark:text-slate-200 hover:text-emerald-700 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer shrink-0 flex items-center justify-center"
              onClick={onToggleSidebar}
              aria-label="Toggle Sidebar"
              title={isSidebarCollapsed ? 'Buka Sidebar' : 'Tutup Sidebar'}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          )}
          <h1 className="header-title text-xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">
            {pageTitle}
          </h1>
        </div>

        <div className="header-actions">
          {/* Teks Tanggal di Header */}
          {headerDate && (
            <span className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 hidden md:inline-block">
              {headerDate}
            </span>
          )}

          {/* Tombol Ganti Password */}
          <button
            type="button"
            onClick={() => setIsChangePasswordOpen(true)}
            className="btn-header-change-password"
            title="Ganti Password Akun"
          >
            <IconKey className="w-4 h-4 text-slate-500 dark:text-slate-400" />
            <span>Ganti Password</span>
          </button>
        </div>
      </header>

      {/* Pop-up Modal Ganti Password */}
      {isChangePasswordOpen && (
        <ChangePasswordModal
          isOpen={isChangePasswordOpen}
          onClose={() => setIsChangePasswordOpen(false)}
        />
      )}
    </>
  );
};

export default Header;
