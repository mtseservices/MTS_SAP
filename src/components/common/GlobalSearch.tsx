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
  X
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

interface SearchResultItem {
  id: string;
  type: 'MODULE' | 'VOUCHER' | 'PURCHASE' | 'INVOICE' | 'ITEM' | 'EMPLOYEE' | 'COMPANY';
  title: string;
  subtitle: string;
  code?: string;
  targetTab: ActiveTab;
}

interface GlobalSearchProps {
  onSelectTab: (tab: ActiveTab) => void;
}

export const GlobalSearch: React.FC<GlobalSearchProps> = ({ onSelectTab }) => {
  const { isMasterPortal, allCompanies, switchTenantBySlug } = useAuthTenant();
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const modules: SearchResultItem[] = [
    { id: 'm_dash', type: 'MODULE', title: 'Executive Dashboard', subtitle: 'Key Metrics & Analytics', targetTab: 'dashboard' },
    { id: 'm_fin', type: 'MODULE', title: 'Finance & Accounts', subtitle: 'Chart of Accounts, Ledger, Vouchers', targetTab: 'finance' },
    { id: 'm_proc', type: 'MODULE', title: 'Procurement & Purchasing', subtitle: 'Purchase Requisitions, RFQs, POs', targetTab: 'procurement' },
    { id: 'm_inv', type: 'MODULE', title: 'Inventory & Warehousing', subtitle: 'Item Master, Batches, Stock Balances', targetTab: 'inventory' },
    { id: 'm_sale', type: 'MODULE', title: 'Sales & Express POS Counter', subtitle: 'Quotations, Invoices, POS Counter', targetTab: 'sales' },
    { id: 'm_prod', type: 'MODULE', title: 'Production & Manufacturing', subtitle: 'BOM Recipes, Work Orders, WIP', targetTab: 'production' },
    { id: 'm_hr', type: 'MODULE', title: 'HR & Payroll Management', subtitle: 'Employee Profiles, Attendance, Payslips', targetTab: 'hr' },
    { id: 'm_form', type: 'MODULE', title: 'Dynamic Form Builder', subtitle: 'Design Custom Operational Forms', targetTab: 'formBuilder' },
    { id: 'm_rep', type: 'MODULE', title: 'Universal Reporting Engine', subtitle: 'P&L, Trial Balance, Stock Valuation', targetTab: 'reports' },
    { id: 'm_appr', type: 'MODULE', title: 'Approval Workflow Engine', subtitle: 'Multi-stage Gate Approvals', targetTab: 'approvals' },
    { id: 'm_ai', type: 'MODULE', title: 'Gemini AI Assistant & Voice', subtitle: 'AI Forecasts & Text-To-Speech', targetTab: 'aiAssistant' },
    { id: 'm_set', type: 'MODULE', title: 'Company Settings & Themes', subtitle: 'Profile, Branding, Branch Hubs', targetTab: 'companySettings' },
    { id: 'm_mast', type: 'MODULE', title: 'Master Admin Control Panel', subtitle: 'Central Multi-tenant Management', targetTab: 'masterDashboard' },
  ];

  const vouchers: SearchResultItem[] = INITIAL_VOUCHERS.map(v => ({
    id: v.id,
    type: 'VOUCHER',
    title: `Voucher: ${v.voucherNo}`,
    subtitle: `${v.narration} (Rs. ${v.totalAmount.toLocaleString()})`,
    code: v.voucherNo,
    targetTab: 'finance'
  }));

  const pos: SearchResultItem[] = INITIAL_PURCHASE_ORDERS.map(p => ({
    id: p.id,
    type: 'PURCHASE',
    title: `PO: ${p.poNumber} (${p.vendorName})`,
    subtitle: `Total PO Amount: Rs. ${p.totalAmount.toLocaleString()}`,
    code: p.poNumber,
    targetTab: 'procurement'
  }));

  const invoices: SearchResultItem[] = INITIAL_SALES_INVOICES.map(i => ({
    id: i.id,
    type: 'INVOICE',
    title: `Invoice: ${i.invoiceNo} (${i.customerName})`,
    subtitle: `Grand Total: Rs. ${i.grandTotal.toLocaleString()}`,
    code: i.invoiceNo,
    targetTab: 'sales'
  }));

  const items: SearchResultItem[] = INITIAL_INVENTORY.map(i => ({
    id: i.id,
    type: 'ITEM',
    title: `${i.name} (${i.code})`,
    subtitle: `Stock: ${i.currentStock} ${i.uom} @ Rs. ${i.unitPrice}/unit`,
    code: i.code,
    targetTab: 'inventory'
  }));

  const employees: SearchResultItem[] = INITIAL_EMPLOYEES.map(e => ({
    id: e.id,
    type: 'EMPLOYEE',
    title: `${e.fullName} (${e.designation})`,
    subtitle: `Dept: ${e.department} • CNIC: ${e.cnic}`,
    code: e.code,
    targetTab: 'hr'
  }));

  const companies: SearchResultItem[] = allCompanies.map(c => ({
    id: c.id,
    type: 'COMPANY',
    title: `Company: ${c.name}`,
    subtitle: `Slug: ${c.slug}.erp.mts.pk • Industry: ${c.industry}`,
    code: c.code,
    targetTab: 'masterCompanies'
  }));

  const allSearchable = [
    ...modules,
    ...vouchers,
    ...pos,
    ...invoices,
    ...items,
    ...employees,
    ...companies
  ];

  const results = query.trim() === ''
    ? modules.slice(0, 5)
    : allSearchable.filter(item =>
        item.title.toLowerCase().includes(query.toLowerCase()) ||
        item.subtitle.toLowerCase().includes(query.toLowerCase()) ||
        (item.code && item.code.toLowerCase().includes(query.toLowerCase()))
      ).slice(0, 10);

  const handleSelect = (item: SearchResultItem) => {
    if (item.type === 'COMPANY') {
      const found = allCompanies.find(c => c.id === item.id);
      if (found) switchTenantBySlug(found.slug);
    }
    onSelectTab(item.targetTab);
    setQuery('');
    setIsOpen(false);
  };

  const badgeColors: Record<string, string> = {
    MODULE: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
    VOUCHER: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    PURCHASE: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    INVOICE: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    ITEM: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    EMPLOYEE: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
    COMPANY: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
  };

  return (
    <div ref={containerRef} className="relative flex-1 max-w-sm">
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search modules, vouchers, items, orders..."
          value={query}
          onFocus={() => setIsOpen(true)}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          className="w-full pl-9 pr-8 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:border-cyan-500 transition-all shadow-inner"
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {isOpen && (
        <div className="absolute left-0 right-0 mt-2 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2 max-h-96 overflow-y-auto">
          <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800 flex justify-between">
            <span>Global ERP Quick Search Results</span>
            <span>{results.length} found</span>
          </div>

          <div className="py-1 space-y-1">
            {results.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-500 font-medium">
                No matching ERP modules or documents found.
              </div>
            ) : (
              results.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleSelect(item)}
                  className="w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between hover:bg-slate-800/80 transition-all group"
                >
                  <div className="space-y-0.5">
                    <div className="font-bold text-slate-100 flex items-center gap-2">
                      <span className={`text-[9px] px-1.5 py-0.2 rounded font-mono font-bold uppercase border ${badgeColors[item.type]}`}>
                        {item.type}
                      </span>
                      <span>{item.title}</span>
                    </div>
                    <div className="text-[11px] text-slate-400 max-w-xs truncate">
                      {item.subtitle}
                    </div>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
