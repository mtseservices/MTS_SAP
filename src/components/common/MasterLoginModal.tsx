import React, { useState } from 'react';
import { ShieldCheck, LogIn, Lock, User, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuthTenant } from '../../context/AuthTenantContext';
import { auth, googleProvider } from '../../services/firebaseConfig';
import { signInWithPopup } from 'firebase/auth';

interface MasterLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MasterLoginModal: React.FC<MasterLoginModalProps> = ({ isOpen, onClose }) => {
  const { switchTenantBySlug, setCurrentUser, allCompanies } = useAuthTenant();
  const [username, setUsername] = useState('MTS-ERP-SAP');
  const [password, setPassword] = useState('Same');
  const [loginType, setLoginType] = useState<'MASTER' | 'CLIENT'>('MASTER');
  const [selectedCompanySlug, setSelectedCompanySlug] = useState(allCompanies[0]?.slug || 'albarka');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (loginType === 'MASTER') {
      // Master User credentials: Username "MTS-ERP-SAP" & Password "Same"
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
      // Client Login
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
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-md w-full space-y-6 shadow-2xl animate-in zoom-in-95">
        <div className="text-center space-y-1 border-b border-slate-800 pb-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-600 to-purple-600 mx-auto flex items-center justify-center font-black text-white text-xl shadow-lg shadow-cyan-500/20 mb-2">
            MTS
          </div>
          <h2 className="text-lg font-black text-slate-100">
            MTS-ERP-SAP Authentication Portal
          </h2>
          <p className="text-xs text-slate-400">
            Universal Enterprise Login Engine
          </p>
        </div>

        {/* Login Type Switcher Pill */}
        <div className="grid grid-cols-2 p-1 rounded-xl bg-slate-800 border border-slate-700 text-xs font-bold">
          <button
            type="button"
            onClick={() => setLoginType('MASTER')}
            className={`py-1.5 rounded-lg transition-all ${
              loginType === 'MASTER'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Master Admin Login
          </button>
          <button
            type="button"
            onClick={() => setLoginType('CLIENT')}
            className={`py-1.5 rounded-lg transition-all ${
              loginType === 'CLIENT'
                ? 'bg-cyan-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Client Tenant Login
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleLoginSubmit} className="space-y-4">
          {loginType === 'MASTER' ? (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Master Portal Username</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-100 font-mono focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Master Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-100 font-mono focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>
            </>
          ) : (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Select Tenant Company</label>
                <select
                  value={selectedCompanySlug}
                  onChange={(e) => setSelectedCompanySlug(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                >
                  {allCompanies.map((c) => (
                    <option key={c.id} value={c.slug}>
                      {c.name} ({c.slug}.erp.mts.pk)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Client User Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="e.g. admin_gourmet"
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-100 font-mono focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-100 font-mono focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>
            </div>
          )}

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 text-white font-bold text-xs shadow-xl shadow-cyan-600/30 flex items-center justify-center gap-2 transition-all"
          >
            <LogIn className="w-4 h-4" /> Authenticate & Enter Portal
          </button>
        </form>

        <div className="pt-3 border-t border-slate-800 space-y-2">
          <button
            onClick={handleGoogleSignIn}
            className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center justify-center gap-2 transition-all"
          >
            <img src="https://www.gstatic.com/mobilesdk/160503_mobilesdk/firebase_28dp.png" alt="Firebase" className="w-4 h-4" />
            Sign in with Google Firebase Auth
          </button>
        </div>
      </div>
    </div>
  );
};
