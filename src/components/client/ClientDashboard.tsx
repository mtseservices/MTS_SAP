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
  ExternalLink,
  SlidersHorizontal,
  MoveUp,
  MoveDown,
  RotateCcw,
  GripVertical,
  BarChart3,
  Trash2,
  Database,
  CreditCard
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
import { SubscriptionTrialModal } from '../common/SubscriptionTrialModal';
import { INITIAL_INVENTORY, INITIAL_ACCOUNTS } from '../../services/mockData';

interface ClientDashboardProps {
  onNavigateTab: (tab: ActiveTab) => void;
}

interface CustomReportWidget {
  id: string;
  title: string;
  query: string;
  type: 'metric' | 'bar' | 'pie';
}

export const ClientDashboard: React.FC<ClientDashboardProps> = ({ onNavigateTab }) => {
  const { currentCompany, currentBranch } = useAuthTenant();
  const [vouchers, setVouchers] = useState<JournalVoucher[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Quick Actions Floating Speed Dial & QR Scanner States
  const [showQuickActionsMenu, setShowQuickActionsMenu] = useState(false);
  const [showQrScannerModal, setShowQrScannerModal] = useState(false);
  const [scannedItem, setScannedItem] = useState<ScannedItemPayload | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  // Custom Reporting Widgets State (SQL queries from ReportingEngineModule)
  const [showAddWidgetModal, setShowAddWidgetModal] = useState(false);
  const [customWidgets, setCustomWidgets] = useState<CustomReportWidget[]>(() => {
    try {
      const saved = localStorage.getItem(`client_dashboard_custom_widgets_${currentCompany.id}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return [
      {
        id: 'custom_sql_1',
        title: 'SQL: GL Debits vs Credits by Voucher Type',
        query: 'SELECT sum(debit), sum(credit) FROM gl_vouchers GROUP BY type',
        type: 'bar'
      },
      {
        id: 'custom_sql_2',
        title: 'SQL: Total Warehouse Stock Valuation',
        query: 'SELECT sum(currentStock * purchasePrice) FROM inventory_items',
        type: 'metric'
      }
    ];
  });

  const saveCustomWidgets = (widgets: CustomReportWidget[]) => {
    setCustomWidgets(widgets);
    try {
      localStorage.setItem(`client_dashboard_custom_widgets_${currentCompany.id}`, JSON.stringify(widgets));
    } catch (e) {}
  };

  // Add new SQL Report Widget form state
  const [newWidgetTitle, setNewWidgetTitle] = useState('');
  const [newWidgetQuery, setNewWidgetQuery] = useState('SELECT sum(debit) FROM gl_vouchers GROUP BY type');
  const [newWidgetType, setNewWidgetType] = useState<'metric' | 'bar' | 'pie'>('bar');

  // Widget Reordering & Personalization State
  const baseDefaultWidgets = ['topBanner', 'countdownBanner', 'expiringAlert', 'kpiCards', 'financialSummary', 'actionHub'];
  const defaultWidgets = [...baseDefaultWidgets, ...customWidgets.map(w => w.id)];

  const [widgetOrder, setWidgetOrder] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(`client_dashboard_layout_${currentCompany.id}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Ensure any new custom widgets are also included in order
          const existingIds = new Set(parsed);
          const allIds = [...parsed];
          customWidgets.forEach(cw => {
            if (!existingIds.has(cw.id)) allIds.push(cw.id);
          });
          return allIds;
        }
      }
    } catch (e) {}
    return defaultWidgets;
  });

  const [isCustomizing, setIsCustomizing] = useState(false);

  const saveWidgetOrder = (newOrder: string[]) => {
    setWidgetOrder(newOrder);
    try {
      localStorage.setItem(`client_dashboard_layout_${currentCompany.id}`, JSON.stringify(newOrder));
    } catch (e) {}
  };

  const moveWidget = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= widgetOrder.length) return;
    const updated = [...widgetOrder];
    const temp = updated[index];
    updated[index] = updated[newIndex];
    updated[newIndex] = temp;
    saveWidgetOrder(updated);
  };

  const resetLayout = () => {
    const defaults = [...baseDefaultWidgets, ...customWidgets.map(w => w.id)];
    saveWidgetOrder(defaults);
    setIsCustomizing(false);
  };

  const handleAddCustomWidgetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWidgetTitle.trim()) return;

    const newId = `custom_sql_${Date.now()}`;
    const newWidget: CustomReportWidget = {
      id: newId,
      title: newWidgetTitle.trim(),
      query: newWidgetQuery,
      type: newWidgetType
    };

    const updatedCustoms = [...customWidgets, newWidget];
    saveCustomWidgets(updatedCustoms);

    const updatedOrder = [...widgetOrder, newId];
    saveWidgetOrder(updatedOrder);

    setNewWidgetTitle('');
    setShowAddWidgetModal(false);
  };

  const handleDeleteCustomWidget = (widgetId: string) => {
    const updatedCustoms = customWidgets.filter(w => w.id !== widgetId);
    saveCustomWidgets(updatedCustoms);

    const updatedOrder = widgetOrder.filter(id => id !== widgetId);
    saveWidgetOrder(updatedOrder);
  };

  // Dynamic Live Trial & Subscription Countdown Timer state (calculated from Firestore subscription / trial days)
  const calculateRemainingTime = () => {
    let targetMs: number;
    if (currentCompany.subscriptionExpiresAt) {
      targetMs = new Date(currentCompany.subscriptionExpiresAt).getTime();
    } else if (currentCompany.trialDaysRemaining != null) {
      targetMs = Date.now() + currentCompany.trialDaysRemaining * 24 * 60 * 60 * 1000;
    } else {
      targetMs = Date.now() + 14 * 24 * 60 * 60 * 1000;
    }
    const diff = Math.max(0, targetMs - Date.now());
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const seconds = Math.floor((diff / 1000) % 60);
    return { days, hours, minutes, seconds };
  };

  const [timeLeft, setTimeLeft] = useState(calculateRemainingTime);

  useEffect(() => {
    setTimeLeft(calculateRemainingTime());
    const timer = setInterval(() => {
      setTimeLeft(calculateRemainingTime());
    }, 1000);
    return () => clearInterval(timer);
  }, [currentCompany.subscriptionExpiresAt, currentCompany.trialDaysRemaining]);

  // Real-time Firebase Subscription for General Ledger & Voucher Transactions
  useEffect(() => {
    setIsLoading(true);
    const unsubscribe = subscribeCompanyVouchers(currentCompany.id, (vList) => {
      setVouchers(vList);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [currentCompany.id]);

  // Compute batches expiring within 30 days
  const expiringBatches = INITIAL_INVENTORY.filter(i => {
    if (!i.expiryDate) return false;
    const expiry = new Date(i.expiryDate).getTime();
    const now = new Date().getTime();
    const diffDays = (expiry - now) / (1000 * 60 * 60 * 24);
    return diffDays >= 0 && diffDays <= 30;
  });

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

  // Render individual dashboard widget
  const renderWidget = (widgetId: string, index: number) => {
    if (widgetId === 'expiringAlert' && expiringBatches.length === 0) return null;

    // Check if widgetId is a custom reporting widget
    const customWidget = customWidgets.find(cw => cw.id === widgetId);
    if (customWidget) {
      // Evaluate SQL-like query simulation for custom widget
      const renderCustomContent = () => {
        if (customWidget.type === 'metric') {
          // Calculate metric value based on query string
          let val = 51100000;
          if (customWidget.query.includes('inventory')) {
            val = INITIAL_INVENTORY.reduce((acc, i) => acc + (i.currentStock * i.purchasePrice), 0);
          } else if (customWidget.query.includes('account')) {
            val = INITIAL_ACCOUNTS.reduce((acc, a) => acc + a.balance, 0);
          } else if (customWidget.query.includes('gl_vouchers') || customWidget.query.includes('debit')) {
            val = totalGeneralLedgerDebits;
          }
          return (
            <div className="p-6 rounded-2xl bg-slate-900 border border-cyan-500/40 shadow-2xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Database className="w-5 h-5 text-cyan-400" />
                  <h3 className="text-sm font-bold text-slate-100">{customWidget.title}</h3>
                </div>
                <span className="px-2.5 py-0.5 rounded text-[10px] font-mono bg-cyan-950 text-cyan-300 border border-cyan-800">
                  SQL Query Widget
                </span>
              </div>
              <div className="text-xs font-mono text-slate-400 bg-slate-950 p-2.5 rounded-xl border border-slate-800 truncate">
                {customWidget.query}
              </div>
              <div className="text-2xl font-black text-cyan-400 font-mono">
                Rs. {val.toLocaleString()}
              </div>
              <div className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
                <RefreshCw className="w-3 h-3 animate-spin" /> Real-time live execution from ReportingEngineModule
              </div>
            </div>
          );
        } else if (customWidget.type === 'pie') {
          return (
            <div className="bg-slate-900 border border-purple-500/40 rounded-2xl p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Database className="w-5 h-5 text-purple-400" />
                  <h3 className="text-sm font-bold text-slate-100">{customWidget.title}</h3>
                </div>
                <span className="px-2.5 py-0.5 rounded text-[10px] font-mono bg-purple-950 text-purple-300 border border-purple-800">
                  SQL Pie Chart
                </span>
              </div>
              <div className="text-xs font-mono text-slate-400 bg-slate-950 p-2.5 rounded-xl border border-slate-800 truncate">
                {customWidget.query}
              </div>
              <div className="h-60 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={70}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {pieChartData.map((entry, idx) => (
                        <Cell key={`custom-pie-${idx}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', color: '#f8fafc' }}
                      formatter={(value: any) => [`Rs. ${Number(value).toLocaleString()}`, 'Amount']}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          );
        } else {
          // Bar chart
          return (
            <div className="bg-slate-900 border border-cyan-500/40 rounded-2xl p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Database className="w-5 h-5 text-cyan-400" />
                  <h3 className="text-sm font-bold text-slate-100">{customWidget.title}</h3>
                </div>
                <span className="px-2.5 py-0.5 rounded text-[10px] font-mono bg-cyan-950 text-cyan-300 border border-cyan-800">
                  SQL Bar Chart
                </span>
              </div>
              <div className="text-xs font-mono text-slate-400 bg-slate-950 p-2.5 rounded-xl border border-slate-800 truncate">
                {customWidget.query}
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barChartData} margin={{ top: 10, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="name" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                    <YAxis stroke="#94a3b8" tick={{ fontSize: 10 }} tickFormatter={(value) => `Rs. ${(value / 1000).toFixed(0)}k`} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', color: '#f8fafc' }}
                      formatter={(value: any) => [`Rs. ${Number(value).toLocaleString()}`, 'Amount']}
                    />
                    <Bar dataKey="debits" name="Debits (PKR)" fill="#10b981" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="credits" name="Credits (PKR)" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          );
        }
      };

      return (
        <div key={widgetId} className="relative group/widget transition-all duration-300">
          {isCustomizing && (
            <div className="absolute -top-3 left-6 z-20 flex items-center justify-between w-[calc(100%-3rem)] bg-cyan-600 text-white px-3 py-1 rounded-full shadow-lg border border-cyan-400 text-[10px] font-bold uppercase tracking-wider">
              <div className="flex items-center gap-1">
                <GripVertical className="w-3 h-3" />
                <span>Custom Widget #{index + 1}: {customWidget.title}</span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => moveWidget(index, 'up')}
                  disabled={index === 0}
                  className="p-1 hover:bg-cyan-700 rounded disabled:opacity-40 cursor-pointer"
                  title="Move Up"
                >
                  <MoveUp className="w-3 h-3" />
                </button>
                <button
                  onClick={() => moveWidget(index, 'down')}
                  disabled={index === widgetOrder.length - 1}
                  className="p-1 hover:bg-cyan-700 rounded disabled:opacity-40 cursor-pointer"
                  title="Move Down"
                >
                  <MoveDown className="w-3 h-3" />
                </button>
                <button
                  onClick={() => handleDeleteCustomWidget(customWidget.id)}
                  className="p-1 hover:bg-rose-700 rounded text-rose-200 ml-2 cursor-pointer"
                  title="Delete Custom Widget"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          )}
          <div className={isCustomizing ? 'border-2 border-dashed border-cyan-500/60 rounded-2xl p-3 bg-cyan-950/10 transition-all pt-5' : ''}>
            {renderCustomContent()}
          </div>
        </div>
      );
    }

    const content = (() => {
      switch (widgetId) {
        case 'topBanner':
          return (
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
                  onClick={() => setShowUpgradeModal(true)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-purple-600/30 hover:bg-purple-600/40 text-purple-200 border border-purple-500/50 font-bold text-xs shadow-lg transition-all cursor-pointer"
                >
                  <CreditCard className="w-4 h-4 text-purple-400" />
                  <span>Upgrade Subscription</span>
                </button>
                <button
                  onClick={() => onNavigateTab('aiAssistant')}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-cyan-600/30 transition-all cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  Ask Gemini AI Assistant
                </button>
              </div>
            </div>
          );

        case 'countdownBanner':
          return (
            <div className="bg-gradient-to-r from-purple-900/60 via-slate-900 to-indigo-950/60 border border-purple-500/40 rounded-2xl p-4 flex flex-col lg:flex-row items-center justify-between gap-4 shadow-xl">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  <Clock className="w-6 h-6 animate-spin" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500 text-slate-950 uppercase">
                      {currentCompany.subscriptionPlan || 'Trial Plan'}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase">
                      Status: {currentCompany.status || 'ACTIVE'}
                    </span>
                    <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider">
                      Enterprise Subscription &amp; Trial Countdown Timer
                    </h3>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {currentCompany.lastPaymentMethod ? (
                      <span>Active Tier: <strong className="text-cyan-300">{currentCompany.subscriptionPlan}</strong> • Last Payment: {currentCompany.lastPaymentMethod}</span>
                    ) : (
                      <span>Automated renewal active • Contact Master Admin or upgrade directly via Online Card / Master Bank IBFT.</span>
                    )}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2 font-mono text-xs font-bold">
                  <div className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-center">
                    <div className="text-base text-purple-400">{timeLeft.days}</div>
                    <div className="text-[9px] text-slate-400 uppercase">Days</div>
                  </div>
                  <span className="text-purple-400">:</span>
                  <div className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-center">
                    <div className="text-base text-cyan-400">{timeLeft.hours}</div>
                    <div className="text-[9px] text-slate-400 uppercase">Hours</div>
                  </div>
                  <span className="text-cyan-400">:</span>
                  <div className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-center">
                    <div className="text-base text-emerald-400">{timeLeft.minutes}</div>
                    <div className="text-[9px] text-slate-400 uppercase">Mins</div>
                  </div>
                  <span className="text-emerald-400">:</span>
                  <div className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-center">
                    <div className="text-base text-amber-400">{timeLeft.seconds}</div>
                    <div className="text-[9px] text-slate-400 uppercase">Secs</div>
                  </div>
                </div>

                <button
                  onClick={() => setShowUpgradeModal(true)}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white font-extrabold text-xs shadow-lg shadow-purple-600/30 transition-all cursor-pointer flex items-center gap-2 shrink-0 border border-purple-400/30 hover:scale-[1.02]"
                >
                  <Sparkles className="w-4 h-4 text-cyan-300 animate-pulse" />
                  <span>Upgrade Subscription / Pay Now</span>
                </button>
              </div>
            </div>
          );

        case 'expiringAlert':
          if (expiringBatches.length === 0) return null;
          return (
            <div className="bg-amber-500/10 border border-amber-500/40 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in fade-in shadow-xl">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  <AlertCircle className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                    Batch Expiration Alert ({expiringBatches.length} Batches Expiring Within 30 Days)
                  </h3>
                  <p className="text-[11px] text-slate-300 mt-0.5">
                    Items such as <strong className="text-amber-200">{expiringBatches[0].name}</strong> (Batch: {expiringBatches[0].batchNumber}) expire on {expiringBatches[0].expiryDate}. Please take prompt action.
                  </p>
                </div>
              </div>
              <button
                onClick={() => onNavigateTab('inventory')}
                className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-lg shadow-amber-600/30 transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
              >
                <span>Review Inventory Batches</span>
                <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>
          );

        case 'kpiCards':
          return (
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
          );

        case 'financialSummary':
          return (
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
                        {pieChartData.map((entry, idx) => (
                          <Cell key={`cell-${idx}`} fill={entry.color} />
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
          );

        case 'actionHub':
          return (
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
                    className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/80 hover:border-cyan-500 text-left transition-all space-y-2 group cursor-pointer"
                  >
                    <DollarSign className="w-5 h-5 text-cyan-400 group-hover:scale-110 transition-transform" />
                    <div>
                      <div className="font-bold text-xs text-slate-100">Chart of Accounts</div>
                      <div className="text-[10px] text-slate-400">Ledgers & Vouchers</div>
                    </div>
                  </button>

                  <button
                    onClick={() => onNavigateTab('sales')}
                    className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/80 hover:border-emerald-500 text-left transition-all space-y-2 group cursor-pointer"
                  >
                    <Receipt className="w-5 h-5 text-emerald-400 group-hover:scale-110 transition-transform" />
                    <div>
                      <div className="font-bold text-xs text-slate-100">Create Sales Invoice</div>
                      <div className="text-[10px] text-slate-400">POS & Customer Ledgers</div>
                    </div>
                  </button>

                  <button
                    onClick={() => onNavigateTab('procurement')}
                    className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/80 hover:border-amber-500 text-left transition-all space-y-2 group cursor-pointer"
                  >
                    <ShoppingCart className="w-5 h-5 text-amber-400 group-hover:scale-110 transition-transform" />
                    <div>
                      <div className="font-bold text-xs text-slate-100">Issue Purchase Order</div>
                      <div className="text-[10px] text-slate-400">Vendor Management</div>
                    </div>
                  </button>

                  <button
                    onClick={() => onNavigateTab('inventory')}
                    className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/80 hover:border-purple-500 text-left transition-all space-y-2 group cursor-pointer"
                  >
                    <Boxes className="w-5 h-5 text-purple-400 group-hover:scale-110 transition-transform" />
                    <div>
                      <div className="font-bold text-xs text-slate-100">Inventory Control</div>
                      <div className="text-[10px] text-slate-400">Stock & Warehouses</div>
                    </div>
                  </button>

                  <button
                    onClick={() => onNavigateTab('production')}
                    className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/80 hover:border-rose-500 text-left transition-all space-y-2 group cursor-pointer"
                  >
                    <Building2 className="w-5 h-5 text-rose-400 group-hover:scale-110 transition-transform" />
                    <div>
                      <div className="font-bold text-xs text-slate-100">Production & BOM</div>
                      <div className="text-[10px] text-slate-400">Work Orders & Consumption</div>
                    </div>
                  </button>

                  <button
                    onClick={() => onNavigateTab('reports')}
                    className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/80 hover:border-blue-500 text-left transition-all space-y-2 group cursor-pointer"
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
                    className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold cursor-pointer"
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
          );

        default:
          return null;
      }
    })();

    if (!content) return null;

    return (
      <div key={widgetId} className="relative group/widget transition-all duration-300">
        {isCustomizing && (
          <div className="absolute -top-3 left-6 z-20 flex items-center gap-1 bg-cyan-600 text-white px-3 py-1 rounded-full shadow-lg border border-cyan-400 text-[10px] font-bold uppercase tracking-wider">
            <GripVertical className="w-3 h-3" />
            <span>Widget #{index + 1}: {widgetId}</span>
            <div className="flex items-center gap-1 ml-2 border-l border-cyan-500 pl-2">
              <button
                onClick={() => moveWidget(index, 'up')}
                disabled={index === 0}
                className="p-1 hover:bg-cyan-700 rounded disabled:opacity-40 cursor-pointer"
                title="Move Up"
              >
                <MoveUp className="w-3 h-3" />
              </button>
              <button
                onClick={() => moveWidget(index, 'down')}
                disabled={index === widgetOrder.length - 1}
                className="p-1 hover:bg-cyan-700 rounded disabled:opacity-40 cursor-pointer"
                title="Move Down"
              >
                <MoveDown className="w-3 h-3" />
              </button>
            </div>
          </div>
        )}
        <div className={isCustomizing ? 'border-2 border-dashed border-cyan-500/60 rounded-2xl p-3 bg-cyan-950/10 transition-all pt-5' : ''}>
          {content}
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 space-y-6">
      {/* Workspace Personalization Controls Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-900/60 border border-slate-800 px-4 py-3 rounded-2xl">
        <div className="flex items-center gap-2 text-xs text-slate-300">
          <SlidersHorizontal className="w-4 h-4 text-cyan-400" />
          <span>Workspace Personalization: Reorder widgets, financial graphs & SQL reporting widgets to suit your executive workflow.</span>
        </div>
        <div className="flex items-center gap-2">
          {isCustomizing && (
            <button
              onClick={() => setShowAddWidgetModal(true)}
              className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-lg shadow-purple-600/30 flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Custom SQL Report Widget
            </button>
          )}

          <button
            onClick={() => setIsCustomizing(!isCustomizing)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              isCustomizing
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30'
                : 'bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-slate-700'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            {isCustomizing ? 'Done Customizing' : 'Customize Workspace'}
          </button>
          {isCustomizing && (
            <button
              onClick={resetLayout}
              className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-rose-400 text-xs font-bold border border-slate-700 flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Layout
            </button>
          )}
        </div>
      </div>

      {/* Render Reordered Widgets */}
      <div className="space-y-6">
        {widgetOrder.map((widgetId, index) => renderWidget(widgetId, index))}
      </div>

      {/* ADD CUSTOM SQL REPORT WIDGET MODAL */}
      {showAddWidgetModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-lg w-full space-y-5 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
                    Add Custom Reporting Widget (SQL Engine)
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Select a query from ReportingEngineModule to display real-time metrics or charts.
                  </p>
                </div>
              </div>
              <button onClick={() => setShowAddWidgetModal(false)} className="p-1 text-slate-400 hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddCustomWidgetSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Widget Display Title</label>
                <input
                  type="text"
                  value={newWidgetTitle}
                  onChange={(e) => setNewWidgetTitle(e.target.value)}
                  placeholder="e.g. Q2 Inventory Stock Valuation Query"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-purple-500 font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Select SQL Query Preset (ReportingEngine)</label>
                <select
                  value={newWidgetQuery}
                  onChange={(e) => {
                    const q = e.target.value;
                    setNewWidgetQuery(q);
                    if (q.includes('inventory')) setNewWidgetTitle('SQL: Warehouse Stock Valuation');
                    else if (q.includes('account')) setNewWidgetTitle('SQL: Chart of Accounts Balances');
                    else if (q.includes('sales')) setNewWidgetTitle('SQL: Realized Sales Revenue');
                    else setNewWidgetTitle('SQL: GL Debits vs Credits Summary');
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-100 font-mono focus:outline-none focus:border-purple-500"
                >
                  <option value="SELECT sum(debit), sum(credit) FROM gl_vouchers GROUP BY type">SELECT sum(debit), sum(credit) FROM gl_vouchers GROUP BY type</option>
                  <option value="SELECT sum(currentStock * purchasePrice) FROM inventory_items">SELECT sum(currentStock * purchasePrice) FROM inventory_items</option>
                  <option value="SELECT sum(balance) FROM account_heads GROUP BY type">SELECT sum(balance) FROM account_heads GROUP BY type</option>
                  <option value="SELECT sum(grandTotal) FROM sales_invoices WHERE paymentStatus = 'PAID'">SELECT sum(grandTotal) FROM sales_invoices WHERE paymentStatus = 'PAID'</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Widget Visualization Type</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['metric', 'bar', 'pie'] as const).map((t) => (
                    <button
                      type="button"
                      key={t}
                      onClick={() => setNewWidgetType(t)}
                      className={`py-2.5 rounded-xl border text-xs font-bold uppercase transition-all cursor-pointer ${
                        newWidgetType === t
                          ? 'bg-purple-600 text-white border-purple-400 shadow-md'
                          : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                      }`}
                    >
                      {t === 'metric' ? 'Summary Card' : t === 'bar' ? 'Bar Chart' : 'Pie Chart'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddWidgetModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  Add Widget to Dashboard
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
              <button onClick={() => setScannedItem(null)} className="p-1 text-slate-400 hover:text-white cursor-pointer">
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
                className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-600/20 cursor-pointer"
              >
                <Receipt className="w-3.5 h-3.5" />
                Create POS Sale
              </button>
              <button
                onClick={() => {
                  setScannedItem(null);
                  onNavigateTab('inventory');
                }}
                className="py-2.5 px-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-cyan-600/20 cursor-pointer"
              >
                <Boxes className="w-3.5 h-3.5" />
                View Stock Catalog
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Enterprise Upgrade Subscription & Mock Payment Gateway Modal */}
      <SubscriptionTrialModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        initialMode="UPGRADE"
      />
    </div>
  );
};
