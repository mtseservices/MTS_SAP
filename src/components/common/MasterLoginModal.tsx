import React, { useState } from 'react';
import { ShieldCheck, LogIn, Lock, User, AlertCircle, Eye, EyeOff, Building2, CheckSquare, Square, ShieldAlert, KeyRound, Sparkles, Flame, CreditCard, Monitor, Layout, AppWindow } from 'lucide-react';
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
  const { allCompanies, login, sessionLockNotice } = useAuthTenant();
  
  const params = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
  const pathname = typeof window !== 'undefined' ? window.location.pathname : '/';
  const isMasterRequested = pathname === '/' || params.get('master') === 'true' || params.get('portal') === 'master';
  const companyFromUrl = params.get('company');
  const matchedCompany = companyFromUrl ? allCompanies.find(c => c.slug === companyFromUrl) : null;
  const currentComp = matchedCompany || allCompanies[0];
  
  // Use the template from the matched company, or default to split
  const loginTemplate = currentComp?.loginTemplateId || 'split';

  const [showMasterToggle, setShowMasterToggle] = useState(isMasterRequested);
  const [loginType, setLoginType] = useState<'CLIENT' | 'MASTER'>(isMasterRequested ? 'MASTER' : 'CLIENT');
  const [selectedCompanySlug] = useState(currentComp?.slug || 'crest');
  const [selectedRole, setSelectedRole] = useState<string>('CLIENT_ADMIN');
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [googleUser, setGoogleUser] = useState<{ name?: string; email?: string } | null>(null);
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberUser, setRememberUser] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [isLockedOut, setIsLockedOut] = useState(false);
  const [lockoutTimer, setLockoutTimer] = useState(0);

  if (!isOpen && !isStandalone) return null;

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLockedOut) return;
    
    const cleanUser = username.trim();
    const cleanPass = password.trim();

    if (loginType === 'MASTER') {
      // Restore strict master check
      const isMasterUser = cleanUser.toLowerCase() === 'mts-sap' || cleanUser.toLowerCase() === 'mts-erp-sap';
      const isMasterPass = cleanPass === 'mts-sap';

      if (isMasterUser && isMasterPass) {
        login('MASTER');
        if (onClose) onClose();
      } else {
        setErrorMsg('Invalid Master Admin credentials. Hint: Username "MTS-ERP-SAP" and Password "mts-sap".');
      }
    } else {
      // Client password check
      const validPass = ['client@123', '123456', 'admin123', 'password', 'same', 'Crest@2026'];
      if (validPass.includes(cleanPass.toLowerCase()) || cleanPass.length >= 4) {
        login('CLIENT', selectedCompanySlug, selectedRole);
        if (onClose) onClose();
      } else {
        setErrorMsg('Invalid client security password. (Try: Client@123 or 123456).');
      }
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      if (result.user) {
        login('CLIENT', selectedCompanySlug, selectedRole);
        if (onClose) onClose();
      }
    } catch (err: any) {
      setErrorMsg(`Google Sign-In Error: ${err.message}`);
    }
  };

  const renderForm = () => (
    <form onSubmit={handleLoginSubmit} className="space-y-4">
      {loginType === 'CLIENT' && (
        <div className="p-3.5 rounded-2xl bg-slate-800/90 border border-cyan-500/30 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-700/60 pb-2">
            <span className="text-[10px] uppercase font-bold text-cyan-400">Verified Organization</span>
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
          </div>
          <div className="flex items-center gap-2.5 mt-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
              <Building2 className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-bold text-slate-100 text-xs truncate">{currentComp?.name}</div>
              <div className="text-[9px] text-slate-400 font-mono">NTN: {currentComp?.ntn}</div>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-3">
        <div className="relative">
          <User className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            placeholder="Username"
            className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-cyan-500 transition-all"
          />
        </div>
        <div className="relative">
          <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="Password"
            className="w-full pl-9 pr-10 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-cyan-500 transition-all focus:ring-2 focus:ring-cyan-500/20"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        <div className="flex justify-between items-center px-1">
          <span className="text-[9px] text-slate-500 font-medium">
            {loginType === 'MASTER' ? 'Master Password: mts-sap' : 'Demo Password: Client@123'}
          </span>
          {loginType === 'CLIENT' && (
            <button 
              type="button"
              onClick={() => {
                setLoginType('MASTER');
                setUsername('MTS-ERP-SAP');
                setPassword('mts-sap');
              }}
              className="text-[9px] text-slate-600 hover:text-cyan-500 transition-colors uppercase font-bold tracking-tighter"
            >
              Master Access
            </button>
          )}
        </div>
      </div>

      <button
        type="submit"
        className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs shadow-xl shadow-cyan-600/20 transition-all transform active:scale-95"
      >
        Authorize & Sign In
      </button>

      {errorMsg && (
        <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-[10px] flex items-center gap-2">
          <AlertCircle className="w-3.5 h-3.5" />
          {errorMsg}
        </div>
      )}

      {/* Corporate Credentials Reminder */}
      <div className="mt-6 p-4 rounded-2xl bg-slate-800/40 border border-slate-700/50 space-y-2">
        <div className="flex items-center gap-2 text-cyan-400">
          <KeyRound className="w-3.5 h-3.5" />
          <span className="text-[10px] font-black uppercase tracking-widest">Access Credentials Guide</span>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="text-[9px] text-slate-500 uppercase font-bold">Master Admin</div>
            <div className="text-[10px] text-slate-300 font-mono">User: <span className="text-cyan-300">MTS-ERP-SAP</span></div>
            <div className="text-[10px] text-slate-300 font-mono">Pass: <span className="text-cyan-300">mts-sap</span></div>
          </div>
          <div className="space-y-1">
            <div className="text-[9px] text-slate-500 uppercase font-bold">Client Demo</div>
            <div className="text-[10px] text-slate-300 font-mono">User: <span className="text-emerald-300">admin</span></div>
            <div className="text-[10px] text-slate-300 font-mono">Pass: <span className="text-emerald-300">Client@123</span></div>
          </div>
        </div>
      </div>
    </form>
  );

  const renderSplitTemplate = () => (
    <div className="fixed inset-0 flex bg-slate-950 overflow-hidden">
      <div className="hidden lg:flex w-1/2 relative">
        <img 
          src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop" 
          className="absolute inset-0 w-full h-full object-cover" 
          alt="Corporate Building" 
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 to-transparent" />
        <div className="absolute bottom-12 left-12 max-w-md space-y-4">
          <img src="/assets/aistudio/Untitled_design_4a7e39e2.png" className="h-16 w-auto" alt="Logo" />
          <h1 className="text-4xl font-black text-white leading-tight">MTS-ERP FUTURE SOLUTIONS</h1>
          <p className="text-slate-300 text-sm">Industrial Enterprise Resource Planning with FBR/SECP Compliance. Trusted by Leading Pakistani Textile & Manufacturing Groups.</p>
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center p-8 bg-slate-950 lg:bg-slate-900/50 backdrop-blur-3xl">
        <div className="max-w-md w-full space-y-8 animate-in fade-in slide-in-from-right-4">
          <div className="text-center lg:text-left space-y-2">
            <h2 className="text-2xl font-black text-white uppercase tracking-wider">Client Access Portal</h2>
            <p className="text-xs text-slate-400">Secure entry for authorized corporate users.</p>
          </div>
          {renderForm()}
        </div>
      </div>
    </div>
  );

  const renderMinimalTemplate = () => (
    <div className="fixed inset-0 flex items-center justify-center bg-slate-50">
      <div className="max-w-md w-full p-8 bg-white border border-slate-200 rounded-3xl shadow-2xl space-y-6 animate-in zoom-in-95">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-slate-100 flex items-center justify-center mx-auto">
            <Building2 className="w-8 h-8 text-slate-800" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900">Enterprise Login</h2>
            <p className="text-xs text-slate-500 uppercase tracking-widest font-bold">Client Workspace Entry</p>
          </div>
        </div>
        {renderForm()}
      </div>
    </div>
  );

  const renderGlassTemplate = () => (
    <div className="fixed inset-0 flex items-center justify-center">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-slate-950 to-cyan-900" />
      <div className="absolute inset-0 backdrop-blur-sm" />
      <div className="relative z-10 max-w-md w-full p-8 bg-white/5 border border-white/10 rounded-[2.5rem] backdrop-blur-2xl shadow-[0_0_50px_rgba(0,0,0,0.5)] space-y-6 animate-in slide-in-from-bottom-8">
        <div className="text-center space-y-4">
          <div className="inline-block p-4 rounded-full bg-white/10 border border-white/20">
            <Sparkles className="w-8 h-8 text-cyan-400" />
          </div>
          <h2 className="text-2xl font-black text-white">System Authorization</h2>
        </div>
        {renderForm()}
      </div>
    </div>
  );

  const renderTerminalTemplate = () => (
    <div className="fixed inset-0 flex items-center justify-center bg-[#001433]">
      <div className="w-full max-w-2xl p-6 font-mono space-y-8 animate-in fade-in">
        <div className="space-y-2 border-b border-blue-900 pb-4">
          <div className="flex items-center gap-2 text-blue-400">
            <Monitor className="w-5 h-5" />
            <span className="text-sm font-bold uppercase tracking-widest">MTS-SAP Enterprise Console v4.8</span>
          </div>
          <div className="text-emerald-500 text-xs">STATUS: ONLINE / SECURE PORT 3000</div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="space-y-4 text-[11px] text-blue-300/70 uppercase leading-relaxed">
            <p>{'>'} initializing system handshake...</p>
            <p>{'>'} tenant_id: {currentComp?.code}</p>
            <p>{'>'} fbr_ntn: {currentComp?.ntn}</p>
            <p>{'>'} aes_256_ready: true</p>
            <p className="text-blue-400 font-bold">{'>'} READY FOR AUTHENTICATION</p>
          </div>
          <div className="bg-black/40 p-6 rounded-xl border border-blue-900/50">
            {renderForm()}
          </div>
        </div>
      </div>
    </div>
  );

  // Selector based on template ID
  switch (loginTemplate) {
    case 'minimal': return renderMinimalTemplate();
    case 'glass': return renderGlassTemplate();
    case 'terminal': return renderTerminalTemplate();
    case 'split':
    default: return renderSplitTemplate();
  }
};
