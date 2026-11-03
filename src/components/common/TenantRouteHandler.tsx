import React from 'react';
import { useAuthTenant } from '../../context/AuthTenantContext';
import { TenantNotFoundView } from './TenantNotFoundView';

interface TenantRouteHandlerProps {
  children: React.ReactNode;
}

export const TenantRouteHandler: React.FC<TenantRouteHandlerProps> = ({ children }) => {
  const { allCompanies, isMasterPortal, setIsMasterPortal, setCurrentCompany } = useAuthTenant();

  if (typeof window === 'undefined') {
    return <>{children}</>;
  }

  const pathname = window.location.pathname;
  const searchParams = new URLSearchParams(window.location.search);

  // Extract path slug e.g. /login/fusionfoodfaisalabad or /company/fusionfoodfaisalabad
  let extractedPathSlug: string | null = null;
  if (pathname.startsWith('/login/')) {
    extractedPathSlug = pathname.replace('/login/', '').split('/')[0];
  } else if (pathname.startsWith('/company/')) {
    extractedPathSlug = pathname.replace('/company/', '').split('/')[0];
  } else if (pathname.startsWith('/tenant/')) {
    extractedPathSlug = pathname.replace('/tenant/', '').split('/')[0];
  }

  const querySlug = searchParams.get('company') || searchParams.get('tenant');
  const targetSlug = extractedPathSlug || querySlug;

  // If a specific tenant slug is requested via URL path or query
  if (targetSlug && targetSlug.trim() !== '') {
    const cleanSlug = targetSlug.trim().toLowerCase();
    const matchedCompany = allCompanies.find((c) => c.slug.toLowerCase() === cleanSlug);

    // If company slug does NOT exist in company registry
    if (!matchedCompany) {
      return (
        <TenantNotFoundView
          requestedSlug={targetSlug}
          onGoToMaster={() => {
            window.location.href = '/?portal=master';
          }}
        />
      );
    }
  }

  return <>{children}</>;
};
