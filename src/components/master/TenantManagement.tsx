import React, { useState } from 'react';
import {
  Globe,
  Building2,
  Lock,
  Unlock,
  Edit2,
  Trash2,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { useAuthTenant } from '../../context/AuthTenantContext';
import { ClientCompany } from '../../types/erp';

export const TenantManagement: React.FC = () => {
  const { allCompanies, setAllCompanies, switchTenantBySlug } = useAuthTenant();
  const [editingCompany, setEditingCompany] = useState<ClientCompany | null>(null);

  const toggleStatus = (id: string) => {
    setAllCompanies(prev =>
      prev.map(c => {
        if (c.id === id) {
          const newStatus = c.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
          return { ...c, status: newStatus };
        }
        return c;
      })
    );
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-slate-100 flex items-center gap-2">
            <Globe className="w-6 h-6 text-purple-400" />
            Company URLs, Subdomains & Tenant Isolation
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage wildcard DNS subdomains (*.erp.mts.pk), company slugs, active statuses, and multi-tenant isolation rules.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {allCompanies.map((comp) => (
          <div
            key={comp.id}
            className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4"
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center font-black text-purple-300 text-sm">
                  {comp.code}
                </div>
                <div>
                  <h3 className="font-bold text-slate-100 text-sm flex items-center gap-2">
                    {comp.name}
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                        comp.status === 'ACTIVE'
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                          : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                      }`}
                    >
                      {comp.status}
                    </span>
                  </h3>
                  <div className="text-xs text-slate-400 font-mono mt-0.5">
                    Tenant ID: {comp.tenantId} • Subdomain: <span className="text-purple-300">{comp.subdomain}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => switchTenantBySlug(comp.slug)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-600/20 hover:bg-cyan-600/40 text-cyan-200 border border-cyan-500/30 text-xs font-semibold transition-all"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Launch Tenant URL
                </button>

                <button
                  onClick={() => toggleStatus(comp.id)}
                  className={`p-1.5 px-3 rounded-xl border text-xs font-semibold flex items-center gap-1 transition-all ${
                    comp.status === 'ACTIVE'
                      ? 'bg-amber-500/20 border-amber-500/30 text-amber-300 hover:bg-amber-500/30'
                      : 'bg-emerald-500/20 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/30'
                  }`}
                >
                  {comp.status === 'ACTIVE' ? (
                    <>
                      <Lock className="w-3.5 h-3.5" /> Suspend
                    </>
                  ) : (
                    <>
                      <Unlock className="w-3.5 h-3.5" /> Activate
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono text-slate-300">
              <div className="p-2.5 rounded-xl bg-slate-800/50 border border-slate-700/60">
                <span className="text-[10px] text-slate-500 uppercase block">FBR NTN Tax ID</span>
                <span className="text-slate-100 font-bold">{comp.ntn}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-800/50 border border-slate-700/60">
                <span className="text-[10px] text-slate-500 uppercase block">FBR STRN Sales Tax</span>
                <span className="text-slate-100 font-bold">{comp.strn}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-800/50 border border-slate-700/60">
                <span className="text-[10px] text-slate-500 uppercase block">User Seat Limit</span>
                <span className="text-slate-100 font-bold">{comp.userLimit} Users</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-800/50 border border-slate-700/60">
                <span className="text-[10px] text-slate-500 uppercase block">Subscription Tier</span>
                <span className="text-purple-300 font-bold">{comp.subscriptionPlan}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
