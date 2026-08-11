import { NavLink, useNavigate } from 'react-router-dom';
import logoPesantren from '../../assets/logo-pesantren.png';

// Sidebar Navigasi — dipakai oleh AdminLayout & StaffLayout
const Sidebar = ({ collapsed, onToggle, menuItems = [], basePath = '/', userBadge = null }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    if (confirm('Apakah Anda yakin ingin keluar?')) {
      navigate('/');
    }
  };

  return (
    <>
      {/* Overlay untuk mobile */}
      {!collapsed && (
        <div className="sidebar-overlay" onClick={onToggle} />
      )}

      <aside className={`sidebar ${collapsed ? 'sidebar--collapsed' : ''}`}>
        {/* Logo + Burger Button */}
        <div className="sidebar-logo">
          <img src={logoPesantren} alt="Logo Pesantren" className="logo-img" />
          <div className="logo-text-wrapper">
            <span className="logo-text">Sistem Manajemen Koin</span>
            <span className="logo-subtitle">Pondok Pesantren Nazhatut Thullab</span>
          </div>
          <button
            className="burger-btn"
            onClick={onToggle}
            aria-label="Toggle Sidebar"
            title={collapsed ? 'Buka Menu' : 'Tutup Menu'}
          >
            <span className="burger-line"></span>
            <span className="burger-line"></span>
            <span className="burger-line"></span>
          </button>
        </div>

        {/* Nav Menu */}
        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={`${basePath}${item.path}`}
              end={item.path === '' || item.path === '/'}
              className={({ isActive }) => `nav-item ${isActive ? 'nav-item--active' : ''}`}
              title={item.label}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Footer Logout */}
        <div className="sidebar-footer">
          {userBadge && (
            <div className="sidebar-user-badge">
              <div className="user-badge-name">{userBadge.name}</div>
              <div className="user-badge-role">{userBadge.role}</div>
            </div>
          )}
          <button
            className="nav-item nav-item--logout"
            title="Keluar"
            onClick={handleLogout}
          >
            <span className="nav-icon">🚪</span>
            <span className="nav-label">Keluar</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
