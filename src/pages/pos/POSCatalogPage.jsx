import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import StaffLayout from '../../components/layout/StaffLayout';

const mockProducts = [
  { id: 1, nama: 'Nasi Goreng', harga: 5000, kategori: 'Makanan' },
  { id: 2, nama: 'Teh Manis', harga: 2000, kategori: 'Minuman' },
  { id: 3, nama: 'Mie Goreng', harga: 4000, kategori: 'Makanan' },
  { id: 4, nama: 'Es Jeruk', harga: 3000, kategori: 'Minuman' },
];

const POSCatalogPage = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useState([]);

  const addToCart = (product) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === product.id);
      if (existing) return prev.map((i) => i.id === product.id ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { ...product, qty: 1 }];
    });
  };

  const total = cart.reduce((sum, item) => sum + item.harga * item.qty, 0);

  return (
    <StaffLayout pageTitle="POS Kasir">
      <div className="pos-catalog">
        <h2>Pilih Menu / Produk</h2>
        <div className="product-grid">
          {mockProducts.map((product) => (
            <div key={product.id} className="product-card" onClick={() => addToCart(product)}>
              <p className="product-name">{product.nama}</p>
              <p className="product-price">Rp {product.harga.toLocaleString('id-ID')}</p>
            </div>
          ))}
        </div>

        {cart.length > 0 && (
          <div className="cart-summary">
            <span>{cart.length} item — Total: Rp {total.toLocaleString('id-ID')}</span>
            <button
              className="btn btn-primary"
              onClick={() => navigate('/staff/checkout', { state: { cart, total } })}
            >
              Lanjut Checkout →
            </button>
          </div>
        )}
      </div>
    </StaffLayout>
  );
};

export default POSCatalogPage;
