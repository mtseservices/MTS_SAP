# Implementation Plan - Chart of Accounts Master Form & 5-Tier Tree View

## Proposed Changes

### 1. Create `src/components/client/finance/ChartOfAccountsModule.tsx`
- Build a production-grade SAP-style Chart of Accounts master form and management component.
- **Key Features**:
  - **5-Tier Hierarchical Tree View**: Expandable nodes (Account Groups → Main Accounts → Sub Accounts → Child Accounts → Cost Centres) with clear parent-child indentation.
  - **Inline Editing & Creation**: Modal and inline actions for adding/editing account nodes with auto-generated account codes, duplicate validation, and status toggles (Active/Inactive).
  - **Filtering & Search**: Instant search by account name/code and category filtering (Assets, Liabilities, Equity, Revenue, Expenses).
  - **Validation Rules**: Mandatory field checking (Code, Name, Category, Normal Balance), parent reference integrity, and un-deletable system control accounts protection.

### 2. Integrate into Client Finance Modules (`src/components/client/CompanySettingsModule.tsx` or main Finance navigation)
- Register `ChartOfAccountsModule` in the client accounts navigation so users can access and manage the master COA.

## Verification Plan
- Run `lint_applet` to verify TypeScript type correctness.
- Run `compile_applet` to ensure successful build.
- Visually test tree expansion, inline editing, account creation, and validation rules.
