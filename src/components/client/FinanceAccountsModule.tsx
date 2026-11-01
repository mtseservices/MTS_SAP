import React, { useState } from 'react';
import {
  DollarSign,
  Plus,
  BookOpen,
  Receipt,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useAuthTenant } from '../../context/AuthTenantContext';
import { INITIAL_ACCOUNTS, INITIAL_VOUCHERS } from '../../services/mockData';
import { AccountHead, JournalVoucher, VoucherItem } from '../../types/erp';
import { DataTable } from '../common/DataTable';
import { TTSButton } from '../common/TTSButton';

export const FinanceAccountsModule: React.FC = () => {
  const { currentCompany } = useAuthTenant();
  const [activeSubTab, setActiveSubTab] = useState<'coa' | 'vouchers' | 'newVoucher'>('vouchers');

  const [accounts, setAccounts] = useState<AccountHead[]>(INITIAL_ACCOUNTS);
  const [vouchers, setVouchers] = useState<JournalVoucher[]>(INITIAL_VOUCHERS);

  // New Voucher Form state
  const [voucherType, setVoucherType] = useState<'JOURNAL' | 'PAYMENT' | 'RECEIPT' | 'CONTRA'>('JOURNAL');
  const [narration, setNarration] = useState('');
  const [refNo, setRefNo] = useState('');
  const [items, setItems] = useState<VoucherItem[]>([
    { accountId: 'acc_1020', accountCode: '1020', accountName: 'Meezan Bank Operations Account', description: 'Debit Entry', debit: 500000, credit: 0 },
    { accountId: 'acc_1200', accountCode: '1200', accountName: 'Accounts Receivable', description: 'Credit Entry', debit: 0, credit: 500000 }
  ]);

  const totalDebit = items.reduce((acc, i) => acc + (Number(i.debit) || 0), 0);
  const totalCredit = items.reduce((acc, i) => acc + (Number(i.credit) || 0), 0);
  const isBalanced = totalDebit > 0 && totalDebit === totalCredit;

  const handlePostVoucher = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isBalanced) return;

    const newVoucher: JournalVoucher = {
      id: `jv_${Date.now()}`,
      voucherNo: `JV-2026-${Math.floor(100 + Math.random() * 900)}`,
      date: new Date().toISOString().split('T')[0],
      type: voucherType,
      branchId: 'br_lahore_01',
      referenceNo: refNo || 'DIRECT-POST',
      items,
      totalAmount: totalDebit,
      narration: narration || 'General Ledger posting',
      status: 'POSTED',
      createdBy: 'Finance Mgr. Saima',
      createdAt: new Date().toISOString(),
      tenantId: currentCompany.tenantId
    };

    setVouchers([newVoucher, ...vouchers]);
    setActiveSubTab('vouchers');
    setNarration('');
    setRefNo('');
  };

  const financeSpeech = `Finance and Accounts module for ${currentCompany.name}. Total active Chart of Accounts heads: ${accounts.length}. Total posted vouchers: ${vouchers.length}. Chart of accounts balanced in Pakistan Rupees.`;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl font-black text-slate-100 flex items-center gap-2">
            <DollarSign className="w-6 h-6 text-emerald-400" />
            Finance & Accounts Management (PKR)
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Chart of Accounts, General Ledger, Cash/Bank Book Reconciliation, Journal Vouchers, and FBR NTN/STRN tax postings.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <TTSButton text={financeSpeech} label="Accounts Voice Briefing" />
          <button
            onClick={() => setActiveSubTab('newVoucher')}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 transition-all"
          >
            <Plus className="w-4 h-4" />
            Post New Voucher
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 text-xs font-bold">
        <button
          onClick={() => setActiveSubTab('vouchers')}
          className={`px-3.5 py-1.5 rounded-lg transition-all ${
            activeSubTab === 'vouchers'
              ? 'bg-emerald-600 text-white'
              : 'text-slate-400 hover:text-slate-200 bg-slate-800/60'
          }`}
        >
          Journal Vouchers ({vouchers.length})
        </button>
        <button
          onClick={() => setActiveSubTab('coa')}
          className={`px-3.5 py-1.5 rounded-lg transition-all ${
            activeSubTab === 'coa'
              ? 'bg-emerald-600 text-white'
              : 'text-slate-400 hover:text-slate-200 bg-slate-800/60'
          }`}
        >
          Chart of Accounts ({accounts.length})
        </button>
      </div>

      {/* Tab Content: Vouchers Table */}
      {activeSubTab === 'vouchers' && (
        <DataTable
          title="Posted Accounting Vouchers"
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

      {/* Tab Content: Chart of Accounts */}
      {activeSubTab === 'coa' && (
        <DataTable
          title="Master Chart of Accounts"
          data={accounts}
          columns={[
            { key: 'code', header: 'Account Code', accessor: (a) => <span className="font-mono font-bold text-cyan-400">{a.code}</span>, sortable: true },
            { key: 'name', header: 'Account Head Name', accessor: (a) => <span className="font-bold text-slate-100">{a.name}</span>, sortable: true },
            { key: 'type', header: 'Type', accessor: (a) => <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-purple-300 font-semibold">{a.type}</span>, sortable: true },
            { key: 'category', header: 'Category', accessor: (a) => a.category },
            { key: 'balance', header: 'Balance (PKR)', accessor: (a) => <span className="font-mono font-bold text-slate-100">Rs. {a.balance.toLocaleString()}</span>, isNumeric: true, sortable: true }
          ]}
        />
      )}

      {/* Tab Content: New Voucher Posting Form */}
      {activeSubTab === 'newVoucher' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6 max-w-3xl mx-auto">
          <div className="border-b border-slate-800 pb-3">
            <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wider text-emerald-400">
              Double-Entry Financial Voucher Entry
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Enter debit and credit items. The voucher requires equal debit and credit totals before posting to General Ledger.
            </p>
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
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                Line Items (Debit / Credit PKR)
              </label>

              {items.map((item, idx) => (
                <div key={idx} className="grid grid-cols-12 gap-2 items-center bg-slate-800/60 p-3 rounded-xl border border-slate-700">
                  <div className="col-span-5">
                    <select
                      value={item.accountId}
                      onChange={(e) => {
                        const acc = accounts.find(a => a.id === e.target.value);
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
                      className="w-full px-2 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-emerald-400 font-mono text-right"
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
                      className="w-full px-2 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-cyan-400 font-mono text-right"
                    />
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
                onClick={() => setActiveSubTab('vouchers')}
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
                Post Voucher
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
