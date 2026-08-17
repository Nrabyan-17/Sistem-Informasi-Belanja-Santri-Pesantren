import { Routes, Route } from 'react-router-dom';

// Layout Staff
import StaffLayout from '../components/layout/StaffLayout';

// Halaman Login
import LoginPage from '../pages/LoginPage';

// Halaman Aplikasi
import DashboardPage       from '../pages/DashboardPage';
import TransactionPage     from '../pages/TransactionPage';
import FinancialReportPage from '../pages/FinancialReportPage';
import UserManagementPage  from '../pages/UserManagementPage';
import TopUpPage           from '../pages/TopUpPage';
import StaffPage           from '../pages/StaffPage';
import SantriManagementPage from '../pages/SantriManagementPage';

// Halaman Upload BNI
import UploadBNIPage      from '../pages/UploadBNIPage';

// Halaman Wali Santri
import WaliSaldoPage     from '../pages/WaliSaldoPage';
import WaliRiwayatPage   from '../pages/WaliRiwayatPage';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Root: Login */}
      <Route path="/" element={<LoginPage />} />

      {/* Admin / Manajerial Routes */}
      <Route path="/admin"                     element={<DashboardPage />} />
      <Route path="/admin/transaksi"           element={<TransactionPage />} />
      <Route path="/admin/laporan"             element={<FinancialReportPage />} />
      <Route path="/admin/pengguna"            element={<UserManagementPage category="all" />} />
      <Route path="/admin/pengguna/admin"      element={<UserManagementPage category="admin" />} />
      <Route path="/admin/pengguna/staff-koin" element={<UserManagementPage category="staff-koin" />} />
      <Route path="/admin/pengguna/wali"       element={<UserManagementPage category="wali" />} />
      <Route path="/admin/pengguna/santri"     element={<SantriManagementPage />} />
      <Route path="/admin/topup"               element={<TopUpPage />} />

      {/* Staff Rumah Koin Routes */}
      <Route path="/staff"            element={<DashboardPage Layout={StaffLayout} />} />
      <Route path="/staff/transaksi"  element={<TransactionPage Layout={StaffLayout} isStaffVersion={true} />} />
      <Route path="/staff/laporan"    element={<FinancialReportPage Layout={StaffLayout} />} />
      <Route path="/staff/upload-bni" element={<UploadBNIPage Layout={StaffLayout} />} />
      <Route path="/staff/topup"      element={<TopUpPage Layout={StaffLayout} />} />

      {/* Wali Santri Portal Routes */}
      <Route path="/wali"             element={<WaliSaldoPage />} />
      <Route path="/wali/saldo"       element={<WaliSaldoPage />} />
      <Route path="/wali/riwayat"     element={<WaliRiwayatPage />} />
    </Routes>
  );
};

export default AppRoutes;
