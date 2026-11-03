import React, { useState } from 'react';
import {
  Briefcase,
  Plus,
  CheckCircle2,
  Layers,
  Sparkles,
  Building2,
  Trash2
} from 'lucide-react';
import { INDUSTRY_DEPARTMENT_PRESETS } from '../../services/departmentCategoryMapper';
import { COMPLETE_DEPARTMENTS_CATALOGUE } from '../../services/departmentCatalogueData';

export const IndustryCoreManager: React.FC = () => {
  const [industries, setIndustries] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('mts_industry_cores');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return Object.keys(INDUSTRY_DEPARTMENT_PRESETS);
  });

  const [newIndustryName, setNewIndustryName] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState<string>(industries[0] || 'Manufacturing');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleAddIndustry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIndustryName.trim()) return;
    const trimmed = newIndustryName.trim();
    if (!industries.includes(trimmed)) {
      const updated = [...industries, trimmed];
      setIndustries(updated);
      try {
        localStorage.setItem('mts_industry_cores', JSON.stringify(updated));
      } catch {}
      setSelectedIndustry(trimmed);
      setSuccessMsg(`Industry Core "${trimmed}" successfully created with AI auto-module mapping.`);
      setTimeout(() => setSuccessMsg(null), 4000);
    }
    setNewIndustryName('');
  };

  const assignedDeptIds = INDUSTRY_DEPARTMENT_PRESETS[selectedIndustry] || ['dept_1', 'dept_2', 'dept_4', 'dept_3', 'dept_5'];
  const assignedDepts = COMPLETE_DEPARTMENTS_CATALOGUE.filter(d => assignedDeptIds.includes(d.id));

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto pb-24">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-gradient-to-r from-amber-950/60 via-slate-900 to-slate-900 border border-amber-800/40 p-6 rounded-3xl shadow-2xl">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <Briefcase className="w-6 h-6 text-amber-400" />
            <h1 className="text-xl font-black text-slate-100 tracking-tight">
              Master Industry Core &amp; AI Module Mapping Manager
            </h1>
          </div>
          <p className="text-xs text-slate-400 max-w-2xl">
            Create and categorize specific industry cores (Import/Export, Hotel Management, Retail, IT Services, etc.). Selecting an industry automatically dictates the default active modules and department mappings during the company registration wizard.
          </p>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-3 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          {successMsg}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Create & List Industry Cores */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
          <h2 className="text-sm font-black text-slate-100 uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-4">
            <Plus className="w-4 h-4 text-amber-400" />
            Add New Industry Core
          </h2>

          <form onSubmit={handleAddIndustry} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Industry Package Name</label>
              <input
                type="text"
                value={newIndustryName}
                onChange={(e) => setNewIndustryName(e.target.value)}
                placeholder="e.g. Hotel Management, Shopping Malls..."
                className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
              />
            </div>
            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-amber-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Create &amp; Map Industry Core
            </button>
          </form>

          <div className="space-y-2 pt-4 border-t border-slate-800">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Configured Industries ({industries.length})</label>
            <div className="max-h-96 overflow-y-auto space-y-1.5 pr-2">
              {industries.map((ind) => {
                const isSelected = ind === selectedIndustry;
                return (
                  <button
                    key={ind}
                    onClick={() => setSelectedIndustry(ind)}
                    className={`w-full p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                      isSelected ? 'bg-amber-500/10 border-amber-500/50 text-amber-100 shadow-md' : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <span className="text-xs font-bold">{ind}</span>
                    <Sparkles className={`w-3.5 h-3.5 ${isSelected ? 'text-amber-400' : 'text-slate-600'}`} />
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: AI Auto-Mapping Preview for Selected Industry */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-sm font-black text-slate-100 uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                AI Module &amp; Department Mapping for: <span className="text-amber-300">{selectedIndustry}</span>
              </h2>
              <p className="text-[10px] text-slate-500 mt-0.5">Automatic department and form bindings generated for company registration.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-3">
              <h3 className="text-[11px] font-black text-cyan-400 uppercase tracking-wider flex items-center gap-2">
                <Layers className="w-4 h-4" /> AI Auto-Selected Modules
              </h3>
              <div className="space-y-2 text-xs font-mono">
                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200">✓ Finance &amp; Accounts (General Ledger)</div>
                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200">✓ Procurement &amp; Purchasing</div>
                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200">✓ Inventory &amp; Warehouse Control</div>
                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200">✓ Sales &amp; POS Counter</div>
                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200">✓ HR &amp; Payroll Management</div>
              </div>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-3">
              <h3 className="text-[11px] font-black text-purple-400 uppercase tracking-wider flex items-center gap-2">
                <Building2 className="w-4 h-4" /> Mapped Departments ({assignedDepts.length})
              </h3>
              <div className="space-y-1.5 max-h-64 overflow-y-auto pr-2">
                {assignedDepts.map(dept => (
                  <div key={dept.id} className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300 flex items-center justify-between">
                    <span>{dept.name}</span>
                    <span className="text-[10px] text-purple-400">{dept.category}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
