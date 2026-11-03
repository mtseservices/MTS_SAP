import React from 'react';
import { Building2, AlertTriangle, ArrowLeft, ShieldAlert, ExternalLink, Globe } from 'lucide-react';

interface TenantNotFoundViewProps {
  requestedSlug: string;
  onGoToMaster?: () => void;
}

export const TenantNotFoundView: React.FC<TenantNotFoundViewProps> = ({
  requestedSlug,
  onGoToMaster
}) => {
  const MASTER_PORTAL_URL = 'https://mts-sap.vercel.app/';

  const handleReturnToMaster = () => {
    if (onGoToMaster) {
      onGoToMaster();
    } else {
      window.location.href = '/?portal=master';
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-slate-950 flex items-center justify-center p-6 font-sans">
      <div className="max-w-lg w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-6 shadow-2xl relative overflow-hidden animate-in zoom-in-95">
        <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center gap-4 border-b border-slate-800 pb-5">
          <div className="w-14 h-14 rounded-2xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0">
            <AlertTriangle className="w-8 h-8 animate-bounce text-rose-400" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase text-rose-400 tracking-[0.2em] block font-mono">
              404 • Organization Not Found
            </span>
            <h2 className="text-xl font-black text-white">
              Tenant Portal Unavailable
            </h2>
          </div>
        </div>

        <div className="space-y-3 text-xs leading-relaxed text-slate-300 font-sans">
          <p>
            The requested client organization slug <strong className="text-rose-400 font-mono bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">"{requestedSlug}"</strong> does not exist in the active MTS-ERP company registry.
          </p>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 font-mono text-[11px]">
            <div className="flex justify-between items-center text-slate-400">
              <span>Requested Path:</span>
              <span className="text-slate-200 font-bold">/login/{requestedSlug}</span>
            </div>
            <div className="flex justify-between items-center text-slate-400">
              <span>Registry Status:</span>
              <span className="text-rose-400 font-bold">UNREGISTERED / DECOMMISSIONED</span>
            </div>
          </div>

          <p className="text-slate-400 text-[11px]">
            Please double-check the URL spelling or contact your system administrator to verify your enterprise login link.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 pt-3 border-t border-slate-800">
          <button
            type="button"
            onClick={handleReturnToMaster}
            className="w-full sm:flex-1 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 transition cursor-pointer"
          >
            <ShieldAlert className="w-4 h-4" />
            <span>Official Master User Portal</span>
          </button>

          <a
            href={MASTER_PORTAL_URL}
            className="w-full sm:w-auto px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer border border-slate-700"
          >
            <Globe className="w-4 h-4 text-cyan-400" />
            <span>Root Domain</span>
          </a>
        </div>
      </div>
    </div>
  );
};
