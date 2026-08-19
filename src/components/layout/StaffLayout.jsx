import { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import {
  IconDashboard,
  IconTransaction,
  IconWallet,
  IconUpload,
} from '../common/Icons';

// Menu navigasi untuk Staff Rumah Koin dengan Ikon SVG Profesional
const staffMenuItems = [
  { path: '',           label: 'Dashboard',   icon: <IconDashboard /> },
  { path: '/transaksi', label: 'Transaksi',   icon: <IconTransaction /> },
  { path: '/topup',     label: 'Cek Saldo',   icon: <IconWallet /> },
  { path: '/upload-bni',label: 'Upload BNI',  icon: <IconUpload /> },
];

// Layout Khusus Staff Kasir: Sidebar + Header + Konten Halaman
const StaffLayout = ({ children, pageTitle }) => {
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
        menuItems={staffMenuItems}
        basePath="/staff"
        userBadge={{ name: 'Ust. Miftahul Huda', role: 'Staff Rumah Koin' }}
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
