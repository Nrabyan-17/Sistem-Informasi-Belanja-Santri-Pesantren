import { Routes, Route } from 'react-router-dom';
import DashboardPage       from '../pages/DashboardPage';
import TransactionPage     from '../pages/TransactionPage';
import FinancialReportPage from '../pages/FinancialReportPage';
import UserManagementPage  from '../pages/UserManagementPage';
import TopUpPage           from '../pages/TopUpPage';
import POSCatalogPage      from '../pages/pos/POSCatalogPage';
import POSCheckoutPage     from '../pages/pos/POSCheckoutPage';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/"               element={<DashboardPage />} />
      <Route path="/transaksi"      element={<TransactionPage />} />
      <Route path="/laporan"        element={<FinancialReportPage />} />
      <Route path="/pengguna"       element={<UserManagementPage />} />
      <Route path="/topup"          element={<TopUpPage />} />
      <Route path="/pos"            element={<POSCatalogPage />} />
      <Route path="/pos/checkout"   element={<POSCheckoutPage />} />
    </Routes>
  );
};

export default AppRoutes;
