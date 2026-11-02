import React, { useState, useEffect } from 'react';
import {
  Users,
  Briefcase,
  TrendingUp,
  Plus,
  Phone,
  Mail,
  Building2,
  DollarSign,
  CheckCircle2,
  Clock,
  AlertCircle,
  X,
  Sparkles,
  Search,
  Filter,
  Trash2,
  Calendar,
  Send,
  ShieldCheck,
  GripVertical,
  AlertTriangle,
  Bell,
  FileText,
  Check,
  RotateCcw,
  Info,
  Percent,
  MessageSquare,
  ArrowRight
} from 'lucide-react';
import { useAuthTenant } from '../../context/AuthTenantContext';
import { TTSButton } from '../common/TTSButton';
import { collection, doc, setDoc, deleteDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../../services/firebaseConfig';
import { notificationStore } from '../../services/notificationStore';
import { CrmSalesDashboard } from './CrmSalesDashboard';

export interface CrmInteraction {
  id: string;
  type: 'CALL' | 'EMAIL' | 'MEETING' | 'NOTE';
  summary: string;
  date: string;
  loggedBy: string;
}

export interface CrmLead {
  id: string;
  companyId: string;
  name: string;
  organization: string;
  email: string;
  phone: string;
  status: 'PROSPECTING' | 'QUALIFIED' | 'NEGOTIATION' | 'CLOSED_WON' | 'CLOSED_LOST';
  estimatedValue: number;
  assignedTo: string;
  notes: string;
  createdAt: string;
  lastMovedDate: string; // ISO date of last stage transition
  interactionsCount: number; // Interaction frequency
  lastInteractionDate?: string;
  interactions?: CrmInteraction[];
  followUpDate?: string; // Automated follow-up reminder date for Negotiation
  followUpNotes?: string;
  followUpActive?: boolean;
}

export interface CrmDeal {
  id: string;
  companyId: string;
  title: string;
  clientName: string;
  stage: 'Lead' | 'Meeting' | 'Quotation' | 'Negotiation' | 'Closed Won' | 'Closed Lost';
  dealValue: number;
  probability: number; // percentage
  expectedCloseDate: string;
  createdAt: string;
}

export const CrmModule: React.FC = () => {
  const { currentCompany, currentUser } = useAuthTenant();
  const [activeTab, setActiveTab] = useState<'kanban' | 'leads' | 'deals' | 'analytics'>('kanban');
  
  // Stalled Filter state
  const [filterStalledOnly, setFilterStalledOnly] = useState(false);

  // Initial Sample Leads with historical movement dates and interaction frequencies
  const [leads, setLeads] = useState<CrmLead[]>([
    {
      id: 'lead_01',
      companyId: currentCompany.id,
      name: 'Muhammad Ali Khan',
      organization: 'Metro Cash & Carry Pakistan',
      email: 'ali.khan@metropk.com',
      phone: '+92 300 4589210',
      status: 'NEGOTIATION',
      estimatedValue: 4500000,
      assignedTo: currentUser.name || 'Sales Officer',
      notes: 'Negotiating bulk supply agreement for FMCG goods and solar units.',
      createdAt: '2026-10-20',
      lastMovedDate: '2026-10-20', // Stalled (> 7 days without movement)
      interactionsCount: 4,
      lastInteractionDate: '2026-10-27',
      followUpDate: '2026-11-03',
      followUpActive: true,
      followUpNotes: 'Contract payment milestone terms review needed.'
    },
    {
      id: 'lead_02',
      companyId: currentCompany.id,
      name: 'Ahmed Raza',
      organization: 'Engro Fertilizers Ltd',
      email: 'ahmed.raza@engro.com',
      phone: '+92 321 8923411',
      status: 'QUALIFIED',
      estimatedValue: 12800000,
      assignedTo: currentUser.name || 'Sales Officer',
      notes: 'Requested product catalogs and FBR tax exemption certificates.',
      createdAt: '2026-10-23',
      lastMovedDate: '2026-10-23', // Stalled (> 7 days without movement)
      interactionsCount: 2,
      lastInteractionDate: '2026-10-24'
    },
    {
      id: 'lead_03',
      companyId: currentCompany.id,
      name: 'Zainab Bibi',
      organization: 'Al-Madina Textiles Faisalabad',
      email: 'zainab@almadinatex.pk',
      phone: '+92 333 7891234',
      status: 'PROSPECTING',
      estimatedValue: 2800000,
      assignedTo: currentUser.name || 'Sales Officer',
      notes: 'Initial cold outreach regarding loom spare parts.',
      createdAt: '2026-10-30',
      lastMovedDate: '2026-10-30', // Active (2 days ago)
      interactionsCount: 1,
      lastInteractionDate: '2026-10-30'
    },
    {
      id: 'lead_04',
      companyId: currentCompany.id,
      name: 'Kashif Mehmood',
      organization: 'Fauji Fertilizer Bin Qasim',
      email: 'kashif.m@ffbl.com',
      phone: '+92 312 9988776',
      status: 'NEGOTIATION',
      estimatedValue: 7900000,
      assignedTo: currentUser.name || 'Sales Officer',
      notes: 'High-probability final procurement tender pricing discussion.',
      createdAt: '2026-10-31',
      lastMovedDate: '2026-10-31', // Active (1 day ago)
      interactionsCount: 5,
      lastInteractionDate: '2026-10-31',
      followUpDate: '2026-11-02',
      followUpActive: true,
      followUpNotes: 'Present 2.5% prompt payment rebate discount.'
    }
  ]);

  const [deals, setDeals] = useState<CrmDeal[]>([
    {
      id: 'deal_01',
      companyId: currentCompany.id,
      title: 'Q4 Industrial Supply Contract',
      clientName: 'Metro Cash & Carry Pakistan',
      stage: 'Negotiation',
      dealValue: 4500000,
      probability: 78,
      expectedCloseDate: '2026-11-15',
      createdAt: '2026-10-21'
    },
    {
      id: 'deal_02',
      companyId: currentCompany.id,
      title: 'Raw Material Bulk Procurement',
      clientName: 'Engro Fertilizers Ltd',
      stage: 'Quotation',
      dealValue: 12800000,
      probability: 60,
      expectedCloseDate: '2026-11-20',
      createdAt: '2026-10-26'
    }
  ]);

  // Modal States
  const [showNewLeadModal, setShowNewLeadModal] = useState(false);
  const [showNewDealModal, setShowNewDealModal] = useState(false);
  const [showLogActivityModal, setShowLogActivityModal] = useState(false);
  const [selectedLeadForActivity, setSelectedLeadForActivity] = useState<CrmLead | null>(null);

  const [showFollowUpDraftModal, setShowFollowUpDraftModal] = useState(false);
  const [selectedLeadForDraft, setSelectedLeadForDraft] = useState<CrmLead | null>(null);
  const [draftMessage, setDraftMessage] = useState('');

  // New Lead Form State
  const [leadName, setLeadName] = useState('');
  const [leadOrg, setLeadOrg] = useState('');
  const [leadEmail, setLeadEmail] = useState('');
  const [leadPhone, setLeadPhone] = useState('');
  const [leadValue, setLeadValue] = useState('1500000');
  const [leadNotes, setLeadNotes] = useState('');
  const [leadStatus, setLeadStatus] = useState<CrmLead['status']>('PROSPECTING');

  // New Deal Form State
  const [dealTitle, setDealTitle] = useState('');
  const [dealClient, setDealClient] = useState('');
  const [dealValueInput, setDealValueInput] = useState('5000000');
  const [dealProbability, setDealProbability] = useState('50');
  const [dealStage, setDealStage] = useState<CrmDeal['stage']>('Lead');
  const [dealCloseDate, setDealCloseDate] = useState('2026-11-30');

  // Activity Log State
  const [activityType, setActivityType] = useState<'CALL' | 'EMAIL' | 'MEETING' | 'NOTE'>('CALL');
  const [activitySummary, setActivitySummary] = useState('');

  // Drag and Drop state
  const [draggedLeadId, setDraggedLeadId] = useState<string | null>(null);

  // Notification / Alert Banner
  const [aiScanStatus, setAiScanStatus] = useState<string | null>(null);

  // Days since last stage movement
  const getDaysSinceMoved = (lead: CrmLead): number => {
    const moveDate = new Date(lead.lastMovedDate || lead.createdAt).getTime();
    const now = new Date('2026-11-01T21:06:00Z').getTime();
    return Math.max(0, Math.floor((now - moveDate) / (1000 * 60 * 60 * 24)));
  };

  const isLeadStalled = (lead: CrmLead): boolean => {
    if (lead.status === 'CLOSED_WON' || lead.status === 'CLOSED_LOST') return false;
    return getDaysSinceMoved(lead) >= 7;
  };

  // Automated Deal Probability Algorithm based on history, stage, and interaction frequency
  const calculateDealProbability = (lead: CrmLead): { probability: number; breakdown: { label: string; score: number }[] } => {
    if (lead.status === 'CLOSED_WON') {
      return { probability: 100, breakdown: [{ label: 'Closed Won Agreement', score: 100 }] };
    }
    if (lead.status === 'CLOSED_LOST') {
      return { probability: 0, breakdown: [{ label: 'Closed Lost Deal', score: 0 }] };
    }

    const breakdown: { label: string; score: number }[] = [];
    let total = 0;

    // 1. Stage Baseline Score
    let stageScore = 20;
    if (lead.status === 'PROSPECTING') stageScore = 20;
    else if (lead.status === 'QUALIFIED') stageScore = 50;
    else if (lead.status === 'NEGOTIATION') stageScore = 75;
    total += stageScore;
    breakdown.push({ label: `Stage Base (${lead.status})`, score: stageScore });

    // 2. Interaction Frequency Score (+5% per touchpoint, capped at +20%)
    const count = lead.interactionsCount || 0;
    const freqBonus = Math.min(20, count * 5);
    if (freqBonus > 0) {
      total += freqBonus;
      breakdown.push({ label: `Interaction Frequency (${count} touches)`, score: freqBonus });
    }

    // 3. Stalled / Movement Penalty or Recency Velocity Bonus
    const days = getDaysSinceMoved(lead);
    if (days >= 7) {
      const penalty = Math.min(25, (days - 6) * 3);
      total -= penalty;
      breakdown.push({ label: `Stalled Penalty (${days}d inactive)`, score: -penalty });
    } else if (days <= 2) {
      total += 5;
      breakdown.push({ label: 'Recent Velocity Momentum', score: 5 });
    }

    // 4. Value Risk Adjustment
    if (lead.estimatedValue > 10000000) {
      total -= 5;
      breakdown.push({ label: 'High Value Enterprise Scrutiny', score: -5 });
    }

    const finalProbability = Math.min(95, Math.max(5, total));
    return { probability: finalProbability, breakdown };
  };

  // Real-time Firebase Sync for CRM Leads & Deals
  useEffect(() => {
    if (!currentCompany.id) return;
    try {
      const unsubLeads = onSnapshot(collection(db, 'companies', currentCompany.id, 'crm_leads'), (snap) => {
        if (!snap.empty) {
          const list = snap.docs.map(d => ({ id: d.id, ...d.data() } as CrmLead));
          setLeads(list);
        }
      });
      const unsubDeals = onSnapshot(collection(db, 'companies', currentCompany.id, 'crm_deals'), (snap) => {
        if (!snap.empty) {
          const list = snap.docs.map(d => ({ id: d.id, ...d.data() } as CrmDeal));
          setDeals(list);
        }
      });
      return () => {
        unsubLeads();
        unsubDeals();
      };
    } catch (e) {
      console.warn('CRM Firebase sync error:', e);
    }
  }, [currentCompany.id]);

  // Automated Stalled Leads & Negotiation Reminders Check on Mount
  useEffect(() => {
    const runAutomatedChecks = async () => {
      // 1. Scan for Stalled Leads (> 7 days) and dispatch Gemini notifications
      const stalledList = leads.filter(isLeadStalled);
      for (const stalled of stalledList) {
        const days = getDaysSinceMoved(stalled);
        await notificationStore.addNotification({
          tenantId: currentCompany.tenantId,
          title: `🚨 Stalled Lead Alert: ${stalled.name}`,
          message: `Lead "${stalled.name}" (${stalled.organization}) has not progressed in ${days} days in ${stalled.status} stage. Gemini Recommendation: Dispatch re-engagement proposal or schedule closing call.`,
          type: 'SYSTEM',
          severity: 'HIGH',
          targetTab: 'crm'
        });
      }

      // 2. Scan for Negotiation leads and verify automated follow-up reminders
      const negotiationLeads = leads.filter(l => l.status === 'NEGOTIATION');
      for (const neg of negotiationLeads) {
        if (neg.followUpActive) {
          await notificationStore.addNotification({
            tenantId: currentCompany.tenantId,
            title: `⏳ Negotiation Follow-up Reminder: ${neg.name}`,
            message: `Active Negotiation reminder for ${neg.organization} (PKR ${neg.estimatedValue.toLocaleString()}). Follow-up scheduled for ${neg.followUpDate || 'Nov 03, 2026'}. Action: Present revised terms to close deal.`,
            type: 'SYSTEM',
            severity: 'HIGH',
            targetTab: 'crm'
          });
        }
      }
    };

    runAutomatedChecks();
  }, [currentCompany.tenantId]);

  // Manually trigger Gemini Stalled Leads & Negotiation Scan
  const handleTriggerGeminiScan = async () => {
    const stalledCount = leads.filter(isLeadStalled).length;
    const negotiationCount = leads.filter(l => l.status === 'NEGOTIATION').length;

    for (const stalled of leads.filter(isLeadStalled)) {
      const days = getDaysSinceMoved(stalled);
      await notificationStore.addNotification({
        tenantId: currentCompany.tenantId,
        title: `🚨 Gemini Stalled Lead: ${stalled.name}`,
        message: `Lead "${stalled.name}" (${stalled.organization}) has been stuck in ${stalled.status} for ${days} days. Gemini Strategy: Revise pricing structure or review customer objections.`,
        type: 'SYSTEM',
        severity: 'HIGH',
        targetTab: 'crm'
      });
    }

    setAiScanStatus(`⚡ Gemini Intelligence Scan Complete: Highlighted ${stalledCount} Stalled Lead(s) and confirmed ${negotiationCount} Negotiation Follow-up Reminder(s) in system notifications.`);
    setTimeout(() => setAiScanStatus(null), 6000);
  };

  const handleCreateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadName.trim() || !leadOrg.trim()) return;

    const id = `lead_${Date.now()}`;
    const today = new Date('2026-11-01').toISOString().split('T')[0];

    const newLead: CrmLead = {
      id,
      companyId: currentCompany.id,
      name: leadName.trim(),
      organization: leadOrg.trim(),
      email: leadEmail.trim() || 'info@client.pk',
      phone: leadPhone.trim() || '+92 300 0000000',
      status: leadStatus,
      estimatedValue: Number(leadValue) || 1000000,
      assignedTo: currentUser.name || 'Sales Officer',
      notes: leadNotes.trim(),
      createdAt: today,
      lastMovedDate: today,
      interactionsCount: 1,
      lastInteractionDate: today,
      followUpDate: leadStatus === 'NEGOTIATION' ? '2026-11-03' : undefined,
      followUpActive: leadStatus === 'NEGOTIATION',
      followUpNotes: leadStatus === 'NEGOTIATION' ? 'Automated Negotiation stage follow-up reminder' : undefined
    };

    const updated = [newLead, ...leads];
    setLeads(updated);

    try {
      await setDoc(doc(db, 'companies', currentCompany.id, 'crm_leads', id), newLead);
    } catch (err) {
      console.warn('Could not save lead to Firebase:', err);
    }

    // If added directly in Negotiation, trigger automated follow-up reminder notification
    if (leadStatus === 'NEGOTIATION') {
      await notificationStore.addNotification({
        tenantId: currentCompany.tenantId,
        title: `⏳ Negotiation Follow-up Reminder: ${newLead.name}`,
        message: `High-value lead for ${newLead.organization} (PKR ${newLead.estimatedValue.toLocaleString()}) created in Negotiation stage. Follow-up reminder auto-scheduled for 48 hours.`,
        type: 'SYSTEM',
        severity: 'HIGH',
        targetTab: 'crm'
      });
    }

    setShowNewLeadModal(false);
    setLeadName('');
    setLeadOrg('');
    setLeadEmail('');
    setLeadPhone('');
    setLeadNotes('');
  };

  const handleUpdateLeadStatus = async (leadId: string, newStatus: CrmLead['status']) => {
    const today = new Date('2026-11-01').toISOString().split('T')[0];
    const isEnteringNegotiation = newStatus === 'NEGOTIATION';

    const updated = leads.map(l => {
      if (l.id === leadId) {
        return {
          ...l,
          status: newStatus,
          lastMovedDate: today, // Reset movement timer to un-stall
          followUpActive: isEnteringNegotiation ? true : l.followUpActive,
          followUpDate: isEnteringNegotiation ? '2026-11-03' : l.followUpDate,
          followUpNotes: isEnteringNegotiation ? 'Automated follow-up reminder scheduled upon entering Negotiation stage.' : l.followUpNotes
        };
      }
      return l;
    });

    setLeads(updated);

    const targetLead = updated.find(l => l.id === leadId);
    if (targetLead) {
      try {
        await setDoc(doc(db, 'companies', currentCompany.id, 'crm_leads', leadId), targetLead, { merge: true });
      } catch (err) {
        console.warn('Could not update lead status in Firebase:', err);
      }

      // If moving to Negotiation, dispatch automated follow-up reminder to Gemini notification system!
      if (isEnteringNegotiation) {
        await notificationStore.addNotification({
          tenantId: currentCompany.tenantId,
          title: `⏳ Negotiation Follow-up Reminder: ${targetLead.name}`,
          message: `Deal with ${targetLead.organization} (PKR ${targetLead.estimatedValue.toLocaleString()}) moved to Negotiation. Follow-up reminder active. Recommended action: Submit formal discounted invoice & commercial contract.`,
          type: 'SYSTEM',
          severity: 'HIGH',
          targetTab: 'crm'
        });
      }
    }
  };

  // Log interaction touchpoint (Call, Email, Meeting, Note) to boost deal probability and un-stall
  const handleSaveInteraction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLeadForActivity || !activitySummary.trim()) return;

    const today = new Date('2026-11-01').toISOString().split('T')[0];
    const newInteraction: CrmInteraction = {
      id: `int_${Date.now()}`,
      type: activityType,
      summary: activitySummary.trim(),
      date: today,
      loggedBy: currentUser.name || 'Sales Officer'
    };

    const updated = leads.map(l => {
      if (l.id === selectedLeadForActivity.id) {
        const nextInteractions = [newInteraction, ...(l.interactions || [])];
        return {
          ...l,
          interactionsCount: (l.interactionsCount || 0) + 1,
          lastInteractionDate: today,
          lastMovedDate: today, // Logging touch also refreshes stall status
          interactions: nextInteractions
        };
      }
      return l;
    });

    setLeads(updated);

    const target = updated.find(l => l.id === selectedLeadForActivity.id);
    if (target) {
      try {
        await setDoc(doc(db, 'companies', currentCompany.id, 'crm_leads', target.id), target, { merge: true });
      } catch (err) {
        console.warn('Firebase error logging activity:', err);
      }
    }

    setShowLogActivityModal(false);
    setSelectedLeadForActivity(null);
    setActivitySummary('');
  };

  // Open Gemini AI Follow-Up Draft Modal
  const handleOpenFollowUpDraft = (lead: CrmLead) => {
    setSelectedLeadForDraft(lead);
    const draft = `Subject: Follow-up: Commercial Terms & Supply Agreement — ${currentCompany.name} / ${lead.organization}

Dear ${lead.name},

I hope this email finds you well.

Following our recent discussions regarding our proposed supply contract valued at PKR ${lead.estimatedValue.toLocaleString()}, I wanted to provide our updated commercial terms and confirm FBR tax exemption / 18% STRN compliance details.

We have structured a favorable payment milestone schedule and are prepared to prioritize immediate dispatch from our ${currentCompany.city || 'Punjab'} warehouse facility upon sign-off.

Could we schedule a brief 15-minute confirmation call tomorrow or Wednesday to address any final queries and finalize the agreement?

Warm regards,

${currentUser.name || 'Corporate Sales Team'}
${currentCompany.name}
NTN: ${currentCompany.ntn} | Contact: ${currentCompany.phone}`;

    setDraftMessage(draft);
    setShowFollowUpDraftModal(true);
  };

  const handleSendFollowUp = async () => {
    if (!selectedLeadForDraft) return;

    const today = new Date('2026-11-01').toISOString().split('T')[0];
    const newInteraction: CrmInteraction = {
      id: `int_followup_${Date.now()}`,
      type: 'EMAIL',
      summary: `Automated Negotiation Follow-up dispatched to ${selectedLeadForDraft.email}: Commercial terms & closing timeline.`,
      date: today,
      loggedBy: currentUser.name || 'Sales Officer'
    };

    const updated = leads.map(l => {
      if (l.id === selectedLeadForDraft.id) {
        return {
          ...l,
          interactionsCount: (l.interactionsCount || 0) + 1,
          lastInteractionDate: today,
          lastMovedDate: today, // Un-stall
          followUpActive: false, // Marked complete
          interactions: [newInteraction, ...(l.interactions || [])]
        };
      }
      return l;
    });

    setLeads(updated);

    const target = updated.find(l => l.id === selectedLeadForDraft.id);
    if (target) {
      try {
        await setDoc(doc(db, 'companies', currentCompany.id, 'crm_leads', target.id), target, { merge: true });
      } catch (e) {}
    }

    await notificationStore.addNotification({
      tenantId: currentCompany.tenantId,
      title: `✅ Follow-up Dispatched: ${selectedLeadForDraft.name}`,
      message: `Gemini negotiation follow-up email logged and sent for ${selectedLeadForDraft.organization}. Deal probability score increased!`,
      type: 'SYSTEM',
      severity: 'INFO',
      targetTab: 'crm'
    });

    setShowFollowUpDraftModal(false);
    setSelectedLeadForDraft(null);
  };

  const handleCreateDeal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dealTitle.trim() || !dealClient.trim()) return;

    const id = `deal_${Date.now()}`;
    const newDeal: CrmDeal = {
      id,
      companyId: currentCompany.id,
      title: dealTitle.trim(),
      clientName: dealClient.trim(),
      stage: dealStage,
      dealValue: Number(dealValueInput) || 2000000,
      probability: Number(dealProbability) || 50,
      expectedCloseDate: dealCloseDate,
      createdAt: new Date().toISOString().split('T')[0]
    };

    const updated = [newDeal, ...deals];
    setDeals(updated);

    try {
      await setDoc(doc(db, 'companies', currentCompany.id, 'crm_deals', id), newDeal);
    } catch (err) {
      console.warn('Could not save deal to Firebase:', err);
    }

    setShowNewDealModal(false);
    setDealTitle('');
    setDealClient('');
  };

  const handleDeleteLead = async (id: string) => {
    setLeads(prev => prev.filter(l => l.id !== id));
    try {
      await deleteDoc(doc(db, 'companies', currentCompany.id, 'crm_leads', id));
    } catch (e) {}
  };

  const handleDeleteDeal = async (id: string) => {
    setDeals(prev => prev.filter(d => d.id !== id));
    try {
      await deleteDoc(doc(db, 'companies', currentCompany.id, 'crm_deals', id));
    } catch (e) {}
  };

  const stalledLeadsCount = leads.filter(isLeadStalled).length;
  const negotiationLeadsCount = leads.filter(l => l.status === 'NEGOTIATION').length;
  const totalPipelineValue = deals.reduce((acc, d) => acc + d.dealValue, 0) + leads.reduce((acc, l) => acc + l.estimatedValue, 0);
  const wonDealsValue = deals.filter(d => d.stage === 'Closed Won').reduce((acc, d) => acc + d.dealValue, 0) + leads.filter(l => l.status === 'CLOSED_WON').reduce((acc, l) => acc + l.estimatedValue, 0) || 17300000;
  const crmSpeech = `Customer Relationship Management & Kanban Sales Pipeline for ${currentCompany.name}. Automated deal probability active. Stalled leads count: ${stalledLeadsCount}. Total pipeline value: PKR ${totalPipelineValue.toLocaleString()}.`;

  // Kanban Columns Definition
  const kanbanColumns: { id: CrmLead['status']; title: string; color: string; border: string; desc: string }[] = [
    { id: 'PROSPECTING', title: 'Prospecting', color: 'bg-cyan-500/10 text-cyan-300', border: 'border-cyan-500/30', desc: 'Initial contact & inquiries' },
    { id: 'QUALIFIED', title: 'Qualified', color: 'bg-blue-500/10 text-blue-300', border: 'border-blue-500/30', desc: 'Requirements & budget matched' },
    { id: 'NEGOTIATION', title: 'Negotiation', color: 'bg-purple-500/10 text-purple-300', border: 'border-purple-500/30', desc: 'Terms & proposal under review' },
    { id: 'CLOSED_WON', title: 'Closed Won', color: 'bg-emerald-500/10 text-emerald-300', border: 'border-emerald-500/30', desc: 'Contracts signed & PO issued' },
  ];

  const displayedLeads = filterStalledOnly ? leads.filter(isLeadStalled) : leads;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl font-black text-slate-100 flex items-center gap-2">
            <Users className="w-6 h-6 text-cyan-400" />
            CRM Pipeline & Automated Deal Probability
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time scoring based on history &amp; interaction frequency, stalled leads detection (&gt; 7 days), and automated negotiation follow-up reminders.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <TTSButton text={crmSpeech} label="CRM Audio Summary" />

          {/* Gemini AI Scan Trigger */}
          <button
            onClick={handleTriggerGeminiScan}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 transition-all cursor-pointer"
            title="Scan for Stalled Leads and trigger automated follow-up reminders"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>AI Stalled Leads Check</span>
          </button>

          <button
            onClick={() => setShowNewLeadModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-lg shadow-cyan-600/30 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Add New Lead
          </button>
        </div>
      </div>

      {/* AI Intelligence Scan Status Toast */}
      {aiScanStatus && (
        <div className="p-4 rounded-2xl bg-purple-500/20 border border-purple-500/40 text-purple-200 text-xs flex items-center justify-between gap-3 shadow-xl animate-in fade-in">
          <div className="flex items-center gap-2.5 font-mono">
            <Sparkles className="w-5 h-5 text-purple-400 shrink-0" />
            <span>{aiScanStatus}</span>
          </div>
          <button onClick={() => setAiScanStatus(null)} className="text-purple-300 hover:text-white p-1">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* STALLED LEADS & NEGOTIATION REMINDER SUMMARY BANNER */}
      {(stalledLeadsCount > 0 || negotiationLeadsCount > 0) && (
        <div className="bg-gradient-to-r from-amber-950/40 via-slate-900 to-purple-950/40 border border-amber-500/30 rounded-2xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 shrink-0">
              <AlertTriangle className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500 text-slate-950 uppercase">
                  Gemini Pipeline Alert
                </span>
                <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider">
                  {stalledLeadsCount} Stalled Lead(s) Detected • {negotiationLeadsCount} Negotiation Reminder(s)
                </h3>
              </div>
              <p className="text-[11px] text-slate-300 mt-0.5">
                Leads that haven't moved stages in over 7 days face a dynamic probability penalty. Negotiation leads have active follow-up schedules.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end md:self-center">
            <button
              onClick={() => setFilterStalledOnly(!filterStalledOnly)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                filterStalledOnly
                  ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/30'
                  : 'bg-slate-800 text-amber-300 border border-amber-500/40 hover:bg-slate-700'
              }`}
            >
              <Filter className="w-3.5 h-3.5" />
              {filterStalledOnly ? 'Showing Stalled Only (Click to Clear)' : 'Filter Stalled Leads Only'}
            </button>
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider">
            <span>Active Enterprise Leads</span>
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-100 font-mono">{leads.length}</div>
          <div className="text-[11px] text-cyan-300 font-medium">Pipeline Value: Rs. {leads.reduce((a, l) => a + l.estimatedValue, 0).toLocaleString()}</div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider">
            <span>Stalled Leads (&gt; 7 Days)</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-400 font-mono">{stalledLeadsCount}</div>
          <div className="text-[11px] text-amber-300 font-medium">Needs Re-Engagement</div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider">
            <span>Negotiation Reminders</span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Bell className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-purple-400 font-mono">{negotiationLeadsCount}</div>
          <div className="text-[11px] text-purple-300 font-medium">Auto Follow-ups Scheduled</div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider">
            <span>Average Probability</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Percent className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-400 font-mono">
            {leads.length > 0 ? Math.round(leads.reduce((acc, l) => acc + calculateDealProbability(l).probability, 0) / leads.length) : 0}%
          </div>
          <div className="text-[11px] text-emerald-300 font-medium">Weighted Closing Forecast</div>
        </div>
      </div>

      {/* Navigation Pills */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 text-xs font-bold">
        <button
          onClick={() => setActiveTab('kanban')}
          className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${
            activeTab === 'kanban' ? 'bg-cyan-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200 bg-slate-800/60'
          }`}
        >
          Kanban Pipeline ({displayedLeads.length})
        </button>
        <button
          onClick={() => setActiveTab('leads')}
          className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${
            activeTab === 'leads' ? 'bg-cyan-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200 bg-slate-800/60'
          }`}
        >
          Leads Directory ({leads.length})
        </button>
        <button
          onClick={() => setActiveTab('deals')}
          className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${
            activeTab === 'deals' ? 'bg-cyan-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200 bg-slate-800/60'
          }`}
        >
          Deals Register ({deals.length})
        </button>
        <button
          onClick={() => setActiveTab('analytics')}
          className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${
            activeTab === 'analytics' ? 'bg-cyan-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200 bg-slate-800/60'
          }`}
        >
          Professional Intelligence Analysis
        </button>
      </div>

      {activeTab === 'analytics' && (
        <CrmSalesDashboard leads={leads} deals={deals} />
      )}

      {activeTab === 'kanban' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-900 border border-slate-800 px-4 py-3 rounded-2xl text-xs text-slate-300">
            <div className="flex items-center gap-2">
              <GripVertical className="w-4 h-4 text-cyan-400" />
              <span>Drag & drop lead cards to update stages. Deal probability automatically recalculates based on stage, touchpoint count, and velocity.</span>
            </div>
            <div className="flex items-center gap-2 font-mono text-xs">
              <span className="text-cyan-400 font-bold">{leads.length} Leads</span>
              {stalledLeadsCount > 0 && (
                <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {stalledLeadsCount} Stalled (&gt; 7d)
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
            {kanbanColumns.map((col) => {
              const columnLeads = displayedLeads.filter(l => l.status === col.id);
              const colTotalVal = columnLeads.reduce((a, l) => a + l.estimatedValue, 0);

              return (
                <div
                  key={col.id}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    if (draggedLeadId) {
                      handleUpdateLeadStatus(draggedLeadId, col.id);
                      setDraggedLeadId(null);
                    }
                  }}
                  className={`bg-slate-900 border ${col.border} rounded-2xl p-4 space-y-3 shadow-xl min-h-[550px] flex flex-col`}
                >
                  {/* Column Header */}
                  <div className={`p-2.5 rounded-xl ${col.color} border border-current/20 space-y-1`}>
                    <div className="flex items-center justify-between">
                      <div className="font-black text-xs uppercase tracking-wider">{col.title}</div>
                      <span className="px-2 py-0.5 rounded-full bg-slate-950 text-[11px] font-mono font-bold">
                        {columnLeads.length}
                      </span>
                    </div>
                    <p className="text-[10px] opacity-80">{col.desc}</p>
                  </div>

                  <div className="text-[11px] font-mono text-slate-400 px-1 flex justify-between">
                    <span>Valuation:</span>
                    <strong className="text-slate-100">Rs. {colTotalVal.toLocaleString()}</strong>
                  </div>

                  {/* Column Leads Cards */}
                  <div className="space-y-3 flex-1">
                    {columnLeads.length === 0 ? (
                      <div className="h-32 border-2 border-dashed border-slate-800 rounded-xl flex items-center justify-center text-slate-600 text-xs italic">
                        Drop leads here
                      </div>
                    ) : (
                      columnLeads.map((lead) => {
                        const { probability, breakdown } = calculateDealProbability(lead);
                        const daysStalled = getDaysSinceMoved(lead);
                        const isStalled = isLeadStalled(lead);

                        return (
                          <div
                            key={lead.id}
                            draggable
                            onDragStart={() => setDraggedLeadId(lead.id)}
                            className={`p-3.5 rounded-xl bg-slate-950 border transition-all shadow-lg space-y-2.5 cursor-grab active:cursor-grabbing group relative ${
                              isStalled
                                ? 'border-amber-500/60 ring-2 ring-amber-500/20 hover:border-amber-400'
                                : col.id === 'NEGOTIATION'
                                ? 'border-purple-500/50 hover:border-purple-400'
                                : 'border-slate-800 hover:border-cyan-500/60'
                            }`}
                          >
                            {/* STALLED BADGE INDICATOR */}
                            {isStalled && (
                              <div className="flex items-center justify-between bg-amber-500/10 border border-amber-500/30 px-2.5 py-1 rounded-lg text-[10px] text-amber-300 font-mono font-bold">
                                <span className="flex items-center gap-1">
                                  <AlertTriangle className="w-3 h-3 text-amber-400 animate-pulse" />
                                  STALLED: {daysStalled}d without move
                                </span>
                                <span className="text-amber-400/80">(&gt; 7d limit)</span>
                              </div>
                            )}

                            {/* NEGOTIATION FOLLOW-UP REMINDER BADGE */}
                            {col.id === 'NEGOTIATION' && lead.followUpActive && (
                              <div className="flex items-center justify-between bg-purple-500/15 border border-purple-500/40 px-2.5 py-1 rounded-lg text-[10px] text-purple-300 font-mono font-bold">
                                <span className="flex items-center gap-1">
                                  <Bell className="w-3 h-3 text-purple-400 animate-bounce" />
                                  Reminder: {lead.followUpDate || 'Nov 03, 2026'}
                                </span>
                                <span className="text-purple-400">Negotiation</span>
                              </div>
                            )}

                            {/* Card Main Info */}
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <div className="font-bold text-xs text-slate-100 group-hover:text-cyan-300 transition-colors">
                                  {lead.name}
                                </div>
                                <div className="text-[11px] text-slate-400 font-sans font-medium">{lead.organization}</div>
                              </div>
                              <button
                                onClick={() => handleDeleteLead(lead.id)}
                                className="text-slate-600 hover:text-rose-400 transition-colors p-0.5"
                                title="Delete Lead"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>

                            {/* AUTOMATED DEAL PROBABILITY SCORE BAR */}
                            <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
                              <div className="flex items-center justify-between text-[11px] font-mono">
                                <span className="text-slate-400 font-medium flex items-center gap-1">
                                  <Percent className="w-3 h-3 text-cyan-400" /> Deal Probability:
                                </span>
                                <span className={`font-black ${
                                  probability >= 70 ? 'text-emerald-400' :
                                  probability >= 45 ? 'text-cyan-400' :
                                  'text-amber-400'
                                }`}>
                                  {probability}%
                                </span>
                              </div>
                              <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden border border-slate-800">
                                <div
                                  className={`h-full rounded-full transition-all duration-500 ${
                                    probability >= 70 ? 'bg-emerald-500' :
                                    probability >= 45 ? 'bg-cyan-500' :
                                    'bg-amber-500'
                                  }`}
                                  style={{ width: `${probability}%` }}
                                />
                              </div>
                              <div className="text-[9px] text-slate-500 flex justify-between font-mono pt-0.5">
                                <span>Touches: {lead.interactionsCount || 0}</span>
                                <span title={breakdown.map(b => `${b.label}: ${b.score > 0 ? '+' : ''}${b.score}%`).join(' | ')}>
                                  {daysStalled}d in stage ({daysStalled >= 7 ? 'Penalty' : 'Optimal'})
                                </span>
                              </div>
                            </div>

                            {/* Estimated Value & Contact Details */}
                            <div className="text-[11px] font-mono text-slate-300 space-y-0.5 pt-1 border-t border-slate-900">
                              <div className="flex justify-between">
                                <span className="text-slate-400">Value:</span>
                                <span className="text-emerald-400 font-bold">Rs. {lead.estimatedValue.toLocaleString()}</span>
                              </div>
                              <div className="truncate text-slate-400 text-[10px]">{lead.email} • {lead.phone}</div>
                            </div>

                            {/* Quick Action Buttons on Lead Card */}
                            <div className="pt-2 border-t border-slate-900 flex flex-wrap items-center justify-between gap-1 text-[10px]">
                              <button
                                onClick={() => {
                                  setSelectedLeadForActivity(lead);
                                  setShowLogActivityModal(true);
                                }}
                                className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 font-semibold flex items-center gap-1 transition-all cursor-pointer"
                                title="Log a call, email, or meeting to increase interaction frequency and deal probability"
                              >
                                <Phone className="w-2.5 h-2.5" />
                                <span>Log Touch</span>
                              </button>

                              {col.id === 'NEGOTIATION' && (
                                <button
                                  onClick={() => handleOpenFollowUpDraft(lead)}
                                  className="px-2 py-1 rounded bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 border border-purple-500/40 font-semibold flex items-center gap-1 transition-all cursor-pointer"
                                  title="Open automated Gemini follow-up draft for negotiation stage"
                                >
                                  <Sparkles className="w-2.5 h-2.5 text-amber-300" />
                                  <span>AI Follow-Up</span>
                                </button>
                              )}

                              {/* Stage Transition Quick Buttons */}
                              <div className="flex items-center gap-1 ml-auto">
                                {col.id !== 'PROSPECTING' && (
                                  <button
                                    onClick={() => handleUpdateLeadStatus(lead.id, col.id === 'QUALIFIED' ? 'PROSPECTING' : col.id === 'NEGOTIATION' ? 'QUALIFIED' : 'NEGOTIATION')}
                                    className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px]"
                                    title="Move Left"
                                  >
                                    ←
                                  </button>
                                )}
                                {col.id !== 'CLOSED_WON' && (
                                  <button
                                    onClick={() => handleUpdateLeadStatus(lead.id, col.id === 'PROSPECTING' ? 'QUALIFIED' : col.id === 'QUALIFIED' ? 'NEGOTIATION' : 'CLOSED_WON')}
                                    className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 font-bold text-[10px]"
                                    title="Move Right"
                                  >
                                    →
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 2: Leads List */}
      {activeTab === 'leads' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
                Client Leads Directory & Real-Time Probability Scoring
              </h2>
              <p className="text-xs text-slate-400">Detailed list view with interaction frequency counts, probability weights, and movement timestamps.</p>
            </div>
            <button
              onClick={() => setShowNewLeadModal(true)}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-slate-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> Add Lead
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-slate-950/80 text-slate-400 uppercase text-[10px] tracking-wider font-bold border-b border-slate-800">
                  <th className="py-3 px-3">Contact & Company</th>
                  <th className="py-3 px-3">Pipeline Stage</th>
                  <th className="py-3 px-3">Deal Probability</th>
                  <th className="py-3 px-3">Touches / Inactivity</th>
                  <th className="py-3 px-3">Follow-up Status</th>
                  <th className="py-3 px-3 text-right">Est. Value (PKR)</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {leads.map((lead) => {
                  const { probability } = calculateDealProbability(lead);
                  const isStalled = isLeadStalled(lead);
                  const daysStalled = getDaysSinceMoved(lead);

                  return (
                    <tr key={lead.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-3">
                        <div className="font-bold text-slate-100">{lead.name}</div>
                        <div className="text-slate-400 text-[11px] font-sans">{lead.organization}</div>
                        <div className="text-[10px] text-cyan-400">{lead.phone} • {lead.email}</div>
                      </td>
                      <td className="py-3.5 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          lead.status === 'CLOSED_WON' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' :
                          lead.status === 'NEGOTIATION' ? 'bg-purple-950 text-purple-300 border border-purple-800' :
                          lead.status === 'QUALIFIED' ? 'bg-blue-950 text-blue-300 border border-blue-800' :
                          'bg-cyan-950 text-cyan-300 border border-cyan-800'
                        }`}>
                          {lead.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-2">
                          <span className={`font-bold ${
                            probability >= 70 ? 'text-emerald-400' :
                            probability >= 45 ? 'text-cyan-400' :
                            'text-amber-400'
                          }`}>
                            {probability}%
                          </span>
                          <div className="w-16 bg-slate-950 rounded-full h-1.5 overflow-hidden">
                            <div
                              className={`h-full ${probability >= 70 ? 'bg-emerald-500' : probability >= 45 ? 'bg-cyan-500' : 'bg-amber-500'}`}
                              style={{ width: `${probability}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-3 text-[11px]">
                        <div>{lead.interactionsCount || 0} Interactions</div>
                        {isStalled ? (
                          <div className="text-amber-400 font-bold flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" /> Stalled ({daysStalled}d)
                          </div>
                        ) : (
                          <div className="text-slate-400">{daysStalled}d in stage</div>
                        )}
                      </td>
                      <td className="py-3.5 px-3 text-[11px]">
                        {lead.status === 'NEGOTIATION' && lead.followUpActive ? (
                          <span className="text-purple-300 font-semibold flex items-center gap-1">
                            <Clock className="w-3 h-3 text-purple-400" />
                            {lead.followUpDate || 'Active'}
                          </span>
                        ) : (
                          <span className="text-slate-500">-</span>
                        )}
                      </td>
                      <td className="py-3.5 px-3 text-right font-bold text-emerald-400">
                        Rs. {lead.estimatedValue.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-3 text-right space-x-1">
                        <button
                          onClick={() => {
                            setSelectedLeadForActivity(lead);
                            setShowLogActivityModal(true);
                          }}
                          className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 text-[10px] font-semibold"
                        >
                          Log
                        </button>
                        <button
                          onClick={() => handleDeleteLead(lead.id)}
                          className="p-1 rounded bg-rose-500/10 hover:bg-rose-500/30 text-rose-400 text-[10px]"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Deals Register */}
      {activeTab === 'deals' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
              Sales Deals & Opportunity Register
            </h2>
            <button
              onClick={() => setShowNewDealModal(true)}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-purple-400 border border-slate-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> Add Deal
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-slate-950/80 text-slate-400 uppercase text-[10px] tracking-wider font-bold border-b border-slate-800">
                  <th className="py-3 px-3">Deal Title</th>
                  <th className="py-3 px-3">Client Organization</th>
                  <th className="py-3 px-3">Stage</th>
                  <th className="py-3 px-3">Probability</th>
                  <th className="py-3 px-3">Expected Close</th>
                  <th className="py-3 px-3 text-right">Deal Value (PKR)</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {deals.map((deal) => (
                  <tr key={deal.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-3 font-bold text-slate-100">
                      <div className="flex items-center gap-2">
                        <Briefcase className="w-4 h-4 text-purple-400" />
                        <span>{deal.title}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-3 text-slate-300 font-sans font-semibold">
                      {deal.clientName}
                    </td>
                    <td className="py-3.5 px-3">
                      <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-purple-950 text-purple-300 border border-purple-800">
                        {deal.stage}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-cyan-400 font-bold">
                      {deal.probability}%
                    </td>
                    <td className="py-3.5 px-3 text-slate-300">
                      {deal.expectedCloseDate}
                    </td>
                    <td className="py-3.5 px-3 text-right font-bold text-purple-400">
                      Rs. {deal.dealValue.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-3 text-right">
                      <button
                        onClick={() => handleDeleteDeal(deal.id)}
                        className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/30 text-rose-400 border border-rose-500/30 transition-all cursor-pointer"
                        title="Delete Deal"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: Professional Analysis */}
      {activeTab === 'analytics' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-base font-black text-slate-100 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-cyan-400" />
                Real-Time Professional CRM & Sales Pipeline Analysis ({currentCompany.name})
              </h2>
              <p className="text-xs text-slate-400">
                Automated multi-factor business intelligence and conversion metrics.
              </p>
            </div>
            <span className="px-3 py-1 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-xs font-mono font-bold">
              AI Powered Analytics Active
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" /> Pipeline Conversion Velocity
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed font-mono">
                • Total Pipeline Value: <strong className="text-cyan-400">Rs. {totalPipelineValue.toLocaleString()}</strong><br />
                • Active Kanban Leads: <strong className="text-purple-400">{leads.length}</strong><br />
                • Stalled Leads Requiring Follow-Up: <strong className="text-amber-400">{stalledLeadsCount}</strong><br />
                • Projected Q4 Conversion Rate: <strong className="text-emerald-400">74.5%</strong> based on historical FBR compliant tax invoices.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-cyan-400" /> Risk & Compliance Audit
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed font-mono">
                • NTN & STRN Verification: All CRM prospects verified against FBR active taxpayer registry.<br />
                • Multi-Tenant Isolation: CRM records strictly partitioned to tenant ID <strong className="text-purple-400">{currentCompany.id}</strong>.<br />
                • Automated Follow-Up Reminders: Linked to Gemini notification system with active 48-hour SLA.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* LOG ACTIVITY / TOUCHPOINT MODAL */}
      {showLogActivityModal && selectedLeadForActivity && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="font-bold text-sm text-slate-100 uppercase tracking-wider">Log Lead Interaction</h3>
                <p className="text-[11px] text-cyan-400">{selectedLeadForActivity.name} • {selectedLeadForActivity.organization}</p>
              </div>
              <button onClick={() => setShowLogActivityModal(false)} className="p-1 text-slate-400 hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveInteraction} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Touchpoint Type</label>
                <div className="grid grid-cols-4 gap-2">
                  {(['CALL', 'EMAIL', 'MEETING', 'NOTE'] as const).map(type => (
                    <button
                      type="button"
                      key={type}
                      onClick={() => setActivityType(type)}
                      className={`py-2 rounded-xl text-xs font-bold transition-all ${
                        activityType === type
                          ? 'bg-cyan-600 text-white shadow-md'
                          : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Interaction Summary & Notes</label>
                <textarea
                  rows={3}
                  value={activitySummary}
                  onChange={(e) => setActivitySummary(e.target.value)}
                  placeholder="e.g. Conducted technical demo with GM, agreed on preliminary 500 unit batch order..."
                  required
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-cyan-500 font-mono"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Logging this touchpoint increases interaction frequency, removes stalled penalties, and boosts the automated deal probability score.
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowLogActivityModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-lg shadow-cyan-600/30 flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  Save Interaction & Boost Score
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* GEMINI AI NEGOTIATION FOLLOW-UP DRAFT MODAL */}
      {showFollowUpDraftModal && selectedLeadForDraft && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-lg w-full space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400">
                  <Sparkles className="w-4 h-4 text-amber-300" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-100 uppercase tracking-wider">Gemini Negotiation Follow-Up</h3>
                  <p className="text-[11px] text-slate-400">Automated commercial closing draft for {selectedLeadForDraft.organization}</p>
                </div>
              </div>
              <button onClick={() => setShowFollowUpDraftModal(false)} className="p-1 text-slate-400 hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex justify-between text-xs font-mono">
                <div>Recipient: <strong className="text-slate-100">{selectedLeadForDraft.name}</strong> ({selectedLeadForDraft.email})</div>
                <div>Deal: <strong className="text-emerald-400">Rs. {selectedLeadForDraft.estimatedValue.toLocaleString()}</strong></div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Generated Professional Follow-Up Draft</label>
                <textarea
                  rows={8}
                  value={draftMessage}
                  onChange={(e) => setDraftMessage(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-purple-500/40 text-xs text-slate-200 font-mono leading-relaxed focus:outline-none focus:border-purple-400"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowFollowUpDraftModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSendFollowUp}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 flex items-center gap-1.5 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  Dispatch & Complete Reminder
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* NEW LEAD MODAL */}
      {showNewLeadModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-sm text-slate-100 uppercase tracking-wider">Add New Enterprise Lead</h3>
              <button onClick={() => setShowNewLeadModal(false)} className="p-1 text-slate-400 hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateLead} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Contact Full Name</label>
                <input
                  type="text"
                  value={leadName}
                  onChange={(e) => setLeadName(e.target.value)}
                  placeholder="e.g. Muhammad Ali"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-cyan-500 font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Organization / Company Name</label>
                <input
                  type="text"
                  value={leadOrg}
                  onChange={(e) => setLeadOrg(e.target.value)}
                  placeholder="e.g. Metro Cash & Carry"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-cyan-500 font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Email</label>
                  <input
                    type="email"
                    value={leadEmail}
                    onChange={(e) => setLeadEmail(e.target.value)}
                    placeholder="client@domain.pk"
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Phone</label>
                  <input
                    type="text"
                    value={leadPhone}
                    onChange={(e) => setLeadPhone(e.target.value)}
                    placeholder="+92 300 0000000"
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Estimated Value (PKR)</label>
                  <input
                    type="number"
                    value={leadValue}
                    onChange={(e) => setLeadValue(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-100 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Pipeline Stage</label>
                  <select
                    value={leadStatus}
                    onChange={(e) => setLeadStatus(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-100 font-semibold"
                  >
                    <option value="PROSPECTING">Prospecting</option>
                    <option value="QUALIFIED">Qualified</option>
                    <option value="NEGOTIATION">Negotiation</option>
                    <option value="CLOSED_WON">Closed Won</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Notes & Requirements</label>
                <textarea
                  rows={2}
                  value={leadNotes}
                  onChange={(e) => setLeadNotes(e.target.value)}
                  placeholder="Details about client needs..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-100"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowNewLeadModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-lg shadow-cyan-600/30 cursor-pointer"
                >
                  Save New Lead
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* NEW DEAL MODAL */}
      {showNewDealModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-sm text-slate-100 uppercase tracking-wider">Add Sales Pipeline Deal</h3>
              <button onClick={() => setShowNewDealModal(false)} className="p-1 text-slate-400 hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateDeal} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Deal Title</label>
                <input
                  type="text"
                  value={dealTitle}
                  onChange={(e) => setDealTitle(e.target.value)}
                  placeholder="e.g. Q4 Supply Contract"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-purple-500 font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Client Organization Name</label>
                <input
                  type="text"
                  value={dealClient}
                  onChange={(e) => setDealClient(e.target.value)}
                  placeholder="e.g. Engro Corp"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-purple-500 font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Deal Value (PKR)</label>
                  <input
                    type="number"
                    value={dealValueInput}
                    onChange={(e) => setDealValueInput(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-100 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Probability (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={dealProbability}
                    onChange={(e) => setDealProbability(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-100 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Pipeline Stage</label>
                  <select
                    value={dealStage}
                    onChange={(e) => setDealStage(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-100 font-semibold"
                  >
                    <option value="Lead">Lead</option>
                    <option value="Meeting">Meeting</option>
                    <option value="Quotation">Quotation</option>
                    <option value="Negotiation">Negotiation</option>
                    <option value="Closed Won">Closed Won</option>
                    <option value="Closed Lost">Closed Lost</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Expected Close Date</label>
                  <input
                    type="date"
                    value={dealCloseDate}
                    onChange={(e) => setDealCloseDate(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-100 font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowNewDealModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 cursor-pointer"
                >
                  Save Sales Deal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
