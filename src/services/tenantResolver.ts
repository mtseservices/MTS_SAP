import { ClientCompany } from '../types/erp';

export const INITIAL_CLIENT_COMPANIES: ClientCompany[] = [
  {
    id: 'comp_albarka_001',
    tenantId: 'tenant_albarka',
    name: 'Albarka Food Industries (Pvt) Ltd',
    registeredName: 'Albarka Food Industries Private Limited',
    code: 'AFI001',
    slug: 'albarka',
    subdomain: 'albarka.mts-sap.vercel.app',
    url: 'https://mts-sap.vercel.app?company=albarka',
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
    subdomain: 'solartech.mts-sap.vercel.app',
    url: 'https://mts-sap.vercel.app?company=solartech',
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
    subdomain: 'crest.mts-sap.vercel.app',
    url: 'https://mts-sap.vercel.app?company=crest',
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

export function generateLoginUrl(tenantSlug: string): string {
  return `https://app.mts-erp.pk/${tenantSlug}/login`;
}

export function resolveCurrentTenant(): ResolvedTenant {
  if (typeof window === 'undefined') {
    return { isMasterPortal: true, tenantSlug: null, company: null };
  }

  const hostname = window.location.hostname;
  const pathname = window.location.pathname;
  const searchParams = new URLSearchParams(window.location.search);
  const hash = window.location.hash;

  // 1. Check Path-based: /company/{slug}
  if (pathname.startsWith('/company')) {
    const parts = pathname.split('/');
    const slug = parts[2]; // /company/albarka -> ['','company', 'albarka']
    if (slug) {
      const matchedCompany = INITIAL_CLIENT_COMPANIES.find(c => c.slug.toLowerCase() === slug.toLowerCase());
      if (matchedCompany) {
        return { isMasterPortal: false, tenantSlug: matchedCompany.slug, company: matchedCompany };
      }
    }
  }

  // Check URL query param ?company=albarka or ?tenant=albarka or ?master=true
  const queryTenant = searchParams.get('company') || searchParams.get('tenant');
  const isMasterParam = searchParams.get('master') === 'true' || hash.includes('/master') || pathname === '/';

  if (isMasterParam && !queryTenant && !pathname.startsWith('/company')) {
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

  // Default fallback: Default to Master if at root
  if (pathname === '/') {
    return { isMasterPortal: true, tenantSlug: null, company: null };
  }

  // Default fallback: Default to first company tenant
  return {
    isMasterPortal: false,
    tenantSlug: INITIAL_CLIENT_COMPANIES[0].slug,
    company: INITIAL_CLIENT_COMPANIES[0]
  };
}
