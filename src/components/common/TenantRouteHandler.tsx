import React from 'react';
import { useAuthTenant } from '../../context/AuthTenantContext';

interface TenantRouteHandlerProps {
  children: React.ReactNode;
}

export const TenantRouteHandler: React.FC<TenantRouteHandlerProps> = ({ children }) => {
  const { ensureCompanyExists, setCurrentCompany, currentCompany, setIsMasterPortal } = useAuthTenant();

  if (typeof window === 'undefined') {
    return <>{children}</>;
  }

  const pathname = window.location.pathname;
  const hash = window.location.hash;
  const searchParams = new URLSearchParams(window.location.search);

  let extractedPathSlug: string | null = null;
  if (pathname.startsWith('/login/')) {
    extractedPathSlug = pathname.replace('/login/', '').split('/')[0];
  } else if (pathname.startsWith('/company/')) {
    extractedPathSlug = pathname.replace('/company/', '').split('/')[0];
  } else if (pathname.startsWith('/tenant/')) {
    extractedPathSlug = pathname.replace('/tenant/', '').split('/')[0];
  }

  let hashSlug: string | null = null;
  if (hash.includes('/login/')) {
    hashSlug = hash.split('/login/')[1]?.split('/')[0]?.split('?')[0];
  } else if (hash.includes('/company/')) {
    hashSlug = hash.split('/company/')[1]?.split('/')[0]?.split('?')[0];
  } else if (hash.includes('/tenant/')) {
    hashSlug = hash.split('/tenant/')[1]?.split('/')[0]?.split('?')[0];
  }

  const querySlug = searchParams.get('company') || searchParams.get('tenant');
  const targetSlug = extractedPathSlug || hashSlug || querySlug;

  if (targetSlug && targetSlug.trim() !== '') {
    const cleanSlug = targetSlug.trim().toLowerCase();
    // Strictly unmount/lock out Master Admin mode for client URLs
    setIsMasterPortal(false);
    try {
      sessionStorage.setItem('mts_is_master_portal', 'false');
    } catch {}

    const company = ensureCompanyExists(cleanSlug);
    if (company && currentCompany?.id !== company.id) {
      setCurrentCompany(company);
    }
  }

  return <>{children}</>;
};
