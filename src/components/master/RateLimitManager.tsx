import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Activity,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Building2,
  Sliders,
  RotateCcw,
  Clock,
  Zap,
  Server
} from 'lucide-react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../../services/firebaseConfig';
import { useAuthTenant } from '../../context/AuthTenantContext';
import { TenantRateLimitRecord, resetTenantRateLimit, checkAndIncrementRateLimit } from '../../services/rateLimiter';
import { TTSButton } from '../common/TTSButton';

export const RateLimitManager: React.FC = () => {
  const { allCompanies } = useAuthTenant();
  const [rateLimits, setRateLimits] = useState<Record<string, TenantRateLimitRecord>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [actionNotification, setActionNotification] = useState<string | null>(null);

  // Subscribe to real-time rate limit documents from Firestore
  useEffect(() => {
    setIsLoading(true);
    try {
      const colRef = collection(db, 'tenant_rate_limits');
      const unsubscribe = onSnapshot(colRef, (snapshot) => {
        const limitsMap: Record<string, TenantRateLimitRecord> = {};
        snapshot.docs.forEach((d) => {
          const data = d.data() as TenantRateLimitRecord;
          limitsMap[data.companyId] = data;
        });
        setRateLimits(limitsMap);
        setIsLoading(false);
      }, (err) => {
        console.warn('tenant_rate_limits snapshot error:', err);
        setIsLoading(false);
      });

      return () => unsubscribe();
    } catch (e) {
      console.warn('Error connecting to tenant_rate_limits:', e);
      setIsLoading(false);
    }
  }, []);

  const handleResetLimit = async (companyId: string, companyName: string, maxLimit: number) => {
    await resetTenantRateLimit(companyId, companyName, maxLimit);
    setActionNotification(`🔄 Rate limit counter reset successfully for ${companyName}.`);
    setTimeout(() => setActionNotification(null), 4000);
  };

  const handleTestSimulateApiCall = async (companyId: string, companyName: string) => {
    const res = await checkAndIncrementRateLimit(companyId, companyName, 5); // low limit for testing
    if (res.allowed) {
      setActionNotification(`⚡ Test API request recorded for ${companyName}. Current count: ${res.currentCount}/${res.maxLimit}`);
    } else {
      setActionNotification(`🚨 Rate Limit Enforced! ${res.message}`);
    }
    setTimeout(() => setActionNotification(null), 5000);
  };

  const speechText = `Tenant API Rate Limit Enforcement Engine. Tracking real-time request volumetric quotas across all ${allCompanies.length} registered enterprises.`;

  return (
    <div className="p-6 space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-purple-950/40 to-slate-900 border border-purple-800/40 p-6 rounded-2xl shadow-2xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ShieldAlert className="w-6 h-6 text-purple-400" />
            <h1 className="text-xl font-black text-slate-100 tracking-tight">
              Tenant API Rate Limit & Fair Usage Enforcer
            </h1>
          </div>
          <p className="text-xs text-slate-400 max-w-2xl font-mono">
            Track and enforce hourly API rate limits per tenant in Firestore to prevent system resource abuse, DDOS attempts, and ensure fair resource distribution across all client companies.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <TTSButton text={speechText} label="Audio Status Briefing" />
        </div>
      </div>

      {/* Notification Toast */}
      {actionNotification && (
        <div className="p-4 rounded-2xl bg-purple-500/20 border border-purple-500/40 text-purple-200 text-xs flex items-center gap-3 shadow-xl animate-in fade-in">
          <Zap className="w-5 h-5 text-purple-400 shrink-0" />
          <div className="font-semibold font-mono">{actionNotification}</div>
        </div>
      )}

      {/* Companies Rate Limit Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
                Live Tenant API Quota Monitoring ({allCompanies.length} Companies)
              </h2>
              <p className="text-xs text-slate-400">
                Hourly sliding window quotas synchronized in Firestore database in real time.
              </p>
            </div>
          </div>
        </div>

        {allCompanies.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-xs">
            No registered companies found. Register a company to begin rate limit tracking.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-slate-950/80 text-slate-400 uppercase text-[10px] tracking-wider font-bold border-b border-slate-800">
                  <th className="py-3 px-4">Company Name / Subdomain</th>
                  <th className="py-3 px-4">Hourly Window</th>
                  <th className="py-3 px-4">Requests / Max Quota</th>
                  <th className="py-3 px-4">Quota Utilization</th>
                  <th className="py-3 px-4">Enforcement Status</th>
                  <th className="py-3 px-4 text-right">Master Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {allCompanies.map((comp) => {
                  const record = rateLimits[comp.id] || {
                    requestCount: 0,
                    maxLimit: 2500,
                    windowStart: new Date().toISOString().slice(0, 13),
                    isRateLimited: false
                  };
                  const usagePercent = Math.min(100, Math.round((record.requestCount / record.maxLimit) * 100));

                  return (
                    <tr key={comp.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-200">
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-purple-400 shrink-0" />
                          <div>
                            <div>{comp.name}</div>
                            <div className="text-[10px] text-slate-400 font-normal">{comp.slug}.erp.mts.pk</div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-slate-300">
                        <div className="flex items-center gap-1 text-[11px]">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>{record.windowStart || 'Current Hour'}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-bold text-slate-100">
                        <span className="text-cyan-400">{record.requestCount.toLocaleString()}</span> / {record.maxLimit.toLocaleString()}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="w-32 bg-slate-950 rounded-full h-2.5 overflow-hidden border border-slate-800">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              usagePercent > 90 ? 'bg-rose-500' :
                              usagePercent > 70 ? 'bg-amber-500' :
                              'bg-gradient-to-r from-cyan-500 to-purple-500'
                            }`}
                            style={{ width: `${usagePercent}%` }}
                          />
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">{usagePercent}% utilized</div>
                      </td>

                      <td className="py-3.5 px-4">
                        {record.isRateLimited ? (
                          <span className="px-2.5 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[10px] font-bold inline-flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3 animate-pulse" /> RATE LIMITED
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold inline-flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> NORMAL
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right space-x-2">
                        <button
                          onClick={() => handleTestSimulateApiCall(comp.id, comp.name)}
                          className="px-2.5 py-1.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/40 text-purple-200 border border-purple-500/30 text-[11px] font-bold inline-flex items-center gap-1 cursor-pointer transition-all"
                          title="Simulate incoming API request for rate test"
                        >
                          <Zap className="w-3 h-3 text-purple-300" /> Test Ping
                        </button>

                        <button
                          onClick={() => handleResetLimit(comp.id, comp.name, record.maxLimit)}
                          className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 text-[11px] font-bold inline-flex items-center gap-1 cursor-pointer transition-all"
                          title="Reset counter"
                        >
                          <RotateCcw className="w-3 h-3" /> Reset
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
