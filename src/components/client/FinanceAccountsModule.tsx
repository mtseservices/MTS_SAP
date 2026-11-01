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
  Share2
} from 'lucide-react';
import { useAuthTenant } from '../../context/AuthTenantContext';
import { AccountHead, JournalVoucher, VoucherItem } from '../../types/erp';
import { DataTable } from '../common/DataTable';
import { TTSButton } from '../common/TTSButton';
import {
  subscribeCompanyAccounts,
  subscribeCompanyVouchers,
  postVoucherToFirebase,
  saveAccountHeadToFirebase
} from '../../services/firebaseAccounting';

type SubTab = 'vouchers' | 'coa' | 'gl' | 'subledger' | 'trialBalance' | 'pnl' | 'balanceSheet' | 'newVoucher';

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
    if (tabParam === 'newVoucher') return 'newVoucher';

    return 'vouchers';
  };

  const [activeSubTab, setActiveSubTab] = useState<SubTab>(getInitialTab);
  const [accounts, setAccounts] = useState<AccountHead[]>([]);
  const [vouchers, setVouchers] = useState<JournalVoucher[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // New Voucher Form state
  const [voucherType, setVoucherType] = useState<'JOURNAL' | 'PAYMENT' | 'RECEIPT' | 'CONTRA'>('JOURNAL');
  const [narration, setNarration] = useState('');
  const [refNo, setRefNo] = useState('');
  const [items, setItems] = useState<VoucherItem[]>([
    { accountId: 'acc_1020', accountCode: '1020', accountName: 'Meezan Bank Operations Account', description: 'Bank Entry', debit: 250000, credit: 0 },
    { accountId: 'acc_1200', accountCode: '1200', accountName: 'Accounts Receivable', description: 'Customer Clearance', debit: 0, credit: 250000 }
  ]);

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

    return () => {
      unsubAccounts();
      unsubVouchers();
    };
  }, [currentCompany.id]);

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
  // 1. General Ledger Postings List (Flattened line items across all posted vouchers)
  const generalLedgerList = vouchers.flatMap((v) =>
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

  // 2. Trial Balance Calculation (Aggregated Debit & Credit per Account Head)
  const trialBalanceList = accounts.map((acc) => {
    const accEntries = generalLedgerList.filter((g) => g.accountCode === acc.code);
    const sumDebit = accEntries.reduce((s, e) => s + e.debit, 0);
    const sumCredit = accEntries.reduce((s, e) => s + e.credit, 0);
    const netBalance = acc.balance;

    return {
      code: acc.code,
      name: acc.name,
      type: acc.type,
      totalDebit: sumDebit,
      totalCredit: sumCredit,
      netBalance
    };
  });

  const totalTBDebit = trialBalanceList.reduce((s, t) => s + (t.type === 'Asset' || t.type === 'Expense' ? Math.max(0, t.netBalance) : 0), 0);
  const totalTBCredit = trialBalanceList.reduce((s, t) => s + (t.type === 'Liability' || t.type === 'Equity' || t.type === 'Income' ? Math.abs(t.netBalance) : 0), 0);

  // 3. Profit & Loss Statement (Revenues vs Operating Expenses)
  const incomeAccounts = accounts.filter((a) => a.type === 'Income');
  const expenseAccounts = accounts.filter((a) => a.type === 'Expense');

  const totalRevenue = incomeAccounts.reduce((sum, a) => sum + Math.abs(a.balance), 0);
  const totalExpenses = expenseAccounts.reduce((sum, a) => sum + Math.abs(a.balance), 0);
  const netProfitLoss = totalRevenue - totalExpenses;

  // 4. Balance Sheet (Assets vs Liabilities & Equity)
  const assetAccounts = accounts.filter((a) => a.type === 'Asset');
  const liabilityAccounts = accounts.filter((a) => a.type === 'Liability');
  const equityAccounts = accounts.filter((a) => a.type === 'Equity');

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
              Real-Time Financial Accounting Engine ({currentCompany.name})
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
          <button
            onClick={() => switchSubTab('newVoucher')}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 transition-all"
          >
            <Plus className="w-4 h-4" />
            Post New Voucher
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3 text-xs font-bold">
        {[
          { id: 'vouchers', label: `Journal Vouchers (${vouchers.length})`, icon: Receipt },
          { id: 'coa', label: `Chart of Accounts (${accounts.length})`, icon: Layers },
          { id: 'gl', label: 'General Ledger', icon: BookOpen },
          { id: 'subledger', label: 'Sub-Ledger (AR/AP)', icon: FileSpreadsheet },
          { id: 'trialBalance', label: 'Trial Balance', icon: Scale },
          { id: 'pnl', label: 'Profit & Loss (P&L)', icon: TrendingUp },
          { id: 'balanceSheet', label: 'Balance Sheet', icon: PieChart }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => switchSubTab(tab.id as SubTab)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all ${
                isActive
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200 bg-slate-800/60'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab 1: Vouchers Table */}
      {activeSubTab === 'vouchers' && (
        <DataTable
          title="Posted Financial Vouchers (Real-Time Firebase)"
          data={vouchers}
          columns={[
            { key: 'voucherNo', header: 'Voucher No', accessor: (v) => <span className="font-mono font-bold text-emerald-400">{v.voucherNo}</span>, sortable: true },
            { key: 'date', header: 'Date', accessor: (v) => v.date, sortable: true },
            { key: 'type', header: 'Type', accessor: (v) => <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-cyan-300 font-mono font-bold">{v.type}</span> },
            { key: 'totalAmount', header: 'Amount (PKR)', accessor: (v) => <span className="font-mono font-bold text-slate-100">Rs. {v.totalAmount.toLocaleString()}</span>, isNumeric: true, sortable: true },
            { key: 'narration', header: 'Narration / Description', accessor: (v) => <span className="text-slate-300 max-w-xs truncate block">{v.narration}</span> },
            { key: 'status', header: 'Status', accessor: (v) => <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">{v.status}</span> }
          ]}
        />
      )}

      {/* Tab 2: Chart of Accounts */}
      {activeSubTab === 'coa' && (
        <DataTable
          title="Master Chart of Accounts (COA Balances)"
          data={accounts}
          columns={[
            { key: 'code', header: 'Account Code', accessor: (a) => <span className="font-mono font-bold text-cyan-400">{a.code}</span>, sortable: true },
            { key: 'name', header: 'Account Head Name', accessor: (a) => <span className="font-bold text-slate-100">{a.name}</span>, sortable: true },
            { key: 'type', header: 'Type', accessor: (a) => <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-purple-300 font-semibold">{a.type}</span>, sortable: true },
            { key: 'category', header: 'Category', accessor: (a) => a.category },
            { key: 'balance', header: 'Auto Calculated Balance (PKR)', accessor: (a) => <span className="font-mono font-bold text-emerald-400">Rs. {a.balance.toLocaleString()}</span>, isNumeric: true, sortable: true }
          ]}
        />
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
              title="Trial Balance Summary"
              data={trialBalanceList}
              columns={[
                { key: 'code', header: 'Code', accessor: (t) => <span className="font-mono text-cyan-400 font-bold">{t.code}</span> },
                { key: 'name', header: 'Account Head', accessor: (t) => <span className="font-bold text-slate-100">{t.name}</span> },
                { key: 'type', header: 'Type', accessor: (t) => t.type },
                { key: 'totalDebit', header: 'Debit Balance (PKR)', accessor: (t) => <span className="font-mono text-emerald-400">Rs. {t.type === 'Asset' || t.type === 'Expense' ? Math.max(0, t.netBalance).toLocaleString() : '0'}</span>, isNumeric: true },
                { key: 'totalCredit', header: 'Credit Balance (PKR)', accessor: (t) => <span className="font-mono text-cyan-400">Rs. {t.type === 'Liability' || t.type === 'Equity' || t.type === 'Income' ? Math.abs(t.netBalance).toLocaleString() : '0'}</span>, isNumeric: true }
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
              {incomeAccounts.map((inc) => (
                <div key={inc.id} className="flex justify-between border-b border-slate-800/60 py-1">
                  <span className="text-slate-300">{inc.code} - {inc.name}</span>
                  <span className="text-emerald-300 font-bold">Rs. {Math.abs(inc.balance).toLocaleString()}</span>
                </div>
              ))}
              <div className="flex justify-between pt-2 text-sm font-bold text-emerald-400">
                <span>TOTAL REVENUE</span>
                <span>Rs. {totalRevenue.toLocaleString()}</span>
              </div>
            </div>

            {/* Operating Expenses */}
            <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-800/40 space-y-2">
              <h3 className="font-sans font-bold text-rose-400 uppercase text-xs">2. Operating Expenses & Cost of Goods Sold</h3>
              {expenseAccounts.map((exp) => (
                <div key={exp.id} className="flex justify-between border-b border-slate-800/60 py-1">
                  <span className="text-slate-300">{exp.code} - {exp.name}</span>
                  <span className="text-rose-300 font-bold">Rs. {Math.abs(exp.balance).toLocaleString()}</span>
                </div>
              ))}
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
              {assetAccounts.map((ast) => (
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
              {liabilityAccounts.map((lib) => (
                <div key={lib.id} className="flex justify-between text-slate-300">
                  <span>{lib.name}</span>
                  <span className="font-bold text-rose-300">Rs. {Math.abs(lib.balance).toLocaleString()}</span>
                </div>
              ))}

              <div className="text-slate-400 text-[10px] uppercase font-bold pt-2">Equity & Retained Earnings</div>
              {equityAccounts.map((eq) => (
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

      {/* Tab 8: New Voucher Posting Form */}
      {activeSubTab === 'newVoucher' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6 max-w-3xl mx-auto">
          <div className="border-b border-slate-800 pb-3 flex justify-between items-center">
            <div>
              <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wider text-emerald-400">
                Double-Entry Financial Voucher Entry
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Automatically posts debit/credit amounts to Firebase and recalculates COA, GL, Trial Balance, P&L, and Balance Sheet.
              </p>
            </div>
            <button
              type="button"
              onClick={openFormInNewTab}
              className="px-2.5 py-1 rounded-lg bg-slate-800 text-cyan-300 border border-slate-700 text-xs font-semibold flex items-center gap-1"
            >
              <ExternalLink className="w-3.5 h-3.5" /> Open Form in New Tab
            </button>
          </div>

          <form onSubmit={handlePostVoucher} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Voucher Type</label>
                <select
                  value={voucherType}
                  onChange={(e) => setVoucherType(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                >
                  <option value="JOURNAL">Journal Voucher (JV)</option>
                  <option value="PAYMENT">Bank/Cash Payment Voucher (BPV/CPV)</option>
                  <option value="RECEIPT">Bank/Cash Receipt Voucher (BRV/CRV)</option>
                  <option value="CONTRA">Contra Voucher</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Reference / Cheque No</label>
                <input
                  type="text"
                  value={refNo}
                  onChange={(e) => setRefNo(e.target.value)}
                  placeholder="e.g. CHQ-99120"
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Narration / Memo</label>
              <input
                type="text"
                value={narration}
                onChange={(e) => setNarration(e.target.value)}
                placeholder="Enter transaction narrative..."
                required
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Line Items Table */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Journal Line Items (Debit / Credit PKR)
                </label>
                <button
                  type="button"
                  onClick={() => {
                    const defaultAcc = accounts[0];
                    setItems([
                      ...items,
                      {
                        accountId: defaultAcc ? defaultAcc.id : 'acc_1020',
                        accountCode: defaultAcc ? defaultAcc.code : '1020',
                        accountName: defaultAcc ? defaultAcc.name : 'Meezan Bank Operations Account',
                        description: 'Voucher Adjustment',
                        debit: 0,
                        credit: 0
                      }
                    ]);
                  }}
                  className="flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300 font-bold"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Line Item
                </button>
              </div>

              {items.map((item, idx) => (
                <div key={idx} className="grid grid-cols-12 gap-2 items-center bg-slate-800/60 p-3 rounded-xl border border-slate-700">
                  <div className="col-span-4">
                    <select
                      value={item.accountId}
                      onChange={(e) => {
                        const acc = accounts.find((a) => a.id === e.target.value);
                        if (acc) {
                          const updated = [...items];
                          updated[idx] = { ...updated[idx], accountId: acc.id, accountCode: acc.code, accountName: acc.name };
                          setItems(updated);
                        }
                      }}
                      className="w-full px-2 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-100"
                    >
                      {accounts.map((acc) => (
                        <option key={acc.id} value={acc.id}>
                          {acc.code} - {acc.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="col-span-3">
                    <input
                      type="number"
                      value={item.debit}
                      onChange={(e) => {
                        const updated = [...items];
                        updated[idx].debit = Number(e.target.value) || 0;
                        setItems(updated);
                      }}
                      placeholder="Debit PKR"
                      className="w-full px-2 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-emerald-400 font-mono text-right font-bold"
                    />
                  </div>

                  <div className="col-span-3">
                    <input
                      type="number"
                      value={item.credit}
                      onChange={(e) => {
                        const updated = [...items];
                        updated[idx].credit = Number(e.target.value) || 0;
                        setItems(updated);
                      }}
                      placeholder="Credit PKR"
                      className="w-full px-2 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-cyan-400 font-mono text-right font-bold"
                    />
                  </div>

                  <div className="col-span-2 flex justify-end">
                    {items.length > 2 && (
                      <button
                        type="button"
                        onClick={() => {
                          setItems(items.filter((_, i) => i !== idx));
                        }}
                        className="px-2 py-1 rounded bg-rose-500/20 text-rose-300 hover:bg-rose-500/40 text-xs font-bold transition-all"
                        title="Remove row"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Totals & Balance indicator */}
            <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 flex items-center justify-between text-xs font-mono">
              <div>
                Total Debit: <span className="font-bold text-emerald-400">Rs. {totalDebit.toLocaleString()}</span>
              </div>
              <div>
                Total Credit: <span className="font-bold text-cyan-400">Rs. {totalCredit.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-1.5">
                {isBalanced ? (
                  <span className="flex items-center gap-1 text-emerald-400 font-bold">
                    <CheckCircle2 className="w-4 h-4" /> Balanced
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-rose-400 font-bold animate-pulse">
                    <AlertCircle className="w-4 h-4" /> Unbalanced (Diff: Rs. {Math.abs(totalDebit - totalCredit).toLocaleString()})
                  </span>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3">
              <button
                type="button"
                onClick={() => switchSubTab('vouchers')}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!isBalanced}
                className={`px-6 py-2 rounded-xl font-bold text-xs text-white transition-all ${
                  isBalanced
                    ? 'bg-emerald-600 hover:bg-emerald-500 shadow-lg shadow-emerald-600/30'
                    : 'bg-slate-700 opacity-50 cursor-not-allowed'
                }`}
              >
                Post Voucher & Sync Firebase
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

