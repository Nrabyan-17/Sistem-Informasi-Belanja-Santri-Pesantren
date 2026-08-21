import React from 'react';

// StatCards: Kartu Ringkasan Statistik (Total Saldo Mengendap, Koin Ditarik Hari Ini, Santri Aktif)
const StatCards = ({ totalSaldo = 0, totalPemasukan = 0, totalSantriAktif = 0 }) => {
  return (
    <div className="stat-cards">
      {/* Total Saldo Mengendap */}
      <div className="stat-card">
        <div className="stat-card-header">
          <span className="stat-label">TOTAL SALDO MENGENDAP</span>
          <div className="stat-icon-pill stat-icon-pill--green">
            <svg className="stat-icon" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z" />
            </svg>
          </div>
        </div>
        <h2 className="stat-value">Rp {(Number(totalSaldo) || 0).toLocaleString('id-ID')}</h2>
      </div>

      {/* Koin Ditarik */}
      <div className="stat-card">
        <div className="stat-card-header">
          <span className="stat-label">TOTAL KOIN DITARIK</span>
          <div className="stat-icon-pill stat-icon-pill--orange">
            <svg className="stat-icon" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6.99 11L3 15l3.99 4v-3H14v-2H6.99v-3zM21 9l-3.99-4v3H10v2h7.01v3L21 9z" />
            </svg>
          </div>
        </div>
        <h2 className="stat-value">Rp {(Number(totalPemasukan) || 0).toLocaleString('id-ID')}</h2>
      </div>

      {/* Santri Aktif */}
      <div className="stat-card">
        <div className="stat-card-header">
          <span className="stat-label">SANTRI AKTIF</span>
          <div className="stat-icon-pill stat-icon-pill--blue">
            <svg className="stat-icon" fill="currentColor" viewBox="0 0 24 24">
              <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
            </svg>
          </div>
        </div>
        <h2 className="stat-value">{(Number(totalSantriAktif) || 0).toLocaleString('id-ID')}</h2>
      </div>
    </div>
  );
};

export default StatCards;
