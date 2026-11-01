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

function MainLayout() {
  const { isMasterPortal, switchTenantBySlug } = useAuthTenant();
  const [activeTab, setActiveTab] = useState<ActiveTab>(
    isMasterPortal ? 'masterDashboard' : 'dashboard'
  );

  const handleRegisterSuccess = (slug: string) => {
    switchTenantBySlug(slug);
    setActiveTab('dashboard');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 font-sans">
      <Header
        onOpenNewCompanyModal={() => setActiveTab('masterRegister')}
        onSelectTab={(tab) => setActiveTab(tab)}
      />

      <div className="flex-1 flex overflow-hidden">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

        <main className="flex-1 overflow-y-auto bg-slate-950">
          {/* Master Admin Portal Views */}
          {isMasterPortal && activeTab === 'masterDashboard' && (
            <MasterDashboard
              onNavigateRegister={() => setActiveTab('masterRegister')}
              onNavigateCompanies={() => setActiveTab('masterCompanies')}
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

          {/* Client Tenant ERP Views */}
          {!isMasterPortal && activeTab === 'dashboard' && (
            <ClientDashboard onNavigateTab={(tab) => setActiveTab(tab)} />
          )}

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
        </main>
      </div>

      {/* Floating Multi-Turn Gemini AI Chatbot Drawer */}
      <GeminiChatbotDrawer />
    </div>
  );
}

export default function App() {
  return (
    <AuthTenantProvider>
      <MainLayout />
    </AuthTenantProvider>
  );
}
