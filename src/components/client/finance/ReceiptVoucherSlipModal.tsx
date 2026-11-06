import React, { useRef } from 'react';
import { 
  X, 
  Printer, 
  Download, 
  Copy, 
  Check, 
  ShieldCheck, 
  Receipt, 
  Building2, 
  Calendar, 
  CreditCard 
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useAuthTenant } from '../../../context/AuthTenantContext';

export interface ReceiptVoucherPayload {
  doc: string;
  type: string;
  tenant: string;
  company: string;
  date: string;
  amount: number;
  currency: string;
  account: string;
  costCenter: string;
  ref: string;
  narration: string;
  hash: string;
  verifyUrl: string;
}

interface ReceiptVoucherSlipModalProps {
  isOpen: boolean;
  onClose: () => void;
  voucherNo: string;
  date: string;
  amount: number;
  currency: string;
  currencySymbol: string;
  accountName: string;
  costCenter: string;
  refNo: string;
  narration: string;
  qrPayload: ReceiptVoucherPayload;
  securityHash: string;
  rows: Array<{
    accountCode: string;
    accountName: string;
    description: string;
    debit: number;
    credit: number;
  }>;
}

export const ReceiptVoucherSlipModal: React.FC<ReceiptVoucherSlipModalProps> = ({
  isOpen,
  onClose,
  voucherNo,
  date,
  amount,
  currency,
  currencySymbol,
  accountName,
  costCenter,
  refNo,
  narration,
  qrPayload,
  securityHash,
  rows
}) => {
  const { currentCompany } = useAuthTenant();
  const [copied, setCopied] = React.useState(false);
  const printSlipRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const handleCopyPayload = () => {
    navigator.clipboard.writeText(JSON.stringify(qrPayload, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadQrPng = () => {
    const svg = document.getElementById('receipt-voucher-qr-svg');
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

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        
        {/* Modal Controls Header (Hidden in Print) */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100">Official Receipt Voucher Slip</h3>
              <p className="text-[11px] text-slate-400 font-mono">
                {voucherNo} · Cryptographic QR Verified
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyPayload}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 flex items-center gap-1.5 transition-all"
              title="Copy JSON Payload"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy JSON'}</span>
            </button>
            <button
              onClick={handleDownloadQrPng}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 flex items-center gap-1.5 transition-all"
              title="Download QR PNG"
            >
              <Download className="w-3.5 h-3.5" />
              <span>QR PNG</span>
            </button>
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/30 flex items-center gap-1.5 transition-all"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Slip</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Voucher Slip Container */}
        <div className="p-6 overflow-y-auto flex-1 bg-slate-900 print:bg-white print:p-8 print:text-black">
          <div 
            ref={printSlipRef} 
            className="bg-slate-950 print:bg-white border border-slate-800 print:border-black rounded-2xl p-6 sm:p-8 space-y-6 text-slate-100 print:text-black shadow-xl print:shadow-none"
          >
            {/* Corporate Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 print:border-black pb-5">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 print:text-black font-black">
                  OFFICIAL RECEIPT VOUCHER (RV)
                </span>
                <h1 className="text-xl font-black mt-0.5 tracking-tight">
                  {currentCompany.name || 'MTS ERP Enterprise'}
                </h1>
                <div className="text-xs text-slate-400 print:text-gray-700 mt-1 space-x-2">
                  <span>NTN: {currentCompany.ntn || '3948291-1'}</span>
                  <span>·</span>
                  <span>STRN: {currentCompany.strn || '03-01-5200-001-99'}</span>
                </div>
              </div>

              {/* QR Code Matrix Box */}
              <div className="flex items-center gap-3 bg-white p-2.5 rounded-2xl shadow-md border border-slate-700 print:border-black shrink-0">
                <QRCodeSVG
                  id="receipt-voucher-qr-svg"
                  value={JSON.stringify(qrPayload)}
                  size={100}
                  level="M"
                  includeMargin={false}
                />
                <div className="text-[10px] text-slate-900 font-mono space-y-0.5 max-w-[110px]">
                  <div className="font-bold flex items-center gap-1 text-emerald-700">
                    <ShieldCheck className="w-3.5 h-3.5 shrink-0" /> VERIFIED
                  </div>
                  <div className="text-[9px] text-gray-600 truncate">{voucherNo}</div>
                  <div className="text-[8px] text-gray-500 font-mono truncate" title={securityHash}>
                    #{securityHash.substring(0, 10)}...
                  </div>
                  <div className="text-[8px] text-gray-500">Scan to Audit</div>
                </div>
              </div>
            </div>

            {/* Document Metadata Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono bg-slate-900/60 print:bg-gray-100 p-4 rounded-xl border border-slate-800/80 print:border-gray-300">
              <div>
                <span className="text-[10px] text-slate-400 print:text-gray-600 block">Voucher No</span>
                <span className="font-bold text-emerald-400 print:text-black text-sm">{voucherNo}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 print:text-gray-600 block">Receipt Date</span>
                <span className="font-bold text-slate-200 print:text-black">{date}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 print:text-gray-600 block">Gross Amount</span>
                <span className="font-bold text-emerald-400 print:text-black text-sm">
                  {currencySymbol} {amount.toLocaleString()}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 print:text-gray-600 block">Currency</span>
                <span className="font-bold text-slate-200 print:text-black">{currency}</span>
              </div>
            </div>

            {/* Additional Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-900/40 print:bg-white border border-slate-800/60 print:border-gray-300 space-y-1">
                <span className="text-[10px] text-slate-400 print:text-gray-600 block uppercase font-mono">Cost Center Allocation</span>
                <div className="font-bold text-slate-200 print:text-black">{costCenter}</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/40 print:bg-white border border-slate-800/60 print:border-gray-300 space-y-1">
                <span className="text-[10px] text-slate-400 print:text-gray-600 block uppercase font-mono">Reference / Bill / Cheque #</span>
                <div className="font-bold font-mono text-slate-200 print:text-black">{refNo || 'CASH-RECEIPT'}</div>
              </div>
            </div>

            {/* Narration */}
            <div className="p-3 rounded-xl bg-slate-900/40 print:bg-white border border-slate-800/60 print:border-gray-300">
              <span className="text-[10px] text-slate-400 print:text-gray-600 block uppercase font-mono mb-0.5">Voucher Narration</span>
              <p className="text-xs text-slate-200 print:text-black italic">
                "{narration || 'Payment received against outstanding receivables / advance invoice.'}"
              </p>
            </div>

            {/* Line Items Table */}
            <div className="border border-slate-800 print:border-black rounded-xl overflow-hidden">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-slate-900 print:bg-gray-200 text-slate-300 print:text-black font-mono text-[11px] border-b border-slate-800 print:border-black">
                    <th className="p-2.5">Account Code & Title</th>
                    <th className="p-2.5">Line Description</th>
                    <th className="p-2.5 text-right">Debit ({currencySymbol})</th>
                    <th className="p-2.5 text-right">Credit ({currencySymbol})</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 print:divide-gray-300 font-mono">
                  {rows.filter(r => (r.debit > 0 || r.credit > 0)).map((r, i) => (
                    <tr key={i} className="hover:bg-slate-900/30">
                      <td className="p-2.5">
                        <span className="font-bold text-emerald-400 print:text-black">{r.accountCode}</span>
                        <span className="text-slate-300 print:text-gray-800 ml-1.5">{r.accountName}</span>
                      </td>
                      <td className="p-2.5 text-slate-400 print:text-gray-600">{r.description || narration}</td>
                      <td className="p-2.5 text-right font-bold text-emerald-400 print:text-black">
                        {r.debit > 0 ? r.debit.toLocaleString() : '-'}
                      </td>
                      <td className="p-2.5 text-right font-bold text-cyan-400 print:text-black">
                        {r.credit > 0 ? r.credit.toLocaleString() : '-'}
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-slate-900/80 print:bg-gray-100 font-bold border-t border-slate-800 print:border-black">
                    <td colSpan={2} className="p-2.5 text-slate-200 print:text-black uppercase">Grand Total ({currency})</td>
                    <td className="p-2.5 text-right text-emerald-400 print:text-black">{amount.toLocaleString()}</td>
                    <td className="p-2.5 text-right text-cyan-400 print:text-black">{amount.toLocaleString()}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Security Checksum Footer */}
            <div className="pt-2 border-t border-slate-800/80 print:border-gray-400 flex flex-col sm:flex-row items-start sm:items-center justify-between text-[10px] text-slate-400 print:text-gray-600 font-mono gap-2">
              <div>
                <span>SHA-256 Checksum: </span>
                <span className="text-emerald-400 print:text-black font-bold break-all">
                  {securityHash}
                </span>
              </div>
              <div className="shrink-0 text-right">
                Digitally Generated via MTS-ERP-SAP System
              </div>
            </div>

            {/* Signature Blocks */}
            <div className="grid grid-cols-3 gap-6 pt-10 text-center text-xs text-slate-400 print:text-gray-800 font-mono">
              <div className="border-t border-slate-700 print:border-black pt-2">
                <span>Prepared By (Cashier)</span>
              </div>
              <div className="border-t border-slate-700 print:border-black pt-2">
                <span>Verified By (Accountant)</span>
              </div>
              <div className="border-t border-slate-700 print:border-black pt-2">
                <span>Authorized Signatory</span>
              </div>
            </div>

          </div>
        </div>

        {/* Footer (Hidden in Print) */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-end print:hidden">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all"
          >
            Close Slip
          </button>
        </div>

      </div>
    </div>
  );
};
