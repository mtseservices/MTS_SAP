import React, { useState } from 'react';
import {
  Calendar,
  X,
  Printer,
  FileSpreadsheet,
  Building2,
  ChevronDown,
  FileText,
  CheckCircle2,
  Filter,
  Layers,
  ArrowRight
} from 'lucide-react';
import { useAuthTenant } from '../../context/AuthTenantContext';
import { INITIAL_ACCOUNTS, INITIAL_VOUCHERS, INITIAL_INVENTORY, INITIAL_SALES_INVOICES, INITIAL_PURCHASE_ORDERS } from '../../services/mockData';

export interface ReportConfigTarget {
  id: string;
  code: string;
  title: string;
  category: 'Accounts' | 'Inventory' | 'Procurement' | 'Sales' | 'Predictive';
}

interface ReportParameterModalProps {
  isOpen: boolean;
  onClose: () => void;
  reportTarget?: ReportConfigTarget | null;
}

export const ReportParameterModal: React.FC<ReportParameterModalProps> = ({
  isOpen,
  onClose,
  reportTarget
}) => {
  const { currentCompany } = useAuthTenant();

  // Parameter State - Defaults matching image_21e62cc3.png
  const [fromDate, setFromDate] = useState('2026-10-01');
  const [toDate, setToDate] = useState('2026-11-01');
  const [voucherType, setVoucherType] = useState('ALL');
  const [voucherNo, setVoucherNo] = useState('');
  const [vheaderId, setVheaderId] = useState('');
  const [summaryMode, setSummaryMode] = useState<'DETAILED' | 'SUMMARY'>('DETAILED');

  // Preview Mode
  const [showReportPreview, setShowReportPreview] = useState(false);

  if (!isOpen) return null;

  const activeCode = reportTarget?.code || 'VOUCHER_PRINT_REP';
  const activeTitle = reportTarget?.title || 'Voucher Print Report';

  // Helper to export CSV/Excel matching parameter filters
  const handleExportExcel = () => {
    let csvContent = 'data:text/csv;charset=utf-8,';
    const timestamp = new Date().toISOString().split('T')[0];

    csvContent += `MTS ERP FUTURE SOLUTIONS - Official Report Export\n`;
    csvContent += `Report Code,${activeCode}\n`;
    csvContent += `Report Title,${activeTitle}\n`;
    csvContent += `Company Name,${currentCompany.name} (Code: ${currentCompany.code || '10'})\n`;
    csvContent += `FBR NTN,${currentCompany.ntn},FBR STRN,${currentCompany.strn}\n`;
    csvContent += `Date Range,From: ${fromDate} To: ${toDate}\n`;
    csvContent += `Voucher Type Filter,${voucherType},Voucher No,${voucherNo || 'ALL'},Vheader ID,${vheaderId || 'ALL'}\n`;
    csvContent += `Detail Level,${summaryMode}\n\n`;

    if (activeCode.includes('VOUCHER') || activeCode.includes('JOURNAL') || activeCode.includes('DAY_BOOK')) {
      csvContent += `Voucher No,Date,Type,Reference No,Account Code,Account Name,Description,Debit (PKR),Credit (PKR),Status\n`;
      INITIAL_VOUCHERS.forEach((v) => {
        v.items.forEach((item) => {
          csvContent += `"${v.voucherNo}","${v.date}","${v.type}","${v.referenceNo}","${item.accountCode}","${item.accountName}","${item.description}",${item.debit},${item.credit},"${v.status}"\n`;
        });
      });
    } else if (activeCode.includes('TRIAL') || activeCode.includes('CHART')) {
      csvContent += `Account Code,Account Name,Type,Category,Debit Balance (PKR),Credit Balance (PKR)\n`;
      INITIAL_ACCOUNTS.forEach((acc) => {
        const isDebit = acc.type === 'ASSET' || acc.type === 'EXPENSE';
        csvContent += `"${acc.code}","${acc.name}","${acc.type}","${acc.category}",${isDebit ? acc.balance : 0},${!isDebit ? acc.balance : 0}\n`;
      });
    } else if (activeCode.includes('STOCK') || activeCode.includes('FIFO')) {
      csvContent += `Item Code,Item Name,Category,Available Stock,UOM,Purchase Price,Valuation (PKR)\n`;
      INITIAL_INVENTORY.forEach((item) => {
        csvContent += `"${item.code}","${item.name}","${item.category}",${item.currentStock},"${item.uom}",${item.purchasePrice},${item.currentStock * item.purchasePrice}\n`;
      });
    } else {
      csvContent += `Parameter,Value\n`;
      csvContent += `Company Name,${currentCompany.name}\n`;
      csvContent += `From Date,${fromDate}\n`;
      csvContent += `To Date,${toDate}\n`;
      csvContent += `Gross Inflow Revenue (PKR),148000000\n`;
      csvContent += `COGS Direct Costs (PKR),-89000000\n`;
      csvContent += `Net Operating Surplus (PKR),46600000\n`;
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${currentCompany.slug}_${activeCode}_${fromDate}_to_${toDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Helper to trigger browser print
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      {/* Outer Card matching Screenshot 2 */}
      <div className="relative bg-white text-slate-800 rounded-xl max-w-xl w-full shadow-2xl border border-slate-300 overflow-hidden animate-in zoom-in-95 my-8">
        
        {/* Header Bar matching Screenshot 2: VOUCHER_PRINT_REP and (X) close circle */}
        <div className="px-6 py-4 flex items-center justify-between border-b border-slate-200 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <h2 className="text-base font-black font-mono tracking-wider text-slate-800 uppercase">
              {activeCode}
            </h2>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-bold border border-blue-200">
              {activeTitle}
            </span>
          </div>

          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full border border-slate-300 hover:border-slate-500 hover:bg-slate-100 flex items-center justify-center text-slate-600 transition-all cursor-pointer"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body Form matching Screenshot 2 */}
        {!showReportPreview ? (
          <div className="p-8 space-y-5">
            {/* Field 1: Company Name */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <label className="sm:w-36 text-xs font-bold text-slate-700 shrink-0">
                Company Name
              </label>
              <div className="flex-1 font-bold text-sm text-slate-900 font-mono flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-300 text-slate-700">
                  {currentCompany.code || '10'}
                </span>
                <span>{currentCompany.name}</span>
              </div>
            </div>

            {/* Field 2: From Date */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <label className="sm:w-36 text-xs font-bold text-slate-700 shrink-0">
                From Date
              </label>
              <div className="relative flex-1 max-w-sm">
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-800 text-xs font-mono font-medium shadow-inner focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Field 3: To Date */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <label className="sm:w-36 text-xs font-bold text-slate-700 shrink-0">
                To Date
              </label>
              <div className="relative flex-1 max-w-sm">
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-800 text-xs font-mono font-medium shadow-inner focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Field 4: Voucher Type / Filter Type */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <label className="sm:w-36 text-xs font-bold text-slate-700 shrink-0">
                Voucher Type
              </label>
              <div className="relative flex-1 max-w-sm">
                <select
                  value={voucherType}
                  onChange={(e) => setVoucherType(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-800 text-xs font-semibold shadow-inner focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 appearance-none pr-8 cursor-pointer"
                >
                  <option value="ALL">ALL VOUCHERS</option>
                  <option value="JOURNAL">Journal Voucher (JV)</option>
                  <option value="PAYMENT">Bank Payment Voucher (BPV)</option>
                  <option value="CASH_PAY">Cash Payment Voucher (CPV)</option>
                  <option value="RECEIPT">Bank Receipt Voucher (BRV)</option>
                  <option value="CASH_REC">Cash Receipt Voucher (CRV)</option>
                  <option value="SALES">Commercial Tax Invoice (STRN)</option>
                  <option value="PURCHASE">Procurement Purchase Voucher</option>
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Field 5: Voucher No */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <label className="sm:w-36 text-xs font-bold text-slate-700 shrink-0">
                Voucher No
              </label>
              <div className="flex-1 max-w-sm">
                <input
                  type="text"
                  value={voucherNo}
                  onChange={(e) => setVoucherNo(e.target.value)}
                  placeholder="e.g. JV-2026-089 (Optional)"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-800 text-xs font-mono shadow-inner focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Field 6: Vheader ID */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <label className="sm:w-36 text-xs font-bold text-slate-700 shrink-0">
                Vheader ID
              </label>
              <div className="flex-1 max-w-sm">
                <input
                  type="text"
                  value={vheaderId}
                  onChange={(e) => setVheaderId(e.target.value)}
                  placeholder="Reference or batch ID (Optional)"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-800 text-xs font-mono shadow-inner focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Additional Mode: Detailed vs Summary */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 pt-1 border-t border-slate-100">
              <label className="sm:w-36 text-xs font-bold text-slate-700 shrink-0">
                Output Detail Level
              </label>
              <div className="flex items-center gap-4 text-xs font-semibold text-slate-700">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="summaryMode"
                    checked={summaryMode === 'DETAILED'}
                    onChange={() => setSummaryMode('DETAILED')}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <span>Detailed Entries</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="summaryMode"
                    checked={summaryMode === 'SUMMARY'}
                    onChange={() => setSummaryMode('SUMMARY')}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <span>Consolidated Head Totals</span>
                </label>
              </div>
            </div>

            {/* Action Buttons matching Screenshot 2: Cancel on left, View & Viewexcel on right */}
            <div className="flex items-center justify-between pt-6 border-t border-slate-200">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 rounded-lg border border-blue-600 text-blue-600 hover:bg-blue-50 text-xs font-bold transition-all cursor-pointer shadow-sm"
              >
                Cancel
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowReportPreview(true)}
                  className="px-5 py-2 rounded-lg border border-blue-600 bg-white hover:bg-blue-50 text-blue-600 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
                >
                  <Printer className="w-3.5 h-3.5" />
                  View
                </button>

                <button
                  type="button"
                  onClick={handleExportExcel}
                  className="px-5 py-2 rounded-lg border border-blue-600 bg-white hover:bg-blue-50 text-blue-600 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                  Viewexcel
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Report View / Printable Preview Mode */
          <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <h3 className="text-sm font-black text-slate-800 uppercase font-mono">{activeTitle}</h3>
                <p className="text-xs text-slate-500">
                  {currentCompany.name} • {fromDate} to {toDate}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowReportPreview(false)}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-600 text-xs font-bold hover:bg-slate-100 cursor-pointer"
                >
                  &larr; Back to Parameters
                </button>
                <button
                  onClick={handlePrint}
                  className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Print / Export PDF
                </button>
              </div>
            </div>

            {/* Printable Area */}
            <div id="printable-popup-report" className="border border-slate-300 rounded-xl p-5 bg-white space-y-4 font-mono text-xs text-slate-800">
              {/* Report Header */}
              <div className="text-center border-b border-slate-300 pb-3 space-y-1">
                <div className="flex justify-between items-center text-left border-b pb-2 mb-2 border-slate-200">
                  <div>
                    <h2 className="text-base font-black text-slate-900 uppercase">{currentCompany.name}</h2>
                    <p className="text-[11px] text-slate-500">{currentCompany.registeredName}</p>
                  </div>
                  <div className="text-right text-[11px] text-slate-600">
                    <div>FBR NTN: <strong>{currentCompany.ntn}</strong></div>
                    <div>FBR STRN: <strong>{currentCompany.strn}</strong></div>
                  </div>
                </div>
                <div className="font-bold text-sm text-blue-900 uppercase tracking-wider">
                  {activeCode} - {activeTitle}
                </div>
                <div className="text-[11px] text-slate-500">
                  Period: <strong>{fromDate}</strong> to <strong>{toDate}</strong> • Filter: <strong>{voucherType}</strong>
                </div>
              </div>

              {/* Data Table */}
              <table className="w-full text-left border-collapse border border-slate-300 text-xs">
                <thead>
                  <tr className="bg-slate-100 font-bold border-b border-slate-300 text-[11px]">
                    <th className="p-2 border border-slate-300">Voucher / Doc No</th>
                    <th className="p-2 border border-slate-300">Date</th>
                    <th className="p-2 border border-slate-300">Type</th>
                    <th className="p-2 border border-slate-300">Account Description</th>
                    <th className="p-2 border border-slate-300 text-right">Debit (PKR)</th>
                    <th className="p-2 border border-slate-300 text-right">Credit (PKR)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {INITIAL_VOUCHERS.map((v) =>
                    v.items.map((item, idx) => (
                      <tr key={`${v.id}_${idx}`} className="hover:bg-slate-50">
                        <td className="p-2 border border-slate-200 font-bold text-blue-800">{v.voucherNo}</td>
                        <td className="p-2 border border-slate-200">{v.date}</td>
                        <td className="p-2 border border-slate-200 font-semibold">{v.type}</td>
                        <td className="p-2 border border-slate-200">
                          <div>{item.accountName}</div>
                          <div className="text-[10px] text-slate-500">{item.description}</div>
                        </td>
                        <td className="p-2 border border-slate-200 text-right font-bold text-slate-900">
                          {item.debit > 0 ? `Rs. ${item.debit.toLocaleString()}` : '-'}
                        </td>
                        <td className="p-2 border border-slate-200 text-right font-bold text-slate-900">
                          {item.credit > 0 ? `Rs. ${item.credit.toLocaleString()}` : '-'}
                        </td>
                      </tr>
                    ))
                  )}
                  {/* Totals Row */}
                  <tr className="bg-slate-100 font-black border-t-2 border-slate-400">
                    <td colSpan={4} className="p-2 border border-slate-300 uppercase text-right">Total PKR:</td>
                    <td className="p-2 border border-slate-300 text-right text-emerald-800">Rs. 5,300,000</td>
                    <td className="p-2 border border-slate-300 text-right text-emerald-800">Rs. 5,300,000</td>
                  </tr>
                </tbody>
              </table>

              {/* Signatures */}
              <div className="pt-8 border-t border-slate-300 grid grid-cols-3 gap-4 text-center text-[10px] text-slate-500">
                <div>
                  <div className="border-b border-slate-400 pb-6"></div>
                  <div className="mt-1 font-semibold text-slate-800">Prepared By</div>
                  <div>Accountant</div>
                </div>
                <div>
                  <div className="border-b border-slate-400 pb-6"></div>
                  <div className="mt-1 font-semibold text-slate-800">Checked By</div>
                  <div>Internal Auditor</div>
                </div>
                <div>
                  <div className="border-b border-slate-400 pb-6"></div>
                  <div className="mt-1 font-semibold text-slate-800">Approved By</div>
                  <div>Chief Financial Officer</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
