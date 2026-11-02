export interface FormField {
  id: string;
  label: string;
  type: 'text' | 'date' | 'select' | 'number' | 'radio' | 'checkbox';
  options?: string[];
  required?: boolean;
  placeholder?: string;
}

export interface ReportConfig {
  title: string;
  category: 'FINANCE' | 'INVENTORY' | 'PROCUREMENT' | 'SALES' | 'TAX' | 'CROSS_TENANT';
  fields: FormField[];
  defaultColumns: { key: string; header: string; isNumeric?: boolean }[];
}

export const ReportFormRegistry: Record<string, ReportConfig> = {
  'DAILY_POS_REP': {
    title: 'Daily POS Sales Summary',
    category: 'SALES',
    fields: [
      { id: 'fromDate', label: 'From Date', type: 'date', required: true },
      { id: 'toDate', label: 'To Date', type: 'date', required: true },
      { id: 'voucherType', label: 'Voucher Type', type: 'select', options: ['ALL VOUCHERS', 'CASH', 'CREDIT', 'CARD'] },
      { id: 'voucherNo', label: 'Voucher No', type: 'text', placeholder: 'e.g. JV-2026-089' },
      { id: 'vheaderId', label: 'Vheader ID', type: 'text', placeholder: 'Batch ID' },
      { id: 'detailLevel', label: 'Output Detail Level', type: 'radio', options: ['Detailed Entries', 'Consolidated Head Totals'] }
    ],
    defaultColumns: [
      { key: 'date', header: 'Date' },
      { key: 'voucherNo', header: 'Voucher No' },
      { key: 'branch', header: 'Branch Outlet' },
      { key: 'amount', header: 'Amount (PKR)', isNumeric: true },
      { key: 'tax', header: 'GST / WHT (PKR)', isNumeric: true },
      { key: 'netAmount', header: 'Net Amount (PKR)', isNumeric: true }
    ],
  },
  'GENERAL_LEDGER_REP': {
    title: 'General Ledger Audit Trail',
    category: 'FINANCE',
    fields: [
      { id: 'fromDate', label: 'From Date', type: 'date', required: true },
      { id: 'toDate', label: 'To Date', type: 'date', required: true },
      { id: 'accountHead', label: 'Account Head Filter', type: 'select', options: ['ALL HEADS', 'Assets', 'Liabilities', 'Equity', 'Revenue', 'Expenses'] },
      { id: 'hideZero', label: 'Hide Zero Balances', type: 'checkbox' }
    ],
    defaultColumns: [
      { key: 'voucherNo', header: 'Voucher #' },
      { key: 'date', header: 'Posting Date' },
      { key: 'accountCode', header: 'Account Code' },
      { key: 'accountName', header: 'Account Title' },
      { key: 'debit', header: 'Debit (PKR)', isNumeric: true },
      { key: 'credit', header: 'Credit (PKR)', isNumeric: true },
      { key: 'balance', header: 'Running Balance (PKR)', isNumeric: true }
    ],
  },
  'STOCK_VALUATION_REP': {
    title: 'Inventory Stock Valuation & Aging',
    category: 'INVENTORY',
    fields: [
      { id: 'warehouse', label: 'Warehouse / Godown', type: 'select', options: ['ALL WAREHOUSES', 'Main Plant WH-01', 'Distribution Depot 02'] },
      { id: 'category', label: 'Item Category', type: 'select', options: ['ALL CATEGORIES', 'Raw Materials', 'Finished Goods', 'Packaging'] },
      { id: 'asOfDate', label: 'Valuation As Of Date', type: 'date', required: true }
    ],
    defaultColumns: [
      { key: 'itemCode', header: 'SKU / Item Code' },
      { key: 'itemName', header: 'Item Description' },
      { key: 'warehouse', header: 'Location' },
      { key: 'quantityOnHand', header: 'Quantity On Hand', isNumeric: true },
      { key: 'unitCost', header: 'Avg Unit Cost (PKR)', isNumeric: true },
      { key: 'totalValuation', header: 'Total Value (PKR)', isNumeric: true },
      { key: 'stockStatus', header: 'Stock Health' }
    ],
  },
  'PROCUREMENT_PO_REP': {
    title: 'Purchase Order & Requisition Register',
    category: 'PROCUREMENT',
    fields: [
      { id: 'fromDate', label: 'From Date', type: 'date', required: true },
      { id: 'toDate', label: 'To Date', type: 'date', required: true },
      { id: 'vendor', label: 'Supplier / Vendor', type: 'select', options: ['ALL VENDORS', 'Engro Chemicals', 'Packages Ltd', 'Siemens Engineering'] },
      { id: 'status', label: 'Order Status', type: 'select', options: ['ALL', 'DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'RECEIVED'] }
    ],
    defaultColumns: [
      { key: 'poNumber', header: 'PO Number' },
      { key: 'date', header: 'Issue Date' },
      { key: 'vendorName', header: 'Vendor Name' },
      { key: 'itemsCount', header: 'Lines', isNumeric: true },
      { key: 'totalAmount', header: 'Total PO Value (PKR)', isNumeric: true },
      { key: 'whtDeducted', header: 'WHT Deducted (PKR)', isNumeric: true },
      { key: 'status', header: 'Approval Status' }
    ],
  },
  'CROSS_TENANT_PERFORMANCE': {
    title: 'Cross-Tenant Consolidated Enterprise Performance',
    category: 'CROSS_TENANT',
    fields: [
      { id: 'fiscalYear', label: 'Fiscal Year', type: 'select', options: ['FY 2025-2026', 'FY 2024-2025', 'Custom Range'] },
      { id: 'comparisonMetric', label: 'Analysis Metric', type: 'select', options: ['Financial Turnover & Taxes', 'Inventory Assets', 'Voucher & Transaction Volume'] }
    ],
    defaultColumns: [
      { key: 'tenantName', header: 'Client Enterprise' },
      { key: 'industry', header: 'Industry Package' },
      { key: 'totalRevenue', header: 'Gross Revenue (PKR)', isNumeric: true },
      { key: 'taxLiability', header: 'GST / WHT (PKR)', isNumeric: true },
      { key: 'inventoryValuation', header: 'Inventory Assets (PKR)', isNumeric: true },
      { key: 'vouchersPosted', header: 'Transactions / JV', isNumeric: true },
      { key: 'licenseUtilization', header: 'Active Users / Cap' },
      { key: 'auditStatus', header: 'Audit Status' }
    ],
  }
};
