import React, { useState } from 'react';
import {
  TrendingUp,
  DollarSign,
  PieChart as PieChartIcon,
  BarChart3,
  Percent,
  Award,
  SlidersHorizontal,
  FileSpreadsheet,
  Building2,
  Users,
  ArrowUpRight,
  ShieldCheck,
  Zap,
  Calculator
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  Legend
} from 'recharts';
import { Partnership, PartnerCapitalContribution } from '../../types/partnership';
import { TTSButton } from '../common/TTSButton';

interface PartnershipPerformanceDashboardProps {
  partnership: Partnership;
  contributions: PartnerCapitalContribution[];
}

export const PartnershipPerformanceDashboard: React.FC<PartnershipPerformanceDashboardProps> = ({
  partnership,
  contributions
}) => {
  // Real-time Financial Parameters (Auto-synced from GL / Distribution Engine)
  const [totalNetProfitPKR, setTotalNetProfitPKR] = useState(120000000);
  const [simulatedStake, setSimulatedStake] = useState<Record<string, number>>(() => {
    const initialMap: Record<string, number> = {};
    partnership.partners.forEach(p => {
      initialMap[p.id] = p.agreedProfitSharePercent;
    });
    return initialMap;
  });

  const totalCapitalPKR = partnership.partners.reduce((sum, p) => sum + p.initialCapitalPKR, 0);

  // Per Partner Analytics Calculations
  const partnerAnalytics = partnership.partners.map(p => {
    const stakePercent = simulatedStake[p.id] ?? p.agreedProfitSharePercent;
    const allocatedProfitPKR = (totalNetProfitPKR * stakePercent) / 100;
    const monthlyRemunerationAnnual = p.classifications.includes('Managing Partner') ? 2160000 : 0;
    const totalPayoutPKR = allocatedProfitPKR + monthlyRemunerationAnnual;
    const roiPercent = p.initialCapitalPKR > 0 ? (totalPayoutPKR / p.initialCapitalPKR) * 100 : 0;

    return {
      partnerId: p.id,
      partnerName: p.fullName,
      cnic: p.cnicOrRegNo,
      role: p.classifications.join(', '),
      stakePercent,
      initialCapitalPKR: p.initialCapitalPKR,
      allocatedProfitPKR,
      monthlyRemunerationAnnual,
      totalPayoutPKR,
      roiPercent
    };
  });

  const totalSimulatedStakePercent = Object.values(simulatedStake).reduce((sum, v) => sum + v, 0);
  const avgRoiPercent = partnerAnalytics.reduce((sum, p) => sum + p.roiPercent, 0) / (partnerAnalytics.length || 1);

  // Recharts Data Prep: Stake vs Profit Share
  const chartStakeVsProfit = partnerAnalytics.map(p => ({
    name: p.partnerName,
    stake: p.stakePercent,
    allocatedProfitM: Number((p.allocatedProfitPKR / 1000000).toFixed(2)),
    capitalM: Number((p.initialCapitalPKR / 1000000).toFixed(2))
  }));

  // Recharts Data Prep: Cumulative Profit Distribution Trend
  const monthlyTrendData = [
    { month: 'Jul 25', totalProfit: 8000000, partnerShare: 4000000 },
    { month: 'Aug 25', totalProfit: 9500000, partnerShare: 4750000 },
    { month: 'Sep 25', totalProfit: 11000000, partnerShare: 5500000 },
    { month: 'Oct 25', totalProfit: 10500000, partnerShare: 5250000 },
    { month: 'Nov 25', totalProfit: 12000000, partnerShare: 6000000 },
    { month: 'Dec 25', totalProfit: 13500000, partnerShare: 6750000 },
    { month: 'Jan 26', totalProfit: 14000000, partnerShare: 7000000 },
    { month: 'Feb 26', totalProfit: 15500000, partnerShare: 7750000 },
    { month: 'Mar 26', totalProfit: 16000000, partnerShare: 8000000 },
    { month: 'Apr 26', totalProfit: 10000000, partnerShare: 5000000 }
  ];

  // Recharts Data Prep: Partner ROI % Comparison
  const roiComparisonData = partnerAnalytics.map(p => ({
    name: p.partnerName,
    roi: Number(p.roiPercent.toFixed(1))
  }));

  const handleSliderChange = (partnerId: string, val: number) => {
    setSimulatedStake(prev => ({
      ...prev,
      [partnerId]: val
    }));
  };

  const handleResetStake = () => {
    const initialMap: Record<string, number> = {};
    partnership.partners.forEach(p => {
      initialMap[p.id] = p.agreedProfitSharePercent;
    });
    setSimulatedStake(initialMap);
  };

  return (
    <div className="space-y-6">
      {/* Top Welcome Banner */}
      <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-slate-900 border border-purple-800/40 rounded-3xl p-6 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-emerald-500/20 border border-emerald-500/30 rounded-2xl text-emerald-300">
            <TrendingUp className="w-9 h-9" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-black text-white tracking-wide">
                Partnership Performance &amp; ROI Analytics
              </h1>
              <span className="px-3 py-1 bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-mono font-bold rounded-full">
                Real-Time Profit Distribution
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Live profit share calculations, return on investment (ROI %) analytics, and dynamic stake scenario simulator.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <TTSButton text={`Partnership Performance Dashboard for ${partnership.partnershipName}. Total Net Profit: PKR ${totalNetProfitPKR.toLocaleString()}. Average Partner Portfolio ROI: ${avgRoiPercent.toFixed(1)}%.`} />
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 transition cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>Export Analytics</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Net Distributable Profit */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2 shadow-xl hover:border-emerald-500/40 transition">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Distributable Profit</span>
            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-400">
            PKR {(totalNetProfitPKR / 1000000).toFixed(2)}M
          </div>
          <div className="text-[11px] text-slate-400 font-mono">
            {totalNetProfitPKR.toLocaleString()} PKR Available
          </div>
        </div>

        {/* Total Settled Capital */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2 shadow-xl hover:border-purple-500/40 transition">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Total Capital Invested</span>
            <div className="p-2 bg-purple-500/10 text-purple-400 rounded-xl">
              <Building2 className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-purple-300">
            PKR {(totalCapitalPKR / 1000000).toFixed(2)}M
          </div>
          <div className="text-[11px] text-slate-400 font-mono">
            {partnership.partners.length} Executing Partners
          </div>
        </div>

        {/* Average Portfolio ROI */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2 shadow-xl hover:border-cyan-500/40 transition">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Average Portfolio ROI</span>
            <div className="p-2 bg-cyan-500/10 text-cyan-400 rounded-xl">
              <Percent className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-cyan-300">
            {avgRoiPercent.toFixed(1)}%
          </div>
          <div className="text-[11px] text-slate-400 font-mono">
            Annualized Net Yield
          </div>
        </div>

        {/* Total Simulated Stake Validation */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2 shadow-xl hover:border-amber-500/40 transition">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Stake Split Status</span>
            <div className="p-2 bg-amber-500/10 text-amber-400 rounded-xl">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <div className={`text-2xl font-black ${totalSimulatedStakePercent === 100 ? 'text-emerald-400' : 'text-amber-400'}`}>
            {totalSimulatedStakePercent}%
          </div>
          <div className="text-[11px] text-slate-400 font-mono flex items-center justify-between">
            <span>{totalSimulatedStakePercent === 100 ? '100% Fully Allocated' : 'Imbalanced Split'}</span>
            {totalSimulatedStakePercent !== 100 && (
              <button
                onClick={handleResetStake}
                className="text-amber-400 hover:underline font-bold text-[10px] cursor-pointer"
              >
                Reset
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Visual Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Partner Stake % vs Allocated Profit (Bar Chart) */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wider">Allocated Profit vs Capital (Millions PKR)</h2>
              <p className="text-xs text-slate-400">Comparison of capital contributed against net profit payout.</p>
            </div>
            <span className="text-xs font-mono text-purple-400 bg-purple-950/60 border border-purple-800 px-3 py-1 rounded-xl">
              Profit Share
            </span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartStakeVsProfit} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={(v) => `PKR ${v}M`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff' }}
                  formatter={(val: any, name: any) => [
                    `PKR ${Number(val || 0).toLocaleString()}M`,
                    name === 'allocatedProfitM' ? 'Allocated Profit (M)' : 'Contributed Capital (M)'
                  ]}
                />
                <Legend />
                <Bar dataKey="capitalM" name="Capital (M)" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
                <Bar dataKey="allocatedProfitM" name="Profit (M)" fill="#10b981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Cumulative Monthly Profit Distribution Trend (Area Chart) */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wider">Monthly Cumulative Profit Distribution</h2>
              <p className="text-xs text-slate-400">Financial year monthly profit trend analysis.</p>
            </div>
            <span className="text-xs font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-3 py-1 rounded-xl">
              Monthly Growth
            </span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyTrendData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                <defs>
                  <linearGradient id="profitGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff' }}
                  formatter={(val: any) => [`PKR ${Number(val || 0).toLocaleString()}`, 'Net Monthly Profit']}
                />
                <Area type="monotone" dataKey="totalProfit" stroke="#10b981" fillOpacity={1} fill="url(#profitGrad)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Live Stake Scenario Simulator & Partner ROI Cards Grid */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-purple-400" /> Interactive Partner ROI &amp; Stake Simulator
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">Adjust partner stake % sliders to run real-time scenario simulation on payouts and ROI.</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleResetStake}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono font-bold text-xs rounded-xl border border-slate-700 transition cursor-pointer"
            >
              Reset Default Stake %
            </button>
          </div>
        </div>

        {/* Partner Analytics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {partnerAnalytics.map((p) => (
            <div key={p.partnerId} className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-4 hover:border-purple-500/40 transition shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-100">{p.partnerName}</h3>
                  <p className="text-[10px] text-slate-400 font-mono">CNIC: {p.cnic}</p>
                </div>
                <span className="px-2.5 py-1 bg-purple-500/20 text-purple-300 font-mono font-bold text-xs rounded-full border border-purple-500/30">
                  {p.stakePercent}% Stake
                </span>
              </div>

              {/* Stake Percentage Slider */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-[11px] font-mono text-slate-400">
                  <span>Simulate Stake %:</span>
                  <span className="text-purple-300 font-bold">{p.stakePercent}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={1}
                  value={p.stakePercent}
                  onChange={(e) => handleSliderChange(p.partnerId, Number(e.target.value))}
                  className="w-full accent-purple-500 cursor-pointer"
                />
              </div>

              {/* Payout & ROI Breakdown */}
              <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800/80 space-y-2 font-mono text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Capital Invested:</span>
                  <span className="text-slate-200">PKR {p.initialCapitalPKR.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Allocated Profit Share:</span>
                  <span className="text-emerald-400 font-bold">PKR {p.allocatedProfitPKR.toLocaleString()}</span>
                </div>
                {p.monthlyRemunerationAnnual > 0 && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Annual Remuneration:</span>
                    <span className="text-cyan-400">PKR {p.monthlyRemunerationAnnual.toLocaleString()}</span>
                  </div>
                )}
                <div className="border-t border-slate-800 pt-1.5 flex justify-between">
                  <span className="text-slate-400 font-bold">Total Net Payout:</span>
                  <span className="text-emerald-300 font-bold">PKR {p.totalPayoutPKR.toLocaleString()}</span>
                </div>
                <div className="flex justify-between bg-purple-950/40 p-2 rounded-lg border border-purple-800/50">
                  <span className="text-purple-300 font-bold">Calculated ROI:</span>
                  <span className="text-purple-300 font-bold">{p.roiPercent.toFixed(1)}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
