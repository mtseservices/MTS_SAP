import React, { useState } from 'react';
import { Sparkles, Volume2, Send, Loader2, Bot, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { useAuthTenant } from '../../context/AuthTenantContext';
import { requestAIAnalysis } from '../../services/aiService';
import { TTSButton } from '../common/TTSButton';

export const AiAssistantModule: React.FC = () => {
  const { currentCompany } = useAuthTenant();
  const [prompt, setPrompt] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiOutput, setAiOutput] = useState<string | null>(
    `[MTS AI ERP Insights for ${currentCompany.name}]\n- Revenue Trend: Gross Sales standing at PKR 148 Million, showing strong growth in Q3.\n- Stock Health: Raw material flour inventory safe for next 42 days of factory production.\n- Compliance Audit: 100% of issued vouchers compliant with Pakistan NTN and 18% STRN sales tax regulations.`
  );

  const handleAsk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setIsAnalyzing(true);
    const result = await requestAIAnalysis(prompt, { company: currentCompany }, 'Executive AI Analyst');
    setIsAnalyzing(false);
    setAiOutput(result.analysis);
  };

  const assistantSpeech = aiOutput || `Gemini AI Enterprise Assistant for ${currentCompany.name}.`;

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl font-black text-slate-100 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-cyan-400" />
            Gemini AI Assistant & Voice Center (TTS)
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Powered by @google/genai SDK with gemini-3.8-flash-tts text-to-speech narration and automated ERP accounting insight scanning.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <TTSButton text={assistantSpeech} label="Narrate Gemini Response" size="lg" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chat / Query Input */}
        <div className="lg:col-span-1 p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-2">
            <Bot className="w-4 h-4" /> Ask Gemini AI
          </h2>

          <form onSubmit={handleAsk} className="space-y-3">
            <textarea
              rows={4}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. Analyze current cash flow, check inventory reorder levels, or evaluate STRN tax liability..."
              className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:border-cyan-500"
            />

            <button
              type="submit"
              disabled={isAnalyzing}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-cyan-600/30 flex items-center justify-center gap-2 transition-all"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Analyzing ERP Data...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" /> Run AI Business Analysis
                </>
              )}
            </button>
          </form>

          <div className="pt-3 border-t border-slate-800 space-y-2">
            <div className="text-[11px] font-bold text-slate-400 uppercase">Suggested AI Prompts:</div>
            <button
              onClick={() => setPrompt('Summarize our top 3 customer receivables and payment aging.')}
              className="w-full text-left p-2 rounded-lg bg-slate-800/60 hover:bg-slate-800 text-[11px] text-cyan-300 border border-slate-700/60"
            >
              • "Summarize customer receivables aging"
            </button>
            <button
              onClick={() => setPrompt('Audit inventory for near-expiry batches and reorder levels.')}
              className="w-full text-left p-2 rounded-lg bg-slate-800/60 hover:bg-slate-800 text-[11px] text-cyan-300 border border-slate-700/60"
            >
              • "Audit raw material stock for reorders"
            </button>
          </div>
        </div>

        {/* AI Output Box */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Gemini AI Executive Insight Output
            </h2>
            <TTSButton text={assistantSpeech} label="Listen Voice" />
          </div>

          <div className="p-5 rounded-xl bg-slate-800/60 border border-slate-700/80 text-xs text-slate-200 font-mono whitespace-pre-line leading-relaxed">
            {aiOutput}
          </div>
        </div>
      </div>
    </div>
  );
};
