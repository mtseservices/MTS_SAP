import React from 'react';
import {
  Building2,
  Users,
  CheckCircle2,
  AlertTriangle,
  Globe,
  PlusCircle,
  Activity,
  Server,
  ShieldCheck,
  TrendingUp,
  Cpu,
  CreditCard
} from 'lucide-react';
import { useAuthTenant } from '../../context/AuthTenantContext';
import { TTSButton } from '../common/TTSButton';

interface MasterDashboardProps {
  onNavigateRegister: () => void;
  onNavigateCompanies: () => void;
  onNavigateApiAudit?: () => void;
}

export const MasterDashboard: React.FC<MasterDashboardProps> = ({
  onNavigateRegister,
  onNavigateCompanies,
  onNavigateApiAudit
}) => {
  const { allCompanies } = useAuthTenant();

  const totalUsers = allCompanies.reduce((acc, c) => acc + c.userLimit, 0);
  const activeCount = allCompanies.filter(c => c.status === 'ACTIVE').length;

  const dashboardSpeech = `Master Central Administrator Dashboard. Total active enterprise client companies: ${allCompanies.length}. Combined user license cap: ${totalUsers}. System health status: 100% operational with multi-tenant isolation.`;

  return (
    <div className="p-6 space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-gradient-to-r from-purple-900/60 via-slate-900 to-slate-900 border border-purple-800/40 p-6 rounded-2xl shadow-2xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck className="w-6 h-6 text-purple-400" />
            <h1 className="text-xl font-black text-slate-100 tracking-tight">
              Master Control Portal • Global ERP Administrator
            </h1>
          </div>
          <p className="text-xs text-slate-400 max-w-2xl">
            Provision client companies, manage company-specific URL subdomains, configure multi-tenant isolation rules, and monitor system performance across Pakistan.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <TTSButton text={dashboardSpeech} label="Listen Briefing" size="lg" />
          {onNavigateApiAudit && (
            <button
              onClick={onNavigateApiAudit}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-cyan-600/30 hover:bg-cyan-600/50 text-cyan-300 font-bold text-xs border border-cyan-500/40 shadow-lg shadow-cyan-950/40 transition-all"
            >
              <Activity className="w-4 h-4 text-cyan-400" />
              API Telemetry & Audit
            </button>
          )}
          <button
            onClick={onNavigateRegister}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            Register New Company
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Tenants</div>
            <div className="text-2xl font-black text-slate-100 mt-1">{allCompanies.filter(c => c.status === 'ACTIVE').length}</div>
            <div className="text-[11px] text-emerald-400 font-medium mt-0.5">Total Revenue: PKR {allCompanies.reduce((acc, c) => acc + (c.lastPaymentAmount || 0), 0).toLocaleString()}</div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <Building2 className="w-6 h-6" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">System Alerts</div>
            <div className="text-2xl font-black text-slate-100 mt-1">{allCompanies.reduce((acc, c) => acc + (c.limitApprovalRequests?.filter(r => r.status === 'PENDING').length || 0), 0)}</div>
            <div className="text-[11px] text-amber-400 font-medium mt-0.5">Pending Approvals</div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-600/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Subscription Split</div>
            <div className="text-2xl font-black text-slate-100 mt-1">{allCompanies.filter(c => c.paymentStatus === 'PAID').length} <span className="text-sm font-normal text-slate-500">/ {allCompanies.filter(c => c.paymentStatus === 'TRIAL').length}</span></div>
            <div className="text-[11px] text-purple-400 font-medium mt-0.5">Paid vs Trial Accounts</div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <CreditCard className="w-6 h-6" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Google Sign-ins</div>
            <div className="text-2xl font-black text-slate-100 mt-1">2,485 <span className="text-sm font-normal text-slate-500">/ 120 (Fail)</span></div>
            <div className="text-[11px] text-emerald-400 font-medium mt-0.5">95% Success Rate</div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Globe className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Tenant Companies Table Summary */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-purple-400" />
            Registered Enterprise Client Companies
          </h2>
          <button
            onClick={onNavigateCompanies}
            className="text-xs text-purple-400 hover:text-purple-300 font-semibold"
          >
            View All Companies →
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {allCompanies.map((comp) => (
            <div
              key={comp.id}
              className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/80 hover:border-purple-500/50 transition-all space-y-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-bold text-sm text-slate-100">{comp.name}</div>
                  <div className="text-[11px] text-purple-400 font-mono mt-0.5">{comp.slug}.erp.mts.pk</div>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
                  {comp.status}
                </span>
              </div>

              <div className="text-xs text-slate-400 space-y-1 font-mono">
                <div>Code: <span className="text-slate-200">{comp.code}</span></div>
                <div>Industry: <span className="text-slate-200">{comp.industry}</span></div>
                <div>NTN: <span className="text-slate-200">{comp.ntn}</span> • STRN: <span className="text-slate-200">{comp.strn}</span></div>
                <div>Admin: <span className="text-slate-200">{comp.adminName}</span> ({comp.adminEmail})</div>
              </div>

              <div className="pt-2 border-t border-slate-700/60 flex items-center justify-between text-[11px]">
                <span className="text-slate-400">Users: <strong className="text-slate-200">{comp.userLimit}</strong></span>
                <span className="text-slate-400">Plan: <strong className="text-purple-300">{comp.subscriptionPlan}</strong></span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
