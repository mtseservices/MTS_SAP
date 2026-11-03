import React, { useState } from 'react';
import {
  X,
  Palette,
  Layout,
  Monitor,
  Check,
  Moon,
  Sun,
  LayoutDashboard,
  Table as TableIcon,
  Maximize2,
  Minimize2,
  Lock,
  AppWindow,
  Sparkles,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useAuthTenant } from '../../context/AuthTenantContext';
import { ThemeMode, TableDensity, LoginTemplateId } from '../../types/erp';

interface StylePreviewDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const StylePreviewDrawer: React.FC<StylePreviewDrawerProps> = ({ isOpen, onClose }) => {
  const { currentCompany, updateCompanyBranding } = useAuthTenant();
  
  const currentMode = currentCompany.themeMode || 'dark';
  const currentDensity = currentCompany.tableDensity || 'standard';
  const currentLoginTemplate = currentCompany.loginTemplateId || 'split';
  const currentPrimaryColor = currentCompany.branding?.primaryColor;

  const [carouselIndex, setCarouselIndex] = useState(0);

  const modes: { id: ThemeMode; label: string; icon: any; color: string }[] = [
    { id: 'dark', label: 'Deep Obsidian', icon: Moon, color: 'bg-slate-950' },
    { id: 'slate-gray', label: 'Corporate Slate', icon: Monitor, color: 'bg-slate-900' },
    { id: 'light', label: 'Crisp Light', icon: Sun, color: 'bg-white' }
  ];

  const presetThemes = [
    {
      id: 'royal-gold',
      label: 'Royal Black & Gold Luxury',
      description: 'Opulent dark palette with gold accents',
      themeMode: 'dark' as ThemeMode,
      branding: {
        primaryColor: '#d4af37',
        secondaryColor: '#111827',
        fontFamily: 'serif',
        borderRadius: 12
      },
      accentGradient: 'from-amber-400 to-yellow-600'
    },
    {
      id: 'corporate-blue',
      label: 'Corporate Executive Blue',
      description: 'Professional deep Navy & Azure blue',
      themeMode: 'dark' as ThemeMode,
      branding: {
        primaryColor: '#2563eb',
        secondaryColor: '#1e293b',
        fontFamily: 'sans-serif',
        borderRadius: 8
      },
      accentGradient: 'from-blue-600 to-cyan-500'
    },
    {
      id: 'emerald-green',
      label: 'Emerald Textile Green',
      description: 'Lush forest green & mint for trade',
      themeMode: 'dark' as ThemeMode,
      branding: {
        primaryColor: '#059669',
        secondaryColor: '#064e3b',
        fontFamily: 'sans-serif',
        borderRadius: 8
      },
      accentGradient: 'from-emerald-500 to-teal-600'
    },
    {
      id: 'crimson-steel',
      label: 'Crimson Industrial Steel',
      description: 'High-contrast manufacturing steel',
      themeMode: 'dark' as ThemeMode,
      branding: {
        primaryColor: '#dc2626',
        secondaryColor: '#1c1917',
        fontFamily: 'monospace',
        borderRadius: 6
      },
      accentGradient: 'from-red-600 to-amber-600'
    }
  ];

  const activePreset = presetThemes[carouselIndex];

  const handleNextSlide = () => {
    setCarouselIndex((prev) => (prev + 1) % presetThemes.length);
  };

  const handlePrevSlide = () => {
    setCarouselIndex((prev) => (prev - 1 + presetThemes.length) % presetThemes.length);
  };

  const densities: { id: TableDensity; label: string; icon: any; description: string }[] = [
    { id: 'standard', label: 'Comfortable', icon: Maximize2, description: 'Standard row spacing for visibility' },
    { id: 'compact', label: 'High Density', icon: Minimize2, description: 'Condensed rows for heavy data' }
  ];

  const loginTemplates: { id: LoginTemplateId; label: string; description: string }[] = [
    { id: 'split', label: 'Executive Split', description: 'Left image, right form' },
    { id: 'minimal', label: 'Minimalist Modern', description: 'Centered clean layout' },
    { id: 'glass', label: 'Floating Glass', description: 'Translucent frosted UI' },
    { id: 'terminal', label: 'Classic SAP', description: 'Blue gradient corporate' }
  ];

  const handleModeChange = (mode: ThemeMode) => {
    updateCompanyBranding(currentCompany.id, { themeMode: mode });
    if (mode === 'light') {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.remove('slate-gray');
    } else if (mode === 'slate-gray') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.add('slate-gray');
    } else {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('slate-gray');
    }
  };

  const handleApplyPreset = (preset: typeof presetThemes[0]) => {
    updateCompanyBranding(currentCompany.id, {
      themeMode: preset.themeMode,
      branding: preset.branding
    });
    handleModeChange(preset.themeMode);
  };

  const handleDensityChange = (density: TableDensity) => {
    updateCompanyBranding(currentCompany.id, { tableDensity: density });
  };

  const handleLoginTemplateChange = (templateId: LoginTemplateId) => {
    updateCompanyBranding(currentCompany.id, { loginTemplateId: templateId });
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-[60] transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div className={`fixed top-0 right-0 h-full w-80 sm:w-96 bg-slate-900 border-l border-slate-800 shadow-2xl z-[70] transform transition-transform duration-300 ease-in-out flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
          <div className="flex items-center gap-2">
            <Palette className="w-5 h-5 text-cyan-400" />
            <h2 className="text-sm font-black text-slate-100 uppercase tracking-widest">Workspace Styler</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {/* Visual Carousel for Preset Professional Themes */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Preset Theme Carousel</h3>
              </div>
              <div className="flex items-center gap-1">
                <button 
                  onClick={handlePrevSlide}
                  className="p-1 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button 
                  onClick={handleNextSlide}
                  className="p-1 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Carousel Card */}
            <div className="relative bg-slate-950/80 border border-slate-800 rounded-2xl p-4 overflow-hidden shadow-xl">
              {/* Thumbnail Mockup */}
              <div 
                className="w-full h-36 rounded-xl mb-3 p-3 flex flex-col justify-between border shadow-inner transition-all duration-300"
                style={{
                  backgroundColor: activePreset.branding.secondaryColor,
                  borderColor: activePreset.branding.primaryColor + '55',
                  borderRadius: `${activePreset.branding.borderRadius * 1.5}px`,
                  fontFamily: activePreset.branding.fontFamily
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: activePreset.branding.primaryColor }} 
                    />
                    <span className="text-[10px] font-bold text-slate-200 tracking-wider uppercase">Dashboard Preview</span>
                  </div>
                  <span className="text-[9px] px-2 py-0.5 rounded-full font-mono text-white" style={{ backgroundColor: activePreset.branding.primaryColor }}>
                    {activePreset.label.split(' ')[0]}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-slate-900/60 p-2 rounded border border-slate-800 text-[9px] text-slate-400">
                    <div className="text-slate-200 font-bold text-xs">$24,800</div>
                    <div>Revenue</div>
                  </div>
                  <div className="bg-slate-900/60 p-2 rounded border border-slate-800 text-[9px] text-slate-400">
                    <div className="text-slate-200 font-bold text-xs">142 Orders</div>
                    <div>Active</div>
                  </div>
                  <div className="bg-slate-900/60 p-2 rounded border border-slate-800 text-[9px] text-slate-400">
                    <div className="text-slate-200 font-bold text-xs">99.8%</div>
                    <div>Uptime</div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <div 
                    className="h-2 w-16 rounded-full" 
                    style={{ backgroundColor: activePreset.branding.primaryColor }} 
                  />
                </div>
              </div>

              {/* Details & Action */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black text-slate-100">{activePreset.label}</h4>
                  <span className="text-[9px] text-slate-400 font-mono">Slide {carouselIndex + 1} of {presetThemes.length}</span>
                </div>
                <p className="text-[10px] text-slate-400 leading-relaxed">{activePreset.description}</p>
                
                <button
                  onClick={() => handleApplyPreset(activePreset)}
                  className={`w-full py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer flex items-center justify-center gap-2 ${
                    currentPrimaryColor === activePreset.branding.primaryColor
                      ? 'bg-emerald-600 text-white shadow-emerald-900/20'
                      : 'bg-slate-800 text-slate-100 hover:bg-slate-700'
                  }`}
                >
                  {currentPrimaryColor === activePreset.branding.primaryColor ? (
                    <>
                      <Check className="w-3.5 h-3.5" /> Applied Theme
                    </>
                  ) : (
                    'Apply Preset Theme'
                  )}
                </button>
              </div>

              {/* Dot Navigation */}
              <div className="flex items-center justify-center gap-1.5 mt-3 pt-3 border-t border-slate-800/60">
                {presetThemes.map((p, idx) => (
                  <button
                    key={p.id}
                    onClick={() => setCarouselIndex(idx)}
                    className={`h-1.5 rounded-full transition-all cursor-pointer ${
                      carouselIndex === idx 
                        ? 'w-6 bg-cyan-400 shadow-sm' 
                        : 'w-1.5 bg-slate-700 hover:bg-slate-600'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Theme Mode Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-1 h-4 bg-cyan-500 rounded-full" />
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">UI Color Palette</h3>
            </div>
            
            <div className="grid grid-cols-1 gap-2.5">
              {modes.map((mode) => {
                const isActive = currentMode === mode.id;
                return (
                  <button
                    key={mode.id}
                    onClick={() => handleModeChange(mode.id)}
                    className={`p-3.5 rounded-2xl border text-left transition-all flex items-center justify-between group cursor-pointer ${
                      isActive 
                        ? 'bg-cyan-500/10 border-cyan-500/50 text-cyan-100 shadow-lg shadow-cyan-900/20' 
                        : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center border ${isActive ? 'bg-cyan-500 border-cyan-400 text-white' : 'bg-slate-800 border-slate-700 text-slate-500 group-hover:text-slate-300'}`}>
                        <mode.icon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold">{mode.label}</div>
                        <div className="text-[10px] text-slate-500">Global workspace theme</div>
                      </div>
                    </div>
                    {isActive && (
                      <div className="w-5 h-5 rounded-full bg-cyan-500 flex items-center justify-center">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Table Density Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-1 h-4 bg-purple-500 rounded-full" />
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Grid Data Density</h3>
            </div>
            
            <div className="flex gap-2">
              {densities.map((density) => {
                const isActive = currentDensity === density.id;
                return (
                  <button
                    key={density.id}
                    onClick={() => handleDensityChange(density.id)}
                    className={`flex-1 p-3 rounded-2xl border text-center transition-all group cursor-pointer ${
                      isActive 
                        ? 'bg-purple-500/10 border-purple-500/50 text-purple-100' 
                        : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <density.icon className={`w-5 h-5 mx-auto mb-2 ${isActive ? 'text-purple-400' : 'text-slate-500 group-hover:text-slate-300'}`} />
                    <div className="text-xs font-bold">{density.label}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Login Template Preview Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-1 h-4 bg-amber-500 rounded-full" />
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Login Portal Layout</h3>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              {loginTemplates.map((template) => {
                const isActive = currentLoginTemplate === template.id;
                return (
                  <button
                    key={template.id}
                    onClick={() => handleLoginTemplateChange(template.id)}
                    className={`p-3 rounded-2xl border text-left transition-all group cursor-pointer ${
                      isActive 
                        ? 'bg-amber-500/10 border-amber-500/50 text-amber-100 shadow-sm' 
                        : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${isActive ? 'bg-amber-500 text-white' : 'bg-slate-800 text-slate-500'}`}>
                        <AppWindow className="w-3.5 h-3.5" />
                      </div>
                      {isActive && <Check className="w-3 h-3 text-amber-500" />}
                    </div>
                    <div className="text-[10px] font-black uppercase tracking-tight">{template.label}</div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-slate-800 bg-slate-950/50">
          <button
            onClick={onClose}
            className="w-full py-3 rounded-xl bg-slate-100 text-slate-900 font-black text-xs uppercase tracking-widest hover:bg-white transition-all shadow-xl shadow-white/5 active:scale-[0.98] cursor-pointer"
          >
            Apply & Save Styling
          </button>
        </div>
      </div>
    </>
  );
};
