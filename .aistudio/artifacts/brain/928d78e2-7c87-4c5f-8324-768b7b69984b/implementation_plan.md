# Implementation Plan - Client Dashboard 'Liquidity Overview' Widget

Implement a real-time 'Liquidity Overview' widget on the main **Client Dashboard** (`ClientDashboard.tsx`) that aggregates live balances from the master receiving bank accounts (`MasterBankAccountManager` / `masterBankAccountsService`) synchronized with company General Ledger bank accounts (`subscribeCompanyAccounts`).

---

## User Requirements & Architecture

1. **Total Available Liquidity KPI**: Display net combined cash & bank liquid funds in PKR with status indicators (e.g. SBP/1Link Reconciled).
2. **Individual Bank Account Breakdown**: Display each Master Bank Account (e.g. Meezan Bank, HBL, UBL, MCB) with account title, masked account/IBAN number, branch details, and current reconciled balance calculated from GL transactions.
3. **Primary Default Tag**: Highlight the primary default gateway account designated for client invoice collection.
4. **Quick Reconcile Action**: Direct navigation button triggering the Bank Reconciliation Report / Statement Parser subtabs in Finance & Accounts module.

---

## Technical Tasks

### 1. Data Retrieval & Service Integration
- Load Master Bank Accounts using `getMasterBankAccounts()` from `masterBankAccountsService.ts`.
- Connect real-time Firebase listener `subscribeCompanyAccounts(companyId)` in `ClientDashboard.tsx` to map GL balances to corresponding master bank accounts by account name or bank code.

### 2. Client Dashboard Component Update (`src/components/client/ClientDashboard.tsx`)
- Add new `Liquidity Overview` section at the top of the dashboard financial KPI row.
- Render total liquid capital, individual bank cards/list with logos, IBAN display, default gateway badge, and "Quick Reconcile" button routing to the Finance module.

### 3. Verification & Build
- Run `compile_applet` and `lint_applet` to ensure zero compilation or linter errors.

---

## User Review Request

Please review this plan and click **Proceed** to implement the Liquidity Overview widget.
