import React, { useState } from 'react';
import { Boxes, Plus, QrCode, ScanLine, CheckCircle2, Flame, Layers, AlertTriangle, ArrowUpDown } from 'lucide-react';
import { useAuthTenant } from '../../context/AuthTenantContext';
import { INITIAL_INVENTORY } from '../../services/mockData';
import { InventoryItem } from '../../types/erp';
import { DataTable } from '../common/DataTable';
import { TTSButton } from '../common/TTSButton';
import { QrScannerModal, ScannedItemPayload } from '../common/QrScannerModal';
import { DocumentScannerModal } from '../common/DocumentScannerModal';
import { BatchExpirationHeatmap } from './BatchExpirationHeatmap';

export const InventoryModule: React.FC = () => {
  const { currentCompany } = useAuthTenant();
  const [items, setItems] = useState<InventoryItem[]>(INITIAL_INVENTORY);
  const [activeView, setActiveView] = useState<'heatmap' | 'items' | 'reorder'>('heatmap');
  const [showModal, setShowModal] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [isDocScannerOpen, setIsDocScannerOpen] = useState(false);
  const [scannedAlert, setScannedAlert] = useState<string | null>(null);

  // Form
  const [code, setCode] = useState('RM-PACK-100');
  const [name, setName] = useState('Corrugated Packaging Box (100 Carton)');
  const [category, setCategory] = useState('Packaging');
  const [uom, setUom] = useState('Cartons');
  const [unitPrice, setUnitPrice] = useState(850);
  const [purchasePrice, setPurchasePrice] = useState(650);
  const [currentStock, setCurrentStock] = useState(1500);
  const [batchNumber, setBatchNumber] = useState('BATCH-2026-11X');
  const [expiryDate, setExpiryDate] = useState('2027-11-01');

  const handleItemScanned = (scanned: ScannedItemPayload) => {
    setCode(scanned.code);
    setName(scanned.name);
    if (scanned.category) setCategory(scanned.category);
    if (scanned.uom) setUom(scanned.uom);
    if (scanned.unitPrice > 0) {
      setUnitPrice(scanned.unitPrice);
      setPurchasePrice(Math.round(scanned.unitPrice * 0.75));
    }
    
    setScannedAlert(`Scanned Item: ${scanned.name} (${scanned.code})`);
    setTimeout(() => setScannedAlert(null), 4000);

    // Open add item modal pre-filled
    setShowModal(true);
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    const newItem: InventoryItem = {
      id: `item_${Date.now()}`,
      code,
      name,
      category,
      uom,
      warehouseId: 'wh_lhr_main',
      warehouseName: 'Lahore Central Warehouse',
      unitPrice,
      purchasePrice,
      currentStock,
      reorderLevel: 200,
      batchNumber,
      expiryDate,
      tenantId: currentCompany.tenantId
    };

    setItems([newItem, ...items]);
    setShowModal(false);
  };

  const totalValue = items.reduce((acc, i) => acc + i.currentStock * i.purchasePrice, 0);

  const inventorySpeech = `Inventory and Warehouse management for ${currentCompany.name}. Total active stock items: ${items.length}. Combined warehouse stock valuation: ${totalValue.toLocaleString()} Rupees. QR scanner active.`;

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl font-black text-slate-100 flex items-center gap-2">
            <Boxes className="w-6 h-6 text-purple-400" />
            Inventory & Warehouse Control
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Item Master, Stock Ledgers, Batch/Serial & Expiry Tracking, Warehouses, and QR Barcode Scanner.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <TTSButton text={inventorySpeech} label="Inventory Audio Briefing" />
          <button
            onClick={() => setIsDocScannerOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-900/50 hover:bg-purple-800/50 border border-purple-500/30 text-purple-200 font-bold text-xs transition-all cursor-pointer"
          >
            <ScanLine className="w-4 h-4 text-purple-300" />
            <span>Scan Invoice</span>
          </button>
          <button
            onClick={() => setIsQrModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs transition-all shadow-lg shadow-purple-600/30 cursor-pointer"
          >
            <QrCode className="w-4 h-4 text-cyan-300" />
            <span>Open Camera QR Scanner</span>
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-100 font-bold text-xs transition-all shadow-md cursor-pointer"
          >
            <Plus className="w-4 h-4 text-purple-400" />
            <span>Add Master Item</span>
          </button>
        </div>
      </div>

      {scannedAlert && (
        <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-purple-400" />
            <span>{scannedAlert}</span>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider bg-purple-500/20 px-2 py-0.5 rounded">
            Pre-Filled In Form
          </span>
        </div>
      )}

      {/* ... (rest of the component) */}

      {/* Document Scanner Modal */}
      <DocumentScannerModal
        isOpen={isDocScannerOpen}
        onClose={() => setIsDocScannerOpen(false)}
        onScanComplete={(data) => {
          setScannedAlert('Invoice scanned successfully!');
          console.log('Scanned data:', data);
          setTimeout(() => setScannedAlert(null), 4000);
        }}
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs">
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-xl">
          <span className="text-slate-400 block text-[11px] uppercase">Total Master Items</span>
          <span className="text-2xl font-black text-slate-100">{items.length} SKUs</span>
        </div>
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-xl">
          <span className="text-slate-400 block text-[11px] uppercase">Warehouse Valuation (PKR)</span>
          <span className="text-2xl font-black text-purple-400">Rs. {totalValue.toLocaleString()}</span>
        </div>
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-xl">
          <span className="text-slate-400 block text-[11px] uppercase">Active Warehouses</span>
          <span className="text-2xl font-black text-cyan-400">3 Hubs</span>
        </div>
      </div>

      {/* View Switcher Tabs */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <div className="flex items-center gap-2 p-1 rounded-2xl bg-slate-900 border border-slate-800">
          <button
            onClick={() => setActiveView('heatmap')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeView === 'heatmap'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span>Batch Longevity & Expiry Heatmap</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-rose-500/30 text-rose-300 font-mono border border-rose-500/40">
              D3.js &bull; &le;30d Guard
            </span>
          </button>

          <button
            onClick={() => setActiveView('items')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeView === 'items'
                ? 'bg-slate-800 text-slate-100 shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Boxes className="w-3.5 h-3.5 text-cyan-400" />
            <span>Master Catalog &amp; Balances</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 font-mono">
              {items.length}
            </span>
          </button>

          <button
            onClick={() => setActiveView('reorder')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeView === 'reorder'
                ? 'bg-slate-800 text-slate-100 shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            <span>Reorder Level Alerts</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-mono">
              {items.filter(i => i.currentStock <= i.reorderLevel).length}
            </span>
          </button>
        </div>
      </div>

      {/* View Content */}
      {activeView === 'heatmap' && <BatchExpirationHeatmap />}

      {activeView === 'items' && (
        <DataTable
          title="Master Item Catalog & Stock Balances"
          data={items}
          columns={[
            { key: 'code', header: 'Item Code', accessor: (i) => <span className="font-mono font-bold text-purple-400">{i.code}</span>, sortable: true },
            { key: 'name', header: 'Item Description', accessor: (i) => <span className="font-bold text-slate-100">{i.name}</span>, sortable: true },
            { key: 'category', header: 'Category', accessor: (i) => <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-cyan-300 font-semibold">{i.category}</span>, sortable: true },
            { key: 'batchNumber', header: 'Batch / Lot No', accessor: (i) => <span className="font-mono text-cyan-300 text-xs">{i.batchNumber || 'N/A'}</span> },
            { key: 'expiryDate', header: 'Expiry Date', accessor: (i) => {
              if (!i.expiryDate) return <span className="text-slate-500 text-xs">N/A</span>;
              const exp = new Date(i.expiryDate).getTime();
              const now = new Date().getTime();
              const diffDays = (exp - now) / (1000 * 60 * 60 * 24);
              const isSoon = diffDays >= 0 && diffDays <= 30;
              const isExp = diffDays < 0;
              return (
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  isExp ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' :
                  isSoon ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse' :
                  'bg-slate-800 text-slate-300'
                }`}>
                  {i.expiryDate} {isSoon ? '(Expiring 30d)' : isExp ? '(Expired)' : ''}
                </span>
              );
            }},
            { key: 'uom', header: 'UOM', accessor: (i) => i.uom },
            { key: 'currentStock', header: 'Available Stock', accessor: (i) => (
              <span className={`font-mono font-bold ${i.currentStock <= i.reorderLevel ? 'text-rose-400 animate-pulse' : 'text-emerald-400'}`}>
                {i.currentStock.toLocaleString()} {i.uom}
              </span>
            ), isNumeric: true, sortable: true },
            { key: 'unitPrice', header: 'Sale Price (PKR)', accessor: (i) => <span className="font-mono text-slate-100">Rs. {i.unitPrice.toLocaleString()}</span>, isNumeric: true },
            { key: 'warehouseName', header: 'Location Warehouse', accessor: (i) => <span className="text-slate-400 text-[11px]">{i.warehouseName}</span> }
          ]}
        />
      )}

      {activeView === 'reorder' && (
        <DataTable
          title="Critical Reorder Triggers & Low Stock Alert"
          data={items.filter(i => i.currentStock <= i.reorderLevel)}
          columns={[
            { key: 'code', header: 'Item Code', accessor: (i) => <span className="font-mono font-bold text-rose-400">{i.code}</span>, sortable: true },
            { key: 'name', header: 'Description', accessor: (i) => <span className="font-bold text-slate-100">{i.name}</span>, sortable: true },
            { key: 'currentStock', header: 'Current Balance', accessor: (i) => <span className="font-mono text-rose-400 font-bold">{i.currentStock} {i.uom}</span>, isNumeric: true },
            { key: 'reorderLevel', header: 'Reorder Level', accessor: (i) => <span className="font-mono text-amber-400">{i.reorderLevel} {i.uom}</span>, isNumeric: true },
            { key: 'deficit', header: 'Shortage Deficit', accessor: (i) => <span className="font-mono text-rose-300 font-bold">{(i.reorderLevel - i.currentStock)} {i.uom}</span>, isNumeric: true },
            { key: 'action', header: 'Action', accessor: (i) => (
              <button
                onClick={() => alert(`Generated PO requisition draft for ${i.name}`)}
                className="px-2.5 py-1 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-[11px] font-bold cursor-pointer"
              >
                Create Purchase Requisition
              </button>
            )}
          ]}
        />
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-lg w-full space-y-4 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wider text-purple-400">
                Register New Master Item (Batch & Expiry Tracking)
              </h2>
              <button
                type="button"
                onClick={() => setIsQrModalOpen(true)}
                className="px-2.5 py-1 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-purple-300 font-bold text-[11px] flex items-center gap-1 transition-all"
              >
                <ScanLine className="w-3.5 h-3.5" />
                Scan Item Details
              </button>
            </div>

            <form onSubmit={handleAddItem} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Item Code</label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-100 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Item Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Category</label>
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">UOM (Unit)</label>
                  <input
                    type="text"
                    value={uom}
                    onChange={(e) => setUom(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Batch / Lot Number</label>
                  <input
                    type="text"
                    value={batchNumber}
                    onChange={(e) => setBatchNumber(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-cyan-300 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Expiration Date</label>
                  <input
                    type="date"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-amber-300 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Opening Stock</label>
                  <input
                    type="number"
                    value={currentStock}
                    onChange={(e) => setCurrentStock(Number(e.target.value))}
                    required
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-100 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Cost Price</label>
                  <input
                    type="number"
                    value={purchasePrice}
                    onChange={(e) => setPurchasePrice(Number(e.target.value))}
                    required
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-100 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Sale Price</label>
                  <input
                    type="number"
                    value={unitPrice}
                    onChange={(e) => setUnitPrice(Number(e.target.value))}
                    required
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-100 font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30"
                >
                  Save Master Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QR Code Scanner Modal */}
      <QrScannerModal
        isOpen={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
        onItemScanned={handleItemScanned}
        title="Inventory Master Barcode & QR Scanner"
        moduleContext="INVENTORY"
      />
    </div>
  );
};

