import { useState } from 'react';
import { NavLink } from 'react-router-dom';

// Sidebar Navigasi Utama Admin
const menuItems = [
  { path: '/',           label: 'Dashboard',    icon: '📊' },
  { path: '/transaksi',  label: 'Transaksi',    icon: '💸' },
  { path: '/laporan',    label: 'Laporan',      icon: '📋' },
  { path: '/pengguna',   label: 'Pengguna',     icon: '👥' },
  { path: '/topup',      label: 'Top Up Saldo', icon: '💳' },
  { path: '/pos',        label: 'POS Kasir',    icon: '🛒' },
];

const Sidebar = ({ collapsed, onToggle }) => {
  return (
    <>
      {/* Overlay untuk mobile */}
      {!collapsed && (
        <div className="sidebar-overlay" onClick={onToggle} />
      )}

      <aside className={`sidebar ${collapsed ? 'sidebar--collapsed' : ''}`}>
        {/* Logo + Burger Button */}
        <div className="sidebar-logo">
          <span className="logo-icon">🪙</span>
          <span className="logo-text">Sistem Manajemen Koin</span>
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
              to={item.path}
              end={item.path === '/'}
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
          <button
            className="nav-item nav-item--logout"
            title="Keluar"
            onClick={() => {
              if (confirm('Apakah Anda yakin ingin keluar?')) {
                console.log('Logout...');
                // TODO: Implementasi logout
              }
            }}
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
