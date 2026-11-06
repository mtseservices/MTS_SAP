import React, { useState } from 'react';
import { 
  CheckSquare, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  ShieldCheck, 
  Layers, 
  Plus, 
  ArrowRight,
  UserCheck,
  Building2,
  DollarSign
} from 'lucide-react';
import { useAuthTenant } from '../../context/AuthTenantContext';
import { INITIAL_APPROVAL_WORKFLOWS } from '../../services/mockData';
import { ApprovalWorkflow, ApprovalStep } from '../../types/erp';
import { DataTable } from '../common/DataTable';
import { TTSButton } from '../common/TTSButton';

export const ApprovalWorkflowModule: React.FC = () => {
  const { currentCompany } = useAuthTenant();
  const [workflows, setWorkflows] = useState<ApprovalWorkflow[]>([
    {
      id: 'wf_po_01',
      documentType: 'PURCHASE_ORDER',
      documentId: 'po_01',
      documentNumber: 'PO-2026-0041',
      amount: 2879200,
      requestedBy: 'Procurement Mgr. Hassan',
      date: '2026-10-20',
      currentStep: 2,
      overallStatus: 'PENDING',
      tenantId: currentCompany.tenantId,
      steps: [
        { stepNumber: 1, approverRole: 'DEPARTMENT_MANAGER', status: 'APPROVED', comment: 'L1 Approved by Spinning Plant Head', actionDate: '2026-10-21' },
        { stepNumber: 2, approverRole: 'ACCOUNTANT', status: 'PENDING', comment: 'L2 Review in progress by Finance Controller' },
        { stepNumber: 3, approverRole: 'CEO', status: 'PENDING', comment: 'L3 Final Sign-off awaiting L2 completion' }
      ]
    },
    {
      id: 'wf_pay_02',
      documentType: 'PAYMENT_VOUCHER',
      documentId: 'pay_02',
      documentNumber: 'SALARY-NOV-2026',
      amount: 14250000,
      requestedBy: 'HR Director Aslam',
      date: '2026-11-01',
      currentStep: 1,
      overallStatus: 'PENDING',
      tenantId: currentCompany.tenantId,
      steps: [
        { stepNumber: 1, approverRole: 'DEPARTMENT_MANAGER', status: 'PENDING', comment: 'L1 Headcount & Attendance verification pending' },
        { stepNumber: 2, approverRole: 'ACCOUNTANT', status: 'PENDING', comment: 'L2 FBR Tax withholding check' },
        { stepNumber: 3, approverRole: 'CEO', status: 'PENDING', comment: 'L3 Bank disbursement executive sign-off' }
      ]
    }
  ]);

  const [isAddWorkflowOpen, setIsAddWorkflowOpen] = useState(false);
  const [newDocType, setNewDocType] = useState<'PURCHASE_ORDER' | 'PAYMENT_VOUCHER'>('PURCHASE_ORDER');
  const [newDocNum, setNewDocNum] = useState('PO-2026-0099');
  const [newAmount, setNewAmount] = useState(1500000);
  const [newRequestor, setNewRequestor] = useState('Operations Manager');

  const handleAdvanceApproval = (id: string) => {
    setWorkflows(prev =>
      prev.map(w => {
        if (w.id === id) {
          const currentStepIndex = w.steps.findIndex(s => s.stepNumber === w.currentStep);
          const updatedSteps = [...w.steps];

          // Approve current step
          updatedSteps[currentStepIndex] = {
            ...updatedSteps[currentStepIndex],
            status: 'APPROVED',
            actionDate: new Date().toISOString().split('T')[0],
            comment: `Signed off by ${updatedSteps[currentStepIndex].approverRole}`
          };

          const nextStepNum = w.currentStep + 1;
          const isComplete = nextStepNum > w.steps.length;

          return {
            ...w,
            steps: updatedSteps,
            currentStep: isComplete ? w.currentStep : nextStepNum,
            overallStatus: isComplete ? 'APPROVED' : 'PENDING'
          };
        }
        return w;
      })
    );
  };

  const handleCreateWorkflow = (e: React.FormEvent) => {
    e.preventDefault();
    const newWf: ApprovalWorkflow = {
      id: `wf_${Date.now()}`,
      documentType: newDocType,
      documentId: `doc_${Date.now()}`,
      documentNumber: newDocNum,
      amount: Number(newAmount),
      requestedBy: newRequestor,
      date: new Date().toISOString().split('T')[0],
      currentStep: 1,
      overallStatus: 'PENDING',
      tenantId: currentCompany.tenantId,
      steps: [
        { stepNumber: 1, approverRole: 'DEPARTMENT_MANAGER', status: 'PENDING', comment: 'L1 Department Manager Review' },
        { stepNumber: 2, approverRole: 'ACCOUNTANT', status: 'PENDING', comment: 'L2 Finance Controller Verification' },
        { stepNumber: 3, approverRole: 'CEO', status: 'PENDING', comment: 'L3 Executive Board Sign-off' }
      ]
    };

    setWorkflows([newWf, ...workflows]);
    setIsAddWorkflowOpen(false);
  };

  const workflowSpeech = `Multi-stage approval hierarchies (L1, L2, L3) for Purchase Orders and Salary payments at ${currentCompany.name}. Pending approval workflows: ${workflows.filter(w => w.overallStatus === 'PENDING').length}.`;

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl font-black text-slate-100 flex items-center gap-2">
            <CheckSquare className="w-6 h-6 text-emerald-400" />
            Multi-Stage Approval Hierarchies (L1, L2, L3)
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Sequential sign-off gates for Purchase Orders and Monthly Salary Disbursements integrated with Finance & Procurement.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <TTSButton text={workflowSpeech} label="Workflow Audio Briefing" />
          <button
            onClick={() => setIsAddWorkflowOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 transition-all"
          >
            <Plus className="w-4 h-4" />
            Create Multi-Stage Gate
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {workflows.map((wf) => (
          <div
            key={wf.id}
            className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4"
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div>
                <h3 className="font-bold text-slate-100 text-sm flex items-center gap-2">
                  <span className="text-cyan-400 font-mono">[{wf.documentType}]</span>
                  <span>{wf.documentNumber}</span>
                  <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold border ${
                    wf.overallStatus === 'APPROVED' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                  }`}>
                    {wf.overallStatus}
                  </span>
                </h3>
                <div className="text-xs text-slate-400 font-mono mt-0.5">
                  Requested By: <span className="text-slate-200">{wf.requestedBy}</span> • Date: {wf.date}
                </div>
              </div>

              <div className="text-right">
                <div className="text-xs text-slate-400 font-semibold uppercase">Total Document Amount</div>
                <div className="text-lg font-black text-emerald-400 font-mono">
                  Rs. {wf.amount.toLocaleString()}
                </div>
              </div>
            </div>

            {/* L1, L2, L3 Approval Steps Timeline */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {wf.steps.map((step) => {
                const isCurrent = step.stepNumber === wf.currentStep && wf.overallStatus === 'PENDING';
                return (
                  <div
                    key={step.stepNumber}
                    className={`p-4 rounded-xl border text-xs space-y-2 transition-all ${
                      step.status === 'APPROVED'
                        ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200 shadow-lg shadow-emerald-500/5'
                        : isCurrent
                        ? 'bg-amber-950/20 border-amber-500/60 text-amber-200 ring-1 ring-amber-500/30'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400'
                    }`}
                  >
                    <div className="flex items-center justify-between font-bold">
                      <span className="text-slate-200">
                        Gate L{step.stepNumber}: {step.approverRole.replace('_', ' ')}
                      </span>
                      {step.status === 'APPROVED' ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      ) : isCurrent ? (
                        <Clock className="w-4 h-4 text-amber-400 animate-pulse" />
                      ) : (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-slate-500">WAITING</span>
                      )}
                    </div>
                    <div className="text-[11px]">
                      Status: <strong className={step.status === 'APPROVED' ? 'text-emerald-300' : 'text-amber-300'}>{step.status}</strong>
                    </div>
                    {step.comment && <div className="text-[11px] italic text-slate-300 bg-slate-900/60 p-2 rounded-lg">"{step.comment}"</div>}
                  </div>
                );
              })}
            </div>

            {wf.overallStatus === 'PENDING' && (
              <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                <div className="text-xs text-slate-400 font-mono">
                  Current Active Gate: <strong className="text-amber-400">L{wf.currentStep} Sign-Off Required</strong>
                </div>
                <button
                  onClick={() => handleAdvanceApproval(wf.id)}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 flex items-center gap-2 transition-all"
                >
                  <CheckCircle2 className="w-4 h-4" /> Advance L{wf.currentStep} Approval Gate →
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* CREATE WORKFLOW MODAL */}
      {isAddWorkflowOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b border-slate-800">
              <h3 className="text-base font-bold text-slate-100">Configure Multi-Stage Gate (L1, L2, L3)</h3>
              <button onClick={() => setIsAddWorkflowOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleCreateWorkflow} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Document Type</label>
                <select
                  value={newDocType}
                  onChange={(e) => setNewDocType(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-100"
                >
                  <option value="PURCHASE_ORDER">Purchase Order (PO)</option>
                  <option value="PAYMENT_VOUCHER">Monthly Salary Disbursement (Payment Voucher)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Document Number</label>
                <input
                  type="text"
                  value={newDocNum}
                  onChange={(e) => setNewDocNum(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-100"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Total Amount (PKR)</label>
                <input
                  type="number"
                  value={newAmount}
                  onChange={(e) => setNewAmount(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-100"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Requestor</label>
                <input
                  type="text"
                  value={newRequestor}
                  onChange={(e) => setNewRequestor(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100"
                  required
                />
              </div>

              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-[11px] text-slate-400 space-y-1">
                <div className="font-bold text-cyan-400">Automatic 3-Tier Hierarchy:</div>
                <div>• L1: Department Manager Sign-Off</div>
                <div>• L2: Finance / Procurement Controller</div>
                <div>• L3: CEO / Executive Managing Director</div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddWorkflowOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30"
                >
                  Initialize Workflow
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
