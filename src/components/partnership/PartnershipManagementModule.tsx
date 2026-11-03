import React, { useState, useEffect } from 'react';
import {
  Building2,
  Users,
  DollarSign,
  TrendingUp,
  FileText,
  CreditCard,
  LayoutDashboard,
  Sparkles
} from 'lucide-react';
import { Partnership, PartnerCapitalContribution, PartnerPaymentVoucher } from '../../types/partnership';
import {
  getCompanyPartnerships,
  getCapitalContributions,
  getPartnerPayments
} from '../../services/partnershipService';
import { useAuthTenant } from '../../context/AuthTenantContext';

import { PartnershipDashboard } from './PartnershipDashboard';
import { PartnershipRegistrationManager } from './PartnershipRegistrationManager';
import { PartnerCapitalManager } from './PartnerCapitalManager';
import { ProfitDistributionEngine } from './ProfitDistributionEngine';
import { PartnershipDeedGenerator } from './PartnershipDeedGenerator';
import { PartnerPaymentManager } from './PartnerPaymentManager';
import { PartnershipPerformanceDashboard } from './PartnershipPerformanceDashboard';

export const PartnershipManagementModule: React.FC = () => {
  const { currentCompany } = useAuthTenant();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'performance' | 'register' | 'capital' | 'profit' | 'deed' | 'payments'>('dashboard');

  const [partnerships, setPartnerships] = useState<Partnership[]>([]);
  const [contributions, setContributions] = useState<PartnerCapitalContribution[]>([]);
  const [payments, setPayments] = useState<PartnerPaymentVoucher[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadAllData = async () => {
    setIsLoading(true);
    try {
      const pList = await getCompanyPartnerships(currentCompany.id);
      const cList = await getCapitalContributions(currentCompany.id);
      const payList = await getPartnerPayments(currentCompany.id);

      setPartnerships(pList);
      setContributions(cList);
      setPayments(payList);
    } catch (e) {
      console.warn('Error loading partnership data:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, [currentCompany.id]);

  const activePartnership = partnerships[0] || null;

  if (isLoading) {
    return (
      <div className="p-12 text-center text-slate-400 space-y-3 font-mono">
        <div className="w-10 h-10 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <div className="text-xs font-bold uppercase tracking-widest text-slate-300">Loading Partnership Ledger &amp; Legal Data...</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
      {/* Module Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3 overflow-x-auto custom-scrollbar">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition flex items-center gap-2 cursor-pointer shrink-0 ${
            activeTab === 'dashboard'
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
              : 'bg-slate-900 text-slate-400 hover:text-slate-100 hover:bg-slate-800'
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          <span>Dashboard Overview</span>
        </button>

        <button
          onClick={() => setActiveTab('performance')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition flex items-center gap-2 cursor-pointer shrink-0 ${
            activeTab === 'performance'
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
              : 'bg-slate-900 text-slate-400 hover:text-slate-100 hover:bg-slate-800'
          }`}
        >
          <TrendingUp className="w-4 h-4 text-emerald-400" />
          <span>Performance &amp; ROI Analytics</span>
        </button>

        <button
          onClick={() => setActiveTab('register')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition flex items-center gap-2 cursor-pointer shrink-0 ${
            activeTab === 'register'
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
              : 'bg-slate-900 text-slate-400 hover:text-slate-100 hover:bg-slate-800'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Entity Registration ({partnerships.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('capital')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition flex items-center gap-2 cursor-pointer shrink-0 ${
            activeTab === 'capital'
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
              : 'bg-slate-900 text-slate-400 hover:text-slate-100 hover:bg-slate-800'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          <span>Capital &amp; Asset Contributions</span>
        </button>

        <button
          onClick={() => setActiveTab('profit')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition flex items-center gap-2 cursor-pointer shrink-0 ${
            activeTab === 'profit'
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
              : 'bg-slate-900 text-slate-400 hover:text-slate-100 hover:bg-slate-800'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Profit Distribution Engine</span>
        </button>

        <button
          onClick={() => setActiveTab('deed')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition flex items-center gap-2 cursor-pointer shrink-0 ${
            activeTab === 'deed'
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
              : 'bg-slate-900 text-slate-400 hover:text-slate-100 hover:bg-slate-800'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Partnership Deed (26 Clauses)</span>
        </button>

        <button
          onClick={() => setActiveTab('payments')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition flex items-center gap-2 cursor-pointer shrink-0 ${
            activeTab === 'payments'
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
              : 'bg-slate-900 text-slate-400 hover:text-slate-100 hover:bg-slate-800'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>Payment Vouchers ({payments.length})</span>
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === 'dashboard' && (
        <PartnershipDashboard
          partnerships={partnerships}
          contributions={contributions}
          onNavigateTab={(tab) => setActiveTab(tab)}
        />
      )}

      {activeTab === 'performance' && activePartnership && (
        <PartnershipPerformanceDashboard
          partnership={activePartnership}
          contributions={contributions}
        />
      )}

      {activeTab === 'register' && (
        <PartnershipRegistrationManager
          partnerships={partnerships}
          onRefreshData={loadAllData}
        />
      )}

      {activeTab === 'capital' && activePartnership && (
        <PartnerCapitalManager
          partnership={activePartnership}
          contributions={contributions}
          onRefreshData={loadAllData}
        />
      )}

      {activeTab === 'profit' && activePartnership && (
        <ProfitDistributionEngine
          partnership={activePartnership}
        />
      )}

      {activeTab === 'deed' && activePartnership && (
        <PartnershipDeedGenerator
          partnership={activePartnership}
        />
      )}

      {activeTab === 'payments' && activePartnership && (
        <PartnerPaymentManager
          partnership={activePartnership}
          payments={payments}
          onRefreshData={loadAllData}
        />
      )}
    </div>
  );
};
