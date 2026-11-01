import React, { useState } from 'react';
import { Boxes, Plus, AlertTriangle, CheckCircle2, Warehouse, Tag } from 'lucide-react';
import { useAuthTenant } from '../../context/AuthTenantContext';
import { INITIAL_INVENTORY } from '../../services/mockData';
import { InventoryItem } from '../../types/erp';
import { DataTable } from '../common/DataTable';
import { TTSButton } from '../common/TTSButton';

export const InventoryModule: React.FC = () => {
  const { currentCompany } = useAuthTenant();
  const [items, setItems] = useState<InventoryItem[]>(INITIAL_INVENTORY);
  const [showModal, setShowModal] = useState(false);

  // Form
  const [code, setCode] = useState('RM-PACK-100');
  const [name, setName] = useState('Corrugated Packaging Box (100 Carton)');
  const [category, setCategory] = useState('Packaging');
  const [uom, setUom] = useState('Cartons');
  const [unitPrice, setUnitPrice] = useState(850);
  const [purchasePrice, setPurchasePrice] = useState(650);
  const [currentStock, setCurrentStock] = useState(1500);

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
      tenantId: currentCompany.tenantId
    };

    setItems([newItem, ...items]);
    setShowModal(false);
  };

  const totalValue = items.reduce((acc, i) => acc + i.currentStock * i.purchasePrice, 0);

  const inventorySpeech = `Inventory and Warehouse management for ${currentCompany.name}. Total active stock items: ${items.length}. Combined warehouse stock valuation: ${totalValue.toLocaleString()} Rupees. Reorder warnings monitored in real time.`;

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl font-black text-slate-100 flex items-center gap-2">
            <Boxes className="w-6 h-6 text-purple-400" />
            Inventory & Warehouse Control
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Item Master, Stock Ledgers, Batch/Serial & Expiry Tracking, Warehouses, and Automated Reorder Level Alerts.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <TTSButton text={inventorySpeech} label="Inventory Audio Briefing" />
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 transition-all"
          >
            <Plus className="w-4 h-4" />
            Add Master Item
          </button>
        </div>
      </div>

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

      <DataTable
        title="Master Item Catalog & Stock Balances"
        data={items}
        columns={[
          { key: 'code', header: 'Item Code', accessor: (i) => <span className="font-mono font-bold text-purple-400">{i.code}</span>, sortable: true },
          { key: 'name', header: 'Item Description', accessor: (i) => <span className="font-bold text-slate-100">{i.name}</span>, sortable: true },
          { key: 'category', header: 'Category', accessor: (i) => <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-cyan-300 font-semibold">{i.category}</span>, sortable: true },
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

      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-lg w-full space-y-4 shadow-2xl animate-in fade-in zoom-in-95">
            <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wider text-purple-400">
              Register New Master Item
            </h2>

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
    </div>
  );
};
