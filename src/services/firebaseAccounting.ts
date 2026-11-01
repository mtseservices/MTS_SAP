import {
  collection,
  doc,
  setDoc,
  getDocs,
  onSnapshot,
  query,
  orderBy
} from 'firebase/firestore';
import { db } from './firebaseConfig';
import { AccountHead, JournalVoucher } from '../types/erp';
import { INITIAL_ACCOUNTS, INITIAL_VOUCHERS } from './mockData';

// Helper for error handling
function handleFirestoreError(error: unknown, op: string, path: string) {
  console.error(`Firebase ${op} Error on [${path}]:`, error);
}

// Subscribe to real-time company Chart of Accounts
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
        // Seed initial accounts for company if empty
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
        // Sort by account code
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

// Subscribe to real-time company Journal & Payment Vouchers
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
        // Seed initial vouchers for company
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

// Post new Voucher and automatically update affected Account Head Balances in real-time
export async function postVoucherToFirebase(
  companyId: string,
  newVoucher: JournalVoucher,
  currentAccounts: AccountHead[]
) {
  const safeCompId = companyId || 'default_company';

  try {
    // 1. Save voucher document
    await setDoc(doc(db, 'companies', safeCompId, 'vouchers', newVoucher.id), newVoucher);

    // 2. Automatically update affected COA account balances
    const updatedAccountsMap = new Map<string, number>();

    newVoucher.items.forEach((item) => {
      const netChange = (Number(item.debit) || 0) - (Number(item.credit) || 0);
      const existingNet = updatedAccountsMap.get(item.accountId) || 0;
      updatedAccountsMap.set(item.accountId, existingNet + netChange);
    });

    for (const [accId, netChange] of updatedAccountsMap.entries()) {
      const targetAcc = currentAccounts.find((a) => a.id === accId);
      if (targetAcc) {
        // For Assets & Expenses, debit increases balance. For Income & Equity, credit increases balance.
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
    console.log(`Voucher ${newVoucher.voucherNo} posted & balances recalculated in Firebase.`);
  } catch (err) {
    handleFirestoreError(err, 'post_voucher', `companies/${safeCompId}/vouchers/${newVoucher.id}`);
  }
}

// Add new Account Head to Chart of Accounts
export async function saveAccountHeadToFirebase(companyId: string, account: AccountHead) {
  const safeCompId = companyId || 'default_company';
  try {
    await setDoc(doc(db, 'companies', safeCompId, 'accounts', account.id), account);
  } catch (err) {
    handleFirestoreError(err, 'save_account', `companies/${safeCompId}/accounts/${account.id}`);
  }
}
