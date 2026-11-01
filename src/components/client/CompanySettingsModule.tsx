import React, { useState } from 'react';
import {
  Settings,
  Building2,
  Palette,
  GitBranch,
  ShieldCheck,
  CheckCircle2,
  Layers,
  Users,
  CreditCard,
  Image,
  Save,
  CheckSquare,
  Square
} from 'lucide-react';
import { useAuthTenant } from '../../context/AuthTenantContext';
import { ThemePalette, IndustryPackage } from '../../types/erp';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../../services/firebaseConfig';

export const CompanySettingsModule: React.FC = () => {
  const { currentCompany, setCurrentCompany, theme, setTheme, allBranches, isMasterPortal } = useAuthTenant();

  // Form Fields
  const [name, setName] = useState(currentCompany.name || '');
  const [registeredName, setRegisteredName] = useState(currentCompany.registeredName || currentCompany.name || '');
  const [code, setCode] = useState(currentCompany.code || '');
  const [industry, setIndustry] = useState<IndustryPackage>(currentCompany.industry || 'Manufacturing');
  const [category, setCategory] = useState(currentCompany.category || 'Commercial Enterprise');
  const [ntn, setNtn] = useState(currentCompany.ntn || '');
  const [strn, setStrn] = useState(currentCompany.strn || '');
  const [email, setEmail] = useState(currentCompany.email || '');
  const [phone, setPhone] = useState(currentCompany.phone || '');
  const [city, setCity] = useState(currentCompany.city || 'Lahore');
  const [address, setAddress] = useState(currentCompany.address || '');
  const [logoUrl, setLogoUrl] = useState(currentCompany.logoUrl || '');
  const [backgroundUrl, setBackgroundUrl] = useState(currentCompany.backgroundUrl || '');
  const [subscriptionPlan, setSubscriptionPlan] = useState(currentCompany.subscriptionPlan || 'Enterprise Standard Plan');
  const [userLimit, setUserLimit] = useState(currentCompany.userLimit || 25);
  const [branchLimit, setBranchLimit] = useState(currentCompany.branchLimit || 5);

  // Active Modules Selector
  const ALL_MODULES = [
    { id: 'finance', label: 'Finance & Accounting (COA, Vouchers, Ledger)' },
    { id: 'procurement', label: 'Procurement & Purchasing (PO, Requisitions)' },
    { id: 'inventory', label: 'Inventory & Warehouse (Stock Ledgers, GRN)' },
    { id: 'sales', label: 'Sales & Express POS Counter (Tax Invoices)' },
    { id: 'production', label: 'Production & Manufacturing (BOM, Work Orders)' },
    { id: 'hr', label: 'HR Management & Payroll (Salaries, Leave)' },
    { id: 'formBuilder', label: 'Dynamic Custom Form Builder' },
    { id: 'reports', label: 'Universal Reporting Engine' },
  ];

  const [activeModules, setActiveModules] = useState<string[]>(
    currentCompany.activeModules && currentCompany.activeModules.length > 0
      ? currentCompany.activeModules
      : ['finance', 'procurement', 'inventory', 'sales', 'production', 'hr', 'formBuilder', 'reports']
  );

  const [savedSuccess, setSavedSuccess] = useState(false);

  const toggleModule = (id: string) => {
    if (activeModules.includes(id)) {
      setActiveModules(activeModules.filter((m) => m !== id));
    } else {
      setActiveModules([...activeModules, id]);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    const updatedCompany = {
      ...currentCompany,
      name,
      registeredName,
      code,
      industry,
      category,
      ntn,
      strn,
      email,
      phone,
      city,
      address,
      logoUrl,
      backgroundUrl,
      subscriptionPlan,
      userLimit,
      branchLimit,
      activeModules,
      theme
    };

    // 1. Update React Context State
    setCurrentCompany(updatedCompany);

    // 2. Persist to Firebase Firestore
    try {
      if (currentCompany.id) {
        await setDoc(doc(db, 'companies', currentCompany.id), updatedCompany, { merge: true });
      }
    } catch (err) {
      console.warn('Could not persist updated company profile to Firebase:', err);
    }

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3500);
  };

  const themes: { id: ThemePalette; label: string }[] = [
    { id: 'corporate-blue', label: 'Corporate Blue' },
    { id: 'enterprise-dark', label: 'Enterprise Dark' },
    { id: 'professional-green', label: 'Emerald Green' },
    { id: 'royal-black-gold', label: 'Royal Black & Gold' },
    { id: 'modern-light', label: 'Modern Indigo' }
  ];

  const industries: IndustryPackage[] = [
    'Manufacturing',
    'Food & Beverage',
    'Solar & Electrical',
    'Textile',
    'Construction',
    'Wholesale',
    'Retail & POS',
    'Supermarket',
    'Import & Export',
    'Pharmaceutical',
    'Services',
    'Healthcare'
  ];

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <div className="border-b border-slate-800 pb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-100 flex items-center gap-2">
            <Settings className="w-6 h-6 text-cyan-400" />
            Company Settings & Active Department Modules
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Configure complete tenant profile, required department modules (e.g. Sales, Purchase, Accounts), FBR tax numbers, and subscription allocations.
          </p>
        </div>

        {isMasterPortal && (
          <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-bold flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            Master Admin Privileges
          </span>
        )}
      </div>

      {savedSuccess && (
        <div className="p-4 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <div>
            <div className="font-bold">Company Profile Saved Successfully</div>
            <div className="text-[11px] opacity-90">All active department module permissions, branding, and tax profiles updated across the system.</div>
          </div>
        </div>
      )}

      <form onSubmit={handleSave} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-8">
        {/* Section 1: Active Department Modules Selection */}
        <div className="space-y-4 border-b border-slate-800 pb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-2">
                <Layers className="w-4 h-4" />
                Active Department Modules Selection
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Enable only required modules for this business (e.g., small retail shops enable Sales, Procurement, Accounts; factories enable all).
              </p>
            </div>
            <button
              type="button"
              onClick={() => setActiveModules(ALL_MODULES.map((m) => m.id))}
              className="text-[11px] font-bold text-cyan-400 hover:underline"
            >
              Select All
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {ALL_MODULES.map((mod) => {
              const isChecked = activeModules.includes(mod.id);
              return (
                <button
                  type="button"
                  key={mod.id}
                  onClick={() => toggleModule(mod.id)}
                  className={`p-3.5 rounded-xl border text-left text-xs transition-all flex items-start gap-3 ${
                    isChecked
                      ? 'bg-cyan-950/40 border-cyan-500/60 text-slate-100 shadow-md'
                      : 'bg-slate-800/40 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  {isChecked ? (
                    <CheckSquare className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  ) : (
                    <Square className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <div className="font-bold">{mod.label}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      {isChecked ? 'Enabled for Company Sidebar' : 'Disabled'}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Section 2: Complete Company Registration Details */}
        <div className="space-y-4 border-b border-slate-800 pb-6">
          <h2 className="text-sm font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-2">
            <Building2 className="w-4 h-4" />
            Complete Business Identity & FBR Credentials
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Company Trade Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-100"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Registered Corporate Title</label>
              <input
                type="text"
                value={registeredName}
                onChange={(e) => setRegisteredName(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-100"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Industry Package</label>
              <select
                value={industry}
                onChange={(e) => setIndustry(e.target.value as IndustryPackage)}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-100"
              >
                {industries.map((ind) => (
                  <option key={ind} value={ind}>
                    {ind}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Company Code / Prefix</label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-100 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">FBR NTN Tax Registration Number</label>
              <input
                type="text"
                value={ntn}
                onChange={(e) => setNtn(e.target.value)}
                placeholder="e.g. 2840192-3"
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-100 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">FBR STRN Sales Tax Number</label>
              <input
                type="text"
                value={strn}
                onChange={(e) => setStrn(e.target.value)}
                placeholder="e.g. 327787123901"
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-100 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Official Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-100"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Contact Phone</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-100"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">City</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-100"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Registered Address</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-100"
            />
          </div>
        </div>

        {/* Section 3: Subscription & User Limits */}
        <div className="space-y-4 border-b border-slate-800 pb-6">
          <h2 className="text-sm font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-2">
            <CreditCard className="w-4 h-4" />
            Subscription & Capacity Limits
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Subscription Plan</label>
              <input
                type="text"
                value={subscriptionPlan}
                onChange={(e) => setSubscriptionPlan(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-100 font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">User Limit</label>
              <input
                type="number"
                value={userLimit}
                onChange={(e) => setUserLimit(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-100 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Branch Limit</label>
              <input
                type="number"
                value={branchLimit}
                onChange={(e) => setBranchLimit(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-100 font-mono"
              />
            </div>
          </div>
        </div>

        {/* Section 4: Branding Assets & Theme Palette */}
        <div className="space-y-4 border-b border-slate-800 pb-6">
          <h2 className="text-sm font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-2">
            <Palette className="w-4 h-4" />
            Branding Assets & UI Theme
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Logo URL (Login Portal & Invoices)</label>
              <input
                type="text"
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
                placeholder="/public/assets/aistudio/logo.png"
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-100"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Scenic Background Image URL</label>
              <input
                type="text"
                value={backgroundUrl}
                onChange={(e) => setBackgroundUrl(e.target.value)}
                placeholder="/public/assets/aistudio/bg.png"
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-100"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">Theme Palette Accent</label>
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
        </div>

        {/* Action Button */}
        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            className="px-8 py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs shadow-xl shadow-cyan-600/30 flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            Save Complete Company Settings
          </button>
        </div>
      </form>
    </div>
  );
};
