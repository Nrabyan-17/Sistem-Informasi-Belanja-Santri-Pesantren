import MainLayout from '../components/layout/MainLayout';
import StatCards from '../components/dashboard/StatCards';
import SalesChart from '../components/dashboard/SalesChart';
import RecentTransactionsWidget from '../components/dashboard/RecentTransactionsWidget';

// Data mock sementara
const mockStats = { totalSaldo: 2847500, totalPemasukan: 90000, totalTransaksi: 247 };
const mockRecent = [
  { namaSantri: 'Ahmad Fauzi', nominal: 9000 },
  { namaSantri: 'Budi Santoso', nominal: 15000 },
];

const DashboardPage = ({ Layout = MainLayout }) => {
  return (
    <Layout pageTitle="Dashboard Keuangan">
      <StatCards
        totalSaldo={mockStats.totalSaldo}
        totalPemasukan={mockStats.totalPemasukan}
        totalTransaksi={mockStats.totalTransaksi}
      />
      <div className="dashboard-grid">
        <SalesChart />
        <RecentTransactionsWidget transactions={mockRecent} />
      </div>
    </Layout>
  );
};

export default DashboardPage;
