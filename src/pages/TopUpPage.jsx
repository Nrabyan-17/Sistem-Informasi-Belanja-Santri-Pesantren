import { useState, useMemo, useEffect } from 'react';
import MainLayout from '../components/layout/MainLayout';
import SaldoDetailModal from '../components/users/SaldoDetailModal';
import { useAuth } from '../context/AuthContext';
import { santriApi } from '../utils/api';
import { setSantriSaldo, mergeSantriSaldos } from '../utils/saldoStorage';

const mapSantriForSaldo = (s) => ({
  id: s.id,
  nis: s.nis || '',
  nama: s.nama || s.name || '',
  saldo: Number(s.saldo || 0),
  foto: s.foto || s.foto_url || null,
  kelas: s.kelas || '',
});

const TopUpPage = ({ Layout = MainLayout }) => {
  const { user } = useAuth();
  const isStaff = user?.role === 'staff' || Layout !== MainLayout;

  const [santriList, setSantriList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSantri, setSelectedSantri] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchSantriList = () => {
    setLoading(true);
    santriApi.list({ per_page: 500 })
      .then((res) => {
        const rawData = res.data || (Array.isArray(res) ? res : []);
        if (Array.isArray(rawData)) {
          setSantriList(mergeSantriSaldos(rawData.map(mapSantriForSaldo)));
        } else {
          setSantriList([]);
        }
      })
      .catch((err) => {
        console.warn('Gagal memuat data saldo santri:', err.message);
        setSantriList([]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchSantriList();
  }, []);

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

  const handleAdjustSaldo = async (santriId, newSaldo, historyItem) => {
    // Simpan ke localStorage agar data terikat secara persisten
    setSantriSaldo(santriId, newSaldo);

    if (historyItem) {
      const nominal = Math.abs(Number(historyItem.nominal) || Math.abs(newSaldo - (selectedSantri?.saldo || 0)));
      const aksi = (historyItem.tipe === 'tambah' || historyItem.type === 'in' || newSaldo > (selectedSantri?.saldo || 0)) ? 'tambah' : 'kurangi';
      try {
        await santriApi.penyesuaian(santriId, {
          nominal: Math.max(1, nominal),
          aksi,
          keterangan: historyItem.keterangan || (aksi === 'tambah' ? 'Penyesuaian tambah saldo' : 'Penyesuaian kurangi saldo'),
        });
        await fetchSantriList();
      } catch (err) {
        console.warn('Penyimpanan API penyesuaian error:', err.message);
      }
    }

    setSantriList((prev) =>
      prev.map((s) => (s.id === santriId ? { ...s, saldo: newSaldo } : s))
    );
    setSelectedSantri((prev) => (prev && prev.id === santriId ? { ...prev, saldo: newSaldo } : prev));
  };

  const formatRupiah = (val) => new Intl.NumberFormat('id-ID').format(val);

  return (
    <Layout pageTitle={isStaff ? 'Cek Saldo & Penyesuaian' : 'Detail Saldo Santri'}>
      {/* Header Title */}
      <div className="report-header-card mb-6">
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">
          {isStaff ? 'Cek Saldo & Penyesuaian Santri' : 'Detail Saldo Santri'}
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          {isStaff
            ? 'Cek sisa saldo santri, penyesuaian manual (tambah/kurang), dan riwayat transaksi'
            : 'Informasi sisa saldo dan pantau riwayat mutasi santri pesantren'}
        </p>
      </div>

      {/* Card Table: Daftar Identitas & Saldo Santri */}
      <div className="saldo-table-card">
        <div className="saldo-card-header">
          <div>
            <h3 className="saldo-card-title">Daftar Identitas &amp; Saldo Santri</h3>
            <p className="saldo-card-subtitle">
              {loading ? (
                <span className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold animate-pulse">
                  <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Memuat data saldo santri...
                </span>
              ) : (
                'Klik baris tabel untuk melihat detail saldo, kelola pasfoto, dan riwayat transaksi santri.'
              )}
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
              disabled={loading}
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
              {loading ? (
                <tr>
                  <td colSpan="5" className="text-center py-14 text-slate-500 dark:text-slate-400 font-semibold">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <svg
                        className="w-8 h-8 text-emerald-600 dark:text-emerald-400 animate-spin"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      <span className="text-sm font-bold text-slate-700 dark:text-slate-200">
                        Memuat data saldo santri...
                      </span>
                    </div>
                  </td>
                </tr>
              ) : filteredSantri.length === 0 ? (
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
                        <div className="w-9 h-9 min-w-[36px] min-h-[36px] rounded-full bg-emerald-700 dark:bg-emerald-800 text-white font-black text-xs flex items-center justify-center shrink-0 overflow-hidden shadow-2xs aspect-square border border-emerald-600/30">
                          {santri.foto ? (
                            <img
                              src={santri.foto}
                              alt={santri.nama}
                              className="w-full h-full object-cover rounded-full aspect-square block"
                            />
                          ) : (
                            (santri.nama || 'S').charAt(0).toUpperCase()
                          )}
                        </div>
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

      {/* Saldo Detail Modal (Penyesuaian Saldo untuk Staff Rumah Koin, Detail View untuk Admin) */}
      {selectedSantri && (
        <SaldoDetailModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          santri={selectedSantri}
          onUpdatePhoto={handleUpdatePhoto}
          onAdjustSaldo={handleAdjustSaldo}
          canAdjustSaldo={isStaff}
        />
      )}
    </Layout>
  );
};

export default TopUpPage;
