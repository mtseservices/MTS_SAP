import React, { useState, useMemo } from 'react';
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
  ShieldAlert,
  TrendingUp,
  Network,
  Search,
  CheckCircle2,
  Wrench,
  Flame,
  Truck,
  FileSpreadsheet,
  Download,
  GitCommit
} from 'lucide-react';
import { useAuthTenant } from '../../context/AuthTenantContext';
import { useLanguage } from '../../context/LanguageContext';
import { ReportParameterModal, ReportConfigTarget } from './ReportParameterModal';
import { StandardDocumentGridForm, FormConfigTarget } from './StandardDocumentGridForm';
import { DepartmentDefinitionModal, DefinitionConfigTarget } from './DepartmentDefinitionModal';
import {
  getCompanyAssignedDepartments
} from '../../services/departmentCategoryMapper';
import { DepartmentCatalogItem } from '../../services/departmentCatalogueData';

export type ActiveTab =
  | 'dashboard'
  | 'departments'
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
  | 'performanceMetrics'
  // Master Admin Tabs
  | 'masterDashboard'
  | 'masterCompanies'
  | 'masterRegister'
  | 'masterSubdomains'
  | 'masterSubscriptions'
  | 'masterAudit'
  | 'masterApiAudit'
  | 'masterAuditInsights'
  | 'masterSystemHealth'
  | 'masterRateLimits'
  | 'masterSettings'
  | 'masterUserCreation'
  | 'masterSystemSecurity'
  | 'masterBatchExport'
  | 'masterWorkflowEditor';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab, subcategory?: string, subtab?: string) => void;
}

// Helper to assign intuitive icons based on department focus
function getDepartmentIcon(dept: DepartmentCatalogItem) {
  const name = dept.name.toLowerCase();
  const cat = dept.category.toLowerCase();

  if (name.includes('finance') || name.includes('account') || name.includes('banking')) return DollarSign;
  if (name.includes('textile') || name.includes('production') || name.includes('weaving') || name.includes('spinning') || name.includes('fabric')) return Factory;
  if (name.includes('inventory') || name.includes('store') || name.includes('warehouse')) return Boxes;
  if (name.includes('procurement') || name.includes('purchase') || name.includes('sourcing')) return ShoppingCart;
  if (name.includes('sales') || name.includes('retail') || name.includes('pos')) return Receipt;
  if (name.includes('human') || name.includes('hr') || name.includes('employee')) return Users;
  if (name.includes('payroll') || name.includes('salary') || name.includes('compensation')) return CreditCard;
  if (name.includes('quality') || name.includes('qa') || name.includes('qc') || name.includes('inspection') || name.includes('haccp')) return ShieldCheck;
  if (name.includes('maintenance') || name.includes('plant') || name.includes('engineering')) return Wrench;
  if (name.includes('supply chain') || name.includes('logistics') || name.includes('shipping') || name.includes('export')) return Truck;
  if (name.includes('solar') || name.includes('energy') || name.includes('power')) return Flame;
  if (name.includes('lab') || name.includes('test') || name.includes('clinical') || name.includes('health')) return Activity;
  if (name.includes('security') || name.includes('gate') || name.includes('hse') || name.includes('safety')) return ShieldAlert;
  if (name.includes('it') || name.includes('software') || name.includes('api') || name.includes('tech')) return Network;
  if (name.includes('planning') || name.includes('ppc')) return TrendingUp;
  if (cat.includes('food')) return Boxes;
  if (cat.includes('construction')) return Building2;
  return FolderTree;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const { isMasterPortal, currentCompany } = useAuthTenant();
  const { t, dir } = useLanguage();

  // Active Company category-assigned departments from the 130 catalog
  const assignedDepts = useMemo(() => {
    return getCompanyAssignedDepartments(currentCompany);
  }, [currentCompany]);

  // Expanded department accordion
  const [expandedDeptId, setExpandedDeptId] = useState<string | null>(() => {
    return assignedDepts.length > 0 ? assignedDepts[0].id : null;
  });

  // Expanded subcategory state ('definitions' | 'forms' | 'reports')
  const [expandedSubCat, setExpandedSubCat] = useState<string | null>('forms');

  // Quick department filter within assigned departments
  const [deptSearchQuery, setDeptSearchQuery] = useState('');

  // Report parameter modal target matching image_21e62cc3.png
  const [selectedReportTarget, setSelectedReportTarget] = useState<ReportConfigTarget | null>(null);
  // Transactional Document (Bill/Invoice/Voucher) multi-row grid form target
  const [selectedFormTarget, setSelectedFormTarget] = useState<FormConfigTarget | null>(null);
  // Department master definition modal target
  const [selectedDefinitionTarget, setSelectedDefinitionTarget] = useState<DefinitionConfigTarget | null>(null);

  const masterNav = [
    { id: 'masterDashboard' as ActiveTab, label: 'Master Overview', icon: LayoutDashboard },
    { id: 'masterCompanies' as ActiveTab, label: 'Client Companies', icon: Building2 },
    { id: 'masterRegister' as ActiveTab, label: 'Register New Company', icon: SlidersHorizontal },
    { id: 'masterSubdomains' as ActiveTab, label: 'Company URLs & Slugs', icon: Globe2 },
    { id: 'masterSubscriptions' as ActiveTab, label: 'Subscription & Billing', icon: CreditCard },
    { id: 'masterAudit' as ActiveTab, label: 'Global Audit Logs', icon: History },
    { id: 'masterApiAudit' as ActiveTab, label: 'System API Audit', icon: Network },
    { id: 'masterAuditInsights' as ActiveTab, label: 'Audit Insights', icon: TrendingUp },
    { id: 'masterSystemHealth' as ActiveTab, label: 'System Health & Ping', icon: Activity },
    { id: 'masterRateLimits' as ActiveTab, label: 'API Rate Limits & Quotas', icon: ShieldAlert },
    { id: 'masterSettings' as ActiveTab, label: 'System Settings', icon: Settings },
    { id: 'masterUserCreation' as ActiveTab, label: 'User Creation Portal', icon: Users },
    { id: 'masterSystemSecurity' as ActiveTab, label: 'System Security & Sessions', icon: ShieldAlert },
    { id: 'masterBatchExport' as ActiveTab, label: 'Batch Client Data Export', icon: Download },
    { id: 'masterWorkflowEditor' as ActiveTab, label: 'Approval Workflow Editor', icon: GitCommit },
  ];

  // Helper utility items (The isolated "130 Department Master" bottom link has been removed as requested)
  const utilityItems = [
    { id: 'reports' as ActiveTab, label: 'Universal Reporting Engine', icon: BarChart3 },
    { id: 'approvals' as ActiveTab, label: t('approvals'), icon: ShieldCheck },
    { id: 'crm' as ActiveTab, label: 'CRM & Sales Pipeline', icon: Users },
    { id: 'performanceMetrics' as ActiveTab, label: 'Performance Metrics', icon: TrendingUp },
    { id: 'formBuilder' as ActiveTab, label: t('formBuilder'), icon: FileCheck2 },
    { id: 'aiAssistant' as ActiveTab, label: t('aiAssistant'), icon: Sparkles },
    { id: 'auditLogs' as ActiveTab, label: t('auditLogs'), icon: History },
    { id: 'companySettings' as ActiveTab, label: t('companySettings'), icon: Settings },
  ];

  // Filter assigned departments based on quick search
  const visibleDepts = useMemo(() => {
    if (!deptSearchQuery.trim()) return assignedDepts;
    const q = deptSearchQuery.toLowerCase();
    return assignedDepts.filter(
      (dept) =>
        dept.name.toLowerCase().includes(q) ||
        dept.definitions.some((d) => d.toLowerCase().includes(q)) ||
        dept.forms.some((f) => f.name.toLowerCase().includes(q) || f.code.toLowerCase().includes(q)) ||
        dept.reports.some((r) => r.name.toLowerCase().includes(q) || r.code.toLowerCase().includes(q))
    );
  }, [assignedDepts, deptSearchQuery]);

  // Click on a definition item
  const handleDefinitionClick = (dept: DepartmentCatalogItem, defName: string) => {
    const code = `${defName.toUpperCase().replace(/[^A-Z0-9]/g, '_')}_DEF`;
    setSelectedDefinitionTarget({
      id: defName,
      code,
      title: defName,
      departmentId: dept.id,
      departmentLabel: dept.name
    });
  };

  // Click on a form item (Opens 10-row multi-row document grid form with 18% GST and logo)
  const handleFormClick = (dept: DepartmentCatalogItem, form: { code: string; name: string }) => {
    let formCode = form.code.toUpperCase();
    if (!formCode.endsWith('_FORM') && !formCode.endsWith('_DOC')) {
      formCode = `${formCode}_FORM`;
    }
    setSelectedFormTarget({
      id: form.code,
      code: formCode,
      title: form.name,
      departmentId: dept.id,
      departmentLabel: dept.name
    });
  };

  // Click on a report item (Opens Report Parameter popup with logo toggle & printable view)
  const handleReportClick = (dept: DepartmentCatalogItem, report: { code: string; name: string }) => {
    let repCode = report.code.toUpperCase();
    if (!repCode.endsWith('_REP')) {
      repCode = `${repCode}_REP`;
    }
    setSelectedReportTarget({
      id: report.code,
      code: repCode,
      title: report.name,
      category: dept.name
    });
  };

  // Main Department click handler
  const handleDepartmentClick = (dept: DepartmentCatalogItem) => {
    const isExpanded = expandedDeptId === dept.id;
    setExpandedDeptId(isExpanded ? null : dept.id);

    // Map to the active module view in App.tsx
    if (dept.id === 'dept_1') {
      setActiveTab('finance');
    } else if (dept.id === 'dept_2') {
      setActiveTab('inventory');
    } else if (dept.id === 'dept_3') {
      setActiveTab('procurement');
    } else if (dept.id === 'dept_4' || dept.id === 'dept_14') {
      setActiveTab('sales');
    } else if (dept.id === 'dept_5' || dept.id === 'dept_6') {
      setActiveTab('hr');
    } else if (dept.id === 'dept_93' || dept.id === 'dept_27' || dept.id === 'dept_30' || dept.id === 'dept_33' || dept.id === 'dept_71' || dept.id === 'dept_76') {
      setActiveTab('production');
    } else {
      setActiveTab('departments');
    }
  };

  return (
    <>
      <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col shrink-0 min-h-[calc(100vh-57px)]">
        {/* Header Company Wordmark Banner */}
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
          {/* Section Heading & Category Badge */}
          <div className="px-2 py-1 text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center justify-between">
            <span>{isMasterPortal ? 'System Control' : 'ERP Departments'}</span>
            {!isMasterPortal && currentCompany.industry && (
              <span className="text-[9px] px-2 py-0.5 rounded bg-slate-800 text-cyan-400 font-mono font-bold border border-slate-700">
                {currentCompany.industry.toUpperCase()} ({assignedDepts.length})
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

          {/* Quick Department Filter Search Box */}
          {!isMasterPortal && assignedDepts.length > 5 && (
            <div className="pt-1 pb-1">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={deptSearchQuery}
                  onChange={(e) => setDeptSearchQuery(e.target.value)}
                  placeholder="Find department..."
                  className="w-full pl-8 pr-2 py-1.5 rounded-lg bg-slate-950/70 border border-slate-800 text-[11px] text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/60"
                />
              </div>
            </div>
          )}

          {/* Category Assigned Departments Displayed Directly in the Main Sidebar */}
          {!isMasterPortal &&
            visibleDepts.map((dept) => {
              const Icon = getDepartmentIcon(dept);
              const isDeptExpanded = expandedDeptId === dept.id;

              return (
                <div key={dept.id} className="space-y-1">
                  {/* Department Main Button */}
                  <button
                    onClick={() => handleDepartmentClick(dept)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all text-left ${
                      isDeptExpanded
                        ? 'bg-slate-800 text-cyan-300 border border-slate-700 shadow-md'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon className={`w-4 h-4 shrink-0 ${isDeptExpanded ? 'text-cyan-400' : 'text-slate-400'}`} />
                      <span className="truncate">{dept.name}</span>
                    </div>
                    {isDeptExpanded ? (
                      <ChevronDown className="w-3.5 h-3.5 text-cyan-300 shrink-0 ml-1" />
                    ) : dir === 'rtl' ? (
                      <ChevronLeft className="w-3.5 h-3.5 text-slate-500 shrink-0 ml-1" />
                    ) : (
                      <ChevronRight className="w-3.5 h-3.5 text-slate-500 shrink-0 ml-1" />
                    )}
                  </button>

                  {/* Subtabs Accordion: Definitions, Forms, Reports */}
                  {isDeptExpanded && (
                    <div className={`${dir === 'rtl' ? 'mr-4 pr-2 border-r' : 'ml-4 pl-2 border-l'} border-slate-800 space-y-1 my-1 animate-in fade-in`}>
                      {/* 1. Definitions Category */}
                      {dept.definitions && dept.definitions.length > 0 && (
                        <div>
                          <button
                            onClick={() =>
                              setExpandedSubCat(expandedSubCat === `${dept.id}_defs` ? null : `${dept.id}_defs`)
                            }
                            className="w-full flex items-center justify-between py-1 px-2 text-[11px] font-bold text-slate-400 hover:text-amber-300 transition-colors cursor-pointer"
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
                            <div className={`${dir === 'rtl' ? 'mr-3 border-r pr-2' : 'ml-3 border-l pl-2'} border-slate-800 space-y-0.5 my-1 max-h-48 overflow-y-auto`}>
                              {dept.definitions.map((defName, idx) => (
                                <button
                                  key={idx}
                                  onClick={() => handleDefinitionClick(dept, defName)}
                                  className="w-full text-left py-1 px-2 text-[11px] rounded text-slate-400 hover:text-amber-200 hover:bg-slate-800/80 truncate cursor-pointer transition-colors"
                                  title={defName}
                                >
                                  • {defName}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {/* 2. Forms Category (Multi-row grid vouchers/invoices with GST & Logo) */}
                      {dept.forms && dept.forms.length > 0 && (
                        <div>
                          <button
                            onClick={() =>
                              setExpandedSubCat(expandedSubCat === `${dept.id}_forms` ? null : `${dept.id}_forms`)
                            }
                            className="w-full flex items-center justify-between py-1 px-2 text-[11px] font-bold text-slate-400 hover:text-cyan-300 transition-colors cursor-pointer"
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
                            <div className={`${dir === 'rtl' ? 'mr-3 border-r pr-2' : 'ml-3 border-l pl-2'} border-slate-800 space-y-0.5 my-1 max-h-48 overflow-y-auto`}>
                              {dept.forms.map((form) => (
                                <button
                                  key={form.code}
                                  onClick={() => handleFormClick(dept, form)}
                                  className="w-full text-left py-1 px-2 text-[11px] rounded text-slate-400 hover:text-cyan-200 hover:bg-slate-800/80 truncate cursor-pointer transition-colors"
                                  title={form.name}
                                >
                                  • {form.name}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {/* 3. Reports Category (Printable PDF with Logo & Filters) */}
                      {dept.reports && dept.reports.length > 0 && (
                        <div>
                          <button
                            onClick={() =>
                              setExpandedSubCat(expandedSubCat === `${dept.id}_reports` ? null : `${dept.id}_reports`)
                            }
                            className="w-full flex items-center justify-between py-1 px-2 text-[11px] font-bold text-slate-400 hover:text-emerald-300 transition-colors cursor-pointer"
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
                            <div className={`${dir === 'rtl' ? 'mr-3 border-r pr-2' : 'ml-3 border-l pl-2'} border-slate-800 space-y-0.5 my-1 max-h-48 overflow-y-auto`}>
                              {dept.reports.map((report) => (
                                <button
                                  key={report.code}
                                  onClick={() => handleReportClick(dept, report)}
                                  className="w-full text-left py-1 px-2 text-[11px] rounded text-slate-400 hover:text-emerald-200 hover:bg-slate-800/80 truncate cursor-pointer transition-colors"
                                  title={report.name}
                                >
                                  • {report.name}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}

          {/* System Utilities Section */}
          {!isMasterPortal && (
            <div className="pt-3 border-t border-slate-800/60 space-y-1">
              <div className="px-2 py-1 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                System Utilities
              </div>

              {utilityItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
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

      {/* Transactional Document Multi-Row Grid Form (Bills, Invoices, Vouchers) */}
      <StandardDocumentGridForm
        isOpen={!!selectedFormTarget}
        onClose={() => setSelectedFormTarget(null)}
        formTarget={selectedFormTarget}
      />

      {/* Department Master Definition Modal */}
      <DepartmentDefinitionModal
        isOpen={!!selectedDefinitionTarget}
        onClose={() => setSelectedDefinitionTarget(null)}
        definitionTarget={selectedDefinitionTarget}
      />
    </>
  );
};
