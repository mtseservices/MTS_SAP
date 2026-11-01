import React, { useState } from 'react';
import { ShieldCheck, LogIn, Lock, User, AlertCircle, Eye, EyeOff, Building2, CheckSquare, Square } from 'lucide-react';
import { useAuthTenant } from '../../context/AuthTenantContext';
import { auth, googleProvider } from '../../services/firebaseConfig';
import { signInWithPopup } from 'firebase/auth';

interface MasterLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MasterLoginModal: React.FC<MasterLoginModalProps> = ({ isOpen, onClose }) => {
  const { switchTenantBySlug, setCurrentUser, allCompanies } = useAuthTenant();
  const [username, setUsername] = useState('ACC_MGR');
  const [password, setPassword] = useState('PASSWORD');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberUser, setRememberUser] = useState(true);
  const [loginType, setLoginType] = useState<'MASTER' | 'CLIENT'>('CLIENT');
  const [selectedCompanySlug, setSelectedCompanySlug] = useState(allCompanies[0]?.slug || 'albarka');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentComp = allCompanies.find(c => c.slug === selectedCompanySlug) || allCompanies[0];

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (loginType === 'MASTER') {
      const cleanUser = username.trim();
      const cleanPass = password.trim();

      if (
        (cleanUser === 'MTS-ERP-SAP' || cleanUser.toLowerCase() === 'mts-erp-sap') &&
        (cleanPass === 'Same' || cleanPass.toLowerCase() === 'same' || cleanPass === 'MTS-ERP-SAP')
      ) {
        switchTenantBySlug('master');
        onClose();
      } else {
        setErrorMsg('Invalid Master credentials. Username: "MTS-ERP-SAP", Password: "Same".');
      }
    } else {
      switchTenantBySlug(selectedCompanySlug);
      onClose();
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      if (result.user) {
        setCurrentUser(prev => ({
          ...prev,
          name: result.user.displayName || 'Authenticated User',
          email: result.user.email || 'user@mts-erp.pk'
        }));
        onClose();
      }
    } catch (err: any) {
      setErrorMsg(`Google Sign-In: ${err.message}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md overflow-y-auto">
      {/* Scenic Backdrop Layer matching Screenshot 4 */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-40 mix-blend-overlay"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1509391365360-2e959784a276?q=80&w=1920&auto=format&fit=crop')`
        }}
      />

      <div className="relative z-10 bg-slate-900/85 border border-slate-700/80 rounded-3xl p-8 max-w-md w-full space-y-6 shadow-2xl backdrop-blur-xl animate-in zoom-in-95 my-8">
        
        {/* Company Logo & Title Header matching Screenshot 4 */}
        <div className="text-center space-y-3 pb-2 border-b border-slate-800/80">
          <div className="w-20 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-500 to-cyan-500 mx-auto flex items-center justify-center font-black text-white text-2xl shadow-xl shadow-orange-500/20 p-2">
            {currentComp.name.charAt(0)}
          </div>

          <div>
            <h2 className="text-xl font-black text-slate-100 tracking-wide">
              {loginType === 'CLIENT' ? currentComp.name : 'MTS-ERP Central Master'}
            </h2>
            <p className="text-xs font-mono text-cyan-400 font-semibold mt-0.5">
              https://{currentComp.slug}.erp.mts.pk
            </p>
          </div>
        </div>

        {/* Login Mode Selector */}
        <div className="grid grid-cols-2 p-1 rounded-xl bg-slate-800/90 border border-slate-700 text-xs font-bold">
          <button
            type="button"
            onClick={() => {
              setLoginType('CLIENT');
              setUsername('ACC_MGR');
            }}
            className={`py-2 rounded-lg transition-all ${
              loginType === 'CLIENT'
                ? 'bg-cyan-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Client Tenant User
          </button>
          <button
            type="button"
            onClick={() => {
              setLoginType('MASTER');
              setUsername('MTS-ERP-SAP');
            }}
            className={`py-2 rounded-lg transition-all ${
              loginType === 'MASTER'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Master Admin
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleLoginSubmit} className="space-y-4">
          {loginType === 'CLIENT' && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Select Enterprise Company</label>
              <div className="relative">
                <Building2 className="w-4 h-4 text-cyan-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <select
                  value={selectedCompanySlug}
                  onChange={(e) => setSelectedCompanySlug(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-800/90 border border-slate-700 text-xs text-slate-100 font-semibold focus:outline-none focus:border-cyan-500"
                >
                  {allCompanies.map((c) => (
                    <option key={c.id} value={c.slug}>
                      {c.name} ({c.slug}.erp.mts.pk)
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Username Input matching Screenshot 4 */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Username / User ID</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                placeholder="ACC_MGR"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-800/90 border border-slate-700 text-xs text-slate-100 font-mono font-bold uppercase tracking-wider focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          {/* Password Input with eye toggle matching Screenshot 4 */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="PASSWORD"
                className="w-full pl-9 pr-10 py-2.5 rounded-xl bg-slate-800/90 border border-slate-700 text-xs text-slate-100 font-mono focus:outline-none focus:border-cyan-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Remember Username Checkbox matching Screenshot 4 */}
          <div className="flex items-center justify-between text-xs text-slate-300 pt-1">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <button
                type="button"
                onClick={() => setRememberUser(!rememberUser)}
                className="text-cyan-400"
              >
                {rememberUser ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4 text-slate-500" />}
              </button>
              <span>Remember username</span>
            </label>
          </div>

          {/* Sign In Button matching Screenshot 4 */}
          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold text-xs shadow-xl shadow-cyan-600/30 flex items-center justify-center gap-2 transition-all mt-2"
          >
            <LogIn className="w-4 h-4" />
            Sign In &rarr;
          </button>
        </form>

        <div className="pt-3 border-t border-slate-800 space-y-2">
          <button
            onClick={handleGoogleSignIn}
            className="w-full py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center justify-center gap-2 transition-all"
          >
            <img src="https://www.gstatic.com/mobilesdk/160503_mobilesdk/firebase_28dp.png" alt="Firebase" className="w-4 h-4" />
            Sign in with Google Firebase Auth
          </button>
        </div>
      </div>
    </div>
  );
};

