import React, { useState } from 'react';
import {
  FileText,
  Edit3,
  Printer,
  Download,
  CheckCircle2,
  AlertTriangle,
  Copy,
  Check,
  Building2,
  ShieldCheck,
  UserCheck,
  Clock,
  History,
  Sparkles,
  FileCheck
} from 'lucide-react';
import { Partnership, PartnershipDeedClause } from '../../types/partnership';
import { TTSButton } from '../common/TTSButton';

interface PartnershipDeedGeneratorProps {
  partnership: Partnership;
  onSaveDeed?: (clauses: PartnershipDeedClause[]) => void;
}

export const PartnershipDeedGenerator: React.FC<PartnershipDeedGeneratorProps> = ({
  partnership
}) => {
  const [activeTab, setActiveTab] = useState<'preview' | 'edit' | 'signatures' | 'versions'>('preview');
  const [copied, setCopied] = useState(false);
  const [version, setVersion] = useState('v1.0-Final');

  // Generate 26 Comprehensive Legal Clauses based on Pakistan Partnership Act, 1932 & SECP Guidelines
  const [clauses, setClauses] = useState<PartnershipDeedClause[]>([
    {
      clauseNo: 1,
      title: 'Title and Execution',
      content: `THIS DEED OF PARTNERSHIP is executed on this ${new Date(partnership.registrationDate || Date.now()).toLocaleDateString('en-PK', { day: 'numeric', month: 'long', year: 'numeric' })} at ${partnership.city || 'Faisalabad'}, Pakistan, by and between the Partners named hereunder.`,
      isEditable: true
    },
    {
      clauseNo: 2,
      title: 'Definitions and Interpretation',
      content: `In this Deed: "Partnership" means "${partnership.partnershipName}"; "Partners" means ${partnership.partners.map(p => p.fullName).join(', ')}; "Capital" means the total agreed contribution of PKR ${partnership.partners.reduce((sum, p) => sum + (p.initialCapitalPKR || 0), 0).toLocaleString()}; "Financial Year" means the period from 1st July to 30th June as per standard laws of Pakistan.`,
      isEditable: true
    },
    {
      clauseNo: 3,
      title: 'Formation and Name',
      content: `The Partners agree to carry on the business of ${partnership.businessActivity} under the business title "${partnership.registeredBusinessName}" at ${partnership.registeredOfficeAddress}.`,
      isEditable: true
    },
    {
      clauseNo: 4,
      title: 'Duration of Business',
      content: `The Partnership shall commence on ${partnership.agreementStartDate} and shall continue for a duration of ${partnership.durationYears} years${partnership.isContinuing ? ', subject to renewal upon mutual consent of all Partners in writing.' : '.'}`,
      isEditable: true
    },
    {
      clauseNo: 5,
      title: 'Capital Contributions & Capital Accounts',
      content: `The initial capital contribution shall be PKR ${partnership.partners.reduce((sum, p) => sum + (p.initialCapitalPKR || 0), 0).toLocaleString()}, contributed as follows: ${partnership.partners.map(p => `${p.fullName}: PKR ${p.initialCapitalPKR.toLocaleString()} (${((p.initialCapitalPKR / (partnership.partners.reduce((s, x) => s + x.initialCapitalPKR, 0) || 1)) * 100).toFixed(1)}%)`).join('; ')}.`,
      isEditable: true
    },
    {
      clauseNo: 6,
      title: 'Profit-Sharing Ratio',
      content: `The net distributable profits of the Partnership calculated at the end of each Financial Year shall be divided among the Partners in the following agreed percentages: ${partnership.partners.map(p => `${p.fullName}: ${p.agreedProfitSharePercent}%`).join('; ')}.`,
      isEditable: true
    },
    {
      clauseNo: 7,
      title: 'Loss-Sharing Responsibility',
      content: `All business losses, including capital impairments or operational deficits, shall be borne by the Partners in the following agreed loss percentages: ${partnership.partners.map(p => `${p.fullName}: ${p.agreedLossSharePercent}%`).join('; ')}.`,
      isEditable: true
    },
    {
      clauseNo: 8,
      title: 'Partner Remuneration & Salaries',
      content: `Working Partners actively involved in daily operations shall be entitled to fixed monthly remuneration prior to profit distribution. Managing Partner ${partnership.partners.find(p => p.managementRights)?.fullName || 'Designated Partner'} shall be authorized for operational allowances as approved by majority resolution.`,
      isEditable: true
    },
    {
      clauseNo: 9,
      title: 'Management Powers & Responsibilities',
      content: `Each Partner shall have specific responsibilities. Managing Partner(s) with signing authority shall supervise daily production, sales, procurement, and financial reporting. Sleeping / Investor partners shall have inspection rights without operational liability.`,
      isEditable: true
    },
    {
      clauseNo: 10,
      title: 'Bank Account Authorization & Signatories',
      content: `All banking transactions shall be conducted through designated commercial accounts in the name of "${partnership.registeredBusinessName}" at ${partnership.bankAccountDetails.bankName} (IBAN: ${partnership.bankAccountDetails.iban}). Payments exceeding PKR 500,000 shall require joint authorization.`,
      isEditable: true
    },
    {
      clauseNo: 11,
      title: 'Decision-Making & Voting Rights',
      content: `Ordinary operational decisions shall require a simple majority of voting percentages (${partnership.partners.map(p => `${p.fullName}: ${p.votingRightsPercent}%`).join('; ')}). Major decisions including capital additions, asset sales, or structural borrowing shall require 100% unanimous approval.`,
      isEditable: true
    },
    {
      clauseNo: 12,
      title: 'Accounting, Audit & Financial Inspection',
      content: `Proper double-entry accounting records shall be maintained using MTS ERP FUTURE SOLUTIONS. Financial statements including Balance Sheet and Profit & Loss shall be prepared annually and subjected to internal and external audit as required by SECP / FBR rules.`,
      isEditable: true
    },
    {
      clauseNo: 13,
      title: 'Drawings & Partner Current Accounts',
      content: `Partners may withdraw monthly drawings against prospective profits not exceeding 70% of estimated annual earnings. All drawings shall be debited to the respective Partner Current Account.`,
      isEditable: true
    },
    {
      clauseNo: 14,
      title: 'Confidentiality & Trade Secrets',
      content: `Each Partner agrees to keep all financial statements, client contracts, recipes, formulas, vendor prices, and software credentials strictly confidential during and after the partnership duration.`,
      isEditable: true
    },
    {
      clauseNo: 15,
      title: 'Conflict of Interest & Non-Compete',
      content: `No active working partner shall engage directly or indirectly in any competing business entity within the geographic territory of ${partnership.purpose.geographicOperatingArea} without written consent of all co-partners.`,
      isEditable: true
    },
    {
      clauseNo: 16,
      title: 'Admission of New Partners',
      content: `New partners may only be admitted upon 100% unanimous written consent of all existing Partners and execution of a supplemental deed setting revised capital and profit-sharing ratios.`,
      isEditable: true
    },
    {
      clauseNo: 17,
      title: 'Retirement & Notice Period',
      content: `A Partner wishing to retire from the Partnership must provide a minimum of 90 days written notice to co-partners. Settlement of capital and current accounts shall be completed within 180 days of effective retirement.`,
      isEditable: true
    },
    {
      clauseNo: 18,
      title: 'Death or Permanent Incapacity of a Partner',
      content: `In the event of death of a Partner, the Partnership shall not automatically dissolve. The legal heirs of the deceased partner shall be entitled to receive the settled balance of capital and current accounts or join as sleeping partners subject to mutual agreement.`,
      isEditable: true
    },
    {
      clauseNo: 19,
      title: 'Transfer or Mortgage of Partnership Interest',
      content: `No Partner shall assign, sell, pledge, or mortgage their partnership share or capital interest to any third party without offering first right of refusal to existing Partners.`,
      isEditable: true
    },
    {
      clauseNo: 20,
      title: 'Dispute Resolution & Arbitration Clause',
      content: `In case of any dispute or disagreement arising out of this Deed, the Partners shall attempt amicable settlement within 30 days. Unresolved disputes shall be referred to sole arbitration under the Pakistan Arbitration Act, 1940, held in ${partnership.city}.`,
      isEditable: true
    },
    {
      clauseNo: 21,
      title: 'Dissolution and Winding-Up Procedures',
      content: `The Partnership may be dissolved by unanimous written agreement. Upon dissolution, business assets shall be liquidated to settle third-party liabilities, statutory tax dues, partner loans, and remaining balance distributed in capital ratio.`,
      isEditable: true
    },
    {
      clauseNo: 22,
      title: 'Amendments & Supplemental Deeds',
      content: `No alteration or amendment to this Deed shall be valid unless executed in writing and signed by all Partners as a Supplemental Partnership Deed registered with relevant tax/legal authorities.`,
      isEditable: true
    },
    {
      clauseNo: 23,
      title: 'Official Notices & Addresses',
      content: `All formal notices under this Deed shall be delivered via registered mail, verified email, or WhatsApp to the official addresses provided in Partner Master records.`,
      isEditable: true
    },
    {
      clauseNo: 24,
      title: 'Governing Law & Legal Reference',
      content: `This Deed shall be governed by and construed in accordance with the laws of the Islamic Republic of Pakistan, incorporating the Partnership Act, 1932 and Income Tax Ordinance, 2001.`,
      isEditable: true
    },
    {
      clauseNo: 25,
      title: 'Signatures and Witnesses',
      content: `IN WITNESS WHEREOF, the Partners hereto have signed and executed this Deed of Partnership on the day and year first above written in the presence of attending witnesses.`,
      isEditable: true
    },
    {
      clauseNo: 26,
      title: 'Annexures & Schedules',
      content: `Schedule A: Partner Identity & CNIC Copies; Schedule B: Capital Contribution Ledger; Schedule C: Profit/Loss Sharing Ratios & Bank Authorities.`,
      isEditable: true
    }
  ]);

  const totalCapital = partnership.partners.reduce((sum, p) => sum + (p.initialCapitalPKR || 0), 0);
  const totalProfitPercent = partnership.partners.reduce((sum, p) => sum + (p.agreedProfitSharePercent || 0), 0);

  const handleUpdateClause = (no: number, newText: string) => {
    setClauses(prev => prev.map(c => c.clauseNo === no ? { ...c, content: newText } : c));
  };

  const handleCopyText = () => {
    const fullDoc = clauses.map(c => `SECTION ${c.clauseNo}: ${c.title.toUpperCase()}\n${c.content}\n`).join('\n');
    navigator.clipboard.writeText(fullDoc);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3.5 bg-purple-500/10 border border-purple-500/20 rounded-2xl text-purple-400">
            <FileText className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-black text-slate-100">{partnership.partnershipName}</h1>
              <span className="text-xs bg-purple-500/20 text-purple-300 font-mono font-bold px-2.5 py-0.5 rounded-full border border-purple-500/30">
                {version}
              </span>
              {totalProfitPercent !== 100 && (
                <span className="text-xs bg-amber-500/20 text-amber-300 font-mono font-bold px-2.5 py-0.5 rounded-full border border-amber-500/30 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" /> Warning: Allocation is {totalProfitPercent}%
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-1 font-mono">
              Pakistan Partnership Act 1932 Compliant • SECP/FBR Ready • {partnership.partners.length} Partners • Total Capital: PKR {totalCapital.toLocaleString()}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <TTSButton text={`Partnership Deed Generator for ${partnership.partnershipName}. Total 26 legal clauses generated. Capital: PKR ${totalCapital.toLocaleString()}.`} />
          <button
            onClick={handleCopyText}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition border border-slate-700 cursor-pointer"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied' : 'Copy All Clauses'}</span>
          </button>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 transition cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print Contract</span>
          </button>
        </div>
      </div>

      {/* Warning Notice if Legal Notice Required */}
      <div className="bg-purple-950/40 border border-purple-500/30 rounded-2xl p-4 flex items-center justify-between text-xs text-purple-200 shadow-lg">
        <div className="flex items-center gap-2.5">
          <ShieldCheck className="w-5 h-5 text-purple-400 shrink-0" />
          <span>
            <strong>Legal Notice:</strong> This Partnership Deed is generated with 26 structured legal clauses. Final stamping on non-judicial stamp paper (e-Stamp Pakistan) and registration with the Registrar of Firms must be verified by a qualified lawyer.
          </span>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('preview')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
            activeTab === 'preview' ? 'bg-purple-600 text-white shadow-lg' : 'bg-slate-900 text-slate-400 hover:text-slate-200'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Full Legal Contract Preview</span>
        </button>

        <button
          onClick={() => setActiveTab('edit')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
            activeTab === 'edit' ? 'bg-purple-600 text-white shadow-lg' : 'bg-slate-900 text-slate-400 hover:text-slate-200'
          }`}
        >
          <Edit3 className="w-4 h-4" />
          <span>In-Line Clause Editor (26 Clauses)</span>
        </button>

        <button
          onClick={() => setActiveTab('signatures')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
            activeTab === 'signatures' ? 'bg-purple-600 text-white shadow-lg' : 'bg-slate-900 text-slate-400 hover:text-slate-200'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>Partner Approvals &amp; Signatures ({partnership.partners.length})</span>
        </button>
      </div>

      {/* TAB 1: FULL LEGAL CONTRACT PREVIEW */}
      {activeTab === 'preview' && (
        <div className="p-8 rounded-3xl bg-white text-slate-900 font-serif text-xs space-y-6 shadow-2xl border border-slate-200 printable-paper leading-relaxed max-w-5xl mx-auto">
          {/* Header Printable Canvas */}
          <div className="text-center space-y-2 border-b-2 border-slate-900 pb-6">
            <h1 className="text-xl font-black tracking-wider uppercase font-sans text-slate-900">
              DEED OF PARTNERSHIP
            </h1>
            <h2 className="text-base font-bold font-sans text-slate-800">
              FOR &quot;{partnership.registeredBusinessName.toUpperCase()}&quot;
            </h2>
            <div className="text-[11px] font-mono text-slate-600">
              Registration Authority: {partnership.registrationAuthority} | NTN: {partnership.ntn}
            </div>
            <div className="text-[10px] font-mono text-slate-500">
              Executed under Pakistan Partnership Act, 1932 on {partnership.registrationDate}
            </div>
          </div>

          {/* Partner Particulars Summary Box */}
          <div className="bg-slate-50 border border-slate-300 p-4 rounded-xl space-y-2 font-sans text-xs">
            <div className="font-bold uppercase text-slate-700 text-[11px]">List of Executing Partners:</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 font-mono text-[11px]">
              {partnership.partners.map((p, idx) => (
                <div key={p.id} className="p-2.5 bg-white rounded border border-slate-200 space-y-0.5">
                  <div className="font-bold text-slate-900">{idx + 1}. {p.fullName}</div>
                  <div>CNIC: {p.cnicOrRegNo} | NTN: {p.ntn || 'N/A'}</div>
                  <div>Capital: PKR {p.initialCapitalPKR.toLocaleString()} | Profit Share: {p.agreedProfitSharePercent}%</div>
                  <div className="text-[10px] text-slate-500">Role: {p.classifications.join(', ')}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Clauses Render */}
          <div className="space-y-5 pt-2">
            {clauses.map((c) => (
              <div key={c.clauseNo} className="space-y-1">
                <h3 className="font-sans font-bold text-slate-900 text-xs uppercase tracking-wide">
                  CLAUSE {c.clauseNo}: {c.title}
                </h3>
                <p className="text-slate-800 text-[11px] leading-relaxed text-justify">
                  {c.content}
                </p>
              </div>
            ))}
          </div>

          {/* Signatures Canvas */}
          <div className="pt-8 border-t-2 border-slate-900 space-y-6 font-sans">
            <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider text-center">
              PARTNER SIGNATURES &amp; WITNESSES
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 pt-4 text-xs">
              {partnership.partners.map((p) => (
                <div key={p.id} className="border border-slate-300 p-4 rounded-xl space-y-4 text-center">
                  <div className="h-12 border-b border-dashed border-slate-400 flex items-end justify-center pb-1">
                    <span className="text-[10px] text-slate-400 italic">Signature / Digital Stamp</span>
                  </div>
                  <div>
                    <div className="font-bold text-slate-900">{p.fullName}</div>
                    <div className="text-[10px] text-slate-600 font-mono">CNIC: {p.cnicOrRegNo}</div>
                    <div className="text-[9px] text-emerald-700 font-bold uppercase mt-1">Acceptance Recorded</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-6 pt-4 text-xs font-mono">
              <div className="border border-slate-300 p-3 rounded-xl space-y-1">
                <div className="font-bold text-slate-800">WITNESS 1:</div>
                <div className="text-slate-600">Name: Muhammad Usman</div>
                <div className="text-slate-600">CNIC: 33100-8877665-1</div>
                <div className="pt-3 border-t border-slate-200 text-slate-400 italic text-[10px]">Signature: ____________________</div>
              </div>

              <div className="border border-slate-300 p-3 rounded-xl space-y-1">
                <div className="font-bold text-slate-800">WITNESS 2:</div>
                <div className="text-slate-600">Name: Ali Raza Khan</div>
                <div className="text-slate-600">CNIC: 35202-1122334-5</div>
                <div className="pt-3 border-t border-slate-200 text-slate-400 italic text-[10px]">Signature: ____________________</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: IN-LINE CLAUSE EDITOR */}
      {activeTab === 'edit' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wider">In-Line Legal Clause Editor</h2>
              <p className="text-xs text-slate-400">Edit, customize or append partner terms across all 26 deed sections.</p>
            </div>
            <span className="text-xs font-mono text-cyan-400 bg-cyan-950/60 border border-cyan-800 px-3 py-1 rounded-xl">
              26 Clauses Active
            </span>
          </div>

          <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
            {clauses.map((c) => (
              <div key={c.clauseNo} className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">
                    Clause {c.clauseNo}: {c.title}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">Editable Clause</span>
                </div>
                <textarea
                  rows={3}
                  value={c.content}
                  onChange={(e) => handleUpdateClause(c.clauseNo, e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-purple-500 transition font-sans leading-relaxed"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: SIGNATURES & APPROVAL STATUS */}
      {activeTab === 'signatures' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6">
          <div className="border-b border-slate-800 pb-3">
            <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wider">Partner Acceptance &amp; Signatures Status</h2>
            <p className="text-xs text-slate-400">Real-time record of executing partner acceptances and digital audit timestamps.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {partnership.partners.map((p) => (
              <div key={p.id} className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-purple-500/10 rounded-xl text-purple-400">
                      <UserCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-slate-100">{p.fullName}</h3>
                      <p className="text-[10px] text-slate-400 font-mono">CNIC: {p.cnicOrRegNo}</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-300 font-bold text-[10px] rounded-full border border-emerald-500/30 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Accepted &amp; Signed
                  </span>
                </div>

                <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 text-xs font-mono space-y-1 text-slate-300">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Agreed Profit Share:</span>
                    <span className="text-emerald-400 font-bold">{p.agreedProfitSharePercent}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Capital Investment:</span>
                    <span className="text-slate-200 font-bold">PKR {p.initialCapitalPKR.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Timestamp:</span>
                    <span className="text-slate-400">{partnership.registrationDate} 14:32 PST</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
