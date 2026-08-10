// Layout Khusus Halaman Kasir POS (tanpa Sidebar Admin)
const POSLayout = ({ children }) => {
  return (
    <div className="pos-layout">
      <header className="pos-header">
        <button className="pos-back-btn" onClick={() => window.history.back()}>
          ← Kembali
        </button>
        <span className="pos-brand">Sistem Manajemen Koin POS</span>
      </header>
      <main className="pos-content">{children}</main>
    </div>
  );
};

export default POSLayout;
