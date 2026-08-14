import { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

// Menu navigasi untuk Portal Wali Santri
const waliMenuItems = [
  { path: '',         label: 'Saldo & Pembayaran', icon: '💳' },
  { path: '/riwayat', label: 'Riwayat Transaksi',  icon: '📋' },
];

const WaliLayout = ({ children, pageTitle = 'Saldo & Cara Pembayaran' }) => {
  const [collapsed, setCollapsed] = useState(false);

  const waliBadge = {
    name: 'Bpk. Mahmud Fauzi',
    role: 'Wali Santri — Ahmad Fauzi',
  };

  return (
    <div className={`main-layout ${collapsed ? 'main-layout--collapsed' : ''}`}>
      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed((c) => !c)}
        menuItems={waliMenuItems}
        basePath="/wali"
        userBadge={waliBadge}
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

export default WaliLayout;
