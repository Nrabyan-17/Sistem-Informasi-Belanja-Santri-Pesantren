import { useState, useEffect } from 'react';
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
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setMobileOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleToggle = () => {
    if (window.innerWidth <= 768) {
      setMobileOpen((prev) => !prev);
    } else {
      setCollapsed((prev) => {
        const next = !prev;
        try {
          localStorage.setItem('sidebar_collapsed', String(next));
        } catch {}
        return next;
      });
    }
  };

  const handleCloseMobile = () => {
    setMobileOpen(false);
  };

  return (
    <div className={`main-layout ${collapsed ? 'main-layout--collapsed' : ''}`}>
      <Sidebar
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        onToggle={handleToggle}
        onCloseMobile={handleCloseMobile}
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
