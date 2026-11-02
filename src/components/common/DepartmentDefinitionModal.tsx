import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Search,
  FileSpreadsheet,
  Printer,
  Save,
  CheckCircle2,
  FolderTree,
  Building2,
  Trash2,
  Edit2,
  SlidersHorizontal,
  ChevronRight
} from 'lucide-react';
import { useAuthTenant } from '../../context/AuthTenantContext';
import { INITIAL_ACCOUNTS, INITIAL_INVENTORY, INITIAL_BRANCHES } from '../../services/mockData';

export interface DefinitionConfigTarget {
  id: string;
  code: string;
  title: string;
  departmentId: string;
  departmentLabel: string;
}

interface DepartmentDefinitionModalProps {
  isOpen: boolean;
  onClose: () => void;
  definitionTarget?: DefinitionConfigTarget | null;
}

interface DefinitionRecord {
  id: string;
  code: string;
  name: string;
  category: string;
  contactOrRef?: string;
  balanceOrLimit?: number;
  status: 'ACTIVE' | 'INACTIVE';
  notes?: string;
}

// Comprehensive seed dictionary for each department's definition categories
const DEFINITION_SEEDS: Record<string, DefinitionRecord[]> = {
  coa: [
    { id: 'def_coa_1', code: '1010', name: 'Cash in Hand (Main Vault PKR)', category: 'Current Asset', contactOrRef: 'Vault Custodian', balanceOrLimit: 4500000, status: 'ACTIVE', notes: 'Main Lahore Cash Till' },
    { id: 'def_coa_2', code: '1020', name: 'Meezan Bank Operations Account', category: 'Bank Account', contactOrRef: 'IBAN: PK42MEZN001', balanceOrLimit: 28400000, status: 'ACTIVE', notes: 'Primary payroll & vendor clearing' },
    { id: 'def_coa_3', code: '1200', name: 'Accounts Receivable (Trade Debtors)', category: 'Current Asset', contactOrRef: 'Credit Control Desk', balanceOrLimit: 14200000, status: 'ACTIVE', notes: 'Wholesale client ledger' },
    { id: 'def_coa_4', code: '2010', name: 'Accounts Payable (Trade Creditors)', category: 'Current Liability', contactOrRef: 'Procurement Accounts', balanceOrLimit: 9400000, status: 'ACTIVE', notes: 'Raw material suppliers' },
    { id: 'def_coa_5', code: '4010', name: 'Sales Revenue - Commercial Goods', category: 'Operating Revenue', contactOrRef: 'FBR STRN 18%', balanceOrLimit: 148000000, status: 'ACTIVE', notes: 'Gross taxable turnover' }
  ],
  suppliers: [
    { id: 'def_sup_1', code: 'SUP-001', name: 'Engro Polymer & Chemicals Ltd', category: 'Raw Materials', contactOrRef: '021-35678900', balanceOrLimit: 890000, status: 'ACTIVE', notes: 'NTN: 0711928-3, STRN: 12003841109' },
    { id: 'def_sup_2', code: 'SUP-002', name: 'Packaging World Private Ltd', category: 'Packaging', contactOrRef: '042-35990011', balanceOrLimit: 140000, status: 'ACTIVE', notes: 'NTN: 1982736-4' },
    { id: 'def_sup_3', code: 'SUP-003', name: 'Shell Pakistan Commercial Fuel', category: 'Operating Utilities', contactOrRef: '021-111-743-55', balanceOrLimit: 450000, status: 'ACTIVE', notes: 'Fleet & generator diesel supply' }
  ],
  cost_center: [
    { id: 'def_cc_1', code: 'CC-101', name: 'Lahore Manufacturing Plant 01', category: 'Production Center', contactOrRef: 'Kot Lakhpat Industrial', balanceOrLimit: 15000000, status: 'ACTIVE', notes: 'Main biscuit & flour baking lines' },
    { id: 'def_cc_2', code: 'CC-102', name: 'Karachi Port Logistics Terminal', category: 'Supply Chain', contactOrRef: 'SITE Karachi', balanceOrLimit: 8000000, status: 'ACTIVE', notes: 'Export & maritime transit storage' },
    { id: 'def_cc_3', code: 'CC-103', name: 'Executive Administration & IT Blue Area', category: 'Overheads', contactOrRef: 'Islamabad Blue Area', balanceOrLimit: 4500000, status: 'ACTIVE', notes: 'Headquarters corporate costs' }
  ],
  vendors: [
    { id: 'def_ven_1', code: 'VEN-011', name: 'National Corrugated Cartons (Pvt) Ltd', category: 'Packaging Material', contactOrRef: '042-35889922', balanceOrLimit: 620000, status: 'ACTIVE', notes: 'High tensile 5-ply cartons' },
    { id: 'def_ven_2', code: 'VEN-012', name: 'Pak Suzuki Machinery Spares', category: 'Plant Maintenance', contactOrRef: '021-38829911', balanceOrLimit: 310000, status: 'ACTIVE', notes: 'Forklift & machinery spare parts' },
    { id: 'def_ven_3', code: 'VEN-013', name: 'Sui Northern Gas Pipeline Ltd', category: 'Industrial Gas', contactOrRef: 'UAN: 1199', balanceOrLimit: 1250000, status: 'ACTIVE', notes: 'Factory furnace pipeline meter #8812' }
  ],
  req_types: [
    { id: 'def_req_1', code: 'REQ-NORM', name: 'Standard Routine Procurement', category: 'Normal Requisition', contactOrRef: 'Dept Head Approval', balanceOrLimit: 500000, status: 'ACTIVE', notes: 'Standard 7-day turnaround' },
    { id: 'def_req_2', code: 'REQ-EMRG', name: 'Emergency Plant Breakdown', category: 'Urgent', contactOrRef: 'COO Approval', balanceOrLimit: 2000000, status: 'ACTIVE', notes: 'Direct purchase within 24 hours' },
    { id: 'def_req_3', code: 'REQ-CAPX', name: 'Capital Expenditure (CapEx)', category: 'Asset Investment', contactOrRef: 'Board Resolution', balanceOrLimit: 50000000, status: 'ACTIVE', notes: 'Requires multi-vendor technical evaluation' }
  ],
  item_master: [
    { id: 'def_itm_1', code: 'RM-FLOUR-50K', name: 'Premium Grade Wheat Flour (50kg Bag)', category: 'Raw Materials', contactOrRef: 'UOM: Bags', balanceOrLimit: 4200, status: 'ACTIVE', notes: 'Current Stock: 1,250 Bags' },
    { id: 'def_itm_2', code: 'RM-OIL-16L', name: 'Refined Edible Cooking Oil (16L Tin)', category: 'Raw Materials', contactOrRef: 'UOM: Tins', balanceOrLimit: 6800, status: 'ACTIVE', notes: 'Current Stock: 840 Tins' },
    { id: 'def_itm_3', code: 'FG-TWILL-ROLL', name: 'Dyed Twill Fabric (Rolls 100m)', category: 'Finished Goods', contactOrRef: 'UOM: Rolls', balanceOrLimit: 2400, status: 'ACTIVE', notes: 'Current Stock: 1,850 Rolls' },
    { id: 'def_itm_4', code: 'RM-YARN-30S', name: '100% Combed Cotton Yarn 30s/1', category: 'Yarn Store', contactOrRef: 'UOM: Bags (100 lbs)', balanceOrLimit: 28500, status: 'ACTIVE', notes: 'Current Stock: 420 Bags' }
  ],
  categories: [
    { id: 'def_cat_1', code: 'CAT-RAW', name: 'Raw Cotton & Natural Fibers', category: 'Inventory Group', contactOrRef: 'Lead Time: 5 Days', balanceOrLimit: 0, status: 'ACTIVE', notes: 'Cotton bales, polyester staple fiber' },
    { id: 'def_cat_2', code: 'CAT-PKG', name: 'Cone Tubes & Wrapping Films', category: 'Inventory Group', contactOrRef: 'Lead Time: 7 Days', balanceOrLimit: 0, status: 'ACTIVE', notes: 'Paper cones, polyethylene wraps, strapping' },
    { id: 'def_cat_3', code: 'CAT-FG', name: 'Finished Yarns & Woven Fabrics', category: 'Inventory Group', contactOrRef: 'Shelf Life: Permanent', balanceOrLimit: 0, status: 'ACTIVE', notes: 'Ready for export & trade distribution' }
  ],
  warehouses: [
    { id: 'def_wh_1', code: 'WH-LHR-MAIN', name: 'Lahore Central Factory Warehouse', category: 'Bonded Warehouse', contactOrRef: 'Kot Lakhpat Industrial', balanceOrLimit: 120000, status: 'ACTIVE', notes: 'Capacity: 120,000 sq ft, 4 Docks' },
    { id: 'def_wh_2', code: 'WH-KHI-PORT', name: 'Karachi Port Transit Terminal', category: 'Distribution Hub', contactOrRef: 'SITE Industrial Area', balanceOrLimit: 65000, status: 'ACTIVE', notes: 'Port container staging facility' },
    { id: 'def_wh_3', code: 'WH-ISB-TECH', name: 'Faisalabad Regional Logistics Hub', category: 'Commercial Depot', contactOrRef: 'Millat Industrial Estate', balanceOrLimit: 30000, status: 'ACTIVE', notes: 'Spinning mill distribution hub' }
  ],
  customers: [
    { id: 'def_cust_1', code: 'CUST-002', name: 'Kohinoor Textile Traders (Pvt) Ltd', category: 'Tier 1 Wholesale', contactOrRef: '0300-8456123', balanceOrLimit: 2500000, status: 'ACTIVE', notes: 'NTN: 4102938-1, Current Balance: PKR 385,400' },
    { id: 'def_cust_2', code: 'CUST-003', name: 'Lahore Mega Wholesalers & Distributors', category: 'Super Stockist', contactOrRef: '0321-4455667', balanceOrLimit: 5000000, status: 'ACTIVE', notes: 'NTN: 3991204-5, Current Balance: PKR 1,240,000' },
    { id: 'def_cust_3', code: 'CUST-004', name: 'Karachi Central Distribution Hub', category: 'Regional Distributor', contactOrRef: '0333-2198765', balanceOrLimit: 3000000, status: 'ACTIVE', notes: 'NTN: 5129301-2, Current Balance: PKR 612,500' }
  ],
  price_lists: [
    { id: 'def_pl_1', code: 'PL-RET-2026', name: 'Standard Retail Maximum Retail Price (MRP)', category: 'Retail Tier', contactOrRef: 'Margin: 18%', balanceOrLimit: 0, status: 'ACTIVE', notes: 'Effective from Oct 1, 2026' },
    { id: 'def_pl_2', code: 'PL-WHL-2026', name: 'Wholesale B2B Bulk Tier', category: 'Wholesale Tier', contactOrRef: 'Margin: 10%', balanceOrLimit: 0, status: 'ACTIVE', notes: 'Minimum order: 50 Cartons' },
    { id: 'def_pl_3', code: 'PL-EXP-2026', name: 'Direct Institutional Export Tier', category: 'Export Tier', contactOrRef: 'Currency: USD/PKR', balanceOrLimit: 0, status: 'ACTIVE', notes: 'Ex-factory tax exempt rates' }
  ],
  sales_reps: [
    { id: 'def_rep_1', code: 'REP-01', name: 'Bilal Ahmad (Punjab South Lead)', category: 'B2B Sales Territory', contactOrRef: '0301-7788990', balanceOrLimit: 12000000, status: 'ACTIVE', notes: 'Covers Multan, Faisalabad, Sahiwal' },
    { id: 'def_rep_2', code: 'REP-02', name: 'Usman Ghani (Central Lahore)', category: 'Wholesale Counter', contactOrRef: '0322-1122334', balanceOrLimit: 20000000, status: 'ACTIVE', notes: 'Badami Bagh & Shah Alam Market' }
  ],
  work_centers: [
    { id: 'def_wc_1', code: 'WC-BAKE-01', name: 'Industrial Continuous Baking Oven A', category: 'Baking Department', contactOrRef: 'Cap: 2,500 kg/hr', balanceOrLimit: 0, status: 'ACTIVE', notes: 'Operates 2 shifts, gas-fired' },
    { id: 'def_wc_2', code: 'WC-PACK-02', name: 'Automated High-Speed Flow Wrapper', category: 'Packaging Line', contactOrRef: 'Cap: 300 packs/min', balanceOrLimit: 0, status: 'ACTIVE', notes: 'Integrated vision QA sensor' }
  ],
  machines: [
    { id: 'def_mch_1', code: 'MCH-MIX-01', name: 'Sigma Blade Heavy Dough Mixer (500kg)', category: 'Mixing Machine', contactOrRef: 'Power: 45 kW', balanceOrLimit: 0, status: 'ACTIVE', notes: 'Maintenance due in 45 days' },
    { id: 'def_mch_2', code: 'MCH-COOL-02', name: 'Tiered Ambient Cooling Conveyor (40m)', category: 'Cooling Line', contactOrRef: 'Power: 12 kW', balanceOrLimit: 0, status: 'ACTIVE', notes: 'Food grade stainless steel belt' }
  ],
  emp_dir: [
    { id: 'def_emp_1', code: 'EMP-0101', name: 'Muhammad Tariq (Sr. Accounts Manager)', category: 'Finance Department', contactOrRef: '0300-1234567', balanceOrLimit: 185000, status: 'ACTIVE', notes: 'NTN: 8192031-1, FBR Registered' },
    { id: 'def_emp_2', code: 'EMP-0102', name: 'Farhan Ali (Chief Accountant)', category: 'Finance Department', contactOrRef: '0321-9876543', balanceOrLimit: 135000, status: 'ACTIVE', notes: 'ERP System Posting Officer' },
    { id: 'def_emp_3', code: 'EMP-0201', name: 'Engr. Rashid Minhas (Plant Director)', category: 'Production Department', contactOrRef: '0333-5566778', balanceOrLimit: 290000, status: 'ACTIVE', notes: 'Operations Incharge' }
  ],
  dept_setup: [
    { id: 'def_dpt_1', code: 'DEP-FIN', name: 'Finance, Accounts & Taxation', category: 'Corporate Administration', contactOrRef: 'Head: Tariq Mahmood', balanceOrLimit: 0, status: 'ACTIVE', notes: '12 active staff members' },
    { id: 'def_dpt_2', code: 'DEP-PROD', name: 'Plant Production & Operations', category: 'Factory Operations', contactOrRef: 'Head: Engr. Rashid', balanceOrLimit: 0, status: 'ACTIVE', notes: '85 floor operators & technicians' },
    { id: 'def_dpt_3', code: 'DEP-SCM', name: 'Procurement, Store & Warehousing', category: 'Supply Chain', contactOrRef: 'Head: Salman Khurram', balanceOrLimit: 0, status: 'ACTIVE', notes: 'Stores in Lahore, Karachi, Islamabad' }
  ],
  salary_bands: [
    { id: 'def_sb_1', code: 'BAND-EXEC', name: 'Executive Leadership Band (E1-E3)', category: 'Management', contactOrRef: 'Range: 350K - 800K PKR', balanceOrLimit: 800000, status: 'ACTIVE', notes: 'Includes fuel allowance & health OPD' },
    { id: 'def_sb_2', code: 'BAND-MGR', name: 'Department Managers & Officers (M1-M4)', category: 'Middle Management', contactOrRef: 'Range: 120K - 300K PKR', balanceOrLimit: 300000, status: 'ACTIVE', notes: 'Provident Fund & Bonus eligible' },
    { id: 'def_sb_3', code: 'BAND-TECH', name: 'Technical & Plant Technicians (T1-T3)', category: 'Floor Staff', contactOrRef: 'Range: 45K - 95K PKR', balanceOrLimit: 95000, status: 'ACTIVE', notes: 'Overtime & EOBI compliant' }
  ]
};

export const DepartmentDefinitionModal: React.FC<DepartmentDefinitionModalProps> = ({
  isOpen,
  onClose,
  definitionTarget
}) => {
  const { currentCompany } = useAuthTenant();

  const [records, setRecords] = useState<DefinitionRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null);

  // New Record Form State
  const [newCode, setNewCode] = useState('');
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [newContact, setNewContact] = useState('');
  const [newBalanceOrLimit, setNewBalanceOrLimit] = useState(0);
  const [newStatus, setNewStatus] = useState<'ACTIVE' | 'INACTIVE'>('ACTIVE');
  const [newNotes, setNewNotes] = useState('');

  // Load records whenever target definition changes
  useEffect(() => {
    if (definitionTarget) {
      const defKey = definitionTarget.id;
      const seedList = DEFINITION_SEEDS[defKey] || [
        {
          id: `def_gen_1`,
          code: `${definitionTarget.code.slice(0, 4)}-01`,
          name: `Sample Master Record for ${definitionTarget.title}`,
          category: definitionTarget.departmentLabel,
          contactOrRef: 'Operational Reference',
          balanceOrLimit: 100000,
          status: 'ACTIVE',
          notes: 'Standard enterprise seed'
        }
      ];

      // Check localStorage for user saved additions
      const storageKey = `DEF_${currentCompany.tenantId}_${defKey}`;
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setRecords(parsed);
        } catch {
          setRecords(seedList);
        }
      } else {
        setRecords(seedList);
      }

      setSearchTerm('');
      setIsAddingNew(false);
      setSaveSuccessMessage(null);
    }
  }, [definitionTarget, currentCompany.tenantId]);

  if (!isOpen || !definitionTarget) return null;

  // Filter records
  const filteredRecords = records.filter(
    (r) =>
      r.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.contactOrRef && r.contactOrRef.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Add new record handler
  const handleAddNewRecord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCode.trim() || !newName.trim()) {
      alert('Please fill in both Code and Name for this definition record.');
      return;
    }

    const created: DefinitionRecord = {
      id: `def_user_${Date.now()}`,
      code: newCode.trim().toUpperCase(),
      name: newName.trim(),
      category: newCategory.trim() || definitionTarget.departmentLabel,
      contactOrRef: newContact.trim() || 'N/A',
      balanceOrLimit: Number(newBalanceOrLimit) || 0,
      status: newStatus,
      notes: newNotes.trim()
    };

    const updated = [created, ...records];
    setRecords(updated);

    // Save to localStorage
    const storageKey = `DEF_${currentCompany.tenantId}_${definitionTarget.id}`;
    localStorage.setItem(storageKey, JSON.stringify(updated));

    // Reset inputs
    setNewCode('');
    setNewName('');
    setNewCategory('');
    setNewContact('');
    setNewBalanceOrLimit(0);
    setNewNotes('');
    setIsAddingNew(false);

    setSaveSuccessMessage(`Record "${created.name}" successfully added to ${definitionTarget.title}.`);
    setTimeout(() => setSaveSuccessMessage(null), 4000);
  };

  // Delete record
  const handleDeleteRecord = (id: string) => {
    if (confirm('Are you sure you want to delete this definition record?')) {
      const updated = records.filter((r) => r.id !== id);
      setRecords(updated);
      const storageKey = `DEF_${currentCompany.tenantId}_${definitionTarget.id}`;
      localStorage.setItem(storageKey, JSON.stringify(updated));
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    let csv = 'data:text/csv;charset=utf-8,';
    csv += `MTS ERP ENTERPRISE - MASTER DEFINITION REGISTRY\n`;
    csv += `Definition Title,${definitionTarget.title},Code,${definitionTarget.code}\n`;
    csv += `Department,${definitionTarget.departmentLabel},Company,${currentCompany.name}\n\n`;
    csv += `Code,Name / Description,Category / Group,Contact / Reference,Opening Balance / Credit Limit (PKR),Status,Notes\n`;

    records.forEach((r) => {
      csv += `"${r.code}","${r.name}","${r.category}","${r.contactOrRef || ''}",${r.balanceOrLimit || 0},"${r.status}","${r.notes || ''}"\n`;
    });

    const encoded = encodeURI(csv);
    const link = document.createElement('a');
    link.setAttribute('href', encoded);
    link.setAttribute('download', `${currentCompany.slug}_${definitionTarget.id}_definitions.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="relative bg-white text-slate-800 rounded-2xl max-w-5xl w-full shadow-2xl border border-slate-300 overflow-hidden my-4 sm:my-8 flex flex-col max-h-[90vh]">
        
        {/* Top Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-500/20 border border-purple-400/30 flex items-center justify-center text-purple-400 font-bold">
              <FolderTree className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-purple-400">
                  {definitionTarget.code}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                  {definitionTarget.departmentLabel} Master Definition
                </span>
              </div>
              <h2 className="text-base font-bold text-white tracking-tight">
                {definitionTarget.title} Setup & Catalog
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-all cursor-pointer border border-slate-700"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Success Alert */}
        {saveSuccessMessage && (
          <div className="bg-emerald-50 border-b border-emerald-200 px-6 py-2.5 flex items-center gap-3 text-emerald-800 text-xs font-semibold shrink-0 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{saveSuccessMessage}</span>
          </div>
        )}

        {/* Body Toolbar */}
        <div className="p-4 sm:p-6 space-y-4 flex-1 overflow-y-auto">
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1 min-w-[240px] max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder={`Search ${definitionTarget.title.toLowerCase()}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-300 bg-white text-xs font-medium focus:ring-1 focus:ring-purple-500 focus:outline-none"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleExportCSV}
                className="px-3 py-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 shadow-sm"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                <span>Export CSV</span>
              </button>

              <button
                type="button"
                onClick={() => setIsAddingNew(!isAddingNew)}
                className="px-4 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>{isAddingNew ? 'Close Form' : `+ Add New Record`}</span>
              </button>
            </div>
          </div>

          {/* New Record Form Drawer */}
          {isAddingNew && (
            <form
              onSubmit={handleAddNewRecord}
              className="p-4 bg-purple-50/60 border border-purple-200 rounded-xl space-y-4 animate-in slide-in-from-top-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-purple-900 font-mono">
                  New Master Record Details
                </span>
                <span className="text-[11px] text-purple-700 font-semibold">
                  {definitionTarget.title}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Unique Code *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. CUST-099 or RM-101"
                    value={newCode}
                    onChange={(e) => setNewCode(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white font-mono font-bold focus:ring-1 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Record Name / Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Metro Supermarket Lahore"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white font-semibold focus:ring-1 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Category / Subtype
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Wholesale, Asset, Finished Goods"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white focus:ring-1 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Contact / Ref / Spec
                  </label>
                  <input
                    type="text"
                    placeholder="Phone, email or technical spec"
                    value={newContact}
                    onChange={(e) => setNewContact(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white focus:ring-1 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Opening Balance / Credit Limit (PKR)
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={newBalanceOrLimit || ''}
                    onChange={(e) => setNewBalanceOrLimit(parseFloat(e.target.value) || 0)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white font-mono focus:ring-1 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Operating Status
                  </label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as any)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white font-bold focus:ring-1 focus:ring-purple-500"
                  >
                    <option value="ACTIVE">ACTIVE (Authorized)</option>
                    <option value="INACTIVE">INACTIVE (Dormant)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Remarks / Notes
                </label>
                <input
                  type="text"
                  placeholder="Address, NTN/STRN, or special operational guidelines..."
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-xs focus:ring-1 focus:ring-purple-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsAddingNew(false)}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-600 text-xs font-semibold hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Definition Record</span>
                </button>
              </div>
            </form>
          )}

          {/* Master Table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            <table className="w-full text-xs text-left border-collapse">
              <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="p-3 border-r border-slate-200 w-28">Code</th>
                  <th className="p-3 border-r border-slate-200">Name / Description</th>
                  <th className="p-3 border-r border-slate-200 w-36">Category</th>
                  <th className="p-3 border-r border-slate-200 w-36">Contact / Reference</th>
                  <th className="p-3 border-r border-slate-200 text-right w-36">Bal / Limit (PKR)</th>
                  <th className="p-3 border-r border-slate-200 text-center w-24">Status</th>
                  <th className="p-3 text-center w-16">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredRecords.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-400">
                      No matching records found in this definition catalog. Click "+ Add New Record" to create one.
                    </td>
                  </tr>
                ) : (
                  filteredRecords.map((record) => (
                    <tr key={record.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3 border-r border-slate-200 font-mono font-bold text-purple-700">
                        {record.code}
                      </td>
                      <td className="p-3 border-r border-slate-200">
                        <div className="font-semibold text-slate-900">{record.name}</div>
                        {record.notes && (
                          <div className="text-[11px] text-slate-500 mt-0.5">{record.notes}</div>
                        )}
                      </td>
                      <td className="p-3 border-r border-slate-200 text-slate-600 font-medium">
                        {record.category}
                      </td>
                      <td className="p-3 border-r border-slate-200 text-slate-600 font-mono text-[11px]">
                        {record.contactOrRef || '-'}
                      </td>
                      <td className="p-3 border-r border-slate-200 text-right font-mono font-bold text-slate-800">
                        {record.balanceOrLimit && record.balanceOrLimit > 0
                          ? `Rs. ${record.balanceOrLimit.toLocaleString()}`
                          : '-'}
                      </td>
                      <td className="p-3 border-r border-slate-200 text-center">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            record.status === 'ACTIVE'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : 'bg-slate-200 text-slate-700'
                          }`}
                        >
                          {record.status}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleDeleteRecord(record.id)}
                          className="text-slate-400 hover:text-red-600 p-1 rounded hover:bg-red-50 transition-colors"
                          title="Delete record"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 shrink-0 font-mono">
          <span>Total Records: {filteredRecords.length} Active in {currentCompany.name}</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 font-semibold text-slate-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
