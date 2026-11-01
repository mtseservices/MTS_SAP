import React, { useState } from 'react';
import { Receipt, Plus, Printer, ShoppingBag, CreditCard, CheckCircle2, UserCheck } from 'lucide-react';
import { useAuthTenant } from '../../context/AuthTenantContext';
import { INITIAL_SALES_INVOICES } from '../../services/mockData';
import { SalesInvoice } from '../../types/erp';
import { DataTable } from '../common/DataTable';
import { TTSButton } from '../common/TTSButton';
import { offlineStore } from '../../services/offlineStore';

export const SalesPosModule: React.FC = () => {
  const { currentCompany } = useAuthTenant();
  const [invoices, setInvoices] = useState<SalesInvoice[]>(INITIAL_SALES_INVOICES);
  const [activeTab, setActiveTab] = useState<'invoices' | 'pos'>('invoices');
  const [printModalInvoice, setPrintModalInvoice] = useState<SalesInvoice | null>(null);

  // POS State
  const [posCustomer, setPosCustomer] = useState('Walk-in Customer / Retail');
  const [posQty, setPosQty] = useState(5);
  const [posPrice, setPosPrice] = useState(2400);

  const handleCreatePosInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    const subtotal = posQty * posPrice;
    const taxAmount = subtotal * 0.18;
    const grandTotal = subtotal + taxAmount;

    const newInvoice: SalesInvoice = {
      id: `inv_${Date.now()}`,
      invoiceNo: `INV-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      customerId: 'cust_walkin',
      customerName: posCustomer,
      date: new Date().toISOString().split('T')[0],
      dueDate: new Date().toISOString().split('T')[0],
      items: [
        { itemId: 'item_03', itemCode: 'FG-BISCUIT-BOX', itemName: 'Albarka Energy Biscuits Box', qty: posQty, unitPrice: posPrice, discount: 0, taxRate: 18, totalPrice: subtotal }
      ],
      subtotal,
      taxAmount,
      grandTotal,
      paidAmount: grandTotal,
      balanceDue: 0,
      paymentStatus: 'PAID',
      approvalStatus: 'APPROVED',
      branchId: 'br_lahore_01',
      tenantId: currentCompany.tenantId,
      createdBy: 'POS Operator'
    };

    setInvoices([newInvoice, ...invoices]);
    setPrintModalInvoice(newInvoice);

    // Also queue if offline or store locally
    if (!offlineStore.isOnline()) {
      offlineStore.queueTransaction({
        type: 'SALES_INVOICE',
        data: newInvoice,
        tenantId: currentCompany.tenantId
      });
    }
  };

  const salesSpeech = `Sales and POS Counter for ${currentCompany.name}. Total invoices logged: ${invoices.length}. Automatic 18 percent STRN sales tax applied to all registered commercial invoices.`;

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl font-black text-slate-100 flex items-center gap-2">
            <Receipt className="w-6 h-6 text-cyan-400" />
            Sales Distribution & Retail POS Counter
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Sales Quotations, Sales Orders, Tax Invoices (FBR STRN 18%), Customer Ledgers, and Express POS Checkout.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <TTSButton text={salesSpeech} label="Sales Voice Summary" />
          <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-xl border border-slate-700 text-xs font-bold">
            <button
              onClick={() => setActiveTab('invoices')}
              className={`px-3 py-1 rounded-lg transition-all ${activeTab === 'invoices' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
            >
              Tax Invoices
            </button>
            <button
              onClick={() => setActiveTab('pos')}
              className={`px-3 py-1 rounded-lg transition-all ${activeTab === 'pos' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
            >
              Express POS Counter
            </button>
          </div>
        </div>
      </div>

      {activeTab === 'invoices' && (
        <DataTable
          title="Issued Sales Invoices & Receivables"
          data={invoices}
          columns={[
            { key: 'invoiceNo', header: 'Invoice No', accessor: (inv) => <span className="font-mono font-bold text-cyan-400">{inv.invoiceNo}</span>, sortable: true },
            { key: 'customerName', header: 'Customer', accessor: (inv) => <span className="font-bold text-slate-100">{inv.customerName}</span>, sortable: true },
            { key: 'date', header: 'Date', accessor: (inv) => inv.date, sortable: true },
            { key: 'subtotal', header: 'Subtotal (PKR)', accessor: (inv) => <span className="font-mono text-slate-300">Rs. {inv.subtotal.toLocaleString()}</span>, isNumeric: true },
            { key: 'taxAmount', header: '18% STRN Tax', accessor: (inv) => <span className="font-mono text-cyan-300">Rs. {inv.taxAmount.toLocaleString()}</span>, isNumeric: true },
            { key: 'grandTotal', header: 'Grand Total (PKR)', accessor: (inv) => <span className="font-mono font-bold text-slate-100">Rs. {inv.grandTotal.toLocaleString()}</span>, isNumeric: true, sortable: true },
            { key: 'paymentStatus', header: 'Payment Status', accessor: (inv) => (
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                inv.paymentStatus === 'PAID' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
              }`}>
                {inv.paymentStatus}
              </span>
            )},
            { key: 'actions', header: 'Print', accessor: (inv) => (
              <button
                onClick={() => setPrintModalInvoice(inv)}
                className="p-1 px-2 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1 border border-slate-700"
              >
                <Printer className="w-3.5 h-3.5 text-cyan-400" /> Print
              </button>
            )}
          ]}
        />
      )}

      {activeTab === 'pos' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl max-w-xl mx-auto space-y-6">
          <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wider text-cyan-400">
                Express POS Sales Checkout
              </h2>
              <p className="text-xs text-slate-400">Instant retail billing with auto-calculated tax & receipt print.</p>
            </div>
            <ShoppingBag className="w-6 h-6 text-cyan-400" />
          </div>

          <form onSubmit={handleCreatePosInvoice} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Customer Name / Walk-in</label>
              <input
                type="text"
                value={posCustomer}
                onChange={(e) => setPosCustomer(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-100"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Carton Quantity</label>
                <input
                  type="number"
                  value={posQty}
                  onChange={(e) => setPosQty(Number(e.target.value))}
                  required
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-100 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Unit Price (PKR)</label>
                <input
                  type="number"
                  value={posPrice}
                  onChange={(e) => setPosPrice(Number(e.target.value))}
                  required
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-100 font-mono"
                />
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 text-xs space-y-1 font-mono">
              <div className="flex justify-between text-slate-300">
                <span>Subtotal Amount:</span>
                <span>Rs. {(posQty * posPrice).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-cyan-300">
                <span>18% STRN Sales Tax:</span>
                <span>Rs. {((posQty * posPrice) * 0.18).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-emerald-400 font-bold text-sm pt-2 border-t border-slate-700">
                <span>Grand Total Payable:</span>
                <span>Rs. {((posQty * posPrice) * 1.18).toLocaleString()}</span>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs shadow-xl shadow-cyan-600/30 flex items-center justify-center gap-2"
            >
              <CreditCard className="w-4 h-4" />
              Complete Sale & Print Thermal Receipt
            </button>
          </form>
        </div>
      )}

      {/* Printable Invoice Modal */}
      {printModalInvoice && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white text-slate-900 rounded-2xl p-6 max-w-lg w-full space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h2 className="font-bold text-lg text-slate-900">{currentCompany.name}</h2>
                <div className="text-xs text-slate-600 font-mono">NTN: {currentCompany.ntn} • STRN: {currentCompany.strn}</div>
              </div>
              <div className="text-right text-xs font-mono font-bold text-cyan-700">
                OFFICIAL TAX INVOICE
              </div>
            </div>

            <div className="text-xs font-mono space-y-1 bg-slate-50 p-3 rounded-lg border border-slate-200">
              <div>Invoice No: <strong>{printModalInvoice.invoiceNo}</strong></div>
              <div>Customer: <strong>{printModalInvoice.customerName}</strong></div>
              <div>Date: {printModalInvoice.date}</div>
            </div>

            <table className="w-full text-xs text-left border-collapse border border-slate-200">
              <thead className="bg-slate-100 font-bold">
                <tr>
                  <th className="p-2 border">Item</th>
                  <th className="p-2 border text-right">Qty</th>
                  <th className="p-2 border text-right">Price</th>
                  <th className="p-2 border text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {printModalInvoice.items.map((it, idx) => (
                  <tr key={idx} className="border-b">
                    <td className="p-2 border">{it.itemName}</td>
                    <td className="p-2 border text-right font-mono">{it.qty}</td>
                    <td className="p-2 border text-right font-mono">Rs. {it.unitPrice.toLocaleString()}</td>
                    <td className="p-2 border text-right font-mono">Rs. {it.totalPrice.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="text-xs font-mono space-y-1 text-right">
              <div>Subtotal: Rs. {printModalInvoice.subtotal.toLocaleString()}</div>
              <div>18% STRN Sales Tax: Rs. {printModalInvoice.taxAmount.toLocaleString()}</div>
              <div className="font-bold text-sm text-slate-900">
                Grand Total: Rs. {printModalInvoice.grandTotal.toLocaleString()}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t">
              <button
                onClick={() => setPrintModalInvoice(null)}
                className="px-4 py-1.5 rounded-lg bg-slate-200 text-slate-800 text-xs font-semibold"
              >
                Close
              </button>
              <button
                onClick={() => window.print()}
                className="px-4 py-1.5 rounded-lg bg-cyan-600 text-white text-xs font-bold shadow"
              >
                Print Invoice
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
