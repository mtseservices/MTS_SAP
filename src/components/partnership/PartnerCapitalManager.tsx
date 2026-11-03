import React, { useState } from 'react';
import {
  DollarSign,
  Plus,
  CheckCircle2,
  XCircle,
  Clock,
  Building2,
  Users,
  ShieldCheck,
  FileCheck,
  Layers,
  Search,
  ArrowDownRight,
  TrendingUp
} from 'lucide-react';
import { Partnership, PartnerCapitalContribution, ContributionType } from '../../types/partnership';
import { saveCapitalContributions } from '../../services/partnershipService';
import { useAuthTenant } from '../../context/AuthTenantContext';
import { TTSButton } from '../common/TTSButton';

interface PartnerCapitalManagerProps {
  partnership: Partnership;
  contributions: PartnerCapitalContribution[];
  onRefreshData: () => void;
}

const CONTRIBUTION_TYPES: ContributionType[] = [
  'Cash',
  'Bank Transfer',
  'Property / Real Estate',
  'Land',
  'Machinery & Plant',
  'Equipment',
  'Vehicles',
  'Inventory',
  'Raw Materials',
  'Technology & IP',
  'Services / Sweat Equity'
];

export const PartnerCapitalManager: React.FC<PartnerCapitalManagerProps> = ({
  partnership,
  contributions,
  onRefreshData
}) => {
  const { currentCompany } = useAuthTenant();
  const [selectedPartnerId, setSelectedPartnerId] = useState<string>('ALL');
  const [isAddingModalOpen, setIsAddingModalOpen] = useState(false);

  // New Capital Form
  const [newContribution, setNewContribution] = useState({
    partnerId: partnership.partners[0]?.id || '',
    contributionType: 'Bank Transfer' as ContributionType,
    description: '',
    agreedValuationPKR: 10000000,
    paymentReference: '',
    contributionDate: new Date().toISOString().split('T')[0]
  });

  const filteredContributions = contributions.filter(c => {
    if (c.partnershipId !== partnership.id && partnership.id !== 'ptn_crest_01') return false;
    if (selectedPartnerId !== 'ALL' && c.partnerId !== selectedPartnerId) return false;
    return true;
  });

  const totalCapitalApproved = filteredContributions
    .filter(c => c.approvalStatus === 'APPROVED')
    .reduce((sum, c) => sum + c.agreedValuationPKR, 0);

  const totalCapitalPending = filteredContributions
    .filter(c => c.approvalStatus === 'PENDING')
    .reduce((sum, c) => sum + c.agreedValuationPKR, 0);

  const handleApprove = async (id: string) => {
    const updated = contributions.map(c =>
      c.id === id ? { ...c, approvalStatus: 'APPROVED' as const, approvedBy: 'Master Admin', approvalDate: new Date().toISOString().split('T')[0] } : c
    );
    await saveCapitalContributions(currentCompany.id, updated);
    onRefreshData();
  };

  const handleReject = async (id: string) => {
    const updated = contributions.map(c =>
      c.id === id ? { ...c, approvalStatus: 'REJECTED' as const } : c
    );
    await saveCapitalContributions(currentCompany.id, updated);
    onRefreshData();
  };

  const handleAddContribution = async () => {
    const partner = partnership.partners.find(p => p.id === newContribution.partnerId);
    if (!partner) return;

    const newEntry: PartnerCapitalContribution = {
      id: `cap_${Date.now()}`,
      partnershipId: partnership.id,
      partnerId: partner.id,
      partnerName: partner.fullName,
      contributionDate: newContribution.contributionDate,
      contributionType: newContribution.contributionType,
      description: newContribution.description || `${newContribution.contributionType} contribution`,
      agreedValuationPKR: Number(newContribution.agreedValuationPKR),
      paymentReference: newContribution.paymentReference || `REF-${Math.floor(100000 + Math.random() * 900000)}`,
      approvalStatus: 'APPROVED',
      approvedBy: 'Master Admin',
      approvalDate: new Date().toISOString().split('T')[0]
    };

    const updated = [newEntry, ...contributions];
    await saveCapitalContributions(currentCompany.id, updated);
    setIsAddingModalOpen(false);
    onRefreshData();
  };

  return (
    <div className="space-y-6">
      {/* Top Controls Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-100 flex items-center gap-2">
            <DollarSign className="w-6 h-6 text-purple-400" /> Capital Contributions &amp; Partner Ledgers
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Track partner capital account balances, asset valuations (Cash, Machinery, Land), and approval history.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <TTSButton text={`Partner Capital Manager for ${partnership.partnershipName}. Total approved capital PKR ${totalCapitalApproved.toLocaleString()}.`} />
          <button
            onClick={() => setIsAddingModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-purple-600/30 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Record Capital Entry</span>
          </button>
        </div>
      </div>

      {/* Partner Capital Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {partnership.partners.map((p) => {
          const pContributions = contributions.filter(c => c.partnerId === p.id && c.approvalStatus === 'APPROVED');
          const pValuation = pContributions.reduce((sum, c) => sum + c.agreedValuationPKR, 0);

          return (
            <div
              key={p.id}
              onClick={() => setSelectedPartnerId(p.id === selectedPartnerId ? 'ALL' : p.id)}
              className={`p-5 rounded-2xl border transition cursor-pointer space-y-3 ${
                selectedPartnerId === p.id
                  ? 'bg-purple-950/40 border-purple-500 shadow-xl'
                  : 'bg-slate-900 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-100">{p.fullName}</h3>
                  <p className="text-[10px] text-slate-400 font-mono">CNIC: {p.cnicOrRegNo}</p>
                </div>
                <span className="px-2.5 py-1 bg-purple-500/20 text-purple-300 font-mono font-bold text-[10px] rounded-full">
                  {p.agreedProfitSharePercent}% Profit Share
                </span>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 space-y-1 font-mono text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Agreed Initial Capital:</span>
                  <span className="text-slate-200">PKR {p.initialCapitalPKR.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Settled Capital Valuation:</span>
                  <span className="text-emerald-400 font-bold">PKR {pValuation.toLocaleString()}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Capital Ledger Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wider">Capital Contributions Ledger</h2>
            <p className="text-xs text-slate-400">Detailed list of cash injections, machinery transfers, and asset valuations.</p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-3 py-1 rounded-xl">
              Approved: PKR {totalCapitalApproved.toLocaleString()}
            </span>
            {totalCapitalPending > 0 && (
              <span className="text-xs font-mono text-amber-400 bg-amber-950/60 border border-amber-800 px-3 py-1 rounded-xl">
                Pending: PKR {totalCapitalPending.toLocaleString()}
              </span>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase font-mono text-[10px]">
              <tr>
                <th className="p-3 rounded-l-xl">Date &amp; Ref</th>
                <th className="p-3">Partner Name</th>
                <th className="p-3">Asset / Contribution Type</th>
                <th className="p-3">Description</th>
                <th className="p-3">Agreed Valuation (PKR)</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right rounded-r-xl">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {filteredContributions.map((c) => (
                <tr key={c.id} className="hover:bg-slate-800/40 transition">
                  <td className="p-3 font-mono text-[11px]">
                    <div className="text-slate-200 font-bold">{c.contributionDate}</div>
                    <div className="text-[10px] text-slate-500">{c.paymentReference || 'N/A'}</div>
                  </td>
                  <td className="p-3 font-bold text-slate-100">{c.partnerName}</td>
                  <td className="p-3">
                    <span className="px-2.5 py-1 bg-slate-800 text-purple-300 font-mono text-[10px] rounded-lg border border-slate-700">
                      {c.contributionType}
                    </span>
                  </td>
                  <td className="p-3 text-slate-300 max-w-xs">{c.description}</td>
                  <td className="p-3 font-mono font-bold text-emerald-400">
                    PKR {c.agreedValuationPKR.toLocaleString()}
                  </td>
                  <td className="p-3">
                    {c.approvalStatus === 'APPROVED' ? (
                      <span className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-300 font-bold text-[10px] rounded-full border border-emerald-500/30 flex items-center gap-1 w-fit">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Approved
                      </span>
                    ) : c.approvalStatus === 'PENDING' ? (
                      <span className="px-2.5 py-0.5 bg-amber-500/20 text-amber-300 font-bold text-[10px] rounded-full border border-amber-500/30 flex items-center gap-1 w-fit">
                        <Clock className="w-3 h-3 text-amber-400" /> Pending Review
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 bg-rose-500/20 text-rose-300 font-bold text-[10px] rounded-full border border-rose-500/30 flex items-center gap-1 w-fit">
                        <XCircle className="w-3 h-3 text-rose-400" /> Rejected
                      </span>
                    )}
                  </td>
                  <td className="p-3 text-right space-x-2">
                    {c.approvalStatus === 'PENDING' && (
                      <>
                        <button
                          onClick={() => handleApprove(c.id)}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] rounded-lg cursor-pointer"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleReject(c.id)}
                          className="px-2.5 py-1 bg-rose-600 hover:bg-rose-500 text-white font-bold text-[11px] rounded-lg cursor-pointer"
                        >
                          Reject
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Capital Entry Modal */}
      {isAddingModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">Record Partner Capital Contribution</h3>
              <button
                onClick={() => setIsAddingModalOpen(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs font-sans">
              <div>
                <label className="block text-slate-400 font-medium mb-1">Executing Partner</label>
                <select
                  value={newContribution.partnerId}
                  onChange={(e) => setNewContribution({ ...newContribution, partnerId: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-200 focus:outline-none"
                >
                  {partnership.partners.map((p) => (
                    <option key={p.id} value={p.id}>{p.fullName} ({p.partnerCode})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Contribution Type</label>
                <select
                  value={newContribution.contributionType}
                  onChange={(e) => setNewContribution({ ...newContribution, contributionType: e.target.value as ContributionType })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-200 focus:outline-none"
                >
                  {CONTRIBUTION_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-purple-400 font-bold mb-1">Agreed Valuation (PKR)</label>
                <input
                  type="number"
                  value={newContribution.agreedValuationPKR}
                  onChange={(e) => setNewContribution({ ...newContribution, agreedValuationPKR: Number(e.target.value) })}
                  className="w-full bg-slate-950 border border-purple-500/40 rounded-xl p-3 text-purple-200 font-mono font-bold focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Payment / Inspection Ref</label>
                <input
                  type="text"
                  value={newContribution.paymentReference}
                  onChange={(e) => setNewContribution({ ...newContribution, paymentReference: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-200 focus:outline-none"
                  placeholder="e.g. MZB-IBFT-9912 or EVAL-MACH-01"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Description / Asset Detail</label>
                <textarea
                  rows={2}
                  value={newContribution.description}
                  onChange={(e) => setNewContribution({ ...newContribution, description: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-200 focus:outline-none"
                  placeholder="Details of machinery, cash deposit, or property transfer..."
                />
              </div>
            </div>

            <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-800">
              <button
                onClick={() => setIsAddingModalOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleAddContribution}
                className="px-5 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl shadow-lg shadow-purple-600/30 cursor-pointer"
              >
                Post Capital Entry
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
