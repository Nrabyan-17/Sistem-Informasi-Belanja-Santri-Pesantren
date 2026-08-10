// Filter Bar Transaksi: Kategori, Tanggal, Status, dan Search
const TransactionFilterBar = ({ onFilter }) => {
  return (
    <div className="filter-bar">
      <input
        type="text"
        placeholder="Cari santri atau transaksi..."
        className="filter-search"
        onChange={(e) => onFilter?.({ search: e.target.value })}
      />
      <select className="filter-select" onChange={(e) => onFilter?.({ kategori: e.target.value })}>
        <option value="">Semua Kategori</option>
        <option value="belanja">Belanja</option>
        <option value="topup">Top Up</option>
      </select>
      <select className="filter-select" onChange={(e) => onFilter?.({ status: e.target.value })}>
        <option value="">Semua Status</option>
        <option value="sukses">Sukses</option>
        <option value="pending">Pending</option>
        <option value="gagal">Gagal</option>
      </select>
      <input type="date" className="filter-date" onChange={(e) => onFilter?.({ tanggal: e.target.value })} />
    </div>
  );
};

export default TransactionFilterBar;
