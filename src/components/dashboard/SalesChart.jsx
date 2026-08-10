// SalesChart: Grafik Bar Tren Pembelian/Belanja (menggunakan Recharts)
// Install: npm install recharts
const SalesChart = ({ data = [] }) => {
  // TODO: Integrasikan dengan library Recharts
  // import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
  return (
    <div className="chart-container">
      <h3 className="chart-title">Tren Pembelian Santri</h3>
      <div className="chart-placeholder">
        {/* Grafik Bar akan dirender di sini dengan Recharts */}
        <p style={{ color: '#888', textAlign: 'center', padding: '40px' }}>
          📊 Grafik Tren Belanja (Recharts)
        </p>
      </div>
    </div>
  );
};

export default SalesChart;
