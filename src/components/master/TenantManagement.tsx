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
  AlertTriangle,
  Database,
  FileCheck2,
  Users,
  Save,
  Check,
  X
} from 'lucide-react';
import { useAuthTenant } from '../../context/AuthTenantContext';
import { auditLogger } from '../../services/auditLogger';
import { ClientCompany } from '../../types/erp';
import { DatabaseBackupManager } from './DatabaseBackupManager';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../../services/firebaseConfig';

export const TenantManagement: React.FC = () => {
  const { allCompanies, setAllCompanies, switchTenantBySlug, permanentDeleteCompany, currentUser } = useAuthTenant();
  const [activeTab, setActiveTab] = useState<'tenants' | 'approvals' | 'backup' | 'archive'>('tenants');
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

  const handleArchiveCompany = async (comp: ClientCompany) => {
    const updated = { ...comp, isArchived: true, status: 'INACTIVE' };
    setAllCompanies(prev => prev.map(c => c.id === comp.id ? updated : c));
    try {
      await setDoc(doc(db, 'companies', comp.id), updated, { merge: true });
    } catch (e) {
      console.warn('Firebase archive sync error:', e);
    }
    await auditLogger.logAction({
      tenantId: 'system_master',
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      actionType: 'SETTINGS_CHANGE',
      module: 'Tenant Management',
      details: `Archived company: ${comp.name} (${comp.code})`
    });
  };

  const handleRestoreCompany = async (comp: ClientCompany) => {
    const updated = { ...comp, isArchived: false, status: 'ACTIVE' };
    setAllCompanies(prev => prev.map(c => c.id === comp.id ? updated : c));
    try {
      await setDoc(doc(db, 'companies', comp.id), updated, { merge: true });
    } catch (e) {
      console.warn('Firebase restore sync error:', e);
    }
    await auditLogger.logAction({
      tenantId: 'system_master',
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      actionType: 'SETTINGS_CHANGE',
      module: 'Tenant Management',
      details: `Restored company: ${comp.name} (${comp.code})`
    });
  };

  const handlePermanentDelete = async (id: string) => {
    await permanentDeleteCompany(id);
  };

  // Master Admin approves or rejects Client Admin limit increase request
  const handleApproveLimitRequest = async (companyId: string, requestId: string, approve: boolean) => {
    setAllCompanies(prev =>
      prev.map(comp => {
        if (comp.id === companyId) {
          const updatedReqs = comp.limitApprovalRequests?.map(req => {
            if (req.id === requestId) {
              return { ...req, status: approve ? ('APPROVED' as const) : ('REJECTED' as const) };
            }
            return req;
          });

          const reqItem = comp.limitApprovalRequests?.find(r => r.id === requestId);
          const newUserLimit = (approve && reqItem?.requestedUserLimit) ? reqItem.requestedUserLimit : comp.userLimit;

          const updated = {
            ...comp,
            userLimit: newUserLimit,
            limitApprovalRequests: updatedReqs
          };

          try {
            setDoc(doc(db, 'companies', comp.id), updated, { merge: true });
          } catch (e) {
            console.warn('Firebase approval sync error:', e);
          }

          return updated;
        }
        return comp;
      })
    );
  };

  // Master Admin saves edited limits directly
  const handleSaveMasterLimits = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCompany) return;

    setAllCompanies(prev => prev.map(c => c.id === editingCompany.id ? editingCompany : c));

    try {
      await setDoc(doc(db, 'companies', editingCompany.id), editingCompany, { merge: true });
    } catch (err) {
      console.warn('Firebase limit save error:', err);
    }

    setEditingCompany(null);
  };

  // Collect pending requests across all companies
  const pendingRequests = allCompanies.flatMap(c =>
    (c.limitApprovalRequests || [])
      .filter(r => r.status === 'PENDING')
      .map(r => ({ ...r, companyId: c.id, companyName: c.name }))
  );

  return (
    <div className="p-6 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl font-black text-slate-100 flex items-center gap-2">
            <Globe className="w-6 h-6 text-purple-400" />
            Master Tenant Management, Database Backup & Limit Approvals
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage live company URLs, user seat limits, approval workflows, and full JSON database export/restoration.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('tenants')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'tenants'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            🏢 Tenant List ({allCompanies.filter(c => !c.isArchived).length})
          </button>

          <button
            onClick={() => setActiveTab('archive')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'archive'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            📦 Archive ({allCompanies.filter(c => c.isArchived).length})
          </button>

          <button
            onClick={() => setActiveTab('approvals')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer relative ${
              activeTab === 'approvals'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <FileCheck2 className="w-3.5 h-3.5 inline mr-1" />
            Limit Approvals
            {pendingRequests.length > 0 && (
              <span className="ml-1.5 px-1.5 py-0.2 rounded-full bg-amber-500 text-slate-950 font-black text-[10px]">
                {pendingRequests.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('backup')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'backup'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <Database className="w-3.5 h-3.5 inline mr-1" />
            Database Backup & Restore
          </button>
        </div>
      </div>

      {/* TAB 1: TENANTS LIST */}
      {activeTab === 'tenants' && (
        <div className="grid grid-cols-1 gap-4 animate-in fade-in">
          {allCompanies.filter(c => !c.isArchived).map((comp) => (
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
                    onClick={() => setEditingCompany(comp)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-all cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-cyan-400" /> Edit Master Limits
                  </button>

                  <button
                    onClick={() => switchTenantBySlug(comp.slug)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-600/20 hover:bg-cyan-600/40 text-cyan-200 border border-cyan-500/30 text-xs font-semibold transition-all cursor-pointer"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Launch Tenant
                  </button>

                  <button
                    onClick={() => toggleStatus(comp.id)}
                    className={`p-1.5 px-3 rounded-xl border text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
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

                  <button
                    onClick={() => handleArchiveCompany(comp)}
                    className="p-1.5 px-3 rounded-xl bg-purple-600/20 hover:bg-purple-600/40 border border-purple-500/30 text-purple-300 text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer"
                    title="Move to Archive"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Archive
                  </button>

                  <button
                    onClick={async () => {
                      if (window.confirm(`Permanently delete "${comp.name}"? This will permanently remove the company, its settings, and sample data from storage.`)) {
                        await handlePermanentDelete(comp.id);
                      }
                    }}
                    className="p-1.5 px-3 rounded-xl bg-rose-600/20 hover:bg-rose-600/40 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer"
                    title="Permanently Delete Company"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-400" /> Permanent Delete
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
                  <span className="text-emerald-400 font-bold">{comp.userLimit} Seats (Master Locked)</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-800/50 border border-slate-700/60">
                  <span className="text-[10px] text-slate-500 uppercase block">Subscription Tier</span>
                  <span className="text-purple-300 font-bold">{comp.subscriptionPlan}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB: ARCHIVE & PERMANENT DELETE */}
      {activeTab === 'archive' && (
        <div className="space-y-4 animate-in fade-in">
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-slate-300">
            <strong>Archived Sample & Client Companies Vault:</strong> Master User can restore archived companies using Undo, or permanently delete them from database storage.
          </div>

          {allCompanies.filter(c => c.isArchived).length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-xs bg-slate-900 border border-slate-800 rounded-2xl">
              No archived companies found. Click "Archive" on any tenant card to move it here.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {allCompanies.filter(c => c.isArchived).map((comp) => (
                <div
                  key={comp.id}
                  className="p-5 rounded-2xl bg-slate-900 border border-purple-500/30 shadow-xl space-y-3"
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center font-black text-purple-300 text-sm">
                        {comp.code}
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-100 text-sm flex items-center gap-2">
                          {comp.name}
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-bold border bg-purple-500/20 text-purple-300 border-purple-500/30">
                            ARCHIVED
                          </span>
                        </h3>
                        <div className="text-xs text-slate-400 font-mono mt-0.5">
                          Tenant ID: {comp.tenantId} • Code: {comp.code}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleRestoreCompany(comp)}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-300 border border-emerald-500/30 text-xs font-bold transition-all cursor-pointer"
                      >
                        ↩️ Undo / Restore
                      </button>

                      <button
                        onClick={() => {
                          if (confirm(`Permanently delete company ${comp.name}? This action cannot be undone.`)) {
                            handlePermanentDelete(comp.id);
                          }
                        }}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all cursor-pointer shadow-lg shadow-rose-600/20"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Permanent Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: LIMIT APPROVAL REQUESTS WORKFLOW */}
      {activeTab === 'approvals' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4 animate-in fade-in">
          <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-3">
            <FileCheck2 className="w-5 h-5 text-amber-400" />
            Client User Capacity Limit Increase Requests
          </h2>

          {pendingRequests.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-xs">
              No pending user limit requests. All client capacity requests have been processed.
            </div>
          ) : (
            <div className="space-y-3 font-mono text-xs">
              {pendingRequests.map((req) => (
                <div
                  key={req.id}
                  className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="font-bold text-slate-100 text-sm flex items-center gap-2">
                      <span>{req.companyName}</span>
                      <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono text-[10px] font-bold">
                        PENDING APPROVAL
                      </span>
                    </div>
                    <div className="text-slate-300">
                      Requested Seats: <strong className="text-emerald-400">{req.requestedUserLimit} Users</strong> • Requested By: {req.requestedBy} ({req.requestedAt})
                    </div>
                    <div className="text-slate-400 italic text-[11px]">
                      Reason: "{req.reason}"
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleApproveLimitRequest(req.companyId, req.id, true)}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/20 flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Check className="w-4 h-4" /> Approve & Increase Limit
                    </button>
                    <button
                      onClick={() => handleApproveLimitRequest(req.companyId, req.id, false)}
                      className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-600/20 flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <X className="w-4 h-4" /> Reject Request
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: DATABASE BACKUP & RESTORE */}
      {activeTab === 'backup' && <DatabaseBackupManager />}

      {/* MASTER EDIT MODAL */}
      {editingCompany && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-sm text-slate-100">Edit Master Capacity Limits ({editingCompany.name})</h3>
              <button onClick={() => setEditingCompany(null)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveMasterLimits} className="space-y-4 text-xs font-mono">
              <div>
                <label className="block text-slate-300 mb-1">User Seats Limit</label>
                <input
                  type="number"
                  value={editingCompany.userLimit}
                  onChange={(e) => setEditingCompany({ ...editingCompany, userLimit: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Branch Locations Limit</label>
                <input
                  type="number"
                  value={editingCompany.branchLimit}
                  onChange={(e) => setEditingCompany({ ...editingCompany, branchLimit: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Subscription Plan</label>
                <input
                  type="text"
                  value={editingCompany.subscriptionPlan}
                  onChange={(e) => setEditingCompany({ ...editingCompany, subscriptionPlan: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 font-bold"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingCompany(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 flex items-center gap-1.5 cursor-pointer"
                >
                  <Save className="w-4 h-4" /> Save Master Limits
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
