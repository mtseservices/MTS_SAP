import { MasterBankAccount, ReconciliationRule } from '../types/erp';
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
