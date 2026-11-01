import { ClientCompany } from '../types/erp';

export const INITIAL_CLIENT_COMPANIES: ClientCompany[] = [
  {
    id: 'comp_albarka_001',
    tenantId: 'tenant_albarka',
    name: 'Albarka Food Industries (Pvt) Ltd',
    registeredName: 'Albarka Food Industries Private Limited',
    code: 'AFI001',
    slug: 'albarka',
    subdomain: 'albarka.erp.mts.pk',
    url: 'https://albarka.erp.mts.pk',
    industry: 'Food & Beverage',
    category: 'FMCG Manufacturing',
    ntn: '4829104-7',
    strn: '3277876543219',
    email: 'info@albarka.com.pk',
    phone: '+92-42-35889911',
    address: 'Plot 42, Industrial Estate, Kot Lakhpat',
    city: 'Lahore',
    province: 'Punjab',
    country: 'Pakistan',
    logoUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=120&q=80',
    primaryContact: 'Muhammad Ali - COO',
    subscriptionPlan: 'Enterprise',
    userLimit: 50,
    branchLimit: 5,
    activeModules: ['Finance', 'Procurement', 'Inventory', 'Sales', 'Production', 'HR', 'Quality', 'Workflow', 'Reports'],
    status: 'ACTIVE',
    createdAt: '2026-01-15',
    adminName: 'Tariq Mehmood',
    adminEmail: 'admin@albarka.com.pk',
    theme: 'corporate-blue',
  },
  {
    id: 'comp_solartech_002',
    tenantId: 'tenant_solartech',
    name: 'SolarTech Power Solutions PK',
    registeredName: 'SolarTech Energy Systems (Pvt) Ltd',
    code: 'STP002',
    slug: 'solartech',
    subdomain: 'solartech.erp.mts.pk',
    url: 'https://solartech.erp.mts.pk',
    industry: 'Solar & Electrical',
    category: 'Renewable Energy EPC & Retail',
    ntn: '5910283-1',
    strn: '1098237465012',
    email: 'contact@solartech.pk',
    phone: '+92-51-8492000',
    address: 'Sector I-9/2, Industrial Area',
    city: 'Islamabad',
    province: 'Federal Capital',
    country: 'Pakistan',
    logoUrl: 'https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=120&q=80',
    primaryContact: 'Usman Khan - CEO',
    subscriptionPlan: 'Enterprise',
    userLimit: 30,
    branchLimit: 3,
    activeModules: ['Finance', 'Procurement', 'Inventory', 'Sales', 'HR', 'Workflow', 'Reports'],
    status: 'ACTIVE',
    createdAt: '2026-02-10',
    adminName: 'Usman Khan',
    adminEmail: 'admin@solartech.pk',
    theme: 'professional-green',
  },
  {
    id: 'comp_crest_003',
    tenantId: 'tenant_crest',
    name: 'Crest Textile Mills Ltd',
    registeredName: 'Crest Textile Processing & Exports',
    code: 'CTM003',
    slug: 'crest',
    subdomain: 'crest.erp.mts.pk',
    url: 'https://crest.erp.mts.pk',
    industry: 'Textile',
    category: 'Spinning & Export Manufacturing',
    ntn: '1029384-9',
    strn: '2288440011223',
    email: 'exports@cresttextile.com',
    phone: '+92-41-8712345',
    address: 'Sargodha Road, Textile Zone',
    city: 'Faisalabad',
    province: 'Punjab',
    country: 'Pakistan',
    logoUrl: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=120&q=80',
    primaryContact: 'Rashid Ahmed - Director',
    subscriptionPlan: 'Enterprise',
    userLimit: 100,
    branchLimit: 8,
    activeModules: ['Finance', 'Procurement', 'Inventory', 'Sales', 'Production', 'HR', 'Quality', 'Workflow', 'Reports'],
    status: 'ACTIVE',
    createdAt: '2026-03-01',
    adminName: 'Rashid Ahmed',
    adminEmail: 'admin@cresttextile.com',
    theme: 'royal-black-gold',
  }
];

export interface ResolvedTenant {
  isMasterPortal: boolean;
  tenantSlug: string | null;
  company: ClientCompany | null;
}

export function resolveCurrentTenant(): ResolvedTenant {
  if (typeof window === 'undefined') {
    return { isMasterPortal: true, tenantSlug: null, company: null };
  }

  const hostname = window.location.hostname;
  const searchParams = new URLSearchParams(window.location.search);
  const hash = window.location.hash;

  // Check URL query param ?tenant=albarka or ?master=true
  const queryTenant = searchParams.get('tenant');
  const isMasterParam = searchParams.get('master') === 'true' || hash.includes('/master');

  if (isMasterParam) {
    return { isMasterPortal: true, tenantSlug: null, company: null };
  }

  if (queryTenant) {
    const matchedCompany = INITIAL_CLIENT_COMPANIES.find(c => c.slug.toLowerCase() === queryTenant.toLowerCase());
    if (matchedCompany) {
      return { isMasterPortal: false, tenantSlug: matchedCompany.slug, company: matchedCompany };
    }
  }

  // Extract subdomain from hostname e.g. "albarka.erp.domain.com"
  const hostParts = hostname.split('.');
  if (hostParts.length >= 3 && hostParts[0] !== 'www' && hostParts[0] !== 'erp') {
    const subdomain = hostParts[0].toLowerCase();
    const matchedCompany = INITIAL_CLIENT_COMPANIES.find(c => c.slug.toLowerCase() === subdomain);
    if (matchedCompany) {
      return { isMasterPortal: false, tenantSlug: matchedCompany.slug, company: matchedCompany };
    }
  }

  // Default fallback: Default to first company tenant or Master switchable state
  return {
    isMasterPortal: false,
    tenantSlug: INITIAL_CLIENT_COMPANIES[0].slug,
    company: INITIAL_CLIENT_COMPANIES[0]
  };
}
