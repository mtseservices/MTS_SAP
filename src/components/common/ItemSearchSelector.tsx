import React, { useState } from 'react';
import { Search, Boxes, Check, Eye, EyeOff } from 'lucide-react';
import { INITIAL_INVENTORY } from '../../services/mockData';
import { InventoryItem } from '../../types/erp';

interface ItemSearchSelectorProps {
  onSelectItem: (item: InventoryItem) => void;
  selectedItemCode?: string;
  selectedItemName?: string;
  placeholder?: string;
  customInventoryList?: InventoryItem[];
}

export const ItemSearchSelector: React.FC<ItemSearchSelectorProps> = ({
  onSelectItem,
  selectedItemCode,
  selectedItemName,
  placeholder = 'Type Item Code or Item Name to search...',
  customInventoryList
}) => {
  const inventoryList = customInventoryList && customInventoryList.length > 0 ? customInventoryList : INITIAL_INVENTORY;

  const [searchQuery, setSearchQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [showZeroBalance, setShowZeroBalance] = useState(false);

  // Filter items by search query (Code OR Name) AND Zero Balance condition
  const filteredItems = inventoryList.filter((item) => {
    // Zero balance filter (Hide zero balance items by default)
    if (!showZeroBalance && item.currentStock <= 0) {
      return false;
    }

    if (!searchQuery.trim()) return true;

    const query = searchQuery.toLowerCase().trim();
    const matchCode = item.code.toLowerCase().includes(query);
    const matchName = item.name.toLowerCase().includes(query);
    const matchCategory = item.category.toLowerCase().includes(query);

    return matchCode || matchName || matchCategory;
  });

  const handleSelect = (item: InventoryItem) => {
    onSelectItem(item);
    setSearchQuery(`${item.code} - ${item.name}`);
    setIsOpen(false);
  };

  return (
    <div className="relative w-full space-y-1">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold text-slate-300">
          Search Item (Code or Name)
        </label>
        <button
          type="button"
          onClick={() => setShowZeroBalance(!showZeroBalance)}
          className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded transition-all ${
            showZeroBalance
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
              : 'bg-slate-800 text-slate-400 border border-slate-700'
          }`}
          title="Toggle visibility of items with zero stock balance"
        >
          {showZeroBalance ? <Eye className="w-3 h-3 text-amber-400" /> : <EyeOff className="w-3 h-3 text-slate-400" />}
          {showZeroBalance ? 'Zero Stock Shown' : 'Zero Stock Hidden'}
        </button>
      </div>

      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
          <Search className="w-4 h-4" />
        </div>
        <input
          type="text"
          value={searchQuery || (selectedItemCode ? `${selectedItemCode} - ${selectedItemName}` : '')}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="w-full pl-9 pr-8 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-cyan-500 font-medium"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setIsOpen(true);
            }}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-200 text-xs font-bold"
          >
            ✕
          </button>
        )}
      </div>

      {/* Dropdown Items Grid Table */}
      {isOpen && (
        <div className="absolute z-50 mt-1 w-full bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden max-h-72 overflow-y-auto animate-in fade-in zoom-in-95">
          <div className="p-2 bg-slate-800/90 border-b border-slate-700 text-[10px] uppercase font-bold text-slate-400 flex justify-between items-center">
            <span className="flex items-center gap-1 text-cyan-400">
              <Boxes className="w-3.5 h-3.5" />
              Item Code & Description Table ({filteredItems.length} Available)
            </span>
            <span className="text-slate-400">
              {showZeroBalance ? 'All SKUs' : 'Excludes Zero Stock Items'}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left text-slate-200">
              <thead className="bg-slate-800 text-[10px] text-slate-400 font-mono uppercase">
                <tr>
                  <th className="p-2 pl-3">Item Code</th>
                  <th className="p-2">Item Name / Description</th>
                  <th className="p-2">Category</th>
                  <th className="p-2 text-right">Current Stock</th>
                  <th className="p-2 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-4 text-center text-slate-400 text-xs italic">
                      No matching items found. Try enabling "Zero Stock Shown" or checking search terms.
                    </td>
                  </tr>
                ) : (
                  filteredItems.map((item) => {
                    const isSelected = item.code === selectedItemCode;
                    return (
                      <tr
                        key={item.id}
                        onClick={() => handleSelect(item)}
                        className={`hover:bg-slate-800/80 cursor-pointer transition-colors ${
                          isSelected ? 'bg-cyan-950/40 font-bold border-l-2 border-cyan-500' : ''
                        }`}
                      >
                        <td className="p-2 pl-3 font-mono font-bold text-cyan-400 whitespace-nowrap">
                          {item.code}
                        </td>
                        <td className="p-2 text-slate-100 font-medium max-w-xs truncate">
                          {item.name}
                        </td>
                        <td className="p-2 text-slate-400 text-[11px]">
                          {item.category}
                        </td>
                        <td className="p-2 text-right font-mono font-bold whitespace-nowrap">
                          <span
                            className={
                              item.currentStock > 100
                                ? 'text-emerald-400'
                                : item.currentStock > 0
                                ? 'text-amber-400'
                                : 'text-rose-400'
                            }
                          >
                            {item.currentStock.toLocaleString()} {item.uom}
                          </span>
                        </td>
                        <td className="p-2 text-center">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelect(item);
                            }}
                            className="px-2 py-0.5 rounded bg-cyan-600 hover:bg-cyan-500 text-white text-[10px] font-bold shadow"
                          >
                            {isSelected ? <Check className="w-3 h-3 inline" /> : 'Select'}
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
