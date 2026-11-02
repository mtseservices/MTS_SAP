import React, { useState } from 'react';
import { Palette, Upload, Type, LayoutTemplate } from 'lucide-react';

interface BrandingProps {
  initialBranding?: any;
  onSave: (branding: any) => void;
  isGlobal?: boolean;
}

export const BrandingConfigurator: React.FC<BrandingProps> = ({ initialBranding, onSave, isGlobal }) => {
  const [branding, setBranding] = useState(initialBranding || {
    primaryColor: '#6366f1',
    secondaryColor: '#ec4899',
    fontFamily: 'sans-serif',
    borderRadius: 8
  });

  const handleChange = (key: string, value: any) => {
    setBranding({ ...branding, [key]: value });
  };

  return (
    <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-6">
      <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
        <Palette className="w-5 h-5 text-purple-400" />
        {isGlobal ? 'Global Branding Defaults' : 'Tenant Branding Customization'}
      </h2>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1">Primary Color</label>
          <input type="color" value={branding.primaryColor} onChange={(e) => handleChange('primaryColor', e.target.value)} className="w-full h-10 rounded-lg cursor-pointer" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1">Secondary Color</label>
          <input type="color" value={branding.secondaryColor} onChange={(e) => handleChange('secondaryColor', e.target.value)} className="w-full h-10 rounded-lg cursor-pointer" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1">Font Family</label>
          <select value={branding.fontFamily} onChange={(e) => handleChange('fontFamily', e.target.value)} className="w-full p-2 rounded-lg bg-slate-800 text-slate-100 border border-slate-700 text-xs">
            <option value="sans-serif">Sans Serif</option>
            <option value="serif">Serif</option>
            <option value="monospace">Monospace</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1">Border Radius (px)</label>
          <input type="number" value={branding.borderRadius} onChange={(e) => handleChange('borderRadius', Number(e.target.value))} className="w-full p-2 rounded-lg bg-slate-800 text-slate-100 border border-slate-700 text-xs" />
        </div>
      </div>

      <button onClick={() => onSave(branding)} className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-2 rounded-xl text-sm transition-all">
        Save Branding Configuration
      </button>
    </div>
  );
};
