import React, { useState, useEffect, useCallback } from 'react';
import { 
  ChevronRight, 
  ArrowLeft, 
  Save, 
  Printer, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  Loader2,
  FileText
} from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  onClick?: () => void;
  active?: boolean;
}

export interface BaseFormLayoutProps {
  title: string;
  subtitle?: string;
  breadcrumbs: BreadcrumbItem[];
  documentRef?: string;
  statusBadge?: string;
  draftSavedAt?: string | null;
  variant?: 'standard' | 'grid-ledger';
  isSubmitting?: boolean;
  submitLabel?: string;
  isDirty?: boolean;
  onSaveDraft?: () => void;
  onSubmit?: (e?: React.FormEvent) => void;
  onPrintPreview?: () => void;
  onDiscard: () => void;
  extraActions?: React.ReactNode;
  children: React.ReactNode;
}

export const BaseFormLayout: React.FC<BaseFormLayoutProps> = ({
  title,
  subtitle,
  breadcrumbs,
  documentRef,
  statusBadge = 'DRAFT',
  draftSavedAt,
  variant = 'grid-ledger',
  isSubmitting = false,
  submitLabel = 'Post & Commit',
  isDirty = false,
  onSaveDraft,
  onSubmit,
  onPrintPreview,
  onDiscard,
  extraActions,
  children
}) => {
  const [showDiscardConfirm, setShowDiscardConfirm] = useState<boolean>(false);

  const handleDiscardClick = () => {
    if (isDirty) {
      setShowDiscardConfirm(true);
    } else {
      onDiscard();
    }
  };

  // Keyboard shortcut listener: Ctrl+S (Save draft), Ctrl+Enter (Submit), Esc (Discard)
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
      e.preventDefault();
      if (onSaveDraft) onSaveDraft();
    } else if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      if (onSubmit && !isSubmitting) onSubmit();
    } else if (e.key === 'Escape') {
      if (showDiscardConfirm) {
        setShowDiscardConfirm(false);
      } else {
        handleDiscardClick();
      }
    }
  }, [onSaveDraft, onSubmit, isSubmitting, isDirty, showDiscardConfirm]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const containerMaxWidth = variant === 'standard' ? 'max-w-5xl' : 'max-w-7xl';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Sticky Header Action Bar */}
      <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800 shadow-xl transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 py-3.5">
            {/* Left: Breadcrumbs & Document Identity */}
            <div className="space-y-1">
              <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-slate-400">
                <button
                  type="button"
                  onClick={onDiscard}
                  className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors mr-1 cursor-pointer"
                  title="Return to list"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                {breadcrumbs.map((crumb, idx) => (
                  <React.Fragment key={crumb.label + idx}>
                    {idx > 0 && <ChevronRight className="w-3.5 h-3.5 text-slate-600 shrink-0" />}
                    {crumb.onClick && !crumb.active ? (
                      <button
                        type="button"
                        onClick={crumb.onClick}
                        className="hover:text-slate-200 transition-colors truncate max-w-[140px] sm:max-w-none cursor-pointer"
                      >
                        {crumb.label}
                      </button>
                    ) : (
                      <span className={crumb.active ? 'text-slate-200 font-medium truncate' : 'truncate'}>
                        {crumb.label}
                      </span>
                    )}
                  </React.Fragment>
                ))}
              </nav>

              <div className="flex items-center gap-3">
                <h1 className="text-lg sm:text-xl font-black text-slate-100 tracking-tight flex items-center gap-2">
                  <FileText className="w-5 h-5 text-cyan-400 shrink-0" />
                  <span>{title}</span>
                </h1>
                {documentRef && (
                  <span className="font-mono text-xs font-bold text-slate-300 bg-slate-900 border border-slate-700/80 px-2.5 py-0.5 rounded-lg tabular-nums">
                    {documentRef}
                  </span>
                )}
                <span className="text-[10px] font-mono uppercase tracking-wider font-bold px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400">
                  {statusBadge}
                </span>
              </div>
            </div>

            {/* Right: Actions Cluster */}
            <div className="flex items-center flex-wrap gap-2.5 shrink-0">
              {/* Draft Indicator */}
              {draftSavedAt && (
                <div className="hidden lg:flex items-center gap-1.5 text-xs text-emerald-400 font-mono bg-emerald-950/40 border border-emerald-900/60 px-2.5 py-1 rounded-xl">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Saved {draftSavedAt}</span>
                </div>
              )}

              {/* Extra Slot */}
              {extraActions}

              {/* Print Preview Button */}
              {onPrintPreview && (
                <button
                  type="button"
                  onClick={onPrintPreview}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-slate-100 text-xs font-bold transition-all cursor-pointer whitespace-nowrap shadow-sm"
                  title="Print or view formatted document"
                >
                  <Printer className="w-4 h-4 text-slate-400" />
                  <span className="hidden sm:inline">Print Preview</span>
                </button>
              )}

              {/* Save Draft Button */}
              {onSaveDraft && (
                <button
                  type="button"
                  onClick={onSaveDraft}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-cyan-400 hover:text-cyan-300 text-xs font-bold transition-all cursor-pointer whitespace-nowrap shadow-sm"
                  title="Save draft locally (Ctrl+S)"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Draft</span>
                </button>
              )}

              {/* Discard Button */}
              <button
                type="button"
                onClick={handleDiscardClick}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-rose-950/40 border border-slate-800 hover:border-rose-900/60 text-slate-400 hover:text-rose-300 text-xs font-bold transition-all cursor-pointer whitespace-nowrap"
                title="Discard transaction (Esc)"
              >
                <X className="w-4 h-4" />
                <span className="hidden sm:inline">Discard</span>
              </button>

              {/* Submit / Post Button (Primary Action) */}
              {onSubmit && (
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => onSubmit()}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white text-xs font-black transition-all cursor-pointer whitespace-nowrap shadow-lg shadow-cyan-600/30"
                  title="Post transaction to cloud ledger (Ctrl+Enter)"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Posting...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{submitLabel}</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {subtitle && (
            <p className="text-xs text-slate-400 pb-2.5 -mt-1 font-sans">
              {subtitle}
            </p>
          )}
        </div>
      </header>

      {/* Main Responsive Form Canvas */}
      <main className="flex-1 w-full py-6 sm:py-8 px-4 sm:px-6 lg:px-8">
        <div className={`${containerMaxWidth} mx-auto transition-all`}>
          {children}
        </div>
      </main>

      {/* Discard Confirmation Modal */}
      {showDiscardConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 font-sans">
            <div className="flex items-center gap-3 text-amber-400">
              <AlertCircle className="w-6 h-6 shrink-0" />
              <h3 className="text-base font-bold text-slate-100">Discard In-Progress Changes?</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              You have unsaved changes in this transaction form. Discarding will cancel this session and return to the list view.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowDiscardConfirm(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition cursor-pointer"
              >
                Keep Editing
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowDiscardConfirm(false);
                  onDiscard();
                }}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition shadow-lg shadow-rose-600/30 cursor-pointer"
              >
                Discard &amp; Exit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
