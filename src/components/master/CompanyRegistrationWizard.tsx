import React, { useState } from 'react';
import {
  Building2,
  Globe,
  SlidersHorizontal,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  Check
} from 'lucide-react';
import { useAuthTenant } from '../../context/AuthTenantContext';
import { IndustryPackage, ThemePalette } from '../../types/erp';

interface CompanyRegistrationWizardProps {
  onSuccess: (slug: string) => void;
}

export const CompanyRegistrationWizard: React.FC<CompanyRegistrationWizardProps> = ({
  onSuccess
}) => {
  const { registerNewCompany } = useAuthTenant();

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
    primaryContact: 'Zahoor Ahmad - Director Operations',
    subscriptionPlan: 'Enterprise' as const,
    userLimit: 50,
    branchLimit: 10,
    adminName: 'Zahoor Ahmad',
    adminEmail: 'admin@gourmet.pk',
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
      slug: generatedSlug
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.slug) {
      setErrorMsg('Company Name and URL Slug are required.');
      return;
    }

    const created = registerNewCompany({
      ...formData,
      activeModules: selectedModules,
    });

    onSuccess(created.slug);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6">
        <div className="border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <Building2 className="w-6 h-6 text-purple-400" />
            <h1 className="text-lg font-black text-slate-100">
              Enterprise Client Company Registration Engine
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Provision a new multi-tenant enterprise company, auto-generate tenant subdomains, configure NTN/STRN tax details, and assign Client Administrator credentials.
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section 1: Basic Business Profile */}
          <div className="space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-purple-400">
              1. Business Profile & Identification
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Company Display Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={handleNameChange}
                  required
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Registered Legal Name</label>
                <input
                  type="text"
                  value={formData.registeredName}
                  onChange={(e) => setFormData({ ...formData, registeredName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Company Code (e.g. GBC004)</label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-purple-500 font-mono"
                />
              </div>

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
            </div>
          </div>

          {/* Section 2: Auto Subdomain & URL Generator */}
          <div className="p-4 rounded-xl bg-purple-950/40 border border-purple-800/50 space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-purple-300 flex items-center gap-1.5">
              <Globe className="w-4 h-4 text-purple-400" />
              2. Automatic Company Tenant URL Generator
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">URL Slug (Subdomain)</label>
                <div className="flex items-center">
                  <span className="px-3 py-2 bg-slate-800 text-slate-400 text-xs border border-r-0 border-slate-700 rounded-l-xl font-mono">
                    https://
                  </span>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '') })}
                    className="flex-1 px-3 py-2 bg-slate-800 border border-slate-700 text-xs text-cyan-300 font-mono font-bold focus:outline-none"
                  />
                  <span className="px-3 py-2 bg-slate-800 text-slate-400 text-xs border border-l-0 border-slate-700 rounded-r-xl font-mono">
                    .erp.mts.pk
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Full Generated Tenant URL</label>
                <div className="px-3 py-2 rounded-xl bg-slate-900 border border-purple-500/40 text-xs text-emerald-400 font-mono font-bold truncate">
                  https://{formData.slug || 'company'}.erp.mts.pk
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Tax & NTN/STRN Compliance */}
          <div className="space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-purple-400">
              3. Pakistan Tax & Legal Compliance
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            </div>
          </div>

          {/* Section 4: Client Administrator Credentials */}
          <div className="space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-purple-400">
              4. Initial Client Administrator Account
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Admin Full Name</label>
                <input
                  type="text"
                  value={formData.adminName}
                  onChange={(e) => setFormData({ ...formData, adminName: e.target.value })}
                  required
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Admin Email Address</label>
                <input
                  type="email"
                  value={formData.adminEmail}
                  onChange={(e) => setFormData({ ...formData, adminEmail: e.target.value })}
                  required
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>
          </div>

          {/* Section 5: Modules Selection */}
          <div className="space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-purple-400">
              5. Activated ERP Modules
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
