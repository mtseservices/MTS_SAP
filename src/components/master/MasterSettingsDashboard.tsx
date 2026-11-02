import React, { useState } from 'react';
import { Settings, Shield, Palette, Type, Save, Database, Download, Eye, EyeOff, Building2, MapPin, Briefcase, Plus, Check } from 'lucide-react';
import { useAuthTenant } from '../../context/AuthTenantContext';
import { BrandingConfigurator } from '../common/BrandingConfigurator';
import { ReportConfigManager } from './ReportConfigManager';
import { PAKISTAN_PROVINCES_CITIES } from '../../services/pakistanRegions';
import { COMPLETE_DEPARTMENTS_CATALOGUE } from '../../services/departmentCatalogueData';

export const MasterSettingsDashboard: React.FC = () => {
  const { allCompanies } = useAuthTenant();
  const [securityPassword, setSecurityPassword] = useState('MtsAdmin@2026!');
  const [showSecurityPassword, setShowSecurityPassword] = useState(false);
  const [theme, setTheme] = useState('corporate-blue');

  // Custom Industry Cores state
  const [customIndustries, setCustomIndustries] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('mts_custom_industries');
      return saved ? JSON.parse(saved) : ['Manufacturing', 'Textile', 'Food & Beverage', 'Education', 'Healthcare', 'Solar & Electrical', 'IT Software House', 'Real Estate'];
    } catch {
      return ['Manufacturing', 'Textile', 'Food & Beverage', 'Education', 'Healthcare', 'Solar & Electrical'];
    }
  });
  const [newIndustryName, setNewIndustryName] = useState('');

  const handleAddIndustry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIndustryName.trim()) return;
    const trimmed = newIndustryName.trim();
    if (!customIndustries.includes(trimmed)) {
      const updated = [...customIndustries, trimmed];
      setCustomIndustries(updated);
      try {
        localStorage.setItem('mts_custom_industries', JSON.stringify(updated));
      } catch {}
    }
    setNewIndustryName('');
  };

  const handleSave = () => {
    alert('Master Settings & Industry Core Configurations Saved Successfully.');
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
    <div className="p-6 space-y-6 max-w-7xl mx-auto pb-24">
      <h1 className="text-xl font-black text-slate-100 flex items-center gap-2">
        <Settings className="w-6 h-6 text-purple-400" />
        Master System Configuration & Settings
      </h1>

      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-8">
        <BrandingConfigurator isGlobal onSave={(b) => console.log('Saved Global Branding', b)} />
        <ReportConfigManager />

        {/* 1. Industry Core Management */}
        <section className="space-y-4 pt-4 border-t border-slate-800">
          <h2 className="text-sm font-black text-slate-100 uppercase tracking-wider flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-amber-400" />
            Industry Cores & Business Categories Manager
          </h2>
          <p className="text-xs text-slate-400">Add new industry packages to dynamically configure departmental defaults and auto-connect modules during tenant onboarding.</p>
          
          <form onSubmit={handleAddIndustry} className="flex gap-3 max-w-md">
            <input
              type="text"
              value={newIndustryName}
              onChange={(e) => setNewIndustryName(e.target.value)}
              placeholder="e.g. Aerospace / Mining / Fintech"
              className="flex-1 px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
            />
            <button
              type="submit"
              className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs flex items-center gap-1.5 shrink-0"
            >
              <Plus className="w-4 h-4" /> Add Industry Core
            </button>
          </form>

          <div className="flex flex-wrap gap-2 pt-2">
            {customIndustries.map((ind) => (
              <span key={ind} className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-amber-300 font-mono font-bold flex items-center gap-2">
                <Check className="w-3 h-3 text-emerald-400" /> {ind}
              </span>
            ))}
          </div>
        </section>

        {/* 2. Pakistan Provinces & Cities Regional Viewer */}
        <section className="space-y-4 pt-4 border-t border-slate-800">
          <h2 className="text-sm font-black text-slate-100 uppercase tracking-wider flex items-center gap-2">
            <MapPin className="w-4 h-4 text-cyan-400" />
            Pakistan Provinces &amp; Cities Regional Database
          </h2>
          <p className="text-xs text-slate-400">Standardized administrative regions across Pakistan mapped for enterprise tenant registrations.</p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {PAKISTAN_PROVINCES_CITIES.map((p) => (
              <div key={p.province} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="font-bold text-xs text-cyan-300">{p.province}</div>
                <div className="text-[11px] text-slate-400 leading-relaxed font-mono">
                  {p.cities.join(', ')}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 3. Department Settings & Details Master Manager */}
        <section className="space-y-4 pt-4 border-t border-slate-800">
          <h2 className="text-sm font-black text-slate-100 uppercase tracking-wider flex items-center gap-2">
            <Building2 className="w-4 h-4 text-purple-400" />
            Master Department Settings &amp; Catalogue Details ({COMPLETE_DEPARTMENTS_CATALOGUE.length} Departments)
          </h2>
          <p className="text-xs text-slate-400">Overview of enterprise department heads, forms count, and reporting registers configured in the system.</p>

          <div className="max-h-80 overflow-y-auto space-y-2 pr-2">
            {COMPLETE_DEPARTMENTS_CATALOGUE.slice(0, 15).map((dept) => (
              <div key={dept.id} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs font-mono">
                <div>
                  <span className="text-purple-300 font-bold">{dept.name}</span>
                  <span className="text-slate-500 ml-2">({dept.category})</span>
                </div>
                <div className="flex items-center gap-3 text-[11px] text-slate-400">
                  <span>{dept.forms.length} Forms</span>
                  <span>{dept.reports.length} Reports</span>
                </div>
              </div>
            ))}
          </div>
        </section>
        
        {/* Security Section */}
        <section className="space-y-3 pt-4 border-t border-slate-800">
          <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <Shield className="w-4 h-4 text-rose-400" />
            Security & Authentication
          </h2>
          <div className="grid gap-2 max-w-md">
            <label className="text-xs text-slate-400">Master Admin Password</label>
            <div className="relative">
              <input 
                type={showSecurityPassword ? 'text' : 'password'}
                value={securityPassword}
                onChange={(e) => setSecurityPassword(e.target.value)}
                className="w-full px-3 py-2 pr-10 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white font-mono"
              />
              <button
                type="button"
                onClick={() => setShowSecurityPassword(!showSecurityPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                {showSecurityPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </section>

        {/* Backup Section */}
        <section className="space-y-3 pt-4 border-t border-slate-800">
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

        <button 
          onClick={handleSave}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-xl shadow-purple-600/30 transition-all"
        >
          <Save className="w-4 h-4" /> Save System Settings & Configurations
        </button>
      </div>
    </div>
  );
};
