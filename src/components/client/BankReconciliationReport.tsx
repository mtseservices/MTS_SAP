import React, { useState, useEffect } from 'react';
import {
  Scale,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
  Download,
  RefreshCw,
  Search,
  Check,
  ShieldCheck,
  Landmark,
  ArrowRight,
  Filter,
  FileText
} from 'lucide-react';
import { useAuthTenant } from '../../context/AuthTenantContext';
import { JournalVoucher, ReconciliationRule } from '../../types/erp';
import { getMasterReconciliationRules, getMasterBankAccounts } from '../../services/masterBankAccountsService';
import { TTSButton } from '../common/TTSButton';

interface BankStatementRow {
  id: string;
  date: string;
  narration: string;
  deposit: number;
  withdrawal: number;
  referenceNo: string;
  status: 'MATCHED_EXACT' | 'MATCHED_PATTERN' | 'UNMATCHED_PENDING' | 'DISCREPANCY';
  matchedVoucherNo?: string;
  matchedRuleName?: string;
}

export const BankReconciliationReport: React.FC<{ vouchers: JournalVoucher[] }> = ({ vouchers }) => {
  const { currentCompany } = useAuthTenant();
  const [rules, setRules] = useState<ReconciliationRule[]>([]);
  const [masterAccounts, setMasterAccounts] = useState<any[]>([]);
  const [selectedBankId, setSelectedBankId] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isReconciling, setIsReconciling] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  // Simulated uploaded bank statement data
  const [statementRows, setStatementRows] = useState<BankStatementRow[]>([
    {
      id: 'stmt_01',
      date: '2026-10-28',
      narration: 'IBFT RAAST Transfer from TENANT-003 Subscription Fee',
      deposit: 120000,
      withdrawal: 0,
      referenceNo: 'TENANT-003',
      status: 'MATCHED_EXACT',
      matchedVoucherNo: 'JV-2026-1024',
      matchedRuleName: 'Standard Tenant Subscription ID Pattern'
    },
    {
      id: 'stmt_02',
      date: '2026-10-29',
      narration: 'Online 1Link clearing from Crest Logistics Invoice #4092',
      deposit: 450000,
      withdrawal: 0,
      referenceNo: 'INV-4092',
      status: 'MATCHED_PATTERN',
      matchedVoucherNo: 'RV-2026-1092',
      matchedRuleName: 'Raast Instant Transfer Alias Match'
    },
    {
      id: 'stmt_03',
      date: '2026-10-30',
      narration: 'ATM Cash Withdrawal Main Boulevard Branch',
      deposit: 0,
      withdrawal: 75000,
      referenceNo: 'ATM-9921',
      status: 'UNMATCHED_PENDING'
    },
    {
      id: 'stmt_04',
      date: '2026-10-31',
      narration: 'Wire Transfer from unregistered source AB-8831',
      deposit: 850000,
      withdrawal: 0,
      referenceNo: 'AB-8831',
      status: 'DISCREPANCY',
      matchedRuleName: 'High Value Corporate Wire Transfer Review'
    },
    {
      id: 'stmt_05',
      date: '2026-11-01',
      narration: 'IBFT RAAST Transfer from TENANT-012 License renewal',
      deposit: 1200000,
      withdrawal: 0,
      referenceNo: 'TENANT-012',
      status: 'MATCHED_EXACT',
      matchedVoucherNo: 'JV-2026-1102',
      matchedRuleName: 'Standard Tenant Subscription ID Pattern'
    }
  ]);

  useEffect(() => {
    loadMasterSettings();
  }, []);

  const loadMasterSettings = async () => {
    const r = await getMasterReconciliationRules();
    setRules(r);
    const acc = await getMasterBankAccounts();
    setMasterAccounts(acc);
  };

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  const runAiReconciliation = () => {
    setIsReconciling(true);
    setTimeout(() => {
      // Re-evaluate rows using rules
      const updated = statementRows.map((row) => {
        if (row.status === 'UNMATCHED_PENDING') {
          // Check if matches any rule
          const matchedRule = rules.find((rule) => {
            const matchesAmount = row.deposit >= rule.minTransactionAmount && row.deposit <= rule.maxTransactionAmount;
            const regex = new RegExp(rule.referencePattern, 'i');
            const matchesRef = regex.test(row.referenceNo) || regex.test(row.narration);
            return matchesAmount && matchesRef && rule.isActive;
          });

          if (matchedRule) {
            return {
              ...row,
              status: matchedRule.autoApprove ? ('MATCHED_EXACT' as const) : ('MATCHED_PATTERN' as const),
              matchedRuleName: matchedRule.ruleName,
              matchedVoucherNo: 'AUTO-REC-' + Math.floor(1000 + Math.random() * 9000)
            };
          }
        }
        return row;
      });

      setStatementRows(updated);
      setIsReconciling(false);
      showToast('AI Automated Bank Reconciliation completed successfully using Master Rules.');
    }, 1200);
  };

  const handleManualResolve = (rowId: string, newStatus: BankStatementRow['status']) => {
    setStatementRows((prev) =>
      prev.map((r) => (r.id === rowId ? { ...r, status: newStatus } : r))
    );
    showToast(`Bank statement row status updated to ${newStatus}.`);
  };

  // Metrics
  const totalStatementDeposits = statementRows.reduce((acc, r) => acc + r.deposit, 0);
  const totalReconciledAmount = statementRows
    .filter((r) => r.status === 'MATCHED_EXACT' || r.status === 'MATCHED_PATTERN')
    .reduce((acc, r) => acc + r.deposit, 0);
  const totalUnmatchedAmount = statementRows
    .filter((r) => r.status === 'UNMATCHED_PENDING' || r.status === 'DISCREPANCY')
    .reduce((acc, r) => acc + (r.deposit || r.withdrawal), 0);

  const filteredRows = statementRows.filter((r) => {
    const matchesSearch =
      r.narration.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.referenceNo.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;
    if (filterStatus === 'MATCHED' && !r.status.startsWith('MATCHED')) return false;
    if (filterStatus === 'UNMATCHED' && r.status !== 'UNMATCHED_PENDING') return false;
    if (filterStatus === 'DISCREPANCY' && r.status !== 'DISCREPANCY') return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400">
            <Scale className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold text-slate-100">Bank Reconciliation Summary</h2>
              <TTSButton text="Bank Reconciliation Summary report. Visually compares uploaded bank statements against internal ledger entries using Master Bank Account Setup rules." />
            </div>
            <p className="text-sm text-slate-400 mt-1">
              Automated statement processing and reconciliation governed by SBP/1Link master rules for {currentCompany.name}.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={runAiReconciliation}
            disabled={isReconciling}
            className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-xl transition shadow-lg shadow-emerald-600/20 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isReconciling ? 'animate-spin' : ''}`} />
            <span>{isReconciling ? 'Running AI Rules...' : 'Run AI Auto-Reconciliation'}</span>
          </button>
        </div>
      </div>

      {notification && (
        <div className="bg-emerald-950/80 border border-emerald-500/30 text-emerald-300 p-4 rounded-xl flex items-center gap-3 shadow-lg animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-2 shadow-lg">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Bank Deposits</span>
          <div className="text-2xl font-bold text-slate-100 font-mono">
            PKR {totalStatementDeposits.toLocaleString()}
          </div>
          <p className="text-xs text-slate-500">From uploaded bank statement feed</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-2 shadow-lg">
          <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Reconciled Amount</span>
          <div className="text-2xl font-bold text-emerald-300 font-mono">
            PKR {totalReconciledAmount.toLocaleString()}
          </div>
          <p className="text-xs text-emerald-500/80">Matched with internal GL vouchers</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-2 shadow-lg">
          <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">Unmatched / Discrepancy</span>
          <div className="text-2xl font-bold text-amber-300 font-mono">
            PKR {totalUnmatchedAmount.toLocaleString()}
          </div>
          <p className="text-xs text-amber-500/80">Requires manual review or rule tuning</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-2 shadow-lg">
          <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">Master Rules Active</span>
          <div className="text-2xl font-bold text-indigo-300 font-mono">
            {rules.filter((r) => r.isActive).length} Rules
          </div>
          <p className="text-xs text-indigo-400/80">SBP & 1Link matching patterns</p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search narration or reference ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-slate-200 text-sm focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
          {(['ALL', 'MATCHED', 'UNMATCHED', 'DISCREPANCY'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilterStatus(tab)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition whitespace-nowrap ${
                filterStatus === tab
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
              }`}
            >
              {tab.charAt(0) + tab.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Comparison Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-950 border-b border-slate-800 text-slate-400 text-xs uppercase tracking-wider">
                <th className="py-4 px-6 font-semibold">Date / Ref</th>
                <th className="py-4 px-6 font-semibold">Bank Statement Narration</th>
                <th className="py-4 px-6 font-semibold text-right">Deposit (PKR)</th>
                <th className="py-4 px-6 font-semibold text-right">Withdrawal (PKR)</th>
                <th className="py-4 px-6 font-semibold">Matched Rule / Voucher</th>
                <th className="py-4 px-6 font-semibold">Status</th>
                <th className="py-4 px-6 font-semibold text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-sm">
              {filteredRows.map((row) => (
                <tr key={row.id} className="hover:bg-slate-850 transition">
                  <td className="py-4 px-6">
                    <div className="font-mono text-slate-200 font-semibold">{row.referenceNo}</div>
                    <div className="text-xs text-slate-500">{row.date}</div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="text-slate-200 font-medium">{row.narration}</div>
                  </td>
                  <td className="py-4 px-6 text-right font-mono text-emerald-400 font-semibold">
                    {row.deposit > 0 ? `+${row.deposit.toLocaleString()}` : '—'}
                  </td>
                  <td className="py-4 px-6 text-right font-mono text-rose-400 font-semibold">
                    {row.withdrawal > 0 ? `-${row.withdrawal.toLocaleString()}` : '—'}
                  </td>
                  <td className="py-4 px-6">
                    {row.matchedRuleName ? (
                      <div>
                        <div className="text-xs text-emerald-400 font-semibold">{row.matchedRuleName}</div>
                        <div className="text-[11px] font-mono text-slate-400">{row.matchedVoucherNo}</div>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-500 italic">No rule applied</span>
                    )}
                  </td>
                  <td className="py-4 px-6">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                        row.status === 'MATCHED_EXACT'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : row.status === 'MATCHED_PATTERN'
                          ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                          : row.status === 'DISCREPANCY'
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      }`}
                    >
                      {row.status === 'MATCHED_EXACT' && <CheckCircle2 className="w-3.5 h-3.5" />}
                      {row.status === 'MATCHED_PATTERN' && <ShieldCheck className="w-3.5 h-3.5" />}
                      {row.status === 'DISCREPANCY' && <AlertTriangle className="w-3.5 h-3.5" />}
                      {row.status.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-center">
                    <div className="flex items-center justify-center gap-2">
                      {row.status !== 'MATCHED_EXACT' && (
                        <button
                          onClick={() => handleManualResolve(row.id, 'MATCHED_EXACT')}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium rounded-lg transition shadow-md shadow-emerald-600/20"
                          title="Manually Match & Approve"
                        >
                          Match
                        </button>
                      )}
                      {row.status === 'MATCHED_EXACT' && (
                        <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                          <Check className="w-4 h-4" /> Reconciled
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
