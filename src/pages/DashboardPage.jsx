import { useState, useEffect } from 'react';
import MainLayout from '../components/layout/MainLayout';
import DailySummaryBanner from '../components/dashboard/DailySummaryBanner';
import StatCards from '../components/dashboard/StatCards';
import SalesChart from '../components/dashboard/SalesChart';
import RecentTransactionsWidget from '../components/dashboard/RecentTransactionsWidget';
import { dashboardApi, santriApi, transactionApi } from '../utils/api';
import { mergeSantriSaldos } from '../utils/saldoStorage';

// API → bentuk yang dibaca komponen dashboard
const mapRecent = (trx) => ({
  id: trx.id,
  namaSantri: trx.santri?.nama || trx.nama_santri || trx.namaSantri || '—',
  nis: trx.santri?.nis || trx.nis || '',
  kategori: (trx.tipe === 'topup' || trx.kategori === 'topup' || trx.kategori === 'Isi Saldo VA') ? 'Isi Saldo VA' : (trx.kategori || 'Penarikan Koin'),
  waktu: trx.created_at
    ? new Date(trx.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB'
    : (trx.waktu || '—'),
  nominal: Math.abs(trx.nominal ?? trx.total ?? trx.jumlah ?? 0),
});

const DashboardPage = ({ Layout = MainLayout }) => {
  const [stats, setStats] = useState(null);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [activeSantriCount, setActiveSantriCount] = useState(0);
  const [localTotalSaldo, setLocalTotalSaldo] = useState(0);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('mingguan');
  const [selectedYear, setSelectedYear] = useState('2026');

  const fetchDashboardData = (tf = timeframe, yr = selectedYear) => {
    setLoading(true);
    Promise.all([
      dashboardApi.get({ timeframe: tf, tahun: yr }).catch((err) => {
        console.error('Gagal mengambil data dashboard:', err);
        return null;
      }),
      santriApi.list({ per_page: 500 }).catch((err) => {
        console.warn('Gagal mengambil data santri:', err);
        return null;
      }),
      transactionApi.list({ per_page: 5 }).catch((err) => {
        console.warn('Gagal mengambil transaksi terbaru:', err);
        return null;
      }),
    ])
      .then(([dashData, santriRes, trxRes]) => {
        if (dashData) {
          setStats(dashData);
          if (Array.isArray(dashData.transaksi_terbaru) && dashData.transaksi_terbaru.length > 0) {
            setRecentTransactions(dashData.transaksi_terbaru);
          }
        }
        if (trxRes) {
          const rawTrx = trxRes.data || (Array.isArray(trxRes) ? trxRes : []);
          if (Array.isArray(rawTrx) && rawTrx.length > 0) {
            setRecentTransactions(rawTrx);
          }
        }
        if (santriRes) {
          const rawData = santriRes.data || (Array.isArray(santriRes) ? santriRes : []);
          const merged = mergeSantriSaldos(rawData);
          const activeCount = Array.isArray(merged)
            ? merged.filter((s) => (s.status || 'aktif') === 'aktif').length
            : 0;
          const sumSaldo = Array.isArray(merged)
            ? merged.reduce((acc, s) => acc + (Number(s.saldo) || 0), 0)
            : 0;
          setActiveSantriCount(activeCount);
          setLocalTotalSaldo(sumSaldo);
        }
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

  const santriAktif = stats?.santri_aktif ?? stats?.total_santri_aktif ?? stats?.total_santri ?? activeSantriCount ?? 0;
  const displayTotalSaldo = (stats?.total_saldo && stats.total_saldo > 0) ? stats.total_saldo : localTotalSaldo;

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
            totalSaldo={displayTotalSaldo}
            totalPemasukan={stats?.total_pemasukan ?? 0}
            totalSantriAktif={santriAktif}
          />
          <div className="flex flex-col gap-6">
            <SalesChart
              trendData={stats?.tren_transaksi ?? []}
              timeframe={timeframe}
              selectedYear={selectedYear}
              onTimeframeChange={handleTimeframeChange}
            />
            <RecentTransactionsWidget transactions={(recentTransactions.length > 0 ? recentTransactions : (stats?.transaksi_terbaru ?? [])).map(mapRecent)} />
          </div>
        </>
      )}
    </Layout>
  );
};

export default DashboardPage;
