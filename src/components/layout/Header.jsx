import { useState, useEffect } from 'react';
import ChangePasswordModal from '../common/ChangePasswordModal';
import { IconKey } from '../common/Icons';

function getRealtimeIndonesianDate() {
  const now = new Date();
  const dateStr = now.toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  return dateStr.charAt(0).toUpperCase() + dateStr.slice(1);
}

// Header / Top Navbar Admin & Staff
const Header = ({
  pageTitle = 'Dashboard',
  headerDate,
  onToggleSidebar,
  isSidebarCollapsed = false,
}) => {
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [currentDateStr, setCurrentDateStr] = useState(getRealtimeIndonesianDate);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateStr(getRealtimeIndonesianDate());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const displayDate = headerDate || currentDateStr;

  return (
    <>
      <header className="header h-16 sm:h-20 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 sm:px-8 flex items-center justify-between shadow-xs sticky top-0 z-30 transition-colors duration-200">
        <div className="header-left flex items-center gap-3 sm:gap-6 min-w-0">
          {onToggleSidebar && (
            <button
              type="button"
              className="header-burger-btn p-2 bg-transparent border-none text-slate-700 dark:text-slate-200 hover:text-emerald-700 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer shrink-0 flex items-center justify-center active:scale-95"
              onClick={onToggleSidebar}
              aria-label="Toggle Sidebar"
              title={isSidebarCollapsed ? 'Buka Sidebar' : 'Tutup Sidebar'}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          )}
          <h1 className="header-title text-base sm:text-xl font-bold text-slate-800 dark:text-slate-100 tracking-tight truncate">
            {pageTitle}
          </h1>
        </div>

        <div className="header-actions flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Teks Tanggal di Header (Real-Time) */}
          {displayDate && (
            <span className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 hidden md:inline-block">
              {displayDate}
            </span>
          )}

          {/* Tombol Ganti Password */}
          <button
            type="button"
            onClick={() => setIsChangePasswordOpen(true)}
            className="btn-header-change-password flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors cursor-pointer shrink-0"
            title="Ganti Password Akun"
          >
            <IconKey className="w-4 h-4 text-slate-500 dark:text-slate-400 shrink-0" />
            <span className="hidden sm:inline">Ganti Password</span>
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
