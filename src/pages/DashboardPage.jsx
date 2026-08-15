import MainLayout from '../components/layout/MainLayout';
import DailySummaryBanner from '../components/dashboard/DailySummaryBanner';
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
      {/* Banner Ringkasan Harian (Hijau Gelap) */}
      <DailySummaryBanner
        dateStr="SABTU, 1 Agustus 2026"
        masuk={200000}
        keluar={90000}
        transaksi={4}
      />

      <StatCards
        totalSaldo={mockStats.totalSaldo}
        totalPemasukan={mockStats.totalPemasukan}
        totalTransaksi={mockStats.totalTransaksi}
      />
      <div className="flex flex-col gap-6">
        <SalesChart />
        <RecentTransactionsWidget transactions={mockRecent} />
      </div>
    </Layout>
  );
};

export default DashboardPage;
