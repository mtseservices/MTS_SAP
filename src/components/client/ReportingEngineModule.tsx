import React, { useState } from 'react';
import {
  BarChart3,
  Download,
  Printer,
  FileSpreadsheet,
  FileText,
  CheckCircle2,
  Building2,
  Calendar,
  Layers,
  ArrowDownToLine,
  ExternalLink
} from 'lucide-react';
import { useAuthTenant } from '../../context/AuthTenantContext';
import { INITIAL_ACCOUNTS, INITIAL_INVENTORY } from '../../services/mockData';
import { TTSButton } from '../common/TTSButton';

export const ReportingEngineModule: React.FC = () => {
  const { currentCompany } = useAuthTenant();
  const [selectedReport, setSelectedReport] = useState<'pnl' | 'trial' | 'balance' | 'stock'>('pnl');
  const [showPrintModal, setShowPrintModal] = useState(false);

  // Helper to trigger browser PDF print
  const handlePrintPdf = () => {
    window.print();
  };

  // Helper to export CSV report
  const handleExportCsv = () => {
    let csvContent = 'data:text/csv;charset=utf-8,';
    const timestamp = new Date().toISOString().split('T')[0];

    if (selectedReport === 'pnl') {
      csvContent += `Company Name,${currentCompany.name}\n`;
      csvContent += `Report,Profit and Loss Statement (PKR)\n`;
      csvContent += `Date,${timestamp}\n\n`;
      csvContent += `Category,Account Description,Amount (PKR)\n`;
      csvContent += `Revenue,Gross Sales Revenue (NTN Taxed),148000000\n`;
      csvContent += `Cost of Sales,Cost of Goods Sold (COGS),-89000000\n`;
      csvContent += `Gross Profit,Operating Gross Profit,59000000\n`;
      csvContent += `Expenses,Salaries & Factory Payroll,-12400000\n`;
      csvContent += `Net Profit,Net Operating Profit Before Tax,46600000\n`;
    } else if (selectedReport === 'trial') {
      csvContent += `Company Name,${currentCompany.name}\n`;
      csvContent += `Report,Balanced Trial Balance (PKR)\n`;
      csvContent += `Date,${timestamp}\n\n`;
      csvContent += `Account Code,Account Name,Category,Debit (PKR),Credit (PKR)\n`;
      INITIAL_ACCOUNTS.forEach((acc) => {
        const isDebit = acc.type === 'ASSET' || acc.type === 'EXPENSE';
        const debit = isDebit ? acc.balance : 0;
        const credit = !isDebit ? acc.balance : 0;
        csvContent += `"${acc.code}","${acc.name}","${acc.category}",${debit},${credit}\n`;
      });
    } else if (selectedReport === 'stock') {
      csvContent += `Company Name,${currentCompany.name}\n`;
      csvContent += `Report,Warehouse Stock Valuation Report\n`;
      csvContent += `Date,${timestamp}\n\n`;
      csvContent += `Item Code,Item Name,Category,Quantity,UOM,Unit Purchase Cost (PKR),Total Valuation (PKR)\n`;
      INITIAL_INVENTORY.forEach((item) => {
        const totalVal = item.currentStock * item.purchasePrice;
        csvContent += `"${item.code}","${item.name}","${item.category}",${item.currentStock},"${item.uom}",${item.purchasePrice},${totalVal}\n`;
      });
    } else {
      csvContent += `Company Name,${currentCompany.name}\n`;
      csvContent += `Report,Balance Sheet Statement\n`;
      csvContent += `Date,${timestamp}\n\n`;
      csvContent += `Asset/Liability Head,Amount (PKR)\n`;
      csvContent += `Total Current & Fixed Assets,104800000\n`;
      csvContent += `Total Liabilities,11250000\n`;
      csvContent += `Shareholders Equity,93550000\n`;
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${currentCompany.slug}_${selectedReport}_report_${timestamp}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const reportSpeech = `Universal Reporting Engine for ${currentCompany.name}. Selected report: ${selectedReport.toUpperCase()}. Real-time PDF print and CSV export supported.`;

  return (
    <div className="p-6 space-y-6">
      {/* Print-Only Custom CSS Styles */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-report-area, #printable-report-area * {
            visibility: visible;
          }
          #printable-report-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            background: white !important;
            color: black !important;
            padding: 20px;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      {/* Screen Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4 no-print">
        <div>
          <h1 className="text-xl font-black text-slate-100 flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-cyan-400" />
            Universal Financial & Operational Reporting Engine
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time Profit & Loss (P&L), Trial Balance, Balance Sheet, Stock Ledger, and FBR Tax Statements.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <TTSButton text={reportSpeech} label="Report Voice Readout" />
          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-all"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" /> Export CSV
          </button>
          <button
            onClick={() => setShowPrintModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-lg shadow-cyan-600/30 transition-all"
          >
            <Printer className="w-4 h-4" /> Print / Export PDF
          </button>
        </div>
      </div>

      {/* Report Switcher Pills */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-2 text-xs font-bold no-print">
        <button
          onClick={() => setSelectedReport('pnl')}
          className={`px-3.5 py-1.5 rounded-lg transition-all ${
            selectedReport === 'pnl' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-slate-200 bg-slate-800/60'
          }`}
        >
          Profit & Loss Statement (P&L)
        </button>
        <button
          onClick={() => setSelectedReport('trial')}
          className={`px-3.5 py-1.5 rounded-lg transition-all ${
            selectedReport === 'trial' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-slate-200 bg-slate-800/60'
          }`}
        >
          Trial Balance
        </button>
        <button
          onClick={() => setSelectedReport('balance')}
          className={`px-3.5 py-1.5 rounded-lg transition-all ${
            selectedReport === 'balance' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-slate-200 bg-slate-800/60'
          }`}
        >
          Balance Sheet
        </button>
        <button
          onClick={() => setSelectedReport('stock')}
          className={`px-3.5 py-1.5 rounded-lg transition-all ${
            selectedReport === 'stock' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-slate-200 bg-slate-800/60'
          }`}
        >
          Stock Valuation Report
        </button>
      </div>

      {/* Printable Report Display Container */}
      <div id="printable-report-area" className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl max-w-4xl mx-auto space-y-6">
        {/* Printable Header */}
        <div className="text-center border-b border-slate-800 pb-4 space-y-1">
          <div className="flex items-center justify-between border-b pb-2 mb-2 border-slate-800/50">
            <div className="text-left">
              <h2 className="text-lg font-black text-slate-100 uppercase tracking-wide">{currentCompany.name}</h2>
              <p className="text-xs text-slate-400">{currentCompany.registeredName}</p>
            </div>
            <div className="text-right text-xs font-mono text-slate-400 space-y-0.5">
              <div>FBR NTN: <strong className="text-cyan-400">{currentCompany.ntn}</strong></div>
              <div>FBR STRN: <strong className="text-cyan-400">{currentCompany.strn}</strong></div>
            </div>
          </div>

          <div className="text-xs text-cyan-400 font-bold uppercase tracking-wider text-sm">
            {selectedReport === 'pnl' && 'OFFICIAL PROFIT & LOSS STATEMENT'}
            {selectedReport === 'trial' && 'BALANCED TRIAL BALANCE STATEMENT'}
            {selectedReport === 'balance' && 'FINANCIAL BALANCE SHEET STATEMENT'}
            {selectedReport === 'stock' && 'WAREHOUSE STOCK VALUATION REPORT'}
          </div>
          <div className="text-[11px] text-slate-400 font-mono">
            Generated on {new Date().toLocaleDateString('en-PK', { year: 'numeric', month: 'long', day: 'numeric' })} • Currency: PKR
          </div>
        </div>

        {/* 1. Profit & Loss Statement */}
        {selectedReport === 'pnl' && (
          <div className="space-y-4 text-xs font-mono">
            <div className="space-y-2">
              <div className="font-bold text-slate-200 text-sm uppercase tracking-wider border-b border-slate-800 pb-1 flex justify-between">
                <span>1. Operating Gross Revenue</span>
                <span className="text-emerald-400">Rs. 148,000,000</span>
              </div>
              <div className="flex justify-between text-slate-300 pl-4">
                <span>Commercial Gross Sales Revenue (NTN Taxed)</span>
                <span>Rs. 148,000,000</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="font-bold text-slate-200 text-sm uppercase tracking-wider border-b border-slate-800 pb-1 flex justify-between">
                <span>2. Cost of Goods Sold (COGS)</span>
                <span className="text-rose-400">(Rs. 89,000,000)</span>
              </div>
              <div className="flex justify-between text-slate-300 pl-4">
                <span>Raw Material & Direct Plant Cost</span>
                <span>(Rs. 89,000,000)</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 flex justify-between font-bold text-sm text-slate-100">
              <span>GROSS PROFIT</span>
              <span className="text-emerald-400">Rs. 59,000,000</span>
            </div>

            <div className="space-y-2">
              <div className="font-bold text-slate-200 text-sm uppercase tracking-wider border-b border-slate-800 pb-1 flex justify-between">
                <span>3. Operating & Administrative Expenses</span>
                <span className="text-rose-400">(Rs. 12,400,000)</span>
              </div>
              <div className="flex justify-between text-slate-300 pl-4">
                <span>Salaries, Factory Payroll & Utilities</span>
                <span>(Rs. 12,400,000)</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-cyan-950/60 border border-cyan-500/40 flex justify-between font-black text-base text-slate-100">
              <span>NET OPERATING PROFIT BEFORE TAX</span>
              <span className="text-cyan-300">Rs. 46,600,000</span>
            </div>
          </div>
        )}

        {/* 2. Trial Balance */}
        {selectedReport === 'trial' && (
          <div className="space-y-4">
            <table className="w-full text-xs font-mono text-left border-collapse border border-slate-800">
              <thead>
                <tr className="bg-slate-800 text-slate-300 border-b border-slate-700 uppercase font-bold">
                  <th className="p-2 border border-slate-800">Code</th>
                  <th className="p-2 border border-slate-800">Account Head Description</th>
                  <th className="p-2 border border-slate-800 text-right">Debit (PKR)</th>
                  <th className="p-2 border border-slate-800 text-right">Credit (PKR)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {INITIAL_ACCOUNTS.map((acc) => {
                  const isDebit = acc.type === 'ASSET' || acc.type === 'EXPENSE';
                  return (
                    <tr key={acc.id} className="hover:bg-slate-800/40">
                      <td className="p-2 border border-slate-800/60 text-cyan-400 font-bold">{acc.code}</td>
                      <td className="p-2 border border-slate-800/60 text-slate-200">{acc.name}</td>
                      <td className="p-2 border border-slate-800/60 text-right text-emerald-400">
                        {isDebit ? `Rs. ${acc.balance.toLocaleString()}` : '-'}
                      </td>
                      <td className="p-2 border border-slate-800/60 text-right text-cyan-400">
                        {!isDebit ? `Rs. ${acc.balance.toLocaleString()}` : '-'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* 3. Balance Sheet */}
        {selectedReport === 'balance' && (
          <div className="space-y-6 text-xs font-mono">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Assets Column */}
              <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700 space-y-3">
                <h3 className="font-bold text-sm text-cyan-400 uppercase border-b pb-1 border-slate-700">Assets</h3>
                <div className="flex justify-between"><span>Cash in Hand (PKR):</span><span>Rs. 4,500,000</span></div>
                <div className="flex justify-between"><span>Bank Operations Account:</span><span>Rs. 28,400,000</span></div>
                <div className="flex justify-between"><span>Accounts Receivable:</span><span>Rs. 14,200,000</span></div>
                <div className="flex justify-between"><span>Finished Goods Stock:</span><span>Rs. 32,500,000</span></div>
                <div className="flex justify-between"><span>Raw Material Inventory:</span><span>Rs. 18,600,000</span></div>
                <div className="pt-2 border-t border-slate-700 font-bold text-emerald-400 flex justify-between">
                  <span>TOTAL ASSETS:</span>
                  <span>Rs. 98,200,000</span>
                </div>
              </div>

              {/* Liabilities & Equity */}
              <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700 space-y-3">
                <h3 className="font-bold text-sm text-purple-400 uppercase border-b pb-1 border-slate-700">Liabilities & Equity</h3>
                <div className="flex justify-between"><span>Accounts Payable (Vendors):</span><span>Rs. 9,400,000</span></div>
                <div className="flex justify-between"><span>Withholding Tax Payable:</span><span>Rs. 1,850,000</span></div>
                <div className="flex justify-between font-semibold text-slate-200"><span>Paid Up Capital:</span><span>Rs. 80,000,000</span></div>
                <div className="flex justify-between font-semibold text-cyan-300"><span>Retained Earnings:</span><span>Rs. 6,950,000</span></div>
                <div className="pt-2 border-t border-slate-700 font-bold text-purple-400 flex justify-between">
                  <span>TOTAL LIABILITIES & EQUITY:</span>
                  <span>Rs. 98,200,000</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 4. Stock Valuation Report */}
        {selectedReport === 'stock' && (
          <div className="space-y-4">
            <table className="w-full text-xs font-mono text-left border-collapse border border-slate-800">
              <thead>
                <tr className="bg-slate-800 text-slate-300 border-b border-slate-700 uppercase font-bold">
                  <th className="p-2 border border-slate-800">Item Code</th>
                  <th className="p-2 border border-slate-800">Description</th>
                  <th className="p-2 border border-slate-800 text-right">Available Qty</th>
                  <th className="p-2 border border-slate-800 text-right">Unit Cost</th>
                  <th className="p-2 border border-slate-800 text-right">Stock Valuation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {INITIAL_INVENTORY.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-800/40">
                    <td className="p-2 border border-slate-800/60 text-purple-400 font-bold">{item.code}</td>
                    <td className="p-2 border border-slate-800/60 text-slate-200">{item.name}</td>
                    <td className="p-2 border border-slate-800/60 text-right font-bold text-emerald-400">{item.currentStock} {item.uom}</td>
                    <td className="p-2 border border-slate-800/60 text-right text-slate-300">Rs. {item.purchasePrice.toLocaleString()}</td>
                    <td className="p-2 border border-slate-800/60 text-right font-bold text-cyan-400">Rs. {(item.currentStock * item.purchasePrice).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Printable Authorizations & Signatures */}
        <div className="pt-8 border-t border-slate-800 grid grid-cols-3 gap-4 text-center font-mono text-[11px] text-slate-400">
          <div>
            <div className="border-b border-slate-700 pb-8"></div>
            <div className="mt-1 font-semibold text-slate-300">Prepared By</div>
            <div className="text-[10px]">Chief Accountant</div>
          </div>
          <div>
            <div className="border-b border-slate-700 pb-8"></div>
            <div className="mt-1 font-semibold text-slate-300">Reviewed By</div>
            <div className="text-[10px]">Internal Auditor</div>
          </div>
          <div>
            <div className="border-b border-slate-700 pb-8"></div>
            <div className="mt-1 font-semibold text-slate-300">Approved By</div>
            <div className="text-[10px]">Chief Financial Officer</div>
          </div>
        </div>

        {/* Official Footer */}
        <div className="text-center text-[10px] text-slate-500 font-mono pt-2">
          Generated automatically by MTS-ERP-SAP • FBR Compliant Double-Entry System
        </div>
      </div>

      {/* Print PDF Confirmation Modal */}
      {showPrintModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 no-print">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
              <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                <Printer className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-100 uppercase">Export Report to PDF</h3>
                <p className="text-[11px] text-slate-400">Format & download formatted PDF document.</p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 text-xs font-mono space-y-1">
              <div>Company: <strong className="text-slate-200">{currentCompany.name}</strong></div>
              <div>Report: <strong className="text-cyan-400 uppercase">{selectedReport}</strong></div>
              <div>Format: <strong>Formatted Printable PDF / Browser Print</strong></div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowPrintModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowPrintModal(false);
                  setTimeout(() => handlePrintPdf(), 200);
                }}
                className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-lg shadow-cyan-600/30 flex items-center gap-2"
              >
                <Printer className="w-4 h-4" />
                Download / Print PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
