import React, { useState } from 'react';
import { AuthTenantProvider, useAuthTenant } from './context/AuthTenantContext';
import { Header } from './components/common/Header';
import { Sidebar, ActiveTab } from './components/common/Sidebar';
import { GeminiChatbotDrawer } from './components/common/GeminiChatbotDrawer';
import { AuditLogViewer } from './components/common/AuditLogViewer';

// Master Admin Views
import { MasterDashboard } from './components/master/MasterDashboard';
import { CompanyRegistrationWizard } from './components/master/CompanyRegistrationWizard';
import { TenantManagement } from './components/master/TenantManagement';
import { SubscriptionBillingManager } from './components/master/SubscriptionBillingManager';
import { SystemHealthWidget } from './components/master/SystemHealthWidget';
import { RateLimitManager } from './components/master/RateLimitManager';
import { MasterSettingsDashboard } from './components/master/MasterSettingsDashboard';
import { UserCreationManager } from './components/master/UserCreationManager';
import { SystemApiAuditViewer } from './components/master/SystemApiAuditViewer';
import { AuditInsightsDashboard } from './components/master/AuditInsightsDashboard';

// Client Tenant ERP Views
import { ClientDashboard } from './components/client/ClientDashboard';
import { FinanceAccountsModule } from './components/client/FinanceAccountsModule';
import { ProcurementModule } from './components/client/ProcurementModule';
import { InventoryModule } from './components/client/InventoryModule';
import { SalesPosModule } from './components/client/SalesPosModule';
import { ProductionModule } from './components/client/ProductionModule';
import { HrPayrollModule } from './components/client/HrPayrollModule';
import { FormBuilderModule } from './components/client/FormBuilderModule';
import { ReportingEngineModule } from './components/client/ReportingEngineModule';
import { ApprovalWorkflowModule } from './components/client/ApprovalWorkflowModule';
import { AiAssistantModule } from './components/client/AiAssistantModule';
import { CompanySettingsModule } from './components/client/CompanySettingsModule';
import { CrmModule } from './components/client/CrmModule';
import { DepartmentMasterModule } from './components/client/DepartmentMasterModule';
import { PerformanceMetricsDashboard } from './components/client/PerformanceMetricsDashboard';

import { LanguageProvider } from './context/LanguageContext';
import { MasterLoginModal } from './components/common/MasterLoginModal';
import { initOfflineSyncListener } from './services/offlineSyncService';

function MainLayout() {
  const { isMasterPortal, switchTenantBySlug } = useAuthTenant();

  // Read URL query params on initial mount
  const getInitialState = (): { tab: ActiveTab; companySlug?: string } => {
    const params = new URLSearchParams(window.location.search);
    const moduleParam = params.get('module') as ActiveTab;
    const companyParam = params.get('company');

    const validTabs: ActiveTab[] = [
      'dashboard', 'departments', 'finance', 'procurement', 'inventory', 'sales',
      'production', 'hr', 'formBuilder', 'reports', 'approvals',
      'aiAssistant', 'auditLogs', 'companySettings', 'crm', 'performanceMetrics', 'masterDashboard',
      'masterCompanies', 'masterSubdomains', 'masterRegister',
      'masterSubscriptions', 'masterAudit', 'masterApiAudit', 'masterAuditInsights', 'masterSystemHealth', 'masterRateLimits',
      'masterSettings', 'masterUserCreation'
    ];

    const targetTab = (moduleParam && validTabs.includes(moduleParam))
      ? moduleParam
      : (isMasterPortal ? 'masterDashboard' : 'dashboard');

    return { tab: targetTab, companySlug: companyParam || undefined };
  };

  const initialState = getInitialState();
  const [activeTab, setActiveTab] = useState<ActiveTab>(initialState.tab);

  React.useEffect(() => {
    if (initialState.companySlug) {
      switchTenantBySlug(initialState.companySlug);
    }
    // Initialize background sync and offline reconciliation
    initOfflineSyncListener((res) => {
      console.log(`Successfully reconciled ${res.successCount} offline queue items with Firestore.`);
    });
  }, []);

  const handleSelectTab = (tab: ActiveTab, subcategory?: string, subtab?: string) => {
    setActiveTab(tab);
    const url = new URL(window.location.href);
    url.searchParams.set('module', tab);
    if (subcategory) {
      url.searchParams.set('subcategory', subcategory);
    } else {
      url.searchParams.delete('subcategory');
    }
    if (subtab) {
      url.searchParams.set('subtab', subtab);
    } else {
      url.searchParams.delete('subtab');
    }
    window.history.pushState({}, '', url.toString());
  };

  const handleRegisterSuccess = (slug: string) => {
    switchTenantBySlug(slug);
    handleSelectTab('dashboard');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 font-sans">
      <Header
        onOpenNewCompanyModal={() => handleSelectTab('masterRegister')}
        onSelectTab={(tab) => handleSelectTab(tab)}
      />

      <div className="flex-1 flex overflow-hidden">
        <Sidebar activeTab={activeTab} setActiveTab={handleSelectTab} />

        <main className="flex-1 overflow-y-auto bg-slate-950">
          {/* Master Admin Portal Views */}
          {isMasterPortal && activeTab === 'masterDashboard' && (
            <MasterDashboard
              onNavigateRegister={() => setActiveTab('masterRegister')}
              onNavigateCompanies={() => setActiveTab('masterCompanies')}
              onNavigateApiAudit={() => setActiveTab('masterApiAudit')}
              onNavigateAuditInsights={() => setActiveTab('masterAuditInsights')}
            />
          )}

          {isMasterPortal && (activeTab === 'masterCompanies' || activeTab === 'masterSubdomains') && (
            <TenantManagement />
          )}

          {isMasterPortal && activeTab === 'masterRegister' && (
            <CompanyRegistrationWizard onSuccess={handleRegisterSuccess} />
          )}

          {isMasterPortal && activeTab === 'masterSubscriptions' && (
            <SubscriptionBillingManager />
          )}

          {isMasterPortal && activeTab === 'masterAudit' && (
            <AuditLogViewer />
          )}

          {isMasterPortal && activeTab === 'masterApiAudit' && (
            <SystemApiAuditViewer onNavigateAuditInsights={() => setActiveTab('masterAuditInsights')} />
          )}

          {isMasterPortal && activeTab === 'masterAuditInsights' && (
            <AuditInsightsDashboard
              onNavigateRateLimits={() => setActiveTab('masterRateLimits')}
              onNavigateApiAudit={() => setActiveTab('masterApiAudit')}
            />
          )}

          {isMasterPortal && activeTab === 'masterSystemHealth' && (
            <div className="p-6">
              <SystemHealthWidget />
            </div>
          )}

          {isMasterPortal && activeTab === 'masterRateLimits' && (
            <RateLimitManager />
          )}

          {isMasterPortal && activeTab === 'masterSettings' && (
            <MasterSettingsDashboard />
          )}

          {isMasterPortal && activeTab === 'masterUserCreation' && (
            <UserCreationManager />
          )}

          {/* Client Tenant ERP Views */}
          {!isMasterPortal && activeTab === 'dashboard' && (
            <ClientDashboard onNavigateTab={(tab) => setActiveTab(tab)} />
          )}

          {!isMasterPortal && activeTab === 'departments' && <DepartmentMasterModule />}
          {!isMasterPortal && activeTab === 'finance' && <FinanceAccountsModule />}
          {!isMasterPortal && activeTab === 'procurement' && <ProcurementModule />}
          {!isMasterPortal && activeTab === 'inventory' && <InventoryModule />}
          {!isMasterPortal && activeTab === 'sales' && <SalesPosModule />}
          {!isMasterPortal && activeTab === 'production' && <ProductionModule />}
          {!isMasterPortal && activeTab === 'hr' && <HrPayrollModule />}
          {!isMasterPortal && activeTab === 'formBuilder' && <FormBuilderModule />}
          {!isMasterPortal && activeTab === 'reports' && <ReportingEngineModule />}
          {!isMasterPortal && activeTab === 'approvals' && <ApprovalWorkflowModule />}
          {!isMasterPortal && activeTab === 'aiAssistant' && <AiAssistantModule />}
          {!isMasterPortal && activeTab === 'auditLogs' && <AuditLogViewer />}
          {!isMasterPortal && activeTab === 'companySettings' && <CompanySettingsModule />}
          {!isMasterPortal && activeTab === 'crm' && <CrmModule />}
          {!isMasterPortal && activeTab === 'performanceMetrics' && <PerformanceMetricsDashboard />}
        </main>
      </div>

      {/* Floating Multi-Turn Gemini AI Chatbot Drawer */}
      <GeminiChatbotDrawer />
    </div>
  );
}

function RootApp() {
  const { isAuthenticated } = useAuthTenant();

  if (!isAuthenticated) {
    return <MasterLoginModal isStandalone={true} />;
  }

  return <MainLayout />;
}

export default function App() {
  return (
    <LanguageProvider>
      <AuthTenantProvider>
        <RootApp />
      </AuthTenantProvider>
    </LanguageProvider>
  );
}
