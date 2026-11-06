import React, { useState } from 'react';
import {
  ChevronRight,
  ChevronDown,
  Plus,
  Edit3,
  Trash2,
  GripVertical,
  Boxes,
  Tag
} from 'lucide-react';

export interface ItemNode {
  id: string;
  code: string;
  name: string;
  tier: 1 | 2 | 3 | 4 | 5; // 1: Category, 2: Subcategory, 3: Product Line, 4: SKU, 5: Batch/Bin
  parentId?: string;
  uom: string;
  quantity: number;
  unitPrice: number;
  status: 'Active' | 'Inactive';
  children?: ItemNode[];
}

interface ChartOfItemsTreeProps {
  items: ItemNode[];
  onAddChild: (parent: ItemNode) => void;
  onEdit: (node: ItemNode) => void;
  onDelete: (nodeId: string) => void;
  onMoveNode?: (draggedId: string, targetParentId: string) => void;
  searchQuery?: string;
}

export const ChartOfItemsTree: React.FC<ChartOfItemsTreeProps> = ({
  items,
  onAddChild,
  onEdit,
  onDelete,
  onMoveNode,
  searchQuery = ''
}) => {
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({
    cat_1: true,
    sub_11: true,
    prod_111: true,
    cat_2: true,
    sub_21: true
  });

  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dropTargetId, setDropTargetId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedNodes(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const tierBadgeColors = {
    1: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
    2: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
    3: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
    4: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    5: 'bg-amber-500/10 text-amber-400 border-amber-500/30'
  };

  const tierNames = {
    1: 'Category',
    2: 'Subcategory',
    3: 'Product Line',
    4: 'SKU Item',
    5: 'Batch / Bin'
  };

  const renderNode = (node: ItemNode) => {
    const isExpanded = expandedNodes[node.id];
    const hasChildren = node.children && node.children.length > 0;
    const indentPx = (node.tier - 1) * 24;
    const isDropTarget = dropTargetId === node.id;
    const isDragging = draggedId === node.id;
    const totalValuation = node.quantity * node.unitPrice;

    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const matches = node.name.toLowerCase().includes(q) || node.code.toLowerCase().includes(q);
      if (!matches && !hasChildren) return null;
    }

    return (
      <div 
        key={node.id} 
        className={`select-none transition-all ${isDragging ? 'opacity-40' : 'opacity-100'}`}
        draggable={true}
        onDragStart={(e) => {
          e.stopPropagation();
          setDraggedId(node.id);
        }}
        onDragOver={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (draggedId !== node.id) {
            setDropTargetId(node.id);
          }
        }}
        onDragLeave={(e) => {
          e.stopPropagation();
          if (dropTargetId === node.id) {
            setDropTargetId(null);
          }
        }}
        onDrop={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (draggedId && draggedId !== node.id && onMoveNode) {
            onMoveNode(draggedId, node.id);
          }
          setDraggedId(null);
          setDropTargetId(null);
        }}
      >
        <div 
          className={`flex items-center justify-between py-2.5 px-3 border-b border-slate-800/60 transition-all group text-xs ${
            isDropTarget 
              ? 'bg-purple-500/20 border-2 border-purple-400 shadow-lg shadow-purple-500/20 rounded-xl my-1' 
              : 'hover:bg-slate-800/70'
          }`}
          style={{ paddingLeft: `${indentPx + 12}px` }}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="cursor-grab active:cursor-grabbing text-slate-600 hover:text-slate-300 p-0.5">
              <GripVertical className="w-3.5 h-3.5" />
            </div>

            {hasChildren ? (
              <button 
                onClick={() => toggleExpand(node.id)}
                className="p-1 rounded bg-slate-800 text-slate-400 hover:text-white cursor-pointer transition"
              >
                {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
              </button>
            ) : (
              <div className="w-5" />
            )}
            <span className="font-mono font-bold text-purple-400 shrink-0">{node.code}</span>
            <span className="font-bold text-slate-100 truncate">{node.name}</span>
            <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border uppercase tracking-wider ${tierBadgeColors[node.tier]}`}>
              Tier {node.tier}: {tierNames[node.tier]}
            </span>
          </div>

          <div className="flex items-center gap-4 shrink-0">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
              {node.quantity.toLocaleString()} {node.uom}
            </span>
            <span className="font-mono text-slate-300 text-xs">
              Rs. {node.unitPrice.toLocaleString()}
            </span>
            <span className="font-mono font-bold text-emerald-400">
              Rs. {totalValuation.toLocaleString()}
            </span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${node.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
              {node.status}
            </span>

            {/* Inline Action Buttons */}
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              {node.tier < 5 && (
                <button
                  onClick={() => onAddChild(node)}
                  title="Add Sub-Item"
                  className="p-1.5 rounded-lg bg-slate-800 text-purple-400 hover:bg-purple-500 hover:text-white transition cursor-pointer flex items-center gap-1 text-[10px] font-bold px-2"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Child</span>
                </button>
              )}
              <button
                onClick={() => onEdit(node)}
                title="Edit Item"
                className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white transition cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
              </button>
              {node.tier > 1 && (
                <button
                  onClick={() => onDelete(node.id)}
                  title="Delete Item"
                  className="p-1.5 rounded-lg bg-slate-800 text-rose-400 hover:bg-rose-500 hover:text-white transition cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {hasChildren && isExpanded && (
          <div>
            {node.children!.map(child => renderNode(child))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
      <div className="px-6 py-4 border-b border-slate-800 bg-slate-950/50 flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">
        <span>Inventory Item Structure &amp; 5-Tier Hierarchy (Drag &amp; Drop Enabled)</span>
        <span>Stock, Price &amp; Total Valuation</span>
      </div>

      <div className="divide-y divide-slate-800/40 p-2">
        {items.map(item => renderNode(item))}
      </div>
    </div>
  );
};
