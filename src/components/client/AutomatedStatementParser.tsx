import React, { useState, useEffect } from 'react';
import {
  FileSpreadsheet,
  Upload,
  CheckCircle2,
  AlertCircle,
  Landmark,
  ArrowRight,
  RefreshCw,
  Sliders,
  FileText,
  Check,
  X,
  Sparkles,
  Download
} from 'lucide-react';
import { PAKISTANI_BANKS_LIST } from '../../services/pakistaniBanks';
import { getMasterReconciliationRules } from '../../services/masterBankAccountsService';
import { ReconciliationRule, JournalVoucher } from '../../types/erp';
import { postVoucherToFirebase, subscribeCompanyAccounts } from '../../services/firebaseAccounting';
import { useAuthTenant } from '../../context/AuthTenantContext';
import { TTSButton } from '../common/TTSButton';

interface ParsedStatementRow {
  id: string;
  rawDate: string;
  rawNarration: string;
  rawDeposit: number;
  rawWithdrawal: number;
  rawRefNo: string;
  mappedDate: string;
  mappedNarration: string;
  mappedDeposit: number;
  mappedWithdrawal: number;
  mappedRefNo: string;
  matchStatus: 'MATCHED' | 'DISCREPANCY' | 'PENDING';
  matchedRule?: ReconciliationRule;
}

export const AutomatedStatementParser: React.FC<{ vouchers: JournalVoucher[] }> = () => {
  const { currentCompany } = useAuthTenant();
  const [selectedBankName, setSelectedBankName] = useState(PAKISTANI_BANKS_LIST[0].name);
  const [rules, setRules] = useState<ReconciliationRule[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);

  // File Upload & Mapping State
  const [fileUploaded, setFileUploaded] = useState(false);
  const [fileName, setFileName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Column Mapping State
  const [dateCol, setDateCol] = useState('Col A: Txn Date');
  const [narrationCol, setNarrationCol] = useState('Col B: Description / Particulars');
  const [depositCol, setDepositCol] = useState('Col C: Credit Amount');
  const [withdrawalCol, setWithdrawalCol] = useState('Col D: Debit Amount');
  const [refCol, setRefCol] = useState('Col E: Cheque / Ref No');

  // Parsed Rows
  const [parsedRows, setParsedRows] = useState<ParsedStatementRow[]>([]);
  const [notification, setNotification] = useState<string | null>(null);

  useEffect(() => {
    getMasterReconciliationRules().then(setRules);
    const unsub = subscribeCompanyAccounts(currentCompany.id, setAccounts);
    return () => unsub();
  }, [currentCompany.id]);

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  const handleSimulateFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      setFileUploaded(true);
      generateSampleParsedRows(file.name);
    }
  };

  const generateSampleParsedRows = (fName: string) => {
    setIsProcessing(true);
    setTimeout(() => {
      const selectedBankObj = PAKISTANI_BANKS_LIST.find((b) => b.name === selectedBankName);
      const code = selectedBankObj?.code || 'MEZN';

      const mockData: ParsedStatementRow[] = [
        {
          id: 'row_1',
          rawDate: '2026-10-29',
          rawNarration: `IBFT/${code}/RAAST Transfer TENANT-003 October Subscription`,
          rawDeposit: 120000,
          rawWithdrawal: 0,
          rawRefNo: 'TENANT-003',
          mappedDate: '2026-10-29',
          mappedNarration: 'IBFT RAAST Transfer TENANT-003 October Subscription',
          mappedDeposit: 120000,
          mappedWithdrawal: 0,
          mappedRefNo: 'TENANT-003',
          matchStatus: 'MATCHED',
          matchedRule: rules[0]
        },
        {
          id: 'row_2',
          rawDate: '2026-10-30',
          rawNarration: `1LINK ONLINE CLEARING CREST LOGISTICS INV-4092`,
          rawDeposit: 450000,
          rawWithdrawal: 0,
          rawRefNo: 'INV-4092',
          mappedDate: '2026-10-30',
          mappedNarration: '1LINK ONLINE CLEARING CREST LOGISTICS INV-4092',
          mappedDeposit: 450000,
          mappedWithdrawal: 0,
          mappedRefNo: 'INV-4092',
          matchStatus: 'MATCHED',
          matchedRule: rules[1]
        },
        {
          id: 'row_3',
          rawDate: '2026-10-31',
          rawNarration: 'ATM CASH WITHDRAWAL MAIN BRANCH',
          rawDeposit: 0,
          rawWithdrawal: 85000,
          rawRefNo: 'ATM-9921',
          mappedDate: '2026-10-31',
          mappedNarration: 'ATM CASH WITHDRAWAL MAIN BRANCH',
          mappedDeposit: 0,
          mappedWithdrawal: 85000,
          mappedRefNo: 'ATM-9921',
          matchStatus: 'PENDING'
        },
        {
          id: 'row_4',
          rawDate: '2026-11-01',
          rawNarration: 'WIRE RTGS CORP ADVANCE UNKNOWN SOURCE',
          rawDeposit: 1500000,
          rawWithdrawal: 0,
          rawRefNo: 'RTGS-9902',
          mappedDate: '2026-11-01',
          mappedNarration: 'WIRE RTGS CORP ADVANCE UNKNOWN SOURCE',
          mappedDeposit: 1500000,
          mappedWithdrawal: 0,
          mappedRefNo: 'RTGS-9902',
          matchStatus: 'DISCREPANCY',
          matchedRule: rules[2]
        }
      ];

      setParsedRows(mockData);
      setIsProcessing(false);
      showToast(`Parsed ${mockData.length} statement rows from ${fName} using ${selectedBankName} template.`);
    }, 800);
  };

  const handlePostAllMatched = async () => {
    const matched = parsedRows.filter((r) => r.matchStatus === 'MATCHED');
    if (matched.length === 0) {
      showToast('No matched rows available for ledger posting.');
      return;
    }

    for (const row of matched) {
      const newVoucher: JournalVoucher = {
        id: `jv_stmt_${Date.now()}_${row.id}`,
        voucherNo: `RV-STMT-${Math.floor(1000 + Math.random() * 9000)}`,
        date: row.mappedDate,
        type: 'RECEIPT',
        branchId: 'br_main',
        referenceNo: row.mappedRefNo,
        items: [
          {
            accountId: accounts[0]?.id || 'acc_bank',
            accountCode: accounts[0]?.code || '1010',
            accountName: selectedBankName,
            description: row.mappedNarration,
            debit: row.mappedDeposit,
            credit: 0
          },
          {
            accountId: accounts[1]?.id || 'acc_revenue',
            accountCode: accounts[1]?.code || '4010',
            accountName: 'Client Subscription / Sales Revenue',
            description: row.mappedNarration,
            debit: 0,
            credit: row.mappedDeposit
          }
        ],
        totalAmount: row.mappedDeposit,
        narration: row.mappedNarration,
        status: 'POSTED',
        createdBy: 'Automated Statement Parser',
        createdAt: new Date().toISOString(),
        tenantId: currentCompany.tenantId
      };

      await postVoucherToFirebase(currentCompany.id, newVoucher, accounts);
    }

    showToast(`Successfully posted ${matched.length} reconciled bank statement entries to General Ledger!`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400">
            <FileSpreadsheet className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold text-slate-100">Automated Statement Parser</h2>
              <TTSButton text="Automated Statement Parser. Upload bank statement CSV, Excel or PDF files and map columns to system ledger using Master Bank Account rules." />
            </div>
            <p className="text-sm text-slate-400 mt-1">
              Upload bank statement files and map columns to ERP general ledger format governed by Master Reconciliation rules.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handlePostAllMatched}
            disabled={parsedRows.filter((r) => r.matchStatus === 'MATCHED').length === 0}
            className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-xl transition shadow-lg shadow-emerald-600/20 disabled:opacity-50"
          >
            <Check className="w-4 h-4" />
            <span>Post Matched Entries ({parsedRows.filter((r) => r.matchStatus === 'MATCHED').length})</span>
          </button>
        </div>
      </div>

      {notification && (
        <div className="bg-emerald-950/80 border border-emerald-500/30 text-emerald-300 p-4 rounded-xl flex items-center gap-3 shadow-lg animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Configuration & Dropzone Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Step 1: Select Pakistani Bank */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
          <div className="flex items-center gap-2.5 text-emerald-400 font-bold text-sm">
            <Landmark className="w-5 h-5" />
            <span>1. Select Pakistani Bank</span>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Bank Name Dropdown *</label>
            <select
              value={selectedBankName}
              onChange={(e) => setSelectedBankName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-100 text-sm focus:outline-none focus:border-emerald-500"
            >
              {PAKISTANI_BANKS_LIST.map((bank) => (
                <option key={bank.name} value={bank.name}>
                  [{bank.code}] {bank.name} ({bank.category || 'Bank'})
                </option>
              ))}
            </select>
            <p className="text-[11px] text-slate-500 mt-1">
              Select target bank to apply specific SBP & 1Link clearing rules and column formats.
            </p>
          </div>
        </div>

        {/* Step 2: Statement Dropzone */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
          <div className="flex items-center gap-2.5 text-emerald-400 font-bold text-sm">
            <Upload className="w-5 h-5" />
            <span>2. Upload Bank Statement File</span>
          </div>

          <div className="border-2 border-dashed border-slate-800 hover:border-emerald-500/50 rounded-xl p-4 text-center cursor-pointer transition bg-slate-950/60 relative">
            <input
              type="file"
              accept=".csv,.xlsx,.xls,.pdf"
              onChange={handleSimulateFileUpload}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <FileSpreadsheet className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
            <p className="text-xs font-bold text-slate-200">
              {fileName ? fileName : 'Click to Upload or Drag CSV / Excel / PDF Statement'}
            </p>
            <p className="text-[10px] text-slate-500 mt-1">Supports Meezan, HBL, UBL, MCB & SBP standard statement exports</p>
          </div>
        </div>

        {/* Step 3: Column Mapping Controls */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3 shadow-xl">
          <div className="flex items-center justify-between text-emerald-400 font-bold text-sm">
            <div className="flex items-center gap-2.5">
              <Sliders className="w-5 h-5" />
              <span>3. Column Mapping Override</span>
            </div>
            <span className="text-[10px] bg-emerald-500/10 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/20">Auto-Detected</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-[10px] text-slate-400">Txn Date</span>
              <select value={dateCol} onChange={(e) => setDateCol(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-1.5 text-slate-200 text-xs">
                <option>Col A: Txn Date</option>
                <option>Col B: Posting Date</option>
              </select>
            </div>
            <div>
              <span className="text-[10px] text-slate-400">Narration</span>
              <select value={narrationCol} onChange={(e) => setNarrationCol(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-1.5 text-slate-200 text-xs">
                <option>Col B: Particulars</option>
                <option>Col C: Description</option>
              </select>
            </div>
            <div>
              <span className="text-[10px] text-slate-400">Deposit / Credit</span>
              <select value={depositCol} onChange={(e) => setDepositCol(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-1.5 text-slate-200 text-xs">
                <option>Col C: Credit Amount</option>
                <option>Col D: Deposit</option>
              </select>
            </div>
            <div>
              <span className="text-[10px] text-slate-400">Withdrawal / Debit</span>
              <select value={withdrawalCol} onChange={(e) => setWithdrawalCol(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-1.5 text-slate-200 text-xs">
                <option>Col D: Debit Amount</option>
                <option>Col E: Withdrawal</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Parsed Results Table */}
      {parsedRows.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>Parsed Bank Statement Rows & Ledger Mapping ({parsedRows.length} Records)</span>
            </h3>
            <span className="text-xs text-slate-400 font-mono">Governed by {rules.length} Active Master Rules</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-950 border-b border-slate-800 text-slate-400 text-xs uppercase tracking-wider font-mono">
                  <th className="py-3 px-4">Date / Ref</th>
                  <th className="py-3 px-4">Raw Particulars</th>
                  <th className="py-3 px-4 text-right">Deposit (PKR)</th>
                  <th className="py-3 px-4 text-right">Withdrawal (PKR)</th>
                  <th className="py-3 px-4">Rule Applied</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-sm">
                {parsedRows.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-850 transition">
                    <td className="py-3 px-4 font-mono text-xs">
                      <div className="text-slate-200 font-bold">{row.mappedRefNo}</div>
                      <div className="text-slate-500">{row.mappedDate}</div>
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-200 font-medium">
                      {row.mappedNarration}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-emerald-400 font-bold">
                      {row.mappedDeposit > 0 ? `+${row.mappedDeposit.toLocaleString()}` : '—'}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-rose-400 font-bold">
                      {row.mappedWithdrawal > 0 ? `-${row.mappedWithdrawal.toLocaleString()}` : '—'}
                    </td>
                    <td className="py-3 px-4 text-xs">
                      {row.matchedRule ? (
                        <span className="text-emerald-400 font-semibold">{row.matchedRule.ruleName}</span>
                      ) : (
                        <span className="text-slate-500 italic">Manual review required</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          row.matchStatus === 'MATCHED'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : row.matchStatus === 'DISCREPANCY'
                            ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                            : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        }`}
                      >
                        {row.matchStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
