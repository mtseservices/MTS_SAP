// MTS-ERP-SAP Enterprise TypeScript Definitions

export type UserRole = 
  | 'MASTER_ADMIN'
  | 'CLIENT_ADMIN'
  | 'COMPANY_DIRECTOR'
  | 'CEO'
  | 'DEPARTMENT_MANAGER'
  | 'SUPERVISOR'
  | 'ACCOUNTANT'
  | 'PROCUREMENT_OFFICER'
  | 'STOREKEEPER'
  | 'HR_OFFICER'
  | 'SALES_OFFICER'
  | 'PRODUCTION_OFFICER'
  | 'AUDITOR';

export type IndustryPackage = 
  | 'Manufacturing'
  | 'Food & Beverage'
  | 'Solar & Electrical'
  | 'Textile'
  | 'Construction'
  | 'Wholesale'
  | 'Retail & POS'
  | 'Supermarket'
  | 'Import & Export'
  | 'Pharmaceutical'
  | 'Services'
  | 'Healthcare';

export type ThemePalette = 
  | 'corporate-blue'
  | 'enterprise-dark'
  | 'professional-green'
  | 'royal-black-gold'
  | 'modern-light';

export interface Branch {
  id: string;
  name: string;
  code: string;
  city: string;
  address: string;
  phone: string;
  isMain: boolean;
}

export interface Department {
  id: string;
  name: string;
  code: string;
  managerName?: string;
  subDepartments?: string[];
}

export interface ClientCompany {
  id: string;
  tenantId: string;
  name: string;
  registeredName: string;
  code: string; // e.g. AFI001
  slug: string; // e.g. albarka
  subdomain: string; // albarka.erp.mts.pk
  url: string;
  industry: IndustryPackage;
  category: string;
  ntn: string;
  strn: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  province: string;
  country: string;
  logoUrl?: string;
  backgroundUrl?: string;
  primaryContact: string;
  subscriptionPlan: string;
  userLimit: number;
  branchLimit: number;
  activeModules: string[];
  status: 'ACTIVE' | 'SUSPENDED' | 'INACTIVE';
  createdAt: string;
  adminName: string;
  adminEmail: string;
  theme: ThemePalette;
  tablePattern?: string;
  tableLayoutPattern?: string;
  fontFamily?: string;
  limitApprovalRequests?: {
    id: string;
    requestedUserLimit?: number;
    requestedBranchLimit?: number;
    requestedModules?: string[];
    reason?: string;
    requestedBy?: string;
    requestedAt?: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
  }[];
  documents?: CompanyDocument[];
  isArchived?: boolean;
}

export interface CompanyDocument {
  id: string;
  name: string;
  category: 'Legal' | 'Tax Certificate' | 'Registration' | 'Compliance' | 'Financial Audit';
  fileSize: string;
  uploadDate: string;
  uploadedBy: string;
  fileUrl?: string;
  status: 'VERIFIED' | 'PENDING_REVIEW' | 'EXPIRED';
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  tenantId: string;
  companyId: string;
  companyName: string;
  branchId: string;
  branchName: string;
  departmentId?: string;
  isMaster: boolean;
  avatarUrl?: string;
  allowedCompanies?: string[]; // Tenant IDs for multi-company access
}

// Chart of Accounts Item
export interface AccountHead {
  id: string;
  code: string; // e.g. 1000, 1010
  name: string;
  type: 'ASSET' | 'LIABILITY' | 'EQUITY' | 'REVENUE' | 'EXPENSE';
  category: string;
  balance: number;
  currency: string; // PKR
  tenantId: string;
}

// Journal Voucher / Accounting Transaction
export interface VoucherItem {
  accountId: string;
  accountCode: string;
  accountName: string;
  description: string;
  debit: number;
  credit: number;
}

export interface JournalVoucher {
  id: string;
  voucherNo: string;
  date: string;
  type: 'JOURNAL' | 'PAYMENT' | 'RECEIPT' | 'CONTRA';
  branchId: string;
  referenceNo?: string;
  items: VoucherItem[];
  totalAmount: number;
  narration: string;
  status: 'DRAFT' | 'POSTED' | 'CANCELLED';
  createdBy: string;
  createdAt: string;
  tenantId: string;
}

// Inventory Item
export interface InventoryItem {
  id: string;
  code: string;
  name: string;
  category: string;
  uom: string; // Units, Pcs, Kg, Meters, Boxes
  warehouseId: string;
  warehouseName: string;
  unitPrice: number;
  purchasePrice: number;
  currentStock: number;
  reorderLevel: number;
  batchNumber?: string;
  serialNumber?: string;
  expiryDate?: string;
  barcode?: string;
  tenantId: string;
}

// Procurement Purchase Order
export interface POLineItem {
  itemId: string;
  itemCode: string;
  itemName: string;
  qty: number;
  unitPrice: number;
  totalPrice: number;
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  vendorId: string;
  vendorName: string;
  date: string;
  deliveryDate: string;
  items: POLineItem[];
  subtotal: number;
  taxAmount: number; // STRN tax
  totalAmount: number;
  status: 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'RECEIVED' | 'CANCELLED';
  tenantId: string;
  branchId: string;
  createdBy: string;
}

// Sales Invoice
export interface InvoiceLineItem {
  itemId: string;
  itemCode: string;
  itemName: string;
  qty: number;
  unitPrice: number;
  discount: number;
  taxRate: number; // Sales tax %
  totalPrice: number;
}

export interface SalesInvoice {
  id: string;
  invoiceNo: string;
  customerId: string;
  customerName: string;
  customerNTN?: string;
  date: string;
  dueDate: string;
  items: InvoiceLineItem[];
  subtotal: number;
  taxAmount: number;
  grandTotal: number;
  paidAmount: number;
  balanceDue: number;
  paymentStatus: 'UNPAID' | 'PARTIAL' | 'PAID';
  approvalStatus: 'APPROVED' | 'PENDING';
  branchId: string;
  tenantId: string;
  createdBy: string;
  syncedOffline?: boolean;
}

// Production Bill of Materials (BOM)
export interface BOMComponent {
  itemId: string;
  itemName: string;
  qtyRequired: number;
  unitCost: number;
}

export interface BillOfMaterials {
  id: string;
  bomCode: string;
  productItemId: string;
  productName: string;
  outputQty: number;
  components: BOMComponent[];
  laborCost: number;
  overheadCost: number;
  totalCost: number;
  tenantId: string;
}

export interface WorkOrder {
  id: string;
  orderNo: string;
  bomId: string;
  productName: string;
  plannedQty: number;
  completedQty: number;
  startDate: string;
  dueDate: string;
  status: 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  tenantId: string;
}

export interface ProductionTask {
  id: string;
  workOrderId: string;
  orderNo: string;
  taskName: string;
  assignedTo: string;
  dependsOnTaskId?: string | null;
  startDate: string;
  dueDate: string;
  progressPercent: number;
  status: 'BLOCKED' | 'READY_TO_START' | 'IN_PROGRESS' | 'COMPLETED';
  tenantId: string;
}

// HR Employee
export interface Employee {
  id: string;
  code: string;
  fullName: string;
  designation: string;
  department: string;
  cnic: string;
  phone: string;
  email: string;
  basicSalary: number;
  allowances: number;
  deductions: number;
  netSalary: number;
  joiningDate: string;
  bankAccount: string;
  status: 'ACTIVE' | 'ON_LEAVE' | 'TERMINATED';
  tenantId: string;
}

// Dynamic Form Field Definition
export type FormFieldType = 
  | 'text'
  | 'number'
  | 'decimal'
  | 'currency'
  | 'date'
  | 'dropdown'
  | 'checkbox'
  | 'textarea'
  | 'file'
  | 'signature';

export interface CustomFormField {
  id: string;
  label: string;
  type: FormFieldType;
  required: boolean;
  options?: string[]; // for dropdown
  defaultValue?: string;
  placeholder?: string;
}

export interface CustomForm {
  id: string;
  title: string;
  department: string;
  description: string;
  fields: CustomFormField[];
  tenantId: string;
  createdAt: string;
}

// Workflow Approval Definition
export interface ApprovalStep {
  stepNumber: number;
  approverRole: UserRole;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  comment?: string;
  actionDate?: string;
}

export interface ApprovalWorkflow {
  id: string;
  documentType: 'PURCHASE_ORDER' | 'SALES_INVOICE' | 'PAYMENT_VOUCHER' | 'WORK_ORDER' | 'LEAVE_APPLICATION';
  documentId: string;
  documentNumber: string;
  amount: number;
  requestedBy: string;
  date: string;
  steps: ApprovalStep[];
  currentStep: number;
  overallStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
  tenantId: string;
}

// Offline Transaction Queue Item
export interface OfflineQueueItem {
  id: string;
  type: 'SALES_INVOICE' | 'PURCHASE_ORDER' | 'VOUCHER' | 'STOCK_ADJUSTMENT';
  data: any;
  createdAt: string;
  synced: boolean;
  tenantId: string;
}

// Audit Log & Subscription Types
export interface AuditLogEntry {
  id: string;
  tenantId: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  actionType: 'LOGIN' | 'LOGOUT' | 'NAVIGATION' | 'DATA_CREATE' | 'DATA_EDIT' | 'DATA_DELETE' | 'APPROVAL' | 'SETTINGS_CHANGE';
  module: string;
  details: string;
  ipAddress: string;
  timestamp: string;
}

export type SubscriptionCycle = 'Monthly' | 'Six-Monthly' | 'Yearly' | 'One-Time';

export interface SubscriptionPlan {
  id: string;
  name: string;
  pricePKR: number;
  billingCycle: SubscriptionCycle;
  businessCategories: IndustryPackage[];
  includedModules: string[];
  maxUsers: number;
  maxBranches: number;
  isPopular?: boolean;
}

export interface PaymentVerification {
  id: string;
  tenantId: string;
  companyName: string;
  planId: string;
  planName: string;
  amountPKR: number;
  billingCycle: SubscriptionCycle;
  paymentMethod: 'Bank Transfer' | 'Online Slip' | 'Cheque' | 'Cash Deposit';
  referenceTxnId: string;
  bankName: string;
  receiptUrl?: string;
  status: 'PENDING' | 'VERIFIED' | 'REJECTED';
  date: string;
  verifiedBy?: string;
}

export interface InstallmentScheduleItem {
  installmentNo: number;
  dueDate: string;
  amountPKR: number;
  status: 'PAID' | 'PENDING' | 'OVERDUE';
  paidDate?: string;
}

export interface InstallmentPlan {
  id: string;
  tenantId: string;
  companyName: string;
  totalAmountPKR: number;
  installmentCount: number;
  frequency: 'Monthly' | 'Quarterly';
  schedules: InstallmentScheduleItem[];
  createdAt: string;
}

export interface MasterBankAccount {
  id: string;
  bankName: string;
  accountTitle: string;
  accountNumber: string;
  iban: string;
  branchName: string;
  branchCode?: string;
  swiftCode?: string;
  raastId?: string;
  isDefault?: boolean;
  isActive: boolean;
  instructions?: string;
  createdAt?: string;
}

// --- CENTRALIZED NOTIFICATION SYSTEM TYPES ---

export type NotificationType = 'APPROVAL' | 'LOW_STOCK' | 'PAYMENT_DUE' | 'SYSTEM';
export type NotificationSeverity = 'HIGH' | 'MEDIUM' | 'INFO';

export interface NotificationItem {
  id: string;
  tenantId: string;
  title: string;
  message: string;
  type: NotificationType;
  severity: NotificationSeverity;
  targetTab: string;
  read: boolean;
  timestamp: string;
}
