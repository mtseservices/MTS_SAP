import React, { useState } from 'react';
import { CheckSquare, CheckCircle2, XCircle, Clock, ShieldCheck } from 'lucide-react';
import { useAuthTenant } from '../../context/AuthTenantContext';
import { INITIAL_APPROVAL_WORKFLOWS } from '../../services/mockData';
import { ApprovalWorkflow } from '../../types/erp';
import { DataTable } from '../common/DataTable';
import { TTSButton } from '../common/TTSButton';

export const ApprovalWorkflowModule: React.FC = () => {
  const { currentCompany } = useAuthTenant();
  const [workflows, setWorkflows] = useState<ApprovalWorkflow[]>(INITIAL_APPROVAL_WORKFLOWS);

  const handleApprove = (id: string) => {
    setWorkflows(prev =>
      prev.map(w => {
        if (w.id === id) {
          const updatedSteps = w.steps.map(s => {
            if (s.stepNumber === w.currentStep) {
              return { ...s, status: 'APPROVED' as const, actionDate: new Date().toISOString().split('T')[0] };
            }
            return s;
          });
          return {
            ...w,
            steps: updatedSteps,
            overallStatus: 'APPROVED' as const
          };
        }
        return w;
      })
    );
  };

  const workflowSpeech = `Approval Workflows engine for ${currentCompany.name}. Pending approvals in queue: ${workflows.filter(w => w.overallStatus === 'PENDING').length}. Multi-stage sign-offs recorded with audit logging.`;

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl font-black text-slate-100 flex items-center gap-2">
            <CheckSquare className="w-6 h-6 text-emerald-400" />
            Configurable Approval Workflow Engine
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Sequential & parallel approval gates for Purchase Orders, Payment Vouchers, Discounts, and Work Orders.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <TTSButton text={workflowSpeech} label="Workflow Audio" />
        </div>
      </div>

      <div className="space-y-4">
        {workflows.map((wf) => (
          <div
            key={wf.id}
            className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4"
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div>
                <h3 className="font-bold text-slate-100 text-sm flex items-center gap-2">
                  <span>{wf.documentType.replace('_', ' ')} • {wf.documentNumber}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
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

            {/* Approval Steps Timeline */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {wf.steps.map((step) => (
                <div
                  key={step.stepNumber}
                  className={`p-3 rounded-xl border text-xs space-y-1 ${
                    step.status === 'APPROVED'
                      ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200'
                      : 'bg-slate-800/60 border-slate-700 text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between font-bold">
                    <span>Gate {step.stepNumber}: {step.approverRole.replace('_', ' ')}</span>
                    {step.status === 'APPROVED' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Clock className="w-4 h-4 text-amber-400 animate-pulse" />
                    )}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Status: <strong className="text-slate-200">{step.status}</strong>
                  </div>
                  {step.comment && <div className="text-[11px] italic text-slate-300">"{step.comment}"</div>}
                </div>
              ))}
            </div>

            {wf.overallStatus === 'PENDING' && (
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  onClick={() => handleApprove(wf.id)}
                  className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" /> Grant Executive Approval
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
