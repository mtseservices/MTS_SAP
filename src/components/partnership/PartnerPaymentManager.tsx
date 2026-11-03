import React, { useState } from 'react';
import {
  CreditCard,
  Plus,
  CheckCircle2,
  Printer,
  Building2,
  Users,
  DollarSign,
  FileText,
  Clock,
  ArrowDownLeft,
  Search
} from 'lucide-react';
import { Partnership, PartnerPaymentVoucher } from '../../types/partnership';
import { savePartnerPayments } from '../../services/partnershipService';
import { useAuthTenant } from '../../context/AuthTenantContext';
import { TTSButton } from '../common/TTSButton';

interface PartnerPaymentManagerProps {
  partnership: Partnership;
  payments: PartnerPaymentVoucher[];
  onRefreshData: () => void;
}

export const PartnerPaymentManager: React.FC<PartnerPaymentManagerProps> = ({
  partnership,
  payments,
  onRefreshData
}) => {
  const { currentCompany } = useAuthTenant();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New Payment Voucher Form State
  const [newVoucher, setNewVoucher] = useState({
    partnerId: partnership.partners[0]?.id || '',
    paymentType: 'Monthly Remuneration' as const,
    amountPKR: 200000,
    paymentDate: new Date().toISOString().split('T')[0],
    paymentMethod: 'Meezan Bank IBFT' as const,
    txnRefNo: '',
    narration: ''
  });

  const totalPaidPKR = payments
    .filter(p => p.status === 'POSTED')
    .reduce((sum, p) => sum + p.amountPKR, 0);

  const handleCreateVoucher = async () => {
    const partner = partnership.partners.find(p => p.id === newVoucher.partnerId);
    if (!partner) return;

    const voucher: PartnerPaymentVoucher = {
      id: `pay_${Date.now()}`,
      voucherNo: `PV-PTR-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      partnershipId: partnership.id,
      partnershipName: partnership.partnershipName,
      partnerId: partner.id,
      partnerName: partner.fullName,
      paymentType: newVoucher.paymentType,
      amountPKR: Number(newVoucher.amountPKR),
      paymentDate: newVoucher.paymentDate,
      paymentMethod: newVoucher.paymentMethod,
      bankAccountId: partnership.bankAccountDetails.iban,
      txnRefNo: newVoucher.txnRefNo || `MZB-${Math.floor(100000 + Math.random() * 900000)}`,
      narration: newVoucher.narration || `${newVoucher.paymentType} payment to ${partner.fullName}`,
      status: 'POSTED',
      createdBy: 'Finance Manager',
      createdAt: new Date().toISOString().split('T')[0]
    };

    const updated = [voucher, ...payments];
    await savePartnerPayments(currentCompany.id, updated);
    setIsModalOpen(false);
    onRefreshData();
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-100 flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-purple-400" /> Partner Payment Vouchers &amp; Settlements
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Issue payment vouchers for profit distributions, partner monthly salaries, commissions, and capital drawings.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <TTSButton text={`Partner Payment Manager. Total settled payments PKR ${totalPaidPKR.toLocaleString()}.`} />
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-purple-600/30 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Issue Payment Voucher</span>
          </button>
        </div>
      </div>

      {/* Payment Vouchers Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wider">Posted Partner Vouchers</h2>
            <p className="text-xs text-slate-400">Record of banking transfers, cheque disbursements, and cash settlements.</p>
          </div>

          <span className="text-xs font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-3 py-1 rounded-xl">
            Total Disbursed: PKR {totalPaidPKR.toLocaleString()}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase font-mono text-[10px]">
              <tr>
                <th className="p-3 rounded-l-xl">Voucher No &amp; Date</th>
                <th className="p-3">Partner Name</th>
                <th className="p-3">Payment Category</th>
                <th className="p-3">Method &amp; Txn Ref</th>
                <th className="p-3">Narration</th>
                <th className="p-3">Amount (PKR)</th>
                <th className="p-3 text-right rounded-r-xl">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {payments.map((pv) => (
                <tr key={pv.id} className="hover:bg-slate-800/40 transition">
                  <td className="p-3 font-mono text-[11px]">
                    <div className="text-slate-100 font-bold">{pv.voucherNo}</div>
                    <div className="text-[10px] text-slate-500">{pv.paymentDate}</div>
                  </td>
                  <td className="p-3 font-bold text-slate-100">{pv.partnerName}</td>
                  <td className="p-3">
                    <span className="px-2.5 py-1 bg-purple-500/20 text-purple-300 font-mono text-[10px] rounded-lg border border-purple-500/30">
                      {pv.paymentType}
                    </span>
                  </td>
                  <td className="p-3 font-mono text-[11px]">
                    <div className="text-slate-200">{pv.paymentMethod}</div>
                    <div className="text-[10px] text-slate-500">{pv.txnRefNo}</div>
                  </td>
                  <td className="p-3 text-slate-300 max-w-xs truncate">{pv.narration}</td>
                  <td className="p-3 font-mono font-bold text-emerald-400">
                    PKR {pv.amountPKR.toLocaleString()}
                  </td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => window.print()}
                      className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition cursor-pointer"
                      title="Print Voucher"
                    >
                      <Printer className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Payment Voucher Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">Issue Partner Payment Voucher</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs font-sans">
              <div>
                <label className="block text-slate-400 font-medium mb-1">Payee Partner</label>
                <select
                  value={newVoucher.partnerId}
                  onChange={(e) => setNewVoucher({ ...newVoucher, partnerId: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-200 focus:outline-none"
                >
                  {partnership.partners.map((p) => (
                    <option key={p.id} value={p.id}>{p.fullName} ({p.partnerCode})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Payment Category</label>
                <select
                  value={newVoucher.paymentType}
                  onChange={(e) => setNewVoucher({ ...newVoucher, paymentType: e.target.value as any })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-200 focus:outline-none"
                >
                  <option value="Monthly Remuneration">Monthly Remuneration / Salary</option>
                  <option value="Profit Distribution">Profit Distribution Settlement</option>
                  <option value="Commission">Commission Allowance</option>
                  <option value="Capital Return">Capital Drawing / Return</option>
                  <option value="Expense Reimbursement">Expense Reimbursement</option>
                </select>
              </div>

              <div>
                <label className="block text-emerald-400 font-bold mb-1">Payment Amount (PKR)</label>
                <input
                  type="number"
                  value={newVoucher.amountPKR}
                  onChange={(e) => setNewVoucher({ ...newVoucher, amountPKR: Number(e.target.value) })}
                  className="w-full bg-slate-950 border border-emerald-500/40 rounded-xl p-3 text-emerald-300 font-mono font-bold focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Payment Method</label>
                <select
                  value={newVoucher.paymentMethod}
                  onChange={(e) => setNewVoucher({ ...newVoucher, paymentMethod: e.target.value as any })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-200 focus:outline-none"
                >
                  <option value="Meezan Bank IBFT">Meezan Bank IBFT</option>
                  <option value="Bank Transfer">Commercial Bank Transfer (RTGS)</option>
                  <option value="Cheque">Crossed Cheque</option>
                  <option value="Cash">Petty Cash</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Bank Txn Ref / Cheque No</label>
                <input
                  type="text"
                  value={newVoucher.txnRefNo}
                  onChange={(e) => setNewVoucher({ ...newVoucher, txnRefNo: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-200 focus:outline-none"
                  placeholder="e.g. MZB-IBFT-9901"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Narration / Remarks</label>
                <input
                  type="text"
                  value={newVoucher.narration}
                  onChange={(e) => setNewVoucher({ ...newVoucher, narration: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-200 focus:outline-none"
                  placeholder="Managing Partner Remuneration for January 2026..."
                />
              </div>
            </div>

            <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-800">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateVoucher}
                className="px-5 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl shadow-lg shadow-purple-600/30 cursor-pointer"
              >
                Post Payment Voucher
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
