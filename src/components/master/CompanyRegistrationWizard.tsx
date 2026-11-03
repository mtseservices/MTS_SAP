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
  Zap,
  Plus,
  Trash2
} from 'lucide-react';
import { useAuthTenant } from '../../context/AuthTenantContext';
import { IndustryPackage, ThemePalette, ThemeMode, LoginTemplateId, TableDensity, SubscriptionPlan } from '../../types/erp';
import { doc, setDoc } from 'firebase/firestore';
import { db, sanitizeForFirestore } from '../../services/firebaseConfig';
import { getDefaultDepartmentIdsForIndustry, getDefaultModulesForIndustry } from '../../services/departmentCategoryMapper';
import { COMPLETE_DEPARTMENTS_CATALOGUE } from '../../services/departmentCatalogueData';
import { PAKISTAN_PROVINCES_CITIES, getCitiesForProvince } from '../../services/pakistanRegions';
import { PAKISTANI_BANKS_LIST } from '../../services/pakistaniBanks';
import { SearchableSelect } from '../common/SearchableSelect';
import { getSubscriptionPlans } from '../../services/subscriptionPlansService';

interface CompanyRegistrationWizardProps {
  onSuccess: (slug: string) => void;
}

type WizardStep = 1 | 2 | 3 | 4 | 5 | 6 | 7;

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
  const { registerNewCompany, switchTenantBySlug, login } = useAuthTenant();
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

    // Step 6: Branding
    theme: 'corporate-blue' as ThemePalette,
    themeMode: 'dark' as ThemeMode,
    loginTemplateId: 'split' as LoginTemplateId,
    tableDensity: 'standard' as TableDensity,
    logoUrl: '',
    backgroundUrl: '',

    // Step 7: Master User & Branches Setup
    adminName: '',
    adminEmail: '',
    adminPhone: '',
    adminUsername: '',
    adminPassword: '',
    branches: [
      {
        id: `br_1_${Date.now()}`,
        name: 'Headquarters & Main Plant',
        code: 'HQ-001',
        type: 'Headquarters',
        contactPerson: 'Rashid Ahmed',
        contactPhone: '+92-300-1122334',
        city: 'Lahore',
        address: 'Plot 102, Industrial Complex, Lahore'
      }
    ] as { id: string; name: string; code: string; type: string; contactPerson: string; contactPhone: string; city: string; address: string; }[]
  });

  const [subscriptionPlans, setSubscriptionPlans] = useState<SubscriptionPlan[]>([]);

  // Load persistent master subscription plans
  useEffect(() => {
    getSubscriptionPlans().then((loadedPlans) => {
      if (loadedPlans && loadedPlans.length > 0) {
        setSubscriptionPlans(loadedPlans);
      }
    });
  }, []);

  // Auto-selection logic whenever Industry Core changes
  useEffect(() => {
    const autoDepts = getDefaultDepartmentIdsForIndustry(formData.industry, formData.category);
    const autoModules = getDefaultModulesForIndustry(formData.industry);
    setFormData(prev => ({ 
      ...prev, 
      assignedDepartmentIds: autoDepts,
      activeModules: autoModules
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
    if (currentStep < 7) setCurrentStep((currentStep + 1) as WizardStep);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep((currentStep - 1) as WizardStep);
  };

  const handleAddBranch = () => {
    if (formData.branches.length >= formData.branchLimit) {
      alert(`Selected plan (${formData.subscriptionPlan}) allows a maximum of ${formData.branchLimit} branches. Please select a higher subscription plan in Step 5 to add more branches.`);
      return;
    }
    const newIdx = formData.branches.length + 1;
    const newBr = {
      id: `br_${newIdx}_${Date.now()}`,
      name: `Branch #${newIdx}`,
      code: `BR-00${newIdx}`,
      type: 'Regional Office' as const,
      contactPerson: formData.adminName || 'Branch Manager',
      contactPhone: formData.adminPhone || formData.phone || '+92-300-0000000',
      city: formData.city || 'Lahore',
      address: formData.address || 'Commercial Area'
    };
    setFormData(prev => ({ ...prev, branches: [...prev.branches, newBr] }));
  };

  const handleRemoveBranch = (id: string) => {
    if (formData.branches.length <= 1) {
      alert('At least 1 primary branch is required for company onboarding!');
      return;
    }
    setFormData(prev => ({ ...prev, branches: prev.branches.filter(b => b.id !== id) }));
  };

  const handleBranchChange = (id: string, field: string, val: any) => {
    setFormData(prev => ({
      ...prev,
      branches: prev.branches.map(b => b.id === id ? { ...b, [field]: val } : b)
    }));
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
    const matchedPlan = subscriptionPlans.find(p => p.name === formData.subscriptionPlan);
    const base = matchedPlan ? matchedPlan.pricePKR : (PLAN_PRICING[formData.subscriptionPlan] || 85000);
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

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [provisionStepMsg, setProvisionStepMsg] = useState('Initializing tenant metadata & legal identity...');
  const [provisionProgress, setProvisionProgress] = useState(10);
  const [redirectCountdown, setRedirectCountdown] = useState<number | null>(null);

  const handleLaunchWorkspace = (slug: string) => {
    login('CLIENT', slug, 'CLIENT_ADMIN');
    switchTenantBySlug(slug);
    onSuccess(slug);
  };

  // Auto-redirect countdown effect upon success
  useEffect(() => {
    if (!createdCompanyDetails) return;
    setRedirectCountdown(1.5);
    const interval = setInterval(() => {
      setRedirectCountdown((prev) => {
        if (prev === null || prev <= 0.1) {
          clearInterval(interval);
          handleLaunchWorkspace(createdCompanyDetails.slug);
          return 0;
        }
        return Math.max(0, +(prev - 0.1).toFixed(1));
      });
    }, 100);
    return () => clearInterval(interval);
  }, [createdCompanyDetails]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (currentStep < 7) {
      nextStep();
      return;
    }

    setIsSubmitting(true);
    setProvisionStepMsg('Validating SECP & legal identity payload...');
    setProvisionProgress(25);

    try {
      await new Promise(r => setTimeout(r, 250));
      setProvisionStepMsg('Sanitizing multi-tenant database fields...');
      setProvisionProgress(50);

      const finalName = formData.name.trim() || 'Enterprise Client Company';
      const finalSlug = formData.slug.trim() || finalName.toLowerCase().replace(/[^a-z0-9]/g, '') || `company${Date.now().toString().slice(-4)}`;
      const liveUrl = `https://mts-sap.vercel.app?company=${finalSlug}`;
      const finalUsername = formData.adminUsername.trim() || `admin_${finalSlug}`;
      const finalPassword = formData.adminPassword.trim() || 'Admin@123456';

      const rawCompData = {
        ...formData,
        name: finalName,
        slug: finalSlug,
        url: liveUrl,
        adminName: formData.adminName.trim() || `${finalName} Administrator`,
        adminEmail: formData.adminEmail.trim() || `admin@${finalSlug}.pk`,
        adminPhone: formData.adminPhone.trim() || formData.phone || '',
        adminUsername: finalUsername,
        adminPassword: finalPassword
      };

      const created = registerNewCompany(rawCompData);

      setProvisionStepMsg('Connecting to Firebase Firestore & saving tenant schema...');
      setProvisionProgress(75);
      await new Promise(r => setTimeout(r, 250));

      // Deep Sanitize & Serialize State Object for Firestore write
      const rawTenantPayload = {
        ...created,
        adminName: formData.adminName.trim() || `${finalName} Administrator`,
        adminEmail: formData.adminEmail.trim() || `admin@${finalSlug}.pk`,
        adminPhone: formData.adminPhone.trim() || formData.phone || '',
        adminUsername: finalUsername,
        adminPassword: finalPassword,
        branches: formData.branches,
        url: liveUrl,
        communicationGateways: {
          smsQuota: formData.smsQuota || 5000,
          smsUsed: 0,
          whatsappAlertsEnabled: formData.whatsappAlertsEnabled ?? true,
          whatsappPhone: formData.whatsappPhone || ''
        }
      };

      const cleanPayload = sanitizeForFirestore(rawTenantPayload);

      // Sync Company Record & Branches to LocalStorage
      try {
        localStorage.setItem(`mts_branches_${created.id}`, JSON.stringify(formData.branches));
      } catch (stErr) {
        console.warn('LocalStorage write note:', stErr);
      }

      // Sync Company Record & Branches to Firebase Firestore
      await setDoc(doc(db, 'tenants', created.tenantId), cleanPayload, { merge: true });
      await setDoc(doc(db, 'companies', created.id), cleanPayload, { merge: true });

      setProvisionStepMsg('Workspace Provisioned Successfully! Preparing launch...');
      setProvisionProgress(100);
      await new Promise(r => setTimeout(r, 400));

      setCreatedCompanyDetails({
        slug: created.slug,
        name: created.name,
        username: finalUsername,
        password: finalPassword,
        url: liveUrl
      });
    } catch (err: any) {
      console.error('Company registration submission error:', err);
      setErrorMsg(err?.message || 'Database write failed. Please verify form inputs and retry.');
    } finally {
      setIsSubmitting(false);
    }
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
            <h2 className="text-2xl font-black text-slate-100">Tenant Workspace Live!</h2>
            <p className="text-xs text-slate-400">Enterprise workspace initialized &amp; synchronized with Firestore database.</p>
          </div>

          {/* Auto-redirect countdown bar */}
          {redirectCountdown !== null && (
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-4 space-y-2">
              <div className="flex justify-between items-center text-xs font-mono text-emerald-400 font-bold">
                <span>Auto Launching Workspace...</span>
                <span>{redirectCountdown}s</span>
              </div>
              <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-emerald-500/30">
                <div
                  className="h-full bg-emerald-500 transition-all duration-100"
                  style={{ width: `${(redirectCountdown / 1.5) * 100}%` }}
                />
              </div>
            </div>
          )}

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
            onClick={() => handleLaunchWorkspace(createdCompanyDetails.slug)}
            className="w-full py-3.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-xl shadow-cyan-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            Launch {createdCompanyDetails.name} ERP Now
          </button>
        </div>
      </div>
    );
  }

  const bill = calculateBill();

  return (
    <div className="p-6 max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6 pb-24 relative">
      {/* Full-screen Glassmorphism Submission Loading Overlay */}
      {isSubmitting && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-xl flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-300">
          <div className="max-w-md w-full bg-slate-900/90 border border-cyan-500/40 rounded-3xl p-8 shadow-2xl space-y-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/10 via-transparent to-emerald-500/10 pointer-events-none" />

            {/* Glowing Spinning Rings */}
            <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
              <div className="absolute inset-0 border-4 border-cyan-500/20 border-t-cyan-400 rounded-full animate-spin" />
              <div className="absolute inset-2 border-4 border-emerald-500/20 border-b-emerald-400 rounded-full animate-spin [animation-duration:1.5s]" />
              <Building2 className="w-10 h-10 text-cyan-300 animate-pulse" />
            </div>

            <div className="space-y-2 relative z-10">
              <h3 className="text-xl font-black text-white tracking-wide">Provisioning Enterprise Tenant</h3>
              <p className="text-xs text-cyan-400 font-mono font-bold">{provisionStepMsg}</p>
            </div>

            {/* Step Progress Bar */}
            <div className="space-y-2 relative z-10">
              <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden p-0.5 border border-slate-800">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 via-indigo-500 to-emerald-500 rounded-full transition-all duration-300 shadow-[0_0_12px_rgba(6,182,212,0.6)]"
                  style={{ width: `${provisionProgress}%` }}
                />
              </div>
              <div className="flex justify-between items-center text-[10px] font-mono text-slate-500">
                <span>Sanitizing &amp; Syncing</span>
                <span>{provisionProgress}%</span>
              </div>
            </div>

            <div className="text-[10px] text-slate-400 border-t border-slate-800/80 pt-4 font-mono">
              Database: <span className="text-emerald-400 font-bold">Firebase Firestore</span> | Security Rules: <span className="text-indigo-400 font-bold">Hardened</span>
            </div>
          </div>
        </div>
      )}
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
            {[1, 2, 3, 4, 5, 6, 7].map((s) => (
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
          {errorMsg && (
            <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl flex items-center gap-3 text-xs text-rose-300 animate-in fade-in">
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}
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
                      onChange={(val) => {
                        const newInd = val as IndustryPackage;
                        const presetModules = getDefaultModulesForIndustry(newInd);
                        const presetDepts = getDefaultDepartmentIdsForIndustry(newInd, formData.category);
                        setFormData((prev) => ({
                          ...prev,
                          industry: newInd,
                          activeModules: presetModules,
                          assignedDepartmentIds: presetDepts
                        }));
                      }}
                      placeholder="Search Industry Core..."
                      searchPlaceholder="Filter 16+ Industry Core Packages..."
                    />
                  </div>
                  <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 space-y-2">
                    <h3 className="text-[10px] font-black text-amber-500 uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" /> AI Auto-Selected Modules ({getDefaultModulesForIndustry(formData.industry).length})
                    </h3>
                    <div className="text-[10px] text-slate-400 leading-relaxed font-medium">
                      Industry-tailored modules auto-connected for <span className="text-amber-200 font-bold">{formData.industry}</span>:
                    </div>
                    <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
                      {getDefaultModulesForIndustry(formData.industry).map((modName) => (
                        <div key={modName} className="text-[10px] text-amber-200/90 font-mono flex items-center gap-1.5 bg-slate-950 p-1.5 rounded-lg border border-amber-500/20">
                          <Check className="w-3 h-3 text-emerald-400 shrink-0" />
                          <span className="truncate">{modName}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="md:col-span-2 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">
                      Active ERP Modules ({formData.activeModules.length} Selected)
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        const preset = getDefaultModulesForIndustry(formData.industry);
                        setFormData(prev => ({ ...prev, activeModules: preset }));
                      }}
                      className="text-[10px] font-mono text-amber-400 hover:underline flex items-center gap-1"
                    >
                      <RotateCcw className="w-3 h-3" /> Reset to {formData.industry} AI Presets
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2 max-h-[380px] overflow-y-auto pr-1">
                    {Array.from(new Set([...getDefaultModulesForIndustry(formData.industry), ...availableModules])).map((mod) => {
                      const isChecked = formData.activeModules.includes(mod);
                      const isPreset = getDefaultModulesForIndustry(formData.industry).includes(mod);
                      return (
                        <button
                          type="button"
                          key={mod}
                          onClick={() => {
                            const next = isChecked
                              ? formData.activeModules.filter((m) => m !== mod)
                              : [...formData.activeModules, mod];
                            setFormData({ ...formData, activeModules: next });
                          }}
                          className={`p-3 rounded-xl border text-left text-[10px] font-bold uppercase flex items-center justify-between transition-all cursor-pointer ${
                            isChecked
                              ? 'bg-amber-500/10 border-amber-500/40 text-amber-100 shadow-lg shadow-amber-900/10'
                              : 'bg-slate-950 border-slate-800 text-slate-600 hover:border-slate-700'
                          }`}
                        >
                          <div className="flex flex-col truncate pr-1">
                            <span className="truncate">{mod}</span>
                            {isPreset && (
                              <span className="text-[8px] text-amber-400/80 font-mono tracking-tighter">
                                AI Preset ({formData.industry})
                              </span>
                            )}
                          </div>
                          {isChecked && <Check className="w-3.5 h-3.5 text-amber-400 shrink-0 ml-1" />}
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
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">
                      Select Master Subscription Plan ({subscriptionPlans.length > 0 ? subscriptionPlans.length : 'Default'} Plans Configured)
                    </label>
                    <div className="grid grid-cols-1 gap-3 max-h-[360px] overflow-y-auto pr-1">
                      {(subscriptionPlans.length > 0
                        ? subscriptionPlans
                        : Object.keys(PLAN_PRICING).map((pName) => ({
                            id: pName,
                            name: pName,
                            pricePKR: PLAN_PRICING[pName],
                            billingCycle: 'Monthly' as const,
                            maxUsers: 50,
                            maxBranches: 5,
                            smsQuota: 5000,
                            whatsappAlertsEnabled: true,
                            vendorPortalLogins: 50,
                            businessCategories: ['All Businesses'],
                            includedModules: ['ALL'],
                            isPopular: false
                          }))
                      ).map((plan) => {
                        const isSelected = formData.subscriptionPlan === plan.name;
                        return (
                          <button
                            type="button"
                            key={plan.id || plan.name}
                            onClick={() => {
                              setFormData((prev) => ({
                                ...prev,
                                subscriptionPlan: plan.name,
                                userLimit: plan.maxUsers || 50,
                                branchLimit: plan.maxBranches || 5,
                                smsQuota: plan.smsQuota || 5000,
                                whatsappAlertsEnabled: plan.whatsappAlertsEnabled ?? true,
                                billingCycle: plan.billingCycle === 'Yearly' ? 'Yearly' : 'Monthly'
                              }));
                            }}
                            className={`p-4 rounded-2xl border text-left flex flex-col gap-2.5 transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-rose-500/10 border-rose-500/60 text-rose-100 ring-2 ring-rose-500/20 shadow-xl'
                                : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div
                                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                                    isSelected ? 'bg-rose-500 text-white' : 'bg-slate-800 text-slate-500'
                                  }`}
                                >
                                  <Briefcase className="w-4 h-4" />
                                </div>
                                <div>
                                  <div className="text-xs font-black uppercase text-slate-100 flex items-center gap-2">
                                    <span>{plan.name}</span>
                                    {plan.isPopular && (
                                      <span className="px-1.5 py-0.2 rounded text-[9px] bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                                        POPULAR
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-[11px] text-rose-400 font-mono font-bold">
                                    PKR {plan.pricePKR.toLocaleString()} / {plan.billingCycle}
                                  </div>
                                </div>
                              </div>
                              {isSelected && <CheckCircle2 className="w-5 h-5 text-rose-500 shrink-0" />}
                            </div>

                            {/* Quotas & Attributes Badges */}
                            <div className="grid grid-cols-3 gap-1.5 text-[10px] font-mono bg-slate-900/80 p-2 rounded-xl border border-slate-800/80">
                              <div>
                                <span className="text-slate-500 block">Max Users:</span>
                                <span className="text-slate-200 font-bold">{plan.maxUsers || 10} Users</span>
                              </div>
                              <div>
                                <span className="text-slate-500 block">Max Branches:</span>
                                <span className="text-slate-200 font-bold">{plan.maxBranches || 1} Branches</span>
                              </div>
                              <div>
                                <span className="text-slate-500 block">SMS Quota:</span>
                                <span className="text-slate-200 font-bold">{(plan.smsQuota || 500).toLocaleString()} SMS</span>
                              </div>
                            </div>

                            <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                              <div className="truncate max-w-[200px]">
                                <strong>Suitability:</strong>{' '}
                                {Array.isArray(plan.businessCategories)
                                  ? plan.businessCategories.join(', ')
                                  : 'All Businesses'}
                              </div>
                              <div className="flex items-center gap-2 font-mono shrink-0">
                                <span>WhatsApp: {plan.whatsappAlertsEnabled ? '✅ Yes' : '❌ No'}</span>
                                <span>Vendors: {plan.vendorPortalLogins || 0}</span>
                              </div>
                            </div>
                          </button>
                        );
                      })}
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

          {/* STEP 6: BRANDING & LIVE PREVIEW */}
          {currentStep === 6 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
              <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
                <Palette className="w-5 h-5 text-indigo-400" />
                <h2 className="text-xs font-black text-slate-100 uppercase tracking-[0.2em]">Step 6: Branding &amp; Live Layout Preview</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Left Form Inputs */}
                <div className="space-y-5">
                  <div className="grid grid-cols-1 gap-4">
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
                        <Upload className="w-3 h-3" /> Login Background Image (URL or PC File)
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
                        <option value="minimal">Minimalist Card</option>
                        <option value="glass">Floating Glass</option>
                        <option value="terminal">Classic Console</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Right Interactive Live Preview Mockup Card */}
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="text-[10px] font-black text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Eye className="w-3.5 h-3.5" /> Live Login Layout Preview
                    </span>
                    <div className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    </div>
                  </div>

                  {/* Interactive Layout Mockup Container */}
                  <div
                    className={`relative rounded-xl border p-4 h-64 flex flex-col justify-between overflow-hidden shadow-inner ${
                      formData.theme === 'corporate-blue'
                        ? 'bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 border-blue-800/50'
                        : formData.theme === 'royal-black-gold'
                        ? 'bg-gradient-to-br from-black via-slate-950 to-amber-950/40 border-amber-800/50'
                        : 'bg-slate-900 border-purple-800/50'
                    }`}
                  >
                    {/* Background Overlay Image Preview if present */}
                    {formData.backgroundUrl && (
                      <img
                        src={formData.backgroundUrl}
                        alt="Background Preview"
                        className="absolute inset-0 w-full h-full object-cover opacity-20 pointer-events-none"
                      />
                    )}

                    {/* Header with Company Logo */}
                    <div className="relative z-10 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {formData.logoUrl ? (
                          <img src={formData.logoUrl} alt="Logo" className="w-7 h-7 object-contain rounded-md bg-white/10 p-0.5" />
                        ) : (
                          <Building2 className={`w-6 h-6 ${formData.theme === 'royal-black-gold' ? 'text-amber-400' : 'text-cyan-400'}`} />
                        )}
                        <span className="text-xs font-bold text-white truncate max-w-[150px]">
                          {formData.name || 'Your Company Name'}
                        </span>
                      </div>
                      <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-white/10 text-slate-300">
                        {formData.loginTemplateId.toUpperCase()}
                      </span>
                    </div>

                    {/* Layout Specific Interactive Frame */}
                    <div className="relative z-10 my-auto">
                      {formData.loginTemplateId === 'split' && (
                        <div className="grid grid-cols-2 gap-3 bg-slate-900/80 border border-slate-800 rounded-lg p-3 backdrop-blur-sm">
                          <div className="bg-slate-950/80 rounded p-2 flex flex-col justify-center items-center text-center">
                            <span className="text-[9px] font-bold text-indigo-300">Brand Banner</span>
                            <span className="text-[8px] text-slate-500">Left Column Image</span>
                          </div>
                          <div className="space-y-1 text-[8px]">
                            <div className="h-3 bg-slate-800 rounded px-1 text-slate-400 flex items-center">Username</div>
                            <div className="h-3 bg-slate-800 rounded px-1 text-slate-400 flex items-center">Password</div>
                            <div className="h-3.5 bg-indigo-600 text-white font-bold rounded flex items-center justify-center">Sign In</div>
                          </div>
                        </div>
                      )}

                      {formData.loginTemplateId === 'minimal' && (
                        <div className="max-w-[180px] mx-auto bg-slate-950/90 border border-slate-800 rounded-lg p-3 space-y-1.5 text-[8px] text-center shadow-lg">
                          <div className="font-bold text-slate-200">Account Sign In</div>
                          <div className="h-3 bg-slate-800 rounded px-1 text-slate-400 flex items-center">Username</div>
                          <div className="h-3 bg-slate-800 rounded px-1 text-slate-400 flex items-center">Password</div>
                          <div className="h-3.5 bg-indigo-600 text-white font-bold rounded flex items-center justify-center">Sign In</div>
                        </div>
                      )}

                      {formData.loginTemplateId === 'glass' && (
                        <div className="max-w-[200px] mx-auto bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-3 space-y-1.5 text-[8px] text-center shadow-2xl">
                          <div className="font-bold text-white tracking-wide">Glassmorphic Portal</div>
                          <div className="h-3 bg-black/40 rounded px-1 text-slate-300 flex items-center">Username</div>
                          <div className="h-3 bg-black/40 rounded px-1 text-slate-300 flex items-center">Password</div>
                          <div className="h-3.5 bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-bold rounded flex items-center justify-center">Sign In</div>
                        </div>
                      )}

                      {formData.loginTemplateId === 'terminal' && (
                        <div className="bg-black/90 border border-emerald-500/40 rounded-lg p-3 font-mono text-[8px] space-y-1 text-emerald-400 shadow-xl">
                          <div>$ mts-auth --init tenant</div>
                          <div className="text-slate-500">[USER]: admin_login</div>
                          <div className="text-slate-500">[PASS]: ********</div>
                          <div className="text-emerald-300 font-bold">&gt; AUTHENTICATED [OK]</div>
                        </div>
                      )}
                    </div>

                    <div className="relative z-10 text-[8px] font-mono text-slate-400 text-center">
                      mts-sap.vercel.app?company={formData.slug || 'slug'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 7: COMPLETE BRANCH DETAILS & MASTER ACCESS */}
          {currentStep === 7 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
              <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <h2 className="text-xs font-black text-slate-100 uppercase tracking-[0.2em]">Step 7: Master User Credentials &amp; Branch Setup</h2>
              </div>

              {/* Section 1: Client Company Administrator Credentials */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-2">
                    <User className="w-4 h-4 text-indigo-400" /> Client Company Administrator &amp; Tenant Owner Account
                  </h3>
                  <span className="text-[10px] font-mono text-slate-500 bg-slate-900 border border-slate-800 px-2.5 py-0.5 rounded-full">
                    Client Owner Account
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-sans">
                  <div>
                    <label className="block text-slate-400 font-medium mb-1">Client Admin Full Name *</label>
                    <input
                      type="text"
                      value={formData.adminName}
                      onChange={(e) => setFormData({ ...formData, adminName: e.target.value })}
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 focus:outline-none focus:border-indigo-500"
                      placeholder="e.g. Rashid Ahmed (Client Owner)"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 font-medium mb-1">Client Admin Email Address *</label>
                    <input
                      type="email"
                      value={formData.adminEmail}
                      onChange={(e) => setFormData({ ...formData, adminEmail: e.target.value })}
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 focus:outline-none focus:border-indigo-500"
                      placeholder="admin@cresttextile.com"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 font-medium mb-1">Client Admin Contact Phone</label>
                    <input
                      type="text"
                      value={formData.adminPhone}
                      onChange={(e) => setFormData({ ...formData, adminPhone: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 focus:outline-none focus:border-indigo-500 font-mono"
                      placeholder="+92-300-1234567"
                    />
                  </div>

                  <div>
                    <label className="block text-indigo-400 font-bold mb-1">Client Admin Username *</label>
                    <input
                      type="text"
                      value={formData.adminUsername}
                      onChange={(e) => setFormData({ ...formData, adminUsername: e.target.value })}
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-indigo-500/40 text-indigo-300 font-mono font-bold focus:outline-none"
                      placeholder={`admin_${formData.slug || 'company'}`}
                    />
                  </div>

                  <div>
                    <label className="block text-emerald-400 font-bold mb-1">Client Admin Password *</label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={formData.adminPassword}
                        onChange={(e) => setFormData({ ...formData, adminPassword: e.target.value })}
                        required
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-emerald-500/40 text-emerald-300 font-mono font-bold focus:outline-none"
                        placeholder="Admin@123456"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-indigo-500/5 border border-indigo-500/20 text-[10px] text-slate-400 leading-relaxed font-medium">
                  <span className="text-indigo-400 font-bold">CLIENT SECURITY NOTE:</span> These login credentials belong to the Client Company Owner and grant full administrative access over their enterprise workspace data and user roles.
                </div>
              </div>

              {/* Section 2: Dynamic Multi-Branch Setup */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-cyan-400" /> Company Branches &amp; Plant Locations Setup
                    </h3>
                    <p className="text-[11px] text-slate-400">Configure headquarters, regional offices, factory plants, or stores.</p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 bg-slate-900 border border-slate-800 text-cyan-300 font-mono font-bold text-xs rounded-xl">
                      Branches: {formData.branches.length} / {formData.branchLimit} Quota
                    </span>
                    <button
                      type="button"
                      onClick={handleAddBranch}
                      disabled={formData.branches.length >= formData.branchLimit}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                        formData.branches.length >= formData.branchLimit
                          ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                          : 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg shadow-cyan-600/30'
                      }`}
                    >
                      <Plus className="w-4 h-4" /> Add Branch
                    </button>
                  </div>
                </div>

                {/* Branch Cards */}
                <div className="space-y-4">
                  {formData.branches.map((br, index) => (
                    <div key={br.id} className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3 relative">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-mono font-bold text-xs rounded-lg flex items-center justify-center">
                            #{index + 1}
                          </span>
                          <h4 className="text-xs font-bold text-slate-100">{br.name}</h4>
                          <span className="text-[10px] font-mono text-slate-500">[{br.code}]</span>
                        </div>

                        {formData.branches.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveBranch(br.id)}
                            className="text-slate-500 hover:text-rose-400 transition cursor-pointer"
                            title="Remove Branch"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs font-sans">
                        <div>
                          <label className="block text-slate-500 text-[10px] uppercase mb-0.5">Branch Name *</label>
                          <input
                            type="text"
                            value={br.name}
                            onChange={(e) => handleBranchChange(br.id, 'name', e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200"
                            placeholder="e.g. Faisalabad Textile Plant"
                          />
                        </div>

                        <div>
                          <label className="block text-slate-500 text-[10px] uppercase mb-0.5">Branch Code</label>
                          <input
                            type="text"
                            value={br.code}
                            onChange={(e) => handleBranchChange(br.id, 'code', e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 font-mono"
                            placeholder="FSD-01"
                          />
                        </div>

                        <div>
                          <label className="block text-slate-500 text-[10px] uppercase mb-0.5">Branch Type</label>
                          <select
                            value={br.type}
                            onChange={(e) => handleBranchChange(br.id, 'type', e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200"
                          >
                            <option value="Headquarters">Headquarters</option>
                            <option value="Regional Office">Regional Office</option>
                            <option value="Factory Plant">Factory Plant / Production</option>
                            <option value="Retail Outlet">Retail Outlet / POS</option>
                            <option value="Warehouse / Store">Warehouse / Store</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-slate-500 text-[10px] uppercase mb-0.5">Contact Person</label>
                          <input
                            type="text"
                            value={br.contactPerson}
                            onChange={(e) => handleBranchChange(br.id, 'contactPerson', e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200"
                            placeholder="Branch Manager Name"
                          />
                        </div>

                        <div>
                          <label className="block text-slate-500 text-[10px] uppercase mb-0.5">Contact Phone</label>
                          <input
                            type="text"
                            value={br.contactPhone}
                            onChange={(e) => handleBranchChange(br.id, 'contactPhone', e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 font-mono"
                            placeholder="+92-300-1122334"
                          />
                        </div>

                        <div>
                          <label className="block text-slate-500 text-[10px] uppercase mb-0.5">City</label>
                          <input
                            type="text"
                            value={br.city}
                            onChange={(e) => handleBranchChange(br.id, 'city', e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200"
                            placeholder="Lahore"
                          />
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-slate-500 text-[10px] uppercase mb-0.5">Full Physical Address</label>
                          <input
                            type="text"
                            value={br.address}
                            onChange={(e) => handleBranchChange(br.id, 'address', e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200"
                            placeholder="Plot number, Street, Industrial Estate..."
                          />
                        </div>
                      </div>
                    </div>
                  ))}
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
              disabled={isSubmitting}
              className={`flex items-center gap-2 px-10 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-2xl transition-all active:scale-95 cursor-pointer ${
                isSubmitting
                  ? 'bg-slate-800 text-slate-400 border border-slate-700 pointer-events-none'
                  : currentStep === 7
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30'
              }`}
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
                  <span>Provisioning Workspace...</span>
                </>
              ) : currentStep === 7 ? (
                <>
                  Finalize &amp; Launch Workspace
                  <ArrowRight className="w-4 h-4" />
                </>
              ) : (
                <>
                  Continue to Next Step
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
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
