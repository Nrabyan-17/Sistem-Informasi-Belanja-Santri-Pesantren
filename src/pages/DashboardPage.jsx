import { useState, useEffect } from 'react';
import MainLayout from '../components/layout/MainLayout';
import DailySummaryBanner from '../components/dashboard/DailySummaryBanner';
import StatCards from '../components/dashboard/StatCards';
import SalesChart from '../components/dashboard/SalesChart';
import RecentTransactionsWidget from '../components/dashboard/RecentTransactionsWidget';
import { dashboardApi } from '../utils/api';

// API → bentuk yang dibaca komponen dashboard
const mapRecent = (trx) => ({
  id: trx.id,
  namaSantri: trx.santri?.nama || '—',
  nis: trx.santri?.nis || '',
  kategori: trx.tipe === 'topup' ? 'Isi Saldo VA' : 'Penarikan Koin',
  waktu: trx.created_at
    ? new Date(trx.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB'
    : '—',
  nominal: Math.abs(trx.nominal || 0),
});

const DashboardPage = ({ Layout = MainLayout }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('mingguan');
  const [selectedYear, setSelectedYear] = useState('2026');

  const fetchDashboardData = (tf = timeframe, yr = selectedYear) => {
    setLoading(true);
    dashboardApi.get({ timeframe: tf, tahun: yr })
      .then((data) => {
        if (data) setStats(data);
      })
      .catch((err) => {
        console.error('Gagal mengambil data dashboard:', err);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchDashboardData(timeframe, selectedYear);
  }, [timeframe, selectedYear]);

  const today = new Date().toLocaleDateString('id-ID', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  }).toUpperCase();

  const todayStr = new Date().toISOString().slice(0, 10);
  const todayTrend = stats?.tren_transaksi?.find(t => t.tanggal === todayStr);

  const handleTimeframeChange = (newTf, newYear) => {
    if (newTf !== undefined) setTimeframe(newTf);
    if (newYear !== undefined) setSelectedYear(newYear);
  };

  return (
    <Layout pageTitle="Dashboard Keuangan">
      {loading && !stats ? (
        <div className="flex items-center justify-center h-40 text-slate-500 font-medium">Memuat data dashboard...</div>
      ) : (
        <>
          <DailySummaryBanner
            dateStr={today}
            masuk={todayTrend?.pemasukan ?? stats?.pemasukan_hari_ini ?? 0}
            keluar={todayTrend?.penarikan ?? stats?.penarikan_hari_ini ?? 0}
            transaksi={stats?.total_transaksi ?? 0}
          />
          <StatCards
            totalSaldo={stats?.total_saldo ?? 0}
            totalPemasukan={stats?.total_pemasukan ?? 0}
            totalTransaksi={stats?.total_transaksi ?? 0}
          />
          <div className="flex flex-col gap-6">
            <SalesChart
              trendData={stats?.tren_transaksi ?? []}
              timeframe={timeframe}
              selectedYear={selectedYear}
              onTimeframeChange={handleTimeframeChange}
            />
            <RecentTransactionsWidget transactions={(stats?.transaksi_terbaru ?? []).map(mapRecent)} />
          </div>
        </>
      )}
    </Layout>
  );
};

export default DashboardPage;
