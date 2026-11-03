import {
  Partnership,
  PartnerProfile,
  PartnerCapitalContribution,
  ProfitDistributionRule,
  ProfitAllocationExecution,
  PartnershipDeedDocument,
  PartnerPaymentVoucher
} from '../types/partnership';
import { db } from './firebaseConfig';
import { doc, setDoc, getDoc, collection, onSnapshot, getDocs } from 'firebase/firestore';

export const INITIAL_PARTNERSHIPS: Partnership[] = [
  {
    id: 'ptn_crest_01',
    partnershipCode: 'JV-CREST-2026',
    partnershipName: 'Crest Textile Joint Venture Consortium',
    registeredBusinessName: 'Crest Weaving & Exports JV (Pvt) Ltd',
    businessCategory: 'Textile',
    businessSubcategory: 'Weaving & Dyeing',
    businessActivity: 'High-speed shuttleless weaving and fabric export operations',
    partnershipType: 'Joint Venture',
    registrationDate: '2026-01-10',
    effectiveDate: '2026-01-15',
    agreementStartDate: '2026-01-15',
    financialYear: '2026-2027',
    durationYears: 5,
    isContinuing: true,
    country: 'Pakistan',
    province: 'Punjab',
    city: 'Faisalabad',
    registeredOfficeAddress: 'Plot 102, Value Addition City, Sahianwala Expressway, Faisalabad',
    operatingAddress: 'Plant A, Industrial Complex, Faisalabad',
    taxRegistrationNo: '9842100-1',
    ntn: '9842100-1',
    strn: '3277876123450',
    registrationAuthority: 'SECP / Registrar of Firms Punjab',
    registrationNumber: 'REG-FSD-99120',
    bankAccountDetails: {
      bankName: 'Meezan Bank Limited',
      accountTitle: 'Crest Weaving & Exports JV',
      accountNumber: '02010104889211',
      iban: 'PK36MEZN0002010104889211'
    },
    currency: 'PKR',
    status: 'ACTIVE',
    createdAt: '2026-01-10',
    createdBy: 'Master Admin',
    tenantId: 'tenant_crest',
    companyId: 'comp_crest_003',
    partners: [
      {
        id: 'partner_01',
        partnerCode: 'PTR-001',
        fullName: 'Rashid Ahmed',
        cnicOrRegNo: '33100-1234567-1',
        ntn: '4120982-1',
        nationality: 'Pakistani',
        country: 'Pakistan',
        city: 'Faisalabad',
        address: 'House 14, Civil Lines, Faisalabad',
        email: 'rashid@cresttextile.com',
        mobile: '+92-300-8651122',
        whatsapp: '+92-300-8651122',
        bankAccountDetails: {
          bankName: 'Meezan Bank Limited',
          accountTitle: 'Rashid Ahmed',
          accountNumber: '02010102998123',
          iban: 'PK36MEZN0002010102998123'
        },
        classifications: ['Active Partner', 'Managing Partner', 'Capital Partner'],
        joiningDate: '2026-01-15',
        effectiveDate: '2026-01-15',
        status: 'ACTIVE',
        initialCapitalPKR: 50000000,
        agreedProfitSharePercent: 50,
        agreedLossSharePercent: 50,
        votingRightsPercent: 50,
        managementRights: true,
        signingAuthority: true,
        bankTransactionLimitPKR: 5000000
      },
      {
        id: 'partner_02',
        partnerCode: 'PTR-002',
        fullName: 'Tariq Mehmood',
        cnicOrRegNo: '35202-9876543-3',
        ntn: '3129845-8',
        nationality: 'Pakistani',
        country: 'Pakistan',
        city: 'Lahore',
        address: '88-Main Gulberg, Lahore',
        email: 'tariq@cresttextile.com',
        mobile: '+92-321-4455667',
        whatsapp: '+92-321-4455667',
        bankAccountDetails: {
          bankName: 'Habib Bank Limited',
          accountTitle: 'Tariq Mehmood',
          accountNumber: '10927900123401',
          iban: 'PK42HABB0010927900123401'
        },
        classifications: ['Capital Partner', 'Working Partner'],
        joiningDate: '2026-01-15',
        effectiveDate: '2026-01-15',
        status: 'ACTIVE',
        initialCapitalPKR: 30000000,
        agreedProfitSharePercent: 30,
        agreedLossSharePercent: 30,
        votingRightsPercent: 30,
        managementRights: true,
        signingAuthority: true,
        bankTransactionLimitPKR: 2000000
      },
      {
        id: 'partner_03',
        partnerCode: 'PTR-003',
        fullName: 'Zainab Bibi',
        cnicOrRegNo: '61101-5544332-6',
        ntn: '7812903-2',
        nationality: 'Pakistani',
        country: 'Pakistan',
        city: 'Islamabad',
        address: 'Sector F-7/2, Islamabad',
        email: 'zainab.investor@gmail.com',
        mobile: '+92-333-5551122',
        whatsapp: '+92-333-5551122',
        bankAccountDetails: {
          bankName: 'Bank Alfalah Limited',
          accountTitle: 'Zainab Bibi',
          accountNumber: '55010022334411',
          iban: 'PK19ALFH0055010022334411'
        },
        classifications: ['Sleeping Partner', 'Investor Partner', 'Silent Partner'],
        joiningDate: '2026-01-15',
        effectiveDate: '2026-01-15',
        status: 'ACTIVE',
        initialCapitalPKR: 20000000,
        agreedProfitSharePercent: 20,
        agreedLossSharePercent: 20,
        votingRightsPercent: 20,
        managementRights: false,
        signingAuthority: false,
        bankTransactionLimitPKR: 0
      }
    ],
    purpose: {
      businessPurpose: 'Operation of high-speed shuttleless weaving looms and textile grey cloth production',
      natureOfBusiness: 'Textile Manufacturing & Export',
      scopeOfActivities: 'Yarn procurement, weaving, grey cloth processing, and international export fulfillment',
      investmentObjective: 'Establishment of 50 Toyota Airjet Looms in Faisalabad',
      operationalResponsibilities: 'Rashid Ahmed manages plant operations and sales; Tariq Mehmood manages raw material procurement',
      geographicOperatingArea: 'Pakistan and European Export Markets',
      initialBusinessValuePKR: 100000000,
      expectedAnnualRevenuePKR: 350000000,
      expectedTotalInvestmentPKR: 100000000
    }
  }
];

export const INITIAL_CAPITAL_CONTRIBUTIONS: PartnerCapitalContribution[] = [
  {
    id: 'cap_01',
    partnershipId: 'ptn_crest_01',
    partnerId: 'partner_01',
    partnerName: 'Rashid Ahmed',
    contributionDate: '2026-01-15',
    contributionType: 'Bank Transfer',
    description: 'Initial Cash Investment via Meezan Bank IBFT',
    agreedValuationPKR: 50000000,
    paymentReference: 'MZB-IBFT-991201',
    approvalStatus: 'APPROVED',
    approvedBy: 'Master Admin',
    approvalDate: '2026-01-15'
  },
  {
    id: 'cap_02',
    partnershipId: 'ptn_crest_01',
    partnerId: 'partner_02',
    partnerName: 'Tariq Mehmood',
    contributionDate: '2026-01-15',
    contributionType: 'Machinery & Plant',
    description: '10 Toyota Shuttleless Weaving Looms with Factory Installation',
    agreedValuationPKR: 30000000,
    paymentReference: 'INSPECT-MACH-2026',
    approvalStatus: 'APPROVED',
    approvedBy: 'Master Admin',
    approvalDate: '2026-01-15'
  },
  {
    id: 'cap_03',
    partnershipId: 'ptn_crest_01',
    partnerId: 'partner_03',
    partnerName: 'Zainab Bibi',
    contributionDate: '2026-01-15',
    contributionType: 'Bank Transfer',
    description: 'Investment Capital Deposit via Bank Alfalah RTGS',
    agreedValuationPKR: 20000000,
    paymentReference: 'ALFH-RTGS-55120',
    approvalStatus: 'APPROVED',
    approvedBy: 'Master Admin',
    approvalDate: '2026-01-15'
  }
];

const LOCAL_KEY_PARTNERSHIPS = 'mts_partnerships_v1';
const LOCAL_KEY_CAPITAL = 'mts_partner_capital_v1';
const LOCAL_KEY_PAYMENTS = 'mts_partner_payments_v1';

export async function getCompanyPartnerships(companyId: string): Promise<Partnership[]> {
  try {
    const docRef = doc(db, 'companies', companyId, 'system', 'partnershipsData');
    const snap = await getDoc(docRef);
    if (snap.exists() && snap.data()?.partnerships) {
      const list = snap.data().partnerships;
      if (Array.isArray(list) && list.length > 0) return list;
    }
  } catch (e) {
    console.warn('Firestore partnerships load error:', e);
  }

  try {
    const stored = localStorage.getItem(`${LOCAL_KEY_PARTNERSHIPS}_${companyId}`);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}

  return INITIAL_PARTNERSHIPS;
}

export async function saveCompanyPartnerships(companyId: string, partnerships: Partnership[]): Promise<void> {
  try {
    localStorage.setItem(`${LOCAL_KEY_PARTNERSHIPS}_${companyId}`, JSON.stringify(partnerships));
  } catch {}

  try {
    const docRef = doc(db, 'companies', companyId, 'system', 'partnershipsData');
    await setDoc(docRef, { partnerships, updatedAt: new Date().toISOString() }, { merge: true });
  } catch (e) {
    console.warn('Firestore partnerships save error:', e);
  }
}

export async function getCapitalContributions(companyId: string): Promise<PartnerCapitalContribution[]> {
  try {
    const docRef = doc(db, 'companies', companyId, 'system', 'capitalData');
    const snap = await getDoc(docRef);
    if (snap.exists() && snap.data()?.contributions) {
      const list = snap.data().contributions;
      if (Array.isArray(list) && list.length > 0) return list;
    }
  } catch (e) {}

  try {
    const stored = localStorage.getItem(`${LOCAL_KEY_CAPITAL}_${companyId}`);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}

  return INITIAL_CAPITAL_CONTRIBUTIONS;
}

export async function saveCapitalContributions(companyId: string, contributions: PartnerCapitalContribution[]): Promise<void> {
  try {
    localStorage.setItem(`${LOCAL_KEY_CAPITAL}_${companyId}`, JSON.stringify(contributions));
  } catch {}

  try {
    const docRef = doc(db, 'companies', companyId, 'system', 'capitalData');
    await setDoc(docRef, { contributions, updatedAt: new Date().toISOString() }, { merge: true });
  } catch (e) {}
}

export async function getPartnerPayments(companyId: string): Promise<PartnerPaymentVoucher[]> {
  try {
    const stored = localStorage.getItem(`${LOCAL_KEY_PAYMENTS}_${companyId}`);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {}
  return [
    {
      id: 'pay_v_01',
      voucherNo: 'PV-PTR-2026-001',
      partnershipId: 'ptn_crest_01',
      partnershipName: 'Crest Textile Joint Venture Consortium',
      partnerId: 'partner_01',
      partnerName: 'Rashid Ahmed',
      paymentType: 'Monthly Remuneration',
      amountPKR: 150000,
      paymentDate: '2026-02-01',
      paymentMethod: 'Meezan Bank IBFT',
      bankAccountId: 'm_acc_01',
      txnRefNo: 'MZB-TRANSFER-9901',
      narration: 'Managing Partner Monthly Remuneration for January 2026',
      status: 'POSTED',
      createdBy: 'Finance Manager',
      createdAt: '2026-02-01'
    }
  ];
}

export async function savePartnerPayments(companyId: string, payments: PartnerPaymentVoucher[]): Promise<void> {
  try {
    localStorage.setItem(`${LOCAL_KEY_PAYMENTS}_${companyId}`, JSON.stringify(payments));
  } catch {}
}
