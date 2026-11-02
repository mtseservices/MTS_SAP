import React, { useState } from 'react';
import {
  X,
  Printer,
  FileSpreadsheet,
  Download,
  Building2,
  Calendar,
  Filter,
  Search,
  RotateCcw,
  SlidersHorizontal,
  ChevronDown,
  Layers,
  ArrowUpDown,
  FileText
} from 'lucide-react';
import { useAuthTenant } from '../../context/AuthTenantContext';

interface DepartmentReportViewerProps {
  isOpen: boolean;
  onClose: () => void;
  reportCode: string;
  reportTitle: string;
  departmentName: string;
}

export const DepartmentReportViewer: React.FC<DepartmentReportViewerProps> = ({
  isOpen,
  onClose,
  reportCode,
  reportTitle,
  departmentName
}) => {
  const { currentCompany, currentUser } = useAuthTenant();

  // Filters State matching image_21e62cc3.png & user specification
  const [fromDate, setFromDate] = useState('2026-10-01');
  const [toDate, setToDate] = useState('2026-11-01');
  const [departmentFilter, setDepartmentFilter] = useState(departmentName);
  const [sectionFilter, setSectionFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortAsc, setSortAsc] = useState(false);
  const [groupBy, setGroupBy] = useState<'NONE' | 'CATEGORY' | 'STATUS'>('NONE');

  // Simulated live report tabular records
  const [reportData, setReportData] = useState([
    {
      id: 'REC-001',
      docNo: 'TXN-2026-0091',
      date: '2026-10-05',
      category: 'Direct Operations',
      description: 'Raw Materials & Chemical Reagents Delivery Batch #441',
      party: 'Engro Chemicals Ltd',
      status: 'POSTED',
      debitPKR: 450000,
      creditPKR: 0
    },
    {
      id: 'REC-002',
      docNo: 'TXN-2026-0094',
      date: '2026-10-12',
      category: 'Commercial Sales',
      description: 'Finished FMCG Product Dispatch Challan #104',
      party: 'Metro Cash & Carry Wholesale',
      status: 'VERIFIED',
      debitPKR: 0,
      creditPKR: 980000
    },
    {
      id: 'REC-003',
      docNo: 'TXN-2026-0099',
      date: '2026-10-18',
      category: 'Utilities & Plant',
      description: 'Factory Electrical Grid & Generator Maintenance',
      party: 'Siemens Engineering Works',
      status: 'POSTED',
      debitPKR: 125000,
      creditPKR: 0
    },
    {
      id: 'REC-004',
      docNo: 'TXN-2026-0104',
      date: '2026-10-24',
      category: 'Direct Operations',
      description: 'Packaging Corrugated Cartons & Master Boxes',
      party: 'Packages Limited',
      status: 'POSTED',
      debitPKR: 320000,
      creditPKR: 0
    },
    {
      id: 'REC-005',
      docNo: 'TXN-2026-0112',
      date: '2026-10-28',
      category: 'Commercial Sales',
      description: 'Bulk Distribution Invoicing & POS Settlement',
      party: 'Hyperstar Carrefour Outlets',
      status: 'VERIFIED',
      debitPKR: 0,
      creditPKR: 1450000
    }
  ]);

  if (!isOpen) return null;

  // Filter and search
  const filteredData = reportData
    .filter((r) => {
      const matchSearch =
        r.docNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.party.toLowerCase().includes(searchTerm.toLowerCase());
      const matchStatus = statusFilter === 'ALL' || r.status === statusFilter;
      return matchSearch && matchStatus;
    })
    .sort((a, b) => {
      return sortAsc
        ? a.date.localeCompare(b.date)
        : b.date.localeCompare(a.date);
    });

  const totalDebit = filteredData.reduce((acc, r) => acc + r.debitPKR, 0);
  const totalCredit = filteredData.reduce((acc, r) => acc + r.creditPKR, 0);
  const netBalance = totalDebit - totalCredit;

  const handleExportExcel = () => {
    let csv = `MTS ERP - ${reportTitle} (${reportCode})\n`;
    csv += `Company,${currentCompany.name},NTN,${currentCompany.ntn}\n`;
    csv += `Date Range,${fromDate} to ${toDate},Department,${departmentFilter}\n\n`;
    csv += `Doc No,Date,Category,Description,Party / Customer,Status,Debit (PKR),Credit (PKR)\n`;

    filteredData.forEach((r) => {
      csv += `"${r.docNo}","${r.date}","${r.category}","${r.description}","${r.party}","${r.status}",${r.debitPKR},${r.creditPKR}\n`;
    });

    csv += `\nSubtotal,,,Total Records: ${filteredData.length},,,${totalDebit},${totalCredit}\n`;
    csv += `Net Ledger Movement,,,,,,${netBalance}\n`;

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${reportCode}_${currentCompany.slug}_${fromDate}_to_${toDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="relative bg-slate-900 border border-slate-700 rounded-3xl p-5 sm:p-7 max-w-5xl w-full space-y-4 shadow-2xl animate-in zoom-in-95 my-auto max-h-[95vh] flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-800 pb-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center overflow-hidden shrink-0">
              {currentCompany.logoUrl ? (
                <img src={currentCompany.logoUrl} alt="Logo" className="w-10 h-10 object-contain" />
              ) : (
                <Building2 className="w-6 h-6 text-cyan-400" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  {reportCode}
                </span>
                <h2 className="text-base font-black text-slate-100 uppercase tracking-wide">
                  {reportTitle}
                </h2>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {currentCompany.name} (Code: {currentCompany.code || '10'}) • NTN: <strong className="text-slate-200">{currentCompany.ntn}</strong> • Department: {departmentName}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white cursor-pointer transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Toolbar (Matching sample image: From Date, To Date, Filters) */}
        <div className="p-3.5 rounded-2xl bg-slate-850/70 border border-slate-800 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-2.5 text-xs">
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              From Date
            </label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 font-mono text-xs"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              To Date
            </label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 font-mono text-xs"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Status Filter
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 font-bold text-xs"
            >
              <option value="ALL">All Statuses</option>
              <option value="POSTED">POSTED</option>
              <option value="VERIFIED">VERIFIED</option>
              <option value="DRAFT">DRAFT</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Search Content
            </label>
            <input
              type="text"
              placeholder="Search Doc #, Party..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 text-xs"
            />
          </div>

          <div className="flex items-end gap-1.5">
            <button
              type="button"
              onClick={() => setSortAsc(!sortAsc)}
              className="w-full py-1.5 px-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center justify-center gap-1 cursor-pointer border border-slate-700"
              title="Toggle Date Sorting"
            >
              <ArrowUpDown className="w-3.5 h-3.5 text-cyan-400" />
              <span>{sortAsc ? 'Date ↑' : 'Date ↓'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('ALL');
              }}
              className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white cursor-pointer border border-slate-700"
              title="Reset Filters"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Report Data Table with Subtotals & Grand Totals */}
        <div className="flex-1 overflow-y-auto rounded-2xl border border-slate-800 bg-slate-950 font-mono text-xs">
          <table className="w-full text-left">
            <thead className="bg-slate-900 border-b border-slate-800 text-[10px] uppercase font-bold text-slate-400 sticky top-0 z-10">
              <tr>
                <th className="p-3">Doc #</th>
                <th className="p-3">Date</th>
                <th className="p-3">Category</th>
                <th className="p-3 min-w-[200px]">Narrative / Description</th>
                <th className="p-3">Party / Beneficiary</th>
                <th className="p-3 text-center">Status</th>
                <th className="p-3 text-right">Debit (PKR)</th>
                <th className="p-3 text-right">Credit (PKR)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-slate-200">
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-6 text-center text-slate-500">
                    No transactions match the selected filters for {reportTitle}.
                  </td>
                </tr>
              ) : (
                filteredData.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-900/50">
                    <td className="p-3 font-bold text-cyan-400">{row.docNo}</td>
                    <td className="p-3 text-slate-300">{row.date}</td>
                    <td className="p-3 text-[11px] text-purple-300">{row.category}</td>
                    <td className="p-3 font-sans text-slate-200">{row.description}</td>
                    <td className="p-3 text-slate-300">{row.party}</td>
                    <td className="p-3 text-center">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-900 border border-slate-700 text-emerald-400">
                        {row.status}
                      </span>
                    </td>
                    <td className="p-3 text-right text-emerald-400 font-bold">
                      {row.debitPKR > 0 ? `Rs. ${row.debitPKR.toLocaleString()}` : '-'}
                    </td>
                    <td className="p-3 text-right text-cyan-400 font-bold">
                      {row.creditPKR > 0 ? `Rs. ${row.creditPKR.toLocaleString()}` : '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            {filteredData.length > 0 && (
              <tfoot className="bg-slate-900/90 border-t-2 border-slate-700 font-bold text-xs text-slate-100">
                <tr>
                  <td colSpan={6} className="p-3 text-right uppercase tracking-wider text-[11px] text-slate-400">
                    Grand Total ({filteredData.length} Records)
                  </td>
                  <td className="p-3 text-right text-emerald-400 font-black">
                    Rs. {totalDebit.toLocaleString()}
                  </td>
                  <td className="p-3 text-right text-cyan-400 font-black">
                    Rs. {totalCredit.toLocaleString()}
                  </td>
                </tr>
                <tr className="border-t border-slate-800 text-[11px]">
                  <td colSpan={6} className="p-2.5 text-right text-slate-400">
                    Net Movement Surplus / (Deficit):
                  </td>
                  <td colSpan={2} className="p-2.5 text-right font-black text-amber-400">
                    Rs. {netBalance.toLocaleString()}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>

        {/* Report Footer & Standard Action Buttons */}
        <div className="border-t border-slate-800 pt-3 flex flex-wrap items-center justify-between gap-3 shrink-0 text-xs text-slate-400">
          <div className="flex items-center gap-3">
            <span>Prepared By: <strong className="text-slate-200">{currentUser.name}</strong></span>
            <span>•</span>
            <span>Printed By: <strong className="text-slate-200">{currentUser.name}</strong></span>
            <span>•</span>
            <span>Page 1 of 1</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExportExcel}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow transition-all cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Export Excel / CSV</span>
            </button>

            <button
              type="button"
              onClick={() => window.print()}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-cyan-400" />
              <span>Print Preview</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
