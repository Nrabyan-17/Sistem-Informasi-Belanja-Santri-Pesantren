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

// Route Guard Protected Route
import ProtectedRoute    from '../components/common/ProtectedRoute';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Root: Login (Public) */}
      <Route path="/" element={<LoginPage />} />

      {/* Admin / Manajerial Routes (Protected: Admin Only) */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/transaksi"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <TransactionPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/laporan"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <FinancialReportPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/pengguna"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <UserManagementPage category="all" />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/pengguna/admin"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <UserManagementPage category="admin" />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/pengguna/staff-koin"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <UserManagementPage category="staff-koin" />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/pengguna/wali"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <UserManagementPage category="wali" />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/pengguna/santri"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <SantriManagementPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/topup"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <TopUpPage />
          </ProtectedRoute>
        }
      />

      {/* Staff Rumah Koin Routes (Protected: Staff & Admin) */}
      <Route
        path="/staff"
        element={
          <ProtectedRoute allowedRoles={['staff', 'admin']}>
            <DashboardPage Layout={StaffLayout} />
          </ProtectedRoute>
        }
      />
      <Route
        path="/staff/transaksi"
        element={
          <ProtectedRoute allowedRoles={['staff', 'admin']}>
            <TransactionPage Layout={StaffLayout} isStaffVersion={true} />
          </ProtectedRoute>
        }
      />
      <Route
        path="/staff/upload-bni"
        element={
          <ProtectedRoute allowedRoles={['staff', 'admin']}>
            <UploadBNIPage Layout={StaffLayout} />
          </ProtectedRoute>
        }
      />
      <Route
        path="/staff/topup"
        element={
          <ProtectedRoute allowedRoles={['staff', 'admin']}>
            <TopUpPage Layout={StaffLayout} />
          </ProtectedRoute>
        }
      />

      {/* Wali Santri Portal Routes (Protected: Wali & Admin) */}
      <Route
        path="/wali"
        element={
          <ProtectedRoute allowedRoles={['wali', 'admin']}>
            <WaliSaldoPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/wali/saldo"
        element={
          <ProtectedRoute allowedRoles={['wali', 'admin']}>
            <WaliSaldoPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/wali/riwayat"
        element={
          <ProtectedRoute allowedRoles={['wali', 'admin']}>
            <WaliRiwayatPage />
          </ProtectedRoute>
        }
      />

      {/* Fallback Wildcard -> Redirect ke Login */}
      <Route path="*" element={<LoginPage />} />
    </Routes>
  );
};

export default AppRoutes;
