import MainLayout from '../components/layout/MainLayout';
import TransactionTable from '../components/transactions/TransactionTable';
import TransactionFilterBar from '../components/transactions/TransactionFilterBar';

const mockTransactions = [
  { no: 1, tanggal: '2026-08-07', namaSantri: 'Ahmad Fauzi', kategori: 'Belanja', nominal: 9000, status: 'sukses' },
  { no: 2, tanggal: '2026-08-07', namaSantri: 'Budi Santoso', kategori: 'Top Up', nominal: 50000, status: 'sukses' },
  { no: 3, tanggal: '2026-08-06', namaSantri: 'Citra Dewi', kategori: 'Belanja', nominal: 12000, status: 'pending' },
];

const TransactionPage = () => {
  const handleFilter = (filters) => {
    console.log('Filter:', filters);
    // TODO: Implementasi filter logic
  };

  return (
    <MainLayout pageTitle="Manajemen Transaksi">
      <TransactionFilterBar onFilter={handleFilter} />
      <TransactionTable data={mockTransactions} />
    </MainLayout>
  );
};

export default TransactionPage;
