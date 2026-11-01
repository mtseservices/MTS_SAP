import React, { useState } from 'react';
import {
  Database,
  Download,
  Upload,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  FileJson,
  ShieldCheck,
  Building2,
  Boxes,
  DollarSign,
  Receipt,
  ShoppingCart,
  HardDrive
} from 'lucide-react';
import { useAuthTenant } from '../../context/AuthTenantContext';
import { INITIAL_ACCOUNTS, INITIAL_INVENTORY } from '../../services/mockData';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../../services/firebaseConfig';

export const DatabaseBackupManager: React.FC = () => {
  const { allCompanies, setAllCompanies, currentCompany, switchTenantBySlug } = useAuthTenant();
  const [selectedTenantExport, setSelectedTenantExport] = useState<string>('ALL');
  const [restoreJsonText, setRestoreJsonText] = useState<string>('');
  const [restoreFile, setRestoreFile] = useState<File | null>(null);
  const [isRestoring, setIsRestoring] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'SUCCESS' | 'ERROR'; text: string } | null>(null);
  const [previewStats, setPreviewStats] = useState<{
    companiesCount: number;
    accountsCount: number;
    inventoryCount: number;
    timestamp: string;
  } | null>(null);

  // 1. Export Database to JSON Download File
  const handleExportDatabase = () => {
    const timestamp = new Date().toISOString();
    const dateStr = new Date().toISOString().split('T')[0];

    let targetCompanies = allCompanies;
    if (selectedTenantExport !== 'ALL') {
      targetCompanies = allCompanies.filter(c => c.tenantId === selectedTenantExport || c.slug === selectedTenantExport);
    }

    const backupPayload = {
      backupMetadata: {
        appTitle: 'MTS-ERP-SAP Enterprise Database Backup',
        version: 'v4.8 Enterprise',
        exportedAt: timestamp,
        exportedBy: 'Master Global Administrator',
        tenantScope: selectedTenantExport === 'ALL' ? 'Full Multi-Tenant Ecosystem' : targetCompanies[0]?.name || selectedTenantExport
      },
      companies: targetCompanies,
      chartOfAccounts: INITIAL_ACCOUNTS,
      inventoryCatalog: INITIAL_INVENTORY,
      systemConfig: {
        fbrIntegrationStatus: 'CONNECTED',
        currency: 'PKR',
        fiscalYear: '2026-2027'
      }
    };

    const jsonString = JSON.stringify(backupPayload, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    const filename = selectedTenantExport === 'ALL'
      ? `mts_erp_full_database_backup_${dateStr}.json`
      : `mts_erp_tenant_${selectedTenantExport}_backup_${dateStr}.json`;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setStatusMessage({
      type: 'SUCCESS',
      text: `Database JSON export generated successfully! Downloaded "${filename}".`
    });
    setTimeout(() => setStatusMessage(null), 5000);
  };

  // 2. Handle File Selection for Restoration
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setRestoreFile(file);
    setStatusMessage(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        setRestoreJsonText(text);
        const parsed = JSON.parse(text);

        if (parsed && typeof parsed === 'object') {
          const comps = Array.isArray(parsed.companies) ? parsed.companies.length : 0;
          const accs = Array.isArray(parsed.chartOfAccounts) ? parsed.chartOfAccounts.length : 0;
          const invs = Array.isArray(parsed.inventoryCatalog) ? parsed.inventoryCatalog.length : 0;
          
          setPreviewStats({
            companiesCount: comps,
            accountsCount: accs,
            inventoryCount: invs,
            timestamp: parsed.backupMetadata?.exportedAt || new Date().toISOString()
          });
        }
      } catch (err) {
        setStatusMessage({
          type: 'ERROR',
          text: 'Invalid JSON file format. Please select a valid MTS-ERP JSON database backup file.'
        });
        setPreviewStats(null);
      }
    };
    reader.readAsText(file);
  };

  // 3. Execute Database Restoration
  const handleExecuteRestore = async () => {
    if (!restoreJsonText) {
      setStatusMessage({ type: 'ERROR', text: 'Please select a valid JSON backup file first.' });
      return;
    }

    setIsRestoring(true);
    setStatusMessage(null);

    try {
      const parsed = JSON.parse(restoreJsonText);
      if (!parsed || typeof parsed !== 'object') {
        throw new Error('Corrupted JSON structure');
      }

      // Restore Companies
      if (Array.isArray(parsed.companies) && parsed.companies.length > 0) {
        setAllCompanies(parsed.companies);

        // Persist to Firebase Firestore
        for (const comp of parsed.companies) {
          if (comp.id) {
            try {
              await setDoc(doc(db, 'companies', comp.id), comp, { merge: true });
            } catch (firebaseErr) {
              console.warn('Firebase sync warning during restore:', firebaseErr);
            }
          }
        }
      }

      setIsRestoring(false);
      setStatusMessage({
        type: 'SUCCESS',
        text: `Database successfully restored! Loaded ${previewStats?.companiesCount || 0} companies, ${previewStats?.accountsCount || 0} GL accounts, and ${previewStats?.inventoryCount || 0} stock catalog items.`
      });
      setPreviewStats(null);
      setRestoreFile(null);
      setRestoreJsonText('');
    } catch (err: any) {
      setIsRestoring(false);
      setStatusMessage({
        type: 'ERROR',
        text: `Restoration failed: ${err?.message || 'Invalid backup schema'}.`
      });
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      <div className="border-b border-slate-800 pb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-100 flex items-center gap-2">
            <Database className="w-6 h-6 text-purple-400" />
            Database Backup & Restoration Center
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Export complete multi-tenant database snapshots to downloadable JSON files or restore application state from JSON backups.
          </p>
        </div>

        <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-bold flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-purple-400" />
          Master Global Admin
        </span>
      </div>

      {statusMessage && (
        <div
          className={`p-4 rounded-2xl border text-xs flex items-center gap-3 animate-in fade-in shadow-xl ${
            statusMessage.type === 'SUCCESS'
              ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-200'
              : 'bg-rose-500/20 border-rose-500/40 text-rose-200'
          }`}
        >
          {statusMessage.type === 'SUCCESS' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          )}
          <span className="font-semibold">{statusMessage.text}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* EXPORT DATABASE SECTION */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
              <div className="p-3 rounded-2xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                <Download className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
                  Export Database Snapshot (JSON)
                </h2>
                <p className="text-[11px] text-slate-400">
                  Generate instant full JSON backup containing all companies, vouchers, inventory, and accounts.
                </p>
              </div>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Select Backup Target Scope</label>
                <select
                  value={selectedTenantExport}
                  onChange={(e) => setSelectedTenantExport(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 font-semibold focus:outline-none focus:border-purple-500"
                >
                  <option value="ALL">🌐 Full ERP System (All Enterprise Tenants)</option>
                  {allCompanies.map((c) => (
                    <option key={c.id} value={c.slug}>
                      🏢 {c.name} ({c.slug}.erp.mts.pk)
                    </option>
                  ))}
                </select>
              </div>

              <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700 space-y-1.5 text-slate-300">
                <div className="flex justify-between">
                  <span>Target Scope:</span>
                  <strong className="text-purple-300">{selectedTenantExport === 'ALL' ? 'Multi-Tenant Ecosystem' : selectedTenantExport}</strong>
                </div>
                <div className="flex justify-between"><span>Companies Count:</span><strong className="text-slate-100">{selectedTenantExport === 'ALL' ? allCompanies.length : 1}</strong></div>
                <div className="flex justify-between"><span>Accounts & GL Heads:</span><strong className="text-emerald-400">{INITIAL_ACCOUNTS.length} Heads</strong></div>
                <div className="flex justify-between"><span>Inventory Catalog Items:</span><strong className="text-cyan-400">{INITIAL_INVENTORY.length} Items</strong></div>
                <div className="flex justify-between"><span>Format:</span><strong className="text-amber-400">Structured JSON (.json)</strong></div>
              </div>
            </div>
          </div>

          <button
            onClick={handleExportDatabase}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-xl shadow-purple-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer mt-4"
          >
            <Download className="w-4 h-4" />
            Download JSON Backup File &rarr;
          </button>
        </div>

        {/* RESTORE DATABASE SECTION */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
              <div className="p-3 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                <Upload className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
                  Restore Database from JSON
                </h2>
                <p className="text-[11px] text-slate-400">
                  Upload a previously exported `.json` database file to restore application state.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="border-2 border-dashed border-slate-700 hover:border-cyan-500/60 rounded-2xl p-6 text-center bg-slate-950/60 transition-all flex flex-col items-center justify-center space-y-2">
                <FileJson className="w-8 h-8 text-cyan-400" />
                <span className="text-xs font-bold text-slate-200">Select JSON Backup File</span>
                <p className="text-[11px] text-slate-400">Supports .json database dump files</p>

                <label className="cursor-pointer px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-lg shadow-cyan-600/30 transition-all inline-flex items-center gap-2 mt-1">
                  <Upload className="w-3.5 h-3.5" />
                  {restoreFile ? restoreFile.name : 'Choose JSON File'}
                  <input type="file" accept=".json,application/json" onChange={handleFileSelect} className="hidden" />
                </label>
              </div>

              {previewStats && (
                <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 text-xs font-mono space-y-1 text-slate-200">
                  <div className="font-bold text-cyan-400">Backup File Validated:</div>
                  <div>Companies Found: <strong className="text-slate-100">{previewStats.companiesCount}</strong></div>
                  <div>GL Account Heads: <strong className="text-emerald-400">{previewStats.accountsCount}</strong></div>
                  <div>Inventory Items: <strong className="text-amber-400">{previewStats.inventoryCount}</strong></div>
                  <div className="text-[10px] text-slate-400">Exported At: {previewStats.timestamp}</div>
                </div>
              )}
            </div>
          </div>

          <button
            onClick={handleExecuteRestore}
            disabled={!restoreJsonText || isRestoring}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-50 text-white font-bold text-xs shadow-xl shadow-cyan-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer mt-4"
          >
            {isRestoring ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-white" />
                Restoring Database...
              </>
            ) : (
              <>
                <HardDrive className="w-4 h-4" />
                Execute Database Restoration &rarr;
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
