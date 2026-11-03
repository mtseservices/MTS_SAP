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

  // 1. Check Path-based: /login/{slug}, /company/{slug}, or /tenant/{slug}
  let pathSlug: string | null = null;
  if (pathname.startsWith('/login/')) {
    pathSlug = pathname.replace('/login/', '').split('/')[0];
  } else if (pathname.startsWith('/company/')) {
    pathSlug = pathname.replace('/company/', '').split('/')[0];
  } else if (pathname.startsWith('/tenant/')) {
    pathSlug = pathname.replace('/tenant/', '').split('/')[0];
  }

  if (pathSlug && pathSlug.trim() !== '') {
    const matchedCompany = INITIAL_CLIENT_COMPANIES.find(c => c.slug.toLowerCase() === pathSlug!.toLowerCase());
    return {
      isMasterPortal: false,
      tenantSlug: matchedCompany ? matchedCompany.slug : pathSlug,
      company: matchedCompany || null
    };
  }

  // 2. Check URL query param ?company=crest or ?tenant=crest
  const queryTenant = searchParams.get('company') || searchParams.get('tenant');
  const isMasterParam = searchParams.get('master') === 'true' || hash.includes('/master') || pathname === '/';

  if (queryTenant) {
    const matchedCompany = INITIAL_CLIENT_COMPANIES.find(c => c.slug.toLowerCase() === queryTenant.toLowerCase());
    return {
      isMasterPortal: false,
      tenantSlug: matchedCompany ? matchedCompany.slug : queryTenant,
      company: matchedCompany || null
    };
  }

  if (isMasterParam && !pathSlug) {
    return { isMasterPortal: true, tenantSlug: null, company: null };
  }

  // 3. Extract subdomain from hostname e.g. "crest.erp.domain.com"
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

  // Default fallback
  const firstCompany = INITIAL_CLIENT_COMPANIES[0] || null;
  return {
    isMasterPortal: false,
    tenantSlug: firstCompany ? firstCompany.slug : 'crest',
    company: firstCompany
  };
}
