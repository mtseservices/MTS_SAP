import { MasterBankAccount } from '../types/erp';
import { db } from './firebaseConfig';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const STORAGE_KEY = 'mts_master_bank_accounts';

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

export async function getMasterBankAccounts(): Promise<MasterBankAccount[]> {
  try {
    // Attempt Firestore load first
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

  // Fallback to localStorage or initial
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
  // Save to local storage
  localStorage.setItem(STORAGE_KEY, JSON.stringify(accounts));

  // Save to Firestore
  try {
    const docRef = doc(db, 'system', 'masterBankAccounts');
    await setDoc(docRef, { accounts, updatedAt: new Date().toISOString() });
  } catch (err) {
    console.warn('Could not sync master bank accounts to Firestore:', err);
  }
}
