import {
  collection,
  doc,
  setDoc,
  getDocs,
  onSnapshot
} from 'firebase/firestore';
import { db, auth } from './firebaseConfig';
import { AccountHead, JournalVoucher } from '../types/erp';
import { INITIAL_ACCOUNTS, INITIAL_VOUCHERS } from './mockData';

export interface GeneralLedgerEntry {
  id: string;
  voucherId: string;
  voucherNo: string;
  date: string;
  type: string;
  accountId: string;
  accountCode: string;
  accountName: string;
  debit: number;
  credit: number;
  narration: string;
  referenceNo: string;
  createdAt: string;
}

export interface SubLedgerEntry {
  id: string;
  voucherNo: string;
  date: string;
  category: string; // Accounts Receivable, Accounts Payable, Bank, Cash
  accountCode: string;
  accountName: string;
  particulars: string;
  debit: number;
  credit: number;
  runningBalance: number;
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: string;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
  };
}

function handleFirestoreError(error: unknown, op: string, path: string) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid || 'anonymous_tenant',
      email: auth.currentUser?.email || null,
      emailVerified: auth.currentUser?.emailVerified || false,
      isAnonymous: auth.currentUser?.isAnonymous || true,
      tenantId: auth.currentUser?.tenantId || null,
    },
    operationType: op,
    path
  };
  console.error('Firestore Error:', JSON.stringify(errInfo));
}

// 1. Real-Time COA Accounts Subscription
export function subscribeCompanyAccounts(
  companyId: string,
  onData: (accounts: AccountHead[]) => void
) {
  const safeCompId = companyId || 'default_company';
  const coaCol = collection(db, 'companies', safeCompId, 'accounts');

  const unsubscribe = onSnapshot(
    coaCol,
    (snapshot) => {
      if (snapshot.empty) {
        INITIAL_ACCOUNTS.forEach((acc) => {
          setDoc(doc(db, 'companies', safeCompId, 'accounts', acc.id), acc).catch((err) =>
            handleFirestoreError(err, 'seed_account', `companies/${safeCompId}/accounts/${acc.id}`)
          );
        });
        onData(INITIAL_ACCOUNTS);
      } else {
        const loaded: AccountHead[] = [];
        snapshot.forEach((docSnap) => {
          loaded.push(docSnap.data() as AccountHead);
        });
        loaded.sort((a, b) => a.code.localeCompare(b.code));
        onData(loaded);
      }
    },
    (error) => {
      handleFirestoreError(error, 'subscribe_accounts', `companies/${safeCompId}/accounts`);
      onData(INITIAL_ACCOUNTS);
    }
  );

  return unsubscribe;
}

// 2. Real-Time Vouchers Subscription
export function subscribeCompanyVouchers(
  companyId: string,
  onData: (vouchers: JournalVoucher[]) => void
) {
  const safeCompId = companyId || 'default_company';
  const vouchersCol = collection(db, 'companies', safeCompId, 'vouchers');

  const unsubscribe = onSnapshot(
    vouchersCol,
    (snapshot) => {
      if (snapshot.empty) {
        INITIAL_VOUCHERS.forEach((v) => {
          setDoc(doc(db, 'companies', safeCompId, 'vouchers', v.id), v).catch((err) =>
            handleFirestoreError(err, 'seed_voucher', `companies/${safeCompId}/vouchers/${v.id}`)
          );
        });
        onData(INITIAL_VOUCHERS);
      } else {
        const loaded: JournalVoucher[] = [];
        snapshot.forEach((docSnap) => {
          loaded.push(docSnap.data() as JournalVoucher);
        });
        loaded.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        onData(loaded);
      }
    },
    (error) => {
      handleFirestoreError(error, 'subscribe_vouchers', `companies/${safeCompId}/vouchers`);
      onData(INITIAL_VOUCHERS);
    }
  );

  return unsubscribe;
}

// 3. Real-Time General Ledger Subscription
export function subscribeGeneralLedger(
  companyId: string,
  onData: (glEntries: GeneralLedgerEntry[]) => void
) {
  const safeCompId = companyId || 'default_company';
  const glCol = collection(db, 'companies', safeCompId, 'general_ledger');

  return onSnapshot(
    glCol,
    (snapshot) => {
      const loaded: GeneralLedgerEntry[] = [];
      snapshot.forEach((docSnap) => {
        loaded.push(docSnap.data() as GeneralLedgerEntry);
      });
      loaded.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      onData(loaded);
    },
    (error) => {
      handleFirestoreError(error, 'subscribe_gl', `companies/${safeCompId}/general_ledger`);
      onData([]);
    }
  );
}

// 4. Real-Time Sub-Ledger Subscription
export function subscribeSubLedgers(
  companyId: string,
  onData: (subEntries: SubLedgerEntry[]) => void
) {
  const safeCompId = companyId || 'default_company';
  const subCol = collection(db, 'companies', safeCompId, 'subledgers');

  return onSnapshot(
    subCol,
    (snapshot) => {
      const loaded: SubLedgerEntry[] = [];
      snapshot.forEach((docSnap) => {
        loaded.push(docSnap.data() as SubLedgerEntry);
      });
      loaded.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      onData(loaded);
    },
    (error) => {
      handleFirestoreError(error, 'subscribe_subledgers', `companies/${safeCompId}/subledgers`);
      onData([]);
    }
  );
}

// 5. Post New Journal Voucher & Automatically Update General Ledger, Sub-Ledger & COA
export async function postVoucherToFirebase(
  companyId: string,
  newVoucher: JournalVoucher,
  currentAccounts: AccountHead[]
) {
  const safeCompId = companyId || 'default_company';

  try {
    // A. Save Journal Voucher
    await setDoc(doc(db, 'companies', safeCompId, 'vouchers', newVoucher.id), newVoucher);

    // B. Save General Ledger & Sub-Ledger line items + Update COA balances
    const updatedAccountsMap = new Map<string, number>();

    for (const item of newVoucher.items) {
      const debitVal = Number(item.debit) || 0;
      const creditVal = Number(item.credit) || 0;
      const netChange = debitVal - creditVal;

      const existingNet = updatedAccountsMap.get(item.accountId) || 0;
      updatedAccountsMap.set(item.accountId, existingNet + netChange);

      // Save General Ledger Entry
      const glEntryId = `gl_${newVoucher.id}_${item.accountId}_${Math.random().toString(36).substr(2, 4)}`;
      const glDoc: GeneralLedgerEntry = {
        id: glEntryId,
        voucherId: newVoucher.id,
        voucherNo: newVoucher.voucherNo,
        date: newVoucher.date,
        type: newVoucher.type,
        accountId: item.accountId,
        accountCode: item.accountCode,
        accountName: item.accountName,
        debit: debitVal,
        credit: creditVal,
        narration: newVoucher.narration,
        referenceNo: newVoucher.referenceNo,
        createdAt: new Date().toISOString()
      };
      await setDoc(doc(db, 'companies', safeCompId, 'general_ledger', glEntryId), glDoc);

      // Check if Sub-Ledger entry needed
      const targetAcc = currentAccounts.find((a) => a.id === item.accountId);
      if (
        targetAcc &&
        (targetAcc.category.includes('Receivable') ||
          targetAcc.category.includes('Payable') ||
          targetAcc.category.includes('Bank') ||
          targetAcc.category.includes('Cash'))
      ) {
        const subEntryId = `sub_${newVoucher.id}_${item.accountId}_${Math.random().toString(36).substr(2, 4)}`;
        const subDoc: SubLedgerEntry = {
          id: subEntryId,
          voucherNo: newVoucher.voucherNo,
          date: newVoucher.date,
          category: targetAcc.category,
          accountCode: item.accountCode,
          accountName: item.accountName,
          particulars: item.description || newVoucher.narration,
          debit: debitVal,
          credit: creditVal,
          runningBalance: targetAcc.balance + (debitVal - creditVal)
        };
        await setDoc(doc(db, 'companies', safeCompId, 'subledgers', subEntryId), subDoc);
      }
    }

    // C. Recalculate and update COA Balances
    for (const [accId, netChange] of updatedAccountsMap.entries()) {
      const targetAcc = currentAccounts.find((a) => a.id === accId);
      if (targetAcc) {
        const isDebitNormal = targetAcc.type === 'Asset' || targetAcc.type === 'Expense';
        const adjustment = isDebitNormal ? netChange : -netChange;
        const newBalance = targetAcc.balance + adjustment;

        const updatedAccDoc: AccountHead = {
          ...targetAcc,
          balance: newBalance
        };

        await setDoc(doc(db, 'companies', safeCompId, 'accounts', accId), updatedAccDoc);
      }
    }

    console.log(`Journal Voucher ${newVoucher.voucherNo} posted to GL & Sub-Ledger in Firebase.`);
  } catch (err) {
    handleFirestoreError(err, 'post_voucher', `companies/${safeCompId}/vouchers/${newVoucher.id}`);
  }
}

// 6. Add new Account Head to Chart of Accounts
export async function saveAccountHeadToFirebase(companyId: string, account: AccountHead) {
  const safeCompId = companyId || 'default_company';
  try {
    await setDoc(doc(db, 'companies', safeCompId, 'accounts', account.id), account);
  } catch (err) {
    handleFirestoreError(err, 'save_account', `companies/${safeCompId}/accounts/${account.id}`);
  }
}

// 7. Budget Planning Real-Time Functions
export interface BudgetItem {
  id: string;
  category: string;
  accountCode: string;
  accountName: string;
  projectedAmount: number;
  fiscalYear: string;
}

export const INITIAL_BUDGETS: BudgetItem[] = [
  { id: 'b_01', category: 'Cost of Goods Sold', accountCode: '5010', accountName: 'Cost of Goods Sold (COGS)', projectedAmount: 95000000, fiscalYear: '2026-2027' },
  { id: 'b_02', category: 'Operating Expense', accountCode: '5020', accountName: 'Factory Salaries & Payroll', projectedAmount: 15000000, fiscalYear: '2026-2027' },
  { id: 'b_03', category: 'Operating Expense', accountCode: '5030', accountName: 'Plant Utilities & Fuel', projectedAmount: 6500000, fiscalYear: '2026-2027' },
  { id: 'b_04', category: 'Operating Expense', accountCode: '5040', accountName: 'Logistics & Freight', projectedAmount: 4500000, fiscalYear: '2026-2027' },
  { id: 'b_05', category: 'Commercial Expense', accountCode: '5050', accountName: 'Marketing & Distribution', projectedAmount: 3500000, fiscalYear: '2026-2027' }
];

export function subscribeCompanyBudgets(
  companyId: string,
  onData: (budgets: BudgetItem[]) => void
) {
  const safeCompId = companyId || 'default_company';
  const budgetsCol = collection(db, 'companies', safeCompId, 'budgets');

  return onSnapshot(
    budgetsCol,
    (snapshot) => {
      if (snapshot.empty) {
        INITIAL_BUDGETS.forEach((b) => {
          setDoc(doc(db, 'companies', safeCompId, 'budgets', b.id), b).catch((err) =>
            handleFirestoreError(err, 'seed_budget', `companies/${safeCompId}/budgets/${b.id}`)
          );
        });
        onData(INITIAL_BUDGETS);
      } else {
        const loaded: BudgetItem[] = [];
        snapshot.forEach((docSnap) => {
          loaded.push(docSnap.data() as BudgetItem);
        });
        onData(loaded);
      }
    },
    (error) => {
      handleFirestoreError(error, 'subscribe_budgets', `companies/${safeCompId}/budgets`);
      onData(INITIAL_BUDGETS);
    }
  );
}

export async function saveBudgetToFirebase(companyId: string, budget: BudgetItem) {
  const safeCompId = companyId || 'default_company';
  try {
    await setDoc(doc(db, 'companies', safeCompId, 'budgets', budget.id), budget);
  } catch (err) {
    handleFirestoreError(err, 'save_budget', `companies/${safeCompId}/budgets/${budget.id}`);
  }
}

