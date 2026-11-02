import React, { useState, useEffect } from 'react';
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
  ArrowRight,
  Eye,
  Image as ImageIcon,
  DollarSign,
  Boxes,
  Users,
  ShoppingCart,
  Receipt
} from 'lucide-react';
import { useAuthTenant } from '../../context/AuthTenantContext';
import {
  INITIAL_ACCOUNTS,
  INITIAL_VOUCHERS,
  INITIAL_INVENTORY,
  INITIAL_BRANCHES
} from '../../services/mockData';

export interface ReportConfigTarget {
  id: string;
  code: string;
  title: string;
  category: 'Accounts' | 'Inventory' | 'Procurement' | 'Sales' | 'HR' | 'Production' | 'Predictive' | string;
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

  // Date Range (Universal)
  const [fromDate, setFromDate] = useState('2026-10-01');
  const [toDate, setToDate] = useState('2026-11-01');
  const [summaryMode, setSummaryMode] = useState<'DETAILED' | 'SUMMARY'>('DETAILED');

  // Logo Settings for Report PDF & Print
  const [showLogo, setShowLogo] = useState(true);
  const [logoUrl, setLogoUrl] = useState(
    currentCompany.logoUrl ||
      'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=160&auto=format&fit=crop&q=80'
  );
  const [isEditingLogo, setIsEditingLogo] = useState(false);

  // Department-Specific Filter States:
  // 1. Finance / Accounts filters
  const [voucherType, setVoucherType] = useState('ALL');
  const [voucherNo, setVoucherNo] = useState('');
  const [vheaderId, setVheaderId] = useState('');
  const [accountHead, setAccountHead] = useState('ALL');

  // 2. Sales / POS filters
  const [posTerminal, setPosTerminal] = useState('ALL');
  const [salesRep, setSalesRep] = useState('ALL');
  const [salesPaymentMode, setSalesPaymentMode] = useState('ALL');
  const [salesCustomer, setSalesCustomer] = useState('ALL');
  const [agingSlab, setAgingSlab] = useState('ALL');

  // 3. Inventory filters
  const [warehouseLocation, setWarehouseLocation] = useState('ALL');
  const [itemCategory, setItemCategory] = useState('ALL');
  const [valuationMethod, setValuationMethod] = useState('FIFO');
  const [stockLevelFilter, setStockLevelFilter] = useState('ALL');

  // 4. Procurement filters
  const [procurementVendor, setProcurementVendor] = useState('ALL');
  const [poStatus, setPoStatus] = useState('ALL');

  // 5. HR / Payroll filters
  const [hrDepartment, setHrDepartment] = useState('ALL');
  const [salaryMonth, setSalaryMonth] = useState('2026-10');

  // Preview Mode
  const [showReportPreview, setShowReportPreview] = useState(false);

  // Sync category if target changes
  const reportCategory = reportTarget?.category || 'Accounts';
  const activeCode = reportTarget?.code || 'REPORT_EXPORT';
  const activeTitle = reportTarget?.title || 'System Report';
  const reportId = reportTarget?.id || '';

  // Determine report domain type
  const isSalesDomain =
    reportCategory === 'Sales' ||
    reportId.includes('sales') ||
    reportId.includes('pos') ||
    reportId.includes('aging');

  const isInventoryDomain =
    reportCategory === 'Inventory' ||
    reportId.includes('stock') ||
    reportId.includes('valuation') ||
    reportId.includes('reorder');

  const isProcurementDomain =
    reportCategory === 'Procurement' ||
    reportId.includes('po_') ||
    reportId.includes('vendor');

  const isHrDomain =
    reportCategory === 'HR' ||
    reportId.includes('salary') ||
    reportId.includes('tax_deductions');

  const isAccountsDomain =
    !isSalesDomain && !isInventoryDomain && !isProcurementDomain && !isHrDomain;

  if (!isOpen) return null;

  // Domain Mock Datasets for dynamic preview tables
  const salesRows = [
    { id: 's1', date: '2026-10-02', invoiceNo: 'INV-2026-0811', customer: 'Kohinoor Textile Traders (Faisalabad)', type: 'CREDIT', taxable: 840000, gst: 151200, grandTotal: 991200, status: 'PAID' },
    { id: 's2', date: '2026-10-05', invoiceNo: 'INV-2026-0812', customer: 'Lahore Mega Wholesalers', type: 'CREDIT', taxable: 1450000, gst: 261000, grandTotal: 1711000, status: 'PARTIAL' },
    { id: 's3', date: '2026-10-08', invoiceNo: 'CSH-2026-0190', customer: 'Walk-in Counter Customer', type: 'CASH', taxable: 64000, gst: 11520, grandTotal: 75520, status: 'CLEARED' },
    { id: 's4', date: '2026-10-12', invoiceNo: 'INV-2026-0815', customer: 'Karachi Distribution Hub', type: 'CREDIT', taxable: 2200000, gst: 396000, grandTotal: 2596000, status: 'OVERDUE' },
    { id: 's5', date: '2026-10-18', invoiceNo: 'CSH-2026-0205', customer: 'Shah Alam Wholesale Desk', type: 'CASH', taxable: 320000, gst: 57600, grandTotal: 377600, status: 'CLEARED' },
    { id: 's6', date: '2026-10-24', invoiceNo: 'INV-2026-0820', customer: 'Rawalpindi Wholesale Mart', type: 'CREDIT', taxable: 680000, gst: 122400, grandTotal: 802400, status: 'PAID' }
  ];

  const inventoryRows = [
    { code: 'RM-COTTON-BALES', name: 'Raw Cotton Grade-A (220kg Bales)', category: 'Raw Materials', uom: 'Bales', opening: 800, inward: 950, outward: 500, closing: 1250, unitCost: 35000, valuation: 43750000 },
    { code: 'RM-YARN-30S', name: '100% Combed Cotton Yarn 30s/1', category: 'Raw Materials', uom: 'Bags', opening: 400, inward: 640, outward: 200, closing: 840, unitCost: 5900, valuation: 4956000 },
    { code: 'FG-TWILL-ROLL', name: 'Dyed Twill Fabric (Rolls 100m)', category: 'Finished Goods', uom: 'Rolls', opening: 1800, inward: 2600, outward: 1000, closing: 3400, unitCost: 4750, valuation: 16150000 },
    { code: 'DYE-REACTIVE-BLU', name: 'Reactive Dye Navy Blue (D-35)', category: 'Dyes & Chemicals', uom: 'Kg', opening: 120, inward: 150, outward: 75, closing: 195, unitCost: 2200, valuation: 429000 },
    { code: 'PKG-CONE-TUBE', name: 'Paper Cones for Yarn Spinning', category: 'Packaging', uom: 'Pcs', opening: 4500, inward: 8000, outward: 3500, closing: 9000, unitCost: 15, valuation: 135000 }
  ];

  const procurementRows = [
    { poNo: 'PO-2026-041', date: '2026-10-04', vendor: 'Engro Polymer & Chemicals Ltd', ntn: '0711928-3', base: 4500000, gst: 810000, total: 5310000, status: 'RECEIVED' },
    { poNo: 'PO-2026-042', date: '2026-10-10', vendor: 'Packaging World Private Ltd', ntn: '1982736-4', base: 1200000, gst: 216000, total: 1416000, status: 'RECEIVED' },
    { poNo: 'PO-2026-043', date: '2026-10-17', vendor: 'Shell Pakistan Fuel Logistics', ntn: '0710022-1', base: 850000, gst: 153000, total: 1003000, status: 'PENDING' },
    { poNo: 'PO-2026-044', date: '2026-10-22', vendor: 'National Corrugated Cartons', ntn: '2981023-9', base: 640000, gst: 115200, total: 755200, status: 'APPROVED' }
  ];

  const hrRows = [
    { id: 'EMP-0101', name: 'Muhammad Tariq', dept: 'Finance & Accounts', desig: 'Sr. Accounts Manager', basic: 140000, allow: 45000, gross: 185000, tax: 18500, net: 166500 },
    { id: 'EMP-0102', name: 'Farhan Ali', dept: 'Finance & Accounts', desig: 'Chief Accountant', basic: 105000, allow: 30000, gross: 135000, tax: 11200, net: 123800 },
    { id: 'EMP-0201', name: 'Engr. Rashid Minhas', dept: 'Production & Plant', desig: 'Plant Director', basic: 210000, allow: 80000, gross: 290000, tax: 38000, net: 252000 },
    { id: 'EMP-0301', name: 'Bilal Ahmad', dept: 'Sales & Marketing', desig: 'Territory Sales Lead', basic: 110000, allow: 55000, gross: 165000, tax: 15400, net: 149600 }
  ];

  // Export CSV matching exact active report domain
  const handleExportExcel = () => {
    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += `MTS ERP ENTERPRISE - OFFICIAL REPORT EXPORT\n`;
    csvContent += `Report Code,${activeCode}\n`;
    csvContent += `Report Title,${activeTitle}\n`;
    csvContent += `Company Name,${currentCompany.name} (NTN: ${currentCompany.ntn}, STRN: ${currentCompany.strn})\n`;
    csvContent += `Date Range,From: ${fromDate} To: ${toDate}\n`;
    csvContent += `Detail Level,${summaryMode}\n\n`;

    if (isSalesDomain) {
      csvContent += `Invoice No,Date,Customer Name,Payment Mode,Taxable Amount (PKR),GST 18% (PKR),Grand Total (PKR),Status\n`;
      salesRows.forEach((r) => {
        csvContent += `"${r.invoiceNo}","${r.date}","${r.customer}","${r.type}",${r.taxable},${r.gst},${r.grandTotal},"${r.status}"\n`;
      });
    } else if (isInventoryDomain) {
      csvContent += `Item Code,Item Name,Category,UOM,Opening Stock,Inward Receipts,Outward Issues,Closing Balance,Unit Cost (PKR),Valuation (PKR)\n`;
      inventoryRows.forEach((r) => {
        csvContent += `"${r.code}","${r.name}","${r.category}","${r.uom}",${r.opening},${r.inward},${r.outward},${r.closing},${r.unitCost},${r.valuation}\n`;
      });
    } else if (isProcurementDomain) {
      csvContent += `PO Number,Date,Vendor Name,FBR NTN,Base Amount (PKR),GST 18% (PKR),Grand Total (PKR),Status\n`;
      procurementRows.forEach((r) => {
        csvContent += `"${r.poNo}","${r.date}","${r.vendor}","${r.ntn}",${r.base},${r.gst},${r.total},"${r.status}"\n`;
      });
    } else if (isHrDomain) {
      csvContent += `Employee ID,Name,Department,Designation,Basic Pay (PKR),Allowances (PKR),Gross Salary (PKR),Tax Withheld Sec 149 (PKR),Net Payable (PKR)\n`;
      hrRows.forEach((r) => {
        csvContent += `"${r.id}","${r.name}","${r.dept}","${r.desig}",${r.basic},${r.allow},${r.gross},${r.tax},${r.net}\n`;
      });
    } else {
      // Accounts / Voucher Domain
      csvContent += `Voucher No,Date,Type,Account Code,Account Name,Description,Debit (PKR),Credit (PKR),Status\n`;
      INITIAL_VOUCHERS.forEach((v) => {
        v.items.forEach((item) => {
          csvContent += `"${v.voucherNo}","${v.date}","${v.type}","${item.accountCode}","${item.accountName}","${item.description}",${item.debit},${item.credit},"${v.status}"\n`;
        });
      });
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${currentCompany.slug}_${activeCode}_${fromDate}_to_${toDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="relative bg-white text-slate-800 rounded-2xl max-w-4xl w-full shadow-2xl border border-slate-300 overflow-hidden animate-in zoom-in-95 my-6 flex flex-col max-h-[92vh]">
        
        {/* Modal Header */}
        <div className="px-6 py-4 flex items-center justify-between border-b border-slate-200 bg-slate-900 text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-400">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-blue-400">
                  {activeCode}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                  {reportCategory} Module
                </span>
              </div>
              <h2 className="text-base font-bold text-white tracking-tight">
                {activeTitle}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center bg-slate-800 p-0.5 rounded-lg border border-slate-700 text-xs">
              <button
                onClick={() => setShowReportPreview(false)}
                className={`px-3 py-1 rounded-md font-semibold transition-all ${
                  !showReportPreview ? 'bg-blue-600 text-white' : 'text-slate-300 hover:text-white'
                }`}
              >
                Parameters
              </button>
              <button
                onClick={() => setShowReportPreview(true)}
                className={`px-3 py-1 rounded-md font-semibold flex items-center gap-1.5 transition-all ${
                  showReportPreview ? 'bg-blue-600 text-white' : 'text-slate-300 hover:text-white'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Report Preview & PDF</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-all cursor-pointer border border-slate-700"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          
          {/* ========================================================= */}
          {/* VIEW 1: DOMAIN-ACCURATE PARAMETER FORM                     */}
          {/* ========================================================= */}
          {!showReportPreview ? (
            <div className="space-y-5">
              
              {/* Header Company Bar */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 font-bold text-slate-800">
                  <Building2 className="w-4 h-4 text-blue-600" />
                  <span>Company: {currentCompany.name}</span>
                  <span className="font-mono text-slate-500 font-normal">
                    (NTN: {currentCompany.ntn || '4109823-7'}, STRN: {currentCompany.strn || '17009988221'})
                  </span>
                </div>
                <div className="text-[11px] text-blue-700 font-semibold bg-blue-50 px-2.5 py-0.5 rounded border border-blue-200">
                  Domain Filter: {reportCategory}
                </div>
              </div>

              {/* Company Logo Setting for PDF */}
              <div className="p-3 bg-blue-50/60 border border-blue-200 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs">
                <label className="flex items-center gap-2 font-bold text-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showLogo}
                    onChange={(e) => setShowLogo(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span>Include Official Company Logo in Top Header of Report & PDF</span>
                </label>

                <button
                  type="button"
                  onClick={() => setIsEditingLogo(!isEditingLogo)}
                  className="text-xs text-blue-600 hover:underline flex items-center gap-1 font-semibold"
                >
                  <ImageIcon className="w-3.5 h-3.5" />
                  <span>Change / Upload Logo</span>
                </button>
              </div>

              {isEditingLogo && (
                <div className="p-3 bg-slate-50 border border-slate-300 rounded-xl space-y-2 text-xs animate-in fade-in">
                  <label className="block text-[11px] font-bold text-slate-700">
                    Custom Logo URL for Reports
                  </label>
                  <input
                    type="text"
                    value={logoUrl}
                    onChange={(e) => setLogoUrl(e.target.value)}
                    placeholder="https://example.com/logo.png"
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 bg-white"
                  />
                </div>
              )}

              {/* Date Filters (Universal) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    From Date
                  </label>
                  <input
                    type="date"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs font-mono font-medium shadow-inner focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    To Date
                  </label>
                  <input
                    type="date"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs font-mono font-medium shadow-inner focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* ========================================================= */}
              {/* DOMAIN FILTER SET 1: SALES & POS REPORTS                  */}
              {/* ========================================================= */}
              {isSalesDomain && (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-4">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider font-mono">
                    <Receipt className="w-4 h-4 text-emerald-600" />
                    <span>Sales & Point of Sale (POS) Parameters</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">
                        POS Terminal / Counter
                      </label>
                      <select
                        value={posTerminal}
                        onChange={(e) => setPosTerminal(e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white font-semibold text-slate-800"
                      >
                        <option value="ALL">All POS Terminals</option>
                        <option value="TERM-01">Counter 01 - Express Till</option>
                        <option value="TERM-02">Counter 02 - Wholesale Desk</option>
                        <option value="TERM-03">Counter 03 - Cash & Carry</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">
                        Payment Mode Filter
                      </label>
                      <select
                        value={salesPaymentMode}
                        onChange={(e) => setSalesPaymentMode(e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white font-semibold text-slate-800"
                      >
                        <option value="ALL">All Payments (Cash + Credit)</option>
                        <option value="CASH">Cash Counter Bills Only</option>
                        <option value="CREDIT">Credit Invoices (Receivable)</option>
                        <option value="ONLINE">Bank Transfer & Cards</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">
                        Customer Ledger Account
                      </label>
                      <select
                        value={salesCustomer}
                        onChange={(e) => setSalesCustomer(e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white font-semibold text-slate-800"
                      >
                        <option value="ALL">All Customers & Walk-ins</option>
                        <option value="CUST-001">Walk-in Counter Customers</option>
                        <option value="CUST-002">Kohinoor Textile Traders (Faisalabad)</option>
                        <option value="CUST-003">Lahore Mega Wholesalers</option>
                        <option value="CUST-004">Karachi Distribution Hub</option>
                      </select>
                    </div>
                  </div>

                  {reportId.includes('aging') && (
                    <div className="pt-2">
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">
                        Receivables Aging Slab
                      </label>
                      <select
                        value={agingSlab}
                        onChange={(e) => setAgingSlab(e.target.value)}
                        className="w-full sm:w-72 px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white font-semibold text-slate-800 text-xs"
                      >
                        <option value="ALL">All Aging Slabs (Complete Ledger)</option>
                        <option value="0-30">Current Due (0 - 30 Days)</option>
                        <option value="31-60">Overdue (31 - 60 Days)</option>
                        <option value="61-90">Delinquent (61 - 90 Days)</option>
                        <option value="90+">High Risk (90+ Days Critical)</option>
                      </select>
                    </div>
                  )}
                </div>
              )}

              {/* ========================================================= */}
              {/* DOMAIN FILTER SET 2: INVENTORY & STOCK REPORTS            */}
              {/* ========================================================= */}
              {isInventoryDomain && (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-4">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider font-mono">
                    <Boxes className="w-4 h-4 text-cyan-600" />
                    <span>Inventory, Stock Ledger & Valuation Parameters</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">
                        Warehouse Location
                      </label>
                      <select
                        value={warehouseLocation}
                        onChange={(e) => setWarehouseLocation(e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white font-semibold text-slate-800"
                      >
                        <option value="ALL">All Warehouses & Plants</option>
                        <option value="WH-LHR">Lahore Central Plant Warehouse</option>
                        <option value="WH-KHI">Karachi Port Distribution Hub</option>
                        <option value="WH-ISB">Islamabad Regional Tech Store</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">
                        Item Category
                      </label>
                      <select
                        value={itemCategory}
                        onChange={(e) => setItemCategory(e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white font-semibold text-slate-800"
                      >
                        <option value="ALL">All Categories</option>
                        <option value="RAW">Raw Materials & Ingredients</option>
                        <option value="PKG">Corrugated Packaging & Tins</option>
                        <option value="FG">Finished Commercial Goods</option>
                        <option value="SOLAR">Solar & Electrical Equipment</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">
                        Valuation Method
                      </label>
                      <select
                        value={valuationMethod}
                        onChange={(e) => setValuationMethod(e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white font-semibold text-slate-800"
                      >
                        <option value="FIFO">FIFO (First In First Out)</option>
                        <option value="W_AVG">Weighted Average Cost</option>
                        <option value="LPP">Last Purchase Price (LPP)</option>
                        <option value="STD">Standard Cost Standard</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* ========================================================= */}
              {/* DOMAIN FILTER SET 3: PROCUREMENT & VENDOR REPORTS         */}
              {/* ========================================================= */}
              {isProcurementDomain && (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-4">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider font-mono">
                    <ShoppingCart className="w-4 h-4 text-purple-600" />
                    <span>Procurement & Purchase Order Parameters</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">
                        Vendor Directory Selection
                      </label>
                      <select
                        value={procurementVendor}
                        onChange={(e) => setProcurementVendor(e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white font-semibold text-slate-800"
                      >
                        <option value="ALL">All Authorized Vendors</option>
                        <option value="VEN-001">Engro Polymer & Chemicals Ltd</option>
                        <option value="VEN-002">Packaging World Private Ltd</option>
                        <option value="VEN-003">Shell Pakistan Fuel Logistics</option>
                        <option value="VEN-004">National Corrugated Cartons</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">
                        PO Status Filter
                      </label>
                      <select
                        value={poStatus}
                        onChange={(e) => setPoStatus(e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white font-semibold text-slate-800"
                      >
                        <option value="ALL">All Purchase Orders</option>
                        <option value="APPROVED">Approved & Issued to Supplier</option>
                        <option value="PENDING">Pending Goods Receipt (GRN)</option>
                        <option value="CLOSED">Completed & Invoiced</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* ========================================================= */}
              {/* DOMAIN FILTER SET 4: HR & PAYROLL REPORTS                 */}
              {/* ========================================================= */}
              {isHrDomain && (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-4">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider font-mono">
                    <Users className="w-4 h-4 text-amber-600" />
                    <span>HR, Payroll & Tax Deduction Parameters</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">
                        Department
                      </label>
                      <select
                        value={hrDepartment}
                        onChange={(e) => setHrDepartment(e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white font-semibold text-slate-800"
                      >
                        <option value="ALL">All Corporate Departments</option>
                        <option value="FIN">Finance, Accounts & Taxation</option>
                        <option value="PROD">Plant Production & Operations</option>
                        <option value="SALES">Sales, Retail & Logistics</option>
                        <option value="ADMIN">Corporate Administration & IT</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">
                        Salary Month
                      </label>
                      <select
                        value={salaryMonth}
                        onChange={(e) => setSalaryMonth(e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white font-semibold text-slate-800"
                      >
                        <option value="2026-10">October 2026</option>
                        <option value="2026-09">September 2026</option>
                        <option value="2026-08">August 2026</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* ========================================================= */}
              {/* DOMAIN FILTER SET 5: FINANCE & GENERAL VOUCHERS           */}
              {/* ========================================================= */}
              {isAccountsDomain && (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-4">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider font-mono">
                    <DollarSign className="w-4 h-4 text-blue-600" />
                    <span>General Ledger & Voucher Posting Filters</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">
                        Voucher Type
                      </label>
                      <select
                        value={voucherType}
                        onChange={(e) => setVoucherType(e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white font-semibold text-slate-800"
                      >
                        <option value="ALL">ALL VOUCHERS</option>
                        <option value="JOURNAL">Journal Voucher (JV)</option>
                        <option value="PAYMENT">Bank Payment (BPV)</option>
                        <option value="CASH_PAY">Cash Payment (CPV)</option>
                        <option value="RECEIPT">Bank Receipt (BRV)</option>
                        <option value="CASH_REC">Cash Receipt (CRV)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">
                        Voucher / Ref No
                      </label>
                      <input
                        type="text"
                        value={voucherNo}
                        onChange={(e) => setVoucherNo(e.target.value)}
                        placeholder="e.g. JV-2026-089 (Optional)"
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">
                        Account Head
                      </label>
                      <select
                        value={accountHead}
                        onChange={(e) => setAccountHead(e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white font-semibold text-slate-800"
                      >
                        <option value="ALL">All Chart of Accounts</option>
                        {INITIAL_ACCOUNTS.map((acc) => (
                          <option key={acc.id} value={acc.code}>
                            {acc.code} - {acc.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Detail Level Mode */}
              <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs">
                <span className="font-bold text-slate-700">Output Detail Level:</span>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-1.5 cursor-pointer font-medium text-slate-700">
                    <input
                      type="radio"
                      name="summaryMode"
                      value="DETAILED"
                      checked={summaryMode === 'DETAILED'}
                      onChange={() => setSummaryMode('DETAILED')}
                      className="text-blue-600"
                    />
                    <span>Detailed Transaction Ledger</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer font-medium text-slate-700">
                    <input
                      type="radio"
                      name="summaryMode"
                      value="SUMMARY"
                      checked={summaryMode === 'SUMMARY'}
                      onChange={() => setSummaryMode('SUMMARY')}
                      className="text-blue-600"
                    />
                    <span>Consolidated Summary</span>
                  </label>
                </div>
              </div>
            </div>
          ) : (
            /* ========================================================= */
            /* VIEW 2: HIGH-FIDELITY PRINTABLE REPORT SHEET WITH LOGO     */
            /* ========================================================= */
            <div className="space-y-6">
              
              {/* Print Action Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-100 border border-slate-200 rounded-xl text-xs">
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-1.5 font-bold text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showLogo}
                      onChange={(e) => setShowLogo(e.target.checked)}
                      className="w-4 h-4 rounded text-blue-600"
                    />
                    <span>Show Logo</span>
                  </label>
                  <span className="text-slate-400">|</span>
                  <span className="text-slate-600 font-mono">
                    Period: {fromDate} to {toDate}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleExportExcel}
                    className="px-3.5 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-bold flex items-center gap-1.5 shadow-sm"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                    <span>Download Excel</span>
                  </button>

                  <button
                    onClick={() => window.print()}
                    className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold flex items-center gap-1.5 shadow-sm"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Print PDF Sheet</span>
                  </button>
                </div>
              </div>

              {/* PRINTABLE A4 REPORT SHEET */}
              <div
                id="printable-report-sheet"
                className="bg-white p-6 sm:p-8 rounded-xl border border-slate-300 shadow-sm space-y-6 text-slate-800 font-sans"
              >
                {/* Header with Logo, Name, NTN, STRN */}
                <div className="flex flex-col sm:flex-row items-start justify-between pb-4 border-b-2 border-slate-800 gap-4">
                  <div className="flex items-center gap-4">
                    {showLogo && (
                      <div className="h-16 w-24 flex items-center justify-center p-1 bg-white border border-slate-200 rounded-lg overflow-hidden shrink-0">
                        <img
                          src={logoUrl}
                          alt="Company Logo"
                          className="max-h-full max-w-full object-contain"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      </div>
                    )}
                    <div>
                      <h1 className="text-xl font-black text-slate-900 tracking-tight uppercase">
                        {currentCompany.name}
                      </h1>
                      <div className="text-xs text-slate-600 mt-0.5">
                        {currentCompany.address || 'Industrial Estate, Lahore, Pakistan'}
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 text-[11px] text-slate-600 font-mono mt-1">
                        <span><strong>NTN:</strong> {currentCompany.ntn || '4109823-7'}</span>
                        <span><strong>STRN:</strong> {currentCompany.strn || '17009988221'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right sm:self-start">
                    <div className="inline-block px-3 py-1 bg-slate-900 text-white font-mono font-black text-xs uppercase tracking-wider rounded">
                      {activeTitle}
                    </div>
                    <div className="text-xs font-mono font-bold text-slate-700 mt-2">
                      Code: <span className="text-blue-700">{activeCode}</span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5 font-mono">
                      Period: {fromDate} ~ {toDate}
                    </div>
                  </div>
                </div>

                {/* DOMAIN SPECIFIC PREVIEW TABLES */}
                {isSalesDomain && (
                  <div className="overflow-x-auto border border-slate-300 rounded-lg">
                    <table className="w-full text-xs text-left border-collapse">
                      <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-300 uppercase text-[10px]">
                        <tr>
                          <th className="p-2 border-r border-slate-300">Invoice No</th>
                          <th className="p-2 border-r border-slate-300">Date</th>
                          <th className="p-2 border-r border-slate-300">Customer Name</th>
                          <th className="p-2 border-r border-slate-300 text-center">Terms</th>
                          <th className="p-2 border-r border-slate-300 text-right">Taxable (PKR)</th>
                          <th className="p-2 border-r border-slate-300 text-right">GST 18% (PKR)</th>
                          <th className="p-2 border-r border-slate-300 text-right">Grand Total (PKR)</th>
                          <th className="p-2 text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 font-mono">
                        {salesRows.map((row) => (
                          <tr key={row.id} className="hover:bg-slate-50">
                            <td className="p-2 border-r border-slate-200 font-bold text-blue-700">{row.invoiceNo}</td>
                            <td className="p-2 border-r border-slate-200">{row.date}</td>
                            <td className="p-2 border-r border-slate-200 font-sans font-semibold text-slate-800">{row.customer}</td>
                            <td className="p-2 border-r border-slate-200 text-center font-bold text-[10px]">
                              <span className={row.type === 'CASH' ? 'text-emerald-700' : 'text-blue-700'}>
                                {row.type}
                              </span>
                            </td>
                            <td className="p-2 border-r border-slate-200 text-right">Rs. {row.taxable.toLocaleString()}</td>
                            <td className="p-2 border-r border-slate-200 text-right text-blue-700">Rs. {row.gst.toLocaleString()}</td>
                            <td className="p-2 border-r border-slate-200 text-right font-bold text-slate-900">Rs. {row.grandTotal.toLocaleString()}</td>
                            <td className="p-2 text-center">
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                                {row.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                        <tr className="bg-slate-100 font-black border-t-2 border-slate-400">
                          <td colSpan={4} className="p-2 border-r border-slate-300 uppercase text-right">Total PKR:</td>
                          <td className="p-2 border-r border-slate-300 text-right">Rs. 5,554,000</td>
                          <td className="p-2 border-r border-slate-300 text-right text-blue-700">Rs. 999,720</td>
                          <td className="p-2 border-r border-slate-300 text-right text-emerald-800">Rs. 6,553,720</td>
                          <td className="p-2"></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )}

                {isInventoryDomain && (
                  <div className="overflow-x-auto border border-slate-300 rounded-lg">
                    <table className="w-full text-xs text-left border-collapse">
                      <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-300 uppercase text-[10px]">
                        <tr>
                          <th className="p-2 border-r border-slate-300">Item Code</th>
                          <th className="p-2 border-r border-slate-300">Item Name</th>
                          <th className="p-2 border-r border-slate-300">Category</th>
                          <th className="p-2 border-r border-slate-300 text-center">UOM</th>
                          <th className="p-2 border-r border-slate-300 text-right">Opening</th>
                          <th className="p-2 border-r border-slate-300 text-right">Inward</th>
                          <th className="p-2 border-r border-slate-300 text-right">Outward</th>
                          <th className="p-2 border-r border-slate-300 text-right">Closing</th>
                          <th className="p-2 border-r border-slate-300 text-right">Unit Cost</th>
                          <th className="p-2 text-right">Valuation (PKR)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 font-mono">
                        {inventoryRows.map((row) => (
                          <tr key={row.code} className="hover:bg-slate-50">
                            <td className="p-2 border-r border-slate-200 font-bold text-cyan-700">{row.code}</td>
                            <td className="p-2 border-r border-slate-200 font-sans font-medium">{row.name}</td>
                            <td className="p-2 border-r border-slate-200 font-sans text-slate-600">{row.category}</td>
                            <td className="p-2 border-r border-slate-200 text-center text-slate-500">{row.uom}</td>
                            <td className="p-2 border-r border-slate-200 text-right">{row.opening}</td>
                            <td className="p-2 border-r border-slate-200 text-right text-emerald-700 font-bold">+{row.inward}</td>
                            <td className="p-2 border-r border-slate-200 text-right text-red-600">-{row.outward}</td>
                            <td className="p-2 border-r border-slate-200 text-right font-black text-slate-900 bg-cyan-50/50">{row.closing}</td>
                            <td className="p-2 border-r border-slate-200 text-right">Rs. {row.unitCost.toLocaleString()}</td>
                            <td className="p-2 text-right font-bold text-slate-900">Rs. {row.valuation.toLocaleString()}</td>
                          </tr>
                        ))}
                        <tr className="bg-slate-100 font-black border-t-2 border-slate-400">
                          <td colSpan={9} className="p-2 border-r border-slate-300 uppercase text-right">Total Inventory Valuation:</td>
                          <td className="p-2 text-right text-emerald-800">Rs. 20,336,000</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )}

                {isProcurementDomain && (
                  <div className="overflow-x-auto border border-slate-300 rounded-lg">
                    <table className="w-full text-xs text-left border-collapse">
                      <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-300 uppercase text-[10px]">
                        <tr>
                          <th className="p-2 border-r border-slate-300">PO Number</th>
                          <th className="p-2 border-r border-slate-300">Date</th>
                          <th className="p-2 border-r border-slate-300">Vendor / Supplier</th>
                          <th className="p-2 border-r border-slate-300">FBR NTN</th>
                          <th className="p-2 border-r border-slate-300 text-right">Base Amount (PKR)</th>
                          <th className="p-2 border-r border-slate-300 text-right">GST 18% (PKR)</th>
                          <th className="p-2 border-r border-slate-300 text-right">Grand Total (PKR)</th>
                          <th className="p-2 text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 font-mono">
                        {procurementRows.map((row) => (
                          <tr key={row.poNo} className="hover:bg-slate-50">
                            <td className="p-2 border-r border-slate-200 font-bold text-purple-700">{row.poNo}</td>
                            <td className="p-2 border-r border-slate-200">{row.date}</td>
                            <td className="p-2 border-r border-slate-200 font-sans font-semibold">{row.vendor}</td>
                            <td className="p-2 border-r border-slate-200 text-slate-600">{row.ntn}</td>
                            <td className="p-2 border-r border-slate-200 text-right">Rs. {row.base.toLocaleString()}</td>
                            <td className="p-2 border-r border-slate-200 text-right text-blue-700">Rs. {row.gst.toLocaleString()}</td>
                            <td className="p-2 border-r border-slate-200 text-right font-bold text-slate-900">Rs. {row.total.toLocaleString()}</td>
                            <td className="p-2 text-center">
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                                {row.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {isHrDomain && (
                  <div className="overflow-x-auto border border-slate-300 rounded-lg">
                    <table className="w-full text-xs text-left border-collapse">
                      <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-300 uppercase text-[10px]">
                        <tr>
                          <th className="p-2 border-r border-slate-300">Emp ID</th>
                          <th className="p-2 border-r border-slate-300">Employee Name</th>
                          <th className="p-2 border-r border-slate-300">Department</th>
                          <th className="p-2 border-r border-slate-300">Designation</th>
                          <th className="p-2 border-r border-slate-300 text-right">Basic (PKR)</th>
                          <th className="p-2 border-r border-slate-300 text-right">Allowances</th>
                          <th className="p-2 border-r border-slate-300 text-right">Gross (PKR)</th>
                          <th className="p-2 border-r border-slate-300 text-right">Tax Sec 149</th>
                          <th className="p-2 text-right">Net Payable</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 font-mono">
                        {hrRows.map((row) => (
                          <tr key={row.id} className="hover:bg-slate-50">
                            <td className="p-2 border-r border-slate-200 font-bold text-amber-700">{row.id}</td>
                            <td className="p-2 border-r border-slate-200 font-sans font-semibold">{row.name}</td>
                            <td className="p-2 border-r border-slate-200 font-sans text-slate-600">{row.dept}</td>
                            <td className="p-2 border-r border-slate-200 font-sans text-slate-500">{row.desig}</td>
                            <td className="p-2 border-r border-slate-200 text-right">Rs. {row.basic.toLocaleString()}</td>
                            <td className="p-2 border-r border-slate-200 text-right">Rs. {row.allow.toLocaleString()}</td>
                            <td className="p-2 border-r border-slate-200 text-right font-bold">Rs. {row.gross.toLocaleString()}</td>
                            <td className="p-2 border-r border-slate-200 text-right text-red-600">Rs. {row.tax.toLocaleString()}</td>
                            <td className="p-2 text-right font-black text-emerald-800">Rs. {row.net.toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {isAccountsDomain && (
                  <div className="overflow-x-auto border border-slate-300 rounded-lg">
                    <table className="w-full text-xs text-left border-collapse">
                      <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-300 uppercase text-[10px]">
                        <tr>
                          <th className="p-2 border-r border-slate-300">Voucher / Doc No</th>
                          <th className="p-2 border-r border-slate-300">Date</th>
                          <th className="p-2 border-r border-slate-300">Type</th>
                          <th className="p-2 border-r border-slate-300">Account Code & Description</th>
                          <th className="p-2 border-r border-slate-300 text-right">Debit (PKR)</th>
                          <th className="p-2 text-right">Credit (PKR)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 font-mono">
                        {INITIAL_VOUCHERS.map((v) =>
                          v.items.map((item, idx) => (
                            <tr key={`${v.id}_${idx}`} className="hover:bg-slate-50">
                              <td className="p-2 border-r border-slate-200 font-bold text-blue-800">{v.voucherNo}</td>
                              <td className="p-2 border-r border-slate-200">{v.date}</td>
                              <td className="p-2 border-r border-slate-200 font-semibold">{v.type}</td>
                              <td className="p-2 border-r border-slate-200 font-sans">
                                <div className="font-semibold">{item.accountName}</div>
                                <div className="text-[10px] text-slate-500 font-mono">{item.accountCode} - {item.description}</div>
                              </td>
                              <td className="p-2 border-r border-slate-200 text-right font-bold text-slate-900">
                                {item.debit > 0 ? `Rs. ${item.debit.toLocaleString()}` : '-'}
                              </td>
                              <td className="p-2 text-right font-bold text-slate-900">
                                {item.credit > 0 ? `Rs. ${item.credit.toLocaleString()}` : '-'}
                              </td>
                            </tr>
                          ))
                        )}
                        <tr className="bg-slate-100 font-black border-t-2 border-slate-400">
                          <td colSpan={4} className="p-2 border-r border-slate-300 uppercase text-right">Total Balanced PKR:</td>
                          <td className="p-2 border-r border-slate-300 text-right text-emerald-800">Rs. 5,300,000</td>
                          <td className="p-2 text-right text-emerald-800">Rs. 5,300,000</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )}

                {/* 3-Tier Official Signature Block */}
                <div className="pt-8 border-t border-slate-300 grid grid-cols-3 gap-6 text-center text-[10px] text-slate-500 font-mono">
                  <div>
                    <div className="border-b border-slate-400 pb-8"></div>
                    <div className="mt-1 font-bold text-slate-800 uppercase">Prepared By</div>
                    <div>Operational Officer</div>
                  </div>
                  <div>
                    <div className="border-b border-slate-400 pb-8"></div>
                    <div className="mt-1 font-bold text-slate-800 uppercase">Checked By</div>
                    <div>Internal Auditor</div>
                  </div>
                  <div>
                    <div className="border-b border-slate-400 pb-8"></div>
                    <div className="mt-1 font-bold text-slate-800 uppercase">Approved By</div>
                    <div>Director / Chief Executive Officer</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Buttons */}
        <div className="px-6 py-3.5 bg-slate-100 border-t border-slate-200 flex items-center justify-between shrink-0">
          <div className="text-xs text-slate-500 font-mono">
            <span>FBR STRN / NTN Audit Trail Verified</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportExcel}
              className="px-3.5 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1.5 shadow-sm"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>Export CSV</span>
            </button>

            {!showReportPreview ? (
              <button
                onClick={() => setShowReportPreview(true)}
                className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm"
              >
                <Eye className="w-4 h-4" />
                <span>Generate Preview & PDF</span>
              </button>
            ) : (
              <button
                onClick={() => setShowReportPreview(false)}
                className="px-4 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-700 text-xs font-bold"
              >
                Back to Parameters
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
