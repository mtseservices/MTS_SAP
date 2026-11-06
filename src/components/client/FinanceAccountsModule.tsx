import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  Plus,
  BookOpen,
  Receipt,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Layers,
  Scale,
  TrendingUp,
  PieChart,
  RefreshCw,
  Share2,
  Target,
  AlertTriangle
} from 'lucide-react';
import { useAuthTenant } from '../../context/AuthTenantContext';
import { AccountHead, JournalVoucher, VoucherItem } from '../../types/erp';
import { DataTable } from '../common/DataTable';
import { TTSButton } from '../common/TTSButton';
import {
  subscribeCompanyAccounts,
  subscribeCompanyVouchers,
  postVoucherToFirebase,
  saveAccountHeadToFirebase,
  subscribeCompanyBudgets,
  saveBudgetToFirebase,
  BudgetItem
} from '../../services/firebaseAccounting';
import { BankReconciliationReport } from './BankReconciliationReport';
import { AutomatedStatementParser } from './AutomatedStatementParser';
import { SearchableSelect } from '../common/SearchableSelect';
import { ChartOfAccountsModule } from './finance/ChartOfAccountsModule';
import { JournalVoucherForm } from './finance/JournalVoucherForm';
import { FinanceAuditInsightsWidget } from './finance/FinanceAuditInsightsWidget';
import { CreateNewActionButton } from '../common/CreateNewActionButton';

type SubTab = 'vouchers' | 'coa' | 'gl' | 'subledger' | 'trialBalance' | 'pnl' | 'balanceSheet' | 'budget' | 'newVoucher' | 'bankReconciliation' | 'statementParser' | 'suppliers' | 'cost_center';

export const FinanceAccountsModule: React.FC = () => {
  const { currentCompany } = useAuthTenant();

  // URL Query Param Sync for Subtab
  const getInitialTab = (): SubTab => {
    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get('subtab');
    if (!tabParam) return 'vouchers';

    if (['coa', 'suppliers', 'cost_center'].includes(tabParam)) return 'coa';
    if (['voucher', 'payment', 'cheque', 'vouchers'].includes(tabParam)) return 'vouchers';
    if (['general_ledger', 'gl'].includes(tabParam)) return 'gl';
    if (['sub_ledger', 'aging', 'subledger'].includes(tabParam)) return 'subledger';
    if (['trial_balance', 'trialBalance'].includes(tabParam)) return 'trialBalance';
    if (['profit_loss', 'pnl'].includes(tabParam)) return 'pnl';
    if (['budget', 'budgets', 'budget_planning'].includes(tabParam)) return 'budget';
    if (tabParam === 'newVoucher') return 'newVoucher';
    if (['bank_reconciliation', 'bankReconciliation'].includes(tabParam)) return 'bankReconciliation';
    if (['statement_parser', 'statementParser', 'parser'].includes(tabParam)) return 'statementParser';

    return 'vouchers';
  };

  const [activeSubTab, setActiveSubTab] = useState<SubTab>(getInitialTab);
  const [accounts, setAccounts] = useState<AccountHead[]>([]);
  const [vouchers, setVouchers] = useState<JournalVoucher[]>([]);
  const [budgets, setBudgets] = useState<BudgetItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Zero Balance Filter & Date Range Filter for Reports/Balance Sheet
  const [hideZeroBalance, setHideZeroBalance] = useState<boolean>(true);
  const [fromDate, setFromDate] = useState<string>('2026-01-01');
  const [toDate, setToDate] = useState<string>('2026-12-31');

  // Oracle APEX Style Voucher List Search & Toolbar State
  const [voucherSearch, setVoucherSearch] = useState('');
  const [voucherRowsLimit, setVoucherRowsLimit] = useState(1000);
  const [selectedVoucherForReview, setSelectedVoucherForReview] = useState<JournalVoucher | null>(null);

  // New Budget Modal State
  const [showAddBudgetModal, setShowAddBudgetModal] = useState(false);
  const [budCategory, setBudCategory] = useState('Operating Expense');
  const [budAccountCode, setBudAccountCode] = useState('5020');
  const [budAccountName, setBudAccountName] = useState('Factory Salaries & Payroll');
  const [budProjectedAmount, setBudProjectedAmount] = useState(15000000);

  // New Voucher Form state
  const [voucherType, setVoucherType] = useState<'JOURNAL' | 'PAYMENT' | 'RECEIPT' | 'CONTRA'>('JOURNAL');
  const [narration, setNarration] = useState('');
  const [refNo, setRefNo] = useState('');
  const [items, setItems] = useState<VoucherItem[]>(
    Array(10).fill(null).map((_, idx) => ({
      accountId: '',
      accountCode: '',
      accountName: '',
      description: '',
      debit: 0,
      credit: 0
    }))
  );

  // Sync state to URL search parameters for dedicated tab sharing
  const switchSubTab = (tab: SubTab) => {
    setActiveSubTab(tab);
    const url = new URL(window.location.href);
    url.searchParams.set('company', currentCompany.slug);
    url.searchParams.set('module', 'finance');
    url.searchParams.set('subtab', tab);
    window.history.pushState({}, '', url.toString());
  };

  // 1. Connect Real-time Firebase Listeners for Company Data
  useEffect(() => {
    setIsLoading(true);
    const unsubAccounts = subscribeCompanyAccounts(currentCompany.id, (accList) => {
      setAccounts(accList);
      setIsLoading(false);
    });

    const unsubVouchers = subscribeCompanyVouchers(currentCompany.id, (vList) => {
      setVouchers(vList);
      setIsLoading(false);
    });

    const unsubBudgets = subscribeCompanyBudgets(currentCompany.id, (bList) => {
      setBudgets(bList);
    });

    return () => {
      unsubAccounts();
      unsubVouchers();
      unsubBudgets();
    };
  }, [currentCompany.id]);

  const handleCreateBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    const newBudget: BudgetItem = {
      id: `b_${Date.now()}`,
      category: budCategory,
      accountCode: budAccountCode,
      accountName: budAccountName,
      projectedAmount: Number(budProjectedAmount) || 0,
      fiscalYear: '2026-2027'
    };

    await saveBudgetToFirebase(currentCompany.id, newBudget);
    setShowAddBudgetModal(false);
  };

  const totalDebit = items.reduce((acc, i) => acc + (Number(i.debit) || 0), 0);
  const totalCredit = items.reduce((acc, i) => acc + (Number(i.credit) || 0), 0);
  const isBalanced = totalDebit > 0 && totalDebit === totalCredit;

  // Post Voucher & Sync to Firebase
  const handlePostVoucher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isBalanced) return;

    const newVoucher: JournalVoucher = {
      id: `jv_${Date.now()}`,
      voucherNo: `${voucherType.substring(0, 2)}V-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      date: new Date().toISOString().split('T')[0],
      type: voucherType,
      branchId: 'br_lahore_01',
      referenceNo: refNo || 'DIRECT-POST',
      items,
      totalAmount: totalDebit,
      narration: narration || 'Automated General Ledger posting',
      status: 'POSTED',
      createdBy: 'Finance Manager',
      createdAt: new Date().toISOString(),
      tenantId: currentCompany.tenantId
    };

    await postVoucherToFirebase(currentCompany.id, newVoucher, accounts);

    switchSubTab('vouchers');
    setNarration('');
    setRefNo('');
  };

  const openFormInNewTab = () => {
    const targetUrl = `${window.location.origin}${window.location.pathname}?company=${currentCompany.slug}&module=finance&subtab=${activeSubTab}`;
    window.open(targetUrl, '_blank');
  };

  // AUTOMATIC FINANCIAL COMPUTATIONS
  // 1. General Ledger Postings List (Filtered by Date Range if specified)
  const generalLedgerList = vouchers
    .filter((v) => {
      if (!fromDate || !toDate) return true;
      return v.date >= fromDate && v.date <= toDate;
    })
    .flatMap((v) =>
      v.items.map((item) => ({
        id: `${v.id}_${item.accountId}`,
        voucherNo: v.voucherNo,
        date: v.date,
        type: v.type,
        accountCode: item.accountCode,
        accountName: item.accountName,
        narration: v.narration,
        debit: item.debit || 0,
        credit: item.credit || 0,
        ref: v.referenceNo
      }))
    );

  // 2. Accounts List Filtered by Zero Balance
  const filteredAccounts = hideZeroBalance
    ? accounts.filter((a) => Math.abs(a.balance) > 0)
    : accounts;

  // 3. Trial Balance Calculation (Aggregated Debit & Credit per Account Head)
  const trialBalanceList = accounts.map((acc) => {
    const accEntries = generalLedgerList.filter((g) => g.accountCode === acc.code);
    const sumDebit = accEntries.reduce((s, e) => s + e.debit, 0);
    const sumCredit = accEntries.reduce((s, e) => s + e.credit, 0);
    const netBalance = acc.balance;

    return {
      id: acc.id,
      code: acc.code,
      name: acc.name,
      type: acc.type,
      totalDebit: sumDebit,
      totalCredit: sumCredit,
      netBalance
    };
  });

  const displayTrialBalance = hideZeroBalance
    ? trialBalanceList.filter((t) => Math.abs(t.netBalance) > 0 || t.totalDebit > 0 || t.totalCredit > 0)
    : trialBalanceList;

  const totalTBDebit = displayTrialBalance.reduce((s, t) => s + (t.type === 'ASSET' || t.type === 'EXPENSE' ? Math.max(0, t.netBalance) : 0), 0);
  const totalTBCredit = displayTrialBalance.reduce((s, t) => s + (t.type === 'LIABILITY' || t.type === 'EQUITY' || t.type === 'REVENUE' ? Math.abs(t.netBalance) : 0), 0);

  // 4. Profit & Loss Statement (Revenues vs Operating Expenses)
  const incomeAccounts = accounts.filter((a) => a.type === 'REVENUE');
  const expenseAccounts = accounts.filter((a) => a.type === 'EXPENSE');

  const displayIncomeAccounts = hideZeroBalance ? incomeAccounts.filter((a) => Math.abs(a.balance) > 0) : incomeAccounts;
  const displayExpenseAccounts = hideZeroBalance ? expenseAccounts.filter((a) => Math.abs(a.balance) > 0) : expenseAccounts;

  const totalRevenue = incomeAccounts.reduce((sum, a) => sum + Math.abs(a.balance), 0);
  const totalExpenses = expenseAccounts.reduce((sum, a) => sum + Math.abs(a.balance), 0);
  const netProfitLoss = totalRevenue - totalExpenses;

  // 5. Balance Sheet (Assets vs Liabilities & Equity)
  const assetAccounts = accounts.filter((a) => a.type === 'ASSET');
  const liabilityAccounts = accounts.filter((a) => a.type === 'LIABILITY');
  const equityAccounts = accounts.filter((a) => a.type === 'EQUITY');

  const displayAssetAccounts = hideZeroBalance ? assetAccounts.filter((a) => Math.abs(a.balance) > 0) : assetAccounts;
  const displayLiabilityAccounts = hideZeroBalance ? liabilityAccounts.filter((a) => Math.abs(a.balance) > 0) : liabilityAccounts;
  const displayEquityAccounts = hideZeroBalance ? equityAccounts.filter((a) => Math.abs(a.balance) > 0) : equityAccounts;

  const totalAssets = assetAccounts.reduce((sum, a) => sum + Math.abs(a.balance), 0);
  const totalLiabilities = liabilityAccounts.reduce((sum, a) => sum + Math.abs(a.balance), 0);
  const totalEquity = equityAccounts.reduce((sum, a) => sum + Math.abs(a.balance), 0) + netProfitLoss;

  const financeSpeech = `Finance & Accounts module for ${currentCompany.name}. Connected to real-time Firebase database. Total Chart of Accounts heads: ${accounts.length}. Total posted vouchers: ${vouchers.length}. Net calculated Profit: PKR ${netProfitLoss.toLocaleString()}.`;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <DollarSign className="w-6 h-6 text-emerald-400" />
            <h1 className="text-xl font-black text-slate-100">
              Corporate Financial Accounting Engine ({currentCompany.name})
            </h1>
            <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30 flex items-center gap-1">
              <RefreshCw className="w-3 h-3 animate-spin" /> Firebase Live
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Automatic double-entry posting across Journal Vouchers, COA, General Ledger, Sub-Ledger, Trial Balance, Profit & Loss, and Balance Sheet.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <TTSButton text={financeSpeech} label="Voice Summary" />
          <button
            onClick={openFormInNewTab}
            title="Open dedicated tab with URL"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-semibold border border-slate-700 transition-all"
          >
            <Share2 className="w-3.5 h-3.5" />
            Open in New Tab
          </button>
          <CreateNewActionButton
            label="Post New Voucher"
            variant="emerald"
            shortcutHint="Ctrl+N"
            onClick={() => switchSubTab('newVoucher')}
          />
        </div>
      </div>

      {/* Navigation Sub-Tabs (3 Core Pillars with Badge Counters) */}
      <div className="flex flex-wrap items-center gap-3 border-b border-slate-800 pb-4 text-xs font-bold">
        {[
          { 
            id: 'coa', 
            label: 'Chart of Accounts', 
            badge: accounts.length, 
            icon: Layers,
            isActive: activeSubTab === 'coa' || activeSubTab === 'suppliers' || activeSubTab === 'cost_center'
          },
          { 
            id: 'vouchers', 
            label: 'Journal Vouchers', 
            badge: vouchers.length, 
            icon: Receipt,
            isActive: activeSubTab === 'vouchers' || activeSubTab === 'newVoucher'
          },
          { 
            id: 'financialReports', 
            label: 'Financial Reports', 
            badge: 8, 
            icon: FileSpreadsheet,
            isActive: ['gl', 'subledger', 'trialBalance', 'pnl', 'balanceSheet', 'budget', 'bankReconciliation', 'statementParser'].includes(activeSubTab)
          }
        ].map((pillar) => {
          const Icon = pillar.icon;
          const isActive = pillar.isActive;
          const targetTab = pillar.id === 'financialReports' ? 'gl' : pillar.id;
          return (
            <button
              key={pillar.id}
              onClick={() => switchSubTab(targetTab as SubTab)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all cursor-pointer ${
                isActive
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-600/30'
                  : 'text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700 border border-slate-700/60'
              }`}
            >
              <Icon className="w-4 h-4 text-emerald-300" />
              <span>{pillar.label}</span>
              <span className="px-2 py-0.5 rounded-full bg-slate-950/60 text-emerald-400 font-mono text-[10px]">
                {pillar.badge}
              </span>
            </button>
          );
        })}
      </div>

      {/* Secondary Sub-Tabs for Financial Reports if Financial Reports pillar is active */}
      {['gl', 'subledger', 'trialBalance', 'pnl', 'balanceSheet', 'budget', 'bankReconciliation', 'statementParser'].includes(activeSubTab) && (
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-900/80 border border-slate-800 p-2.5 rounded-2xl text-[11px] font-semibold animate-in fade-in-50">
          {[
            { id: 'gl', label: 'General Ledger', icon: BookOpen },
            { id: 'subledger', label: 'Sub-Ledger (AR/AP)', icon: FileSpreadsheet },
            { id: 'trialBalance', label: 'Trial Balance', icon: Scale },
            { id: 'pnl', label: 'Profit & Loss', icon: TrendingUp },
            { id: 'balanceSheet', label: 'Balance Sheet', icon: PieChart },
            { id: 'budget', label: 'Budget Planning', icon: Target },
            { id: 'bankReconciliation', label: 'Bank Reconciliation', icon: Scale },
            { id: 'statementParser', label: 'Statement Parser', icon: FileSpreadsheet }
          ].map((sub) => {
            const SubIcon = sub.icon;
            const isSubActive = activeSubTab === sub.id;
            return (
              <button
                key={sub.id}
                onClick={() => switchSubTab(sub.id as SubTab)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition cursor-pointer ${
                  isSubActive
                    ? 'bg-cyan-600 text-white shadow'
                    : 'text-slate-400 hover:text-slate-200 bg-slate-800/40'
                }`}
              >
                <SubIcon className="w-3 h-3 text-cyan-300" />
                <span>{sub.label}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Report Controls: Date Range & Zero Balance Filter Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 shadow-xl">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-300">From Date:</span>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="px-2.5 py-1 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-100 font-mono focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-300">To Date:</span>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="px-2.5 py-1 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-100 font-mono focus:outline-none focus:border-emerald-500"
            />
          </div>

          <button
            type="button"
            onClick={() => {
              setFromDate('2026-01-01');
              setToDate('2026-12-31');
            }}
            className="px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-400 text-xs font-bold border border-slate-700"
          >
            Reset Dates
          </button>
        </div>

        {/* Zero Balance Toggle Button */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setHideZeroBalance(!hideZeroBalance)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              hideZeroBalance
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-lg shadow-emerald-500/10'
                : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${hideZeroBalance ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
            {hideZeroBalance ? 'Zero Balance Accounts Hidden (Default)' : 'Showing All Accounts (Including Zero)'}
          </button>
        </div>
      </div>

      {/* Tab 1: Vouchers Table (Oracle APEX / Enterprise ERP Style) */}
      {activeSubTab === 'vouchers' && (
        <div className="space-y-6">
          {/* Audit Insights & Receipt Performance Trends Widget */}
          <FinanceAuditInsightsWidget vouchers={vouchers} />

          {/* APEX Toolbar */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 shadow-xl">
            <div className="flex flex-wrap items-center gap-2 flex-1 max-w-xl">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Search Vouchers (No, Type, Description...)"
                  value={voucherSearch}
                  onChange={(e) => setVoucherSearch(e.target.value)}
                  className="w-full pl-3 pr-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-100 font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>
              <button
                type="button"
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700"
              >
                Go
              </button>
              <div className="relative">
                <select
                  value={voucherRowsLimit}
                  onChange={(e) => setVoucherRowsLimit(Number(e.target.value))}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-200 font-mono"
                >
                  <option value={10}>Rows 10</option>
                  <option value={50}>Rows 50</option>
                  <option value={100}>Rows 100</option>
                  <option value={1000}>Rows 1000</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setVoucherSearch('')}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold border border-slate-700"
              >
                Cancel
              </button>
              <CreateNewActionButton
                label="New Voucher"
                variant="emerald"
                onClick={() => switchSubTab('newVoucher')}
              />
            </div>
          </div>

          <DataTable
            title="Voucher List (Journal & Financial Transactions)"
            data={vouchers.filter((v) => {
              if (!voucherSearch.trim()) return true;
              const q = voucherSearch.toLowerCase();
              return (
                v.voucherNo.toLowerCase().includes(q) ||
                v.type.toLowerCase().includes(q) ||
                v.narration.toLowerCase().includes(q) ||
                v.createdBy.toLowerCase().includes(q)
              );
            }).slice(0, voucherRowsLimit)}
            columns={[
              { key: 'createdAt', header: 'Created Date', accessor: (v) => <span className="font-mono text-slate-400 text-xs">{v.createdAt ? v.createdAt.split('T')[0] : v.date}</span>, sortable: true },
              { key: 'voucherNo', header: 'Voucher No', accessor: (v) => <span className="font-mono font-bold text-emerald-400">{v.voucherNo}</span>, sortable: true },
              { key: 'date', header: 'Voucher Date', accessor: (v) => v.date, sortable: true },
              { key: 'type', header: 'Voucher Type', accessor: (v) => <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-cyan-300 font-mono font-bold">{v.type}</span> },
              { key: 'referenceNo', header: 'Document No', accessor: (v) => <span className="font-mono text-slate-300">{v.referenceNo || '-'}</span> },
              { key: 'createdBy', header: 'Created By', accessor: (v) => <span className="text-slate-300 text-xs">{v.createdBy}</span> },
              { key: 'status', header: 'Status', accessor: (v) => <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">{v.status}</span> },
              { key: 'narration', header: 'Description', accessor: (v) => <span className="text-slate-300 max-w-xs truncate block text-xs">{v.narration}</span> },
              {
                key: 'actions',
                header: 'Audit & Review',
                accessor: (v) => (
                  <button
                    onClick={() => setSelectedVoucherForReview(v)}
                    className="px-2.5 py-1 rounded-xl bg-cyan-600/20 hover:bg-cyan-600/40 text-cyan-300 border border-cyan-500/40 text-xs font-bold flex items-center gap-1 transition-all"
                  >
                    <RefreshCw className="w-3 h-3 text-cyan-400" />
                    Audit & Review
                  </button>
                )
              }
            ]}
          />
        </div>
      )}

      {/* Tab 2: Chart of Accounts */}
      {activeSubTab === 'coa' && (
        <ChartOfAccountsModule />
      )}

      {/* Tab 3: General Ledger */}
      {activeSubTab === 'gl' && (
        <DataTable
          title="Line-by-Line General Ledger Audit Trail"
          data={generalLedgerList}
          columns={[
            { key: 'voucherNo', header: 'Voucher #', accessor: (g) => <span className="font-mono text-emerald-400 font-bold">{g.voucherNo}</span>, sortable: true },
            { key: 'date', header: 'Date', accessor: (g) => g.date, sortable: true },
            { key: 'accountCode', header: 'Code', accessor: (g) => <span className="font-mono text-cyan-300">{g.accountCode}</span> },
            { key: 'accountName', header: 'Account Head', accessor: (g) => <span className="font-bold text-slate-200">{g.accountName}</span> },
            { key: 'debit', header: 'Debit (PKR)', accessor: (g) => <span className="font-mono text-emerald-400 font-bold">Rs. {g.debit.toLocaleString()}</span>, isNumeric: true },
            { key: 'credit', header: 'Credit (PKR)', accessor: (g) => <span className="font-mono text-cyan-400 font-bold">Rs. {g.credit.toLocaleString()}</span>, isNumeric: true },
            { key: 'narration', header: 'Description', accessor: (g) => <span className="text-slate-400 text-xs">{g.narration}</span> }
          ]}
        />
      )}

      {/* Tab 4: Sub-Ledger */}
      {activeSubTab === 'subledger' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
            <h2 className="text-sm font-bold text-cyan-400 uppercase tracking-wider">Sub-Ledger Accounts (AR / AP / Banks)</h2>
            <p className="text-xs text-slate-400">Detailed customer receivables, vendor payables, and bank account registers.</p>
          </div>

          <DataTable
            title="Sub-Ledger Details"
            data={accounts.filter(a => a.category.includes('Receivable') || a.category.includes('Payable') || a.category.includes('Bank') || a.category.includes('Cash'))}
            columns={[
              { key: 'code', header: 'Account Code', accessor: (a) => <span className="font-mono text-cyan-400 font-bold">{a.code}</span> },
              { key: 'name', header: 'Sub-Ledger Head', accessor: (a) => <span className="font-bold text-slate-100">{a.name}</span> },
              { key: 'category', header: 'Sub-Category', accessor: (a) => a.category },
              { key: 'balance', header: 'Current Balance (PKR)', accessor: (a) => <span className="font-mono text-emerald-400 font-bold">Rs. {a.balance.toLocaleString()}</span>, isNumeric: true }
            ]}
          />
        </div>
      )}

      {/* Tab 5: Trial Balance */}
      {activeSubTab === 'trialBalance' && (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div>
                <h2 className="text-sm font-bold text-emerald-400 uppercase tracking-wider">Automated Trial Balance</h2>
                <p className="text-xs text-slate-400">Debit and Credit equilibrium calculation from posted vouchers.</p>
              </div>
              <div className="text-right font-mono text-xs">
                <div>Status: <span className="text-emerald-400 font-bold">EQUILIBRIUM BALANCED</span></div>
              </div>
            </div>

            <DataTable
              title={`Trial Balance Summary (${displayTrialBalance.length} Active Accounts)`}
              data={displayTrialBalance}
              columns={[
                { key: 'code', header: 'Code', accessor: (t) => <span className="font-mono text-cyan-400 font-bold">{t.code}</span> },
                { key: 'name', header: 'Account Head', accessor: (t) => <span className="font-bold text-slate-100">{t.name}</span> },
                { key: 'type', header: 'Type', accessor: (t) => t.type },
                { key: 'totalDebit', header: 'Debit Balance (PKR)', accessor: (t) => <span className="font-mono text-emerald-400">Rs. {t.type === 'ASSET' || t.type === 'EXPENSE' ? Math.max(0, t.netBalance).toLocaleString() : '0'}</span>, isNumeric: true },
                { key: 'totalCredit', header: 'Credit Balance (PKR)', accessor: (t) => <span className="font-mono text-cyan-400">Rs. {t.type === 'LIABILITY' || t.type === 'EQUITY' || t.type === 'REVENUE' ? Math.abs(t.netBalance).toLocaleString() : '0'}</span>, isNumeric: true }
              ]}
            />
          </div>
        </div>
      )}

      {/* Tab 6: Profit & Loss Statement */}
      {activeSubTab === 'pnl' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6 max-w-4xl mx-auto">
          <div className="border-b border-slate-800 pb-3 flex justify-between items-center">
            <div>
              <h2 className="text-base font-black text-slate-100 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-400" />
                Profit & Loss Statement (P&L)
              </h2>
              <p className="text-xs text-slate-400">Financial Performance for {currentCompany.name}</p>
            </div>
            <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-950/60 border border-cyan-800 px-3 py-1 rounded-xl">
              FY 2025-2026
            </span>
          </div>

          <div className="space-y-4 text-xs font-mono">
            {/* Operating Revenues */}
            <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-800/40 space-y-2">
              <h3 className="font-sans font-bold text-emerald-400 uppercase text-xs">1. Operating Revenue & Sales Income</h3>
              {displayIncomeAccounts.length === 0 ? (
                <div className="text-slate-500 italic py-1">No active revenue accounts with balance</div>
              ) : (
                displayIncomeAccounts.map((inc) => (
                  <div key={inc.id} className="flex justify-between border-b border-slate-800/60 py-1">
                    <span className="text-slate-300">{inc.code} - {inc.name}</span>
                    <span className="text-emerald-300 font-bold">Rs. {Math.abs(inc.balance).toLocaleString()}</span>
                  </div>
                ))
              )}
              <div className="flex justify-between pt-2 text-sm font-bold text-emerald-400">
                <span>TOTAL REVENUE</span>
                <span>Rs. {totalRevenue.toLocaleString()}</span>
              </div>
            </div>

            {/* Operating Expenses */}
            <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-800/40 space-y-2">
              <h3 className="font-sans font-bold text-rose-400 uppercase text-xs">2. Operating Expenses & Cost of Goods Sold</h3>
              {displayExpenseAccounts.length === 0 ? (
                <div className="text-slate-500 italic py-1">No active expense accounts with balance</div>
              ) : (
                displayExpenseAccounts.map((exp) => (
                  <div key={exp.id} className="flex justify-between border-b border-slate-800/60 py-1">
                    <span className="text-slate-300">{exp.code} - {exp.name}</span>
                    <span className="text-rose-300 font-bold">Rs. {Math.abs(exp.balance).toLocaleString()}</span>
                  </div>
                ))
              )}
              <div className="flex justify-between pt-2 text-sm font-bold text-rose-400">
                <span>TOTAL EXPENSES</span>
                <span>Rs. {totalExpenses.toLocaleString()}</span>
              </div>
            </div>

            {/* Net Operating Profit / Loss */}
            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-700 flex justify-between items-center text-sm font-bold">
              <span className="text-slate-200">NET OPERATING PROFIT / (LOSS)</span>
              <span className={`text-base font-black ${netProfitLoss >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                Rs. {netProfitLoss.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Tab 7: Balance Sheet */}
      {activeSubTab === 'balanceSheet' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6 max-w-4xl mx-auto">
          <div className="border-b border-slate-800 pb-3 flex justify-between items-center">
            <div>
              <h2 className="text-base font-black text-slate-100 flex items-center gap-2">
                <PieChart className="w-5 h-5 text-purple-400" />
                Statement of Financial Position (Balance Sheet)
              </h2>
              <p className="text-xs text-slate-400">Assets, Liabilities & Owner Equity for {currentCompany.name}</p>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-3 py-1 rounded-xl">
              Equilibrium Balanced
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs font-mono">
            {/* Assets Column */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
              <h3 className="font-sans font-bold text-cyan-400 uppercase border-b border-slate-800 pb-1">TOTAL ASSETS</h3>
              {displayAssetAccounts.map((ast) => (
                <div key={ast.id} className="flex justify-between text-slate-300">
                  <span>{ast.name}</span>
                  <span className="font-bold text-cyan-300">Rs. {Math.abs(ast.balance).toLocaleString()}</span>
                </div>
              ))}
              <div className="pt-3 border-t border-slate-800 flex justify-between text-sm font-bold text-cyan-400">
                <span>TOTAL ASSETS</span>
                <span>Rs. {totalAssets.toLocaleString()}</span>
              </div>
            </div>

            {/* Liabilities & Equity Column */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
              <h3 className="font-sans font-bold text-purple-400 uppercase border-b border-slate-800 pb-1">LIABILITIES & EQUITY</h3>
              <div className="text-slate-400 text-[10px] uppercase font-bold">Liabilities</div>
              {displayLiabilityAccounts.map((lib) => (
                <div key={lib.id} className="flex justify-between text-slate-300">
                  <span>{lib.name}</span>
                  <span className="font-bold text-rose-300">Rs. {Math.abs(lib.balance).toLocaleString()}</span>
                </div>
              ))}

              <div className="text-slate-400 text-[10px] uppercase font-bold pt-2">Equity & Retained Earnings</div>
              {displayEquityAccounts.map((eq) => (
                <div key={eq.id} className="flex justify-between text-slate-300">
                  <span>{eq.name}</span>
                  <span className="font-bold text-purple-300">Rs. {Math.abs(eq.balance).toLocaleString()}</span>
                </div>
              ))}
              <div className="flex justify-between text-slate-300">
                <span>Current Year Net Profit</span>
                <span className="font-bold text-emerald-300">Rs. {netProfitLoss.toLocaleString()}</span>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-between text-sm font-bold text-purple-400">
                <span>TOTAL LIABILITIES & EQUITY</span>
                <span>Rs. {(totalLiabilities + totalEquity).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeSubTab === 'newVoucher' && (
        <JournalVoucherForm 
          onSuccess={() => switchSubTab('vouchers')} 
          onCancel={() => switchSubTab('vouchers')} 
        />
      )}


      {/* Tab 8: Budget Planning & Variance Dashboard */}
      {activeSubTab === 'budget' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
            <div>
              <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wider text-emerald-400 flex items-center gap-2">
                <Target className="w-5 h-5" />
                Budget Planning vs Actual General Ledger Expenditures
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Real-time tracking of projected budget allocations against live General Ledger debit transactions for fiscal year 2026-2027.
              </p>
            </div>

            <button
              onClick={() => setShowAddBudgetModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 transition-all shrink-0"
            >
              <Plus className="w-4 h-4" />
              Allocate New Budget Target
            </button>
          </div>

          {/* Budget Overview KPI Summary Cards */}
          {(() => {
            const totalProjected = budgets.reduce((sum, b) => sum + b.projectedAmount, 0);
            const totalActual = budgets.reduce((sum, b) => {
              const actualSpent = generalLedgerList
                .filter((g) => g.accountCode === b.accountCode)
                .reduce((s, g) => s + g.debit, 0);
              return sum + (actualSpent || 0);
            }, 0);
            const netRemaining = totalProjected - totalActual;
            const overallUtilization = totalProjected > 0 ? (totalActual / totalProjected) * 100 : 0;

            return (
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 font-mono text-xs">
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-xl space-y-1">
                  <span className="text-slate-400 text-[11px] block uppercase">Total Projected Budget</span>
                  <span className="text-2xl font-black text-slate-100">Rs. {totalProjected.toLocaleString()}</span>
                  <span className="text-[10px] text-slate-500 block">Fiscal Year 2026-2027</span>
                </div>

                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-xl space-y-1">
                  <span className="text-slate-400 text-[11px] block uppercase">Live GL Actual Expenditures</span>
                  <span className="text-2xl font-black text-amber-400">Rs. {totalActual.toLocaleString()}</span>
                  <span className="text-[10px] text-slate-500 block">Synced with Firebase GL</span>
                </div>

                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-xl space-y-1">
                  <span className="text-slate-400 text-[11px] block uppercase">Net Remaining Funds</span>
                  <span className={`text-2xl font-black ${netRemaining >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    Rs. {netRemaining.toLocaleString()}
                  </span>
                  <span className="text-[10px] text-slate-500 block">Available Capital</span>
                </div>

                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-xl space-y-1">
                  <span className="text-slate-400 text-[11px] block uppercase">Budget Utilization</span>
                  <span className={`text-2xl font-black ${overallUtilization > 100 ? 'text-rose-400' : 'text-cyan-400'}`}>
                    {overallUtilization.toFixed(1)}%
                  </span>
                  <span className="text-[10px] text-slate-500 block">Overall Target Rate</span>
                </div>
              </div>
            );
          })()}

          {/* Budget vs Actual Variance Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400">
              Departmental Budget vs Actual GL Variance Breakdown
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-xs font-mono text-left border-collapse border border-slate-800">
                <thead>
                  <tr className="bg-slate-800 text-slate-300 border-b border-slate-700 uppercase font-bold">
                    <th className="p-3 border border-slate-800">Account / Category</th>
                    <th className="p-3 border border-slate-800 text-right">Projected Budget</th>
                    <th className="p-3 border border-slate-800 text-right">Actual GL Spent</th>
                    <th className="p-3 border border-slate-800 text-right">Variance (Diff)</th>
                    <th className="p-3 border border-slate-800 text-center">Utilization Bar</th>
                    <th className="p-3 border border-slate-800 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {budgets.map((b) => {
                    const actualSpent = generalLedgerList
                      .filter((g) => g.accountCode === b.accountCode)
                      .reduce((s, g) => s + g.debit, 0);

                    const variance = b.projectedAmount - actualSpent;
                    const percent = b.projectedAmount > 0 ? (actualSpent / b.projectedAmount) * 100 : 0;

                    let statusBadge = (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        Under Budget
                      </span>
                    );
                    let barColor = 'bg-emerald-500';

                    if (percent >= 80 && percent <= 100) {
                      statusBadge = (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          Near Limit
                        </span>
                      );
                      barColor = 'bg-amber-500';
                    } else if (percent > 100) {
                      statusBadge = (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1 justify-center">
                          <AlertTriangle className="w-3 h-3" /> Over Budget
                        </span>
                      );
                      barColor = 'bg-rose-500';
                    }

                    return (
                      <tr key={b.id} className="hover:bg-slate-800/40">
                        <td className="p-3 border border-slate-800/60">
                          <div className="font-bold text-slate-100">{b.accountName}</div>
                          <div className="text-[10px] text-slate-400">Code: {b.accountCode} • Category: {b.category}</div>
                        </td>
                        <td className="p-3 border border-slate-800/60 text-right font-bold text-slate-200">
                          Rs. {b.projectedAmount.toLocaleString()}
                        </td>
                        <td className="p-3 border border-slate-800/60 text-right font-bold text-amber-400">
                          Rs. {actualSpent.toLocaleString()}
                        </td>
                        <td className={`p-3 border border-slate-800/60 text-right font-bold ${variance >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                          Rs. {variance.toLocaleString()}
                        </td>
                        <td className="p-3 border border-slate-800/60 text-center w-48">
                          <div className="space-y-1">
                            <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden border border-slate-700">
                              <div
                                className={`h-full ${barColor} transition-all duration-500`}
                                style={{ width: `${Math.min(100, percent)}%` }}
                              />
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono">{percent.toFixed(1)}% Used</div>
                          </div>
                        </td>
                        <td className="p-3 border border-slate-800/60 text-center">
                          {statusBadge}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Bank Reconciliation Summary */}
      {activeSubTab === 'bankReconciliation' && (
        <BankReconciliationReport vouchers={vouchers} />
      )}

      {/* Tab: Automated Statement Parser */}
      {activeSubTab === 'statementParser' && (
        <AutomatedStatementParser vouchers={vouchers} />
      )}

      {/* Allocate New Budget Modal */}
      {showAddBudgetModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider text-emerald-400">
                Allocate New Budget Target
              </h3>
              <button
                type="button"
                onClick={() => setShowAddBudgetModal(false)}
                className="text-slate-400 hover:text-slate-200 text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateBudget} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Expense Account Head</label>
                <select
                  value={budAccountCode}
                  onChange={(e) => {
                    const code = e.target.value;
                    setBudAccountCode(code);
                    const matchedAcc = accounts.find((a) => a.code === code);
                    if (matchedAcc) {
                      setBudAccountName(matchedAcc.name);
                      setBudCategory(matchedAcc.category);
                    }
                  }}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-100"
                >
                  {accounts
                    .filter((a) => a.type === 'EXPENSE' || a.code.startsWith('5'))
                    .map((a) => (
                      <option key={a.id} value={a.code}>
                        {a.code} - {a.name}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Category Title</label>
                <input
                  type="text"
                  value={budCategory}
                  onChange={(e) => setBudCategory(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Projected Budget Allocation (PKR)</label>
                <input
                  type="number"
                  value={budProjectedAmount}
                  onChange={(e) => setBudProjectedAmount(Number(e.target.value))}
                  required
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-100 font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddBudgetModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30"
                >
                  Save Budget Target
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Voucher Update & Review Modal */}
      {selectedVoucherForReview && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-4xl w-full space-y-5 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <Receipt className="w-5 h-5 text-emerald-400" />
                  <h2 className="text-base font-bold text-slate-100 uppercase font-mono">
                    {selectedVoucherForReview.voucherNo}
                  </h2>
                  <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
                    {selectedVoucherForReview.status}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Journal Voucher Detail & Double-Entry Line Items Review
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedVoucherForReview(null)}
                className="text-slate-400 hover:text-slate-200 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs font-mono">
              <div>
                <span className="text-slate-500 block text-[10px] uppercase">Voucher Date</span>
                <span className="text-slate-200 font-bold">{selectedVoucherForReview.date}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase">Type</span>
                <span className="text-cyan-400 font-bold">{selectedVoucherForReview.type}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase">Ref / Doc No</span>
                <span className="text-slate-200">{selectedVoucherForReview.referenceNo || 'N/A'}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase">Created By</span>
                <span className="text-slate-200">{selectedVoucherForReview.createdBy}</span>
              </div>
            </div>

            <div>
              <span className="text-xs font-bold text-slate-300 block mb-1">Narration / Header Memo</span>
              <p className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-300 font-sans">
                {selectedVoucherForReview.narration}
              </p>
            </div>

            {/* Line Items Table */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-300 uppercase font-mono">
                Line Items Breakdown (Double-Entry Debit & Credit)
              </span>

              <div className="overflow-x-auto border border-slate-800 rounded-xl">
                <table className="w-full text-xs font-mono text-left">
                  <thead className="bg-slate-800 text-slate-300 border-b border-slate-700 uppercase">
                    <tr>
                      <th className="p-3">COA Code</th>
                      <th className="p-3">COA Head Name</th>
                      <th className="p-3">Description</th>
                      <th className="p-3 text-right">Debit (PKR)</th>
                      <th className="p-3 text-right">Credit (PKR)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 bg-slate-950/60">
                    {selectedVoucherForReview.items.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-800/40">
                        <td className="p-3 font-bold text-cyan-400">{item.accountCode}</td>
                        <td className="p-3 text-slate-200 font-bold">{item.accountName}</td>
                        <td className="p-3 text-slate-400 text-xs">{item.description || selectedVoucherForReview.narration}</td>
                        <td className="p-3 text-right font-bold text-emerald-400">
                          Rs. {(item.debit || 0).toLocaleString()}
                        </td>
                        <td className="p-3 text-right font-bold text-cyan-400">
                          Rs. {(item.credit || 0).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-slate-800 text-slate-100 font-bold border-t border-slate-700">
                    <tr>
                      <td colSpan={3} className="p-3 text-right uppercase text-xs">Total Balance Equilbrium:</td>
                      <td className="p-3 text-right text-emerald-400">
                        Rs. {selectedVoucherForReview.items.reduce((s, i) => s + (i.debit || 0), 0).toLocaleString()}
                      </td>
                      <td className="p-3 text-right text-cyan-400">
                        Rs. {selectedVoucherForReview.items.reduce((s, i) => s + (i.credit || 0), 0).toLocaleString()}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-slate-800">
              <span className="text-[11px] text-emerald-400 font-mono">✓ Verified Balance Equilbrium in Firebase</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedVoucherForReview(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold"
                >
                  Close Review
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30"
                >
                  Print Voucher PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


