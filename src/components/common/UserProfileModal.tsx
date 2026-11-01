import React from 'react';
import { User, ShieldCheck, Mail, Building2, LogOut, CheckCircle2, X } from 'lucide-react';
import { useAuthTenant } from '../../context/AuthTenantContext';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenLogin: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({ isOpen, onClose, onOpenLogin }) => {
  const { currentUser, isMasterPortal, currentCompany, switchTenantBySlug } = useAuthTenant();

  if (!isOpen) return null;

  const handleLogout = () => {
    onClose();
    onOpenLogin();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-md w-full space-y-5 shadow-2xl animate-in zoom-in-95">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-cyan-400" />
            <h2 className="font-black text-sm text-slate-100 uppercase tracking-wider">
              Authenticated User Profile
            </h2>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-200">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 space-y-3 font-mono text-xs">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-cyan-600/30 border border-cyan-500/40 flex items-center justify-center font-black text-cyan-300 text-lg">
              {currentUser.name.charAt(0)}
            </div>
            <div>
              <div className="font-bold text-sm text-slate-100">{currentUser.name}</div>
              <div className="text-cyan-400 font-semibold">{currentUser.role.replace('_', ' ')}</div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-700/80 space-y-1.5 text-slate-300">
            <div>Email: <span className="text-slate-100">{currentUser.email}</span></div>
            <div>Portal Mode: <span className="text-purple-300">{isMasterPortal ? 'Master Global Admin' : 'Client Tenant User'}</span></div>
            {!isMasterPortal && <div>Company: <span className="text-cyan-300">{currentCompany.name}</span></div>}
            <div>Branch: <span className="text-amber-300">{currentUser.branchName}</span></div>
          </div>
        </div>

        <div className="flex justify-between items-center pt-2">
          <button
            onClick={() => {
              onClose();
              onOpenLogin();
            }}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700"
          >
            Switch Account
          </button>

          <button
            onClick={handleLogout}
            className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-600/30 flex items-center gap-1.5"
          >
            <LogOut className="w-4 h-4" /> Sign Out / Logout
          </button>
        </div>
      </div>
    </div>
  );
};
