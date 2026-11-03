import { SubscriptionCycle } from './erp';

export type PartnershipType =
  | 'General Partnership'
  | 'Limited Liability Partnership (LLP)'
  | 'Joint Venture'
  | 'Strategic Partnership'
  | 'Investment Partnership'
  | 'Working Partnership'
  | 'Silent / Sleeping Partnership'
  | 'Profit-Sharing Arrangement'
  | 'Custom Agreement';

export type PartnerClassification =
  | 'Active Partner'
  | 'Working Partner'
  | 'Sleeping Partner'
  | 'Capital Partner'
  | 'Investor Partner'
  | 'Managing Partner'
  | 'Technical Partner'
  | 'Silent Partner'
  | 'Profit-Sharing Partner'
  | 'Custom Partner';

export type ContributionType =
  | 'Cash'
  | 'Bank Transfer'
  | 'Property / Real Estate'
  | 'Land'
  | 'Machinery & Plant'
  | 'Equipment'
  | 'Vehicles'
  | 'Inventory'
  | 'Raw Materials'
  | 'Technology & IP'
  | 'Services / Sweat Equity';

export interface PartnerProfile {
  id: string;
  partnerCode: string;
  fullName: string;
  fatherOrHusbandName?: string;
  companyOrOrgName?: string;
  cnicOrRegNo: string;
  ntn?: string;
  dobOrIncorporation?: string;
  nationality: string;
  country: string;
  city: string;
  address: string;
  email: string;
  mobile: string;
  whatsapp?: string;
  emergencyContact?: string;
  occupation?: string;
  designation?: string;
  bankAccountDetails: {
    bankName: string;
    accountTitle: string;
    accountNumber: string;
    iban: string;
    branchCode?: string;
  };
  classifications: PartnerClassification[];
  joiningDate: string;
  effectiveDate: string;
  retirementDate?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'RETIRED' | 'SUSPENDED';
  initialCapitalPKR: number;
  agreedProfitSharePercent: number;
  agreedLossSharePercent: number;
  votingRightsPercent: number;
  managementRights: boolean;
  signingAuthority: boolean;
  bankTransactionLimitPKR: number;
}

export interface Partnership {
  id: string;
  partnershipCode: string;
  partnershipName: string;
  registeredBusinessName: string;
  businessCategory: string;
  businessSubcategory?: string;
  businessActivity: string;
  partnershipType: PartnershipType;
  registrationDate: string;
  effectiveDate: string;
  agreementStartDate: string;
  agreementEndDate?: string;
  financialYear: string;
  durationYears: number;
  isContinuing: boolean;
  country: string;
  province: string;
  city: string;
  registeredOfficeAddress: string;
  operatingAddress: string;
  taxRegistrationNo?: string;
  ntn: string;
  strn?: string;
  registrationAuthority: string;
  registrationNumber: string;
  bankAccountDetails: {
    bankName: string;
    accountTitle: string;
    accountNumber: string;
    iban: string;
  };
  currency: string;
  status: 'DRAFT' | 'UNDER_REVIEW' | 'ACTIVE' | 'PENDING_APPROVAL' | 'AMENDED' | 'TERMINATED' | 'DISPUTED';
  partners: PartnerProfile[];
  purpose: {
    businessPurpose: string;
    natureOfBusiness: string;
    scopeOfActivities: string;
    investmentObjective: string;
    operationalResponsibilities: string;
    geographicOperatingArea: string;
    initialBusinessValuePKR: number;
    expectedAnnualRevenuePKR: number;
    expectedTotalInvestmentPKR: number;
    specialConditions?: string;
  };
  createdAt: string;
  createdBy: string;
  tenantId: string;
  companyId: string;
}

export interface PartnerCapitalContribution {
  id: string;
  partnershipId: string;
  partnerId: string;
  partnerName: string;
  contributionDate: string;
  contributionType: ContributionType;
  description: string;
  quantity?: number;
  uom?: string;
  agreedValuationPKR: number;
  paymentReference?: string;
  supportingDocUrl?: string;
  approvalStatus: 'APPROVED' | 'PENDING' | 'REJECTED';
  approvedBy?: string;
  approvalDate?: string;
}

export interface ProfitDistributionRule {
  id: string;
  partnershipId: string;
  partnershipName: string;
  sharingModel:
    | 'Equal Percentage'
    | 'Unequal Percentage'
    | 'Fixed Amount'
    | 'Percentage + Fixed Amount'
    | 'Capital-Based Sharing'
    | 'Revenue-Based Sharing'
    | 'Net Profit-Based Sharing'
    | 'Custom Formula';
  calculationBase: 'Net Profit' | 'Gross Profit' | 'Operating Profit' | 'Revenue Less Direct Expenses';
  partnerShares: {
    partnerId: string;
    partnerName: string;
    profitSharePercent: number;
    lossSharePercent: number;
    fixedMonthlyRemunerationPKR: number;
    commissionPercent: number;
  }[];
  is100PercentValidated: boolean;
  effectiveFrom: string;
  approvedBy?: string;
  approvalDate?: string;
  status: 'ACTIVE' | 'DRAFT' | 'SUPERSEDED';
}

export interface ProfitAllocationExecution {
  id: string;
  partnershipId: string;
  partnershipName: string;
  fiscalPeriod: string;
  totalGLRevenuePKR: number;
  totalGLExpensesPKR: number;
  netAccountingProfitPKR: number;
  distributableProfitPKR: number;
  allocations: {
    partnerId: string;
    partnerName: string;
    profitSharePercent: number;
    fixedRemunerationPKR: number;
    allocatedProfitPKR: number;
    allocatedLossPKR: number;
    netPayablePKR: number;
  }[];
  voucherNo?: string;
  postingStatus: 'PROPOSED' | 'POSTED_TO_GL' | 'CANCELLED';
  postedAt?: string;
  postedBy?: string;
}

export interface PartnershipDeedClause {
  clauseNo: number;
  title: string;
  content: string;
  isEditable: boolean;
}

export interface PartnershipDeedDocument {
  id: string;
  partnershipId: string;
  partnershipName: string;
  deedTitle: string;
  version: string;
  executionDate: string;
  placeOfExecution: string;
  governingLaw: string;
  clauses: PartnershipDeedClause[];
  status: 'DRAFT' | 'PENDING_PARTNER_SIGNATURES' | 'APPROVED' | 'SIGNED_AND_EXECUTED' | 'ARCHIVED';
  partnerSignatures: {
    partnerId: string;
    partnerName: string;
    cnic: string;
    signedAt?: string;
    ipAddress?: string;
    status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
    comments?: string;
  }[];
  witnesses: {
    name: string;
    cnic: string;
    address: string;
  }[];
  createdAt: string;
  updatedAt: string;
}

export interface PartnerPaymentVoucher {
  id: string;
  voucherNo: string;
  partnershipId: string;
  partnershipName: string;
  partnerId: string;
  partnerName: string;
  paymentType: 'Profit Distribution' | 'Monthly Remuneration' | 'Commission' | 'Capital Return' | 'Expense Reimbursement';
  amountPKR: number;
  paymentDate: string;
  paymentMethod: 'Meezan Bank IBFT' | 'Bank Transfer' | 'Cheque' | 'Cash';
  bankAccountId: string;
  txnRefNo: string;
  narration: string;
  status: 'POSTED' | 'PENDING' | 'REJECTED';
  createdBy: string;
  createdAt: string;
}
