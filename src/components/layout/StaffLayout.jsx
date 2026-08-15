import { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

// Menu navigasi untuk Staff Rumah Koin (Tanpa Manajemen Pengguna)
const staffMenuItems = [
  { path: '',           label: 'Dashboard',   icon: '📊' },
  { path: '/transaksi', label: 'Transaksi',   icon: '💸' },
  { path: '/topup',     label: 'Cek Saldo',   icon: '💳' },
  { path: '/upload-bni',label: 'Upload BNI',  icon: '📤' },
  { path: '/laporan',   label: 'Laporan',     icon: '📋' },
];

// Layout Khusus Staff Kasir: Sidebar + Header + Konten Halaman
const StaffLayout = ({ children, pageTitle }) => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className={`main-layout ${collapsed ? 'main-layout--collapsed' : ''}`}>
      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed((c) => !c)}
        menuItems={staffMenuItems}
        basePath="/staff"
        userBadge={{ name: 'Ust. Miftahul Huda', role: 'Staff Rumah Koin' }}
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

export default StaffLayout;
