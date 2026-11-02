import React, { useState } from 'react';
import {
  Building2,
  Search,
  Filter,
  Layers,
  FileText,
  BarChart3,
  ChevronRight,
  ChevronDown,
  Sparkles,
  CheckCircle2,
  SlidersHorizontal,
  Plus,
  Users,
  ShieldCheck,
  Award,
  Eye,
  FileCheck2,
  FolderTree
} from 'lucide-react';
import { useAuthTenant } from '../../context/AuthTenantContext';
import {
  COMPLETE_DEPARTMENTS_CATALOGUE,
  DepartmentCatalogItem
} from '../../services/departmentCatalogueData';
import { DepartmentPopupForm } from '../common/DepartmentPopupForm';
import { DepartmentReportViewer } from '../common/DepartmentReportViewer';

export const DepartmentMasterModule: React.FC = () => {
  const { currentCompany } = useAuthTenant();

  // Active view: 'catalogue' | 'kpis' | 'designations' | 'access'
  const [activeView, setActiveView] = useState<'catalogue' | 'kpis' | 'designations' | 'access'>('catalogue');

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [expandedDeptId, setExpandedDeptId] = useState<string | null>('dept_1');

  // Popup Form and Report State
  const [activeFormTarget, setActiveFormTarget] = useState<{
    code: string;
    name: string;
    departmentName: string;
  } | null>(null);

  const [activeReportTarget, setActiveReportTarget] = useState<{
    code: string;
    title: string;
    departmentName: string;
  } | null>(null);

  // Categories list
  const categories = [
    'ALL',
    'General ERP & Corporate',
    'Operations & Manufacturing',
    'Supply Chain & Logistics',
    'Sales & Customer Relations',
    'Food & Agriculture',
    'Education & Institutions',
    'Healthcare & Clinical',
    'Construction & Engineering',
    'Energy & Solar',
    'Creative, Media & Tech',
    'Banking, Finance & NGO',
    'Governance, Security & IT'
  ];

  const filteredDepts = COMPLETE_DEPARTMENTS_CATALOGUE.filter((dept) => {
    const matchCat = selectedCategory === 'ALL' || dept.category === selectedCategory;
    const matchSearch =
      dept.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dept.head.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dept.definitions.some((d) => d.toLowerCase().includes(searchQuery.toLowerCase())) ||
      dept.forms.some((f) => f.name.toLowerCase().includes(searchQuery.toLowerCase()) || f.code.toLowerCase().includes(searchQuery.toLowerCase())) ||
      dept.reports.some((r) => r.name.toLowerCase().includes(searchQuery.toLowerCase()) || r.code.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchCat && matchSearch;
  });

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/30 p-6 rounded-3xl shadow-2xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-2.5 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <FolderTree className="w-6 h-6" />
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-slate-100 uppercase tracking-tight">
              Enterprise Department Master Catalogue (130 Departments)
            </h1>
          </div>
          <p className="text-xs text-slate-400 max-w-3xl">
            Complete ERP / SAP / Odoo standardized operations directory for <strong className="text-cyan-300">{currentCompany.name}</strong>.
            Definitions, standard interactive UserForm popups, and financial / operational Report Viewers across all industries.
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs font-bold">
          <div className="px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-center">
            <div className="text-lg text-cyan-400">130</div>
            <div className="text-[9px] text-slate-400 uppercase">Departments</div>
          </div>
          <div className="px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-center">
            <div className="text-lg text-purple-400">950+</div>
            <div className="text-[9px] text-slate-400 uppercase">Forms &amp; Reports</div>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 text-xs font-bold overflow-x-auto">
        <button
          onClick={() => setActiveView('catalogue')}
          className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
            activeView === 'catalogue'
              ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Department Catalogue ({filteredDepts.length})</span>
        </button>

        <button
          onClick={() => setActiveView('kpis')}
          className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
            activeView === 'kpis'
              ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Department KPI Setup</span>
        </button>

        <button
          onClick={() => setActiveView('designations')}
          className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
            activeView === 'designations'
              ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Designation &amp; Section Master</span>
        </button>

        <button
          onClick={() => setActiveView('access')}
          className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
            activeView === 'access'
              ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Access &amp; Approval Authority</span>
        </button>
      </div>

      {activeView === 'catalogue' && (
        <div className="space-y-4">
          {/* Search & Category Filter Toolbar */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by Department Name, Head, Form Code, or Report Title..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 shadow-md"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2.5 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-slate-200 font-semibold focus:outline-none focus:border-cyan-500 cursor-pointer shadow-md"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c === 'ALL' ? 'All Categories (130)' : c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Department Cards Grid / List */}
          <div className="space-y-3">
            {filteredDepts.length === 0 ? (
              <div className="p-12 text-center rounded-3xl bg-slate-900 border border-slate-800 text-slate-400 space-y-2">
                <Building2 className="w-8 h-8 text-slate-500 mx-auto" />
                <p className="text-sm font-semibold">No departments found matching "{searchQuery}".</p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('ALL');
                  }}
                  className="text-xs text-cyan-400 font-bold hover:underline cursor-pointer"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              filteredDepts.map((dept) => {
                const isExpanded = expandedDeptId === dept.id;

                return (
                  <div
                    key={dept.id}
                    className="p-5 rounded-3xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all shadow-xl space-y-4"
                  >
                    {/* Department Top Summary Line */}
                    <div
                      onClick={() => setExpandedDeptId(isExpanded ? null : dept.id)}
                      className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 cursor-pointer group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center font-mono font-black text-cyan-300 text-sm shrink-0 group-hover:border-cyan-500 transition-colors">
                          {dept.number}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-black text-slate-100 text-sm group-hover:text-cyan-300 transition-colors">
                              {dept.name}
                            </h3>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                              {dept.category}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 mt-0.5">
                            Department Head: <strong className="text-slate-200">{dept.head}</strong>
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 self-end sm:self-center font-mono text-xs">
                        <span className="px-2.5 py-1 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-bold">
                          {dept.forms.length} Forms
                        </span>
                        <span className="px-2.5 py-1 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 font-bold">
                          {dept.reports.length} Reports
                        </span>
                        {isExpanded ? (
                          <ChevronDown className="w-5 h-5 text-slate-400" />
                        ) : (
                          <ChevronRight className="w-5 h-5 text-slate-400" />
                        )}
                      </div>
                    </div>

                    {/* Expanded Detail View: Definitions, Forms, Reports */}
                    {isExpanded && (
                      <div className="pt-3 border-t border-slate-800/80 space-y-5 animate-in fade-in text-xs">
                        {/* Definition Chips */}
                        <div className="space-y-1.5">
                          <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider block">
                            Department Core Definitions &amp; Master Setup
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {dept.definitions.map((def, idx) => (
                              <span
                                key={idx}
                                className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 text-[11px] font-medium"
                              >
                                • {def}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Interactive Forms & Reports Split */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Forms Column */}
                          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2.5">
                            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                              <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                                <FileText className="w-4 h-4" />
                                <span>Department Operational Forms ({dept.forms.length})</span>
                              </h4>
                              <span className="text-[10px] text-slate-400">Click to Open Form</span>
                            </div>

                            <div className="grid grid-cols-1 gap-1.5 max-h-56 overflow-y-auto pr-1">
                              {dept.forms.map((f) => (
                                <button
                                  type="button"
                                  key={f.code}
                                  onClick={() =>
                                    setActiveFormTarget({
                                      code: f.code,
                                      name: f.name,
                                      departmentName: dept.name
                                    })
                                  }
                                  className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-cyan-500/60 text-left transition-all flex items-center justify-between group cursor-pointer"
                                >
                                  <div className="flex items-center gap-2 min-w-0">
                                    <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-800 text-cyan-300">
                                      {f.code}
                                    </span>
                                    <span className="text-xs text-slate-200 group-hover:text-white truncate">
                                      {f.name}
                                    </span>
                                  </div>
                                  <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400 shrink-0" />
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Reports Column */}
                          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2.5">
                            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                              <h4 className="text-xs font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
                                <BarChart3 className="w-4 h-4" />
                                <span>Operational &amp; Audit Reports ({dept.reports.length})</span>
                              </h4>
                              <span className="text-[10px] text-slate-400">Click to View</span>
                            </div>

                            <div className="grid grid-cols-1 gap-1.5 max-h-56 overflow-y-auto pr-1">
                              {dept.reports.map((r) => (
                                <button
                                  type="button"
                                  key={r.code}
                                  onClick={() =>
                                    setActiveReportTarget({
                                      code: r.code,
                                      title: r.name,
                                      departmentName: dept.name
                                    })
                                  }
                                  className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-purple-500/60 text-left transition-all flex items-center justify-between group cursor-pointer"
                                >
                                  <div className="flex items-center gap-2 min-w-0">
                                    <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-800 text-purple-300">
                                      {r.code}
                                    </span>
                                    <span className="text-xs text-slate-200 group-hover:text-white truncate">
                                      {r.name}
                                    </span>
                                  </div>
                                  <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-purple-400 shrink-0" />
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* KPI Setup View */}
      {activeView === 'kpis' && (
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 text-xs">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h2 className="text-base font-black text-slate-100 uppercase">
                Department Performance Indicators (KPI Master Setup)
              </h2>
              <p className="text-slate-400 text-xs">Target vs. Actual achievement percentages monitored across all operational departments.</p>
            </div>
            <button className="px-3.5 py-2 rounded-xl bg-cyan-600 text-white font-bold flex items-center gap-1.5 shadow cursor-pointer">
              <Plus className="w-4 h-4" /> Add KPI Definition
            </button>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-800">
            <table className="w-full text-left font-mono">
              <thead className="bg-slate-950 text-[10px] uppercase font-bold text-slate-400">
                <tr>
                  <th className="p-3">KPI Code</th>
                  <th className="p-3">Department</th>
                  <th className="p-3">KPI Name</th>
                  <th className="p-3">Unit</th>
                  <th className="p-3">Target</th>
                  <th className="p-3">Actual</th>
                  <th className="p-3">Achievement %</th>
                  <th className="p-3">Period</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 text-slate-200">
                <tr className="hover:bg-slate-850">
                  <td className="p-3 font-bold text-cyan-400">KPI-FIN-01</td>
                  <td className="p-3">Accounts &amp; Finance</td>
                  <td className="p-3 font-sans">Monthly P&amp;L Financial Closing SLA</td>
                  <td className="p-3">Days</td>
                  <td className="p-3">3 Days</td>
                  <td className="p-3">2 Days</td>
                  <td className="p-3 text-emerald-400 font-bold">100% On-Time</td>
                  <td className="p-3">Monthly</td>
                </tr>
                <tr className="hover:bg-slate-850">
                  <td className="p-3 font-bold text-cyan-400">KPI-SCM-02</td>
                  <td className="p-3">Procurement / Purchase</td>
                  <td className="p-3 font-sans">Purchase Order Fulfillment Accuracy</td>
                  <td className="p-3">%</td>
                  <td className="p-3">98.0%</td>
                  <td className="p-3">99.2%</td>
                  <td className="p-3 text-emerald-400 font-bold">101.2%</td>
                  <td className="p-3">Quarterly</td>
                </tr>
                <tr className="hover:bg-slate-850">
                  <td className="p-3 font-bold text-cyan-400">KPI-QA-03</td>
                  <td className="p-3">Quality Assurance &amp; QC</td>
                  <td className="p-3 font-sans">Incoming Raw Material Acceptance Rate</td>
                  <td className="p-3">%</td>
                  <td className="p-3">99.5%</td>
                  <td className="p-3">99.8%</td>
                  <td className="p-3 text-emerald-400 font-bold">100.3%</td>
                  <td className="p-3">Monthly</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Designations View */}
      {activeView === 'designations' && (
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 text-xs">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h2 className="text-base font-black text-slate-100 uppercase">
                Designation &amp; Section Hierarchy Master
              </h2>
              <p className="text-slate-400 text-xs">Corporate hierarchy reporting lines from Executive Board to Department Supervisors.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {[
              { title: 'Executive Management', roles: ['Board of Directors', 'Chairman', 'Chief Executive Officer (CEO)', 'Managing Director (MD)', 'Chief Operating Officer (COO)'] },
              { title: 'Financial & Strategic Leadership', roles: ['Chief Financial Officer (CFO)', 'Chief Audit Executive (CAE)', 'Chief Risk Officer (CRO)', 'Finance Controller'] },
              { title: 'Technical & Operational Heads', roles: ['Chief Technology Officer (CTO)', 'Chief Information Officer (CIO)', 'Chief Supply Chain Officer (CSCO)', 'Plant Director'] },
              { title: 'Department Management Tier', roles: ['Head of Department (HOD)', 'Department Manager', 'Assistant Manager', 'Deputy Manager'] },
              { title: 'Execution & Operations Tier', roles: ['Officer', 'Executive', 'Supervisor', 'Team Leader', 'Coordinator'] },
              { title: 'Support & Processing Tier', roles: ['Assistant', 'Clerk', 'Operator', 'Technical Specialist'] }
            ].map((grp, i) => (
              <div key={i} className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
                <h3 className="font-bold text-cyan-400 text-xs">{grp.title}</h3>
                <ul className="space-y-1 text-slate-300">
                  {grp.roles.map((r, ri) => (
                    <li key={ri} className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Access Setup View */}
      {activeView === 'access' && (
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 text-xs">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h2 className="text-base font-black text-slate-100 uppercase">
                Department Access &amp; Approval Authority Setup
              </h2>
              <p className="text-slate-400 text-xs">Granular module permissions, form creation limits, and sign-off thresholds.</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Purchase to Pay (P2P)</span>
                <span className="font-bold text-slate-200 mt-1 block">PR → RFQ → PO → GRN → Invoice → Payment</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Order to Cash (O2C)</span>
                <span className="font-bold text-slate-200 mt-1 block">Enquiry → Quotation → Sales Order → Dispatch → Invoice</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Plan to Produce</span>
                <span className="font-bold text-slate-200 mt-1 block">Demand Forecast → BOM → Work Order → QA → Finished Goods</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Popup UserForm Modal */}
      {activeFormTarget && (
        <DepartmentPopupForm
          isOpen={true}
          onClose={() => setActiveFormTarget(null)}
          formCode={activeFormTarget.code}
          formName={activeFormTarget.name}
          departmentName={activeFormTarget.departmentName}
        />
      )}

      {/* Interactive Report Viewer Popup Modal */}
      {activeReportTarget && (
        <DepartmentReportViewer
          isOpen={true}
          onClose={() => setActiveReportTarget(null)}
          reportCode={activeReportTarget.code}
          reportTitle={activeReportTarget.title}
          departmentName={activeReportTarget.departmentName}
        />
      )}
    </div>
  );
};
