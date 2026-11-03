import { MasterBankAccount, ReconciliationRule, BankAuditEntry } from '../types/erp';
import { db } from './firebaseConfig';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const STORAGE_KEY = 'mts_master_bank_accounts';
const RULES_STORAGE_KEY = 'mts_master_reconciliation_rules';

export const INITIAL_MASTER_BANK_ACCOUNTS: MasterBankAccount[] = [
  {
    id: 'm_acc_01',
    bankName: 'Meezan Bank Limited',
    accountTitle: 'MTS ERP FUTURE SOLUTIONS (PVT) LIMITED',
    accountNumber: '02010104889211',
    iban: 'PK36MEZN0002010104889211',
    branchName: 'Main Boulevard Gulberg Branch, Lahore',
    branchCode: '0201',
    swiftCode: 'MEZNPKKA',
    raastId: '03001234567',
    isDefault: true,
    isActive: true,
    instructions: 'Use this primary Islamic banking account for IBFT and RTGS subscription payments. Please mention your Tenant ID in the transfer remarks.',
    createdAt: '2026-01-15'
  },
  {
    id: 'm_acc_02',
    bankName: 'Habib Bank Limited (HBL)',
    accountTitle: 'MTS ERP FUTURE SOLUTIONS (PVT) LIMITED',
    accountNumber: '10927901234503',
    iban: 'PK42HABB0010927901234503',
    branchName: 'Corporate Centre Branch, I.I. Chundrigar Road, Karachi',
    branchCode: '1092',
    swiftCode: 'HABBPKKA',
    raastId: '03217654321',
    isDefault: false,
    isActive: true,
    instructions: 'For conventional corporate bank transfers, CDM cash deposits, and 1Link online inter-bank funds transfer.',
    createdAt: '2026-02-01'
  },
  {
    id: 'm_acc_03',
    bankName: 'Bank Alfalah Limited',
    accountTitle: 'MTS ERP FUTURE SOLUTIONS (PVT) LIMITED',
    accountNumber: '55010098765432',
    iban: 'PK19ALFH0055010098765432',
    branchName: 'F-7 Markaz Branch, Blue Area, Islamabad',
    branchCode: '5501',
    swiftCode: 'ALFHPKKA',
    raastId: 'raast@mtserp.pk',
    isDefault: false,
    isActive: true,
    instructions: 'Direct clearing account for North Region clients and Raast ID instant zero-fee settlement.',
    createdAt: '2026-03-10'
  }
];

export const INITIAL_RECONCILIATION_RULES: ReconciliationRule[] = [
  {
    id: 'rule_01',
    ruleName: 'Standard Tenant Subscription ID Pattern',
    bankId: 'ALL',
    minTransactionAmount: 5000,
    maxTransactionAmount: 10000000,
    referencePattern: 'TENANT-[0-9]{3,6}',
    matchingMode: 'EXACT_AMOUNT_AND_REF',
    autoApprove: true,
    isActive: true,
    createdAt: '2026-01-15'
  },
  {
    id: 'rule_02',
    ruleName: 'Raast Instant Transfer Alias Match',
    bankId: 'm_acc_01',
    minTransactionAmount: 1000,
    maxTransactionAmount: 500000,
    referencePattern: 'RAAST|MTSERP',
    matchingMode: 'RAAST_ALIAS_MATCH',
    autoApprove: true,
    isActive: true,
    createdAt: '2026-02-01'
  },
  {
    id: 'rule_03',
    ruleName: 'High Value Corporate Wire Transfer Review',
    bankId: 'ALL',
    minTransactionAmount: 500000,
    maxTransactionAmount: 50000000,
    referencePattern: 'WIRE|RTGS|CORP',
    matchingMode: 'REF_ONLY',
    autoApprove: false,
    isActive: true,
    createdAt: '2026-03-10'
  }
];

export async function getMasterBankAccounts(): Promise<MasterBankAccount[]> {
  try {
    const docRef = doc(db, 'system', 'masterBankAccounts');
    const docSnap = await getDoc(docRef);
    if (docSnap.exists() && docSnap.data()?.accounts) {
      const accounts = docSnap.data().accounts as MasterBankAccount[];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(accounts));
      return accounts;
    }
  } catch (err) {
    console.warn('Firestore master bank accounts load fallback to local:', err);
  }

  const cached = localStorage.getItem(STORAGE_KEY);
  if (cached) {
    try {
      return JSON.parse(cached);
    } catch {
      // fallback
    }
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_MASTER_BANK_ACCOUNTS));
  return INITIAL_MASTER_BANK_ACCOUNTS;
}

export async function saveMasterBankAccounts(accounts: MasterBankAccount[]): Promise<void> {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(accounts));
  try {
    const docRef = doc(db, 'system', 'masterBankAccounts');
    await setDoc(docRef, { accounts, updatedAt: new Date().toISOString() }, { merge: true });
  } catch (err) {
    console.warn('Could not sync master bank accounts to Firestore:', err);
  }
}

export async function getMasterReconciliationRules(): Promise<ReconciliationRule[]> {
  try {
    const docRef = doc(db, 'system', 'masterBankAccounts');
    const docSnap = await getDoc(docRef);
    if (docSnap.exists() && docSnap.data()?.rules) {
      const rules = docSnap.data().rules as ReconciliationRule[];
      localStorage.setItem(RULES_STORAGE_KEY, JSON.stringify(rules));
      return rules;
    }
  } catch (err) {
    console.warn('Firestore reconciliation rules load fallback to local:', err);
  }

  const cached = localStorage.getItem(RULES_STORAGE_KEY);
  if (cached) {
    try {
      return JSON.parse(cached);
    } catch {
      // fallback
    }
  }

  localStorage.setItem(RULES_STORAGE_KEY, JSON.stringify(INITIAL_RECONCILIATION_RULES));
  return INITIAL_RECONCILIATION_RULES;
}

export async function saveMasterReconciliationRules(rules: ReconciliationRule[]): Promise<void> {
  localStorage.setItem(RULES_STORAGE_KEY, JSON.stringify(rules));
  try {
    const docRef = doc(db, 'system', 'masterBankAccounts');
    await setDoc(docRef, { rules, updatedAt: new Date().toISOString() }, { merge: true });
  } catch (err) {
    console.warn('Could not sync reconciliation rules to Firestore:', err);
  }
}

// --- BANK AUDIT LOGGING ---
const AUDIT_STORAGE_KEY = 'mts_master_bank_audit_logs';

export const INITIAL_BANK_AUDIT_LOGS: BankAuditEntry[] = [
  {
    id: 'bank_audit_01',
    action: 'ADD_BANK',
    bankId: 'm_acc_01',
    bankName: 'Meezan Bank Limited',
    adminId: 'usr_master_01',
    adminName: 'Master Admin (mtssolutions.pk@gmail.com)',
    details: 'Provisioned primary receiving account for Meezan Bank IBFT / RTGS (IBAN: PK36MEZN0002010104889211)',
    timestamp: '2026-01-15T09:12:00Z',
    ipAddress: '182.185.120.45'
  },
  {
    id: 'bank_audit_02',
    action: 'SET_DEFAULT_BANK',
    bankId: 'm_acc_01',
    bankName: 'Meezan Bank Limited',
    adminId: 'usr_master_01',
    adminName: 'Master Admin (mtssolutions.pk@gmail.com)',
    details: 'Set Meezan Bank Limited as default gateway for automated SBP/1Link reconciliation',
    timestamp: '2026-01-15T09:15:22Z',
    ipAddress: '182.185.120.45'
  },
  {
    id: 'bank_audit_03',
    action: 'ADD_RULE',
    bankName: 'All Master Banks',
    adminId: 'usr_master_01',
    adminName: 'Master Admin (mtssolutions.pk@gmail.com)',
    details: 'Created automated reconciliation rule "Standard Tenant Subscription ID Pattern" with regex TENANT-[0-9]{3,6}',
    timestamp: '2026-01-15T09:30:10Z',
    ipAddress: '182.185.120.45'
  }
];

export async function getMasterBankAuditLogs(): Promise<BankAuditEntry[]> {
  try {
    const docRef = doc(db, 'system', 'masterBankAccounts');
    const docSnap = await getDoc(docRef);
    if (docSnap.exists() && docSnap.data()?.auditLogs) {
      const logs = docSnap.data().auditLogs as BankAuditEntry[];
      localStorage.setItem(AUDIT_STORAGE_KEY, JSON.stringify(logs));
      return logs;
    }
  } catch (err) {
    console.warn('Firestore bank audit logs load fallback to local:', err);
  }

  const cached = localStorage.getItem(AUDIT_STORAGE_KEY);
  if (cached) {
    try {
      return JSON.parse(cached);
    } catch {
      // fallback
    }
  }

  localStorage.setItem(AUDIT_STORAGE_KEY, JSON.stringify(INITIAL_BANK_AUDIT_LOGS));
  return INITIAL_BANK_AUDIT_LOGS;
}

export async function logBankAuditAction(
  action: BankAuditEntry['action'],
  details: string,
  bankId?: string,
  bankName?: string,
  changes?: BankAuditEntry['changes']
): Promise<BankAuditEntry> {
  const currentLogs = await getMasterBankAuditLogs();

  const newEntry: BankAuditEntry = {
    id: `bank_audit_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    action,
    bankId,
    bankName,
    adminId: 'usr_master_admin_01',
    adminName: 'Master Admin (mtssolutions.pk@gmail.com)',
    details,
    changes,
    timestamp: new Date().toISOString(),
    ipAddress: '182.185.120.' + Math.floor(10 + Math.random() * 200)
  };

  const updatedLogs = [newEntry, ...currentLogs];
  localStorage.setItem(AUDIT_STORAGE_KEY, JSON.stringify(updatedLogs));

  try {
    const docRef = doc(db, 'system', 'masterBankAccounts');
    await setDoc(docRef, { auditLogs: updatedLogs, updatedAt: new Date().toISOString() }, { merge: true });
  } catch (err) {
    console.warn('Could not sync bank audit logs to Firestore:', err);
  }

  // Also log to global auditLogger
  try {
    const { auditLogger } = await import('./auditLogger');
    await auditLogger.logAction({
      tenantId: 'system_master',
      userId: newEntry.adminId,
      userName: newEntry.adminName,
      userRole: 'MASTER_ADMIN',
      actionType: 'SETTINGS_CHANGE',
      module: 'Master Bank Setup',
      details: `[${action}] ${details}`
    });
  } catch {
    // silent fallback
  }

  return newEntry;
}
