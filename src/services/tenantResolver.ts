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

  let allComps: ClientCompany[] = [];
  try {
    const storedCustom = localStorage.getItem('mts_custom_companies');
    if (storedCustom) {
      allComps = JSON.parse(storedCustom);
    }
  } catch {}
  const combined = [...allComps, ...INITIAL_CLIENT_COMPANIES];

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
    const cleanSlug = pathSlug.trim().toLowerCase();
    const matchedCompany = combined.find(c => c.slug.toLowerCase() === cleanSlug);
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
    const cleanSlug = queryTenant.trim().toLowerCase();
    const matchedCompany = combined.find(c => c.slug.toLowerCase() === cleanSlug);
    return {
      isMasterPortal: false,
      tenantSlug: matchedCompany ? matchedCompany.slug : queryTenant,
      company: matchedCompany || null
    };
  }

  if (isMasterParam && !pathSlug && !queryTenant) {
    return { isMasterPortal: true, tenantSlug: null, company: null };
  }

  // Default fallback to Master if at root
  if (pathname === '/' && !queryTenant) {
    return { isMasterPortal: true, tenantSlug: null, company: null };
  }

  const firstCompany = combined[0] || null;
  return {
    isMasterPortal: false,
    tenantSlug: firstCompany ? firstCompany.slug : 'crest',
    company: firstCompany
  };
}
