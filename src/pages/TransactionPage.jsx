import { useState, useEffect, useMemo } from 'react';
import MainLayout from '../components/layout/MainLayout';
import TransactionFilterBar from '../components/transactions/TransactionFilterBar';
import TransactionKpiCards from '../components/transactions/TransactionKpiCards';
import TransactionTable from '../components/transactions/TransactionTable';
import StaffCoinWithdrawalForm from '../components/transactions/StaffCoinWithdrawalForm';
import { transactionApi } from '../utils/api';

// API → bentuk yang dibaca komponen transaksi
const apiToUi = (t) => {
  const isMasuk = t.tipe === 'topup' || (t.tipe === 'penyesuaian' && Number(t.nominal || 0) > 0) || Number(t.nominal || 0) > 0;
  let kat = 'Penarikan Koin';
  if (t.tipe === 'topup' || t.tipe === 'bni') kat = 'Isi Saldo VA';
  else if (t.tipe === 'penyesuaian') kat = Number(t.nominal || 0) >= 0 ? 'Penyesuaian (Tambah)' : 'Penyesuaian (Kurang)';
  else if (t.tipe === 'tarik_koin' || t.tipe === 'penarikan') kat = 'Penarikan Koin';

  return {
    id: t.id,
    tanggal: t.created_at ? t.created_at.slice(0, 10) : '',
    nis: t.santri?.nis || '',
    namaSantri: t.santri?.nama || '—',
    jenis: isMasuk ? 'Masuk' : 'Keluar',
    kategori: kat,
    nominal: Math.abs(Number(t.nominal || 0)),
    staff: t.creator?.name || t.created_by?.name || '—',
    status: 'sukses',
  };
};

const TransactionPage = ({ Layout = MainLayout, isStaffVersion = false }) => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [jenis, setJenis] = useState('Semua'); // 'Semua' | 'Masuk' | 'Keluar'
  const [dari, setDari] = useState('');
  const [sampai, setSampai] = useState('');

  const fetchTransactions = () => {
    setLoading(true);
    transactionApi
      .list({ per_page: 100 })
      .then((res) => setTransactions((res.data || []).map(apiToUi)))
      .catch((e) => setError(e.message || 'Gagal memuat data transaksi.'))
      .finally(() => setLoading(false));
  };

  useEffect(fetchTransactions, []);

  // Handle new withdrawal from Staff form
  const handleNewWithdrawal = (res) => {
    if (res?.transaction) setTransactions((prev) => [apiToUi(res.transaction), ...prev]);
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

  // Export .xlsx via API
  const handleExportXLSX = () => {
    transactionApi
      .export({
        search: search || undefined,
        kategori: jenis !== 'Semua' ? (jenis === 'Masuk' ? 'topup' : 'tarik_koin') : undefined,
        dari: dari || undefined,
        sampai: sampai || undefined,
      })
      .catch((e) => setError(e.message || 'Gagal mengekspor data transaksi.'));
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

      {error && (
        <div className="mb-6 px-4 py-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 rounded-2xl text-sm font-semibold text-rose-700 dark:text-rose-300">
          {error}
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center h-32 text-slate-500 dark:text-slate-400 font-medium">
          Memuat data transaksi...
        </div>
      )}

      {/* 1. Jika versi Staff: Tampilkan Form Penarikan Koin di atas Filter & KPI */}
      {isStaffVersion && (
        <StaffCoinWithdrawalForm onWithdrawalSuccess={handleNewWithdrawal} />
      )}

      {/* 2. Filter Card Bar (CARI SANTRI, JENIS, DARI, SAMPAI, Ekspor .xlsx) */}
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
        showSearch={!isStaffVersion}
      />

      {/* 3. KPI Cards Ringkasan (TOTAL TRANSAKSI, SALDO MASUK, SALDO KELUAR) */}
      <TransactionKpiCards
        totalTransaksi={kpiStats.totalTransaksi}
        totalMasuk={kpiStats.totalMasuk}
        totalKeluar={kpiStats.totalKeluar}
      />

      {/* 4. Table Data Transaksi */}
      <TransactionTable data={filteredData} />
    </Layout>
  );
};

export default TransactionPage;
