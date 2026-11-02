import React from 'react';
import { DocumentScanner } from './DocumentScanner';
import { X } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onScanComplete: (data: string) => void;
}

export const DocumentScannerModal: React.FC<Props> = ({ isOpen, onClose, onScanComplete }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-lg w-full space-y-4 shadow-2xl animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wider text-purple-400">
            Document Invoice Scanner
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>
        <DocumentScanner onScanComplete={(data) => { onScanComplete(data); onClose(); }} />
      </div>
    </div>
  );
};
