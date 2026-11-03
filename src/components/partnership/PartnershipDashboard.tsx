import React from 'react';
import {
  Users,
  DollarSign,
  TrendingUp,
  FileCheck,
  Building2,
  PieChart as PieChartIcon,
  Plus,
  ArrowUpRight,
  ShieldCheck,
  Scale
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { Partnership, PartnerCapitalContribution } from '../../types/partnership';
import { TTSButton } from '../common/TTSButton';

interface PartnershipDashboardProps {
  partnerships: Partnership[];
  contributions: PartnerCapitalContribution[];
  onNavigateTab: (tab: 'register' | 'capital' | 'profit' | 'deed' | 'payments') => void;
}

const COLORS = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ec4899', '#6366f1'];

export const PartnershipDashboard: React.FC<PartnershipDashboardProps> = ({
  partnerships,
  contributions,
  onNavigateTab
}) => {
  const activePartnerships = partnerships.filter(p => p.status === 'ACTIVE');
  const totalPartners = partnerships.reduce((sum, p) => sum + p.partners.length, 0);

  const totalCapitalPKR = contributions
    .filter(c => c.approvalStatus === 'APPROVED')
    .reduce((sum, c) => sum + c.agreedValuationPKR, 0);

  const pendingCapitalCount = contributions.filter(c => c.approvalStatus === 'PENDING').length;

  // Prepare chart data: Partner Capital Share
  const partnerCapitalData = partnerships.flatMap(p =>
    p.partners.map(partner => ({
      name: partner.fullName,
      capital: partner.initialCapitalPKR,
      profitShare: partner.agreedProfitSharePercent,
      partnership: p.partnershipName
    }))
  );

  // Contribution Types Data
  const contributionTypeMap: Record<string, number> = {};
  contributions.forEach(c => {
    contributionTypeMap[c.contributionType] = (contributionTypeMap[c.contributionType] || 0) + c.agreedValuationPKR;
  });

  const contributionTypeData = Object.entries(contributionTypeMap).map(([name, value]) => ({
    name,
    value
  }));

  return (
    <div className="space-y-6">
      {/* Top Welcome Banner */}
      <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-slate-900 border border-purple-800/40 rounded-3xl p-6 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-purple-500/20 border border-purple-500/30 rounded-2xl text-purple-300">
            <Scale className="w-9 h-9" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-black text-white tracking-wide">
                Partnership &amp; Joint Venture Hub
              </h1>
              <span className="px-3 py-1 bg-purple-500/20 border border-purple-500/30 text-purple-300 text-xs font-mono font-bold rounded-full">
                SECP &amp; FBR Compliant
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Multi-Partner Capital Management, Profit Allocation, Legal Deed Generation, and Ledger Reconciliation.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <TTSButton text={`Partnership Hub Dashboard. Total ${activePartnerships.length} active partnerships with ${totalPartners} partners and PKR ${totalCapitalPKR.toLocaleString()} in capital.`} />
          <button
            onClick={() => onNavigateTab('register')}
            className="flex items-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-purple-600/30 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Partnership / JV</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Active Partnerships */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2 shadow-xl hover:border-purple-500/40 transition">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Active Entities</span>
            <div className="p-2 bg-purple-500/10 text-purple-400 rounded-xl">
              <Building2 className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-white">{activePartnerships.length}</div>
          <div className="text-[11px] text-slate-400 font-mono flex items-center justify-between">
            <span>Total Registered: {partnerships.length}</span>
            <span className="text-emerald-400 font-bold">{totalPartners} Partners</span>
          </div>
        </div>

        {/* Total Capital */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2 shadow-xl hover:border-cyan-500/40 transition">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Total Agreed Capital</span>
            <div className="p-2 bg-cyan-500/10 text-cyan-400 rounded-xl">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-cyan-400">
            PKR {(totalCapitalPKR / 1000000).toFixed(2)}M
          </div>
          <div className="text-[11px] text-slate-400 font-mono">
            {totalCapitalPKR.toLocaleString()} PKR Settled
          </div>
        </div>

        {/* Pending Capital Verification */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2 shadow-xl hover:border-amber-500/40 transition">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Capital Approvals</span>
            <div className="p-2 bg-amber-500/10 text-amber-400 rounded-xl">
              <FileCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-400">{pendingCapitalCount}</div>
          <div className="text-[11px] text-slate-400 font-mono flex items-center justify-between">
            <span>Pending Valuation</span>
            <button
              onClick={() => onNavigateTab('capital')}
              className="text-amber-400 hover:underline font-bold flex items-center gap-0.5 cursor-pointer"
            >
              Verify <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Profit Engine Status */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2 shadow-xl hover:border-emerald-500/40 transition">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">GL Net Profit Engine</span>
            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-400">100% Validated</div>
          <div className="text-[11px] text-slate-400 font-mono flex items-center justify-between">
            <span>Auto GL Journal Posting</span>
            <button
              onClick={() => onNavigateTab('profit')}
              className="text-emerald-400 hover:underline font-bold flex items-center gap-0.5 cursor-pointer"
            >
              Run Calculation <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Visual Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Capital Contribution by Partner */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wider">Partner Capital Holdings</h2>
              <p className="text-xs text-slate-400">Individual partner capital valuation in PKR.</p>
            </div>
            <span className="text-xs font-mono text-purple-400 bg-purple-950/60 border border-purple-800 px-3 py-1 rounded-xl">
              Capital Ledger
            </span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={partnerCapitalData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff' }}
                  formatter={(val: any) => [`PKR ${Number(val || 0).toLocaleString()}`, 'Capital Valuation']}
                />
                <Bar dataKey="capital" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Contribution Types Breakdown */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wider">Contribution Asset Mix</h2>
              <p className="text-xs text-slate-400">Distribution between Cash, Machinery, Land &amp; Services.</p>
            </div>
            <span className="text-xs font-mono text-cyan-400 bg-cyan-950/60 border border-cyan-800 px-3 py-1 rounded-xl">
              Asset Types
            </span>
          </div>

          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={contributionTypeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }: { name?: string; percent?: number }) => `${name} (${((percent || 0) * 100).toFixed(0)}%)`}
                >
                  {contributionTypeData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff' }}
                  formatter={(val: any) => [`PKR ${Number(val || 0).toLocaleString()}`, 'Valuation']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Active Partnerships Master Summary Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wider">Registered Partnerships &amp; Joint Ventures</h2>
            <p className="text-xs text-slate-400">Master overview of active legal entities, partner shares, and banking details.</p>
          </div>
          <button
            onClick={() => onNavigateTab('register')}
            className="text-xs text-purple-400 hover:text-purple-300 font-bold flex items-center gap-1 cursor-pointer"
          >
            Manage Entities <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase font-mono text-[10px]">
              <tr>
                <th className="p-3 rounded-l-xl">Code &amp; Name</th>
                <th className="p-3">Type &amp; Category</th>
                <th className="p-3">Partners</th>
                <th className="p-3">Agreed Capital</th>
                <th className="p-3">Bank Details</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right rounded-r-xl">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {partnerships.map((p) => {
                const pCapital = p.partners.reduce((sum, partner) => sum + partner.initialCapitalPKR, 0);
                return (
                  <tr key={p.id} className="hover:bg-slate-800/40 transition">
                    <td className="p-3">
                      <div className="font-bold text-slate-100">{p.partnershipName}</div>
                      <div className="text-[10px] text-slate-500 font-mono">{p.partnershipCode} • Reg: {p.registrationNumber}</div>
                    </td>
                    <td className="p-3">
                      <div className="text-slate-200">{p.partnershipType}</div>
                      <div className="text-[10px] text-slate-400">{p.businessCategory}</div>
                    </td>
                    <td className="p-3 font-mono">
                      <div className="flex items-center gap-1 text-slate-200">
                        <Users className="w-3.5 h-3.5 text-purple-400" />
                        <span>{p.partners.length} Partners</span>
                      </div>
                      <div className="text-[10px] text-slate-500 truncate max-w-[150px]">
                        {p.partners.map(x => x.fullName).join(', ')}
                      </div>
                    </td>
                    <td className="p-3 font-mono font-bold text-cyan-400">
                      PKR {pCapital.toLocaleString()}
                    </td>
                    <td className="p-3 font-mono text-[11px]">
                      <div className="text-slate-200">{p.bankAccountDetails.bankName}</div>
                      <div className="text-[10px] text-slate-500">{p.bankAccountDetails.iban}</div>
                    </td>
                    <td className="p-3">
                      <span className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-300 font-bold text-[10px] rounded-full border border-emerald-500/30">
                        {p.status}
                      </span>
                    </td>
                    <td className="p-3 text-right space-x-2">
                      <button
                        onClick={() => onNavigateTab('deed')}
                        className="px-2.5 py-1 bg-purple-600/30 hover:bg-purple-600/50 text-purple-300 font-bold text-[11px] rounded-lg border border-purple-500/40 cursor-pointer"
                      >
                        Legal Deed
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
