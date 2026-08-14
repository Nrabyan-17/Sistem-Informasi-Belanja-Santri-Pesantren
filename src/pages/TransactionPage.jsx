import { useState, useMemo } from 'react';
import MainLayout from '../components/layout/MainLayout';
import TransactionFilterBar from '../components/transactions/TransactionFilterBar';
import TransactionKpiCards from '../components/transactions/TransactionKpiCards';
import TransactionTable from '../components/transactions/TransactionTable';
import { mockTransactions } from '../data/mockTransactions';

const TransactionPage = ({ Layout = MainLayout }) => {
  const [search, setSearch] = useState('');
  const [jenis, setJenis] = useState('Semua'); // 'Semua' | 'Masuk' | 'Keluar'
  const [dari, setDari] = useState('');
  const [sampai, setSampai] = useState('');

  // Filter Data Transaksi
  const filteredData = useMemo(() => {
    return mockTransactions.filter((item) => {
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
  }, [search, jenis, dari, sampai]);

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
    const headers = ['No', 'Tanggal', 'NIS', 'Nama Santri', 'Kategori', 'Jenis', 'Nominal', 'Status'];
    const rows = filteredData.map((item, idx) => [
      idx + 1,
      item.tanggal,
      item.nis || '-',
      `"${item.namaSantri}"`,
      item.kategori,
      item.jenis || (item.kategori === 'Top Up' ? 'Masuk' : 'Keluar'),
      item.nominal,
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
    <Layout pageTitle="Manajemen Transaksi">
      {/* Filter Card Bar */}
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

      {/* KPI Cards Ringkasan */}
      <TransactionKpiCards
        totalTransaksi={kpiStats.totalTransaksi}
        totalMasuk={kpiStats.totalMasuk}
        totalKeluar={kpiStats.totalKeluar}
      />

      {/* Table Data Transaksi */}
      <TransactionTable data={filteredData} />
    </Layout>
  );
};

export default TransactionPage;
