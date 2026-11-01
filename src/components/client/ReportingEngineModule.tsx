import React, { useState } from 'react';
import { BarChart3, Download, Printer, Filter, Calendar, FileText } from 'lucide-react';
import { useAuthTenant } from '../../context/AuthTenantContext';
import { INITIAL_ACCOUNTS, INITIAL_INVENTORY } from '../../services/mockData';
import { TTSButton } from '../common/TTSButton';

export const ReportingEngineModule: React.FC = () => {
  const { currentCompany } = useAuthTenant();
  const [selectedReport, setSelectedReport] = useState<'trial' | 'pnl' | 'balance' | 'stock'>('pnl');

  const reportSpeech = `Universal Reporting Engine for ${currentCompany.name}. Generating real-time Profit and Loss statement, Trial Balance, and Stock Valuation reports in Pakistan Rupees.`;

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl font-black text-slate-100 flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-cyan-400" />
            Universal Financial & Operational Reporting Engine
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time Profit & Loss (P&L), Trial Balance, Balance Sheet, Stock Ledger, Customer/Supplier Aging, and FBR Tax Registers.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <TTSButton text={reportSpeech} label="Report Voice Readout" />
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold"
          >
            <Printer className="w-4 h-4 text-cyan-400" /> Print Report PDF
          </button>
        </div>
      </div>

      {/* Report Switcher Pills */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-2 text-xs font-bold">
        <button
          onClick={() => setSelectedReport('pnl')}
          className={`px-3.5 py-1.5 rounded-lg transition-all ${selectedReport === 'pnl' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-slate-200 bg-slate-800/60'}`}
        >
          Profit & Loss Statement (P&L)
        </button>
        <button
          onClick={() => setSelectedReport('trial')}
          className={`px-3.5 py-1.5 rounded-lg transition-all ${selectedReport === 'trial' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-slate-200 bg-slate-800/60'}`}
        >
          Trial Balance
        </button>
        <button
          onClick={() => setSelectedReport('balance')}
          className={`px-3.5 py-1.5 rounded-lg transition-all ${selectedReport === 'balance' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-slate-200 bg-slate-800/60'}`}
        >
          Balance Sheet
        </button>
        <button
          onClick={() => setSelectedReport('stock')}
          className={`px-3.5 py-1.5 rounded-lg transition-all ${selectedReport === 'stock' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-slate-200 bg-slate-800/60'}`}
        >
          Stock Valuation Report
        </button>
      </div>

      {/* Profit & Loss Statement View */}
      {selectedReport === 'pnl' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl max-w-3xl mx-auto space-y-6">
          <div className="text-center border-b border-slate-800 pb-4 space-y-1">
            <h2 className="text-base font-black text-slate-100 uppercase tracking-wide">{currentCompany.name}</h2>
            <div className="text-xs text-cyan-400 font-bold">PROFIT & LOSS STATEMENT</div>
            <div className="text-[11px] text-slate-400 font-mono">For Financial Period Ending October 31, 2026 (Currency: PKR)</div>
          </div>

          <div className="space-y-4 text-xs font-mono">
            {/* Operating Revenue */}
            <div className="space-y-2">
              <div className="font-bold text-slate-200 text-sm uppercase tracking-wider border-b border-slate-800 pb-1 flex justify-between">
                <span>1. Operating Revenue</span>
                <span className="text-emerald-400">Rs. 148,000,000</span>
              </div>
              <div className="flex justify-between text-slate-300 pl-4">
                <span>Gross Sales Revenue (NTN Taxed)</span>
                <span>Rs. 148,000,000</span>
              </div>
            </div>

            {/* Direct Cost of Sales */}
            <div className="space-y-2">
              <div className="font-bold text-slate-200 text-sm uppercase tracking-wider border-b border-slate-800 pb-1 flex justify-between">
                <span>2. Cost of Goods Sold (COGS)</span>
                <span className="text-rose-400">(Rs. 89,000,000)</span>
              </div>
              <div className="flex justify-between text-slate-300 pl-4">
                <span>Raw Materials & Factory Consumption</span>
                <span>(Rs. 89,000,000)</span>
              </div>
            </div>

            {/* Gross Profit */}
            <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 flex justify-between font-bold text-sm text-slate-100">
              <span>GROSS PROFIT</span>
              <span className="text-emerald-400">Rs. 59,000,000</span>
            </div>

            {/* Operating Expenses */}
            <div className="space-y-2">
              <div className="font-bold text-slate-200 text-sm uppercase tracking-wider border-b border-slate-800 pb-1 flex justify-between">
                <span>3. Operating & Administrative Expenses</span>
                <span className="text-rose-400">(Rs. 12,400,000)</span>
              </div>
              <div className="flex justify-between text-slate-300 pl-4">
                <span>Salaries & Factory Payroll</span>
                <span>(Rs. 12,400,000)</span>
              </div>
            </div>

            {/* Net Profit Before Tax */}
            <div className="p-4 rounded-xl bg-cyan-950/60 border border-cyan-500/40 flex justify-between font-black text-base text-slate-100">
              <span>NET OPERATING PROFIT BEFORE TAX</span>
              <span className="text-cyan-300">Rs. 46,600,000</span>
            </div>
          </div>
        </div>
      )}

      {/* Trial Balance View */}
      {selectedReport === 'trial' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl max-w-3xl mx-auto space-y-4">
          <div className="text-center border-b border-slate-800 pb-3">
            <h2 className="text-base font-black text-slate-100 uppercase">{currentCompany.name}</h2>
            <div className="text-xs text-cyan-400 font-bold">BALANCED TRIAL BALANCE</div>
          </div>

          <table className="w-full text-xs font-mono text-left border-collapse">
            <thead>
              <tr className="bg-slate-800 text-slate-300 border-b border-slate-700 uppercase font-bold">
                <th className="p-2">Code</th>
                <th className="p-2">Account Head</th>
                <th className="p-2 text-right">Debit (PKR)</th>
                <th className="p-2 text-right">Credit (PKR)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {INITIAL_ACCOUNTS.map((acc) => (
                <tr key={acc.id} className="hover:bg-slate-800/40">
                  <td className="p-2 text-cyan-400 font-bold">{acc.code}</td>
                  <td className="p-2 text-slate-200">{acc.name}</td>
                  <td className="p-2 text-right text-emerald-400">{acc.type === 'ASSET' || acc.type === 'EXPENSE' ? `Rs. ${acc.balance.toLocaleString()}` : '-'}</td>
                  <td className="p-2 text-right text-cyan-400">{acc.type === 'LIABILITY' || acc.type === 'EQUITY' || acc.type === 'REVENUE' ? `Rs. ${acc.balance.toLocaleString()}` : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
