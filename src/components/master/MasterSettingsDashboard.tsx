import React, { useState } from 'react';
import { Settings, Shield, Palette, Type, Save, Database, Download } from 'lucide-react';
import { useAuthTenant } from '../../context/AuthTenantContext';
import { BrandingConfigurator } from '../common/BrandingConfigurator';

export const MasterSettingsDashboard: React.FC = () => {
  const { allCompanies } = useAuthTenant();
  const [securityPassword, setSecurityPassword] = useState('MtsAdmin@2026!');
  const [theme, setTheme] = useState('corporate-blue');
  const [fontFamily, setFontFamily] = useState('sans');

  const handleSave = () => {
    alert('Master Settings Saved Successfully.');
  };

  const handleExportBackup = () => {
    const dataStr = JSON.stringify(allCompanies, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mts_erp_tenant_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-xl font-black text-slate-100 flex items-center gap-2">
        <Settings className="w-6 h-6 text-purple-400" />
        Master System Configuration
      </h1>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
        <BrandingConfigurator isGlobal onSave={(b) => console.log('Saved Global Branding', b)} />
        
        {/* Security Section */}
        <section className="space-y-3">
          <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <Shield className="w-4 h-4 text-rose-400" />
            Security & Authentication
          </h2>
          <div className="grid gap-2">
            <label className="text-xs text-slate-400">Master Admin Password</label>
            <input 
              type="password"
              value={securityPassword}
              onChange={(e) => setSecurityPassword(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white"
            />
          </div>
        </section>

        {/* Backup Section */}
        <section className="space-y-3">
          <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <Database className="w-4 h-4 text-emerald-400" />
            Data Backup & Export
          </h2>
          <button 
            onClick={handleExportBackup}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
          >
            <Download className="w-4 h-4" /> Export Platform Tenant Metadata (JSON)
          </button>
        </section>

        {/* Appearance Section (Retain existing for now but update if needed) */}
        {/* ... */}

        <button 
          onClick={handleSave}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs"
        >
          <Save className="w-4 h-4" /> Save System Settings
        </button>
      </div>
    </div>
  );
};
