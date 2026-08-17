import React from 'react';

// Kartu Ringkasan KPI Pengguna — Adaptif berdasarkan kategori (All / Admin / Staff)
const UserKpiCards = ({
  category = 'all',
  totalPengguna = 7,
  penggunaAktif = 6,
  totalWali = 4,
  totalStaffAdmin = 3,
}) => {
  if (category === 'admin') {
    const nonAktif = totalPengguna - penggunaAktif;
    return (
      <div className="user-kpi-grid">
        <div className="user-kpi-card user-kpi-card--total">
          <span className="user-kpi-label">TOTAL ADMIN / MANAJERIAL</span>
          <h3 className="user-kpi-value">{totalPengguna} akun</h3>
        </div>
        <div className="user-kpi-card user-kpi-card--aktif">
          <span className="user-kpi-label user-kpi-label--aktif">ADMIN AKTIF</span>
          <h3 className="user-kpi-value user-kpi-value--aktif">{penggunaAktif} akun</h3>
        </div>
        <div className="user-kpi-card user-kpi-card--keluar">
          <span className="user-kpi-label user-kpi-label--keluar">ADMIN NONAKTIF</span>
          <h3 className="user-kpi-value user-kpi-value--keluar">{nonAktif} akun</h3>
        </div>
        <div className="user-kpi-card user-kpi-card--staff">
          <span className="user-kpi-label user-kpi-label--staff">LEVEL HAK AKSES</span>
          <h3 className="user-kpi-value user-kpi-value--staff">Manajerial / BAK</h3>
        </div>
      </div>
    );
  }

  if (category === 'staff-koin') {
    const nonAktif = totalPengguna - penggunaAktif;
    return (
      <div className="user-kpi-grid">
        <div className="user-kpi-card user-kpi-card--total">
          <span className="user-kpi-label">TOTAL STAFF RUMAH KOIN</span>
          <h3 className="user-kpi-value">{totalPengguna} akun</h3>
        </div>
        <div className="user-kpi-card user-kpi-card--aktif">
          <span className="user-kpi-label user-kpi-label--aktif">STAFF AKTIF</span>
          <h3 className="user-kpi-value user-kpi-value--aktif">{penggunaAktif} akun</h3>
        </div>
        <div className="user-kpi-card user-kpi-card--keluar">
          <span className="user-kpi-label user-kpi-label--keluar">STAFF NONAKTIF</span>
          <h3 className="user-kpi-value user-kpi-value--keluar">{nonAktif} akun</h3>
        </div>
        <div className="user-kpi-card user-kpi-card--staff">
          <span className="user-kpi-label user-kpi-label--staff">PENUGASAN UTAMA</span>
          <h3 className="user-kpi-value user-kpi-value--staff">Loket Rumah Koin</h3>
        </div>
      </div>
    );
  }

  if (category === 'wali') {
    const nonAktif = totalPengguna - penggunaAktif;
    return (
      <div className="user-kpi-grid">
        <div className="user-kpi-card user-kpi-card--total">
          <span className="user-kpi-label">TOTAL WALI SANTRI</span>
          <h3 className="user-kpi-value">{totalPengguna} akun</h3>
        </div>
        <div className="user-kpi-card user-kpi-card--aktif">
          <span className="user-kpi-label user-kpi-label--aktif">WALI AKTIF</span>
          <h3 className="user-kpi-value user-kpi-value--aktif">{penggunaAktif} akun</h3>
        </div>
        <div className="user-kpi-card user-kpi-card--keluar">
          <span className="user-kpi-label user-kpi-label--keluar">WALI NONAKTIF</span>
          <h3 className="user-kpi-value user-kpi-value--keluar">{nonAktif} akun</h3>
        </div>
        <div className="user-kpi-card user-kpi-card--wali">
          <span className="user-kpi-label user-kpi-label--wali">TAUTAN NIS SANTRI</span>
          <h3 className="user-kpi-value user-kpi-value--wali">Terhubung NIS</h3>
        </div>
      </div>
    );
  }

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
