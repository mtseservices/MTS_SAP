import { SubscriptionPlan } from '../types/erp';
import { db } from './firebaseConfig';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export const INITIAL_SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'plan_basic_01',
    name: 'Starter Small Business',
    pricePKR: 45000,
    billingCycle: 'Monthly',
    businessCategories: ['Retail Store', 'Wholesale Shops', 'IT Services', 'Trading'],
    includedModules: ['Finance & Accounts', 'Sales & POS Counter', 'Inventory & Warehouse', 'Reports'],
    maxUsers: 10,
    maxBranches: 2,
    smsQuota: 1000,
    whatsappAlertsEnabled: false,
    vendorPortalLogins: 5,
    customLayoutThemes: false,
    supportedThemeModes: ['light', 'dark']
  },
  {
    id: 'plan_pro_02',
    name: 'Professional Enterprise',
    pricePKR: 120000,
    billingCycle: 'Monthly',
    businessCategories: ['Manufacturing', 'Food & Beverage', 'Textile', 'Trading', 'Solar & Electrical'],
    includedModules: ['Finance & Accounts', 'Procurement & Purchasing', 'Inventory & Warehouse', 'Sales & POS Counter', 'Production & Manufacturing', 'HR & Payroll', 'Reports'],
    maxUsers: 35,
    maxBranches: 5,
    isPopular: true,
    smsQuota: 5000,
    whatsappAlertsEnabled: true,
    vendorPortalLogins: 50,
    customLayoutThemes: true,
    supportedThemeModes: ['light', 'dark']
  },
  {
    id: 'plan_yearly_03',
    name: 'Annual Group ERP (15% Off)',
    pricePKR: 1100000,
    billingCycle: 'Yearly',
    businessCategories: ['Textile', 'Manufacturing', 'Construction', 'Import/Export', 'Shopping Malls', 'Hotel Management'],
    includedModules: ['Finance & Accounts', 'Procurement & Purchasing', 'Inventory & Warehouse', 'Sales & POS Counter', 'Production & Manufacturing', 'HR & Payroll', 'Dynamic Form Builder', 'Reports', 'Approvals', 'AI Center'],
    maxUsers: 100,
    maxBranches: 10,
    smsQuota: 25000,
    whatsappAlertsEnabled: true,
    vendorPortalLogins: 250,
    customLayoutThemes: true,
    supportedThemeModes: ['light', 'dark']
  },
  {
    id: 'plan_onetime_04',
    name: 'Special Offer Plan / Single Time Buy (Lifetime)',
    pricePKR: 3500000,
    billingCycle: 'One-Time',
    businessCategories: ['Manufacturing', 'Textile', 'Construction', 'Healthcare', 'Hotel Management', 'Courier Services'],
    includedModules: ['ALL_ERP_MODULES'],
    maxUsers: 250,
    maxBranches: 25,
    smsQuota: 100000,
    whatsappAlertsEnabled: true,
    vendorPortalLogins: 1000,
    customLayoutThemes: true,
    supportedThemeModes: ['light', 'dark']
  }
];

const STORAGE_KEY = 'mts_subscription_plans';

export async function getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
  try {
    const docRef = doc(db, 'system', 'subscriptionPlans');
    const snap = await getDoc(docRef);
    if (snap.exists() && snap.data()?.plans) {
      const plans = snap.data().plans;
      if (Array.isArray(plans) && plans.length > 0) return plans;
    }
  } catch (e) {
    console.warn('Firestore subscription plans load error:', e);
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}

  return INITIAL_SUBSCRIPTION_PLANS;
}

export async function saveSubscriptionPlans(plans: SubscriptionPlan[]): Promise<void> {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(plans));
  } catch {}

  try {
    const docRef = doc(db, 'system', 'subscriptionPlans');
    await setDoc(docRef, { plans, updatedAt: new Date().toISOString() }, { merge: true });
  } catch (e) {
    console.warn('Firestore subscription plans save error:', e);
  }
}
