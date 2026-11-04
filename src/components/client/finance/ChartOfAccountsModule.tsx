import React, { useState } from 'react';
import {
  FolderTree,
  Plus,
  Search,
  AlertCircle
} from 'lucide-react';
import { ChartOfAccountsTree, AccountNode } from './ChartOfAccountsTree';

const INITIAL_COA: AccountNode[] = [
  {
    id: 'grp_1',
    code: '10000',
    name: '1. ASSETS',
    category: 'Asset',
    tier: 1,
    normalBalance: 'Debit',
    balance: 45800000,
    status: 'Active',
    isSystem: true,
    children: [
      {
        id: 'main_11',
        code: '11000',
        name: '1.1 Current Assets',
        category: 'Asset',
        tier: 2,
        parentId: 'grp_1',
        normalBalance: 'Debit',
        balance: 28500000,
        status: 'Active',
        isSystem: true,
        children: [
          {
            id: 'sub_111',
            code: '11100',
            name: '1.1.1 Cash & Bank Accounts',
            category: 'Asset',
            tier: 3,
            parentId: 'main_11',
            normalBalance: 'Debit',
            balance: 12500000,
            status: 'Active',
            children: [
              {
                id: 'child_1111',
                code: '11110',
                name: '1.1.1.1 HBL Main Branch (PKR)',
                category: 'Asset',
                tier: 4,
                parentId: 'sub_111',
                normalBalance: 'Debit',
                balance: 8200000,
                status: 'Active',
                children: [
                  {
                    id: 'cc_11111',
                    code: '11111-HQ',
                    name: 'HQ Operations Cost Centre',
                    category: 'Asset',
                    tier: 5,
                    parentId: 'child_1111',
                    normalBalance: 'Debit',
                    balance: 8200000,
                    status: 'Active'
                  }
                ]
              },
              {
                id: 'child_1112',
                code: '11120',
                name: '1.1.1.2 Meezan Bank Operational',
                category: 'Asset',
                tier: 4,
                parentId: 'sub_111',
                normalBalance: 'Debit',
                balance: 4300000,
                status: 'Active'
              }
            ]
          },
          {
            id: 'sub_112',
            code: '11200',
            name: '1.1.2 Accounts Receivable',
            category: 'Asset',
            tier: 3,
            parentId: 'main_11',
            normalBalance: 'Debit',
            balance: 16000000,
            status: 'Active',
            children: [
              {
                id: 'child_1121',
                code: '11210',
                name: '1.1.2.1 Trade Debtors (Local)',
                category: 'Asset',
                tier: 4,
                parentId: 'sub_112',
                normalBalance: 'Debit',
                balance: 16000000,
                status: 'Active'
              }
            ]
          }
        ]
      },
      {
        id: 'main_12',
        code: '12000',
        name: '1.2 Non-Current & Fixed Assets',
        category: 'Asset',
        tier: 2,
        parentId: 'grp_1',
        normalBalance: 'Debit',
        balance: 17300000,
        status: 'Active',
        isSystem: true,
        children: [
          {
            id: 'sub_121',
            code: '12100',
            name: '1.2.1 Plant, Machinery & Equipment',
            category: 'Asset',
            tier: 3,
            parentId: 'main_12',
            normalBalance: 'Debit',
            balance: 12000000,
            status: 'Active'
          },
          {
            id: 'sub_122',
            code: '12200',
            name: '1.2.2 IT Hardware & Software',
            category: 'Asset',
            tier: 3,
            parentId: 'main_12',
            normalBalance: 'Debit',
            balance: 5300000,
            status: 'Active'
          }
        ]
      }
    ]
  },
  {
    id: 'grp_2',
    code: '20000',
    name: '2. LIABILITIES',
    category: 'Liability',
    tier: 1,
    normalBalance: 'Credit',
    balance: 18400000,
    status: 'Active',
    isSystem: true,
    children: [
      {
        id: 'main_21',
        code: '21000',
        name: '2.1 Current Liabilities',
        category: 'Liability',
        tier: 2,
        parentId: 'grp_2',
        normalBalance: 'Credit',
        balance: 18400000,
        status: 'Active',
        children: [
          {
            id: 'sub_211',
            code: '21100',
            name: '2.1.1 Accounts Payable & Suppliers',
            category: 'Liability',
            tier: 3,
            parentId: 'main_21',
            normalBalance: 'Credit',
            balance: 14200000,
            status: 'Active',
            children: [
              {
                id: 'child_2111',
                code: '21110',
                name: '2.1.1.1 Trade Creditors (Local)',
                category: 'Liability',
                tier: 4,
                parentId: 'sub_211',
                normalBalance: 'Credit',
                balance: 14200000,
                status: 'Active'
              }
            ]
          },
          {
            id: 'sub_212',
            code: '21200',
            name: '2.1.2 Accrued Expenses & Taxes',
            category: 'Liability',
            tier: 3,
            parentId: 'main_21',
            normalBalance: 'Credit',
            balance: 4200000,
            status: 'Active'
          }
        ]
      }
    ]
  },
  {
    id: 'grp_3',
    code: '30000',
    name: '3. EQUITY & CAPITAL',
    category: 'Equity',
    tier: 1,
    normalBalance: 'Credit',
    balance: 27400000,
    status: 'Active',
    isSystem: true,
    children: [
      {
        id: 'main_31',
        code: '31000',
        name: '3.1 Share Capital & Retained Earnings',
        category: 'Equity',
        tier: 2,
        parentId: 'grp_3',
        normalBalance: 'Credit',
        balance: 27400000,
        status: 'Active',
        children: [
          {
            id: 'sub_311',
            code: '31100',
            name: '3.1.1 Authorized & Paid-up Capital',
            category: 'Equity',
            tier: 3,
            parentId: 'main_31',
            normalBalance: 'Credit',
            balance: 20000000,
            status: 'Active'
          },
          {
            id: 'sub_312',
            code: '31200',
            name: '3.1.2 Retained Earnings',
            category: 'Equity',
            tier: 3,
            parentId: 'main_31',
            normalBalance: 'Credit',
            balance: 7400000,
            status: 'Active'
          }
        ]
      }
    ]
  },
  {
    id: 'grp_4',
    code: '40000',
    name: '4. REVENUE & INCOME',
    category: 'Revenue',
    tier: 1,
    normalBalance: 'Credit',
    balance: 62000000,
    status: 'Active',
    isSystem: true,
    children: [
      {
        id: 'main_41',
        code: '41000',
        name: '4.1 Operating Sales & Services',
        category: 'Revenue',
        tier: 2,
        parentId: 'grp_4',
        normalBalance: 'Credit',
        balance: 62000000,
        status: 'Active',
        children: [
          {
            id: 'sub_411',
            code: '41100',
            name: '4.1.1 Finished Goods Sales Revenue',
            category: 'Revenue',
            tier: 3,
            parentId: 'main_41',
            normalBalance: 'Credit',
            balance: 55000000,
            status: 'Active'
          },
          {
            id: 'sub_412',
            code: '41200',
            name: '4.1.2 Technical & Support Services',
            category: 'Revenue',
            tier: 3,
            parentId: 'main_41',
            normalBalance: 'Credit',
            balance: 7000000,
            status: 'Active'
          }
        ]
      }
    ]
  },
  {
    id: 'grp_5',
    code: '50000',
    name: '5. OPERATING EXPENSES',
    category: 'Expense',
    tier: 1,
    normalBalance: 'Debit',
    balance: 34600000,
    status: 'Active',
    isSystem: true,
    children: [
      {
        id: 'main_51',
        code: '51000',
        name: '5.1 Administrative & Personnel Expenses',
        category: 'Expense',
        tier: 2,
        parentId: 'grp_5',
        normalBalance: 'Debit',
        balance: 34600000,
        status: 'Active',
        children: [
          {
            id: 'sub_511',
            code: '51100',
            name: '5.1.1 Salaries, Wages & Benefits',
            category: 'Expense',
            tier: 3,
            parentId: 'main_51',
            normalBalance: 'Debit',
            balance: 24000000,
            status: 'Active'
          },
          {
            id: 'sub_512',
            code: '51200',
            name: '5.1.2 Utilities, Rent & Maintenance',
            category: 'Expense',
            tier: 3,
            parentId: 'main_51',
            normalBalance: 'Debit',
            balance: 10600000,
            status: 'Active'
          }
        ]
      }
    ]
  }
];

export const ChartOfAccountsModule: React.FC = () => {
  const [accounts, setAccounts] = useState<AccountNode[]>(INITIAL_COA);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Modal / Form state for Adding / Editing Account
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<AccountNode | null>(null);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    category: 'Asset' as AccountNode['category'],
    tier: 3 as AccountNode['tier'],
    parentId: '',
    normalBalance: 'Debit' as AccountNode['normalBalance'],
    status: 'Active' as AccountNode['status']
  });
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleOpenAddModal = (parent?: AccountNode) => {
    setEditingAccount(null);
    setFormData({
      code: parent ? `${parent.code}10` : '60000',
      name: '',
      category: parent ? parent.category : 'Expense',
      tier: parent ? (Math.min(5, parent.tier + 1) as AccountNode['tier']) : 1,
      parentId: parent ? parent.id : '',
      normalBalance: parent ? parent.normalBalance : 'Debit',
      status: 'Active'
    });
    setErrorMsg(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (acc: AccountNode) => {
    setEditingAccount(acc);
    setFormData({
      code: acc.code,
      name: acc.name,
      category: acc.category,
      tier: acc.tier,
      parentId: acc.parentId || '',
      normalBalance: acc.normalBalance,
      status: acc.status
    });
    setErrorMsg(null);
    setIsModalOpen(true);
  };

  const handleDeleteAccount = (nodeId: string) => {
    const deleteRecursive = (nodes: AccountNode[]): AccountNode[] => {
      return nodes
        .filter(n => n.id !== nodeId)
        .map(n => ({
          ...n,
          children: n.children ? deleteRecursive(n.children) : []
        }));
    };
    setAccounts(deleteRecursive(accounts));
  };

  const handleSaveAccount = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!formData.code.trim() || !formData.name.trim()) {
      setErrorMsg('Account Code and Account Name are required.');
      return;
    }

    if (editingAccount) {
      const updateRecursive = (nodes: AccountNode[]): AccountNode[] => {
        return nodes.map(n => {
          if (n.id === editingAccount.id) {
            return {
              ...n,
              code: formData.code,
              name: formData.name,
              category: formData.category,
              tier: formData.tier,
              normalBalance: formData.normalBalance,
              status: formData.status
            };
          }
          if (n.children && n.children.length > 0) {
            return { ...n, children: updateRecursive(n.children) };
          }
          return n;
        });
      };
      setAccounts(updateRecursive(accounts));
    } else {
      const newNode: AccountNode = {
        id: `acc_${Date.now()}`,
        code: formData.code,
        name: formData.name,
        category: formData.category,
        tier: formData.tier,
        parentId: formData.parentId || undefined,
        normalBalance: formData.normalBalance,
        balance: 0,
        status: formData.status
      };

      if (!formData.parentId) {
        setAccounts(prev => [...prev, newNode]);
      } else {
        const addRecursive = (nodes: AccountNode[]): AccountNode[] => {
          return nodes.map(n => {
            if (n.id === formData.parentId) {
              return {
                ...n,
                children: [...(n.children || []), newNode]
              };
            }
            if (n.children && n.children.length > 0) {
              return { ...n, children: addRecursive(n.children) };
            }
            return n;
          });
        };
        setAccounts(addRecursive(accounts));
      }
    }

    setIsModalOpen(false);
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20">
            <FolderTree className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase text-cyan-400 tracking-widest font-mono">FINANCE & ACCOUNTS MODULE</span>
              <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 text-[9px] font-bold">5-Tier Hierarchy</span>
            </div>
            <h1 className="text-xl font-black text-white">Chart of Accounts (COA Master)</h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => handleOpenAddModal()}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-cyan-600/20 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Root Account Group</span>
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="text-[10px] font-bold uppercase text-slate-400 font-mono">Total Assets</div>
          <div className="text-lg font-black text-cyan-400 font-mono">Rs. 45,800,000</div>
          <div className="text-[9px] text-slate-500">Active liquid & fixed accounts</div>
        </div>
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="text-[10px] font-bold uppercase text-slate-400 font-mono">Total Liabilities</div>
          <div className="text-lg font-black text-rose-400 font-mono">Rs. 18,400,000</div>
          <div className="text-[9px] text-slate-500">Payables & accrued expenses</div>
        </div>
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="text-[10px] font-bold uppercase text-slate-400 font-mono">Total Revenue</div>
          <div className="text-lg font-black text-emerald-400 font-mono">Rs. 62,000,000</div>
          <div className="text-[9px] text-slate-500">YTD operational earnings</div>
        </div>
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="text-[10px] font-bold uppercase text-slate-400 font-mono">Operating Expenses</div>
          <div className="text-lg font-black text-amber-400 font-mono">Rs. 34,600,000</div>
          <div className="text-[9px] text-slate-500">Personnel & overheads</div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-4 rounded-2xl">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search account code or name..."
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-cyan-500 font-mono"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          {['All', 'Asset', 'Liability', 'Equity', 'Revenue', 'Expense'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                selectedCategory === cat 
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow' 
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* COA Tree Component */}
      <ChartOfAccountsTree
        accounts={accounts}
        onAddChild={handleOpenAddModal}
        onEdit={handleOpenEditModal}
        onDelete={handleDeleteAccount}
        searchQuery={searchQuery}
        selectedCategory={selectedCategory}
      />

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[9999] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h2 className="text-sm font-black text-white uppercase tracking-wider">
                {editingAccount ? 'Edit Account Node' : 'Add New Account'}
              </h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSaveAccount} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-400 mb-1">Account Code</label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  required
                  placeholder="e.g. 11130"
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 font-mono focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-400 mb-1">Account Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder="e.g. Cash in Hand"
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-400 mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-cyan-500"
                  >
                    <option value="Asset">Asset</option>
                    <option value="Liability">Liability</option>
                    <option value="Equity">Equity</option>
                    <option value="Revenue">Revenue</option>
                    <option value="Expense">Expense</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-400 mb-1">Tier Level</label>
                  <select
                    value={formData.tier}
                    onChange={(e) => setFormData({ ...formData, tier: Number(e.target.value) as AccountNode['tier'] })}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-cyan-500 font-mono"
                  >
                    <option value={1}>Tier 1: Group</option>
                    <option value={2}>Tier 2: Main</option>
                    <option value={3}>Tier 3: Sub</option>
                    <option value={4}>Tier 4: Child</option>
                    <option value={5}>Tier 5: Cost Centre</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-400 mb-1">Normal Balance</label>
                  <select
                    value={formData.normalBalance}
                    onChange={(e) => setFormData({ ...formData, normalBalance: e.target.value as any })}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-cyan-500"
                  >
                    <option value="Debit">Debit</option>
                    <option value="Credit">Credit</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-400 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-cyan-500"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold hover:bg-slate-700 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold shadow-lg shadow-cyan-600/30 transition cursor-pointer"
                >
                  {editingAccount ? 'Update Account' : 'Save Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
