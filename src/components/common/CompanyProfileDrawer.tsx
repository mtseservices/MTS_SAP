import React from 'react';
import { Building2, Globe, ShieldCheck, Mail, Phone, MapPin, X } from 'lucide-react';
import { useAuthTenant } from '../../context/AuthTenantContext';

interface CompanyProfileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CompanyProfileDrawer: React.FC<CompanyProfileDrawerProps> = ({ isOpen, onClose }) => {
  const { currentCompany } = useAuthTenant();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-end p-4">
      <div className="bg-slate-900 border-l border-slate-700 rounded-l-2xl p-6 max-w-md w-full h-full space-y-6 shadow-2xl animate-in slide-in-from-right overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-cyan-400" />
            <h2 className="font-black text-sm text-slate-100 uppercase tracking-wider">
              Company Tenant Profile
            </h2>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-200">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-4 font-mono text-xs">
          <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 space-y-2">
            <div className="font-bold text-base text-slate-100">{currentCompany.name}</div>
            <div className="text-cyan-400 font-bold">{currentCompany.slug}.erp.mts.pk</div>
            <div className="text-slate-400">Code: <strong className="text-slate-200">{currentCompany.code}</strong> • Industry: {currentCompany.industry}</div>
          </div>

          <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700 space-y-2 text-slate-300">
            <div className="text-[11px] font-bold text-slate-400 uppercase border-b border-slate-700 pb-1">Tax Credentials</div>
            <div>FBR NTN Number: <strong className="text-slate-100">{currentCompany.ntn}</strong></div>
            <div>FBR STRN Sales Tax: <strong className="text-slate-100">{currentCompany.strn}</strong></div>
          </div>

          <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700 space-y-2 text-slate-300">
            <div className="text-[11px] font-bold text-slate-400 uppercase border-b border-slate-700 pb-1">Subscription Tier & Limits</div>
            <div>Plan: <strong className="text-purple-300">{currentCompany.subscriptionPlan}</strong></div>
            <div>User Seats Limit: <strong className="text-slate-100">{currentCompany.userLimit} Users</strong></div>
            <div>Status: <strong className="text-emerald-400">{currentCompany.status}</strong></div>
          </div>

          <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700 space-y-2 text-slate-300">
            <div className="text-[11px] font-bold text-slate-400 uppercase border-b border-slate-700 pb-1">Contact & Address</div>
            <div>Email: {currentCompany.email}</div>
            <div>Phone: {currentCompany.phone}</div>
            <div>Location: {currentCompany.address}, {currentCompany.city}, {currentCompany.province}</div>
          </div>
        </div>
      </div>
    </div>
  );
};
