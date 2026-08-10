// Card Informasi Santri pada Halaman POS Checkout (sesuai gambar)
const CustomerInfoCard = ({ santri }) => {
  return (
    <div className="customer-info-card">
      <div className="card-header">
        <span className="card-icon">👤</span>
        <span className="card-title">Informasi Santri</span>
      </div>
      <div className="customer-info-body">
        <div className="info-item">
          <p className="info-label">NIS</p>
          <p className="info-value">{santri?.nis || '-'}</p>
        </div>
        <div className="info-item">
          <p className="info-label">NAMA</p>
          <p className="info-value info-value--name">{santri?.nama || '-'}</p>
        </div>
      </div>
    </div>
  );
};

export default CustomerInfoCard;
