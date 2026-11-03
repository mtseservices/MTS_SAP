import React, { useState, useEffect } from 'react';
import {
  Building2,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Check,
  User,
  Lock,
  Mail,
  Phone,
  MapPin,
  Sparkles,
  LogIn,
  Key,
  Copy,
  FolderTree,
  Search,
  CheckSquare,
  Square,
  RotateCcw,
  CreditCard,
  Palette,
  Layers,
  Layout,
  Globe,
  FileText,
  Briefcase,
  Eye,
  EyeOff,
  Upload,
  Receipt,
  Zap
} from 'lucide-react';
import { useAuthTenant } from '../../context/AuthTenantContext';
import { IndustryPackage, ThemePalette, ThemeMode, LoginTemplateId, TableDensity } from '../../types/erp';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../../services/firebaseConfig';
import { getDefaultDepartmentIdsForIndustry } from '../../services/departmentCategoryMapper';
import { COMPLETE_DEPARTMENTS_CATALOGUE } from '../../services/departmentCatalogueData';
import { PAKISTAN_PROVINCES_CITIES, getCitiesForProvince } from '../../services/pakistanRegions';
import { PAKISTANI_BANKS_LIST } from '../../services/pakistaniBanks';
import { SearchableSelect } from '../common/SearchableSelect';

interface CompanyRegistrationWizardProps {
  onSuccess: (slug: string) => void;
}

type WizardStep = 1 | 2 | 3 | 4 | 5 | 6;

const PLAN_PRICING: Record<string, number> = {
  'Professional': 45000,
  'Enterprise': 85000,
  'Ultimate': 150000,
  'Single Time Buy (Lifetime)': 350000,
  'Special Offer Plan': 55000
};

export const CompanyRegistrationWizard: React.FC<CompanyRegistrationWizardProps> = ({
  onSuccess
}) => {
  const { registerNewCompany, switchTenantBySlug } = useAuthTenant();
  const [currentStep, setCurrentStep] = useState<WizardStep>(1);
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    // Step 1: SECP & Legal
    name: '',
    registeredName: '',
    entityType: 'Private Limited' as const,
    secpNumber: '',
    code: '',
    slug: '',
    
    // Step 2: Tax & Banking
    ntn: '',
    strn: '',
    salesTaxAuthority: 'FBR (Federal)' as const,
    bankName: '',
    accountTitle: '',
    iban: '',
    
    // Step 3: Operations
    address: '',
    city: '',
    province: 'Punjab',
    phone: '',
    email: '',
    headquarters: '',
    plantLocations: [] as string[],

    // Step 4: Industry & Modules (Bundles)
    industry: 'Manufacturing' as IndustryPackage,
    category: 'General Manufacturing',
    activeModules: [
      'Finance & Accounts',
      'Procurement & Purchasing',
      'Inventory & Warehouse',
      'Sales & POS Counter',
      'HR & Payroll'
    ] as string[],
    assignedDepartmentIds: [] as string[],

    // Step 5: Quotas & Subscriptions
    subscriptionPlan: 'Enterprise' as string,
    userLimit: 50,
    branchLimit: 5,
    billingCycle: 'Yearly' as 'Monthly' | 'Yearly',
    smsQuota: 5000,
    whatsappAlertsEnabled: true,
    whatsappPhone: '',

    // Step 6: Branding & Admin
    theme: 'corporate-blue' as ThemePalette,
    themeMode: 'dark' as ThemeMode,
    loginTemplateId: 'split' as LoginTemplateId,
    tableDensity: 'standard' as TableDensity,
    adminName: '',
    adminEmail: '',
    adminUsername: '',
    adminPassword: '',
    logoUrl: '',
    backgroundUrl: ''
  });

  // Auto-selection logic
  useEffect(() => {
    const autoDepts = getDefaultDepartmentIdsForIndustry(formData.industry, formData.category);
    setFormData(prev => ({ 
      ...prev, 
      assignedDepartmentIds: autoDepts,
      // Also auto-select relevant modules based on industry if needed
    }));
  }, [formData.industry]);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [createdCompanyDetails, setCreatedCompanyDetails] = useState<{
    slug: string;
    name: string;
    username: string;
    password: string;
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

  const nextStep = () => {
    if (currentStep < 6) setCurrentStep((currentStep + 1) as WizardStep);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep((currentStep - 1) as WizardStep);
  };

  const handleNameChange = (val: string) => {
    const generatedSlug = val.toLowerCase().replace(/[^a-z0-9]/g, '');
    setFormData({
      ...formData,
      name: val,
      registeredName: val + ' (Pvt) Ltd',
      slug: generatedSlug,
      adminUsername: `admin_${generatedSlug}`
    });
  };

  const handleLogoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const res = event.target?.result;
        if (res && typeof res === 'string') {
          setFormData(prev => ({ ...prev, logoUrl: res }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBgFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const res = event.target?.result;
        if (res && typeof res === 'string') {
          setFormData(prev => ({ ...prev, backgroundUrl: res }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const calculateBill = () => {
    const base = PLAN_PRICING[formData.subscriptionPlan] || 0;
    const cycleMultiplier = formData.billingCycle === 'Yearly' ? 10 : 1; // 2 months free for yearly
    const taxRate = 0.16; // 16% PRA/FBR
    const subtotal = base * cycleMultiplier;
    const tax = subtotal * taxRate;
    return {
      subtotal,
      tax,
      total: subtotal + tax
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (currentStep < 6) {
      nextStep();
      return;
    }

    const liveUrl = `https://mts-sap.vercel.app?company=${formData.slug}`;

    const created = registerNewCompany({
      ...formData,
      url: liveUrl,
    });

    // Sync Company Record to Firebase Firestore
    try {
      await setDoc(doc(db, 'tenants', created.tenantId), {
        ...created,
        adminUsername: formData.adminUsername,
        adminPassword: formData.adminPassword,
        url: liveUrl,
        communicationGateways: {
          smsQuota: formData.smsQuota,
          smsUsed: 0,
          whatsappAlertsEnabled: formData.whatsappAlertsEnabled,
          whatsappPhone: formData.whatsappPhone
        }
      }, { merge: true });
    } catch (firebaseErr) {
      console.warn('Firebase company sync warning:', firebaseErr);
    }

    setCreatedCompanyDetails({
      slug: created.slug,
      name: created.name,
      username: formData.adminUsername,
      password: formData.adminPassword,
      url: liveUrl
    });
  };

  const handleCopyCredentials = () => {
    if (!createdCompanyDetails) return;
    const credText = `🏢 Enterprise Tenant Access Credentials
Company: ${createdCompanyDetails.name}
Live URL: ${createdCompanyDetails.url}
Username: ${createdCompanyDetails.username}
Password: ${createdCompanyDetails.password}`;

    navigator.clipboard.writeText(credText);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  if (createdCompanyDetails) {
    return (
      <div className="p-6 max-w-2xl mx-auto my-12">
        <div className="bg-slate-900 border border-emerald-500/40 rounded-3xl p-8 shadow-2xl space-y-6 text-center animate-in zoom-in-95">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center mx-auto text-emerald-400">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-slate-100">Tenant Company Live!</h2>
            <p className="text-xs text-slate-400">Enterprise workspace initialized with industry-specific modules and departments.</p>
          </div>
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 text-left space-y-3 font-mono text-xs">
            <div className="flex justify-between items-center bg-slate-900 p-2 rounded-xl border border-slate-800">
              <span className="text-slate-400">URL:</span>
              <span className="text-cyan-400 font-bold">{createdCompanyDetails.url}</span>
            </div>
            <div className="flex justify-between items-center bg-slate-900 p-2 rounded-xl border border-slate-800">
              <span className="text-slate-400">Username:</span>
              <span className="text-amber-300 font-bold">{createdCompanyDetails.username}</span>
            </div>
            <div className="flex justify-between items-center bg-slate-900 p-2 rounded-xl border border-slate-800">
              <span className="text-slate-400">Password:</span>
              <span className="text-emerald-400 font-bold">{createdCompanyDetails.password}</span>
            </div>
            <button
              onClick={handleCopyCredentials}
              className={`w-full py-2.5 rounded-xl border text-xs font-bold font-sans flex items-center justify-center gap-2 transition-all ${
                copied ? 'bg-emerald-600 text-white border-emerald-500' : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
              }`}
            >
              {copied ? 'Copied!' : 'Copy Access Details'}
            </button>
          </div>
          <button
            onClick={() => {
              switchTenantBySlug(createdCompanyDetails.slug);
              onSuccess(createdCompanyDetails.slug);
            }}
            className="w-full py-3.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-xl shadow-cyan-600/30 flex items-center justify-center gap-2 transition-all"
          >
            Launch {createdCompanyDetails.name} ERP
          </button>
        </div>
      </div>
    );
  }

  const bill = calculateBill();

  return (
    <div className="p-6 max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6 pb-24">
      {/* Main Wizard Form */}
      <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black text-slate-100 flex items-center gap-2">
              <Building2 className="w-6 h-6 text-cyan-400" />
              ERP Onboarding
            </h1>
            <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mt-1">Tenant Registration v5.2</p>
          </div>
          <div className="flex items-center gap-1.5">
            {[1, 2, 3, 4, 5, 6].map((s) => (
              <div 
                key={s}
                className={`w-6 h-1 rounded-full transition-all duration-500 ${
                  s <= currentStep ? 'bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.6)]' : 'bg-slate-800'
                }`}
              />
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* STEP 1: LEGAL IDENTITY */}
          {currentStep === 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
              <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
                <FileText className="w-5 h-5 text-cyan-400" />
                <h2 className="text-xs font-black text-slate-100 uppercase tracking-[0.2em]">Step 1: SECP & Legal Identity</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Business Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    required
                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-cyan-500 transition-all"
                    placeholder="e.g. MTS Solutions"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">SECP Registration #</label>
                  <input
                    type="text"
                    value={formData.secpNumber}
                    onChange={(e) => setFormData({ ...formData, secpNumber: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-cyan-400 font-mono focus:outline-none focus:border-cyan-500"
                    placeholder="00XXXXX"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Entity Type</label>
                  <select
                    value={formData.entityType}
                    onChange={(e) => setFormData({ ...formData, entityType: e.target.value as any })}
                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100"
                  >
                    <option value="Local business">Local business</option>
                    <option value="Trader">Trader</option>
                    <option value="Private Limited">Private Limited</option>
                    <option value="Public Limited">Public Limited</option>
                    <option value="Sole Proprietorship">Sole Proprietorship</option>
                    <option value="Partnership / AOP">Partnership / AOP</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">ERP Slug / Subdomain</label>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-600 font-mono">https://</span>
                    <input
                      type="text"
                      value={formData.slug}
                      readOnly
                      className="flex-1 px-3 py-3 rounded-xl bg-slate-800/30 border border-slate-800 text-xs text-slate-500 font-mono"
                    />
                    <span className="text-[10px] text-slate-600 font-mono">.mts-erp.pk</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: TAX & BANKING */}
          {currentStep === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
              <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
                <CreditCard className="w-5 h-5 text-emerald-400" />
                <h2 className="text-xs font-black text-slate-100 uppercase tracking-[0.2em]">Step 2: FBR Compliance & Banking</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">FBR NTN</label>
                  <input
                    type="text"
                    value={formData.ntn}
                    onChange={(e) => setFormData({ ...formData, ntn: e.target.value })}
                    required
                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-emerald-400 font-mono"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Sales Tax STRN</label>
                  <input
                    type="text"
                    value={formData.strn}
                    onChange={(e) => setFormData({ ...formData, strn: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-emerald-400 font-mono"
                  />
                </div>
                <div className="space-y-1.5">
                  <SearchableSelect
                    label="Corporate Bank Name"
                    allowCustom
                    options={PAKISTANI_BANKS_LIST.map((b) => ({
                      value: b.name,
                      label: `[${b.code}] ${b.name}`,
                      sublabel: `Category: ${b.category || 'Bank'} | SWIFT: ${b.swiftCode}`,
                      category: b.category || 'Pakistani Banks'
                    }))}
                    value={formData.bankName}
                    onChange={(val) => setFormData({ ...formData, bankName: val })}
                    placeholder="Select or type bank name..."
                    searchPlaceholder="Filter 25+ Pakistani Banks..."
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">IBAN Number</label>
                  <input
                    type="text"
                    value={formData.iban}
                    onChange={(e) => setFormData({ ...formData, iban: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: OPERATIONS */}
          {currentStep === 3 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
              <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
                <MapPin className="w-5 h-5 text-purple-400" />
                <h2 className="text-xs font-black text-slate-100 uppercase tracking-[0.2em]">Step 3: Operations & Plants</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <SearchableSelect
                    label="Province / Territory"
                    options={PAKISTAN_PROVINCES_CITIES.map((p) => ({
                      value: p.province,
                      label: p.province,
                      sublabel: `${p.cities.length} major cities`
                    }))}
                    value={formData.province}
                    onChange={(newProv) => {
                      const cities = getCitiesForProvince(newProv);
                      setFormData({ ...formData, province: newProv, city: cities[0] || '' });
                    }}
                    placeholder="Search Province / Territory..."
                    searchPlaceholder="Type province name..."
                  />
                </div>
                <div className="space-y-1.5">
                  <SearchableSelect
                    label="Primary City"
                    options={getCitiesForProvince(formData.province).map((c) => ({
                      value: c,
                      label: c,
                      sublabel: formData.province
                    }))}
                    value={formData.city}
                    onChange={(val) => setFormData({ ...formData, city: val })}
                    placeholder={`Search City in ${formData.province}...`}
                    searchPlaceholder="Type city name..."
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Contact Phone</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100"
                    placeholder="+92-42-XXXXXXX"
                  />
                </div>
                <div className="md:col-span-2 space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Factory / Plant Locations</label>
                  <textarea
                    value={formData.plantLocations.join(', ')}
                    onChange={(e) => setFormData({ ...formData, plantLocations: e.target.value.split(',').map(s => s.trim()) })}
                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 h-24"
                    placeholder="Location A, Location B..."
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: ERP BUNDLING (Auto-Connect) */}
          {currentStep === 4 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
              <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
                <Zap className="w-5 h-5 text-amber-400" />
                <h2 className="text-xs font-black text-slate-100 uppercase tracking-[0.2em]">Step 4: Smart Module Bundling</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <SearchableSelect
                      label="Industry Core"
                      options={[
                        'Manufacturing',
                        'Textile',
                        'Food & Beverage',
                        'Import/Export',
                        'Hotel Management',
                        'Shopping Malls',
                        'Retail Store',
                        'Wholesale Shops',
                        'Trading',
                        'Courier Services',
                        'IT Services',
                        'HR Services',
                        'Education',
                        'Healthcare',
                        'Solar & Electrical',
                        'Construction'
                      ].map((ind) => ({
                        value: ind,
                        label: ind,
                        sublabel: 'AI auto-module preset available'
                      }))}
                      value={formData.industry}
                      onChange={(val) => setFormData({ ...formData, industry: val as IndustryPackage })}
                      placeholder="Search Industry Core..."
                      searchPlaceholder="Filter 16+ Industry Core Packages..."
                    />
                  </div>
                  <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20">
                    <h3 className="text-[10px] font-black text-amber-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <Sparkles className="w-3 h-3" /> Auto-Selected
                    </h3>
                    <div className="text-[10px] text-slate-400 leading-relaxed font-medium">
                      Standardized departments and reports for <span className="text-amber-200">{formData.industry}</span> have been auto-connected.
                    </div>
                  </div>
                </div>

                <div className="md:col-span-2 space-y-3">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Active ERP Modules</label>
                  <div className="grid grid-cols-2 gap-2">
                    {availableModules.map((mod) => {
                      const isChecked = formData.activeModules.includes(mod);
                      return (
                        <button
                          type="button"
                          key={mod}
                          onClick={() => {
                            const next = isChecked ? formData.activeModules.filter(m => m !== mod) : [...formData.activeModules, mod];
                            setFormData({ ...formData, activeModules: next });
                          }}
                          className={`p-3 rounded-xl border text-left text-[10px] font-bold uppercase flex items-center justify-between transition-all ${
                            isChecked ? 'bg-amber-500/10 border-amber-500/40 text-amber-100 shadow-lg shadow-amber-900/10' : 'bg-slate-950 border-slate-800 text-slate-600 hover:border-slate-700'
                          }`}
                        >
                          {mod}
                          {isChecked && <Check className="w-3 h-3" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: SUBSCRIPTION & BILLING */}
          {currentStep === 5 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
              <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
                <Receipt className="w-5 h-5 text-rose-400" />
                <h2 className="text-xs font-black text-slate-100 uppercase tracking-[0.2em]">Step 5: Subscription & Billing</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Select Enterprise Plan</label>
                    <div className="grid grid-cols-1 gap-2.5">
                      {Object.keys(PLAN_PRICING).map((plan) => (
                        <button
                          type="button"
                          key={plan}
                          onClick={() => setFormData({ ...formData, subscriptionPlan: plan })}
                          className={`p-4 rounded-2xl border text-left flex items-center justify-between transition-all ${
                            formData.subscriptionPlan === plan ? 'bg-rose-500/10 border-rose-500/50 text-rose-100 ring-2 ring-rose-500/20' : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${formData.subscriptionPlan === plan ? 'bg-rose-500 text-white' : 'bg-slate-800 text-slate-500'}`}>
                              <Briefcase className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="text-xs font-black uppercase">{plan}</div>
                              <div className="text-[10px] text-slate-500">PKR {PLAN_PRICING[plan].toLocaleString()} / Month</div>
                            </div>
                          </div>
                          {formData.subscriptionPlan === plan && <CheckCircle2 className="w-5 h-5 text-rose-500" />}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-1 space-y-1.5">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Billing Cycle</label>
                      <div className="flex p-1 bg-slate-950 border border-slate-800 rounded-xl">
                        {(['Monthly', 'Yearly'] as const).map(c => (
                          <button
                            type="button"
                            key={c}
                            onClick={() => setFormData({ ...formData, billingCycle: c })}
                            className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${
                              formData.billingCycle === c ? 'bg-rose-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'
                            }`}
                          >
                            {c}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="flex-1 space-y-1.5">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">User Licenses</label>
                      <input
                        type="number"
                        value={formData.userLimit}
                        onChange={(e) => setFormData({ ...formData, userLimit: Number(e.target.value) })}
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-rose-400 font-bold"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-slate-950/50 border border-slate-800 rounded-3xl p-6 flex flex-col h-full">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Receipt className="w-3.5 h-3.5" /> Billing Live Preview
                  </h3>
                  <div className="flex-1 space-y-3">
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-slate-500">{formData.subscriptionPlan} Plan x {formData.billingCycle === 'Yearly' ? '12 Months' : '1 Month'}</span>
                      <span className="text-slate-100 font-mono">PKR {bill.subtotal.toLocaleString()}</span>
                    </div>
                    {formData.billingCycle === 'Yearly' && (
                      <div className="flex justify-between items-center text-[10px] text-emerald-500">
                        <span className="flex items-center gap-1"><Zap className="w-3 h-3" /> Yearly Discount (2 Months Free)</span>
                        <span className="font-mono">Applied</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-slate-500">Sales Tax (16% FBR/PRA)</span>
                      <span className="text-slate-100 font-mono">PKR {bill.tax.toLocaleString()}</span>
                    </div>
                    <div className="border-t border-slate-800 pt-4 mt-4 flex justify-between items-center">
                      <span className="text-xs font-black text-white uppercase">Grand Total</span>
                      <span className="text-lg font-black text-rose-500 font-mono">PKR {bill.total.toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="mt-6 p-4 rounded-2xl bg-rose-500/5 border border-rose-500/20 text-[9px] text-slate-500 leading-relaxed italic">
                    Invoice will be generated upon finalization and sent to {formData.email || 'admin email'}.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 6: BRANDING & ADMIN */}
          {currentStep === 6 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
              <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
                <Palette className="w-5 h-5 text-indigo-400" />
                <h2 className="text-xs font-black text-slate-100 uppercase tracking-[0.2em]">Step 6: Branding & Master Access</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                        <Upload className="w-3 h-3" /> Company Logo (URL or PC File)
                      </label>
                      <input
                        type="text"
                        value={formData.logoUrl}
                        onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                        placeholder="https://... or upload from PC"
                        className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-indigo-300 font-mono focus:border-indigo-500 mb-2"
                      />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoFileChange}
                        className="w-full text-[10px] text-slate-400 file:mr-4 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-[10px] file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-500 cursor-pointer"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                        <Upload className="w-3 h-3" /> Login Background (URL or PC File)
                      </label>
                      <input
                        type="text"
                        value={formData.backgroundUrl}
                        onChange={(e) => setFormData({ ...formData, backgroundUrl: e.target.value })}
                        placeholder="https://... or upload from PC"
                        className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-indigo-300 font-mono focus:border-indigo-500 mb-2"
                      />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleBgFileChange}
                        className="w-full text-[10px] text-slate-400 file:mr-4 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-[10px] file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-500 cursor-pointer"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-500 uppercase">Default Theme</label>
                      <select 
                        value={formData.theme}
                        onChange={(e) => setFormData({ ...formData, theme: e.target.value as any })}
                        className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-indigo-400 font-bold"
                      >
                        <option value="corporate-blue">Corporate Blue</option>
                        <option value="royal-black-gold">Royal Gold</option>
                        <option value="enterprise-dark">Enterprise Dark</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-500 uppercase">Login Layout</label>
                      <select
                        value={formData.loginTemplateId}
                        onChange={(e) => setFormData({ ...formData, loginTemplateId: e.target.value as any })}
                        className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-indigo-400 font-bold"
                      >
                        <option value="split">Executive Split</option>
                        <option value="minimal">Minimalist</option>
                        <option value="glass">Floating Glass</option>
                        <option value="terminal">Classic Console</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                      <ShieldCheck className="w-3.5 h-3.5" /> Master Administrator
                    </h3>
                    <div className="space-y-3">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-600 uppercase">Full Name</label>
                        <input
                          type="text"
                          value={formData.adminName}
                          onChange={(e) => setFormData({ ...formData, adminName: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-600 uppercase">Master Admin Email</label>
                        <input
                          type="email"
                          value={formData.adminEmail}
                          onChange={(e) => setFormData({ ...formData, adminEmail: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black text-slate-600 uppercase">Username</label>
                          <input
                            type="text"
                            value={formData.adminUsername}
                            onChange={(e) => setFormData({ ...formData, adminUsername: e.target.value })}
                            className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-indigo-400 font-mono"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black text-slate-600 uppercase">Master Password</label>
                          <div className="relative">
                            <input
                              type={showPassword ? 'text' : 'password'}
                              value={formData.adminPassword}
                              onChange={(e) => setFormData({ ...formData, adminPassword: e.target.value })}
                              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-emerald-400 font-mono"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-400 transition-colors"
                            >
                              {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/20">
                    <p className="text-[9px] text-slate-500 leading-relaxed font-medium">
                      <span className="text-indigo-400 font-black">SECURITY NOTE:</span> These credentials grant full control over the tenant's data, modules, and user accounts. Store them in a secure corporate vault.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* FOOTER ACTIONS */}
          <div className="flex items-center justify-between pt-8 border-t border-slate-800/50">
            <button
              type="button"
              onClick={prevStep}
              disabled={currentStep === 1}
              className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${
                currentStep === 1 ? 'opacity-0 pointer-events-none' : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
              }`}
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>

            <button
              type="submit"
              className={`flex items-center gap-2 px-10 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-2xl transition-all active:scale-95 ${
                currentStep === 6 ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30' : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30'
              }`}
            >
              {currentStep === 6 ? 'Finalize & Launch Workspace' : 'Continue to Next Step'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>

      {/* Right Column: Live Data Preview Panel */}
      <div className="hidden lg:block space-y-6">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl sticky top-6">
          <div className="flex items-center gap-2 mb-6 border-b border-slate-800 pb-4">
            <Layers className="w-5 h-5 text-indigo-400" />
            <h2 className="text-[10px] font-black text-slate-100 uppercase tracking-widest">Real-Time Data Review</h2>
          </div>

          <div className="space-y-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Tenant Identity</span>
              </div>
              <div className="space-y-2 ml-3.5">
                <div className="text-xs font-bold text-slate-200">{formData.name || 'Company Name'}</div>
                <div className="text-[10px] text-slate-500 font-mono">{formData.registeredName}</div>
                <div className="text-[10px] text-cyan-500 font-mono">SECP: {formData.secpNumber || '---'}</div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Compliance Registry</span>
              </div>
              <div className="space-y-2 ml-3.5">
                <div className="flex justify-between items-center text-[10px]">
                  <span className="text-slate-600">NTN</span>
                  <span className="text-emerald-400 font-mono">{formData.ntn || 'PENDING'}</span>
                </div>
                <div className="flex justify-between items-center text-[10px]">
                  <span className="text-slate-600">STRN</span>
                  <span className="text-emerald-400 font-mono">{formData.strn || 'PENDING'}</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Bundle Configuration</span>
              </div>
              <div className="ml-3.5 space-y-1.5">
                <div className="text-[10px] text-amber-200 font-bold uppercase">{formData.industry} Package</div>
                <div className="flex flex-wrap gap-1">
                  {formData.activeModules.slice(0, 4).map(m => (
                    <span key={m} className="px-2 py-0.5 rounded-md bg-slate-800 text-[8px] text-slate-400 uppercase font-black">{m}</span>
                  ))}
                  {formData.activeModules.length > 4 && <span className="text-[8px] text-slate-600 font-black">+ {formData.activeModules.length - 4} MORE</span>}
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Provisioned Quotas</span>
              </div>
              <div className="ml-3.5 grid grid-cols-2 gap-3">
                <div className="p-2 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="text-[8px] text-slate-600 uppercase font-black">Users</div>
                  <div className="text-xs font-bold text-rose-400">{formData.userLimit}</div>
                </div>
                <div className="p-2 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="text-[8px] text-slate-600 uppercase font-black">Branches</div>
                  <div className="text-xs font-bold text-rose-400">{formData.branchLimit}</div>
                </div>
              </div>
            </div>

            <div className="pt-4 mt-2 border-t border-slate-800/50">
              <div className="p-4 rounded-2xl bg-indigo-600/10 border border-indigo-600/30 flex items-center justify-between">
                <div>
                  <div className="text-[8px] text-indigo-400 uppercase font-black">Estimated Invoice</div>
                  <div className="text-sm font-black text-white font-mono">PKR {bill.total.toLocaleString()}</div>
                </div>
                <Receipt className="w-6 h-6 text-indigo-500/50" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
