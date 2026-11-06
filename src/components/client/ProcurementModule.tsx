import React, { useState, useMemo } from 'react';
import { 
  ShoppingCart, 
  Plus, 
  QrCode, 
  ScanLine, 
  Sparkles, 
  FileText, 
  PackageCheck, 
  Truck, 
  Building2, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Filter, 
  Search, 
  Trash2, 
  Edit3, 
  Eye, 
  ArrowRight,
  ShieldCheck,
  Check
} from 'lucide-react';
import { useAuthTenant } from '../../context/AuthTenantContext';
import { INITIAL_PURCHASE_ORDERS, INITIAL_INVENTORY } from '../../services/mockData';
import { PurchaseOrder, InventoryItem } from '../../types/erp';
import { DataTable } from '../common/DataTable';
import { TTSButton } from '../common/TTSButton';
import { QrScannerModal, ScannedItemPayload } from '../common/QrScannerModal';
import { StandardDocumentGridForm } from '../common/StandardDocumentGridForm';
import { DocumentScannerModal } from '../common/DocumentScannerModal';
import { BaseFormLayout } from '../common/BaseFormLayout';
import { CreateNewActionButton } from '../common/CreateNewActionButton';

interface PurchaseRequisition {
  id: string;
  prNumber: string;
  department: string;
  requestor: string;
  date: string;
  requiredDate: string;
  priority: 'URGENT' | 'NORMAL' | 'LOW';
  items: {
    itemCode: string;
    itemName: string;
    qty: number;
    estimatedPrice: number;
  }[];
  status: 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED' | 'CONVERTED_TO_PO';
}

interface MaterialReceiptGRN {
  id: string;
  grnNumber: string;
  poNumber: string;
  supplierName: string;
  receivedDate: string;
  warehouseName: string;
  inspectionStatus: 'PENDING_INSPECTION' | 'QUALITY_APPROVED' | 'REJECTED_DEFECTIVE' | 'PUT_AWAY';
  inspectorName: string;
  itemsReceived: {
    itemCode: string;
    itemName: string;
    orderedQty: number;
    receivedQty: number;
    qcPassed: boolean;
  }[];
  remarks: string;
}

const INITIAL_SUPPLIERS = [
  { id: 'sup_01', name: 'Indus Ginning & Pressing Mills', ntn: '3948291-1', strn: '03-01-5200-001-99', category: 'Raw Cotton & Agricultural', contact: '+92-41-8822110', rating: 'A+' },
  { id: 'sup_02', name: 'Engro Chemicals Pakistan Ltd', ntn: '1249502-8', strn: '17-00-3100-004-82', category: 'Chemicals & Dyes', contact: '+92-21-111-250-250', rating: 'A+' },
  { id: 'sup_03', name: 'Nishat Textile Spinning Hub', ntn: '0812942-3', strn: '03-02-5100-019-55', category: 'Yarn & Fibers', contact: '+92-41-8782100', rating: 'A' },
  { id: 'sup_04', name: 'Fauji Fertilizer Bin Qasim', ntn: '2938102-4', strn: '07-01-3100-022-11', category: 'Industrial Packaging', contact: '+92-51-8450000', rating: 'A+' },
  { id: 'sup_05', name: 'Pakistan State Oil (PSO Bulk)', ntn: '0712849-0', strn: '03-00-2700-002-41', category: 'Furnace Oil & Energy', contact: '+92-21-99203870', rating: 'A' }
];

const INITIAL_REQUISITIONS: PurchaseRequisition[] = [
  {
    id: 'pr_01',
    prNumber: 'PR-2026-0102',
    department: 'Textile Production & Spinning',
    requestor: 'Engr. Tariq Mehmood',
    date: '2026-11-01',
    requiredDate: '2026-11-10',
    priority: 'URGENT',
    items: [
      { itemCode: 'RM-COTTON-BALES', itemName: 'Grade-A Raw Cotton Bales (170kg Bale)', qty: 80, estimatedPrice: 32000 },
      { itemCode: 'DYE-REACTIVE-BLUE', itemName: 'Reactive High-Fastness Navy Blue Dye', qty: 15, estimatedPrice: 15000 }
    ],
    status: 'APPROVED'
  },
  {
    id: 'pr_02',
    prNumber: 'PR-2026-0103',
    department: 'Plant Maintenance & Utilities',
    requestor: 'Ch. Muhammad Akram',
    date: '2026-11-02',
    requiredDate: '2026-11-15',
    priority: 'NORMAL',
    items: [
      { itemCode: 'SP-BEARING-6312', itemName: 'Heavy Duty SKF Ball Bearings 6312', qty: 25, estimatedPrice: 4500 }
    ],
    status: 'PENDING_APPROVAL'
  }
];

const INITIAL_GRNS: MaterialReceiptGRN[] = [
  {
    id: 'grn_01',
    grnNumber: 'GRN-2026-0044',
    poNumber: 'PO-2026-0041',
    supplierName: 'Indus Ginning & Pressing Mills',
    receivedDate: '2026-10-25',
    warehouseName: 'Faisalabad Cotton Store',
    inspectionStatus: 'PUT_AWAY',
    inspectorName: 'Store Officer Waqas',
    itemsReceived: [
      { itemCode: 'RM-COTTON-BALES', itemName: 'Grade-A Raw Cotton Bales (170kg Bale)', orderedQty: 50, receivedQty: 50, qcPassed: true },
      { itemCode: 'YARN-COMB-40S', itemName: 'Combed Cotton Ring Spun Yarn (40/1 Count)', orderedQty: 100, receivedQty: 100, qcPassed: true }
    ],
    remarks: 'Bales weighed on electronic weighbridge. Moisture content within acceptable 8.5% threshold.'
  },
  {
    id: 'grn_02',
    grnNumber: 'GRN-2026-0045',
    poNumber: 'PO-2026-0042',
    supplierName: 'Engro Chemicals Pakistan Ltd',
    receivedDate: '2026-10-28',
    warehouseName: 'Faisalabad Chemical Store',
    inspectionStatus: 'QUALITY_APPROVED',
    inspectorName: 'Q.C. Mgr Aslam',
    itemsReceived: [
      { itemCode: 'DYE-REACTIVE-BLUE', itemName: 'Reactive High-Fastness Navy Blue Dye', orderedQty: 20, receivedQty: 20, qcPassed: true }
    ],
    remarks: 'Batch assay tested. Purity 98.4%. Ready for warehouse putaway.'
  }
];

export const ProcurementModule: React.FC = () => {
  const { currentCompany } = useAuthTenant();
  const [activeSubTab, setActiveSubTab] = useState<'requisitions' | 'purchase_orders' | 'material_receipts' | 'suppliers'>('purchase_orders');
  
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(INITIAL_PURCHASE_ORDERS);
  const [requisitions, setRequisitions] = useState<PurchaseRequisition[]>(INITIAL_REQUISITIONS);
  const [materialReceipts, setMaterialReceipts] = useState<MaterialReceiptGRN[]>(INITIAL_GRNS);
  const [suppliers, setSuppliers] = useState(INITIAL_SUPPLIERS);

  const [isGridModalOpen, setIsGridModalOpen] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [isDocScannerOpen, setIsDocScannerOpen] = useState(false);

  // New PO / Supplier State for Supplier Combo Box
  const [selectedSupplierId, setSelectedSupplierId] = useState(INITIAL_SUPPLIERS[0].id);
  const [newPoNumber, setNewPoNumber] = useState(`PO-2026-${Math.floor(1000 + Math.random() * 9000)}`);
  const [deliveryDate, setDeliveryDate] = useState('2026-11-30');
  const [poItems, setPoItems] = useState([
    { itemCode: 'RM-COTTON-BALES', itemName: 'Grade-A Raw Cotton Bales (170kg Bale)', qty: 25, unitPrice: 32000 }
  ]);

  const activeSupplier = useMemo(() => {
    return suppliers.find(s => s.id === selectedSupplierId) || suppliers[0];
  }, [selectedSupplierId, suppliers]);

  const handleItemScanned = (scanned: ScannedItemPayload) => {
    if (!isGridModalOpen) {
      setIsGridModalOpen(true);
    }
  };

  const handleCreatePoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const subtotal = poItems.reduce((acc, item) => acc + (item.qty * item.unitPrice), 0);
    const taxAmount = subtotal * 0.18; // 18% STRN
    const totalAmount = subtotal + taxAmount;

    const newPo: PurchaseOrder = {
      id: `po_${Date.now()}`,
      poNumber: newPoNumber,
      vendorId: activeSupplier.id,
      vendorName: activeSupplier.name,
      date: new Date().toISOString().split('T')[0],
      deliveryDate: deliveryDate,
      items: poItems.map(item => ({
        itemId: `item_${Math.random()}`,
        itemCode: item.itemCode,
        itemName: item.itemName,
        qty: item.qty,
        unitPrice: item.unitPrice,
        totalPrice: item.qty * item.unitPrice
      })),
      subtotal,
      taxAmount,
      totalAmount,
      status: 'APPROVED',
      tenantId: currentCompany.tenantId,
      branchId: 'br_faisalabad_01',
      createdBy: 'Procurement Officer'
    };

    setPurchaseOrders([newPo, ...purchaseOrders]);
    setNewPoNumber(`PO-2026-${Math.floor(1000 + Math.random() * 9000)}`);
    setIsGridModalOpen(false);
  };

  const procurementSpeech = `Procurement and Purchasing Department for ${currentCompany.name}. Active purchase orders: ${purchaseOrders.length}. Purchase requisitions pending: ${requisitions.length}. Material receipt GRN tracking active.`;

  if (isGridModalOpen) {
    const subtotal = poItems.reduce((acc, item) => acc + (item.qty * item.unitPrice), 0);
    const taxAmount = subtotal * 0.18;
    const totalAmount = subtotal + taxAmount;

    return (
      <BaseFormLayout
        title="Issue New Purchase Order (PO)"
        subtitle="Create verified procurement order with supplier tax compliance, terms, and auto-sync to accounts payable"
        breadcrumbs={[
          { label: 'Procurement & Supply Chain', onClick: () => setIsGridModalOpen(false) },
          { label: 'Purchase Orders', onClick: () => setIsGridModalOpen(false) },
          { label: newPoNumber, active: true }
        ]}
        documentRef={newPoNumber}
        statusBadge="DRAFT PO"
        variant="grid-ledger"
        submitLabel="Issue Purchase Order"
        onDiscard={() => setIsGridModalOpen(false)}
        onSubmit={() => handleCreatePoSubmit({ preventDefault: () => {} } as React.FormEvent)}
      >
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6 font-sans">
          <form onSubmit={handleCreatePoSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">PO Number</label>
                <input
                  type="text"
                  value={newPoNumber}
                  onChange={(e) => setNewPoNumber(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-100 focus:border-amber-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Expected Delivery Date</label>
                <input
                  type="date"
                  value={deliveryDate}
                  onChange={(e) => setDeliveryDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:border-amber-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Plant / Receiving Location</label>
                <input
                  type="text"
                  readOnly
                  value="Faisalabad Main Mill (Weaving & Spinning)"
                  className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-400 outline-none"
                />
              </div>
            </div>

            {/* Supplier Selection Combo Box */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <label className="block text-xs font-bold text-slate-300 flex items-center justify-between">
                <span>Supplier / Vendor Selection</span>
                <span className="text-[10px] text-amber-400 font-mono">NTN: {activeSupplier.ntn} | Rating: {activeSupplier.rating}</span>
              </label>
              <select
                value={selectedSupplierId}
                onChange={(e) => setSelectedSupplierId(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-100 focus:border-amber-500 outline-none"
              >
                {suppliers.map(sup => (
                  <option key={sup.id} value={sup.id}>
                    {sup.name} — ({sup.category}) [NTN: {sup.ntn}]
                  </option>
                ))}
              </select>
            </div>

            {/* Purchase Line Items */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">
                  Purchase Order Line Items
                </label>
                <button
                  type="button"
                  onClick={() => setPoItems([...poItems, { itemCode: 'RAW-NEW', itemName: '', qty: 1, unitPrice: 0 }])}
                  className="px-3 py-1.5 rounded-xl bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/30 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Line Item
                </button>
              </div>

              <div className="space-y-2">
                {poItems.map((item, idx) => (
                  <div key={idx} className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center bg-slate-950 p-3 rounded-xl border border-slate-800">
                    <div className="sm:col-span-5">
                      <input
                        type="text"
                        value={item.itemName}
                        onChange={(e) => {
                          const updated = [...poItems];
                          updated[idx].itemName = e.target.value;
                          setPoItems(updated);
                        }}
                        placeholder="Item Name / Code"
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 outline-none"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <input
                        type="number"
                        value={item.qty}
                        onChange={(e) => {
                          const updated = [...poItems];
                          updated[idx].qty = Number(e.target.value);
                          setPoItems(updated);
                        }}
                        placeholder="Qty"
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs font-mono text-slate-100 outline-none"
                      />
                    </div>
                    <div className="sm:col-span-3">
                      <input
                        type="number"
                        value={item.unitPrice}
                        onChange={(e) => {
                          const updated = [...poItems];
                          updated[idx].unitPrice = Number(e.target.value);
                          setPoItems(updated);
                        }}
                        placeholder="Unit Price"
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs font-mono text-slate-100 outline-none"
                      />
                    </div>
                    <div className="sm:col-span-2 text-right">
                      <span className="text-xs font-mono font-bold text-amber-400">Rs. {(item.qty * item.unitPrice).toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Summary */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono">
              <div className="text-xs text-slate-400 space-y-1">
                <div>Subtotal: <span className="text-slate-200 font-bold">Rs. {subtotal.toLocaleString()}</span></div>
                <div>Sales Tax (18% STRN): <span className="text-amber-400 font-bold">Rs. {taxAmount.toLocaleString()}</span></div>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-400 block">Gross PO Payable:</span>
                <span className="text-xl font-black text-amber-300">Rs. {totalAmount.toLocaleString()}</span>
              </div>
            </div>
          </form>
        </div>
      </BaseFormLayout>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl font-black text-slate-100 flex items-center gap-2">
            <ShoppingCart className="w-6 h-6 text-amber-400" />
            Procurement & Purchasing Management
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage Purchase Requisitions, Supplier Selection Combo, Purchase Orders (PO), and Material Receipt (GRN) Status Tracking.
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
          <CreateNewActionButton
            label="Create Purchase Order"
            variant="amber"
            shortcutHint="Ctrl+N"
            onClick={() => setIsGridModalOpen(true)}
          />
        </div>
      </div>

      {/* Sub-tab Navigation */}
      <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveSubTab('purchase_orders')}
          className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 transition-all ${
            activeSubTab === 'purchase_orders'
              ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
              : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800'
          }`}
        >
          <ShoppingCart className="w-4 h-4" />
          Purchase Orders ({purchaseOrders.length})
        </button>

        <button
          onClick={() => setActiveSubTab('requisitions')}
          className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 transition-all ${
            activeSubTab === 'requisitions'
              ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
              : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800'
          }`}
        >
          <FileText className="w-4 h-4" />
          Purchase Requisitions ({requisitions.length})
        </button>

        <button
          onClick={() => setActiveSubTab('material_receipts')}
          className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 transition-all ${
            activeSubTab === 'material_receipts'
              ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
              : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800'
          }`}
        >
          <PackageCheck className="w-4 h-4" />
          Material Receipts (GRN) ({materialReceipts.length})
        </button>

        <button
          onClick={() => setActiveSubTab('suppliers')}
          className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 transition-all ${
            activeSubTab === 'suppliers'
              ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
              : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800'
          }`}
        >
          <Building2 className="w-4 h-4" />
          Supplier Directory ({suppliers.length})
        </button>
      </div>

      {/* SUB-TAB 1: PURCHASE ORDERS */}
      {activeSubTab === 'purchase_orders' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl">
              <span className="text-xs text-slate-400 font-medium">Total Active POs</span>
              <h3 className="text-2xl font-black text-slate-100 mt-1">{purchaseOrders.length} Orders</h3>
              <p className="text-[10px] text-emerald-400 mt-1 flex items-center gap-1 font-semibold">
                <CheckCircle2 className="w-3 h-3" /> FBR Digital Invoicing Synced
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl">
              <span className="text-xs text-slate-400 font-medium">Total Procurement Value</span>
              <h3 className="text-2xl font-black text-amber-400 mt-1">
                Rs. {purchaseOrders.reduce((sum, p) => sum + p.totalAmount, 0).toLocaleString()}
              </h3>
              <p className="text-[10px] text-slate-400 mt-1">Includes 18% Sales Tax (STRN)</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl">
              <span className="text-xs text-slate-400 font-medium">Approved Suppliers</span>
              <h3 className="text-2xl font-black text-purple-400 mt-1">{suppliers.length} Vendors</h3>
              <p className="text-[10px] text-slate-400 mt-1">Active withholding tax status</p>
            </div>
          </div>

          <DataTable
            title="Active Purchase Orders (PO)"
            data={purchaseOrders}
            columns={[
              { key: 'poNumber', header: 'PO Number', accessor: (p) => <span className="font-mono font-bold text-amber-400">{p.poNumber}</span>, sortable: true },
              { key: 'vendorName', header: 'Supplier / Vendor', accessor: (p) => <span className="font-bold text-slate-100">{p.vendorName}</span>, sortable: true },
              { key: 'date', header: 'PO Date', accessor: (p) => p.date, sortable: true },
              { key: 'deliveryDate', header: 'Expected Delivery', accessor: (p) => <span className="text-purple-300 font-medium">{p.deliveryDate}</span> },
              { key: 'subtotal', header: 'Subtotal (PKR)', accessor: (p) => <span className="font-mono text-slate-300">Rs. {p.subtotal.toLocaleString()}</span>, isNumeric: true },
              { key: 'taxAmount', header: '18% STRN Tax', accessor: (p) => <span className="font-mono text-amber-300">Rs. {p.taxAmount.toLocaleString()}</span>, isNumeric: true },
              { key: 'totalAmount', header: 'Total (PKR)', accessor: (p) => <span className="font-mono font-bold text-slate-100">Rs. {p.totalAmount.toLocaleString()}</span>, isNumeric: true, sortable: true },
              { key: 'status', header: 'Status', accessor: (p) => (
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                  p.status === 'APPROVED' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                }`}>
                  {p.status}
                </span>
              )}
            ]}
          />
        </div>
      )}

      {/* SUB-TAB 2: PURCHASE REQUISITIONS */}
      {activeSubTab === 'requisitions' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-base font-bold text-slate-100">Departmental Purchase Requisitions</h2>
              <p className="text-xs text-slate-400">Internal material requests raised by department managers before PO generation.</p>
            </div>
            <button
              onClick={() => {
                const newPr: PurchaseRequisition = {
                  id: `pr_${Date.now()}`,
                  prNumber: `PR-2026-${Math.floor(100 + Math.random() * 900)}`,
                  department: 'Mill Operations & Maintenance',
                  requestor: 'Department Head',
                  date: new Date().toISOString().split('T')[0],
                  requiredDate: '2026-11-20',
                  priority: 'NORMAL',
                  items: [{ itemCode: 'RM-COTTON-BALES', itemName: 'Grade-A Raw Cotton Bales (170kg Bale)', qty: 40, estimatedPrice: 32000 }],
                  status: 'PENDING_APPROVAL'
                };
                setRequisitions([newPr, ...requisitions]);
              }}
              className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-md transition-all"
            >
              <Plus className="w-4 h-4" /> Raise New Requisition
            </button>
          </div>

          <DataTable
            title="Purchase Requisitions Queue"
            data={requisitions}
            columns={[
              { key: 'prNumber', header: 'PR Number', accessor: (r) => <span className="font-mono font-bold text-amber-400">{r.prNumber}</span>, sortable: true },
              { key: 'department', header: 'Department', accessor: (r) => <span className="font-bold text-slate-100">{r.department}</span>, sortable: true },
              { key: 'requestor', header: 'Requestor', accessor: (r) => r.requestor },
              { key: 'requiredDate', header: 'Required Date', accessor: (r) => <span className="text-purple-300 font-medium">{r.requiredDate}</span> },
              { key: 'priority', header: 'Priority', accessor: (r) => (
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                  r.priority === 'URGENT' ? 'bg-rose-500/20 text-rose-300 border-rose-500/30' : 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                }`}>
                  {r.priority}
                </span>
              )},
              { key: 'status', header: 'Approval Status', accessor: (r) => (
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                  r.status === 'APPROVED' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                }`}>
                  {r.status}
                </span>
              )}
            ]}
          />
        </div>
      )}

      {/* SUB-TAB 3: MATERIAL RECEIPTS (GRN) */}
      {activeSubTab === 'material_receipts' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-base font-bold text-slate-100">Goods Receipt Note (GRN) & Material Tracking Status</h2>
              <p className="text-xs text-slate-400">Track inward shipments, quality control inspection results, and warehouse stock putaway.</p>
            </div>
            <button
              onClick={() => {
                const newGrn: MaterialReceiptGRN = {
                  id: `grn_${Date.now()}`,
                  grnNumber: `GRN-2026-${Math.floor(100 + Math.random() * 900)}`,
                  poNumber: 'PO-2026-0041',
                  supplierName: 'Indus Ginning & Pressing Mills',
                  receivedDate: new Date().toISOString().split('T')[0],
                  warehouseName: 'Faisalabad Main Store',
                  inspectionStatus: 'PENDING_INSPECTION',
                  inspectorName: 'Store Incharge',
                  itemsReceived: [
                    { itemCode: 'RM-COTTON-BALES', itemName: 'Grade-A Raw Cotton Bales (170kg Bale)', orderedQty: 50, receivedQty: 50, qcPassed: false }
                  ],
                  remarks: 'Arrived via truck loader. Awaiting laboratory moisture testing.'
                };
                setMaterialReceipts([newGrn, ...materialReceipts]);
              }}
              className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-md transition-all"
            >
              <Plus className="w-4 h-4" /> Log Inward Shipment (GRN)
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {materialReceipts.map((grn) => (
              <div key={grn.id} className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <span className="text-xs font-mono font-bold text-amber-400">{grn.grnNumber}</span>
                    <h3 className="text-sm font-bold text-slate-100 mt-0.5">{grn.supplierName}</h3>
                  </div>
                  <span className={`px-2.5 py-1 rounded-xl text-xs font-bold border ${
                    grn.inspectionStatus === 'PUT_AWAY' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' :
                    grn.inspectionStatus === 'QUALITY_APPROVED' ? 'bg-blue-500/20 text-blue-300 border-blue-500/30' :
                    'bg-amber-500/20 text-amber-300 border-amber-500/30'
                  }`}>
                    {grn.inspectionStatus}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs text-slate-300">
                  <div><span className="text-slate-500">PO Ref:</span> <span className="font-mono text-purple-300">{grn.poNumber}</span></div>
                  <div><span className="text-slate-500">Received Date:</span> {grn.receivedDate}</div>
                  <div><span className="text-slate-500">Warehouse:</span> {grn.warehouseName}</div>
                  <div><span className="text-slate-500">Inspector:</span> {grn.inspectorName}</div>
                </div>

                <div className="space-y-2 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Items Received & QC Status</span>
                  {grn.itemsReceived.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs py-1 border-b border-slate-900 last:border-0">
                      <div>
                        <div className="font-bold text-slate-200">{item.itemName}</div>
                        <div className="text-[10px] font-mono text-slate-400">{item.itemCode} | Ordered: {item.orderedQty} | Received: {item.receivedQty}</div>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        item.qcPassed ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                      }`}>
                        {item.qcPassed ? 'QC PASSED' : 'PENDING QC'}
                      </span>
                    </div>
                  ))}
                </div>

                <p className="text-xs text-slate-400 bg-slate-950/40 p-2.5 rounded-xl border border-slate-900/50 italic">
                  "{grn.remarks}"
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-TAB 4: SUPPLIER DIRECTORY */}
      {activeSubTab === 'suppliers' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-base font-bold text-slate-100">Approved Vendor & Supplier Directory</h2>
              <p className="text-xs text-slate-400">Manage supplier tax NTN/STRN profiles, contact details, and performance ratings.</p>
            </div>
          </div>

          <DataTable
            title="Registered Suppliers"
            data={suppliers}
            columns={[
              { key: 'name', header: 'Supplier Name', accessor: (s) => <span className="font-bold text-slate-100">{s.name}</span>, sortable: true },
              { key: 'category', header: 'Category', accessor: (s) => s.category },
              { key: 'ntn', header: 'NTN Number', accessor: (s) => <span className="font-mono text-amber-400">{s.ntn}</span> },
              { key: 'strn', header: 'STRN Number', accessor: (s) => <span className="font-mono text-purple-300">{s.strn}</span> },
              { key: 'contact', header: 'Phone Contact', accessor: (s) => s.contact },
              { key: 'rating', header: 'Vendor Rating', accessor: (s) => (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {s.rating}
                </span>
              )}
            ]}
          />
        </div>
      )}

      {/* QR Scanner Modal */}
      <QrScannerModal
        isOpen={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
        onItemScanned={handleItemScanned}
      />

      {/* Document Scanner Modal */}
      <DocumentScannerModal
        isOpen={isDocScannerOpen}
        onClose={() => setIsDocScannerOpen(false)}
        onScanComplete={(parsed: any) => {
          setIsDocScannerOpen(false);
        }}
      />
    </div>
  );
};
