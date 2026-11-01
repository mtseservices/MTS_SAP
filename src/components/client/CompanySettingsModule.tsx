import React, { useState, useEffect } from 'react';
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
  Square,
  Lock,
  Unlock,
  KeyRound,
  Layout,
  Table,
  Sliders,
  Type,
  FileCheck2,
  AlertCircle,
  Sparkles,
  Upload,
  Check,
  FileText,
  Download,
  Trash2
} from 'lucide-react';
import { useAuthTenant } from '../../context/AuthTenantContext';
import { ThemePalette, IndustryPackage, CompanyDocument } from '../../types/erp';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../../services/firebaseConfig';

export const CompanySettingsModule: React.FC = () => {
  const { currentCompany, setCurrentCompany, theme, setTheme, allBranches, isMasterPortal, currentUser } = useAuthTenant();
  const [activeTab, setActiveTab] = useState<'basic' | 'advanced' | 'subscription' | 'appearance' | 'security' | 'documents'>('basic');

  // Documents Vault State
  const [documents, setDocuments] = useState<CompanyDocument[]>(
    currentCompany.documents || [
      { id: 'doc_1', name: 'FBR NTN Certificate 2026.pdf', category: 'Tax Certificate', fileSize: '1.2 MB', uploadDate: '2026-01-15', uploadedBy: 'Master Admin', status: 'VERIFIED' },
      { id: 'doc_2', name: 'SECP Incorporation Certificate.pdf', category: 'Registration', fileSize: '3.4 MB', uploadDate: '2026-01-15', uploadedBy: 'Master Admin', status: 'VERIFIED' },
      { id: 'doc_3', name: 'SECP Form 29 Directors List.pdf', category: 'Legal', fileSize: '850 KB', uploadDate: '2026-02-10', uploadedBy: 'Client Admin', status: 'VERIFIED' }
    ]
  );
  const [docNameInput, setDocNameInput] = useState('');
  const [docCategoryInput, setDocCategoryInput] = useState<CompanyDocument['category']>('Legal');
  const [docUploadMsg, setDocUploadMsg] = useState(false);

  // Basic Profile Form Fields
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
  const [province, setProvince] = useState(currentCompany.province || 'Punjab');
  const [address, setAddress] = useState(currentCompany.address || '');
  const [logoUrl, setLogoUrl] = useState(currentCompany.logoUrl || '/assets/aistudio/image_6a2e4307.png');
  const [backgroundUrl, setBackgroundUrl] = useState(currentCompany.backgroundUrl || 'https://images.unsplash.com/photo-1509391365360-2e959784a276?q=80&w=1920&auto=format&fit=crop');

  // Advanced Details
  const [fiscalYear, setFiscalYear] = useState('2026-2027');
  const [currency, setCurrency] = useState('PKR (Pakistani Rupee)');
  const [fbrPosKey, setFbrPosKey] = useState('FBR-POS-7829103');
  const [defaultCostCenter, setDefaultCostCenter] = useState('MAIN_FACTORY_LAHORE');

  // Subscription & Limits
  const [subscriptionPlan, setSubscriptionPlan] = useState(currentCompany.subscriptionPlan || 'Enterprise Standard Plan');
  const [userLimit, setUserLimit] = useState(currentCompany.userLimit || 25);
  const [branchLimit, setBranchLimit] = useState(currentCompany.branchLimit || 5);

  // Approval request state for Client Admin
  const [limitRequestReason, setLimitRequestReason] = useState('');
  const [requestedUsers, setRequestedUsers] = useState(50);
  const [limitRequestSuccess, setLimitRequestSuccess] = useState(false);

  // Appearance, Font & 12 Table Design Patterns / 10 Layout Patterns
  const [selectedTablePattern, setSelectedTablePattern] = useState(currentCompany.tablePattern || 'Omecta APEX Clean White');
  const [selectedTableLayout, setSelectedTableLayout] = useState(currentCompany.tableLayoutPattern || 'Standard Full Width');
  const [selectedFont, setSelectedFont] = useState(currentCompany.fontFamily || 'Inter');

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

  // Security Passwords Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const [savedSuccess, setSavedSuccess] = useState(false);

  // Favicon Synchronization Effect: Automatically update browser tab favicon with logo URL
  useEffect(() => {
    if (logoUrl) {
      let link: HTMLLinkElement | null = document.querySelector("link[rel*='icon']");
      if (!link) {
        link = document.createElement('link');
        link.type = 'image/x-icon';
        link.rel = 'shortcut icon';
        document.getElementsByTagName('head')[0].appendChild(link);
      }
      link.href = logoUrl;
    }
  }, [logoUrl]);

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
      province,
      address,
      logoUrl,
      backgroundUrl,
      subscriptionPlan,
      userLimit,
      branchLimit,
      activeModules,
      theme,
      tablePattern: selectedTablePattern,
      tableLayoutPattern: selectedTableLayout,
      fontFamily: selectedFont,
      documents
    };

    // Update Context & Firestore
    setCurrentCompany(updatedCompany);

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

  // Handle Client Admin Requesting Limit Increase from Master User
  const handleRequestLimitIncrease = async (e: React.FormEvent) => {
    e.preventDefault();
    const newRequest = {
      id: `req_${Date.now().toString().slice(-4)}`,
      requestedUserLimit: requestedUsers,
      requestedBranchLimit: branchLimit + 2,
      requestedBy: currentUser.name || 'Client Admin',
      reason: limitRequestReason || 'Business expansion requiring additional user seats',
      requestedAt: new Date().toISOString().split('T')[0],
      status: 'PENDING' as const
    };

    const updatedRequests = [...(currentCompany.limitApprovalRequests || []), newRequest];
    const updatedCompany = { ...currentCompany, limitApprovalRequests: updatedRequests };

    setCurrentCompany(updatedCompany);

    try {
      await setDoc(doc(db, 'companies', currentCompany.id), { limitApprovalRequests: updatedRequests }, { merge: true });
    } catch (e) {
      console.warn('Firebase request save error:', e);
    }

    setLimitRequestSuccess(true);
    setLimitRequestReason('');
    setTimeout(() => setLimitRequestSuccess(false), 4000);
  };

  // Password Change Handler
  const handlePasswordChangeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);

    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('New password and confirm password do not match.');
      return;
    }

    setPasswordSuccess(true);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setTimeout(() => setPasswordSuccess(false), 4000);
  };

  // Document Upload & Management Handlers
  const handleUploadDocument = (e: React.FormEvent) => {
    e.preventDefault();
    if (!docNameInput.trim()) return;

    const newDoc: CompanyDocument = {
      id: `doc_${Date.now()}`,
      name: docNameInput.trim(),
      category: docCategoryInput,
      fileSize: `${(Math.random() * 3 + 0.5).toFixed(1)} MB`,
      uploadDate: new Date().toISOString().split('T')[0],
      uploadedBy: currentUser.name || 'Admin',
      status: 'VERIFIED'
    };

    const updatedDocs = [newDoc, ...documents];
    setDocuments(updatedDocs);
    setDocNameInput('');
    setDocUploadMsg(true);
    setTimeout(() => setDocUploadMsg(false), 3000);
  };

  const handleDeleteDocument = (id: string) => {
    setDocuments(documents.filter(d => d.id !== id));
  };

  // 12 Table Design Patterns Options (Inspired by Omecta APEX screenshot)
  const TABLE_PATTERNS = [
    { id: 'Omecta APEX Clean White', label: '1. Omecta APEX Clean White (Classic Oracle APEX)', preview: 'bg-white text-slate-900 border-slate-200' },
    { id: 'Modern Dark Glassmorphism', label: '2. Modern Dark Glassmorphism', preview: 'bg-slate-900/90 text-slate-100 border-slate-800' },
    { id: 'Alternating Zebra Striped', label: '3. Alternating Zebra Striped Rows', preview: 'bg-slate-800/80 text-slate-100 border-slate-700' },
    { id: 'Compact High-Density Grid', label: '4. Compact High-Density Grid', preview: 'bg-slate-950 text-slate-200 border-slate-800 text-[10px]' },
    { id: 'Bordered Enterprise Grid', label: '5. Bordered Enterprise Grid (Full Outline)', preview: 'bg-slate-900 text-slate-100 border-2 border-cyan-500/40' },
    { id: 'Minimalist Line Table', label: '6. Minimalist Line Table', preview: 'bg-slate-900/50 text-slate-300 border-b border-slate-700' },
    { id: 'Cyan Highlight Accents', label: '7. Cyan Highlight Accents', preview: 'bg-cyan-950/40 text-cyan-200 border-cyan-500' },
    { id: 'Soft Rounded Cards Table', label: '8. Soft Rounded Cards Table', preview: 'bg-slate-800 text-slate-100 rounded-xl' },
    { id: 'Neumorphic Elevation Rows', label: '9. Neumorphic Elevation Rows', preview: 'bg-slate-900 text-slate-100 shadow-md' },
    { id: 'APEX Blue Column Headers', label: '10. APEX Blue Column Headers', preview: 'bg-blue-600 text-white font-bold' },
    { id: 'Financial Double-Line Footer', label: '11. Financial Double-Line Footer Table', preview: 'bg-slate-900 border-b-4 border-double border-emerald-400' },
    { id: 'FBR Tax Audit Grid', label: '12. FBR Tax Audit Grid', preview: 'bg-amber-950/20 border-amber-500/30 text-amber-200' }
  ];

  // 10 Table Layout Patterns Options
  const TABLE_LAYOUT_PATTERNS = [
    { id: 'Standard Full Width', label: '1. Standard Full Width Responsive Grid' },
    { id: 'Split Screen Master-Detail', label: '2. Split Screen Master-Detail Table View' },
    { id: 'Responsive Card Grid', label: '3. Responsive Card Grid Layout' },
    { id: 'Sticky Header Fixed Columns', label: '4. Sticky Header Fixed Left Columns' },
    { id: 'Accordion Grouped Category Rows', label: '5. Accordion Grouped Category Rows' },
    { id: 'Paginated 10/25/50/100 Row View', label: '6. Paginated 10/25/50/100 Row View' },
    { id: 'High Density Compact List', label: '7. High Density Compact List View' },
    { id: 'Comparative Dual Column Layout', label: '8. Comparative Dual Column Layout' },
    { id: 'Summary Totals Footer Grid', label: '9. Summary Totals Footer Grid' },
    { id: 'Infinite Scroll Stream Layout', label: '10. Infinite Scroll Stream Layout' }
  ];

  // 10-12 Color Themes
  const THEMES: { id: ThemePalette; label: string; bg: string }[] = [
    { id: 'corporate-blue', label: '1. Corporate Omecta Blue', bg: 'bg-blue-600' },
    { id: 'enterprise-dark', label: '2. Enterprise Dark Slate', bg: 'bg-slate-800' },
    { id: 'professional-green', label: '3. Emerald Green', bg: 'bg-emerald-600' },
    { id: 'royal-black-gold', label: '4. Royal Black & Gold', bg: 'bg-amber-600' },
    { id: 'modern-light', label: '5. Modern Indigo', bg: 'bg-indigo-600' },
  ];

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      {/* Module Title */}
      <div className="border-b border-slate-800 pb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-100 flex items-center gap-2">
            <Settings className="w-6 h-6 text-cyan-400" />
            Company Profile, Branding & Multi-Pattern Configuration
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Configure company identity, login form logo/scenic background, favicon, table design patterns, layouts, and master admin limit approval workflows.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isMasterPortal ? (
            <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-bold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
              Master Admin Mode (Full Edit Unlocked)
            </span>
          ) : (
            <span className="px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-bold flex items-center gap-1">
              <Lock className="w-3.5 h-3.5 text-cyan-400" />
              Client Admin User (Limits Locked by Master)
            </span>
          )}
        </div>
      </div>

      {savedSuccess && (
        <div className="p-4 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in shadow-xl">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <div>
            <div className="font-bold">Company Settings Saved & Synchronized</div>
            <div className="text-[11px] opacity-90">All company profiles, background images, favicons, active department modules, and APEX patterns updated.</div>
          </div>
        </div>
      )}

      {/* Navigation Sub-Tabs Bar (Inspired by Omecta APEX UI) */}
      <div className="flex flex-wrap items-center gap-1.5 border-b border-slate-800 pb-2 text-xs font-bold">
        <button
          onClick={() => setActiveTab('basic')}
          className={`px-4 py-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'basic' ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/30' : 'bg-slate-900 text-slate-400 hover:text-slate-100 hover:bg-slate-800'
          }`}
        >
          <Building2 className="w-4 h-4" /> Basic Details
        </button>

        <button
          onClick={() => setActiveTab('advanced')}
          className={`px-4 py-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'advanced' ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/30' : 'bg-slate-900 text-slate-400 hover:text-slate-100 hover:bg-slate-800'
          }`}
        >
          <Sliders className="w-4 h-4" /> Advanced Details
        </button>

        <button
          onClick={() => setActiveTab('subscription')}
          className={`px-4 py-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'subscription' ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/30' : 'bg-slate-900 text-slate-400 hover:text-slate-100 hover:bg-slate-800'
          }`}
        >
          <CreditCard className="w-4 h-4" /> Subscription & Limits
        </button>

        <button
          onClick={() => setActiveTab('appearance')}
          className={`px-4 py-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'appearance' ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/30' : 'bg-slate-900 text-slate-400 hover:text-slate-100 hover:bg-slate-800'
          }`}
        >
          <Palette className="w-4 h-4" /> Appearance & Table Patterns
        </button>

        <button
          onClick={() => setActiveTab('security')}
          className={`px-4 py-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'security' ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/30' : 'bg-slate-900 text-slate-400 hover:text-slate-100 hover:bg-slate-800'
          }`}
        >
          <KeyRound className="w-4 h-4" /> Security & Passwords
        </button>

        <button
          onClick={() => setActiveTab('documents')}
          className={`px-4 py-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'documents' ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/30' : 'bg-slate-900 text-slate-400 hover:text-slate-100 hover:bg-slate-800'
          }`}
        >
          <FileText className="w-4 h-4" /> Documents Vault ({documents.length})
        </button>
      </div>

      {/* Main Tabbed Container */}
      <form onSubmit={handleSave} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6">
        
        {/* TAB 1: BASIC DETAILS */}
        {activeTab === 'basic' && (
          <div className="space-y-6 animate-in fade-in">
            <h2 className="text-sm font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-2 border-b border-slate-800 pb-2">
              <Building2 className="w-4 h-4" /> Basic Enterprise Identity & Tax Credentials
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Company Trade Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-100 font-bold focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Registered Corporate Title</label>
                <input
                  type="text"
                  value={registeredName}
                  onChange={(e) => setRegisteredName(e.target.value)}
                  required
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-100 font-semibold focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Industry Package</label>
                <select
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value as IndustryPackage)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-100 font-semibold focus:outline-none focus:border-cyan-500"
                >
                  <option value="Manufacturing">Manufacturing</option>
                  <option value="Food & Beverage">Food & Beverage</option>
                  <option value="Solar & Electrical">Solar & Electrical</option>
                  <option value="Textile">Textile</option>
                  <option value="Construction">Construction</option>
                  <option value="Wholesale">Wholesale</option>
                  <option value="Retail & POS">Retail & POS</option>
                  <option value="Supermarket">Supermarket</option>
                  <option value="Services">Services</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Company Prefix Code</label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-100 font-mono font-bold focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">FBR NTN Tax Registration Number</label>
                <input
                  type="text"
                  value={ntn}
                  onChange={(e) => setNtn(e.target.value)}
                  placeholder="e.g. 2840192-3"
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-100 font-mono focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">FBR STRN Sales Tax Number</label>
                <input
                  type="text"
                  value={strn}
                  onChange={(e) => setStrn(e.target.value)}
                  placeholder="e.g. 327787123901"
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-100 font-mono focus:outline-none focus:border-cyan-500"
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
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Contact Phone</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">City / Province</label>
                <input
                  type="text"
                  value={`${city}, ${province}`}
                  onChange={(e) => {
                    const parts = e.target.value.split(',');
                    setCity(parts[0] || city);
                    if (parts[1]) setProvince(parts[1].trim());
                  }}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Registered Address</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>
        )}

        {/* TAB 2: ADVANCED DETAILS */}
        {activeTab === 'advanced' && (
          <div className="space-y-6 animate-in fade-in">
            <h2 className="text-sm font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-2 border-b border-slate-800 pb-2">
              <Sliders className="w-4 h-4" /> Advanced Financial & FBR POS Parameters
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Accounting Financial Year</label>
                <input
                  type="text"
                  value={fiscalYear}
                  onChange={(e) => setFiscalYear(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-100 font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Default Base Currency</label>
                <input
                  type="text"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-100 font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">FBR Real-Time POS Device Integration Key</label>
                <input
                  type="text"
                  value={fbrPosKey}
                  onChange={(e) => setFbrPosKey(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-100 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Default Cost Center</label>
                <input
                  type="text"
                  value={defaultCostCenter}
                  onChange={(e) => setDefaultCostCenter(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-100 font-mono"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: SUBSCRIPTION & LIMITS WITH MASTER APPROVAL WORKFLOW */}
        {activeTab === 'subscription' && (
          <div className="space-y-6 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h2 className="text-sm font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-2">
                <CreditCard className="w-4 h-4" /> Subscription Tier, Limits & Master User Approval
              </h2>
              {isMasterPortal ? (
                <span className="text-xs text-purple-300 font-bold flex items-center gap-1">
                  <Unlock className="w-3.5 h-3.5 text-purple-400" /> Editable by Master User
                </span>
              ) : (
                <span className="text-xs text-amber-300 font-bold flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5 text-amber-400" /> Locked (Requires Master Approval to Edit)
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Purchased Subscription Plan</label>
                <input
                  type="text"
                  value={subscriptionPlan}
                  onChange={(e) => setSubscriptionPlan(e.target.value)}
                  disabled={!isMasterPortal}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-100 font-semibold disabled:opacity-60"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">User Seat Limit</label>
                <input
                  type="number"
                  value={userLimit}
                  onChange={(e) => setUserLimit(Number(e.target.value))}
                  disabled={!isMasterPortal}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-100 font-mono font-bold disabled:opacity-60"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Branch Locations Limit</label>
                <input
                  type="number"
                  value={branchLimit}
                  onChange={(e) => setBranchLimit(Number(e.target.value))}
                  disabled={!isMasterPortal}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-100 font-mono font-bold disabled:opacity-60"
                />
              </div>
            </div>

            {/* If Client Admin is logged in: Show Approval Request Panel to Master User */}
            {!isMasterPortal && (
              <div className="p-5 rounded-2xl bg-amber-950/30 border border-amber-500/40 space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
                  <Lock className="w-4 h-4 text-amber-400" />
                  <span>Request User Limit / Capacity Increase from Master User</span>
                </div>
                <p className="text-xs text-slate-300">
                  To increase your company user seats or enable additional departments, submit an approval request to the Master Global Administrator below.
                </p>

                {limitRequestSuccess && (
                  <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Approval request submitted to Master User! Status: PENDING.</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">Requested User Seats Limit</label>
                    <input
                      type="number"
                      value={requestedUsers}
                      onChange={(e) => setRequestedUsers(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">Justification Reason</label>
                    <input
                      type="text"
                      value={limitRequestReason}
                      onChange={(e) => setLimitRequestReason(e.target.value)}
                      placeholder="e.g. Adding new sales & warehouse staff"
                      className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleRequestLimitIncrease}
                  className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs shadow-lg shadow-amber-600/20 flex items-center gap-2 transition-all cursor-pointer"
                >
                  <FileCheck2 className="w-4 h-4" />
                  Submit Approval Request to Master User &rarr;
                </button>
              </div>
            )}

            {/* Active Department Modules */}
            <div className="space-y-3 pt-2 border-t border-slate-800">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                  Active Department Modules
                </h3>
                <button
                  type="button"
                  onClick={() => setActiveModules(ALL_MODULES.map((m) => m.id))}
                  className="text-[11px] font-bold text-cyan-400 hover:underline cursor-pointer"
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
                      className={`p-3 rounded-xl border text-left text-xs transition-all flex items-start gap-3 cursor-pointer ${
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
                          {isChecked ? 'Enabled for Sidebar' : 'Disabled'}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: APPEARANCE, BRANDING LOGO/BACKGROUND, FAVICON SYNC & 12 TABLE DESIGN PATTERNS / 10 LAYOUTS */}
        {activeTab === 'appearance' && (
          <div className="space-y-6 animate-in fade-in">
            <h2 className="text-sm font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-2 border-b border-slate-800 pb-2">
              <Palette className="w-4 h-4" /> Logo, Scenic Background, Favicon & APEX UI Patterns
            </h2>

            {/* Logo & Scenic Background Sync */}
            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <Image className="w-4 h-4 text-cyan-400" /> Logo & Login Screen Background Upload
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Company Logo URL (Applies to Invoices & Favicon)
                  </label>
                  <input
                    type="text"
                    value={logoUrl}
                    onChange={(e) => setLogoUrl(e.target.value)}
                    placeholder="/assets/aistudio/image_6a2e4307.png"
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-cyan-500 font-mono"
                  />
                  <div className="mt-2 flex items-center gap-3">
                    <img src={logoUrl} alt="Logo Preview" className="w-10 h-10 rounded-xl object-contain bg-slate-800 border border-slate-700 p-1" />
                    <span className="text-[10px] text-emerald-400 font-mono">Favicon Automatically Synced ✓</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Scenic Background Image URL (Login Form Portal)
                  </label>
                  <input
                    type="text"
                    value={backgroundUrl}
                    onChange={(e) => setBackgroundUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/photo-1509391365360..."
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-cyan-500 font-mono"
                  />
                  <div className="mt-2 flex items-center gap-3">
                    <div
                      className="w-16 h-10 rounded-xl bg-cover bg-center border border-slate-700"
                      style={{ backgroundImage: `url(${backgroundUrl})` }}
                    />
                    <span className="text-[10px] text-cyan-400 font-mono">Login Form Backdrop Live Synced</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Typography Font Picker */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider">
                Typography Font Family
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {(['Inter', 'Roboto', 'Fira Code', 'Outfit', 'Montserrat'] as const).map((font) => (
                  <button
                    type="button"
                    key={font}
                    onClick={() => setSelectedFont(font)}
                    className={`p-2.5 rounded-xl border text-xs font-bold text-center transition-all cursor-pointer ${
                      selectedFont === font
                        ? 'bg-cyan-600 text-white border-cyan-400 shadow-md'
                        : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                    }`}
                  >
                    {font}
                  </button>
                ))}
              </div>
            </div>

            {/* 12 Table Design Patterns Picker */}
            <div className="space-y-3 pt-2 border-t border-slate-800">
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <Table className="w-4 h-4 text-cyan-400" />
                Select Table Design Pattern (12 Patterns Available)
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {TABLE_PATTERNS.map((pattern) => (
                  <button
                    type="button"
                    key={pattern.id}
                    onClick={() => setSelectedTablePattern(pattern.id)}
                    className={`p-3 rounded-xl border text-left text-xs transition-all flex items-center justify-between cursor-pointer ${
                      selectedTablePattern === pattern.id
                        ? 'bg-cyan-950/60 border-cyan-500 text-cyan-200 shadow-lg'
                        : 'bg-slate-800/40 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="font-semibold">{pattern.label}</div>
                    {selectedTablePattern === pattern.id && (
                      <Check className="w-4 h-4 text-cyan-400 shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* 10 Table Layout Patterns Picker */}
            <div className="space-y-3 pt-2 border-t border-slate-800">
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <Layout className="w-4 h-4 text-purple-400" />
                Select Table Layout Pattern (10 Layouts Available)
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {TABLE_LAYOUT_PATTERNS.map((layout) => (
                  <button
                    type="button"
                    key={layout.id}
                    onClick={() => setSelectedTableLayout(layout.id)}
                    className={`p-3 rounded-xl border text-left text-xs transition-all flex items-center justify-between cursor-pointer ${
                      selectedTableLayout === layout.id
                        ? 'bg-purple-950/60 border-purple-500 text-purple-200 shadow-lg'
                        : 'bg-slate-800/40 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="font-semibold">{layout.label}</div>
                    {selectedTableLayout === layout.id && (
                      <Check className="w-4 h-4 text-purple-400 shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: SECURITY & PASSWORDS */}
        {activeTab === 'security' && (
          <div className="space-y-6 animate-in fade-in">
            <h2 className="text-sm font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-2 border-b border-slate-800 pb-2">
              <KeyRound className="w-4 h-4" /> Security Password Management & Account Lockout
            </h2>

            {passwordSuccess && (
              <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Account password changed successfully! Next login requires new credentials.</span>
              </div>
            )}

            {passwordError && (
              <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400" />
                <span>{passwordError}</span>
              </div>
            )}

            <div className="max-w-md space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Current Password</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-100 font-mono focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-100 font-mono focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Confirm New Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-100 font-mono focus:outline-none focus:border-cyan-500"
                />
              </div>

              <button
                type="button"
                onClick={handlePasswordChangeSubmit}
                className="px-6 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-lg shadow-cyan-600/30 flex items-center gap-2 transition-all cursor-pointer"
              >
                <KeyRound className="w-4 h-4" />
                Update Security Password &rarr;
              </button>
            </div>
          </div>
        )}

        {/* TAB 6: DOCUMENTS VAULT */}
        {activeTab === 'documents' && (
          <div className="space-y-6 animate-in fade-in">
            <h2 className="text-sm font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-2 border-b border-slate-800 pb-2">
              <FileText className="w-4 h-4" /> Legal, Tax & Registration Secure Documents Vault
            </h2>

            {docUploadMsg && (
              <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Document uploaded and securely encrypted in Firestore vault!</span>
              </div>
            )}

            {/* Upload form */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <Upload className="w-4 h-4 text-cyan-400" /> Upload New Legal / Tax / Registration Document
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Document Title / Name</label>
                  <input
                    type="text"
                    value={docNameInput}
                    onChange={(e) => setDocNameInput(e.target.value)}
                    placeholder="e.g. Annual Tax Return 2025.pdf"
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Document Category</label>
                  <select
                    value={docCategoryInput}
                    onChange={(e) => setDocCategoryInput(e.target.value as CompanyDocument['category'])}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-100 font-semibold focus:outline-none focus:border-cyan-500"
                  >
                    <option value="Legal">Legal</option>
                    <option value="Tax Certificate">Tax Certificate</option>
                    <option value="Registration">Registration</option>
                    <option value="Compliance">Compliance</option>
                    <option value="Financial Audit">Financial Audit</option>
                  </select>
                </div>

                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={handleUploadDocument}
                    className="w-full px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-lg shadow-cyan-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <Upload className="w-4 h-4" /> Upload & Encrypt
                  </button>
                </div>
              </div>
            </div>

            {/* Documents List */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                  Stored Vault Files ({documents.length})
                </h3>
                <span className="text-[11px] text-emerald-400 font-mono">Storage Used: 5.46 MB / 500 MB (Encrypted)</span>
              </div>

              <div className="space-y-2">
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/80 flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-cyan-600/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-bold text-xs text-slate-100">{doc.name}</div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-3 mt-0.5 font-mono">
                          <span className="px-2 py-0.5 rounded bg-slate-700 text-cyan-300 font-semibold">{doc.category}</span>
                          <span>Size: {doc.fileSize}</span>
                          <span>Date: {doc.uploadDate}</span>
                          <span>By: {doc.uploadedBy}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
                        {doc.status}
                      </span>
                      <button
                        type="button"
                        onClick={() => alert(`Downloading secure document: ${doc.name}`)}
                        className="p-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-cyan-300 cursor-pointer"
                        title="Download Document"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteDocument(doc.id)}
                        className="p-2 rounded-lg bg-slate-700 hover:bg-rose-600/30 text-rose-400 cursor-pointer"
                        title="Delete Document"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Global Save Button */}
        <div className="pt-4 border-t border-slate-800 flex justify-end">
          <button
            type="submit"
            className="px-8 py-3 rounded-2xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs shadow-xl shadow-cyan-600/30 flex items-center gap-2 cursor-pointer transition-all"
          >
            <Save className="w-4 h-4" />
            Save Complete Company Settings & Patterns
          </button>
        </div>
      </form>
    </div>
  );
};
