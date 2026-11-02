import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { ClientCompany, UserProfile, ThemePalette, Branch } from '../types/erp';
import { INITIAL_CLIENT_COMPANIES, resolveCurrentTenant } from '../services/tenantResolver';
import { INITIAL_BRANCHES } from '../services/mockData';
import { doc, deleteDoc, setDoc } from 'firebase/firestore';
import { db } from '../services/firebaseConfig';

// Global Security Inactivity Middleware Constants
export const INACTIVITY_TIMEOUT_MS = 5 * 60 * 1000; // Exactly 5 minutes (300,000 ms)
export const INACTIVITY_CHECK_INTERVAL_MS = 1000; // 1-second check interval
export const STORAGE_AUTH_KEY = 'mts_auth';
export const STORAGE_LAST_ACTIVITY_KEY = 'mts_last_activity';
export const STORAGE_LOCK_NOTICE_KEY = 'mts_session_lock_notice';

export const USER_INTERACTION_EVENTS = [
  'mousemove',
  'mousedown',
  'mouseup',
  'click',
  'keydown',
  'keyup',
  'touchstart',
  'touchend',
  'touchmove',
  'scroll',
  'wheel',
  'pointerdown',
  'pointermove',
  'focus'
] as const;

interface AuthTenantContextType {
  isAuthenticated: boolean;
  setIsAuthenticated: (val: boolean) => void;
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
  permanentDeleteCompany: (companyId: string) => Promise<void>;
  login: (type?: 'MASTER' | 'CLIENT', companySlug?: string, role?: string) => void;
  logout: (reason?: string) => void;
  sessionLockNotice: string | null;
  clearSessionLockNotice: () => void;
  secondsRemaining: number;
  resetInactivityTimer: () => void;
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
  companyName: 'Albarka Food Industries (Pvt) Ltd',
  branchId: 'br_lahore_01',
  branchName: 'Lahore Head Office & Plant',
  isMaster: false,
  allowedCompanies: ['tenant_albarka', 'tenant_solartech']
};

const AuthTenantContext = createContext<AuthTenantContextType | undefined>(undefined);

export const AuthTenantProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load persisted deleted company IDs and custom registered companies
  const getDeletedCompanyIds = (): string[] => {
    try {
      const stored = localStorage.getItem('mts_deleted_companies');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  };

  const getCustomCompanies = (): ClientCompany[] => {
    try {
      const stored = localStorage.getItem('mts_custom_companies');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  };

  // Initial Companies filtered by permanent deletion list
  const [allCompanies, setAllCompanies] = useState<ClientCompany[]>(() => {
    const deletedIds = getDeletedCompanyIds();
    const customComps = getCustomCompanies();
    const combined = [...customComps, ...INITIAL_CLIENT_COMPANIES];
    return combined.filter(c => !deletedIds.includes(c.id));
  });

  // Strict initial authentication: First time open MUST require login!
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('mts_auth') === 'true';
  });

  const [isMasterPortal, setIsMasterPortal] = useState<boolean>(false);
  const [currentCompany, setCurrentCompany] = useState<ClientCompany>(() => {
    const deletedIds = getDeletedCompanyIds();
    const available = INITIAL_CLIENT_COMPANIES.filter(c => !deletedIds.includes(c.id));
    return available[0] || INITIAL_CLIENT_COMPANIES[0];
  });

  const [currentUser, setCurrentUser] = useState<UserProfile>(DEFAULT_CLIENT_USER);
  const [currentBranch, setCurrentBranch] = useState<Branch>(INITIAL_BRANCHES[0]);
  const [theme, setTheme] = useState<ThemePalette>('corporate-blue');

  // Security Inactivity Tracker (5 minutes = 300,000 ms)
  const [sessionLockNotice, setSessionLockNotice] = useState<string | null>(() => {
    return sessionStorage.getItem(STORAGE_LOCK_NOTICE_KEY) || null;
  });
  const [secondsRemaining, setSecondsRemaining] = useState<number>(() => {
    if (sessionStorage.getItem(STORAGE_AUTH_KEY) !== 'true') return 300;
    const storedLast = localStorage.getItem(STORAGE_LAST_ACTIVITY_KEY);
    if (storedLast) {
      const elapsed = Date.now() - parseInt(storedLast, 10);
      return Math.max(0, Math.ceil((INACTIVITY_TIMEOUT_MS - elapsed) / 1000));
    }
    return 300;
  });

  const lastActivityRef = useRef<number>(Date.now());
  const lastThrottleRef = useRef<number>(Date.now());

  // Programmatic timer reset helper
  const resetInactivityTimer = () => {
    lastActivityRef.current = Date.now();
    setSecondsRemaining(300);
    try {
      localStorage.setItem(STORAGE_LAST_ACTIVITY_KEY, Date.now().toString());
    } catch {
      // Ignore quota issues
    }
  };

  // GLOBAL 5-MINUTE INACTIVITY TIMER MIDDLEWARE
  useEffect(() => {
    // If not authenticated, ensure timer is reset
    if (!isAuthenticated) {
      setSecondsRemaining(300);
      return;
    }

    // Interaction listener handler with 1-second throttling to optimize rendering performance
    const handleUserInteraction = () => {
      const now = Date.now();
      lastActivityRef.current = now;

      // Throttle localStorage writes and state updates to at most once per second
      if (now - lastThrottleRef.current > 1000) {
        lastThrottleRef.current = now;
        setSecondsRemaining(300);
        try {
          localStorage.setItem(STORAGE_LAST_ACTIVITY_KEY, now.toString());
        } catch {
          // Ignore quota issues
        }
      }
    };

    // Attach all interaction event listeners to the global window
    USER_INTERACTION_EVENTS.forEach((eventName) => {
      window.addEventListener(eventName, handleUserInteraction, { passive: true });
    });

    // Cross-tab synchronization via localStorage storage event
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_LAST_ACTIVITY_KEY && e.newValue) {
        const remoteTime = parseInt(e.newValue, 10);
        if (!isNaN(remoteTime)) {
          lastActivityRef.current = remoteTime;
          const elapsed = Date.now() - remoteTime;
          const left = Math.max(0, Math.ceil((INACTIVITY_TIMEOUT_MS - elapsed) / 1000));
          setSecondsRemaining(left);
        }
      } else if (e.key === STORAGE_AUTH_KEY && e.newValue !== 'true') {
        // Another browser tab triggered logout
        setIsAuthenticated(false);
      }
    };
    window.addEventListener('storage', handleStorageChange);

    // Initial check on mount: If user was already inactive for > 5 min, auto-lock immediately
    const storedLast = localStorage.getItem(STORAGE_LAST_ACTIVITY_KEY);
    if (storedLast) {
      const elapsedOnMount = Date.now() - parseInt(storedLast, 10);
      if (elapsedOnMount >= INACTIVITY_TIMEOUT_MS) {
        const lockMsg =
          '🔒 Security Auto-Lock: Your session was automatically terminated and redirected to the login screen after 5 minutes of inactivity to protect confidential ERP data.';
        sessionStorage.removeItem(STORAGE_AUTH_KEY);
        sessionStorage.setItem(STORAGE_LOCK_NOTICE_KEY, lockMsg);
        setIsAuthenticated(false);
        setSessionLockNotice(lockMsg);
        setSecondsRemaining(0);
        return;
      }
    }

    // 1-Second Heartbeat Interval
    const timerInterval = setInterval(() => {
      if (sessionStorage.getItem(STORAGE_AUTH_KEY) !== 'true') {
        return;
      }

      const elapsed = Date.now() - lastActivityRef.current;
      const left = Math.max(0, Math.ceil((INACTIVITY_TIMEOUT_MS - elapsed) / 1000));
      setSecondsRemaining(left);

      // Inactivity threshold reached (5 minutes / 300,000 ms)
      if (elapsed >= INACTIVITY_TIMEOUT_MS) {
        const timeoutNotice =
          '🔒 Security Auto-Lock: Your session was automatically terminated and redirected to the login screen after 5 minutes of inactivity to protect confidential ERP data.';

        // Clear session authentication immediately
        sessionStorage.removeItem(STORAGE_AUTH_KEY);
        sessionStorage.setItem(STORAGE_LOCK_NOTICE_KEY, timeoutNotice);

        // Update state to immediately redirect user to the login screen
        setIsAuthenticated(false);
        setSessionLockNotice(timeoutNotice);
        setSecondsRemaining(0);
      }
    }, INACTIVITY_CHECK_INTERVAL_MS);

    return () => {
      USER_INTERACTION_EVENTS.forEach((eventName) => {
        window.removeEventListener(eventName, handleUserInteraction);
      });
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(timerInterval);
    };
  }, [isAuthenticated]);

  useEffect(() => {
    const resolved = resolveCurrentTenant();
    if (resolved.isMasterPortal && currentUser.isMaster) {
      setIsMasterPortal(true);
      setCurrentUser(MASTER_USER);
    } else if (resolved.company) {
      setIsMasterPortal(false);
      setCurrentCompany(resolved.company);
      setTheme(resolved.company.theme || 'corporate-blue');
    }
  }, []);

  const login = (type: 'MASTER' | 'CLIENT' = 'CLIENT', companySlug?: string, role?: string) => {
    setIsAuthenticated(true);
    sessionStorage.setItem(STORAGE_AUTH_KEY, 'true');
    sessionStorage.removeItem(STORAGE_LOCK_NOTICE_KEY);
    try {
      localStorage.setItem(STORAGE_LAST_ACTIVITY_KEY, Date.now().toString());
    } catch {
      // Ignore quota issues
    }
    setSessionLockNotice(null);
    lastActivityRef.current = Date.now();
    lastThrottleRef.current = Date.now();
    setSecondsRemaining(300);

    if (type === 'MASTER') {
      setIsMasterPortal(true);
      setCurrentUser(MASTER_USER);
    } else {
      setIsMasterPortal(false);
      const targetSlug = companySlug || currentCompany.slug;
      const matched = allCompanies.find(c => c.slug.toLowerCase() === targetSlug.toLowerCase()) || allCompanies[0];
      setCurrentCompany(matched);
      setTheme(matched.theme || 'corporate-blue');

      let updatedRole = role || 'CLIENT_ADMIN';
      setCurrentUser({
        ...DEFAULT_CLIENT_USER,
        tenantId: matched.tenantId,
        companyId: matched.id,
        companyName: matched.name,
        email: matched.adminEmail,
        name: matched.adminName,
        role: updatedRole as any,
        isMaster: false
      });
    }
  };

  const logout = (reason?: string) => {
    setIsAuthenticated(false);
    sessionStorage.removeItem(STORAGE_AUTH_KEY);
    if (reason) {
      sessionStorage.setItem(STORAGE_LOCK_NOTICE_KEY, reason);
      setSessionLockNotice(reason);
    } else {
      sessionStorage.removeItem(STORAGE_LOCK_NOTICE_KEY);
      setSessionLockNotice(null);
    }
    setSecondsRemaining(300);
  };

  const clearSessionLockNotice = () => {
    sessionStorage.removeItem(STORAGE_LOCK_NOTICE_KEY);
    setSessionLockNotice(null);
  };

  const switchTenantBySlug = (slug: string) => {
    // Security restriction: Client users CANNOT switch to Master portal without logging in as Master Admin!
    if (slug === 'master') {
      if (!currentUser.isMaster) {
        console.warn('Security Block: Client users cannot access Master Portal without master credentials.');
        return;
      }
      setIsMasterPortal(true);
      setCurrentUser(MASTER_USER);
      return;
    }

    const matched = allCompanies.find(c => c.slug.toLowerCase() === slug.toLowerCase());
    if (matched) {
      setIsMasterPortal(false);
      setCurrentCompany(matched);
      setTheme(matched.theme || 'corporate-blue');
      setCurrentUser(prev => ({
        ...prev,
        tenantId: matched.tenantId,
        companyId: matched.id,
        companyName: matched.name,
        email: matched.adminEmail,
        name: matched.adminName,
        isMaster: false
      }));
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
      subdomain: `${slug}.mts-sap.vercel.app`,
      url: `https://mts-sap.vercel.app?company=${slug}`,
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

    // Save to custom companies in localStorage
    const custom = getCustomCompanies();
    custom.unshift(newCompany);
    localStorage.setItem('mts_custom_companies', JSON.stringify(custom));

    // Also persist to Firestore
    try {
      setDoc(doc(db, 'companies', compId), newCompany);
    } catch (e) {
      console.warn('Could not save company to Firestore:', e);
    }

    setAllCompanies(prev => [newCompany, ...prev]);
    return newCompany;
  };

  const permanentDeleteCompany = async (companyId: string): Promise<void> => {
    // 1. Add to permanent deleted list in localStorage
    const deleted = getDeletedCompanyIds();
    if (!deleted.includes(companyId)) {
      deleted.push(companyId);
      localStorage.setItem('mts_deleted_companies', JSON.stringify(deleted));
    }

    // 2. Remove from custom companies if present
    const custom = getCustomCompanies().filter(c => c.id !== companyId);
    localStorage.setItem('mts_custom_companies', JSON.stringify(custom));

    // 3. Delete from Firestore permanently
    try {
      await deleteDoc(doc(db, 'companies', companyId));
    } catch (e) {
      console.warn('Firestore company delete error:', e);
    }

    // 4. Update memory state
    setAllCompanies(prev => {
      const remaining = prev.filter(c => c.id !== companyId);
      if (currentCompany.id === companyId && remaining.length > 0) {
        setCurrentCompany(remaining[0]);
      }
      return remaining;
    });
  };

  return (
    <AuthTenantContext.Provider
      value={{
        isAuthenticated,
        setIsAuthenticated,
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
        registerNewCompany,
        permanentDeleteCompany,
        login,
        logout,
        sessionLockNotice,
        clearSessionLockNotice,
        secondsRemaining,
        resetInactivityTimer
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
