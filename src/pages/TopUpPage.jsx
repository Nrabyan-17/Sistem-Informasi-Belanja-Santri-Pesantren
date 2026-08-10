import { useState } from 'react';
import MainLayout from '../components/layout/MainLayout';
import TopUpForm from '../components/topup/TopUpForm';

const mockSantri = [
  { id: 1, nis: '123456', nama: 'Ahmad Fauzi', saldo: 50000 },
  { id: 2, nis: '123457', nama: 'Budi Santoso', saldo: 75000 },
];

const TopUpPage = () => {
  const [searchNIS, setSearchNIS] = useState('');
  const [selectedSantri, setSelectedSantri] = useState(null);

  const handleSearch = () => {
    const found = mockSantri.find((s) => s.nis === searchNIS);
    setSelectedSantri(found || null);
    if (!found) alert('Santri dengan NIS tersebut tidak ditemukan.');
  };

  const handleTopUp = ({ santri, nominal }) => {
    alert(`Top Up berhasil!\nSantri: ${santri.nama}\nNominal: Rp ${nominal.toLocaleString('id-ID')}`);
    // TODO: Implementasi API call top up saldo
  };

  return (
    <MainLayout pageTitle="Pengisian Saldo Santri">
      <div className="topup-search">
        <input
          type="text"
          placeholder="Masukkan NIS Santri..."
          value={searchNIS}
          onChange={(e) => setSearchNIS(e.target.value)}
          className="search-input"
        />
        <button className="btn btn-primary" onClick={handleSearch}>
          🔍 Cari Santri
        </button>
      </div>

      {selectedSantri && (
        <TopUpForm santri={selectedSantri} onSubmit={handleTopUp} />
      )}
    </MainLayout>
  );
};

export default TopUpPage;
