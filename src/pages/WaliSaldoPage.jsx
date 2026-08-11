import { useState } from 'react';
import WaliLayout from '../components/layout/WaliLayout';

const WaliSaldoPage = () => {
  const [copied, setCopied] = useState(false);

  const vaNumber = '8808 0990 1234 5678';

  const handleCopyVA = () => {
    navigator.clipboard?.writeText(vaNumber.replace(/\s+/g, ''));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    alert(`✅ Nomor VA ${vaNumber} berhasil disalin!`);
  };

  return (
    <WaliLayout pageTitle="Saldo &amp; Cara Pembayaran">
      <div className="wali-saldo-page">
        <div className="wali-header-subtitle">
          Pondok Pesantren Nazhatut Thullab
        </div>

        <div className="wali-grid">
          {/* Kolom Kiri: Card Santri + Saldo + Statistik + Info */}
          <div className="wali-left-col">
            {/* Banner Dark Green */}
            <div className="wali-santri-banner">
              <div className="wali-santri-profile">
                <div className="wali-avatar">👤</div>
                <div className="wali-santri-meta">
                  <h2 className="wali-santri-name">Ahmad Fauzi</h2>
                  <p className="wali-santri-nis">NIS: 2024001</p>
                </div>
              </div>

              {/* White Overlay Card Sisa Saldo */}
              <div className="wali-saldo-card">
                <span className="wali-saldo-label">SISA SALDO UANG JAJAN</span>
                <div className="wali-saldo-amount">Rp 350.000</div>
                <div className="wali-saldo-updated">
                  Diperbarui Senin, 1 Agustus 2026 - 09:58 WIB
                </div>
              </div>
            </div>

            {/* Statistik Agustus 2026 */}
            <div className="wali-stats-section">
              <h3 className="wali-section-title">Statistik Agustus 2026</h3>
              <div className="wali-stats-grid">
                <div className="wali-stat-box wali-stat-box--green">
                  <span className="wali-stat-label">Total Isi</span>
                  <span className="wali-stat-val text-success">Rp 200.000</span>
                </div>
                <div className="wali-stat-box wali-stat-box--orange">
                  <span className="wali-stat-label">Total Tarik</span>
                  <span className="wali-stat-val text-warning">Rp 90.000</span>
                </div>
              </div>
            </div>

            {/* Info Cara Kerja */}
            <div className="wali-info-box">
              <div className="wali-info-icon">ℹ️</div>
              <div className="wali-info-text">
                <strong>Cara Kerja Sistem Koin:</strong> Santri dapat menarik koin senilai <strong>Rp 30.000</strong> per hari di loket Rumah Koin. Saldo bertambah otomatis setelah Wali Santri transfer ke nomor VA Jajan di sebelah kanan.
              </div>
            </div>
          </div>

          {/* Kolom Kanan: Card Virtual Account */}
          <div className="wali-right-col">
            <div className="wali-va-card">
              <div className="wali-va-header">
                <div>
                  <h3 className="wali-va-title">VIRTUAL ACCOUNT — UANG JAJAN</h3>
                  <p className="wali-va-subtitle">
                    Transfer ke sini untuk isi saldo harian Ahmad Fauzi
                  </p>
                </div>
                <span className="wali-bni-badge">BNI</span>
              </div>

              {/* Box Nomor VA */}
              <div className="wali-va-box">
                <span className="wali-va-box-label">Nomor Virtual Account</span>
                <div className="wali-va-number">{vaNumber}</div>
                <span className="wali-va-an">a.n. Ahmad Fauzi - PP Nazhatut Thullab</span>
              </div>

              {/* 3 Detail Info */}
              <div className="wali-va-details">
                <div className="wali-va-detail-item">
                  <span className="detail-label">MIN TRANSFER</span>
                  <span className="detail-val">Rp 10.000</span>
                </div>
                <div className="wali-va-detail-item">
                  <span className="detail-label">PROSES</span>
                  <span className="detail-val">Otomatis</span>
                </div>
                <div className="wali-va-detail-item">
                  <span className="detail-label">BANK</span>
                  <span className="detail-val">BNI</span>
                </div>
              </div>

              {/* Tombol Salin */}
              <button className="wali-copy-btn" onClick={handleCopyVA}>
                {copied ? '✅ VA Disalin!' : '📋 Salin Nomor VA Jajan'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </WaliLayout>
  );
};

export default WaliSaldoPage;
