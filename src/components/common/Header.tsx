import React, { useState } from 'react';
import {
  Building2,
  GitBranch,
  ShieldAlert,
  Palette,
  UserCheck,
  ChevronDown,
  Layers,
  Sparkles,
  ExternalLink,
  PlusCircle,
  LogIn,
  LogOut,
  User,
  Globe
} from 'lucide-react';
import { useAuthTenant } from '../../context/AuthTenantContext';
import { useLanguage } from '../../context/LanguageContext';
import { LANGUAGES } from '../../services/translations';
import { OfflineBanner } from './OfflineBanner';
import { OnlineStatusIndicator } from './OnlineStatusIndicator';
import { TTSButton } from './TTSButton';
import { GlobalSearch } from './GlobalSearch';
import { NotificationCenter } from './NotificationCenter';
import { VoiceNavigationWidget } from './VoiceNavigationWidget';
import { MasterLoginModal } from './MasterLoginModal';
import { UserProfileModal } from './UserProfileModal';
import { CompanyProfileDrawer } from './CompanyProfileDrawer';
import { ThemePalette } from '../../types/erp';
import { ActiveTab } from './Sidebar';

interface HeaderProps {
  onOpenNewCompanyModal?: () => void;
  onSelectTab: (tab: ActiveTab) => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenNewCompanyModal, onSelectTab }) => {
  const {
    isMasterPortal,
    currentCompany,
    allCompanies,
    currentUser,
    currentBranch,
    setCurrentBranch,
    allBranches,
    theme,
    setTheme,
    switchTenantBySlug
  } = useAuthTenant();

  const { language, setLanguage, t } = useLanguage();

  const [showCompanyMenu, setShowCompanyMenu] = useState(false);
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showCompanyDrawer, setShowCompanyDrawer] = useState(false);

  const themes: { id: ThemePalette; label: string; color: string }[] = [
    { id: 'corporate-blue', label: 'Corporate Blue', color: 'bg-blue-600' },
    { id: 'enterprise-dark', label: 'Enterprise Dark', color: 'bg-slate-800' },
    { id: 'professional-green', label: 'Emerald Green', color: 'bg-emerald-600' },
    { id: 'royal-black-gold', label: 'Black & Gold', color: 'bg-amber-600' },
    { id: 'modern-light', label: 'Modern Indigo', color: 'bg-indigo-600' }
  ];

  const headerSpeechSummary = isMasterPortal
    ? `Master Control Panel for MTS ERP. Username: MTS-ERP-SAP. Password: Same. Managing ${allCompanies.length} enterprise tenant client companies.`
    : `${currentCompany.name} ERP Portal. Active branch: ${currentBranch.name}. NTN: ${currentCompany.ntn}.`;

  return (
    <>
      <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur border-b border-slate-800 px-4 py-2 flex items-center justify-between gap-3">
        {/* Left Branding & Tenant Switcher */}
        <div className="flex items-center gap-3">
          <div
            onClick={() => setShowCompanyDrawer(true)}
            className="flex items-center gap-2.5 cursor-pointer hover:opacity-90 transition-opacity"
            title="View Company Profile"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-600 to-purple-600 flex items-center justify-center font-black text-white text-lg shadow-lg shadow-cyan-500/20">
              MTS
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-100 tracking-wide text-sm">MTS-ERP-SAP</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/30">
                  v4.8 Enterprise
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium">Hybrid Cloud & Offline PWA</p>
            </div>
          </div>

          {/* Master vs Client Portal Toggle Pill (Master Admin Only) */}
          {currentUser.isMaster && (
            <div className="hidden lg:flex items-center bg-slate-800/90 rounded-lg p-1 border border-slate-700">
              <button
                onClick={() => {
                  switchTenantBySlug('master');
                  onSelectTab('masterDashboard');
                }}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                  isMasterPortal
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                Master Portal
              </button>
              <button
                onClick={() => {
                  switchTenantBySlug(allCompanies[0].slug);
                  onSelectTab('dashboard');
                }}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                  !isMasterPortal
                    ? 'bg-cyan-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                Client Tenant
              </button>
            </div>
          )}

          {/* Active Company Selector Dropdown */}
          {!isMasterPortal && (
            <div className="relative">
              <button
                onClick={() => setShowCompanyMenu(!showCompanyMenu)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/90 border border-slate-700 hover:border-slate-600 text-slate-200 text-xs font-medium transition-all"
              >
                <Building2 className="w-4 h-4 text-cyan-400" />
                <div className="text-left">
                  <div className="font-semibold text-slate-100 max-w-[140px] truncate">
                    {currentCompany.name}
                  </div>
                  <div className="text-[10px] text-cyan-400 font-mono">
                    mts-sap.vercel.app?company={currentCompany.slug}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-1" />
              </button>

              {showCompanyMenu && (
                <div className="absolute left-0 mt-2 w-72 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-2 z-50">
                  <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 border-b border-slate-800 uppercase tracking-wider">
                    Select Enterprise Tenant
                  </div>
                  <div className="py-1 max-h-60 overflow-y-auto space-y-1">
                    {allCompanies.map((comp) => (
                      <button
                        key={comp.id}
                        onClick={() => {
                          switchTenantBySlug(comp.slug);
                          setShowCompanyMenu(false);
                          onSelectTab('dashboard');
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg text-xs flex items-center justify-between transition-all ${
                          comp.id === currentCompany.id
                            ? 'bg-cyan-600/20 border border-cyan-500/40 text-cyan-200'
                            : 'hover:bg-slate-800 text-slate-300'
                        }`}
                      >
                        <div>
                          <div className="font-medium text-slate-100">{comp.name}</div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            {comp.code} • {comp.industry}
                          </div>
                        </div>
                        <ExternalLink className="w-3 h-3 text-slate-500" />
                      </button>
                    ))}
                  </div>

                  <div className="pt-2 mt-1 border-t border-slate-800">
                    <button
                      onClick={() => {
                        setShowCompanyMenu(false);
                        if (onOpenNewCompanyModal) onOpenNewCompanyModal();
                      }}
                      className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-cyan-600/30 hover:bg-cyan-600/50 text-cyan-200 text-xs font-medium border border-cyan-500/30 transition-all"
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
                      Register New Client Company
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Global Search Component */}
        <GlobalSearch onSelectTab={onSelectTab} />

        {/* Right Controls & Auth Profile */}
        <div className="flex items-center gap-2.5">
          {/* Branch Selector */}
          {!isMasterPortal && (
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800/80 border border-slate-700 text-xs text-slate-300">
              <GitBranch className="w-3.5 h-3.5 text-amber-400" />
              <select
                value={currentBranch.id}
                onChange={(e) => {
                  const found = allBranches.find(b => b.id === e.target.value);
                  if (found) setCurrentBranch(found);
                }}
                className="bg-transparent text-slate-200 text-xs font-medium focus:outline-none cursor-pointer"
              >
                {allBranches.map((br) => (
                  <option key={br.id} value={br.id} className="bg-slate-900 text-slate-200">
                    {br.name} ({br.code})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Centralized Notification Center */}
          <NotificationCenter onSelectTab={onSelectTab} />

          {/* Real-time Online/Offline Connectivity Status Indicator */}
          <OnlineStatusIndicator />

          {/* Offline Status Banner */}
          <OfflineBanner />

          {/* Voice Assistant TTS Button */}
          <TTSButton text={headerSpeechSummary} label="Header Voice" />

          {/* Voice Navigation Widget */}
          <VoiceNavigationWidget onNavigateTab={onSelectTab} />

          {/* Theme Picker */}
          <div className="relative">
            <button
              onClick={() => setShowThemeMenu(!showThemeMenu)}
              title="Theme Customizer"
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 transition-all cursor-pointer"
            >
              <Palette className="w-4 h-4 text-cyan-400" />
            </button>

            {showThemeMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-2 z-50">
                <div className="px-2 py-1 text-[11px] font-semibold text-slate-400 border-b border-slate-800 uppercase tracking-wider mb-1">
                  Company Theme
                </div>
                {themes.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => {
                      setTheme(t.id);
                      setShowThemeMenu(false);
                    }}
                    className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer ${
                      theme === t.id
                        ? 'bg-slate-800 text-cyan-300 border border-slate-700'
                        : 'hover:bg-slate-800/60 text-slate-300'
                    }`}
                  >
                    <span className={`w-3 h-3 rounded-full ${t.color}`} />
                    {t.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Multilingual Language Selector Toggle (English / Urdu / Arabic) */}
          <div className="relative">
            <button
              onClick={() => setShowLanguageMenu(!showLanguageMenu)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-bold transition-all cursor-pointer"
              title="Select ERP Interface Language (English / اردو / العربية)"
            >
              <Globe className="w-4 h-4 text-purple-400" />
              <span className="text-sm">{LANGUAGES.find(l => l.code === language)?.flag}</span>
              <span className="hidden md:inline uppercase">{language}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {showLanguageMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in">
                <div className="px-2 py-1 text-[10px] font-bold text-slate-400 border-b border-slate-800 uppercase tracking-wider mb-1">
                  Interface Language (زبان / اللغة)
                </div>
                {LANGUAGES.map((langOption) => (
                  <button
                    key={langOption.code}
                    onClick={() => {
                      setLanguage(langOption.code);
                      setShowLanguageMenu(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      language === langOption.code
                        ? 'bg-purple-600 text-white shadow-md'
                        : 'hover:bg-slate-800 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-base">{langOption.flag}</span>
                      <span>{langOption.nativeName}</span>
                    </div>
                    <span className="text-[10px] opacity-75 font-mono uppercase">{langOption.dir}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Login Portal Trigger Button */}
          <button
            onClick={() => setShowLoginModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 border border-purple-500/40 text-xs font-semibold transition-all cursor-pointer"
            title="Master / Tenant Login Portal"
          >
            <LogIn className="w-3.5 h-3.5 text-purple-300" />
            <span className="hidden sm:inline">Login Portal</span>
          </button>

          {/* User Profile Pill */}
          <div
            onClick={() => setShowUserModal(true)}
            className="flex items-center gap-2 pl-2 border-l border-slate-800 cursor-pointer hover:opacity-90 transition-opacity"
            title="User Profile & Account"
          >
            <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-xs text-cyan-400">
              {currentUser.name.charAt(0)}
            </div>
            <div className="hidden xl:block text-left">
              <div className="text-xs font-semibold text-slate-100 flex items-center gap-1">
                {currentUser.name}
                <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <div className="text-[10px] text-slate-400 font-mono">
                {currentUser.role.replace('_', ' ')}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Modals & Drawers */}
      <MasterLoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
      <UserProfileModal isOpen={showUserModal} onClose={() => setShowUserModal(false)} onOpenLogin={() => setShowLoginModal(true)} />
      <CompanyProfileDrawer isOpen={showCompanyDrawer} onClose={() => setShowCompanyDrawer(false)} />
    </>
  );
};
