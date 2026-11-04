# Implementation Plan - FinanceAccountsModule Sub-Tabs Structure

## Proposed Changes

### `src/components/client/FinanceAccountsModule.tsx`
- Refactor the sub-tab navigation header to display sleek top navigation pills with badge counters for:
  1. **Chart of Accounts** (5-tier hierarchical tree view and master form management)
  2. **Journal Vouchers** (Voucher registers, JV/PV/RV/CV transaction forms, debit/credit balancing validation)
  3. **Financial Reports** (General Ledger audit trail, Trial Balance, Profit & Loss, Balance Sheet, Bank Reconciliation)
- Ensure smooth switching, responsive layout, and real-time Firebase accounting sync.

## Verification Plan
- Run `lint_applet` to verify TypeScript type correctness.
- Run `compile_applet` to ensure successful build.
- Test switching between the 3 main sub-tabs in `FinanceAccountsModule`.
