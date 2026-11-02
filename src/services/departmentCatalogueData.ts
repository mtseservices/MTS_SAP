// Massive ERP Catalogue - 38 Global Departments for MTS-ERP-SAP
// Strictly following user-provided specifications for Definitions, Forms and Reports.

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
    definitions: ['Company Accounting Setup', 'Chart of Accounts (COA)', 'Account Groups', 'Business Parties', 'Cost Center Setup', 'Bank & Cash Setup', 'Tax Configuration', 'Payment Terms'],
    forms: [
      { code: 'ACC_OPEN_FORM', name: 'Account Opening Form' },
      { code: 'JV_FORM', name: 'Journal Voucher (JV)' },
      { code: 'PV_FORM', name: 'Payment Voucher (PV)' },
      { code: 'RV_FORM', name: 'Receipt Voucher (RV)' },
      { code: 'CV_FORM', name: 'Contra Voucher (CV)' },
      { code: 'BRS_FORM', name: 'Bank Reconciliation Form' },
      { code: 'EXP_CLAIM_FORM', name: 'Expense Claim Form' },
      { code: 'ADV_PAY_FORM', name: 'Advance Payment Form' },
      { code: 'PTY_CASH_FORM', name: 'Petty Cash Form' },
      { code: 'FIXED_AST_PUR_FORM', name: 'Fixed Asset Purchase Form' },
      { code: 'BDGT_ALLOC_FORM', name: 'Budget Allocation Form' },
      { code: 'PRD_CLOSE_FORM', name: 'Period Closing Form' }
    ],
    reports: [
      { code: 'COA_REP', name: 'Chart of Accounts Report' },
      { code: 'VCH_REG_REP', name: 'Voucher Register' },
      { code: 'GL_REP', name: 'General Ledger' },
      { code: 'TB_REP', name: 'Trial Balance' },
      { code: 'BS_REP', name: 'Balance Sheet' },
      { code: 'PL_REP', name: 'Profit & Loss Statement' },
      { code: 'CF_REP', name: 'Cash Flow Statement' },
      { code: 'CB_REP', name: 'Cash Book' },
      { code: 'BB_REP', name: 'Bank Book' },
      { code: 'BR_REP', name: 'Bank Reconciliation Report' },
      { code: 'AR_AGING_REP', name: 'Accounts Receivable Aging' },
      { code: 'AP_AGING_REP', name: 'Accounts Payable Aging' },
      { code: 'CUST_LEDG_REP', name: 'Customer Ledger' },
      { code: 'SUPP_LEDG_REP', name: 'Supplier Ledger' },
      { code: 'EXP_ANAL_REP', name: 'Expense Analysis' },
      { code: 'CC_REP', name: 'Cost Center Report' },
      { code: 'BDGT_ACT_REP', name: 'Budget vs Actual Report' },
      { code: 'FA_REG_REP', name: 'Fixed Asset Register' },
      { code: 'DEP_REP', name: 'Depreciation Report' },
      { code: 'TAX_SUMM_REP', name: 'Tax Summary Report' },
      { code: 'WHT_REP', name: 'Withholding Tax Report' }
    ]
  },

  // 2. Inventory & Store Department
  {
    id: 'dept_2',
    number: 2,
    name: 'Inventory & Store Department',
    head: 'Inventory Manager / Store Incharge',
    category: 'Supply Chain & Logistics',
    definitions: ['Item Master', 'Item Categories', 'Unit of Measurement', 'Warehouse / Store Setup', 'Rack / Bin Location', 'Stock Valuation', 'Batch / Serial Number Setup', 'Stock Alert Configuration'],
    forms: [
      { code: 'ITEM_CREATE_FORM', name: 'Item Creation Form' },
      { code: 'OPEN_STK_FORM', name: 'Opening Stock Form' },
      { code: 'MAT_REQ_FORM', name: 'Material Requisition Form (MR)' },
      { code: 'MAT_ISS_FORM', name: 'Material Issue Form (MI)' },
      { code: 'MAT_RET_FORM', name: 'Material Return Form' },
      { code: 'GRN_FORM', name: 'Goods Receipt Note (GRN)' },
      { code: 'GOODS_RET_FORM', name: 'Goods Return Note' },
      { code: 'STK_TRF_FORM', name: 'Stock Transfer Form' },
      { code: 'STK_ADJ_FORM', name: 'Stock Adjustment Form' },
      { code: 'PHY_STK_CNT_FORM', name: 'Physical Stock Count Form' },
      { code: 'STK_RESV_FORM', name: 'Stock Reservation Form' },
      { code: 'STK_DISP_FORM', name: 'Stock Disposal Form' }
    ],
    reports: [
      { code: 'STK_SUMM_REP', name: 'Stock Summary' },
      { code: 'STK_LEDG_REP', name: 'Stock Ledger' },
      { code: 'WH_STK_REP', name: 'Warehouse Stock Report' },
      { code: 'ITEM_STK_REP', name: 'Item Wise Stock Report' },
      { code: 'CAT_STK_REP', name: 'Category Wise Stock Report' },
      { code: 'STK_VAL_REP', name: 'Stock Valuation Report' },
      { code: 'MIN_REO_REP', name: 'Minimum / Reorder Report' },
      { code: 'STK_AGING_REP', name: 'Stock Aging Report' },
      { code: 'EXP_ALRT_REP', name: 'Expiry Alert Report' },
      { code: 'SLOW_STK_REP', name: 'Slow / Non-Moving Stock' },
      { code: 'DEAD_STK_REP', name: 'Dead Stock Report' },
      { code: 'STK_TRF_REP', name: 'Stock Transfer Report' }
    ]
  },

  // 3. Sales & Distribution Department
  {
    id: 'dept_3',
    number: 3,
    name: 'Sales & Distribution Department',
    head: 'Sales Manager / Director',
    category: 'Sales & Customer Relations',
    definitions: ['Customer Master', 'Customer Categories', 'Salesperson Master', 'Price List', 'Sales Terms', 'Sales Territory'],
    forms: [
      { code: 'CUST_REG_FORM', name: 'Customer Registration Form' },
      { code: 'SALE_QUOT_FORM', name: 'Sales Quotation Form' },
      { code: 'SO_FORM', name: 'Sales Order Form' },
      { code: 'SI_FORM', name: 'Sales Invoice Form' },
      { code: 'POS_SALE_FORM', name: 'POS / Cash Sale Form' },
      { code: 'DC_FORM', name: 'Delivery Challan Form' },
      { code: 'SR_FORM', name: 'Sales Return Form' },
      { code: 'CN_FORM', name: 'Credit Note Form' },
      { code: 'CUST_RECPT_FORM', name: 'Customer Receipt Form' },
      { code: 'SALE_COMM_FORM', name: 'Sales Commission Form' },
      { code: 'SALE_TGT_FORM', name: 'Sales Target Form' }
    ],
    reports: [
      { code: 'DLY_SALE_REP', name: 'Daily Sales Register' },
      { code: 'MTH_SALE_SUMM', name: 'Monthly Sales Summary' },
      { code: 'CUST_SALE_REP', name: 'Customer Wise Sales' },
      { code: 'ITEM_SALE_REP', name: 'Item Wise Sales' },
      { code: 'CAT_SALE_REP', name: 'Category Wise Sales' },
      { code: 'REP_PERF_REP', name: 'Salesperson Performance' },
      { code: 'SO_PEND_REP', name: 'Sales Order Pending Report' },
      { code: 'CUST_OUT_REP', name: 'Customer Outstanding Report' },
      { code: 'GP_REP', name: 'Gross Profit Report' },
      { code: 'STAX_SUMM', name: 'Sales Tax Summary' },
      { code: 'CUST_STMT_REP', name: 'Customer Statement' }
    ]
  },

  // 4. Procurement / Purchase Department
  {
    id: 'dept_4',
    number: 4,
    name: 'Procurement / Purchase Department',
    head: 'Procurement Manager',
    category: 'Supply Chain & Logistics',
    definitions: ['Supplier / Vendor Master', 'Purchase Categories', 'Purchase Terms', 'Approval Matrix', 'Approved Vendor List'],
    forms: [
      { code: 'PR_FORM', name: 'Purchase Requisition (PR)' },
      { code: 'RFQ_FORM', name: 'Request for Quotation (RFQ)' },
      { code: 'QUOT_ENTRY_FORM', name: 'Supplier Quotation Entry' },
      { code: 'CS_FORM', name: 'Comparative Statement (CS)' },
      { code: 'PO_FORM', name: 'Purchase Order (PO)' },
      { code: 'PUR_INV_FORM', name: 'Purchase Invoice / Bill' },
      { code: 'PUR_RET_FORM', name: 'Purchase Return Form' },
      { code: 'SUPP_PAY_FORM', name: 'Supplier Payment Form' },
      { code: 'PUR_PRICE_REV', name: 'Purchase Price Revision Form' },
      { code: 'VND_EVAL_FORM', name: 'Vendor Evaluation Form' }
    ],
    reports: [
      { code: 'PR_REG_REP', name: 'Purchase Requisition Register' },
      { code: 'PEND_PR_REP', name: 'Pending PR Report' },
      { code: 'PO_REG_REP', name: 'Purchase Order Register' },
      { code: 'PEND_PO_REP', name: 'Pending Purchase Order' },
      { code: 'PUR_REG_REP', name: 'Purchase Register' },
      { code: 'SUPP_SALE_REP', name: 'Supplier Wise Purchase' },
      { code: 'PUR_TAX_REP', name: 'Purchase Tax Report' },
      { code: 'SUPP_OUT_REP', name: 'Supplier Outstanding' }
    ]
  },

  // 5. Human Resource (HR) & Payroll Department
  {
    id: 'dept_5',
    number: 5,
    name: 'Human Resource (HR) & Payroll Department',
    head: 'HR Manager / Director',
    category: 'General ERP & Corporate',
    definitions: ['Employee Master', 'Department Master', 'Designation Master', 'Shift Master', 'Salary Components', 'Payroll Configuration'],
    forms: [
      { code: 'EMP_REG_FORM', name: 'Employee Registration Form' },
      { code: 'JOB_APP_FORM', name: 'Job Application Form' },
      { code: 'ATT_ENT_FORM', name: 'Attendance Entry Form' },
      { code: 'LEAVE_APP_FORM', name: 'Leave Application Form' },
      { code: 'EMP_LOAN_FORM', name: 'Employee Loan Form' },
      { code: 'PAY_PROC_FORM', name: 'Payroll Processing Form' },
      { code: 'SLR_SLIP_FORM', name: 'Salary Slip Form' },
      { code: 'RESIG_FORM', name: 'Resignation Form' }
    ],
    reports: [
      { code: 'EMP_MTR_LST', name: 'Employee Master List' },
      { code: 'DEPT_HDCNT', name: 'Department Wise Headcount' },
      { code: 'ATT_REG_REP', name: 'Attendance Register' },
      { code: 'LEAVE_BAL_REP', name: 'Leave Balance Report' },
      { code: 'PAY_REG_REP', name: 'Monthly Payroll Register' },
      { code: 'LOAN_OUT_REP', name: 'Loan / Advance Outstanding' },
      { code: 'EMP_COST_REP', name: 'Employee Cost Report' }
    ]
  },

  // 6. Administration & Office Management
  {
    id: 'dept_6',
    number: 6,
    name: 'Administration & Office Management',
    head: 'Admin Manager',
    category: 'General ERP & Corporate',
    definitions: ['Branch Master', 'Office Location Master', 'Office Expense Categories', 'Gate Pass Types', 'Vehicle Master', 'Office Asset Master'],
    forms: [
      { code: 'VISIT_REG_FORM', name: 'Visitor Registration Form' },
      { code: 'MAIL_REG_FORM', name: 'Inward Mail Register' },
      { code: 'IGP_FORM', name: 'Inward Gate Pass' },
      { code: 'OGP_FORM', name: 'Outward Gate Pass' },
      { code: 'VEH_REQ_FORM', name: 'Vehicle Request Form' },
      { code: 'VEH_LOG_FORM', name: 'Vehicle Log Form' },
      { code: 'STAT_REQ_FORM', name: 'Stationery Requisition Form' },
      { code: 'OFF_MAINT_REQ', name: 'Office Maintenance Request' }
    ],
    reports: [
      { code: 'VISIT_REG_REP', name: 'Visitor Register' },
      { code: 'GP_REG_REP', name: 'Gate Pass Register' },
      { code: 'VEH_USE_REP', name: 'Vehicle Usage Report' },
      { code: 'FUEL_CONS_REP', name: 'Fuel Consumption Report' },
      { code: 'STAT_CONS_REP', name: 'Stationery Consumption Report' },
      { code: 'OFF_EXP_REP', name: 'Office Expense Report' }
    ]
  },

  // 7. Customer Relationship Management (CRM)
  {
    id: 'dept_7',
    number: 7,
    name: 'Customer Relationship Management (CRM)',
    head: 'CRM Manager',
    category: 'Sales & Customer Relations',
    definitions: ['Lead Sources', 'Lead Categories', 'Sales Pipeline Stages', 'Campaign Types'],
    forms: [
      { code: 'LEAD_REG_FORM', name: 'Lead Registration Form' },
      { code: 'LEAD_QUAL_FORM', name: 'Lead Qualification Form' },
      { code: 'OPP_FORM', name: 'Opportunity Form' },
      { code: 'FLWUP_FORM', name: 'Follow-up Form' },
      { code: 'CUST_COMP_FORM', name: 'Customer Complaint Form' },
      { code: 'CUST_FDBK_FORM', name: 'Customer Feedback Form' }
    ],
    reports: [
      { code: 'LEAD_REG_REP', name: 'Lead Register' },
      { code: 'LEAD_CONV_REP', name: 'Lead Conversion Report' },
      { code: 'OPP_PIPE_REP', name: 'Opportunity Pipeline' },
      { code: 'FUNNEL_REP', name: 'Sales Funnel Report' },
      { code: 'COMP_REG_REP', name: 'Customer Complaint Register' },
      { code: 'SAT_REP', name: 'Customer Satisfaction Report' }
    ]
  },

  // 8. Marketing Department
  {
    id: 'dept_8',
    number: 8,
    name: 'Marketing Department',
    head: 'Marketing Head',
    category: 'Sales & Customer Relations',
    definitions: ['Marketing Channels', 'Campaign Categories', 'Advertisement Platforms', 'Marketing Budget Heads'],
    forms: [
      { code: 'MKT_CAMP_FORM', name: 'Marketing Campaign Form' },
      { code: 'AD_REQ_FORM', name: 'Advertisement Request Form' },
      { code: 'PROM_SCHM_FORM', name: 'Promotional Scheme Form' },
      { code: 'MKT_EXP_FORM', name: 'Marketing Expense Form' },
      { code: 'MKT_SURV_FORM', name: 'Market Survey Form' }
    ],
    reports: [
      { code: 'CAMP_BDGT_REP', name: 'Campaign Budget vs Actual' },
      { code: 'MKT_EXP_REG', name: 'Marketing Expense Register' },
      { code: 'AD_COST_REP', name: 'Advertisement Cost Report' },
      { code: 'ROI_REP', name: 'Return on Marketing Investment' }
    ]
  },

  // 9. Document Management & Records
  {
    id: 'dept_9',
    number: 9,
    name: 'Document Management & Records',
    head: 'Records Manager',
    category: 'General ERP & Corporate',
    definitions: ['Document Categories', 'Document Types', 'Confidentiality Levels', 'Retention Periods'],
    forms: [
      { code: 'DOC_UPLD_FORM', name: 'Document Upload Form' },
      { code: 'DOC_APPR_FORM', name: 'Document Approval Form' },
      { code: 'DOC_REV_FORM', name: 'Document Revision Form' },
      { code: 'CONT_REG_FORM', name: 'Contract Registration Form' },
      { code: 'DOC_ISS_FORM', name: 'Document Issue / Return Form' }
    ],
    reports: [
      { code: 'DOC_REG_REP', name: 'Document Register' },
      { code: 'PEND_APPR_DOC', name: 'Pending Approval Documents' },
      { code: 'EXP_CONT_REP', name: 'Expiring Contracts' },
      { code: 'RET_DISP_REP', name: 'Document Retention / Disposal Report' }
    ]
  },

  // 10. Supply Chain Management (SCM)
  {
    id: 'dept_10',
    number: 10,
    name: 'Supply Chain Management (SCM)',
    head: 'SCM Manager',
    category: 'Supply Chain & Logistics',
    definitions: ['Supply Chain Network', 'Demand Planning Rules', 'Lead Time Master', 'Replenishment Rules'],
    forms: [
      { code: 'DEM_FCST_FORM', name: 'Demand Forecast Form' },
      { code: 'REPL_PLAN_FORM', name: 'Replenishment Planning Form' },
      { code: 'SUPP_PLAN_FORM', name: 'Supply Plan Form' },
      { code: 'DIST_PLAN_FORM', name: 'Distribution Plan Form' }
    ],
    reports: [
      { code: 'FCST_ACT_REP', name: 'Demand Forecast vs Actual' },
      { code: 'SUPP_LDTM_REP', name: 'Supplier Lead Time Report' },
      { code: 'SCM_COST_REP', name: 'Supply Chain Cost Report' },
      { code: 'SRV_LVL_REP', name: 'Service Level Report' }
    ]
  },

  // 11. Warehouse Management System (WMS)
  {
    id: 'dept_11',
    number: 11,
    name: 'Warehouse Management System (WMS)',
    head: 'WMS Manager',
    category: 'Supply Chain & Logistics',
    definitions: ['Warehouse Zones', 'Rack / Bin Locations', 'Storage Rules', 'Picking Methods'],
    forms: [
      { code: 'PUT_AWAY_FORM', name: 'Put-Away Form' },
      { code: 'PICK_LST_FORM', name: 'Picking List Form' },
      { code: 'PACK_FORM', name: 'Packing Form' },
      { code: 'DISP_FORM', name: 'Dispatch Form' },
      { code: 'BIN_TRF_FORM', name: 'Bin Transfer Form' },
      { code: 'CYC_CNT_FORM', name: 'Cycle Count Form' }
    ],
    reports: [
      { code: 'BIN_STK_REP', name: 'Bin Wise Stock' },
      { code: 'PICK_ACC_REP', name: 'Picking Accuracy' },
      { code: 'WH_UTIL_REP', name: 'Warehouse Utilization' },
      { code: 'WH_PROD_REP', name: 'Warehouse Productivity' }
    ]
  },

  // 12. Logistics & Transport
  {
    id: 'dept_12',
    number: 12,
    name: 'Logistics & Transport',
    head: 'Logistics Manager',
    category: 'Supply Chain & Logistics',
    definitions: ['Vehicle Master', 'Driver Master', 'Transporter Master', 'Route Master', 'Freight Rates'],
    forms: [
      { code: 'VEH_TRIP_FORM', name: 'Vehicle Trip Sheet' },
      { code: 'DEL_PLAN_FORM', name: 'Delivery Planning Form' },
      { code: 'FRGT_BOOK_FORM', name: 'Freight Booking Form' },
      { code: 'FUEL_ISS_FORM', name: 'Fuel Issue Form' },
      { code: 'VEH_MAINT_FORM', name: 'Vehicle Maintenance Form' },
      { code: 'SHIP_TRK_FORM', name: 'Shipment Tracking Form' }
    ],
    reports: [
      { code: 'TRIP_REG_REP', name: 'Vehicle Trip Register' },
      { code: 'FUEL_ANAL_REP', name: 'KM per Litre Analysis' },
      { code: 'FRGT_EXP_REP', name: 'Freight Expense Report' },
      { code: 'SHIP_TRK_REP', name: 'Shipment Tracking Report' }
    ]
  },

  // 13. Production / Manufacturing Department
  {
    id: 'dept_13',
    number: 13,
    name: 'Production / Manufacturing Department',
    head: 'Production Manager',
    category: 'Operations & Manufacturing',
    definitions: ['Product Master', 'Raw Material Master', 'Bill of Materials (BOM)', 'Routing Master', 'Machine Master'],
    forms: [
      { code: 'PROD_PLAN_FORM', name: 'Production Plan Form' },
      { code: 'PROD_ORD_FORM', name: 'Production Order Form' },
      { code: 'MAT_ISS_PROD', name: 'Material Issue to Production' },
      { code: 'PROD_CONS_FORM', name: 'Production Consumption Form' },
      { code: 'DPR_FORM', name: 'Daily Production Report (DPR)' },
      { code: 'PROD_COMP_FORM', name: 'Production Completion Form' },
      { code: 'MACH_DWNTM_FORM', name: 'Machine Downtime Form' },
      { code: 'SCRAP_ENT_FORM', name: 'Scrap Entry Form' }
    ],
    reports: [
      { code: 'PLAN_ACT_REP', name: 'Production Plan vs Actual' },
      { code: 'ORD_STAT_REP', name: 'Production Order Status' },
      { code: 'RM_CONS_REP', name: 'Raw Material Consumption' },
      { code: 'PROD_YLD_REP', name: 'Production Yield Report' },
      { code: 'MACH_UTIL_REP', name: 'Machine Utilization' },
      { code: 'DWNTM_ANAL_REP', name: 'Downtime Analysis' }
    ]
  },

  // 14. Costing & Management Accounting
  {
    id: 'dept_14',
    number: 14,
    name: 'Costing & Management Accounting',
    head: 'Cost Accountant',
    category: 'General ERP & Corporate',
    definitions: ['Cost Categories', 'Cost Centers', 'Cost Allocation Rules', 'Standard Cost'],
    forms: [
      { code: 'COST_SHT_FORM', name: 'Product Cost Sheet Form' },
      { code: 'RM_COST_FORM', name: 'Raw Material Costing Form' },
      { code: 'LAB_COST_FORM', name: 'Labour Costing Form' },
      { code: 'OVH_ALLOC_FORM', name: 'Overhead Allocation Form' },
      { code: 'VAR_ANAL_FORM', name: 'Variance Analysis Form' },
      { code: 'SELL_PRICE_CALC', name: 'Selling Price Calculation Form' }
    ],
    reports: [
      { code: 'PROD_COST_REP', name: 'Product Wise Cost Sheet' },
      { code: 'STD_ACT_COST', name: 'Standard vs Actual Cost' },
      { code: 'COST_VAR_REP', name: 'Cost Variance Analysis' },
      { code: 'GM_ANAL_REP', name: 'Gross Margin Analysis' },
      { code: 'BE_ANAL_REP', name: 'Break-Even Analysis' },
      { code: 'PROFIT_REP', name: 'Product Profitability Report' }
    ]
  },

  // 15. Quality Control / Quality Assurance (QC / QA)
  {
    id: 'dept_15',
    number: 15,
    name: 'Quality Control / Quality Assurance (QC / QA)',
    head: 'QA/QC Manager',
    category: 'Operations & Manufacturing',
    definitions: ['Quality Standards', 'Inspection Parameters', 'Testing Methods', 'Acceptance Limits'],
    forms: [
      { code: 'INC_INSP_FORM', name: 'Incoming Inspection Form' },
      { code: 'PRC_INSP_FORM', name: 'In-Process Inspection Form' },
      { code: 'FIN_QA_FORM', name: 'Final Quality Inspection Form' },
      { code: 'NCR_FORM', name: 'Non-Conformance Report (NCR)' },
      { code: 'CAPA_FORM', name: 'Corrective Action Form (CAPA)' },
      { code: 'CALIB_FORM', name: 'Equipment Calibration Form' }
    ],
    reports: [
      { code: 'REJECT_REP', name: 'Rejection Report' },
      { code: 'BATCH_QA_REP', name: 'Batch Quality Report' },
      { code: 'NCR_REG_REP', name: 'NCR Register' },
      { code: 'CAPA_PEND_REP', name: 'CAPA Pending Report' },
      { code: 'SUPP_QA_RAT', name: 'Supplier Quality Rating' }
    ]
  },

  // 16. Fixed Assets & Maintenance
  {
    id: 'dept_16',
    number: 16,
    name: 'Fixed Assets & Maintenance',
    head: 'Maintenance Manager',
    category: 'Operations & Manufacturing',
    definitions: ['Asset Categories', 'Asset Custodians', 'Depreciation Methods', 'Maintenance Types'],
    forms: [
      { code: 'AST_REG_FORM', name: 'Asset Registration Form' },
      { code: 'AST_ALLOC_FORM', name: 'Asset Allocation Form' },
      { code: 'PREV_MAINT_FORM', name: 'Preventive Maintenance Form' },
      { code: 'BKDN_MAINT_FORM', name: 'Breakdown Maintenance Form' },
      { code: 'AST_DISP_FORM', name: 'Asset Disposal Form' },
      { code: 'WTY_CLAIM_FORM', name: 'Warranty Claim Form' }
    ],
    reports: [
      { code: 'FA_REG_REP', name: 'Fixed Asset Register' },
      { code: 'DEP_SCH_REP', name: 'Depreciation Schedule' },
      { code: 'PM_DUE_REP', name: 'Preventive Maintenance Due' },
      { code: 'MAINT_COST_REP', name: 'Maintenance Cost Analysis' }
    ]
  },

  // 17. Project Management
  {
    id: 'dept_17',
    number: 17,
    name: 'Project Management',
    head: 'Project Manager',
    category: 'Construction & Engineering',
    definitions: ['Project Categories', 'Project Phases', 'Task Categories', 'Resource Master'],
    forms: [
      { code: 'PRJ_REG_FORM', name: 'Project Registration Form' },
      { code: 'PRJ_TASK_FORM', name: 'Project Task Form' },
      { code: 'PRJ_BDGT_FORM', name: 'Project Budget Form' },
      { code: 'PRJ_EXP_FORM', name: 'Project Expense Form' },
      { code: 'PRJ_PROG_FORM', name: 'Project Progress Form' },
      { code: 'PRJ_CLOS_FORM', name: 'Project Closure Form' }
    ],
    reports: [
      { code: 'PRJ_STAT_REP', name: 'Project Status Report' },
      { code: 'PRJ_BDGT_ACT', name: 'Project Budget vs Actual' },
      { code: 'TASK_PEND_REP', name: 'Task Pending Report' },
      { code: 'RES_UTIL_REP', name: 'Resource Utilization' }
    ]
  },

  // 18. Budgeting & Financial Planning
  {
    id: 'dept_18',
    number: 18,
    name: 'Budgeting & Financial Planning',
    head: 'Budget Head',
    category: 'General ERP & Corporate',
    definitions: ['Budget Period', 'Budget Categories', 'Department Budgets', 'Forecasting Rules'],
    forms: [
      { code: 'ANN_BDGT_FORM', name: 'Annual Budget Form' },
      { code: 'REV_BDGT_FORM', name: 'Revised Budget Form' },
      { code: 'BDGT_TRF_FORM', name: 'Budget Transfer Form' },
      { code: 'FCST_FORM', name: 'Forecast Form' },
      { code: 'CAPEX_REQ_FORM', name: 'Capital Expenditure Request' }
    ],
    reports: [
      { code: 'BDGT_MTH_REP', name: 'Monthly Budget Report' },
      { code: 'BDGT_VAR_REP', name: 'Budget Variance' },
      { code: 'CF_FCST_REP', name: 'Cash Flow Forecast' },
      { code: 'BDGT_UTIL_REP', name: 'Budget Utilization' }
    ]
  },

  // 19. Taxation & Statutory Compliance
  {
    id: 'dept_19',
    number: 19,
    name: 'Taxation & Statutory Compliance',
    head: 'Taxation Manager',
    category: 'Governance, Security & IT',
    definitions: ['Tax Types', 'Tax Rates', 'Withholding Tax Rules', 'Statutory Authorities'],
    forms: [
      { code: 'ST_INV_CFG', name: 'Sales Tax Invoice Configuration' },
      { code: 'PUR_TAX_ENT', name: 'Purchase Tax Entry' },
      { code: 'WHT_DED_FORM', name: 'Withholding Tax Deduction Form' },
      { code: 'TAX_PAY_VCH', name: 'Tax Payment Voucher' },
      { code: 'TAX_RECON_FORM', name: 'Tax Reconciliation Form' }
    ],
    reports: [
      { code: 'ST_REG_REP', name: 'Sales Tax Register' },
      { code: 'PT_REG_REP', name: 'Purchase Tax Register' },
      { code: 'WHT_REG_REP', name: 'Withholding Tax Register' },
      { code: 'TAX_LIAB_REP', name: 'Tax Liability Report' }
    ]
  },

  // 20. Internal Audit, Risk & Compliance
  {
    id: 'dept_20',
    number: 20,
    name: 'Internal Audit, Risk & Compliance',
    head: 'Chief Internal Auditor',
    category: 'Governance, Security & IT',
    definitions: ['Audit Categories', 'Audit Checklist', 'Risk Categories', 'Control Matrix'],
    forms: [
      { code: 'AUD_PLAN_FORM', name: 'Audit Plan Form' },
      { code: 'AUD_OBS_FORM', name: 'Audit Observation Form' },
      { code: 'CORR_ACT_FORM', name: 'Corrective Action Form' },
      { code: 'RISK_ASS_FORM', name: 'Risk Assessment Form' },
      { code: 'COMPL_CHK_FORM', name: 'Compliance Checklist Form' }
    ],
    reports: [
      { code: 'AUD_OBS_REG', name: 'Audit Observation Register' },
      { code: 'PEND_AUD_ACT', name: 'Pending Audit Actions' },
      { code: 'RISK_REG_REP', name: 'Risk Register' },
      { code: 'AUDIT_TRL_REP', name: 'Audit Trail Report' }
    ]
  },

  // 21. IT, System Administration & Helpdesk
  {
    id: 'dept_21',
    number: 21,
    name: 'IT, System Administration & Helpdesk',
    head: 'IT Manager',
    category: 'Governance, Security & IT',
    definitions: ['User Master', 'Role Master', 'Permission Master', 'System Configuration'],
    forms: [
      { code: 'USR_CREAT_FORM', name: 'User Creation Form' },
      { code: 'ROLE_PERM_FORM', name: 'Role Permission Form' },
      { code: 'PWD_RESET_FORM', name: 'Password Reset Form' },
      { code: 'IT_COMPL_FORM', name: 'IT Complaint Form' },
      { code: 'BCK_EXEC_FORM', name: 'Backup Execution Form' }
    ],
    reports: [
      { code: 'USR_LOG_HIST', name: 'User Login History' },
      { code: 'PERM_MAT_REP', name: 'Permission Matrix' },
      { code: 'TCKT_AGING_REP', name: 'Ticket Aging Report' },
      { code: 'SYS_AUDIT_TRL', name: 'System Audit Trail' }
    ]
  },

  // 22. Food & Beverage / FMCG Industry
  {
    id: 'dept_22',
    number: 22,
    name: 'Food & Beverage / FMCG Industry',
    head: 'F&B Manager',
    category: 'Food & Agriculture',
    definitions: ['Product Formulation Master', 'Recipe Master', 'Ingredient Master', 'Shelf Life Rules'],
    forms: [
      { code: 'RECIPE_FORM', name: 'Recipe Creation Form' },
      { code: 'BATCH_PROD_FORM', name: 'Batch Production Form' },
      { code: 'MIX_PROC_FORM', name: 'Mixing / Processing Form' },
      { code: 'FILL_PACK_FORM', name: 'Filling & Packing Form' },
      { code: 'PROD_RECALL_FORM', name: 'Product Recall Form' }
    ],
    reports: [
      { code: 'RECIPE_COST_REP', name: 'Product Recipe Costing' },
      { code: 'BATCH_YIELD_REP', name: 'Batch Yield Report' },
      { code: 'PROD_TRACE_REP', name: 'Product Recall Traceability' },
      { code: 'SL_REMAIN_REP', name: 'Shelf Life Remaining' }
    ]
  },

  // 23. School Management System
  {
    id: 'dept_23',
    number: 23,
    name: 'School Management System',
    head: 'Principal / Admin',
    category: 'Education & Institutions',
    definitions: ['Campus Master', 'Academic Session', 'Class Master', 'Fee Structure'],
    forms: [
      { code: 'STU_ADMS_FORM', name: 'Student Admission Form' },
      { code: 'FEE_CHAL_FORM', name: 'Fee Challan Form' },
      { code: 'STU_ATT_FORM', name: 'Student Attendance Form' },
      { code: 'EXAM_SET_FORM', name: 'Examination Setup Form' },
      { code: 'MARKS_ENT_FORM', name: 'Marks Entry Form' }
    ],
    reports: [
      { code: 'STU_LST_REP', name: 'Class Wise Student List' },
      { code: 'FEE_COLL_REP', name: 'Fee Collection Report' },
      { code: 'DEFLT_STU_REP', name: 'Defaulter Student Report' },
      { code: 'STU_RES_REG', name: 'Student Result Register' }
    ]
  },

  // 24. College / University Management System
  {
    id: 'dept_24',
    number: 24,
    name: 'College / University Management System',
    head: 'Dean / Registrar',
    category: 'Education & Institutions',
    definitions: ['Faculty Master', 'Degree Program Master', 'Semester Master', 'Grading System'],
    forms: [
      { code: 'ONLINE_ADMS_FORM', name: 'Online Admission Form' },
      { code: 'CRS_REG_FORM', name: 'Course Registration Form' },
      { code: 'SEM_ENRL_FORM', name: 'Semester Enrollment Form' },
      { code: 'GPA_CALC_FORM', name: 'GPA / CGPA Calculation Form' },
      { code: 'TRANS_GEN_FORM', name: 'Transcript Generation Form' }
    ],
    reports: [
      { code: 'MERIT_LST_REP', name: 'Merit List' },
      { code: 'STU_FEE_LDG', name: 'Student Fee Ledger' },
      { code: 'FAC_WKLD_REP', name: 'Faculty Workload' },
      { code: 'RES_GAZ_REP', name: 'Result Gazette' }
    ]
  },

  // 25. Hospital / Healthcare Management System
  {
    id: 'dept_25',
    number: 25,
    name: 'Hospital / Healthcare Management System',
    head: 'Medical Superintendent',
    category: 'Healthcare & Clinical',
    definitions: ['Doctor Master', 'Consultant Master', 'Ward Master', 'Bed Master', 'Laboratory Test Master'],
    forms: [
      { code: 'PAT_REG_FORM', name: 'Patient Registration Form' },
      { code: 'APPT_FORM', name: 'Appointment Form' },
      { code: 'OPD_CONS_FORM', name: 'OPD Consultation Form' },
      { code: 'IPD_ADMS_FORM', name: 'Admission Form' },
      { code: 'LAB_RES_FORM', name: 'Laboratory Result Form' },
      { code: 'MED_BILL_FORM', name: 'Medical Billing Form' }
    ],
    reports: [
      { code: 'DLY_OPD_REP', name: 'Daily OPD Report' },
      { code: 'BED_OCCP_REP', name: 'Bed Occupancy Report' },
      { code: 'LAB_PEND_REP', name: 'Lab Results Pending' },
      { code: 'DOC_REV_REP', name: 'Doctor Revenue Report' }
    ]
  },

  // 26. Pharmacy / Medical Store
  {
    id: 'dept_26',
    number: 26,
    name: 'Pharmacy / Medical Store',
    head: 'Chief Pharmacist',
    category: 'Healthcare & Clinical',
    definitions: ['Medicine Master', 'Generic Name', 'Batch / Expiry', 'Storage Conditions'],
    forms: [
      { code: 'MED_PUR_FORM', name: 'Medicine Purchase Form' },
      { code: 'PHARM_SALE_FORM', name: 'Pharmacy Sale Form' },
      { code: 'PRES_SALE_FORM', name: 'Prescription Sale Form' },
      { code: 'MED_RET_FORM', name: 'Medicine Return Form' },
      { code: 'EXP_DISP_FORM', name: 'Expiry Disposal Form' }
    ],
    reports: [
      { code: 'MED_STK_REG', name: 'Medicine Stock Register' },
      { code: 'NEAR_EXP_REP', name: 'Near Expiry Report' },
      { code: 'PHARM_GM_REP', name: 'Pharmacy Gross Margin' },
      { code: 'CTRL_STK_MVT', name: 'Controlled Stock Movement' }
    ]
  },

  // 27. Retail / Wholesale / Distribution
  {
    id: 'dept_27',
    number: 27,
    name: 'Retail / Wholesale / Distribution',
    head: 'Retail Manager',
    category: 'Sales & Customer Relations',
    definitions: ['Retail Outlet Master', 'POS Counter Master', 'Customer Loyalty Setup', 'Route / Beat Master'],
    forms: [
      { code: 'POS_SALE_FORM', name: 'POS Sales Form' },
      { code: 'CASH_DRW_FORM', name: 'Cash Drawer Opening / Closing' },
      { code: 'VAN_SALE_FORM', name: 'Van Sales Form' },
      { code: 'ROUTE_VIST_FORM', name: 'Route Sales Visit Form' }
    ],
    reports: [
      { code: 'POS_DLY_SALE', name: 'POS Daily Sales' },
      { code: 'WH_SALE_REP', name: 'Distributor Wise Sales' },
      { code: 'LOYALTY_REP', name: 'Customer Loyalty Report' },
      { code: 'CASH_COLL_REP', name: 'Cash Collection Report' }
    ]
  },

  // 28. Construction / Real Estate / Engineering
  {
    id: 'dept_28',
    number: 28,
    name: 'Construction / Real Estate / Engineering',
    head: 'Project Director',
    category: 'Construction & Engineering',
    definitions: ['Project Master', 'Site Master', 'BOQ Master', 'Contractor Master'],
    forms: [
      { code: 'BOQ_PREP_FORM', name: 'BOQ Preparation Form' },
      { code: 'WO_FORM', name: 'Work Order Form' },
      { code: 'SITE_MAT_REQ', name: 'Site Material Requisition' },
      { code: 'DPR_FORM', name: 'Daily Progress Report' },
      { code: 'CONT_BILL_FORM', name: 'Contractor Bill Form' }
    ],
    reports: [
      { code: 'PRJ_COST_SUMM', name: 'Project Cost Summary' },
      { code: 'BOQ_ACT_REP', name: 'BOQ vs Actual' },
      { code: 'SITE_MAT_CONS', name: 'Site Wise Material Consumption' },
      { code: 'WORK_COMP_REP', name: 'Work Completion Report' }
    ]
  },

  // 29. Solar / EPC / RENEWABLE ENERGY
  {
    id: 'dept_29',
    number: 29,
    name: 'Solar / EPC / RENEWABLE ENERGY',
    head: 'Technical Manager',
    category: 'Energy & Solar',
    definitions: ['Solar Product Master', 'Site Master', 'System Capacity', 'Net Metering documentation'],
    forms: [
      { code: 'SOL_INQ_FORM', name: 'Solar Inquiry Form' },
      { code: 'SITE_SURV_FORM', name: 'Site Survey Form' },
      { code: 'SOL_DSGN_FORM', name: 'Solar Design Form' },
      { code: 'PRJ_INST_ORD', name: 'Project Installation Order' },
      { code: 'NET_MTR_FORM', name: 'Net Metering Documentation Form' }
    ],
    reports: [
      { code: 'SOL_INQ_REG', name: 'Solar Inquiry Register' },
      { code: 'SYST_CAP_REP', name: 'System Capacity Report' },
      { code: 'SER_TRK_REP', name: 'Panel / Inverter Serial Tracking' },
      { code: 'NET_MTR_STAT', name: 'Net Metering Application Status' }
    ]
  },

  // 30. Textile / Garments / Apparel
  {
    id: 'dept_30',
    number: 30,
    name: 'Textile / Garments / Apparel',
    head: 'Textile Head',
    category: 'Operations & Manufacturing',
    definitions: ['Fabric Master', 'Yarn Master', 'Style Master', 'Accessories Master'],
    forms: [
      { code: 'FAB_PUR_FORM', name: 'Fabric Purchase Form' },
      { code: 'DYE_PROC_ORD', name: 'Dyeing / Processing Order' },
      { code: 'CUT_PLAN_FORM', name: 'Cutting Plan Form' },
      { code: 'STIT_PROD_FORM', name: 'Stitching Production Form' },
      { code: 'GARMENT_ORD_FORM', name: 'Garment Order Form' }
    ],
    reports: [
      { code: 'FAB_STK_REG', name: 'Fabric Stock Register' },
      { code: 'STYLE_PROD_REP', name: 'Style Wise Production' },
      { code: 'STIT_EFF_REP', name: 'Stitching Efficiency' },
      { code: 'EXP_SHIP_REG', name: 'Export Shipment Register' }
    ]
  },

  // 31. Agriculture / Farming / Dairy
  {
    id: 'dept_31',
    number: 31,
    name: 'Agriculture / Farming / Dairy',
    head: 'Farm Manager',
    category: 'Food & Agriculture',
    definitions: ['Farm Master', 'Crop Master', 'Animal Master', 'Feed Master'],
    forms: [
      { code: 'CROP_PLAN_FORM', name: 'Crop Planning Form' },
      { code: 'SEED_ISS_FORM', name: 'Seed Issue Form' },
      { code: 'HARV_ENT_FORM', name: 'Harvest Entry Form' },
      { code: 'MILK_COLL_FORM', name: 'Milk Collection Form' },
      { code: 'ANI_HLT_REC', name: 'Animal Health Record' }
    ],
    reports: [
      { code: 'CROP_YLD_REP', name: 'Field Wise Yield' },
      { code: 'HARV_REG_REP', name: 'Harvest Register' },
      { code: 'MILK_PROD_REP', name: 'Milk Production Report' },
      { code: 'ANI_HLT_HIST', name: 'Animal Health History' }
    ]
  },

  // 32. Hotel / Restaurant / Food Service
  {
    id: 'dept_32',
    number: 32,
    name: 'Hotel / Restaurant / Food Service',
    head: 'General Manager',
    category: 'Sales & Customer Relations',
    definitions: ['Menu Item Master', 'Recipe Master', 'Room Master', 'Reservation Rules'],
    forms: [
      { code: 'TBL_RES_FORM', name: 'Table Reservation Form' },
      { code: 'GST_CHKIN_FORM', name: 'Guest Check-in Form' },
      { code: 'REST_POS_ORD', name: 'Restaurant POS Order Form' },
      { code: 'GST_BILL_FORM', name: 'Guest Billing Form' },
      { code: 'EVT_BOOK_FORM', name: 'Banquet / Event Booking Form' }
    ],
    reports: [
      { code: 'DLY_REST_SALE', name: 'Daily Restaurant Sales' },
      { code: 'FOOD_COST_REP', name: 'Food Cost Report' },
      { code: 'ROOM_OCCP_REP', name: 'Room Occupancy' },
      { code: 'OTL_PROFIT_REP', name: 'Outlet Profitability' }
    ]
  },

  // 33. Banking / Microfinance / Financial Services
  {
    id: 'dept_33',
    number: 33,
    name: 'Banking / Microfinance / Financial Services',
    head: 'Branch Manager',
    category: 'Banking, Finance & NGO',
    definitions: ['Customer Master', 'Account Type', 'Loan Product Master', 'Risk Categories'],
    forms: [
      { code: 'CUST_KYC_FORM', name: 'Customer KYC Form' },
      { code: 'ACC_OPEN_FORM', name: 'Account Opening Form' },
      { code: 'LOAN_APP_FORM', name: 'Loan Application Form' },
      { code: 'DISB_FORM', name: 'Disbursement Form' },
      { code: 'COLL_REG_FORM', name: 'Collateral Registration Form' }
    ],
    reports: [
      { code: 'DLY_CASH_POS', name: 'Daily Cash Position' },
      { code: 'LOAN_PORT_REP', name: 'Loan Portfolio' },
      { code: 'LOAN_AGING_REP', name: 'Loan Aging' },
      { code: 'NPL_REP', name: 'Non-Performing Loan Report' }
    ]
  },

  // 34. Insurance / Takaful
  {
    id: 'dept_34',
    number: 34,
    name: 'Insurance / Takaful',
    head: 'Insurance Manager',
    category: 'Banking, Finance & NGO',
    definitions: ['Insurance Product Master', 'Policy Type', 'Risk Category', 'Renewal Rules'],
    forms: [
      { code: 'POL_PROP_FORM', name: 'Policy Proposal Form' },
      { code: 'RISK_ASS_FORM', name: 'Risk Assessment Form' },
      { code: 'PREM_COLL_FORM', name: 'Premium Collection Form' },
      { code: 'CLAM_REG_FORM', name: 'Claim Registration Form' },
      { code: 'CLAM_SETL_FORM', name: 'Claim Settlement Form' }
    ],
    reports: [
      { code: 'POL_REG_REP', name: 'Policy Register' },
      { code: 'PREM_COLL_REP', name: 'Premium Collection Report' },
      { code: 'CLAM_SETL_REP', name: 'Claims Settlement Report' },
      { code: 'PROD_PREM_REP', name: 'Product Wise Premium' }
    ]
  },

  // 35. Logistics / Courier / Cargo
  {
    id: 'dept_35',
    number: 35,
    name: 'Logistics / Courier / Cargo',
    head: 'Courier Manager',
    category: 'Supply Chain & Logistics',
    definitions: ['Service Type', 'Hub Master', 'Weight Slabs', 'Delivery Zones'],
    forms: [
      { code: 'BOOK_FORM', name: 'Booking Form' },
      { code: 'HUB_RECV_FORM', name: 'Hub Receiving Form' },
      { code: 'DEL_ATT_FORM', name: 'Delivery Attempt Form' },
      { code: 'POD_FORM', name: 'Proof of Delivery Form' },
      { code: 'COD_SETL_FORM', name: 'Cash on Delivery Settlement' }
    ],
    reports: [
      { code: 'CON_REG_REP', name: 'Consignment Register' },
      { code: 'SHIP_TRK_REP', name: 'Shipment Tracking' },
      { code: 'DEL_SUCC_RAT', name: 'Delivery Success Rate' },
      { code: 'COD_PEND_REP', name: 'COD Settlement Pending' }
    ]
  },

  // 36. Advertising / Media / Digital Agency
  {
    id: 'dept_36',
    number: 36,
    name: 'Advertising / Media / Digital Agency',
    head: 'Creative Director',
    category: 'Creative, Media & Tech',
    definitions: ['Client Master', 'Service Master', 'Media Platform', 'Rate Card'],
    forms: [
      { code: 'CLNT_PROP_FORM', name: 'Client Proposal Form' },
      { code: 'CRT_WRK_ORD', name: 'Creative Work Order' },
      { code: 'MEDIA_BOOK_FORM', name: 'Media Booking Form' },
      { code: 'CAMP_PERF_ENT', name: 'Campaign Performance Entry' }
    ],
    reports: [
      { code: 'PRJ_STAT_REP', name: 'Project / Campaign Status' },
      { code: 'CREAT_WKLD_REP', name: 'Creative Workload' },
      { code: 'CAMP_PERF_REP', name: 'Campaign Performance' },
      { code: 'SRV_PROFIT_REP', name: 'Service Wise Profitability' }
    ]
  },

  // 37. Professional Services / IT Software House
  {
    id: 'dept_37',
    number: 37,
    name: 'Professional Services / IT Software House',
    head: 'Technical Director',
    category: 'Creative, Media & Tech',
    definitions: ['Service Catalog', 'Developer Master', 'Skill Master', 'Hourly Rate'],
    forms: [
      { code: 'CLNT_ONBD_FORM', name: 'Client Onboarding Form' },
      { code: 'TASK_ASSN_FORM', name: 'Task Assignment Form' },
      { code: 'TIME_SHT_FORM', name: 'Timesheet Form' },
      { code: 'BUG_TRK_FORM', name: 'Bug / Issue Tracking Form' },
      { code: 'REC_BILL_FORM', name: 'Recurring Billing Form' }
    ],
    reports: [
      { code: 'DEV_UTIL_REP', name: 'Developer Utilization' },
      { code: 'TIME_SUMM_REP', name: 'Timesheet Summary' },
      { code: 'BILL_HRS_REP', name: 'Billable vs Non-Billable Hours' },
      { code: 'SLA_COMPL_REP', name: 'SLA Compliance' }
    ]
  },

  // 38. NGO / Welfare / Non-Profit Organization
  {
    id: 'dept_38',
    number: 38,
    name: 'NGO / Welfare / Non-Profit Organization',
    head: 'Program Manager',
    category: 'Banking, Finance & NGO',
    definitions: ['Donor Master', 'Beneficiary Master', 'Donation Categories', 'Grant Master'],
    forms: [
      { code: 'DONOR_REG_FORM', name: 'Donor Registration Form' },
      { code: 'DON_RECPT_FORM', name: 'Donation Receipt Form' },
      { code: 'BEN_REG_FORM', name: 'Beneficiary Registration Form' },
      { code: 'ASST_DIST_FORM', name: 'Assistance Distribution Form' },
      { code: 'PROG_MONIT_FORM', name: 'Program Monitoring Form' }
    ],
    reports: [
      { code: 'DON_COLL_REP', name: 'Donation Collection' },
      { code: 'GRANT_UTIL_REP', name: 'Grant Utilization' },
      { code: 'BEN_REG_REP', name: 'Beneficiary Register' },
      { code: 'PROG_PERF_REP', name: 'Program Performance' }
    ]
  }
];
