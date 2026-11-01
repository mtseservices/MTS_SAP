import React from 'react';
import {
  DollarSign,
  TrendingUp,
  Boxes,
  Users,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Receipt,
  ShoppingCart,
  Building2,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { useAuthTenant } from '../../context/AuthTenantContext';
import { TTSButton } from '../common/TTSButton';
import { ActiveTab } from '../common/Sidebar';

interface ClientDashboardProps {
  onNavigateTab: (tab: ActiveTab) => void;
}

export const ClientDashboard: React.FC<ClientDashboardProps> = ({ onNavigateTab }) => {
  const { currentCompany, currentBranch } = useAuthTenant();

  const formattedSpeech = `Executive ERP Dashboard for ${currentCompany.name}. Total Gross Revenue: 148 million Rupees. Receivables balance: 14.2 million Rupees. Accounts Payable: 9.4 million Rupees. Pending approval workflow requests: 3 items requiring executive sign-off. All tax entries compliant with FBR Pakistan rules.`;

  return (
    <div className="p-6 space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-cyan-950/40 to-slate-900 border border-cyan-800/40 p-6 rounded-2xl shadow-2xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Building2 className="w-6 h-6 text-cyan-400" />
            <h1 className="text-xl font-black text-slate-100 tracking-tight">
              {currentCompany.name} • Executive Portal
            </h1>
          </div>
          <p className="text-xs text-slate-400 max-w-2xl font-mono">
            Active Branch: <strong className="text-cyan-300">{currentBranch.name}</strong> • Industry: {currentCompany.industry} • NTN: {currentCompany.ntn}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <TTSButton text={formattedSpeech} label="Executive Audio Summary" size="lg" />
          <button
            onClick={() => onNavigateTab('aiAssistant')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-cyan-600/30 transition-all"
          >
            <Sparkles className="w-4 h-4" />
            Ask Gemini AI Assistant
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Revenue */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider">
            <span>Gross Sales Revenue</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-100 font-mono">
            Rs. 148,000,000
          </div>
          <div className="flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>+14.2% YoY vs last financial year</span>
          </div>
        </div>

        {/* Receivables */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider">
            <span>Customer Receivables</span>
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-100 font-mono">
            Rs. 14,200,000
          </div>
          <div className="text-[11px] text-slate-400 font-medium">
            Aging: 82% within 30 days
          </div>
        </div>

        {/* Accounts Payable */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider">
            <span>Supplier Payables</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <ShoppingCart className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-100 font-mono">
            Rs. 9,400,000
          </div>
          <div className="text-[11px] text-amber-300 font-medium">
            Due for clearance this week: Rs. 1.8M
          </div>
        </div>

        {/* Inventory Valuation */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider">
            <span>Stock Inventory Value</span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Boxes className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-100 font-mono">
            Rs. 51,100,000
          </div>
          <div className="text-[11px] text-purple-300 font-medium">
            Raw + Finished Goods in Warehouse
          </div>
        </div>
      </div>

      {/* Action Hub & Quick Shortcuts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Department Nav */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wider flex items-center justify-between">
            <span>Quick Department Actions</span>
            <span className="text-xs text-cyan-400 font-normal">Operational Shortcuts</span>
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <button
              onClick={() => onNavigateTab('finance')}
              className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/80 hover:border-cyan-500 text-left transition-all space-y-2 group"
            >
              <DollarSign className="w-5 h-5 text-cyan-400 group-hover:scale-110 transition-transform" />
              <div>
                <div className="font-bold text-xs text-slate-100">Chart of Accounts</div>
                <div className="text-[10px] text-slate-400">Ledgers & Vouchers</div>
              </div>
            </button>

            <button
              onClick={() => onNavigateTab('sales')}
              className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/80 hover:border-emerald-500 text-left transition-all space-y-2 group"
            >
              <Receipt className="w-5 h-5 text-emerald-400 group-hover:scale-110 transition-transform" />
              <div>
                <div className="font-bold text-xs text-slate-100">Create Sales Invoice</div>
                <div className="text-[10px] text-slate-400">POS & Customer Ledgers</div>
              </div>
            </button>

            <button
              onClick={() => onNavigateTab('procurement')}
              className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/80 hover:border-amber-500 text-left transition-all space-y-2 group"
            >
              <ShoppingCart className="w-5 h-5 text-amber-400 group-hover:scale-110 transition-transform" />
              <div>
                <div className="font-bold text-xs text-slate-100">Issue Purchase Order</div>
                <div className="text-[10px] text-slate-400">Vendor Management</div>
              </div>
            </button>

            <button
              onClick={() => onNavigateTab('inventory')}
              className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/80 hover:border-purple-500 text-left transition-all space-y-2 group"
            >
              <Boxes className="w-5 h-5 text-purple-400 group-hover:scale-110 transition-transform" />
              <div>
                <div className="font-bold text-xs text-slate-100">Inventory Control</div>
                <div className="text-[10px] text-slate-400">Stock & Warehouses</div>
              </div>
            </button>

            <button
              onClick={() => onNavigateTab('production')}
              className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/80 hover:border-rose-500 text-left transition-all space-y-2 group"
            >
              <Building2 className="w-5 h-5 text-rose-400 group-hover:scale-110 transition-transform" />
              <div>
                <div className="font-bold text-xs text-slate-100">Production & BOM</div>
                <div className="text-[10px] text-slate-400">Work Orders & Consumption</div>
              </div>
            </button>

            <button
              onClick={() => onNavigateTab('reports')}
              className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/80 hover:border-blue-500 text-left transition-all space-y-2 group"
            >
              <TrendingUp className="w-5 h-5 text-blue-400 group-hover:scale-110 transition-transform" />
              <div>
                <div className="font-bold text-xs text-slate-100">Universal Reports</div>
                <div className="text-[10px] text-slate-400">P&L, Trial Balance & Aging</div>
              </div>
            </button>
          </div>
        </div>

        {/* Approvals & Alerts */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400" />
              Pending Approvals
            </h2>
            <button
              onClick={() => onNavigateTab('approvals')}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold"
            >
              View All →
            </button>
          </div>

          <div className="space-y-3">
            <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700 text-xs space-y-1">
              <div className="flex items-center justify-between font-bold text-slate-200">
                <span>PO-2026-0041</span>
                <span className="text-amber-400 font-mono">Rs. 3,457,400</span>
              </div>
              <p className="text-[11px] text-slate-400">Vendor: Engro Foods & Agri Chemicals</p>
              <div className="text-[10px] text-cyan-400 font-semibold">Requires Executive Director Approval</div>
            </div>

            <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700 text-xs space-y-1">
              <div className="flex items-center justify-between font-bold text-slate-200">
                <span>INV-2026-1092 Discount</span>
                <span className="text-amber-400 font-mono">Rs. 150,000</span>
              </div>
              <p className="text-[11px] text-slate-400">Customer: Metro Cash & Carry</p>
              <div className="text-[10px] text-cyan-400 font-semibold">Requires Finance Manager Approval</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
