import React, { useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

// Data Mock Multi-Timeline
const mockWeeklyData = [
  { label: 'Senin',  total: 1800000, transaksi: 120 },
  { label: 'Selasa', total: 2200000, transaksi: 150 },
  { label: 'Rabu',   total: 2600000, transaksi: 180 },
  { label: 'Kamis',  total: 2100000, transaksi: 140 },
  { label: 'Jumat',  total: 3100000, transaksi: 210 },
  { label: 'Sabtu',  total: 2847500, transaksi: 247 },
  { label: 'Minggu', total: 2500000, transaksi: 190 },
];

const mockMonthlyData = [
  { label: 'Jan', total: 42000000, transaksi: 1400 },
  { label: 'Feb', total: 38000000, transaksi: 1250 },
  { label: 'Mar', total: 45000000, transaksi: 1500 },
  { label: 'Apr', total: 51000000, transaksi: 1700 },
  { label: 'Mei', total: 48000000, transaksi: 1600 },
  { label: 'Jun', total: 32000000, transaksi: 1100 },
  { label: 'Jul', total: 55000000, transaksi: 1850 },
  { label: 'Ags', total: 58000000, transaksi: 1920 },
  { label: 'Sep', total: 49000000, transaksi: 1630 },
  { label: 'Okt', total: 52000000, transaksi: 1730 },
  { label: 'Nov', total: 47000000, transaksi: 1580 },
  { label: 'Des', total: 60000000, transaksi: 2000 },
];

const mockYearlyData = [
  { label: '2022', total: 480000000, transaksi: 16000 },
  { label: '2023', total: 540000000, transaksi: 18000 },
  { label: '2024', total: 590000000, transaksi: 19500 },
  { label: '2025', total: 630000000, transaksi: 21000 },
  { label: '2026', total: 577000000, transaksi: 19200 },
];

const CustomTooltip = ({ active, payload, label, timeframe }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white dark:bg-slate-800 p-3 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 text-xs space-y-1">
        <p className="font-bold text-slate-500 dark:text-slate-400">
          {timeframe === 'mingguan' ? `Hari ${label}` : timeframe === 'bulanan' ? `Bulan ${label}` : `Tahun ${label}`}
        </p>
        <p className="text-emerald-600 dark:text-emerald-400 font-extrabold text-sm">
          Rp {new Intl.NumberFormat('id-ID').format(data.total)}
        </p>
        {data.transaksi > 0 && (
          <p className="text-slate-400 dark:text-slate-400">
            Total Transaksi: <strong className="text-slate-700 dark:text-slate-200">{data.transaksi.toLocaleString('id-ID')} entri</strong>
          </p>
        )}
      </div>
    );
  }
  return null;
};

const SalesChart = ({ trendData }) => {
  const [timeframe, setTimeframe] = useState('mingguan'); // 'mingguan' | 'bulanan' | 'tahunan'
  const [selectedYear, setSelectedYear] = useState('2026');

  // Pakai data API (14 hari terakhir) untuk mode mingguan; bulanan/tahunan tetap mock
  const weeklyData = trendData && trendData.length
    ? trendData.map((d) => ({ label: d.tanggal, total: d.penarikan || 0, transaksi: 0 }))
    : mockWeeklyData;

  // Filter Data berdasarkan timeframe
  const getActiveData = () => {
    switch (timeframe) {
      case 'bulanan':
        return mockMonthlyData;
      case 'tahunan':
        return mockYearlyData;
      case 'mingguan':
      default:
        return weeklyData;
    }
  };

  const activeData = getActiveData();

  const formatYAxis = (val) => {
    if (val >= 1000000000) return `${(val / 1000000000).toFixed(1)}B`;
    if (val >= 1000000) return `${(val / 1000000).toFixed(0)}M`;
    if (val >= 1000) return `${(val / 1000).toFixed(0)}k`;
    return val;
  };

  return (
    <div className="chart-container bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xs transition-colors">
      {/* Header Chart & Filter Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h3 className="chart-title text-base sm:text-lg font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            Grafik Penarikan Koin Santri
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
            {timeframe === 'mingguan' && (trendData && trendData.length ? 'Aktivitas penarikan koin 14 hari terakhir' : 'Aktivitas penarikan koin harian minggu ini')}
            {timeframe === 'bulanan' && `Akumulasi penarikan koin per bulan tahun ${selectedYear}`}
            {timeframe === 'tahunan' && 'Rekapitulasi penarikan koin santri 5 tahun terakhir'}
          </p>
        </div>

        {/* Filter Timeline Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Timeframe Switcher Tabs */}
          <div className="bg-slate-100/90 dark:bg-slate-800/90 p-2 sm:p-2.5 rounded-2xl sm:rounded-3xl flex items-center gap-2 sm:gap-3 border border-slate-200/80 dark:border-slate-700">
            <button
              className={`px-5 sm:px-6 py-2.5 sm:py-3 h-11 sm:h-12 min-w-[105px] flex items-center justify-center rounded-xl sm:rounded-2xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer ${
                timeframe === 'mingguan'
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
              }`}
              onClick={() => setTimeframe('mingguan')}
            >
              Mingguan
            </button>
            <button
              className={`px-5 sm:px-6 py-2.5 sm:py-3 h-11 sm:h-12 min-w-[105px] flex items-center justify-center rounded-xl sm:rounded-2xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer ${
                timeframe === 'bulanan'
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
              }`}
              onClick={() => setTimeframe('bulanan')}
            >
              Bulanan
            </button>
            <button
              className={`px-5 sm:px-6 py-2.5 sm:py-3 h-11 sm:h-12 min-w-[105px] flex items-center justify-center rounded-xl sm:rounded-2xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer ${
                timeframe === 'tahunan'
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
              }`}
              onClick={() => setTimeframe('tahunan')}
            >
              Tahunan
            </button>
          </div>

          {/* Dropdown Filter Tahun (Tampil jika mode Bulanan) */}
          {timeframe === 'bulanan' && (
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="px-4 sm:px-5 py-2.5 sm:py-3 h-11 sm:h-12 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-extrabold text-slate-700 dark:text-slate-200 focus:outline-none focus:border-emerald-600 cursor-pointer shadow-xs"
            >
              <option value="2026">Tahun 2026</option>
              <option value="2025">Tahun 2025</option>
              <option value="2024">Tahun 2024</option>
            </select>
          )}
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="w-full h-64 sm:h-72">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={activeData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
            <defs>
              <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0e5d26" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#0e5d26" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.5} vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 11, fill: '#64748b', fontWeight: 600 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tickFormatter={formatYAxis}
              tick={{ fontSize: 11, fill: '#64748b', fontWeight: 600 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip timeframe={timeframe} />} />
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
