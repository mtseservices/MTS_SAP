import { ClientCompany } from '../types/erp';
import { INDUSTRY_DEPARTMENT_PRESETS } from './departmentCategoryMapper';

export const INITIAL_CLIENT_COMPANIES: ClientCompany[] = [];

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
    const slug = parts[2]; // /company/crest -> ['','company', 'crest']
    if (slug) {
      const matchedCompany = INITIAL_CLIENT_COMPANIES.find(c => c.slug.toLowerCase() === slug.toLowerCase());
      if (matchedCompany) {
        return { isMasterPortal: false, tenantSlug: matchedCompany.slug, company: matchedCompany };
      }
    }
  }

  // Check URL query param ?company=crest or ?tenant=crest or ?master=true
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

  // Extract subdomain from hostname e.g. "crest.erp.domain.com"
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
