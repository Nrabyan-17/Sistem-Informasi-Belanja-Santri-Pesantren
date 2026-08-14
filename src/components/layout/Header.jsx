import ThemeToggle from '../common/ThemeToggle';

// Header / Top Navbar Admin
const Header = ({
  pageTitle = 'Dashboard',
  headerDate = 'Sabtu, 1 Agustus 2026',
  onToggleSidebar,
  isSidebarCollapsed = false,
}) => {
  return (
    <header className="header h-20 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 sm:px-8 flex items-center justify-between shadow-xs sticky top-0 z-30 transition-colors duration-200">
      <div className="header-left flex items-center gap-3">
        {onToggleSidebar && (
          <button
            type="button"
            className="header-burger-btn p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer shrink-0 flex items-center justify-center"
            onClick={onToggleSidebar}
            aria-label="Toggle Sidebar"
            title={isSidebarCollapsed ? 'Buka Sidebar' : 'Tutup Sidebar'}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        )}
        <h1 className="header-title text-xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">
          {pageTitle}
        </h1>
      </div>
      <div className="header-actions flex items-center gap-3 sm:gap-4">
        {/* Teks Tanggal di Header */}
        {headerDate && (
          <span className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 mr-1 hidden md:inline-block">
            {headerDate}
          </span>
        )}

        {/* Theme Switcher Toggle */}
        <ThemeToggle />

        {/* Notification Button */}
        <button className="header-notif p-2 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors relative cursor-pointer">
          🔔
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-500 rounded-full ring-2 ring-white dark:ring-slate-900"></span>
        </button>

        {/* Profile */}
        <div className="header-profile flex items-center gap-2.5 pl-3 border-l border-slate-200 dark:border-slate-800">
          <span className="profile-avatar w-9 h-9 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-600 dark:text-slate-300 text-sm font-bold">
            👤
          </span>
          <span className="profile-name text-sm font-bold text-slate-700 dark:text-slate-200 hidden sm:inline-block">Admin</span>
        </div>
      </div>
    </header>
  );
};

export default Header;
