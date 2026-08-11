import { useNavigate } from 'react-router-dom';
import logoPesantren from '../assets/logo-pesantren.png';

// Halaman Pilih Role: Admin (Manajerial) atau Staff (Kasir)
const RoleSelectPage = () => {
  const navigate = useNavigate();

  return (
    <div className="role-select-page">
      {/* Background Decoration */}
      <div className="role-bg-decoration"></div>

      <div className="role-container">
        {/* Logo & Heading */}
        <div className="role-header">
          <img src={logoPesantren} alt="Logo Pesantren" className="role-logo" />
          <h1 className="role-title">Sistem Manajemen Koin</h1>
          <p className="role-subtitle">Pondok Pesantren Nazhatut Thullab</p>
        </div>

        {/* Pilih Role */}
        <p className="role-instruction">Silakan pilih role Anda untuk melanjutkan</p>

        <div className="role-cards">
          {/* Card Admin */}
          <button className="role-card role-card--admin" onClick={() => navigate('/admin')}>
            <div className="role-card-icon">🛡️</div>
            <h2 className="role-card-title">Admin / Manajerial</h2>
            <p className="role-card-desc">
              Kelola dashboard, transaksi, laporan keuangan, data pengguna, top-up saldo, dan staff rumah koin.
            </p>
            <span className="role-card-action">Masuk sebagai Admin →</span>
          </button>

          {/* Card Staff */}
          <button className="role-card role-card--staff" onClick={() => navigate('/staff')}>
            <div className="role-card-icon">🏪</div>
            <h2 className="role-card-title">Staff Kasir</h2>
            <p className="role-card-desc">
              Akses Point of Sale (POS) kasir untuk memproses penjualan dan checkout belanja santri.
            </p>
            <span className="role-card-action">Masuk sebagai Staff →</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoleSelectPage;
