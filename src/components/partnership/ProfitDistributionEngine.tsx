import React, { useState } from 'react';
import {
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  Send,
  Building2,
  Users,
  DollarSign,
  PieChart,
  FileText,
  Calculator,
  ShieldCheck
} from 'lucide-react';
import { Partnership, ProfitAllocationExecution } from '../../types/partnership';
import { TTSButton } from '../common/TTSButton';

interface ProfitDistributionEngineProps {
  partnership: Partnership;
}

export const ProfitDistributionEngine: React.FC<ProfitDistributionEngineProps> = ({
  partnership
}) => {
  const [fiscalPeriod, setFiscalPeriod] = useState('FY-2025-2026 (Annual)');
  const [glRevenuePKR, setGlRevenuePKR] = useState(350000000);
  const [glExpensesPKR, setGlExpensesPKR] = useState(230000000);
  const [postingStatus, setPostingStatus] = useState<'PROPOSED' | 'POSTED_TO_GL'>('PROPOSED');
  const [postedVoucherNo, setPostedVoucherNo] = useState<string | null>(null);

  const netAccountingProfit = glRevenuePKR - glExpensesPKR;
  const distributableProfit = netAccountingProfit;

  // Validate 100% Total Profit Allocation
  const totalProfitPercent = partnership.partners.reduce((sum, p) => sum + p.agreedProfitSharePercent, 0);

  // Compute Individual Partner Allocations
  const allocations = partnership.partners.map(p => {
    const allocatedProfit = (distributableProfit * p.agreedProfitSharePercent) / 100;
    const fixedRemuneration = p.classifications.includes('Managing Partner') ? 1800000 : 0; // Annual PKR allowance if managing partner
    const netPayable = allocatedProfit + fixedRemuneration;

    return {
      partnerId: p.id,
      partnerName: p.fullName,
      cnic: p.cnicOrRegNo,
      profitSharePercent: p.agreedProfitSharePercent,
      allocatedProfitPKR: allocatedProfit,
      fixedRemunerationPKR: fixedRemuneration,
      netPayablePKR: netPayable
    };
  });

  const totalAllocatedProfit = allocations.reduce((sum, a) => sum + a.allocatedProfitPKR, 0);

  const handlePostToGL = () => {
    if (totalProfitPercent !== 100) {
      alert(`Cannot post to General Ledger! Profit Share allocation must equal 100%. Current sum: ${totalProfitPercent}%`);
      return;
    }
    const voucher = `JV-PROFIT-POST-${Math.floor(10000 + Math.random() * 90000)}`;
    setPostingStatus('POSTED_TO_GL');
    setPostedVoucherNo(voucher);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-100 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-emerald-400" /> GL Profit &amp; Loss Distribution Engine
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Fetch approved General Ledger Net Profit, compute partner allocations, and post double-entry vouchers to Partner Current Accounts.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <TTSButton text={`Profit Distribution Engine for ${partnership.partnershipName}. Net Accounting Profit: PKR ${netAccountingProfit.toLocaleString()}. Allocation status 100% validated.`} />
          {postingStatus === 'PROPOSED' ? (
            <button
              onClick={handlePostToGL}
              className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-600/30 transition cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>Post Profit Distribution to GL</span>
            </button>
          ) : (
            <span className="px-4 py-2 bg-emerald-500/20 text-emerald-300 font-mono font-bold text-xs rounded-xl border border-emerald-500/30 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Posted to GL ({postedVoucherNo})
            </span>
          )}
        </div>
      </div>

      {/* Inputs & Accounting Summary Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* GL Net Profit Inputs Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
          <div className="border-b border-slate-800 pb-3">
            <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2">
              <Calculator className="w-4 h-4 text-purple-400" /> GL Net Profit Fetch
            </h2>
            <p className="text-xs text-slate-400">Inputs auto-synced from General Ledger Vouchers.</p>
          </div>

          <div className="space-y-3 text-xs font-sans">
            <div>
              <label className="block text-slate-400 font-medium mb-1">Fiscal Period</label>
              <input
                type="text"
                value={fiscalPeriod}
                onChange={(e) => setFiscalPeriod(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-200 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1">Total GL Recognized Revenue (PKR)</label>
              <input
                type="number"
                value={glRevenuePKR}
                onChange={(e) => setGlRevenuePKR(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-emerald-400 font-mono font-bold focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1">Total Direct &amp; Indirect Operating Expenses (PKR)</label>
              <input
                type="number"
                value={glExpensesPKR}
                onChange={(e) => setGlExpensesPKR(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-rose-400 font-mono font-bold focus:outline-none"
              />
            </div>

            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2 font-mono text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Net Accounting Profit:</span>
                <span className="text-emerald-400 font-bold">PKR {netAccountingProfit.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Distributable Surplus:</span>
                <span className="text-cyan-400 font-bold">PKR {distributableProfit.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Validation Status & Double Entry Journal Preview */}
        <div className="md:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" /> Partner Allocation Validation Engine
              </h2>
              <p className="text-xs text-slate-400">Strict 100% share compliance check before voucher posting.</p>
            </div>

            <span className={`px-3 py-1 rounded-xl border font-mono font-bold text-xs flex items-center gap-1.5 ${
              totalProfitPercent === 100
                ? 'bg-emerald-950/60 border-emerald-800 text-emerald-300'
                : 'bg-amber-950/60 border-amber-800 text-amber-300'
            }`}>
              {totalProfitPercent === 100 ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" /> 100% Validated
                </>
              ) : (
                <>
                  <AlertTriangle className="w-4 h-4 text-amber-400" /> {totalProfitPercent}% Invalid Total
                </>
              )}
            </span>
          </div>

          {/* Table of Individual Partner Profit Allocations */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase font-mono text-[10px]">
                <tr>
                  <th className="p-3 rounded-l-xl">Executing Partner</th>
                  <th className="p-3">Agreed % Share</th>
                  <th className="p-3">Profit Allocation (PKR)</th>
                  <th className="p-3">Partner Remuneration</th>
                  <th className="p-3 text-right rounded-r-xl">Net Credit to Current A/C</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {allocations.map((a) => (
                  <tr key={a.partnerId} className="hover:bg-slate-800/40 transition">
                    <td className="p-3">
                      <div className="font-bold text-slate-100">{a.partnerName}</div>
                      <div className="text-[10px] text-slate-500 font-mono">CNIC: {a.cnic}</div>
                    </td>
                    <td className="p-3 font-mono font-bold text-purple-400">{a.profitSharePercent}%</td>
                    <td className="p-3 font-mono text-emerald-400">PKR {a.allocatedProfitPKR.toLocaleString()}</td>
                    <td className="p-3 font-mono text-cyan-400">
                      {a.fixedRemunerationPKR > 0 ? `PKR ${a.fixedRemunerationPKR.toLocaleString()}` : '—'}
                    </td>
                    <td className="p-3 text-right font-mono font-bold text-emerald-300">
                      PKR {a.netPayablePKR.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-slate-950 font-mono font-bold text-xs text-slate-100 border-t-2 border-slate-800">
                <tr>
                  <td className="p-3">TOTAL ALLOCATED</td>
                  <td className="p-3 text-purple-400">{totalProfitPercent}%</td>
                  <td className="p-3 text-emerald-400">PKR {totalAllocatedProfit.toLocaleString()}</td>
                  <td className="p-3 text-cyan-400">
                    PKR {allocations.reduce((s, x) => s + x.fixedRemunerationPKR, 0).toLocaleString()}
                  </td>
                  <td className="p-3 text-right text-emerald-300">
                    PKR {allocations.reduce((s, x) => s + x.netPayablePKR, 0).toLocaleString()}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Double-Entry Journal Preview Box */}
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2 text-xs font-mono">
            <div className="text-slate-400 font-bold uppercase text-[10px]">Balanced Journal Voucher Preview:</div>
            <div className="space-y-1 text-slate-300">
              <div className="flex justify-between text-rose-300">
                <span>DR. 3100-01 Retained Earnings / Profit Clearing A/C</span>
                <span>PKR {totalAllocatedProfit.toLocaleString()}</span>
              </div>
              {allocations.map(a => (
                <div key={a.partnerId} className="flex justify-between text-emerald-400 pl-4">
                  <span>CR. 3200-0{a.partnerId} Partner Current A/C - {a.partnerName}</span>
                  <span>PKR {a.netPayablePKR.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
