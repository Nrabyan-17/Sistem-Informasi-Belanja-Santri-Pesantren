import { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

// Layout Utama Admin: Sidebar + Header + Konten Halaman
const MainLayout = ({ children, pageTitle }) => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className={`main-layout ${collapsed ? 'main-layout--collapsed' : ''}`}>
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />
      <div className="main-content">
        <Header pageTitle={pageTitle} />
        <main className="page-content">{children}</main>
      </div>
    </div>
  );
};

export default MainLayout;
