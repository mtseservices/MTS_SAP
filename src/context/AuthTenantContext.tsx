import React, { createContext, useContext, useState, useEffect } from 'react';
import { ClientCompany, UserProfile, ThemePalette, Branch } from '../types/erp';
import { INITIAL_CLIENT_COMPANIES, resolveCurrentTenant } from '../services/tenantResolver';
import { INITIAL_BRANCHES } from '../services/mockData';

interface AuthTenantContextType {
  isMasterPortal: boolean;
  setIsMasterPortal: (val: boolean) => void;
  currentCompany: ClientCompany;
  setCurrentCompany: (comp: ClientCompany) => void;
  allCompanies: ClientCompany[];
  setAllCompanies: React.Dispatch<React.SetStateAction<ClientCompany[]>>;
  currentUser: UserProfile;
  setCurrentUser: React.Dispatch<React.SetStateAction<UserProfile>>;
  currentBranch: Branch;
  setCurrentBranch: (br: Branch) => void;
  allBranches: Branch[];
  theme: ThemePalette;
  setTheme: (t: ThemePalette) => void;
  switchTenantBySlug: (slug: string) => void;
  registerNewCompany: (newCompData: Partial<ClientCompany>) => ClientCompany;
}

const MASTER_USER: UserProfile = {
  id: 'usr_master_01',
  email: 'master.admin@mts-erp.pk',
  name: 'Master Global Administrator',
  role: 'MASTER_ADMIN',
  tenantId: 'system_master',
  companyId: 'system',
  companyName: 'MTS-ERP Central Portal',
  branchId: 'main',
  branchName: 'Global HQ',
  isMaster: true,
  allowedCompanies: INITIAL_CLIENT_COMPANIES.map(c => c.tenantId)
};

const DEFAULT_CLIENT_USER: UserProfile = {
  id: 'usr_client_admin_01',
  email: 'admin@albarka.com.pk',
  name: 'Tariq Mehmood',
  role: 'CLIENT_ADMIN',
  tenantId: 'tenant_albarka',
  companyId: 'comp_albarka_001',
  companyName: 'Albarka Food Industries',
  branchId: 'br_lahore_01',
  branchName: 'Lahore Head Office & Plant',
  isMaster: false,
  allowedCompanies: ['tenant_albarka', 'tenant_solartech']
};

const AuthTenantContext = createContext<AuthTenantContextType | undefined>(undefined);

export const AuthTenantProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [allCompanies, setAllCompanies] = useState<ClientCompany[]>(INITIAL_CLIENT_COMPANIES);
  const [isMasterPortal, setIsMasterPortal] = useState<boolean>(false);
  const [currentCompany, setCurrentCompany] = useState<ClientCompany>(INITIAL_CLIENT_COMPANIES[0]);
  const [currentUser, setCurrentUser] = useState<UserProfile>(DEFAULT_CLIENT_USER);
  const [currentBranch, setCurrentBranch] = useState<Branch>(INITIAL_BRANCHES[0]);
  const [theme, setTheme] = useState<ThemePalette>('corporate-blue');

  useEffect(() => {
    const resolved = resolveCurrentTenant();
    if (resolved.isMasterPortal) {
      setIsMasterPortal(true);
      setCurrentUser(MASTER_USER);
    } else if (resolved.company) {
      setIsMasterPortal(false);
      setCurrentCompany(resolved.company);
      setTheme(resolved.company.theme || 'corporate-blue');
    }
  }, []);

  const switchTenantBySlug = (slug: string) => {
    if (slug === 'master') {
      setIsMasterPortal(true);
      setCurrentUser(MASTER_USER);
      return;
    }

    const matched = allCompanies.find(c => c.slug.toLowerCase() === slug.toLowerCase());
    if (matched) {
      setIsMasterPortal(false);
      setCurrentCompany(matched);
      setTheme(matched.theme || 'corporate-blue');
      setCurrentUser({
        ...DEFAULT_CLIENT_USER,
        tenantId: matched.tenantId,
        companyId: matched.id,
        companyName: matched.name,
        email: matched.adminEmail,
        name: matched.adminName,
      });
    }
  };

  const registerNewCompany = (newCompData: Partial<ClientCompany>): ClientCompany => {
    const slug = (newCompData.slug || newCompData.name || 'company')
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '');
    
    const tenantId = `tenant_${slug}_${Date.now().toString().slice(-4)}`;
    const compId = `comp_${slug}_${Date.now().toString().slice(-4)}`;

    const newCompany: ClientCompany = {
      id: compId,
      tenantId,
      name: newCompData.name || 'New Client Company',
      registeredName: newCompData.registeredName || newCompData.name || 'New Client Business Ltd',
      code: newCompData.code || 'NCC001',
      slug,
      subdomain: `${slug}.erp.mts.pk`,
      url: `https://${slug}.erp.mts.pk`,
      industry: newCompData.industry || 'Manufacturing',
      category: newCompData.category || 'General Business',
      ntn: newCompData.ntn || '1000000-0',
      strn: newCompData.strn || '1000000000000',
      email: newCompData.email || 'info@company.pk',
      phone: newCompData.phone || '+92-42-0000000',
      address: newCompData.address || 'Industrial Area',
      city: newCompData.city || 'Lahore',
      province: newCompData.province || 'Punjab',
      country: 'Pakistan',
      primaryContact: newCompData.primaryContact || 'Administrator',
      subscriptionPlan: newCompData.subscriptionPlan || 'Professional',
      userLimit: newCompData.userLimit || 25,
      branchLimit: newCompData.branchLimit || 3,
      activeModules: ['Finance', 'Procurement', 'Inventory', 'Sales', 'HR', 'Reports'],
      status: 'ACTIVE',
      createdAt: new Date().toISOString().split('T')[0],
      adminName: newCompData.adminName || 'Company Admin',
      adminEmail: newCompData.adminEmail || 'admin@company.pk',
      theme: newCompData.theme || 'corporate-blue'
    };

    setAllCompanies(prev => [newCompany, ...prev]);
    return newCompany;
  };

  return (
    <AuthTenantContext.Provider
      value={{
        isMasterPortal,
        setIsMasterPortal,
        currentCompany,
        setCurrentCompany,
        allCompanies,
        setAllCompanies,
        currentUser,
        setCurrentUser,
        currentBranch,
        setCurrentBranch,
        allBranches: INITIAL_BRANCHES,
        theme,
        setTheme,
        switchTenantBySlug,
        registerNewCompany
      }}
    >
      <div className={`theme-${theme} min-h-screen text-slate-100`}>
        {children}
      </div>
    </AuthTenantContext.Provider>
  );
};

export const useAuthTenant = () => {
  const context = useContext(AuthTenantContext);
  if (!context) throw new Error('useAuthTenant must be used within AuthTenantProvider');
  return context;
};
