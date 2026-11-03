# Implementation Plan - Bank Statement Parser, Industry Core AI Auto-Modules & Comprehensive Subscription Plan Editor

Build the Automated Statement Parser in the Finance module, implement industry-tailored AI module & department mappings for all 24+ business types in Industry Core Manager, and expand the Subscription Plan Editor with all missed properties (Business Suitability, Users, Branches, Quotas, Alerts, Logins).

## 1. Automated Statement Parser in Finance Module
- **Component**: Create `src/components/client/AutomatedStatementParser.tsx` and integrate it as a subtab in `FinanceAccountsModule.tsx`.
- **Bank Selection**: Provide a dropdown listing all major Pakistani banks (HBL, MCB, UBL, Meezan, Bank Alfalah, Allied Bank, Faysal, Askari, etc.) from `PAKISTANI_BANKS_LIST`.
- **File Upload & Column Mapper**: Allow uploading statement files (CSV/Excel/PDF simulation) with automatic header detection and manual column mapping override (Date, Description/Narration, Deposit/Credit, Withdrawal/Debit, Reference/Cheque No).
- **Rule Matching Engine**: Evaluate mapped rows against Master Reconciliation Rules (min/max transaction amount, reference pattern matching, auto-approve) to generate GL vouchers or flag discrepancies.

## 2. Industry Core Manager - Distinct AI Auto-Selected Modules & Mapped Departments
- **Service**: Update `src/services/departmentCategoryMapper.ts` and `src/components/master/IndustryCoreManager.tsx`.
- **Industry Presets**: Ensure each of the 24+ business types (Import/Export, Hotel Management, Shopping Malls, Retail Store, Wholesale Shops, Trading, Courier Services, IT Services, HR Services, Manufacturing, Food & Beverage, Textile, Solar, Healthcare, etc.) has distinct, tailored active ERP modules and mapped departmental catalogs.
- **Dynamic UI**: In `IndustryCoreManager.tsx`, when selecting or creating any industry package, dynamically auto-populate its unique AI recommended active modules and mapped departments instead of showing identical defaults.

## 3. Comprehensive Subscription Plan Editor
- **Full Property Editing**: In `SubscriptionBillingManager.tsx`, ensure creating a new plan or editing an existing plan includes input fields for ALL properties:
  - Plan Name, Price (PKR), Billing Cycle (Monthly, Yearly, One-Time)
  - Business Suitability (Multi-select industry tags)
  - Max Users & Max Branches
  - SMS Quota & WhatsApp Alerts toggle
  - Vendor Portal Logins
  - Included Modules selection & Custom Layout Theme toggles
- **Sync**: Ensure edited/new subscription plans persist to local state/Firestore and seamlessly feed into the Company Registration Wizard (`CompanyRegistrationWizard.tsx`).

## Verification Plan
1. **Compilation**: Run `compile_applet` and `lint_applet` to ensure zero build or TypeScript errors.
2. **Finance Module Test**: Verify uploading bank statement files, selecting a Pakistani bank, mapping columns, and running auto-reconciliation.
3. **Industry Core Test**: Switch between business types in Industry Core Manager to confirm unique AI module selections and mapped departments for each.
4. **Subscription Plan Test**: Edit and create subscription plans with all fields (Users, Branches, SMS Quota, WhatsApp Alerts, Vendor Logins) and verify registration wizard reflection.
