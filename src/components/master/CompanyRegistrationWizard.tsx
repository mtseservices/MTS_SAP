import React, { useState } from 'react';
import {
  Building2,
  Globe,
  SlidersHorizontal,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  Check,
  User,
  Lock,
  Mail,
  Phone,
  MapPin,
  Sparkles,
  LogIn,
  Key
} from 'lucide-react';
import { useAuthTenant } from '../../context/AuthTenantContext';
import { IndustryPackage, ThemePalette } from '../../types/erp';

interface CompanyRegistrationWizardProps {
  onSuccess: (slug: string) => void;
}

export const CompanyRegistrationWizard: React.FC<CompanyRegistrationWizardProps> = ({
  onSuccess
}) => {
  const { registerNewCompany, switchTenantBySlug } = useAuthTenant();

  const [formData, setFormData] = useState({
    name: 'Gourmet Bakers & Confectionery',
    registeredName: 'Gourmet Foods Private Limited',
    code: 'GBC004',
    slug: 'gourmet',
    industry: 'Food & Beverage' as IndustryPackage,
    category: 'Food Processing & Retail Chain',
    ntn: '3819201-4',
    strn: '1029384756123',
    email: 'info@gourmet.pk',
    phone: '+92-42-35711200',
    address: '15-G, Gulberg III',
    city: 'Lahore',
    province: 'Punjab',
    currency: 'PKR',
    fiscalYearStart: 'July 1st (Pakistan FY)',
    taxExempt: false,
    primaryContact: 'Zahoor Ahmad - Director Operations',
    subscriptionPlan: 'Enterprise' as const,
    userLimit: 50,
    branchLimit: 10,
    billingCycle: 'Annual (20% Savings)',
    adminName: 'Zahoor Ahmad',
    adminEmail: 'admin@gourmet.pk',
    adminUsername: 'admin_gourmet',
    adminPassword: 'Gourmet@2026',
    theme: 'corporate-blue' as ThemePalette,
  });

  const [selectedModules, setSelectedModules] = useState<string[]>([
    'Finance',
    'Procurement',
    'Inventory',
    'Sales',
    'Production',
    'HR',
    'Workflow',
    'Reports'
  ]);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [createdCompanyDetails, setCreatedCompanyDetails] = useState<{
    slug: string;
    name: string;
    username: string;
    url: string;
  } | null>(null);

  const availableModules = [
    'Finance & Accounts',
    'Procurement & Purchasing',
    'Inventory & Warehouse',
    'Sales & POS Counter',
    'Production & Manufacturing',
    'HR & Payroll',
    'Supply Chain & Logistics',
    'Quality Inspection',
    'Workflow Approvals',
    'Universal Reports Engine',
    'Gemini AI Assistant'
  ];

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    const generatedSlug = val
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '');
    setFormData({
      ...formData,
      name: val,
      slug: generatedSlug,
      adminUsername: `admin_${generatedSlug}`
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.slug) {
      setErrorMsg('Company Name and URL Slug are required.');
      return;
    }
    if (!formData.adminUsername || !formData.adminPassword) {
      setErrorMsg('Administrator Username and Password are required for login setup.');
      return;
    }

    const created = registerNewCompany({
      ...formData,
      activeModules: selectedModules,
    });

    setCreatedCompanyDetails({
      slug: created.slug,
      name: created.name,
      username: formData.adminUsername,
      url: created.url || `https://mts-sap.vercel.app?company=${created.slug}`
    });
  };

  const handleProceedToLogin = () => {
    if (createdCompanyDetails) {
      switchTenantBySlug(createdCompanyDetails.slug);
      onSuccess(createdCompanyDetails.slug);
    }
  };

  if (createdCompanyDetails) {
    return (
      <div className="p-6 max-w-2xl mx-auto my-12">
        <div className="bg-slate-900 border border-emerald-500/40 rounded-3xl p-8 shadow-2xl space-y-6 text-center animate-in zoom-in-95">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center mx-auto text-emerald-400">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-black text-slate-100">
              Enterprise Tenant Company Provisioned!
            </h2>
            <p className="text-xs text-slate-400">
              Company <span className="text-purple-300 font-bold">{createdCompanyDetails.name}</span> has been created with custom subdomain and administrator login credentials.
            </p>
          </div>

          {/* Credentials Card */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 text-left space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-slate-400">
              <span className="font-sans text-[11px] font-bold uppercase tracking-wider text-purple-400">Tenant Connection Info</span>
              <span className="text-[10px] text-emerald-400 font-bold px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30">STATUS: ACTIVE</span>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Subdomain URL:</span>
                <span className="text-cyan-400 font-bold">{createdCompanyDetails.url}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Admin Username:</span>
                <span className="text-amber-300 font-bold">{createdCompanyDetails.username}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Admin Email:</span>
                <span className="text-slate-200">{formData.adminEmail}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Subscription Tier:</span>
                <span className="text-purple-300">{formData.subscriptionPlan} Plan</span>
              </div>
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleProceedToLogin}
              className="flex-1 py-3.5 px-6 rounded-xl bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-bold text-xs shadow-xl shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all"
            >
              <LogIn className="w-4 h-4" />
              Log In & Launch {createdCompanyDetails.name} ERP
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6">
        <div className="border-b border-slate-800 pb-4 flex items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Building2 className="w-6 h-6 text-purple-400" />
              <h1 className="text-lg font-black text-slate-100">
                Enterprise Client Company Registration Engine
              </h1>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Configure login credentials, basic details, advanced tax parameters, subscription tiers, and activate departments.
            </p>
          </div>
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
            Tenant Onboarding
          </span>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section 1: Administrator Login Credentials */}
          <div className="p-4 rounded-xl bg-purple-950/30 border border-purple-800/40 space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-purple-300 flex items-center gap-1.5">
              <Key className="w-4 h-4 text-purple-400" />
              1. Administrator Login & User Credentials
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Admin Full Name *</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={formData.adminName}
                    onChange={(e) => setFormData({ ...formData, adminName: e.target.value })}
                    required
                    placeholder="Zahoor Ahmad"
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Admin Email Address *</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={formData.adminEmail}
                    onChange={(e) => setFormData({ ...formData, adminEmail: e.target.value })}
                    required
                    placeholder="admin@gourmet.pk"
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-amber-300 mb-1">Created Login Username *</label>
                <div className="relative">
                  <User className="w-4 h-4 text-amber-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={formData.adminUsername}
                    onChange={(e) => setFormData({ ...formData, adminUsername: e.target.value })}
                    required
                    placeholder="admin_gourmet"
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-800 border border-amber-500/50 text-xs text-amber-200 font-mono focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-amber-300 mb-1">Created Login Password *</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-amber-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={formData.adminPassword}
                    onChange={(e) => setFormData({ ...formData, adminPassword: e.target.value })}
                    required
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-800 border border-amber-500/50 text-xs text-amber-200 font-mono focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Basic Business Identification & Subdomain */}
          <div className="space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
              <Building2 className="w-4 h-4" />
              2. Basic Business Profile & Subdomain URL
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Company Display Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={handleNameChange}
                  required
                  placeholder="Gourmet Bakers & Confectionery"
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Registered Legal Name</label>
                <input
                  type="text"
                  value={formData.registeredName}
                  onChange={(e) => setFormData({ ...formData, registeredName: e.target.value })}
                  placeholder="Gourmet Foods Private Limited"
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Company System Code</label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  placeholder="GBC004"
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-purple-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Live Free Vercel Tenant URL</label>
                <div className="flex items-center">
                  <span className="px-2.5 py-2 bg-slate-800 text-slate-400 text-xs border border-r-0 border-slate-700 rounded-l-xl font-mono">
                    https://mts-sap.vercel.app?company=
                  </span>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '') })}
                    className="flex-1 px-2.5 py-2 bg-slate-800 border border-slate-700 text-xs text-cyan-300 font-mono font-bold focus:outline-none rounded-r-xl"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Advanced Business Details & Categories */}
          <div className="space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
              <SlidersHorizontal className="w-4 h-4" />
              3. Advanced Business Parameters & Categories
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Industry Package</label>
                <select
                  value={formData.industry}
                  onChange={(e) => setFormData({ ...formData, industry: e.target.value as IndustryPackage })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-purple-500"
                >
                  <option value="Food & Beverage">Food & Beverage</option>
                  <option value="Manufacturing">Manufacturing</option>
                  <option value="Solar & Electrical">Solar & Electrical</option>
                  <option value="Textile">Textile</option>
                  <option value="Construction">Construction</option>
                  <option value="Wholesale">Wholesale</option>
                  <option value="Retail & POS">Retail & POS Counter</option>
                  <option value="Services">Services</option>
                  <option value="Healthcare">Healthcare</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Business Category</label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="Food Processing & Retail Chain"
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Functional Currency</label>
                <select
                  value={formData.currency}
                  onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-purple-500 font-mono"
                >
                  <option value="PKR">PKR (Pakistani Rupee)</option>
                  <option value="USD">USD (US Dollar)</option>
                  <option value="EUR">EUR (Euro)</option>
                  <option value="AED">AED (UAE Dirham)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">FBR NTN Number</label>
                <input
                  type="text"
                  value={formData.ntn}
                  onChange={(e) => setFormData({ ...formData, ntn: e.target.value })}
                  placeholder="3819201-4"
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-100 font-mono focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Sales Tax STRN Number</label>
                <input
                  type="text"
                  value={formData.strn}
                  onChange={(e) => setFormData({ ...formData, strn: e.target.value })}
                  placeholder="1029384756123"
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-100 font-mono focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Fiscal Year Cycle</label>
                <select
                  value={formData.fiscalYearStart}
                  onChange={(e) => setFormData({ ...formData, fiscalYearStart: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-purple-500"
                >
                  <option value="July 1st (Pakistan FY)">July 1st (Pakistan FY)</option>
                  <option value="January 1st (Calendar Year)">January 1st (Calendar Year)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 4: Subscription Plan & User Limits */}
          <div className="space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-400" />
              4. Subscription Plan & Tenant Capacities
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Subscription Plan Tier</label>
                <select
                  value={formData.subscriptionPlan}
                  onChange={(e) => setFormData({ ...formData, subscriptionPlan: e.target.value as any })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-purple-500"
                >
                  <option value="Starter">Starter Plan</option>
                  <option value="Professional">Professional Plan</option>
                  <option value="Enterprise">Enterprise Plan</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Maximum Allowed Users</label>
                <input
                  type="number"
                  value={formData.userLimit}
                  onChange={(e) => setFormData({ ...formData, userLimit: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-100 font-mono focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Maximum Branch Locations</label>
                <input
                  type="number"
                  value={formData.branchLimit}
                  onChange={(e) => setFormData({ ...formData, branchLimit: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-100 font-mono focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>
          </div>

          {/* Section 5: Activated ERP Modules */}
          <div className="space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-purple-400">
              5. Activated Enterprise ERP Modules
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {availableModules.map((mod) => {
                const isChecked = selectedModules.includes(mod);
                return (
                  <button
                    type="button"
                    key={mod}
                    onClick={() => {
                      if (isChecked) {
                        setSelectedModules(selectedModules.filter(m => m !== mod));
                      } else {
                        setSelectedModules([...selectedModules, mod]);
                      }
                    }}
                    className={`p-2.5 rounded-xl border text-left text-xs font-medium flex items-center justify-between transition-all ${
                      isChecked
                        ? 'bg-purple-600/20 border-purple-500 text-purple-200'
                        : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:border-slate-600'
                    }`}
                  >
                    <span>{mod}</span>
                    {isChecked && <Check className="w-4 h-4 text-purple-400" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Submit Action */}
          <div className="pt-4 border-t border-slate-800 flex justify-end">
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-xl shadow-purple-600/30 transition-all"
            >
              Confirm & Generate Tenant Company
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

