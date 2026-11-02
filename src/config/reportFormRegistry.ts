export interface FormField {
  id: string;
  label: string;
  type: 'text' | 'date' | 'select' | 'number' | 'radio';
  options?: string[];
  required?: boolean;
}

export interface ReportConfig {
  title: string;
  fields: FormField[];
  defaultColumns: { key: string; header: string }[];
}

export const ReportFormRegistry: Record<string, ReportConfig> = {
  'DAILY_POS_REP': {
    title: 'Daily POS Sales Summary',
    fields: [
      { id: 'fromDate', label: 'From Date', type: 'date', required: true },
      { id: 'toDate', label: 'To Date', type: 'date', required: true },
      { id: 'voucherType', label: 'Voucher Type', type: 'select', options: ['ALL VOUCHERS', 'CASH', 'CREDIT'] },
      { id: 'voucherNo', label: 'Voucher No', type: 'text' },
      { id: 'vheaderId', label: 'Vheader ID', type: 'text' },
      { id: 'detailLevel', label: 'Output Detail Level', type: 'radio', options: ['Detailed Entries', 'Consolidated Head Totals'] }
    ],
    defaultColumns: [
      { key: 'date', header: 'Date' },
      { key: 'voucherNo', header: 'Voucher No' },
      { key: 'amount', header: 'Amount (PKR)' },
      { key: 'tax', header: 'GST/WHT (PKR)' },
      { key: 'netAmount', header: 'Net Amount (PKR)' }
    ],
  },
};
