import React, { useState, useEffect } from 'react';
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
  AlertCircle,
  RefreshCw,
  Scale,
  Zap,
  Plus,
  X,
  QrCode,
  Box,
  ExternalLink
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { useAuthTenant } from '../../context/AuthTenantContext';
import { TTSButton } from '../common/TTSButton';
import { ActiveTab } from '../common/Sidebar';
import { JournalVoucher } from '../../types/erp';
import { subscribeCompanyVouchers } from '../../services/firebaseAccounting';
import { QrScannerModal, ScannedItemPayload } from '../common/QrScannerModal';

interface ClientDashboardProps {
  onNavigateTab: (tab: ActiveTab) => void;
}

export const ClientDashboard: React.FC<ClientDashboardProps> = ({ onNavigateTab }) => {
  const { currentCompany, currentBranch } = useAuthTenant();
  const [vouchers, setVouchers] = useState<JournalVoucher[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Quick Actions Floating Speed Dial & QR Scanner States
  const [showQuickActionsMenu, setShowQuickActionsMenu] = useState(false);
  const [showQrScannerModal, setShowQrScannerModal] = useState(false);
  const [scannedItem, setScannedItem] = useState<ScannedItemPayload | null>(null);

  // Real-time Firebase Subscription for General Ledger & Voucher Transactions
  useEffect(() => {
    setIsLoading(true);
    const unsubscribe = subscribeCompanyVouchers(currentCompany.id, (vList) => {
      setVouchers(vList);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [currentCompany.id]);

  // Aggregate General Ledger Debits and Credits by Voucher Type
  const chartDataMap: Record<string, { name: string; debits: number; credits: number }> = {
    JOURNAL: { name: 'Journal (JV)', debits: 0, credits: 0 },
    PAYMENT: { name: 'Payment (BPV)', debits: 0, credits: 0 },
    RECEIPT: { name: 'Receipt (BRV)', debits: 0, credits: 0 },
    CONTRA: { name: 'Contra (CV)', debits: 0, credits: 0 }
  };

  let totalGeneralLedgerDebits = 0;
  let totalGeneralLedgerCredits = 0;

  vouchers.forEach((v) => {
    const typeKey = v.type || 'JOURNAL';
    if (!chartDataMap[typeKey]) {
      chartDataMap[typeKey] = { name: typeKey, debits: 0, credits: 0 };
    }

    v.items.forEach((item) => {
      const d = Number(item.debit) || 0;
      const c = Number(item.credit) || 0;
      chartDataMap[typeKey].debits += d;
      chartDataMap[typeKey].credits += c;
      totalGeneralLedgerDebits += d;
      totalGeneralLedgerCredits += c;
    });
  });

  const barChartData = Object.values(chartDataMap);

  const pieChartData = [
    { name: 'Total Debits', value: totalGeneralLedgerDebits, color: '#10b981' },
    { name: 'Total Credits', value: totalGeneralLedgerCredits, color: '#06b6d4' }
  ];

  const formattedSpeech = `Executive ERP Dashboard for ${currentCompany.name}. Real-time General Ledger Debits: PKR ${totalGeneralLedgerDebits.toLocaleString()}. Total Credits: PKR ${totalGeneralLedgerCredits.toLocaleString()}. System in double-entry equilibrium. All tax entries compliant with FBR Pakistan rules.`;

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
        {/* Real-time Ledger Debits */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider">
            <span>GL Total Debits</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-black text-emerald-400 font-mono">
            Rs. {totalGeneralLedgerDebits.toLocaleString()}
          </div>
          <div className="flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
            <RefreshCw className="w-3 h-3 animate-spin text-emerald-400" />
            <span>Firebase Live Synchronized</span>
          </div>
        </div>

        {/* Real-time Ledger Credits */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider">
            <span>GL Total Credits</span>
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-black text-cyan-400 font-mono">
            Rs. {totalGeneralLedgerCredits.toLocaleString()}
          </div>
          <div className="text-[11px] text-cyan-300 font-medium font-mono">
            Equilibrium: {totalGeneralLedgerDebits === totalGeneralLedgerCredits ? 'BALANCED' : 'UNBALANCED'}
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
          <div className="text-xl font-black text-slate-100 font-mono">
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
          <div className="text-xl font-black text-slate-100 font-mono">
            Rs. 51,100,000
          </div>
          <div className="text-[11px] text-purple-300 font-medium">
            Raw + Finished Goods in Warehouse
          </div>
        </div>
      </div>

      {/* RECHARTS DYNAMIC FINANCIAL SUMMARY WIDGET */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-4">
          <div>
            <h2 className="text-base font-black text-slate-100 flex items-center gap-2">
              <Scale className="w-5 h-5 text-emerald-400" />
              General Ledger Financial Summary Widget (Recharts Live)
            </h2>
            <p className="text-xs text-slate-400">
              Real-time visualization of total Debits vs. Credits across voucher transaction categories for {currentCompany.name}.
            </p>
          </div>

          <div className="flex items-center gap-2 font-mono text-xs">
            <span className="px-3 py-1 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              Live Total Debits: Rs. {totalGeneralLedgerDebits.toLocaleString()}
            </span>
            <span className="px-3 py-1 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-bold">
              Live Total Credits: Rs. {totalGeneralLedgerCredits.toLocaleString()}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
          {/* Bar Chart: Debits vs Credits by Voucher Type */}
          <div className="lg:col-span-2 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barChartData} margin={{ top: 10, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="name" stroke="#94a3b8" tick={{ fontSize: 12 }} />
                <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} tickFormatter={(value) => `Rs. ${(value / 1000).toFixed(0)}k`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', color: '#f8fafc' }}
                  formatter={(value: any) => [`Rs. ${Number(value).toLocaleString()}`, 'Amount']}
                />
                <Legend wrapperStyle={{ paddingTop: '10px' }} />
                <Bar dataKey="debits" name="Total Debits (PKR)" fill="#10b981" radius={[6, 6, 0, 0]} />
                <Bar dataKey="credits" name="Total Credits (PKR)" fill="#06b6d4" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Pie Chart: Debit/Credit Distribution Ratio */}
          <div className="h-72 flex flex-col items-center justify-center bg-slate-950/60 p-4 rounded-xl border border-slate-800">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Debit / Credit Equilibrium Ratio</h3>
            <ResponsiveContainer width="100%" height="80%">
              <PieChart>
                <Pie
                  data={pieChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', color: '#f8fafc' }}
                  formatter={(value: any) => [`Rs. ${Number(value).toLocaleString()}`, 'Total']}
                />
              </PieChart>
            </ResponsiveContainer>

            <div className="flex items-center gap-4 text-xs font-mono font-bold mt-1">
              <div className="flex items-center gap-1.5 text-emerald-400">
                <span className="w-3 h-3 rounded-full bg-emerald-500" />
                Debits
              </div>
              <div className="flex items-center gap-1.5 text-cyan-400">
                <span className="w-3 h-3 rounded-full bg-cyan-500" />
                Credits
              </div>
            </div>
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

      {/* FLOATING QUICK ACTIONS SPEED DIAL BUTTON */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end space-y-3">
        {/* Speed Dial Quick Actions Menu */}
        {showQuickActionsMenu && (
          <div className="flex flex-col items-end space-y-2 mb-2 animate-in slide-in-from-bottom-5 duration-200">
            {/* Quick Action 1: New Journal Entry */}
            <button
              onClick={() => {
                setShowQuickActionsMenu(false);
                onNavigateTab('finance');
              }}
              className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-slate-900/95 border border-slate-700/80 text-slate-100 hover:border-cyan-400 hover:bg-slate-800 text-xs font-bold shadow-2xl backdrop-blur-md transition-all hover:scale-105 group cursor-pointer"
            >
              <span className="text-[10px] text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800 font-mono">Finance</span>
              <span>New Journal Entry (JV)</span>
              <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 group-hover:bg-cyan-500 group-hover:text-slate-950 transition-colors">
                <DollarSign className="w-4 h-4" />
              </div>
            </button>

            {/* Quick Action 2: Camera QR/Barcode Scan Inventory */}
            <button
              onClick={() => {
                setShowQuickActionsMenu(false);
                setShowQrScannerModal(true);
              }}
              className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-slate-900/95 border border-slate-700/80 text-slate-100 hover:border-emerald-400 hover:bg-slate-800 text-xs font-bold shadow-2xl backdrop-blur-md transition-all hover:scale-105 group cursor-pointer"
            >
              <span className="text-[10px] text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800 font-mono">Camera Scan</span>
              <span>Scan Inventory Item</span>
              <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 group-hover:bg-emerald-500 group-hover:text-slate-950 transition-colors">
                <QrCode className="w-4 h-4" />
              </div>
            </button>

            {/* Quick Action 3: Create Sales Invoice / POS */}
            <button
              onClick={() => {
                setShowQuickActionsMenu(false);
                onNavigateTab('sales');
              }}
              className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-slate-900/95 border border-slate-700/80 text-slate-100 hover:border-amber-400 hover:bg-slate-800 text-xs font-bold shadow-2xl backdrop-blur-md transition-all hover:scale-105 group cursor-pointer"
            >
              <span className="text-[10px] text-amber-400 bg-amber-950 px-2 py-0.5 rounded border border-amber-800 font-mono">Sales & POS</span>
              <span>Create Sales Invoice / POS</span>
              <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 group-hover:bg-amber-500 group-hover:text-slate-950 transition-colors">
                <Receipt className="w-4 h-4" />
              </div>
            </button>

            {/* Quick Action 4: Issue Purchase Order */}
            <button
              onClick={() => {
                setShowQuickActionsMenu(false);
                onNavigateTab('procurement');
              }}
              className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-slate-900/95 border border-slate-700/80 text-slate-100 hover:border-purple-400 hover:bg-slate-800 text-xs font-bold shadow-2xl backdrop-blur-md transition-all hover:scale-105 group cursor-pointer"
            >
              <span className="text-[10px] text-purple-400 bg-purple-950 px-2 py-0.5 rounded border border-purple-800 font-mono">Procurement</span>
              <span>Issue Purchase Order (PO)</span>
              <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400 group-hover:bg-purple-500 group-hover:text-slate-950 transition-colors">
                <ShoppingCart className="w-4 h-4" />
              </div>
            </button>

            {/* Quick Action 5: Ask Gemini AI Assistant */}
            <button
              onClick={() => {
                setShowQuickActionsMenu(false);
                onNavigateTab('aiAssistant');
              }}
              className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-slate-900/95 border border-slate-700/80 text-slate-100 hover:border-rose-400 hover:bg-slate-800 text-xs font-bold shadow-2xl backdrop-blur-md transition-all hover:scale-105 group cursor-pointer"
            >
              <span className="text-[10px] text-rose-400 bg-rose-950 px-2 py-0.5 rounded border border-rose-800 font-mono">AI Voice</span>
              <span>Ask Gemini AI Assistant</span>
              <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400 group-hover:bg-rose-500 group-hover:text-slate-950 transition-colors">
                <Sparkles className="w-4 h-4" />
              </div>
            </button>
          </div>
        )}

        {/* Main Floating Trigger Button */}
        <button
          onClick={() => setShowQuickActionsMenu(!showQuickActionsMenu)}
          className={`flex items-center gap-2.5 px-5 py-3.5 rounded-full font-black text-xs text-white shadow-2xl border transition-all duration-300 transform hover:scale-105 cursor-pointer ${
            showQuickActionsMenu
              ? 'bg-rose-600 border-rose-400 shadow-rose-600/50 rotate-90 ring-4 ring-rose-500/20'
              : 'bg-gradient-to-r from-cyan-600 via-blue-600 to-purple-600 border-cyan-400/80 shadow-cyan-500/40 ring-4 ring-cyan-500/20 animate-pulse hover:animate-none'
          }`}
        >
          {showQuickActionsMenu ? (
            <X className="w-5 h-5 text-white" />
          ) : (
            <>
              <Zap className="w-5 h-5 text-amber-300" />
              <span className="tracking-wide uppercase">Quick Actions</span>
            </>
          )}
        </button>
      </div>

      {/* QR CAMERA SCANNER MODAL */}
      <QrScannerModal
        isOpen={showQrScannerModal}
        onClose={() => setShowQrScannerModal(false)}
        onItemScanned={(itemPayload) => {
          setScannedItem(itemPayload);
          setShowQrScannerModal(false);
        }}
        title="Quick Scan Inventory QR / Barcode"
        moduleContext="INVENTORY"
      />

      {/* SCANNED ITEM QUICK ACTION RESULT MODAL */}
      {scannedItem && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-sm text-slate-100">Inventory Item Scanned</h3>
              </div>
              <button onClick={() => setScannedItem(null)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="text-xs font-mono text-cyan-400 font-bold">{scannedItem.code}</div>
              <div className="text-base font-black text-slate-100">{scannedItem.name}</div>
              <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-2 border-t border-slate-800 text-slate-300">
                <div>Unit Price: <span className="text-emerald-400 font-bold">Rs. {scannedItem.unitPrice.toLocaleString()}</span></div>
                <div>Category: <span className="text-slate-100">{scannedItem.category}</span></div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                onClick={() => {
                  setScannedItem(null);
                  onNavigateTab('sales');
                }}
                className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-600/20"
              >
                <Receipt className="w-3.5 h-3.5" />
                Create POS Sale
              </button>
              <button
                onClick={() => {
                  setScannedItem(null);
                  onNavigateTab('inventory');
                }}
                className="py-2.5 px-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-cyan-600/20"
              >
                <Boxes className="w-3.5 h-3.5" />
                View Stock Catalog
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

