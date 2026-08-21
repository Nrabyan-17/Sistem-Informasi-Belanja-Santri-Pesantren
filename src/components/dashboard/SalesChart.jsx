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

// Default 0-data structures when API returns no transaction data yet
const zeroWeeklyData = [
  { label: 'Senin',  total: 0, transaksi: 0 },
  { label: 'Selasa', total: 0, transaksi: 0 },
  { label: 'Rabu',   total: 0, transaksi: 0 },
  { label: 'Kamis',  total: 0, transaksi: 0 },
  { label: 'Jumat',  total: 0, transaksi: 0 },
  { label: 'Sabtu',  total: 0, transaksi: 0 },
  { label: 'Minggu', total: 0, transaksi: 0 },
];

const zeroMonthlyData = [
  { label: 'Jan', total: 0, transaksi: 0 },
  { label: 'Feb', total: 0, transaksi: 0 },
  { label: 'Mar', total: 0, transaksi: 0 },
  { label: 'Apr', total: 0, transaksi: 0 },
  { label: 'Mei', total: 0, transaksi: 0 },
  { label: 'Jun', total: 0, transaksi: 0 },
  { label: 'Jul', total: 0, transaksi: 0 },
  { label: 'Ags', total: 0, transaksi: 0 },
  { label: 'Sep', total: 0, transaksi: 0 },
  { label: 'Okt', total: 0, transaksi: 0 },
  { label: 'Nov', total: 0, transaksi: 0 },
  { label: 'Des', total: 0, transaksi: 0 },
];

const zeroYearlyData = [
  { label: '2022', total: 0, transaksi: 0 },
  { label: '2023', total: 0, transaksi: 0 },
  { label: '2024', total: 0, transaksi: 0 },
  { label: '2025', total: 0, transaksi: 0 },
  { label: '2026', total: 0, transaksi: 0 },
];

const CustomTooltip = ({ active, payload, label, timeframe }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white dark:bg-slate-800 p-3 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 text-xs space-y-1">
        <p className="font-bold text-slate-500 dark:text-slate-400">
          {timeframe === 'mingguan' ? `${label} (${data.tanggal || ''})` : timeframe === 'bulanan' ? `Bulan ${label}` : `Tahun ${label}`}
        </p>
        <p className="text-emerald-600 dark:text-emerald-400 font-extrabold text-sm">
          Rp {new Intl.NumberFormat('id-ID').format(data.total || 0)}
        </p>
        {data.transaksi > 0 && (
          <p className="text-slate-400 dark:text-slate-400">
            Total Penarikan: <strong className="text-slate-700 dark:text-slate-200">{data.transaksi.toLocaleString('id-ID')} kali</strong>
          </p>
        )}
      </div>
    );
  }
  return null;
};

const SalesChart = ({
  trendData,
  timeframe: propTimeframe,
  selectedYear: propSelectedYear,
  onTimeframeChange,
}) => {
  const [localTimeframe, setLocalTimeframe] = useState('mingguan');
  const [localSelectedYear, setLocalSelectedYear] = useState('2026');

  const timeframe = propTimeframe !== undefined ? propTimeframe : localTimeframe;
  const selectedYear = propSelectedYear !== undefined ? propSelectedYear : localSelectedYear;

  const handleSetTimeframe = (tf) => {
    if (onTimeframeChange) {
      onTimeframeChange(tf, selectedYear);
    } else {
      setLocalTimeframe(tf);
    }
  };

  const handleSetYear = (yr) => {
    if (onTimeframeChange) {
      onTimeframeChange(timeframe, yr);
    } else {
      setLocalSelectedYear(yr);
    }
  };

  // Format data dari API
  const apiFormattedData = trendData && trendData.length
    ? trendData.map((d) => ({
        label: d.label || d.tanggal || '',
        total: d.total !== undefined ? d.total : d.penarikan || 0,
        transaksi: d.transaksi || 0,
      }))
    : null;

  // Data aktif berdasarkan timeframe
  const getActiveData = () => {
    if (apiFormattedData && apiFormattedData.length > 0) {
      return apiFormattedData;
    }
    switch (timeframe) {
      case 'bulanan':
        return zeroMonthlyData;
      case 'tahunan':
        return zeroYearlyData;
      case 'mingguan':
      default:
        return zeroWeeklyData;
    }
  };

  const activeData = getActiveData();

  const handleYearChange = async (year) => {
    setSelectedYear(year);
    try {
      const { dashboardApi } = await import('../../utils/api');
      const res = await dashboardApi.get({ tahun: year });
      if (res?.tren_bulanan) {
        setCustomMonthly(res.tren_bulanan);
      }
    } catch {
      // fallback to current
    }
  };

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
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 w-full md:w-auto">
          {/* Timeframe Switcher Tabs */}
          <div className="bg-slate-100/90 dark:bg-slate-800/90 p-1.5 sm:p-2.5 rounded-xl sm:rounded-3xl flex items-center gap-1.5 sm:gap-3 border border-slate-200/80 dark:border-slate-700 w-full sm:w-auto justify-between sm:justify-start">
            <button
              className={`flex-1 sm:flex-none px-3 sm:px-6 py-2 sm:py-3 h-10 sm:h-12 min-w-[70px] sm:min-w-[105px] flex items-center justify-center rounded-lg sm:rounded-2xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer ${
                timeframe === 'mingguan'
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
              }`}
              onClick={() => handleSetTimeframe('mingguan')}
            >
              Mingguan
            </button>
            <button
              className={`flex-1 sm:flex-none px-3 sm:px-6 py-2 sm:py-3 h-10 sm:h-12 min-w-[70px] sm:min-w-[105px] flex items-center justify-center rounded-lg sm:rounded-2xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer ${
                timeframe === 'bulanan'
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
              }`}
              onClick={() => handleSetTimeframe('bulanan')}
            >
              Bulanan
            </button>
            <button
              className={`flex-1 sm:flex-none px-3 sm:px-6 py-2 sm:py-3 h-10 sm:h-12 min-w-[70px] sm:min-w-[105px] flex items-center justify-center rounded-lg sm:rounded-2xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer ${
                timeframe === 'tahunan'
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
              }`}
              onClick={() => handleSetTimeframe('tahunan')}
            >
              Tahunan
            </button>
          </div>

          {/* Dropdown Filter Tahun (Tampil jika mode Bulanan) */}
          {timeframe === 'bulanan' && (
            <select
              value={selectedYear}
              onChange={(e) => handleSetYear(e.target.value)}
              className="w-full sm:w-auto px-4 sm:px-5 py-2 sm:py-3 h-10 sm:h-12 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-extrabold text-slate-700 dark:text-slate-200 focus:outline-none focus:border-emerald-600 cursor-pointer shadow-xs"
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
