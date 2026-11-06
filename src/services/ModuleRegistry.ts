import React from 'react';
import { FinanceAccountsModule } from '../components/client/FinanceAccountsModule';
import { InventoryModule } from '../components/client/InventoryModule';
import { ProcurementModule } from '../components/client/ProcurementModule';
import { SalesPosModule } from '../components/client/SalesPosModule';
import { HrPayrollModule } from '../components/client/HrPayrollModule';
import { ProductionModule } from '../components/client/ProductionModule';
import { CrmModule } from '../components/client/CrmModule';
import { DepartmentMasterModule } from '../components/client/DepartmentMasterModule';
import { FormBuilderModule } from '../components/client/FormBuilderModule';
import { ReportingEngineModule } from '../components/client/ReportingEngineModule';
import { ApprovalWorkflowModule } from '../components/client/ApprovalWorkflowModule';
import { AiAssistantModule } from '../components/client/AiAssistantModule';
import { AuditLogViewer } from '../components/common/AuditLogViewer';
import { CompanySettingsModule } from '../components/client/CompanySettingsModule';
import { PerformanceMetricsDashboard } from '../components/client/PerformanceMetricsDashboard';

export interface ModuleRegistration {
  id: string;
  name: string;
  category: 'core' | 'operations' | 'manufacturing' | 'management' | 'system';
  component: React.ComponentType<any>;
}

export const MODULE_REGISTRY: Record<string, ModuleRegistration> = {
  finance: {
    id: 'finance',
    name: 'Accounts & Finance',
    category: 'core',
    component: FinanceAccountsModule
  },
  inventory: {
    id: 'inventory',
    name: 'Inventory & Store Management',
    category: 'core',
    component: InventoryModule
  },
  procurement: {
    id: 'procurement',
    name: 'Procurement / Purchase',
    category: 'core',
    component: ProcurementModule
  },
  sales: {
    id: 'sales',
    name: 'Sales Management & POS',
    category: 'core',
    component: SalesPosModule
  },
  hr: {
    id: 'hr',
    name: 'Human Resource Management',
    category: 'core',
    component: HrPayrollModule
  },
  production: {
    id: 'production',
    name: 'Production & Manufacturing',
    category: 'manufacturing',
    component: ProductionModule
  },
  crm: {
    id: 'crm',
    name: 'Customer Relationship Management',
    category: 'core',
    component: CrmModule
  },
  departments: {
    id: 'departments',
    name: 'Department Master',
    category: 'system',
    component: DepartmentMasterModule
  },
  formBuilder: {
    id: 'formBuilder',
    name: 'Form Builder',
    category: 'system',
    component: FormBuilderModule
  },
  reports: {
    id: 'reports',
    name: 'Reporting Engine',
    category: 'system',
    component: ReportingEngineModule
  },
  approvals: {
    id: 'approvals',
    name: 'Approval Workflow',
    category: 'system',
    component: ApprovalWorkflowModule
  },
  aiAssistant: {
    id: 'aiAssistant',
    name: 'AI ERP Assistant',
    category: 'system',
    component: AiAssistantModule
  },
  auditLogs: {
    id: 'auditLogs',
    name: 'Audit Log Viewer',
    category: 'system',
    component: AuditLogViewer
  },
  companySettings: {
    id: 'companySettings',
    name: 'Company Settings',
    category: 'system',
    component: CompanySettingsModule
  },
  performanceMetrics: {
    id: 'performanceMetrics',
    name: 'Performance Metrics',
    category: 'system',
    component: PerformanceMetricsDashboard
  }
};

export function getModuleComponent(tabId: string): React.ComponentType<any> | null {
  return MODULE_REGISTRY[tabId]?.component || null;
}
