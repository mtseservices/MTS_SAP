import React from 'react';
import { useAuthTenant } from '../../context/AuthTenantContext';

interface TenantRouteHandlerProps {
  children: React.ReactNode;
}

export const TenantRouteHandler: React.FC<TenantRouteHandlerProps> = ({ children }) => {
  const { ensureCompanyExists, setCurrentCompany, currentCompany } = useAuthTenant();

  if (typeof window === 'undefined') {
    return <>{children}</>;
  }

  const pathname = window.location.pathname;
  const searchParams = new URLSearchParams(window.location.search);

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

  if (targetSlug && targetSlug.trim() !== '') {
    const cleanSlug = targetSlug.trim().toLowerCase();
    const company = ensureCompanyExists(cleanSlug);
    if (company && currentCompany?.id !== company.id) {
      setCurrentCompany(company);
    }
  }

  return <>{children}</>;
};
