import React, { useState, useEffect, useMemo } from 'react';
import {
  Receipt,
  Plus,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  FileText,
  Calendar,
  DollarSign,
  ShieldCheck,
  Globe,
  Layers,
  Building,
  QrCode,
  Printer,
  Download,
  Copy,
  Check,
  ExternalLink
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useAuthTenant } from '../../../context/AuthTenantContext';
import { AccountHead, JournalVoucher, VoucherItem } from '../../../types/erp';
import { subscribeCompanyAccounts, postVoucherToFirebase } from '../../../services/firebaseAccounting';
import { auditLogger } from '../../../services/auditLogger';
import { ReceiptVoucherSlipModal, ReceiptVoucherPayload } from './ReceiptVoucherSlipModal';
import { BaseFormLayout } from '../../common/BaseFormLayout';

interface JournalVoucherFormProps {
  initialType?: 'JOURNAL' | 'RECEIPT' | 'PAYMENT';
  onSuccess?: () => void;
  onCancel?: () => void;
}

const CURRENCY_RATES: Record<string, { symbol: string; rateToPKR: number }> = {
  PKR: { symbol: 'Rs.', rateToPKR: 1 },
  USD: { symbol: '$', rateToPKR: 278.50 },
  EUR: { symbol: '€', rateToPKR: 302.20 },
  GBP: { symbol: '£', rateToPKR: 358.40 },
  AED: { symbol: 'AED', rateToPKR: 75.80 },
  SAR: { symbol: 'SAR', rateToPKR: 74.20 }
};

const SUB_DEPARTMENTS = [
  'Spinning & Ginning Plant (FSD)',
  'Weaving & Loom Shop (FSD)',
  'Dyeing, Printing & Finishing (FSD)',
  'Corporate Accounts & Treasury (LHR)',
  'Export & Sales Hub (KHI)',
  'Plant Maintenance & Utility',
  'IT & Enterprise ERP Systems'
];

export const JournalVoucherForm: React.FC<JournalVoucherFormProps> = ({
  initialType = 'JOURNAL',
  onSuccess,
  onCancel
}) => {
  const { currentCompany, currentUser } = useAuthTenant();
  const [accounts, setAccounts] = useState<AccountHead[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Form Header State
  const [voucherType, setVoucherType] = useState<'JOURNAL' | 'PAYMENT' | 'RECEIPT' | 'CONTRA'>(initialType);
  const [voucherNo, setVoucherNo] = useState<string>('');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [refNo, setRefNo] = useState<string>('');
  const [narration, setNarration] = useState<string>('');

  // Multi-Currency & Cost Center State
  const [currency, setCurrency] = useState<string>('PKR');
  const [costCenter, setCostCenter] = useState<string>(SUB_DEPARTMENTS[0]);
  const [coaSearchFilter, setCoaSearchFilter] = useState<string>('');

  // QR Code & Verification State
  const [securityHash, setSecurityHash] = useState<string>('');
  const [isSlipModalOpen, setIsSlipModalOpen] = useState(false);
  const [copiedPayload, setCopiedPayload] = useState(false);

  // Dynamic Multi-Row Entry Grid State
  const [rows, setRows] = useState<Array<{
    id: string;
    accountId: string;
    accountCode: string;
    accountName: string;
    tier: string;
    description: string;
    debit: number;
    credit: number;
  }>>([
    { id: 'r1', accountId: '', accountCode: '', accountName: '', tier: 'Tier 3 (Control)', description: '', debit: 0, credit: 0 },
    { id: 'r2', accountId: '', accountCode: '', accountName: '', tier: 'Tier 3 (Control)', description: '', debit: 0, credit: 0 }
  ]);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [draftSavedAt, setDraftSavedAt] = useState<string | null>(null);

  // Restore draft from local storage on initial mount
  useEffect(() => {
    try {
      const draftKey = `mts_voucher_draft_${currentCompany.id}`;
      const saved = localStorage.getItem(draftKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.voucherType) setVoucherType(parsed.voucherType);
        if (parsed.date) setDate(parsed.date);
        if (parsed.refNo) setRefNo(parsed.refNo);
        if (parsed.narration) setNarration(parsed.narration);
        if (parsed.currency) setCurrency(parsed.currency);
        if (parsed.costCenter) setCostCenter(parsed.costCenter);
        if (Array.isArray(parsed.rows) && parsed.rows.length >= 2) setRows(parsed.rows);
        if (parsed.savedAt) setDraftSavedAt(parsed.savedAt);
      }
    } catch (e) {
      console.warn('Failed to restore voucher draft', e);
    }
  }, [currentCompany.id]);

  // Auto-save draft inputs to local state while editing
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const draftKey = `mts_voucher_draft_${currentCompany.id}`;
        // Only save if there's actual data entered
        const hasContent = narration.trim().length > 0 || refNo.trim().length > 0 || rows.some(r => r.accountId || r.debit > 0 || r.credit > 0);
        if (hasContent) {
          const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          const draftPayload = {
            voucherType,
            date,
            refNo,
            narration,
            currency,
            costCenter,
            rows,
            savedAt: nowStr
          };
          localStorage.setItem(draftKey, JSON.stringify(draftPayload));
          setDraftSavedAt(nowStr);
        }
      } catch (e) {
        // storage quota exceeded or private mode
      }
    }, 800);

    return () => clearTimeout(timer);
  }, [currentCompany.id, voucherType, date, refNo, narration, currency, costCenter, rows]);

  // Auto-generate document number on type change
  useEffect(() => {
    const randomSeq = Math.floor(100000 + Math.random() * 900000);
    const prefix = voucherType === 'JOURNAL' ? 'JV' : voucherType === 'PAYMENT' ? 'PV' : voucherType === 'RECEIPT' ? 'RV' : 'CV';
    setVoucherNo(`${prefix}-2026-${randomSeq}`);
  }, [voucherType]);

  // Load Company Accounts
  useEffect(() => {
    const unsubscribe = subscribeCompanyAccounts(currentCompany.id, (accList: any[]) => {
      setAccounts(accList);
    });
    return () => unsubscribe();
  }, [currentCompany.id]);

  const handleAddRow = () => {
    setRows(prev => [
      ...prev,
      { id: `r_${Date.now()}`, accountId: '', accountCode: '', accountName: '', tier: 'Tier 3 (Control)', description: '', debit: 0, credit: 0 }
    ]);
  };

  const handleRemoveRow = (id: string) => {
    if (rows.length <= 2) {
      setErrorMsg('A double-entry voucher must have at least 2 entry rows.');
      return;
    }
    setRows(prev => prev.filter(r => r.id !== id));
    setErrorMsg(null);
  };

  const handleRowChange = (id: string, field: string, value: any) => {
    setRows(prev => prev.map(r => {
      if (r.id !== id) return r;
      const updated = { ...r, [field]: value };
      if (field === 'accountId') {
        const matched = accounts.find(a => a.id === value);
        if (matched) {
          updated.accountCode = matched.code;
          updated.accountName = matched.name;
        }
      }
      return updated;
    }));
  };

  const currentRate = CURRENCY_RATES[currency]?.rateToPKR || 1;
  const currencySymbol = CURRENCY_RATES[currency]?.symbol || 'Rs.';

  const totalDebit = rows.reduce((acc, r) => acc + (Number(r.debit) || 0), 0);
  const totalCredit = rows.reduce((acc, r) => acc + (Number(r.credit) || 0), 0);
  const difference = Math.abs(totalDebit - totalCredit);
  const isBalanced = difference < 0.01 && totalDebit > 0;

  // Converted totals to PKR for backend posting
  const totalDebitPKR = totalDebit * currentRate;
  const totalCreditPKR = totalCredit * currentRate;

  // Compute Structured QR Verification Payload
  const qrPayload: ReceiptVoucherPayload = useMemo(() => {
    const primaryAccount = rows.find(r => r.accountName)?.accountName || 'Accounts Receivable / Bank';
    return {
      doc: voucherNo,
      type: voucherType === 'RECEIPT' ? 'RECEIPT_VOUCHER' : `${voucherType}_VOUCHER`,
      tenant: currentCompany.tenantId,
      company: currentCompany.name,
      date: date,
      amount: totalDebit || totalCredit || 0,
      currency: currency,
      account: primaryAccount,
      costCenter: costCenter,
      ref: refNo || 'CASH-RECEIPT',
      narration: narration || 'Receipt transaction verified',
      hash: securityHash || 'COMPUTING...',
      verifyUrl: `https://${currentCompany.slug}.mts-sap.vercel.app/verify/${voucherNo}`
    };
  }, [voucherNo, voucherType, currentCompany, date, totalDebit, totalCredit, currency, rows, costCenter, refNo, narration, securityHash]);

  // Compute Deterministic SHA-256 Checksum on Voucher State
  useEffect(() => {
    const rawData = `${voucherNo}:${currentCompany.tenantId}:${date}:${totalDebit}:${currency}:${costCenter}:${refNo}`;
    
    let isMounted = true;
    const computeHash = async () => {
      try {
        const encoder = new TextEncoder();
        const data = encoder.encode(rawData);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        if (isMounted) setSecurityHash(hashHex);
      } catch {
        let hash = 0;
        for (let i = 0; i < rawData.length; i++) {
          hash = (hash << 5) - hash + rawData.charCodeAt(i);
          hash |= 0;
        }
        if (isMounted) setSecurityHash(Math.abs(hash).toString(16).padStart(16, '0'));
      }
    };

    computeHash();
    return () => { isMounted = false; };
  }, [voucherNo, currentCompany.tenantId, date, totalDebit, currency, costCenter, refNo]);

  const handleCopyPayload = () => {
    navigator.clipboard.writeText(JSON.stringify(qrPayload, null, 2));
    setCopiedPayload(true);
    setTimeout(() => setCopiedPayload(false), 2000);
  };

  const handleDownloadQrPng = () => {
    const svg = document.getElementById('preview-qr-svg');
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    canvas.width = 400;
    canvas.height = 400;

    img.onload = () => {
      if (ctx) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 20, 20, 360, 360);
        const pngUrl = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = `QR_${voucherNo}.png`;
        link.href = pngUrl;
        link.click();
      }
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!narration.trim()) {
      setErrorMsg('Voucher narration / description is mandatory.');
      return;
    }

    if (!isBalanced) {
      setErrorMsg(`Voucher is unbalanced! Total Debits (${currencySymbol} ${totalDebit.toLocaleString()}) must equal Total Credits (${currencySymbol} ${totalCredit.toLocaleString()}).`);
      return;
    }

    setIsLoading(true);
    try {
      const voucherItems: VoucherItem[] = rows.map(r => ({
        accountId: r.accountId || r.accountCode,
        accountCode: r.accountCode,
        accountName: `${r.accountName} [Cost Center: ${costCenter}]`,
        description: r.description || narration,
        debit: (Number(r.debit) || 0) * currentRate,
        credit: (Number(r.credit) || 0) * currentRate
      }));

      const newVoucher: JournalVoucher = {
        id: `v_${Date.now()}`,
        voucherNo,
        date,
        type: voucherType,
        branchId: 'br_main_01',
        referenceNo: refNo ? `${refNo} [${currency}] [QR: ${securityHash.substring(0, 8)}]` : `CURRENCY: ${currency} [QR: ${securityHash.substring(0, 8)}]`,
        items: voucherItems,
        totalAmount: totalDebitPKR,
        narration: `[Cost Center: ${costCenter}] ${narration}`,
        status: 'POSTED',
        createdBy: currentUser.name || 'Accounts Officer',
        createdAt: new Date().toISOString(),
        tenantId: currentCompany.tenantId
      };

      await postVoucherToFirebase(currentCompany.id, newVoucher, accounts);

      await auditLogger.logAction({
        tenantId: currentCompany.tenantId,
        userId: currentUser.id || 'usr_client',
        userName: currentUser.name || 'Accounts Officer',
        userRole: currentUser.role || 'CLIENT_ADMIN',
        actionType: 'DATA_CREATE',
        module: 'Finance & Accounts',
        details: `Posted ${voucherType} voucher #${voucherNo} for ${currency} ${totalDebit.toLocaleString()} (PKR ${totalDebitPKR.toLocaleString()}) with QR Checksum ${securityHash.substring(0, 12)}`
      });

      try {
        localStorage.removeItem(`mts_voucher_draft_${currentCompany.id}`);
        setDraftSavedAt(null);
      } catch {}

      setSuccessMsg(`Voucher #${voucherNo} successfully posted with QR Code Verification!`);
      setTimeout(() => {
        if (onSuccess) onSuccess();
      }, 1500);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to post voucher.');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredAccountsForLookup = accounts.filter(a => {
    if (!coaSearchFilter.trim()) return true;
    const q = coaSearchFilter.toLowerCase();
    return a.code.toLowerCase().includes(q) || a.name.toLowerCase().includes(q) || a.category.toLowerCase().includes(q);
  });

  const handleManualSaveDraft = () => {
    try {
      const draftKey = `mts_voucher_draft_${currentCompany.id}`;
      const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const draftPayload = {
        voucherType,
        date,
        refNo,
        narration,
        currency,
        costCenter,
        rows,
        savedAt: nowStr
      };
      localStorage.setItem(draftKey, JSON.stringify(draftPayload));
      setDraftSavedAt(nowStr);
      setSuccessMsg('Voucher draft saved to local storage.');
      setTimeout(() => setSuccessMsg(null), 2500);
    } catch {}
  };

  return (
    <BaseFormLayout
      title={
        voucherType === 'RECEIPT'
          ? 'Receipt Voucher (RV)'
          : voucherType === 'PAYMENT'
          ? 'Payment Voucher (PV)'
          : 'Journal Voucher (JV)'
      }
      subtitle="Double-entry general ledger voucher posting with real-time audit verification and verifiable QR code"
      breadcrumbs={[
        { label: 'Finance & Accounts', onClick: onCancel },
        { label: 'Vouchers Register', onClick: onCancel },
        { label: voucherNo || 'New Transaction', active: true }
      ]}
      documentRef={voucherNo}
      statusBadge={isBalanced ? 'BALANCED' : 'UNBALANCED'}
      draftSavedAt={draftSavedAt}
      variant="grid-ledger"
      isSubmitting={isLoading}
      submitLabel={isLoading ? 'Posting...' : `Post ${voucherType} Voucher`}
      isDirty={narration.trim().length > 0 || refNo.trim().length > 0 || rows.some(r => r.accountId || r.debit > 0 || r.credit > 0)}
      onSaveDraft={handleManualSaveDraft}
      onSubmit={() => {
        const dummyEvent = { preventDefault: () => {} } as React.FormEvent;
        handleSubmit(dummyEvent);
      }}
      onPrintPreview={voucherType === 'RECEIPT' ? () => setIsSlipModalOpen(true) : undefined}
      onDiscard={onCancel || (() => {})}
    >
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6">

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <span className="font-semibold">{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span className="font-semibold">{successMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Voucher Type Tabs / Selectors */}
        <div className="flex flex-wrap gap-2 bg-slate-950 p-2 rounded-2xl border border-slate-800">
          {[
            { id: 'JOURNAL', label: 'Journal Voucher (JV)' },
            { id: 'RECEIPT', label: 'Receipt Voucher (RV) ⚡ QR' },
            { id: 'PAYMENT', label: 'Payment Voucher (PV)' },
            { id: 'CONTRA', label: 'Contra Voucher (CV)' }
          ].map(t => (
            <button
              key={t.id}
              type="button"
              onClick={() => setVoucherType(t.id as any)}
              className={`flex-1 py-2 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                voucherType === t.id
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                  : 'text-slate-400 hover:text-white bg-slate-900/60'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Voucher Metadata Header Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 p-5 rounded-2xl bg-slate-950 border border-slate-800">
          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1">Auto-Generated No.</label>
            <input
              type="text"
              readOnly
              value={voucherNo}
              className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-emerald-400 font-mono font-bold focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1">Document Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Multi-Currency Toggle Selector */}
          <div>
            <label className="block text-xs font-bold text-cyan-400 mb-1 flex items-center gap-1">
              <Globe className="w-3.5 h-3.5" /> Multi-Currency Toggle
            </label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-cyan-300 font-mono font-bold focus:outline-none focus:border-cyan-500"
            >
              {Object.keys(CURRENCY_RATES).map(cur => (
                <option key={cur} value={cur}>
                  {cur} ({CURRENCY_RATES[cur].symbol}) — Rate: {CURRENCY_RATES[cur].rateToPKR} PKR
                </option>
              ))}
            </select>
          </div>

          {/* Sub-Department Cost Center Allocation */}
          <div>
            <label className="block text-xs font-bold text-amber-400 mb-1 flex items-center gap-1">
              <Building className="w-3.5 h-3.5" /> Cost Center Allocation
            </label>
            <select
              value={costCenter}
              onChange={(e) => setCostCenter(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-amber-300 font-bold focus:outline-none focus:border-amber-500"
            >
              {SUB_DEPARTMENTS.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Dynamic Real-Time QR Code Generator Card (Active on RECEIPT vouchers, available on all) */}
        {voucherType === 'RECEIPT' && (
          <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-slate-950 to-slate-900 border border-emerald-500/30 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-5 animate-in fade-in-50">
            <div className="flex items-center gap-4">
              <div className="p-2.5 bg-white rounded-2xl shadow-xl border border-slate-700 shrink-0">
                <QRCodeSVG
                  id="preview-qr-svg"
                  value={JSON.stringify(qrPayload)}
                  size={105}
                  level="M"
                  includeMargin={false}
                />
              </div>

              <div className="space-y-1 text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-emerald-300 flex items-center gap-1 text-sm">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    Instant Verification QR Matrix
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
                    ACTIVE
                  </span>
                </div>
                <p className="text-slate-300 text-[11px] max-w-md leading-relaxed">
                  Encodes document ID, date, gross amount (<span className="text-emerald-300 font-bold">{currencySymbol} {totalDebit.toLocaleString()}</span>), cost center, and SHA-256 integrity checksum for audit verification.
                </p>
                <div className="text-[10px] font-mono text-slate-400 flex items-center gap-1.5 pt-0.5">
                  <span className="text-slate-500">Security Hash:</span>
                  <span className="text-emerald-400 font-bold truncate max-w-[200px]" title={securityHash}>
                    {securityHash ? securityHash.substring(0, 16) + '...' : 'Computing...'}
                  </span>
                </div>
              </div>
            </div>

            {/* QR Quick Actions Toolbar */}
            <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleCopyPayload}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 flex items-center gap-1.5 transition-all cursor-pointer"
                title="Copy structured QR payload"
              >
                {copiedPayload ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedPayload ? 'Copied' : 'Copy JSON'}</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadQrPng}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 flex items-center gap-1.5 transition-all cursor-pointer"
                title="Download PNG QR image"
              >
                <Download className="w-3.5 h-3.5" />
                <span>QR PNG</span>
              </button>

              <button
                type="button"
                onClick={() => setIsSlipModalOpen(true)}
                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/30 flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Receipt Slip</span>
              </button>
            </div>
          </div>
        )}

        {/* 5-Tier COA Lookup Quick Filter Bar */}
        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 flex-1">
            <Layers className="w-4 h-4 text-emerald-400 shrink-0" />
            <input
              type="text"
              placeholder="Filter Chart of Accounts 5-Tier Lookup (Search by code, title, category)..."
              value={coaSearchFilter}
              onChange={(e) => setCoaSearchFilter(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-100 font-mono outline-none focus:border-emerald-500"
            />
          </div>
          <span className="text-[10px] font-mono text-slate-400">
            Showing {filteredAccountsForLookup.length} / {accounts.length} 5-Tier COA Heads
          </span>
        </div>

        {/* Narration & Ref */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-slate-400 mb-1">Voucher Narration / Description <span className="text-rose-400">*</span></label>
            <input
              type="text"
              value={narration}
              onChange={(e) => setNarration(e.target.value)}
              required
              placeholder="e.g. Being export sales advance or cash payment received against commercial invoice..."
              className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1">Reference / Cheque / Bill #</label>
            <input
              type="text"
              value={refNo}
              onChange={(e) => setRefNo(e.target.value)}
              placeholder="e.g. CHQ-9901 or INV-8820"
              className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Dynamic Multi-Row Entry Grid */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black text-slate-300 uppercase tracking-wider font-mono">Double-Entry Account Breakdown ({currency})</h3>
            <button
              type="button"
              onClick={handleAddRow}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 font-bold text-xs flex items-center gap-1.5 border border-slate-700 transition cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Entry Row</span>
            </button>
          </div>

          <div className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-950">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-900 border-b border-slate-800 text-slate-400 font-mono text-[11px]">
                  <th className="p-3">#</th>
                  <th className="p-3">5-Tier Chart of Accounts Head</th>
                  <th className="p-3">Line Description</th>
                  <th className="p-3 text-right">Debit ({currencySymbol})</th>
                  <th className="p-3 text-right">Credit ({currencySymbol})</th>
                  <th className="p-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {rows.map((row, idx) => (
                  <tr key={row.id} className="hover:bg-slate-900/50 transition">
                    <td className="p-3 font-mono text-slate-500 font-bold">{idx + 1}</td>
                    <td className="p-3 w-1/3">
                      <select
                        value={row.accountId}
                        onChange={(e) => handleRowChange(row.id, 'accountId', e.target.value)}
                        required
                        className="w-full p-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-100 font-mono focus:outline-none focus:border-emerald-500"
                      >
                        <option value="">-- Select 5-Tier Account Head --</option>
                        {filteredAccountsForLookup.map(acc => (
                          <option key={acc.id} value={acc.id}>
                            [{acc.code}] {acc.name} ({acc.category})
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="p-3">
                      <input
                        type="text"
                        value={row.description}
                        onChange={(e) => handleRowChange(row.id, 'description', e.target.value)}
                        placeholder="Optional remarks..."
                        className="w-full p-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                      />
                    </td>
                    <td className="p-3 text-right w-36">
                      <input
                        type="number"
                        min="0"
                        step="any"
                        value={row.debit || ''}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value) || 0;
                          handleRowChange(row.id, 'debit', val);
                          if (val > 0) handleRowChange(row.id, 'credit', 0);
                        }}
                        className="w-full p-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-emerald-400 font-mono font-bold text-right focus:outline-none focus:border-emerald-500"
                      />
                    </td>
                    <td className="p-3 text-right w-36">
                      <input
                        type="number"
                        min="0"
                        step="any"
                        value={row.credit || ''}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value) || 0;
                          handleRowChange(row.id, 'credit', val);
                          if (val > 0) handleRowChange(row.id, 'debit', 0);
                        }}
                        className="w-full p-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-cyan-400 font-mono font-bold text-right focus:outline-none focus:border-emerald-500"
                      />
                    </td>
                    <td className="p-3 text-center">
                      <button
                        type="button"
                        onClick={() => handleRemoveRow(row.id)}
                        className="p-1.5 rounded-lg bg-slate-900 text-rose-400 hover:bg-rose-500 hover:text-white transition cursor-pointer"
                        title="Remove Row"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Live Balance Reconciliation Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-2xl bg-slate-950 border border-slate-800">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isBalanced ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'}`}>
              {isBalanced ? <CheckCircle2 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5 animate-pulse" />}
            </div>
            <div>
              <div className="text-xs font-bold text-white">
                {isBalanced ? 'Voucher Balanced & Ready to Post' : 'Voucher Unbalanced (Double-Entry Mismatch)'}
              </div>
              <div className="text-[10px] text-slate-400 font-mono">
                {isBalanced ? `Total Debits equal Total Credits in ${currency}.` : `Difference of ${currencySymbol} ${difference.toLocaleString()} must be reconciled.`}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6 font-mono text-xs">
            <div className="text-right">
              <div className="text-[10px] text-slate-400 uppercase">Total Debit ({currencySymbol})</div>
              <div className="font-bold text-emerald-400 text-sm">{currencySymbol} {totalDebit.toLocaleString()}</div>
              {currency !== 'PKR' && <div className="text-[9px] text-slate-500">(PKR {totalDebitPKR.toLocaleString()})</div>}
            </div>
            <div className="text-right">
              <div className="text-[10px] text-slate-400 uppercase">Total Credit ({currencySymbol})</div>
              <div className="font-bold text-cyan-400 text-sm">{currencySymbol} {totalCredit.toLocaleString()}</div>
              {currency !== 'PKR' && <div className="text-[9px] text-slate-500">(PKR {totalCreditPKR.toLocaleString()})</div>}
            </div>
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-5 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs hover:bg-slate-700 transition cursor-pointer"
            >
              Cancel
            </button>
          )}

          {voucherType === 'RECEIPT' && (
            <button
              type="button"
              onClick={() => setIsSlipModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-300 font-bold text-xs border border-emerald-500/30 flex items-center gap-2 transition cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Preview Receipt Slip</span>
            </button>
          )}

          <button
            type="submit"
            disabled={!isBalanced || isLoading}
            className={`px-6 py-2.5 rounded-xl font-bold text-xs text-white transition flex items-center gap-2 shadow-lg ${
              isBalanced && !isLoading
                ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/30 cursor-pointer'
                : 'bg-slate-800 text-slate-500 opacity-50 cursor-not-allowed'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>{isLoading ? 'Posting & Logging...' : `Post ${voucherType} Voucher (${currency})`}</span>
          </button>
        </div>
      </form>

      {/* Official Receipt Voucher Slip Modal */}
      <ReceiptVoucherSlipModal
        isOpen={isSlipModalOpen}
        onClose={() => setIsSlipModalOpen(false)}
        voucherNo={voucherNo}
        date={date}
        amount={totalDebit || totalCredit || 0}
        currency={currency}
        currencySymbol={currencySymbol}
        accountName={rows.find(r => r.accountName)?.accountName || 'Cash / Bank Account'}
        costCenter={costCenter}
        refNo={refNo}
        narration={narration}
        qrPayload={qrPayload}
        securityHash={securityHash}
        rows={rows}
      />
      </div>
    </BaseFormLayout>
  );
};
