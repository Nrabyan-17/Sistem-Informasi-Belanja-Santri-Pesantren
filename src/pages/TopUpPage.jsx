import { useState, useMemo } from 'react';
import MainLayout from '../components/layout/MainLayout';
import SaldoDetailModal from '../components/users/SaldoDetailModal';

const mockSantriList = [
  { id: 1, nis: '2024003', nama: 'Muhammad Rizki',  saldo: 15000 },
  { id: 2, nis: '2024007', nama: 'Zainab Mustafa',   saldo: 45000 },
  { id: 3, nis: '2024006', nama: 'Nurul Hidayah',   saldo: 95000 },
  { id: 4, nis: '2024002', nama: 'Siti Nurhaliza',  saldo: 120000 },
  { id: 5, nis: '2024001', nama: 'Ahmad Fauzi',     saldo: 50000 },
  { id: 6, nis: '2024004', nama: 'Budi Santoso',    saldo: 75000 },
  { id: 7, nis: '2024005', nama: 'Citra Dewi',      saldo: 200000 },
];

const TopUpPage = ({ Layout = MainLayout }) => {
  const [santriList, setSantriList] = useState(mockSantriList);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSantri, setSelectedSantri] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Filter santri
  const filteredSantri = useMemo(() => {
    if (!searchQuery.trim()) return santriList;
    const query = searchQuery.toLowerCase();
    return santriList.filter(
      (s) => s.nama.toLowerCase().includes(query) || s.nis.toLowerCase().includes(query)
    );
  }, [santriList, searchQuery]);

  const handleOpenDetail = (santri) => {
    setSelectedSantri(santri);
    setIsModalOpen(true);
  };

  const handleUpdatePhoto = (santriId, newPhoto) => {
    setSantriList((prev) =>
      prev.map((s) => (s.id === santriId ? { ...s, foto: newPhoto } : s))
    );
    setSelectedSantri((prev) => (prev && prev.id === santriId ? { ...prev, foto: newPhoto } : prev));
  };

  const formatRupiah = (val) => new Intl.NumberFormat('id-ID').format(val);

  return (
    <Layout pageTitle="Penyesuaian Saldo">
      {/* Header Title */}
      <div className="report-header-card mb-6">
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">
          Penyesuaian Saldo
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Cek saldo santri dan penyesuaian (tambah/kurang)
        </p>
      </div>

      {/* Card Table: Daftar Identitas & Saldo Santri */}
      <div className="saldo-table-card">
        <div className="saldo-card-header">
          <div>
            <h3 className="saldo-card-title">Daftar Identitas &amp; Saldo Santri</h3>
            <p className="saldo-card-subtitle">
              Klik baris tabel untuk melihat detail saldo, kelola pasfoto, dan riwayat transaksi santri.
            </p>
          </div>
          <div className="saldo-search-wrapper relative flex items-center">
            <svg
              className="absolute left-3.5 w-4 h-4 text-slate-400 dark:text-slate-500 pointer-events-none z-10"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2.2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              placeholder="Cari Nama atau NIS..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="saldo-search-input pl-10"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="user-table w-full">
            <thead>
              <tr>
                <th className="w-16 text-left">NO</th>
                <th className="text-left">NIS</th>
                <th className="text-left">NAMA SANTRI</th>
                <th className="text-left">SALDO SAAT INI</th>
                <th className="text-center">AKSI</th>
              </tr>
            </thead>
            <tbody>
              {filteredSantri.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-8 text-slate-400 font-medium">
                    Tidak ada santri yang ditemukan.
                  </td>
                </tr>
              ) : (
                filteredSantri.map((santri, idx) => (
                  <tr
                    key={santri.id}
                    onClick={() => handleOpenDetail(santri)}
                    className="user-table-row cursor-pointer hover:bg-slate-50/80 dark:hover:bg-slate-800/60 transition-colors"
                  >
                    <td className="text-slate-400 font-medium">{idx + 1}</td>
                    <td className="font-mono text-slate-500 font-semibold">{santri.nis}</td>
                    <td className="py-3">
                      <div className="flex items-center gap-3">
                        {santri.foto ? (
                          <img
                            src={santri.foto}
                            alt={santri.nama}
                            className="w-9 h-9 rounded-xl object-cover border border-emerald-600/40 shadow-2xs shrink-0"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-xl bg-emerald-700 text-white font-black text-xs flex items-center justify-center shrink-0 shadow-2xs">
                            {(santri.nama || 'S').charAt(0).toUpperCase()}
                          </div>
                        )}
                        <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                          {santri.nama}
                        </span>
                      </div>
                    </td>
                    <td className="font-bold text-emerald-700 dark:text-emerald-400">
                      Rp {formatRupiah(santri.saldo)}
                    </td>
                    <td className="text-center" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={() => handleOpenDetail(santri)}
                        className="btn-detail-saldo"
                      >
                        Detail
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Saldo Detail & Photo Management Modal */}
      {selectedSantri && (
        <SaldoDetailModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          santri={selectedSantri}
          onUpdatePhoto={handleUpdatePhoto}
        />
      )}
    </Layout>
  );
};

export default TopUpPage;
