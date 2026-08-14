import React from 'react';

// Kartu Ringkasan KPI Pengguna: TOTAL PENGGUNA, PENGGUNA AKTIF, WALI SANTRI / WALI, STAFF & ADMIN
const UserKpiCards = ({
  totalPengguna = 7,
  penggunaAktif = 6,
  totalWali = 4,
  totalStaffAdmin = 3,
}) => {
  return (
    <div className="user-kpi-grid">
      {/* Total Pengguna */}
      <div className="user-kpi-card user-kpi-card--total">
        <span className="user-kpi-label">TOTAL PENGGUNA</span>
        <h3 className="user-kpi-value">{totalPengguna} akun</h3>
      </div>

      {/* Pengguna Aktif */}
      <div className="user-kpi-card user-kpi-card--aktif">
        <span className="user-kpi-label user-kpi-label--aktif">PENGGUNA AKTIF</span>
        <h3 className="user-kpi-value user-kpi-value--aktif">{penggunaAktif} akun</h3>
      </div>

      {/* Wali Santri / Wali */}
      <div className="user-kpi-card user-kpi-card--wali">
        <span className="user-kpi-label user-kpi-label--wali">WALI SANTRI / WALI</span>
        <h3 className="user-kpi-value user-kpi-value--wali">{totalWali} akun</h3>
      </div>

      {/* Staff & Admin */}
      <div className="user-kpi-card user-kpi-card--staff">
        <span className="user-kpi-label user-kpi-label--staff">STAFF &amp; ADMIN</span>
        <h3 className="user-kpi-value user-kpi-value--staff">{totalStaffAdmin} akun</h3>
      </div>
    </div>
  );
};

export default UserKpiCards;
