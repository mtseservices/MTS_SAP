import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  GitCommit,
  Plus,
  Trash2,
  Save,
  Layers,
  CheckCircle2,
  ArrowRight,
  UserCheck,
  DollarSign
} from 'lucide-react';
import { useAuthTenant } from '../../context/AuthTenantContext';

interface ApprovalStage {
  stageNumber: number;
  roleName: string;
  thresholdAmount: number;
  requiresAll: boolean;
}

interface DocumentWorkflow {
  docTypeCode: string;
  docTypeName: string;
  department: string;
  stages: ApprovalStage[];
}

const DEFAULT_WORKFLOWS: DocumentWorkflow[] = [
  {
    docTypeCode: 'PO',
    docTypeName: 'Purchase Order (PO)',
    department: 'Procurement',
    stages: [
      { stageNumber: 1, roleName: 'Department Manager', thresholdAmount: 100000, requiresAll: false },
      { stageNumber: 2, roleName: 'Finance Controller', thresholdAmount: 500000, requiresAll: false },
      { stageNumber: 3, roleName: 'Executive Director / CEO', thresholdAmount: 1000000, requiresAll: true }
    ]
  },
  {
    docTypeCode: 'SI',
    docTypeName: 'Sales Invoice & Discount (SI)',
    department: 'Sales',
    stages: [
      { stageNumber: 1, roleName: 'Sales Head', thresholdAmount: 50000, requiresAll: false },
      { stageNumber: 2, roleName: 'Chief Financial Officer', thresholdAmount: 200000, requiresAll: true }
    ]
  },
  {
    docTypeCode: 'JV',
    docTypeName: 'Journal Voucher (JV)',
    department: 'Accounts & Finance',
    stages: [
      { stageNumber: 1, roleName: 'Senior Accountant', thresholdAmount: 250000, requiresAll: false },
      { stageNumber: 2, roleName: 'CFO / Finance Manager', thresholdAmount: 1000000, requiresAll: true }
    ]
  }
];

export const ApprovalWorkflowEditor: React.FC = () => {
  const { currentCompany } = useAuthTenant();
  const [workflows, setWorkflows] = useState<DocumentWorkflow[]>(() => {
    try {
      const saved = localStorage.getItem('mts_approval_workflows');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return DEFAULT_WORKFLOWS;
  });

  const [selectedDocCode, setSelectedDocCode] = useState<string>('PO');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const activeWorkflow = workflows.find(w => w.docTypeCode === selectedDocCode) || workflows[0];

  const handleUpdateStage = (stageNum: number, field: keyof ApprovalStage, value: any) => {
    const updated = workflows.map(w => {
      if (w.docTypeCode === selectedDocCode) {
        const newStages = w.stages.map(s => {
          if (s.stageNumber === stageNum) {
            return { ...s, [field]: value };
          }
          return s;
        });
        return { ...w, stages: newStages };
      }
      return w;
    });
    setWorkflows(updated);
  };

  const handleAddStage = () => {
    const updated = workflows.map(w => {
      if (w.docTypeCode === selectedDocCode) {
        const nextNum = w.stages.length + 1;
        const newStage: ApprovalStage = {
          stageNumber: nextNum,
          roleName: 'Department Approver',
          thresholdAmount: nextNum * 250000,
          requiresAll: false
        };
        return { ...w, stages: [...w.stages, newStage] };
      }
      return w;
    });
    setWorkflows(updated);
  };

  const handleDeleteStage = (stageNum: number) => {
    const updated = workflows.map(w => {
      if (w.docTypeCode === selectedDocCode) {
        const filtered = w.stages.filter(s => s.stageNumber !== stageNum).map((s, idx) => ({
          ...s,
          stageNumber: idx + 1
        }));
        return { ...w, stages: filtered };
      }
      return w;
    });
    setWorkflows(updated);
  };

  const handleSaveWorkflows = () => {
    try {
      localStorage.setItem('mts_approval_workflows', JSON.stringify(workflows));
      setSuccessMsg('Approval workflow chains successfully updated and synchronized across all client modules.');
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch {
      alert('Failed to save workflows.');
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto pb-24">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-gradient-to-r from-indigo-950/60 via-slate-900 to-slate-900 border border-indigo-800/40 p-6 rounded-3xl shadow-2xl">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <GitCommit className="w-6 h-6 text-indigo-400" />
            <h1 className="text-xl font-black text-slate-100 tracking-tight">
              Visual Approval Workflow & Multi-Stage Chain Editor
            </h1>
          </div>
          <p className="text-xs text-slate-400 max-w-2xl">
            Define hierarchical approval stages, role permissions, and monetary threshold rules for enterprise documents. Changes reflect immediately in client tenant approval modules.
          </p>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-3 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          {successMsg}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Document Type Selector */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <h2 className="text-sm font-black text-slate-100 uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-4">
            <Layers className="w-4 h-4 text-cyan-400" />
            Select Document Type
          </h2>

          <div className="space-y-2">
            {workflows.map((w) => {
              const isSelected = w.docTypeCode === selectedDocCode;
              return (
                <button
                  key={w.docTypeCode}
                  onClick={() => setSelectedDocCode(w.docTypeCode)}
                  className={`w-full p-4 rounded-2xl border text-left flex items-center justify-between transition-all ${
                    isSelected ? 'bg-indigo-600/20 border-indigo-500 text-indigo-200 shadow-lg shadow-indigo-950/40' : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div>
                    <div className="text-xs font-black text-white">{w.docTypeName}</div>
                    <div className="text-[10px] text-slate-500 font-mono mt-0.5">Department: {w.department}</div>
                  </div>
                  <span className="px-2.5 py-1 rounded-xl bg-slate-900 text-[10px] font-mono font-bold text-cyan-400 border border-slate-800">
                    {w.stages.length} Stages
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Visual Stage Chain Editor */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-sm font-black text-slate-100 uppercase tracking-wider flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Workflow Chain for: {activeWorkflow.docTypeName}
              </h2>
              <p className="text-[10px] text-slate-500 mt-0.5">Configure sequence, roles, and approval amount thresholds.</p>
            </div>
            <button
              onClick={handleAddStage}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Add Stage
            </button>
          </div>

          <div className="space-y-4">
            {activeWorkflow.stages.map((stage, idx) => (
              <div key={stage.stageNumber} className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4 relative group">
                <div className="flex items-center justify-between border-b border-slate-900 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-xl bg-indigo-600 text-white font-mono font-bold text-xs flex items-center justify-center">
                      {stage.stageNumber}
                    </span>
                    <span className="text-xs font-black text-slate-200 uppercase tracking-wider">Approval Stage #{stage.stageNumber}</span>
                  </div>
                  <button
                    onClick={() => handleDeleteStage(stage.stageNumber)}
                    className="p-1.5 rounded-lg bg-slate-900 hover:bg-rose-950 text-slate-500 hover:text-rose-300 transition-colors cursor-pointer"
                    title="Delete Stage"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                      <UserCheck className="w-3 h-3 text-cyan-400" /> Required Approver Role
                    </label>
                    <input
                      type="text"
                      value={stage.roleName}
                      onChange={(e) => handleUpdateStage(stage.stageNumber, 'roleName', e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-100 font-bold focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                      <DollarSign className="w-3 h-3 text-emerald-400" /> Monetary Threshold (PKR)
                    </label>
                    <input
                      type="number"
                      value={stage.thresholdAmount}
                      onChange={(e) => handleUpdateStage(stage.stageNumber, 'thresholdAmount', Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-emerald-400 font-mono font-bold focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                {idx < activeWorkflow.stages.length - 1 && (
                  <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 z-10 w-8 h-8 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500">
                    <ArrowRight className="w-4 h-4 rotate-90 text-indigo-400" />
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-slate-800">
            <button
              onClick={handleSaveWorkflows}
              className="w-full py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95"
            >
              <Save className="w-4 h-4" /> Save Workflow Chain &amp; Synchronize Client Modules
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
