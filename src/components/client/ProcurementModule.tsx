import React, { useState } from 'react';
import { ShoppingCart, Plus, QrCode, ScanLine, Sparkles } from 'lucide-react';
import { useAuthTenant } from '../../context/AuthTenantContext';
import { INITIAL_PURCHASE_ORDERS } from '../../services/mockData';
import { PurchaseOrder, InventoryItem } from '../../types/erp';
import { DataTable } from '../common/DataTable';
import { TTSButton } from '../common/TTSButton';
import { QrScannerModal, ScannedItemPayload } from '../common/QrScannerModal';
import { DocumentScannerModal } from '../common/DocumentScannerModal';
import { ItemSearchSelector } from '../common/ItemSearchSelector';

export const ProcurementModule: React.FC = () => {
  const { currentCompany } = useAuthTenant();
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(INITIAL_PURCHASE_ORDERS);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [isDocScannerOpen, setIsDocScannerOpen] = useState(false);

  // New PO State
  const [vendorName, setVendorName] = useState('Engro Chemicals Ltd');
  const [itemName, setItemName] = useState('Raw Sugar Powder Grade A (1000kg)');
  const [itemCode, setItemCode] = useState('RM-SUGAR-1T');
  const [qty, setQty] = useState(10);
  const [unitPrice, setUnitPrice] = useState(120000);

  const handleItemScanned = (scanned: ScannedItemPayload) => {
    setItemName(scanned.name);
    setItemCode(scanned.code);
    if (scanned.unitPrice > 0) {
      setUnitPrice(scanned.unitPrice);
    }
    if (scanned.qty > 0) {
      setQty(scanned.qty);
    }
    // Automatically open create PO modal if not open
    if (!showCreateModal) {
      setShowCreateModal(true);
    }
  };

  const handleCreatePO = (e: React.FormEvent) => {
    e.preventDefault();
    const subtotal = qty * unitPrice;
    const taxAmount = subtotal * 0.18; // 18% STRN sales tax
    const totalAmount = subtotal + taxAmount;

    const newPO: PurchaseOrder = {
      id: `po_${Date.now()}`,
      poNumber: `PO-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      vendorId: 'v_engro',
      vendorName,
      date: new Date().toISOString().split('T')[0],
      deliveryDate: new Date(Date.now() + 864000000).toISOString().split('T')[0],
      items: [
        { itemId: `item_${Date.now()}`, itemCode, itemName, qty, unitPrice, totalPrice: subtotal }
      ],
      subtotal,
      taxAmount,
      totalAmount,
      status: 'PENDING_APPROVAL',
      tenantId: currentCompany.tenantId,
      branchId: 'br_lahore_01',
      createdBy: 'Procurement Officer'
    };

    setPurchaseOrders([newPO, ...purchaseOrders]);
    setShowCreateModal(false);
  };

  const procurementSpeech = `Procurement and Purchasing Department for ${currentCompany.name}. Total active purchase orders: ${purchaseOrders.length}. Quick QR item scanning enabled for purchase requisition entry.`;

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl font-black text-slate-100 flex items-center gap-2">
            <ShoppingCart className="w-6 h-6 text-amber-400" />
            Procurement & Purchasing Management
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Purchase Requisitions, RFQ Comparisons, Purchase Orders (PO), Goods Receipt Notes (GRN), and QR Item Scanning.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <TTSButton text={procurementSpeech} label="Procurement Briefing" />
          <button
            onClick={() => setIsDocScannerOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-purple-900/50 hover:bg-purple-800/50 border border-purple-500/30 text-purple-200 font-bold text-xs transition-all shadow-md"
          >
            <ScanLine className="w-4 h-4 text-purple-300" />
            <span>Scan Invoice</span>
          </button>
          <button
            onClick={() => setIsQrModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-amber-400 font-bold text-xs transition-all shadow-md"
          >
            <QrCode className="w-4 h-4" />
            Scan Item QR
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-lg shadow-amber-600/30 transition-all"
          >
            <Plus className="w-4 h-4" />
            Issue Purchase Order
          </button>
        </div>
      </div>

      <DataTable
        title="Active Purchase Orders"
        data={purchaseOrders}
        columns={[
          { key: 'poNumber', header: 'PO Number', accessor: (p) => <span className="font-mono font-bold text-amber-400">{p.poNumber}</span>, sortable: true },
          { key: 'vendorName', header: 'Supplier Vendor', accessor: (p) => <span className="font-bold text-slate-100">{p.vendorName}</span>, sortable: true },
          { key: 'date', header: 'PO Date', accessor: (p) => p.date, sortable: true },
          { key: 'subtotal', header: 'Subtotal (PKR)', accessor: (p) => <span className="font-mono text-slate-300">Rs. {p.subtotal.toLocaleString()}</span>, isNumeric: true },
          { key: 'taxAmount', header: '18% STRN Tax', accessor: (p) => <span className="font-mono text-amber-300">Rs. {p.taxAmount.toLocaleString()}</span>, isNumeric: true },
          { key: 'totalAmount', header: 'Total (PKR)', accessor: (p) => <span className="font-mono font-bold text-slate-100">Rs. {p.totalAmount.toLocaleString()}</span>, isNumeric: true, sortable: true },
          { key: 'status', header: 'Approval Status', accessor: (p) => (
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
              p.status === 'APPROVED' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
            }`}>
              {p.status}
            </span>
          )}
        ]}
      />

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-lg w-full space-y-4 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wider text-amber-400">
                Create New Purchase Order (PO)
              </h2>
              <button
                type="button"
                onClick={() => setIsQrModalOpen(true)}
                className="px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 font-bold text-[11px] flex items-center gap-1 transition-all"
              >
                <ScanLine className="w-3.5 h-3.5" />
                Scan Item Details
              </button>
            </div>

            <form onSubmit={handleCreatePO} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Vendor Name</label>
                <input
                  type="text"
                  value={vendorName}
                  onChange={(e) => setVendorName(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-100"
                />
              </div>

              <div>
                <ItemSearchSelector
                  selectedItemCode={itemCode}
                  selectedItemName={itemName}
                  onSelectItem={(item: InventoryItem) => {
                    setItemCode(item.code);
                    setItemName(item.name);
                    if (item.purchasePrice > 0) {
                      setUnitPrice(item.purchasePrice);
                    }
                  }}
                  placeholder="Search Item Code or Description (Zero stock hidden by default)..."
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Quantity</label>
                  <input
                    type="number"
                    value={qty}
                    onChange={(e) => setQty(Number(e.target.value))}
                    required
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-100 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Unit Purchase Price (PKR)</label>
                  <input
                    type="number"
                    value={unitPrice}
                    onChange={(e) => setUnitPrice(Number(e.target.value))}
                    required
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-100 font-mono"
                  />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 text-xs space-y-1 font-mono">
                <div>Subtotal: Rs. {(qty * unitPrice).toLocaleString()}</div>
                <div>18% STRN Sales Tax: Rs. {((qty * unitPrice) * 0.18).toLocaleString()}</div>
                <div className="font-bold text-amber-400">Total PO Amount: Rs. {((qty * unitPrice) * 1.18).toLocaleString()}</div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-lg shadow-amber-600/30"
                >
                  Generate PO & Submit Approval
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Document Scanner Modal */}
      <DocumentScannerModal
        isOpen={isDocScannerOpen}
        onClose={() => setIsDocScannerOpen(false)}
        onScanComplete={(data) => {
          console.log('Scanned data:', data);
          // TODO: parse JSON data and pre-fill PO form
        }}
      />

      {/* QR Code Scanner Modal */}
      <QrScannerModal
        isOpen={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
        onItemScanned={handleItemScanned}
        title="Procurement QR / Barcode Scanner"
        moduleContext="PROCUREMENT"
      />
    </div>
  );
};

