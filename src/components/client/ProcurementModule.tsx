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
import { StandardDocumentGridForm } from '../common/StandardDocumentGridForm';

export const ProcurementModule: React.FC = () => {
  const { currentCompany } = useAuthTenant();
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(INITIAL_PURCHASE_ORDERS);
  const [isGridModalOpen, setIsGridModalOpen] = useState(false);
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
    if (!isGridModalOpen) {
      setIsGridModalOpen(true);
    }
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
            onClick={() => setIsGridModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-lg shadow-amber-600/30 transition-all"
          >
            <Plus className="w-4 h-4" />
            Issue 10-Row Purchase Order
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

      {/* 10-Row Standardized PO Entry Form */}
      <StandardDocumentGridForm 
        isOpen={isGridModalOpen}
        onClose={() => setIsGridModalOpen(false)}
        formTarget={{
          id: 'purchase_order',
          code: 'PO_ENTRY_FBR',
          title: 'Official Purchase Order (PO Issue)',
          departmentId: 'procurement',
          departmentLabel: 'Procurement & Purchasing'
        }}
      />
    </div>
  );
};

