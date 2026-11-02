// Complete 130 Department Master Catalogue for MTS-ERP-SAP
// Covering General, Operational, Specialized & Industry-Specific Departments

export interface DepartmentCatalogItem {
  id: string;
  number: number;
  name: string;
  head: string;
  category: 
    | 'General ERP & Corporate'
    | 'Operations & Manufacturing'
    | 'Supply Chain & Logistics'
    | 'Sales & Customer Relations'
    | 'Food & Agriculture'
    | 'Education & Institutions'
    | 'Healthcare & Clinical'
    | 'Construction & Engineering'
    | 'Energy & Solar'
    | 'Creative, Media & Tech'
    | 'Banking, Finance & NGO'
    | 'Governance, Security & IT';
  definitions: string[];
  forms: { code: string; name: string }[];
  reports: { code: string; name: string }[];
}

export const COMPLETE_DEPARTMENTS_CATALOGUE: DepartmentCatalogItem[] = [
  // 1. Accounts & Finance Department
  {
    id: 'dept_1',
    number: 1,
    name: 'Accounts & Finance Department',
    head: 'CFO / Finance Manager',
    category: 'General ERP & Corporate',
    definitions: [
      'Chart of Accounts',
      'General Ledger',
      'Cash & Bank Management',
      'Accounts Payable',
      'Accounts Receivable',
      'Cost Center & Profit Center',
      'Fixed Assets',
      'Financial Year & Opening Balances',
      'Tax & Currency Setup'
    ],
    forms: [
      { code: 'COA_FORM', name: 'Chart of Accounts Form' },
      { code: 'JV_FORM', name: 'Journal Voucher Form' },
      { code: 'PV_FORM', name: 'Payment Voucher Form' },
      { code: 'RV_FORM', name: 'Receipt Voucher Form' },
      { code: 'CV_FORM', name: 'Contra Voucher Form' },
      { code: 'EV_FORM', name: 'Expense Voucher Form' },
      { code: 'BR_FORM', name: 'Bank Reconciliation Form' },
      { code: 'CHQ_FORM', name: 'Cheque Management Form' },
      { code: 'OB_FORM', name: 'Opening Balance Form' },
      { code: 'SUPP_LEDG_FORM', name: 'Supplier Ledger Form' },
      { code: 'CUST_LEDG_FORM', name: 'Customer Ledger Form' }
    ],
    reports: [
      { code: 'COA_REP', name: 'Chart of Accounts Report' },
      { code: 'GL_REP', name: 'General Ledger Report' },
      { code: 'TB_REP', name: 'Trial Balance Report' },
      { code: 'BS_REP', name: 'Balance Sheet' },
      { code: 'PL_REP', name: 'Profit & Loss Statement' },
      { code: 'CB_REP', name: 'Cash Book' },
      { code: 'BB_REP', name: 'Bank Book' },
      { code: 'AP_REP', name: 'Accounts Payable Report' },
      { code: 'AR_REP', name: 'Accounts Receivable Report' },
      { code: 'SUPP_REP', name: 'Supplier Ledger' },
      { code: 'CUST_REP', name: 'Customer Ledger' },
      { code: 'EXP_REP', name: 'Expense Summary' },
      { code: 'CC_REP', name: 'Cost Center Report' },
      { code: 'BR_REP', name: 'Bank Reconciliation Report' },
      { code: 'CF_REP', name: 'Cash Flow Statement' },
      { code: 'AUDIT_REP', name: 'Financial Audit Report' }
    ]
  },

  // 2. Inventory & Store Department
  {
    id: 'dept_2',
    number: 2,
    name: 'Inventory & Store Department',
    head: 'Inventory Manager / Store Manager',
    category: 'Supply Chain & Logistics',
    definitions: [
      'Item Master',
      'Item Categories',
      'Units of Measurement',
      'Warehouse & Store Locations',
      'Opening Stock',
      'Minimum / Maximum Stock',
      'Reorder Level',
      'Batch & Serial Number',
      'Expiry Management',
      'Inventory Valuation',
      'Stock Adjustment'
    ],
    forms: [
      { code: 'ITEM_MTR_FORM', name: 'Item Master Form' },
      { code: 'ITEM_CAT_FORM', name: 'Item Category Form' },
      { code: 'WH_STORE_FORM', name: 'Warehouse / Store Form' },
      { code: 'OPEN_STK_FORM', name: 'Opening Stock Form' },
      { code: 'GRN_FORM', name: 'Goods Receipt Note (GRN)' },
      { code: 'MRN_FORM', name: 'Material Receipt Note (MRN)' },
      { code: 'MIN_FORM', name: 'Material Issue Note (MIN)' },
      { code: 'STK_TRF_FORM', name: 'Stock Transfer Form' },
      { code: 'STK_ADJ_FORM', name: 'Stock Adjustment Form' },
      { code: 'STK_RET_FORM', name: 'Stock Return Form' },
      { code: 'PHY_COUNT_FORM', name: 'Physical Stock Count Form' },
      { code: 'BATCH_EXP_FORM', name: 'Batch & Expiry Form' }
    ],
    reports: [
      { code: 'ITEM_MTR_REP', name: 'Item Master Report' },
      { code: 'STK_SUMM_REP', name: 'Stock Summary Report' },
      { code: 'STK_LEDG_REP', name: 'Stock Ledger' },
      { code: 'ITEM_STK_REP', name: 'Item-wise Stock Report' },
      { code: 'WH_STK_REP', name: 'Warehouse-wise Stock Report' },
      { code: 'STORE_LEDG_REP', name: 'Store Ledger' },
      { code: 'OPEN_STK_REP', name: 'Opening Stock Report' },
      { code: 'GRN_REP', name: 'GRN Report' },
      { code: 'MIN_REP', name: 'Material Issue Report' },
      { code: 'STK_TRF_REP', name: 'Stock Transfer Report' },
      { code: 'REORDER_REP', name: 'Reorder Level Report' },
      { code: 'LOW_STK_REP', name: 'Low Stock Report' },
      { code: 'DEAD_STK_REP', name: 'Dead Stock Report' },
      { code: 'EXP_ALERT_REP', name: 'Expiry Alert Report' },
      { code: 'VALUATION_REP', name: 'Inventory Valuation Report' }
    ]
  },

  // 3. Procurement / Purchase Department
  {
    id: 'dept_3',
    number: 3,
    name: 'Procurement / Purchase Department',
    head: 'Procurement Manager / Purchase Manager',
    category: 'Supply Chain & Logistics',
    definitions: [
      'Supplier Master',
      'Vendor Categories',
      'Purchase Categories',
      'Local & Import Purchase',
      'Service Procurement',
      'Payment Terms',
      'Delivery Schedule',
      'Purchase Terms & Conditions',
      'Supplier Evaluation',
      'Purchase Approval Levels'
    ],
    forms: [
      { code: 'PR_FORM', name: 'Purchase Requisition (PR)' },
      { code: 'RFQ_FORM', name: 'Request for Quotation (RFQ)' },
      { code: 'SUPP_QUOT_FORM', name: 'Supplier Quotation Form' },
      { code: 'CS_FORM', name: 'Quotation Comparison Statement (CS)' },
      { code: 'PO_FORM', name: 'Purchase Order (PO)' },
      { code: 'PUR_CONT_FORM', name: 'Purchase Contract Form' },
      { code: 'PUR_INV_FORM', name: 'Purchase Invoice Form' },
      { code: 'PUR_RET_FORM', name: 'Purchase Return Form' },
      { code: 'SUPP_REG_FORM', name: 'Supplier Registration Form' },
      { code: 'SUPP_EVAL_FORM', name: 'Supplier Evaluation Form' },
      { code: 'PUR_APPR_FORM', name: 'Purchase Approval Form' }
    ],
    reports: [
      { code: 'PR_REG_REP', name: 'Purchase Requisition Register' },
      { code: 'RFQ_REG_REP', name: 'RFQ Register' },
      { code: 'QUOT_COMP_REP', name: 'Quotation Comparison Report' },
      { code: 'PO_REG_REP', name: 'Purchase Order Register' },
      { code: 'PENDING_PO_REP', name: 'Pending PO Report' },
      { code: 'PUR_REG_REP', name: 'Purchase Register' },
      { code: 'SUPP_OUT_REP', name: 'Supplier Outstanding Report' },
      { code: 'PUR_VAR_REP', name: 'Purchase Price Variance' },
      { code: 'SUPP_PERF_REP', name: 'Supplier Performance Report' },
      { code: 'PUR_BUDGET_REP', name: 'Purchase Budget vs Actual' }
    ]
  },

  // 4. Sales Department
  {
    id: 'dept_4',
    number: 4,
    name: 'Sales Department',
    head: 'Sales Manager / Sales Director',
    category: 'Sales & Customer Relations',
    definitions: [
      'Customer Master',
      'Customer Categories',
      'Sales Territories',
      'Sales Representatives',
      'Price Lists',
      'Discount Policy',
      'Credit Limits',
      'Sales Targets',
      'Sales Commission'
    ],
    forms: [
      { code: 'CUST_REG_FORM', name: 'Customer Registration Form' },
      { code: 'SALE_ENQ_FORM', name: 'Sales Enquiry Form' },
      { code: 'SALE_QUOT_FORM', name: 'Sales Quotation Form' },
      { code: 'SO_FORM', name: 'Sales Order Form' },
      { code: 'DC_FORM', name: 'Delivery Challan Form' },
      { code: 'SI_FORM', name: 'Sales Invoice Form' },
      { code: 'SR_FORM', name: 'Sales Return Form' },
      { code: 'CN_FORM', name: 'Credit Note Form' },
      { code: 'SRCV_FORM', name: 'Sales Receipt Form' },
      { code: 'STGT_FORM', name: 'Sales Target Form' },
      { code: 'DISC_APPR_FORM', name: 'Discount Approval Form' }
    ],
    reports: [
      { code: 'DAILY_SALE_REP', name: 'Daily Sales Report' },
      { code: 'MONTH_SALE_REP', name: 'Monthly Sales Report' },
      { code: 'CUST_SALE_REP', name: 'Customer-wise Sales' },
      { code: 'ITEM_SALE_REP', name: 'Item-wise Sales' },
      { code: 'REP_PERF_REP', name: 'Salesperson Performance' },
      { code: 'TERR_SALE_REP', name: 'Territory-wise Sales' },
      { code: 'SO_REG_REP', name: 'Sales Order Register' },
      { code: 'SI_REG_REP', name: 'Sales Invoice Register' },
      { code: 'CUST_OUT_REP', name: 'Customer Outstanding' },
      { code: 'TAX_REP', name: 'Sales Tax Report' },
      { code: 'GP_REP', name: 'Gross Profit Report' },
      { code: 'TGT_ACH_REP', name: 'Target vs Achievement' }
    ]
  },

  // 5. Human Resources (HR) Department
  {
    id: 'dept_5',
    number: 5,
    name: 'Human Resources (HR) Department',
    head: 'HR Manager / HR Director',
    category: 'General ERP & Corporate',
    definitions: [
      'Department & Section Master',
      'Designation Master',
      'Employee Master',
      'Recruitment',
      'Employee Onboarding',
      'Attendance & Leave',
      'Training & Development',
      'Performance Appraisal',
      'Employee Discipline',
      'Resignation & Termination'
    ],
    forms: [
      { code: 'EMP_REG_FORM', name: 'Employee Registration Form' },
      { code: 'EMP_DOC_FORM', name: 'Employee Documents Form' },
      { code: 'JOB_APP_FORM', name: 'Job Application Form' },
      { code: 'INT_EVAL_FORM', name: 'Interview Evaluation Form' },
      { code: 'APPT_LTR_FORM', name: 'Appointment Letter Form' },
      { code: 'ATT_FORM', name: 'Attendance Form' },
      { code: 'LEAVE_APP_FORM', name: 'Leave Application Form' },
      { code: 'EMP_TRF_FORM', name: 'Employee Transfer Form' },
      { code: 'APPR_FORM', name: 'Appraisal Form' },
      { code: 'TRN_REG_FORM', name: 'Training Registration Form' },
      { code: 'RESIG_FORM', name: 'Resignation Form' },
      { code: 'EXIT_CLR_FORM', name: 'Exit Clearance Form' }
    ],
    reports: [
      { code: 'EMP_MTR_REP', name: 'Employee Master List' },
      { code: 'DEPT_EMP_REP', name: 'Department-wise Employee Report' },
      { code: 'RECRUIT_REP', name: 'Recruitment Report' },
      { code: 'ATT_SUMM_REP', name: 'Attendance Summary' },
      { code: 'LEAVE_REG_REP', name: 'Leave Register' },
      { code: 'TURNOVER_REP', name: 'Employee Turnover Report' },
      { code: 'APPR_REP', name: 'Appraisal Report' },
      { code: 'TRN_REP', name: 'Training Report' },
      { code: 'RESIG_REP', name: 'Resignation Report' },
      { code: 'STRENGTH_REP', name: 'Employee Strength Report' }
    ]
  },

  // 6. Payroll Department
  {
    id: 'dept_6',
    number: 6,
    name: 'Payroll Department',
    head: 'Payroll Manager / Payroll Officer',
    category: 'General ERP & Corporate',
    definitions: [
      'Salary Structures',
      'Basic Salary & Allowances',
      'Overtime Rules',
      'Deductions',
      'Employee Advances & Loans',
      'Tax Deductions',
      'Bonuses & Incentives',
      'Final Settlement'
    ],
    forms: [
      { code: 'SAL_STRUCT_FORM', name: 'Salary Structure Form' },
      { code: 'PAY_PROC_FORM', name: 'Payroll Processing Form' },
      { code: 'TIME_SHT_FORM', name: 'Time Sheet Form' },
      { code: 'OT_FORM', name: 'Overtime Form' },
      { code: 'ADV_LOAN_FORM', name: 'Advance & Loan Form' },
      { code: 'SAL_SLIP_FORM', name: 'Salary Slip Form' },
      { code: 'BONUS_FORM', name: 'Bonus & Incentive Form' },
      { code: 'SETTLE_FORM', name: 'Final Settlement Form' }
    ],
    reports: [
      { code: 'PAY_REG_REP', name: 'Monthly Payroll Register' },
      { code: 'SLIP_REP', name: 'Employee Salary Slip' },
      { code: 'DEPT_PAY_REP', name: 'Department-wise Payroll' },
      { code: 'OT_REP', name: 'Overtime Report' },
      { code: 'SAL_ADV_REP', name: 'Salary Advance Report' },
      { code: 'LOAN_REC_REP', name: 'Loan Recovery Report' },
      { code: 'DEDUCT_REP', name: 'Deduction Report' },
      { code: 'PAY_TAX_REP', name: 'Payroll Tax Report' },
      { code: 'SETTLE_REP', name: 'Final Settlement Report' }
    ]
  },

  // 7. Administration Department
  {
    id: 'dept_7',
    number: 7,
    name: 'Administration Department',
    head: 'Administration Manager / Admin Officer',
    category: 'General ERP & Corporate',
    definitions: [
      'Office Management',
      'Facility Management',
      'Office Supplies',
      'Stationery Management',
      'Vehicle Management',
      'Visitor Management',
      'Travel & Accommodation',
      'Utilities Management',
      'Housekeeping'
    ],
    forms: [
      { code: 'OFF_SUPP_FORM', name: 'Office Supplies Requisition' },
      { code: 'STAT_ISS_FORM', name: 'Stationery Issue Form' },
      { code: 'VEH_REG_FORM', name: 'Vehicle Registration Form' },
      { code: 'VEH_LOG_FORM', name: 'Vehicle Log Book' },
      { code: 'VISIT_ENT_FORM', name: 'Visitor Entry Form' },
      { code: 'IN_GATE_FORM', name: 'Inward Gate Pass' },
      { code: 'OUT_GATE_FORM', name: 'Outward Gate Pass' },
      { code: 'MAINT_REQ_FORM', name: 'Maintenance Request' },
      { code: 'OFF_EXP_FORM', name: 'Office Expense Form' },
      { code: 'TRV_REQ_FORM', name: 'Travel Request Form' }
    ],
    reports: [
      { code: 'ASSET_REG_REP', name: 'Office Asset Register' },
      { code: 'STAT_CONS_REP', name: 'Stationery Consumption' },
      { code: 'VEH_UTIL_REP', name: 'Vehicle Utilization' },
      { code: 'FUEL_CONS_REP', name: 'Fuel Consumption' },
      { code: 'VISIT_REG_REP', name: 'Visitor Register' },
      { code: 'IN_GATE_REP', name: 'Inward Gate Pass Register' },
      { code: 'OUT_GATE_REP', name: 'Outward Gate Pass Register' },
      { code: 'MAINT_PEND_REP', name: 'Maintenance Pending Report' },
      { code: 'UTIL_EXP_REP', name: 'Utility Expense Report' },
      { code: 'TRV_EXP_REP', name: 'Travel Expense Report' }
    ]
  },

  // 8. Supply Chain Management Department
  {
    id: 'dept_8',
    number: 8,
    name: 'Supply Chain Management Department',
    head: 'Supply Chain Manager / CSCO',
    category: 'Supply Chain & Logistics',
    definitions: [
      'Demand Planning',
      'Supply Planning',
      'Material Requirement Planning (MRP)',
      'Supplier Coordination',
      'Inventory Planning',
      'Distribution Planning',
      'Supply Chain Cost Control'
    ],
    forms: [
      { code: 'DEM_FCST_FORM', name: 'Demand Forecast Form' },
      { code: 'MRP_FORM', name: 'Material Requirement Form' },
      { code: 'SUPP_PLAN_FORM', name: 'Supply Plan Form' },
      { code: 'SUPP_SCH_FORM', name: 'Supplier Schedule Form' },
      { code: 'DIST_PLAN_FORM', name: 'Distribution Plan Form' },
      { code: 'SCM_APPR_FORM', name: 'Supply Chain Approval Form' }
    ],
    reports: [
      { code: 'DEM_FCST_REP', name: 'Demand Forecast Report' },
      { code: 'MRP_REP', name: 'Material Requirement Report' },
      { code: 'SUPP_PLAN_REP', name: 'Supply Planning Report' },
      { code: 'STOCK_AVAIL_REP', name: 'Stock Availability Report' },
      { code: 'SCM_COST_REP', name: 'Supply Chain Cost Report' },
      { code: 'SUPP_DELIV_REP', name: 'Supplier Delivery Performance' }
    ]
  },

  // 9. Warehouse Management Department
  {
    id: 'dept_9',
    number: 9,
    name: 'Warehouse Management Department',
    head: 'Warehouse Manager',
    category: 'Supply Chain & Logistics',
    definitions: [
      'Main Warehouse',
      'Sub Warehouse',
      'Rack & Bin Management',
      'Receiving & Inspection',
      'Put Away',
      'Picking & Packing',
      'Dispatch',
      'Warehouse Transfers'
    ],
    forms: [
      { code: 'WH_SETUP_FORM', name: 'Warehouse Setup Form' },
      { code: 'RACK_BIN_FORM', name: 'Rack / Bin Form' },
      { code: 'PUT_AWAY_FORM', name: 'Put Away Form' },
      { code: 'PICK_LST_FORM', name: 'Picking List Form' },
      { code: 'PACK_FORM', name: 'Packing Form' },
      { code: 'DISP_FORM', name: 'Dispatch Form' },
      { code: 'WH_TRF_FORM', name: 'Warehouse Transfer Form' }
    ],
    reports: [
      { code: 'WH_STK_REP', name: 'Warehouse Stock Report' },
      { code: 'BIN_STK_REP', name: 'Rack / Bin Stock Report' },
      { code: 'RECV_REP', name: 'Receiving Report' },
      { code: 'PICK_PACK_REP', name: 'Picking & Packing Report' },
      { code: 'DISP_REP', name: 'Dispatch Report' },
      { code: 'WH_CAP_REP', name: 'Warehouse Capacity Report' },
      { code: 'WH_PERF_REP', name: 'Warehouse Performance Report' }
    ]
  },

  // 10. Logistics & Transportation Department
  {
    id: 'dept_10',
    number: 10,
    name: 'Logistics & Transportation Department',
    head: 'Logistics Manager / Transport Manager',
    category: 'Supply Chain & Logistics',
    definitions: [
      'Inbound Logistics',
      'Outbound Logistics',
      'Fleet Management',
      'Delivery Planning',
      'Route Planning',
      'Freight Management',
      'Driver Management',
      'Shipment Tracking'
    ],
    forms: [
      { code: 'LOG_VEH_FORM', name: 'Vehicle Registration Form' },
      { code: 'DRIVER_FORM', name: 'Driver Registration Form' },
      { code: 'TRIP_SHT_FORM', name: 'Trip Sheet Form' },
      { code: 'FUEL_ENT_FORM', name: 'Fuel Entry Form' },
      { code: 'DEL_SCH_FORM', name: 'Delivery Schedule Form' },
      { code: 'SHIP_BOOK_FORM', name: 'Shipment Booking Form' },
      { code: 'POD_FORM', name: 'Proof of Delivery Form' }
    ],
    reports: [
      { code: 'DAILY_DISP_REP', name: 'Daily Dispatch Report' },
      { code: 'VEH_UTIL_REP', name: 'Vehicle Utilization Report' },
      { code: 'FUEL_REP', name: 'Fuel Consumption Report' },
      { code: 'DRIVER_PERF_REP', name: 'Driver Performance Report' },
      { code: 'FREIGHT_EXP_REP', name: 'Freight Expense Report' },
      { code: 'DEL_STATUS_REP', name: 'Delivery Status Report' },
      { code: 'ROUTE_PERF_REP', name: 'Route Performance Report' }
    ]
  },

  // 11. Quality Assurance & Quality Control Department
  {
    id: 'dept_11',
    number: 11,
    name: 'Quality Assurance & Quality Control Department',
    head: 'QA/QC Manager',
    category: 'Operations & Manufacturing',
    definitions: [
      'Quality Planning',
      'Incoming Material Inspection',
      'In-Process Inspection',
      'Final Inspection',
      'Quality Standards',
      'Testing & Sampling',
      'Non-Conformance Management',
      'Corrective & Preventive Action'
    ],
    forms: [
      { code: 'QA_INSP_FORM', name: 'Quality Inspection Form' },
      { code: 'IN_INSP_FORM', name: 'Incoming Inspection Form' },
      { code: 'PROC_INSP_FORM', name: 'In-Process Inspection Form' },
      { code: 'FNL_INSP_FORM', name: 'Final Inspection Form' },
      { code: 'TEST_SMPL_FORM', name: 'Sample Testing Form' },
      { code: 'NCR_FORM', name: 'NCR Form' },
      { code: 'CAPA_FORM', name: 'CAPA Form' },
      { code: 'CUST_COMP_FORM', name: 'Customer Complaint Form' }
    ],
    reports: [
      { code: 'IN_INSP_REP', name: 'Incoming Inspection Report' },
      { code: 'PROC_QA_REP', name: 'In-Process Quality Report' },
      { code: 'FNL_INSP_REP', name: 'Final Inspection Report' },
      { code: 'REJECT_REP', name: 'Rejection Report' },
      { code: 'DEFECT_REP', name: 'Defect Analysis Report' },
      { code: 'NCR_REG_REP', name: 'NCR Register' },
      { code: 'CAPA_STAT_REP', name: 'CAPA Status Report' },
      { code: 'QA_PERF_REP', name: 'Quality Performance Report' }
    ]
  },

  // 12. Maintenance & Engineering Department
  {
    id: 'dept_12',
    number: 12,
    name: 'Maintenance & Engineering Department',
    head: 'Maintenance Manager / Chief Engineer',
    category: 'Operations & Manufacturing',
    definitions: [
      'Building Maintenance',
      'Electrical Maintenance',
      'Mechanical Maintenance',
      'Machinery Maintenance',
      'Preventive Maintenance',
      'Breakdown Maintenance',
      'Spare Parts Management'
    ],
    forms: [
      { code: 'MAINT_REQ_FORM', name: 'Maintenance Request Form' },
      { code: 'WO_FORM', name: 'Work Order Form' },
      { code: 'PM_SCH_FORM', name: 'Preventive Maintenance Schedule' },
      { code: 'BD_REP_FORM', name: 'Breakdown Report Form' },
      { code: 'SPARE_REQ_FORM', name: 'Spare Parts Requisition' },
      { code: 'MAINT_COMP_FORM', name: 'Maintenance Completion Form' }
    ],
    reports: [
      { code: 'MAINT_REG_REP', name: 'Maintenance Register' },
      { code: 'PEND_MAINT_REP', name: 'Pending Maintenance Report' },
      { code: 'BD_REP', name: 'Machine Breakdown Report' },
      { code: 'PM_REP', name: 'Preventive Maintenance Report' },
      { code: 'MAINT_COST_REP', name: 'Maintenance Cost Report' },
      { code: 'SPARE_CONS_REP', name: 'Spare Parts Consumption' }
    ]
  },

  // 13. Security & Safety Department
  {
    id: 'dept_13',
    number: 13,
    name: 'Security & Safety Department',
    head: 'Security Manager / Safety Manager',
    category: 'Governance, Security & IT',
    definitions: [
      'Gate Security',
      'Employee Entry & Exit',
      'Visitor Security',
      'CCTV Monitoring',
      'Access Control',
      'Fire Safety',
      'Emergency Response',
      'Incident Management'
    ],
    forms: [
      { code: 'EMP_GATE_FORM', name: 'Employee Gate Entry Form' },
      { code: 'VISIT_SEC_FORM', name: 'Visitor Security Form' },
      { code: 'VEH_ENT_FORM', name: 'Vehicle Entry Form' },
      { code: 'MAT_GATE_FORM', name: 'Material Gate Pass Form' },
      { code: 'SEC_INC_FORM', name: 'Security Incident Form' },
      { code: 'SAFE_INSP_FORM', name: 'Safety Inspection Form' },
      { code: 'EMERG_REP_FORM', name: 'Emergency Report Form' }
    ],
    reports: [
      { code: 'DAILY_SEC_REP', name: 'Daily Security Register' },
      { code: 'VISIT_SEC_REP', name: 'Visitor Security Report' },
      { code: 'GATE_PASS_REP', name: 'Gate Pass Register' },
      { code: 'CCTV_INC_REP', name: 'CCTV Incident Report' },
      { code: 'SEC_INC_REP', name: 'Security Incident Register' },
      { code: 'SAFE_INSP_REP', name: 'Safety Inspection Report' },
      { code: 'EMERG_RESP_REP', name: 'Emergency Response Report' }
    ]
  },

  // 14. Marketing Department
  {
    id: 'dept_14',
    number: 14,
    name: 'Marketing Department',
    head: 'Marketing Manager / CMO',
    category: 'Sales & Customer Relations',
    definitions: [
      'Market Research',
      'Brand Management',
      'Digital Marketing',
      'Advertising Campaigns',
      'Social Media Marketing',
      'Product Promotion',
      'Marketing Budget',
      'Competitor Analysis'
    ],
    forms: [
      { code: 'MKT_CAMP_FORM', name: 'Marketing Campaign Form' },
      { code: 'AD_REQ_FORM', name: 'Advertising Request Form' },
      { code: 'SM_CONT_FORM', name: 'Social Media Content Form' },
      { code: 'MKT_EXP_FORM', name: 'Marketing Expense Form' },
      { code: 'PROM_DISC_FORM', name: 'Promotion / Discount Form' },
      { code: 'MKT_SRV_FORM', name: 'Market Survey Form' }
    ],
    reports: [
      { code: 'MKT_CAMP_REP', name: 'Marketing Campaign Report' },
      { code: 'MKT_EXP_REP', name: 'Marketing Expense Report' },
      { code: 'SM_PERF_REP', name: 'Social Media Performance' },
      { code: 'AD_SPEND_REP', name: 'Advertising Spend Report' },
      { code: 'LEAD_GEN_REP', name: 'Lead Generation Report' },
      { code: 'CAMP_ROI_REP', name: 'Campaign ROI Report' },
      { code: 'COMPET_ANAL_REP', name: 'Competitor Analysis Report' }
    ]
  },

  // 15. Customer Relationship Management (CRM) Department
  {
    id: 'dept_15',
    number: 15,
    name: 'Customer Relationship Management (CRM) Department',
    head: 'CRM Manager / Customer Service Manager',
    category: 'Sales & Customer Relations',
    definitions: [
      'Lead Management',
      'Customer Registration',
      'Customer Follow-ups',
      'Customer Communication',
      'Customer Complaints',
      'Customer Retention',
      'Customer Satisfaction'
    ],
    forms: [
      { code: 'LEAD_REG_FORM', name: 'Lead Registration Form' },
      { code: 'CRM_CUST_FORM', name: 'Customer Registration Form' },
      { code: 'FLWUP_FORM', name: 'Follow-up Form' },
      { code: 'MEET_REC_FORM', name: 'Meeting Record Form' },
      { code: 'COMPL_FORM', name: 'Complaint Form' },
      { code: 'SUPP_TCKT_FORM', name: 'Support Ticket Form' },
      { code: 'CUST_FDBK_FORM', name: 'Customer Feedback Form' }
    ],
    reports: [
      { code: 'LEAD_REG_REP', name: 'Lead Register' },
      { code: 'LEAD_CONV_REP', name: 'Lead Conversion Report' },
      { code: 'FLWUP_REP', name: 'Customer Follow-up Report' },
      { code: 'PEND_FLWUP_REP', name: 'Pending Follow-up Report' },
      { code: 'COMPL_REG_REP', name: 'Complaint Register' },
      { code: 'TCKT_AGE_REP', name: 'Ticket Aging Report' },
      { code: 'CUST_SAT_REP', name: 'Customer Satisfaction Report' }
    ]
  },

  // 16. IT & Information Systems Department
  {
    id: 'dept_16',
    number: 16,
    name: 'IT & Information Systems Department',
    head: 'IT Manager / CIO',
    category: 'Governance, Security & IT',
    definitions: [
      'Hardware Management',
      'Software Management',
      'Network Management',
      'Server Management',
      'Database Management',
      'ERP Administration',
      'IT Support',
      'Data Backup'
    ],
    forms: [
      { code: 'IT_ASSET_FORM', name: 'IT Asset Form' },
      { code: 'IT_TCKT_FORM', name: 'IT Support Ticket Form' },
      { code: 'SW_INST_FORM', name: 'Software Installation Request' },
      { code: 'USR_ACCT_FORM', name: 'User Account Request' },
      { code: 'ACC_PERM_FORM', name: 'Access Permission Form' },
      { code: 'BCK_SCH_FORM', name: 'Backup Schedule Form' }
    ],
    reports: [
      { code: 'IT_ASSET_REP', name: 'IT Asset Register' },
      { code: 'IT_TCKT_REP', name: 'IT Support Ticket Report' },
      { code: 'SW_LIC_REP', name: 'Software License Report' },
      { code: 'USR_ACC_REP', name: 'User Access Report' },
      { code: 'NET_STAT_REP', name: 'Network Status Report' },
      { code: 'BCK_STAT_REP', name: 'Backup Status Report' }
    ]
  },

  // 17. Project Management Department
  {
    id: 'dept_17',
    number: 17,
    name: 'Project Management Department',
    head: 'Project Manager / PMO Head',
    category: 'General ERP & Corporate',
    definitions: [
      'Project Registration',
      'Project Planning',
      'Project Scheduling',
      'Resource Allocation',
      'Project Budgeting',
      'Project Execution',
      'Project Monitoring',
      'Project Closure'
    ],
    forms: [
      { code: 'PRJ_REG_FORM', name: 'Project Registration Form' },
      { code: 'PRJ_PROP_FORM', name: 'Project Proposal Form' },
      { code: 'PRJ_BDGT_FORM', name: 'Project Budget Form' },
      { code: 'PRJ_SCH_FORM', name: 'Project Schedule Form' },
      { code: 'RES_ALLOC_FORM', name: 'Resource Allocation Form' },
      { code: 'PRJ_PROG_FORM', name: 'Project Progress Form' },
      { code: 'PRJ_CLOS_FORM', name: 'Project Closure Form' }
    ],
    reports: [
      { code: 'PRJ_REG_REP', name: 'Project Register' },
      { code: 'PRJ_PROG_REP', name: 'Project Progress Report' },
      { code: 'PRJ_BDGT_REP', name: 'Project Budget vs Actual' },
      { code: 'PRJ_COST_REP', name: 'Project Cost Report' },
      { code: 'PRJ_RES_REP', name: 'Project Resource Report' },
      { code: 'DELAY_PRJ_REP', name: 'Delayed Project Report' },
      { code: 'PRJ_COMP_REP', name: 'Project Completion Report' }
    ]
  },

  // 18. Document Control & Records Department
  {
    id: 'dept_18',
    number: 18,
    name: 'Document Control & Records Department',
    head: 'Documentation Manager / Document Controller',
    category: 'General ERP & Corporate',
    definitions: [
      'Document Registration',
      'Document Verification',
      'Document Approval',
      'Revision Control',
      'File Archiving',
      'Record Retention',
      'Official Correspondence'
    ],
    forms: [
      { code: 'DOC_REG_FORM', name: 'Document Registration Form' },
      { code: 'DOC_APPR_FORM', name: 'Document Approval Form' },
      { code: 'DOC_REV_FORM', name: 'Document Revision Form' },
      { code: 'FILE_MVT_FORM', name: 'File Movement Form' },
      { code: 'DOC_ISS_FORM', name: 'Document Issue Form' },
      { code: 'DOC_ARCH_FORM', name: 'Document Archive Form' }
    ],
    reports: [
      { code: 'DOC_REG_REP', name: 'Document Register' },
      { code: 'PEND_APPR_REP', name: 'Pending Approval Report' },
      { code: 'DOC_REV_REP', name: 'Document Revision History' },
      { code: 'EXP_DOC_REP', name: 'Expired Document Report' },
      { code: 'FILE_MVT_REP', name: 'File Movement Report' },
      { code: 'ARCH_REG_REP', name: 'Archive Register' }
    ]
  },

  // 19. Executive Management Department
  {
    id: 'dept_19',
    number: 19,
    name: 'Executive Management Department',
    head: 'CEO / Managing Director',
    category: 'General ERP & Corporate',
    definitions: [
      'Corporate Management',
      'Business Strategy',
      'Management Planning',
      'Department Coordination',
      'Executive Approvals',
      'Business Performance Review'
    ],
    forms: [
      { code: 'EXEC_DEC_FORM', name: 'Management Decision Form' },
      { code: 'EXEC_APPR_FORM', name: 'Executive Approval Form' },
      { code: 'MGMT_MEET_FORM', name: 'Management Meeting Form' },
      { code: 'BIZ_PLAN_FORM', name: 'Business Plan Form' }
    ],
    reports: [
      { code: 'CO_PERF_DASH', name: 'Company Performance Dashboard' },
      { code: 'DEPT_PERF_REP', name: 'Department Performance Report' },
      { code: 'MGMT_REV_REP', name: 'Management Review Report' },
      { code: 'EXEC_APPR_REG', name: 'Executive Approval Register' }
    ]
  },

  // 20. Business Development Department
  {
    id: 'dept_20',
    number: 20,
    name: 'Business Development Department',
    head: 'Business Development Manager',
    category: 'Sales & Customer Relations',
    definitions: [
      'New Business Opportunities',
      'Market Expansion',
      'Partnership Development',
      'Client Acquisition',
      'Business Proposals',
      'Revenue Growth'
    ],
    forms: [
      { code: 'BIZ_LEAD_FORM', name: 'Business Lead Form' },
      { code: 'PRTN_FORM', name: 'Partnership Form' },
      { code: 'BIZ_PROP_FORM', name: 'Business Proposal Form' },
      { code: 'OPP_REG_FORM', name: 'Opportunity Registration Form' }
    ],
    reports: [
      { code: 'BIZ_OPP_REG', name: 'Business Opportunity Register' },
      { code: 'NEW_CLNT_REP', name: 'New Client Report' },
      { code: 'PRTN_REP', name: 'Partnership Report' },
      { code: 'BIZ_GRW_REP', name: 'Business Growth Report' }
    ]
  },

  // 21. Planning & Budgeting Department
  {
    id: 'dept_21',
    number: 21,
    name: 'Planning & Budgeting Department',
    head: 'Planning Manager / Budget Manager',
    category: 'General ERP & Corporate',
    definitions: [
      'Annual Business Plan',
      'Department Budget',
      'Operating Expenditure (OPEX)',
      'Capital Expenditure (CAPEX)',
      'Budget Allocation',
      'Budget Monitoring'
    ],
    forms: [
      { code: 'ANN_BDGT_FORM', name: 'Annual Budget Form' },
      { code: 'DEPT_BDGT_FORM', name: 'Department Budget Form' },
      { code: 'CAPEX_REQ_FORM', name: 'CAPEX Request Form' },
      { code: 'OPEX_REQ_FORM', name: 'OPEX Request Form' },
      { code: 'BDGT_REV_FORM', name: 'Budget Revision Form' }
    ],
    reports: [
      { code: 'ANN_BDGT_REP', name: 'Annual Budget Report' },
      { code: 'DEPT_BDGT_REP', name: 'Department-wise Budget' },
      { code: 'BDGT_ACT_REP', name: 'Budget vs Actual Report' },
      { code: 'CAPEX_REP', name: 'CAPEX Report' },
      { code: 'OPEX_REP', name: 'OPEX Report' },
      { code: 'BDGT_VAR_REP', name: 'Budget Variance Report' }
    ]
  },

  // 22. Costing & Cost Control Department
  {
    id: 'dept_22',
    number: 22,
    name: 'Costing & Cost Control Department',
    head: 'Costing Manager / Cost Accountant',
    category: 'General ERP & Corporate',
    definitions: [
      'Raw Material Costing',
      'Labour Costing',
      'Direct & Indirect Expenses',
      'Factory Overheads',
      'Product Costing',
      'Job Costing',
      'Project Costing',
      'Standard & Actual Cost',
      'Cost Variance Analysis'
    ],
    forms: [
      { code: 'PROD_COST_FORM', name: 'Product Costing Form' },
      { code: 'RM_COST_FORM', name: 'Raw Material Cost Form' },
      { code: 'LAB_COST_FORM', name: 'Labour Cost Form' },
      { code: 'OVH_ALLOC_FORM', name: 'Overhead Allocation Form' },
      { code: 'JOB_COST_FORM', name: 'Job Costing Form' },
      { code: 'PRJ_COST_FORM', name: 'Project Costing Form' },
      { code: 'COST_REV_FORM', name: 'Cost Revision Form' }
    ],
    reports: [
      { code: 'PROD_COST_SHT', name: 'Product Cost Sheet' },
      { code: 'ITEM_COST_REP', name: 'Item-wise Cost Report' },
      { code: 'DEPT_COST_REP', name: 'Department Cost Report' },
      { code: 'JOB_COST_REP', name: 'Job Costing Report' },
      { code: 'PRJ_COST_REP', name: 'Project Cost Report' },
      { code: 'STD_ACT_COST', name: 'Standard vs Actual Cost' },
      { code: 'COST_VAR_REP', name: 'Cost Variance Report' },
      { code: 'PROFIT_ANAL_REP', name: 'Profitability Analysis' }
    ]
  },

  // 23. Internal Audit Department
  {
    id: 'dept_23',
    number: 23,
    name: 'Internal Audit Department',
    head: 'Internal Audit Manager / CAE',
    category: 'Governance, Security & IT',
    definitions: [
      'Financial Audit',
      'Inventory Audit',
      'Procurement Audit',
      'Sales Audit',
      'HR & Payroll Audit',
      'Operational Audit',
      'Compliance Audit',
      'Internal Controls'
    ],
    forms: [
      { code: 'AUD_PLAN_FORM', name: 'Audit Plan Form' },
      { code: 'AUD_CHK_FORM', name: 'Audit Checklist Form' },
      { code: 'AUD_OBS_FORM', name: 'Audit Observation Form' },
      { code: 'AUD_FIND_FORM', name: 'Audit Finding Form' },
      { code: 'CORR_ACT_FORM', name: 'Corrective Action Form' }
    ],
    reports: [
      { code: 'ANN_AUD_PLAN', name: 'Annual Audit Plan' },
      { code: 'AUD_OBS_REG', name: 'Audit Observation Register' },
      { code: 'FIN_AUD_REP', name: 'Financial Audit Report' },
      { code: 'INV_AUD_REP', name: 'Inventory Audit Report' },
      { code: 'PUR_AUD_REP', name: 'Procurement Audit Report' },
      { code: 'PAY_AUD_REP', name: 'Payroll Audit Report' },
      { code: 'AUD_COMPL_REP', name: 'Audit Compliance Report' }
    ]
  },

  // 24. Legal & Compliance Department
  {
    id: 'dept_24',
    number: 24,
    name: 'Legal & Compliance Department',
    head: 'Legal Manager / Compliance Manager',
    category: 'Governance, Security & IT',
    definitions: [
      'Company Registration',
      'Legal Documentation',
      'Contracts & Agreements',
      'Licenses & Permits',
      'Regulatory Compliance',
      'Legal Notices',
      'Policy Compliance'
    ],
    forms: [
      { code: 'CONT_REG_FORM', name: 'Contract Registration Form' },
      { code: 'AGR_APPR_FORM', name: 'Agreement Approval Form' },
      { code: 'LIC_REG_FORM', name: 'License Registration Form' },
      { code: 'LEG_CASE_FORM', name: 'Legal Case Form' },
      { code: 'COMPL_CHK_FORM', name: 'Compliance Checklist' }
    ],
    reports: [
      { code: 'CONT_REG_REP', name: 'Contract Register' },
      { code: 'LIC_EXP_REP', name: 'License Expiry Report' },
      { code: 'LEG_CASE_REG', name: 'Legal Case Register' },
      { code: 'COMPL_STAT_REP', name: 'Compliance Status Report' },
      { code: 'AGR_RNW_REP', name: 'Agreement Renewal Report' }
    ]
  },

  // 25. Risk Management Department
  {
    id: 'dept_25',
    number: 25,
    name: 'Risk Management Department',
    head: 'Risk Manager / CRO',
    category: 'Governance, Security & IT',
    definitions: [
      'Financial Risk',
      'Operational Risk',
      'Credit Risk',
      'Supply Chain Risk',
      'Compliance Risk',
      'Business Continuity'
    ],
    forms: [
      { code: 'RISK_ASMT_FORM', name: 'Risk Assessment Form' },
      { code: 'RISK_REG_FORM', name: 'Risk Register Form' },
      { code: 'RISK_MIT_FORM', name: 'Risk Mitigation Form' },
      { code: 'INC_REP_FORM', name: 'Incident Reporting Form' }
    ],
    reports: [
      { code: 'RISK_REG_REP', name: 'Risk Register' },
      { code: 'RISK_ASMT_REP', name: 'Risk Assessment Report' },
      { code: 'HI_RISK_REP', name: 'High-Risk Activity Report' },
      { code: 'RISK_MIT_REP', name: 'Risk Mitigation Status' },
      { code: 'BIZ_CONT_REP', name: 'Business Continuity Report' }
    ]
  },

  // 26. Business Intelligence & MIS Department
  {
    id: 'dept_26',
    number: 26,
    name: 'Business Intelligence & MIS Department',
    head: 'BI Manager / MIS Manager',
    category: 'Governance, Security & IT',
    definitions: [
      'Data Analysis',
      'Management Information System',
      'KPI Monitoring',
      'Dashboard Management',
      'Business Forecasting',
      'Performance Analytics'
    ],
    forms: [
      { code: 'KPI_SETUP_FORM', name: 'KPI Setup Form' },
      { code: 'DASH_CFG_FORM', name: 'Dashboard Configuration Form' },
      { code: 'REP_REQ_FORM', name: 'Report Request Form' },
      { code: 'DATA_CORR_FORM', name: 'Data Correction Request Form' }
    ],
    reports: [
      { code: 'EXEC_DASH_REP', name: 'Executive Dashboard' },
      { code: 'DEPT_KPI_REP', name: 'Department KPI Report' },
      { code: 'SALE_ANAL_REP', name: 'Sales Analytics' },
      { code: 'FIN_ANAL_REP', name: 'Financial Analytics' },
      { code: 'INV_ANAL_REP', name: 'Inventory Analytics' },
      { code: 'OPER_ANAL_REP', name: 'Operational Analytics' },
      { code: 'PERF_COMP_REP', name: 'Performance Comparison' }
    ]
  },

  // 27. Production Planning & Control Department (PPC)
  {
    id: 'dept_27',
    number: 27,
    name: 'Production Planning & Control Department (PPC)',
    head: 'PPC Manager',
    category: 'Operations & Manufacturing',
    definitions: [
      'Production Planning',
      'Capacity Planning',
      'Production Scheduling',
      'Work Order Planning',
      'Material Requirement Planning',
      'Production Monitoring'
    ],
    forms: [
      { code: 'PROD_PLAN_FORM', name: 'Production Plan Form' },
      { code: 'WO_PLAN_FORM', name: 'Work Order Form' },
      { code: 'CAP_PLAN_FORM', name: 'Capacity Planning Form' },
      { code: 'PROD_SCH_FORM', name: 'Production Schedule Form' },
      { code: 'MAT_REQ_FORM', name: 'Material Requirement Form' }
    ],
    reports: [
      { code: 'PROD_PLAN_REP', name: 'Production Plan Report' },
      { code: 'WO_STAT_REP', name: 'Work Order Status' },
      { code: 'CAP_UTIL_REP', name: 'Capacity Utilization' },
      { code: 'MAT_SHRT_REP', name: 'Material Shortage Report' },
      { code: 'PROD_SCH_REP', name: 'Production Schedule Report' }
    ]
  },

  // 28. Manufacturing Operations Department
  {
    id: 'dept_28',
    number: 28,
    name: 'Manufacturing Operations Department',
    head: 'Manufacturing Manager / Plant Manager',
    category: 'Operations & Manufacturing',
    definitions: [
      'Manufacturing Processes',
      'Assembly Operations',
      'Machine Operations',
      'Work Centers',
      'Production Lines',
      'Work-in-Process (WIP)'
    ],
    forms: [
      { code: 'MO_FORM', name: 'Manufacturing Order Form' },
      { code: 'MACH_OPER_FORM', name: 'Machine Operation Form' },
      { code: 'WC_FORM', name: 'Work Center Form' },
      { code: 'JOB_CARD_FORM', name: 'Job Card Form' },
      { code: 'WIP_ENT_FORM', name: 'WIP Entry Form' }
    ],
    reports: [
      { code: 'MO_REG_REP', name: 'Manufacturing Order Register' },
      { code: 'MACH_PROD_REP', name: 'Machine-wise Production' },
      { code: 'WC_PERF_REP', name: 'Work Center Performance' },
      { code: 'WIP_REP', name: 'WIP Report' },
      { code: 'MFG_EFF_REP', name: 'Manufacturing Efficiency' }
    ]
  },

  // 29. Industrial Engineering Department
  {
    id: 'dept_29',
    number: 29,
    name: 'Industrial Engineering Department',
    head: 'Industrial Engineering Manager',
    category: 'Operations & Manufacturing',
    definitions: [
      'Process Engineering',
      'Work Study',
      'Time & Motion Study',
      'Line Balancing',
      'Capacity Optimization',
      'Productivity Improvement'
    ],
    forms: [
      { code: 'PROC_STDY_FORM', name: 'Process Study Form' },
      { code: 'TIME_STDY_FORM', name: 'Time Study Form' },
      { code: 'WORK_MEAS_FORM', name: 'Work Measurement Form' },
      { code: 'PROC_IMPR_FORM', name: 'Process Improvement Form' }
    ],
    reports: [
      { code: 'STD_TIME_REP', name: 'Standard Time Report' },
      { code: 'LAB_PROD_REP', name: 'Labour Productivity Report' },
      { code: 'LINE_EFF_REP', name: 'Line Efficiency Report' },
      { code: 'PROC_IMPR_REP', name: 'Process Improvement Report' }
    ]
  },

  // 30. Plant & Factory Management Department
  {
    id: 'dept_30',
    number: 30,
    name: 'Plant & Factory Management Department',
    head: 'Plant Manager / Factory Manager',
    category: 'Operations & Manufacturing',
    definitions: [
      'Plant Operations',
      'Factory Administration',
      'Plant Utilities',
      'Machine Utilization',
      'Factory Workforce',
      'Plant Safety'
    ],
    forms: [
      { code: 'PLNT_REG_FORM', name: 'Plant Registration Form' },
      { code: 'UTIL_CONS_FORM', name: 'Utility Consumption Form' },
      { code: 'SHIFT_MGMT_FORM', name: 'Shift Management Form' },
      { code: 'PLNT_INSP_FORM', name: 'Plant Inspection Form' }
    ],
    reports: [
      { code: 'PLNT_PERF_REP', name: 'Plant Performance Report' },
      { code: 'UTIL_CONS_REP', name: 'Utility Consumption Report' },
      { code: 'MACH_UTIL_REP', name: 'Machine Utilization Report' },
      { code: 'FCTY_EXP_REP', name: 'Factory Expense Report' }
    ]
  },

  // 31. Packaging Department
  {
    id: 'dept_31',
    number: 31,
    name: 'Packaging Department',
    head: 'Packaging Manager',
    category: 'Operations & Manufacturing',
    definitions: [
      'Packaging Planning',
      'Packaging Material',
      'Filling Operations',
      'Labelling',
      'Carton Packing',
      'Batch Coding'
    ],
    forms: [
      { code: 'PKG_PLAN_FORM', name: 'Packaging Plan Form' },
      { code: 'PKG_MAT_FORM', name: 'Packaging Material Issue Form' },
      { code: 'FILL_PROD_FORM', name: 'Filling Production Form' },
      { code: 'LBL_APPR_FORM', name: 'Label Approval Form' },
      { code: 'PACK_COMP_FORM', name: 'Packing Completion Form' }
    ],
    reports: [
      { code: 'PKG_CONS_REP', name: 'Packaging Material Consumption' },
      { code: 'FILL_PROD_REP', name: 'Filling Production Report' },
      { code: 'PACK_EFF_REP', name: 'Packing Efficiency Report' },
      { code: 'PKG_REJ_REP', name: 'Packaging Rejection Report' }
    ]
  },

  // 32. HSE / Environment Department
  {
    id: 'dept_32',
    number: 32,
    name: 'HSE / Environment Department',
    head: 'HSE Manager',
    category: 'Governance, Security & IT',
    definitions: [
      'Occupational Health & Safety',
      'Environmental Management',
      'Fire Prevention',
      'Waste Management',
      'Workplace Risk Assessment',
      'Emergency Management'
    ],
    forms: [
      { code: 'SAFE_INSP_FORM', name: 'Safety Inspection Form' },
      { code: 'ACC_INC_FORM', name: 'Accident / Incident Form' },
      { code: 'FIRE_DRL_FORM', name: 'Fire Drill Form' },
      { code: 'WASTE_DISP_FORM', name: 'Waste Disposal Form' },
      { code: 'SAFE_TRN_FORM', name: 'Safety Training Form' }
    ],
    reports: [
      { code: 'SAFE_INSP_REP', name: 'Safety Inspection Report' },
      { code: 'ACC_REG_REP', name: 'Accident Register' },
      { code: 'INC_ANAL_REP', name: 'Incident Analysis' },
      { code: 'WASTE_MGMT_REP', name: 'Waste Management Report' },
      { code: 'HSE_COMPL_REP', name: 'HSE Compliance Report' }
    ]
  },

  // 33. Food Production Department
  {
    id: 'dept_33',
    number: 33,
    name: 'Food Production Department',
    head: 'Food Production Manager',
    category: 'Food & Agriculture',
    definitions: [
      'Raw Material Preparation',
      'Ingredient Processing',
      'Mixing & Blending',
      'Cooking & Processing',
      'Filling Operations',
      'Packaging Operations',
      'Batch Production'
    ],
    forms: [
      { code: 'BATCH_PROD_FORM', name: 'Batch Production Form' },
      { code: 'RECIPE_FORM', name: 'Recipe / Formula Form' },
      { code: 'INGR_ISS_FORM', name: 'Ingredient Issue Form' },
      { code: 'MIX_PROC_FORM', name: 'Mixing & Processing Form' },
      { code: 'FILL_FORM', name: 'Filling Form' },
      { code: 'FG_RCV_FORM', name: 'Finished Goods Receipt Form' }
    ],
    reports: [
      { code: 'DAILY_FOOD_REP', name: 'Daily Food Production Report' },
      { code: 'BATCH_PROD_REG', name: 'Batch Production Register' },
      { code: 'INGR_CONS_REP', name: 'Ingredient Consumption' },
      { code: 'FILL_PACK_REP', name: 'Filling & Packing Report' },
      { code: 'PROD_YLD_REP', name: 'Production Yield Report' },
      { code: 'BATCH_COST_REP', name: 'Batch Cost Report' }
    ]
  },

  // 34. Food Safety Department
  {
    id: 'dept_34',
    number: 34,
    name: 'Food Safety Department',
    head: 'Food Safety Manager',
    category: 'Food & Agriculture',
    definitions: [
      'HACCP',
      'GMP',
      'GHP',
      'Hygiene Management',
      'Pest Control',
      'Food Traceability',
      'Product Recall'
    ],
    forms: [
      { code: 'HYG_INSP_FORM', name: 'Hygiene Inspection Form' },
      { code: 'HACCP_MON_FORM', name: 'HACCP Monitoring Form' },
      { code: 'PEST_CTRL_FORM', name: 'Pest Control Form' },
      { code: 'TEMP_MON_FORM', name: 'Temperature Monitoring Form' },
      { code: 'PROD_REC_FORM', name: 'Product Recall Form' }
    ],
    reports: [
      { code: 'FOOD_SAFE_INSP', name: 'Food Safety Inspection' },
      { code: 'HACCP_COMPL_REP', name: 'HACCP Compliance' },
      { code: 'HYG_MON_REP', name: 'Hygiene Monitoring' },
      { code: 'PEST_CTRL_REP', name: 'Pest Control Report' },
      { code: 'TRACE_REP', name: 'Product Traceability Report' },
      { code: 'RECALL_REG_REP', name: 'Recall Register' }
    ]
  },

  // 35. Laboratory & Food Testing Department
  {
    id: 'dept_35',
    number: 35,
    name: 'Laboratory & Food Testing Department',
    head: 'Laboratory Manager / Food Technologist',
    category: 'Food & Agriculture',
    definitions: [
      'Raw Material Testing',
      'Water Testing',
      'Chemical Testing',
      'Microbiological Testing',
      'Product Testing',
      'Shelf-Life Testing'
    ],
    forms: [
      { code: 'SMPL_REG_FORM', name: 'Sample Registration Form' },
      { code: 'RM_TEST_FORM', name: 'Raw Material Testing Form' },
      { code: 'WTR_TEST_FORM', name: 'Water Testing Form' },
      { code: 'FG_TEST_FORM', name: 'Finished Product Testing Form' },
      { code: 'SHELF_TEST_FORM', name: 'Shelf-Life Testing Form' }
    ],
    reports: [
      { code: 'LAB_TEST_REP', name: 'Laboratory Test Report' },
      { code: 'RM_QUAL_REP', name: 'Raw Material Quality Report' },
      { code: 'WTR_QUAL_REP', name: 'Water Quality Report' },
      { code: 'FG_TEST_REP', name: 'Finished Product Test Report' },
      { code: 'SHELF_REP', name: 'Shelf-Life Report' }
    ]
  },

  // 36. Product Formulation & R&D Department
  {
    id: 'dept_36',
    number: 36,
    name: 'Product Formulation & R&D Department',
    head: 'R&D Manager / Food Technologist',
    category: 'Food & Agriculture',
    definitions: [
      'Product Research',
      'Recipe Development',
      'Ingredient Specifications',
      'Formula Standardization',
      'Product Trials',
      'Product Improvement'
    ],
    forms: [
      { code: 'NPD_FORM', name: 'New Product Development Form' },
      { code: 'REC_FORM_FORM', name: 'Recipe Formulation Form' },
      { code: 'TRIAL_BATCH_FORM', name: 'Trial Batch Form' },
      { code: 'INGR_SPEC_FORM', name: 'Ingredient Specification Form' },
      { code: 'PROD_APPR_FORM', name: 'Product Approval Form' }
    ],
    reports: [
      { code: 'PROD_DEV_REG', name: 'Product Development Register' },
      { code: 'REC_COST_REP', name: 'Recipe Costing Report' },
      { code: 'TRIAL_PROD_REP', name: 'Trial Production Report' },
      { code: 'INGR_USG_REP', name: 'Ingredient Usage Report' },
      { code: 'PROD_EVAL_REP', name: 'Product Evaluation Report' }
    ]
  },

  // 37. Cold Chain & Temperature Control Department
  {
    id: 'dept_37',
    number: 37,
    name: 'Cold Chain & Temperature Control Department',
    head: 'Cold Chain Manager',
    category: 'Food & Agriculture',
    definitions: [
      'Cold Storage',
      'Refrigerated Transportation',
      'Temperature Monitoring',
      'Frozen Inventory',
      'Cold Chain Compliance'
    ],
    forms: [
      { code: 'TEMP_LOG_FORM', name: 'Temperature Log Form' },
      { code: 'COLD_STG_FORM', name: 'Cold Storage Entry Form' },
      { code: 'REFR_VEH_FORM', name: 'Refrigerated Vehicle Form' },
      { code: 'TEMP_EXC_FORM', name: 'Temperature Excursion Form' }
    ],
    reports: [
      { code: 'TEMP_MON_REP', name: 'Temperature Monitoring Report' },
      { code: 'COLD_STK_REP', name: 'Cold Storage Stock Report' },
      { code: 'TEMP_EXC_REG', name: 'Temperature Excursion Register' },
      { code: 'COLD_COMPL_REP', name: 'Cold Chain Compliance Report' }
    ]
  },

  // 38. School Administration Department
  {
    id: 'dept_38',
    number: 38,
    name: 'School Administration Department',
    head: 'Principal / School Administrator',
    category: 'Education & Institutions',
    definitions: [
      'School Management',
      'Staff Coordination',
      'Campus Administration',
      'School Policies',
      'Parent Communication'
    ],
    forms: [
      { code: 'SCH_REG_FORM', name: 'School Registration Form' },
      { code: 'STAFF_ASGN_FORM', name: 'Staff Assignment Form' },
      { code: 'VISIT_SCH_FORM', name: 'Visitor Form' },
      { code: 'SCH_EVT_FORM', name: 'School Event Form' }
    ],
    reports: [
      { code: 'SCH_ADMIN_REP', name: 'School Administration Report' },
      { code: 'STAFF_STR_REP', name: 'Staff Strength Report' },
      { code: 'VISIT_REG_REP', name: 'Visitor Register' },
      { code: 'SCH_ACT_REP', name: 'School Activity Report' }
    ]
  },

  // 39. Admissions Department (School)
  {
    id: 'dept_39',
    number: 39,
    name: 'Admissions Department',
    head: 'Admission Manager / Admission Officer',
    category: 'Education & Institutions',
    definitions: [
      'Admission Enquiries',
      'Student Registration',
      'Document Verification',
      'Entrance Test',
      'Admission Approval',
      'Student Enrollment'
    ],
    forms: [
      { code: 'ADM_ENQ_FORM', name: 'Admission Enquiry Form' },
      { code: 'STUD_ADM_FORM', name: 'Student Admission Form' },
      { code: 'DOC_VER_FORM', name: 'Document Verification Form' },
      { code: 'ADM_TEST_FORM', name: 'Admission Test Form' },
      { code: 'ADM_APPR_FORM', name: 'Admission Approval Form' }
    ],
    reports: [
      { code: 'ADM_ENQ_REG', name: 'Admission Enquiry Register' },
      { code: 'NEW_ADM_REP', name: 'New Admission Report' },
      { code: 'CLS_ADM_REP', name: 'Class-wise Admission Report' },
      { code: 'PEND_DOC_REP', name: 'Pending Documents Report' },
      { code: 'ADM_CANC_REP', name: 'Admission Cancellation Report' }
    ]
  },

  // 40. Academic Department
  {
    id: 'dept_40',
    number: 40,
    name: 'Academic Department',
    head: 'Academic Director / Academic Coordinator',
    category: 'Education & Institutions',
    definitions: [
      'Class Management',
      'Subject Management',
      'Curriculum',
      'Teacher Allocation',
      'Lesson Planning',
      'Academic Calendar'
    ],
    forms: [
      { code: 'CLS_SETUP_FORM', name: 'Class Setup Form' },
      { code: 'SUB_SETUP_FORM', name: 'Subject Setup Form' },
      { code: 'TCH_ALLOC_FORM', name: 'Teacher Allocation Form' },
      { code: 'LESSON_PLAN_FORM', name: 'Lesson Plan Form' },
      { code: 'TIMETABLE_FORM', name: 'Timetable Form' }
    ],
    reports: [
      { code: 'CLS_STUD_REP', name: 'Class-wise Student Report' },
      { code: 'TCH_WORK_REP', name: 'Teacher Workload Report' },
      { code: 'SUB_PERF_REP', name: 'Subject-wise Performance' },
      { code: 'TIMETABLE_REP', name: 'Timetable Report' },
      { code: 'ACAD_PROG_REP', name: 'Academic Progress Report' }
    ]
  },

  // 41. Examination Department (School)
  {
    id: 'dept_41',
    number: 41,
    name: 'Examination Department',
    head: 'Examination Controller / Exam Coordinator',
    category: 'Education & Institutions',
    definitions: [
      'Exam Planning',
      'Date Sheet',
      'Question Papers',
      'Student Exam Registration',
      'Marks Entry',
      'Result Processing'
    ],
    forms: [
      { code: 'EXAM_SETUP_FORM', name: 'Exam Setup Form' },
      { code: 'DATE_SHT_FORM', name: 'Date Sheet Form' },
      { code: 'ROLL_SLIP_FORM', name: 'Roll Number Slip Form' },
      { code: 'MARKS_ENT_FORM', name: 'Marks Entry Form' },
      { code: 'RES_PROC_FORM', name: 'Result Processing Form' },
      { code: 'REP_CARD_FORM', name: 'Report Card Form' }
    ],
    reports: [
      { code: 'EXAM_SCH_REP', name: 'Examination Schedule' },
      { code: 'STUD_ATT_REP', name: 'Student Attendance Sheet' },
      { code: 'MARKS_SHT_REP', name: 'Marks Sheet' },
      { code: 'CLS_RES_REP', name: 'Class Result Report' },
      { code: 'POS_HLD_REP', name: 'Position Holders Report' },
      { code: 'PASS_FAIL_REP', name: 'Fail / Pass Report' },
      { code: 'STUD_PROG_REP', name: 'Student Progress Report' }
    ]
  },

  // 55. Hospital Administration Department
  {
    id: 'dept_55',
    number: 55,
    name: 'Hospital Administration Department',
    head: 'Hospital Administrator / CEO',
    category: 'Healthcare & Clinical',
    definitions: [
      'Hospital Operations',
      'Patient Administration',
      'Staff Coordination',
      'Facility Management',
      'Hospital Policies'
    ],
    forms: [
      { code: 'HOSP_SETUP_FORM', name: 'Hospital Setup Form' },
      { code: 'HOSP_DEPT_FORM', name: 'Department Setup Form' },
      { code: 'STAFF_DUTY_FORM', name: 'Staff Duty Form' },
      { code: 'FACIL_REQ_FORM', name: 'Facility Request Form' }
    ],
    reports: [
      { code: 'HOSP_OPER_REP', name: 'Hospital Operations Report' },
      { code: 'DEPT_PERF_REP', name: 'Department-wise Performance' },
      { code: 'STAFF_DUTY_REP', name: 'Staff Duty Report' },
      { code: 'FACIL_MGMT_REP', name: 'Facility Management Report' }
    ]
  },

  // 56. OPD Department
  {
    id: 'dept_56',
    number: 56,
    name: 'OPD Department',
    head: 'OPD Manager',
    category: 'Healthcare & Clinical',
    definitions: [
      'Patient Registration',
      'Doctor Appointments',
      'Consultation',
      'OPD Billing',
      'Patient Follow-ups'
    ],
    forms: [
      { code: 'PAT_REG_FORM', name: 'Patient Registration Form' },
      { code: 'APPT_FORM', name: 'Appointment Form' },
      { code: 'DOC_CONS_FORM', name: 'Doctor Consultation Form' },
      { code: 'OPD_RX_FORM', name: 'OPD Prescription Form' },
      { code: 'OPD_BILL_FORM', name: 'OPD Billing Form' }
    ],
    reports: [
      { code: 'DAILY_OPD_REG', name: 'Daily OPD Register' },
      { code: 'DOC_PAT_REP', name: 'Doctor-wise Patient Report' },
      { code: 'APPT_REP', name: 'Appointment Report' },
      { code: 'OPD_REV_REP', name: 'OPD Revenue Report' },
      { code: 'PAT_FLWUP_REP', name: 'Patient Follow-up Report' }
    ]
  },

  // 61. Pharmacy Department
  {
    id: 'dept_61',
    number: 61,
    name: 'Pharmacy Department',
    head: 'Chief Pharmacist / Pharmacy Manager',
    category: 'Healthcare & Clinical',
    definitions: [
      'Medicine Master',
      'Medicine Procurement',
      'Medicine Inventory',
      'Prescription Management',
      'Dispensing',
      'Batch & Expiry Control'
    ],
    forms: [
      { code: 'MED_MTR_FORM', name: 'Medicine Master Form' },
      { code: 'PHARM_PUR_FORM', name: 'Pharmacy Purchase Form' },
      { code: 'RX_FORM', name: 'Prescription Form' },
      { code: 'MED_ISS_FORM', name: 'Medicine Issue Form' },
      { code: 'MED_RET_FORM', name: 'Medicine Return Form' }
    ],
    reports: [
      { code: 'MED_STK_REP', name: 'Medicine Stock Report' },
      { code: 'MED_EXP_REP', name: 'Medicine Expiry Report' },
      { code: 'PHARM_SALE_REP', name: 'Pharmacy Sales Report' },
      { code: 'RX_REG_REP', name: 'Prescription Register' },
      { code: 'MED_CONS_REP', name: 'Medicine Consumption Report' }
    ]
  },

  // 71. Construction Project Department
  {
    id: 'dept_71',
    number: 71,
    name: 'Construction Project Department',
    head: 'Project Director / Construction Manager',
    category: 'Construction & Engineering',
    definitions: [
      'Project Registration',
      'Site Planning',
      'Project Scheduling',
      'Site Execution',
      'Labour Management',
      'Project Monitoring'
    ],
    forms: [
      { code: 'CNST_PRJ_FORM', name: 'Project Registration Form' },
      { code: 'SITE_OPEN_FORM', name: 'Site Opening Form' },
      { code: 'CNST_WO_FORM', name: 'Work Order Form' },
      { code: 'SITE_PROG_FORM', name: 'Site Progress Form' },
      { code: 'CNST_COMP_FORM', name: 'Project Completion Form' }
    ],
    reports: [
      { code: 'CNST_REG_REP', name: 'Project Register' },
      { code: 'SITE_PROG_REP', name: 'Site Progress Report' },
      { code: 'CNST_COST_REP', name: 'Project Cost Report' },
      { code: 'DELAY_WORK_REP', name: 'Delayed Work Report' },
      { code: 'CNST_COMP_REP', name: 'Project Completion Report' }
    ]
  },

  // 76. Solar Project Department
  {
    id: 'dept_76',
    number: 76,
    name: 'Solar Project Department',
    head: 'Solar Project Manager',
    category: 'Energy & Solar',
    definitions: [
      'Site Survey',
      'Project Feasibility',
      'Project Estimation',
      'Installation Planning',
      'Project Execution',
      'Commissioning & Handover'
    ],
    forms: [
      { code: 'SOLAR_SRV_FORM', name: 'Customer Site Survey Form' },
      { code: 'SOLAR_FEAS_FORM', name: 'Project Feasibility Form' },
      { code: 'SOLAR_QUOT_FORM', name: 'Solar Quotation Form' },
      { code: 'SOLAR_REG_FORM', name: 'Project Registration Form' },
      { code: 'SOLAR_INST_CHK', name: 'Installation Checklist' },
      { code: 'SOLAR_HNDVR_FORM', name: 'Project Handover Form' }
    ],
    reports: [
      { code: 'SOLAR_REG_REP', name: 'Solar Project Register' },
      { code: 'SOLAR_SRV_REP', name: 'Site Survey Report' },
      { code: 'SOLAR_COST_REP', name: 'Project Cost Report' },
      { code: 'SOLAR_PROG_REP', name: 'Installation Progress Report' },
      { code: 'SOLAR_HNDVR_REP', name: 'Project Handover Report' }
    ]
  },

  // 84. Digital Advertising Department
  {
    id: 'dept_84',
    number: 84,
    name: 'Digital Advertising Department',
    head: 'Digital Marketing Manager',
    category: 'Creative, Media & Tech',
    definitions: [
      'Facebook Ads',
      'Instagram Ads',
      'WhatsApp Marketing',
      'Google Ads',
      'YouTube Ads',
      'Audience Targeting',
      'Campaign Optimization'
    ],
    forms: [
      { code: 'AD_CAMP_FORM', name: 'Advertising Campaign Form' },
      { code: 'AD_BDGT_FORM', name: 'Ad Budget Form' },
      { code: 'AUD_SETUP_FORM', name: 'Audience Setup Form' },
      { code: 'AD_APPR_FORM', name: 'Ad Approval Form' },
      { code: 'CAMP_RES_FORM', name: 'Campaign Result Form' }
    ],
    reports: [
      { code: 'CAMP_PERF_REP', name: 'Campaign Performance' },
      { code: 'PLAT_SPEND_REP', name: 'Platform-wise Ad Spend' },
      { code: 'REACH_IMP_REP', name: 'Reach & Impressions' },
      { code: 'CLICKS_LEAD_REP', name: 'Clicks & Leads Report' },
      { code: 'CONV_REP', name: 'Conversion Report' },
      { code: 'ROAS_REP', name: 'Advertising ROI / ROAS' }
    ]
  },

  // 93. Textile Production Department
  {
    id: 'dept_93',
    number: 93,
    name: 'Textile Production Department',
    head: 'Textile Production Manager',
    category: 'Operations & Manufacturing',
    definitions: [
      'Spinning',
      'Weaving',
      'Knitting',
      'Dyeing',
      'Printing',
      'Finishing'
    ],
    forms: [
      { code: 'TXT_ORD_FORM', name: 'Production Order Form' },
      { code: 'YARN_ISS_FORM', name: 'Yarn Issue Form' },
      { code: 'FAB_PROD_FORM', name: 'Fabric Production Form' },
      { code: 'DYE_PROC_FORM', name: 'Dyeing Process Form' },
      { code: 'FINISH_FORM', name: 'Finishing Form' }
    ],
    reports: [
      { code: 'SPIN_PROD_REP', name: 'Spinning Production' },
      { code: 'WEAVE_PROD_REP', name: 'Weaving Production' },
      { code: 'DYE_REP', name: 'Dyeing Report' },
      { code: 'FAB_OUT_REP', name: 'Fabric Output Report' },
      { code: 'TXT_EFF_REP', name: 'Production Efficiency' }
    ]
  },

  // 104. Banking Operations Department
  {
    id: 'dept_104',
    number: 104,
    name: 'Banking Operations Department',
    head: 'Operations Manager',
    category: 'Banking, Finance & NGO',
    definitions: [
      'Account Opening',
      'Customer Verification',
      'Cash Management',
      'Deposits & Withdrawals',
      'Funds Transfer',
      'Branch Operations'
    ],
    forms: [
      { code: 'BNK_CUST_FORM', name: 'Customer Account Form' },
      { code: 'DEP_FORM', name: 'Deposit Form' },
      { code: 'WDR_FORM', name: 'Withdrawal Form' },
      { code: 'FT_FORM', name: 'Funds Transfer Form' },
      { code: 'BNK_VER_FORM', name: 'Customer Verification Form' }
    ],
    reports: [
      { code: 'ACCT_REG_REP', name: 'Account Register' },
      { code: 'DAILY_CASH_REP', name: 'Daily Cash Report' },
      { code: 'DEP_WDR_REP', name: 'Deposit & Withdrawal Report' },
      { code: 'BR_OPER_REP', name: 'Branch Operations Report' }
    ]
  },

  // 115. Software Development Department
  {
    id: 'dept_115',
    number: 115,
    name: 'Software Development Department',
    head: 'CTO / Development Manager',
    category: 'Creative, Media & Tech',
    definitions: [
      'Software Planning',
      'Frontend Development',
      'Backend Development',
      'Database Development',
      'API Integration',
      'Application Development'
    ],
    forms: [
      { code: 'SW_PRJ_FORM', name: 'Software Project Form' },
      { code: 'DEV_TASK_FORM', name: 'Development Task Form' },
      { code: 'CODE_REV_FORM', name: 'Code Review Form' },
      { code: 'REL_REQ_FORM', name: 'Release Request Form' }
    ],
    reports: [
      { code: 'DEV_PRJ_REG', name: 'Development Project Register' },
      { code: 'TASK_PROG_REP', name: 'Task Progress Report' },
      { code: 'DEV_PERF_REP', name: 'Developer Performance' },
      { code: 'REL_HIST_REP', name: 'Release History' }
    ]
  },

  // 125. ERP System Administration Department
  {
    id: 'dept_125',
    number: 125,
    name: 'ERP System Administration Department',
    head: 'ERP Manager / ERP Administrator',
    category: 'Governance, Security & IT',
    definitions: [
      'User Registration',
      'User Roles & Permissions',
      'Department Access',
      'Module Configuration',
      'System Settings',
      'Master Data Configuration',
      'User Activity Logs'
    ],
    forms: [
      { code: 'USR_REG_FORM', name: 'User Registration Form' },
      { code: 'ROLE_SETUP_FORM', name: 'Role Setup Form' },
      { code: 'PERM_ASGN_FORM', name: 'Permission Assignment Form' },
      { code: 'MOD_CFG_FORM', name: 'Module Configuration Form' },
      { code: 'SYS_SET_FORM', name: 'System Settings Form' }
    ],
    reports: [
      { code: 'USR_REG_REP', name: 'User Register' },
      { code: 'LOGIN_HIST_REP', name: 'User Login History' },
      { code: 'ROLE_PERM_REP', name: 'Role & Permission Report' },
      { code: 'ACT_LOG_REP', name: 'User Activity Report' },
      { code: 'MOD_USG_REP', name: 'Module Usage Report' }
    ]
  },

  // 130. API & Third-Party Integration Department
  {
    id: 'dept_130',
    number: 130,
    name: 'API & Third-Party Integration Department',
    head: 'Integration Manager / Technical Lead',
    category: 'Governance, Security & IT',
    definitions: [
      'Banking Integration',
      'Payment Gateway Integration',
      'SMS Integration',
      'WhatsApp Integration',
      'Email Integration',
      'E-Commerce Integration',
      'Government Portal Integration'
    ],
    forms: [
      { code: 'API_CFG_FORM', name: 'API Configuration Form' },
      { code: 'INT_SETUP_FORM', name: 'Integration Setup Form' },
      { code: 'API_CRED_FORM', name: 'API Credential Setup Form' },
      { code: 'INT_TEST_FORM', name: 'Integration Testing Form' }
    ],
    reports: [
      { code: 'API_TXN_REP', name: 'API Transaction Report' },
      { code: 'INT_ERR_REP', name: 'Integration Error Report' },
      { code: 'GATEWAY_REP', name: 'Payment Gateway Report' },
      { code: 'SMS_WA_REP', name: 'SMS / WhatsApp Delivery Report' },
      { code: 'INT_STAT_REP', name: 'Integration Status Report' }
    ]
  }
];

// Helper to get total department count
export const TOTAL_DEPARTMENTS_COUNT = 130;
