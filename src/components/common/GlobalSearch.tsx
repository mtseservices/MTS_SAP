import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  DollarSign,
  ShoppingCart,
  Boxes,
  Receipt,
  Factory,
  Users,
  FileCheck2,
  BarChart3,
  CheckSquare,
  Sparkles,
  Settings,
  ShieldAlert,
  Building2,
  ArrowRight,
  X,
  Command,
  FileText,
  FolderTree,
  PieChart,
  Box
} from 'lucide-react';
import { useAuthTenant } from '../../context/AuthTenantContext';
import { ActiveTab } from './Sidebar';
import {
  INITIAL_ACCOUNTS,
  INITIAL_VOUCHERS,
  INITIAL_INVENTORY,
  INITIAL_PURCHASE_ORDERS,
  INITIAL_SALES_INVOICES,
  INITIAL_EMPLOYEES
} from '../../services/mockData';

export interface SearchResultItem {
  id: string;
  type: 'MODULE' | 'DEFINITION' | 'FORM' | 'REPORT' | 'VOUCHER' | 'PURCHASE' | 'INVOICE' | 'ITEM' | 'EMPLOYEE' | 'COMPANY';
  title: string;
  subtitle: string;
  code?: string;
  targetTab: ActiveTab;
  subcategory?: string;
  subtab?: string;
}

interface GlobalSearchProps {
  onSelectTab: (tab: ActiveTab, subcategory?: string, subtab?: string) => void;
}

export const GlobalSearch: React.FC<GlobalSearchProps> = ({ onSelectTab }) => {
  const { isMasterPortal, allCompanies, switchTenantBySlug } = useAuthTenant();
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Global Keyboard Shortcut: Ctrl + K or Cmd + K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
        if (inputRef.current) {
          inputRef.current.focus();
        }
      } else if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 1. Modules
  const modules: SearchResultItem[] = [
    { id: 'm_dash', type: 'MODULE', title: 'Executive Dashboard', subtitle: 'Key Financial Metrics & Real-time Operations', targetTab: 'dashboard' },
    { id: 'm_fin', type: 'MODULE', title: 'Finance & Accounts', subtitle: 'Chart of Accounts, General Ledger, Vouchers, P&L', targetTab: 'finance' },
    { id: 'm_proc', type: 'MODULE', title: 'Procurement & Purchasing', subtitle: 'Requisitions, RFQs, Purchase Orders (PO), GRN', targetTab: 'procurement' },
    { id: 'm_inv', type: 'MODULE', title: 'Inventory & Warehousing', subtitle: 'Master Catalog, Stock Ledgers, Reorder Alerts', targetTab: 'inventory' },
    { id: 'm_sale', type: 'MODULE', title: 'Sales & Express POS Counter', subtitle: 'Tax Invoices, Express POS, Quotations', targetTab: 'sales' },
    { id: 'm_prod', type: 'MODULE', title: 'Production & Manufacturing', subtitle: 'Bill of Materials (BOM), Work Orders, QA Logs', targetTab: 'production' },
    { id: 'm_hr', type: 'MODULE', title: 'HR & Payroll Management', subtitle: 'Employee Profiles, Attendance, Salary Slips', targetTab: 'hr' },
    { id: 'm_form', type: 'MODULE', title: 'Dynamic Form Builder', subtitle: 'Design & Render Custom Operational Forms', targetTab: 'formBuilder' },
    { id: 'm_rep', type: 'MODULE', title: 'Universal Reporting Engine', subtitle: 'Custom Reports, Excel Exports, P&L Summaries', targetTab: 'reports' },
    { id: 'm_appr', type: 'MODULE', title: 'Approval Workflow Engine', subtitle: 'Multi-stage Supervisor & Director Approvals', targetTab: 'approvals' },
    { id: 'm_ai', type: 'MODULE', title: 'Gemini AI & Voice Center', subtitle: 'AI Forecasts, Natural Speech TTS, Smart Prompts', targetTab: 'aiAssistant' },
    { id: 'm_set', type: 'MODULE', title: 'Company Settings & Branding', subtitle: 'Active Modules, FBR Credentials, Theme Palette', targetTab: 'companySettings' },
  ];

  // 2. Specific Definitions Setup
  const definitions: SearchResultItem[] = [
    { id: 'def_coa', type: 'DEFINITION', title: 'Chart of Accounts (COA)', subtitle: 'Setup Account Heads (Assets, Liabilities, Income, Expenses)', targetTab: 'finance', subcategory: 'definitions', subtab: 'coa' },
    { id: 'def_supp', type: 'DEFINITION', title: 'Suppliers & Creditors Master', subtitle: 'Vendor Profiles & Payable Accounts', targetTab: 'finance', subcategory: 'definitions', subtab: 'suppliers' },
    { id: 'def_items', type: 'DEFINITION', title: 'Master Item Catalog', subtitle: 'SKU Codes, Categories, Reorder Levels, Barcodes', targetTab: 'inventory', subcategory: 'definitions', subtab: 'item_master' },
    { id: 'def_ware', type: 'DEFINITION', title: 'Warehouse Locations', subtitle: 'Lahore Central, Karachi Hub, Islamabad Store', targetTab: 'inventory', subcategory: 'definitions', subtab: 'warehouses' },
    { id: 'def_cust', type: 'DEFINITION', title: 'Customer Directory', subtitle: 'Client NTNs, Credit Limits, Receivables', targetTab: 'sales', subcategory: 'definitions', subtab: 'customers' },
    { id: 'def_emp', type: 'DEFINITION', title: 'Employee Directory', subtitle: 'Staff Profiles, Designations, Salary Bands', targetTab: 'hr', subcategory: 'definitions', subtab: 'emp_dir' },
  ];

  // 3. Specific Forms
  const forms: SearchResultItem[] = [
    { id: 'f_jv', type: 'FORM', title: 'Journal Voucher Entry Form', subtitle: 'Post JV / BPV / CPV / BRV Double-Entry Transactions', targetTab: 'finance', subcategory: 'forms', subtab: 'voucher' },
    { id: 'f_po', type: 'FORM', title: 'Issue Purchase Order (PO)', subtitle: 'Generate PO with 18% STRN Sales Tax', targetTab: 'procurement', subcategory: 'forms', subtab: 'po_issue' },
    { id: 'f_pos', type: 'FORM', title: 'Express POS Retail Checkout', subtitle: 'Barcode Scan, Instant Tax Invoice & Print Receipt', targetTab: 'sales', subcategory: 'forms', subtab: 'pos_counter' },
    { id: 'f_inv', type: 'FORM', title: 'Issue Tax Invoice (FBR STRN 18%)', subtitle: 'Commercial Tax Invoice Generation', targetTab: 'sales', subcategory: 'forms', subtab: 'tax_invoice' },
    { id: 'f_grn', type: 'FORM', title: 'Goods Receipt Note (GRN)', subtitle: 'Inspect & Receive Stock in Warehouse', targetTab: 'inventory', subcategory: 'forms', subtab: 'grn_entry' },
    { id: 'f_bom', type: 'FORM', title: 'Bill of Materials (BOM) Setup', subtitle: 'Define Product Formulations & Raw Material Requirements', targetTab: 'production', subcategory: 'forms', subtab: 'bom_setup' },
    { id: 'f_wo', type: 'FORM', title: 'Work Order Entry', subtitle: 'Issue Manufacturing Job Orders', targetTab: 'production', subcategory: 'forms', subtab: 'work_order' },
    { id: 'f_att', type: 'FORM', title: 'Employee Attendance & Leave', subtitle: 'Log Attendance & Leave Applications', targetTab: 'hr', subcategory: 'forms', subtab: 'attendance' },
  ];

  // 4. Specific Reports
  const reports: SearchResultItem[] = [
    { id: 'r_gl', type: 'REPORT', title: 'General Ledger Statement', subtitle: 'Line-by-line Debit/Credit Ledger Entries', targetTab: 'finance', subcategory: 'reports', subtab: 'general_ledger' },
    { id: 'r_tb', type: 'REPORT', title: 'Trial Balance Statement', subtitle: 'Summary Balances for All Account Heads', targetTab: 'finance', subcategory: 'reports', subtab: 'trial_balance' },
    { id: 'r_pnl', type: 'REPORT', title: 'Profit & Loss (P&L) Statement', subtitle: 'Gross Revenue, COGS, Operating Expenses & Net Income', targetTab: 'finance', subcategory: 'reports', subtab: 'profit_loss' },
    { id: 'r_stock', type: 'REPORT', title: 'Stock Ledger & Valuation Report', subtitle: 'Warehouse Inventory Balances & Reorder Warnings', targetTab: 'inventory', subcategory: 'reports', subtab: 'stock_ledger' },
    { id: 'r_sales', type: 'REPORT', title: 'Sales Register & Daily POS Summary', subtitle: 'Customer Receivables & STRN Tax Summary', targetTab: 'sales', subcategory: 'reports', subtab: 'sales_register' },
    { id: 'r_pay', type: 'REPORT', title: 'Salary Slip Register & Tax Deductions', subtitle: 'Monthly Net Payroll & Tax Withholdings', targetTab: 'hr', subcategory: 'reports', subtab: 'salary_slips' },
  ];

  // 5. Specific Records & Documents
  const vouchers: SearchResultItem[] = INITIAL_VOUCHERS.map((v) => ({
    id: v.id,
    type: 'VOUCHER',
    title: `Voucher #${v.voucherNo}`,
    subtitle: `${v.narration} (Rs. ${v.totalAmount.toLocaleString()})`,
    code: v.voucherNo,
    targetTab: 'finance',
    subcategory: 'forms',
    subtab: 'vouchers'
  }));

  const pos: SearchResultItem[] = INITIAL_PURCHASE_ORDERS.map((p) => ({
    id: p.id,
    type: 'PURCHASE',
    title: `PO #${p.poNumber} (${p.vendorName})`,
    subtitle: `Total PO Amount: Rs. ${p.totalAmount.toLocaleString()}`,
    code: p.poNumber,
    targetTab: 'procurement',
    subcategory: 'forms',
    subtab: 'po_issue'
  }));

  const invoices: SearchResultItem[] = INITIAL_SALES_INVOICES.map((i) => ({
    id: i.id,
    type: 'INVOICE',
    title: `Invoice #${i.invoiceNo} (${i.customerName})`,
    subtitle: `Grand Total: Rs. ${i.grandTotal.toLocaleString()}`,
    code: i.invoiceNo,
    targetTab: 'sales',
    subcategory: 'forms',
    subtab: 'tax_invoice'
  }));

  const items: SearchResultItem[] = INITIAL_INVENTORY.map((i) => ({
    id: i.id,
    type: 'ITEM',
    title: `${i.name} (${i.code})`,
    subtitle: `Stock: ${i.currentStock} ${i.uom} @ Rs. ${i.unitPrice}/unit`,
    code: i.code,
    targetTab: 'inventory',
    subcategory: 'definitions',
    subtab: 'item_master'
  }));

  const employees: SearchResultItem[] = INITIAL_EMPLOYEES.map((e) => ({
    id: e.id,
    type: 'EMPLOYEE',
    title: `${e.fullName} (${e.designation})`,
    subtitle: `Dept: ${e.department} • CNIC: ${e.cnic}`,
    code: e.code,
    targetTab: 'hr',
    subcategory: 'definitions',
    subtab: 'emp_dir'
  }));

  const companies: SearchResultItem[] = allCompanies.map((c) => ({
    id: c.id,
    type: 'COMPANY',
    title: `Company Tenant: ${c.name}`,
    subtitle: `Slug: ${c.slug} • Industry: ${c.industry}`,
    code: c.code,
    targetTab: 'masterCompanies'
  }));

  const allSearchable = [
    ...modules,
    ...definitions,
    ...forms,
    ...reports,
    ...vouchers,
    ...pos,
    ...invoices,
    ...items,
    ...employees,
    ...companies
  ];

  const results =
    query.trim() === ''
      ? [...modules.slice(0, 4), ...forms.slice(0, 3), ...reports.slice(0, 3)]
      : allSearchable
          .filter(
            (item) =>
              item.title.toLowerCase().includes(query.toLowerCase()) ||
              item.subtitle.toLowerCase().includes(query.toLowerCase()) ||
              (item.code && item.code.toLowerCase().includes(query.toLowerCase()))
          )
          .slice(0, 12);

  const handleSelect = (item: SearchResultItem) => {
    if (item.type === 'COMPANY') {
      const found = allCompanies.find((c) => c.id === item.id);
      if (found) switchTenantBySlug(found.slug);
    }

    onSelectTab(item.targetTab, item.subcategory, item.subtab);
    setQuery('');
    setIsOpen(false);
  };

  const badgeColors: Record<string, string> = {
    MODULE: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
    DEFINITION: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    FORM: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
    REPORT: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    VOUCHER: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    PURCHASE: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    INVOICE: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    ITEM: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
    EMPLOYEE: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
    COMPANY: 'bg-purple-500/20 text-purple-300 border-purple-500/30'
  };

  return (
    <div ref={containerRef} className="relative flex-1 max-w-md">
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          ref={inputRef}
          type="text"
          placeholder="Global ERP Search (Modules, Forms, Reports)..."
          value={query}
          onFocus={() => setIsOpen(true)}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          className="w-full pl-9 pr-14 py-1.5 rounded-xl bg-slate-800/90 border border-slate-700 text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:border-cyan-500 transition-all shadow-inner"
        />

        {query ? (
          <button
            onClick={() => setQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        ) : (
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700 text-[10px] font-mono text-slate-400 pointer-events-none">
            <Command className="w-2.5 h-2.5" /> K
          </div>
        )}
      </div>

      {isOpen && (
        <div className="absolute left-0 right-0 mt-2 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2 max-h-[420px] overflow-y-auto">
          <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800 flex justify-between items-center">
            <span>Global ERP Jump-To Search</span>
            <span className="text-cyan-400 font-mono">{results.length} items</span>
          </div>

          <div className="py-1 space-y-1">
            {results.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-500 font-medium">
                No matching modules, forms, reports, or ERP records found.
              </div>
            ) : (
              results.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleSelect(item)}
                  className="w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between hover:bg-slate-800/80 transition-all group"
                >
                  <div className="space-y-0.5 pr-2 overflow-hidden">
                    <div className="font-bold text-slate-100 flex items-center gap-2 truncate">
                      <span className={`text-[9px] px-1.5 py-0.2 rounded font-mono font-bold uppercase border ${badgeColors[item.type]}`}>
                        {item.type}
                      </span>
                      <span className="truncate">{item.title}</span>
                    </div>
                    <div className="text-[11px] text-slate-400 truncate">
                      {item.subtitle}
                    </div>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all shrink-0" />
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
