import { useState, useEffect, useMemo } from 'react';
import MainLayout from '../components/layout/MainLayout';
import SaldoDetailModal from '../components/users/SaldoDetailModal';
import { santriApi } from '../utils/api';

const TopUpPage = ({ Layout = MainLayout, isStaffVersion = false }) => {
  const [santriList, setSantriList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSantri, setSelectedSantri] = useState(null);
  const [modalMode, setModalMode] = useState('view'); // 'view' | 'edit'
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchSantri = () => {
    setLoading(true);
    santriApi
      .list({ per_page: 100 })
      .then((res) =>
        setSantriList(
          (res.data || []).map((s) => ({
            id: s.id,
            nis: s.nis,
            nama: s.nama,
            saldo: s.saldo || 0,
            foto: s.foto_url || null,
          }))
        )
      )
      .catch(() => setSantriList([]))
      .finally(() => setLoading(false));
  };

  useEffect(fetchSantri, []);

  // Filter santri
  const filteredSantri = useMemo(() => {
    if (!searchQuery.trim()) return santriList;
    const query = searchQuery.toLowerCase();
    return santriList.filter(
      (s) => s.nama.toLowerCase().includes(query) || s.nis.toLowerCase().includes(query)
    );
  }, [santriList, searchQuery]);

  const handleOpenDetail = (santri, mode = 'view') => {
    setSelectedSantri(santri);
    setModalMode(mode);
    setIsModalOpen(true);
  };

  const handleUpdatePhoto = (santriId, newPhoto) => {
    setSantriList((prev) =>
      prev.map((s) => (s.id === santriId ? { ...s, foto: newPhoto } : s))
    );
    setSelectedSantri((prev) => (prev && prev.id === santriId ? { ...prev, foto: newPhoto } : prev));
  };

  const handleUpdateSaldo = (santriId, newSaldo) => {
    setSantriList((prev) =>
      prev.map((s) => (s.id === santriId ? { ...s, saldo: newSaldo } : s))
    );
    setSelectedSantri((prev) => (prev && prev.id === santriId ? { ...prev, saldo: newSaldo } : prev));
  };

  const formatRupiah = (val) => new Intl.NumberFormat('id-ID').format(val);

  const title = isStaffVersion ? 'Penyesuaian Saldo' : 'Cek Saldo';
  const subtitle = isStaffVersion
    ? 'Cek saldo santri dan penyesuaian koreksi (tambah/kurang saldo)'
    : 'Pantau saldo mengendap, identitas, pasfoto, dan riwayat transaksi santri';

  return (
    <Layout pageTitle={title}>
      {/* Header Title */}
      <div className="report-header-card mb-6">
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">
          {title}
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">
          {subtitle}
        </p>
      </div>

      {loading && (
        <div className="flex items-center justify-center h-32 text-slate-500 dark:text-slate-400 font-medium">
          Memuat data santri...
        </div>
      )}

      {/* Card Table: Daftar Identitas & Saldo Santri */}
      <div className="saldo-table-card">
        <div className="saldo-card-header">
          <div>
            <h3 className="saldo-card-title">Daftar Identitas &amp; Saldo Santri</h3>
            <p className="saldo-card-subtitle">
              {isStaffVersion
                ? 'Klik baris tabel atau tombol aksi untuk melihat riwayat atau melakukan penyesuaian saldo.'
                : 'Klik baris tabel untuk melihat detail saldo, foto verifikasi, dan riwayat transaksi santri.'}
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
                    onClick={() => handleOpenDetail(santri, 'view')}
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
                    <td className="font-bold text-emerald-700 dark:text-emerald-400 font-mono">
                      Rp {formatRupiah(santri.saldo)}
                    </td>
                    <td className="text-center" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleOpenDetail(santri, 'view')}
                          className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl transition-all cursor-pointer"
                        >
                          Cek Saldo
                        </button>
                        {isStaffVersion && (
                          <button
                            type="button"
                            onClick={() => handleOpenDetail(santri, 'edit')}
                            className="px-3.5 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
                          >
                            Penyesuaian
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Saldo Detail & Photo Management Modal with Adjustment for Staff */}
      {selectedSantri && (
        <SaldoDetailModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          santri={selectedSantri}
          initialMode={modalMode}
          allowAdjustment={isStaffVersion}
          onUpdatePhoto={handleUpdatePhoto}
          onUpdateSaldo={handleUpdateSaldo}
        />
      )}
    </Layout>
  );
};

export default TopUpPage;
