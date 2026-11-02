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
  X,
  Copy,
  FolderTree,
  RotateCcw,
  CheckSquare,
  Square,
  Search
} from 'lucide-react';
import { useAuthTenant } from '../../context/AuthTenantContext';
import { auditLogger } from '../../services/auditLogger';
import { ClientCompany } from '../../types/erp';
import { DatabaseBackupManager } from './DatabaseBackupManager';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../../services/firebaseConfig';
import { getDefaultDepartmentIdsForIndustry } from '../../services/departmentCategoryMapper';
import { COMPLETE_DEPARTMENTS_CATALOGUE } from '../../services/departmentCatalogueData';

export const TenantManagement: React.FC = () => {
  const {
    allCompanies,
    setAllCompanies,
    switchTenantBySlug,
    permanentDeleteCompany,
    updateCompanyDepartments,
    currentUser
  } = useAuthTenant();
  const [activeTab, setActiveTab] = useState<'tenants' | 'approvals' | 'backup' | 'archive'>('tenants');
  const [editingCompany, setEditingCompany] = useState<ClientCompany | null>(null);
  const [editTab, setEditTab] = useState<'limits' | 'departments'>('limits');
  const [editDeptSearch, setEditDeptSearch] = useState('');
  const [editDeptView, setEditDeptView] = useState<'RECOMMENDED' | 'ALL'>('RECOMMENDED');

  const toggleStatus = (id: string) => {
    setAllCompanies(prev =>
      prev.map(c => {
        if (c.id === id) {
          const newStatus = (c.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE') as 'ACTIVE' | 'SUSPENDED' | 'INACTIVE';
          return { ...c, status: newStatus };
        }
        return c;
      })
    );
  };

  const handleArchiveCompany = async (comp: ClientCompany) => {
    const updated = { ...comp, isArchived: true, status: 'INACTIVE' as 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' };
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
    const updated = { ...comp, isArchived: false, status: 'ACTIVE' as 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' };
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

  const handleStartEdit = (comp: ClientCompany) => {
    const assigned = (comp.assignedDepartmentIds && comp.assignedDepartmentIds.length > 0)
      ? comp.assignedDepartmentIds
      : getDefaultDepartmentIdsForIndustry(comp.industry, comp.category);
    setEditingCompany({ ...comp, assignedDepartmentIds: assigned });
    setEditTab('limits');
    setEditDeptSearch('');
    setEditDeptView('RECOMMENDED');
  };

  // Master Admin saves edited limits and assigned departments directly
  const handleSaveMasterLimits = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCompany) return;

    if (editingCompany.assignedDepartmentIds) {
      await updateCompanyDepartments(editingCompany.id, editingCompany.assignedDepartmentIds);
    }

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
                    onClick={() => handleStartEdit(comp)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-all cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-cyan-400" /> Edit Limits & Departments
                  </button>

                  <button
                    onClick={() => {
                      const url = `https://mts-sap.vercel.app/login/${comp.slug}`;
                      navigator.clipboard.writeText(url);
                      alert(`URL copied: ${url}`);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-all cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5 text-cyan-400" /> Copy URL
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
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-3xl w-full space-y-4 shadow-2xl animate-in zoom-in-95 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-purple-400" />
                  Edit Enterprise Company Configuration ({editingCompany.name})
                </h3>
                <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                  Industry: <span className="text-cyan-400 font-bold">{editingCompany.industry}</span> • Category: <span className="text-purple-300">{editingCompany.category}</span>
                </div>
              </div>
              <button onClick={() => setEditingCompany(null)} className="p-1 text-slate-400 hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Internal Navigation Tabs */}
            <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
              <button
                type="button"
                onClick={() => setEditTab('limits')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  editTab === 'limits'
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                Capacity Limits & Plan
              </button>
              <button
                type="button"
                onClick={() => setEditTab('departments')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  editTab === 'departments'
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <FolderTree className="w-3.5 h-3.5 text-cyan-400" />
                Assigned Departments ({editingCompany.assignedDepartmentIds?.length || 0})
              </button>
            </div>

            <form onSubmit={handleSaveMasterLimits} className="space-y-4 text-xs font-mono flex-1 overflow-y-auto pr-1">
              {editTab === 'limits' && (
                <div className="space-y-4">
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
                </div>
              )}

              {editTab === 'departments' && (
                <div className="space-y-3 font-sans">
                  {/* Actions & Filters */}
                  <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-950/70 p-2.5 rounded-xl border border-slate-800">
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setEditDeptView('RECOMMENDED')}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          editDeptView === 'RECOMMENDED'
                            ? 'bg-purple-600 text-white'
                            : 'bg-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        Recommended for {editingCompany.industry}
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditDeptView('ALL')}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          editDeptView === 'ALL'
                            ? 'bg-purple-600 text-white'
                            : 'bg-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        All 130 Departments
                      </button>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          const rec = getDefaultDepartmentIdsForIndustry(editingCompany.industry, editingCompany.category);
                          setEditingCompany({ ...editingCompany, assignedDepartmentIds: rec });
                        }}
                        className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
                        title="Reset to industry recommended defaults"
                      >
                        <RotateCcw className="w-3 h-3 text-cyan-400" /> Reset to Recommended
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingCompany({
                            ...editingCompany,
                            assignedDepartmentIds: COMPLETE_DEPARTMENTS_CATALOGUE.map((d) => d.id)
                          });
                        }}
                        className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        <CheckSquare className="w-3 h-3 text-emerald-400" /> Select All 130
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingCompany({ ...editingCompany, assignedDepartmentIds: [] });
                        }}
                        className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        <Square className="w-3 h-3 text-rose-400" /> Deselect All
                      </button>
                    </div>
                  </div>

                  {/* Search within departments */}
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      value={editDeptSearch}
                      onChange={(e) => setEditDeptSearch(e.target.value)}
                      placeholder="Search departments..."
                      className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  {/* Department Checkboxes List */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-72 overflow-y-auto p-1 bg-slate-950/40 rounded-2xl border border-slate-800">
                    {(() => {
                      const recommendedIds = getDefaultDepartmentIdsForIndustry(editingCompany.industry, editingCompany.category);
                      let list = COMPLETE_DEPARTMENTS_CATALOGUE;
                      if (editDeptView === 'RECOMMENDED') {
                        list = list.filter((d) => recommendedIds.includes(d.id));
                      }
                      if (editDeptSearch.trim()) {
                        const q = editDeptSearch.toLowerCase();
                        list = list.filter(
                          (d) =>
                            d.name.toLowerCase().includes(q) ||
                            d.definitions.some((def) => def.toLowerCase().includes(q)) ||
                            d.forms.some((f) => f.name.toLowerCase().includes(q) || f.code.toLowerCase().includes(q)) ||
                            d.reports.some((r) => r.name.toLowerCase().includes(q) || r.code.toLowerCase().includes(q))
                        );
                      }

                      if (list.length === 0) {
                        return (
                          <div className="col-span-full py-6 text-center text-slate-500 text-xs font-mono">
                            No departments match search query.
                          </div>
                        );
                      }

                      const assignedSet = new Set(editingCompany.assignedDepartmentIds || []);

                      return list.map((dept) => {
                        const isChecked = assignedSet.has(dept.id);
                        const isRecommended = recommendedIds.includes(dept.id);

                        return (
                          <div
                            key={dept.id}
                            onClick={() => {
                              const currentIds = editingCompany.assignedDepartmentIds || [];
                              const updated = isChecked
                                ? currentIds.filter((id) => id !== dept.id)
                                : [...currentIds, dept.id];
                              setEditingCompany({ ...editingCompany, assignedDepartmentIds: updated });
                            }}
                            className={`p-2 rounded-xl border text-left text-xs transition-all cursor-pointer flex items-start gap-2 select-none ${
                              isChecked
                                ? 'bg-purple-950/40 border-purple-500/80 text-purple-100'
                                : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => {}}
                              className="mt-0.5 rounded border-slate-700 text-purple-600 focus:ring-0 cursor-pointer"
                            />
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center justify-between gap-1">
                                <span className="font-bold truncate text-[11px] text-slate-100">
                                  {dept.number}. {dept.name}
                                </span>
                                {isRecommended && (
                                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-400 border border-cyan-800/50 shrink-0 font-mono">
                                    REC
                                  </span>
                                )}
                              </div>
                              <div className="text-[10px] text-slate-500 mt-0.5 truncate font-mono">
                                {dept.definitions.length} Defs · {dept.forms.length} Forms · {dept.reports.length} Reports
                              </div>
                            </div>
                          </div>
                        );
                      });
                    })()}
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingCompany(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 flex items-center gap-1.5 cursor-pointer"
                >
                  <Save className="w-4 h-4" /> Save Configuration
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
