// MTS-ERP Enterprise Department Category Mapper
// Automatically maps industry packages and business categories to specific departments
// from the 38 Department Master Catalogue.

import { IndustryPackage, ClientCompany } from '../types/erp';
import {
  COMPLETE_DEPARTMENTS_CATALOGUE,
  DepartmentCatalogItem
} from './departmentCatalogueData';

export const INDUSTRY_DEPARTMENT_PRESETS: Record<string, string[]> = {
  'Textile': [
    'dept_1',  // Accounts & Finance
    'dept_30', // Textile Production
    'dept_13', // Production Management
    'dept_2',  // Inventory
    'dept_4',  // Procurement
    'dept_3',  // Sales
    'dept_5',  // HR & Payroll
    'dept_15', // QC
    'dept_16', // Fixed Assets
    'dept_21', // IT
    'dept_6'   // Admin
  ],

  'Manufacturing': [
    'dept_1',  // Accounts
    'dept_13', // Production
    'dept_14', // Costing
    'dept_2',  // Inventory
    'dept_4',  // Procurement
    'dept_3',  // Sales
    'dept_15', // QC
    'dept_5',  // HR
    'dept_16', // Fixed Assets
    'dept_21', // IT
    'dept_6'   // Admin
  ],

  'Food & Beverage': [
    'dept_1',
    'dept_22', // F&B Industry specific
    'dept_13', // Production
    'dept_15', // QC
    'dept_2',
    'dept_4',
    'dept_3',
    'dept_5',
    'dept_21',
    'dept_6'
  ],

  'Solar & Electrical': [
    'dept_1',
    'dept_29', // Solar specific
    'dept_17', // Project Management
    'dept_2',
    'dept_4',
    'dept_3',
    'dept_5',
    'dept_21',
    'dept_6'
  ],

  'Construction': [
    'dept_1',
    'dept_28', // Construction specific
    'dept_17', // Project Management
    'dept_2',
    'dept_4',
    'dept_3',
    'dept_5',
    'dept_21',
    'dept_6'
  ],

  'Wholesale': [
    'dept_1',
    'dept_27', // Retail/Wholesale specific
    'dept_2',
    'dept_4',
    'dept_3',
    'dept_7',  // CRM
    'dept_5',
    'dept_21',
    'dept_6'
  ],

  'Retail & POS': [
    'dept_1',
    'dept_27',
    'dept_2',
    'dept_4',
    'dept_3',
    'dept_7',
    'dept_5',
    'dept_21',
    'dept_6'
  ],

  'Supermarket': [
    'dept_1',
    'dept_27',
    'dept_2',
    'dept_4',
    'dept_3',
    'dept_7',
    'dept_5',
    'dept_21',
    'dept_6'
  ],

  'Import & Export': [
    'dept_1',
    'dept_12', // Logistics
    'dept_35', // Courier/Cargo
    'dept_2',
    'dept_4',
    'dept_3',
    'dept_10', // SCM
    'dept_5',
    'dept_21',
    'dept_6'
  ],

  'Pharmaceutical': [
    'dept_1',
    'dept_26', // Pharmacy specific
    'dept_15', // QC
    'dept_2',
    'dept_4',
    'dept_3',
    'dept_5',
    'dept_21',
    'dept_6'
  ],

  'Services': [
    'dept_1',
    'dept_37', // Professional Services specific
    'dept_7',  // CRM
    'dept_36', // Advertising/Media
    'dept_5',
    'dept_21',
    'dept_6'
  ],

  'Healthcare': [
    'dept_1',
    'dept_25', // Hospital specific
    'dept_26', // Pharmacy
    'dept_5',
    'dept_21',
    'dept_6'
  ],

  'Education': [
    'dept_1',
    'dept_23', // School specific
    'dept_24', // College specific
    'dept_5',
    'dept_21',
    'dept_6'
  ],

  'Banking': [
    'dept_1',
    'dept_33', // Banking specific
    'dept_34', // Insurance
    'dept_5',
    'dept_21',
    'dept_6'
  ],

  'NGO': [
    'dept_1',
    'dept_38', // NGO specific
    'dept_5',
    'dept_21',
    'dept_6'
  ],

  // Newly requested user industries
  'Import/Export': [
    'dept_1',
    'dept_12',
    'dept_35',
    'dept_2',
    'dept_4',
    'dept_3',
    'dept_10',
    'dept_5',
    'dept_21',
    'dept_6'
  ],

  'Hotel Management': [
    'dept_1',
    'dept_32', // Hotel/Restaurant specific
    'dept_2',
    'dept_4',
    'dept_3',
    'dept_7',
    'dept_5',
    'dept_21',
    'dept_6'
  ],

  'Shopping Malls': [
    'dept_1',
    'dept_27',
    'dept_2',
    'dept_4',
    'dept_3',
    'dept_7',
    'dept_5',
    'dept_21',
    'dept_6'
  ],

  'Retail Store': [
    'dept_1',
    'dept_27',
    'dept_2',
    'dept_4',
    'dept_3',
    'dept_7',
    'dept_5',
    'dept_21',
    'dept_6'
  ],

  'Wholesale Shops': [
    'dept_1',
    'dept_27',
    'dept_2',
    'dept_4',
    'dept_3',
    'dept_7',
    'dept_5',
    'dept_21',
    'dept_6'
  ],

  'Trading': [
    'dept_1',
    'dept_27',
    'dept_2',
    'dept_4',
    'dept_3',
    'dept_10',
    'dept_5',
    'dept_21',
    'dept_6'
  ],

  'Courier Services': [
    'dept_1',
    'dept_35',
    'dept_12',
    'dept_3',
    'dept_5',
    'dept_21',
    'dept_6'
  ],

  'IT Services': [
    'dept_1',
    'dept_37',
    'dept_21',
    'dept_7',
    'dept_5',
    'dept_6'
  ],

  'HR Services': [
    'dept_1',
    'dept_5',
    'dept_37',
    'dept_21',
    'dept_6'
  ]
};

export const INDUSTRY_MODULE_PRESETS: Record<string, string[]> = {
  'Textile': [
    'Finance & Accounts',
    'Procurement & Purchasing',
    'Yarn & Dyeing Inventory',
    'Textile Production & Weaving',
    'Export & LC Management',
    'HR & Payroll',
    'Quality Control (QC)'
  ],
  'Manufacturing': [
    'Finance & Accounts',
    'Production & BOM Costing',
    'Procurement & Sourcing',
    'Inventory & Warehouse',
    'Sales & Order Dispatch',
    'HR & Payroll',
    'Plant Maintenance'
  ],
  'Food & Beverage': [
    'Finance & Accounts',
    'Recipe & Batch Production',
    'Expiry & Cold Storage Inventory',
    'Procurement & POS Billing',
    'HACCP Quality Inspection',
    'HR & Payroll'
  ],
  'Solar & Electrical': [
    'Finance & Accounts',
    'Project Engineering & Quotations',
    'Solar Inventory & Serial Tracking',
    'Procurement & Import Duty',
    'CRM & Installation Teams',
    'HR & Payroll'
  ],
  'Construction': [
    'Finance & Accounts',
    'Project Estimation & Site Billing',
    'Heavy Equipment & Plant Inventory',
    'Subcontractor Procurement',
    'HR & Site Labour Payroll'
  ],
  'Wholesale': [
    'Finance & Accounts',
    'Bulk Sales & Credit Control',
    'Warehouse & Multi-Branch Inventory',
    'Procurement & Vendor Portal',
    'CRM & Route Sales'
  ],
  'Retail & POS': [
    'Finance & Accounts',
    'POS Counter Billing & Barcode',
    'Retail Inventory & Stock Reorder',
    'Procurement & Suppliers',
    'CRM & Customer Loyalty'
  ],
  'Supermarket': [
    'Finance & Accounts',
    'Multi-Lane POS & Barcode Scanner',
    'FMCG Inventory & Batch Expiry',
    'Procurement & Vendor Billing',
    'HR & Shift Roster'
  ],
  'Import & Export': [
    'Finance & Accounts',
    'Import LC & Customs Duty Clearing',
    'Export Documentation & Rebates',
    'Freight Logistics & Cargo Tracking',
    'Supply Chain & SCM',
    'Multi-Currency Ledger'
  ],
  'Pharmaceutical': [
    'Finance & Accounts',
    'Pharma Batch Manufacturing & QC',
    'Drug Batch Expiry & Cold Chain',
    'Procurement & Regulatory Compliance',
    'Medical Rep Sales & CRM'
  ],
  'Services': [
    'Finance & Accounts',
    'Service Contracts & Invoicing',
    'Client CRM & Pipeline',
    'HR & Consultant Payroll',
    'Helpdesk & Support Tickets'
  ],
  'Healthcare': [
    'Finance & Accounts',
    'Hospital Patient Billing & OPD',
    'Medical Store & Pharmacy Inventory',
    'Doctor Appointments & HR',
    'Diagnostic Lab Reports'
  ],
  'Education': [
    'Finance & Fee Collection',
    'Student Admission & Portal',
    'Faculty Payroll & HR',
    'Library & Campus Inventory',
    'Exam Grading & Report Cards'
  ],
  'Banking': [
    'Finance & Treasury Ledger',
    'Loan Approval & Credit Scoring',
    'Branch Cash Vault Audit',
    'Regulatory SBP Compliance',
    'HR & Executive Compensation'
  ],
  'NGO': [
    'Grant Accounting & Donor Funds',
    'Project Budget & Field Disbursement',
    'Procurement & Audit Trail',
    'HR & Volunteer Management'
  ],
  'Import/Export': [
    'Finance & Accounts',
    'Import LC & Customs Clearance',
    'Export Freight & Rebates',
    'SCM & Warehouse Inventory',
    'Multi-Currency Ledger'
  ],
  'Hotel Management': [
    'Finance & Night Audit Invoicing',
    'Room Reservations & Front Desk',
    'Restaurant POS & Banquet Billing',
    'Housekeeping & Linen Inventory',
    'HR & Guest Relations CRM'
  ],
  'Shopping Malls': [
    'Finance & Lease Revenue',
    'Tenant Lease & Maintenance Billing',
    'Mall Visitor Parking POS',
    'Facility Management & Utilities',
    'HR & Security Management'
  ],
  'Retail Store': [
    'Finance & Accounts',
    'POS Billing & Thermal Printing',
    'Stock Inventory & Barcodes',
    'Vendor Purchases & Returns',
    'CRM & Discount Vouchers'
  ],
  'Wholesale Shops': [
    'Finance & Accounts',
    'Wholesale Credit Invoicing',
    'Bulk Stock & Godown Inventory',
    'Vendor Accounts & Payments',
    'CRM & Order Booking'
  ],
  'Trading': [
    'Finance & Accounts',
    'Trader Invoicing & Margin Analysis',
    'Procurement & Sourcing',
    'Godown Inventory Control',
    'CRM & Sales Rep Tracking'
  ],
  'Courier Services': [
    'Finance & Cash on Delivery (COD)',
    'Parcel Dispatch & Waybill Tracking',
    'Rider Fleet & Route Optimization',
    'Branch Cargo Operations',
    'HR & Commission Payroll'
  ],
  'IT Services': [
    'Finance & Project Invoicing',
    'Agile Sprint & Milestone Tracking',
    'Software Time Logs & Hourly Rates',
    'Client CRM & SLA Helpdesk',
    'HR & Engineer Payroll'
  ],
  'HR Services': [
    'Finance & Client Invoicing',
    'Talent Acquisition & Headhunting',
    'Outsourced Employee Payroll',
    'Attendance & Biometric Sync',
    'CRM & Corporate Accounts'
  ]
};

export function getDefaultModulesForIndustry(industry?: string): string[] {
  if (industry && industry in INDUSTRY_MODULE_PRESETS) {
    return INDUSTRY_MODULE_PRESETS[industry];
  }
  return [
    'Finance & Accounts',
    'Procurement & Purchasing',
    'Inventory & Warehouse Control',
    'Sales & POS Counter',
    'HR & Payroll Management'
  ];
}

// Fallback baseline for any unknown industry
export const DEFAULT_CORE_DEPARTMENT_IDS: string[] = [
  'dept_1', // Accounts & Finance
  'dept_2', // Inventory & Store
  'dept_4', // Procurement / Purchase
  'dept_3', // Sales Department
  'dept_5', // HR Department
  'dept_6', // Admin
  'dept_21' // IT
];

/**
 * Returns the recommended list of department IDs for an industry package and category.
 */
export function getDefaultDepartmentIdsForIndustry(
  industry?: IndustryPackage | string,
  _category?: string
): string[] {
  if (industry && industry in INDUSTRY_DEPARTMENT_PRESETS) {
    return INDUSTRY_DEPARTMENT_PRESETS[industry];
  }
  return DEFAULT_CORE_DEPARTMENT_IDS;
}

/**
 * Returns full DepartmentCatalogItem objects assigned to a company.
 * If company has assignedDepartmentIds specified, filters by them.
 * Otherwise, resolves the default presets for the company's industry.
 */
export function getCompanyAssignedDepartments(
  company?: ClientCompany | null
): DepartmentCatalogItem[] {
  if (!company) {
    // Default to Manufacturing preset if no company provided
    const defaultIds = INDUSTRY_DEPARTMENT_PRESETS['Manufacturing'];
    return COMPLETE_DEPARTMENTS_CATALOGUE.filter(d => defaultIds.includes(d.id));
  }

  // If company explicitly has assignedDepartmentIds array
  if (Array.isArray(company.assignedDepartmentIds) && company.assignedDepartmentIds.length > 0) {
    const assignedSet = new Set(company.assignedDepartmentIds);
    const matched = COMPLETE_DEPARTMENTS_CATALOGUE.filter(d => assignedSet.has(d.id));
    if (matched.length > 0) {
      return matched;
    }
  }

  // Otherwise, use preset for company industry
  const recommendedIds = getDefaultDepartmentIdsForIndustry(company.industry, company.category);
  const matched = COMPLETE_DEPARTMENTS_CATALOGUE.filter(d => recommendedIds.includes(d.id));
  
  if (matched.length > 0) {
    return matched;
  }

  // Safety fallback
  return COMPLETE_DEPARTMENTS_CATALOGUE.filter(d => DEFAULT_CORE_DEPARTMENT_IDS.includes(d.id));
}
