import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import StaffLayout from '../../components/layout/StaffLayout';
import CustomerInfoCard from '../../components/pos/CustomerInfoCard';
import OrderSummaryTable from '../../components/pos/OrderSummaryTable';
import TotalBillCard from '../../components/pos/TotalBillCard';
import PaymentMethodSelect from '../../components/pos/PaymentMethodSelect';

const mockSantri = { nis: '123456', nama: 'Ahmad Fauzi', saldo: 50000 };

const POSCheckoutPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { cart = [], total = 0 } = location.state || {};
  const [paymentMethod, setPaymentMethod] = useState('saldo');

  const handleConfirm = () => {
    alert(`Pembayaran berhasil!\nMetode: ${paymentMethod === 'saldo' ? 'Saldo Santri' : 'Tunai'}\nTotal: Rp ${total.toLocaleString('id-ID')}`);
    navigate('/staff');
    // TODO: Implementasi API call pembayaran
  };

  return (
    <StaffLayout pageTitle="Checkout">
      <div className="checkout-page">
        <div className="checkout-header">
          <h2 className="checkout-title">Konfirmasi Pembayaran</h2>
          <p className="checkout-subtitle">Silakan periksa kembali detail pesanan dan pilih metode pembayaran.</p>
        </div>

        <div className="checkout-grid">
          {/* Kolom Kiri */}
          <div className="checkout-left">
            <CustomerInfoCard santri={mockSantri} />
            <OrderSummaryTable items={cart} />
          </div>

          {/* Kolom Kanan */}
          <div className="checkout-right">
            <TotalBillCard total={total} />
            <PaymentMethodSelect
              selected={paymentMethod}
              onSelect={setPaymentMethod}
              saldoSantri={mockSantri.saldo}
            />
            <button className="btn btn-primary btn-block btn-confirm" onClick={handleConfirm}>
              ✅ Konfirmasi &amp; Bayar
            </button>
          </div>
        </div>
      </div>
    </StaffLayout>
  );
};

export default POSCheckoutPage;
