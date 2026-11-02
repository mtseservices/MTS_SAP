import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  Plus,
  CheckCircle2,
  XCircle,
  Clock,
  Edit2,
  Trash2,
  CreditCard,
  Building2,
  Calendar,
  FileCheck,
  Percent,
  Sliders,
  AlertTriangle,
  Copy,
  Check,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Eye
} from 'lucide-react';
import { useAuthTenant } from '../../context/AuthTenantContext';
import {
  SubscriptionPlan,
  PaymentVerification,
  InstallmentPlan,
  SubscriptionCycle,
  IndustryPackage,
  MasterBankAccount
} from '../../types/erp';
import { DataTable } from '../common/DataTable';
import { TTSButton } from '../common/TTSButton';
import { getMasterBankAccounts, saveMasterBankAccounts } from '../../services/masterBankAccountsService';

export const SubscriptionBillingManager: React.FC = () => {
  const { allCompanies, setAllCompanies } = useAuthTenant();
  const [activeTab, setActiveTab] = useState<'plans' | 'payments' | 'installments' | 'masterAccounts'>('plans');

  // Master Software Receiving Bank Accounts
  const [masterAccounts, setMasterAccounts] = useState<MasterBankAccount[]>([]);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [editingAccount, setEditingAccount] = useState<MasterBankAccount | null>(null);
  const [accountAlert, setAccountAlert] = useState<string | null>(null);

  // Bank Form Fields
  const [bName, setBName] = useState('Meezan Bank Limited');
  const [bTitle, setBTitle] = useState('MTS ERP FUTURE SOLUTIONS (PVT) LIMITED');
  const [bNumber, setBNumber] = useState('');
  const [bIban, setBIban] = useState('');
  const [bBranch, setBBranch] = useState('Main Boulevard Gulberg Branch, Lahore');
  const [bBranchCode, setBBranchCode] = useState('0201');
  const [bSwift, setBSwift] = useState('MEZNPKKA');
  const [bRaastId, setBRaastId] = useState('03001234567');
  const [bIsDefault, setBIsDefault] = useState(false);
  const [bIsActive, setBIsActive] = useState(true);
  const [bInstructions, setBInstructions] = useState('Transfer subscription funds quoting Tenant ID in remarks.');

  useEffect(() => {
    getMasterBankAccounts().then((accounts) => {
      setMasterAccounts(accounts);
    });
  }, []);

  const showAlert = (msg: string) => {
    setAccountAlert(msg);
    setTimeout(() => setAccountAlert(null), 3500);
  };

  // Sample Subscription Plans
  const [plans, setPlans] = useState<SubscriptionPlan[]>([
    {
      id: 'plan_basic_01',
      name: 'Starter Small Business',
      pricePKR: 45000,
      billingCycle: 'Monthly',
      businessCategories: ['Retail & POS', 'Wholesale', 'Services'],
      includedModules: ['Finance', 'Sales', 'Inventory', 'Reports'],
      maxUsers: 10,
      maxBranches: 2,
    },
    {
      id: 'plan_pro_02',
      name: 'Professional Enterprise',
      pricePKR: 120000,
      billingCycle: 'Monthly',
      businessCategories: ['Manufacturing', 'Food & Beverage', 'Solar & Electrical'],
      includedModules: ['Finance', 'Procurement', 'Inventory', 'Sales', 'Production', 'HR', 'Reports'],
      maxUsers: 35,
      maxBranches: 5,
      isPopular: true
    },
    {
      id: 'plan_yearly_03',
      name: 'Annual Group ERP (15% Off)',
      pricePKR: 1100000,
      billingCycle: 'Yearly',
      businessCategories: ['Textile', 'Manufacturing', 'Construction', 'Import & Export'],
      includedModules: ['Finance', 'Procurement', 'Inventory', 'Sales', 'Production', 'HR', 'Form Builder', 'Reports', 'Approvals', 'AI Center'],
      maxUsers: 100,
      maxBranches: 10,
    },
    {
      id: 'plan_onetime_04',
      name: 'One-Time Perpetual Lifetime License',
      pricePKR: 3500000,
      billingCycle: 'One-Time',
      businessCategories: ['Manufacturing', 'Textile', 'Construction', 'Healthcare'],
      includedModules: ['ALL_ERP_MODULES'],
      maxUsers: 250,
      maxBranches: 25,
    }
  ]);

  // Payment Verification Requests
  const [payments, setPayments] = useState<PaymentVerification[]>([
    {
      id: 'pay_001',
      tenantId: 'tenant_albarka',
      companyName: 'Albarka Food Industries',
      planId: 'plan_pro_02',
      planName: 'Professional Enterprise',
      amountPKR: 120000,
      billingCycle: 'Monthly',
      paymentMethod: 'Bank Transfer',
      referenceTxnId: 'MZB-IBFT-991204',
      bankName: 'Meezan Bank Gulberg Branch',
      status: 'VERIFIED',
      date: '2026-10-25',
      verifiedBy: 'Master Admin'
    },
    {
      id: 'pay_002',
      tenantId: 'tenant_solartech',
      companyName: 'SolarTech Power PK',
      planId: 'plan_pro_02',
      planName: 'Professional Enterprise',
      amountPKR: 120000,
      billingCycle: 'Monthly',
      paymentMethod: 'Online Slip',
      referenceTxnId: 'HBL-ONLINE-448102',
      bankName: 'Habib Bank Limited',
      status: 'PENDING',
      date: '2026-10-30'
    }
  ]);

  // Installment Plans
  const [installments, setInstallments] = useState<InstallmentPlan[]>([
    {
      id: 'inst_01',
      tenantId: 'tenant_crest',
      companyName: 'Crest Textile Mills',
      totalAmountPKR: 1200000,
      installmentCount: 4,
      frequency: 'Quarterly',
      createdAt: '2026-09-01',
      schedules: [
        { installmentNo: 1, dueDate: '2026-09-01', amountPKR: 300000, status: 'PAID', paidDate: '2026-09-01' },
        { installmentNo: 2, dueDate: '2026-12-01', amountPKR: 300000, status: 'PENDING' },
        { installmentNo: 3, dueDate: '2027-03-01', amountPKR: 300000, status: 'PENDING' },
        { installmentNo: 4, dueDate: '2027-06-01', amountPKR: 300000, status: 'PENDING' }
      ]
    }
  ]);

  // Plan Edit Modal State
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);

  const [planName, setPlanName] = useState('New Enterprise Tier');
  const [planPrice, setPlanPrice] = useState(85000);
  const [planCycle, setPlanCycle] = useState<SubscriptionCycle>('Monthly');

  const handleSavePlan = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingPlan) {
      setPlans(prev => prev.map(p => p.id === editingPlan.id ? { ...p, name: planName, pricePKR: planPrice, billingCycle: planCycle } : p));
    } else {
      const newPlan: SubscriptionPlan = {
        id: `plan_${Date.now()}`,
        name: planName,
        pricePKR: planPrice,
        billingCycle: planCycle,
        businessCategories: ['Manufacturing', 'Services'],
        includedModules: ['Finance', 'Sales', 'Inventory', 'Reports'],
        maxUsers: 20,
        maxBranches: 3
      };
      setPlans([newPlan, ...plans]);
    }
    setShowPlanModal(false);
    setEditingPlan(null);
  };

  const handleVerifyPayment = (id: string, newStatus: 'VERIFIED' | 'REJECTED') => {
    setPayments(prev => prev.map(p => p.id === id ? { ...p, status: newStatus, verifiedBy: 'Master Admin' } : p));
  };

  const handleOpenAddAccount = () => {
    setEditingAccount(null);
    setBName('Meezan Bank Limited');
    setBTitle('MTS ERP FUTURE SOLUTIONS (PVT) LIMITED');
    setBNumber('02010104889211');
    setBIban('PK36MEZN0002010104889211');
    setBBranch('Main Boulevard Gulberg Branch, Lahore');
    setBBranchCode('0201');
    setBSwift('MEZNPKKA');
    setBRaastId('03001234567');
    setBIsDefault(masterAccounts.length === 0);
    setBIsActive(true);
    setBInstructions('Quote your Tenant ID in the transfer remarks for automatic verification.');
    setShowAccountModal(true);
  };

  const handleOpenEditAccount = (acc: MasterBankAccount) => {
    setEditingAccount(acc);
    setBName(acc.bankName);
    setBTitle(acc.accountTitle);
    setBNumber(acc.accountNumber);
    setBIban(acc.iban);
    setBBranch(acc.branchName);
    setBBranchCode(acc.branchCode || '');
    setBSwift(acc.swiftCode || '');
    setBRaastId(acc.raastId || '');
    setBIsDefault(acc.isDefault || false);
    setBIsActive(acc.isActive);
    setBInstructions(acc.instructions || '');
    setShowAccountModal(true);
  };

  const handleSaveMasterAccountSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let updated: MasterBankAccount[];

    if (editingAccount) {
      updated = masterAccounts.map((a) =>
        a.id === editingAccount.id
          ? {
              ...a,
              bankName: bName,
              accountTitle: bTitle,
              accountNumber: bNumber,
              iban: bIban,
              branchName: bBranch,
              branchCode: bBranchCode,
              swiftCode: bSwift,
              raastId: bRaastId,
              isDefault: bIsDefault,
              isActive: bIsActive,
              instructions: bInstructions
            }
          : bIsDefault ? { ...a, isDefault: false } : a
      );
      showAlert(`Master Account for ${bName} updated and synced to all clients.`);
    } else {
      const newAcc: MasterBankAccount = {
        id: `m_acc_${Date.now()}`,
        bankName: bName,
        accountTitle: bTitle,
        accountNumber: bNumber,
        iban: bIban,
        branchName: bBranch,
        branchCode: bBranchCode,
        swiftCode: bSwift,
        raastId: bRaastId,
        isDefault: bIsDefault,
        isActive: bIsActive,
        instructions: bInstructions,
        createdAt: new Date().toISOString().split('T')[0]
      };
      updated = bIsDefault
        ? [newAcc, ...masterAccounts.map((a) => ({ ...a, isDefault: false }))]
        : [newAcc, ...masterAccounts];
      showAlert(`New Master Account for ${bName} registered and live for client checkout.`);
    }

    setMasterAccounts(updated);
    await saveMasterBankAccounts(updated);
    setShowAccountModal(false);
    setEditingAccount(null);
  };

  const handleDeleteMasterAccount = async (id: string) => {
    const updated = masterAccounts.filter((a) => a.id !== id);
    setMasterAccounts(updated);
    await saveMasterBankAccounts(updated);
    showAlert('Master Bank Account removed from receiving list.');
  };

  const handleToggleAccountActive = async (id: string) => {
    const updated = masterAccounts.map((a) =>
      a.id === id ? { ...a, isActive: !a.isActive } : a
    );
    setMasterAccounts(updated);
    await saveMasterBankAccounts(updated);
    showAlert('Master Account active status toggled.');
  };

  const billingSpeech = `Subscription Billing and Payment Verification Manager. Configured plan tiers: ${plans.length}. Pending payment receipts requiring master verification: ${payments.filter(p => p.status === 'PENDING').length}. Flexible installment schedules active for enterprise clients. Configured receiving bank accounts: ${masterAccounts.length}.`;

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl font-black text-slate-100 flex items-center gap-2">
            <DollarSign className="w-6 h-6 text-purple-400" />
            Subscription Plans, Billing & Installment Engine
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Configure editable pricing tiers (Monthly, Six-Monthly, Yearly, One-Time), verify bank transfer receipts, and build installment plans.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <TTSButton text={billingSpeech} label="Billing Voice Briefing" />
          {activeTab === 'masterAccounts' ? (
            <button
              onClick={handleOpenAddAccount}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-lg shadow-cyan-600/30 transition-all cursor-pointer"
            >
              <Building2 className="w-4 h-4" />
              <span>Add Master Bank Account</span>
            </button>
          ) : (
            <button
              onClick={() => {
                setEditingPlan(null);
                setPlanName('Custom Executive Tier');
                setPlanPrice(95000);
                setShowPlanModal(true);
              }}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create Subscription Plan</span>
            </button>
          )}
        </div>
      </div>

      {accountAlert && (
        <div className="p-3.5 rounded-2xl bg-cyan-950/80 border border-cyan-500/40 text-cyan-200 text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>{accountAlert}</span>
        </div>
      )}

      {/* Sub Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 text-xs font-bold overflow-x-auto">
        <button
          onClick={() => setActiveTab('plans')}
          className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${activeTab === 'plans' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-slate-200 bg-slate-800/60'}`}
        >
          Editable Subscription Plans ({plans.length})
        </button>
        <button
          onClick={() => setActiveTab('payments')}
          className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${activeTab === 'payments' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-slate-200 bg-slate-800/60'}`}
        >
          Payment Verification Desk ({payments.filter(p => p.status === 'PENDING').length} Pending)
        </button>
        <button
          onClick={() => setActiveTab('installments')}
          className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${activeTab === 'installments' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-slate-200 bg-slate-800/60'}`}
        >
          Installment Payment Manager ({installments.length})
        </button>
        <button
          onClick={() => setActiveTab('masterAccounts')}
          className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${activeTab === 'masterAccounts' ? 'bg-cyan-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200 bg-slate-800/60'}`}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>Master Bank Accounts Setup ({masterAccounts.length})</span>
        </button>
      </div>

      {/* Tab 1: Subscription Plans Grid */}
      {activeTab === 'plans' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {plans.map((p) => (
            <div
              key={p.id}
              className={`p-5 rounded-2xl bg-slate-900 border transition-all space-y-4 relative ${
                p.isPopular ? 'border-purple-500 shadow-purple-500/20 shadow-2xl' : 'border-slate-800'
              }`}
            >
              {p.isPopular && (
                <span className="absolute -top-3 right-4 px-2.5 py-0.5 rounded-full bg-purple-600 text-white text-[10px] font-extrabold uppercase tracking-wider shadow">
                  Most Popular
                </span>
              )}

              <div>
                <h3 className="font-bold text-slate-100 text-sm">{p.name}</h3>
                <div className="text-2xl font-black text-purple-400 font-mono mt-1">
                  Rs. {p.pricePKR.toLocaleString()}
                  <span className="text-xs text-slate-400 font-normal"> / {p.billingCycle}</span>
                </div>
              </div>

              <div className="text-xs text-slate-400 space-y-1 font-mono">
                <div>Max Users: <strong className="text-slate-200">{p.maxUsers} Seats</strong></div>
                <div>Max Branches: <strong className="text-slate-200">{p.maxBranches} Hubs</strong></div>
              </div>

              <div className="space-y-1 pt-2 border-t border-slate-800 text-[11px] text-slate-300">
                <div className="font-bold text-slate-400 uppercase text-[10px]">Business Suitability:</div>
                <div className="flex flex-wrap gap-1">
                  {p.businessCategories.map(cat => (
                    <span key={cat} className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-cyan-300">
                      {cat}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                <button
                  onClick={() => {
                    setEditingPlan(p);
                    setPlanName(p.name);
                    setPlanPrice(p.pricePKR);
                    setPlanCycle(p.billingCycle);
                    setShowPlanModal(true);
                  }}
                  className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1 border border-slate-700"
                >
                  <Edit2 className="w-3.5 h-3.5 text-purple-400" /> Edit Plan
                </button>

                <button
                  onClick={() => setPlans(plans.filter(item => item.id !== p.id))}
                  className="p-1.5 text-rose-400 hover:text-rose-300"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 2: Payment Verification Desk */}
      {activeTab === 'payments' && (
        <DataTable
          title="Incoming Bank Payment Verification Requests"
          data={payments}
          columns={[
            { key: 'companyName', header: 'Client Tenant', accessor: (p) => <span className="font-bold text-slate-100">{p.companyName}</span>, sortable: true },
            { key: 'planName', header: 'Plan Tier', accessor: (p) => <span className="px-2 py-0.5 rounded bg-slate-800 text-purple-300 font-semibold text-[10px]">{p.planName}</span> },
            { key: 'amountPKR', header: 'Amount Paid (PKR)', accessor: (p) => <span className="font-mono font-bold text-emerald-400">Rs. {p.amountPKR.toLocaleString()}</span>, isNumeric: true },
            { key: 'paymentMethod', header: 'Method', accessor: (p) => p.paymentMethod },
            { key: 'referenceTxnId', header: 'Txn / Slip Reference', accessor: (p) => <span className="font-mono text-cyan-300 font-bold">{p.referenceTxnId}</span> },
            { key: 'status', header: 'Verification Status', accessor: (p) => (
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                p.status === 'VERIFIED' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
              }`}>
                {p.status}
              </span>
            )},
            { key: 'actions', header: 'Action', accessor: (p) => p.status === 'PENDING' ? (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleVerifyPayment(p.id, 'VERIFIED')}
                  className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow"
                >
                  Approve
                </button>
                <button
                  onClick={() => handleVerifyPayment(p.id, 'REJECTED')}
                  className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow"
                >
                  Reject
                </button>
              </div>
            ) : (
              <span className="text-slate-500 italic text-[11px]">Verified by {p.verifiedBy}</span>
            )}
          ]}
        />
      )}

      {/* Tab 3: Installments Manager */}
      {activeTab === 'installments' && (
        <div className="space-y-4">
          {installments.map((inst) => (
            <div key={inst.id} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <h3 className="font-bold text-slate-100 text-sm">{inst.companyName} • Installment Schedule</h3>
                  <div className="text-xs text-slate-400 font-mono">
                    Total Enterprise Contract: <strong className="text-purple-300">Rs. {inst.totalAmountPKR.toLocaleString()}</strong> ({inst.installmentCount} {inst.frequency} Payments)
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                {inst.schedules.map((sch) => (
                  <div key={sch.installmentNo} className={`p-3 rounded-xl border text-xs space-y-1 font-mono ${sch.status === 'PAID' ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200' : 'bg-slate-800/60 border-slate-700 text-slate-300'}`}>
                    <div className="flex items-center justify-between font-bold">
                      <span>Installment #{sch.installmentNo}</span>
                      <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold uppercase ${sch.status === 'PAID' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'}`}>
                        {sch.status}
                      </span>
                    </div>
                    <div>Amount: <strong className="text-slate-100">Rs. {sch.amountPKR.toLocaleString()}</strong></div>
                    <div>Due Date: {sch.dueDate}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 4: Master Software Receiving Bank Accounts Setup */}
      {activeTab === 'masterAccounts' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-cyan-400" />
                  Master Software Receiving Accounts (Active on Client Portals)
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Corporate bank accounts registered here are immediately broadcasted to all client enterprise tenants for subscription IBFT/Raast deposits.
                </p>
              </div>

              <button
                onClick={handleOpenAddAccount}
                className="px-3.5 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Bank Account</span>
              </button>
            </div>

            {/* Accounts Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {masterAccounts.map((acc) => (
                <div
                  key={acc.id}
                  className={`p-5 rounded-2xl border transition-all space-y-3 relative flex flex-col justify-between ${
                    acc.isActive
                      ? 'bg-slate-900/90 border-slate-700/80 shadow-xl hover:border-cyan-500/50'
                      : 'bg-slate-900/40 border-slate-800/60 opacity-60'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-100 text-sm">{acc.bankName}</span>
                      <div className="flex items-center gap-1">
                        {acc.isDefault && (
                          <span className="text-[9px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40">
                            Default
                          </span>
                        )}
                        <span
                          className={`text-[9px] px-2 py-0.5 rounded-full font-bold ${
                            acc.isActive
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                              : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                          }`}
                        >
                          {acc.isActive ? 'Active' : 'Disabled'}
                        </span>
                      </div>
                    </div>

                    <div className="text-xs text-slate-300 font-semibold truncate">
                      {acc.accountTitle}
                    </div>

                    <div className="space-y-1 pt-1 font-mono text-xs">
                      <div className="p-2 rounded-lg bg-slate-800/80 border border-slate-700/60 flex items-center justify-between">
                        <div>
                          <span className="text-[9px] text-slate-400 block uppercase">A/C Number</span>
                          <span className="font-bold text-cyan-300">{acc.accountNumber}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-sans">{acc.branchCode}</span>
                      </div>

                      <div className="p-2 rounded-lg bg-slate-800/80 border border-slate-700/60">
                        <span className="text-[9px] text-slate-400 block uppercase">IBAN</span>
                        <span className="font-bold text-emerald-300 text-[11px] break-all">{acc.iban}</span>
                      </div>
                    </div>

                    <div className="text-[11px] text-slate-400 space-y-0.5 pt-1">
                      <div>Branch: <strong className="text-slate-300">{acc.branchName}</strong></div>
                      {acc.raastId && <div>Raast ID: <strong className="text-emerald-400 font-mono">{acc.raastId}</strong></div>}
                      {acc.swiftCode && <div>Swift / BIC: <strong className="text-slate-300 font-mono">{acc.swiftCode}</strong></div>}
                    </div>

                    {acc.instructions && (
                      <p className="text-[10px] text-amber-300/80 bg-amber-500/10 p-2 rounded-lg border border-amber-500/20">
                        {acc.instructions}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-800 text-xs">
                    <button
                      onClick={() => handleToggleAccountActive(acc.id)}
                      className={`text-[11px] font-semibold cursor-pointer ${
                        acc.isActive ? 'text-amber-400 hover:text-amber-300' : 'text-emerald-400 hover:text-emerald-300'
                      }`}
                    >
                      {acc.isActive ? 'Disable Account' : 'Enable Account'}
                    </button>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleOpenEditAccount(acc)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer transition-all"
                        title="Edit Account"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteMasterAccount(acc.id)}
                        className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 cursor-pointer transition-all"
                        title="Delete Account"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Live Client Perspective Watch Preview */}
            <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 to-indigo-950/40 border border-slate-800 space-y-3 mt-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-cyan-400" />
                  <span className="text-xs font-bold text-slate-100 uppercase tracking-wider">
                    Live Client Watch Preview (What Clients See When Paying)
                  </span>
                </div>
                <span className="text-[10px] bg-slate-800 px-2.5 py-0.5 rounded text-cyan-300 font-mono">
                  Real-Time Verified Output
                </span>
              </div>

              <p className="text-xs text-slate-400">
                Whenever client tenants click <strong className="text-slate-200">"Pay Subscription"</strong>, <strong className="text-slate-200">"Upgrade during Trial"</strong>, or choose <strong className="text-slate-200">"Bank Transfer / IBFT"</strong>, these exact verified corporate accounts are rendered with one-click copy and instant verification.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Edit Plan Modal */}
      {showPlanModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl animate-in zoom-in-95">
            <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wider text-purple-400">
              {editingPlan ? 'Edit Subscription Plan' : 'Create New Subscription Plan'}
            </h2>

            <form onSubmit={handleSavePlan} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Plan Name</label>
                <input
                  type="text"
                  value={planName}
                  onChange={(e) => setPlanName(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Price in PKR</label>
                <input
                  type="number"
                  value={planPrice}
                  onChange={(e) => setPlanPrice(Number(e.target.value))}
                  required
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-100 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Billing Cycle</label>
                <select
                  value={planCycle}
                  onChange={(e) => setPlanCycle(e.target.value as SubscriptionCycle)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-100"
                >
                  <option value="Monthly">Monthly</option>
                  <option value="Six-Monthly">Six-Monthly (Bi-Annual)</option>
                  <option value="Yearly">Yearly (Annual)</option>
                  <option value="One-Time">One-Time Lifetime Perpetual</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPlanModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 cursor-pointer"
                >
                  Save Subscription Plan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add / Edit Master Bank Account Modal */}
      {showAccountModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-lg w-full space-y-4 shadow-2xl animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="border-b border-slate-800 pb-3">
              <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wider text-cyan-400">
                {editingAccount ? 'Edit Master Receiving Bank Account' : 'Register Master Receiving Bank Account'}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Saved bank accounts are immediately available for client subscription transfers.
              </p>
            </div>

            <form onSubmit={handleSaveMasterAccountSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Bank Name</label>
                <input
                  type="text"
                  placeholder="e.g. Meezan Bank Limited, HBL, Bank Alfalah"
                  value={bName}
                  onChange={(e) => setBName(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-100 font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Account Title (Beneficiary Name)</label>
                <input
                  type="text"
                  value={bTitle}
                  onChange={(e) => setBTitle(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-100 font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Account Number</label>
                  <input
                    type="text"
                    placeholder="02010104889211"
                    value={bNumber}
                    onChange={(e) => setBNumber(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-cyan-300 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">IBAN (24 Characters)</label>
                  <input
                    type="text"
                    placeholder="PK36MEZN0002010104889211"
                    value={bIban}
                    onChange={(e) => setBIban(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-emerald-300 font-mono font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Branch Name</label>
                  <input
                    type="text"
                    value={bBranch}
                    onChange={(e) => setBBranch(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Branch Code</label>
                  <input
                    type="text"
                    value={bBranchCode}
                    onChange={(e) => setBBranchCode(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-100 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Swift / BIC Code</label>
                  <input
                    type="text"
                    value={bSwift}
                    onChange={(e) => setBSwift(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-100 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Raast ID / Till No</label>
                  <input
                    type="text"
                    value={bRaastId}
                    onChange={(e) => setBRaastId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-emerald-300 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Instructions for Clients</label>
                <textarea
                  rows={2}
                  value={bInstructions}
                  onChange={(e) => setBInstructions(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-100"
                />
              </div>

              <div className="flex items-center gap-4 pt-1 text-xs">
                <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                  <input
                    type="checkbox"
                    checked={bIsDefault}
                    onChange={(e) => setBIsDefault(e.target.checked)}
                    className="rounded bg-slate-800 border-slate-700 text-cyan-500"
                  />
                  <span>Set as Default Account</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                  <input
                    type="checkbox"
                    checked={bIsActive}
                    onChange={(e) => setBIsActive(e.target.checked)}
                    className="rounded bg-slate-800 border-slate-700 text-emerald-500"
                  />
                  <span>Account Active for Checkout</span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAccountModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-lg shadow-cyan-600/30 cursor-pointer"
                >
                  Save Master Bank Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
