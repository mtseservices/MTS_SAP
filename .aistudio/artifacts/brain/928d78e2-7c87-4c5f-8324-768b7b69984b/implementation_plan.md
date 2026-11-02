# ERP Report & Form Standardization Plan

## 1. Central Configuration Registry
- **File**: `src/config/reportFormRegistry.ts`
- **Purpose**: A central TypeScript/JSON registry mapping report/form IDs to their required fields, validation rules, and default columns.
- **Structure**:
  ```typescript
  export const ReportFormRegistry = {
    'DAILY_POS_REP': {
      title: 'Daily POS Sales Summary',
      fields: ['fromDate', 'toDate', 'voucherType', 'voucherNo', 'vheaderId', 'detailLevel'],
      defaultColumns: ['date', 'voucherNo', 'amount', 'tax', 'netAmount'],
    },
    // ... add mappings for 130+ modules
  };
  ```

## 2. Dynamic Component Framework
- **EnterpriseFormFactory**: A new component that takes a `formId` from the registry and renders the appropriate UI components dynamically.
- **EnterpriseReportTable**: A new component that takes a `reportId` and dynamically builds columns based on the registry.

## 3. Implementation Roadmap
1. **Foundation**: Create `src/config/reportFormRegistry.ts` with initial mappings for Finance, Inventory, and Sales.
2. **Infrastructure**: Implement `EnterpriseFormFactory` and `EnterpriseReportTable` to read from this registry.
3. **Migration**: Refactor existing modules (`FinanceAccountsModule`, `InventoryModule`, etc.) to replace hardcoded popups with the new factory components.
4. **List View Standardization**: Implement a standardized `DataTable` component that accepts `defaultColumns` from the registry for all invoice/bill/voucher lists.
