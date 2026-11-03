import React, { useState, useEffect } from 'react';
import {
  Building2,
  Plus,
  Search,
  CheckCircle2,
  XCircle,
  Edit2,
  Trash2,
  ShieldCheck,
  CreditCard,
  Copy,
  Check,
  Sparkles,
  RefreshCw,
  Download,
  AlertCircle,
  Globe,
  Landmark,
  Sliders,
  FileText,
  History,
  User,
  ShieldAlert,
  Clock,
  X
} from 'lucide-react';
import { MasterBankAccount, ReconciliationRule, BankAuditEntry } from '../../types/erp';
import {
  getMasterBankAccounts,
  saveMasterBankAccounts,
  getMasterReconciliationRules,
  saveMasterReconciliationRules,
  getMasterBankAuditLogs,
  logBankAuditAction
} from '../../services/masterBankAccountsService';
import { PAKISTANI_BANKS_LIST, PakistaniBankInfo } from '../../services/pakistaniBanks';
import { SearchableSelect } from '../common/SearchableSelect';
import { TTSButton } from '../common/TTSButton';

export const MasterBankAccountManager: React.FC = () => {
  const [activeMainTab, setActiveMainTab] = useState<'accounts' | 'rules' | 'audit'>('accounts');

  // Bank Accounts State
  const [accounts, setAccounts] = useState<MasterBankAccount[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE' | 'DEFAULT'>('ALL');
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [editingAccountId, setEditingAccountId] = useState<string | null>(null);

  // Bank Form Fields
  const [bankName, setBankName] = useState('');
  const [accountTitle, setAccountTitle] = useState('MTS ERP FUTURE SOLUTIONS (PVT) LIMITED');
  const [accountNumber, setAccountNumber] = useState('');
  const [iban, setIban] = useState('');
  const [branchName, setBranchName] = useState('');
  const [branchCode, setBranchCode] = useState('');
  const [swiftCode, setSwiftCode] = useState('');
  const [raastId, setRaastId] = useState('');
  const [isDefault, setIsDefault] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [instructions, setInstructions] = useState('');

  // Reconciliation Rules State
  const [rules, setRules] = useState<ReconciliationRule[]>([]);
  const [ruleSearchQuery, setRuleSearchQuery] = useState('');
  const [showRuleModal, setShowRuleModal] = useState(false);
  const [editingRuleId, setEditingRuleId] = useState<string | null>(null);

  // Rule Form Fields
  const [ruleName, setRuleName] = useState('');
  const [ruleBankId, setRuleBankId] = useState('ALL');
  const [minAmount, setMinAmount] = useState<number>(5000);
  const [maxAmount, setMaxAmount] = useState<number>(10000000);
  const [refPattern, setRefPattern] = useState('TENANT-[0-9]{3,6}');
  const [matchingMode, setMatchingMode] = useState<ReconciliationRule['matchingMode']>('EXACT_AMOUNT_AND_REF');
  const [autoApprove, setAutoApprove] = useState(true);
  const [ruleActive, setRuleActive] = useState(true);

  // Audit Logs State
  const [auditLogs, setAuditLogs] = useState<BankAuditEntry[]>([]);
  const [auditSearchQuery, setAuditSearchQuery] = useState('');
  const [auditActionFilter, setAuditActionFilter] = useState<string>('ALL');

  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const bankData = await getMasterBankAccounts();
    setAccounts(bankData);
    const ruleData = await getMasterReconciliationRules();
    setRules(ruleData);
    const logs = await getMasterBankAuditLogs();
    setAuditLogs(logs);
  };

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  // --- Bank Account Handlers ---
  const handleOpenAddAccountModal = () => {
    setEditingAccountId(null);
    setBankName(PAKISTANI_BANKS_LIST[0].name);
    setAccountTitle('MTS ERP FUTURE SOLUTIONS (PVT) LIMITED');
    setAccountNumber('');
    setIban('PK36' + PAKISTANI_BANKS_LIST[0].code + '0000000000000');
    setBranchName('Main Branch, Lahore');
    setBranchCode('0101');
    setSwiftCode(PAKISTANI_BANKS_LIST[0].swiftCode);
    setRaastId('03001234567');
    setIsDefault(accounts.length === 0);
    setIsActive(true);
    setInstructions('Transfer exact subscription or invoice funds mentioning your Tenant ID in remarks for automated SBP/1Link reconciliation.');
    setShowAccountModal(true);
  };

  const handleOpenEditAccountModal = (acc: MasterBankAccount) => {
    setEditingAccountId(acc.id);
    setBankName(acc.bankName);
    setAccountTitle(acc.accountTitle);
    setAccountNumber(acc.accountNumber);
    setIban(acc.iban);
    setBranchName(acc.branchName);
    setBranchCode(acc.branchCode || '');
    setSwiftCode(acc.swiftCode || '');
    setRaastId(acc.raastId || '');
    setIsDefault(acc.isDefault || false);
    setIsActive(acc.isActive);
    setInstructions(acc.instructions || '');
    setShowAccountModal(true);
  };

  const handleBankTemplateChange = (bankInfoName: string) => {
    const found = PAKISTANI_BANKS_LIST.find((b) => b.name === bankInfoName);
    if (found) {
      setBankName(found.name);
      setSwiftCode(found.swiftCode);
      const prefix = found.ibanPrefix || `PK36${found.code}`;
      const randomAcc = String(Math.floor(10000000000000 + Math.random() * 90000000000000));
      setIban(`${prefix}${randomAcc}`);
      setBranchCode(found.sbpCode || String(Math.floor(1000 + Math.random() * 9000)));
    } else {
      setBankName(bankInfoName);
    }
  };

  const handleSaveAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bankName || !accountNumber || !iban) {
      showToast('Please fill in Bank Name, Account Number and IBAN.');
      return;
    }

    let updated = [...accounts];
    if (isDefault) {
      updated = updated.map((a) => ({ ...a, isDefault: false }));
    }

    if (editingAccountId) {
      updated = updated.map((a) =>
        a.id === editingAccountId
          ? {
              ...a,
              bankName,
              accountTitle,
              accountNumber,
              iban,
              branchName,
              branchCode,
              swiftCode,
              raastId,
              isDefault,
              isActive,
              instructions
            }
          : a
      );
      showToast('Master Bank Account updated successfully.');
      await logBankAuditAction(
        'EDIT_BANK',
        `Modified Master Bank Account "${bankName}" (IBAN: ${iban}, Account No: ${accountNumber})`,
        editingAccountId,
        bankName
      );
    } else {
      const newAcc: MasterBankAccount = {
        id: 'acc_' + Date.now(),
        bankName,
        accountTitle,
        accountNumber,
        iban,
        branchName,
        branchCode,
        swiftCode,
        raastId,
        isDefault,
        isActive,
        instructions,
        createdAt: new Date().toISOString().split('T')[0]
      };
      if (updated.length === 0) newAcc.isDefault = true;
      updated.push(newAcc);
      showToast('New Master Bank Account added successfully.');
      await logBankAuditAction(
        'ADD_BANK',
        `Added new Master Bank Account "${bankName}" (IBAN: ${iban}, Account No: ${accountNumber})`,
        newAcc.id,
        bankName
      );
    }

    await saveMasterBankAccounts(updated);
    setAccounts(updated);
    const logs = await getMasterBankAuditLogs();
    setAuditLogs(logs);
    setShowAccountModal(false);
  };

  const handleDeleteAccount = async (id: string) => {
    const acc = accounts.find((a) => a.id === id);
    if (window.confirm('Are you sure you want to delete this master bank account?')) {
      const updated = accounts.filter((a) => a.id !== id);
      await saveMasterBankAccounts(updated);
      setAccounts(updated);
      showToast('Bank account removed.');
      await logBankAuditAction(
        'DELETE_BANK',
        `Deleted Master Bank Account "${acc?.bankName || id}" (IBAN: ${acc?.iban || 'N/A'})`,
        id,
        acc?.bankName
      );
      const logs = await getMasterBankAuditLogs();
      setAuditLogs(logs);
    }
  };

  const handleToggleDefault = async (id: string) => {
    const acc = accounts.find((a) => a.id === id);
    const updated = accounts.map((a) => ({
      ...a,
      isDefault: a.id === id
    }));
    await saveMasterBankAccounts(updated);
    setAccounts(updated);
    showToast('Default receiving account updated.');
    await logBankAuditAction(
      'SET_DEFAULT_BANK',
      `Set "${acc?.bankName || id}" as primary default gateway for automated SBP/1Link reconciliation`,
      id,
      acc?.bankName
    );
    const logs = await getMasterBankAuditLogs();
    setAuditLogs(logs);
  };

  // --- Reconciliation Rules Handlers ---
  const handleOpenAddRuleModal = () => {
    setEditingRuleId(null);
    setRuleName('');
    setRuleBankId('ALL');
    setMinAmount(5000);
    setMaxAmount(10000000);
    setRefPattern('TENANT-[0-9]{3,6}');
    setMatchingMode('EXACT_AMOUNT_AND_REF');
    setAutoApprove(true);
    setRuleActive(true);
    setShowRuleModal(true);
  };

  const handleOpenEditRuleModal = (rule: ReconciliationRule) => {
    setEditingRuleId(rule.id);
    setRuleName(rule.ruleName);
    setRuleBankId(rule.bankId);
    setMinAmount(rule.minTransactionAmount);
    setMaxAmount(rule.maxTransactionAmount);
    setRefPattern(rule.referencePattern);
    setMatchingMode(rule.matchingMode);
    setAutoApprove(rule.autoApprove);
    setRuleActive(rule.isActive);
    setShowRuleModal(true);
  };

  const handleSaveRule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ruleName || !refPattern) {
      showToast('Please provide a rule name and reference pattern.');
      return;
    }

    let updated = [...rules];
    if (editingRuleId) {
      updated = updated.map((r) =>
        r.id === editingRuleId
          ? {
              ...r,
              ruleName,
              bankId: ruleBankId,
              minTransactionAmount: Number(minAmount),
              maxTransactionAmount: Number(maxAmount),
              referencePattern: refPattern,
              matchingMode,
              autoApprove,
              isActive: ruleActive
            }
          : r
      );
      showToast('Reconciliation rule updated successfully.');
      await logBankAuditAction(
        'EDIT_RULE',
        `Modified Reconciliation Rule "${ruleName}" (Pattern: ${refPattern}, Mode: ${matchingMode})`
      );
    } else {
      const newRule: ReconciliationRule = {
        id: 'rule_' + Date.now(),
        ruleName,
        bankId: ruleBankId,
        minTransactionAmount: Number(minAmount),
        maxTransactionAmount: Number(maxAmount),
        referencePattern: refPattern,
        matchingMode,
        autoApprove,
        isActive: ruleActive,
        createdAt: new Date().toISOString().split('T')[0]
      };
      updated.push(newRule);
      showToast('New reconciliation rule created successfully.');
      await logBankAuditAction(
        'ADD_RULE',
        `Created Reconciliation Rule "${ruleName}" (Pattern: ${refPattern}, Mode: ${matchingMode})`
      );
    }

    await saveMasterReconciliationRules(updated);
    setRules(updated);
    const logs = await getMasterBankAuditLogs();
    setAuditLogs(logs);
    setShowRuleModal(false);
  };

  const handleDeleteRule = async (id: string) => {
    const r = rules.find((item) => item.id === id);
    if (window.confirm('Are you sure you want to delete this reconciliation rule?')) {
      const updated = rules.filter((item) => item.id !== id);
      await saveMasterReconciliationRules(updated);
      setRules(updated);
      showToast('Reconciliation rule deleted.');
      await logBankAuditAction(
        'DELETE_RULE',
        `Deleted Reconciliation Rule "${r?.ruleName || id}"`
      );
      const logs = await getMasterBankAuditLogs();
      setAuditLogs(logs);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredAccounts = accounts.filter((acc) => {
    const matchesSearch =
      acc.bankName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      acc.accountNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      acc.iban.toLowerCase().includes(searchQuery.toLowerCase()) ||
      acc.branchName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (acc.raastId && acc.raastId.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;
    if (statusFilter === 'ACTIVE') return acc.isActive;
    if (statusFilter === 'INACTIVE') return !acc.isActive;
    if (statusFilter === 'DEFAULT') return acc.isDefault;
    return true;
  });

  const filteredRules = rules.filter((r) =>
    r.ruleName.toLowerCase().includes(ruleSearchQuery.toLowerCase()) ||
    r.referencePattern.toLowerCase().includes(ruleSearchQuery.toLowerCase())
  );

  const filteredAuditLogs = auditLogs.filter((log) => {
    const matchesQuery =
      log.details.toLowerCase().includes(auditSearchQuery.toLowerCase()) ||
      log.adminName.toLowerCase().includes(auditSearchQuery.toLowerCase()) ||
      log.adminId.toLowerCase().includes(auditSearchQuery.toLowerCase()) ||
      (log.bankName && log.bankName.toLowerCase().includes(auditSearchQuery.toLowerCase()));

    if (!matchesQuery) return false;
    if (auditActionFilter !== 'ALL' && log.action !== auditActionFilter) return false;
    return true;
  });

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400">
            <Landmark className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-100">Master Bank Account Setup</h1>
              <TTSButton text="Master Bank Account Setup with detailed audit tracking. Maintain standardized Pakistani banks, reconciliation rules, and master admin audit trails." />
            </div>
            <p className="text-sm text-slate-400 mt-1">
              Configure official receiving bank accounts, automated reconciliation rules, and review tamper-proof admin audit records.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium rounded-xl transition border border-slate-700 shadow-sm"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
          {activeMainTab === 'accounts' && (
            <button
              onClick={handleOpenAddAccountModal}
              className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-xl transition shadow-lg shadow-emerald-600/20"
            >
              <Plus className="w-5 h-5" />
              <span>Add Bank Account</span>
            </button>
          )}
          {activeMainTab === 'rules' && (
            <button
              onClick={handleOpenAddRuleModal}
              className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-xl transition shadow-lg shadow-emerald-600/20"
            >
              <Plus className="w-5 h-5" />
              <span>Add Reconciliation Rule</span>
            </button>
          )}
        </div>
      </div>

      {notification && (
        <div className="bg-emerald-950/80 border border-emerald-500/30 text-emerald-300 p-4 rounded-xl flex items-center gap-3 shadow-lg animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Main Tab Navigation */}
      <div className="flex items-center gap-3 border-b border-slate-800 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveMainTab('accounts')}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition text-sm whitespace-nowrap ${
            activeMainTab === 'accounts'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
              : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>Master Bank Accounts ({accounts.length})</span>
        </button>

        <button
          onClick={() => setActiveMainTab('rules')}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition text-sm whitespace-nowrap ${
            activeMainTab === 'rules'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
              : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Reconciliation Rules ({rules.length})</span>
        </button>

        <button
          onClick={() => setActiveMainTab('audit')}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition text-sm whitespace-nowrap ${
            activeMainTab === 'audit'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
              : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Audit Trail & Logs ({auditLogs.length})</span>
        </button>
      </div>

      {/* TAB 1: BANK ACCOUNTS */}
      {activeMainTab === 'accounts' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by bank name, IBAN, branch or Raast ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-slate-200 text-sm focus:outline-none focus:border-emerald-500 transition"
              />
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
              {(['ALL', 'ACTIVE', 'DEFAULT', 'INACTIVE'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setStatusFilter(tab)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition whitespace-nowrap ${
                    statusFilter === tab
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
                  }`}
                >
                  {tab.charAt(0) + tab.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAccounts.map((acc) => (
              <div
                key={acc.id}
                className={`bg-slate-900 border rounded-2xl p-6 flex flex-col justify-between shadow-xl transition relative overflow-hidden ${
                  acc.isDefault
                    ? 'border-emerald-500/50 bg-gradient-to-b from-emerald-950/20 to-slate-900'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                {acc.isDefault && (
                  <div className="absolute top-0 right-0 bg-emerald-600 text-white text-[10px] uppercase tracking-wider font-bold px-3 py-1 rounded-bl-xl shadow-md">
                    Default Receiving Bank
                  </div>
                )}

                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-emerald-400 shrink-0">
                      <CreditCard className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-100 text-lg leading-tight">{acc.bankName}</h3>
                      <p className="text-xs text-slate-400 font-medium mt-0.5">{acc.accountTitle}</p>
                    </div>
                  </div>

                  <div className="space-y-2 bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80 text-sm">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">Account No:</span>
                      <div className="flex items-center gap-1.5 font-mono text-slate-200">
                        <span>{acc.accountNumber}</span>
                        <button
                          onClick={() => copyToClipboard(acc.accountNumber, `acc_${acc.id}`)}
                          className="text-slate-400 hover:text-emerald-400 transition"
                          title="Copy Account Number"
                        >
                          {copiedId === `acc_${acc.id}` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">IBAN:</span>
                      <div className="flex items-center gap-1.5 font-mono text-emerald-400 font-semibold">
                        <span className="truncate max-w-[180px]" title={acc.iban}>{acc.iban}</span>
                        <button
                          onClick={() => copyToClipboard(acc.iban, `iban_${acc.id}`)}
                          className="text-slate-400 hover:text-emerald-400 transition"
                          title="Copy IBAN"
                        >
                          {copiedId === `iban_${acc.id}` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    {acc.branchCode && (
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400">Branch Code:</span>
                        <span className="font-mono text-slate-300">{acc.branchCode} ({acc.branchName})</span>
                      </div>
                    )}

                    {acc.swiftCode && (
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400">SWIFT Code:</span>
                        <span className="font-mono text-slate-300">{acc.swiftCode}</span>
                      </div>
                    )}

                    {acc.raastId && (
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400">RAAST ID / Alias:</span>
                        <span className="font-mono text-emerald-300 font-bold">{acc.raastId}</span>
                      </div>
                    )}
                  </div>

                  {acc.instructions && (
                    <p className="text-xs text-slate-400 italic bg-slate-800/40 p-2.5 rounded-lg border border-slate-800">
                      "{acc.instructions}"
                    </p>
                  )}
                </div>

                <div className="pt-4 mt-4 border-t border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${acc.isActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-500'}`} />
                    <span className="text-xs font-medium text-slate-300">{acc.isActive ? 'Active Gateway' : 'Inactive'}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {!acc.isDefault && (
                      <button
                        onClick={() => handleToggleDefault(acc.id)}
                        className="px-2.5 py-1.5 bg-slate-800 hover:bg-emerald-600 hover:text-white text-slate-300 text-xs font-medium rounded-lg transition border border-slate-700"
                        title="Set as Default Receiving Bank"
                      >
                        Set Default
                      </button>
                    )}
                    <button
                      onClick={() => handleOpenEditAccountModal(acc)}
                      className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition border border-slate-700"
                      title="Edit Account"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteAccount(acc.id)}
                      className="p-1.5 bg-slate-800 hover:bg-rose-500/20 text-slate-300 hover:text-rose-400 rounded-lg transition border border-slate-700"
                      title="Delete Account"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: RECONCILIATION RULES */}
      {activeMainTab === 'rules' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search reconciliation rules by name or pattern..."
                value={ruleSearchQuery}
                onChange={(e) => setRuleSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-slate-200 text-sm focus:outline-none focus:border-emerald-500 transition"
              />
            </div>
            <div className="text-xs text-slate-400">
              Automated rules parse bank statement file imports (CSV/MT940/API) to match payment slips with client tenant invoices.
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRules.map((rule) => {
              const targetBank = rule.bankId === 'ALL' ? 'All Master Banks' : accounts.find((a) => a.id === rule.bankId)?.bankName || 'Specific Bank';
              return (
                <div
                  key={rule.id}
                  className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-6 flex flex-col justify-between shadow-xl transition"
                >
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-emerald-400">
                          <Sliders className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-100 text-base">{rule.ruleName}</h3>
                          <span className="text-xs text-emerald-400 font-medium">{targetBank}</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80 text-xs font-mono space-y-1.5">
                      <div className="flex items-center justify-between text-slate-300">
                        <span className="text-slate-400 font-sans">Matching Mode:</span>
                        <span className="text-emerald-300 font-bold">{rule.matchingMode}</span>
                      </div>
                      <div className="flex items-center justify-between text-slate-300">
                        <span className="text-slate-400 font-sans">Min Amount:</span>
                        <span>PKR {rule.minTransactionAmount.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center justify-between text-slate-300">
                        <span className="text-slate-400 font-sans">Max Amount:</span>
                        <span>PKR {rule.maxTransactionAmount.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center justify-between text-slate-300">
                        <span className="text-slate-400 font-sans">Ref Pattern:</span>
                        <span className="text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">{rule.referencePattern}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-slate-300 font-medium">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-bold ${rule.autoApprove ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'}`}>
                        {rule.autoApprove ? 'Auto-Approve Enabled' : 'Manual Review Required'}
                      </span>
                    </div>
                  </div>

                  <div className="pt-4 mt-4 border-t border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${rule.isActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-500'}`} />
                      <span className="text-xs font-medium text-slate-300">{rule.isActive ? 'Active Rule' : 'Inactive'}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleOpenEditRuleModal(rule)}
                        className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition border border-slate-700"
                        title="Edit Rule"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteRule(rule.id)}
                        className="p-1.5 bg-slate-800 hover:bg-rose-500/20 text-slate-300 hover:text-rose-400 rounded-lg transition border border-slate-700"
                        title="Delete Rule"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: AUDIT TRAIL & LOGS */}
      {activeMainTab === 'audit' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search audit logs by details, admin or bank..."
                value={auditSearchQuery}
                onChange={(e) => setAuditSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-slate-200 text-sm focus:outline-none focus:border-emerald-500 transition"
              />
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
              {(['ALL', 'ADD_BANK', 'EDIT_BANK', 'DELETE_BANK', 'SET_DEFAULT_BANK', 'ADD_RULE', 'EDIT_RULE', 'DELETE_RULE'] as const).map((act) => (
                <button
                  key={act}
                  onClick={() => setAuditActionFilter(act)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition whitespace-nowrap ${
                    auditActionFilter === act
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
                  }`}
                >
                  {act}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-950 border-b border-slate-800 text-slate-400 text-xs uppercase tracking-wider">
                    <th className="py-4 px-6 font-semibold">Timestamp / IP</th>
                    <th className="py-4 px-6 font-semibold">Action</th>
                    <th className="py-4 px-6 font-semibold">Master Admin ID & Name</th>
                    <th className="py-4 px-6 font-semibold">Audit Activity Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-sm">
                  {filteredAuditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-850 transition">
                      <td className="py-4 px-6">
                        <div className="font-mono text-slate-200 text-xs font-semibold flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-emerald-400" />
                          <span>{new Date(log.timestamp).toLocaleString()}</span>
                        </div>
                        <div className="text-[11px] font-mono text-slate-500 mt-0.5">IP: {log.ipAddress}</div>
                      </td>
                      <td className="py-4 px-6">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold font-mono uppercase tracking-wider ${
                            log.action === 'ADD_BANK' || log.action === 'ADD_RULE'
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : log.action === 'EDIT_BANK' || log.action === 'EDIT_RULE'
                              ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                              : log.action === 'DELETE_BANK' || log.action === 'DELETE_RULE'
                              ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                              : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          }`}
                        >
                          {log.action}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-emerald-400 shrink-0" />
                          <div>
                            <div className="text-xs font-bold text-slate-200">{log.adminName}</div>
                            <div className="text-[11px] font-mono text-slate-500">ID: {log.adminId}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
                          {log.details}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredAuditLogs.length === 0 && (
              <div className="p-12 text-center space-y-2">
                <History className="w-10 h-10 text-slate-600 mx-auto" />
                <h3 className="text-base font-bold text-slate-400">No Audit Logs Match Filter</h3>
                <p className="text-xs text-slate-500">Log entries will automatically accumulate as Master Admins perform operations.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add / Edit Bank Account Modal */}
      {showAccountModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl animate-scale-up">
            <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-slate-950">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400">
                  <Landmark className="w-5 h-5" />
                </div>
                <h2 className="text-lg font-bold text-slate-100">
                  {editingAccountId ? 'Edit Master Bank Account' : 'Add New Master Bank Account'}
                </h2>
              </div>
              <button
                onClick={() => setShowAccountModal(false)}
                className="text-slate-400 hover:text-slate-200 p-1 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAccount} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              {!editingAccountId && (
                <div className="space-y-1.5 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                  <label className="text-xs font-semibold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5 mb-1">
                    <Sparkles className="w-3.5 h-3.5" /> Quick Select Pakistani Bank Template
                  </label>
                  <SearchableSelect
                    options={PAKISTANI_BANKS_LIST.map((b) => ({
                      value: b.name,
                      label: `[${b.code}] ${b.name}`,
                      sublabel: `Category: ${b.category || 'Bank'} | SWIFT: ${b.swiftCode} | IBAN: ${b.ibanPrefix}`,
                      category: b.category || 'Standard Banks'
                    }))}
                    value={bankName}
                    onChange={(val) => handleBankTemplateChange(val)}
                    placeholder="Search Pakistani Bank by name or SBP code..."
                    searchPlaceholder="Type bank name or SBP code (e.g. Meezan, HBL, UBL)..."
                  />
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <SearchableSelect
                    label="Bank Name (Standardized Pakistani Bank)"
                    required
                    options={PAKISTANI_BANKS_LIST.map((b) => ({
                      value: b.name,
                      label: `[${b.code}] ${b.name}`,
                      sublabel: `Category: ${b.category || 'Bank'} | SWIFT: ${b.swiftCode}`,
                      category: b.category || 'Standard Banks'
                    }))}
                    value={bankName}
                    onChange={(val) => {
                      setBankName(val);
                      handleBankTemplateChange(val);
                    }}
                    placeholder="Select or Search Pakistani Bank..."
                    searchPlaceholder="Search 25+ SBP Registered Banks..."
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300">Account Title *</label>
                  <input
                    type="text"
                    required
                    value={accountTitle}
                    onChange={(e) => setAccountTitle(e.target.value)}
                    placeholder="MTS ERP FUTURE SOLUTIONS (PVT) LIMITED"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-200 text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300">Account Number *</label>
                  <input
                    type="text"
                    required
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    placeholder="02010104889211"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-200 font-mono text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300">IBAN (24 Characters) *</label>
                  <input
                    type="text"
                    required
                    value={iban}
                    onChange={(e) => setIban(e.target.value)}
                    placeholder="PK36MEZN0002010104889211"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-200 font-mono text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300">Branch Name</label>
                  <input
                    type="text"
                    value={branchName}
                    onChange={(e) => setBranchName(e.target.value)}
                    placeholder="Main Gulberg Branch"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-200 text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300">Branch Code</label>
                  <input
                    type="text"
                    value={branchCode}
                    onChange={(e) => setBranchCode(e.target.value)}
                    placeholder="0201"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-200 font-mono text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300">SWIFT Code</label>
                  <input
                    type="text"
                    value={swiftCode}
                    onChange={(e) => setSwiftCode(e.target.value)}
                    placeholder="MEZNPKKA"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-200 font-mono text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300">RAAST ID / Mobile Alias</label>
                  <input
                    type="text"
                    value={raastId}
                    onChange={(e) => setRaastId(e.target.value)}
                    placeholder="03001234567 or alias@mtserp"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-200 font-mono text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="flex items-center gap-6 pt-6">
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isDefault}
                      onChange={(e) => setIsDefault(e.target.checked)}
                      className="w-4 h-4 accent-emerald-600 rounded bg-slate-950 border-slate-800"
                    />
                    <span className="text-sm font-medium text-slate-200">Set as Default Gateway</span>
                  </label>

                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                      className="w-4 h-4 accent-emerald-600 rounded bg-slate-950 border-slate-800"
                    />
                    <span className="text-sm font-medium text-slate-200">Active Status</span>
                  </label>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">Payment Instructions for Clients</label>
                <textarea
                  rows={2}
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  placeholder="Transfer funds quoting your Tenant ID in remarks for instant automated verification."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-200 text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAccountModal(false)}
                  className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium rounded-xl transition text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-xl transition text-sm shadow-lg shadow-emerald-600/20"
                >
                  Save Bank Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add / Edit Reconciliation Rule Modal */}
      {showRuleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl animate-scale-up">
            <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-slate-950">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400">
                  <Sliders className="w-5 h-5" />
                </div>
                <h2 className="text-lg font-bold text-slate-100">
                  {editingRuleId ? 'Edit Reconciliation Rule' : 'Create Reconciliation Rule'}
                </h2>
              </div>
              <button
                onClick={() => setShowRuleModal(false)}
                className="text-slate-400 hover:text-slate-200 p-1 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveRule} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">Rule Name *</label>
                <input
                  type="text"
                  required
                  value={ruleName}
                  onChange={(e) => setRuleName(e.target.value)}
                  placeholder="e.g. Standard Tenant Subscription ID Pattern"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-200 text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300">Target Bank Scope</label>
                  <select
                    value={ruleBankId}
                    onChange={(e) => setRuleBankId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-200 text-sm focus:outline-none focus:border-emerald-500"
                  >
                    <option value="ALL">All Master Banks (Global)</option>
                    {accounts.map((acc) => (
                      <option key={acc.id} value={acc.id}>
                        {acc.bankName} ({acc.accountNumber.slice(-4)})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300">Matching Mode</label>
                  <select
                    value={matchingMode}
                    onChange={(e) => setMatchingMode(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-200 text-sm focus:outline-none focus:border-emerald-500"
                  >
                    <option value="EXACT_AMOUNT_AND_REF">Exact Amount & Reference</option>
                    <option value="REF_ONLY">Reference Pattern Only</option>
                    <option value="AMOUNT_FUZZY">Amount Fuzzy Matching</option>
                    <option value="RAAST_ALIAS_MATCH">Raast Alias & Mobile Match</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300">Min Transaction Amount (PKR)</label>
                  <input
                    type="number"
                    required
                    value={minAmount}
                    onChange={(e) => setMinAmount(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-200 font-mono text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300">Max Transaction Amount (PKR)</label>
                  <input
                    type="number"
                    required
                    value={maxAmount}
                    onChange={(e) => setMaxAmount(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-200 font-mono text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">Reference Pattern / Regex *</label>
                <input
                  type="text"
                  required
                  value={refPattern}
                  onChange={(e) => setRefPattern(e.target.value)}
                  placeholder="e.g. TENANT-[0-9]{3,6} or RAAST"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-200 font-mono text-sm focus:outline-none focus:border-emerald-500"
                />
                <p className="text-[11px] text-slate-500">Regular expression or keyword substring searched in bank statement transaction particulars.</p>
              </div>

              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoApprove}
                    onChange={(e) => setAutoApprove(e.target.checked)}
                    className="w-4 h-4 accent-emerald-600 rounded bg-slate-950 border-slate-800"
                  />
                  <span className="text-sm font-medium text-slate-200">Auto-Approve Matching Transactions</span>
                </label>

                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={ruleActive}
                    onChange={(e) => setRuleActive(e.target.checked)}
                    className="w-4 h-4 accent-emerald-600 rounded bg-slate-950 border-slate-800"
                  />
                  <span className="text-sm font-medium text-slate-200">Active Rule</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowRuleModal(false)}
                  className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium rounded-xl transition text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-xl transition text-sm shadow-lg shadow-emerald-600/20"
                >
                  Save Rule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
