import { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import { useAuth, buildUserBadge } from '../../context/AuthContext';
import {
  IconDashboard,
  IconTransaction,
  IconWallet,
  IconUsers,
  IconAdmin,
  IconCoin,
  IconWali,
  IconSantri,
  IconReport,
} from '../common/Icons';

// Menu navigasi untuk Admin/Manajerial dengan Ikon SVG Profesional
const adminMenuItems = [
  { path: '',           label: 'Dashboard',           icon: <IconDashboard /> },
  { path: '/transaksi', label: 'Transaksi',           icon: <IconTransaction /> },
  { path: '/topup',     label: 'Cek Saldo',           icon: <IconWallet /> },
  {
    path: '/pengguna',
    label: 'Manajemen Akun',
    icon: <IconUsers />,
    subItems: [
      { path: '/pengguna/admin',      label: 'Admin / Manajerial', icon: <IconAdmin className="w-4 h-4" /> },
      { path: '/pengguna/staff-koin', label: 'Staff Rumah Koin',   icon: <IconCoin className="w-4 h-4" /> },
      { path: '/pengguna/wali',       label: 'Wali Santri',        icon: <IconWali className="w-4 h-4" /> },
      { path: '/pengguna/santri',     label: 'Data Santri',         icon: <IconSantri className="w-4 h-4" /> },
    ],
  },
  { path: '/laporan',   label: 'Laporan',             icon: <IconReport /> },
];

// Layout Utama Admin: Sidebar + Header + Konten Halaman
const MainLayout = ({ children, pageTitle }) => {
  const { user } = useAuth();
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem('sidebar_collapsed') === 'true';
    } catch {
      return false;
    }
  });

  const handleToggle = () => {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('sidebar_collapsed', String(next));
      } catch {}
      return next;
    });
  };

  return (
    <div className={`main-layout ${collapsed ? 'main-layout--collapsed' : ''}`}>
      <Sidebar
        collapsed={collapsed}
        onToggle={handleToggle}
        menuItems={adminMenuItems}
        basePath="/admin"
        userBadge={buildUserBadge(user)}
      />
      <div className="main-content">
        <Header
          pageTitle={pageTitle}
          onToggleSidebar={handleToggle}
          isSidebarCollapsed={collapsed}
        />
        <main className="page-content">{children}</main>
      </div>
    </div>
  );
};

export default MainLayout;
