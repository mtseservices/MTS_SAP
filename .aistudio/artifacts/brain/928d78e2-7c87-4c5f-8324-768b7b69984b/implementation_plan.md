# ERP Standardization and Localization Plan

## 1. Functional Tenant Login URLs
- **URL Structure**: `https://app.mts-erp.pk/[tenant-slug]/login`
- **Implementation**: 
  - Add a utility function `generateLoginUrl(tenantSlug: string)` to `src/services/tenantResolver.ts`.
  - Add "Copy Login URL" action buttons in:
    - Master Admin Dashboard Sidebar.
    - Tenant Management Table.
    - Client Detail View/Drawer.

## 2. Localization Strategy (Pakistani Business Market)
- **Enhanced Translations**: Extend `src/services/translations.ts` to include:
  - Standard ERP terms (GL, P&L, etc.).
  - Local Tax terminology: GST (General Sales Tax), WHT (Withholding Tax), FED (Federal Excise Duty), Advance Income Tax.
- **Implementation**: Inject these localized labels into the `EnterpriseFormTemplate` and `EnterpriseReportTemplate` components via a localization hook.

## 3. Module Standardisation (Priority Refactor)
- **Template Application**: Refactor `FinanceAccountsModule`, `InventoryModule`, and `ProcurementModule` to use:
  - `EnterpriseFormTemplate` for all data entry.
  - `EnterpriseReportTemplate` for all reporting.
- **Professional Layout**: Ensure audit trails, approval workflows, and standardized status management are active in all three modules.
