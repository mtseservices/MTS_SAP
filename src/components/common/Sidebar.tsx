import React from 'react';
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
  ShieldAlert,
  CreditCard,
  History
} from 'lucide-react';
import { useAuthTenant } from '../../context/AuthTenantContext';

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
  // Master Admin Tabs
  | 'masterDashboard'
  | 'masterCompanies'
  | 'masterRegister'
  | 'masterSubdomains'
  | 'masterSubscriptions'
  | 'masterAudit';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const { isMasterPortal, currentCompany } = useAuthTenant();

  const masterNav = [
    { id: 'masterDashboard' as ActiveTab, label: 'Master Overview', icon: LayoutDashboard },
    { id: 'masterCompanies' as ActiveTab, label: 'Client Companies', icon: Building2 },
    { id: 'masterRegister' as ActiveTab, label: 'Register New Company', icon: SlidersHorizontal },
    { id: 'masterSubdomains' as ActiveTab, label: 'Company URLs & Slugs', icon: Globe2 },
    { id: 'masterSubscriptions' as ActiveTab, label: 'Subscription & Billing', icon: CreditCard },
    { id: 'masterAudit' as ActiveTab, label: 'Global Audit Logs', icon: History },
  ];

  const clientNav = [
    { id: 'dashboard' as ActiveTab, label: 'Executive Dashboard', icon: LayoutDashboard },
    { id: 'finance' as ActiveTab, label: 'Finance & Accounts', icon: DollarSign },
    { id: 'procurement' as ActiveTab, label: 'Procurement & Purchasing', icon: ShoppingCart },
    { id: 'inventory' as ActiveTab, label: 'Inventory & Warehouse', icon: Boxes },
    { id: 'sales' as ActiveTab, label: 'Sales & POS Counter', icon: Receipt },
    { id: 'production' as ActiveTab, label: 'Production & Manufacturing', icon: Factory },
    { id: 'hr' as ActiveTab, label: 'HR Management & Payroll', icon: Users },
    { id: 'formBuilder' as ActiveTab, label: 'Dynamic Form Builder', icon: FileCheck2 },
    { id: 'reports' as ActiveTab, label: 'Universal Reporting Engine', icon: BarChart3 },
    { id: 'approvals' as ActiveTab, label: 'Approval Workflows', icon: ShieldCheck },
    { id: 'aiAssistant' as ActiveTab, label: 'Gemini AI & Voice Center', icon: Sparkles },
    { id: 'auditLogs' as ActiveTab, label: 'Security Audit Logs', icon: History },
    { id: 'companySettings' as ActiveTab, label: 'Company Profile & Branding', icon: Settings },
  ];

  const navItems = isMasterPortal ? masterNav : clientNav;

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col shrink-0 min-h-[calc(100vh-57px)]">
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
              <div className="text-[10px] text-cyan-300/80 font-mono truncate">{currentCompany.slug}.erp.mts.pk</div>
            </div>
          </div>
        )}
      </div>

      <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto">
        <div className="px-3 py-1 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
          {isMasterPortal ? 'System Control' : 'ERP Departments'}
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                isActive
                  ? isMasterPortal
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                    : 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/30'
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
      </nav>

      <div className="p-3 border-t border-slate-800 text-[11px] text-slate-500 text-center font-mono">
        Pakistan Localization (PKR) • FBR Compliant
      </div>
    </aside>
  );
};
