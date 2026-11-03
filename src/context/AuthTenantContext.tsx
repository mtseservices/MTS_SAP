import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { ClientCompany, UserProfile, ThemePalette, Branch, ThemeMode, LoginTemplateId, TableDensity } from '../types/erp';
import { INITIAL_CLIENT_COMPANIES, resolveCurrentTenant } from '../services/tenantResolver';
import { INITIAL_BRANCHES } from '../services/mockData';
import { getDefaultDepartmentIdsForIndustry } from '../services/departmentCategoryMapper';
import { doc, deleteDoc, setDoc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged, signInAnonymously, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { db, auth, sanitizeForFirestore } from '../services/firebaseConfig';

// Global Security Inactivity Middleware Constants
export const INACTIVITY_TIMEOUT_MS = 5 * 60 * 1000; // Exactly 5 minutes (300,000 ms)
export const INACTIVITY_CHECK_INTERVAL_MS = 1000; // 1-second check interval
export const STORAGE_SESSION_ID_KEY = 'mts_session_id';
export const STORAGE_AUTH_KEY = 'mts_auth';
export const STORAGE_LAST_ACTIVITY_KEY = 'mts_last_activity';
export const STORAGE_LOCK_NOTICE_KEY = 'mts_session_lock_notice';
export const STORAGE_USER_KEY = 'mts_current_user';
export const STORAGE_IS_MASTER_KEY = 'mts_is_master_portal';

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
  permanentDeleteCompany: (companyId: string, tenantId?: string) => Promise<void>;
  updateCompanySubscription: (
    companyId: string,
    data: {
      plan: string;
      cycle: string;
      status: 'ACTIVE' | 'SUSPENDED' | 'INACTIVE';
      expiresAt: string;
      daysRemaining: number;
      paymentMethod: string;
      amount: number;
      txnId: string;
      paymentStatus?: 'PAID' | 'PENDING' | 'OVERDUE' | 'TRIAL';
    }
  ) => Promise<void>;
  updateCompanyCustomRoles: (
    companyId: string,
    roles: { id: string; name: string; code: string; department?: string; permissions?: string[] }[]
  ) => Promise<void>;
  updateCompanyDepartments: (companyId: string, departmentIds: string[]) => Promise<void>;
  updateCompanyBranding: (
    companyId: string,
    branding: {
      themeMode?: ThemeMode;
      loginTemplateId?: LoginTemplateId;
      tableDensity?: TableDensity;
    }
  ) => Promise<void>;
  login: (type?: 'MASTER' | 'CLIENT', companySlug?: string, role?: string) => void;
  logout: (reason?: string) => void;
  sessionLockNotice: string | null;
  clearSessionLockNotice: () => void;
  secondsRemaining: number;
  resetInactivityTimer: () => void;
  isLoading: boolean;
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
  email: 'admin@cresttextile.com',
  name: 'Rashid Ahmed',
  role: 'CLIENT_ADMIN',
  tenantId: 'tenant_crest',
  companyId: 'comp_crest_003',
  companyName: 'Crest Textile Mills Ltd',
  branchId: 'br_faisalabad_01',
  branchName: 'Faisalabad Textile Complex & Plant',
  isMaster: false,
  allowedCompanies: ['tenant_crest']
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

  const applySubOverride = (c: ClientCompany): ClientCompany => {
    let result = { ...c };
    try {
      const storedRoles = localStorage.getItem(`mts_roles_${c.id}`);
      if (storedRoles) {
        const parsedRoles = JSON.parse(storedRoles);
        if (Array.isArray(parsedRoles)) {
          result.customRoles = parsedRoles;
        }
      }
    } catch {}

    try {
      const subData = localStorage.getItem(`mts_sub_${c.id}`);
      if (subData) {
        const parsed = JSON.parse(subData);
        result = {
          ...result,
          subscriptionPlan: parsed.plan || result.subscriptionPlan,
          subscriptionCycle: parsed.cycle || result.subscriptionCycle,
          status: parsed.status || result.status,
          subscriptionExpiresAt: parsed.expiresAt || result.subscriptionExpiresAt,
          trialDaysRemaining: parsed.daysRemaining !== undefined ? parsed.daysRemaining : result.trialDaysRemaining,
          lastPaymentMethod: parsed.paymentMethod || result.lastPaymentMethod,
          lastPaymentAmount: parsed.amount !== undefined ? parsed.amount : result.lastPaymentAmount,
          lastPaymentTxnId: parsed.txnId || result.lastPaymentTxnId,
          lastPaymentDate: parsed.lastPaymentDate || result.lastPaymentDate,
          paymentStatus: parsed.paymentStatus || result.paymentStatus || (parsed.amount && parsed.amount > 0 ? 'PAID' : (result.trialDaysRemaining && result.trialDaysRemaining > 0 ? 'TRIAL' : 'PENDING'))
        };
      } else {
        if (!result.paymentStatus) {
          result.paymentStatus = (result.lastPaymentAmount && result.lastPaymentAmount > 0) ? 'PAID' : ((result.trialDaysRemaining && result.trialDaysRemaining > 0) ? 'TRIAL' : 'PENDING');
        }
      }
    } catch {}
    try {
      const storedDepts = localStorage.getItem(`mts_depts_${c.id}`);
      if (storedDepts) {
        const parsedDepts = JSON.parse(storedDepts);
        if (Array.isArray(parsedDepts) && parsedDepts.length > 0) {
          result.assignedDepartmentIds = parsedDepts;
        }
      }
    } catch {}

    return result;
  };

  // Initial Companies filtered by permanent deletion list and sample companies purge
  const [allCompanies, setAllCompanies] = useState<ClientCompany[]>(() => {
    const deletedIds = getDeletedCompanyIds();
    const customComps = getCustomCompanies();
    const combined = [...customComps, ...INITIAL_CLIENT_COMPANIES];
    return combined
      .filter(c => !deletedIds.includes(c.id))
      .map(applySubOverride);
  });

  // Persistent state initialization from sessionStorage
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem(STORAGE_AUTH_KEY) === 'true';
  });

  const [isMasterPortal, setIsMasterPortal] = useState<boolean>(() => {
    return sessionStorage.getItem(STORAGE_IS_MASTER_KEY) === 'true';
  });

  const [currentCompany, setCurrentCompany] = useState<ClientCompany>(() => {
    const deletedIds = getDeletedCompanyIds();
    const available = INITIAL_CLIENT_COMPANIES.filter(
      c => !deletedIds.includes(c.id)
    );
    return applySubOverride(available[0] || INITIAL_CLIENT_COMPANIES[0]);
  });

  const [currentUser, setCurrentUser] = useState<UserProfile>(() => {
    const storedUser = sessionStorage.getItem(STORAGE_USER_KEY);
    if (storedUser) {
      try {
        return JSON.parse(storedUser);
      } catch {
        return DEFAULT_CLIENT_USER;
      }
    }
    return DEFAULT_CLIENT_USER;
  });

  const [currentBranch, setCurrentBranch] = useState<Branch>(INITIAL_BRANCHES[0]);
  const [theme, setTheme] = useState<ThemePalette>(() => {
    const stored = sessionStorage.getItem('mts_theme');
    return (stored as ThemePalette) || 'royal-black-gold';
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Persistence and Session recovery logic
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        await setPersistence(auth, browserLocalPersistence);
      } catch (e) {
        console.warn('Auth persistence set failed:', e);
      }
    };
    initializeAuth();
  }, []);

  useEffect(() => {
    const recoverSession = async () => {
      const sessionId = localStorage.getItem(STORAGE_SESSION_ID_KEY);
      if (!sessionId) {
        setIsLoading(false);
        return;
      }

      try {
        const sessionDoc = await getDoc(doc(db, 'sessions', sessionId));
        if (sessionDoc.exists()) {
          const sessionData = sessionDoc.data();
          if (sessionData.status === 'ACTIVE') {
            setIsAuthenticated(true);
            setIsMasterPortal(sessionData.isMaster);
            
            // Reconstruct user profile
            const user: UserProfile = {
              id: sessionData.userId,
              email: sessionData.email,
              name: sessionData.name || (sessionData.isMaster ? 'Master Admin' : 'Client Admin'),
              role: sessionData.role,
              tenantId: sessionData.tenantId,
              companyId: sessionData.companyId,
              companyName: sessionData.companyName,
              branchId: sessionData.branchId || 'main',
              branchName: sessionData.branchName || 'Global HQ',
              isMaster: sessionData.isMaster,
              allowedCompanies: sessionData.allowedCompanies || []
            };
            setCurrentUser(user);

            // Sync with session storage for legacy components
            sessionStorage.setItem(STORAGE_AUTH_KEY, 'true');
            sessionStorage.setItem(STORAGE_IS_MASTER_KEY, sessionData.isMaster ? 'true' : 'false');
            sessionStorage.setItem(STORAGE_USER_KEY, JSON.stringify(user));

            if (!sessionData.isMaster && sessionData.companyId) {
              const matched = allCompanies.find(c => c.id === sessionData.companyId);
              if (matched) {
                setCurrentCompany(matched);
                setTheme(matched.theme || 'royal-black-gold');
              }
            }
            
            console.log('Restored ERP session from Firestore:', sessionId);
          } else {
            // Expired or locked session found in storage, clear it
            localStorage.removeItem(STORAGE_SESSION_ID_KEY);
          }
        } else {
          // Session ID exists in local but not in Firestore, clear it
          localStorage.removeItem(STORAGE_SESSION_ID_KEY);
        }
      } catch (err) {
        console.warn('Session recovery failed:', err);
      } finally {
        setIsLoading(false);
      }
    };

    recoverSession();
  }, [allCompanies]);

  // Firebase Auth sync
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user && isAuthenticated) {
        // Only logout if we lose Firebase Auth AND it's not a temporary transition
        // For now keep it simple: Firestore session is the source of truth
      }
    });
    return () => unsubscribe();
  }, [isAuthenticated]);

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

  useEffect(() => {
    try {
      const url = new URL(window.location.href);
      let changed = false;
      const compParam = url.searchParams.get('company');
      const tenantParam = url.searchParams.get('tenant');
      
      // Cleanup of path or params can be added here if needed for general normalization
      
      if (changed) {
        window.history.replaceState({}, '', url.toString());
      }
    } catch {
      // Ignore in non-browser environments
    }
  }, []);

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
    
    // Only auto-resolve if NOT authenticated yet, or to sync URL context
    if (!isAuthenticated) {
      if (resolved.company) {
        setCurrentCompany(resolved.company);
        setTheme(resolved.company.theme || 'corporate-blue');
      }
      return;
    }

    if (resolved.isMasterPortal && currentUser.isMaster) {
      setIsMasterPortal(true);
      sessionStorage.setItem(STORAGE_IS_MASTER_KEY, 'true');
    } else if (resolved.company && !currentUser.isMaster) {
      setIsMasterPortal(false);
      sessionStorage.setItem(STORAGE_IS_MASTER_KEY, 'false');
      setCurrentCompany(resolved.company);
      setTheme(resolved.company.theme || 'corporate-blue');
    }
  }, []);

  const updateCompanyBranding = async (
    companyId: string,
    branding: {
      themeMode?: ThemeMode;
      loginTemplateId?: LoginTemplateId;
      tableDensity?: TableDensity;
    }
  ): Promise<void> => {
    // 1. Update Firestore
    try {
      const companyDocRef = doc(db, 'companies', companyId);
      await setDoc(companyDocRef, branding, { merge: true });
    } catch (e) {
      console.warn('Firestore branding update error:', e);
    }

    // 2. Update memory state
    setAllCompanies(prev =>
      prev.map(c => {
        if (c.id === companyId) {
          return { ...c, ...branding };
        }
        return c;
      })
    );

    if (currentCompany.id === companyId) {
      setCurrentCompany(prev => ({ ...prev, ...branding }));
    }
  };

  const login = async (type: 'MASTER' | 'CLIENT' = 'CLIENT', companySlug?: string, role?: string) => {
    setIsAuthenticated(true);
    sessionStorage.setItem(STORAGE_AUTH_KEY, 'true');
    sessionStorage.removeItem(STORAGE_LOCK_NOTICE_KEY);
    
    // Ensure Firebase Auth is active (Anonymous fallback if not Google)
    let firebaseUser = auth.currentUser;
    if (!firebaseUser) {
      try {
        const cred = await signInAnonymously(auth);
        firebaseUser = cred.user;
      } catch (e) {
        console.warn('Anonymous sign-in failed:', e);
      }
    }

    const sessionId = `sess_${Math.random().toString(36).substr(2, 9)}_${Date.now()}`;
    localStorage.setItem(STORAGE_SESSION_ID_KEY, sessionId);

    try {
      localStorage.setItem(STORAGE_LAST_ACTIVITY_KEY, Date.now().toString());
    } catch {
      // Ignore quota issues
    }
    setSessionLockNotice(null);
    lastActivityRef.current = Date.now();
    lastThrottleRef.current = Date.now();
    setSecondsRemaining(300);

    let finalUser: UserProfile;

    if (type === 'MASTER') {
      setIsMasterPortal(true);
      finalUser = MASTER_USER;
      setCurrentUser(MASTER_USER);
      sessionStorage.setItem(STORAGE_IS_MASTER_KEY, 'true');
      sessionStorage.setItem(STORAGE_USER_KEY, JSON.stringify(MASTER_USER));
    } else {
      setIsMasterPortal(false);
      sessionStorage.setItem(STORAGE_IS_MASTER_KEY, 'false');
      const targetSlug = companySlug || currentCompany.slug;
      const matched = allCompanies.find(c => c.slug.toLowerCase() === targetSlug.toLowerCase()) || allCompanies[0];
      setCurrentCompany(matched);
      setTheme(matched.theme || 'corporate-blue');

      let updatedRole = role || 'CLIENT_ADMIN';
      finalUser = {
        ...DEFAULT_CLIENT_USER,
        tenantId: matched.tenantId,
        companyId: matched.id,
        companyName: matched.name,
        email: matched.adminEmail,
        name: matched.adminName,
        role: updatedRole as any,
        isMaster: false
      };
      setCurrentUser(finalUser);
      sessionStorage.setItem(STORAGE_USER_KEY, JSON.stringify(finalUser));
    }

    // Persist session to Firestore
    try {
      await setDoc(doc(db, 'sessions', sessionId), {
        sessionId,
        userId: firebaseUser?.uid || finalUser.id,
        email: finalUser.email,
        name: finalUser.name,
        role: finalUser.role,
        isMaster: finalUser.isMaster,
        tenantId: finalUser.tenantId,
        companyId: finalUser.companyId,
        companyName: finalUser.companyName,
        branchId: finalUser.branchId || 'main',
        branchName: finalUser.branchName || 'Global HQ',
        allowedCompanies: finalUser.allowedCompanies,
        createdAt: new Date().toISOString(),
        lastActiveAt: new Date().toISOString(),
        status: 'ACTIVE'
      });
    } catch (e) {
      console.warn('Failed to persist session to Firestore:', e);
    }
  };

  const logout = async (reason?: string) => {
    const sessionId = localStorage.getItem(STORAGE_SESSION_ID_KEY);
    if (sessionId) {
      try {
        await setDoc(doc(db, 'sessions', sessionId), { status: 'EXPIRED', lastActiveAt: new Date().toISOString() }, { merge: true });
      } catch {}
      localStorage.removeItem(STORAGE_SESSION_ID_KEY);
    }

    setIsAuthenticated(false);
    setIsMasterPortal(false);
    setCurrentUser(DEFAULT_CLIENT_USER);

    sessionStorage.removeItem(STORAGE_AUTH_KEY);
    sessionStorage.removeItem(STORAGE_USER_KEY);
    sessionStorage.removeItem(STORAGE_IS_MASTER_KEY);
    sessionStorage.removeItem(STORAGE_LOCK_NOTICE_KEY);

    localStorage.removeItem(STORAGE_LAST_ACTIVITY_KEY);
    localStorage.removeItem(STORAGE_AUTH_KEY);
    localStorage.removeItem('mts_is_master');
    localStorage.removeItem('mts_master_session');

    try {
      const url = new URL(window.location.href);
      url.searchParams.delete('company');
      url.searchParams.delete('module');
      url.searchParams.delete('subtab');
      url.searchParams.delete('master');
      url.searchParams.delete('portal');
      window.history.replaceState({}, '', url.pathname);
    } catch {}

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
      sessionStorage.setItem(STORAGE_IS_MASTER_KEY, 'false');
      setCurrentCompany(matched);
      setTheme(matched.theme || 'corporate-blue');
      const updatedUser: UserProfile = {
        ...currentUser,
        tenantId: matched.tenantId,
        companyId: matched.id,
        companyName: matched.name,
        email: matched.adminEmail,
        name: matched.adminName,
        isMaster: false
      };
      setCurrentUser(updatedUser);
      sessionStorage.setItem(STORAGE_USER_KEY, JSON.stringify(updatedUser));
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
      activeModules: newCompData.activeModules || ['Finance', 'Procurement', 'Inventory', 'Sales', 'HR', 'Reports'],
      assignedDepartmentIds: (newCompData.assignedDepartmentIds && newCompData.assignedDepartmentIds.length > 0)
        ? newCompData.assignedDepartmentIds
        : getDefaultDepartmentIdsForIndustry(newCompData.industry, newCompData.category),
      status: 'ACTIVE',
      createdAt: new Date().toISOString().split('T')[0],
      adminName: newCompData.adminName || 'Company Admin',
      adminEmail: newCompData.adminEmail || 'admin@company.pk',
      theme: newCompData.theme || 'royal-black-gold',
      // New Advanced Fields
      secpNumber: newCompData.secpNumber,
      entityType: newCompData.entityType,
      bankDetails: (newCompData as any).bankDetails || {
        bankName: (newCompData as any).bankName || 'HBL',
        accountTitle: (newCompData as any).accountTitle || newCompData.name || '',
        iban: (newCompData as any).iban || '',
      },
      logoUrl: newCompData.logoUrl,
      backgroundUrl: newCompData.backgroundUrl,
      themeMode: newCompData.themeMode || 'dark',
      loginTemplateId: newCompData.loginTemplateId || 'split'
    };

    // Save to custom companies in localStorage
    const custom = getCustomCompanies();
    custom.unshift(newCompany);
    localStorage.setItem('mts_custom_companies', JSON.stringify(custom));

    // Also persist to Firestore
    try {
      const cleanComp = sanitizeForFirestore(newCompany);
      setDoc(doc(db, 'companies', compId), cleanComp);
    } catch (e) {
      console.warn('Could not save company to Firestore:', e);
    }

    setAllCompanies(prev => [newCompany, ...prev]);
    return newCompany;
  };

  const updateCompanyDepartments = async (companyId: string, departmentIds: string[]): Promise<void> => {
    // 1. Save locally for instant persistence
    try {
      localStorage.setItem(`mts_depts_${companyId}`, JSON.stringify(departmentIds));
    } catch {}

    // 2. Persist to Firestore
    try {
      const companyDocRef = doc(db, 'companies', companyId);
      await setDoc(companyDocRef, { assignedDepartmentIds: departmentIds }, { merge: true });
    } catch (e) {
      console.warn('Firestore updateCompanyDepartments error:', e);
    }

    // 3. Update memory state
    setAllCompanies(prev =>
      prev.map(c => {
        if (c.id === companyId) {
          return { ...c, assignedDepartmentIds: departmentIds };
        }
        return c;
      })
    );

    if (currentCompany.id === companyId) {
      setCurrentCompany(prev => ({ ...prev, assignedDepartmentIds: departmentIds }));
    }
  };

  const permanentDeleteCompany = async (companyId: string, tenantId?: string): Promise<void> => {
    // 1. INSTANT Optimistic React state memory removal (< 5ms)
    setAllCompanies(prev => {
      const remaining = prev.filter(c => c.id !== companyId);
      if (currentCompany.id === companyId && remaining.length > 0) {
        setCurrentCompany(remaining[0]);
      }
      return remaining;
    });

    // 2. INSTANT LocalStorage purge
    try {
      const deleted = getDeletedCompanyIds();
      if (!deleted.includes(companyId)) {
        deleted.push(companyId);
        localStorage.setItem('mts_deleted_companies', JSON.stringify(deleted));
      }

      const custom = getCustomCompanies().filter(c => c.id !== companyId);
      localStorage.setItem('mts_custom_companies', JSON.stringify(custom));

      localStorage.removeItem(`mts_sub_${companyId}`);
      localStorage.removeItem(`mts_roles_${companyId}`);
      localStorage.removeItem(`mts_depts_${companyId}`);
      localStorage.removeItem(`mts_branches_${companyId}`);
    } catch (e) {
      console.warn('Storage purge error:', e);
    }

    // 3. Non-blocking parallel background Firestore deletion
    const delPromises = [deleteDoc(doc(db, 'companies', companyId))];
    if (tenantId) {
      delPromises.push(deleteDoc(doc(db, 'tenants', tenantId)));
    }
    Promise.all(delPromises).catch(e => {
      console.warn('Background Firestore deletion notice:', e);
    });
  };

  const updateCompanySubscription = async (
    companyId: string,
    data: {
      plan: string;
      cycle: string;
      status: 'ACTIVE' | 'SUSPENDED' | 'INACTIVE';
      expiresAt: string;
      daysRemaining: number;
      paymentMethod: string;
      amount: number;
      txnId: string;
      paymentStatus?: 'PAID' | 'PENDING' | 'OVERDUE' | 'TRIAL';
    }
  ): Promise<void> => {
    const payStatus = data.paymentStatus || (data.amount > 0 ? 'PAID' : (data.daysRemaining > 0 ? 'TRIAL' : 'PENDING'));

    // 1. Update in Firestore
    try {
      const companyDocRef = doc(db, 'companies', companyId);
      await setDoc(
        companyDocRef,
        {
          subscriptionPlan: data.plan,
          subscriptionCycle: data.cycle,
          status: data.status,
          subscriptionExpiresAt: data.expiresAt,
          trialDaysRemaining: data.daysRemaining,
          lastPaymentMethod: data.paymentMethod,
          lastPaymentAmount: data.amount,
          lastPaymentTxnId: data.txnId,
          lastPaymentDate: new Date().toISOString(),
          paymentStatus: payStatus
        },
        { merge: true }
      );

      if (currentCompany.tenantId) {
        const tenantCompRef = doc(db, 'tenants', currentCompany.tenantId, 'companies', companyId);
        await setDoc(
          tenantCompRef,
          {
            subscriptionPlan: data.plan,
            subscriptionCycle: data.cycle,
            status: data.status,
            subscriptionExpiresAt: data.expiresAt,
            trialDaysRemaining: data.daysRemaining,
            lastPaymentMethod: data.paymentMethod,
            lastPaymentAmount: data.amount,
            lastPaymentTxnId: data.txnId,
            lastPaymentDate: new Date().toISOString(),
            paymentStatus: payStatus
          },
          { merge: true }
        );
      }
    } catch (e) {
      console.warn('Firestore subscription update notice:', e);
    }

    // 2. Persist to localStorage override
    try {
      const payloadWithStatus = { ...data, paymentStatus: payStatus };
      localStorage.setItem(`mts_sub_${companyId}`, JSON.stringify(payloadWithStatus));
      const custom = getCustomCompanies();
      const idx = custom.findIndex(c => c.id === companyId);
      if (idx !== -1) {
        custom[idx] = {
          ...custom[idx],
          subscriptionPlan: data.plan,
          subscriptionCycle: data.cycle,
          status: data.status,
          subscriptionExpiresAt: data.expiresAt,
          trialDaysRemaining: data.daysRemaining,
          lastPaymentMethod: data.paymentMethod,
          lastPaymentAmount: data.amount,
          lastPaymentTxnId: data.txnId,
          lastPaymentDate: new Date().toISOString(),
          paymentStatus: payStatus
        };
        localStorage.setItem('mts_custom_companies', JSON.stringify(custom));
      }
    } catch (e) {
      console.warn('Storage subscription update notice:', e);
    }

    // 3. Update memory state
    setAllCompanies(prev =>
      prev.map(c =>
        c.id === companyId
          ? {
              ...c,
              subscriptionPlan: data.plan,
              subscriptionCycle: data.cycle,
              status: data.status,
              subscriptionExpiresAt: data.expiresAt,
              trialDaysRemaining: data.daysRemaining,
              lastPaymentMethod: data.paymentMethod,
              lastPaymentAmount: data.amount,
              lastPaymentTxnId: data.txnId,
              lastPaymentDate: new Date().toISOString(),
              paymentStatus: payStatus
            }
          : c
      )
    );

    if (currentCompany.id === companyId) {
      setCurrentCompany(prev => ({
        ...prev,
        subscriptionPlan: data.plan,
        subscriptionCycle: data.cycle,
        status: data.status,
        subscriptionExpiresAt: data.expiresAt,
        trialDaysRemaining: data.daysRemaining,
        lastPaymentMethod: data.paymentMethod,
        lastPaymentAmount: data.amount,
        lastPaymentTxnId: data.txnId,
        lastPaymentDate: new Date().toISOString(),
        paymentStatus: payStatus
      }));
    }
  };

  const updateCompanyCustomRoles = async (
    companyId: string,
    roles: { id: string; name: string; code: string; department?: string; permissions?: string[] }[]
  ): Promise<void> => {
    // 1. Save to localStorage
    try {
      localStorage.setItem(`mts_roles_${companyId}`, JSON.stringify(roles));
    } catch {}

    // 2. Persist to Firestore
    try {
      const companyDocRef = doc(db, 'companies', companyId);
      await setDoc(companyDocRef, { customRoles: roles }, { merge: true });
    } catch (e) {
      console.warn('Firestore roles sync note:', e);
    }

    // 3. Update state
    setAllCompanies(prev =>
      prev.map(c => (c.id === companyId ? { ...c, customRoles: roles } : c))
    );

    if (currentCompany.id === companyId) {
      setCurrentCompany(prev => ({ ...prev, customRoles: roles }));
    }
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
        updateCompanySubscription,
        updateCompanyCustomRoles,
        updateCompanyDepartments,
        updateCompanyBranding,
        login,
        logout,
        sessionLockNotice,
        clearSessionLockNotice,
        secondsRemaining,
        resetInactivityTimer,
        isLoading
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
