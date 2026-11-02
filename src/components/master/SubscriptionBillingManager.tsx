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
  Eye,
  Search,
  Filter,
  Receipt,
  FileText,
  RefreshCw,
  UserCheck,
  ShieldAlert,
  BadgeCheck,
  Users,
  Printer,
  Download,
  X
} from 'lucide-react';
import { useAuthTenant } from '../../context/AuthTenantContext';
import {
  SubscriptionPlan,
  PaymentVerification,
  InstallmentPlan,
  SubscriptionCycle,
  IndustryPackage,
  MasterBankAccount,
  ClientCompany
} from '../../types/erp';
import { DataTable } from '../common/DataTable';
import { TTSButton } from '../common/TTSButton';
import { getMasterBankAccounts, saveMasterBankAccounts } from '../../services/masterBankAccountsService';

export const SubscriptionBillingManager: React.FC = () => {
  const { allCompanies, setAllCompanies, updateCompanySubscription } = useAuthTenant();
  const [activeTab, setActiveTab] = useState<'signups' | 'plans' | 'payments' | 'installments' | 'masterAccounts'>('signups');

  // Signups Ledger Search & Filter
  const [signupSearch, setSignupSearch] = useState('');
  const [signupFilter, setSignupFilter] = useState<'ALL' | 'PAID' | 'PENDING' | 'TRIAL' | 'OVERDUE'>('ALL');

  // Payment Verification & Record Modal for Company
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [selectedCompanyForPayment, setSelectedCompanyForPayment] = useState<ClientCompany | null>(null);
  const [vAmount, setVAmount] = useState<number>(120000);
  const [vMethod, setVMethod] = useState<string>('Meezan Bank IBFT');
  const [vTxnId, setVTxnId] = useState<string>('');
  const [vPlan, setVPlan] = useState<string>('Professional Enterprise');
  const [vCycle, setVCycle] = useState<SubscriptionCycle>('Monthly');
  const [vDays, setVDays] = useState<number>(30);

  // Official Tax Invoice Modal
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [invoiceCompany, setInvoiceCompany] = useState<ClientCompany | null>(null);

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
      smsQuota: 500,
      whatsappAlertsEnabled: false,
      vendorPortalLogins: 0,
      customLayoutThemes: false,
      supportedThemeModes: ['light', 'slate-gray']
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
      isPopular: true,
      smsQuota: 5000,
      whatsappAlertsEnabled: true,
      vendorPortalLogins: 50,
      customLayoutThemes: true,
      supportedThemeModes: ['light', 'slate-gray', 'dark']
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
      smsQuota: 25000,
      whatsappAlertsEnabled: true,
      vendorPortalLogins: 250,
      customLayoutThemes: true,
      supportedThemeModes: ['light', 'slate-gray', 'dark']
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
      smsQuota: 100000,
      whatsappAlertsEnabled: true,
      vendorPortalLogins: 1000,
      customLayoutThemes: true,
      supportedThemeModes: ['light', 'slate-gray', 'dark']
    }
  ]);

  // Payment Verification Requests
  const [payments, setPayments] = useState<PaymentVerification[]>([
    {
      id: 'pay_001',
      tenantId: 'tenant_crest',
      companyName: 'Crest Textile Mills Ltd',
      planId: 'plan_ent_03',
      planName: 'Enterprise Custom',
      amountPKR: 450000,
      billingCycle: 'Yearly',
      paymentMethod: 'Bank Transfer',
      referenceTxnId: 'MZB-IBFT-991204',
      bankName: 'Meezan Bank Gulberg Branch',
      status: 'VERIFIED',
      date: '2026-10-25',
      verifiedBy: 'Master Admin'
    },
    {
      id: 'pay_002',
      tenantId: 'tenant_crest',
      companyName: 'Crest Textile Mills Ltd',
      planId: 'plan_ent_03',
      planName: 'Enterprise Custom',
      amountPKR: 150000,
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
        maxBranches: 3,
        smsQuota: 1000,
        whatsappAlertsEnabled: false,
        vendorPortalLogins: 10,
        customLayoutThemes: false,
        supportedThemeModes: ['light', 'slate-gray']
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

  // Master action to open Verify/Record Payment Modal
  const handleOpenVerifyModal = (comp: ClientCompany) => {
    setSelectedCompanyForPayment(comp);
    setVAmount(comp.lastPaymentAmount && comp.lastPaymentAmount > 0 ? comp.lastPaymentAmount : 120000);
    setVMethod(comp.lastPaymentMethod || 'Meezan Bank IBFT');
    setVTxnId(comp.lastPaymentTxnId || `MZB-${Date.now().toString().slice(-6)}`);
    setVPlan(comp.subscriptionPlan || 'Professional Enterprise');
    setVCycle((comp.subscriptionCycle as SubscriptionCycle) || 'Monthly');
    setVDays(comp.subscriptionCycle === 'Yearly' ? 365 : 30);
    setShowVerifyModal(true);
  };

  // Save Verified Payment
  const handleSaveVerifiedPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCompanyForPayment) return;

    const expiresAt = new Date(Date.now() + vDays * 24 * 60 * 60 * 1000).toISOString();
    await updateCompanySubscription(selectedCompanyForPayment.id, {
      plan: vPlan,
      cycle: vCycle,
      status: 'ACTIVE',
      expiresAt,
      daysRemaining: vDays,
      paymentMethod: vMethod,
      amount: Number(vAmount),
      txnId: vTxnId || `MTS-VERIFIED-${Date.now().toString().slice(-6)}`,
      paymentStatus: 'PAID'
    });

    showAlert(`Payment of Rs. ${Number(vAmount).toLocaleString()} verified for ${selectedCompanyForPayment.name}. Subscription active for ${vDays} days.`);
    setShowVerifyModal(false);
    setSelectedCompanyForPayment(null);
  };

  // Extend Trial
  const handleExtendTrial = async (comp: ClientCompany, daysToAdd: number) => {
    const currentDays = comp.trialDaysRemaining || 0;
    const newDays = currentDays + daysToAdd;
    const expiresAt = new Date(Date.now() + newDays * 24 * 60 * 60 * 1000).toISOString();

    await updateCompanySubscription(comp.id, {
      plan: comp.subscriptionPlan || 'Enterprise Trial',
      cycle: comp.subscriptionCycle || 'Monthly',
      status: 'ACTIVE',
      expiresAt,
      daysRemaining: newDays,
      paymentMethod: comp.lastPaymentMethod || 'Trial Extension',
      amount: comp.lastPaymentAmount || 0,
      txnId: comp.lastPaymentTxnId || `TRIAL-EXT-${Date.now().toString().slice(-4)}`,
      paymentStatus: comp.paymentStatus === 'PAID' ? 'PAID' : 'TRIAL'
    });

    showAlert(`Added +${daysToAdd} trial days to ${comp.name}. Total active days remaining: ${newDays}.`);
  };

  // Toggle Company Status (ACTIVE / SUSPENDED)
  const handleToggleCompanyStatus = async (comp: ClientCompany) => {
    const newStatus = comp.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    await updateCompanySubscription(comp.id, {
      plan: comp.subscriptionPlan,
      cycle: comp.subscriptionCycle || 'Monthly',
      status: newStatus,
      expiresAt: comp.subscriptionExpiresAt || new Date().toISOString(),
      daysRemaining: comp.trialDaysRemaining || 0,
      paymentMethod: comp.lastPaymentMethod || 'System',
      amount: comp.lastPaymentAmount || 0,
      txnId: comp.lastPaymentTxnId || 'STATUS-TOGGLE',
      paymentStatus: comp.paymentStatus || 'TRIAL'
    });
    showAlert(`Company ${comp.name} status updated to ${newStatus}.`);
  };

  // Open Official Tax Invoice
  const handleOpenInvoice = (comp: ClientCompany) => {
    setInvoiceCompany(comp);
    setShowInvoiceModal(true);
  };

  // Signups Ledger KPIs
  const totalSignupsCount = allCompanies.length;
  const paidCompaniesCount = allCompanies.filter(c => c.paymentStatus === 'PAID' || (c.lastPaymentAmount && c.lastPaymentAmount > 0)).length;
  const pendingPaymentsCount = allCompanies.filter(c => c.paymentStatus === 'PENDING').length;
  const trialCompaniesCount = allCompanies.filter(c => c.paymentStatus === 'TRIAL' || (!c.lastPaymentAmount && c.trialDaysRemaining && c.trialDaysRemaining > 0)).length;
  const realizedRevenuePKR = allCompanies.reduce((acc, c) => acc + (c.lastPaymentAmount || 0), 0);

  // Filtered Signups
  const filteredSignups = allCompanies.filter((comp) => {
    const q = signupSearch.toLowerCase().trim();
    const matchesSearch =
      !q ||
      comp.name.toLowerCase().includes(q) ||
      comp.code.toLowerCase().includes(q) ||
      comp.slug.toLowerCase().includes(q) ||
      (comp.adminName && comp.adminName.toLowerCase().includes(q)) ||
      (comp.adminEmail && comp.adminEmail.toLowerCase().includes(q)) ||
      (comp.ntn && comp.ntn.includes(q)) ||
      (comp.city && comp.city.toLowerCase().includes(q));

    if (!matchesSearch) return false;

    if (signupFilter === 'ALL') return true;
    if (signupFilter === 'PAID') return comp.paymentStatus === 'PAID' || (comp.lastPaymentAmount && comp.lastPaymentAmount > 0);
    if (signupFilter === 'PENDING') return comp.paymentStatus === 'PENDING';
    if (signupFilter === 'TRIAL') return comp.paymentStatus === 'TRIAL' || (!comp.lastPaymentAmount && comp.trialDaysRemaining && comp.trialDaysRemaining > 0);
    if (signupFilter === 'OVERDUE') return comp.status === 'SUSPENDED' || (comp.trialDaysRemaining !== undefined && comp.trialDaysRemaining <= 0 && comp.paymentStatus !== 'PAID');

    return true;
  });

  const billingSpeech = `Enterprise Signups and Subscriptions Ledger. Total Registered Signups: ${totalSignupsCount}. Paid Subscriptions: ${paidCompaniesCount}. Free Trials: ${trialCompaniesCount}. Pending Payments: ${pendingPaymentsCount}. Total Realized Revenue: Rupees ${realizedRevenuePKR.toLocaleString()}.`;

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl font-black text-slate-100 flex items-center gap-2">
            <DollarSign className="w-6 h-6 text-purple-400" />
            Signups, Subscriptions & Master Billing Desk
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Monitor real-time enterprise client signups, live trial countdowns, paid vs pending payments, and approve bank receipts.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <TTSButton text={billingSpeech} label="Voice Audit" />
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
          onClick={() => setActiveTab('signups')}
          className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${activeTab === 'signups' ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-600/30' : 'text-slate-400 hover:text-slate-200 bg-slate-800/60'}`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Signups & Subscriptions Ledger ({allCompanies.length})</span>
          {pendingPaymentsCount > 0 && (
            <span className="px-1.5 py-0.2 bg-amber-500 text-slate-950 rounded-full text-[10px] font-black animate-pulse">
              {pendingPaymentsCount} Pending
            </span>
          )}
        </button>
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

      {/* Tab 0: Enterprise Signups & Subscriptions Ledger */}
      {activeTab === 'signups' && (
        <div className="space-y-6">
          {/* Top KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5">
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Signups</div>
              <div className="text-2xl font-black text-slate-100 font-mono mt-1">{totalSignupsCount}</div>
              <div className="text-[10px] text-slate-500 mt-0.5">Registered enterprises</div>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/30">
              <div className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Paid Subscriptions
              </div>
              <div className="text-2xl font-black text-emerald-300 font-mono mt-1">{paidCompaniesCount}</div>
              <div className="text-[10px] text-emerald-400/80 mt-0.5">Active paid accounts</div>
            </div>

            <div className="p-4 rounded-2xl bg-cyan-950/40 border border-cyan-500/30">
              <div className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> Free Trials Active
              </div>
              <div className="text-2xl font-black text-cyan-300 font-mono mt-1">{trialCompaniesCount}</div>
              <div className="text-[10px] text-cyan-400/80 mt-0.5">Live countdown active</div>
            </div>

            <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-500/30">
              <div className="text-[11px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" /> Payments Pending
              </div>
              <div className="text-2xl font-black text-amber-300 font-mono mt-1">{pendingPaymentsCount}</div>
              <div className="text-[10px] text-amber-400/80 mt-0.5">Awaiting verification</div>
            </div>

            <div className="p-4 rounded-2xl bg-purple-950/40 border border-purple-500/30 col-span-2 md:col-span-1">
              <div className="text-[11px] font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5" /> Realized Revenue
              </div>
              <div className="text-xl font-black text-purple-300 font-mono mt-1">Rs. {realizedRevenuePKR.toLocaleString()}</div>
              <div className="text-[10px] text-purple-400/80 mt-0.5">Collected in PKR</div>
            </div>
          </div>

          {/* Search Bar & Filter Pills */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search signups by company name, NTN, code, admin contact, email, or city..."
                value={signupSearch}
                onChange={(e) => setSignupSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto text-[11px] font-bold">
              {(['ALL', 'PAID', 'PENDING', 'TRIAL', 'OVERDUE'] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setSignupFilter(filter)}
                  className={`px-3 py-1.5 rounded-xl cursor-pointer transition-all whitespace-nowrap ${
                    signupFilter === filter
                      ? 'bg-purple-600 text-white shadow'
                      : 'bg-slate-800/80 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {filter === 'ALL' && `All (${allCompanies.length})`}
                  {filter === 'PAID' && `Paid (${paidCompaniesCount})`}
                  {filter === 'PENDING' && `Pending (${pendingPaymentsCount})`}
                  {filter === 'TRIAL' && `Trial (${trialCompaniesCount})`}
                  {filter === 'OVERDUE' && 'Overdue'}
                </button>
              ))}
            </div>
          </div>

          {/* Signups Table */}
          <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/90 shadow-xl">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/60 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Enterprise Company</th>
                  <th className="py-3.5 px-4">Signup Admin</th>
                  <th className="py-3.5 px-4">Subscription Tier</th>
                  <th className="py-3.5 px-4">Trial / Expiry Countdown</th>
                  <th className="py-3.5 px-4">Payment Status & Channel</th>
                  <th className="py-3.5 px-4 text-right">Master Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {filteredSignups.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-500">
                      No signups match your current search or filter criteria.
                    </td>
                  </tr>
                ) : (
                  filteredSignups.map((comp) => {
                    const isPaid = comp.paymentStatus === 'PAID' || (comp.lastPaymentAmount && comp.lastPaymentAmount > 0);
                    const isPending = comp.paymentStatus === 'PENDING';
                    const isSuspended = comp.status === 'SUSPENDED';
                    const daysRemaining = comp.trialDaysRemaining !== undefined ? comp.trialDaysRemaining : (isPaid ? 30 : 14);

                    return (
                      <tr key={comp.id} className="hover:bg-slate-800/40 transition-colors">
                        {/* Company Details */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center font-black text-xs text-purple-400 shrink-0">
                              {comp.logoUrl ? (
                                <img src={comp.logoUrl} alt={comp.name} className="w-7 h-7 object-contain" />
                              ) : (
                                comp.code.slice(0, 3)
                              )}
                            </div>
                            <div>
                              <div className="font-bold text-slate-100 flex items-center gap-1.5">
                                <span>{comp.name}</span>
                                {isPaid && <BadgeCheck className="w-3.5 h-3.5 text-emerald-400" />}
                              </div>
                              <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                                Code: <span className="text-slate-300 font-bold">{comp.code}</span> | NTN: {comp.ntn || 'N/A'} | {comp.city || 'Pakistan'}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Signup Admin */}
                        <td className="py-3.5 px-4">
                          <div className="font-medium text-slate-200">{comp.adminName || 'Admin'}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{comp.adminEmail || comp.email}</div>
                          <div className="text-[10px] text-slate-500 mt-0.5">Joined: {comp.createdAt || '2026-10-01'}</div>
                        </td>

                        {/* Subscription Tier */}
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-purple-300">{comp.subscriptionPlan || 'Enterprise Tier'}</div>
                          <div className="text-[10px] text-slate-400">
                            Billing: <span className="font-mono text-slate-300">{comp.subscriptionCycle || 'Monthly'}</span>
                          </div>
                          <div className="text-[10px] text-slate-500">Max Users: {comp.userLimit || 25}</div>
                        </td>

                        {/* Trial / Expiry Live Countdown */}
                        <td className="py-3.5 px-4">
                          {isPaid ? (
                            <div className="space-y-1">
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                <CheckCircle2 className="w-3 h-3" />
                                Paid Active ({daysRemaining}d left)
                              </span>
                              <div className="text-[10px] text-slate-400 font-mono">
                                Renewal: {comp.subscriptionExpiresAt ? comp.subscriptionExpiresAt.split('T')[0] : 'In 30 Days'}
                              </div>
                            </div>
                          ) : daysRemaining > 0 ? (
                            <div className="space-y-1">
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                                <Clock className="w-3 h-3" />
                                Trial: {daysRemaining} Days Left
                              </span>
                              <div className="w-24 bg-slate-800 rounded-full h-1.5 overflow-hidden">
                                <div
                                  className="bg-cyan-500 h-1.5 rounded-full"
                                  style={{ width: `${Math.min(100, Math.max(10, (daysRemaining / 14) * 100))}%` }}
                                />
                              </div>
                            </div>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-rose-500/20 text-rose-300 border border-rose-500/30">
                              <AlertTriangle className="w-3 h-3" />
                              Trial Expired
                            </span>
                          )}
                        </td>

                        {/* Payment Status & Channel */}
                        <td className="py-3.5 px-4">
                          {isPaid ? (
                            <div className="space-y-0.5">
                              <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-black bg-emerald-950 text-emerald-300 border border-emerald-500/40">
                                <Check className="w-3 h-3 text-emerald-400" />
                                PAID & VERIFIED
                              </div>
                              <div className="text-[11px] font-bold text-slate-100 font-mono">
                                Rs. {(comp.lastPaymentAmount || 120000).toLocaleString()}
                              </div>
                              <div className="text-[10px] text-slate-400 font-mono truncate max-w-[170px]" title={comp.lastPaymentMethod}>
                                {comp.lastPaymentMethod || 'Bank Transfer'}
                              </div>
                              {comp.lastPaymentTxnId && (
                                <div className="text-[9px] text-cyan-400 font-mono">Ref: {comp.lastPaymentTxnId}</div>
                              )}
                            </div>
                          ) : isPending ? (
                            <div className="space-y-1">
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-black bg-amber-950 text-amber-300 border border-amber-500/40 animate-pulse">
                                <Clock className="w-3 h-3 text-amber-400" />
                                PAYMENT PENDING
                              </span>
                              <div className="text-[10px] text-slate-400">Slip submitted, awaiting master verification.</div>
                            </div>
                          ) : (
                            <div className="space-y-0.5">
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                                Complimentary Trial
                              </span>
                              <div className="text-[10px] text-slate-500">No payment received yet</div>
                            </div>
                          )}
                        </td>

                        {/* Master Actions */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5 flex-wrap">
                            {/* Verify / Record Payment Button */}
                            <button
                              onClick={() => handleOpenVerifyModal(comp)}
                              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] transition-all cursor-pointer flex items-center gap-1 shadow-sm"
                              title="Verify or record subscription payment"
                            >
                              <DollarSign className="w-3 h-3" />
                              <span>{isPaid ? 'Record Payment' : 'Verify Payment'}</span>
                            </button>

                            {/* Trial Extension Quick Buttons */}
                            <div className="inline-flex rounded-lg border border-slate-700 bg-slate-800 overflow-hidden text-[10px] font-bold">
                              <button
                                onClick={() => handleExtendTrial(comp, 7)}
                                className="px-1.5 py-1 text-cyan-300 hover:bg-slate-700 cursor-pointer"
                                title="Add 7 trial days"
                              >
                                +7d
                              </button>
                              <button
                                onClick={() => handleExtendTrial(comp, 14)}
                                className="px-1.5 py-1 text-cyan-300 hover:bg-slate-700 border-l border-slate-700 cursor-pointer"
                                title="Add 14 trial days"
                              >
                                +14d
                              </button>
                              <button
                                onClick={() => handleExtendTrial(comp, 30)}
                                className="px-1.5 py-1 text-cyan-300 hover:bg-slate-700 border-l border-slate-700 cursor-pointer"
                                title="Add 30 trial days"
                              >
                                +30d
                              </button>
                            </div>

                            {/* View Tax Invoice */}
                            <button
                              onClick={() => handleOpenInvoice(comp)}
                              className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white cursor-pointer"
                              title="View official GST Tax Invoice receipt"
                            >
                              <Receipt className="w-3.5 h-3.5" />
                            </button>

                            {/* Toggle Active / Suspended */}
                            <button
                              onClick={() => handleToggleCompanyStatus(comp)}
                              className={`p-1 rounded-lg cursor-pointer ${
                                isSuspended
                                  ? 'bg-rose-900/60 text-rose-300 hover:bg-rose-800'
                                  : 'bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200'
                              }`}
                              title={isSuspended ? 'Account Suspended (Click to activate)' : 'Account Active (Click to suspend)'}
                            >
                              {isSuspended ? <ShieldAlert className="w-3.5 h-3.5 text-rose-400" /> : <ShieldCheck className="w-3.5 h-3.5" />}
                            </button>
                          </div>
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

              <div className="text-xs text-slate-400 space-y-1.5 font-mono">
                <div className="flex justify-between border-b border-slate-800 pb-1">
                  <span>Max Users:</span>
                  <strong className="text-slate-200">{p.maxUsers} Seats</strong>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-1">
                  <span>Max Branches:</span>
                  <strong className="text-slate-200">{p.maxBranches} Hubs</strong>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-1">
                  <span>SMS Quota:</span>
                  <strong className="text-cyan-400">{p.smsQuota.toLocaleString()}</strong>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-1">
                  <span>WhatsApp Alerts:</span>
                  <strong className={p.whatsappAlertsEnabled ? 'text-emerald-400' : 'text-slate-500'}>
                    {p.whatsappAlertsEnabled ? 'Enabled' : 'Disabled'}
                  </strong>
                </div>
                <div className="flex justify-between">
                  <span>Vendor Logins:</span>
                  <strong className="text-purple-400">{p.vendorPortalLogins}</strong>
                </div>
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

      {/* Verify & Record Payment Modal */}
      {showVerifyModal && selectedCompanyForPayment && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-lg w-full space-y-4 shadow-2xl animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wider text-emerald-400 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  Verify & Record Subscription Payment
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Update payment ledger, extend active subscription, and verify client deposit.
                </p>
              </div>
              <button
                onClick={() => setShowVerifyModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 text-xs">
              <div className="text-[10px] text-slate-400 uppercase font-bold">Enterprise Client</div>
              <div className="font-bold text-slate-100 text-sm">{selectedCompanyForPayment.name}</div>
              <div className="text-slate-400 font-mono text-[10px]">
                Code: {selectedCompanyForPayment.code} | NTN: {selectedCompanyForPayment.ntn || 'N/A'} | Admin: {selectedCompanyForPayment.adminName} ({selectedCompanyForPayment.adminEmail})
              </div>
            </div>

            <form onSubmit={handleSaveVerifiedPayment} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Subscription Plan</label>
                  <select
                    value={vPlan}
                    onChange={(e) => setVPlan(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 font-semibold"
                  >
                    {plans.map((p) => (
                      <option key={p.id} value={p.name}>
                        {p.name} (Rs. {p.pricePKR.toLocaleString()})
                      </option>
                    ))}
                    <option value="Enterprise Custom Plan">Enterprise Custom Plan</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Billing Cycle</label>
                  <select
                    value={vCycle}
                    onChange={(e) => {
                      const c = e.target.value as SubscriptionCycle;
                      setVCycle(c);
                      if (c === 'Monthly') setVDays(30);
                      else if (c === 'Six-Monthly') setVDays(180);
                      else if (c === 'Yearly') setVDays(365);
                      else if (c === 'One-Time') setVDays(3650);
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100"
                  >
                    <option value="Monthly">Monthly (30 Days)</option>
                    <option value="Six-Monthly">Six-Monthly (180 Days)</option>
                    <option value="Yearly">Yearly (365 Days)</option>
                    <option value="One-Time">One-Time Perpetual License</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Amount Received (PKR)</label>
                  <input
                    type="number"
                    value={vAmount}
                    onChange={(e) => setVAmount(Number(e.target.value))}
                    required
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-emerald-300 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Active Days to Grant</label>
                  <input
                    type="number"
                    value={vDays}
                    onChange={(e) => setVDays(Number(e.target.value))}
                    required
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Payment Method / Channel</label>
                <select
                  value={vMethod}
                  onChange={(e) => setVMethod(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100"
                >
                  <option value="Meezan Bank IBFT">Meezan Bank Limited (IBFT)</option>
                  <option value="Habib Bank Limited (HBL) Transfer">Habib Bank Limited (HBL) Transfer</option>
                  <option value="Bank Alfalah Direct Transfer">Bank Alfalah Direct Transfer</option>
                  <option value="State Bank Raast Instant Pay">State Bank Raast Instant Pay</option>
                  <option value="Online Visa / Mastercard">Online Visa / Mastercard (Debit / Credit)</option>
                  <option value="Corporate Crossed Cheque">Corporate Crossed Cheque</option>
                  <option value="Cash Deposit / Manual Counter">Cash Deposit / Manual Counter</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Transaction Ref / STAN / Slip No</label>
                <input
                  type="text"
                  placeholder="e.g. MZB-IBFT-991204 or STAN-49281"
                  value={vTxnId}
                  onChange={(e) => setVTxnId(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowVerifyModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-lg shadow-emerald-600/30 flex items-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Confirm Payment & Activate Subscription</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Official Tax Invoice Receipt Modal */}
      {showInvoiceModal && invoiceCompany && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-2xl w-full space-y-5 shadow-2xl animate-in zoom-in-95 max-h-[92vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-purple-400" />
                <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
                  Official FBR Sales Tax Invoice & Payment Receipt
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Receipt</span>
                </button>
                <button
                  onClick={() => setShowInvoiceModal(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Printable Paper Canvas */}
            <div className="p-6 rounded-2xl bg-white text-slate-900 font-sans text-xs space-y-5 shadow-inner">
              {/* Header */}
              <div className="flex items-start justify-between border-b border-slate-200 pb-4">
                <div className="flex items-center gap-3">
                  <img
                    src="/public/assets/aistudio/Untitled_design_4a7e39e2.png"
                    alt="MTS ERP"
                    className="h-12 w-auto object-contain"
                  />
                  <div>
                    <h1 className="text-base font-black text-slate-900 leading-tight">
                      MTS ERP FUTURE SOLUTIONS (PVT) LIMITED
                    </h1>
                    <div className="text-[10px] text-slate-600">
                      Enterprise Software & Cloud Systems Provider
                    </div>
                    <div className="text-[10px] text-slate-600 font-mono mt-0.5">
                      <strong>NTN:</strong> 9482710-3 | <strong>STRN:</strong> 3277876123456
                    </div>
                    <div className="text-[9px] text-slate-500">
                      Software Technology Park, Main Boulevard, Gulberg III, Lahore, Pakistan
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-800 font-black rounded-lg text-xs uppercase tracking-wider border border-emerald-300">
                    PAID & SETTLED
                  </span>
                  <div className="text-[11px] font-mono font-bold text-slate-800 mt-2">
                    INV-MTS-2026-{invoiceCompany.code}
                  </div>
                  <div className="text-[10px] text-slate-500">
                    Date: {new Date().toISOString().split('T')[0]}
                  </div>
                </div>
              </div>

              {/* Billed To Client */}
              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs">
                <div>
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Billed To (Enterprise):</div>
                  <div className="font-black text-slate-900 text-sm mt-0.5">{invoiceCompany.name}</div>
                  <div className="text-slate-600 font-mono text-[11px]">
                    NTN: {invoiceCompany.ntn || '1000000-0'} | STRN: {invoiceCompany.strn || 'N/A'}
                  </div>
                  <div className="text-slate-600 text-[10px]">{invoiceCompany.address || invoiceCompany.city || 'Pakistan'}</div>
                </div>

                <div className="text-right">
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Authorized Contact:</div>
                  <div className="font-bold text-slate-800 mt-0.5">{invoiceCompany.adminName || 'Admin'}</div>
                  <div className="text-slate-600 font-mono text-[11px]">{invoiceCompany.adminEmail || invoiceCompany.email}</div>
                  <div className="text-slate-600 text-[10px]">Tenant ID: {invoiceCompany.tenantId}</div>
                </div>
              </div>
              {/* Invoice Particulars Table */}
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b-2 border-slate-300 bg-slate-100 text-slate-700 font-bold">
                    <th className="py-2 px-3">Description</th>
                    <th className="py-2 px-3">Billing Cycle</th>
                    <th className="py-2 px-3">Expiry Date</th>
                    <th className="py-2 px-3 text-right">Net Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-mono">
                  <tr>
                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-900 font-sans">
                        MTS Enterprise ERP License & Dedicated Cloud Database
                      </div>
                      <div className="text-[10px] text-slate-600 font-sans">
                        Plan: {invoiceCompany.subscriptionPlan || 'Professional Enterprise Tier'} | User Capacity: {invoiceCompany.userLimit || 25} Users
                      </div>
                    </td>
                    <td className="py-3 px-3">{invoiceCompany.subscriptionCycle || 'Monthly'}</td>
                    <td className="py-3 px-3">{invoiceCompany.subscriptionExpiresAt ? invoiceCompany.subscriptionExpiresAt.split('T')[0] : 'In 30 Days'}</td>
                    <td className="py-3 px-3 text-right font-bold text-slate-900">
                      Rs. {Math.round((invoiceCompany.lastPaymentAmount || 120000) / 1.18).toLocaleString()}
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* Total Calculation */}
              <div className="border-t border-slate-200 pt-3 flex justify-end">
                <div className="w-64 space-y-1.5 font-mono text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Gross Subtotal:</span>
                    <span>Rs. {Math.round((invoiceCompany.lastPaymentAmount || 120000) / 1.18).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>FBR Sales Tax (18%):</span>
                    <span>Rs. {Math.round((invoiceCompany.lastPaymentAmount || 120000) - ((invoiceCompany.lastPaymentAmount || 120000) / 1.18)).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-slate-900 font-black text-sm border-t-2 border-slate-300 pt-1.5">
                    <span>Total Paid (PKR):</span>
                    <span className="text-emerald-700">Rs. {(invoiceCompany.lastPaymentAmount || 120000).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Settlement & Bank Audit Info */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-[10px] text-slate-600 font-mono flex items-center justify-between">
                <div>
                  <strong>Payment Channel:</strong> {invoiceCompany.lastPaymentMethod || 'Meezan Bank IBFT'}<br />
                  <strong>STAN / Txn ID:</strong> {invoiceCompany.lastPaymentTxnId || 'MZB-VERIFIED-991204'}
                </div>
                <div className="text-right">
                  <strong>Verification Status:</strong> VERIFIED & CLEARED<br />
                  <strong>Issued By:</strong> Master ERP Central Desk
                </div>
              </div>

              <div className="text-center text-[9px] text-slate-500 pt-2 border-t border-slate-100">
                This is a computer generated electronic receipt under Section 153 of the Income Tax Ordinance 2001 and Sales Tax Act 1990.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
