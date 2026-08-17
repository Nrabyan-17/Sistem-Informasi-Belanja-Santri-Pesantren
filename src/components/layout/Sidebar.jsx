import { useState, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import logoPesantren from '../../assets/logo-pesantren.png';
import LogoutModal from '../common/LogoutModal';
import { IconLogout } from '../common/Icons';

// Sidebar Navigasi — dipakai oleh AdminLayout, StaffLayout, & WaliLayout
const Sidebar = ({ collapsed, onToggle, menuItems = [], basePath = '/', userBadge = null }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  // Inisialisasi status dropdown langsung sejak render pertama agar tidak ada glitch animasi
  const [openDropdowns, setOpenDropdowns] = useState(() => {
    const initialOpen = {};
    menuItems.forEach((item) => {
      if (item.subItems) {
        const isChildActive = item.subItems.some((sub) =>
          location.pathname.startsWith(`${basePath}${sub.path}`)
        );
        const isParentActive = location.pathname.startsWith(`${basePath}${item.path}`);
        if (isChildActive || isParentActive) {
          initialOpen[item.label] = true;
        }
      }
    });
    return initialOpen;
  });

  // Auto-sync status dropdown dengan rute aktif saat berpindah rute
  useEffect(() => {
    setOpenDropdowns((prev) => {
      const nextState = { ...prev };
      menuItems.forEach((item) => {
        if (item.subItems) {
          const isChildActive = item.subItems.some((sub) =>
            location.pathname.startsWith(`${basePath}${sub.path}`)
          );
          const isParentActive = location.pathname.startsWith(`${basePath}${item.path}`);
          if (isChildActive || isParentActive) {
            nextState[item.label] = true;
          } else {
            nextState[item.label] = false;
          }
        }
      });
      return nextState;
    });
  }, [location.pathname, menuItems, basePath]);

  const toggleDropdown = (label) => {
    setOpenDropdowns((prev) => ({
      ...prev,
      [label]: !prev[label],
    }));
  };

  const handleLogoutClick = () => {
    setIsLogoutModalOpen(true);
  };

  const handleConfirmLogout = () => {
    setIsLogoutModalOpen(false);
    navigate('/');
  };

  return (
    <>
      {/* Overlay untuk mobile */}
      {!collapsed && (
        <div className="sidebar-overlay" onClick={onToggle} />
      )}

      <aside className={`sidebar ${collapsed ? 'sidebar--collapsed' : ''} fixed top-0 left-0 bottom-0 z-40 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col transition-all duration-300 shadow-sm`}>
        {/* Logo */}
        <div className="sidebar-logo p-5 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
          <img src={logoPesantren} alt="Logo Pesantren" className="logo-img w-10 h-10 object-contain rounded-full border-2 border-emerald-600/30 p-0.5" />
          <div className="logo-text-wrapper flex flex-col overflow-hidden">
            <span className="logo-text font-bold text-slate-800 dark:text-slate-100 text-sm leading-tight truncate">Sistem Manajemen Koin</span>
            <span className="logo-subtitle text-xs text-slate-400 dark:text-slate-500 font-medium truncate">Pondok Pesantren Nazhatut Thullab</span>
          </div>
        </div>

        {/* Nav Menu */}
        <nav className="sidebar-nav p-4 flex-1 space-y-1.5 overflow-y-auto">
          {menuItems.map((item) => {
            // Jika menu memiliki subItems (Dropdown Menu)
            if (item.subItems && item.subItems.length > 0) {
              const isChildActive = item.subItems.some((sub) =>
                location.pathname.startsWith(`${basePath}${sub.path}`)
              );
              const isParentActive = location.pathname === `${basePath}${item.path}`;
              const isOpen = Boolean(openDropdowns[item.label]);

              return (
                <div key={item.label} className="space-y-1">
                  {/* Parent Dropdown Toggle Button */}
                  <button
                    type="button"
                    onClick={() => toggleDropdown(item.label)}
                    className={`nav-item w-full flex items-center ${collapsed ? 'justify-center' : 'justify-between'} px-3.5 py-2.5 rounded-xl font-semibold text-sm transition-all cursor-pointer ${
                      isChildActive || isParentActive
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 font-bold'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100'
                    }`}
                    title={item.label}
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <span className="nav-icon text-lg flex items-center justify-center shrink-0">{item.icon}</span>
                      {!collapsed && <span className="nav-label truncate">{item.label}</span>}
                    </div>
                    {!collapsed && (
                      <svg
                        className={`w-4 h-4 transition-transform duration-350 ease-out shrink-0 ${
                          isOpen ? 'rotate-180 text-emerald-800 dark:text-emerald-400' : 'text-slate-400'
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                      </svg>
                    )}
                  </button>

                  {/* Sub-items Container dengan Animasi Buka & Tutup Halus (Hanya saat sidebar terbuka) */}
                  {!collapsed && (
                    <div className={`sidebar-submenu-wrapper ${isOpen ? 'sidebar-submenu-wrapper--open' : ''}`}>
                      <div className="sidebar-submenu-inner">
                        <div
                          className="sidebar-submenu"
                          style={{
                            marginLeft: '28px',
                            paddingLeft: '14px',
                            marginTop: '10px',
                            marginBottom: '8px',
                            borderLeft: '2px solid rgba(16, 185, 129, 0.35)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '10px',
                          }}
                        >
                          {item.subItems.map((sub) => (
                            <NavLink
                              key={sub.path}
                              to={`${basePath}${sub.path}`}
                              end={sub.path === ''}
                              className={({ isActive }) =>
                                `sidebar-subitem ${isActive ? 'sidebar-subitem--active' : ''}`
                              }
                              title={sub.label}
                            >
                              <span className="shrink-0 flex items-center justify-center">{sub.icon}</span>
                              <span className="truncate">
                                {sub.label}
                              </span>
                            </NavLink>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            }

            // Menu Biasa tanpa subItems
            return (
              <NavLink
                key={item.path}
                to={`${basePath}${item.path}`}
                end={item.path === '' || item.path === '/'}
                onClick={() => setOpenDropdowns({})}
                className={({ isActive }) =>
                  `nav-item flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold text-sm transition-all ${
                    isActive
                      ? 'nav-item--active bg-emerald-800 dark:bg-emerald-700 text-white shadow-md shadow-emerald-900/10'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100'
                  }`
                }
                title={item.label}
              >
                <span className="nav-icon text-lg flex items-center justify-center">{item.icon}</span>
                <span className="nav-label truncate">{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Footer Logout */}
        <div className="sidebar-footer p-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
          {userBadge && (
            <div className="sidebar-user-badge bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 rounded-xl p-3">
              <div className="user-badge-name text-xs font-bold text-emerald-900 dark:text-emerald-300 truncate">{userBadge.name}</div>
              <div className="user-badge-role text-[11px] text-emerald-700 dark:text-emerald-400 font-medium truncate mt-0.5">{userBadge.role}</div>
            </div>
          )}
          <button
            className="nav-item nav-item--logout w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-700 dark:hover:text-red-300 transition-colors cursor-pointer"
            title="Keluar"
            onClick={handleLogoutClick}
          >
            <span className="nav-icon flex items-center justify-center">
              <IconLogout className="w-5 h-5" />
            </span>
            <span className="nav-label">Keluar</span>
          </button>
        </div>
      </aside>

      {/* Pop-Up Form Konfirmasi Keluar */}
      <LogoutModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={handleConfirmLogout}
      />
    </>
  );
};

export default Sidebar;
