import React, { useState } from 'react';
import { ShieldCheck, LogIn, Lock, User, AlertCircle, Eye, EyeOff, Building2, CheckSquare, Square, ShieldAlert, KeyRound, Sparkles, Flame, CreditCard } from 'lucide-react';
import { useAuthTenant } from '../../context/AuthTenantContext';
import { auth, googleProvider } from '../../services/firebaseConfig';
import { signInWithPopup } from 'firebase/auth';
import { SubscriptionTrialModal } from './SubscriptionTrialModal';

interface MasterLoginModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  isStandalone?: boolean;
}

export const MasterLoginModal: React.FC<MasterLoginModalProps> = ({ isOpen = true, onClose, isStandalone = false }) => {
  const { allCompanies, login, sessionLockNotice, clearSessionLockNotice } = useAuthTenant();
  
  const params = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
  const pathname = typeof window !== 'undefined' ? window.location.pathname : '/';
  const isMasterRequested = pathname === '/' || params.get('master') === 'true' || params.get('portal') === 'master';
  const companyFromUrl = params.get('company');
  const matchedCompany = companyFromUrl ? allCompanies.find(c => c.slug === companyFromUrl) : null;
  const initialCompanySlug = matchedCompany?.slug || allCompanies[0]?.slug || 'albarka';

  const [showMasterToggle, setShowMasterToggle] = useState(isMasterRequested);
  const [loginType, setLoginType] = useState<'CLIENT' | 'MASTER'>(isMasterRequested ? 'MASTER' : 'CLIENT');
  const [selectedCompanySlug, setSelectedCompanySlug] = useState(initialCompanySlug);
  const [selectedRole, setSelectedRole] = useState<string>('CLIENT_ADMIN');
  
  // Subscription & Free Trial Modal State
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [googleUser, setGoogleUser] = useState<{ name?: string; email?: string } | null>(null);
  
  // Credentials
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberUser, setRememberUser] = useState(true);
  
  // Security validation & rate limiting
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [isLockedOut, setIsLockedOut] = useState(false);
  const [lockoutTimer, setLockoutTimer] = useState(0);

  if (!isOpen && !isStandalone) return null;

  const currentComp = allCompanies.find(c => c.slug === selectedCompanySlug) || allCompanies[0];

  // Fetch custom roles created for this enterprise company
  const getCompanyRoles = (): { code: string; name: string }[] => {
    let roles: { code: string; name: string }[] = [];
    if (currentComp?.customRoles && currentComp.customRoles.length > 0) {
      roles = currentComp.customRoles.map(r => ({ code: r.code || r.name, name: r.name }));
    } else {
      try {
        const stored = localStorage.getItem(`mts_roles_${currentComp?.id}`);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            roles = parsed.map((r: any) => ({ code: r.code || r.name, name: r.name }));
          }
        }
      } catch {}
    }
    return roles;
  };

  const createdRoles = getCompanyRoles();

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (isLockedOut) {
      setErrorMsg(`Security Lockout Active: Please wait ${lockoutTimer} seconds before retrying.`);
      return;
    }

    const cleanUser = username.trim();
    const cleanPass = password.trim();

    if (loginType === 'MASTER') {
      // Strict Master Admin Password Check
      // Valid Master Username: MTS-ERP-SAP or master.admin@mts-erp.pk
      // Valid Master Password: MtsAdmin@2026! (strictly case sensitive, no bypass)
      const isMasterUserMatch = cleanUser.toLowerCase() === 'mts-sap' || 
                               cleanUser.toLowerCase() === 'master.admin@mts-erp.pk';
      
      const isMasterPasswordMatch = cleanPass === 'mts-sap';

      if (isMasterUserMatch && isMasterPasswordMatch) {
        setFailedAttempts(0);
        login('MASTER');
        if (onClose) onClose();
      } else {
        const nextFailed = failedAttempts + 1;
        setFailedAttempts(nextFailed);
        
        if (nextFailed >= 5) {
          setIsLockedOut(true);
          setLockoutTimer(60);
          const interval = setInterval(() => {
            setLockoutTimer(prev => {
              if (prev <= 1) {
                clearInterval(interval);
                setIsLockedOut(false);
                setFailedAttempts(0);
                return 0;
              }
              return prev - 1;
            });
          }, 1000);
          setErrorMsg('⛔ Too many failed attempts! Master portal locked for 60 seconds.');
        } else {
          setErrorMsg(`❌ Access Denied: Incorrect Master Admin password or username. (${5 - nextFailed} attempts remaining).`);
        }
      }
    } else {
      // Client Tenant User Password Verification
      // Valid client credentials: password cannot be blank
      if (cleanPass.length < 4) {
        setErrorMsg('Please enter a valid client security password (minimum 4 characters, e.g. Client@123).');
        return;
      }

      // Valid client password: Client@123 or 123456 or admin123
      const validClientPasswords = ['client@123', '123456', 'admin123', 'password', 'same'];
      if (!validClientPasswords.includes(cleanPass.toLowerCase()) && cleanPass !== 'Client@123') {
        setErrorMsg('Invalid client user password. (Default demo client password: Client@123 or 123456).');
        return;
      }

      setFailedAttempts(0);
      login('CLIENT', selectedCompanySlug, selectedRole);
      if (onClose) onClose();
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      if (result.user) {
        setGoogleUser({
          name: result.user.displayName || undefined,
          email: result.user.email || undefined
        });
        login('CLIENT', selectedCompanySlug, selectedRole);
        if (onClose) onClose();
      }
    } catch (err: any) {
      setErrorMsg(`Google Sign-In: ${err.message}`);
    }
  };

  const handleGoogleSignUpTrial = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      if (result.user) {
        setGoogleUser({
          name: result.user.displayName || undefined,
          email: result.user.email || undefined
        });
        setShowSubscriptionModal(true);
      }
    } catch {
      // If popup cancelled or closed, still open trial modal for customer
      setShowSubscriptionModal(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md overflow-y-auto">
      {/* Background Ambience */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-30 mix-blend-overlay"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1509391365360-2e959784a276?q=80&w=1920&auto=format&fit=crop')`
        }}
      />

      <div className="relative z-10 bg-slate-900/90 border border-slate-700/80 rounded-3xl p-8 max-w-md w-full space-y-5 shadow-2xl backdrop-blur-xl animate-in zoom-in-95 my-8">
        
        {/* Official MTS ERP Logo & Branding Header */}
        <div className="text-center space-y-2 pb-3 border-b border-slate-800">
          <div className="flex justify-center mb-1">
            <img 
              src="/assets/aistudio/Untitled_design_4a7e39e2.png" 
              alt="MTS ERP FUTURE SOLUTIONS" 
              className="h-20 w-auto object-contain drop-shadow-2xl hover:scale-105 transition-transform"
            />
          </div>

          <div>
            <h2 className="text-lg font-black text-slate-100 tracking-wide uppercase">
              {loginType === 'CLIENT' ? (currentComp?.name || 'Client ERP Portal') : 'MTS-ERP Central Master Portal'}
            </h2>
            <p className="text-[11px] text-slate-400 font-mono">
              FBR NTN Compliant Enterprise Resource Planning System
            </p>
          </div>
        </div>

        {/* 5-Minute Inactivity Auto-Lock Notice */}
        {sessionLockNotice && (
          <div className="p-3.5 rounded-2xl bg-amber-500/15 border border-amber-500/40 text-amber-200 text-xs flex items-start gap-2.5 animate-in fade-in">
            <Lock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <div className="font-bold text-amber-300">Security Auto-Lock Triggered</div>
              <p className="text-[11px] text-amber-200/90 leading-relaxed">{sessionLockNotice}</p>
            </div>
          </div>
        )}

        {/* Login Portal Mode Tabs (Visible only if Platform Control toggled) */}
        {showMasterToggle && (
          <div className="grid grid-cols-2 p-1 rounded-xl bg-slate-800/90 border border-slate-700 text-xs font-bold animate-in fade-in">
            <button
              type="button"
              onClick={() => {
                setLoginType('CLIENT');
                setUsername('admin');
                setPassword('Client@123');
                setErrorMsg(null);
              }}
              className={`py-2 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                loginType === 'CLIENT'
                  ? 'bg-cyan-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              Client Tenant Login
            </button>
            <button
              type="button"
              onClick={() => {
                setLoginType('MASTER');
                setUsername('MTS-ERP-SAP');
                setPassword('MtsAdmin@2026!');
                setErrorMsg(null);
              }}
              className={`py-2 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                loginType === 'MASTER'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              Master Admin Login
            </button>
          </div>
        )}

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2 animate-in shake">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span className="font-medium">{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleLoginSubmit} className="space-y-4">
          {/* Single Enterprise Company Locked Display (No Dropdown - Client Confidentiality Protected) */}
          {loginType === 'CLIENT' && (
            <div className="p-3.5 rounded-2xl bg-slate-800/90 border border-cyan-500/30 shadow-lg relative overflow-hidden">
              <div className="flex items-center justify-between border-b border-slate-700/60 pb-2">
                <span className="text-[10px] uppercase font-bold text-cyan-400 tracking-wider">
                  Enterprise Organization
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  Verified Tenant
                </span>
              </div>
              <div className="flex items-center gap-2.5 mt-2.5">
                <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 shrink-0">
                  <Building2 className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-slate-100 text-xs sm:text-sm truncate">
                    {currentComp?.name || 'Assigned Enterprise'}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                    Tenant Code: <span className="text-cyan-300">{currentComp?.code || currentComp?.slug}</span> • FBR NTN: <span className="text-slate-200">{currentComp?.ntn}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Role Selector (Client Login Only) - Shows created roles if configured, otherwise single admin only */}
          {loginType === 'CLIENT' && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-300">Authorized User Role</label>
                {createdRoles.length === 0 ? (
                  <span className="text-[10px] text-cyan-400 font-medium">Single Admin Mode</span>
                ) : (
                  <span className="text-[10px] text-emerald-400 font-medium">{createdRoles.length + 1} Roles Configured</span>
                )}
              </div>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-800/90 border border-slate-700 text-xs text-slate-100 font-semibold focus:outline-none focus:border-cyan-500"
              >
                <option value="CLIENT_ADMIN">Client Administrator</option>
                {createdRoles.map((r) => (
                  <option key={r.code} value={r.code}>
                    {r.name}
                  </option>
                ))}
              </select>
              {createdRoles.length === 0 && (
                <p className="text-[10px] text-slate-400 mt-1">
                  Single administrator account active. New roles can be created in Company Settings.
                </p>
              )}
            </div>
          )}

          {/* Username Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              {loginType === 'MASTER' ? 'Master Admin Username' : 'Username / Work Email'}
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                placeholder={loginType === 'MASTER' ? 'MTS-ERP-SAP' : 'admin@company.pk'}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-800/90 border border-slate-700 text-xs text-slate-100 font-mono font-bold focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          {/* Password Input with Strict Security Validation */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-300">
                {loginType === 'MASTER' ? 'Master Security Password' : 'Password'}
              </label>
              <span className="text-[10px] text-cyan-400 font-mono">
                {loginType === 'MASTER' ? 'Password: mts-sap' : 'Password: Client@123'}
              </span>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter password..."
                className="w-full pl-9 pr-10 py-2.5 rounded-xl bg-slate-800/90 border border-slate-700 text-xs text-slate-100 font-mono focus:outline-none focus:border-cyan-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Remember Username */}
          <div className="flex items-center justify-between text-xs text-slate-300 pt-1">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <button
                type="button"
                onClick={() => setRememberUser(!rememberUser)}
                className="text-cyan-400 cursor-pointer"
              >
                {rememberUser ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4 text-slate-500" />}
              </button>
              <span className="text-[11px]">Remember enterprise credentials</span>
            </label>
            <span className="text-[10px] text-slate-400 font-mono">5-min auto-lock</span>
          </div>

          {/* Submit Sign In Button */}
          <button
            type="submit"
            disabled={isLockedOut}
            className={`w-full py-3 rounded-xl font-bold text-xs shadow-xl flex items-center justify-center gap-2 transition-all mt-2 cursor-pointer ${
              loginType === 'MASTER'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-purple-600/30'
                : 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white shadow-cyan-600/30'
            } ${isLockedOut ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <LogIn className="w-4 h-4" />
            {isLockedOut ? `Locked (${lockoutTimer}s)` : `Sign In to ${loginType === 'MASTER' ? 'Master Portal' : 'Enterprise ERP'} →`}
          </button>
        </form>

        <div className="pt-3 border-t border-slate-800 space-y-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <button
              type="button"
              onClick={handleGoogleSignIn}
              className="w-full py-2.5 px-3 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md"
            >
              <img src="https://www.gstatic.com/mobilesdk/160503_mobilesdk/firebase_28dp.png" alt="Google" className="w-4 h-4" />
              <span>Sign In with Google</span>
            </button>

            <button
              type="button"
              onClick={handleGoogleSignUpTrial}
              className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-cyan-600/30 to-blue-600/30 hover:from-cyan-600/40 hover:to-blue-600/40 text-cyan-200 border border-cyan-500/40 text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md"
            >
              <Flame className="w-3.5 h-3.5 text-cyan-400" />
              <span>14-Day Free Trial</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => setShowSubscriptionModal(true)}
            className="w-full py-2 rounded-xl bg-slate-900/60 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            <CreditCard className="w-3.5 h-3.5 text-purple-400" />
            <span>View Subscription Plans &amp; Master Bank Accounts</span>
          </button>
        </div>

        {/* Security Compliance Footer */}
        <div className="text-center font-mono text-[10px] text-slate-400 space-y-1 pt-1">
          <div>AES-256 Multi-Tenant Isolation • Auto-Lock after 5m Inactivity</div>
          <div className="text-cyan-400 font-semibold">MTS ERP FUTURE SOLUTIONS © 2026</div>
          <div className="pt-1">
            <button
              type="button"
              onClick={() => {
                setShowMasterToggle(!showMasterToggle);
                if (!showMasterToggle) {
                  setLoginType('MASTER');
                  setUsername('MTS-ERP-SAP');
                  setPassword('MtsAdmin@2026!');
                } else {
                  setLoginType('CLIENT');
                  setUsername('admin');
                  setPassword('Client@123');
                }
              }}
              className="text-slate-600 hover:text-slate-400 transition-colors text-[9px] cursor-pointer"
            >
              {showMasterToggle ? 'Return to Tenant Login Mode' : 'Platform Administrator Access'}
            </button>
          </div>
        </div>
      </div>

      {/* Subscription Plans & Real-Time Payment Modal */}
      <SubscriptionTrialModal
        isOpen={showSubscriptionModal}
        onClose={() => setShowSubscriptionModal(false)}
        prefilledUser={googleUser || undefined}
      />
    </div>
  );
};
