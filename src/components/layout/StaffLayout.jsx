import { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import { useAuth, buildUserBadge } from '../../context/AuthContext';
import {
  IconDashboard,
  IconTransaction,
  IconWallet,
  IconUpload,
} from '../common/Icons';

// Menu navigasi untuk Staff Rumah Koin dengan Ikon SVG Profesional
const staffMenuItems = [
  { path: '',           label: 'Dashboard',             icon: <IconDashboard /> },
  { path: '/transaksi', label: 'Transaksi & Penarikan', icon: <IconTransaction /> },
  { path: '/topup',     label: 'Cek Saldo',             icon: <IconWallet /> },
  { path: '/upload-bni',label: 'Upload BNI',            icon: <IconUpload /> },
];

// Layout Khusus Staff Kasir: Sidebar + Header + Konten Halaman
const StaffLayout = ({ children, pageTitle }) => {
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
        menuItems={staffMenuItems}
        basePath="/staff"
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

export default StaffLayout;
