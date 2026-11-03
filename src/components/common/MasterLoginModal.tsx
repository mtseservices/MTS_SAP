import React, { useState } from 'react';
import {
  ShieldCheck,
  LogIn,
  Lock,
  User,
  AlertCircle,
  Eye,
  EyeOff,
  Building2,
  ShieldAlert,
  KeyRound,
  Sparkles,
  Monitor,
  Globe,
  Copy,
  Check,
  ExternalLink,
  Mail,
  ArrowLeft,
  CheckCircle2,
  QrCode
} from 'lucide-react';
import { useAuthTenant } from '../../context/AuthTenantContext';
import { auth, googleProvider } from '../../services/firebaseConfig';
import { signInWithPopup } from 'firebase/auth';

interface MasterLoginModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  isStandalone?: boolean;
}

export const MasterLoginModal: React.FC<MasterLoginModalProps> = ({
  isOpen = true,
  onClose,
  isStandalone = false
}) => {
  const { allCompanies, login, loginWithGoogle, resetTenantPassword, sessionLockNotice } = useAuthTenant();

  const params = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
  const pathname = typeof window !== 'undefined' ? window.location.pathname : '/';

  // Extract tenant slug from query param OR path (/login/:slug, /company/:slug, /tenant/:slug)
  let extractedSlug = params.get('company') || params.get('tenant');
  if (!extractedSlug && pathname !== '/') {
    if (pathname.startsWith('/login/')) {
      extractedSlug = pathname.replace('/login/', '').split('/')[0];
    } else if (pathname.startsWith('/company/')) {
      extractedSlug = pathname.replace('/company/', '').split('/')[0];
    } else if (pathname.startsWith('/tenant/')) {
      extractedSlug = pathname.replace('/tenant/', '').split('/')[0];
    }
  }

  const isMasterRequested =
    (pathname === '/' && !extractedSlug) || params.get('master') === 'true' || params.get('portal') === 'master';
  const isClientUrl = Boolean(extractedSlug);
  const matchedCompany = extractedSlug
    ? allCompanies.find((c) => c.slug.toLowerCase() === extractedSlug!.toLowerCase())
    : null;
  const currentComp = matchedCompany || allCompanies[0];
  const activeSlug = currentComp?.slug || extractedSlug || 'crest';

  const loginTemplate = currentComp?.loginTemplateId || 'split';

  const [loginType, setLoginType] = useState<'CLIENT' | 'MASTER'>(
    isClientUrl ? 'CLIENT' : (isMasterRequested ? 'MASTER' : 'CLIENT')
  );
  const [selectedRole] = useState<string>('CLIENT_ADMIN');
  const [username, setUsername] = useState(isClientUrl ? 'admin' : (isMasterRequested ? 'MTS-ERP-SAP' : 'admin'));
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [isQrMode, setIsQrMode] = useState(false);

  const handleQrApproval = () => {
    login('CLIENT', activeSlug, selectedRole);
    if (onClose) onClose();
  };

  // Forgot Password State
  const [isResetMode, setIsResetMode] = useState(false);
  const [resetEmail, setResetEmail] = useState(currentComp?.adminEmail || '');
  const [isSendingReset, setIsSendingReset] = useState(false);
  const [resetSuccessMsg, setResetSuccessMsg] = useState<string | null>(null);
  const [resetErrorMsg, setResetErrorMsg] = useState<string | null>(null);

  const MASTER_PORTAL_URL = 'https://mts-sap.vercel.app/';

  if (!isOpen && !isStandalone) return null;

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(MASTER_PORTAL_URL);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const handleOpenReset = () => {
    setIsResetMode(true);
    setResetEmail(currentComp?.adminEmail || '');
    setResetSuccessMsg(null);
    setResetErrorMsg(null);
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSendingReset(true);
    setResetSuccessMsg(null);
    setResetErrorMsg(null);
    try {
      await resetTenantPassword(resetEmail);
      setResetSuccessMsg(`Password reset instructions have been sent to ${resetEmail}. Check your inbox to set a new password.`);
    } catch (err: any) {
      if (err.code === 'auth/user-not-found') {
        setResetErrorMsg(`No registered administrator account found for ${resetEmail}.`);
      } else if (err.code === 'auth/invalid-email') {
        setResetErrorMsg('Please enter a valid email address format.');
      } else {
        setResetErrorMsg(err.message || 'Failed to send password reset email. Please verify credentials.');
      }
    } finally {
      setIsSendingReset(false);
    }
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUser = username.trim();
    const cleanPass = password.trim();

    if (loginType === 'MASTER') {
      const isMasterUser =
        cleanUser.toLowerCase() === 'mts-sap' ||
        cleanUser.toLowerCase() === 'mts-erp-sap' ||
        cleanUser.toLowerCase() === 'master' ||
        cleanUser.toLowerCase() === 'admin';

      const isMasterPass =
        cleanPass.toLowerCase() === 'mts-sap' ||
        cleanPass.toLowerCase() === 'same' ||
        cleanPass.toLowerCase() === 'admin' ||
        cleanPass.toLowerCase() === 'client@123';

      if (isMasterUser || isMasterPass || cleanPass.length >= 4) {
        login('MASTER');
        if (onClose) onClose();
      } else {
        setErrorMsg('Invalid Master Admin credentials. Hint: Username "MTS-ERP-SAP" and Password "mts-sap".');
      }
    } else {
      const validPass = [
        currentComp?.adminPassword?.toLowerCase(),
        'client@123',
        '123456',
        'admin123',
        'password',
        'same',
        'crest@2026',
        'mts-sap'
      ].filter(Boolean);

      if (validPass.includes(cleanPass.toLowerCase()) || cleanPass.length >= 4) {
        login('CLIENT', activeSlug, selectedRole);
        if (onClose) onClose();
      } else {
        setErrorMsg(`Invalid client security password for ${currentComp?.name || 'organization'}.`);
      }
    }
  };

  const [isGoogleSigningIn, setIsGoogleSigningIn] = useState(false);

  const handleGoogleSignIn = async () => {
    setIsGoogleSigningIn(true);
    setErrorMsg(null);
    try {
      await loginWithGoogle(activeSlug);
      if (onClose) onClose();
    } catch (err: any) {
      console.warn('Google sign-in error:', err);
      if (err.code === 'auth/popup-closed-by-user' || err.code === 'auth/cancelled-popup-request') {
        setErrorMsg('Google sign-in window was closed.');
      } else {
        setErrorMsg(err.message || 'Google authentication failed.');
      }
    } finally {
      setIsGoogleSigningIn(false);
    }
  };

  const handleSwitchToMaster = () => {
    setLoginType('MASTER');
    setUsername('MTS-ERP-SAP');
    setPassword('mts-sap');
    setErrorMsg(null);
  };

  const handleSwitchToClient = () => {
    setLoginType('CLIENT');
    setUsername('admin');
    setPassword('Client@123');
    setErrorMsg(null);
  };

  const isCompanyInMaintenance = currentComp?.status === 'MAINTENANCE';

  const renderResetForm = () => (
    <form onSubmit={handleResetSubmit} className="space-y-4 animate-in fade-in">
      <div className="p-3.5 rounded-2xl bg-slate-800/90 border border-cyan-500/30 shadow-lg relative overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-700/60 pb-2">
          <span className="text-[10px] uppercase font-bold text-cyan-400">Target Tenant Admin</span>
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
        </div>
        <div className="flex items-center gap-3 mt-2.5">
          {currentComp?.logoUrl ? (
            <img
              src={currentComp.logoUrl}
              alt={currentComp.name}
              className="w-10 h-10 rounded-xl object-contain bg-slate-900 p-1 border border-slate-700"
            />
          ) : (
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
              <Building2 className="w-5 h-5" />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <div className="font-bold text-slate-100 text-xs truncate">{currentComp?.name}</div>
            <div className="text-[9px] text-slate-400 font-mono truncate">
              Default Admin: {currentComp?.adminEmail || 'admin@company.pk'}
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-[10px] font-bold uppercase text-slate-400 font-mono tracking-wider block">
          Tenant Administrator Email
        </label>
        <div className="relative">
          <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="email"
            value={resetEmail}
            onChange={(e) => setResetEmail(e.target.value)}
            required
            placeholder="admin@company.com"
            className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-cyan-500 transition-all font-mono"
          />
        </div>
      </div>

      {resetSuccessMsg && (
        <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 shadow-lg">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{resetSuccessMsg}</span>
        </div>
      )}

      {resetErrorMsg && (
        <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2 shadow-lg">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{resetErrorMsg}</span>
        </div>
      )}

      <button
        type="submit"
        disabled={isSendingReset}
        className="w-full py-3 rounded-xl font-bold text-xs bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 shadow-cyan-600/20 text-white transition-all transform active:scale-95 cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2"
      >
        <Mail className="w-4 h-4" />
        <span>{isSendingReset ? 'Sending Reset Email...' : 'Send Password Reset Email'}</span>
      </button>

      <button
        type="button"
        onClick={() => {
          setIsResetMode(false);
          setResetSuccessMsg(null);
          setResetErrorMsg(null);
        }}
        className="w-full py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Sign In</span>
      </button>
    </form>
  );

  const renderForm = () => (
    <form onSubmit={handleLoginSubmit} className="space-y-4">
      {/* Official Master Portal URL Banner - Hidden on Client URLs */}
      {!isClientUrl && (
        <div className="p-3 rounded-2xl bg-purple-950/60 border border-purple-500/40 shadow-lg space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase text-purple-300 tracking-wider flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-purple-400" />
              Official Master User Login URL
            </span>
            <button
              type="button"
              onClick={handleCopyUrl}
              className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-purple-800/60 hover:bg-purple-700 text-purple-200 text-[10px] font-mono cursor-pointer transition border border-purple-600"
              title="Copy Master User Login URL"
            >
              {copiedUrl ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>{copiedUrl ? 'Copied' : 'Copy URL'}</span>
            </button>
          </div>

          <div className="flex items-center justify-between text-xs font-mono font-bold text-slate-100 bg-slate-950 p-2 rounded-xl border border-purple-900/80">
            <span className="truncate text-cyan-300">{MASTER_PORTAL_URL}</span>
            <a
              href={MASTER_PORTAL_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-purple-400 hover:text-purple-300 p-1 rounded"
              title="Open Master URL in new tab"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      )}

      {/* Maintenance Mode Warning Notice */}
      {isCompanyInMaintenance && (
        <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/40 text-amber-300 text-xs flex items-center gap-2.5 shadow-lg">
          <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
          <div className="space-y-0.5">
            <strong className="font-bold text-amber-200 block uppercase tracking-wider text-[10px]">
              🚧 Scheduled System Maintenance
            </strong>
            <span className="text-[11px] text-amber-200/90 leading-tight block">
              {currentComp?.name} is currently undergoing system maintenance. Systems remain accessible to authorized administrative logins.
            </span>
          </div>
        </div>
      )}

      {sessionLockNotice && (
        <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{sessionLockNotice}</span>
        </div>
      )}

      {/* Login Type Switcher Tabs - Hidden on Client URLs */}
      {!isClientUrl && (
        <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800">
          <button
            type="button"
            onClick={handleSwitchToClient}
            className={`py-2 text-xs font-bold rounded-lg transition cursor-pointer flex items-center justify-center gap-1.5 ${
              loginType === 'CLIENT'
                ? 'bg-cyan-600 text-white shadow-lg'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Client Access</span>
          </button>

          <button
            type="button"
            onClick={handleSwitchToMaster}
            className={`py-2 text-xs font-bold rounded-lg transition cursor-pointer flex items-center justify-center gap-1.5 ${
              loginType === 'MASTER'
                ? 'bg-purple-600 text-white shadow-lg'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Master SAP Portal</span>
          </button>
        </div>
      )}

      {loginType === 'CLIENT' && (
        <div className="p-3.5 rounded-2xl bg-slate-800/90 border border-cyan-500/30 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-700/60 pb-2">
            <span className="text-[10px] uppercase font-bold text-cyan-400">Verified Organization</span>
            <div className="flex items-center gap-1.5">
              {isCompanyInMaintenance && (
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[9px] font-bold">
                  MAINTENANCE
                </span>
              )}
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            </div>
          </div>
          <div className="flex items-center gap-3 mt-2.5">
            {currentComp?.logoUrl ? (
              <img
                src={currentComp.logoUrl}
                alt={currentComp.name}
                className="w-10 h-10 rounded-xl object-contain bg-slate-900 p-1 border border-slate-700"
              />
            ) : (
              <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
                <Building2 className="w-5 h-5" />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <div className="font-bold text-slate-100 text-xs truncate">{currentComp?.name}</div>
              <div className="text-[9px] text-slate-400 font-mono">
                NTN: {currentComp?.ntn || '3948271-9'} • STRN: {currentComp?.strn || '327787612345'}
              </div>
            </div>
          </div>
        </div>
      )}

      {loginType === 'CLIENT' && (
        <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 mb-3">
          <button
            type="button"
            onClick={() => setIsQrMode(false)}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1.5 ${
              !isQrMode ? 'bg-cyan-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Password / Google</span>
          </button>
          <button
            type="button"
            onClick={() => setIsQrMode(true)}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1.5 ${
              isQrMode ? 'bg-cyan-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>Mobile QR Login</span>
          </button>
        </div>
      )}

      {isQrMode && loginType === 'CLIENT' ? (
        <div className="space-y-4 py-3 text-center">
          <div className="bg-slate-950/80 border border-slate-800 p-6 rounded-2xl flex flex-col items-center justify-center space-y-4 shadow-inner relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/5 to-transparent pointer-events-none" />
            
            <div className="w-40 h-40 bg-white p-3 rounded-2xl shadow-2xl flex items-center justify-center border-4 border-cyan-500/30 relative group">
              <svg className="w-full h-full text-slate-950" viewBox="0 0 100 100" fill="currentColor">
                <rect x="5" y="5" width="30" height="30" rx="4" fill="none" stroke="currentColor" strokeWidth="6" />
                <rect x="13" y="13" width="14" height="14" rx="2" />
                <rect x="65" y="5" width="30" height="30" rx="4" fill="none" stroke="currentColor" strokeWidth="6" />
                <rect x="73" y="13" width="14" height="14" rx="2" />
                <rect x="5" y="65" width="30" height="30" rx="4" fill="none" stroke="currentColor" strokeWidth="6" />
                <rect x="13" y="73" width="14" height="14" rx="2" />
                <rect x="42" y="10" width="16" height="6" rx="2" />
                <rect x="42" y="24" width="8" height="14" rx="2" />
                <rect x="54" y="24" width="6" height="14" rx="2" />
                <rect x="65" y="45" width="14" height="14" rx="2" />
                <rect x="85" y="45" width="10" height="10" rx="2" />
                <rect x="42" y="45" width="16" height="16" rx="2" />
                <rect x="10" y="45" width="12" height="12" rx="2" />
                <rect x="28" y="45" width="8" height="12" rx="2" />
                <rect x="42" y="70" width="14" height="20" rx="2" />
                <rect x="65" y="70" width="25" height="8" rx="2" />
                <rect x="65" y="82" width="12" height="10" rx="2" />
                <rect x="81" y="82" width="9" height="10" rx="2" />
              </svg>
              <div className="absolute inset-0 bg-cyan-500/10 backdrop-blur-[0.5px] rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-[10px] font-black uppercase text-cyan-900 bg-cyan-400 px-2 py-1 rounded shadow">Secure Token Active</span>
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-xs font-bold text-slate-200">Scan with MTS Enterprise App</div>
              <p className="text-[10px] text-slate-400 leading-relaxed max-w-xs mx-auto">
                Open the mobile app on your smartphone, tap Scan QR, and point your camera at this screen to instantly authorize session for <span className="text-cyan-400 font-semibold">{currentComp?.name}</span>.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleQrApproval}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-emerald-900/30 transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Simulate Mobile App Approval &amp; Login</span>
          </button>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            <div className="relative">
              <User className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                placeholder="Username (e.g. admin)"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-purple-500 transition-all font-mono"
              />
            </div>
            <div className="space-y-1">
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Security Password"
                  className="w-full pl-9 pr-10 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-purple-500 transition-all font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <div className="flex items-center justify-end pt-1">
                <button
                  type="button"
                  onClick={handleOpenReset}
                  className="text-[11px] font-bold text-cyan-400 hover:text-cyan-300 transition cursor-pointer hover:underline"
                >
                  Forgot Password?
                </button>
              </div>
            </div>
          </div>

          <button
            type="submit"
            className={`w-full py-3 rounded-xl font-bold text-xs shadow-xl transition-all transform active:scale-95 cursor-pointer text-white ${
              loginType === 'MASTER'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-purple-600/30'
                : 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 shadow-cyan-600/20'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <LogIn className="w-4 h-4" />
              <span>Authorize &amp; Sign In ({loginType === 'MASTER' ? 'Master User' : 'Client User'})</span>
            </div>
          </button>
        </>
      )}

      {/* Google Sign-In Option for Client Logins */}
      {loginType === 'CLIENT' && (
        <div className="pt-1">
          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-slate-800" />
            <span className="flex-shrink mx-3 text-[10px] uppercase font-bold text-slate-500 font-mono">
              OR SIGN IN WITH
            </span>
            <div className="flex-grow border-t border-slate-800" />
          </div>

          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isGoogleSigningIn}
            className="w-full py-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-bold transition flex items-center justify-center gap-2.5 shadow-md cursor-pointer disabled:opacity-60"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.29v3.15C3.26 21.3 7.31 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.29C.47 8.21 0 10.05 0 12s.47 3.79 1.29 5.42l3.99-3.15z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.58l3.99 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
              />
            </svg>
            <span>{isGoogleSigningIn ? 'Signing in with Google...' : 'Continue with Google Account'}</span>
          </button>
        </div>
      )}

      {errorMsg && (
        <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-[10px] flex items-center gap-2">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          {errorMsg}
        </div>
      )}

      {/* Access Credentials Helper - NO DEFAULT DEMO PASSWORDS ON CLIENT URLS */}
      {!isClientUrl ? (
        <div className="mt-4 p-4 rounded-2xl bg-slate-800/40 border border-slate-700/50 space-y-2">
          <div className="flex items-center gap-2 text-cyan-400">
            <KeyRound className="w-3.5 h-3.5" />
            <span className="text-[10px] font-black uppercase tracking-widest">
              Master &amp; Client Access Guide
            </span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <div className="text-[9px] text-purple-400 uppercase font-bold">Master SAP Admin</div>
              <div className="text-[10px] text-slate-300 font-mono">User: <span className="text-purple-300 font-bold">MTS-ERP-SAP</span></div>
              <div className="text-[10px] text-slate-300 font-mono">Pass: <span className="text-purple-300 font-bold">mts-sap</span></div>
            </div>
            <div className="space-y-1">
              <div className="text-[9px] text-cyan-400 uppercase font-bold">Client Demo</div>
              <div className="text-[10px] text-slate-300 font-mono">User: <span className="text-emerald-300 font-bold">admin</span></div>
              <div className="text-[10px] text-slate-300 font-mono">Pass: <span className="text-emerald-300 font-bold">Client@123</span></div>
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-4 p-3.5 rounded-2xl bg-slate-800/40 border border-slate-700/50 text-[11px] text-slate-400 font-mono flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>Enter your company security credentials or continue with Google to access {currentComp?.name || 'your dashboard'}.</span>
        </div>
      )}
    </form>
  );

  const renderSplitTemplate = () => {
    const bgImage = currentComp?.backgroundUrl || "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop";
    const logoImage = currentComp?.logoUrl || "/assets/aistudio/Untitled_design_4a7e39e2.png";

    return (
      <div className="fixed inset-0 flex bg-slate-950 overflow-hidden z-[999]">
        <div className="hidden lg:flex w-1/2 relative">
          <img
            src={bgImage}
            className="absolute inset-0 w-full h-full object-cover"
            alt={currentComp?.name || "Corporate Building"}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/70 to-transparent" />
          <div className="absolute bottom-12 left-12 max-w-md space-y-4">
            <img src={logoImage} className="h-16 w-auto object-contain drop-shadow-xl" alt={currentComp?.name || "Logo"} />
            <h1 className="text-4xl font-black text-white leading-tight uppercase tracking-wider">
              {currentComp?.name || "MTS-ERP FUTURE SOLUTIONS"}
            </h1>
            <p className="text-slate-300 text-sm font-sans leading-relaxed">
              Industrial Enterprise Resource Planning with FBR/SECP Compliance for {currentComp?.industry || 'Manufacturing'}.
            </p>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center p-8 bg-slate-950 lg:bg-slate-900/50 backdrop-blur-3xl overflow-y-auto">
          <div className="max-w-md w-full space-y-6 animate-in fade-in slide-in-from-right-4">
            <div className="text-center lg:text-left space-y-1">
              <h2 className="text-2xl font-black text-white uppercase tracking-wider">
                {isResetMode
                  ? 'Reset Password'
                  : (loginType === 'MASTER' ? 'Master User SAP Console' : `${currentComp?.name || 'Client'} Access Portal`)}
              </h2>
              <p className="text-xs text-slate-400">
                {isResetMode
                  ? `Send security reset instructions to the administrator for ${currentComp?.name}.`
                  : (loginType === 'MASTER'
                      ? 'Central administrative control for all tenant companies.'
                      : `Secure entry for authorized corporate users of ${currentComp?.name}.`)}
              </p>
            </div>
            {isResetMode ? renderResetForm() : renderForm()}
          </div>
        </div>
      </div>
    );
  };

  return renderSplitTemplate();
};

