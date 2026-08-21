import { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import { useAuth, buildUserBadge } from '../../context/AuthContext';
import { IconWallet, IconReport } from '../common/Icons';

// Menu navigasi untuk Portal Wali Santri dengan Ikon SVG Profesional
const waliMenuItems = [
  { path: '',         label: 'Saldo & Pembayaran', icon: <IconWallet /> },
  { path: '/riwayat', label: 'Riwayat Transaksi',  icon: <IconReport /> },
];

const WaliLayout = ({ children, pageTitle = 'Saldo & Cara Pembayaran' }) => {
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
        menuItems={waliMenuItems}
        basePath="/wali"
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

export default WaliLayout;
