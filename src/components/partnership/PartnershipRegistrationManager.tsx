import React, { useState } from 'react';
import {
  Building2,
  Users,
  Plus,
  Trash2,
  Save,
  AlertTriangle,
  CheckCircle2,
  DollarSign,
  ShieldCheck,
  Briefcase,
  FileText
} from 'lucide-react';
import { Partnership, PartnerProfile, PartnershipType, PartnerClassification } from '../../types/partnership';
import { saveCompanyPartnerships } from '../../services/partnershipService';
import { useAuthTenant } from '../../context/AuthTenantContext';
import { TTSButton } from '../common/TTSButton';

interface PartnershipRegistrationManagerProps {
  partnerships: Partnership[];
  onRefreshData: () => void;
}

const PARTNERSHIP_TYPES: PartnershipType[] = [
  'General Partnership',
  'Limited Liability Partnership (LLP)',
  'Joint Venture',
  'Strategic Partnership',
  'Investment Partnership',
  'Working Partnership',
  'Silent / Sleeping Partnership',
  'Profit-Sharing Arrangement',
  'Custom Agreement'
];

const CLASSIFICATIONS_LIST: PartnerClassification[] = [
  'Active Partner',
  'Working Partner',
  'Sleeping Partner',
  'Capital Partner',
  'Investor Partner',
  'Managing Partner',
  'Technical Partner',
  'Silent Partner',
  'Profit-Sharing Partner',
  'Custom Partner'
];

export const PartnershipRegistrationManager: React.FC<PartnershipRegistrationManagerProps> = ({
  partnerships,
  onRefreshData
}) => {
  const { currentCompany } = useAuthTenant();
  const [selectedPartnership, setSelectedPartnership] = useState<Partnership | null>(partnerships[0] || null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Form State for Active or New Partnership
  const [formData, setFormData] = useState<Partnership>(() => ({
    id: `ptn_${Date.now()}`,
    partnershipCode: `JV-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
    partnershipName: 'Apex Industrial Joint Venture Consortium',
    registeredBusinessName: 'Apex Industrial JV (Pvt) Ltd',
    businessCategory: 'Textile & Apparel',
    businessSubcategory: 'Weaving & Dyeing',
    businessActivity: 'High speed weaving operations and export manufacturing',
    partnershipType: 'Joint Venture',
    registrationDate: new Date().toISOString().split('T')[0],
    effectiveDate: new Date().toISOString().split('T')[0],
    agreementStartDate: new Date().toISOString().split('T')[0],
    financialYear: '2026-2027',
    durationYears: 5,
    isContinuing: true,
    country: 'Pakistan',
    province: 'Punjab',
    city: 'Faisalabad',
    registeredOfficeAddress: 'Plot 45, Value Addition City, Faisalabad',
    operatingAddress: 'Plant B, Industrial Area, Faisalabad',
    taxRegistrationNo: '8877123-9',
    ntn: '8877123-9',
    strn: '3200112233445',
    registrationAuthority: 'SECP / Registrar of Firms Punjab',
    registrationNumber: 'REG-FSD-2026-88',
    bankAccountDetails: {
      bankName: 'Meezan Bank Limited',
      accountTitle: 'Apex Industrial JV',
      accountNumber: '02010109988776',
      iban: 'PK36MEZN0002010109988776'
    },
    currency: 'PKR',
    status: 'ACTIVE',
    createdAt: new Date().toISOString().split('T')[0],
    createdBy: 'Master Admin',
    tenantId: currentCompany.id,
    companyId: currentCompany.id,
    partners: [
      {
        id: `p1_${Date.now()}`,
        partnerCode: 'PTR-001',
        fullName: 'Shahid Iqbal',
        cnicOrRegNo: '33100-9988776-1',
        ntn: '4099812-1',
        nationality: 'Pakistani',
        country: 'Pakistan',
        city: 'Faisalabad',
        address: 'House 88, Civil Lines, Faisalabad',
        email: 'shahid@apextextile.pk',
        mobile: '+92-300-1122334',
        bankAccountDetails: {
          bankName: 'Meezan Bank Limited',
          accountTitle: 'Shahid Iqbal',
          accountNumber: '02010102233445',
          iban: 'PK36MEZN0002010102233445'
        },
        classifications: ['Active Partner', 'Managing Partner', 'Capital Partner'],
        joiningDate: new Date().toISOString().split('T')[0],
        effectiveDate: new Date().toISOString().split('T')[0],
        status: 'ACTIVE',
        initialCapitalPKR: 60000000,
        agreedProfitSharePercent: 60,
        agreedLossSharePercent: 60,
        votingRightsPercent: 60,
        managementRights: true,
        signingAuthority: true,
        bankTransactionLimitPKR: 10000000
      },
      {
        id: `p2_${Date.now()}`,
        partnerCode: 'PTR-002',
        fullName: 'Bilal Hassan',
        cnicOrRegNo: '35202-4455667-3',
        ntn: '5123987-4',
        nationality: 'Pakistani',
        country: 'Pakistan',
        city: 'Lahore',
        address: '12-Gulberg III, Lahore',
        email: 'bilal@apextextile.pk',
        mobile: '+92-321-8899000',
        bankAccountDetails: {
          bankName: 'Habib Bank Limited',
          accountTitle: 'Bilal Hassan',
          accountNumber: '10928877112201',
          iban: 'PK42HABB0010928877112201'
        },
        classifications: ['Working Partner', 'Capital Partner'],
        joiningDate: new Date().toISOString().split('T')[0],
        effectiveDate: new Date().toISOString().split('T')[0],
        status: 'ACTIVE',
        initialCapitalPKR: 40000000,
        agreedProfitSharePercent: 40,
        agreedLossSharePercent: 40,
        votingRightsPercent: 40,
        managementRights: true,
        signingAuthority: true,
        bankTransactionLimitPKR: 5000000
      }
    ],
    purpose: {
      businessPurpose: 'Production and global export of high-grade grey fabric and processed textiles.',
      natureOfBusiness: 'Textile Manufacturing & Export',
      scopeOfActivities: 'Yarn procurement, weaving, processing, and export delivery.',
      investmentObjective: 'Establishment of 60 Airjet Looms.',
      operationalResponsibilities: 'Shahid Iqbal manages sales & finance; Bilal Hassan manages plant operations.',
      geographicOperatingArea: 'Pakistan, Turkey & EU Markets',
      initialBusinessValuePKR: 100000000,
      expectedAnnualRevenuePKR: 400000000,
      expectedTotalInvestmentPKR: 100000000
    }
  }));

  const handleSelectEntity = (p: Partnership) => {
    setSelectedPartnership(p);
    setFormData(p);
    setIsCreatingNew(false);
  };

  const handleStartNew = () => {
    setIsCreatingNew(true);
    setSelectedPartnership(null);
    setFormData({
      id: `ptn_${Date.now()}`,
      partnershipCode: `JV-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      partnershipName: '',
      registeredBusinessName: '',
      businessCategory: 'Textile & Apparel',
      businessSubcategory: '',
      businessActivity: '',
      partnershipType: 'Joint Venture',
      registrationDate: new Date().toISOString().split('T')[0],
      effectiveDate: new Date().toISOString().split('T')[0],
      agreementStartDate: new Date().toISOString().split('T')[0],
      financialYear: '2026-2027',
      durationYears: 5,
      isContinuing: true,
      country: 'Pakistan',
      province: 'Punjab',
      city: 'Faisalabad',
      registeredOfficeAddress: '',
      operatingAddress: '',
      ntn: '',
      registrationAuthority: 'SECP / Registrar of Firms Punjab',
      registrationNumber: '',
      bankAccountDetails: {
        bankName: 'Meezan Bank Limited',
        accountTitle: '',
        accountNumber: '',
        iban: ''
      },
      currency: 'PKR',
      status: 'ACTIVE',
      createdAt: new Date().toISOString().split('T')[0],
      createdBy: 'Master Admin',
      tenantId: currentCompany.id,
      companyId: currentCompany.id,
      partners: [
        {
          id: `p1_${Date.now()}`,
          partnerCode: 'PTR-001',
          fullName: 'Partner One Name',
          cnicOrRegNo: '33100-1111111-1',
          nationality: 'Pakistani',
          country: 'Pakistan',
          city: 'Faisalabad',
          address: '',
          email: '',
          mobile: '',
          bankAccountDetails: {
            bankName: 'Meezan Bank Limited',
            accountTitle: '',
            accountNumber: '',
            iban: ''
          },
          classifications: ['Active Partner', 'Managing Partner'],
          joiningDate: new Date().toISOString().split('T')[0],
          effectiveDate: new Date().toISOString().split('T')[0],
          status: 'ACTIVE',
          initialCapitalPKR: 50000000,
          agreedProfitSharePercent: 50,
          agreedLossSharePercent: 50,
          votingRightsPercent: 50,
          managementRights: true,
          signingAuthority: true,
          bankTransactionLimitPKR: 5000000
        },
        {
          id: `p2_${Date.now()}`,
          partnerCode: 'PTR-002',
          fullName: 'Partner Two Name',
          cnicOrRegNo: '35202-2222222-2',
          nationality: 'Pakistani',
          country: 'Pakistan',
          city: 'Lahore',
          address: '',
          email: '',
          mobile: '',
          bankAccountDetails: {
            bankName: 'Habib Bank Limited',
            accountTitle: '',
            accountNumber: '',
            iban: ''
          },
          classifications: ['Capital Partner'],
          joiningDate: new Date().toISOString().split('T')[0],
          effectiveDate: new Date().toISOString().split('T')[0],
          status: 'ACTIVE',
          initialCapitalPKR: 50000000,
          agreedProfitSharePercent: 50,
          agreedLossSharePercent: 50,
          votingRightsPercent: 50,
          managementRights: false,
          signingAuthority: false,
          bankTransactionLimitPKR: 0
        }
      ],
      purpose: {
        businessPurpose: '',
        natureOfBusiness: '',
        scopeOfActivities: '',
        investmentObjective: '',
        operationalResponsibilities: '',
        geographicOperatingArea: 'Pakistan',
        initialBusinessValuePKR: 100000000,
        expectedAnnualRevenuePKR: 200000000,
        expectedTotalInvestmentPKR: 100000000
      }
    });
  };

  // Dynamic Partner Add / Delete
  const handleAddPartner = () => {
    const newCount = formData.partners.length + 1;
    const newPartner: PartnerProfile = {
      id: `p_${Date.now()}_${newCount}`,
      partnerCode: `PTR-00${newCount}`,
      fullName: `Partner ${newCount}`,
      cnicOrRegNo: '',
      nationality: 'Pakistani',
      country: 'Pakistan',
      city: 'Faisalabad',
      address: '',
      email: '',
      mobile: '',
      bankAccountDetails: {
        bankName: 'Meezan Bank Limited',
        accountTitle: '',
        accountNumber: '',
        iban: ''
      },
      classifications: ['Capital Partner'],
      joiningDate: new Date().toISOString().split('T')[0],
      effectiveDate: new Date().toISOString().split('T')[0],
      status: 'ACTIVE',
      initialCapitalPKR: 0,
      agreedProfitSharePercent: 0,
      agreedLossSharePercent: 0,
      votingRightsPercent: 0,
      managementRights: false,
      signingAuthority: false,
      bankTransactionLimitPKR: 0
    };
    setFormData(prev => ({ ...prev, partners: [...prev.partners, newPartner] }));
  };

  const handleRemovePartner = (id: string) => {
    if (formData.partners.length <= 2) {
      alert('A partnership must have at least 2 executing partners!');
      return;
    }
    setFormData(prev => ({ ...prev, partners: prev.partners.filter(p => p.id !== id) }));
  };

  const handlePartnerChange = (id: string, field: keyof PartnerProfile, value: any) => {
    setFormData(prev => ({
      ...prev,
      partners: prev.partners.map(p => p.id === id ? { ...p, [field]: value } : p)
    }));
  };

  // Live validation calculations
  const totalProfitPercent = formData.partners.reduce((sum, p) => sum + (Number(p.agreedProfitSharePercent) || 0), 0);
  const totalCapitalVal = formData.partners.reduce((sum, p) => sum + (Number(p.initialCapitalPKR) || 0), 0);

  const handleSave = async () => {
    if (!formData.partnershipName || !formData.registeredBusinessName) {
      alert('Please fill in Partnership Name and Registered Business Name!');
      return;
    }
    if (totalProfitPercent !== 100) {
      alert(`Profit Share total must equal 100%! Current sum: ${totalProfitPercent}%`);
      return;
    }

    let updatedList: Partnership[];
    if (isCreatingNew) {
      updatedList = [formData, ...partnerships];
    } else {
      updatedList = partnerships.map(p => p.id === formData.id ? formData : p);
    }

    await saveCompanyPartnerships(currentCompany.id, updatedList);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
    onRefreshData();
  };

  return (
    <div className="space-y-6">
      {/* Top Controls Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-100 flex items-center gap-2">
            <Building2 className="w-6 h-6 text-purple-400" /> Partnership &amp; Joint Venture Registration
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Register new legal entities, define multi-partner equity splits, bank authorities, and SECP registration data.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <TTSButton text="Partnership Registration Manager. Define partners, CNIC, profit share percentage, capital, and SECP registration." />
          <button
            onClick={handleStartNew}
            className="flex items-center gap-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-purple-600/30 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Register New Entity</span>
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-600/30 transition cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{savedSuccess ? 'Saved Successfully!' : 'Save Entity'}</span>
          </button>
        </div>
      </div>

      {/* Select Existing or Create New Switcher */}
      {partnerships.length > 0 && !isCreatingNew && (
        <div className="flex items-center gap-2 overflow-x-auto pb-2 custom-scrollbar">
          {partnerships.map((p) => (
            <button
              key={p.id}
              onClick={() => handleSelectEntity(p)}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition flex items-center gap-2 shrink-0 border cursor-pointer ${
                formData.id === p.id
                  ? 'bg-purple-600 text-white border-purple-500 shadow-lg'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>{p.partnershipName}</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-950/60 font-mono">
                {p.partners.length} Partners
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Main Registration Form Canvas */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-8">
        {/* Section 1: Entity Basic Particulars */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-purple-400" /> Entity Basic Particulars &amp; Registration
            </h2>
            <span className="text-xs font-mono text-purple-400 bg-purple-950/60 border border-purple-800 px-3 py-1 rounded-xl">
              SECP / FBR Schema
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-sans">
            <div>
              <label className="block text-slate-400 font-medium mb-1">Partnership / JV Name *</label>
              <input
                type="text"
                value={formData.partnershipName}
                onChange={(e) => setFormData({ ...formData, partnershipName: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-200 focus:outline-none focus:border-purple-500"
                placeholder="e.g. Crest Weaving & Exports JV"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1">Registered Business Name (Pvt/LLP) *</label>
              <input
                type="text"
                value={formData.registeredBusinessName}
                onChange={(e) => setFormData({ ...formData, registeredBusinessName: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-200 focus:outline-none focus:border-purple-500"
                placeholder="e.g. Crest Weaving & Exports JV (Pvt) Ltd"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1">Partnership Type</label>
              <select
                value={formData.partnershipType}
                onChange={(e) => setFormData({ ...formData, partnershipType: e.target.value as PartnershipType })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-200 focus:outline-none focus:border-purple-500"
              >
                {PARTNERSHIP_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1">Business Category</label>
              <input
                type="text"
                value={formData.businessCategory}
                onChange={(e) => setFormData({ ...formData, businessCategory: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-200 focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1">NTN / Registration No</label>
              <input
                type="text"
                value={formData.ntn}
                onChange={(e) => setFormData({ ...formData, ntn: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-200 focus:outline-none focus:border-purple-500"
                placeholder="9842100-1"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1">Registration Authority</label>
              <input
                type="text"
                value={formData.registrationAuthority}
                onChange={(e) => setFormData({ ...formData, registrationAuthority: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-200 focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-slate-400 font-medium mb-1">Registered Office Address</label>
              <input
                type="text"
                value={formData.registeredOfficeAddress}
                onChange={(e) => setFormData({ ...formData, registeredOfficeAddress: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-200 focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1">City &amp; Province</label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-200 focus:outline-none"
                  placeholder="Faisalabad"
                />
                <input
                  type="text"
                  value={formData.province}
                  onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                  className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-200 focus:outline-none"
                  placeholder="Punjab"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Executing Partners (2, 3, 4, 5, 10+ Flexible Partners) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2">
                <Users className="w-4 h-4 text-cyan-400" /> Executing Partner Profiles ({formData.partners.length} Partners)
              </h2>
              <p className="text-xs text-slate-400">Define equity, profit share %, voting rights, and CNIC details.</p>
            </div>

            <div className="flex items-center gap-3 font-mono text-xs">
              <span className={`px-3 py-1 rounded-xl border font-bold flex items-center gap-1.5 ${
                totalProfitPercent === 100
                  ? 'bg-emerald-950/60 border-emerald-800 text-emerald-300'
                  : 'bg-amber-950/60 border-amber-800 text-amber-300'
              }`}>
                {totalProfitPercent === 100 ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />}
                Total Profit Share: {totalProfitPercent}%
              </span>

              <span className="px-3 py-1 rounded-xl bg-slate-950 border border-slate-800 text-cyan-300 font-bold">
                Total Capital: PKR {totalCapitalVal.toLocaleString()}
              </span>

              <button
                onClick={handleAddPartner}
                className="px-3 py-1 bg-purple-600/30 hover:bg-purple-600/50 text-purple-300 border border-purple-500/40 font-bold rounded-xl transition flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Add Partner
              </button>
            </div>
          </div>

          {/* Flexible Partner Cards Grid */}
          <div className="space-y-6">
            {formData.partners.map((partner, index) => (
              <div key={partner.id} className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-4 relative">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="w-7 h-7 bg-purple-600/20 text-purple-300 border border-purple-500/30 font-mono font-bold text-xs rounded-xl flex items-center justify-center">
                      #{index + 1}
                    </span>
                    <h3 className="text-sm font-bold text-slate-100">{partner.fullName || `Partner #${index + 1}`}</h3>
                    <span className="text-[10px] font-mono text-slate-500">{partner.partnerCode}</span>
                  </div>

                  <button
                    onClick={() => handleRemovePartner(partner.id)}
                    className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-950/30 rounded-lg transition cursor-pointer"
                    title="Remove Partner"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                  <div>
                    <label className="block text-slate-400 font-medium mb-1">Full Name *</label>
                    <input
                      type="text"
                      value={partner.fullName}
                      onChange={(e) => handlePartnerChange(partner.id, 'fullName', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 font-medium mb-1">CNIC / Passport *</label>
                    <input
                      type="text"
                      value={partner.cnicOrRegNo}
                      onChange={(e) => handlePartnerChange(partner.id, 'cnicOrRegNo', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-purple-500 font-mono"
                      placeholder="33100-1234567-1"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 font-medium mb-1">Mobile / WhatsApp</label>
                    <input
                      type="text"
                      value={partner.mobile}
                      onChange={(e) => handlePartnerChange(partner.id, 'mobile', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-purple-500 font-mono"
                      placeholder="+92-300-1234567"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 font-medium mb-1">Email Address</label>
                    <input
                      type="email"
                      value={partner.email}
                      onChange={(e) => handlePartnerChange(partner.id, 'email', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-purple-400 font-bold mb-1">Initial Capital (PKR) *</label>
                    <input
                      type="number"
                      value={partner.initialCapitalPKR}
                      onChange={(e) => handlePartnerChange(partner.id, 'initialCapitalPKR', Number(e.target.value))}
                      className="w-full bg-slate-900 border border-purple-500/30 rounded-xl p-2.5 text-purple-200 font-mono font-bold focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-emerald-400 font-bold mb-1">Agreed Profit Share (%) *</label>
                    <input
                      type="number"
                      value={partner.agreedProfitSharePercent}
                      onChange={(e) => handlePartnerChange(partner.id, 'agreedProfitSharePercent', Number(e.target.value))}
                      className="w-full bg-slate-900 border border-emerald-500/30 rounded-xl p-2.5 text-emerald-300 font-mono font-bold focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-amber-400 font-bold mb-1">Agreed Loss Share (%)</label>
                    <input
                      type="number"
                      value={partner.agreedLossSharePercent}
                      onChange={(e) => handlePartnerChange(partner.id, 'agreedLossSharePercent', Number(e.target.value))}
                      className="w-full bg-slate-900 border border-amber-500/30 rounded-xl p-2.5 text-amber-300 font-mono font-bold focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-cyan-400 font-bold mb-1">Voting Rights (%)</label>
                    <input
                      type="number"
                      value={partner.votingRightsPercent}
                      onChange={(e) => handlePartnerChange(partner.id, 'votingRightsPercent', Number(e.target.value))}
                      className="w-full bg-slate-900 border border-cyan-500/30 rounded-xl p-2.5 text-cyan-300 font-mono font-bold focus:outline-none"
                    />
                  </div>
                </div>

                {/* Partner Bank Details Sub-row */}
                <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <label className="block text-slate-500 text-[10px] uppercase mb-0.5">Partner Bank Title</label>
                    <input
                      type="text"
                      value={partner.bankAccountDetails.accountTitle}
                      onChange={(e) => handlePartnerChange(partner.id, 'bankAccountDetails', { ...partner.bankAccountDetails, accountTitle: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-300"
                      placeholder="Account Title"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-500 text-[10px] uppercase mb-0.5">Bank Name</label>
                    <input
                      type="text"
                      value={partner.bankAccountDetails.bankName}
                      onChange={(e) => handlePartnerChange(partner.id, 'bankAccountDetails', { ...partner.bankAccountDetails, bankName: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-300"
                      placeholder="Meezan Bank Limited"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-500 text-[10px] uppercase mb-0.5">IBAN Number</label>
                    <input
                      type="text"
                      value={partner.bankAccountDetails.iban}
                      onChange={(e) => handlePartnerChange(partner.id, 'bankAccountDetails', { ...partner.bankAccountDetails, iban: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-300 font-mono"
                      placeholder="PK36MEZN..."
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
