import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Volume2, Sparkles, CheckCircle2 } from 'lucide-react';
import { ActiveTab } from './Sidebar';
import { speakText } from '../../services/ttsService';

interface VoiceNavigationProps {
  onNavigateTab: (tab: ActiveTab) => void;
}

export const VoiceNavigationWidget: React.FC<VoiceNavigationProps> = ({ onNavigateTab }) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    // Check speech recognition support
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;
  }, []);

  const startListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser. Please use Chrome or Edge.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
      setFeedback('Listening for voice command...');
      speakText('Listening for voice command. Say open dashboard, inventory, accounts, sales, procurement, production, hr, reports, or settings.');
    };

    recognition.onresult = (event: any) => {
      const speechResult = event.results[0][0].transcript.toLowerCase();
      setTranscript(speechResult);
      processVoiceCommand(speechResult);
    };

    recognition.onerror = (event: any) => {
      setFeedback(`Speech error: ${event.error}`);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const processVoiceCommand = (cmd: string) => {
    if (cmd.includes('dashboard') || cmd.includes('home')) {
      executeNavigation('dashboard', 'Dashboard');
    } else if (cmd.includes('account') || cmd.includes('finance') || cmd.includes('ledger')) {
      executeNavigation('finance', 'Finance and Accounts Module');
    } else if (cmd.includes('procurement') || cmd.includes('purchase') || cmd.includes('po')) {
      executeNavigation('procurement', 'Procurement and Purchase Orders Module');
    } else if (cmd.includes('inventory') || cmd.includes('stock') || cmd.includes('warehouse')) {
      executeNavigation('inventory', 'Inventory and Warehouse Module');
    } else if (cmd.includes('sale') || cmd.includes('pos') || cmd.includes('invoice')) {
      executeNavigation('sales', 'Sales POS and Invoicing Module');
    } else if (cmd.includes('production') || cmd.includes('manufacturing')) {
      executeNavigation('production', 'Production and BOM Module');
    } else if (cmd.includes('hr') || cmd.includes('payroll') || cmd.includes('employee')) {
      executeNavigation('hr', 'HR and Payroll Module');
    } else if (cmd.includes('report') || cmd.includes('analytics')) {
      executeNavigation('reports', 'Reporting Engine and Scheduled Exports Module');
    } else if (cmd.includes('approval') || cmd.includes('workflow')) {
      executeNavigation('approvals', 'Approval Workflows Module');
    } else if (cmd.includes('ai') || cmd.includes('assistant') || cmd.includes('gemini')) {
      executeNavigation('aiAssistant', 'Gemini AI Enterprise Assistant Module');
    } else if (cmd.includes('setting') || cmd.includes('profile') || cmd.includes('company')) {
      executeNavigation('companySettings', 'Company Settings and Profile Module');
    } else {
      setFeedback(`Command not recognized: "${cmd}". Try saying "Open Inventory" or "Open Dashboard".`);
      speakText(`Command not recognized. Please try again.`);
    }
  };

  const executeNavigation = (tab: ActiveTab, label: string) => {
    setFeedback(`Navigating to ${label}...`);
    speakText(`Navigating to ${label}`);
    onNavigateTab(tab);
    setTimeout(() => {
      setFeedback(null);
      setTranscript('');
    }, 3000);
  };

  return (
    <div className="relative">
      <button
        onClick={startListening}
        title="Voice Navigation & AI Commands"
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs transition-all shadow-md ${
          isListening
            ? 'bg-gradient-to-r from-rose-600 to-amber-600 text-white animate-pulse border border-rose-400'
            : 'bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-slate-700'
        }`}
      >
        {isListening ? <Mic className="w-4 h-4 animate-bounce text-white" /> : <Mic className="w-4 h-4 text-cyan-400" />}
        <span className="hidden sm:inline">{isListening ? 'Listening...' : 'Voice Nav'}</span>
      </button>

      {feedback && (
        <div className="absolute right-0 mt-2 w-72 bg-slate-900 border border-cyan-500/40 rounded-xl p-3 shadow-2xl z-50 text-xs text-slate-100 space-y-1 animate-in fade-in">
          <div className="flex items-center justify-between text-cyan-400 font-bold border-b border-slate-800 pb-1">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Gemini Voice Navigation
            </span>
            <span className="text-[10px] bg-cyan-500/20 text-cyan-300 px-1.5 py-0.5 rounded">Active</span>
          </div>
          <p className="text-slate-300 font-medium">{feedback}</p>
          {transcript && <p className="text-[11px] text-slate-400 font-mono">Heard: "{transcript}"</p>}
        </div>
      )}
    </div>
  );
};
