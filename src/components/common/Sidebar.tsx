import React, { useState } from 'react';
import {
  LayoutDashboard,
  Building2,
  DollarSign,
  ShoppingCart,
  Boxes,
  Receipt,
  Factory,
  Users,
  FileCheck2,
  BarChart3,
  Sparkles,
  Settings,
  ShieldCheck,
  Globe2,
  SlidersHorizontal,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  CreditCard,
  History,
  FolderTree,
  FileText,
  PieChart,
  Activity,
  ShieldAlert
} from 'lucide-react';
import { useAuthTenant } from '../../context/AuthTenantContext';
import { useLanguage } from '../../context/LanguageContext';
import { ReportParameterModal, ReportConfigTarget } from './ReportParameterModal';

export type ActiveTab =
  | 'dashboard'
  | 'finance'
  | 'procurement'
  | 'inventory'
  | 'sales'
  | 'production'
  | 'hr'
  | 'formBuilder'
  | 'reports'
  | 'approvals'
  | 'aiAssistant'
  | 'companySettings'
  | 'auditLogs'
  | 'crm'
  // Master Admin Tabs
  | 'masterDashboard'
  | 'masterCompanies'
  | 'masterRegister'
  | 'masterSubdomains'
  | 'masterSubscriptions'
  | 'masterAudit'
  | 'masterSystemHealth'
  | 'masterRateLimits';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab, subcategory?: string, subtab?: string) => void;
}

interface DepartmentMenuStructure {
  id: ActiveTab;
  label: string;
  icon: any;
  definitions: { id: string; label: string }[];
  forms: { id: string; label: string }[];
  reports: { id: string; label: string }[];
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const { isMasterPortal, currentCompany } = useAuthTenant();
  const { t, dir } = useLanguage();

  // Expanded parent departments state
  const [expandedDept, setExpandedDept] = useState<ActiveTab | null>(activeTab);
  // Expanded subcategory state ('definitions' | 'forms' | 'reports')
  const [expandedSubCat, setExpandedSubCat] = useState<string | null>('forms');
  // Report parameter modal target matching image_21e62cc3.png
  const [selectedReportTarget, setSelectedReportTarget] = useState<ReportConfigTarget | null>(null);

  const masterNav = [
    { id: 'masterDashboard' as ActiveTab, label: 'Master Overview', icon: LayoutDashboard },
    { id: 'masterCompanies' as ActiveTab, label: 'Client Companies', icon: Building2 },
    { id: 'masterRegister' as ActiveTab, label: 'Register New Company', icon: SlidersHorizontal },
    { id: 'masterSubdomains' as ActiveTab, label: 'Company URLs & Slugs', icon: Globe2 },
    { id: 'masterSubscriptions' as ActiveTab, label: 'Subscription & Billing', icon: CreditCard },
    { id: 'masterAudit' as ActiveTab, label: 'Global Audit Logs', icon: History },
    { id: 'masterSystemHealth' as ActiveTab, label: 'System Health & Ping', icon: Activity },
    { id: 'masterRateLimits' as ActiveTab, label: 'API Rate Limits & Quotas', icon: ShieldAlert },
  ];

  // Detailed Department Menu Hierarchy
  const departments: DepartmentMenuStructure[] = [
    {
      id: 'finance',
      label: t('finance'),
      icon: DollarSign,
      definitions: [
        { id: 'coa', label: 'Chart of Accounts' },
        { id: 'suppliers', label: 'Suppliers & Creditors' },
        { id: 'cost_center', label: 'Cost Center Setup' }
      ],
      forms: [
        { id: 'voucher', label: 'Journal Voucher (JV)' },
        { id: 'payment', label: 'Payment Voucher (BPV/CPV)' },
        { id: 'cheque', label: 'Cheque Books & Clearance' }
      ],
      reports: [
        { id: 'chart_of_account', label: 'Chart of Account' },
        { id: 'voucher_print', label: 'Voucher Print' },
        { id: 'journal_ledger', label: 'Journal Ledger' },
        { id: 'trial_balance', label: 'Trial Balance' },
        { id: 'day_book', label: 'Day Book' },
        { id: 'daily_bank_activity', label: 'Daily Bank Activity' },
        { id: 'pending_cheque', label: 'Pending Cheque' },
        { id: 'sub_ledger', label: 'Sub ledger' },
        { id: 'po_view', label: 'Po View' },
        { id: 'child_sub_ledger', label: 'Child Sub Ledger' },
        { id: 'user_voucher_posting', label: 'User Voucher Posting' }
      ]
    },
    {
      id: 'procurement',
      label: t('procurement'),
      icon: ShoppingCart,
      definitions: [
        { id: 'vendors', label: 'Vendor Directory' },
        { id: 'req_types', label: 'Requisition Types' }
      ],
      forms: [
        { id: 'po_issue', label: 'Issue Purchase Order (PO)' },
        { id: 'po_requisition', label: 'Purchase Requisitions' },
        { id: 'grn_receive', label: 'Goods Receipt Note (GRN)' }
      ],
      reports: [
        { id: 'po_register', label: 'Purchase Order Register' },
        { id: 'vendor_ledger', label: 'Vendor Outstanding Ledger' }
      ]
    },
    {
      id: 'inventory',
      label: t('inventory'),
      icon: Boxes,
      definitions: [
        { id: 'item_master', label: 'Master Item Catalog' },
        { id: 'categories', label: 'Item Categories & UOM' },
        { id: 'warehouses', label: 'Warehouse Locations' }
      ],
      forms: [
        { id: 'stock_adj', label: 'Stock Adjustment Note' },
        { id: 'stock_transfer', label: 'Inter-Warehouse Transfer' },
        { id: 'grn_entry', label: 'GRN Inventory Entry' }
      ],
      reports: [
        { id: 'stock_ledger', label: 'Stock Ledger Report' },
        { id: 'reorder_alerts', label: 'Reorder Level Warnings' },
        { id: 'valuation', label: 'Stock Valuation Report' }
      ]
    },
    {
      id: 'sales',
      label: t('sales'),
      icon: Receipt,
      definitions: [
        { id: 'customers', label: 'Customer Directory' },
        { id: 'price_lists', label: 'Retail Price Lists' },
        { id: 'sales_reps', label: 'Sales Rep Master' }
      ],
      forms: [
        { id: 'pos_counter', label: 'Express POS Counter' },
        { id: 'tax_invoice', label: 'Tax Invoice (STRN 18%)' },
        { id: 'quotations', label: 'Sales Quotations' }
      ],
      reports: [
        { id: 'sales_register', label: 'Sales Register' },
        { id: 'customer_aging', label: 'Customer Receivables Aging' },
        { id: 'daily_pos', label: 'Daily POS Sales Summary' }
      ]
    },
    {
      id: 'production',
      label: t('production'),
      icon: Factory,
      definitions: [
        { id: 'work_centers', label: 'Work Centers' },
        { id: 'machines', label: 'Machine & Labor Master' }
      ],
      forms: [
        { id: 'bom_setup', label: 'Bill of Materials (BOM)' },
        { id: 'work_order', label: 'Work Order Entry' },
        { id: 'qa_inspection', label: 'Quality Check Log' }
      ],
      reports: [
        { id: 'costing_report', label: 'Production Costing Report' },
        { id: 'wo_progress', label: 'Work Order Progress' }
      ]
    },
    {
      id: 'hr',
      label: t('hr'),
      icon: Users,
      definitions: [
        { id: 'emp_dir', label: 'Employee Directory' },
        { id: 'dept_setup', label: 'Departments & Designations' },
        { id: 'salary_bands', label: 'Salary Bands' }
      ],
      forms: [
        { id: 'attendance', label: 'Attendance Log' },
        { id: 'leave_req', label: 'Leave Request Application' },
        { id: 'payroll_post', label: 'Monthly Payroll Posting' }
      ],
      reports: [
        { id: 'salary_slips', label: 'Salary Slip Register' },
        { id: 'tax_deductions', label: 'Tax Deduction Statement' }
      ]
    }
  ];

  // Helper utility items
  const utilityItems = [
    { id: 'crm' as ActiveTab, label: 'CRM & Sales Pipeline', icon: Users },
    { id: 'formBuilder' as ActiveTab, label: t('formBuilder'), icon: FileCheck2 },
    { id: 'reports' as ActiveTab, label: t('reports'), icon: BarChart3 },
    { id: 'approvals' as ActiveTab, label: t('approvals'), icon: ShieldCheck },
    { id: 'aiAssistant' as ActiveTab, label: t('aiAssistant'), icon: Sparkles },
    { id: 'auditLogs' as ActiveTab, label: t('auditLogs'), icon: History },
    { id: 'companySettings' as ActiveTab, label: t('companySettings'), icon: Settings },
  ];

  // Active Modules Filtering for Client Companies
  const isModuleActive = (moduleId: string): boolean => {
    if (isMasterPortal) return true;
    if (!currentCompany.activeModules || currentCompany.activeModules.length === 0) return true;

    const activeLower = currentCompany.activeModules.map((m) => m.toLowerCase());
    const targetLower = moduleId.toLowerCase();

    if (activeLower.includes(targetLower)) return true;

    if (targetLower === 'finance' && (activeLower.includes('finance') || activeLower.includes('accounts'))) return true;
    if (targetLower === 'procurement' && (activeLower.includes('procurement') || activeLower.includes('purchasing'))) return true;
    if (targetLower === 'inventory' && (activeLower.includes('inventory') || activeLower.includes('warehouse'))) return true;
    if (targetLower === 'sales' && (activeLower.includes('sales') || activeLower.includes('pos'))) return true;
    if (targetLower === 'production' && (activeLower.includes('production') || activeLower.includes('manufacturing'))) return true;
    if (targetLower === 'hr' && (activeLower.includes('hr') || activeLower.includes('payroll'))) return true;

    if (targetLower === 'formbuilder' && (activeLower.includes('forms') || activeLower.includes('form builder'))) return true;
    if (targetLower === 'reports' && (activeLower.includes('reports') || activeLower.includes('reporting'))) return true;
    if (targetLower === 'approvals' && (activeLower.includes('approvals') || activeLower.includes('approval'))) return true;
    if (targetLower === 'aiassistant' && (activeLower.includes('ai assistant') || activeLower.includes('ai'))) return true;

    if (targetLower === 'companysettings' || targetLower === 'auditlogs' || targetLower === 'dashboard') return true;

    return false;
  };

  const handleSubItemClick = (deptId: ActiveTab, subcategory: string, subtabId: string) => {
    setActiveTab(deptId, subcategory, subtabId);

    // If a report subtab was clicked, pop up the universal report parameter form matching image_21e62cc3.png
    if (subcategory === 'reports') {
      const deptObj = departments.find((d) => d.id === deptId);
      const reportItem = deptObj?.reports.find((r) => r.id === subtabId);
      const label = reportItem ? reportItem.label : subtabId.replace(/_/g, ' ').toUpperCase();
      let code = subtabId.toUpperCase();
      if (!code.endsWith('_REP')) {
        code = `${code}_REP`;
      }
      setSelectedReportTarget({
        id: subtabId,
        code,
        title: label,
        category: deptId === 'finance' ? 'Accounts' : deptId === 'inventory' ? 'Inventory' : deptId === 'procurement' ? 'Procurement' : 'Sales'
      });
    }

    // Update URL query parameters
    const url = new URL(window.location.href);
    url.searchParams.set('module', deptId);
    url.searchParams.set('subcategory', subcategory);
    url.searchParams.set('subtab', subtabId);
    window.history.pushState({}, '', url.toString());
  };

  return (
    <>
      <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col shrink-0 min-h-[calc(100vh-57px)]">
      {/* Header Banner */}
      <div className="p-4 border-b border-slate-800/80">
        {isMasterPortal ? (
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-purple-950/50 border border-purple-800/50 text-purple-200">
            <ShieldCheck className="w-4 h-4 text-purple-400 shrink-0" />
            <div>
              <div className="font-bold text-xs uppercase tracking-wider">Master Central</div>
              <div className="text-[10px] text-purple-300/80">Global Tenant Management</div>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-cyan-950/50 border border-cyan-800/50 text-cyan-200">
            <Building2 className="w-4 h-4 text-cyan-400 shrink-0" />
            <div className="overflow-hidden">
              <div className="font-bold text-xs truncate">{currentCompany.name}</div>
              <div className="text-[10px] text-cyan-300/80 font-mono truncate">
                mts-sap.vercel.app?company={currentCompany.slug}
              </div>
            </div>
          </div>
        )}
      </div>

      <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto">
        {/* Section Heading */}
        <div className="px-3 py-1 text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center justify-between">
          <span>{isMasterPortal ? 'System Control' : 'ERP Departments'}</span>
          {!isMasterPortal && currentCompany.industry && (
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-cyan-400 font-mono">
              {currentCompany.industry}
            </span>
          )}
        </div>

        {/* Master Portal Navigation */}
        {isMasterPortal &&
          masterNav.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/80'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {isActive && <ChevronRight className="w-3.5 h-3.5" />}
              </button>
            );
          })}

        {/* Executive Dashboard */}
        {!isMasterPortal && (
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'dashboard'
                ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/30'
                : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/80'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <LayoutDashboard className="w-4 h-4 text-cyan-400" />
              <span>{t('dashboard')}</span>
            </div>
          </button>
        )}

        {/* Client Department Hierarchical Tabs */}
        {!isMasterPortal &&
          departments.map((dept) => {
            if (!isModuleActive(dept.id)) return null;

            const Icon = dept.icon;
            const isDeptActive = activeTab === dept.id;
            const isDeptExpanded = expandedDept === dept.id;

            return (
              <div key={dept.id} className="space-y-1">
                {/* Department Main Button */}
                <button
                  onClick={() => {
                    setActiveTab(dept.id);
                    setExpandedDept(isDeptExpanded ? null : dept.id);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                    isDeptActive
                      ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/20'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isDeptActive ? 'text-white' : 'text-cyan-400'}`} />
                    <span>{dept.label}</span>
                  </div>
                  {isDeptExpanded ? (
                    <ChevronDown className="w-3.5 h-3.5 text-cyan-300" />
                  ) : dir === 'rtl' ? (
                    <ChevronLeft className="w-3.5 h-3.5 text-slate-500" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                  )}
                </button>

                {/* Subtabs Accordion: Definitions, Forms, Reports */}
                {isDeptExpanded && (
                  <div className={`${dir === 'rtl' ? 'mr-4 pr-2 border-r' : 'ml-4 pl-2 border-l'} border-slate-800 space-y-1 my-1 animate-in fade-in`}>
                    {/* 1. Definitions Category */}
                    <div>
                      <button
                        onClick={() =>
                          setExpandedSubCat(expandedSubCat === `${dept.id}_defs` ? null : `${dept.id}_defs`)
                        }
                        className="w-full flex items-center justify-between py-1 px-2 text-[11px] font-bold text-slate-400 hover:text-amber-300 transition-colors"
                      >
                        <div className="flex items-center gap-1.5">
                          <FolderTree className="w-3 h-3 text-amber-400" />
                          <span>{t('definitions')}</span>
                        </div>
                        <span className="text-[9px] px-1 rounded bg-slate-800 text-slate-400 font-mono">
                          {dept.definitions.length}
                        </span>
                      </button>

                      {expandedSubCat === `${dept.id}_defs` && (
                        <div className={`${dir === 'rtl' ? 'mr-3 border-r pr-2' : 'ml-3 border-l pl-2'} border-slate-800 space-y-0.5 my-1`}>
                          {dept.definitions.map((sub) => (
                            <button
                              key={sub.id}
                              onClick={() => handleSubItemClick(dept.id, 'definitions', sub.id)}
                              className="w-full text-left py-1 px-2 text-[11px] rounded text-slate-400 hover:text-slate-100 hover:bg-slate-800/60 truncate"
                            >
                              • {sub.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* 2. Forms Category */}
                    <div>
                      <button
                        onClick={() =>
                          setExpandedSubCat(expandedSubCat === `${dept.id}_forms` ? null : `${dept.id}_forms`)
                        }
                        className="w-full flex items-center justify-between py-1 px-2 text-[11px] font-bold text-slate-400 hover:text-cyan-300 transition-colors"
                      >
                        <div className="flex items-center gap-1.5">
                          <FileText className="w-3 h-3 text-cyan-400" />
                          <span>{t('forms')}</span>
                        </div>
                        <span className="text-[9px] px-1 rounded bg-slate-800 text-slate-400 font-mono">
                          {dept.forms.length}
                        </span>
                      </button>

                      {(expandedSubCat === `${dept.id}_forms` || expandedSubCat === 'forms') && (
                        <div className={`${dir === 'rtl' ? 'mr-3 border-r pr-2' : 'ml-3 border-l pl-2'} border-slate-800 space-y-0.5 my-1`}>
                          {dept.forms.map((sub) => (
                            <button
                              key={sub.id}
                              onClick={() => handleSubItemClick(dept.id, 'forms', sub.id)}
                              className="w-full text-left py-1 px-2 text-[11px] rounded text-slate-400 hover:text-slate-100 hover:bg-slate-800/60 truncate"
                            >
                              • {sub.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* 3. Reports Category */}
                    <div>
                      <button
                        onClick={() =>
                          setExpandedSubCat(expandedSubCat === `${dept.id}_reports` ? null : `${dept.id}_reports`)
                        }
                        className="w-full flex items-center justify-between py-1 px-2 text-[11px] font-bold text-slate-400 hover:text-emerald-300 transition-colors"
                      >
                        <div className="flex items-center gap-1.5">
                          <PieChart className="w-3 h-3 text-emerald-400" />
                          <span>{t('reportsTab')}</span>
                        </div>
                        <span className="text-[9px] px-1 rounded bg-slate-800 text-slate-400 font-mono">
                          {dept.reports.length}
                        </span>
                      </button>

                      {expandedSubCat === `${dept.id}_reports` && (
                        <div className={`${dir === 'rtl' ? 'mr-3 border-r pr-2' : 'ml-3 border-l pl-2'} border-slate-800 space-y-0.5 my-1`}>
                          {dept.reports.map((sub) => (
                            <button
                              key={sub.id}
                              onClick={() => handleSubItemClick(dept.id, 'reports', sub.id)}
                              className="w-full text-left py-1 px-2 text-[11px] rounded text-slate-400 hover:text-slate-100 hover:bg-slate-800/60 truncate"
                            >
                              • {sub.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}

        {/* Utility Items */}
        {!isMasterPortal && (
          <div className="pt-2 border-t border-slate-800/60 space-y-1">
            <div className="px-3 py-1 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
              System Utilities
            </div>

            {utilityItems.map((item) => {
              if (!isModuleActive(item.id)) return null;

              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-slate-800 text-white border border-slate-700'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4 text-slate-400" />
                    <span>{item.label}</span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </nav>

      <div className="p-3 border-t border-slate-800 text-[11px] text-slate-500 text-center font-mono">
        Pakistan Localization (PKR) • FBR Compliant
      </div>
    </aside>

    {/* Universal Report Parameter Popup matching image_21e62cc3.png */}
    <ReportParameterModal
      isOpen={!!selectedReportTarget}
      onClose={() => setSelectedReportTarget(null)}
      reportTarget={selectedReportTarget}
    />
  </>
  );
};
