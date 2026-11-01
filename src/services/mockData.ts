import {
  AccountHead,
  JournalVoucher,
  InventoryItem,
  PurchaseOrder,
  SalesInvoice,
  BillOfMaterials,
  WorkOrder,
  ProductionTask,
  Employee,
  CustomForm,
  ApprovalWorkflow,
  Branch
} from '../types/erp';

export const INITIAL_BRANCHES: Branch[] = [
  {
    id: 'br_lahore_01',
    name: 'Lahore Head Office & Plant',
    code: 'LHR-01',
    city: 'Lahore',
    address: 'Kot Lakhpat Industrial Estate, Lahore',
    phone: '+92-42-35889911',
    isMain: true
  },
  {
    id: 'br_karachi_02',
    name: 'Karachi Port & Distribution Hub',
    code: 'KHI-02',
    city: 'Karachi',
    address: 'SITE Industrial Area, Karachi',
    phone: '+92-21-32560000',
    isMain: false
  },
  {
    id: 'br_islamabad_03',
    name: 'Islamabad Regional Office',
    code: 'ISB-03',
    city: 'Islamabad',
    address: 'Blue Area, Islamabad',
    phone: '+92-51-2800111',
    isMain: false
  }
];

export const INITIAL_ACCOUNTS: AccountHead[] = [
  { id: 'acc_1010', code: '1010', name: 'Cash in Hand (PKR)', type: 'ASSET', category: 'Current Asset', balance: 4500000, currency: 'PKR', tenantId: 'tenant_albarka' },
  { id: 'acc_1020', code: '1020', name: 'Meezan Bank Operations Account', type: 'ASSET', category: 'Bank Account', balance: 28400000, currency: 'PKR', tenantId: 'tenant_albarka' },
  { id: 'acc_1030', code: '1030', name: 'Habib Bank Export Account', type: 'ASSET', category: 'Bank Account', balance: 19800000, currency: 'PKR', tenantId: 'tenant_albarka' },
  { id: 'acc_1200', code: '1200', name: 'Accounts Receivable (Customers)', type: 'ASSET', category: 'Current Asset', balance: 14200000, currency: 'PKR', tenantId: 'tenant_albarka' },
  { id: 'acc_1300', code: '1300', name: 'Finished Goods Stock', type: 'ASSET', category: 'Inventory', balance: 32500000, currency: 'PKR', tenantId: 'tenant_albarka' },
  { id: 'acc_1310', code: '1310', name: 'Raw Material Inventory', type: 'ASSET', category: 'Inventory', balance: 18600000, currency: 'PKR', tenantId: 'tenant_albarka' },
  { id: 'acc_2010', code: '2010', name: 'Accounts Payable (Vendors)', type: 'LIABILITY', category: 'Current Liability', balance: 9400000, currency: 'PKR', tenantId: 'tenant_albarka' },
  { id: 'acc_2050', code: '2050', name: 'Withholding Tax Payable (FBR NTN)', type: 'LIABILITY', category: 'Tax Liability', balance: 1850000, currency: 'PKR', tenantId: 'tenant_albarka' },
  { id: 'acc_3010', code: '3010', name: 'Paid Up Capital', type: 'EQUITY', category: 'Equity', balance: 80000000, currency: 'PKR', tenantId: 'tenant_albarka' },
  { id: 'acc_4010', code: '4010', name: 'Gross Sales Revenue', type: 'REVENUE', category: 'Operating Income', balance: 148000000, currency: 'PKR', tenantId: 'tenant_albarka' },
  { id: 'acc_5010', code: '5010', name: 'Cost of Goods Sold (COGS)', type: 'EXPENSE', category: 'Direct Expense', balance: 89000000, currency: 'PKR', tenantId: 'tenant_albarka' },
  { id: 'acc_5020', code: '5020', name: 'Factory Salaries & Payroll', type: 'EXPENSE', category: 'Operating Expense', balance: 12400000, currency: 'PKR', tenantId: 'tenant_albarka' }
];

export const INITIAL_VOUCHERS: JournalVoucher[] = [
  {
    id: 'jv_001',
    voucherNo: 'JV-2026-089',
    date: '2026-10-25',
    type: 'JOURNAL',
    branchId: 'br_lahore_01',
    referenceNo: 'REF-INV-992',
    items: [
      { accountId: 'acc_1020', accountCode: '1020', accountName: 'Meezan Bank Operations Account', description: 'Customer Payment Received', debit: 3500000, credit: 0 },
      { accountId: 'acc_1200', accountCode: '1200', accountName: 'Accounts Receivable', description: 'Clear Receivables', debit: 0, credit: 3500000 }
    ],
    totalAmount: 3500000,
    narration: 'Cheque deposit from Metro Cash & Carry Ltd against Invoice #INV-1092',
    status: 'POSTED',
    createdBy: 'Acc. Farhan Ali',
    createdAt: '2026-10-25T10:30:00Z',
    tenantId: 'tenant_albarka'
  },
  {
    id: 'jv_002',
    voucherNo: 'JV-2026-090',
    date: '2026-10-28',
    type: 'PAYMENT',
    branchId: 'br_lahore_01',
    referenceNo: 'PO-REF-881',
    items: [
      { accountId: 'acc_2010', accountCode: '2010', accountName: 'Accounts Payable', description: 'Vendor Supplier Payment', debit: 1800000, credit: 0 },
      { accountId: 'acc_1020', accountCode: '1020', accountName: 'Meezan Bank Operations Account', description: 'Bank Transfer Payment', debit: 0, credit: 1800000 }
    ],
    totalAmount: 1800000,
    narration: 'Online Bank Transfer to Engro Polymer & Chemicals for raw material batch',
    status: 'POSTED',
    createdBy: 'Acc. Farhan Ali',
    createdAt: '2026-10-28T14:15:00Z',
    tenantId: 'tenant_albarka'
  }
];

export const INITIAL_INVENTORY: InventoryItem[] = [
  {
    id: 'item_01',
    code: 'RM-FLOUR-50K',
    name: 'Premium Grade Wheat Flour (50kg Bag)',
    category: 'Raw Materials',
    uom: 'Bags',
    warehouseId: 'wh_lhr_main',
    warehouseName: 'Lahore Central Warehouse',
    unitPrice: 4200,
    purchasePrice: 3500,
    currentStock: 1250,
    reorderLevel: 200,
    batchNumber: 'BATCH-2026-10A',
    expiryDate: '2027-04-30',
    barcode: '896400010012',
    tenantId: 'tenant_albarka'
  },
  {
    id: 'item_02',
    code: 'RM-OIL-16L',
    name: 'Refined Edible Cooking Oil (16L Tin)',
    category: 'Raw Materials',
    uom: 'Tins',
    warehouseId: 'wh_lhr_main',
    warehouseName: 'Lahore Central Warehouse',
    unitPrice: 6800,
    purchasePrice: 5900,
    currentStock: 840,
    reorderLevel: 150,
    batchNumber: 'BATCH-2026-09B',
    expiryDate: '2027-10-15',
    barcode: '896400010029',
    tenantId: 'tenant_albarka'
  },
  {
    id: 'item_03',
    code: 'FG-BISCUIT-BOX',
    name: 'Albarka Energy Biscuits (Carton of 24 Packs)',
    category: 'Finished Goods',
    uom: 'Cartons',
    warehouseId: 'wh_lhr_main',
    warehouseName: 'Lahore Central Warehouse',
    unitPrice: 2400,
    purchasePrice: 1750,
    currentStock: 3400,
    reorderLevel: 500,
    batchNumber: 'FG-2026-102',
    expiryDate: '2027-08-20',
    barcode: '896400020011',
    tenantId: 'tenant_albarka'
  },
  {
    id: 'item_04',
    code: 'ST-SOLAR-550W',
    name: 'Tier-1 Mono PERC Solar Panel 550W',
    category: 'Solar Equipment',
    uom: 'Pcs',
    warehouseId: 'wh_isb_solar',
    warehouseName: 'Islamabad Tech Store',
    unitPrice: 28500,
    purchasePrice: 23000,
    currentStock: 480,
    reorderLevel: 50,
    serialNumber: 'SN-SOL-550-9921',
    barcode: '896400030018',
    tenantId: 'tenant_solartech'
  },
  {
    id: 'item_05',
    code: 'RM-SPICE-BATCHX',
    name: 'Organic Spice Blend Batch X (Expiring Soon)',
    category: 'Raw Materials',
    uom: 'Kg',
    warehouseId: 'wh_lhr_main',
    warehouseName: 'Lahore Central Warehouse',
    unitPrice: 1200,
    purchasePrice: 950,
    currentStock: 320,
    reorderLevel: 50,
    batchNumber: 'BATCH-EXP-Nov14',
    expiryDate: '2026-11-14',
    barcode: '896400040019',
    tenantId: 'tenant_albarka'
  }
];

export const INITIAL_PURCHASE_ORDERS: PurchaseOrder[] = [
  {
    id: 'po_01',
    poNumber: 'PO-2026-0041',
    vendorId: 'v_engro',
    vendorName: 'Engro Foods & Agri Chemicals',
    date: '2026-10-20',
    deliveryDate: '2026-11-05',
    items: [
      { itemId: 'item_01', itemCode: 'RM-FLOUR-50K', itemName: 'Premium Grade Wheat Flour (50kg Bag)', qty: 500, unitPrice: 3500, totalPrice: 1750000 },
      { itemId: 'item_02', itemCode: 'RM-OIL-16L', itemName: 'Refined Edible Cooking Oil (16L Tin)', qty: 200, unitPrice: 5900, totalPrice: 1180000 }
    ],
    subtotal: 2930000,
    taxAmount: 527400, // 18% STRN sales tax
    totalAmount: 3457400,
    status: 'APPROVED',
    tenantId: 'tenant_albarka',
    branchId: 'br_lahore_01',
    createdBy: 'Procurement Mgr. Hassan'
  }
];

export const INITIAL_SALES_INVOICES: SalesInvoice[] = [
  {
    id: 'inv_1092',
    invoiceNo: 'INV-2026-1092',
    customerId: 'cust_metro',
    customerName: 'Metro Cash & Carry Pakistan',
    customerNTN: '2840192-3',
    date: '2026-10-24',
    dueDate: '2026-11-24',
    items: [
      { itemId: 'item_03', itemCode: 'FG-BISCUIT-BOX', itemName: 'Albarka Energy Biscuits (Carton of 24 Packs)', qty: 1500, unitPrice: 2400, discount: 100, taxRate: 18, totalPrice: 3450000 }
    ],
    subtotal: 3450000,
    taxAmount: 621000,
    grandTotal: 4071000,
    paidAmount: 3500000,
    balanceDue: 571000,
    paymentStatus: 'PARTIAL',
    approvalStatus: 'APPROVED',
    branchId: 'br_lahore_01',
    tenantId: 'tenant_albarka',
    createdBy: 'Sales Exec. Bilal'
  }
];

export const INITIAL_BOMS: BillOfMaterials[] = [
  {
    id: 'bom_01',
    bomCode: 'BOM-BISCUIT-01',
    productItemId: 'item_03',
    productName: 'Albarka Energy Biscuits (Carton of 24 Packs)',
    outputQty: 100,
    components: [
      { itemId: 'item_01', itemName: 'Premium Grade Wheat Flour (50kg Bag)', qtyRequired: 10, unitCost: 3500 },
      { itemId: 'item_02', itemName: 'Refined Edible Cooking Oil (16L Tin)', qtyRequired: 3, unitCost: 5900 }
    ],
    laborCost: 15000,
    overheadCost: 8000,
    totalCost: 75700,
    tenantId: 'tenant_albarka'
  }
];

export const INITIAL_WORK_ORDERS: WorkOrder[] = [
  {
    id: 'wo_01',
    orderNo: 'WO-2026-088',
    bomId: 'bom_01',
    productName: 'Albarka Energy Biscuits (Carton of 24 Packs)',
    plannedQty: 1000,
    completedQty: 600,
    startDate: '2026-10-22',
    dueDate: '2026-11-02',
    status: 'IN_PROGRESS',
    tenantId: 'tenant_albarka'
  }
];

export const INITIAL_PRODUCTION_TASKS: ProductionTask[] = [
  {
    id: 'pt_01',
    workOrderId: 'wo_01',
    orderNo: 'WO-2026-088',
    taskName: 'Stage 1: Raw Material Sifting & Ingredient Dosing',
    assignedTo: 'Operator Asif (Preparation Section)',
    dependsOnTaskId: null,
    startDate: '2026-10-22',
    dueDate: '2026-10-24',
    progressPercent: 100,
    status: 'COMPLETED',
    tenantId: 'tenant_albarka'
  },
  {
    id: 'pt_02',
    workOrderId: 'wo_01',
    orderNo: 'WO-2026-088',
    taskName: 'Stage 2: High-Speed Dough Kneading & Temperature Control',
    assignedTo: 'Mixer Team Alpha',
    dependsOnTaskId: 'pt_01',
    startDate: '2026-10-24',
    dueDate: '2026-10-26',
    progressPercent: 100,
    status: 'COMPLETED',
    tenantId: 'tenant_albarka'
  },
  {
    id: 'pt_03',
    workOrderId: 'wo_01',
    orderNo: 'WO-2026-088',
    taskName: 'Stage 3: Automated Extrusion & Roller Shaping',
    assignedTo: 'Shaping Line Crew',
    dependsOnTaskId: 'pt_02',
    startDate: '2026-10-26',
    dueDate: '2026-10-29',
    progressPercent: 60,
    status: 'IN_PROGRESS',
    tenantId: 'tenant_albarka'
  },
  {
    id: 'pt_04',
    workOrderId: 'wo_01',
    orderNo: 'WO-2026-088',
    taskName: 'Stage 4: Industrial Tunnel Oven Baking & Cooling Conveyor',
    assignedTo: 'Oven Operations Section B',
    dependsOnTaskId: 'pt_03',
    startDate: '2026-10-29',
    dueDate: '2026-10-31',
    progressPercent: 0,
    status: 'BLOCKED',
    tenantId: 'tenant_albarka'
  },
  {
    id: 'pt_05',
    workOrderId: 'wo_01',
    orderNo: 'WO-2026-088',
    taskName: 'Stage 5: High-Speed Flow Wrapping & Master Carton Sealing',
    assignedTo: 'Packaging Unit 4',
    dependsOnTaskId: 'pt_04',
    startDate: '2026-10-31',
    dueDate: '2026-11-02',
    progressPercent: 0,
    status: 'BLOCKED',
    tenantId: 'tenant_albarka'
  }
];

export const INITIAL_EMPLOYEES: Employee[] = [
  {
    id: 'emp_01',
    code: 'EMP-0010',
    fullName: 'Tariq Mehmood',
    designation: 'General Manager Operations',
    department: 'Executive Management',
    cnic: '35202-8819203-1',
    phone: '+92-300-4491029',
    email: 'tariq@albarka.com.pk',
    basicSalary: 280000,
    allowances: 60000,
    deductions: 25000,
    netSalary: 315000,
    joiningDate: '2021-04-01',
    bankAccount: 'Meezan Bank - 02010103982',
    status: 'ACTIVE',
    tenantId: 'tenant_albarka'
  },
  {
    id: 'emp_02',
    code: 'EMP-0011',
    fullName: 'Saima Naz',
    designation: 'Senior Accountant',
    department: 'Finance & Accounts',
    cnic: '35201-1920384-2',
    phone: '+92-302-8877112',
    email: 'saima@albarka.com.pk',
    basicSalary: 150000,
    allowances: 30000,
    deductions: 12000,
    netSalary: 168000,
    joiningDate: '2022-08-15',
    bankAccount: 'HBL - 00427901182703',
    status: 'ACTIVE',
    tenantId: 'tenant_albarka'
  }
];

export const INITIAL_CUSTOM_FORMS: CustomForm[] = [
  {
    id: 'form_qa_01',
    title: 'Raw Material Quality Inspection Form',
    department: 'Quality Management',
    description: 'Mandatory quality check before GRN entry in warehouse',
    fields: [
      { id: 'f1', label: 'Supplier Name', type: 'text', required: true, placeholder: 'Enter supplier name' },
      { id: 'f2', label: 'Inspection Date', type: 'date', required: true },
      { id: 'f3', label: 'Batch Inspection Result', type: 'dropdown', required: true, options: ['Pass - Approved', 'Fail - Rejected', 'Conditional Approval'] },
      { id: 'f4', label: 'Moisture Content %', type: 'decimal', required: false, placeholder: 'e.g. 12.5' },
      { id: 'f5', label: 'Inspector Signature', type: 'text', required: true, placeholder: 'Inspector full name' }
    ],
    tenantId: 'tenant_albarka',
    createdAt: '2026-09-10'
  }
];

export const INITIAL_APPROVAL_WORKFLOWS: ApprovalWorkflow[] = [
  {
    id: 'wf_po_01',
    documentType: 'PURCHASE_ORDER',
    documentId: 'po_01',
    documentNumber: 'PO-2026-0041',
    amount: 3457400,
    requestedBy: 'Procurement Officer Hassan',
    date: '2026-10-20',
    steps: [
      { stepNumber: 1, approverRole: 'SUPERVISOR', status: 'APPROVED', comment: 'Stock requirement verified', actionDate: '2026-10-20' },
      { stepNumber: 2, approverRole: 'DEPARTMENT_MANAGER', status: 'APPROVED', comment: 'Vendor quotation best price', actionDate: '2026-10-21' },
      { stepNumber: 3, approverRole: 'COMPANY_DIRECTOR', status: 'PENDING' }
    ],
    currentStep: 3,
    overallStatus: 'PENDING',
    tenantId: 'tenant_albarka'
  }
];
