import { useState, useMemo } from 'react';
import MainLayout from '../components/layout/MainLayout';
import TransactionFilterBar from '../components/transactions/TransactionFilterBar';
import TransactionKpiCards from '../components/transactions/TransactionKpiCards';
import TransactionTable from '../components/transactions/TransactionTable';
import StaffCoinWithdrawalForm from '../components/transactions/StaffCoinWithdrawalForm';
import { mockTransactions } from '../data/mockTransactions';

const TransactionPage = ({ Layout = MainLayout, isStaffVersion = false }) => {
  const [transactions, setTransactions] = useState(mockTransactions);
  const [search, setSearch] = useState('');
  const [jenis, setJenis] = useState('Semua'); // 'Semua' | 'Masuk' | 'Keluar'
  const [dari, setDari] = useState('');
  const [sampai, setSampai] = useState('');

  // Handle new withdrawal from Staff form
  const handleNewWithdrawal = (newTx) => {
    setTransactions([newTx, ...transactions]);
  };

  // Filter Data Transaksi
  const filteredData = useMemo(() => {
    return transactions.filter((item) => {
      // 1. Search Filter (Nama Santri atau NIS)
      if (search.trim()) {
        const query = search.toLowerCase();
        const matchesName = item.namaSantri.toLowerCase().includes(query);
        const matchesNis = item.nis ? item.nis.toLowerCase().includes(query) : false;
        if (!matchesName && !matchesNis) return false;
      }

      // 2. Jenis Filter ('Semua', 'Masuk', 'Keluar')
      if (jenis !== 'Semua') {
        const itemJenis = item.jenis || (item.kategori === 'Top Up' ? 'Masuk' : 'Keluar');
        if (itemJenis !== jenis) return false;
      }

      // 3. Date Filter (Dari)
      if (dari) {
        if (item.tanggal < dari) return false;
      }

      // 4. Date Filter (Sampai)
      if (sampai) {
        if (item.tanggal > sampai) return false;
      }

      return true;
    });
  }, [transactions, search, jenis, dari, sampai]);

  // Kalkulasi KPI
  const kpiStats = useMemo(() => {
    let totalMasuk = 0;
    let totalKeluar = 0;

    filteredData.forEach((item) => {
      const itemJenis = item.jenis || (item.kategori === 'Top Up' ? 'Masuk' : 'Keluar');
      if (itemJenis === 'Masuk') {
        totalMasuk += item.nominal || 0;
      } else if (itemJenis === 'Keluar') {
        totalKeluar += item.nominal || 0;
      }
    });

    return {
      totalTransaksi: filteredData.length,
      totalMasuk,
      totalKeluar,
    };
  }, [filteredData]);

  // Export .xlsx
  const handleExportXLSX = () => {
    const headers = ['No', 'Tanggal', 'NIS', 'Nama Santri', 'Kategori', 'Jenis', 'Nominal', 'Staff Kasir', 'Status'];
    const rows = filteredData.map((item, idx) => [
      idx + 1,
      item.tanggal,
      item.nis || '-',
      `"${item.namaSantri}"`,
      item.kategori,
      item.jenis || (item.kategori === 'Top Up' ? 'Masuk' : 'Keluar'),
      item.nominal,
      `"${item.staff || 'Ust. Miftahul Huda'}"`,
      item.status,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `transaksi_santri_${new Date().toISOString().slice(0, 10)}.xlsx`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Layout pageTitle={isStaffVersion ? "Rekapan & Penarikan Koin/Saldo" : "Manajemen Transaksi"}>
      {/* Header Title */}
      <div className="report-header-card mb-7">
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">
          {isStaffVersion ? "Rekapan & Penarikan Koin / Saldo" : "Manajemen Transaksi"}
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5">
          {isStaffVersion
            ? "Proses penarikan koin tunai santri dan kelola rekapan transaksi Rumah Koin"
            : "Pantau dan kelola seluruh riwayat transaksi masuk dan keluar"}
        </p>
      </div>

      {/* 1. Filter Card Bar (CARI SANTRI, JENIS, DARI, SAMPAI, Ekspor .xlsx) */}
      <TransactionFilterBar
        search={search}
        onSearchChange={setSearch}
        jenis={jenis}
        onJenisChange={setJenis}
        dari={dari}
        onDariChange={setDari}
        sampai={sampai}
        onSampaiChange={setSampai}
        onExport={handleExportXLSX}
      />

      {/* 2. KPI Cards Ringkasan (TOTAL TRANSAKSI, TOTAL MASUK, TOTAL KELUAR) */}
      <TransactionKpiCards
        totalTransaksi={kpiStats.totalTransaksi}
        totalMasuk={kpiStats.totalMasuk}
        totalKeluar={kpiStats.totalKeluar}
      />

      {/* 3. Jika versi Staff: Tampilkan Form Penarikan Koin di bawah KPI & Cari Santri */}
      {isStaffVersion && (
        <StaffCoinWithdrawalForm onWithdrawalSuccess={handleNewWithdrawal} />
      )}

      {/* 4. Table Data Transaksi */}
      <TransactionTable data={filteredData} />
    </Layout>
  );
};

export default TransactionPage;
