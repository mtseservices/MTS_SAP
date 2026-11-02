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
    id: 'br_faisalabad_01',
    name: 'Faisalabad Textile Complex & Plant',
    code: 'FSD-01',
    city: 'Faisalabad',
    address: 'Sargodha Road Textile Zone, Faisalabad',
    phone: '+92-41-8712345',
    isMain: true
  },
  {
    id: 'br_lahore_02',
    name: 'Lahore Regional Office & Exports',
    code: 'LHR-02',
    city: 'Lahore',
    address: 'Gulberg III, Main Boulevard, Lahore',
    phone: '+92-42-35711200',
    isMain: false
  },
  {
    id: 'br_karachi_03',
    name: 'Karachi Port Terminal Hub',
    code: 'KHI-03',
    city: 'Karachi',
    address: 'Port Qasim Industrial Zone, Karachi',
    phone: '+92-21-34720000',
    isMain: false
  }
];

export const INITIAL_ACCOUNTS: AccountHead[] = [
  { id: 'acc_1010', code: '1010', name: 'Cash in Hand (PKR)', type: 'ASSET', category: 'Current Asset', balance: 4500000, currency: 'PKR', tenantId: 'tenant_crest' },
  { id: 'acc_1020', code: '1020', name: 'Meezan Bank Operations Account', type: 'ASSET', category: 'Bank Account', balance: 28400000, currency: 'PKR', tenantId: 'tenant_crest' },
  { id: 'acc_1030', code: '1030', name: 'Habib Bank Export Account', type: 'ASSET', category: 'Bank Account', balance: 19800000, currency: 'PKR', tenantId: 'tenant_crest' },
  { id: 'acc_1200', code: '1200', name: 'Accounts Receivable (Customers)', type: 'ASSET', category: 'Current Asset', balance: 14200000, currency: 'PKR', tenantId: 'tenant_crest' },
  { id: 'acc_1300', code: '1300', name: 'Finished Fabric Stock', type: 'ASSET', category: 'Inventory', balance: 32500000, currency: 'PKR', tenantId: 'tenant_crest' },
  { id: 'acc_1310', code: '1310', name: 'Raw Cotton & Yarn Store', type: 'ASSET', category: 'Inventory', balance: 18600000, currency: 'PKR', tenantId: 'tenant_crest' },
  { id: 'acc_2010', code: '2010', name: 'Accounts Payable (Vendors)', type: 'LIABILITY', category: 'Current Liability', balance: 9400000, currency: 'PKR', tenantId: 'tenant_crest' },
  { id: 'acc_2050', code: '2050', name: 'Withholding Tax Payable (FBR NTN)', type: 'LIABILITY', category: 'Tax Liability', balance: 1850000, currency: 'PKR', tenantId: 'tenant_crest' },
  { id: 'acc_3010', code: '3010', name: 'Paid Up Capital', type: 'EQUITY', category: 'Equity', balance: 80000000, currency: 'PKR', tenantId: 'tenant_crest' },
  { id: 'acc_4010', code: '4010', name: 'Gross Textile Sales Revenue', type: 'REVENUE', category: 'Operating Income', balance: 148000000, currency: 'PKR', tenantId: 'tenant_crest' },
  { id: 'acc_5010', code: '5010', name: 'Cost of Goods Sold (COGS)', type: 'EXPENSE', category: 'Direct Expense', balance: 89000000, currency: 'PKR', tenantId: 'tenant_crest' },
  { id: 'acc_5020', code: '5020', name: 'Mill Salaries & Operator Payroll', type: 'EXPENSE', category: 'Operating Expense', balance: 12400000, currency: 'PKR', tenantId: 'tenant_crest' }
];

export const INITIAL_VOUCHERS: JournalVoucher[] = [
  {
    id: 'jv_001',
    voucherNo: 'JV-2026-089',
    date: '2026-10-25',
    type: 'JOURNAL',
    branchId: 'br_faisalabad_01',
    referenceNo: 'REF-INV-992',
    items: [
      { accountId: 'acc_1020', accountCode: '1020', accountName: 'Meezan Bank Operations Account', description: 'Customer Payment Received', debit: 3500000, credit: 0 },
      { accountId: 'acc_1200', accountCode: '1200', accountName: 'Accounts Receivable', description: 'Clear Receivables', debit: 0, credit: 3500000 }
    ],
    totalAmount: 3500000,
    narration: 'LC Export Advance from Global Apparel Sourcing against Invoice #EXP-1092',
    status: 'POSTED',
    createdBy: 'Acc. Farhan Ali',
    createdAt: '2026-10-25T10:30:00Z',
    tenantId: 'tenant_crest'
  },
  {
    id: 'jv_002',
    voucherNo: 'JV-2026-090',
    date: '2026-10-28',
    type: 'PAYMENT',
    branchId: 'br_faisalabad_01',
    referenceNo: 'PO-REF-881',
    items: [
      { accountId: 'acc_2010', accountCode: '2010', accountName: 'Accounts Payable', description: 'Vendor Supplier Payment', debit: 1800000, credit: 0 },
      { accountId: 'acc_1020', accountCode: '1020', accountName: 'Meezan Bank Operations Account', description: 'Bank Transfer Payment', debit: 0, credit: 1800000 }
    ],
    totalAmount: 1800000,
    narration: 'Online Bank Transfer to Indus Cotton Ginning Mills for raw cotton bales batch',
    status: 'POSTED',
    createdBy: 'Acc. Farhan Ali',
    createdAt: '2026-10-28T14:15:00Z',
    tenantId: 'tenant_crest'
  }
];

export const INITIAL_INVENTORY: InventoryItem[] = [
  {
    id: 'item_01',
    code: 'RM-COTTON-BALES',
    name: 'Grade-A Raw Cotton Bales (170kg Bale)',
    category: 'Raw Materials',
    uom: 'Bales',
    warehouseId: 'wh_fsd_main',
    warehouseName: 'Faisalabad Cotton Store',
    unitPrice: 38000,
    purchasePrice: 32000,
    currentStock: 1250,
    reorderLevel: 200,
    batchNumber: 'COT-2026-10A',
    expiryDate: '2027-12-31',
    barcode: '896400010012',
    tenantId: 'tenant_crest'
  },
  {
    id: 'item_02',
    code: 'YARN-COMB-40S',
    name: 'Combed Cotton Ring Spun Yarn (40/1 Count)',
    category: 'Intermediate Stock',
    uom: 'Bags',
    warehouseId: 'wh_fsd_main',
    warehouseName: 'Faisalabad Yarn Store',
    unitPrice: 9800,
    purchasePrice: 8400,
    currentStock: 840,
    reorderLevel: 150,
    batchNumber: 'YARN-2026-09B',
    expiryDate: '2027-10-15',
    barcode: '896400010029',
    tenantId: 'tenant_crest'
  },
  {
    id: 'item_03',
    code: 'FG-FABRIC-ROLL',
    name: 'Finished Dyed Twill Fabric Roll (100m Roll)',
    category: 'Finished Goods',
    uom: 'Rolls',
    warehouseId: 'wh_fsd_main',
    warehouseName: 'Faisalabad Export Warehouse',
    unitPrice: 28000,
    purchasePrice: 21500,
    currentStock: 1400,
    reorderLevel: 300,
    batchNumber: 'FG-2026-TXT102',
    expiryDate: '2028-08-20',
    barcode: '896400020011',
    tenantId: 'tenant_crest'
  },
  {
    id: 'item_04',
    code: 'DYE-REACTIVE-BLUE',
    name: 'Reactive High-Fastness Navy Blue Dye',
    category: 'Chemicals & Dyes',
    uom: 'Drums',
    warehouseId: 'wh_fsd_chem',
    warehouseName: 'Faisalabad Chemical Store',
    unitPrice: 18500,
    purchasePrice: 15000,
    currentStock: 280,
    reorderLevel: 40,
    serialNumber: 'CHEM-DYE-9921',
    barcode: '896400030018',
    tenantId: 'tenant_crest'
  },
  {
    id: 'item_05',
    code: 'POLY-FIBER-STAPLE',
    name: 'Polyester Staple Fiber (PSF) 1.2 Denier',
    category: 'Raw Materials',
    uom: 'Bales',
    warehouseId: 'wh_fsd_main',
    warehouseName: 'Faisalabad Fiber Store',
    unitPrice: 16200,
    purchasePrice: 13950,
    currentStock: 320,
    reorderLevel: 50,
    batchNumber: 'PSF-BATCH-2026',
    expiryDate: '2028-11-14',
    barcode: '896400040019',
    tenantId: 'tenant_crest'
  }
];

export const INITIAL_PURCHASE_ORDERS: PurchaseOrder[] = [
  {
    id: 'po_01',
    poNumber: 'PO-2026-0041',
    vendorId: 'v_indus_ginning',
    vendorName: 'Indus Ginning & Pressing Mills',
    date: '2026-10-20',
    deliveryDate: '2026-11-05',
    items: [
      { itemId: 'item_01', itemCode: 'RM-COTTON-BALES', itemName: 'Grade-A Raw Cotton Bales (170kg Bale)', qty: 50, unitPrice: 32000, totalPrice: 1600000 },
      { itemId: 'item_02', itemCode: 'YARN-COMB-40S', itemName: 'Combed Cotton Ring Spun Yarn (40/1 Count)', qty: 100, unitPrice: 8400, totalPrice: 840000 }
    ],
    subtotal: 2440000,
    taxAmount: 439200, // 18% STRN sales tax
    totalAmount: 2879200,
    status: 'APPROVED',
    tenantId: 'tenant_crest',
    branchId: 'br_faisalabad_01',
    createdBy: 'Procurement Mgr. Hassan'
  }
];

export const INITIAL_SALES_INVOICES: SalesInvoice[] = [
  {
    id: 'inv_1092',
    invoiceNo: 'INV-2026-1092',
    customerId: 'cust_global_apparel',
    customerName: 'Global Apparel Sourcing Europe B.V.',
    customerNTN: '2840192-3',
    date: '2026-10-24',
    dueDate: '2026-11-24',
    items: [
      { itemId: 'item_03', itemCode: 'FG-FABRIC-ROLL', itemName: 'Finished Dyed Twill Fabric Roll (100m Roll)', qty: 150, unitPrice: 28000, discount: 1000, taxRate: 18, totalPrice: 4050000 }
    ],
    subtotal: 4050000,
    taxAmount: 729000,
    grandTotal: 4779000,
    paidAmount: 3500000,
    balanceDue: 1279000,
    paymentStatus: 'PARTIAL',
    approvalStatus: 'APPROVED',
    branchId: 'br_faisalabad_01',
    tenantId: 'tenant_crest',
    createdBy: 'Export Sales Exec. Bilal'
  }
];

export const INITIAL_BOMS: BillOfMaterials[] = [
  {
    id: 'bom_01',
    bomCode: 'BOM-TWILL-100M',
    productItemId: 'item_03',
    productName: 'Finished Dyed Twill Fabric Roll (100m Roll)',
    outputQty: 10,
    components: [
      { itemId: 'item_02', itemName: 'Combed Cotton Ring Spun Yarn (40/1 Count)', qtyRequired: 15, unitCost: 8400 },
      { itemId: 'item_04', itemName: 'Reactive High-Fastness Navy Blue Dye', qtyRequired: 2, unitCost: 15000 }
    ],
    laborCost: 45000,
    overheadCost: 28000,
    totalCost: 229000,
    tenantId: 'tenant_crest'
  }
];

export const INITIAL_WORK_ORDERS: WorkOrder[] = [
  {
    id: 'wo_01',
    orderNo: 'WO-2026-088',
    bomId: 'bom_01',
    productName: 'Finished Dyed Twill Fabric Roll (100m Roll)',
    plannedQty: 500,
    completedQty: 320,
    startDate: '2026-10-22',
    dueDate: '2026-11-02',
    status: 'IN_PROGRESS',
    tenantId: 'tenant_crest'
  }
];

export const INITIAL_PRODUCTION_TASKS: ProductionTask[] = [
  {
    id: 'pt_01',
    workOrderId: 'wo_01',
    orderNo: 'WO-2026-088',
    taskName: 'Stage 1: Blowroom & Carding Cotton Fiber Sliver Formation',
    assignedTo: 'Operator Asif (Spinning Preparatory)',
    dependsOnTaskId: null,
    startDate: '2026-10-22',
    dueDate: '2026-10-24',
    progressPercent: 100,
    status: 'COMPLETED',
    tenantId: 'tenant_crest'
  },
  {
    id: 'pt_02',
    workOrderId: 'wo_01',
    orderNo: 'WO-2026-088',
    taskName: 'Stage 2: Ring Spinning 40/1 Count High-Tenacity Yarn Spindles',
    assignedTo: 'Spinning Team Alpha',
    dependsOnTaskId: 'pt_01',
    startDate: '2026-10-24',
    dueDate: '2026-10-26',
    progressPercent: 100,
    status: 'COMPLETED',
    tenantId: 'tenant_crest'
  },
  {
    id: 'pt_03',
    workOrderId: 'wo_01',
    orderNo: 'WO-2026-088',
    taskName: 'Stage 3: Air-Jet Looms Weaving Greige Twill Fabric',
    assignedTo: 'Weaving Shed Crew B',
    dependsOnTaskId: 'pt_02',
    startDate: '2026-10-26',
    dueDate: '2026-10-29',
    progressPercent: 65,
    status: 'IN_PROGRESS',
    tenantId: 'tenant_crest'
  },
  {
    id: 'pt_04',
    workOrderId: 'wo_01',
    orderNo: 'WO-2026-088',
    taskName: 'Stage 4: Continuous Dyeing Range (CDR) & Stenter Finishing',
    assignedTo: 'Dyeing & Chemical Section',
    dependsOnTaskId: 'pt_03',
    startDate: '2026-10-29',
    dueDate: '2026-10-31',
    progressPercent: 0,
    status: 'BLOCKED',
    tenantId: 'tenant_crest'
  },
  {
    id: 'pt_05',
    workOrderId: 'wo_01',
    orderNo: 'WO-2026-088',
    taskName: 'Stage 5: 4-Point Inspection & Moisture-Proof Export Roll Packing',
    assignedTo: 'QA & Packing Unit 3',
    dependsOnTaskId: 'pt_04',
    startDate: '2026-10-31',
    dueDate: '2026-11-02',
    progressPercent: 0,
    status: 'BLOCKED',
    tenantId: 'tenant_crest'
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
    email: 'tariq@cresttextile.com',
    basicSalary: 280000,
    allowances: 60000,
    deductions: 25000,
    netSalary: 315000,
    joiningDate: '2021-04-01',
    bankAccount: 'Meezan Bank - 02010103982',
    status: 'ACTIVE',
    tenantId: 'tenant_crest'
  },
  {
    id: 'emp_02',
    code: 'EMP-0011',
    fullName: 'Saima Naz',
    designation: 'Senior Accountant',
    department: 'Finance & Accounts',
    cnic: '35201-1920384-2',
    phone: '+92-302-8877112',
    email: 'saima@cresttextile.com',
    basicSalary: 150000,
    allowances: 30000,
    deductions: 12000,
    netSalary: 168000,
    joiningDate: '2022-08-15',
    bankAccount: 'HBL - 00427901182703',
    status: 'ACTIVE',
    tenantId: 'tenant_crest'
  }
];

export const INITIAL_CUSTOM_FORMS: CustomForm[] = [
  {
    id: 'form_qa_01',
    title: 'Raw Cotton & Yarn Quality Inspection Form',
    department: 'Quality Management',
    description: 'Mandatory quality check before GRN entry in yarn warehouse',
    fields: [
      { id: 'f1', label: 'Supplier Name', type: 'text', required: true, placeholder: 'Enter ginning supplier name' },
      { id: 'f2', label: 'Inspection Date', type: 'date', required: true },
      { id: 'f3', label: 'Cotton Staple Grade', type: 'dropdown', required: true, options: ['Grade A - Long Staple', 'Grade B - Medium Staple', 'Reject - Trash Content High'] },
      { id: 'f4', label: 'Fiber Moisture Content %', type: 'decimal', required: false, placeholder: 'e.g. 7.8' },
      { id: 'f5', label: 'Lab Technologist Signature', type: 'text', required: true, placeholder: 'Technologist full name' }
    ],
    tenantId: 'tenant_crest',
    createdAt: '2026-09-10'
  }
];

export const INITIAL_APPROVAL_WORKFLOWS: ApprovalWorkflow[] = [
  {
    id: 'wf_po_01',
    documentType: 'PURCHASE_ORDER',
    documentId: 'po_01',
    documentNumber: 'PO-2026-0041',
    amount: 2879200,
    requestedBy: 'Procurement Officer Hassan',
    date: '2026-10-20',
    steps: [
      { stepNumber: 1, approverRole: 'SUPERVISOR', status: 'APPROVED', comment: 'Stock requirement verified', actionDate: '2026-10-20' },
      { stepNumber: 2, approverRole: 'DEPARTMENT_MANAGER', status: 'APPROVED', comment: 'Vendor quotation best price', actionDate: '2026-10-21' },
      { stepNumber: 3, approverRole: 'COMPANY_DIRECTOR', status: 'PENDING' }
    ],
    currentStep: 3,
    overallStatus: 'PENDING',
    tenantId: 'tenant_crest'
  }
];
