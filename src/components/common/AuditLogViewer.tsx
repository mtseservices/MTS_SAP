import React, { useState, useEffect } from 'react';
import { ShieldAlert, Search, Download, Filter, Clock, UserCheck, Activity } from 'lucide-react';
import { useAuthTenant } from '../../context/AuthTenantContext';
import { auditLogger } from '../../services/auditLogger';
import { AuditLogEntry } from '../../types/erp';
import { DataTable } from './DataTable';
import { TTSButton } from './TTSButton';

export const AuditLogViewer: React.FC = () => {
  const { isMasterPortal, currentCompany } = useAuthTenant();
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [selectedModule, setSelectedModule] = useState<string>('ALL');

  useEffect(() => {
    auditLogger.subscribe((allLogs) => {
      const tenantLogs = auditLogger.getLogs(isMasterPortal ? undefined : currentCompany.tenantId);
      setLogs(tenantLogs);
    });
  }, [isMasterPortal, currentCompany.tenantId]);

  const filteredLogs = selectedModule === 'ALL'
    ? logs
    : logs.filter(l => l.module === selectedModule);

  const auditSpeech = `Audit Log Tracking Module for ${isMasterPortal ? 'Master Central System' : currentCompany.name}. Recorded total security logs: ${filteredLogs.length}. All logins, voucher entries, and settings changes logged with IP addresses and user roles.`;

  const badgeColors: Record<string, string> = {
    LOGIN: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
    LOGOUT: 'bg-slate-800 text-slate-400 border-slate-700',
    NAVIGATION: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    DATA_CREATE: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    DATA_EDIT: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    DATA_DELETE: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
    APPROVAL: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    SETTINGS_CHANGE: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl font-black text-slate-100 flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-purple-400" />
            System Security Audit Log Tracking
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Immutable tracking of user logins, module navigations, financial postings, purchase orders, and system settings modifications.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <TTSButton text={auditSpeech} label="Audit Briefing" />
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-3 rounded-xl text-xs font-semibold">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-purple-400" />
          <span className="text-slate-300">Filter by Module:</span>
          <select
            value={selectedModule}
            onChange={(e) => setSelectedModule(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-slate-200"
          >
            <option value="ALL">All System Modules</option>
            <option value="Authentication">Authentication / Login</option>
            <option value="Finance & Accounts">Finance & Accounts</option>
            <option value="Procurement">Procurement & Orders</option>
            <option value="Inventory">Inventory Control</option>
            <option value="Master Control">Master Control</option>
          </select>
        </div>

        <div className="text-slate-400 font-mono text-[11px]">
          Showing {filteredLogs.length} audit entries
        </div>
      </div>

      <DataTable
        title="Security Audit Trail"
        data={filteredLogs}
        columns={[
          { key: 'timestamp', header: 'Timestamp', accessor: (l) => <span className="font-mono text-slate-300 text-[11px]">{new Date(l.timestamp).toLocaleString()}</span>, sortable: true },
          { key: 'actionType', header: 'Action Type', accessor: (l) => (
            <span className={`px-2 py-0.5 rounded font-mono font-bold text-[10px] border ${badgeColors[l.actionType] || 'bg-slate-800 text-slate-300'}`}>
              {l.actionType}
            </span>
          ), sortable: true },
          { key: 'userName', header: 'User', accessor: (l) => (
            <div>
              <div className="font-bold text-slate-100">{l.userName}</div>
              <div className="text-[10px] text-purple-300 font-mono">{l.userRole}</div>
            </div>
          ), sortable: true },
          { key: 'module', header: 'Module', accessor: (l) => <span className="px-2 py-0.5 rounded bg-slate-800 text-cyan-300 font-semibold text-[10px]">{l.module}</span>, sortable: true },
          { key: 'details', header: 'Action Activity Details', accessor: (l) => <span className="text-slate-200 font-sans text-xs">{l.details}</span> },
          { key: 'ipAddress', header: 'IP Address', accessor: (l) => <span className="font-mono text-slate-400 text-[11px]">{l.ipAddress}</span> }
        ]}
      />
    </div>
  );
};
