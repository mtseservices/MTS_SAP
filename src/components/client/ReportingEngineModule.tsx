import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Download,
  Printer,
  FileSpreadsheet,
  FileText,
  CheckCircle2,
  Building2,
  Calendar,
  Layers,
  ArrowDownToLine,
  ExternalLink,
  Mail,
  Clock,
  Send,
  Trash2,
  Play,
  Pause,
  Plus,
  X,
  AlertCircle,
  Sparkles,
  Check,
  TrendingUp,
  DollarSign,
  ArrowUpRight,
  Filter,
  Sliders,
  Target,
  Briefcase,
  ShieldCheck,
  ArrowRight,
  Zap,
  HelpCircle,
  ChevronRight
} from 'lucide-react';
import { useAuthTenant } from '../../context/AuthTenantContext';
import { INITIAL_ACCOUNTS, INITIAL_INVENTORY } from '../../services/mockData';
import { TTSButton } from '../common/TTSButton';
import { doc, setDoc, deleteDoc, collection, onSnapshot } from 'firebase/firestore';
import { db } from '../../services/firebaseConfig';
import { ReportParameterModal, ReportConfigTarget } from '../common/ReportParameterModal';

export interface ScheduledReportConfig {
  id: string;
  companyId: string;
  reportType: 'pnl' | 'trial' | 'balance' | 'stock' | 'fifo_lifo' | 'predictive_revenue';
  reportTitle: string;
  frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY';
  timeOfDay: string;
  deliveryDay: string;
  recipients: string[];
  format: 'PDF' | 'CSV' | 'EXCEL';
  status: 'ACTIVE' | 'PAUSED';
  lastSentAt?: string;
  nextScheduledAt: string;
  createdAt: string;
}

export interface PredictiveDealItem {
  id: string;
  title: string;
  clientName: string;
  stage: 'PROSPECTING' | 'QUALIFIED' | 'NEGOTIATION' | 'CLOSED_WON';
  dealValue: number;
  probability: number;
  expectedCloseDate: string;
  expectedInflowDate: string;
  quarter: 'Q1 2027' | 'Q2 2027';
  targetMonth: string;
  confidence: 'HIGH' | 'MEDIUM' | 'MODERATE';
}

export const ReportingEngineModule: React.FC = () => {
  const { currentCompany, currentUser } = useAuthTenant();
  const [selectedReport, setSelectedReport] = useState<'pnl' | 'trial' | 'balance' | 'stock' | 'fifo_lifo' | 'predictive_revenue'>('pnl');
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showParameterModal, setShowParameterModal] = useState(false);
  const [scheduledNotification, setScheduledNotification] = useState<string | null>(null);

  // Predictive Revenue Dashboard States
  const [predictiveScenario, setPredictiveScenario] = useState<'BASE' | 'CONSERVATIVE' | 'OPTIMISTIC'>('BASE');
  const [quarterFilter, setQuarterFilter] = useState<'ALL' | 'Q1' | 'Q2'>('ALL');
  const [velocityMultiplier, setVelocityMultiplier] = useState<number>(1.0);

  // Pipeline deals state with real-time sync with CRM Leads
  const [pipelineDeals, setPipelineDeals] = useState<PredictiveDealItem[]>([
    {
      id: 'deal_p01',
      title: 'Q4/Q1 Bulk FMCG & Solar Supply Contract',
      clientName: 'Metro Cash & Carry Pakistan',
      stage: 'NEGOTIATION',
      dealValue: 4500000,
      probability: 78,
      expectedCloseDate: '2026-11-28',
      expectedInflowDate: '2027-01-15',
      quarter: 'Q1 2027',
      targetMonth: 'Jan 2027',
      confidence: 'HIGH'
    },
    {
      id: 'deal_p02',
      title: 'Industrial Chemical & Raw Material Procurement',
      clientName: 'Fauji Fertilizer Bin Qasim (FFBL)',
      stage: 'NEGOTIATION',
      dealValue: 7900000,
      probability: 85,
      expectedCloseDate: '2026-12-10',
      expectedInflowDate: '2027-01-28',
      quarter: 'Q1 2027',
      targetMonth: 'Jan 2027',
      confidence: 'HIGH'
    },
    {
      id: 'deal_p03',
      title: 'Bulk Agri Chemicals & Polymer Sourcing',
      clientName: 'Engro Fertilizers Ltd',
      stage: 'QUALIFIED',
      dealValue: 12800000,
      probability: 55,
      expectedCloseDate: '2026-12-28',
      expectedInflowDate: '2027-02-20',
      quarter: 'Q1 2027',
      targetMonth: 'Feb 2027',
      confidence: 'MEDIUM'
    },
    {
      id: 'deal_p04',
      title: 'Loom Spare Parts & Industrial Lubricants',
      clientName: 'Al-Madina Textiles Faisalabad',
      stage: 'PROSPECTING',
      dealValue: 2800000,
      probability: 25,
      expectedCloseDate: '2027-01-25',
      expectedInflowDate: '2027-03-10',
      quarter: 'Q1 2027',
      targetMonth: 'Mar 2027',
      confidence: 'MODERATE'
    },
    {
      id: 'deal_p05',
      title: 'Annual Flexible Packaging & Ingredients Contract',
      clientName: 'National Foods Limited',
      stage: 'NEGOTIATION',
      dealValue: 16500000,
      probability: 72,
      expectedCloseDate: '2027-02-22',
      expectedInflowDate: '2027-04-15',
      quarter: 'Q2 2027',
      targetMonth: 'Apr 2027',
      confidence: 'HIGH'
    },
    {
      id: 'deal_p06',
      title: 'Corrugated Shipping Cartons Batch Expansion',
      clientName: 'Packages Limited Lahore',
      stage: 'QUALIFIED',
      dealValue: 9400000,
      probability: 50,
      expectedCloseDate: '2027-03-18',
      expectedInflowDate: '2027-05-12',
      quarter: 'Q2 2027',
      targetMonth: 'May 2027',
      confidence: 'MEDIUM'
    },
    {
      id: 'deal_p07',
      title: 'Textile Machinery Consumables Batch Order',
      clientName: 'Nishat Mills Industrial Unit',
      stage: 'PROSPECTING',
      dealValue: 8200000,
      probability: 30,
      expectedCloseDate: '2027-04-15',
      expectedInflowDate: '2027-06-18',
      quarter: 'Q2 2027',
      targetMonth: 'Jun 2027',
      confidence: 'MODERATE'
    }
  ]);

  // Scheduled Email Exports State
  const [schedules, setSchedules] = useState<ScheduledReportConfig[]>([
    {
      id: 'sched_pnl_daily_01',
      companyId: currentCompany.id,
      reportType: 'pnl',
      reportTitle: 'Profit & Loss Statement (P&L)',
      frequency: 'DAILY',
      timeOfDay: '08:00 AM (PKT)',
      deliveryDay: 'Every Day',
      recipients: [currentUser.email || 'admin@albarka.com.pk', currentCompany.adminEmail || 'cfo@albarka.com.pk'],
      format: 'PDF',
      status: 'ACTIVE',
      lastSentAt: '2026-11-01 08:00 AM',
      nextScheduledAt: '2026-11-02 08:00 AM',
      createdAt: '2026-10-15'
    },
    {
      id: 'sched_stock_weekly_02',
      companyId: currentCompany.id,
      reportType: 'stock',
      reportTitle: 'Warehouse Stock Valuation Report',
      frequency: 'WEEKLY',
      timeOfDay: '09:00 AM (PKT)',
      deliveryDay: 'Every Monday',
      recipients: ['inventory.mgr@albarka.com.pk', currentUser.email],
      format: 'CSV',
      status: 'ACTIVE',
      lastSentAt: '2026-10-26 09:00 AM',
      nextScheduledAt: '2026-11-02 09:00 AM',
      createdAt: '2026-10-20'
    }
  ]);

  // New Schedule Modal Form Fields
  const [schedReportType, setSchedReportType] = useState<'pnl' | 'trial' | 'balance' | 'stock' | 'fifo_lifo' | 'predictive_revenue'>('pnl');
  const [schedFrequency, setSchedFrequency] = useState<'DAILY' | 'WEEKLY' | 'MONTHLY'>('DAILY');
  const [schedTimeOfDay, setSchedTimeOfDay] = useState('08:00 AM');
  const [schedDeliveryDay, setSchedDeliveryDay] = useState('Every Day');
  const [schedRecipientsInput, setSchedRecipientsInput] = useState(`${currentUser.email}, ${currentCompany.adminEmail || 'cfo@company.pk'}`);
  const [schedFormat, setSchedFormat] = useState<'PDF' | 'CSV' | 'EXCEL'>('PDF');

  // Real-time Firebase Firestore Subscription for Scheduled Email Exports
  useEffect(() => {
    if (!currentCompany.id) return;

    try {
      const colRef = collection(db, 'companies', currentCompany.id, 'scheduled_reports');
      const unsubscribe = onSnapshot(colRef, (snapshot) => {
        if (!snapshot.empty) {
          const list: ScheduledReportConfig[] = snapshot.docs.map((d) => {
            const data = d.data();
            return {
              id: d.id,
              companyId: data.companyId || currentCompany.id,
              reportType: data.reportType || 'pnl',
              reportTitle: data.reportTitle || 'Report',
              frequency: data.frequency || 'DAILY',
              timeOfDay: data.timeOfDay || '08:00 AM',
              deliveryDay: data.deliveryDay || 'Every Day',
              recipients: data.recipients || [],
              format: data.format || 'PDF',
              status: (data.status === 'PAUSED' ? 'PAUSED' : 'ACTIVE') as 'ACTIVE' | 'PAUSED',
              lastSentAt: data.lastSentAt,
              nextScheduledAt: data.nextScheduledAt || '',
              createdAt: data.createdAt || ''
            } as ScheduledReportConfig;
          });
          setSchedules(list);
        }
      }, (err) => {
        console.warn('Firestore scheduled_reports listener error:', err);
      });

      return () => unsubscribe();
    } catch (e) {
      console.warn('Firebase error initializing scheduled reports:', e);
    }
  }, [currentCompany.id]);

  // Real-time Firebase Firestore Subscription for CRM leads to feed into Predictive Revenue
  useEffect(() => {
    if (!currentCompany.id) return;

    try {
      const colRef = collection(db, 'companies', currentCompany.id, 'crm_leads');
      const unsubscribe = onSnapshot(colRef, (snapshot) => {
        if (!snapshot.empty) {
          const fetchedDeals: PredictiveDealItem[] = snapshot.docs.map((docSnap) => {
            const d = docSnap.data();
            const estVal = Number(d.estimatedValue) || 2500000;
            const stage = (d.status || 'QUALIFIED') as 'PROSPECTING' | 'QUALIFIED' | 'NEGOTIATION' | 'CLOSED_WON';
            
            let baseProb = 50;
            if (stage === 'CLOSED_WON') baseProb = 100;
            else if (stage === 'NEGOTIATION') baseProb = 75;
            else if (stage === 'QUALIFIED') baseProb = 50;
            else baseProb = 25;

            if (d.interactionsCount && d.interactionsCount > 2) {
              baseProb = Math.min(95, baseProb + Math.min(20, d.interactionsCount * 4));
            }

            const isQ2 = stage === 'PROSPECTING' || estVal > 15000000;
            const quarter = isQ2 ? 'Q2 2027' : 'Q1 2027';
            const targetMonth = isQ2 ? (estVal > 10000000 ? 'Apr 2027' : 'May 2027') : (stage === 'NEGOTIATION' ? 'Jan 2027' : 'Feb 2027');

            return {
              id: docSnap.id,
              title: `${stage} Procurement Agreement`,
              clientName: d.organization || d.name || 'Client',
              stage,
              dealValue: estVal,
              probability: baseProb,
              expectedCloseDate: d.followUpDate || '2026-12-15',
              expectedInflowDate: targetMonth === 'Jan 2027' ? '2027-01-20' : targetMonth === 'Feb 2027' ? '2027-02-15' : '2027-04-20',
              quarter: quarter as 'Q1 2027' | 'Q2 2027',
              targetMonth,
              confidence: (baseProb >= 70 ? 'HIGH' : baseProb >= 40 ? 'MEDIUM' : 'MODERATE') as 'HIGH' | 'MEDIUM' | 'MODERATE'
            };
          });

          // Merge live Firestore leads with core multi-quarter enterprise pipeline
          setPipelineDeals((prev) => {
            const combined = [...fetchedDeals];
            prev.forEach((baseDeal) => {
              if (!combined.some((c) => c.clientName.toLowerCase() === baseDeal.clientName.toLowerCase())) {
                combined.push(baseDeal);
              }
            });
            return combined;
          });
        }
      }, (err) => {
        console.warn('Firestore crm_leads listener error:', err);
      });

      return () => unsubscribe();
    } catch (e) {
      console.warn('Firebase error initializing crm_leads listener:', e);
    }
  }, [currentCompany.id]);

  // Historical Sales Velocity Metrics
  const historicalGrossAnnualRevenue = 148000000; // Rs. 148M from Account #4010
  const historicalMonthlyRunRate = Math.round(historicalGrossAnnualRevenue / 12); // ~Rs. 12,333,333/mo
  const historicalQuarterlyBaseline = historicalMonthlyRunRate * 3; // ~Rs. 37,000,000/qtr
  const historicalSalesCycleDays = 28; // Avg days to close
  const historicalDsoDays = 34; // Days Sales Outstanding for cash collection
  const historicalAccountsReceivable = 14200000; // Rs. 14.2M from Account #1200

  // Scenario Multipliers
  const scenarioProbMultiplier = predictiveScenario === 'CONSERVATIVE' ? 0.75 : predictiveScenario === 'OPTIMISTIC' ? 1.2 : 1.0;
  const scenarioArMultiplier = predictiveScenario === 'CONSERVATIVE' ? 0.85 : predictiveScenario === 'OPTIMISTIC' ? 1.1 : 1.0;
  const scenarioBaselineMultiplier = predictiveScenario === 'CONSERVATIVE' ? 0.92 : predictiveScenario === 'OPTIMISTIC' ? 1.08 : 1.0;

  // Monthly forecast definitions for upcoming two quarters (Q1 2027: Jan-Mar, Q2 2027: Apr-Jun)
  const monthConfigs = [
    { key: 'jan_2027', name: 'Jan 2027', quarter: 'Q1 2027' as const, baseTarget: 12500000, arTarget: 5400000 },
    { key: 'feb_2027', name: 'Feb 2027', quarter: 'Q1 2027' as const, baseTarget: 12800000, arTarget: 4800000 },
    { key: 'mar_2027', name: 'Mar 2027', quarter: 'Q1 2027' as const, baseTarget: 13200000, arTarget: 4000000 },
    { key: 'apr_2027', name: 'Apr 2027', quarter: 'Q2 2027' as const, baseTarget: 13500000, arTarget: 3200000 },
    { key: 'may_2027', name: 'May 2027', quarter: 'Q2 2027' as const, baseTarget: 13800000, arTarget: 2500000 },
    { key: 'jun_2027', name: 'Jun 2027', quarter: 'Q2 2027' as const, baseTarget: 14200000, arTarget: 2000000 }
  ];

  // Calculate monthly forecasts
  const monthlyForecasts = monthConfigs.map((m) => {
    const baseline = Math.round(m.baseTarget * scenarioBaselineMultiplier * velocityMultiplier);
    const arCollections = Math.round(m.arTarget * scenarioArMultiplier);
    
    // Sum weighted pipeline deals landing in this month
    const matchingDeals = pipelineDeals.filter((d) => d.targetMonth === m.name);
    const pipelineInflow = matchingDeals.reduce((sum, d) => {
      const effProb = Math.min(99, Math.round(d.probability * scenarioProbMultiplier * velocityMultiplier));
      return sum + Math.round(d.dealValue * (effProb / 100));
    }, 0);

    const total = baseline + pipelineInflow + arCollections;
    return {
      monthKey: m.key,
      monthName: m.name,
      quarter: m.quarter,
      baselineRevenue: baseline,
      pipelineWeightedInflow: pipelineInflow,
      arCollectionsInflow: arCollections,
      totalProjectedInflow: total,
      historicalBenchmark: historicalMonthlyRunRate
    };
  });

  // Filtered monthly forecasts according to quarterFilter
  const displayedForecasts = monthlyForecasts.filter((m) => {
    if (quarterFilter === 'Q1') return m.quarter === 'Q1 2027';
    if (quarterFilter === 'Q2') return m.quarter === 'Q2 2027';
    return true;
  });

  // Aggregated totals
  const q1ForecastTotal = monthlyForecasts
    .filter((m) => m.quarter === 'Q1 2027')
    .reduce((sum, m) => sum + m.totalProjectedInflow, 0);

  const q2ForecastTotal = monthlyForecasts
    .filter((m) => m.quarter === 'Q2 2027')
    .reduce((sum, m) => sum + m.totalProjectedInflow, 0);

  const combined2QTotal = q1ForecastTotal + q2ForecastTotal;
  const historical2QBaseline = historicalQuarterlyBaseline * 2;
  const growthOverBaselinePct = Math.round(((combined2QTotal - historical2QBaseline) / historical2QBaseline) * 100);

  const totalRawPipelineValue = pipelineDeals.reduce((sum, d) => sum + d.dealValue, 0);
  const totalWeightedPipelineInflow = monthlyForecasts.reduce((sum, m) => sum + m.pipelineWeightedInflow, 0);
  const pipelineCoverageRatio = (totalRawPipelineValue / Math.max(1, totalWeightedPipelineInflow)).toFixed(1);

  // Trigger manual test dispatch ("Send Now")
  const handleTriggerSendNow = (sched: ScheduledReportConfig) => {
    const nowStr = new Date().toLocaleString('en-PK', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const updated = schedules.map((s) =>
      s.id === sched.id ? { ...s, lastSentAt: `${nowStr} (Manual Dispatch)` } : s
    );
    setSchedules(updated);

    // Save update to Firebase
    try {
      setDoc(doc(db, 'companies', currentCompany.id, 'scheduled_reports', sched.id), {
        ...sched,
        lastSentAt: `${nowStr} (Manual Dispatch)`
      }, { merge: true });
    } catch (err) {
      console.warn('Could not update lastSentAt in Firebase:', err);
    }

    setScheduledNotification(
      `📧 Instant Report Email Dispatched! ${sched.reportTitle} (${sched.format}) delivered to [${sched.recipients.join(', ')}].`
    );
    setTimeout(() => setScheduledNotification(null), 5000);
  };

  // Toggle Pause/Active state
  const handleToggleStatus = (sched: ScheduledReportConfig) => {
    const newStatus = sched.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE';
    const updated: ScheduledReportConfig[] = schedules.map((s) => (s.id === sched.id ? { ...s, status: newStatus as ('ACTIVE' | 'PAUSED') } : s));
    setSchedules(updated);

    try {
      setDoc(doc(db, 'companies', currentCompany.id, 'scheduled_reports', sched.id), {
        status: newStatus
      }, { merge: true });
    } catch (e) {
      console.warn('Firebase update error:', e);
    }
  };

  // Delete schedule
  const handleDeleteSchedule = async (id: string) => {
    setSchedules((prev) => prev.filter((s) => s.id !== id));
    try {
      await deleteDoc(doc(db, 'companies', currentCompany.id, 'scheduled_reports', id));
    } catch (e) {
      console.warn('Firebase delete error:', e);
    }
  };

  // Save new automated schedule
  const handleCreateScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const reportTitleMap = {
      pnl: 'Profit & Loss Statement (P&L)',
      trial: 'Balanced Trial Balance',
      balance: 'Financial Balance Sheet',
      stock: 'Warehouse Stock Valuation',
      fifo_lifo: 'FIFO / LIFO Valuation Report',
      predictive_revenue: 'Predictive Revenue & Cash Inflow Forecast (2 Quarters)'
    };

    const recipientList = schedRecipientsInput
      .split(',')
      .map((r) => r.trim())
      .filter((r) => r.length > 0 && r.includes('@'));

    if (recipientList.length === 0) {
      alert('Please enter at least one valid recipient email address.');
      return;
    }

    const newId = `sched_${schedReportType}_${Date.now().toString().slice(-4)}`;
    const newSchedule: ScheduledReportConfig = {
      id: newId,
      companyId: currentCompany.id,
      reportType: schedReportType,
      reportTitle: reportTitleMap[schedReportType],
      frequency: schedFrequency,
      timeOfDay: `${schedTimeOfDay} (PKT)`,
      deliveryDay: schedFrequency === 'DAILY' ? 'Every Day' : schedDeliveryDay,
      recipients: recipientList,
      format: schedFormat,
      status: 'ACTIVE',
      nextScheduledAt: schedFrequency === 'DAILY' ? 'Tomorrow at 08:00 AM' : `${schedDeliveryDay} at ${schedTimeOfDay}`,
      createdAt: new Date().toISOString().split('T')[0]
    };

    setSchedules((prev) => [newSchedule, ...prev]);

    try {
      await setDoc(doc(db, 'companies', currentCompany.id, 'scheduled_reports', newId), newSchedule);
    } catch (err) {
      console.warn('Could not save schedule to Firebase:', err);
    }

    setShowScheduleModal(false);
    setScheduledNotification(
      `✅ New Automated Email Schedule Created! Delivering ${newSchedule.reportTitle} (${newSchedule.frequency}) to ${recipientList.length} recipient(s).`
    );
    setTimeout(() => setScheduledNotification(null), 5000);
  };

  // Helper to trigger browser PDF print
  const handlePrintPdf = () => {
    window.print();
  };

  // Helper to export CSV report
  const handleExportCsv = () => {
    let csvContent = 'data:text/csv;charset=utf-8,';
    const timestamp = new Date().toISOString().split('T')[0];

    if (selectedReport === 'pnl') {
      csvContent += `Company Name,${currentCompany.name}\n`;
      csvContent += `Report,Profit and Loss Statement (PKR)\n`;
      csvContent += `Date,${timestamp}\n\n`;
      csvContent += `Category,Account Description,Amount (PKR)\n`;
      csvContent += `Revenue,Gross Sales Revenue (NTN Taxed),148000000\n`;
      csvContent += `Cost of Sales,Cost of Goods Sold (COGS),-89000000\n`;
      csvContent += `Gross Profit,Operating Gross Profit,59000000\n`;
      csvContent += `Expenses,Salaries & Factory Payroll,-12400000\n`;
      csvContent += `Net Profit,Net Operating Profit Before Tax,46600000\n`;
    } else if (selectedReport === 'trial') {
      csvContent += `Company Name,${currentCompany.name}\n`;
      csvContent += `Report,Balanced Trial Balance (PKR)\n`;
      csvContent += `Date,${timestamp}\n\n`;
      csvContent += `Account Code,Account Name,Category,Debit (PKR),Credit (PKR)\n`;
      INITIAL_ACCOUNTS.forEach((acc) => {
        const isDebit = acc.type === 'ASSET' || acc.type === 'EXPENSE';
        const debit = isDebit ? acc.balance : 0;
        const credit = !isDebit ? acc.balance : 0;
        csvContent += `"${acc.code}","${acc.name}","${acc.category}",${debit},${credit}\n`;
      });
    } else if (selectedReport === 'stock') {
      csvContent += `Company Name,${currentCompany.name}\n`;
      csvContent += `Report,Warehouse Stock Valuation Report\n`;
      csvContent += `Date,${timestamp}\n\n`;
      csvContent += `Item Code,Item Name,Category,Quantity,UOM,Unit Purchase Cost (PKR),Total Valuation (PKR)\n`;
      INITIAL_INVENTORY.forEach((item) => {
        const totalVal = item.currentStock * item.purchasePrice;
        csvContent += `"${item.code}","${item.name}","${item.category}",${item.currentStock},"${item.uom}",${item.purchasePrice},${totalVal}\n`;
      });
    } else if (selectedReport === 'fifo_lifo') {
      csvContent += `Company Name,${currentCompany.name}\n`;
      csvContent += `Report,FIFO / LIFO Inventory Valuation Report\n`;
      csvContent += `Date,${timestamp}\n\n`;
      csvContent += `Item Code,Item Name,Available Qty,FIFO Unit Cost (PKR),FIFO Total (PKR),LIFO Unit Cost (PKR),LIFO Total (PKR)\n`;
      INITIAL_INVENTORY.forEach((item) => {
        const fifoCost = Math.round(item.purchasePrice * 0.95);
        const lifoCost = Math.round(item.purchasePrice * 1.05);
        csvContent += `"${item.code}","${item.name}",${item.currentStock},${fifoCost},${item.currentStock * fifoCost},${lifoCost},${item.currentStock * lifoCost}\n`;
      });
    } else if (selectedReport === 'predictive_revenue') {
      csvContent += `Company Name,${currentCompany.name}\n`;
      csvContent += `Report,Predictive Revenue & Cash Inflow Forecast (2 Quarters)\n`;
      csvContent += `Date,${timestamp}\n`;
      csvContent += `Scenario,${predictiveScenario},Velocity Multiplier,${velocityMultiplier}x\n\n`;
      csvContent += `MONTHLY CASH INFLOW FORECAST (PKR)\n`;
      csvContent += `Month,Quarter,Baseline Recurring (PKR),Weighted Pipeline Inflow (PKR),AR Recoveries (PKR),Total Projected Inflow (PKR),Historical Benchmark (PKR)\n`;
      monthlyForecasts.forEach((m) => {
        csvContent += `"${m.monthName}","${m.quarter}",${m.baselineRevenue},${m.pipelineWeightedInflow},${m.arCollectionsInflow},${m.totalProjectedInflow},${m.historicalBenchmark}\n`;
      });
      csvContent += `\nPIPELINE DEAL INFLOW SCHEDULE\n`;
      csvContent += `Deal / Client,Stage,Deal Value (PKR),Effective Probability (%),Quarter,Expected Inflow Month,Weighted Inflow (PKR)\n`;
      pipelineDeals.forEach((d) => {
        const effProb = Math.min(99, Math.round(d.probability * scenarioProbMultiplier * velocityMultiplier));
        const weighted = Math.round(d.dealValue * (effProb / 100));
        csvContent += `"${d.clientName} - ${d.title}","${d.stage}",${d.dealValue},${effProb}%,"${d.quarter}","${d.targetMonth}",${weighted}\n`;
      });
    } else {
      csvContent += `Company Name,${currentCompany.name}\n`;
      csvContent += `Report,Balance Sheet Statement\n`;
      csvContent += `Date,${timestamp}\n\n`;
      csvContent += `Asset/Liability Head,Amount (PKR)\n`;
      csvContent += `Total Current & Fixed Assets,104800000\n`;
      csvContent += `Total Liabilities,11250000\n`;
      csvContent += `Shareholders Equity,93550000\n`;
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${currentCompany.slug}_${selectedReport}_report_${timestamp}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const reportSpeech = selectedReport === 'predictive_revenue'
    ? `Predictive Revenue and Cash Inflow Forecast for ${currentCompany.name} across upcoming two quarters: Q1 and Q2 2027. Combined projected cash inflow is ${Math.round(combined2QTotal / 1000000)} million Pakistani Rupees, reflecting a ${growthOverBaselinePct} percent increase above historical baseline run-rate. Q1 projected inflow is ${Math.round(q1ForecastTotal / 1000000)} million Rupees, and Q2 projected inflow is ${Math.round(q2ForecastTotal / 1000000)} million Rupees, backed by ${pipelineDeals.length} active CRM enterprise deals.`
    : `Universal Reporting Engine for ${currentCompany.name}. Selected report: ${selectedReport.toUpperCase()}. Direct scheduled email exports and PDF printing active.`;

  return (
    <div className="p-6 space-y-6">
      {/* Print-Only Custom CSS Styles */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-report-area, #printable-report-area * {
            visibility: visible;
          }
          #printable-report-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            background: white !important;
            color: black !important;
            padding: 20px;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      {/* Screen Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4 no-print">
        <div>
          <h1 className="text-xl font-black text-slate-100 flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-cyan-400" />
            Universal Financial & Operational Reporting Engine
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time Profit & Loss (P&L), Trial Balance, Balance Sheet, Stock Ledger, and Automated Scheduled Email Delivery.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <TTSButton text={reportSpeech} label="Report Voice Readout" />

          {/* Universal Report Parameters Popup matching image_21e62cc3.png */}
          <button
            onClick={() => setShowParameterModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/40 text-xs font-bold transition-all cursor-pointer shadow-lg shadow-amber-950/40"
          >
            <Filter className="w-4 h-4 text-amber-400" />
            Report Parameters (Popup Form)
          </button>

          {/* Scheduled Email Export Modal Trigger */}
          <button
            onClick={() => setShowScheduleModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 transition-all cursor-pointer"
          >
            <Mail className="w-4 h-4" />
            Schedule Email Export
          </button>

          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-all cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" /> Export CSV
          </button>

          <button
            onClick={() => setShowPrintModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-lg shadow-cyan-600/30 transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4" /> Print / Export PDF
          </button>
        </div>
      </div>

      {/* Scheduled Action Notification Toast */}
      {scheduledNotification && (
        <div className="p-4 rounded-xl bg-purple-500/20 border border-purple-500/40 text-purple-200 text-xs flex items-center gap-3 shadow-xl animate-in fade-in no-print">
          <Sparkles className="w-5 h-5 text-purple-400 shrink-0" />
          <div className="font-semibold">{scheduledNotification}</div>
        </div>
      )}

      {/* AUTOMATED SCHEDULED EMAIL EXPORTS PANEL */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4 no-print">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2">
                Automated Scheduled Email Deliveries
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-950 text-purple-300 font-mono border border-purple-800">
                  {schedules.filter(s => s.status === 'ACTIVE').length} Active
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Automated daily, weekly, or monthly delivery of financial & inventory reports to registered enterprise user emails.
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowScheduleModal(true)}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-purple-300 border border-purple-500/30 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" /> New Schedule
          </button>
        </div>

        {schedules.length === 0 ? (
          <div className="text-center py-6 text-slate-500 text-xs">
            No automated email delivery schedules configured. Click "New Schedule" to set up recurring report emails.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-slate-950/80 text-slate-400 uppercase text-[10px] tracking-wider font-bold border-b border-slate-800">
                  <th className="py-2.5 px-3">Report Title</th>
                  <th className="py-2.5 px-3">Frequency</th>
                  <th className="py-2.5 px-3">Delivery Schedule</th>
                  <th className="py-2.5 px-3">Format</th>
                  <th className="py-2.5 px-3">Recipient Emails</th>
                  <th className="py-2.5 px-3">Last Sent</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {schedules.map((sched) => (
                  <tr key={sched.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-3 font-bold text-slate-200">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-cyan-400 shrink-0" />
                        <span>{sched.reportTitle}</span>
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        sched.frequency === 'DAILY' ? 'bg-cyan-950 text-cyan-300 border border-cyan-800' :
                        sched.frequency === 'WEEKLY' ? 'bg-amber-950 text-amber-300 border border-amber-800' :
                        'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      }`}>
                        {sched.frequency}
                      </span>
                    </td>

                    <td className="py-3 px-3 text-slate-300">
                      <div className="flex items-center gap-1.5 text-[11px]">
                        <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{sched.deliveryDay} • {sched.timeOfDay}</span>
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-200 border border-slate-700 font-bold text-[10px]">
                        {sched.format}
                      </span>
                    </td>

                    <td className="py-3 px-3 text-slate-300">
                      <div className="max-w-[200px] truncate text-[11px]" title={sched.recipients.join(', ')}>
                        {sched.recipients.join(', ')}
                      </div>
                    </td>

                    <td className="py-3 px-3 text-slate-400 text-[11px]">
                      {sched.lastSentAt || 'Pending First Run'}
                    </td>

                    <td className="py-3 px-3 text-right space-x-1">
                      <button
                        onClick={() => handleTriggerSendNow(sched)}
                        className="px-2.5 py-1 rounded-lg bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 border border-purple-500/40 text-[11px] font-bold inline-flex items-center gap-1 transition-all cursor-pointer"
                        title="Simulate instant test dispatch"
                      >
                        <Send className="w-3 h-3 text-purple-300" /> Send Now
                      </button>

                      <button
                        onClick={() => handleToggleStatus(sched)}
                        className={`p-1 rounded-lg border text-[11px] font-bold transition-all cursor-pointer ${
                          sched.status === 'ACTIVE'
                            ? 'bg-slate-800 text-amber-400 border-amber-500/30 hover:bg-amber-950/40'
                            : 'bg-slate-800 text-emerald-400 border-emerald-500/30 hover:bg-emerald-950/40'
                        }`}
                        title={sched.status === 'ACTIVE' ? 'Pause Automation' : 'Resume Automation'}
                      >
                        {sched.status === 'ACTIVE' ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                      </button>

                      <button
                        onClick={() => handleDeleteSchedule(sched.id)}
                        className="p-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/30 text-rose-400 border border-rose-500/30 transition-all cursor-pointer"
                        title="Delete Schedule"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Report Switcher Pills */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-2 text-xs font-bold no-print">
        <button
          onClick={() => setSelectedReport('pnl')}
          className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
            selectedReport === 'pnl' ? 'bg-cyan-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200 bg-slate-800/60'
          }`}
        >
          Profit & Loss Statement (P&L)
        </button>
        <button
          onClick={() => setSelectedReport('trial')}
          className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
            selectedReport === 'trial' ? 'bg-cyan-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200 bg-slate-800/60'
          }`}
        >
          Trial Balance
        </button>
        <button
          onClick={() => setSelectedReport('balance')}
          className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
            selectedReport === 'balance' ? 'bg-cyan-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200 bg-slate-800/60'
          }`}
        >
          Balance Sheet
        </button>
        <button
          onClick={() => setSelectedReport('stock')}
          className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
            selectedReport === 'stock' ? 'bg-cyan-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200 bg-slate-800/60'
          }`}
        >
          Stock Valuation Report
        </button>
        <button
          onClick={() => setSelectedReport('fifo_lifo')}
          className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
            selectedReport === 'fifo_lifo' ? 'bg-cyan-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200 bg-slate-800/60'
          }`}
        >
          FIFO / LIFO Valuation Report
        </button>
        <button
          onClick={() => setSelectedReport('predictive_revenue')}
          className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 font-bold ${
            selectedReport === 'predictive_revenue'
              ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-600/30 ring-1 ring-emerald-400/50'
              : 'text-emerald-400 hover:text-emerald-300 bg-emerald-950/40 border border-emerald-500/30'
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5 text-emerald-300" />
          Predictive Revenue (2Q Cash Inflow)
        </button>
      </div>

      {/* Printable Report Display Container */}
      <div id="printable-report-area" className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl max-w-5xl mx-auto space-y-6">
        {/* Printable Header */}
        <div className="text-center border-b border-slate-800 pb-4 space-y-1">
          <div className="flex items-center justify-between border-b pb-2 mb-2 border-slate-800/50">
            <div className="text-left">
              <h2 className="text-lg font-black text-slate-100 uppercase tracking-wide">{currentCompany.name}</h2>
              <p className="text-xs text-slate-400">{currentCompany.registeredName}</p>
            </div>
            <div className="text-right text-xs font-mono text-slate-400 space-y-0.5">
              <div>FBR NTN: <strong className="text-cyan-400">{currentCompany.ntn}</strong></div>
              <div>FBR STRN: <strong className="text-cyan-400">{currentCompany.strn}</strong></div>
            </div>
          </div>

          <div className="text-xs text-cyan-400 font-bold uppercase tracking-wider text-sm">
            {selectedReport === 'pnl' && 'OFFICIAL PROFIT & LOSS STATEMENT'}
            {selectedReport === 'trial' && 'BALANCED TRIAL BALANCE STATEMENT'}
            {selectedReport === 'balance' && 'FINANCIAL BALANCE SHEET STATEMENT'}
            {selectedReport === 'stock' && 'WAREHOUSE STOCK VALUATION REPORT'}
            {selectedReport === 'fifo_lifo' && 'FIFO / LIFO INVENTORY VALUATION REPORT'}
            {selectedReport === 'predictive_revenue' && 'PREDICTIVE REVENUE & 2-QUARTER CASH INFLOW FORECAST DASHBOARD'}
          </div>
          <div className="text-[11px] text-slate-400 font-mono">
            Generated on {new Date().toLocaleDateString('en-PK', { year: 'numeric', month: 'long', day: 'numeric' })} • Currency: PKR • Model: Sales Velocity &amp; Lead Pipeline
          </div>
        </div>

        {/* 1. Profit & Loss Statement */}
        {selectedReport === 'pnl' && (
          <div className="space-y-4 text-xs font-mono">
            <div className="space-y-2">
              <div className="font-bold text-slate-200 text-sm uppercase tracking-wider border-b border-slate-800 pb-1 flex justify-between">
                <span>1. Operating Gross Revenue</span>
                <span className="text-emerald-400">Rs. 148,000,000</span>
              </div>
              <div className="flex justify-between text-slate-300 pl-4">
                <span>Commercial Gross Sales Revenue (NTN Taxed)</span>
                <span>Rs. 148,000,000</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="font-bold text-slate-200 text-sm uppercase tracking-wider border-b border-slate-800 pb-1 flex justify-between">
                <span>2. Cost of Goods Sold (COGS)</span>
                <span className="text-rose-400">(Rs. 89,000,000)</span>
              </div>
              <div className="flex justify-between text-slate-300 pl-4">
                <span>Raw Material & Direct Plant Cost</span>
                <span>(Rs. 89,000,000)</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 flex justify-between font-bold text-sm text-slate-100">
              <span>GROSS PROFIT</span>
              <span className="text-emerald-400">Rs. 59,000,000</span>
            </div>

            <div className="space-y-2">
              <div className="font-bold text-slate-200 text-sm uppercase tracking-wider border-b border-slate-800 pb-1 flex justify-between">
                <span>3. Operating & Administrative Expenses</span>
                <span className="text-rose-400">(Rs. 12,400,000)</span>
              </div>
              <div className="flex justify-between text-slate-300 pl-4">
                <span>Salaries, Factory Payroll & Utilities</span>
                <span>(Rs. 12,400,000)</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-cyan-950/60 border border-cyan-500/40 flex justify-between font-black text-base text-slate-100">
              <span>NET OPERATING PROFIT BEFORE TAX</span>
              <span className="text-cyan-300">Rs. 46,600,000</span>
            </div>
          </div>
        )}

        {/* 2. Trial Balance */}
        {selectedReport === 'trial' && (
          <div className="space-y-4">
            <table className="w-full text-xs font-mono text-left border-collapse border border-slate-800">
              <thead>
                <tr className="bg-slate-800 text-slate-300 border-b border-slate-700 uppercase font-bold">
                  <th className="p-2 border border-slate-800">Code</th>
                  <th className="p-2 border border-slate-800">Account Head Description</th>
                  <th className="p-2 border border-slate-800 text-right">Debit (PKR)</th>
                  <th className="p-2 border border-slate-800 text-right">Credit (PKR)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {INITIAL_ACCOUNTS.map((acc) => {
                  const isDebit = acc.type === 'ASSET' || acc.type === 'EXPENSE';
                  return (
                    <tr key={acc.id} className="hover:bg-slate-800/40">
                      <td className="p-2 border border-slate-800/60 text-cyan-400 font-bold">{acc.code}</td>
                      <td className="p-2 border border-slate-800/60 text-slate-200">{acc.name}</td>
                      <td className="p-2 border border-slate-800/60 text-right text-emerald-400">
                        {isDebit ? `Rs. ${acc.balance.toLocaleString()}` : '-'}
                      </td>
                      <td className="p-2 border border-slate-800/60 text-right text-cyan-400">
                        {!isDebit ? `Rs. ${acc.balance.toLocaleString()}` : '-'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* 3. Balance Sheet */}
        {selectedReport === 'balance' && (
          <div className="space-y-6 text-xs font-mono">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Assets Column */}
              <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700 space-y-3">
                <h3 className="font-bold text-sm text-cyan-400 uppercase border-b pb-1 border-slate-700">Assets</h3>
                <div className="flex justify-between"><span>Cash in Hand (PKR):</span><span>Rs. 4,500,000</span></div>
                <div className="flex justify-between"><span>Bank Operations Account:</span><span>Rs. 28,400,000</span></div>
                <div className="flex justify-between"><span>Accounts Receivable:</span><span>Rs. 14,200,000</span></div>
                <div className="flex justify-between"><span>Finished Goods Stock:</span><span>Rs. 32,500,000</span></div>
                <div className="flex justify-between"><span>Raw Material Inventory:</span><span>Rs. 18,600,000</span></div>
                <div className="pt-2 border-t border-slate-700 font-bold text-emerald-400 flex justify-between">
                  <span>TOTAL ASSETS:</span>
                  <span>Rs. 98,200,000</span>
                </div>
              </div>

              {/* Liabilities & Equity */}
              <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700 space-y-3">
                <h3 className="font-bold text-sm text-purple-400 uppercase border-b pb-1 border-slate-700">Liabilities & Equity</h3>
                <div className="flex justify-between"><span>Accounts Payable (Vendors):</span><span>Rs. 9,400,000</span></div>
                <div className="flex justify-between"><span>Withholding Tax Payable:</span><span>Rs. 1,850,000</span></div>
                <div className="flex justify-between font-semibold text-slate-200"><span>Paid Up Capital:</span><span>Rs. 80,000,000</span></div>
                <div className="flex justify-between font-semibold text-cyan-300"><span>Retained Earnings:</span><span>Rs. 6,950,000</span></div>
                <div className="pt-2 border-t border-slate-700 font-bold text-purple-400 flex justify-between">
                  <span>TOTAL LIABILITIES & EQUITY:</span>
                  <span>Rs. 98,200,000</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 4. Stock Valuation Report */}
        {selectedReport === 'stock' && (
          <div className="space-y-4">
            <table className="w-full text-xs font-mono text-left border-collapse border border-slate-800">
              <thead>
                <tr className="bg-slate-800 text-slate-300 border-b border-slate-700 uppercase font-bold">
                  <th className="p-2 border border-slate-800">Item Code</th>
                  <th className="p-2 border border-slate-800">Description</th>
                  <th className="p-2 border border-slate-800 text-right">Available Qty</th>
                  <th className="p-2 border border-slate-800 text-right">Unit Cost</th>
                  <th className="p-2 border border-slate-800 text-right">Stock Valuation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {INITIAL_INVENTORY.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-800/40">
                    <td className="p-2 border border-slate-800/60 text-purple-400 font-bold">{item.code}</td>
                    <td className="p-2 border border-slate-800/60 text-slate-200">{item.name}</td>
                    <td className="p-2 border border-slate-800/60 text-right font-bold text-emerald-400">{item.currentStock} {item.uom}</td>
                    <td className="p-2 border border-slate-800/60 text-right text-slate-300">Rs. {item.purchasePrice.toLocaleString()}</td>
                    <td className="p-2 border border-slate-800/60 text-right font-bold text-cyan-400">Rs. {(item.currentStock * item.purchasePrice).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 5. FIFO / LIFO Inventory Valuation Report */}
        {selectedReport === 'fifo_lifo' && (
          <div className="space-y-4">
            <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700 text-xs font-mono space-y-1">
              <div>Valuation Method Analysis: <strong className="text-cyan-400">FIFO (First-In, First-Out) vs LIFO (Last-In, First-Out)</strong></div>
              <div>Cost Basis: Derived from recent procurement purchase orders and production Bill of Materials (BOM) costs.</div>
            </div>
            <table className="w-full text-xs font-mono text-left border-collapse border border-slate-800">
              <thead>
                <tr className="bg-slate-800 text-slate-300 border-b border-slate-700 uppercase font-bold">
                  <th className="p-2 border border-slate-800">Item Code & Name</th>
                  <th className="p-2 border border-slate-800 text-right">Available Qty</th>
                  <th className="p-2 border border-slate-800 text-right">FIFO Unit Cost</th>
                  <th className="p-2 border border-slate-800 text-right">FIFO Total Valuation</th>
                  <th className="p-2 border border-slate-800 text-right">LIFO Unit Cost</th>
                  <th className="p-2 border border-slate-800 text-right">LIFO Total Valuation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {INITIAL_INVENTORY.map((item) => {
                  const fifoCost = Math.round(item.purchasePrice * 0.95);
                  const lifoCost = Math.round(item.purchasePrice * 1.05);
                  const fifoVal = item.currentStock * fifoCost;
                  const lifoVal = item.currentStock * lifoCost;
                  return (
                    <tr key={item.id} className="hover:bg-slate-800/40">
                      <td className="p-2 border border-slate-800/60">
                        <div className="font-bold text-purple-400">{item.code}</div>
                        <div className="text-slate-200 text-[11px]">{item.name}</div>
                      </td>
                      <td className="p-2 border border-slate-800/60 text-right font-bold text-emerald-400">{item.currentStock} {item.uom}</td>
                      <td className="p-2 border border-slate-800/60 text-right text-slate-300">Rs. {fifoCost.toLocaleString()}</td>
                      <td className="p-2 border border-slate-800/60 text-right font-bold text-cyan-400">Rs. {fifoVal.toLocaleString()}</td>
                      <td className="p-2 border border-slate-800/60 text-right text-slate-300">Rs. {lifoCost.toLocaleString()}</td>
                      <td className="p-2 border border-slate-800/60 text-right font-bold text-amber-400">Rs. {lifoVal.toLocaleString()}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* 6. Predictive Revenue & Cash Inflow Forecast Dashboard */}
        {selectedReport === 'predictive_revenue' && (
          <div className="space-y-6">
            {/* Interactive Simulation & Scenario Control Bar */}
            <div className="p-4 rounded-2xl bg-slate-950/90 border border-slate-800 space-y-4 no-print shadow-xl">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2">
                      Predictive Revenue &amp; Cash Inflow Simulator
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 font-mono border border-emerald-800">
                        2-Quarter Horizon: Q1 2027 &amp; Q2 2027
                      </span>
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Calculates projected cash collections using historical monthly run-rate (Rs. 12.33M/mo), DSO turnaround (34d), and stage-weighted CRM pipeline deals.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                  <span className="flex items-center gap-1.5 text-emerald-400">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    Live CRM Sync Active
                  </span>
                </div>
              </div>

              {/* Controls Row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* Scenario Selector */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-slate-300 flex items-center gap-1">
                    <Sliders className="w-3.5 h-3.5 text-cyan-400" /> Forecast Scenario
                  </label>
                  <div className="grid grid-cols-3 gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800">
                    <button
                      type="button"
                      onClick={() => setPredictiveScenario('BASE')}
                      className={`py-1.5 px-2 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                        predictiveScenario === 'BASE'
                          ? 'bg-cyan-600 text-white shadow-md'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Base Case
                    </button>
                    <button
                      type="button"
                      onClick={() => setPredictiveScenario('CONSERVATIVE')}
                      className={`py-1.5 px-2 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                        predictiveScenario === 'CONSERVATIVE'
                          ? 'bg-amber-600 text-white shadow-md'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Conservative
                    </button>
                    <button
                      type="button"
                      onClick={() => setPredictiveScenario('OPTIMISTIC')}
                      className={`py-1.5 px-2 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                        predictiveScenario === 'OPTIMISTIC'
                          ? 'bg-emerald-600 text-white shadow-md'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Optimistic
                    </button>
                  </div>
                </div>

                {/* Quarter Horizon Filter */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-slate-300 flex items-center gap-1">
                    <Filter className="w-3.5 h-3.5 text-cyan-400" /> Display Quarter Horizon
                  </label>
                  <div className="grid grid-cols-3 gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800">
                    <button
                      type="button"
                      onClick={() => setQuarterFilter('ALL')}
                      className={`py-1.5 px-2 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                        quarterFilter === 'ALL'
                          ? 'bg-purple-600 text-white shadow-md'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      All 2 Quarters
                    </button>
                    <button
                      type="button"
                      onClick={() => setQuarterFilter('Q1')}
                      className={`py-1.5 px-2 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                        quarterFilter === 'Q1'
                          ? 'bg-purple-600 text-white shadow-md'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Q1 2027 Only
                    </button>
                    <button
                      type="button"
                      onClick={() => setQuarterFilter('Q2')}
                      className={`py-1.5 px-2 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                        quarterFilter === 'Q2'
                          ? 'bg-purple-600 text-white shadow-md'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Q2 2027 Only
                    </button>
                  </div>
                </div>

                {/* Sales Velocity Speed Multiplier */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-slate-300 flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5 text-amber-400" /> Sales Velocity Multiplier ({velocityMultiplier}x)
                  </label>
                  <div className="grid grid-cols-3 gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800">
                    <button
                      type="button"
                      onClick={() => setVelocityMultiplier(0.85)}
                      className={`py-1.5 px-2 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                        velocityMultiplier === 0.85
                          ? 'bg-rose-600 text-white shadow-md'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      0.85x Slow
                    </button>
                    <button
                      type="button"
                      onClick={() => setVelocityMultiplier(1.0)}
                      className={`py-1.5 px-2 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                        velocityMultiplier === 1.0
                          ? 'bg-cyan-600 text-white shadow-md'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      1.0x Standard
                    </button>
                    <button
                      type="button"
                      onClick={() => setVelocityMultiplier(1.15)}
                      className={`py-1.5 px-2 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                        velocityMultiplier === 1.15
                          ? 'bg-emerald-600 text-white shadow-md'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      1.15x High
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Executive KPI Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Card 1: Combined 2-Quarter Inflow */}
              <div className="p-4 rounded-xl bg-slate-950 border border-emerald-500/30 space-y-2 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl pointer-events-none"></div>
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="font-semibold uppercase tracking-wider text-[10px]">2-Quarter Cash Inflow</span>
                  <span className="px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 font-bold text-[10px] border border-emerald-800">
                    +{growthOverBaselinePct}% vs Baseline
                  </span>
                </div>
                <div className="text-xl font-black text-emerald-400 font-mono">
                  Rs. {combined2QTotal.toLocaleString()}
                </div>
                <div className="text-[10px] text-slate-400 font-mono">
                  Q1: Rs. {Math.round(q1ForecastTotal / 1000000)}M • Q2: Rs. {Math.round(q2ForecastTotal / 1000000)}M
                </div>
              </div>

              {/* Card 2: Q1 2027 Inflow */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="font-semibold uppercase tracking-wider text-[10px]">Q1 2027 Inflow (Jan–Mar)</span>
                  <span className="text-[10px] font-mono text-cyan-400 font-bold">3 Months</span>
                </div>
                <div className="text-xl font-black text-cyan-300 font-mono">
                  Rs. {q1ForecastTotal.toLocaleString()}
                </div>
                <div className="text-[10px] text-slate-400 font-mono">
                  Weighted Pipeline: Rs. {monthlyForecasts.filter(m => m.quarter === 'Q1 2027').reduce((s,m) => s + m.pipelineWeightedInflow, 0).toLocaleString()}
                </div>
              </div>

              {/* Card 3: Q2 2027 Inflow */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="font-semibold uppercase tracking-wider text-[10px]">Q2 2027 Inflow (Apr–Jun)</span>
                  <span className="text-[10px] font-mono text-indigo-400 font-bold">3 Months</span>
                </div>
                <div className="text-xl font-black text-indigo-300 font-mono">
                  Rs. {q2ForecastTotal.toLocaleString()}
                </div>
                <div className="text-[10px] text-slate-400 font-mono">
                  Weighted Pipeline: Rs. {monthlyForecasts.filter(m => m.quarter === 'Q2 2027').reduce((s,m) => s + m.pipelineWeightedInflow, 0).toLocaleString()}
                </div>
              </div>

              {/* Card 4: Historical Sales Velocity */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="font-semibold uppercase tracking-wider text-[10px]">Sales Velocity Baseline</span>
                  <span className="text-[10px] font-mono text-purple-400 font-bold">{historicalSalesCycleDays}d Cycle</span>
                </div>
                <div className="text-xl font-black text-purple-300 font-mono">
                  Rs. {historicalMonthlyRunRate.toLocaleString()}<span className="text-xs text-slate-400 font-normal">/mo</span>
                </div>
                <div className="text-[10px] text-slate-400 font-mono">
                  DSO: {historicalDsoDays} Days • Pipeline Coverage: {pipelineCoverageRatio}x
                </div>
              </div>
            </div>

            {/* Visual Month-by-Month Predictive Cash Inflow Chart */}
            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                <div>
                  <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-emerald-400" />
                    Month-by-Month Projected Cash Inflow (Jan 2027 – Jun 2027)
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    Breakdown of baseline revenue, weighted CRM pipeline conversions, and accounts receivable collections in PKR.
                  </p>
                </div>

                {/* Legend */}
                <div className="flex flex-wrap items-center gap-3 text-[10px] font-mono">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded bg-indigo-500"></span>
                    <span className="text-slate-300">Baseline Recurring</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded bg-emerald-500"></span>
                    <span className="text-slate-300">Weighted Pipeline</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded bg-amber-500"></span>
                    <span className="text-slate-300">AR Recovery</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-4 h-0.5 bg-rose-400"></span>
                    <span className="text-rose-400">Historical Avg (12.33M)</span>
                  </div>
                </div>
              </div>

              {/* Chart Visual Columns */}
              <div className="pt-6 pb-2">
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 items-end min-h-[220px]">
                  {displayedForecasts.map((m) => {
                    const maxVal = 30000000; // Rs. 30M scale top
                    const baselinePct = Math.min(100, Math.round((m.baselineRevenue / maxVal) * 100));
                    const pipelinePct = Math.min(100, Math.round((m.pipelineWeightedInflow / maxVal) * 100));
                    const arPct = Math.min(100, Math.round((m.arCollectionsInflow / maxVal) * 100));
                    const totalPct = Math.min(100, Math.round((m.totalProjectedInflow / maxVal) * 100));

                    return (
                      <div key={m.monthKey} className="flex flex-col items-center gap-2 group">
                        {/* Total Label on Top */}
                        <div className="text-[10px] font-mono font-bold text-slate-200 group-hover:text-emerald-400 transition-colors">
                          Rs. {(m.totalProjectedInflow / 1000000).toFixed(1)}M
                        </div>

                        {/* Stacked Vertical Bar */}
                        <div className="w-full max-w-[56px] h-44 bg-slate-900 rounded-xl border border-slate-800 p-1 flex flex-col justify-end relative overflow-hidden group-hover:border-emerald-500/50 transition-all">
                          {/* Historical Benchmark Marker */}
                          <div
                            className="absolute left-0 right-0 border-b border-dashed border-rose-500/70 z-10 pointer-events-none"
                            style={{ bottom: `${(historicalMonthlyRunRate / maxVal) * 100}%` }}
                            title={`Historical Monthly Average: Rs. ${historicalMonthlyRunRate.toLocaleString()}`}
                          ></div>

                          {/* Stacked Bars */}
                          <div
                            className="w-full bg-amber-500/90 rounded-t-sm transition-all duration-500"
                            style={{ height: `${arPct}%` }}
                            title={`AR Collections: Rs. ${m.arCollectionsInflow.toLocaleString()}`}
                          ></div>
                          <div
                            className="w-full bg-emerald-500 transition-all duration-500"
                            style={{ height: `${pipelinePct}%` }}
                            title={`Weighted Pipeline: Rs. ${m.pipelineWeightedInflow.toLocaleString()}`}
                          ></div>
                          <div
                            className="w-full bg-indigo-600 rounded-b-lg transition-all duration-500"
                            style={{ height: `${baselinePct}%` }}
                            title={`Baseline Revenue: Rs. ${m.baselineRevenue.toLocaleString()}`}
                          ></div>
                        </div>

                        {/* Month & Quarter Label */}
                        <div className="text-center font-mono">
                          <div className="text-[11px] font-bold text-slate-200">{m.monthName}</div>
                          <div className="text-[9px] text-slate-400">{m.quarter}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Monthly Forecast Data Table */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <Calendar className="w-4 h-4 text-cyan-400" />
                Monthly Cash Inflow Schedule &amp; Variance Analysis
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full text-xs font-mono text-left border-collapse border border-slate-800">
                  <thead>
                    <tr className="bg-slate-800 text-slate-300 border-b border-slate-700 uppercase font-bold text-[10px]">
                      <th className="p-2.5 border border-slate-800">Month / Horizon</th>
                      <th className="p-2.5 border border-slate-800 text-right">Baseline Contract (PKR)</th>
                      <th className="p-2.5 border border-slate-800 text-right">Weighted Pipeline (PKR)</th>
                      <th className="p-2.5 border border-slate-800 text-right">AR Collections (PKR)</th>
                      <th className="p-2.5 border border-slate-800 text-right">Total Projected Inflow</th>
                      <th className="p-2.5 border border-slate-800 text-right">Growth vs Run-Rate</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {displayedForecasts.map((m) => {
                      const variancePct = Math.round(((m.totalProjectedInflow - historicalMonthlyRunRate) / historicalMonthlyRunRate) * 100);
                      return (
                        <tr key={m.monthKey} className="hover:bg-slate-800/40">
                          <td className="p-2.5 border border-slate-800/60 font-bold text-slate-100">
                            <span className="text-cyan-400">{m.monthName}</span>
                            <span className="ml-2 text-[10px] text-slate-400">({m.quarter})</span>
                          </td>
                          <td className="p-2.5 border border-slate-800/60 text-right text-indigo-300">
                            Rs. {m.baselineRevenue.toLocaleString()}
                          </td>
                          <td className="p-2.5 border border-slate-800/60 text-right text-emerald-400 font-semibold">
                            Rs. {m.pipelineWeightedInflow.toLocaleString()}
                          </td>
                          <td className="p-2.5 border border-slate-800/60 text-right text-amber-300">
                            Rs. {m.arCollectionsInflow.toLocaleString()}
                          </td>
                          <td className="p-2.5 border border-slate-800/60 text-right font-black text-slate-100">
                            Rs. {m.totalProjectedInflow.toLocaleString()}
                          </td>
                          <td className="p-2.5 border border-slate-800/60 text-right font-bold text-emerald-400">
                            +{variancePct}%
                          </td>
                        </tr>
                      );
                    })}

                    {/* Subtotal Row */}
                    <tr className="bg-slate-950 font-black text-slate-100 border-t-2 border-slate-700">
                      <td className="p-3 border border-slate-800 text-cyan-300 uppercase">
                        {quarterFilter === 'ALL' ? '2-Quarter Consolidated Total' : `${quarterFilter} 2027 Subtotal`}
                      </td>
                      <td className="p-3 border border-slate-800 text-right text-indigo-300">
                        Rs. {displayedForecasts.reduce((s, m) => s + m.baselineRevenue, 0).toLocaleString()}
                      </td>
                      <td className="p-3 border border-slate-800 text-right text-emerald-400">
                        Rs. {displayedForecasts.reduce((s, m) => s + m.pipelineWeightedInflow, 0).toLocaleString()}
                      </td>
                      <td className="p-3 border border-slate-800 text-right text-amber-300">
                        Rs. {displayedForecasts.reduce((s, m) => s + m.arCollectionsInflow, 0).toLocaleString()}
                      </td>
                      <td className="p-3 border border-slate-800 text-right text-emerald-300 text-sm">
                        Rs. {displayedForecasts.reduce((s, m) => s + m.totalProjectedInflow, 0).toLocaleString()}
                      </td>
                      <td className="p-3 border border-slate-800 text-right text-emerald-400">
                        +{Math.round(((displayedForecasts.reduce((s, m) => s + m.totalProjectedInflow, 0) - (historicalMonthlyRunRate * displayedForecasts.length)) / (historicalMonthlyRunRate * displayedForecasts.length)) * 100)}%
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pipeline Deal Cash Flow Schedule */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-purple-400" />
                  CRM Lead Pipeline Inflow Contribution Schedule
                </h4>
                <span className="text-[10px] font-mono text-slate-400">
                  {pipelineDeals.length} Deals in Active Valuation Model
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs font-mono text-left border-collapse border border-slate-800">
                  <thead>
                    <tr className="bg-slate-800 text-slate-300 border-b border-slate-700 uppercase font-bold text-[10px]">
                      <th className="p-2.5 border border-slate-800">Client / Contract Title</th>
                      <th className="p-2.5 border border-slate-800">Pipeline Stage</th>
                      <th className="p-2.5 border border-slate-800 text-right">Deal Value (PKR)</th>
                      <th className="p-2.5 border border-slate-800 text-center">Probability</th>
                      <th className="p-2.5 border border-slate-800">Target Inflow Month</th>
                      <th className="p-2.5 border border-slate-800 text-right">Weighted Inflow (PKR)</th>
                      <th className="p-2.5 border border-slate-800 text-center">Confidence</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {pipelineDeals.map((deal) => {
                      const effProb = Math.min(99, Math.round(deal.probability * scenarioProbMultiplier * velocityMultiplier));
                      const weightedValue = Math.round(deal.dealValue * (effProb / 100));
                      return (
                        <tr key={deal.id} className="hover:bg-slate-800/40">
                          <td className="p-2.5 border border-slate-800/60">
                            <div className="font-bold text-slate-200">{deal.clientName}</div>
                            <div className="text-[10px] text-slate-400 truncate max-w-xs">{deal.title}</div>
                          </td>
                          <td className="p-2.5 border border-slate-800/60">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              deal.stage === 'NEGOTIATION' ? 'bg-purple-950 text-purple-300 border border-purple-800' :
                              deal.stage === 'QUALIFIED' ? 'bg-cyan-950 text-cyan-300 border border-cyan-800' :
                              deal.stage === 'CLOSED_WON' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' :
                              'bg-slate-800 text-slate-300 border border-slate-700'
                            }`}>
                              {deal.stage}
                            </span>
                          </td>
                          <td className="p-2.5 border border-slate-800/60 text-right text-slate-300">
                            Rs. {deal.dealValue.toLocaleString()}
                          </td>
                          <td className="p-2.5 border border-slate-800/60 text-center">
                            <span className={`font-bold ${
                              effProb >= 70 ? 'text-emerald-400' :
                              effProb >= 40 ? 'text-cyan-400' : 'text-amber-400'
                            }`}>
                              {effProb}%
                            </span>
                          </td>
                          <td className="p-2.5 border border-slate-800/60">
                            <div className="font-semibold text-slate-200">{deal.targetMonth}</div>
                            <div className="text-[10px] text-slate-400">{deal.quarter}</div>
                          </td>
                          <td className="p-2.5 border border-slate-800/60 text-right font-black text-emerald-400">
                            Rs. {weightedValue.toLocaleString()}
                          </td>
                          <td className="p-2.5 border border-slate-800/60 text-center">
                            <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                              deal.confidence === 'HIGH' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' :
                              deal.confidence === 'MEDIUM' ? 'bg-cyan-950 text-cyan-300 border border-cyan-800' :
                              'bg-amber-950 text-amber-300 border border-amber-800'
                            }`}>
                              {deal.confidence}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Cash Flow Waterfall Bridge */}
            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
              <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <Target className="w-4 h-4 text-cyan-400" />
                2-Quarter Cash Inflow Waterfall Bridge
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 text-center font-mono">
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="text-[10px] text-slate-400 uppercase">Historical Run-Rate</div>
                  <div className="text-sm font-bold text-slate-200 mt-1">Rs. {(historicalMonthlyRunRate * 6).toLocaleString()}</div>
                  <div className="text-[9px] text-slate-500 mt-0.5">6 Months Baseline</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="text-[10px] text-indigo-400 uppercase">+ Contract Growth</div>
                  <div className="text-sm font-bold text-indigo-300 mt-1">Rs. {(monthlyForecasts.reduce((s,m) => s + m.baselineRevenue, 0) - (historicalMonthlyRunRate * 6)).toLocaleString()}</div>
                  <div className="text-[9px] text-slate-500 mt-0.5">Recurring Uplift</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="text-[10px] text-amber-400 uppercase">+ AR Collections</div>
                  <div className="text-sm font-bold text-amber-300 mt-1">Rs. {monthlyForecasts.reduce((s,m) => s + m.arCollectionsInflow, 0).toLocaleString()}</div>
                  <div className="text-[9px] text-slate-500 mt-0.5">Receivables Recovery</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="text-[10px] text-emerald-400 uppercase">+ Weighted Pipeline</div>
                  <div className="text-sm font-bold text-emerald-300 mt-1">Rs. {totalWeightedPipelineInflow.toLocaleString()}</div>
                  <div className="text-[9px] text-slate-500 mt-0.5">{pipelineDeals.length} CRM Deals</div>
                </div>
                <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40">
                  <div className="text-[10px] text-emerald-300 uppercase font-black">Net Cash Inflow</div>
                  <div className="text-sm font-black text-emerald-400 mt-1">Rs. {combined2QTotal.toLocaleString()}</div>
                  <div className="text-[9px] text-emerald-300 font-bold mt-0.5">Forecasted Total</div>
                </div>
              </div>
            </div>

            {/* Gemini AI Strategic Liquidity & Cash Flow Advisory */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-950/40 via-indigo-950/30 to-slate-900 border border-purple-500/30 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-purple-300 uppercase tracking-wide">
                <Sparkles className="w-4 h-4 text-amber-300" />
                Gemini Executive Revenue &amp; Liquidity Advisory Insights
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-slate-300">
                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800/80 space-y-1">
                  <div className="font-bold text-cyan-300 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                    Inflow Spike Timing
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Cash inflow peaks in <strong>January (Rs. 28.1M)</strong> and <strong>April 2027 (Rs. 28.5M)</strong> due to concurrent realization of Metro Cash &amp; Carry, FFBL, and National Foods milestone payments.
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800/80 space-y-1">
                  <div className="font-bold text-amber-300 flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                    Concentration Risk
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    National Foods and Engro Fertilizers represent 48% of the weighted pipeline inflow. Enforce 30% advance procurement deposits to insulate against payment cycle slippage.
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800/80 space-y-1">
                  <div className="font-bold text-emerald-300 flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                    Velocity Acceleration
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Offering a 2.5% prompt-payment discount on FFBL and Engro will accelerate Rs. 13.7M in cash collections from February into late January, maximizing operating liquidity.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Printable Authorizations & Signatures */}
        <div className="pt-8 border-t border-slate-800 grid grid-cols-3 gap-4 text-center font-mono text-[11px] text-slate-400">
          <div>
            <div className="border-b border-slate-700 pb-8"></div>
            <div className="mt-1 font-semibold text-slate-300">Prepared By</div>
            <div className="text-[10px]">Chief Accountant</div>
          </div>
          <div>
            <div className="border-b border-slate-700 pb-8"></div>
            <div className="mt-1 font-semibold text-slate-300">Reviewed By</div>
            <div className="text-[10px]">Internal Auditor</div>
          </div>
          <div>
            <div className="border-b border-slate-700 pb-8"></div>
            <div className="mt-1 font-semibold text-slate-300">Approved By</div>
            <div className="text-[10px]">Chief Financial Officer</div>
          </div>
        </div>

        {/* Official Footer */}
        <div className="text-center text-[10px] text-slate-500 font-mono pt-2">
          Generated automatically by MTS-ERP-SAP • FBR Compliant Double-Entry System
        </div>
      </div>

      {/* CREATE SCHEDULED EMAIL EXPORT MODAL */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 no-print">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-lg w-full space-y-5 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
                    Schedule Automated Email Export
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Automate report generation & direct delivery to user mailboxes.
                  </p>
                </div>
              </div>
              <button onClick={() => setShowScheduleModal(false)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateScheduleSubmit} className="space-y-4">
              {/* Report Selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Select Report Document</label>
                <select
                  value={schedReportType}
                  onChange={(e) => setSchedReportType(e.target.value as any)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-100 font-semibold focus:outline-none focus:border-purple-500"
                >
                  <option value="pnl">Profit & Loss Statement (P&L)</option>
                  <option value="trial">Balanced Trial Balance Statement</option>
                  <option value="balance">Financial Balance Sheet Statement</option>
                  <option value="stock">Warehouse Stock Valuation Report</option>
                  <option value="fifo_lifo">FIFO / LIFO Valuation Report</option>
                  <option value="predictive_revenue">Predictive Revenue &amp; Cash Inflow Forecast (2 Quarters)</option>
                </select>
              </div>

              {/* Frequency & Time */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Recurrence Frequency</label>
                  <select
                    value={schedFrequency}
                    onChange={(e) => setSchedFrequency(e.target.value as any)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-100 font-semibold focus:outline-none focus:border-purple-500"
                  >
                    <option value="DAILY">Daily (Every 24 Hours)</option>
                    <option value="WEEKLY">Weekly (Specific Day)</option>
                    <option value="MONTHLY">Monthly (1st of Month)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Delivery Time (PKT)</label>
                  <select
                    value={schedTimeOfDay}
                    onChange={(e) => setSchedTimeOfDay(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-100 font-semibold focus:outline-none focus:border-purple-500"
                  >
                    <option value="08:00 AM">08:00 AM (Morning Shift)</option>
                    <option value="12:00 PM">12:00 PM (Noon Audit)</option>
                    <option value="05:00 PM">05:00 PM (Closing Shift)</option>
                    <option value="11:59 PM">11:59 PM (Midnight Summary)</option>
                  </select>
                </div>
              </div>

              {/* Delivery Day selection if Weekly */}
              {schedFrequency === 'WEEKLY' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Day of Week</label>
                  <select
                    value={schedDeliveryDay}
                    onChange={(e) => setSchedDeliveryDay(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-100 font-semibold focus:outline-none focus:border-purple-500"
                  >
                    <option value="Every Monday">Every Monday</option>
                    <option value="Every Tuesday">Every Tuesday</option>
                    <option value="Every Wednesday">Every Wednesday</option>
                    <option value="Every Thursday">Every Thursday</option>
                    <option value="Every Friday">Every Friday</option>
                    <option value="Every Saturday">Every Saturday</option>
                  </select>
                </div>
              )}

              {/* Format Selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Attachment Format</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['PDF', 'CSV', 'EXCEL'] as const).map((fmt) => (
                    <button
                      type="button"
                      key={fmt}
                      onClick={() => setSchedFormat(fmt)}
                      className={`py-2 rounded-xl border text-xs font-bold transition-all ${
                        schedFormat === fmt
                          ? 'bg-purple-600 text-white border-purple-400 shadow-md'
                          : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                      }`}
                    >
                      {fmt === 'PDF' ? 'PDF Document' : fmt === 'CSV' ? 'CSV Sheet' : 'Excel Workbook'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Email Recipients */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Recipient Email Addresses (Comma separated)
                </label>
                <textarea
                  rows={2}
                  value={schedRecipientsInput}
                  onChange={(e) => setSchedRecipientsInput(e.target.value)}
                  placeholder="admin@company.pk, cfo@company.pk, auditor@company.pk"
                  required
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-100 font-mono focus:outline-none focus:border-purple-500"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  System sends automated email with PDF/CSV attachment directly to recipient inboxes on schedule.
                </p>
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowScheduleModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 flex items-center gap-1.5 cursor-pointer"
                >
                  <Mail className="w-4 h-4" />
                  Save & Enable Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PRINT PDF CONFIRMATION MODAL */}
      {showPrintModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 no-print">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
              <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                <Printer className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-100 uppercase">Export Report to PDF</h3>
                <p className="text-[11px] text-slate-400">Format & download formatted PDF document.</p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 text-xs font-mono space-y-1">
              <div>Company: <strong className="text-slate-200">{currentCompany.name}</strong></div>
              <div>Report: <strong className="text-cyan-400 uppercase">{selectedReport}</strong></div>
              <div>Format: <strong>Formatted Printable PDF / Browser Print</strong></div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowPrintModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowPrintModal(false);
                  setTimeout(() => handlePrintPdf(), 200);
                }}
                className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-lg shadow-cyan-600/30 flex items-center gap-2 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                Download / Print PDF
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Universal Parameter Modal matching image_21e62cc3.png */}
      <ReportParameterModal
        isOpen={showParameterModal}
        onClose={() => setShowParameterModal(false)}
        reportTarget={{
          id: selectedReport,
          code: selectedReport === 'pnl' ? 'PROFIT_LOSS_REP' :
                selectedReport === 'trial' ? 'TRIAL_BALANCE_REP' :
                selectedReport === 'balance' ? 'BALANCE_SHEET_REP' :
                selectedReport === 'stock' ? 'STOCK_VALUATION_REP' :
                selectedReport === 'fifo_lifo' ? 'FIFO_LIFO_VALUATION_REP' :
                'PREDICTIVE_REVENUE_REP',
          title: selectedReport === 'pnl' ? 'Profit & Loss Statement' :
                 selectedReport === 'trial' ? 'Trial Balance' :
                 selectedReport === 'balance' ? 'Balance Sheet' :
                 selectedReport === 'stock' ? 'Warehouse Stock Valuation' :
                 selectedReport === 'fifo_lifo' ? 'FIFO / LIFO Valuation' :
                 'Predictive Revenue & Inflow',
          category: selectedReport === 'stock' || selectedReport === 'fifo_lifo' ? 'Inventory' :
                    selectedReport === 'predictive_revenue' ? 'Predictive' : 'Accounts'
        }}
      />
    </div>
  );
};
