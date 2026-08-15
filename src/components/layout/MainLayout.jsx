import { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

// Menu navigasi untuk Admin/Manajerial
const adminMenuItems = [
  { path: '',           label: 'Dashboard',           icon: '📊' },
  { path: '/transaksi', label: 'Transaksi',           icon: '💸' },
  { path: '/topup',     label: 'Cek Saldo',           icon: '💳' },
  {
    path: '/pengguna',
    label: 'Manajemen Akun',
    icon: '👥',
    subItems: [
      { path: '/pengguna/admin',      label: 'Admin / Manajerial', icon: '👤' },
      { path: '/pengguna/staff-koin', label: 'Staff Rumah Koin',   icon: '🪙' },
    ],
  },
  { path: '/laporan',   label: 'Laporan',             icon: '📋' },
];

// Layout Utama Admin: Sidebar + Header + Konten Halaman
const MainLayout = ({ children, pageTitle }) => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className={`main-layout ${collapsed ? 'main-layout--collapsed' : ''}`}>
      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed((c) => !c)}
        menuItems={adminMenuItems}
        basePath="/admin"
        userBadge={{ name: 'Ustadzah Ina Wahdiah', role: 'Kabid BAK & Manajerial' }}
      />
      <div className="main-content">
        <Header
          pageTitle={pageTitle}
          onToggleSidebar={() => setCollapsed((c) => !c)}
          isSidebarCollapsed={collapsed}
        />
        <main className="page-content">{children}</main>
      </div>
    </div>
  );
};

export default MainLayout;
