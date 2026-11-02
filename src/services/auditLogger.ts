import { AuditLogEntry, UserRole } from '../types/erp';
import { db } from './firebaseConfig';
import { collection, addDoc } from 'firebase/firestore';

export const INITIAL_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: 'audit_1',
    tenantId: 'tenant_crest',
    userId: 'usr_client_admin_01',
    userName: 'Rashid Ahmed',
    userRole: 'CLIENT_ADMIN',
    actionType: 'LOGIN',
    module: 'Authentication',
    details: 'User logged into Crest Textile Mills Ltd portal',
    ipAddress: '192.168.1.45',
    timestamp: '2026-10-31T08:30:00Z'
  },
  {
    id: 'audit_2',
    tenantId: 'tenant_crest',
    userId: 'usr_client_admin_01',
    userName: 'Rashid Ahmed',
    userRole: 'CLIENT_ADMIN',
    actionType: 'DATA_CREATE',
    module: 'Finance & Accounts',
    details: 'Posted Journal Voucher JV-2026-089 for PKR 3,500,000 against LC Export Advance',
    ipAddress: '192.168.1.45',
    timestamp: '2026-10-31T09:15:22Z'
  },
  {
    id: 'audit_3',
    tenantId: 'tenant_crest',
    userId: 'usr_proc_hassan',
    userName: 'Hassan Raza',
    userRole: 'PROCUREMENT_OFFICER',
    actionType: 'DATA_CREATE',
    module: 'Procurement',
    details: 'Issued Purchase Order PO-2026-0041 to Indus Ginning Mills (PKR 2,879,200)',
    ipAddress: '192.168.1.88',
    timestamp: '2026-10-31T10:04:10Z'
  },
  {
    id: 'audit_4',
    tenantId: 'system_master',
    userId: 'usr_master_01',
    userName: 'Master Administrator',
    userRole: 'MASTER_ADMIN',
    actionType: 'SETTINGS_CHANGE',
    module: 'Master Control',
    details: 'Created new client tenant Gourmet Bakers & Confectionery (gourmet.erp.mts.pk)',
    ipAddress: '203.124.42.10',
    timestamp: '2026-10-31T11:40:00Z'
  }
];

class AuditLoggerManager {
  private logs: AuditLogEntry[] = INITIAL_AUDIT_LOGS;
  private listeners: Array<(logs: AuditLogEntry[]) => void> = [];

  public getLogs(tenantId?: string): AuditLogEntry[] {
    if (!tenantId || tenantId === 'system_master') {
      return this.logs;
    }
    return this.logs.filter(l => l.tenantId === tenantId || l.tenantId === 'system_master');
  }

  public subscribe(listener: (logs: AuditLogEntry[]) => void) {
    this.listeners.push(listener);
    listener(this.logs);
  }

  public async logAction(entry: Omit<AuditLogEntry, 'id' | 'timestamp' | 'ipAddress'>): Promise<AuditLogEntry> {
    const newEntry: AuditLogEntry = {
      ...entry,
      id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toISOString(),
      ipAddress: '182.185.120.' + Math.floor(10 + Math.random() * 200)
    };

    this.logs = [newEntry, ...this.logs];
    this.listeners.forEach(fn => fn(this.logs));

    // Async save to Firestore
    try {
      const colPath = entry.tenantId === 'system_master'
        ? collection(db, 'system', 'auditLogs', 'entries')
        : collection(db, 'tenants', entry.tenantId, 'auditLogs');
      await addDoc(colPath, newEntry);
    } catch (err) {
      console.warn('Firestore AuditLog write note:', err);
    }

    return newEntry;
  }
}

export const auditLogger = new AuditLoggerManager();
