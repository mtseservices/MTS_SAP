import React, { useState } from 'react';
import { Settings, Building2, Palette, GitBranch, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { useAuthTenant } from '../../context/AuthTenantContext';
import { ThemePalette } from '../../types/erp';

export const CompanySettingsModule: React.FC = () => {
  const { currentCompany, setCurrentCompany, theme, setTheme, allBranches } = useAuthTenant();

  const [companyName, setCompanyName] = useState(currentCompany.name);
  const [ntn, setNtn] = useState(currentCompany.ntn);
  const [strn, setStrn] = useState(currentCompany.strn);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentCompany({
      ...currentCompany,
      name: companyName,
      ntn,
      strn,
      theme
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const themes: { id: ThemePalette; label: string }[] = [
    { id: 'corporate-blue', label: 'Corporate Blue' },
    { id: 'enterprise-dark', label: 'Enterprise Dark' },
    { id: 'professional-green', label: 'Emerald Green' },
    { id: 'royal-black-gold', label: 'Royal Black & Gold' },
    { id: 'modern-light', label: 'Modern Indigo' }
  ];

  return (
    <div className="p-6 space-y-6 max-w-3xl mx-auto">
      <div className="border-b border-slate-800 pb-4">
        <h1 className="text-xl font-black text-slate-100 flex items-center gap-2">
          <Settings className="w-6 h-6 text-cyan-400" />
          Company Profile, Theme & Branch Settings
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Customize company branding, active theme palette, FBR tax credentials, and branch locations.
        </p>
      </div>

      {savedSuccess && (
        <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" /> Company profile settings saved successfully!
        </div>
      )}

      <form onSubmit={handleSave} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6">
        <div className="space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-cyan-400">Company Identity</h2>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Company Display Name</label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-100"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">FBR NTN Tax Number</label>
              <input
                type="text"
                value={ntn}
                onChange={(e) => setNtn(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-100 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">FBR STRN Sales Tax Number</label>
              <input
                type="text"
                value={strn}
                onChange={(e) => setStrn(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-100 font-mono"
              />
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-cyan-400">Theme Palette</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {themes.map((t) => (
              <button
                type="button"
                key={t.id}
                onClick={() => setTheme(t.id)}
                className={`p-3 rounded-xl border text-xs font-semibold text-left transition-all ${
                  theme === t.id
                    ? 'bg-cyan-600/20 border-cyan-500 text-cyan-200'
                    : 'bg-slate-800/60 border-slate-700 text-slate-400'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-cyan-400">Registered Branch Locations</h2>
          <div className="space-y-2">
            {allBranches.map((br) => (
              <div key={br.id} className="p-3 rounded-xl bg-slate-800/60 border border-slate-700 text-xs font-mono flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-100">{br.name} ({br.code})</div>
                  <div className="text-slate-400">{br.address}, {br.city}</div>
                </div>
                {br.isMain && (
                  <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold text-[10px]">
                    Main Head Office
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="pt-3 border-t border-slate-800 flex justify-end">
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-lg shadow-cyan-600/30"
          >
            Save Company Settings
          </button>
        </div>
      </form>
    </div>
  );
};
