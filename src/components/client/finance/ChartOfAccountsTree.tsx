import React, { useState } from 'react';
import {
  ChevronRight,
  ChevronDown,
  Plus,
  Edit3,
  Trash2,
  FolderTree
} from 'lucide-react';

export interface AccountNode {
  id: string;
  code: string;
  name: string;
  category: 'Asset' | 'Liability' | 'Equity' | 'Revenue' | 'Expense';
  tier: 1 | 2 | 3 | 4 | 5; // 1: Group, 2: Main, 3: Sub, 4: Child, 5: Cost Centre
  parentId?: string;
  normalBalance: 'Debit' | 'Credit';
  balance: number;
  status: 'Active' | 'Inactive';
  isSystem?: boolean;
  children?: AccountNode[];
}

interface ChartOfAccountsTreeProps {
  accounts: AccountNode[];
  onAddChild: (parent: AccountNode) => void;
  onEdit: (node: AccountNode) => void;
  onDelete: (nodeId: string) => void;
  searchQuery?: string;
  selectedCategory?: string;
}

export const ChartOfAccountsTree: React.FC<ChartOfAccountsTreeProps> = ({
  accounts,
  onAddChild,
  onEdit,
  onDelete,
  searchQuery = '',
  selectedCategory = 'All'
}) => {
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({
    grp_1: true,
    main_11: true,
    sub_111: true,
    grp_2: true,
    main_21: true,
    grp_3: true,
    grp_4: true,
    main_41: true,
    grp_5: true,
    main_51: true
  });

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
    1: 'Group',
    2: 'Main',
    3: 'Sub',
    4: 'Child',
    5: 'Cost Centre'
  };

  // 5-tier recursive rendering logic
  const renderNode = (node: AccountNode) => {
    const isExpanded = expandedNodes[node.id];
    const hasChildren = node.children && node.children.length > 0;
    const indentPx = (node.tier - 1) * 24;

    // Search filter
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const matches = node.name.toLowerCase().includes(q) || node.code.toLowerCase().includes(q);
      if (!matches && !hasChildren) return null;
    }

    // Category filter
    if (selectedCategory !== 'All' && node.category !== selectedCategory && node.tier === 1) {
      return null;
    }

    return (
      <div key={node.id} className="select-none">
        <div 
          className="flex items-center justify-between py-2.5 px-3 hover:bg-slate-800/70 border-b border-slate-800/60 transition-colors group text-xs"
          style={{ paddingLeft: `${indentPx + 12}px` }}
        >
          <div className="flex items-center gap-2.5 min-w-0">
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
            <span className="font-mono font-bold text-cyan-400 shrink-0">{node.code}</span>
            <span className="font-bold text-slate-100 truncate">{node.name}</span>
            <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border uppercase tracking-wider ${tierBadgeColors[node.tier]}`}>
              Tier {node.tier}: {tierNames[node.tier]}
            </span>
          </div>

          <div className="flex items-center gap-4 shrink-0">
            <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${node.normalBalance === 'Debit' ? 'bg-blue-500/10 text-blue-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
              {node.normalBalance}
            </span>
            <span className="font-mono font-bold text-slate-200">
              Rs. {node.balance.toLocaleString()}
            </span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${node.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
              {node.status}
            </span>

            {/* Inline Action Buttons */}
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              {node.tier < 5 && (
                <button
                  onClick={() => onAddChild(node)}
                  title="Add Sub-Account"
                  className="p-1.5 rounded-lg bg-slate-800 text-cyan-400 hover:bg-cyan-500 hover:text-white transition cursor-pointer flex items-center gap-1 text-[10px] font-bold px-2"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Child</span>
                </button>
              )}
              <button
                onClick={() => onEdit(node)}
                title="Edit Account"
                className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white transition cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
              </button>
              {!node.isSystem && node.tier > 1 && (
                <button
                  onClick={() => onDelete(node.id)}
                  title="Delete Account"
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
        <span>Account Structure &amp; 5-Tier Hierarchy</span>
        <span>Normal Balance &amp; Balance</span>
      </div>

      <div className="divide-y divide-slate-800/40">
        {accounts.map(acc => renderNode(acc))}
      </div>
    </div>
  );
};
