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
  Search,
  FileDown,
  MoreVertical,
  Wrench,
  KeyRound,
  FileText,
  ChevronDown,
  Zap
} from 'lucide-react';
import { useAuthTenant } from '../../context/AuthTenantContext';
import { auditLogger } from '../../services/auditLogger';
import { ClientCompany } from '../../types/erp';
import { DatabaseBackupManager } from './DatabaseBackupManager';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../../services/firebaseConfig';
import { getDefaultDepartmentIdsForIndustry } from '../../services/departmentCategoryMapper';
import { COMPLETE_DEPARTMENTS_CATALOGUE } from '../../services/departmentCatalogueData';
import { exportTenantsToPdf } from '../../services/tenantPdfExporter';

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

  const [searchQuery, setSearchQuery] = useState('');

  const filterCompanies = (companies: ClientCompany[]) => {
    if (!searchQuery.trim()) return companies;
    const q = searchQuery.toLowerCase().trim();
    return companies.filter(c =>
      c.name?.toLowerCase().includes(q) ||
      c.registeredName?.toLowerCase().includes(q) ||
      c.email?.toLowerCase().includes(q) ||
      c.adminEmail?.toLowerCase().includes(q) ||
      c.createdAt?.toLowerCase().includes(q) ||
      c.code?.toLowerCase().includes(q) ||
      c.tenantId?.toLowerCase().includes(q)
    );
  };

  const [deletingCompanyModal, setDeletingCompanyModal] = useState<ClientCompany | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Bulk Permanent Delete State
  const [selectedArchivedIds, setSelectedArchivedIds] = useState<string[]>([]);
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

  const toggleSelectArchived = (id: string) => {
    setSelectedArchivedIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleSelectAllArchived = () => {
    const archivedComps = allCompanies.filter(c => c.isArchived);
    if (selectedArchivedIds.length === archivedComps.length) {
      setSelectedArchivedIds([]);
    } else {
      setSelectedArchivedIds(archivedComps.map(c => c.id));
    }
  };

  const handleConfirmBulkDelete = async () => {
    if (selectedArchivedIds.length === 0) return;
    const targetComps = allCompanies.filter(c => selectedArchivedIds.includes(c.id));

    // INSTANT UI Close & Selection Reset (< 5ms)
    setSelectedArchivedIds([]);
    setIsBulkDeleteModalOpen(false);

    // Parallel Background Deletion & Audit Log
    Promise.allSettled(
      targetComps.map(comp => permanentDeleteCompany(comp.id, comp.tenantId))
    ).then(() => {
      auditLogger.logAction({
        tenantId: 'system_master',
        userId: currentUser.id,
        userName: currentUser.name,
        userRole: currentUser.role,
        actionType: 'SETTINGS_CHANGE',
        module: 'Tenant Management',
        details: `Bulk permanently deleted ${targetComps.length} archived companies: ${targetComps.map(c => c.name).join(', ')}`
      });
    }).catch(err => {
      console.warn('Bulk permanent delete background notice:', err);
    });
  };

  // Quick Actions Dropdown, Password Reset & Audit Log States
  const [openQuickMenuId, setOpenQuickMenuId] = useState<string | null>(null);
  const [resetPasswordCompany, setResetPasswordCompany] = useState<ClientCompany | null>(null);
  const [newAdminPassword, setNewAdminPassword] = useState('Client@123');
  const [viewAuditTenant, setViewAuditTenant] = useState<{ tenantId: string; name: string } | null>(null);

  const handleToggleMaintenanceMode = async (comp: ClientCompany) => {
    const isMaintenanceNow = comp.status === 'MAINTENANCE';
    const newStatus: 'ACTIVE' | 'MAINTENANCE' = isMaintenanceNow ? 'ACTIVE' : 'MAINTENANCE';

    const updatedComp = { ...comp, status: newStatus };

    setAllCompanies(prev => prev.map(c => c.id === comp.id ? updatedComp : c));

    try {
      await setDoc(doc(db, 'companies', comp.id), updatedComp, { merge: true });
    } catch (e) {
      console.warn('Firebase maintenance toggle sync error:', e);
    }

    await auditLogger.logAction({
      tenantId: 'system_master',
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      actionType: 'SETTINGS_CHANGE',
      module: 'Tenant Management',
      details: `${newStatus === 'MAINTENANCE' ? 'Enabled' : 'Disabled'} Maintenance Mode for company: ${comp.name} (${comp.code})`
    });
  };

  const handleConfirmResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetPasswordCompany || !newAdminPassword.trim()) return;

    const targetComp = resetPasswordCompany;
    const cleanPass = newAdminPassword.trim();

    const updatedComp = { ...targetComp, adminPassword: cleanPass };

    setAllCompanies(prev => prev.map(c => c.id === targetComp.id ? updatedComp : c));

    try {
      await setDoc(doc(db, 'companies', targetComp.id), updatedComp, { merge: true });
    } catch (e) {
      console.warn('Firebase password reset sync error:', e);
    }

    await auditLogger.logAction({
      tenantId: 'system_master',
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      actionType: 'SETTINGS_CHANGE',
      module: 'Tenant Management',
      details: `Reset admin password for company: ${targetComp.name} (${targetComp.code})`
    });

    setResetPasswordCompany(null);
    alert(`Admin password for ${targetComp.name} successfully updated to: ${cleanPass}`);
  };

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

  const handleConfirmPermanentDelete = async () => {
    if (!deletingCompanyModal) return;
    const targetComp = deletingCompanyModal;

    // INSTANT UI Modal Close (< 5ms)
    setDeletingCompanyModal(null);

    // Parallel Background Deletion & Audit Log
    permanentDeleteCompany(targetComp.id, targetComp.tenantId)
      .then(() => {
        auditLogger.logAction({
          tenantId: 'system_master',
          userId: currentUser.id,
          userName: currentUser.name,
          userRole: currentUser.role,
          actionType: 'SETTINGS_CHANGE',
          module: 'Tenant Management',
          details: `Permanently deleted company document & data: ${targetComp.name} (${targetComp.code})`
        });
      })
      .catch(err => {
        console.warn('Permanent delete background notice:', err);
      });
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

  const handleExportPdf = () => {
    const targetType = activeTab === 'tenants' ? 'ACTIVE' : 'ARCHIVED';
    const targetCompanies = filterCompanies(
      allCompanies.filter(c => activeTab === 'tenants' ? !c.isArchived : c.isArchived)
    );

    if (targetCompanies.length === 0) {
      alert('No companies currently listed to export.');
      return;
    }

    exportTenantsToPdf(targetCompanies, targetType, searchQuery);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl font-black text-slate-100 flex items-center gap-2">
            <Globe className="w-6 h-6 text-purple-400" />
            Master Tenant Management, Database Backup &amp; Limit Approvals
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
            Database Backup &amp; Restore
          </button>
        </div>
      </div>

      {/* SEARCH INPUT BAR & BULK EXPORT FOR TENANTS AND ARCHIVE */}
      {(activeTab === 'tenants' || activeTab === 'archive') && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-3 rounded-2xl shadow-md">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search companies by name, email, or registration date (YYYY-MM-DD)..."
              className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-purple-500 font-sans"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 p-0.5 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {searchQuery.trim() && (
              <div className="flex items-center gap-2 text-xs font-mono text-purple-300 bg-slate-950 px-3 py-2 rounded-xl border border-purple-500/30">
                <span>Filtered:</span>
                <span className="font-bold text-white">
                  {filterCompanies(allCompanies.filter(c => activeTab === 'tenants' ? !c.isArchived : c.isArchived)).length} / {allCompanies.filter(c => activeTab === 'tenants' ? !c.isArchived : c.isArchived).length}
                </span>
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="text-slate-400 hover:text-rose-400 text-[10px] underline ml-1 cursor-pointer font-sans"
                >
                  Clear
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={handleExportPdf}
              className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition shadow-lg shadow-purple-600/30 flex items-center gap-2 cursor-pointer"
              title="Generate and download PDF summary report of currently listed companies"
            >
              <FileDown className="w-4 h-4" />
              Export PDF Summary ({filterCompanies(allCompanies.filter(c => activeTab === 'tenants' ? !c.isArchived : c.isArchived)).length})
            </button>
          </div>
        </div>
      )}

      {/* TAB 1: TENANTS LIST */}
      {activeTab === 'tenants' && (
        <div className="grid grid-cols-1 gap-4 animate-in fade-in">
          {filterCompanies(allCompanies.filter(c => !c.isArchived)).length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-xs bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-800/60 border border-slate-700 flex items-center justify-center mx-auto text-slate-400">
                <Building2 className="w-6 h-6 text-purple-400" />
              </div>
              <p className="font-bold text-slate-300">
                {searchQuery.trim() ? `No active companies match "${searchQuery}"` : 'No active companies found.'}
              </p>
              <p className="text-[11px] text-slate-500">
                {searchQuery.trim() ? 'Try adjusting your search query or clear the filter.' : 'All companies are currently stored in the Archive Vault or have been deleted.'}
              </p>
              {searchQuery.trim() ? (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 inline-flex items-center gap-2 transition cursor-pointer"
                >
                  Clear Search Filter
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setActiveTab('archive')}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 inline-flex items-center gap-2 transition cursor-pointer"
                >
                  View Archived Companies ({allCompanies.filter(c => c.isArchived).length})
                </button>
              )}
            </div>
          ) : (
            filterCompanies(allCompanies.filter(c => !c.isArchived)).map((comp) => (
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
                        className={`text-[10px] px-2 py-0.5 rounded-full font-bold border flex items-center gap-1 ${
                          comp.status === 'ACTIVE'
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                            : comp.status === 'MAINTENANCE'
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                            : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                        }`}
                      >
                        {comp.status === 'MAINTENANCE' && <Wrench className="w-2.5 h-2.5 text-amber-400" />}
                        {comp.status}
                      </span>
                    </h3>
                    <div className="text-xs text-slate-400 font-mono mt-0.5 flex flex-wrap items-center gap-2">
                      <span>Tenant ID: <strong className="text-slate-200">{comp.tenantId}</strong></span>
                      <span>•</span>
                      <span>Admin Email: <strong className="text-cyan-300">{comp.adminEmail || comp.email}</strong></span>
                      <span>•</span>
                      <span>Reg Date: <strong className="text-purple-300">{comp.createdAt || '2026-11-03'}</strong></span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {/* Compact Quick Actions Dropdown */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setOpenQuickMenuId(openQuickMenuId === comp.id ? null : comp.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/40 text-xs font-bold transition-all cursor-pointer shadow-md"
                      title="Quick Shortcuts"
                    >
                      <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                      <span>Quick Actions</span>
                      <ChevronDown className="w-3 h-3 text-purple-300" />
                    </button>

                    {openQuickMenuId === comp.id && (
                      <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-slate-900 border border-purple-500/40 shadow-2xl z-30 p-1.5 space-y-1 animate-in zoom-in-95">
                        <button
                          type="button"
                          onClick={() => {
                            setOpenQuickMenuId(null);
                            setViewAuditTenant({ tenantId: comp.tenantId, name: comp.name });
                          }}
                          className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-slate-200 hover:bg-purple-950/60 hover:text-purple-300 flex items-center gap-2.5 transition cursor-pointer"
                        >
                          <FileText className="w-4 h-4 text-cyan-400 shrink-0" />
                          <div>
                            <div className="font-bold">View Audit Logs</div>
                            <div className="text-[10px] text-slate-400 font-normal">Security &amp; activity history</div>
                          </div>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setOpenQuickMenuId(null);
                            setResetPasswordCompany(comp);
                            setNewAdminPassword(comp.adminPassword || 'Client@123');
                          }}
                          className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-slate-200 hover:bg-purple-950/60 hover:text-purple-300 flex items-center gap-2.5 transition cursor-pointer"
                        >
                          <KeyRound className="w-4 h-4 text-amber-400 shrink-0" />
                          <div>
                            <div className="font-bold">Reset Admin Password</div>
                            <div className="text-[10px] text-slate-400 font-normal">Update client security password</div>
                          </div>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setOpenQuickMenuId(null);
                            handleToggleMaintenanceMode(comp);
                          }}
                          className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-slate-200 hover:bg-purple-950/60 hover:text-purple-300 flex items-center gap-2.5 transition cursor-pointer"
                        >
                          <Wrench className="w-4 h-4 text-amber-400 shrink-0" />
                          <div>
                            <div className="font-bold">
                              {comp.status === 'MAINTENANCE' ? 'Disable Maintenance' : 'Enable Maintenance'}
                            </div>
                            <div className="text-[10px] text-slate-400 font-normal">
                              {comp.status === 'MAINTENANCE' ? 'Restore live client access' : 'Show maintenance warning'}
                            </div>
                          </div>
                        </button>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => handleStartEdit(comp)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-all cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-cyan-400" /> Edit Limits &amp; Depts
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
                    onClick={() => setDeletingCompanyModal(comp)}
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
          ))
        )}
      </div>
    )}

      {/* TAB: ARCHIVE & PERMANENT DELETE */}
      {activeTab === 'archive' && (
        <div className="space-y-4 animate-in fade-in">
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-slate-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <strong>Archived Companies Vault:</strong> Archived companies remain stored safely in this vault until you click <strong>"↩️ Undo / Restore"</strong> or perform a bulk permanent deletion.
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 font-mono font-bold text-xs">
                {allCompanies.filter(c => c.isArchived).length} Archived
              </span>
            </div>
          </div>

          {allCompanies.filter(c => c.isArchived).length > 0 && (
            <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleSelectAllArchived}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold flex items-center gap-2 transition cursor-pointer"
                >
                  {selectedArchivedIds.length === allCompanies.filter(c => c.isArchived).length ? (
                    <>
                      <CheckSquare className="w-4 h-4 text-purple-400" /> Deselect All
                    </>
                  ) : (
                    <>
                      <Square className="w-4 h-4 text-slate-400" /> Select All Archived
                    </>
                  )}
                </button>

                {selectedArchivedIds.length > 0 && (
                  <span className="text-xs font-mono font-bold text-rose-400 bg-rose-500/10 px-2.5 py-1 rounded-lg border border-rose-500/20">
                    {selectedArchivedIds.length} Selected
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const allArchived = allCompanies.filter(c => c.isArchived).map(c => c.id);
                    setSelectedArchivedIds(allArchived);
                    setIsBulkDeleteModalOpen(true);
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-rose-600/20 hover:bg-rose-600/40 border border-rose-500/30 text-rose-300 font-bold flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-400" /> Purge All Archived ({allCompanies.filter(c => c.isArchived).length})
                </button>

                {selectedArchivedIds.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setIsBulkDeleteModalOpen(true)}
                    className="px-4 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black shadow-lg shadow-rose-600/30 flex items-center gap-1.5 transition cursor-pointer animate-pulse"
                  >
                    <Trash2 className="w-4 h-4" /> Bulk Permanent Delete ({selectedArchivedIds.length})
                  </button>
                )}
              </div>
            </div>
          )}

          {filterCompanies(allCompanies.filter(c => c.isArchived)).length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-xs bg-slate-900 border border-slate-800 rounded-2xl space-y-2">
              <div className="w-12 h-12 rounded-full bg-slate-800/60 border border-slate-700 flex items-center justify-center mx-auto text-slate-400">
                <Trash2 className="w-6 h-6 text-purple-400" />
              </div>
              <p className="font-bold text-slate-300">
                {searchQuery.trim() ? `No archived companies match "${searchQuery}"` : 'No archived companies currently in vault.'}
              </p>
              <p className="text-[11px] text-slate-500">
                {searchQuery.trim() ? 'Try adjusting your search query or clear the filter.' : 'Click "Archive" on any tenant card in the Tenant List to move it here.'}
              </p>
              {searchQuery.trim() && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 inline-flex items-center gap-2 transition cursor-pointer mt-2"
                >
                  Clear Search Filter
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filterCompanies(allCompanies.filter(c => c.isArchived)).map((comp) => {
                const isSelected = selectedArchivedIds.includes(comp.id);
                return (
                  <div
                    key={comp.id}
                    className={`p-5 rounded-2xl border shadow-xl space-y-3 transition-all ${
                      isSelected
                        ? 'bg-purple-950/20 border-rose-500/60 ring-1 ring-rose-500/30'
                        : 'bg-slate-900 border-purple-500/30'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectArchived(comp.id)}
                          className="w-4 h-4 rounded border-slate-700 text-rose-600 focus:ring-0 cursor-pointer"
                        />
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
                          <div className="text-xs text-slate-400 font-mono mt-0.5 flex flex-wrap items-center gap-2">
                            <span>Tenant ID: <strong className="text-slate-200">{comp.tenantId}</strong></span>
                            <span>•</span>
                            <span>Admin Email: <strong className="text-cyan-300">{comp.adminEmail || comp.email}</strong></span>
                            <span>•</span>
                            <span>Reg Date: <strong className="text-purple-300">{comp.createdAt || '2026-11-03'}</strong></span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleRestoreCompany(comp)}
                          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-300 border border-emerald-500/30 text-xs font-bold transition-all cursor-pointer shadow-lg shadow-emerald-950/20"
                          title="Restore company to active Tenant List"
                        >
                          <RotateCcw className="w-3.5 h-3.5" /> Undo / Restore
                        </button>

                        <button
                          onClick={() => setDeletingCompanyModal(comp)}
                          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all cursor-pointer shadow-lg shadow-rose-600/20"
                          title="Permanently delete company from Firestore & local storage"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Permanent Delete
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
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

      {/* PERMANENT DELETE CONFIRMATION MODAL */}
      {deletingCompanyModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-rose-500/40 rounded-3xl p-6 max-w-lg w-full space-y-6 shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-rose-500/10 via-transparent to-rose-950/20 pointer-events-none" />

            <div className="flex items-center gap-3 border-b border-slate-800 pb-4 relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 shrink-0">
                <AlertTriangle className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase text-rose-400 tracking-widest block font-mono">
                  ⚠️ Irreversible Permanent Deletion
                </span>
                <h3 className="text-base font-black text-white">
                  Permanently Delete {deletingCompanyModal.name}?
                </h3>
              </div>
            </div>

            <div className="space-y-3 text-xs relative z-10">
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 font-mono">
                <div className="flex justify-between items-center text-slate-400">
                  <span>Company Code:</span>
                  <span className="text-white font-bold">{deletingCompanyModal.code}</span>
                </div>
                <div className="flex justify-between items-center text-slate-400">
                  <span>Tenant ID:</span>
                  <span className="text-cyan-400 font-bold">{deletingCompanyModal.tenantId}</span>
                </div>
                <div className="flex justify-between items-center text-slate-400">
                  <span>Subdomain:</span>
                  <span className="text-purple-300 font-bold">{deletingCompanyModal.subdomain}</span>
                </div>
                <div className="flex justify-between items-center text-slate-400">
                  <span>Industry &amp; Plan:</span>
                  <span className="text-emerald-400 font-bold">{deletingCompanyModal.industry} ({deletingCompanyModal.subscriptionPlan})</span>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-200/90 leading-relaxed text-[11px]">
                <strong className="text-rose-400 block mb-1 font-bold uppercase">Database &amp; Storage Impact Notice:</strong>
                This action will 100% permanently remove the company document from <strong>Firebase Firestore</strong> (`companies` &amp; `tenants` collections), clear all local storage credentials, and purge user seat settings. This company will <strong>NEVER</strong> appear again in either the Tenant List or the Archive Vault.
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-800 relative z-10">
              <button
                type="button"
                onClick={() => setDeletingCompanyModal(null)}
                disabled={isDeleting}
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition cursor-pointer"
              >
                Cancel / Keep Company
              </button>

              <button
                type="button"
                onClick={handleConfirmPermanentDelete}
                disabled={isDeleting}
                className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-black transition shadow-xl shadow-rose-600/30 flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Deleting Document...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Confirm Permanent Delete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BULK PERMANENT DELETE HIGH-IMPACT CONFIRMATION MODAL */}
      {isBulkDeleteModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-2xl flex items-center justify-center p-4 animate-in zoom-in-95 duration-200">
          <div className="bg-slate-900 border-2 border-rose-500/50 rounded-3xl p-6 max-w-xl w-full space-y-6 shadow-[0_0_50px_rgba(244,63,94,0.3)] relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-rose-500/15 via-transparent to-rose-950/40 pointer-events-none" />

            <div className="flex items-center gap-4 border-b border-slate-800 pb-4 relative z-10">
              <div className="w-14 h-14 rounded-2xl bg-rose-500/20 border border-rose-500/50 flex items-center justify-center text-rose-400 shrink-0 shadow-lg shadow-rose-950/50">
                <AlertTriangle className="w-8 h-8 animate-bounce text-rose-400" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase text-rose-400 tracking-[0.2em] block font-mono">
                  🚨 HIGH-IMPACT CRITICAL BULK OPERATION
                </span>
                <h3 className="text-lg font-black text-white">
                  Permanently Purging {selectedArchivedIds.length} Archived Tenant Companies?
                </h3>
              </div>
            </div>

            <div className="space-y-4 text-xs relative z-10">
              <div className="text-slate-300 leading-relaxed font-sans">
                You are about to execute an irreversible bulk deletion. The following <strong className="text-rose-400 font-bold">{selectedArchivedIds.length} archived tenant companies</strong> will be completely removed:
              </div>

              {/* Summary List of Companies to be purged */}
              <div className="max-h-48 overflow-y-auto p-3 bg-slate-950 border border-slate-800 rounded-2xl space-y-2 font-mono">
                {allCompanies
                  .filter(c => selectedArchivedIds.includes(c.id))
                  .map((comp, idx) => (
                    <div key={comp.id} className="flex justify-between items-center bg-slate-900/80 p-2 rounded-xl border border-slate-800/80 text-[11px]">
                      <div className="flex items-center gap-2 truncate">
                        <span className="text-slate-500 font-bold">#{idx + 1}</span>
                        <span className="text-slate-100 font-bold truncate">{comp.name}</span>
                        <span className="text-slate-500">[{comp.code}]</span>
                      </div>
                      <span className="text-cyan-400 shrink-0 text-[10px]">{comp.tenantId}</span>
                    </div>
                  ))}
              </div>

              <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-200/90 leading-relaxed text-xs space-y-1">
                <strong className="text-rose-400 block font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-rose-400" /> Database &amp; Local Storage Purge Warning:
                </strong>
                <p>
                  Executing bulk deletion will permanently delete all company documents from <strong>Firebase Firestore</strong> (`companies` &amp; `tenants` collections), revoke seat licenses, and purge local storage data for all selected companies. They will <strong>NEVER</strong> appear again in either the Tenant List or the Archive Vault.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-3 border-t border-slate-800 relative z-10">
              <button
                type="button"
                onClick={() => setIsBulkDeleteModalOpen(false)}
                disabled={isBulkDeleting}
                className="w-full sm:w-auto px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition cursor-pointer"
              >
                Cancel / Keep Archived Tenants
              </button>

              <button
                type="button"
                onClick={handleConfirmBulkDelete}
                disabled={isBulkDeleting}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-black transition shadow-xl shadow-rose-600/40 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isBulkDeleting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Purging {selectedArchivedIds.length} Companies...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Confirm Bulk Permanent Delete ({selectedArchivedIds.length})
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* RESET CLIENT ADMIN PASSWORD MODAL */}
      {resetPasswordCompany && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 animate-in zoom-in-95">
          <div className="bg-slate-900 border border-purple-500/40 rounded-3xl p-6 max-w-md w-full space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-100">Reset Client Admin Password</h3>
                  <div className="text-[11px] text-slate-400 font-mono">{resetPasswordCompany.name}</div>
                </div>
              </div>
              <button
                onClick={() => setResetPasswordCompany(null)}
                className="p-1 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleConfirmResetPassword} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  New Admin Security Password
                </label>
                <input
                  type="text"
                  value={newAdminPassword}
                  onChange={(e) => setNewAdminPassword(e.target.value)}
                  required
                  placeholder="e.g. Client@123"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 font-mono focus:outline-none focus:border-purple-500"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">
                  This updates the password used by company admin logins for this tenant.
                </span>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setResetPasswordCompany(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-lg shadow-purple-600/30 flex items-center gap-1.5 cursor-pointer"
                >
                  <Save className="w-4 h-4" /> Update Admin Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TENANT AUDIT LOG VIEWER MODAL */}
      {viewAuditTenant && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-4xl w-full space-y-4 shadow-2xl max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-purple-600/20 text-purple-300 border border-purple-500/30">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-100">
                    Audit Logs &amp; Activity History
                  </h3>
                  <div className="text-[11px] text-slate-400 font-mono">
                    Tenant: <strong className="text-purple-300">{viewAuditTenant.name}</strong> • Tenant ID: <strong className="text-cyan-300">{viewAuditTenant.tenantId}</strong>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setViewAuditTenant(null)}
                className="p-1 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {auditLogger.getLogs(viewAuditTenant.tenantId).length === 0 ? (
                <div className="text-center py-12 text-slate-500 text-xs">
                  No audit log entries recorded for this tenant company yet.
                </div>
              ) : (
                <div className="space-y-2 font-mono text-xs">
                  {auditLogger.getLogs(viewAuditTenant.tenantId).map((log) => (
                    <div
                      key={log.id}
                      className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                            {log.actionType}
                          </span>
                          <span className="text-slate-300 font-bold">{log.module}</span>
                        </div>
                        <div className="text-slate-400 text-[11px] font-sans">
                          {log.details}
                        </div>
                      </div>
                      <div className="text-right shrink-0 text-[10px] text-slate-500">
                        <div>User: <span className="text-slate-300">{log.userName}</span> ({log.userRole})</div>
                        <div>{log.timestamp}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-800">
              <button
                onClick={() => setViewAuditTenant(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs cursor-pointer"
              >
                Close Log Viewer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
