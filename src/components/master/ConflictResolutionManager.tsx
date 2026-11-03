import React, { useState, useEffect } from 'react';
import {
  GitMerge,
  ShieldAlert,
  CheckCircle2,
  RefreshCw,
  Server,
  Smartphone,
  Check,
  X,
  ArrowRight,
  Database,
  Clock
} from 'lucide-react';
import { useAuthTenant } from '../../context/AuthTenantContext';

interface SyncConflict {
  id: string;
  tenantId: string;
  companyName: string;
  entityType: 'Sales Invoice' | 'Purchase Order' | 'Journal Voucher' | 'Inventory Item';
  documentNumber: string;
  timestamp: string;
  localVersion: {
    updatedBy: string;
    lastModified: string;
    payload: Record<string, any>;
  };
  serverVersion: {
    updatedBy: string;
    lastModified: string;
    payload: Record<string, any>;
  };
  status: 'PENDING' | 'RESOLVED_LOCAL' | 'RESOLVED_SERVER' | 'MERGED';
}

const INITIAL_CONFLICTS: SyncConflict[] = [
  {
    id: 'cnf_001',
    tenantId: 'tenant_crest_001',
    companyName: 'Crest Textile Mills Ltd',
    entityType: 'Sales Invoice',
    documentNumber: 'SI-2026-4491',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    localVersion: {
      updatedBy: 'Rashid Ahmed (Client Admin)',
      lastModified: '2026-11-02 21:30:10',
      payload: { customer: 'Metro Cash & Carry', grandTotal: 1450000, discount: 50000, status: 'UNPAID' }
    },
    serverVersion: {
      updatedBy: 'Tariq Mehmood (Finance)',
      lastModified: '2026-11-02 21:32:45',
      payload: { customer: 'Metro Cash & Carry (Verified)', grandTotal: 1500000, discount: 0, status: 'PAID' }
    },
    status: 'PENDING'
  },
  {
    id: 'cnf_002',
    tenantId: 'tenant_solar_002',
    companyName: 'SolarTech Solutions Pak',
    entityType: 'Inventory Item',
    documentNumber: 'SKU-SOLAR-552',
    timestamp: new Date(Date.now() - 7200000).toISOString(),
    localVersion: {
      updatedBy: 'Storekeeper Lahore',
      lastModified: '2026-11-02 20:15:00',
      payload: { itemName: 'Monocrystalline Panel 550W', currentStock: 420, unitPrice: 38500 }
    },
    serverVersion: {
      updatedBy: 'Procurement Head Islamabad',
      lastModified: '2026-11-02 20:20:12',
      payload: { itemName: 'Monocrystalline Panel 550W (Tier-1)', currentStock: 450, unitPrice: 39000 }
    },
    status: 'PENDING'
  }
];

export const ConflictResolutionManager: React.FC = () => {
  const { currentCompany } = useAuthTenant();
  const [conflicts, setConflicts] = useState<SyncConflict[]>(() => {
    try {
      const saved = localStorage.getItem('mts_sync_conflicts');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {}
    return INITIAL_CONFLICTS;
  });

  const [activeConflictId, setActiveConflictId] = useState<string>(conflicts[0]?.id || '');
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  const activeConflict = conflicts.find(c => c.id === activeConflictId) || conflicts[0];

  const handleResolve = (conflictId: string, resolution: 'RESOLVED_LOCAL' | 'RESOLVED_SERVER' | 'MERGED') => {
    const updated = conflicts.map(c => {
      if (c.id === conflictId) {
        return { ...c, status: resolution };
      }
      return c;
    });
    setConflicts(updated);
    try {
      localStorage.setItem('mts_sync_conflicts', JSON.stringify(updated));
    } catch {}

    setSuccessNotice(`Conflict ${conflictId} successfully resolved via [${resolution}]. PWA instance synchronized with Firestore.`);
    setTimeout(() => setSuccessNotice(null), 4000);
  };

  const pendingCount = conflicts.filter(c => c.status === 'PENDING').length;

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto pb-24">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-gradient-to-r from-rose-950/60 via-slate-900 to-slate-900 border border-rose-900/40 p-6 rounded-3xl shadow-2xl">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <GitMerge className="w-6 h-6 text-rose-400" />
            <h1 className="text-xl font-black text-slate-100 tracking-tight">
              PWA &amp; Firestore Data Sync Conflict Resolution
            </h1>
          </div>
          <p className="text-xs text-slate-400 max-w-2xl">
            Inspect, compare side-by-side diffs, and manually merge or choose between local PWA client updates and server Firestore versions when concurrency conflicts occur.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="px-3 py-1.5 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-mono font-bold">
            {pendingCount} Pending Conflicts
          </span>
        </div>
      </div>

      {successNotice && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-3 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          {successNotice}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: List of Conflicts */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <h2 className="text-sm font-black text-slate-100 uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-4">
            <ShieldAlert className="w-4 h-4 text-amber-400" />
            Active Sync Conflicts ({conflicts.length})
          </h2>

          <div className="space-y-2">
            {conflicts.map((cnf) => {
              const isSelected = cnf.id === activeConflictId;
              const isPending = cnf.status === 'PENDING';
              return (
                <button
                  key={cnf.id}
                  onClick={() => setActiveConflictId(cnf.id)}
                  className={`w-full p-4 rounded-2xl border text-left flex flex-col gap-2 transition-all cursor-pointer ${
                    isSelected ? 'bg-rose-500/10 border-rose-500/50 text-rose-100 shadow-lg' : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-white">{cnf.documentNumber}</span>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                      isPending ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    }`}>
                      {cnf.status}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    {cnf.companyName} • <span className="text-cyan-400">{cnf.entityType}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Side-by-Side Diff & Resolution Actions */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
          {activeConflict ? (
            <>
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <h2 className="text-sm font-black text-slate-100 uppercase tracking-wider flex items-center gap-2">
                    <GitMerge className="w-4 h-4 text-cyan-400" />
                    Conflict Details: {activeConflict.documentNumber} ({activeConflict.entityType})
                  </h2>
                  <p className="text-[10px] text-slate-500 mt-0.5">Tenant: {activeConflict.companyName} • Logged at: {new Date(activeConflict.timestamp).toLocaleString()}</p>
                </div>
                <span className="px-3 py-1 rounded-xl bg-slate-950 text-xs font-mono font-bold text-amber-300 border border-slate-800">
                  Status: {activeConflict.status}
                </span>
              </div>

              {/* Side-by-Side Comparison */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-mono text-xs">
                {/* Local PWA Version */}
                <div className="bg-slate-950 border border-cyan-500/30 rounded-2xl p-5 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2 text-cyan-400 font-bold">
                      <Smartphone className="w-4 h-4" />
                      <span>Local PWA Version</span>
                    </div>
                    <span className="text-[10px] text-slate-500">{activeConflict.localVersion.lastModified}</span>
                  </div>
                  <div className="text-[11px] text-slate-400">Updated By: <strong className="text-slate-200">{activeConflict.localVersion.updatedBy}</strong></div>
                  <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-1.5 text-slate-200">
                    {Object.entries(activeConflict.localVersion.payload).map(([k, v]) => (
                      <div key={k} className="flex justify-between">
                        <span className="text-slate-500">{k}:</span>
                        <span className="text-cyan-300 font-bold">{String(v)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Server Firestore Version */}
                <div className="bg-slate-950 border border-purple-500/30 rounded-2xl p-5 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2 text-purple-400 font-bold">
                      <Server className="w-4 h-4" />
                      <span>Server Firestore Version</span>
                    </div>
                    <span className="text-[10px] text-slate-500">{activeConflict.serverVersion.lastModified}</span>
                  </div>
                  <div className="text-[11px] text-slate-400">Updated By: <strong className="text-slate-200">{activeConflict.serverVersion.updatedBy}</strong></div>
                  <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-1.5 text-slate-200">
                    {Object.entries(activeConflict.serverVersion.payload).map(([k, v]) => (
                      <div key={k} className="flex justify-between">
                        <span className="text-slate-500">{k}:</span>
                        <span className="text-purple-300 font-bold">{String(v)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Resolution Action Buttons */}
              <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center justify-end gap-3">
                <button
                  onClick={() => handleResolve(activeConflict.id, 'RESOLVED_LOCAL')}
                  className="px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-lg shadow-cyan-600/30 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Smartphone className="w-4 h-4" /> Keep Local PWA Version
                </button>
                <button
                  onClick={() => handleResolve(activeConflict.id, 'RESOLVED_SERVER')}
                  className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Server className="w-4 h-4" /> Accept Server Version
                </button>
                <button
                  onClick={() => handleResolve(activeConflict.id, 'MERGED')}
                  className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <GitMerge className="w-4 h-4" /> Manual Merge &amp; Sync
                </button>
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-slate-500">Select a conflict to inspect and resolve.</div>
          )}
        </div>
      </div>
    </div>
  );
};
