// MTS-ERP Enterprise Department Category Mapper
// Automatically maps industry packages and business categories to specific departments
// from the 130 Department Master Catalogue.

import { IndustryPackage, ClientCompany } from '../types/erp';
import {
  COMPLETE_DEPARTMENTS_CATALOGUE,
  DepartmentCatalogItem
} from './departmentCatalogueData';

export const INDUSTRY_DEPARTMENT_PRESETS: Record<IndustryPackage, string[]> = {
  'Textile': [
    'dept_1',  // Accounts & Finance
    'dept_93', // Textile Production (Spinning, Weaving, Dyeing, Finishing)
    'dept_2',  // Inventory & Store (Cotton, Yarn, Finished Fabric)
    'dept_3',  // Procurement & Purchasing (Raw Cotton, Dyes, Chemicals)
    'dept_4',  // Sales Department (Local & Export Sales)
    'dept_5',  // Human Resources (HR)
    'dept_6',  // Payroll & Compensation
    'dept_27', // Production Planning & Control (PPC)
    'dept_12', // Quality Assurance & Lab Testing
    'dept_30', // Plant & Machine Maintenance
    'dept_8',  // Supply Chain Management
    'dept_10', // Logistics, Export & Shipping
    'dept_32', // Health, Safety & Environment (HSE)
    'dept_13', // Security & Gate Operations
    'dept_16', // Information Technology (IT)
    'dept_7'   // Administration & Facilities
  ],

  'Food & Beverage': [
    'dept_1',  // Accounts & Finance
    'dept_33', // Food Production & Packaging
    'dept_34', // Food Safety, Quality & HACCP
    'dept_35', // Laboratory & Food Testing
    'dept_36', // Product Formulation & R&D
    'dept_37', // Cold Chain & Temperature Control
    'dept_2',  // Inventory & Store
    'dept_3',  // Procurement & Raw Ingredients
    'dept_4',  // Sales & Distribution
    'dept_5',  // Human Resources
    'dept_6',  // Payroll
    'dept_8',  // Supply Chain
    'dept_10', // Logistics & Distribution Fleet
    'dept_30', // Machinery Maintenance
    'dept_32', // Food Hygiene & HSE
    'dept_7'   // Administration
  ],

  'Solar & Electrical': [
    'dept_1',  // Accounts & Finance
    'dept_76', // Solar & Electrical Projects
    'dept_2',  // Inventory & Store (Panels, Inverters, Cabling)
    'dept_3',  // Procurement & Imports
    'dept_4',  // Sales & Commercial Tenders
    'dept_15', // Customer Support & Warranty
    'dept_10', // Logistics & Site Dispatch
    'dept_5',  // Human Resources
    'dept_6',  // Payroll
    'dept_12', // Quality & Inspection
    'dept_30', // Technical Maintenance
    'dept_32', // Safety & High-Voltage HSE
    'dept_16', // IT & Monitoring
    'dept_7'   // Administration
  ],

  'Manufacturing': [
    'dept_1',  // Accounts & Finance
    'dept_4',  // Production & Manufacturing (BOM & Assemblies)
    'dept_2',  // Inventory & Store
    'dept_3',  // Procurement / Purchase
    'dept_27', // Production Planning & Control (PPC)
    'dept_12', // Quality Control & Assurance
    'dept_30', // Plant & Machine Maintenance
    'dept_8',  // Supply Chain Management
    'dept_10', // Logistics & Dispatch
    'dept_5',  // Human Resources
    'dept_6',  // Payroll
    'dept_32', // HSE
    'dept_13', // Security & Gate
    'dept_16', // IT & Systems
    'dept_7'   // Administration
  ],

  'Construction': [
    'dept_1',  // Accounts & Finance
    'dept_71', // Construction & Civil Projects
    'dept_2',  // Inventory & Heavy Equipment Store
    'dept_3',  // Procurement & Material Sourcing
    'dept_12', // Quality Inspection & Testing
    'dept_30', // Plant & Fleet Maintenance
    'dept_32', // Site Safety & HSE
    'dept_5',  // HR & Labor Management
    'dept_6',  // Site Payroll & Advances
    'dept_10', // Transport & Logistics
    'dept_13', // Site Security & Gate
    'dept_7'   // Administration
  ],

  'Wholesale': [
    'dept_1',  // Accounts & Finance
    'dept_2',  // Inventory & Warehouse
    'dept_3',  // Bulk Purchasing
    'dept_4',  // Wholesale Sales & Dispatch
    'dept_8',  // Supply Chain
    'dept_10', // Logistics & Transport
    'dept_5',  // HR
    'dept_6',  // Payroll
    'dept_16', // IT
    'dept_7'   // Administration
  ],

  'Retail & POS': [
    'dept_1',  // Accounts & Finance
    'dept_14', // Retail & POS Counter
    'dept_2',  // Inventory & Outlet Store
    'dept_3',  // Purchasing & Merchandising
    'dept_4',  // Sales & Promotions
    'dept_15', // Customer Care & Returns
    'dept_5',  // HR
    'dept_6',  // Payroll
    'dept_8',  // Supply Chain
    'dept_7'   // Administration
  ],

  'Supermarket': [
    'dept_1',  // Accounts & Finance
    'dept_14', // POS Counter & Cashiering
    'dept_2',  // Grocery & Fresh Store Inventory
    'dept_37', // Cold Storage & Chiller Management
    'dept_3',  // Daily Requisitions & Purchasing
    'dept_4',  // Customer Loyalty & Sales
    'dept_15', // Customer Support & Exchanges
    'dept_5',  // HR
    'dept_6',  // Payroll
    'dept_7'   // Administration
  ],

  'Import & Export': [
    'dept_1',  // Accounts & Finance & Foreign Exchange
    'dept_10', // Logistics, Customs & Clearance
    'dept_2',  // Bonded Warehouse & Store
    'dept_3',  // International Procurement
    'dept_4',  // Export Sales & Letter of Credit (LC)
    'dept_8',  // Global Supply Chain
    'dept_12', // Quality Inspection
    'dept_5',  // HR
    'dept_6',  // Payroll
    'dept_16', // IT
    'dept_7'   // Administration
  ],

  'Pharmaceutical': [
    'dept_1',  // Accounts & Finance
    'dept_2',  // Medicine & Raw Material Inventory
    'dept_3',  // API & Chemical Procurement
    'dept_12', // QA / QC & Good Manufacturing Practice (GMP)
    'dept_35', // Lab Testing & Quality Analysis
    'dept_36', // Formulation & R&D
    'dept_4',  // Institutional & Pharmacy Sales
    'dept_37', // Temperature Controlled Store
    'dept_32', // HSE & Biosafety
    'dept_5',  // HR
    'dept_6',  // Payroll
    'dept_30', // Cleanroom & Equipment Maintenance
    'dept_7'   // Administration
  ],

  'Services': [
    'dept_1',  // Accounts & Finance
    'dept_4',  // Sales & Service Contracts
    'dept_15', // Client Support & Ticketing
    'dept_5',  // HR & Consultant Management
    'dept_6',  // Professional Payroll
    'dept_16', // IT Infrastructure & Software
    'dept_7'   // Administration
  ],

  'Healthcare': [
    'dept_1',  // Accounts & Billing
    'dept_2',  // Pharmacy & Hospital Store
    'dept_3',  // Medical Procurement
    'dept_5',  // Medical Staff HR
    'dept_6',  // Doctors & Nurses Payroll
    'dept_12', // Clinical Audit & QA
    'dept_32', // Hospital Infection Control & HSE
    'dept_16', // Hospital Information System (HIS/IT)
    'dept_7'   // Administration
  ]
};

// Fallback baseline for any unknown industry
export const DEFAULT_CORE_DEPARTMENT_IDS: string[] = [
  'dept_1', // Accounts & Finance
  'dept_2', // Inventory & Store
  'dept_3', // Procurement / Purchase
  'dept_4', // Sales Department
  'dept_5', // HR Department
  'dept_6', // Payroll Department
  'dept_7', // Administration
  'dept_16' // IT Department
];

/**
 * Returns the recommended list of department IDs for an industry package and category.
 */
export function getDefaultDepartmentIdsForIndustry(
  industry?: IndustryPackage | string,
  _category?: string
): string[] {
  if (industry && industry in INDUSTRY_DEPARTMENT_PRESETS) {
    return INDUSTRY_DEPARTMENT_PRESETS[industry as IndustryPackage];
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
    // Default to Textile preset if no company provided
    const defaultIds = INDUSTRY_DEPARTMENT_PRESETS['Textile'];
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
