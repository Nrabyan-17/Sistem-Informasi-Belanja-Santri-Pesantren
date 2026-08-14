import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

const defaultChartData = [
  { hari: 'Senin',  total: 1800000, transaksi: 120 },
  { hari: 'Selasa', total: 2200000, transaksi: 150 },
  { hari: 'Rabu',   total: 2600000, transaksi: 180 },
  { hari: 'Kamis',  total: 2100000, transaksi: 140 },
  { hari: 'Jumat',  total: 3100000, transaksi: 210 },
  { hari: 'Sabtu',  total: 2847500, transaksi: 247 },
  { hari: 'Minggu', total: 2500000, transaksi: 190 },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-slate-900 text-white p-3 rounded-xl shadow-lg border border-slate-700 text-xs space-y-1">
        <p className="font-bold text-slate-300">{label}</p>
        <p className="text-emerald-400 font-extrabold">
          Nominal: Rp {new Intl.NumberFormat('id-ID').format(data.total)}
        </p>
        <p className="text-slate-400">
          Total Transaksi: <strong className="text-white">{data.transaksi} santri</strong>
        </p>
      </div>
    );
  }
  return null;
};

const SalesChart = ({ data = defaultChartData }) => {
  const chartData = data.length > 0 ? data : defaultChartData;

  const formatYAxis = (val) => {
    if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M`;
    if (val >= 1000) return `${(val / 1000).toFixed(0)}k`;
    return val;
  };

  return (
    <div className="chart-container bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="chart-title text-base font-extrabold text-slate-800 dark:text-slate-100">
            Tren Pembelian Santri
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Grafik mingguan aktivitas belanja koin santri
          </p>
        </div>
        <span className="px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 rounded-lg text-xs font-bold">
          Minggu Ini
        </span>
      </div>

      <div className="w-full h-64 sm:h-72">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0e5d26" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#0e5d26" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.5} vertical={false} />
            <XAxis
              dataKey="hari"
              tick={{ fontSize: 11, fill: '#64748b' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tickFormatter={formatYAxis}
              tick={{ fontSize: 11, fill: '#64748b' }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="total"
              stroke="#0e5d26"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorTotal)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default SalesChart;
