import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { QrCode, Clipboard } from 'lucide-react';
import { useAuthTenant } from '../../context/AuthTenantContext';

export const QrGeneratorModule: React.FC = () => {
  const { currentCompany } = useAuthTenant();
  const [taskContext, setTaskContext] = useState('');
  const [qrValue, setQrValue] = useState('');

  const generateQr = () => {
    // Generate a URL that links to a check-in endpoint for the tenant
    const baseUrl = window.location.origin;
    const url = `${baseUrl}/company/${currentCompany.slug}/checkin?task=${encodeURIComponent(taskContext)}`;
    setQrValue(url);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
      <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
        <QrCode className="w-5 h-5 text-cyan-400" />
        Employee Check-in QR Generator
      </h2>
      
      <div className="space-y-3">
        <input 
          type="text" 
          placeholder="Enter Task ID or Check-in Location" 
          value={taskContext}
          onChange={(e) => setTaskContext(e.target.value)}
          className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white"
        />
        <button 
          onClick={generateQr}
          className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs cursor-pointer"
        >
          Generate QR Code
        </button>
      </div>

      {qrValue && (
        <div className="flex flex-col items-center gap-3 p-4 bg-white rounded-xl">
          <QRCodeSVG value={qrValue} size={200} />
          <div className="text-xs text-slate-900 font-mono break-all text-center">
            {qrValue}
          </div>
        </div>
      )}
    </div>
  );
};
